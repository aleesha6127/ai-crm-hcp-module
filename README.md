## 🚀 How to Run the Application

You must run **both** the Backend and the Frontend simultaneously for the CRM to work.

### Method 1: The Quick Start (Recommended)
This is the easiest way. It launches both services in separate windows for you.
1. Open a PowerShell terminal in the main folder.
2. Run:
   ```powershell
   .\run_crm.ps1
   ```

---

### Method 2: The Manual Way
If you want to run them in your current terminal windows:

**Step 1: Start the Backend (The Data)**
```powershell
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

**Step 2: Start the Frontend (The UI)**
Open a **new** terminal window and run:
```powershell
cd frontend
npm run dev
```

---

## 🔗 Access Links
- **Dashboard**: [http://localhost:5173](http://localhost:5173)
- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Tech Stack


- **Frontend**: React.js with Vite, Redux Toolkit, Vanilla CSS (Custom UI, Google Inter font)
- **Backend**: Python with FastAPI, SQLAlchemy
- **Database**: PostgreSQL
- **AI Framework**: LangGraph, LangChain core
- **LLM**: Groq API (gemma2-9b-it)

## Architecture
- **LangGraph Agent**: An autonomous conversational agent orchestrating interactions. It connects to 5 critical AI tools mapping unstructured "chat" dialogue directly into database entries, fetching interaction history on the fly, and utilizing Groq's high-performance LLMs to categorize sentiment.
- **REST APIs**: FastAPI handles HTTP transactions.
- **Dynamic Interaction UI**: A toggleable view between a standard structured web form and an intuitive, natural language UI designed to reduce data entry workload.

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend root directory.
\`\`\`bash
python -m venv venv
venv\\Scripts\\activate # On Windows PowerShell
pip install -r backend/requirements.txt
\`\`\`

2. Set your Environment Variables. You must export or add your key to an `.env` file for the AI features:
\`\`\`bash
GROQ_API_KEY=<your_groq_api_key_here>
\`\`\`
*(Note: A local SQLite database `crm.db` will be automatically used for data persistence.)*

3. Initialize and seed the database with mock HCPs:
\`\`\`bash
python init_db.py
\`\`\`

4. Start the FastAPI server:
\`\`\`bash
uvicorn backend.main:app --reload
\`\`\`
The backend will run on `http://localhost:8000`. You can test endpoints via `http://localhost:8000/docs`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
\`\`\`bash
cd frontend
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`
The UI will be accessible on `http://localhost:5173`.
