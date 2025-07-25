import React, { useState } from "react";
import deviceFlowAuthService from "../services/deviceFlowAuthService";
import { DEFAULT_SCOPES } from "../config/oauth";
import "./DeviceFlowLogin.css";

const DeviceFlowLogin = ({ onAuthSuccess, requiredScopes = DEFAULT_SCOPES }) => {
  const [step, setStep] = useState("idle");
  const [code, setCode] = useState("");
  const [verificationUri, setVerificationUri] = useState("");
  const [verificationUriComplete, setVerificationUriComplete] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    setStep("requesting");
    setError("");
    
    try {
      const authResult = await deviceFlowAuthService.startDeviceFlow(
        requiredScopes,
        ({ user_code, verification_uri, verification_uri_complete }) => {
          setCode(user_code);
          setVerificationUri(verification_uri);
          setVerificationUriComplete(verification_uri_complete);
          setStep("verify");
          setLoading(false); // User can now proceed while we poll in background
        }
      );
      
      // Authentication completed successfully
      setStep("success");
      onAuthSuccess(authResult.token, authResult.octokit);
    } catch (err) {
      console.error('Authentication failed:', err);
      setError("Authentication failed. Please try again.");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const openVerificationPage = () => {
    if (verificationUriComplete) {
      window.open(verificationUriComplete, '_blank', 'noopener,noreferrer');
    } else if (verificationUri) {
      window.open(verificationUri, '_blank', 'noopener,noreferrer');
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="device-flow-login">
      {step === "idle" && (
        <div className="github-login-section">
          <button 
            className="github-login-btn" 
            onClick={handleStart} 
            disabled={loading}
          >
            <span className="github-icon">📱</span>
            Sign in with GitHub
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
      
      {step === "requesting" && (
        <div className="requesting-step">
          <div className="spinner"></div>
          <p>Starting authentication with GitHub...</p>
        </div>
      )}
      
      {step === "verify" && (
        <div className="verify-step">
          <div className="verification-content">
            <h3>Complete Authentication</h3>
            <p>To sign in, follow these steps:</p>
            
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <p>Click the button below to open GitHub in a new tab:</p>
                <button 
                  className="verification-btn" 
                  onClick={openVerificationPage}
                >
                  Open GitHub Authorization →
                </button>
              </div>
            </div>
            
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <p>Enter this code when prompted:</p>
                <div className="code-display">
                  <code className="user-code">{code}</code>
                  <button 
                    className="copy-code-btn" 
                    onClick={copyCode}
                    title="Copy code"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
            
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <p>Authorize the SGEX Workbench application</p>
              </div>
            </div>
            
            <div className="waiting-message">
              <div className="spinner small"></div>
              <p>Waiting for you to complete authorization...</p>
              <small>This page will automatically continue once you're done.</small>
            </div>
          </div>
        </div>
      )}
      
      {step === "success" && (
        <div className="success-step">
          <div className="success-icon">✅</div>
          <p>Authenticated successfully!</p>
          <small>Loading your repositories...</small>
        </div>
      )}
    </div>
  );
};

export default DeviceFlowLogin;