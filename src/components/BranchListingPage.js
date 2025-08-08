import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from './framework';
import PATLogin from './PATLogin';
import githubService from '../services/githubService';
import secureTokenStorage from '../services/secureTokenStorage';
import useThemeImage from '../hooks/useThemeImage';
import './BranchListingPage.css';

const BranchListingPage = () => {
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
    const [loadingComments] = useState(false); // Removed setLoadingComments as it's not used
    const [commentInputs, setCommentInputs] = useState({});
    const [submittingComments, setSubmittingComments] = useState({});
    const [expandedDiscussions, setExpandedDiscussions] = useState({});
    const [discussionSummaries, setDiscussionSummaries] = useState({});
    const [loadingSummaries, setLoadingSummaries] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // Theme-aware image paths
    const mascotImage = useThemeImage('sgex-mascot.png');

    // GitHub authentication functions
    const handleAuthSuccess = (token) => {
        // Authenticate using githubService which will handle secure storage
        const success = githubService.authenticate(token);
        if (success) {
            setGithubToken(token);
            setIsAuthenticated(true);
        }
    };


    const handleLogout = () => {
        setGithubToken(null);
        setIsAuthenticated(false);
        githubService.logout(); // Use secure logout method
        setPrComments({});
    };


    // Function to fetch PR comments summary
    const fetchPRCommentsSummary = async (prNumber) => {
        try {
            const headers = {
                'Accept': 'application/vnd.github.v3+json'
            };
            
            // Add auth header if available for better rate limits
            if (githubToken) {
                headers['Authorization'] = `token ${githubToken}`;
            }
            
            const response = await fetch(
                `https://api.github.com/repos/litlfred/sgex/issues/${prNumber}/comments`,
                { headers }
            );
            
            if (!response.ok) {
                console.warn(`Failed to fetch comments for PR ${prNumber}: ${response.status}`);
                return { count: 0, lastComment: null, error: true };
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
            console.warn(`Error fetching comment summary for PR ${prNumber}:`, error);
            return { count: 0, lastComment: null, error: true };
        }
    };

    // Function to fetch all PR comments (for expanded view)
    const fetchAllPRComments = async (prNumber) => {
        try {
            const headers = {
                'Accept': 'application/vnd.github.v3+json'
            };
            
            // Add auth header if available for better rate limits
            if (githubToken) {
                headers['Authorization'] = `token ${githubToken}`;
            }
            
            const response = await fetch(
                `https://api.github.com/repos/litlfred/sgex/issues/${prNumber}/comments`,
                { headers }
            );
            
            if (!response.ok) {
                console.warn(`Failed to fetch comments for PR ${prNumber}: ${response.status}`);
                return [];
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
            console.warn(`Error fetching all comments for PR ${prNumber}:`, error);
            return [];
        }
    };

    // Function to load discussion summaries for visible PRs
    const loadDiscussionSummaries = useCallback(async (prs) => {
        if (prs.length === 0) return;
        
        setLoadingSummaries(true);
        const summaries = {};
        
        for (const pr of prs) {
            summaries[pr.number] = await fetchPRCommentsSummary(pr.number);
        }
        
        setDiscussionSummaries(summaries);
        setLoadingSummaries(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubToken]);

    // Function to toggle discussion expansion
    const toggleDiscussion = async (prNumber) => {
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
    };

    // Function to get discussion summary text
    const getDiscussionSummaryText = (prNumber) => {
        const summary = discussionSummaries[prNumber];
        
        if (loadingSummaries) {
            return "Loading discussion...";
        }
        
        if (!summary) {
            return "No comments yet";
        }
        
        if (summary.error) {
            return "Unable to load comments";
        }
        
        if (summary.count === 0) {
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

    // Function to submit a comment
    const submitComment = async (prNumber, commentText) => {
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
    };

    // Function to check deployment status for a branch
    const checkDeploymentStatus = async (safeBranchName) => {
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
    };

    // Function to update deployment statuses for visible PRs
    const updateDeploymentStatuses = useCallback(async (prs) => {
        if (prs.length === 0) return;
        
        const statuses = {};
        for (const pr of prs) {
            statuses[pr.safeBranchName] = await checkDeploymentStatus(pr.safeBranchName);
        }
        
        setDeploymentStatuses(prev => ({ ...prev, ...statuses }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubToken]);

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
        const success = githubService.initializeFromStoredToken();
        if (success) {
            const tokenInfo = githubService.getStoredTokenInfo();
            if (tokenInfo) {
                const tokenData = secureTokenStorage.retrieveToken();
                if (tokenData) {
                    setGithubToken(tokenData.token);
                    setIsAuthenticated(true);
                }
            }
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
                
                // Always try to load discussion summaries
                await loadDiscussionSummaries(formattedPRs.slice(0, ITEMS_PER_PAGE));
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
            pr.author.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
            pr.branchName.toLowerCase().includes(prSearchTerm.toLowerCase())
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
        if (pullRequests.length > 0) {
            const filtered = pullRequests.filter(pr => 
                pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
                pr.author.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
                pr.branchName.toLowerCase().includes(prSearchTerm.toLowerCase())
            );
            const sorted = sortPRs(filtered, prSortBy, prSortOrder);
            const paginated = sorted.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
            loadDiscussionSummaries(paginated);
        }
    }, [prPage, prSearchTerm, prSortBy, prSortOrder, pullRequests, loadDiscussionSummaries]);

    // Filter and sort PRs
    const filteredPRs = pullRequests.filter(pr => 
        pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
        pr.author.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
        pr.branchName.toLowerCase().includes(prSearchTerm.toLowerCase())
    );
    const sortedPRs = sortPRs(filteredPRs, prSortBy, prSortOrder);
    const paginatedPRs = sortedPRs.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
    const totalPRPages = Math.ceil(sortedPRs.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <PageLayout pageName="branch-listing-loading" showBreadcrumbs={false}>
                <div className="branch-listing-content">
                    <div className="branch-listing-header">
                        <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                        <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                        <div className="loading">Loading previews...</div>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout pageName="branch-listing-error" showBreadcrumbs={false}>
                <div className="branch-listing-content">
                    <div className="branch-listing-header">
                        <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                        <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                        <div className="error">
                            <p>Failed to load previews: {error}</p>
                            <p>Please try refreshing the page or check back later.</p>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout pageName="branch-listing" showBreadcrumbs={false}>
            <div className="branch-listing-content">
                <header className="branch-listing-header">
                    <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
                    <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                    
                    <div className="prominent-info">
                        <p className="info-text">
                            🐾 This landing page lists all available previews. 
                            Each branch and PR is automatically deployed to its own preview environment.
                        </p>
                    </div>
                </header>

                <div className="action-cards">
                    <div className="action-card main-site-card">
                        <a 
                            href="https://litlfred.github.io/sgex/main"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-link"
                        >
                            <img src={mascotImage} alt="SGEX Mascot" className="card-icon" />
                            <h3>View Main Site</h3>
                            <p>Access the main SGEX workbench</p>
                        </a>
                    </div>
                    
                    {!isAuthenticated && (
                        <div className="action-card login-card">
                            <div className="card-content">
                                <div className="login-icon">🔐</div>
                                <h3>GitHub Login</h3>
                                <p>Login to view and add comments</p>
                                <PATLogin onAuthSuccess={handleAuthSuccess} />
                            </div>
                        </div>
                    )}
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
                            placeholder="Search pull requests by title, author, or branch name..."
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
                                        
                                        {/* Discussion Summary Status Bar - Always show */}
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
                                                            🔗 View PR
                                                        </a>
                                                    </div>
                                                </div>
                                                
                                                {/* Comment Input at Top - Only for authenticated users */}
                                                {isAuthenticated && (
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
                                                )}
                                                
                                                {/* Scrollable Comments Area - Show for everyone */}
                                                <div className="discussion-scroll-area">
                                                    {loadingComments ? (
                                                        <div className="comments-loading">Loading full discussion...</div>
                                                    ) : prComments[pr.number] && prComments[pr.number].length > 0 ? (
                                                        <div className="comments-list">
                                                            {prComments[pr.number].slice(-5).map((comment) => (
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
                                                                    <div className="comment-body">
                                                                        {comment.body.length > 200 ? 
                                                                            `${comment.body.substring(0, 200)}...` : 
                                                                            comment.body
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="no-comments">
                                                            {!isAuthenticated ? 
                                                                "No comments yet. Login to add the first comment!" :
                                                                "No comments yet. Be the first to comment!"
                                                            }
                                                        </div>
                                                    )}
                                                </div>
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
        </PageLayout>
    );
};

export default BranchListingPage;