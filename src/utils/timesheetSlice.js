import { createSlice } from '@reduxjs/toolkit';
import { doc, setDoc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

const initialState = {
  logs: {}, // Redux state (optional, not required if only using Firestore)
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
   logActivity: (state, action) => {
  const { adminEmail, userEmail, name, event } = action.payload;

  // ❗ Validate required fields before proceeding
  if (
    !adminEmail || !userEmail || !name ||
    !event || !event.type || !event.time ||
    !event.timestamp || !event.location
  ) {
    console.error("❌ Missing or invalid data in logActivity:", action.payload);
    return; // ⛔ Prevent Firestore write
  }

  const userDocRef = doc(db, 'timesheets', adminEmail);

  getDoc(userDocRef).then((docSnap) => {
    if (docSnap.exists()) {
      updateDoc(userDocRef, {
        [`users.${userEmail}.name`]: name,
        [`users.${userEmail}.events`]: arrayUnion(event),
      });
    } else {
      setDoc(userDocRef, {
        users: {
          [userEmail]: {
            name,
            events: [event],
          },
        },
      });
    }
  }).catch((error) => {
    console.error("❌ Firestore logActivity error:", error);
  });
}


  },
});

export const { logActivity } = timesheetSlice.actions;
export default timesheetSlice.reducer;
