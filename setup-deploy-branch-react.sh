#!/bin/bash
set -e

echo "🔄 Setting up deploy branch for React-based branch listing..."

# Function to validate we're in a git repository
validate_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "❌ Error: Not in a git repository"
        exit 1
    fi
}

# Function to get the current git branch
get_current_branch() {
    git branch --show-current
}

# Function to backup current deploy branch index.html
backup_deploy_content() {
    local current_branch=$(get_current_branch)
    
    echo "📋 Current branch: $current_branch"
    echo "🔄 Switching to deploy branch to set up React-based branch listing..."
    
    # Fetch deploy branch if it doesn't exist locally
    if ! git show-ref --verify --quiet refs/heads/deploy; then
        if git show-ref --verify --quiet refs/remotes/origin/deploy; then
            echo "📥 Fetching deploy branch from remote..."
            git fetch origin deploy:deploy
        else
            echo "❌ Error: Deploy branch not found in local or remote repository"
            exit 1
        fi
    fi
    
    # Switch to deploy branch
    git checkout deploy
    
    # Backup existing content if it exists
    if [[ -f "index.html" ]]; then
        echo "💾 Backing up existing deploy branch index.html..."
        cp index.html "index.html.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backup created"
    fi
}

# Function to create the BranchDeploymentSelector component
create_branch_selector_component() {
    echo "🚀 Creating BranchDeploymentSelector React component..."
    
    # Ensure src/components directory exists
    mkdir -p src/components
    
    # Create the BranchDeploymentSelector component by converting the branch-listing.html
    cat > src/components/BranchDeploymentSelector.js << 'EOF'
import React, { useState, useEffect, useCallback } from 'react';
import './BranchDeploymentSelector.css';

const BranchDeploymentSelector = () => {
    const [pullRequests, setPullRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prPage, setPrPage] = useState(1);
    const [prSearchTerm, setPrSearchTerm] = useState('');
    const [prSortBy, setPrSortBy] = useState('updated');
    const [prSortOrder, setPrSortOrder] = useState('desc');
    const [deploymentStatuses, setDeploymentStatuses] = useState({});
    const [prFilter, setPrFilter] = useState('open');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [githubToken, setGithubToken] = useState(null);
    const [prComments, setPrComments] = useState({});
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentInputs, setCommentInputs] = useState({});
    const [submittingComments, setSubmittingComments] = useState({});
    const [expandedDiscussions, setExpandedDiscussions] = useState({});
    const [discussionSummaries, setDiscussionSummaries] = useState({});
    const [loadingSummaries, setLoadingSummaries] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // GitHub authentication functions
    const handleAuthSuccess = (token, octokitInstance) => {
        setGithubToken(token);
        setIsAuthenticated(true);
        sessionStorage.setItem('github_token', token);
    };

    const handleLogout = () => {
        setGithubToken(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('github_token');
        setPrComments({});
    };

    // Function to fetch PR comments summary
    const fetchPRCommentsSummary = async (prNumber) => {
        if (!githubToken) return null;
        
        try {
            const response = await fetch(
                `https://api.github.com/repos/litlfred/sgex/issues/${prNumber}/comments`,
                {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${response.status}`);
            }
            
            const comments = await response.json();
            if (comments.length === 0) {
                return { count: 0, lastComment: null };
            }
            
            const lastComment = comments[comments.length - 1];
            return {
                count: comments.length,
                lastComment: {
                    author: lastComment.user.login,
                    created_at: new Date(lastComment.created_at),
                    avatar_url: lastComment.user.avatar_url
                }
            };
        } catch (error) {
            console.error(`Error fetching comment summary for PR ${prNumber}:`, error);
            return null;
        }
    };

    // Main fetch data function
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const owner = 'litlfred';
                const repo = 'sgex';
                
                const prState = prFilter === 'all' ? 'all' : prFilter;
                const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=${prState}&sort=updated&per_page=100`);
                if (!prResponse.ok) {
                    throw new Error(`Failed to fetch pull requests: ${prResponse.status}`);
                }
                const prData = await prResponse.json();
                
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
                        url: `./${safeBranchName}/index.html`,
                        prUrl: pr.html_url,
                        updatedAt: new Date(pr.updated_at).toLocaleDateString(),
                        createdAt: new Date(pr.created_at).toLocaleDateString()
                    };
                });
                
                setPullRequests(formattedPRs);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [prFilter, githubToken]);

    // Check for existing authentication on component mount
    useEffect(() => {
        const token = sessionStorage.getItem('github_token');
        if (token) {
            setGithubToken(token);
            setIsAuthenticated(true);
        }
    }, []);

    // Filter and sort PRs
    const filteredPRs = pullRequests.filter(pr => 
        pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
        pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
    );

    const sortPRs = (prs, sortBy, sortOrder = 'desc') => {
        return [...prs].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'number':
                    comparison = b.number - a.number;
                    break;
                case 'alphabetical':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'updated':
                default:
                    const dateA = new Date(a.updatedAt);
                    const dateB = new Date(b.updatedAt);
                    comparison = dateB - dateA;
                    break;
            }
            
            return sortOrder === 'asc' ? -comparison : comparison;
        });
    };

    const sortedPRs = sortPRs(filteredPRs, prSortBy, prSortOrder);
    const paginatedPRs = sortedPRs.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
    const totalPRPages = Math.ceil(sortedPRs.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="branch-listing">
                <h1><img src="./sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                <div className="loading">Loading previews...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="branch-listing">
                <h1><img src="./sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                <div className="error">
                    <p>Failed to load previews: {error}</p>
                    <p>Please try refreshing the page or check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="branch-listing">
            <header className="branch-listing-header">
                <h1><img src="./sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                
                <div className="prominent-info">
                    <p className="info-text">
                        🐾 This landing page lists all available previews. 
                        Each branch and PR is automatically deployed to its own preview environment.
                    </p>
                </div>
            </header>

            <div className="main-actions">
                <a 
                    href="https://github.com/litlfred/sgex/issues/new" 
                    className="contribute-btn primary"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    🐛 Report a Bug
                </a>
                <a 
                    href="./sgex/main/docs/" 
                    className="contribute-btn secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📚 Documentation
                </a>
                <a 
                    href="https://github.com/litlfred/sgex" 
                    className="contribute-btn tertiary"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📦 Source Code
                </a>
            </div>

            <div className="preview-tabs">
                <button className="tab-button active">
                    🔄 Pull Request Previews ({sortedPRs.length})
                </button>
            </div>

            <div className="pr-section">
                <div className="pr-controls">
                    <div className="pr-filter-section">
                        <label htmlFor="pr-filter">Filter PRs:</label>
                        <select
                            id="pr-filter"
                            value={prFilter}
                            onChange={(e) => {
                                setPrFilter(e.target.value);
                                setPrPage(1);
                            }}
                            className="filter-select"
                        >
                            <option value="open">Open PRs Only</option>
                            <option value="closed">Closed PRs Only</option>
                            <option value="all">All PRs</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Search pull requests by title or author..."
                        value={prSearchTerm}
                        onChange={(e) => {
                            setPrSearchTerm(e.target.value);
                            setPrPage(1);
                        }}
                        className="pr-search"
                    />
                    <select
                        value={prSortBy}
                        onChange={(e) => {
                            setPrSortBy(e.target.value);
                            setPrPage(1);
                        }}
                        className="sort-select"
                    >
                        <option value="updated">Sort by Recent Updates</option>
                        <option value="number">Sort by PR Number</option>
                        <option value="alphabetical">Sort Alphabetically</option>
                    </select>
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
                                    <div className="card-badges">
                                        <span className={`state-badge ${pr.state}`}>
                                            {pr.state === 'open' ? '🟢' : '🔴'} {pr.state}
                                        </span>
                                    </div>
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
                                            target="_blank"
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
                            Page {prPage} of {totalPRPages} ({sortedPRs.length} total)
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
        </div>
    );
};

export default BranchDeploymentSelector;
EOF

    echo "✅ BranchDeploymentSelector component created"
}

# Function to create the CSS file for the component
create_branch_selector_css() {
    echo "🎨 Creating BranchDeploymentSelector CSS..."
    
    # Extract CSS from branch-listing.html and save it as a React component CSS file
    cat > src/components/BranchDeploymentSelector.css << 'EOF'
:root {
    --who-blue: #0366d6;
    --who-text-primary: #333;
    --who-text-secondary: #586069;
    --who-text-muted: #6a737d;
    --who-border-color: #e1e5e9;
    --who-card-bg: #ffffff;
    --who-secondary-bg: #f8f9fa;
    --who-tertiary-bg: #f8f9fa;
    --who-hover-bg: #f1f3f4;
    --who-selected-bg: #e1e7fd;
}

/* Basic styles for the branch listing */
.branch-listing {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    background-color: #f5f5f5;
    color: var(--who-text-primary);
    min-height: 100vh;
}

.branch-listing-header {
    text-align: center;
    margin-bottom: 2rem;
}

.branch-listing-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.sgex-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

.subtitle {
    font-size: 1.2rem;
    color: #666;
    margin: 0 0 1rem 0;
    font-style: italic;
}

.loading {
    text-align: center;
    padding: 3rem;
    color: #6a737d;
    font-size: 1.2rem;
}

.error {
    text-align: center;
    padding: 3rem;
    color: #d73a49;
}

.prominent-info {
    background: var(--who-secondary-bg);
    border: 2px solid var(--who-blue);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: center;
}

.info-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--who-text-primary);
    margin: 0;
}

/* Main action buttons */
.main-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.contribute-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1rem;
}

.contribute-btn.primary {
    background: #28a745;
    color: white;
}

.contribute-btn.primary:hover {
    background: #218838;
    color: white;
    text-decoration: none;
}

.contribute-btn.secondary {
    background: #0366d6;
    color: white;
}

.contribute-btn.secondary:hover {
    background: #0256cc;
    color: white;
    text-decoration: none;
}

.contribute-btn.tertiary {
    background: #6f42c1;
    color: white;
}

.contribute-btn.tertiary:hover {
    background: #5a32a3;
    color: white;
    text-decoration: none;
}

/* Preview tabs */
.preview-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--who-border-color);
}

.tab-button {
    background: none;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--who-text-secondary);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
}

.tab-button:hover {
    color: var(--who-blue);
}

.tab-button.active {
    color: var(--who-blue);
    border-bottom-color: var(--who-blue);
}

/* Controls */
.pr-controls {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.pr-filter-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.pr-filter-section label {
    font-weight: 500;
    color: var(--who-text-primary);
}

.filter-select, .sort-select {
    padding: 0.5rem;
    border: 1px solid var(--who-border-color);
    border-radius: 6px;
    background: var(--who-card-bg);
    color: var(--who-text-primary);
    cursor: pointer;
}

.pr-search {
    width: 100%;
    max-width: 500px;
    padding: 0.75rem 1rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    background: #ffffff;
}

.pr-search:focus, .filter-select:focus, .sort-select:focus {
    outline: none;
    border-color: var(--who-blue);
    box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

/* Cards */
.pr-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.preview-card {
    border: 1px solid var(--who-border-color);
    border-radius: 12px;
    padding: 1.5rem;
    background: var(--who-card-bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.preview-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-color: var(--who-blue);
}

.pr-card {
    border-left: 4px solid #0366d6;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
}

.item-name {
    margin: 0;
    font-size: 1.2rem;
    color: var(--who-blue);
    font-weight: 600;
    word-break: break-word;
    flex: 1;
    line-height: 1.4;
}

.card-badges {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
    flex-shrink: 0;
}

.state-badge {
    background: var(--who-hover-bg);
    color: var(--who-text-secondary);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    flex-shrink: 0;
    white-space: nowrap;
}

.state-badge.open {
    background: #dcfce7;
    color: #166534;
}

.state-badge.closed {
    background: #fee2e2;
    color: #991b1b;
}

.card-body {
    margin-bottom: 1rem;
}

.pr-meta, .item-date {
    color: var(--who-text-secondary);
    font-size: 0.9rem;
    margin: 0 0 1rem 0;
}

.pr-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.preview-link, .pr-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: background-color 0.2s ease;
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
}

.preview-link {
    background: #0366d6;
}

.preview-link:hover {
    background: #0256cc;
    text-decoration: none;
    color: white;
}

.pr-link {
    background: #6f42c1;
}

.pr-link:hover {
    background: #5a32a3;
}

.card-footer {
    border-top: 1px solid #e1e5e9;
    padding-top: 1rem;
    margin-top: 1rem;
}

.preview-path {
    color: #6a737d;
    font-size: 0.8rem;
    word-break: break-all;
}

.no-items {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #6a737d;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.pagination-btn {
    background: var(--who-hover-bg);
    border: 1px solid var(--who-border-color);
    color: var(--who-blue);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
    background: var(--who-selected-bg);
    border-color: var(--who-blue);
}

.pagination-btn:disabled {
    color: var(--who-text-muted);
    cursor: not-allowed;
    opacity: 0.6;
}

.pagination-info {
    color: var(--who-text-secondary);
    font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
    .branch-listing {
        padding: 1rem;
    }
    
    .pr-cards {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .branch-listing-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .preview-card {
        padding: 1rem;
    }
    
    .card-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }

    .card-badges {
        flex-direction: row;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .main-actions {
        flex-direction: column;
        align-items: center;
    }

    .contribute-btn {
        width: 100%;
        max-width: 300px;
        justify-content: center;
    }

    .preview-tabs {
        flex-direction: column;
    }

    .tab-button {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e1e5e9;
        border-radius: 0;
    }

    .tab-button.active {
        border-bottom-color: #0366d6;
        background: #f8f9fa;
    }

    .pr-actions {
        justify-content: center;
    }

    .pr-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .pr-filter-section {
        justify-content: center;
    }

    .pagination {
        flex-direction: column;
        gap: 0.5rem;
    }
}
EOF

    echo "✅ BranchDeploymentSelector CSS created"
}

# Function to update App.js to use BranchDeploymentSelector
update_app_js() {
    echo "⚛️ Updating App.js to use BranchDeploymentSelector..."
    
    cat > src/App.js << 'EOF'
import React from 'react';
import BranchDeploymentSelector from './components/BranchDeploymentSelector';
import './App.css';

function App() {
  return (
    <div className="App">
      <BranchDeploymentSelector />
    </div>
  );
}

export default App;
EOF

    echo "✅ App.js updated"
}

# Function to update package.json for landing page deployment
update_package_json() {
    echo "📦 Updating package.json for landing page deployment..."
    
    # Update homepage to root since this will be the landing page
    if command -v jq > /dev/null; then
        jq '.homepage = "/"' package.json > package.json.tmp && mv package.json.tmp package.json
        echo "✅ Updated homepage in package.json to root"
    else
        echo "⚠️ jq not found, skipping package.json homepage update"
        echo "   Please manually set 'homepage': '/' in package.json"
    fi
}

# Function to clean up deploy branch artifacts
cleanup_deploy_branch() {
    echo "🧹 Cleaning up deploy branch artifacts..."
    
    # Remove standalone index.html (the old branch-listing file)
    if [[ -f "index.html" ]]; then
        echo "🗑️ Removing standalone index.html..."
        rm -f index.html
    fi
    
    # Remove other build artifacts that shouldn't be in source
    echo "🗑️ Removing build artifacts from deploy branch root..."
    rm -f asset-manifest.json
    rm -f service-worker.js
    rm -f robots.txt
    
    # Remove static directory if it exists at root
    if [[ -d "static" ]]; then
        echo "🗑️ Removing root static directory..."
        rm -rf static
    fi
    
    echo "✅ Deploy branch cleanup completed"
}

# Function to test the React build
test_build() {
    echo "🔧 Testing React build..."
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Run build
    echo "🏗️ Building React app..."
    npm run build
    
    if [[ -f "build/index.html" ]]; then
        echo "✅ React build successful!"
        echo "📁 Build output contains:"
        ls -la build/ | head -10
        
        # Clean up build directory (we don't want to commit it)
        rm -rf build
        echo "🧹 Cleaned up build directory"
    else
        echo "❌ React build failed!"
        exit 1
    fi
}

# Function to commit changes
commit_changes() {
    echo "💾 Committing changes to deploy branch..."
    
    git add -A
    
    if git diff --cached --quiet; then
        echo "ℹ️ No changes to commit"
    else
        git commit -m "🚀 Restructure deploy branch for React-based branch listing

- Convert standalone branch-listing.html to React component
- Create BranchDeploymentSelector component with branch listing functionality  
- Update App.js to use BranchDeploymentSelector as main landing page
- Clean up build artifacts and standalone files from deploy branch root
- Set up proper React build workflow for landing page deployment

This creates a clean deploy branch that builds a React app with the branch-listing 
functionality as the main landing page, replacing the previous standalone HTML approach."
        
        echo "✅ Changes committed to deploy branch"
    fi
}

# Function to return to original branch
return_to_original_branch() {
    local original_branch="$1"
    echo "🔄 Returning to original branch: $original_branch"
    git checkout "$original_branch"
}

# Main execution
main() {
    echo "🚀 SGEX Deploy Branch Setup for React-based Branch Listing"
    echo "=========================================================="
    
    # Validate environment
    validate_git_repo
    
    # Store original branch
    local original_branch=$(get_current_branch)
    echo "📋 Original branch: $original_branch"
    
    # Setup deploy branch
    backup_deploy_content
    
    # Create React components and update structure
    create_branch_selector_component
    create_branch_selector_css
    update_app_js
    update_package_json
    
    # Clean up deploy branch
    cleanup_deploy_branch
    
    # Test the build
    test_build
    
    # Commit changes
    commit_changes
    
    # Return to original branch
    return_to_original_branch "$original_branch"
    
    echo ""
    echo "🎉 Deploy branch setup completed successfully!"
    echo ""
    echo "📋 Summary of changes made:"
    echo "  ✅ Created BranchDeploymentSelector React component with branch listing functionality"
    echo "  ✅ Updated App.js to use BranchDeploymentSelector as main landing page"
    echo "  ✅ Cleaned up standalone index.html and build artifacts from deploy branch root"
    echo "  ✅ Set up proper React build structure for landing page deployment"
    echo ""
    echo "🔄 Next steps:"
    echo "  1. Push the deploy branch: git push origin deploy"
    echo "  2. The updated workflow will now build the React app and deploy the build output"
    echo "  3. The landing page will be generated from the React build, not standalone HTML files"
    echo ""
    echo "🌐 The deploy branch now contains a proper React app structure that builds to a"
    echo "   landing page with branch-listing functionality, ready for deployment via the workflow."
}

# Run main function
main "$@"