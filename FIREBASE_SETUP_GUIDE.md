# 🔥 Firebase Setup Guide for Beatify Music Upload

Follow these steps to set up your Firebase project from scratch:

## 1. Create Firebase Account & Project

### Step 1: Sign Up for Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Click "Create a project" or "Add project"

### Step 2: Create New Project

1. **Project Name**: Enter "Beatify" (or your preferred name)
2. **Google Analytics**: You can enable or disable (optional for this project)
3. Click "Create project" and wait for setup to complete

## 2. Configure Firebase Services

### Step 3: Enable Firestore Database

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your preferred location (choose closest to your users)
5. Click **"Done"**

### Step 4: Enable Firebase Storage

1. Go to **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Choose **"Start in test mode"** (for development)
4. Select the same location as your Firestore
5. Click **"Done"**

### Step 5: Get Firebase Configuration

1. Go to **"Project Settings"** (gear icon in sidebar)
2. Scroll down to **"Your apps"** section
3. Click **"Web"** icon (`</>`)
4. **App nickname**: Enter "Beatify Web App"
5. **Don't check** "Also set up Firebase Hosting"
6. Click **"Register app"**
7. **COPY** the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyC...',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef...',
};
```

## 3. Update Your Project

### Step 6: Update Firebase Configuration

1. Open `src/firebase/config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-actual-project.firebaseapp.com',
  projectId: 'your-actual-project-id',
  storageBucket: 'your-actual-project.appspot.com',
  messagingSenderId: 'your-actual-sender-id',
  appId: 'your-actual-app-id',
};
```

## 4. Set Up Security Rules (Important!)

### Step 7: Configure Storage Rules

1. In Firebase Console, go to **"Storage"**
2. Click on **"Rules"** tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /music/{allPaths=**} {
      // Allow uploads of audio files only
      allow read, write: if request.auth != null ||
        (resource == null && request.resource.contentType.matches('audio/.*'));
    }
  }
}
```

### Step 8: Configure Firestore Rules

1. Go to **"Firestore Database"**
2. Click on **"Rules"** tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /music/{document} {
      // Allow read access to all users, write access for development
      allow read: if true;
      allow write: if true; // Change this for production!
    }
  }
}
```

## 5. Test Your Setup

### Step 9: Run the Application

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to the Admin page
3. Try uploading a music file
4. Check Firebase Console to see if:
   - File appears in **Storage > music/** folder
   - Document appears in **Firestore > music** collection

## 6. Production Considerations

### Security Rules for Production

For production, update your Firestore rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /music/{document} {
      allow read: if true; // Public read access for music
      allow write: if request.auth != null &&
        request.auth.token.admin == true; // Only authenticated admins can write
    }
  }
}
```

### Authentication (Optional)

If you want to add admin authentication:

1. Enable **Authentication** in Firebase Console
2. Set up your preferred sign-in method
3. Add authentication logic to your Admin component

## 🎉 You're Ready!

Your Firebase setup is complete! The admin panel can now:

- ✅ Upload music files to Firebase Storage
- ✅ Store metadata in Firestore Database
- ✅ Handle file validation and progress tracking
- ✅ Provide a beautiful, responsive UI

## Troubleshooting

### Common Issues:

1. **"Permission denied"** - Check your Firebase rules
2. **"Project not found"** - Verify your project ID in config
3. **"Invalid API key"** - Double-check your Firebase config
4. **CORS errors** - Make sure you're running on localhost or your domain is authorized

### Need Help?

- Check the browser console for detailed error messages
- Verify your Firebase project settings
- Ensure all services (Firestore & Storage) are enabled
