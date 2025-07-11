import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: JSON.parse(localStorage.getItem('timesheetLogs')) || {},
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    logActivity: (state, action) => {
      const { adminEmail, userEmail, name, event } = action.payload;

      if (!state.logs[adminEmail]) state.logs[adminEmail] = {};
      if (!state.logs[adminEmail][userEmail]) {
        state.logs[adminEmail][userEmail] = { name, events: [] };
      }

      state.logs[adminEmail][userEmail].events.push(event);

      localStorage.setItem('timesheetLogs', JSON.stringify(state.logs));
    },
  },
});

export const { logActivity } = timesheetSlice.actions;
export default timesheetSlice.reducer;
