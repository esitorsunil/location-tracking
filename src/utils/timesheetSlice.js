import { createSlice } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const sanitizeEmail = (email) => email.replace(/\./g, '_');

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState: {
    logs: {},
  },
  reducers: {
    logActivity: (state, action) => {
      let { adminEmail, userEmail, name, sessionKey, type, data } = action.payload;

      if (!adminEmail || !userEmail || !name || !sessionKey || !type || !data) {
        console.error("❌ Missing data in logActivity:", action.payload);
        return;
      }

      // 🔐 Sanitize emails
      adminEmail = adminEmail.trim().toLowerCase();
      userEmail = sanitizeEmail(userEmail.trim().toLowerCase());

      const userDocRef = doc(db, 'timesheets', adminEmail);

      getDoc(userDocRef).then((docSnap) => {
        const existingData = docSnap.exists() ? docSnap.data() : {};
        const existingUser = existingData.users?.[userEmail] || { name, sessions: {} };
        const existingSessions = existingUser.sessions || {};

        // ⏱ Merge session data
        const session = existingSessions[sessionKey] || {};
        session[type === 'check-in' ? 'checkIn' : 'checkOut'] = data;

        const updatedUser = {
          name,
          sessions: {
            ...existingSessions,
            [sessionKey]: session,
          },
        };

        updateDoc(userDocRef, {
          [`users.${userEmail}`]: updatedUser,
        }).catch(() => {
          setDoc(userDocRef, {
            users: {
              [userEmail]: updatedUser,
            },
          });
        });
      }).catch((err) => {
        console.error("🔥 Firestore logActivity error:", err);
      });
    },
  },
});

export const { logActivity } = timesheetSlice.actions;
export default timesheetSlice.reducer;
