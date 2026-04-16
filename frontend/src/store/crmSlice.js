import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchHCPs = createAsyncThunk('crm/fetchHCPs', async () => {
  const response = await fetch(`${API_BASE_URL}/hcps/`);
  return response.json();
});

export const fetchInteractions = createAsyncThunk('crm/fetchInteractions', async () => {
  const response = await fetch(`${API_BASE_URL}/interactions/`);
  return response.json();
});

export const processChat = createAsyncThunk('crm/processChat', async (message) => {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  return response.json();
});

export const logInteractionForm = createAsyncThunk('crm/logInteractionForm', async (data) => {
  const response = await fetch(`${API_BASE_URL}/interactions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
});

export const updateFollowUpStatus = createAsyncThunk('crm/updateFollowUpStatus', async ({ followUpId, status }) => {
  const response = await fetch(`${API_BASE_URL}/follow-ups/${followUpId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
});

const initialState = {
  hcps: [],
  interactions: [],
  selectedHcpId: '',
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  intStatus: 'idle',
  error: null,
  chatLoading: false,
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setSelectedHcpId: (state, action) => {
      state.selectedHcpId = action.payload;
    },
    resetHCPStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchHCPs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHCPs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.hcps = action.payload;
      })
      .addCase(fetchHCPs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchInteractions.pending, (state) => {
        state.intStatus = 'loading';
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.intStatus = 'succeeded';
        state.interactions = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.intStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(processChat.pending, (state) => {
        state.chatLoading = true;
      })
      .addCase(processChat.fulfilled, (state, action) => {
        state.chatLoading = false;
        // Check for auto-select metadata in the response string
        const match = action.payload.response.match(/\[AUTO_SELECT_HCP: (\d+)\]/);
        if (match && match[1]) {
          state.selectedHcpId = match[1];
        }
      })
      .addCase(processChat.rejected, (state) => {
        state.chatLoading = false;
      })
      .addCase(logInteractionForm.fulfilled, (state, action) => {
        state.interactions.unshift(action.payload); // prepend the newly logged interaction
      });
  },
});

export const { setSelectedHcpId, resetHCPStatus } = crmSlice.actions;
export default crmSlice.reducer;

