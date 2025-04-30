const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();
const db = admin.firestore();

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = decodedToken;
    
    // Get user document for role info
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      req.userDoc = userDoc.data();
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized', status: 401 });
  }
};

// Role-based access control middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userDoc || !roles.includes(req.userDoc.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions', status: 403 });
    }
    next();
  };
};

// Sign up new user
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields. Email, password, and name are required.',
        status: 400 
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'technician', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Role must be one of: ${validRoles.join(', ')}`,
        status: 400 
      });
    }
    
    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });
    
    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    
    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      preferences: {
        notifications: true,
        theme: 'light'
      }
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already exists', status: 400 });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email format', status: 400 });
    } else if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak', status: 400 });
    }
    
    res.status(500).json({ error: 'Failed to create user', status: 500 });
  }
});

// Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found', status: 404 });
    }
    
    res.status(200).json({
      uid,
      ...userDoc.data(),
      // Remove sensitive fields
      password: undefined,
      created_at: userDoc.data().created_at ? userDoc.data().created_at.toDate() : null
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile', status: 500 });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, preferences } = req.body;
    
    const updateData = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (preferences) {
      updateData.preferences = preferences;
    }
    
    // Update user document in Firestore
    await db.collection('users').doc(uid).update({
      ...updateData,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update display name in Firebase Auth if provided
    if (name) {
      await admin.auth().updateUser(uid, {
        displayName: name
      });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile', status: 500 });
  }
});

// Change user role (admin only)
router.put('/users/:uid/role', authenticateUser, checkRole(['admin']), async (req, res) => {
  try {
    const targetUid = req.params.uid;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required', status: 400 });
    }
    
    // Validate role
    const validRoles = ['admin', 'technician', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Role must be one of: ${validRoles.join(', ')}`,
        status: 400 
      });
    }
    
    // Update custom claims for role-based access
    await admin.auth().setCustomUserClaims(targetUid, { role });
    
    // Update user document in Firestore
    await db.collection('users').doc(targetUid).update({
      role,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.user.uid
    });
    
    res.status(200).json({
      message: 'User role updated successfully',
      role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role', status: 500 });
  }
});

// Get all users (admin only)
router.get('/users', authenticateUser, checkRole(['admin']), async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    
    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      
      users.push({
        uid: doc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: userData.created_at ? userData.created_at.toDate() : null
      });
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to retrieve users', status: 500 });
  }
});

// Change password
router.post('/change-password', authenticateUser, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required', status: 400 });
    }
    
    await admin.auth().updateUser(req.user.uid, {
      password: newPassword
    });
    
    res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak', status: 400 });
    }
    
    res.status(500).json({ error: 'Failed to change password', status: 500 });
  }
});

module.exports = router; 