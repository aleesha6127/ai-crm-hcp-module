import os
from typing import Annotated, TypedDict, List
from datetime import datetime
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from backend.database import SessionLocal
from backend import crud, schemas

# State definition
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], "messages"]

# --- Tools ---

@tool
def log_interaction_tool(hcp_id: int, type: str, notes: str, outcomes: str = "", sentiment: str = "Neutral") -> str:
    """Extracts structured data from natural language, summarizes, and writes a new interaction to the DB."""
    db = SessionLocal()
    try:
        interaction = schemas.InteractionCreate(
            hcp_id=hcp_id,
            type=type,
            date_time=datetime.utcnow(),
            notes=notes,
            outcomes=outcomes,
            sentiment=sentiment
        )
        db_interaction = crud.create_interaction(db, interaction)
        return f"Successfully logged interaction with ID {db_interaction.id}. Sentiment detected: {sentiment}"
    finally:
        db.close()

@tool
def edit_interaction_tool(interaction_id: int, notes: str = None, outcomes: str = None, sentiment: str = None) -> str:
    """Patches an existing interaction state using its ID. Only provide fields you want to update."""
    db = SessionLocal()
    try:
        update_data = schemas.InteractionUpdate(
            notes=notes,
            outcomes=outcomes,
            sentiment=sentiment
        )
        db_interaction = crud.update_interaction(db, interaction_id, update_data)
        if db_interaction:
            return f"Successfully updated interaction {interaction_id}."
        return f"Interaction {interaction_id} not found."
    finally:
        db.close()

@tool
def get_interaction_history_tool(hcp_id: int) -> str:
    """Retrieves past interactions for a specific Healthcare Professional for contextual understanding."""
    db = SessionLocal()
    try:
        interactions = crud.get_interactions(db, hcp_id=hcp_id, limit=5)
        if not interactions:
            return f"No history found for HCP ID {hcp_id}."
        
        history = []
        for i in interactions:
            history.append(f"[ID: {i.id} | Date: {i.date_time.strftime('%Y-%m-%d')} | Type: {i.type} | Sentiment: {i.sentiment}] Notes: {i.notes[:50]}...")
        return "\\n".join(history)
    finally:
        db.close()

@tool
def suggest_follow_up_tool(interaction_id: int, description: str, days_from_now: int = 7) -> str:
    """Creates a actionable follow up task/step based on an interaction."""
    db = SessionLocal()
    try:
        from datetime import timedelta
        due_date = datetime.utcnow() + timedelta(days=days_from_now)
        follow_up = schemas.FollowUpActionCreate(
            description=description,
            due_date=due_date
        )
        db_follow_up = crud.create_follow_up(db, follow_up, interaction_id=interaction_id)
        return f"Follow-up action mapped to interaction {interaction_id}: {description} (Due: {due_date.strftime('%Y-%m-%d')})"
    finally:
        db.close()

@tool
def sentiment_analysis_tool(text: str) -> str:
    """Evaluates text to determine positive, neutral, or negative sentiment to structure interaction notes."""
    # Since we are using an LLM as the main agent, the LLM itself can do sentiment analysis, but extracting it into a tool gives it a direct way to fetch a label if needed.
    text_lower = text.lower()
    if any(word in text_lower for word in ["great", "excellent", "positive", "agreed", "happy", "interested"]):
        return "Positive"
    elif any(word in text_lower for word in ["bad", "terrible", "negative", "disagreed", "unhappy", "rejected"]):
        return "Negative"
    return "Neutral"

@tool
def search_hcp_tool(name: str) -> str:
    """Searches for a Healthcare Professional by name and returns their ID, Specialty, Hospital and Location."""
    db = SessionLocal()
    try:
        hcp = crud.search_hcp_by_name(db, name)
        if hcp:
            return f"MATCH FOUND: [ID: {hcp.id}] {hcp.name} ({hcp.specialty}) at {hcp.hospital}, {hcp.location}."
        return f"No HCP found matching '{name}'."
    finally:
        db.close()

# --- Agent Configuration ---

tools = [
    log_interaction_tool,
    edit_interaction_tool,
    get_interaction_history_tool,
    suggest_follow_up_tool,
    sentiment_analysis_tool,
    search_hcp_tool
]

# Ensure you have GROQ_API_KEY environment variable set
def get_llm(api_key: str = None):
    key = api_key or os.getenv("GROQ_API_KEY")
    if not key:
        return None
    return ChatGroq(model_name="gemma2-9b-it", temperature=0, groq_api_key=key)

def should_continue(state: AgentState) -> str:
    messages = state['messages']
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

def call_model(state: AgentState, config: dict):
    messages = state['messages']
    api_key = config.get("configurable", {}).get("api_key")
    llm = get_llm(api_key)
    
    if not llm:
        # Fallback to a simple message if the model can't be initialized
        return {"messages": [AIMessage(content="Error: No GROQ_API_KEY provided. Please set it in Settings to activate the AI Agent.")]}
        
    # bind tools to llm
    llm_with_tools = llm.bind_tools(tools)
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", ToolNode(tools))
    
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue, ["tools", END])
    workflow.add_edge("tools", "agent")
    
    return workflow.compile()

graph = build_graph()

def chat_with_agent(user_input: str, api_key: str = None, chat_history: List[str] = None):
    # Check for API key in env or passed arg
    active_key = api_key or os.getenv("GROQ_API_KEY")
    
    if not active_key:
        # Improved demo mode matching using local logic (no LLM required)
        demo_match = ""
        user_input_lower = user_input.lower()
        
        # Simple extraction logic for the demo without an LLM
        db = SessionLocal()
        try:
            hcps = crud.get_hcps(db)
            matched_hcp = None
            for hcp in hcps:
                if hcp.name.lower() in user_input_lower:
                    matched_hcp = hcp
                    break
            
            if matched_hcp:
                demo_match = f"\n\n[AUTO_SELECT_HCP: {matched_hcp.id}]"
                return f"DEMO MODE: I've identified **{matched_hcp.name}** in your message and auto-selected them for you. {demo_match}"
            
            return f"DEMO MODE: I received your message: \"{user_input}\". Please provide a GROQ_API_KEY in Settings to enable the full AI experience."
        finally:
            db.close()

    # Setup initial messages
    messages = [
        SystemMessage(content="""You are a helpful AI assistant for a Healthcare CRM system. 
        You manage interactions with Healthcare Professionals (HCPs). 
        IMPORTANT: When a user mentions a doctor's name, ALWAYS use the 'search_hcp_tool' to find their ID.
        If you find a match, include the tag [AUTO_SELECT_HCP: ID] at the end of your response so the UI can auto-populate the form.
        Example: 'I've found Dr. Smith. [AUTO_SELECT_HCP: 5]'
        """)
    ]
    
    messages.append(HumanMessage(content=user_input))
    
    try:
        # Pass the api_key via config so the node can access it
        final_state = graph.invoke(
            {"messages": messages},
            config={"configurable": {"api_key": active_key}}
        )
        return final_state["messages"][-1].content
    except Exception as e:
        return f"Error invoking AI transition: {str(e)}. (Note: Ensure your GROQ_API_KEY is valid and has sufficient quota)."


