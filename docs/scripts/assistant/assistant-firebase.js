// scripts/assistant/assistant-firebase.js
// Isolated Firebase configuration and authentication

export class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.appCheck = null;
    this.user = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Dynamic imports for Firebase modules
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js");
      const { getAuth, signInAnonymously, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js");
      const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js");
      const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js");
      const { initializeAppCheck, ReCaptchaV3Provider, getToken } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app-check.js");

      // Firebase configuration
      const firebaseConfig = {
        apiKey: "AIzaSyCBnpzb54f0WbeIDgvdj4T0HRb3a2NdCgY",
        authDomain: "jojojubah-f2996.firebaseapp.com",
        projectId: "jojojubah-f2996",
        storageBucket: "jojojubah-f2996.firebasestorage.app",
        messagingSenderId: "160250947651",
        appId: "1:160250947651:web:7e30c9f67a2e04cc270cf6",
        measurementId: "G-XC16XPJ48T"
      };

      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);

      // Initialize App Check with reCAPTCHA v3
      this.appCheck = initializeAppCheck(this.app, {
        provider: new ReCaptchaV3Provider("6LefpqwrAAAAAPFuxr81vcHfmg5d9Mje7ZpMXA3S"),
        isTokenAutoRefreshEnabled: true,
      });

      // Initialize services
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      // Store references for external access
      this.modules = {
        collection,
        addDoc,
        serverTimestamp,
        getToken
      };

      // Setup anonymous authentication
      await this.setupAuth();

      // Optional analytics
      try {
        getAnalytics(this.app);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
      }

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('Firebase initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async setupAuth() {
    try {
      // Sign in anonymously
      await this.auth.signInAnonymously();

      // Listen for auth state changes
      this.auth.onAuthStateChanged((user) => {
        this.user = user;
        if (user) {
          console.log('Firebase: Signed in as:', user.uid);
        }
      });

    } catch (error) {
      console.error('Firebase auth setup failed:', error);
      throw error;
    }
  }

  async getAuthHeaders() {
    if (!this.isInitialized || !this.user) {
      return {};
    }

    try {
      const headers = {};

      // Get ID token for user authentication
      const idToken = await this.user.getIdToken(true);
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      // Get App Check token for request verification
      const { token: appCheckToken } = await this.modules.getToken(this.appCheck, false);
      if (appCheckToken) {
        headers['X-Firebase-AppCheck'] = appCheckToken;
      }

      return headers;

    } catch (error) {
      console.error('Failed to get auth headers:', error);
      return {};
    }
  }

  async logChat(message, response, sessionId = null) {
    if (!this.isInitialized || !this.user || !this.db) {
      return false;
    }

    try {
      // Generate or use existing session ID
      const session = sessionId || this.getSessionId();
      const uid = this.user.uid;

      // Log user message
      await this.modules.addDoc(
        this.modules.collection(this.db, "chats", session, "messages"),
        {
          uid,
          role: "user",
          content: message,
          ts: this.modules.serverTimestamp(),
        }
      );

      // Log assistant response
      await this.modules.addDoc(
        this.modules.collection(this.db, "chats", session, "messages"),
        {
          uid: "assistant",
          role: "model",
          content: response,
          ts: this.modules.serverTimestamp(),
        }
      );

      return true;

    } catch (error) {
      console.warn('Failed to log chat to Firestore:', error);
      return false;
    }
  }

  getSessionId() {
    let sessionId = localStorage.getItem("clippySession");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("clippySession", sessionId);
    }
    return sessionId;
  }

  getUser() {
    return this.user;
  }

  isReady() {
    return this.isInitialized && this.user !== null;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      hasUser: this.user !== null,
      userId: this.user?.uid || null
    };
  }
}
