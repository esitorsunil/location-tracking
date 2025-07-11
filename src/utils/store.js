import { configureStore } from '@reduxjs/toolkit';
import timesheetReducer from './timesheetSlice';

export const store = configureStore({
  reducer: {
    timesheet: timesheetReducer,
  },
});
