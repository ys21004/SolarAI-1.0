import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const setAdminRole = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // Check if the user is authenticated
  if (!context?.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(context.auth.uid, {
      role: 'admin'
    });

    return { message: 'Admin role set successfully' };
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while setting the admin role.'
    );
  }
}); 