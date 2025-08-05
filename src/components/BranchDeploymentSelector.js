import React, { useState, useEffect, useCallback } from 'react';
import useThemeImage from '../hooks/useThemeImage';
import './BranchDeploymentSelector.css';

// Simple PAT Login Component for deployment selector
const SimplePATLogin = ({ onAuthSuccess }) => {
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token.trim() || !username.trim()) {
            setError('Please provide both token and username');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Test the token
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid token or insufficient permissions');
            }

            // Create a mock Octokit instance for compatibility
            const mockOctokit = { auth: token };
            onAuthSuccess(token, mockOctokit);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pat-login-container">
            <form onSubmit={handleSubmit} className="pat-form">
                <div className="pat-input-group">
                    <label htmlFor="username">Token Description/Username:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g., my-sgex-token or username"
                        className="pat-input"
                        required
                    />
                </div>
                <div className="pat-input-group">
                    <label htmlFor="token">GitHub Personal Access Token:</label>
                    <input
                        id="token"
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="ghp_..."
                        className="pat-input"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !token.trim() || !username.trim()}
                    className="pat-login-btn"
                >
                    {loading ? 'Authenticating...' : 'Login'}
                </button>
                {error && <div className="pat-error">{error}</div>}
            </form>
        </div>
    );
};

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
    const [commentInputs, setCommentInputs] = useState({});
    const [submittingComments, setSubmittingComments] = useState({});
    const [expandedDiscussions, setExpandedDiscussions] = useState({});
    const [discussionSummaries, setDiscussionSummaries] = useState({});
    const [loadingSummaries, setLoadingSummaries] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // Theme-aware image paths
    const mascotImage = useThemeImage('sgex-mascot.png');

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
    const fetchPRCommentsSummary = useCallback(async (prNumber) => {
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
    }, [githubToken]);

    // Function to fetch all PR comments (for expanded view)
    const fetchAllPRComments = useCallback(async (prNumber) => {
        if (!githubToken) return [];
        
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
            return comments.map(comment => ({
                id: comment.id,
                author: comment.user.login,
                body: comment.body,
                created_at: new Date(comment.created_at).toLocaleDateString(),
                avatar_url: comment.user.avatar_url
            }));
        } catch (error) {
            console.error(`Error fetching all comments for PR ${prNumber}:`, error);
            return [];
        }
    }, [githubToken]);

    // Function to load discussion summaries for visible PRs
    const loadDiscussionSummaries = useCallback(async (prs) => {
        if (!githubToken || prs.length === 0) return;
        
        setLoadingSummaries(true);
        const summaries = {};
        
        for (const pr of prs) {
            summaries[pr.number] = await fetchPRCommentsSummary(pr.number);
        }
        
        setDiscussionSummaries(summaries);
        setLoadingSummaries(false);
    }, [githubToken, fetchPRCommentsSummary]);

    // Function to submit a comment
    const submitComment = useCallback(async (prNumber, commentText) => {
        if (!githubToken || !commentText.trim()) return false;
        
        setSubmittingComments(prev => ({ ...prev, [prNumber]: true }));
        
        try {
            const response = await fetch(
                `https://api.github.com/repos/litlfred/sgex/issues/${prNumber}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        body: commentText
                    })
                }
            );
            
            if (!response.ok) {
                throw new Error(`Failed to submit comment: ${response.status}`);
            }
            
            setCommentInputs(prev => ({ ...prev, [prNumber]: '' }));
            
            // Refresh both full comments (if expanded) and summary
            if (expandedDiscussions[prNumber]) {
                const updatedComments = await fetchAllPRComments(prNumber);
                setPrComments(prev => ({ ...prev, [prNumber]: updatedComments }));
            }
            
            // Refresh the discussion summary
            const updatedSummary = await fetchPRCommentsSummary(prNumber);
            setDiscussionSummaries(prev => ({ ...prev, [prNumber]: updatedSummary }));
            
            return true;
        } catch (error) {
            console.error(`Error submitting comment for PR ${prNumber}:`, error);
            return false;
        } finally {
            setSubmittingComments(prev => ({ ...prev, [prNumber]: false }));
        }
    }, [githubToken, expandedDiscussions, fetchAllPRComments, fetchPRCommentsSummary]);

    // Function to toggle discussion expansion
    const toggleDiscussion = useCallback(async (prNumber) => {
        const isExpanded = expandedDiscussions[prNumber];
        
        if (!isExpanded) {
            // Load all comments when expanding
            const comments = await fetchAllPRComments(prNumber);
            setPrComments(prev => ({ ...prev, [prNumber]: comments }));
        }
        
        setExpandedDiscussions(prev => ({
            ...prev,
            [prNumber]: !isExpanded
        }));
    }, [expandedDiscussions, fetchAllPRComments]);

    // Function to get discussion summary text
    const getDiscussionSummaryText = (prNumber) => {
        const summary = discussionSummaries[prNumber];
        
        if (loadingSummaries) {
            return "Loading discussion...";
        }
        
        if (!summary || summary.count === 0) {
            return "No comments yet";
        }
        
        const { count, lastComment } = summary;
        const timeAgo = lastComment ? getTimeAgo(lastComment.created_at) : '';
        
        return `${count} comment${count > 1 ? 's' : ''}, last by ${lastComment.author} ${timeAgo}`;
    };

    // Helper function to get relative time
    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    };

    // Function to check deployment status for a branch
    const checkDeploymentStatus = useCallback(async (safeBranchName) => {
        try {
            const response = await fetch(
                `https://api.github.com/repos/litlfred/sgex/actions/workflows/deploy.yml/runs?branch=${safeBranchName}&per_page=1`,
                {
                    headers: githubToken ? {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    } : {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch deployment status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.workflow_runs && data.workflow_runs.length > 0) {
                const latestRun = data.workflow_runs[0];
                return {
                    status: latestRun.status,
                    conclusion: latestRun.conclusion,
                    html_url: latestRun.html_url,
                    created_at: latestRun.created_at
                };
            }
            
            return { status: 'unknown', conclusion: null };
        } catch (error) {
            console.error(`Error checking deployment status for ${safeBranchName}:`, error);
            return { status: 'error', conclusion: 'error' };
        }
    }, [githubToken]);

    // Function to update deployment statuses for visible PRs
    const updateDeploymentStatuses = useCallback(async (prs) => {
        if (prs.length === 0) return;
        
        const statuses = {};
        for (const pr of prs) {
            statuses[pr.safeBranchName] = await checkDeploymentStatus(pr.safeBranchName);
        }
        
        setDeploymentStatuses(prev => ({ ...prev, ...statuses }));
    }, [checkDeploymentStatus]);

    // Function to get deployment status display info
    const getDeploymentStatusInfo = (safeBranchName) => {
        const status = deploymentStatuses[safeBranchName];
        if (!status) return { text: 'Checking...', class: 'unknown' };
        
        if (status.status === 'completed' && status.conclusion === 'success') {
            return { text: '✅ Deployed', class: 'success' };
        } else if (status.status === 'completed' && status.conclusion === 'failure') {
            return { text: '❌ Failed', class: 'failed' };
        } else if (status.status === 'in_progress') {
            return { text: '🔄 Deploying', class: 'in-progress' };
        } else if (status.status === 'queued') {
            return { text: '⏳ Queued', class: 'queued' };
        } else if (status.status === 'error') {
            return { text: '⚠️ Error', class: 'error' };
        } else {
            return { text: '❓ Unknown', class: 'unknown' };
        }
    };

    // Sorting functions
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
            
            // Reverse comparison for ascending order
            return sortOrder === 'asc' ? -comparison : comparison;
        });
    };

    // Check for existing authentication on component mount
    useEffect(() => {
        const token = sessionStorage.getItem('github_token');
        if (token) {
            setGithubToken(token);
            setIsAuthenticated(true);
        }
    }, []);

    // Fetch data
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
                
                if (githubToken) {
                    await loadDiscussionSummaries(formattedPRs.slice(0, ITEMS_PER_PAGE));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                
                // Fallback mock data
                if (err.message.includes('Failed to fetch')) {
                    console.log('Using fallback mock data...');
                    const mockPRs = [
                        {
                            id: 1,
                            number: 460,
                            title: 'Improve multi-page selector landing page for GitHub deployment',
                            state: 'open',
                            author: 'copilot',
                            branchName: 'copilot/fix-459',
                            safeBranchName: 'copilot-fix-459',
                            url: './sgex/copilot-fix-459/index.html',
                            prUrl: 'https://github.com/litlfred/sgex/pull/460',
                            updatedAt: new Date().toLocaleDateString(),
                            createdAt: new Date(Date.now() - 86400000).toLocaleDateString()
                        },
                        {
                            id: 2,
                            number: 459,
                            title: 'Add enhanced PR preview functionality',
                            state: 'open',
                            author: 'developer',
                            branchName: 'feature/pr-preview',
                            safeBranchName: 'feature-pr-preview',
                            url: './sgex/feature-pr-preview/index.html',
                            prUrl: 'https://github.com/litlfred/sgex/pull/459',
                            updatedAt: new Date(Date.now() - 172800000).toLocaleDateString(),
                            createdAt: new Date(Date.now() - 345600000).toLocaleDateString()
                        }
                    ];
                    setPullRequests(mockPRs);
                    setError(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [prFilter, githubToken, loadDiscussionSummaries]);

    // Poll deployment statuses every 7 seconds for visible PRs
    useEffect(() => {
        if (pullRequests.length === 0) return;
        
        const filtered = pullRequests.filter(pr => 
            pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
            pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
        );
        const sorted = sortPRs(filtered, prSortBy, prSortOrder);
        const paginated = sorted.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
        
        // Initial status check
        updateDeploymentStatuses(paginated);
        
        // Set up polling every 7 seconds
        const interval = setInterval(() => {
            updateDeploymentStatuses(paginated);
        }, 7000);
        
        return () => clearInterval(interval);
    }, [pullRequests, prSearchTerm, prSortBy, prSortOrder, prPage, updateDeploymentStatuses]);

    // Load comments when pagination changes
    useEffect(() => {
        if (isAuthenticated && pullRequests.length > 0) {
            const filtered = pullRequests.filter(pr => 
                pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
                pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
            );
            const sorted = sortPRs(filtered, prSortBy, prSortOrder);
            const paginated = sorted.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
            loadDiscussionSummaries(paginated);
        }
    }, [prPage, prSearchTerm, prSortBy, prSortOrder, pullRequests, isAuthenticated, loadDiscussionSummaries]);

    // Filter and sort PRs
    const filteredPRs = pullRequests.filter(pr => 
        pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
        pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
    );
    const sortedPRs = sortPRs(filteredPRs, prSortBy, prSortOrder);
    const paginatedPRs = sortedPRs.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
    const totalPRPages = Math.ceil(sortedPRs.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="branch-listing">
                <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                <div className="loading">Loading previews...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="branch-listing">
                <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
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
                <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                
                <div className="prominent-info">
                    <p className="info-text">
                        🐾 This landing page lists all available previews. 
                        Each branch and PR is automatically deployed to its own preview environment.
                    </p>
                </div>
                
                <div className="auth-section">
                    {!isAuthenticated ? (
                        <div className="login-section">
                            <h3>🔐 GitHub Authentication</h3>
                            <p>Login with your GitHub Personal Access Token to view and add comments to pull requests:</p>
                            <SimplePATLogin onAuthSuccess={handleAuthSuccess} />
                        </div>
                    ) : (
                        <div className="authenticated-section">
                            <p>✅ Authenticated - You can now view and add comments to pull requests</p>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    )}
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
                    <select
                        value={prSortOrder}
                        onChange={(e) => {
                            setPrSortOrder(e.target.value);
                            setPrPage(1);
                        }}
                        className="sort-select"
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
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
                                        <span className={`deployment-status ${getDeploymentStatusInfo(pr.safeBranchName).class}`}>
                                            {getDeploymentStatusInfo(pr.safeBranchName).text}
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
                                    
                                    {isAuthenticated && (
                                        <div>
                                            {/* Discussion Summary Status Bar */}
                                            <div 
                                                className="discussion-summary-bar"
                                                onClick={() => toggleDiscussion(pr.number)}
                                            >
                                                <div className="discussion-summary-text">
                                                    <span className="discussion-summary-icon">💬</span>
                                                    {getDiscussionSummaryText(pr.number)}
                                                </div>
                                                <span className={`discussion-expand-icon ${expandedDiscussions[pr.number] ? 'expanded' : ''}`}>
                                                    ▶
                                                </span>
                                            </div>

                                            {/* Expanded Discussion Section */}
                                            {expandedDiscussions[pr.number] && (
                                                <div className="discussion-expanded-section">
                                                    <div className="discussion-header">
                                                        <h4 className="discussion-title">Discussion</h4>
                                                        <div className="discussion-actions">
                                                            <a 
                                                                href={`https://github.com/litlfred/sgex/pull/${pr.number}/files`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="discussion-action-btn"
                                                            >
                                                                📁 View Files
                                                            </a>
                                                            <a 
                                                                href={pr.prUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="discussion-action-btn secondary"
                                                            >
                                                                🔗 Full Discussion
                                                            </a>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Comment Input at Top */}
                                                    <div className="comment-input-section">
                                                        <textarea
                                                            value={commentInputs[pr.number] || ''}
                                                            onChange={(e) => setCommentInputs(prev => ({
                                                                ...prev,
                                                                [pr.number]: e.target.value
                                                            }))}
                                                            placeholder="Add a comment..."
                                                            className="comment-input"
                                                            rows={3}
                                                        />
                                                        <button
                                                            onClick={() => submitComment(pr.number, commentInputs[pr.number])}
                                                            disabled={!commentInputs[pr.number]?.trim() || submittingComments[pr.number]}
                                                            className="submit-comment-btn"
                                                        >
                                                            {submittingComments[pr.number] ? 'Submitting...' : 'Add Comment'}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Scrollable Comments Area */}
                                                    <div className="discussion-scroll-area">
                                                        {prComments[pr.number] && prComments[pr.number].length > 0 ? (
                                                            <div className="comments-list">
                                                                {prComments[pr.number].map((comment) => (
                                                                    <div key={comment.id} className="comment-item">
                                                                        <div className="comment-header">
                                                                            <img 
                                                                                src={comment.avatar_url} 
                                                                                alt={comment.author} 
                                                                                className="comment-avatar"
                                                                            />
                                                                            <span className="comment-author">{comment.author}</span>
                                                                            <span className="comment-date">{comment.created_at}</span>
                                                                        </div>
                                                                        <div className="comment-body">{comment.body}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="no-comments">No comments yet. Be the first to comment!</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
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