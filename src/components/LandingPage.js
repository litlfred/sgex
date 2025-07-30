import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // TODO: Use for navigation
// import githubService from '../services/githubService'; // TODO: Use for real PR data
import BranchSelector from './BranchSelector';
import ContextualHelpMascot from './ContextualHelpMascot';
import './LandingPage.css';

const LandingPage = () => {
  // const navigate = useNavigate(); // TODO: Use for navigation
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [pullRequests, setPullRequests] = useState([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [prSearchTerm, setPrSearchTerm] = useState('');
  const [prPage, setPrPage] = useState(1);
  const [showMorePRs, setShowMorePRs] = useState(false);
  
  // Repository info for sgex
  const repository = {
    owner: { login: 'litlfred' },
    name: 'sgex',
    full_name: 'litlfred/sgex',
    default_branch: 'main'
  };

  useEffect(() => {
    // Set dark mode by default
    document.body.className = 'theme-dark';
  }, []);

  const loadPullRequests = useCallback(async () => {
    setLoadingPRs(true);
    try {
      // For now, we'll simulate the PR data since we need to add the method to githubService
      // This will be enhanced with actual GitHub API calls
      const mockPRs = [
        { 
          id: 1, 
          title: 'Add new BPMN editor features', 
          number: 123, 
          branch: 'feature/bpmn-enhancements',
          head: { ref: 'feature/bpmn-enhancements' }
        },
        { 
          id: 2, 
          title: 'Fix decision table validation', 
          number: 124, 
          branch: 'bugfix/decision-table-validation',
          head: { ref: 'bugfix/decision-table-validation' }
        },
        { 
          id: 3, 
          title: 'Improve landing page design', 
          number: 125, 
          branch: 'feature/landing-page-improvements',
          head: { ref: 'feature/landing-page-improvements' }
        },
        { 
          id: 4, 
          title: 'Add internationalization support', 
          number: 126, 
          branch: 'feature/i18n-support',
          head: { ref: 'feature/i18n-support' }
        },
        { 
          id: 5, 
          title: 'Update documentation', 
          number: 127, 
          branch: 'docs/update-readme',
          head: { ref: 'docs/update-readme' }
        }
      ];
      
      // Filter by search term if provided
      const filteredPRs = prSearchTerm 
        ? mockPRs.filter(pr => pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()))
        : mockPRs;
      
      // Paginate (5 per page)
      const itemsPerPage = 5;
      const startIndex = (prPage - 1) * itemsPerPage;
      const paginatedPRs = filteredPRs.slice(startIndex, startIndex + itemsPerPage);
      
      setPullRequests(paginatedPRs);
      setShowMorePRs(filteredPRs.length > prPage * itemsPerPage);
    } catch (error) {
      console.error('Failed to load pull requests:', error);
    } finally {
      setLoadingPRs(false);
    }
  }, [prPage, prSearchTerm]);

  useEffect(() => {
    loadPullRequests();
  }, [loadPullRequests]);

  const handleAuthoringClick = () => {
    // Navigate to main branch
    window.open('https://litlfred.github.io/sgex/main/', '_blank');
  };

  const handleCollaborationClick = () => {
    setShowContributionModal(true);
  };

  const handleExperimentingClick = () => {
    // This area shows the branch/PR selector - it's already visible
    // Could scroll to it or highlight it
    const experimentSection = document.getElementById('experiment-section');
    if (experimentSection) {
      experimentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePRClick = (pr) => {
    // Navigate to the branch associated with this PR
    const branchUrl = `https://litlfred.github.io/sgex/${pr.head.ref}/`;
    window.open(branchUrl, '_blank');
  };

  const handleBranchClick = (branchName) => {
    const branchUrl = `https://litlfred.github.io/sgex/${branchName}/`;
    window.open(branchUrl, '_blank');
  };

  const loadMorePRs = () => {
    setPrPage(prev => prev + 1);
  };

  const ContributionModal = () => (
    <div className="modal-overlay" onClick={() => setShowContributionModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How to Contribute</h2>
          <button className="modal-close" onClick={() => setShowContributionModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="contribution-slides">
            <div className="slide">
              <div className="slide-content">
                <div className="mascot-illustration">
                  <img src="/sgex-mascot.png" alt="SGEX Mascot looking at a bug" className="mascot-img" />
                  <div className="bug-icon">🐛</div>
                </div>
                <h3>1. Report a Bug</h3>
                <p>Found an issue? Use our bug reporting system to let us know what's wrong. Every bug report helps improve the workbench.</p>
              </div>
            </div>
            
            <div className="slide">
              <div className="slide-content">
                <div className="mascot-illustration">
                  <img src="/sgex-mascot.png" alt="SGEX Mascot with magic bottle" className="mascot-img thinking" />
                  <div className="magic-bottle">🧞‍♂️</div>
                </div>
                <h3>2. Make a Feature Request</h3>
                <p>Have an idea? Request new features through our issue system. Your wishes help shape the future of SGEX.</p>
              </div>
            </div>
            
            <div className="slide">
              <div className="slide-content">
                <div className="mascot-illustration">
                  <img src="/sgex-mascot.png" alt="Robotic SGEX Mascot" className="mascot-img robot" />
                  <div className="matrix-code">01010</div>
                </div>
                <h3>3. Assigned to Coding Agent</h3>
                <p>Once triaged, features are assigned to coding agents who implement solutions collaboratively with the community.</p>
              </div>
            </div>
            
            <div className="slide">
              <div className="slide-content">
                <div className="mascot-illustration community">
                  <img src="/sgex-mascot.png" alt="SGEX Mascot 1" className="mascot-img" />
                  <img src="/sgex-mascot.png" alt="SGEX Mascot 2" className="mascot-img" />
                  <img src="/sgex-mascot.png" alt="SGEX Mascot 3" className="mascot-img" />
                  <div className="shared-thought">💡</div>
                </div>
                <h3>4. Community Evolution</h3>
                <p>Through collaborative discussion, the community evolves the workbench in real time, making it easier and faster to develop high fidelity SMART Guidelines Digital Adaptation Kits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/sgex-mascot.png" alt="SGEX" className="sgex-icon" />
            <div className="title-section">
              <h1>SGEX</h1>
              <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Three Action Cards */}
        <section className="action-cards">
          <div className="card" onClick={handleAuthoringClick}>
            <div className="card-graphic">
              <img src="/sgex-mascot.png" alt="Mascot at workbench" className="card-mascot" />
              <div className="workbench-items">
                <div className="guideline-doc">📋</div>
                <div className="digital-tool">💻</div>
              </div>
            </div>
            <h2>Authoring</h2>
            <p>Create and edit digital health guidelines with our comprehensive workbench tools</p>
          </div>

          <div className="card" onClick={handleCollaborationClick}>
            <div className="card-graphic">
              <div className="mascot-group">
                <img src="/sgex-mascot.png" alt="Mascot 1" className="card-mascot small" />
                <img src="/sgex-mascot.png" alt="Mascot 2" className="card-mascot small" />
                <img src="/sgex-mascot.png" alt="Mascot 3" className="card-mascot small" />
              </div>
              <div className="shared-thought-bubble">💡</div>
            </div>
            <h2>Collaboration</h2>
            <p>Join the community in collaborative development of SMART Guidelines</p>
          </div>

          <div className="card" onClick={handleExperimentingClick}>
            <div className="card-graphic">
              <img src="/sgex-mascot.png" alt="Mascot scientist" className="card-mascot scientist" />
              <img src="/sgex-mascot.png" alt="Borg mascot" className="card-mascot borg" />
              <div className="lab-elements">
                <div className="test-tube">🧪</div>
                <div className="formula">⚗️</div>
              </div>
            </div>
            <h2>Experimenting</h2>
            <p>Explore different branches and pull requests to test new features</p>
          </div>
        </section>

        {/* Branch and PR Selector Section */}
        <section id="experiment-section" className="experiment-section">
          <div className="selector-container">
            <div className="branch-section">
              <h3>Branch Selector</h3>
              <BranchSelector 
                repository={repository}
                selectedBranch={selectedBranch}
                onBranchChange={(branch) => {
                  setSelectedBranch(branch);
                  handleBranchClick(branch);
                }}
              />
            </div>

            <div className="pr-section">
              <h3>Pull Request Selector</h3>
              
              <div className="pr-search">
                <input
                  type="text"
                  placeholder="Search pull requests..."
                  value={prSearchTerm}
                  onChange={(e) => setPrSearchTerm(e.target.value)}
                  className="pr-search-input"
                />
              </div>

              <div className="pr-list">
                {loadingPRs ? (
                  <div className="loading">Loading pull requests...</div>
                ) : (
                  <>
                    {pullRequests.map((pr) => (
                      <div key={pr.id} className="pr-item" onClick={() => handlePRClick(pr)}>
                        <div className="pr-title">#{pr.number}: {pr.title}</div>
                        <div className="pr-branch">→ {pr.head.ref}</div>
                      </div>
                    ))}
                    {showMorePRs && (
                      <button className="load-more-btn" onClick={loadMorePRs}>
                        [+] Load More
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <a href="https://github.com/litlfred/sgex" target="_blank" rel="noopener noreferrer" className="source-link">
            View Source Code
          </a>
        </div>
      </footer>

      {/* Contribution Modal */}
      {showContributionModal && <ContributionModal />}

      {/* Help Mascot */}
      <ContextualHelpMascot 
        pageId="landing"
        position="bottom-right"
      />
    </div>
  );
};

export default LandingPage;