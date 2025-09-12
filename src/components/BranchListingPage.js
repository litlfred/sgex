import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from './framework';
import PATLogin from './PATLogin';
import githubService from '../services/githubService';
import useThemeImage from '../hooks/useThemeImage';
import { ALT_TEXT_KEYS, getAltText, getAvatarAltText } from '../utils/imageAltTextHelper';

const BranchListingPage = () => {
    const { t } = useTranslation();
    // Track authentication status for dependency arrays
    const isAuthenticatedForDeps = githubService.isAuth();
    
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
            setIsAuthenticated(true);
        }
    };


    // Logout function
    const handleLogout = () => {
        setIsAuthenticated(false);
        githubService.logout(); // Use secure logout method
        setPrComments({});
    };


    // Function to fetch PR comments summary
    const fetchPRCommentsSummary = async (prNumber) => {
        try {
            // Use githubService if authenticated, otherwise make a public API call
            if (githubService.isAuth()) {
                const comments = await githubService.getPullRequestIssueComments('litlfred', 'sgex', prNumber);
                
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
            } else {
                // For unauthenticated requests, use githubService which handles rate limiting gracefully
                try {
                    const comments = await githubService.getPullRequestIssueComments('litlfred', 'sgex', prNumber);
                    
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
                    console.warn(`Failed to fetch comments for PR ${prNumber}: ${error.message}`);
                    return { count: 0, lastComment: null, error: true };
                }
            }
        } catch (error) {
            console.warn(`Error fetching comment summary for PR ${prNumber}:`, error);
            return { count: 0, lastComment: null, error: true };
        }
    };

    // Function to fetch all PR comments (for expanded view)
    const fetchAllPRComments = async (prNumber) => {
        try {
            // Use githubService if authenticated, otherwise make a public API call
            if (githubService.isAuth()) {
                const comments = await githubService.getPullRequestIssueComments('litlfred', 'sgex', prNumber);
                return comments
                    .map(comment => ({
                        id: comment.id,
                        author: comment.user.login,
                        body: comment.body,
                        created_at: new Date(comment.created_at).toLocaleDateString(),
                        created_at_raw: new Date(comment.created_at),
                        avatar_url: comment.user.avatar_url
                    }))
                    .sort((a, b) => b.created_at_raw - a.created_at_raw); // Sort newest first
            } else {
                // For unauthenticated requests, use githubService which handles rate limiting gracefully
                try {
                    const comments = await githubService.getPullRequestIssueComments('litlfred', 'sgex', prNumber);
                    return comments
                        .map(comment => ({
                            id: comment.id,
                            author: comment.user.login,
                            body: comment.body,
                            created_at: new Date(comment.created_at).toLocaleDateString(),
                            created_at_raw: new Date(comment.created_at),
                            avatar_url: comment.user.avatar_url
                        }))
                        .sort((a, b) => b.created_at_raw - a.created_at_raw); // Sort newest first
                } catch (error) {
                    console.warn(`Failed to fetch comments for PR ${prNumber}: ${error.message}`);
                    return [];
                }
            }
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
    }, [isAuthenticatedForDeps]);

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
        if (!githubService.isAuth() || !commentText.trim()) return false;
        
        setSubmittingComments(prev => ({ ...prev, [prNumber]: true }));
        
        try {
            await githubService.createPullRequestComment('litlfred', 'sgex', prNumber, commentText);
            
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
            // Use githubService if authenticated, otherwise make a public API call
            if (githubService.isAuth()) {
                try {
                    const workflowRuns = await githubService.getWorkflowRuns('litlfred', 'sgex', {
                        branch: safeBranchName,
                        workflow_id: 'deploy.yml',
                        per_page: 1
                    });
                    
                    if (workflowRuns.workflow_runs && workflowRuns.workflow_runs.length > 0) {
                        const latestRun = workflowRuns.workflow_runs[0];
                        return {
                            status: latestRun.status,
                            conclusion: latestRun.conclusion,
                            html_url: latestRun.html_url,
                            created_at: latestRun.created_at
                        };
                    }
                    
                    return { status: 'unknown', conclusion: null };
                } catch (authError) {
                    console.warn(`Authenticated workflow check failed for ${safeBranchName}:`, authError);
                    return { status: 'unknown', conclusion: null };
                }
            } else {
                // For unauthenticated requests, use githubService which handles rate limiting gracefully
                try {
                    const workflowRuns = await githubService.getWorkflowRuns('litlfred', 'sgex', {
                        branch: safeBranchName,
                        workflow_id: 'deploy.yml',
                        per_page: 1
                    });
                    
                    if (workflowRuns.workflow_runs && workflowRuns.workflow_runs.length > 0) {
                        const latestRun = workflowRuns.workflow_runs[0];
                        return {
                            status: latestRun.status,
                            conclusion: latestRun.conclusion,
                            html_url: latestRun.html_url,
                            created_at: latestRun.created_at
                        };
                    }
                    
                    return { status: 'unknown', conclusion: null };
                } catch (error) {
                    console.warn(`Failed to fetch deployment status for ${safeBranchName}: ${error.message}`);
                    // Rate limited - return unknown status instead of error
                    return { status: 'unknown', conclusion: null };
                }
            }
        } catch (error) {
            console.warn(`Error checking deployment status for ${safeBranchName}:`, error);
            return { status: 'unknown', conclusion: null };
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
    }, [isAuthenticatedForDeps]);

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
                setIsAuthenticated(true);
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
                
                // Use githubService instead of direct fetch to handle authentication properly
                const prData = await githubService.getPullRequests(owner, repo, {
                    state: prState,
                    sort: 'updated', 
                    per_page: 100
                });
                
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
                if (err.message.includes('Failed to fetch') || err.message.includes('rate limit')) {
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
                    // Keep the error for display but don't block functionality
                    if (err.message.includes('Failed to fetch')) {
                        setError('API rate limit exceeded for 136.47.145.179. (But here\'s the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.) - https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting');
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [prFilter, isAuthenticatedForDeps, loadDiscussionSummaries]);

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

    return (
        <PageLayout pageName="branch-listing" showBreadcrumbs={false}>
            <div className="branch-listing-content">
                {loading ? (
                    <>
                        <div className="branch-listing-header">
                            <h1><img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.ICON_SGEX, 'SGEX Icon')} className="sgex-icon" /> SGEX</h1>
                            <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                            <div className="loading">Loading previews...</div>
                            
                            <div className="prominent-info">
                                <p className="info-text">
                                    🐾 While previews load, you can access the main SGEX workbench and login below.
                                </p>
                            </div>
                        </div>

                        <div className="action-cards">
                            <div className="action-card main-site-card">
                                <a 
                                    href="/sgex/main/"
                                    className="card-link"
                                >
                                    <div className="card-content">
                                        <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Mascot')} className="card-icon" />
                                        <div className="card-text">
                                            <h3>View Main Site</h3>
                                            <p>Access the main SGEX workbench</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            
                            {!isAuthenticated ? (
                                <div className="action-card login-card">
                                    <div className="card-content">
                                        <div className="login-icon">🔐</div>
                                        <div className="card-text">
                                            <h3>GitHub Login</h3>
                                            <p>Login to get higher API rate limits and view comments</p>
                                            <PATLogin onAuthSuccess={handleAuthSuccess} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="action-card logout-card">
                                    <div className="card-content">
                                        <div className="login-icon">✅</div>
                                        <div className="card-text">
                                            <h3>Logged In</h3>
                                            <p>You can now view and add comments</p>
                                            <button onClick={handleLogout} className="logout-btn">
                                                🚪 Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : error && pullRequests.length === 0 ? (
                    <>
                        <header className="branch-listing-header">
                            <h1><img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.ICON_SGEX, 'SGEX Icon')} className="sgex-icon" /> SGEX</h1>
                            <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                            
                            <div className="error-banner">
                                <div className="error-content">
                                    <span className="error-icon">⚠️</span>
                                    <div className="error-text">
                                        <p><strong>Failed to load previews:</strong> {error}</p>
                                        <p className="error-help">
                                            GitHub API rate limit exceeded. 
                                            {!isAuthenticated && ' Try logging in with a Personal Access Token for higher rate limits, or'}
                                            {' '}try refreshing the page in a few minutes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="prominent-info">
                                <p className="info-text">
                                    🐾 You can still access the main SGEX workbench and login below.
                                </p>
                            </div>
                        </header>

                        <div className="action-cards">
                            <div className="action-card main-site-card">
                                <a 
                                    href="/sgex/main/"
                                    className="card-link"
                                >
                                    <div className="card-content">
                                        <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Mascot')} className="card-icon" />
                                        <div className="card-text">
                                            <h3>View Main Site</h3>
                                            <p>Access the main SGEX workbench</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            
                            {!isAuthenticated ? (
                                <div className="action-card login-card">
                                    <div className="card-content">
                                        <div className="login-icon">🔐</div>
                                        <div className="card-text">
                                            <h3>GitHub Login</h3>
                                            <p>Login to get higher API rate limits and view comments</p>
                                            <PATLogin onAuthSuccess={handleAuthSuccess} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="action-card logout-card">
                                    <div className="card-content">
                                        <div className="login-icon">✅</div>
                                        <div className="card-text">
                                            <h3>Logged In</h3>
                                            <p>You can now view and add comments</p>
                                            <button onClick={handleLogout} className="logout-btn">
                                                🚪 Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <header className="branch-listing-header">
                    <h1><img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.ICON_SGEX, 'SGEX Icon')} className="sgex-icon" /> SGEX</h1>
                    <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
                    
                    {error && (
                        <div className="error-banner">
                            <div className="error-content">
                                <span className="error-icon">⚠️</span>
                                <div className="error-text">
                                    <p><strong>Failed to load previews:</strong> {error}</p>
                                    <p className="error-help">
                                        GitHub API rate limit exceeded. 
                                        {!isAuthenticated && ' Try logging in with a Personal Access Token for higher rate limits, or'}
                                        {' '}try refreshing the page in a few minutes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
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
                            href="/sgex/main/"
                            className="card-link"
                        >
                            <div className="card-content">
                                <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Mascot')} className="card-icon" />
                                <div className="card-text">
                                    <h3>View Main Site</h3>
                                    <p>Access the main SGEX workbench</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    
                    {!isAuthenticated ? (
                        <div className="action-card login-card">
                            <div className="card-content">
                                <div className="login-icon">🔐</div>
                                <div className="card-text">
                                    <h3>GitHub Login</h3>
                                    <p>Login to view and add comments{error ? ' and get higher API rate limits' : ''}</p>
                                    <PATLogin onAuthSuccess={handleAuthSuccess} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="action-card logout-card">
                            <div className="card-content">
                                <div className="login-icon">✅</div>
                                <div className="card-text">
                                    <h3>Logged In</h3>
                                    <p>You can now view and add comments</p>
                                    <button onClick={handleLogout} className="logout-btn">
                                        🚪 Logout
                                    </button>
                                </div>
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
                                                {githubService.isAuth() && (
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
                                                            {prComments[pr.number].slice(0, 5).map((comment) => (
                                                                <div key={comment.id} className="comment-item">
                                                                    <div className="comment-header">
                                                                        <img 
                                                                            src={comment.avatar_url} 
                                                                            alt={getAvatarAltText(t, { name: comment.author }, 'user')} 
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
                                                            {!githubService.isAuth() ? 
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
                    </>
                )}
            </div>
        </PageLayout>
    );
};

export default BranchListingPage;
