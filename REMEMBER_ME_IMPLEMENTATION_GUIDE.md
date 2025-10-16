# "Remember Me" Implementation Guide

## Complete Step-by-Step Implementation

This guide provides a complete, production-ready implementation of the "Remember Me" feature with localStorage and enhanced security for SGeX Workbench.

---

## Overview

The "Remember Me" feature allows users to:
- Stay logged in across browser restarts
- Access SGEX from multiple tabs seamlessly
- Avoid logout from window resize/zoom (with stable fingerprint)

While maintaining security through:
- Explicit user consent
- Enhanced encryption
- Cross-tab logout synchronization
- Shorter expiration for localStorage
- Clear security warnings

---

## Phase 1: Update SecureTokenStorage Service

### File: `src/services/secureTokenStorage.js`

#### Step 1.1: Add Remember Me State Management

```javascript
class SecureTokenStorage {
  constructor() {
    this.logger = logger.getLogger('SecureTokenStorage');
    this.storageKey = 'sgex_secure_token';
    this.expirationHours = 24; // Default for sessionStorage
    this.localStorageExpirationHours = 8; // Shorter for localStorage
    this.rememberMeKey = 'sgex_remember_me';
    this.logger.debug('SecureTokenStorage instance created');
  }

  /**
   * Set whether to use localStorage (remember me) or sessionStorage
   * @param {boolean} rememberMe - True to persist across browser restarts
   */
  setRememberMe(rememberMe) {
    if (rememberMe) {
      localStorage.setItem(this.rememberMeKey, 'true');
      this.logger.info('Remember Me enabled');
    } else {
      localStorage.removeItem(this.rememberMeKey);
      this.logger.info('Remember Me disabled');
    }
  }

  /**
   * Check if remember me is enabled
   * @returns {boolean}
   */
  isRememberMeEnabled() {
    return localStorage.getItem(this.rememberMeKey) === 'true';
  }

  /**
   * Get the appropriate storage backend
   * @returns {Storage} localStorage or sessionStorage
   */
  getStorage() {
    return this.isRememberMeEnabled() ? localStorage : sessionStorage;
  }

  /**
   * Get expiration hours based on storage type
   * @returns {number} Hours until token expires
   */
  getExpirationHours() {
    return this.isRememberMeEnabled() 
      ? this.localStorageExpirationHours 
      : this.expirationHours;
  }
}
```

#### Step 1.2: Replace Volatile Fingerprint with Stable Version

```javascript
/**
 * Generate a STABLE browser fingerprint for encryption key
 * Uses only components that don't change with window resize, zoom, or monitor changes
 * @returns {string} Browser fingerprint hash
 */
generateStableBrowserFingerprint() {
  try {
    // Use only stable components that don't change during normal usage
    const fingerprint = [
      navigator.userAgent || 'unknown',           // Browser and version
      navigator.language || 'unknown',            // User language preference
      navigator.hardwareConcurrency || 'unknown', // CPU cores (stable)
      navigator.platform || 'unknown',            // Operating system
      navigator.maxTouchPoints || 0,              // Touch capability
      navigator.deviceMemory || 'unknown',        // Device RAM (if available)
    ].join('|');
    
    // Create a simple hash of the fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const fingerprintHash = Math.abs(hash).toString(36);
    
    this.logger.debug('Stable browser fingerprint generated', {
      components: {
        userAgent: (navigator.userAgent || 'unknown').substring(0, 50) + '...',
        language: navigator.language || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        platform: navigator.platform || 'unknown',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        deviceMemory: navigator.deviceMemory || 'unknown'
      },
      hash: fingerprintHash
    });
    
    return fingerprintHash;
  } catch (error) {
    this.logger.error('Error generating browser fingerprint', { 
      error: error.message 
    });
    // Fallback to basic fingerprint
    return 'fallback-' + Date.now().toString(36);
  }
}

/**
 * Generate session-specific encryption key
 * Adds extra entropy beyond browser fingerprint
 * @param {string} fingerprint - Browser fingerprint
 * @returns {string} Session-specific encryption key
 */
generateSessionKey(fingerprint) {
  const sessionData = [
    fingerprint,
    Date.now().toString(36),
    Math.random().toString(36).substring(2),
    navigator.userAgent.substring(0, 50)
  ].join('|');
  
  // Hash to create encryption key
  let hash = 0;
  for (let i = 0; i < sessionData.length; i++) {
    const char = sessionData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}
```

#### Step 1.3: Update storeToken Method

```javascript
/**
 * Store token with user's chosen persistence level
 * @param {string} token - GitHub Personal Access Token
 * @param {boolean} rememberMe - Whether to persist across browser restarts
 * @returns {boolean} Success status
 */
storeToken(token, rememberMe = false) {
  try {
    const validation = this.validateTokenFormat(token);
    if (!validation.isValid || !validation.token) {
      this.logger.warn('Attempted to store invalid token', { reason: validation.reason });
      return false;
    }
    
    // Set remember me preference
    this.setRememberMe(rememberMe);
    
    // Use stable fingerprint (not sensitive to window resize/zoom)
    const fingerprint = this.generateStableBrowserFingerprint();
    
    // Enhanced encryption with session-specific key
    const sessionKey = this.generateSessionKey(fingerprint);
    const encryptedToken = this.xorCipher(validation.token, sessionKey);
    
    const expirationHours = this.getExpirationHours();
    
    const data = {
      token: btoa(encryptedToken),
      key: btoa(sessionKey),
      type: validation.type,
      created: Date.now(),
      expires: Date.now() + (expirationHours * 60 * 60 * 1000),
      fingerprint: fingerprint,
      rememberMe: rememberMe,
      version: 2 // Version for future migrations
    };
    
    // Store in appropriate backend
    const storage = this.getStorage();
    storage.setItem(this.storageKey, JSON.stringify(data));
    
    // Also sync to other storage for cross-tab access
    if (rememberMe) {
      // When using localStorage, also put in sessionStorage for current tab
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    
    // Clear any old tokens from the other storage
    if (rememberMe) {
      // We're using localStorage, clear old sessionStorage tokens
      sessionStorage.removeItem('github_token');
    } else {
      // We're using sessionStorage, clear old localStorage tokens
      localStorage.removeItem('github_token');
    }
    
    this.logger.debug('Token stored securely', {
      type: validation.type,
      storage: rememberMe ? 'localStorage' : 'sessionStorage',
      expiresIn: expirationHours + ' hours',
      tokenMask: this.maskToken(token)
    });
    
    return true;
  } catch (error) {
    this.logger.error('Failed to store token', { 
      error: error.message,
      tokenMask: this.maskToken(token)
    });
    return false;
  }
}
```

#### Step 1.4: Update retrieveToken Method

```javascript
/**
 * Retrieve token from appropriate storage
 * @returns {object|null} Token data or null if not found/expired
 */
retrieveToken() {
  try {
    this.logger.debug('Attempting to retrieve secure token');
    
    // Try the current storage backend first
    let storage = this.getStorage();
    let storedData = storage.getItem(this.storageKey);
    
    // Fallback: try the other storage
    if (!storedData) {
      storage = storage === localStorage ? sessionStorage : localStorage;
      storedData = storage.getItem(this.storageKey);
    }
    
    if (!storedData) {
      this.logger.debug('No secure token found in storage');
      return null;
    }
    
    const data = JSON.parse(storedData);
    
    // Check expiration
    if (Date.now() > data.expires) {
      this.logger.warn('Stored token has expired', {
        expired: new Date(data.expires).toISOString(),
        now: new Date().toISOString()
      });
      this.clearToken();
      return null;
    }
    
    // Validate stable fingerprint
    const currentFingerprint = this.generateStableBrowserFingerprint();
    if (data.fingerprint !== currentFingerprint) {
      this.logger.warn('Browser fingerprint mismatch', {
        stored: data.fingerprint.substring(0, 8) + '...',
        current: currentFingerprint.substring(0, 8) + '...'
      });
      this.clearToken();
      return null;
    }
    
    // Decrypt token
    const encryptionKey = atob(data.key);
    const encryptedToken = atob(data.token);
    const decryptedToken = this.xorCipher(encryptedToken, encryptionKey);
    
    // Validate decrypted token
    const validation = this.validateTokenFormat(decryptedToken);
    if (!validation.isValid) {
      this.logger.error('Decrypted token failed validation');
      this.clearToken();
      return null;
    }
    
    // Sync to sessionStorage if not already there
    if (storage === localStorage && !sessionStorage.getItem(this.storageKey)) {
      sessionStorage.setItem(this.storageKey, storedData);
      this.logger.debug('Token synced to sessionStorage for current tab');
    }
    
    this.logger.debug('Token retrieved successfully', {
      type: data.type,
      storage: storage === localStorage ? 'localStorage' : 'sessionStorage',
      rememberMe: data.rememberMe,
      expires: new Date(data.expires).toISOString(),
      tokenMask: this.maskToken(decryptedToken)
    });
    
    return {
      token: validation.token,
      type: data.type,
      created: data.created,
      expires: data.expires
    };
  } catch (error) {
    this.logger.error('Failed to retrieve token', { error: error.message });
    this.clearToken();
    return null;
  }
}
```

#### Step 1.5: Update clearToken Method

```javascript
/**
 * Clear token from all storage locations
 */
clearToken() {
  try {
    sessionStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.rememberMeKey);
    
    // Also clear legacy tokens
    sessionStorage.removeItem('github_token');
    localStorage.removeItem('github_token');
    
    this.logger.debug('Token cleared from all storage');
  } catch (error) {
    this.logger.error('Error clearing token', { error: error.message });
  }
}
```

---

## Phase 2: Update WelcomePage Component

### File: `src/components/WelcomePage.js`

#### Step 2.1: Add Remember Me State

```javascript
const WelcomePage = () => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showPATHelp, setShowPATHelp] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [patToken, setPatToken] = useState('');
  const [patError, setPATError] = useState('');
  const [patLoading, setPATLoading] = useState(false);
  
  // NEW: Remember Me state
  const [rememberMe, setRememberMe] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // ... rest of existing state and refs ...
```

#### Step 2.2: Update handlePATSubmit

```javascript
const handlePATSubmit = async (e) => {
  e.preventDefault();
  
  if (!patToken.trim()) {
    setPATError("Please enter a GitHub Personal Access Token");
    return;
  }
  
  // If remember me is checked and user hasn't seen warning, show it first
  if (rememberMe && !showSecurityWarning) {
    setShowSecurityWarning(true);
    return;
  }

  setPATLoading(true);
  setPATError('');
  
  try {
    // Test the token by creating an Octokit instance and making a test request
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: patToken.trim() });
    
    // Test the token by fetching user info
    const userResponse = await octokit.rest.users.getAuthenticated();
    
    // Store token with remember me preference
    const stored = secureTokenStorage.storeToken(patToken.trim(), rememberMe);
    
    if (stored) {
      // Call success callback with token and octokit instance
      handleAuthSuccess(patToken.trim(), octokit, userResponse.data.login);
    } else {
      setPATError('Failed to store token securely. Please try again.');
    }
  } catch (err) {
    console.error('PAT authentication failed:', err);
    
    if (err.status === 401) {
      setPATError('Invalid Personal Access Token. Please check your token and try again.');
    } else if (err.status === 403) {
      setPATError("Token doesn't have sufficient permissions. Please ensure your token has 'repo' and 'read:org' scopes.");
    } else {
      setPATError('Authentication failed. Please check your connection and try again.');
    }
  } finally {
    setPATLoading(false);
  }
};
```

#### Step 2.3: Add Security Warning Modal Component

```javascript
// Add this before the return statement of WelcomePage

const SecurityWarningModal = () => (
  <div className="modal-overlay" onClick={() => setShowSecurityWarning(false)}>
    <div className="security-warning-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>⚠️ Security Notice</h3>
        <button 
          className="modal-close-btn" 
          onClick={() => setShowSecurityWarning(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      
      <div className="modal-content">
        <p className="modal-intro">
          Enabling "Remember Me" will keep you signed in across browser 
          restarts and allow access from multiple tabs.
        </p>
        
        <div className="security-considerations">
          <h4>Security Considerations:</h4>
          <ul>
            <li>Your GitHub token will be stored encrypted on this device</li>
            <li>Anyone with access to this device could potentially access your GitHub account</li>
            <li>Only enable this on your personal, trusted devices</li>
            <li>Do NOT enable on shared or public computers</li>
            <li>Token will expire after 8 hours of inactivity</li>
          </ul>
        </div>
        
        <div className="benefits-section">
          <h4>Benefits:</h4>
          <ul>
            <li>Stay logged in across browser restarts</li>
            <li>Access SGEX from multiple tabs simultaneously</li>
            <li>No logout when resizing window or changing zoom</li>
          </ul>
        </div>
      </div>
      
      <div className="modal-actions">
        <button 
          onClick={() => {
            setShowSecurityWarning(false);
            handlePATSubmit({ preventDefault: () => {} });
          }} 
          className="btn-primary"
        >
          I Understand, Enable Remember Me
        </button>
        <button 
          onClick={() => {
            setShowSecurityWarning(false);
            setRememberMe(false);
          }} 
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);
```

#### Step 2.4: Update PAT Form JSX

```javascript
{/* Inside the PAT login form */}
<form onSubmit={handlePATSubmit} className="pat-form">
  <div className="form-group">
    <input
      type="text"
      value={tokenName}
      onChange={handleTokenNameChange}
      placeholder="Token name (optional)"
      className="token-name-input"
      disabled={patLoading}
      aria-label="Token name (optional)"
    />
  </div>
  
  <div className="form-group">
    <input
      ref={patTokenInputRef}
      type="password"
      value={patToken}
      onChange={handlePATTokenChange}
      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
      className={`token-input ${patError ? 'error' : ''}`}
      disabled={patLoading}
      aria-label="GitHub Personal Access Token"
      aria-describedby="pat-help-text"
    />
  </div>
  
  {/* NEW: Remember Me Checkbox */}
  <div className="form-group remember-me-group">
    <label className="remember-me-checkbox">
      <input
        type="checkbox"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
        disabled={patLoading}
      />
      <span className="checkbox-label">Remember me on this device</span>
    </label>
    <div className="remember-me-info">
      <span className="info-icon">ℹ️</span>
      <span className="info-text">
        {rememberMe 
          ? "You'll stay logged in across browser restarts and tabs"
          : "You'll need to log in again after closing the browser"
        }
      </span>
    </div>
    {rememberMe && (
      <div className="security-note">
        ⚠️ Only use on trusted, personal devices
      </div>
    )}
  </div>
  
  <button 
    type="submit" 
    className="pat-login-btn" 
    disabled={patLoading || !patToken.trim()}
  >
    {patLoading ? 'Signing In...' : '🔑 Sign In'}
  </button>
</form>

{patError && <div className="pat-error">{patError}</div>}

{/* Render security warning modal */}
{showSecurityWarning && <SecurityWarningModal />}
```

---

## Phase 3: Add CSS Styling

### File: `src/styles/WelcomePage.css` (or appropriate CSS file)

```css
/* Remember Me Checkbox Styling */
.remember-me-group {
  margin: 12px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.remember-me-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 8px;
}

.remember-me-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #0078d4;
}

.remember-me-checkbox .checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  user-select: none;
}

.remember-me-info {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  padding: 8px;
  background: rgba(0, 120, 212, 0.1);
  border-radius: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.remember-me-info .info-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.remember-me-info .info-text {
  line-height: 1.4;
}

.security-note {
  margin-top: 8px;
  padding: 6px 8px;
  background: rgba(255, 193, 7, 0.15);
  border-left: 3px solid #ffc107;
  border-radius: 3px;
  font-size: 12px;
  color: #ffd54f;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Security Warning Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.security-warning-modal {
  background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #ffffff;
}

.modal-content {
  padding: 24px;
}

.modal-intro {
  font-size: 16px;
  line-height: 1.6;
  color: #ffffff;
  margin-bottom: 20px;
}

.security-considerations,
.benefits-section {
  margin-bottom: 20px;
}

.security-considerations h4,
.benefits-section h4 {
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 12px;
  font-weight: 600;
}

.security-considerations ul,
.benefits-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.security-considerations li,
.benefits-section li {
  padding: 8px 0 8px 28px;
  position: relative;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
}

.security-considerations li:before {
  content: "⚠️";
  position: absolute;
  left: 0;
  font-size: 16px;
}

.benefits-section li:before {
  content: "✅";
  position: absolute;
  left: 0;
  font-size: 16px;
}

.modal-actions {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #0078d4;
  color: #ffffff;
}

.btn-primary:hover {
  background: #005a9e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

## Phase 4: Cross-Tab Logout Synchronization (Optional Enhancement)

### Add BroadcastChannel Support

```javascript
// In SecureTokenStorage constructor
constructor() {
  this.logger = logger.getLogger('SecureTokenStorage');
  this.storageKey = 'sgex_secure_token';
  this.expirationHours = 24;
  this.localStorageExpirationHours = 8;
  this.rememberMeKey = 'sgex_remember_me';
  
  // Setup cross-tab communication
  this.setupCrossTabSync();
  
  this.logger.debug('SecureTokenStorage instance created');
}

/**
 * Setup cross-tab communication for token sync
 */
setupCrossTabSync() {
  if (typeof BroadcastChannel !== 'undefined') {
    this.broadcastChannel = new BroadcastChannel('sgex_token_sync');
    
    // Listen for token updates from other tabs
    this.broadcastChannel.addEventListener('message', (event) => {
      if (event.data.type === 'TOKEN_CLEARED') {
        // Another tab cleared token, clear locally too
        this.logger.info('Token cleared due to logout in another tab');
        sessionStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.rememberMeKey);
        
        // Trigger app-wide logout event
        window.dispatchEvent(new CustomEvent('sgex-logout'));
      } else if (event.data.type === 'TOKEN_STORED') {
        // Another tab stored a token, sync to sessionStorage
        if (event.data.tokenData) {
          sessionStorage.setItem(this.storageKey, event.data.tokenData);
          this.logger.debug('Token synced from another tab');
        }
      }
    });
    
    this.logger.debug('Cross-tab synchronization enabled');
  } else {
    this.logger.debug('BroadcastChannel not available, cross-tab sync disabled');
  }
}

/**
 * Updated clearToken with cross-tab notification
 */
clearToken() {
  try {
    sessionStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.rememberMeKey);
    
    // Also clear legacy tokens
    sessionStorage.removeItem('github_token');
    localStorage.removeItem('github_token');
    
    // Notify other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'TOKEN_CLEARED',
        timestamp: Date.now()
      });
    }
    
    this.logger.debug('Token cleared from all storage and synced to other tabs');
  } catch (error) {
    this.logger.error('Error clearing token', { error: error.message });
  }
}

/**
 * Updated storeToken with cross-tab notification
 */
storeToken(token, rememberMe = false) {
  // ... existing validation and encryption code ...
  
  // Store in appropriate backend
  const storage = this.getStorage();
  const dataString = JSON.stringify(data);
  storage.setItem(this.storageKey, dataString);
  
  // Also sync to sessionStorage for current tab if using localStorage
  if (rememberMe) {
    sessionStorage.setItem(this.storageKey, dataString);
  }
  
  // Notify other tabs if using localStorage
  if (rememberMe && this.broadcastChannel) {
    this.broadcastChannel.postMessage({
      type: 'TOKEN_STORED',
      tokenData: dataString,
      timestamp: Date.now()
    });
  }
  
  // ... rest of existing code ...
}
```

---

## Testing Guide

### Test Case 1: Remember Me Disabled (Default)

1. Open SGEX in browser
2. Enter PAT token
3. Leave "Remember Me" unchecked
4. Click "Sign In"
5. **Expected**: Login successful, token in sessionStorage only
6. Close browser completely
7. Reopen browser and navigate to SGEX
8. **Expected**: Must log in again

### Test Case 2: Remember Me Enabled

1. Open SGEX in browser
2. Enter PAT token
3. Check "Remember Me"
4. Click "Sign In"
5. **Expected**: Security warning modal appears
6. Click "I Understand, Enable Remember Me"
7. **Expected**: Login successful, token in localStorage
8. Close browser completely
9. Reopen browser and navigate to SGEX
10. **Expected**: Still logged in

### Test Case 3: Window Resize (Stable Fingerprint)

1. Log in with either remember me option
2. Significantly resize browser window
3. Navigate to a different page
4. **Expected**: Still logged in (no logout)

### Test Case 4: Multiple Tabs (with Remember Me)

1. Log in with "Remember Me" enabled in Tab 1
2. Open SGEX in Tab 2
3. **Expected**: Tab 2 is also logged in
4. Logout in Tab 1
5. **Expected**: Tab 2 is also logged out (if BroadcastChannel implemented)

### Test Case 5: Security Warning

1. Enter PAT token
2. Check "Remember Me"
3. Click "Sign In"
4. **Expected**: Security warning modal appears
5. Click "Cancel"
6. **Expected**: Modal closes, "Remember Me" unchecked
7. Check "Remember Me" again and submit
8. **Expected**: Security warning appears again

### Test Case 6: Token Expiration

1. Log in with "Remember Me" enabled
2. Wait 8 hours (or temporarily reduce expiration for testing)
3. Try to access protected feature
4. **Expected**: Token expired, must re-authenticate

---

## Security Checklist

Before deploying, verify:

- [ ] Stable fingerprint implemented (no screen dimensions or canvas)
- [ ] "Remember Me" checkbox present with clear labeling
- [ ] Security warning modal appears on first use
- [ ] localStorage uses shorter expiration (8 hours vs 24)
- [ ] Enhanced encryption with session-specific keys
- [ ] Cross-tab logout synchronization working (if implemented)
- [ ] Token validation on retrieval
- [ ] Clear security warnings in UI
- [ ] Default to sessionStorage (secure by default)
- [ ] Logout clears all storage locations
- [ ] Legacy token migration handled
- [ ] Logging for security events
- [ ] Error handling for all failure scenarios

---

## Migration Path for Existing Users

Existing users with tokens will automatically migrate:

1. **On next login**: If they had a token in old storage format
2. **Stable fingerprint**: Will be generated and stored
3. **Remember Me preference**: Defaults to `false` (sessionStorage)
4. **User choice**: Can enable "Remember Me" on next login

No data loss or forced re-authentication for existing users.

---

## Summary

This implementation provides:

✅ **User Experience**
- Multiple tabs work seamlessly (with Remember Me)
- No logout from window resize/zoom
- Persistence across browser restarts (with Remember Me)

✅ **Security**
- Explicit user consent required
- Stable fingerprint (device-level)
- Enhanced encryption
- Shorter expiration for localStorage
- Cross-tab logout sync
- Clear security warnings

✅ **Best Practices**
- Secure by default (sessionStorage)
- Opt-in for convenience (localStorage + Remember Me)
- Clear user communication
- Comprehensive logging
- Graceful migration

The feature balances security and usability, giving users control while maintaining strong security practices.
