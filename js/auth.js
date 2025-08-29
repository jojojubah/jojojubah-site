/* auth.js — Google Sign-In with Firebase Authentication */

// Firebase Auth imports (using existing Firebase app)
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize Firebase Auth
let auth = null;
let currentUser = null;
let initializationAttempts = 0;
const maxInitAttempts = 20; // 10 seconds max wait time

// Google Sign-In provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Initialize authentication when Firebase is ready
function initializeAuth() {
  initializationAttempts++;
  
  console.log(`🔄 Auth initialization attempt ${initializationAttempts}/${maxInitAttempts}`);
  console.log('🔍 Checking for Firebase app:', !!window.app);
  console.log('🔍 Checking for Firebase ready flag:', !!window.firebaseReady);
  
  if (window.app) {
    try {
      auth = getAuth(window.app);
      console.log('✅ Firebase Auth instance created');
      
      setupAuthStateListener();
      console.log('✅ Auth state listener setup');
      
      createAuthButton();
      console.log('✅ Auth button created');
      
      setupAccountPageButton(); // Handle account page button
      console.log('✅ Account page button setup');
      
      // Check for redirect result (when user returns from Google OAuth)
      checkRedirectResult();
      console.log('✅ Redirect result check initiated');
      
      console.log('🔐 Authentication fully initialized');
      
      // Debug Firebase config
      console.log('🔍 Firebase config check:');
      console.log('- Auth domain:', window.app.options.authDomain);
      console.log('- Project ID:', window.app.options.projectId);
      
    } catch (error) {
      console.error('❌ Error during auth initialization:', error);
      showAuthMessage('Authentication setup failed. Please check console for details.', 'error');
    }
  } else if (initializationAttempts < maxInitAttempts) {
    // Wait for Firebase to initialize, but with better error handling
    setTimeout(initializeAuth, 500);
  } else {
    console.error('❌ Firebase failed to initialize after 10 seconds');
    console.log('🔍 Final state check:');
    console.log('- window.app:', !!window.app);
    console.log('- window.firebaseReady:', !!window.firebaseReady);
    console.log('- Available globals:', Object.keys(window).filter(key => key.includes('fire') || key.includes('Fire')));
    
    showAuthMessage('Authentication system failed to load. Please refresh the page.', 'error');
  }
}

// Listen for auth state changes
function setupAuthStateListener() {
  if (!auth) return;
  
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI();
    
    if (user) {
      console.log('✅ User signed in:', user.displayName);
      // Save user info to localStorage for quick access
      localStorage.setItem('userProfile', JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        signInTime: new Date().toISOString()
      }));
    } else {
      console.log('👋 User signed out');
      localStorage.removeItem('userProfile');
    }
  });
}

// Check for redirect result when user returns from Google OAuth
async function checkRedirectResult() {
  if (!auth) return;
  
  try {
    console.log('🔄 Checking for redirect result...');
    const result = await getRedirectResult(auth);
    
    if (result) {
      const user = result.user;
      console.log('✅ Redirect sign-in successful:', user.displayName);
      showAuthMessage(`Welcome back, ${user.displayName}! 👋`, 'success');
      
      // Optional: Trigger AI Assistant tip
      if (window.showTip) {
        setTimeout(() => window.showTip('userSignedIn'), 1000);
      }
    } else {
      console.log('ℹ️ No redirect result found (normal for direct page loads)');
    }
  } catch (error) {
    console.error('❌ Error checking redirect result:', error);
    showAuthMessage('Error completing sign-in. Please try again.', 'error');
  }
}

// Sign in with Google (with fallback to redirect)
async function signInWithGoogle() {
  if (!auth) {
    console.error('Auth not initialized');
    showAuthMessage('Authentication system not ready. Please wait a moment and try again.', 'error');
    return;
  }
  
  try {
    console.log('🔐 Starting Google sign-in with popup...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('✅ Popup sign-in successful:', user.displayName);
    
    // Show success message
    showAuthMessage(`Welcome, ${user.displayName}! 👋`, 'success');
    
    // Optional: Trigger AI Assistant tip
    if (window.showTip) {
      setTimeout(() => window.showTip('userSignedIn'), 1000);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Popup sign-in error:', error);
    
    // Handle specific popup failures by falling back to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log('🔄 Popup failed, trying redirect method...');
      try {
        showAuthMessage('Opening sign-in page...', 'info');
        await signInWithRedirect(auth, googleProvider);
        return; // Redirect will handle the flow
      } catch (redirectError) {
        console.error('❌ Redirect sign-in also failed:', redirectError);
        showAuthMessage('Sign-in failed. Please check your internet connection and try again.', 'error');
        throw redirectError;
      }
    }
    
    // Handle other errors
    let errorMessage = 'Sign-in failed. Please try again.';
    if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized for Google sign-in. Please contact support.';
      console.error('🔥 IMPORTANT: Add your domain to Firebase Console → Authentication → Settings → Authorized domains');
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled. Please contact support.';
      console.error('🔥 IMPORTANT: Enable Google sign-in in Firebase Console → Authentication → Sign-in method');
    }
    
    showAuthMessage(errorMessage, 'error');
    throw error;
  }
}

// Sign out
async function signOutUser() {
  if (!auth) return;
  
  try {
    await signOut(auth);
    showAuthMessage('Signed out successfully', 'info');
    
    // Redirect to home if on account page
    if (window.location.pathname.includes('account')) {
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Sign-out error:', error);
    showAuthMessage('Sign-out failed. Please try again.', 'error');
  }
}

// Create and manage auth button in navbar
function createAuthButton() {
  // Find navbar container
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) {
    console.warn('⚠️ Nav container not found');
    return;
  }
  
  // Create auth button container
  let authContainer = document.getElementById('authContainer');
  if (!authContainer) {
    authContainer = document.createElement('div');
    authContainer.id = 'authContainer';
    authContainer.className = 'auth-container';
    
    // Insert before mobile menu button (which should be the last element)
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) {
      console.log('📱 Inserting auth container before mobile menu button');
      navContainer.insertBefore(authContainer, mobileBtn);
    } else {
      console.log('📱 Mobile menu button not found, appending to end');
      navContainer.appendChild(authContainer);
    }
  }
  
  updateAuthUI();
}

// Update auth UI based on current user state
function updateAuthUI() {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;
  
  if (currentUser) {
    // User is signed in - show profile button
    authContainer.innerHTML = `
      <div class="user-profile-btn" id="userProfileBtn">
        <img src="${currentUser.photoURL}" alt="${currentUser.displayName}" class="user-avatar">
        <span class="user-name">${currentUser.displayName}</span>
        <div class="user-dropdown" id="userDropdown">
          <a href="account.html" class="dropdown-item">
            <span>👤 My Account</span>
          </a>
          <button class="dropdown-item" id="signOutBtn">
            <span>🚪 Sign Out</span>
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    const profileBtn = document.getElementById('userProfileBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const dropdown = document.getElementById('userDropdown');
    
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });
    
    signOutBtn.addEventListener('click', signOutUser);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
    
  } else {
    // User is not signed in - show sign in button
    authContainer.innerHTML = `
      <button class="sign-in-btn" id="signInBtn">
        <svg width="18" height="18" viewBox="0 0 24 24" class="google-icon">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Sign In</span>
      </button>
    `;
    
    // Add event listener
    const signInBtn = document.getElementById('signInBtn');
    signInBtn.addEventListener('click', signInWithGoogle);
  }
}

// Show auth messages (success/error/info)
function showAuthMessage(message, type = 'info') {
  // Remove existing messages
  const existingMessage = document.querySelector('.auth-message');
  if (existingMessage) existingMessage.remove();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `auth-message auth-message-${type}`;
  messageDiv.textContent = message;
  
  const colors = {
    success: '#22c55e',
    error: '#ef4444', 
    info: '#3b82f6'
  };
  
  messageDiv.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 10003;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    background: ${colors[type]};
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(messageDiv);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    if (messageDiv && messageDiv.parentNode) {
      messageDiv.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => messageDiv.remove(), 300);
    }
  }, 4000);
}

// Get current user info
function getCurrentUser() {
  return currentUser;
}

// Check if user is signed in
function isSignedIn() {
  return !!currentUser;
}

// Get user profile from localStorage (for quick access)
function getCachedUserProfile() {
  const cached = localStorage.getItem('userProfile');
  return cached ? JSON.parse(cached) : null;
}

// Enhanced tips for authentication
function addAuthTips() {
  if (window.showTip && typeof window.showTip === 'function') {
    const authTips = {
      'userSignedIn': '🎉 Welcome! You can now access your account page and upcoming premium features.',
      'accountPage': '👤 Your personalized dashboard. More features coming soon!',
      'signInPrompt': '🔐 Sign in to unlock personalized features and save your preferences.'
    };

    // Extend the existing tips system
    const originalShowTip = window.showTip;
    window.showTip = function(key) {
      if (authTips[key]) {
        const bubble = document.getElementById('assistantBubble');
        const textEl = document.getElementById('assistantText');
        if (textEl && bubble) {
          textEl.textContent = authTips[key];
          bubble.classList.add('show');
          setTimeout(() => bubble.classList.remove('show'), 8000);
        }
      } else {
        originalShowTip(key);
      }
    };
  }
}

// Setup account page button (if exists)
function setupAccountPageButton() {
  const accountSignInBtn = document.getElementById('accountSignInBtn');
  if (accountSignInBtn) {
    console.log('🔗 Setting up account page sign-in button');
    accountSignInBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signInWithGoogle();
    });
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 Auth system DOM loaded, waiting for Firebase...');
  
  // Start trying to initialize immediately
  initializeAuth();
  addAuthTips();
});

// Also try to initialize when window loads (fallback)
window.addEventListener('load', () => {
  if (!auth) {
    console.log('🔄 Retrying auth initialization on window load...');
    initializeAuth();
  }
});

// Export functions for external use
window.authSystem = {
  signIn: signInWithGoogle,
  signOut: signOutUser,
  getCurrentUser,
  isSignedIn,
  getCachedUserProfile
};

console.log('📱 Auth system loaded');
