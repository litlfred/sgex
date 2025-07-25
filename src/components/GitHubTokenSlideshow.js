import React, { useState } from 'react';
import './GitHubTokenSlideshow.css';

const GitHubTokenSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Step 1: Navigate to GitHub Settings",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Let's create your GitHub Personal Access Token together!</p>
              <p>First, click the link below to go to GitHub Settings:</p>
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
              >
                Go to GitHub Token Settings →
              </a>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/tokens</div>
              </div>
              <div className="browser-content">
                <h3>Personal access tokens</h3>
                <p>Generate new tokens to access the GitHub API</p>
                <button className="fake-button">Generate new token →</button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Generate New Token (Classic)",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Click on "Generate new token" and select "Generate new token (classic)"</p>
              <p>This will take you to the token creation form.</p>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/tokens/new</div>
              </div>
              <div className="browser-content">
                <h3>New personal access token (classic)</h3>
                <div className="form-preview">
                  <label>Note *</label>
                  <input type="text" placeholder="What's this token for?" readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Fill in Token Details",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Fill in these exact details:</p>
              <ul>
                <li><strong>Note:</strong> "SGEX Workbench Access"</li>
                <li><strong>Expiration:</strong> Choose your preference</li>
                <li><strong>Repository:</strong> litlfred/sgex</li>
              </ul>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/tokens/new</div>
              </div>
              <div className="browser-content">
                <div className="form-preview">
                  <label>Note *</label>
                  <input type="text" value="SGEX Workbench Access" readOnly className="filled" />
                  
                  <label>Expiration *</label>
                  <select className="filled">
                    <option>30 days</option>
                  </select>
                  
                  <label>Selected scopes</label>
                  <div className="scope-note">
                    👇 Select the scopes below (Step 4)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Select Required Permissions",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Select these two permissions:</p>
              <ul>
                <li>✅ <strong>repo</strong> - Full control of private repositories</li>
                <li>✅ <strong>read:org</strong> - Read org and team membership</li>
              </ul>
              <p>These permissions allow SGEX to access your repositories and organizations.</p>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/tokens/new</div>
              </div>
              <div className="browser-content">
                <div className="permissions-preview">
                  <div className="permission-item selected">
                    <input type="checkbox" checked readOnly />
                    <div>
                      <strong>repo</strong>
                      <p>Full control of private repositories</p>
                    </div>
                  </div>
                  <div className="permission-item">
                    <input type="checkbox" readOnly />
                    <div>
                      <strong>workflow</strong>
                      <p>Update GitHub Action workflows</p>
                    </div>
                  </div>
                  <div className="permission-item selected">
                    <input type="checkbox" checked readOnly />
                    <div>
                      <strong>read:org</strong>
                      <p>Read org and team membership</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Generate and Copy Your Token",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Click "Generate token" and copy the token that appears.</p>
              <p><strong>Important:</strong> Save this token somewhere safe! GitHub will only show it once.</p>
              <p>Then come back here and paste it into the SGEX Workbench.</p>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/tokens</div>
              </div>
              <div className="browser-content">
                <div className="token-display">
                  <h4>Personal access tokens</h4>
                  <div className="token-item">
                    <strong>SGEX Workbench Access</strong>
                    <div className="token-value">
                      <code>ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
                      <button className="copy-btn">📋 Copy</button>
                    </div>
                    <small>Created just now • repo, read:org</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="slideshow-container">
      <div className="slideshow-header">
        <h3>{slides[currentSlide].title}</h3>
        <div className="slide-counter">
          {currentSlide + 1} of {slides.length}
        </div>
      </div>
      
      <div className="slide">
        {slides[currentSlide].content}
      </div>
      
      <div className="slideshow-controls">
        <button 
          className="nav-btn prev-btn" 
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          ← Previous
        </button>
        
        <div className="slide-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
        
        <button 
          className="nav-btn next-btn" 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          Next →
        </button>
      </div>
      
      <div className="slideshow-footer">
        <div className="quick-link">
          <strong>Quick Link:</strong>
          <a 
            href="https://github.com/settings/tokens/new?description=SGEX%20Workbench%20Access&scopes=repo,read:org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="quick-create-link"
          >
            Create Token with Pre-filled Settings →
          </a>
        </div>
      </div>
    </div>
  );
};

export default GitHubTokenSlideshow;