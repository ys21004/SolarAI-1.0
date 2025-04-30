# SolarAI Firebase Cloud Functions

## Overview
This directory contains the Firebase Cloud Functions for the SolarAI application. These functions provide various API endpoints for maintenance records, user authentication, and analytics features.

## Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or later)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- Firebase project

## Setup

### 1. Install Firebase CLI (if you haven't already):
```bash
npm install -g firebase-tools
```

### 2. Login to your Firebase account:
```bash
firebase login
```

### 3. Initialize Firebase in your project:
```bash
firebase init
```
During initialization, select the following options:
- Select the Firebase features you want to set up: Functions and Firestore
- Select your Firebase project
- Accept the default for the functions directory
- Choose JavaScript as the language
- Say yes to ESLint
- Say yes to installing dependencies with npm

### 4. Deploy to Firebase:
```bash
firebase deploy
```

## API Endpoints

### Maintenance Records API
- `GET /api/maintenance`: Get all maintenance records with optional filtering
- `GET /api/maintenance/:id`: Get a specific maintenance record by ID
- `POST /api/maintenance`: Create a new maintenance record
- `PUT /api/maintenance/:id`: Update an existing maintenance record
- `DELETE /api/maintenance/:id`: Delete a maintenance record (admin only)

### Authentication API
- `POST /api/auth/signup`: Register a new user
- `GET /api/auth/profile`: Get the current user's profile
- `PUT /api/auth/profile`: Update the current user's profile
- `PUT /api/auth/users/:uid/role`: Change a user's role (admin only)
- `GET /api/auth/users`: Get all users (admin only)
- `POST /api/auth/change-password`: Change the current user's password

### Analytics API
- `GET /api/analytics/dashboard`: Get dashboard statistics
- `GET /api/analytics/efficiency`: Get system efficiency data
- `GET /api/analytics/maintenance-history`: Get maintenance history with aggregation
- `GET /api/analytics/notifications`: Get user notifications
- `PUT /api/analytics/notifications/:id/read`: Mark a notification as read

## Real-time Triggers
- `onMaintenanceRecordCreated`: Triggered when a new maintenance record is created
  - Updates dashboard statistics
  - Sends notifications for critical issues

## Security Rules
The Firestore security rules in `firestore.rules` ensure that:
- Users can only access their own data
- Only admins and technicians can create and update maintenance records
- Only admins can delete records
- Role-based access control is enforced throughout the application

## Indexes
The Firestore indexes in `firestore.indexes.json` optimize query performance for:
- Filtering maintenance records by status, type, and date
- Sorting notifications by read status and timestamp

## Testing
You can test the API endpoints using curl or a tool like Postman. For example:

```bash
# Get all maintenance records
curl -H "Authorization: Bearer TOKEN" https://us-central1-your-project-id.cloudfunctions.net/api/maintenance

# Create a new maintenance record
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"panelId": "A1", "technicianName": "John Doe", "type": "Routine Check", "status": "Completed"}' https://us-central1-your-project-id.cloudfunctions.net/api/maintenance
```

## Authentication
All API endpoints require Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

You can obtain a Firebase ID token in your frontend application using:

```javascript
firebase.auth().currentUser.getIdToken(true)
``` 