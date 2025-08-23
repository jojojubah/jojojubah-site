# Chatbot Setup Instructions

## Prerequisites
- A Google Firebase account
- A Google AI Studio account
- A web browser

## Setup Steps

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Project Settings (gear icon)
4. In the "General" tab, scroll down to "Your apps"
5. Click "Add app" and select the web icon (</>)
6. Register your app with a nickname
7. Copy the Firebase configuration object
8. Replace the `firebaseConfig` object in `index.html` with your configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-actual-app-id"
};
```

### 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now (you can change security rules later)
4. Select a location for your database

### 3. Google AI Studio Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key
5. Replace `'your-google-ai-studio-api-key'` in `script.js` with your actual API key:

```javascript
const GOOGLE_AI_API_KEY = 'your-actual-api-key-here';
```

### 4. Running the Chatbot
1. Open `index.html` in a web browser
2. The chatbot should load and be ready to use
3. Type a message and press Enter or click Send

## Features
- Real-time chat interface
- Message persistence with Firebase Firestore
- AI responses powered by Google's Gemini model
- Responsive design for mobile and desktop
- Typing indicators
- Conversation history

## Security Notes
- The current Firebase rules are set to "test mode" - make sure to configure proper security rules for production
- Keep your API keys secure and never commit them to public repositories
- Consider implementing user authentication for a production chatbot

## Troubleshooting
- If messages aren't saving: Check your Firebase configuration and ensure Firestore is enabled
- If AI responses aren't working: Verify your Google AI Studio API key is correct
- If the page doesn't load: Check the browser console for JavaScript errors

## File Structure
- `index.html` - Main HTML file with Firebase initialization
- `styles.css` - CSS styling for the chat interface
- `script.js` - JavaScript code for chat functionality and API integration
- `SETUP.md` - This setup guide
