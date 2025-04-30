// Script to reset admin user password using Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('../../../backend/src/config/serviceAccountKey.json');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();

// Admin email
const adminEmail = 'admin@solarai.com';
const newPassword = 'admin_password%';

async function resetAdminPassword() {
  try {
    console.log(`🔄 Resetting password for admin user: ${adminEmail}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log(`✅ Found user: ${userRecord.uid}`);
    
    // Update password
    await auth.updateUser(userRecord.uid, {
      password: newPassword,
    });
    
    console.log('✅ Password reset successful!');
    console.log('🟢 YOU CAN NOW LOG IN WITH:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    
    // If user doesn't exist, create the admin user
    if (error.code === 'auth/user-not-found') {
      try {
        console.log(`🔑 Creating new admin user: ${adminEmail}`);
        const userRecord = await auth.createUser({
          email: adminEmail,
          password: newPassword,
          displayName: 'SolarAI Admin',
        });
        
        // Set custom claims for admin role
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        
        console.log('✅ Admin user created successfully!');
        console.log('🟢 YOU CAN NOW LOG IN WITH:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${newPassword}`);
        
        process.exit(0);
      } catch (createError) {
        console.error('❌ Error creating admin user:', createError);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}

resetAdminPassword(); 