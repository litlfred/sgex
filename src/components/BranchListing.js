import React, { useState, useEffect } from 'react';
import { PageLayout } from './framework';
import HelpModal from './HelpModal';
import './BranchListing.css';

const BranchListing = () => {
  const [branches, setBranches] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('branches');
  const [prPage, setPrPage] = useState(1);
  const [prSearchTerm, setPrSearchTerm] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);

  const ITEMS_PER_PAGE = 5;

  // "How to contribute" slideshow content
  const contributeHelpTopic = {
    id: 'how-to-contribute',
    title: 'How to Contribute to SGEX',
    type: 'slideshow',
    content: [
      {
        title: 'Welcome to SGEX - A Collaborative Workbench',
        content: `
          <div class="contribute-slide">
            <div class="mascot-container">
              <img src="/sgex-mascot.png" alt="SGEX Mascot" class="contribute-mascot" />
            </div>
            <h3>What is SGEX?</h3>
            <p>SGEX is an experimental collaborative project developing a workbench of tools to make it easier and faster to develop high fidelity SMART Guidelines Digital Adaptation Kits.</p>
            <p>Our mission is to empower healthcare organizations worldwide to create and maintain standards-compliant digital health implementations.</p>
          </div>
        `
      },
      {
        title: 'Step 1: Report a Bug or Make a Feature Request',
        content: `
          <div class="contribute-slide">
            <div class="mascot-container">
              <img src="/sgex-mascot.png" alt="SGEX Mascot examining a bug" class="contribute-mascot bug-report" />
            </div>
            <h3>🐛 Found something that needs fixing?</h3>
            <p>Every great contribution starts with identifying what can be improved:</p>
            <ul>
              <li><strong>Bug reports:</strong> Help us identify and fix issues</li>
              <li><strong>Feature requests:</strong> Share ideas for new functionality</li>
              <li><strong>Documentation improvements:</strong> Make our guides clearer</li>
              <li><strong>User experience feedback:</strong> Tell us what's confusing</li>
            </ul>
            <p>Click the mascot's help button on any page to quickly report issues!</p>
          </div>
        `
      },
      {
        title: 'Step 2: Assignment to a Coding Agent',
        content: `
          <div class="contribute-slide">
            <div class="mascot-container">
              <img src="/sgex-mascot.png" alt="Robotic SGEX Mascot" class="contribute-mascot coding-agent" />
            </div>
            <h3>🤖 AI-Powered Development</h3>
            <p>Once your issue is triaged, it may be assigned to one of our coding agents:</p>
            <ul>
              <li><strong>Automated analysis:</strong> AI agents analyze the requirements</li>
              <li><strong>Code generation:</strong> Initial implementations are created</li>
              <li><strong>Testing integration:</strong> Automated tests validate changes</li>
              <li><strong>Documentation updates:</strong> Keep documentation in sync</li>
            </ul>
            <p>This hybrid approach combines human insight with AI efficiency.</p>
          </div>
        `
      },
      {
        title: 'Step 3: Community Collaboration',
        content: `
          <div class="contribute-slide">
            <div class="mascot-container">
              <div class="mascot-group">
                <img src="/sgex-mascot.png" alt="SGEX Mascot 1" class="contribute-mascot community" />
                <img src="/sgex-mascot.png" alt="SGEX Mascot 2" class="contribute-mascot community" />
                <img src="/sgex-mascot.png" alt="SGEX Mascot 3" class="contribute-mascot community" />
              </div>
              <div class="thought-bubble">💫</div>
            </div>
            <h3>🌟 Real-time Evolution</h3>
            <p>The community drives continuous improvement through collaborative discussion:</p>
            <ul>
              <li><strong>Code reviews:</strong> Community members review and suggest improvements</li>
              <li><strong>Testing feedback:</strong> Real-world testing by healthcare professionals</li>
              <li><strong>Knowledge sharing:</strong> Best practices emerge from collective experience</li>
              <li><strong>Iterative refinement:</strong> The workbench evolves based on actual usage</li>
            </ul>
            <p>Together, we're building the future of digital health tooling!</p>
          </div>
        `
      },
      {
        title: 'Get Started Today!',
        content: `
          <div class="contribute-slide">
            <div class="mascot-container">
              <img src="/sgex-mascot.png" alt="SGEX Mascot celebrating" class="contribute-mascot celebrate" />
            </div>
            <h3>🚀 Ready to Contribute?</h3>
            <div class="action-buttons">
              <a href="https://github.com/litlfred/sgex/issues/new" target="_blank" class="contribute-btn primary">
                🐛 Report a Bug
              </a>
              <a href="https://github.com/litlfred/sgex/issues/new?template=feature_request.md" target="_blank" class="contribute-btn secondary">
                ✨ Request a Feature  
              </a>
              <a href="/sgex/main/docs/" target="_blank" class="contribute-btn tertiary">
                📚 Read Documentation
              </a>
              <a href="https://github.com/litlfred/sgex/tree/main/public/docs" target="_blank" class="contribute-btn tertiary-alt">
                📖 Docs on GitHub
              </a>
            </div>
            <p class="contribute-footer">
              <strong>Every contribution matters!</strong> Whether you're reporting a bug, testing a feature, or sharing feedback, you're helping improve digital health tools for healthcare workers worldwide.
            </p>
          </div>
        `
      }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use GitHub API to fetch branches and PRs for the sgex repository
        const owner = 'litlfred';
        const repo = 'sgex';
        
        // Fetch branches
        const branchResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
        if (!branchResponse.ok) {
          throw new Error(`Failed to fetch branches: ${branchResponse.status}`);
        }
        const branchData = await branchResponse.json();
        
        // Fetch pull requests
        const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&sort=updated&per_page=100`);
        if (!prResponse.ok) {
          throw new Error(`Failed to fetch pull requests: ${prResponse.status}`);
        }
        const prData = await prResponse.json();
        
        // Filter out gh-pages branch and format data
        const filteredBranches = branchData
          .filter(branch => branch.name !== 'gh-pages')
          .map(branch => {
            // Convert branch name to safe directory name (replace slashes with dashes)
            const safeName = branch.name.replace(/\//g, '-');
            return {
              name: branch.name,
              safeName: safeName,
              commit: branch.commit,
              url: `./sgex/${safeName}/index.html`,
              lastModified: branch.commit.commit?.committer?.date 
                ? new Date(branch.commit.commit.committer.date).toLocaleDateString()
                : 'Unknown'
            };
          });
        
        // Format PR data
        const formattedPRs = prData.map(pr => {
          const safeBranchName = pr.head.ref.replace(/\//g, '-');
          return {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            author: pr.user.login,
            branchName: pr.head.ref,
            safeBranchName: safeBranchName,
            url: `./sgex/${safeBranchName}/index.html`,
            prUrl: pr.html_url,
            updatedAt: new Date(pr.updated_at).toLocaleDateString(),
            createdAt: new Date(pr.created_at).toLocaleDateString()
          };
        });
        
        setBranches(filteredBranches);
        setPullRequests(formattedPRs);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and paginate PRs based on search
  const filteredPRs = pullRequests.filter(pr => 
    pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
    pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
  );
  const paginatedPRs = filteredPRs.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
  const totalPRPages = Math.ceil(filteredPRs.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <PageLayout pageName="branch-listing" showMascot={true}>
        <div className="branch-listing">
          <h1><img src="/sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
          <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
          <div className="loading">Loading previews...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="branch-listing" showMascot={true}>
        <div className="branch-listing">
          <h1><img src="/sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
          <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
          <div className="error">
            <p>Failed to load previews: {error}</p>
            <p>Please try refreshing the page or check back later.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="branch-listing" showMascot={true}>
      <div className="branch-listing">
        <header className="branch-listing-header">
          <h1><img src="/sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
          <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
        </header>

        <div className="main-actions">
          <button 
            className="contribute-btn primary"
            onClick={() => setShowContributeModal(true)}
          >
            🌟 How to Contribute
          </button>
          <a 
            href="/sgex/main/docs/" 
            className="contribute-btn secondary"
            target="_blank"
            rel="noopener noreferrer"
            onError={(e) => {
              // Fallback to GitHub docs if main branch docs not available
              e.target.href = "https://github.com/litlfred/sgex/tree/main/public/docs";
            }}
          >
            📚 Documentation
          </a>
          <a 
            href="https://github.com/litlfred/sgex/issues/new" 
            className="contribute-btn tertiary"
            target="_blank"
            rel="noopener noreferrer"
          >
            🐛 Report a Bug
          </a>
        </div>

        <div className="preview-tabs">
          <button 
            className={`tab-button ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            🌿 Branch Previews ({branches.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'prs' ? 'active' : ''}`}
            onClick={() => setActiveTab('prs')}
          >
            🔄 Pull Request Previews ({pullRequests.length})
          </button>
        </div>

        {activeTab === 'branches' && (
          <div className="branch-cards">
            {branches.length === 0 ? (
              <div className="no-items">
                <p>No branch previews available at the moment.</p>
                <p>Branch previews will appear here when code is pushed to branches.</p>
              </div>
            ) : (
              branches.map((branch) => (
                <div key={branch.name} className="preview-card">
                  <div className="card-header">
                    <h3 className="item-name">{branch.name}</h3>
                    <span className="commit-badge">
                      {branch.commit.sha.substring(0, 7)}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <p className="item-date">
                      Last updated: {branch.lastModified}
                    </p>
                    
                    <a 
                      href={branch.url} 
                      className="preview-link"
                      rel="noopener noreferrer"
                    >
                      <span>🚀 View Preview</span>
                    </a>
                  </div>

                  <div className="card-footer">
                    <small className="preview-path">
                      Preview URL: {branch.url}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prs' && (
          <div className="pr-section">
            <div className="pr-controls">
              <input
                type="text"
                placeholder="Search pull requests by title or author..."
                value={prSearchTerm}
                onChange={(e) => {
                  setPrSearchTerm(e.target.value);
                  setPrPage(1); // Reset to first page when searching
                }}
                className="pr-search"
              />
            </div>

            <div className="pr-cards">
              {paginatedPRs.length === 0 ? (
                <div className="no-items">
                  {prSearchTerm ? (
                    <p>No pull requests match your search "{prSearchTerm}".</p>
                  ) : (
                    <p>No pull request previews available at the moment.</p>
                  )}
                </div>
              ) : (
                paginatedPRs.map((pr) => (
                  <div key={pr.id} className="preview-card pr-card">
                    <div className="card-header">
                      <h3 className="item-name">#{pr.number}: {pr.title}</h3>
                      <span className={`state-badge ${pr.state}`}>
                        {pr.state === 'open' ? '🟢' : '🔴'} {pr.state}
                      </span>
                    </div>
                    
                    <div className="card-body">
                      <p className="pr-meta">
                        <strong>Branch:</strong> {pr.branchName} • <strong>Author:</strong> {pr.author}
                      </p>
                      <p className="item-date">
                        Created: {pr.createdAt} • Updated: {pr.updatedAt}
                      </p>
                      
                      <div className="pr-actions">
                        <a 
                          href={pr.url} 
                          className="preview-link"
                          rel="noopener noreferrer"
                        >
                          <span>🚀 View Preview</span>
                        </a>
                        <a 
                          href={pr.prUrl} 
                          className="pr-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>📋 View PR</span>
                        </a>
                      </div>
                    </div>

                    <div className="card-footer">
                      <small className="preview-path">
                        Preview URL: {pr.url}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPRPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setPrPage(Math.max(1, prPage - 1))}
                  disabled={prPage === 1}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {prPage} of {totalPRPages} ({filteredPRs.length} total)
                </span>
                <button 
                  className="pagination-btn"
                  onClick={() => setPrPage(Math.min(totalPRPages, prPage + 1))}
                  disabled={prPage === totalPRPages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        <footer className="branch-listing-footer">
          <div className="footer-content">
            <div className="footer-left">
              <a 
                href="https://github.com/litlfred/sgex" 
                target="_blank" 
                rel="noopener noreferrer"
                className="source-link"
              >
                📦 Source Code
              </a>
            </div>
            <div className="footer-center">
              <p>
                🐾 This landing page lists all available previews. 
                Each branch and PR is automatically deployed to its own preview environment.
              </p>
              <p>
                <strong>Main Application:</strong> <a href="./sgex/main/index.html">View Main Branch →</a>
              </p>
            </div>
          </div>
        </footer>

        {showContributeModal && (
          <HelpModal
            helpTopic={contributeHelpTopic}
            onClose={() => setShowContributeModal(false)}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default BranchListing;