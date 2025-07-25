import React, { useState } from 'react';
import './GitHubTokenSlideshow.css';

const GitHubTokenSlideshow = ({ contextData = {} }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { permissionMode = 'read-only', upgradeMode = false } = contextData;

  const slides = [
    {
      title: "Step 1: Navigate to GitHub Settings",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Let's create your GitHub Personal Access Token together!</p>
              <p>We'll use fine-grained tokens for better security. Click below to get started:</p>
              {upgradeMode && (
                <div className="upgrade-notice">
                  <strong>🔧 Upgrading to Edit Access</strong>
                  <p>You're creating a new token with write permissions for repository editing.</p>
                </div>
              )}
              <a 
                href="https://github.com/settings/personal-access-tokens/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
              >
                Go to Fine-Grained Token Settings →
              </a>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/personal-access-tokens/new</div>
              </div>
              <div className="browser-content">
                <h3>Generate a fine-grained personal access token</h3>
                <p>Fine-grained tokens provide more secure, repository-specific access</p>
                <div className="token-form-preview">
                  <label>Token name</label>
                  <input type="text" placeholder="Enter a name for your token" readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Configure Token Details",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Fill in these details:</p>
              <ul>
                <li><strong>Token name:</strong> "SGEX Workbench Access"</li>
                <li><strong>Expiration:</strong> Choose your preference</li>
                <li><strong>Resource owner:</strong> Your username or organization</li>
              </ul>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/personal-access-tokens/new</div>
              </div>
              <div className="browser-content">
                <div className="form-preview">
                  <label>Token name *</label>
                  <input type="text" value="SGEX Workbench Access" readOnly className="filled" />
                  
                  <label>Expiration *</label>
                  <select className="filled">
                    <option>90 days</option>
                  </select>
                  
                  <label>Resource owner *</label>
                  <select className="filled">
                    <option>Your username</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Select Repository Access",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Choose repository access:</p>
              <ul>
                <li><strong>For read-only:</strong> Select "Selected repositories" and choose specific DAK repos</li>
                <li><strong>For editing:</strong> Select repositories you want to edit</li>
              </ul>
              <p>This is much safer than giving access to all repositories!</p>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/personal-access-tokens/new</div>
              </div>
              <div className="browser-content">
                <div className="repository-access-preview">
                  <h4>Repository access</h4>
                  <div className="access-option selected">
                    <input type="radio" checked readOnly />
                    <div>
                      <strong>Selected repositories</strong>
                      <p>Choose specific repositories (Recommended)</p>
                    </div>
                  </div>
                  <div className="repository-selector">
                    <div className="repo-item selected">
                      <input type="checkbox" checked readOnly />
                      <span>litlfred/sgex</span>
                    </div>
                    <div className="repo-item">
                      <input type="checkbox" readOnly />
                      <span>your-org/dak-repository</span>
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
      title: "Step 4: Set Repository Permissions",
      content: (
        <div className="slide-content">
          <div className="mascot-instruction">
            <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="slide-mascot" />
            <div className="instruction-bubble">
              <p>Select the appropriate permissions:</p>
              {permissionMode === 'read-only' ? (
                <ul>
                  <li><strong>Contents:</strong> Read (to view repository files)</li>
                  <li><strong>Metadata:</strong> Read (to access repository information)</li>
                </ul>
              ) : (
                <ul>
                  <li><strong>Contents:</strong> Write (to create and modify files)</li>
                  <li><strong>Metadata:</strong> Read (to access repository information)</li>
                  <li><strong>Pull requests:</strong> Write (to create pull requests)</li>
                </ul>
              )}
              <p>
                {permissionMode === 'read-only' 
                  ? 'These minimal permissions provide secure read-only access.'
                  : 'You can always create a new token later with different permissions!'
                }
              </p>
            </div>
          </div>
          <div className="screenshot-placeholder">
            <div className="fake-browser">
              <div className="browser-bar">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-url">github.com/settings/personal-access-tokens/new</div>
              </div>
              <div className="browser-content">
                <div className="permissions-preview">
                  <h4>Repository permissions</h4>
                  <div className="permission-item selected">
                    <input type="checkbox" checked readOnly />
                    <div>
                      <strong>Contents</strong>
                      <select>
                        <option>{permissionMode === 'read-only' ? 'Read' : 'Write'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="permission-item selected">
                    <input type="checkbox" checked readOnly />
                    <div>
                      <strong>Metadata</strong>
                      <select>
                        <option>Read</option>
                      </select>
                    </div>
                  </div>
                  {permissionMode !== 'read-only' && (
                    <div className="permission-item selected">
                      <input type="checkbox" checked readOnly />
                      <div>
                        <strong>Pull requests</strong>
                        <select>
                          <option>Write</option>
                        </select>
                      </div>
                    </div>
                  )}
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
                <div className="browser-url">github.com/settings/personal-access-tokens</div>
              </div>
              <div className="browser-content">
                <div className="token-display">
                  <h4>Fine-grained personal access tokens</h4>
                  <div className="token-item">
                    <strong>SGEX Workbench Access</strong>
                    <div className="token-value">
                      <code>github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
                      <button className="copy-btn">📋 Copy</button>
                    </div>
                    <small>Created just now • Selected repositories</small>
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
            href="https://github.com/settings/personal-access-tokens/new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="quick-create-link"
          >
            Create Fine-Grained Token →
          </a>
        </div>
      </div>
    </div>
  );
};

export default GitHubTokenSlideshow;