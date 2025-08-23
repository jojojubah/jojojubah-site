# Secure API Key Setup with Firebase Functions

## Current Issue
Your Google AI Studio API key is currently visible in the client-side code, which means anyone can view it by inspecting your webpage source. This is a security risk.

## Secure Solution: Firebase Functions

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Initialize Firebase Functions
```bash
firebase login
firebase init functions
```
- Select your existing project (jojojubah-f2996)
- Choose JavaScript
- Install dependencies with npm

### Step 3: Set Up the Secure Function
1. Replace the contents of `functions/index.js` with the code from `firebase-function.js`
2. Install axios in your functions directory:
```bash
cd functions
npm install axios
```

### Step 4: Store API Key Securely
```bash
firebase functions:config:set googleai.key="AIzaSyCXzpT_IUGSfx_J2W2mYhW1auz4hL67SkY"
```

### Step 5: Deploy the Function
```bash
firebase deploy --only functions
```

### Step 6: Update Your HTML
Replace the script import in `index.html`:
```html
<!-- Change this line -->
<script src="script.js"></script>
<!-- To this -->
<script src="script-secure.js"></script>
```

### Step 7: Update Firebase Initialization
Add Firebase Functions import to your `index.html`:
```html
<script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
    
    const firebaseConfig = {
        // your existing config
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Make app and db available globally
    window.app = app;
    window.db = db;
</script>
```

## Alternative: Environment Variables (Simpler but less secure)
If you don't want to use Firebase Functions, you can:
1. Create a `.env` file (never commit this to git)
2. Use a build tool like Vite or Webpack to inject the key at build time
3. Host on a platform that supports environment variables

## Benefits of Firebase Functions Approach
- ✅ API key never exposed to clients
- ✅ Server-side validation and rate limiting
- ✅ Better error handling
- ✅ Can add authentication/authorization
- ✅ Usage tracking and monitoring

## Files Created
- `firebase-function.js` - The secure Firebase Function code
- `script-secure.js` - Updated client-side code that calls the function
- `SECURITY-SETUP.md` - This setup guide

Your current setup will work for testing, but use the Firebase Functions approach for production!