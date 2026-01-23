# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "wutheringwave-planner")
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Google** provider
5. Add your email as support email
6. Save

## 3. Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click "Enable"

### Security Rules (Production)

After testing, update Firestore rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Register Web App

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (`</>`)
4. Enter app nickname (e.g., "ww-planner-web")
5. Don't enable Firebase Hosting
6. Click "Register app"
7. Copy the config values

## 5. Configure Environment Variables

Create `.env` file in project root:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 6. Add Authorized Domains

1. Go to **Authentication > Settings > Authorized domains**
2. Add your production domain (e.g., `yourdomain.com`)
3. `localhost` is added by default

## 7. Test

1. Run `npm run dev`
2. Go to Settings page
3. Click "Sign in with Google"
4. Test Save/Load functionality

## Troubleshooting

### "popup closed by user" error
- Check if popups are blocked in browser
- Try using incognito mode

### "unauthorized domain" error
- Add domain to Authorized domains in Firebase Console

### "permission denied" error
- Check Firestore security rules
- Ensure user is authenticated

## Files Created

- `src/services/firebase.js` - Firebase initialization
- `src/services/cloudSync.js` - Cloud sync service
- `src/components/settings/CloudSync.vue` - UI component
- `.env.example` - Environment variables template
