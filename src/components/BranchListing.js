import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from './framework';
import HelpModal from './HelpModal';
import PATLogin from './PATLogin';
import WorkflowStatus from './WorkflowStatus';
import githubActionsService from '../services/githubActionsService';
import githubService from '../services/githubService';
import branchListingCacheService from '../services/branchListingCacheService';
import useThemeImage from '../hooks/useThemeImage';
import repositoryConfig from '../config/repositoryConfig';
import './BranchListing.css';

const BranchListing = () => {
  const [branches, setBranches] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('prs'); // Start with PR preview section
  const [prPage, setPrPage] = useState(1);
  const [prSearchTerm, setPrSearchTerm] = useState('');
  const [branchSearchTerm, setBranchSearchTerm] = useState('');

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');
  const [prSortBy, setPrSortBy] = useState('updated'); // updated, number, alphabetical
  const [branchSortBy, setBranchSortBy] = useState('updated'); // updated, alphabetical
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [deploymentStatuses, setDeploymentStatuses] = useState({});
  const [checkingStatuses, setCheckingStatuses] = useState(false);
  const [prFilter, setPrFilter] = useState('open'); // 'open', 'closed', 'all'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [githubToken, setGithubToken] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComments, setSubmittingComments] = useState({});
  const [expandedDiscussions, setExpandedDiscussions] = useState({});
  const [discussionSummaries, setDiscussionSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [workflowStatuses, setWorkflowStatuses] = useState({});
  const [loadingWorkflowStatuses, setLoadingWorkflowStatuses] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // Function to manually refresh cache and reload data
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Clear the cache to force fresh data
    branchListingCacheService.forceRefresh(GITHUB_OWNER, GITHUB_REPO);
    
    // The fetchData function will be called by the useEffect when isRefreshing changes
  }, []);

  // GitHub authentication functions
  const handleAuthSuccess = (token, octokitInstance) => {
    // Use githubService for authentication management
    const success = githubService.authenticate(token);
    if (success) {
      setGithubToken(token);
      setIsAuthenticated(true);
      // Set token for GitHub Actions service
      githubActionsService.setToken(token);
    }
  };

  const handleLogout = () => {
    setGithubToken(null);
    setIsAuthenticated(false);
    githubService.logout(); // Use secure logout method
    // Clear token from GitHub Actions service
    githubActionsService.setToken(null);
  };

  // Function to fetch PR comments summary
  const fetchPRCommentsSummary = useCallback(async (prNumber) => {
    try {
      // Use githubService if authenticated, otherwise make a public API call
      if (githubService.isAuth()) {
        const comments = await githubService.getPullRequestIssueComments(repositoryConfig.getOwner(), repositoryConfig.getName(), prNumber);
        
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
          const comments = await githubService.getPullRequestIssueComments(repositoryConfig.getOwner(), repositoryConfig.getName(), prNumber);
          
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
      console.error(`Error fetching comment summary for PR ${prNumber}:`, error);
      return { count: 0, lastComment: null, error: true };
    }
  }, []);

  // Function to fetch all PR comments (for expanded view)
  // const fetchAllPRComments = useCallback(async (prNumber) => {
  //   // Allow fetching comments even without authentication for read-only access
    
  //   try {
  //     const headers = {
  //       'Accept': 'application/vnd.github.v3+json'
  //     };
      
  //     // Add authorization header only if token is available
  //     if (githubToken) {
  //       headers['Authorization'] = `token ${githubToken}`;
  //     }
      
  //     const response = await fetch(
  //       `https://api.github.com/repos/litlfred/sgex/issues/${prNumber}/comments`,
  //       { headers }
  //     );
      
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch comments: ${response.status}`);
  //     }
      
  //     const comments = await response.json();
  //     return comments.map(comment => ({
  //       id: comment.id,
  //       author: comment.user.login,
  //       body: comment.body,
  //       created_at: new Date(comment.created_at).toLocaleDateString(),
  //       avatar_url: comment.user.avatar_url
  //     }));
  //   } catch (error) {
  //     console.error(`Error fetching all comments for PR ${prNumber}:`, error);
  //     return [];
  //   }
  // }, [githubToken]);

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
  }, [fetchPRCommentsSummary]);

  // Function to toggle discussion expansion
  const toggleDiscussion = async (prNumber) => {
    const isExpanded = expandedDiscussions[prNumber];
    
    if (!isExpanded) {
      // Load all comments when expanding
      //const comments = await fetchAllPRComments(prNumber);
      //setPrComments(prev => ({ ...prev, [prNumber]: comments }));
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


  // Function to submit a comment
  const submitComment = async (prNumber, commentText) => {
    if (!githubService.isAuth() || !commentText.trim()) return false;
    
    setSubmittingComments(prev => ({ ...prev, [prNumber]: true }));
    
    try {
      await githubService.createPullRequestComment(repositoryConfig.getOwner(), repositoryConfig.getName(), prNumber, commentText);
      
      // Clear the comment input
      setCommentInputs(prev => ({ ...prev, [prNumber]: '' }));
      
      // Refresh both full comments (if expanded) and summary
      if (expandedDiscussions[prNumber]) {
        //const updatedComments = await fetchAllPRComments(prNumber);
        //setPrComments(prev => ({ ...prev, [prNumber]: updatedComments }));
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

  // Function to load workflow statuses for branches
  const loadWorkflowStatuses = useCallback(async (branchData, prData) => {
    if (!githubService.isAuth()) return;
    
    setLoadingWorkflowStatuses(true);
    
    try {
      // Get all branch names (from both branches and PRs)
      const branchNames = [
        ...branchData.map(branch => branch.name),
        ...prData.map(pr => pr.branchName)
      ];
      
      const uniqueBranchNames = [...new Set(branchNames)];
      const statuses = await githubActionsService.getWorkflowStatusForBranches(uniqueBranchNames);
      
      setWorkflowStatuses(statuses);
    } catch (error) {
      console.error('Error loading workflow statuses:', error);
    } finally {
      setLoadingWorkflowStatuses(false);
    }
  }, []);

  // Function to trigger workflow for a branch
  const triggerWorkflow = useCallback(async (branchName) => {
    if (!githubService.isAuth()) {
      alert('Please authenticate to trigger workflows');
      return;
    }
    
    try {
      const success = await githubActionsService.triggerWorkflow(branchName);
      if (success) {
        alert(`Workflow triggered for branch: ${branchName}`);
        // Refresh workflow statuses after a short delay
        setTimeout(() => {
          const currentBranches = branches.length > 0 ? branches : [];
          const currentPRs = pullRequests.length > 0 ? pullRequests : [];
          loadWorkflowStatuses(currentBranches, currentPRs);
        }, 2000);
      } else {
        alert(`Failed to trigger workflow for branch: ${branchName}`);
      }
    } catch (error) {
      console.error('Error triggering workflow:', error);
      alert(`Error triggering workflow: ${error.message}`);
    }
  }, [branches, pullRequests, loadWorkflowStatuses]);


  // Check for existing authentication on component mount
  useEffect(() => {
    const success = githubService.initializeFromStoredToken();
    if (success) {
      const tokenInfo = githubService.getStoredTokenInfo();
      if (tokenInfo) {
        setGithubToken(tokenInfo.token);
        setIsAuthenticated(true);
        // Set token for GitHub Actions service
        githubActionsService.setToken(tokenInfo.token);
      }
    }
  }, []);

  // Function to check deployment status
  const checkDeploymentStatus = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return 'active';
      } else if (response.status === 404) {
        return 'not-found';
      } else {
        return 'errored';
      }
    } catch (error) {
      return 'errored';
    }
  };

  // Function to check deployment statuses for all items
  const checkAllDeploymentStatuses = useCallback(async (branchData, prData) => {
    setCheckingStatuses(true);
    const statuses = {};
    
    // Check branches
    for (const branch of branchData) {
      const status = await checkDeploymentStatus(branch.url);
      statuses[`branch-${branch.name}`] = status;
    }
    
    // Check PRs
    for (const pr of prData) {
      const status = await checkDeploymentStatus(pr.url);
      statuses[`pr-${pr.id}`] = status;
    }
    
    setDeploymentStatuses(statuses);
    setCheckingStatuses(false);
  }, []);

  // Function to copy URL to clipboard
  const copyToClipboard = async (url, type, name) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      console.log(`Copied ${type} URL for ${name} to clipboard`);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log(`Copied ${type} URL for ${name} to clipboard (fallback)`);
    }
  };

  // Sorting functions
  const sortBranches = (branches, sortBy) => {
    return [...branches].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          const dateA = new Date(a.lastModified);
          const dateB = new Date(b.lastModified);
          return dateB - dateA; // Most recent first
      }
    });
  };

  const sortPRs = (prs, sortBy) => {
    return [...prs].sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return b.number - a.number; // Highest number first
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'updated':
        default:
          const dateA = new Date(a.updatedAt);
          const dateB = new Date(b.updatedAt);
          return dateB - dateA; // Most recent first
      }
    });
  };

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
              <img src="${mascotImage}" alt="SGEX Mascot" class="contribute-mascot" />
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
              <img src="${mascotImage}" alt="SGEX Mascot examining a bug" class="contribute-mascot bug-report" />
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
              <img src="${mascotImage}" alt="Robotic SGEX Mascot" class="contribute-mascot coding-agent" />
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
                <img src="${mascotImage}" alt="SGEX Mascot 1" class="contribute-mascot community" />
                <img src="${mascotImage}" alt="SGEX Mascot 2" class="contribute-mascot community" />
                <img src="${mascotImage}" alt="SGEX Mascot 3" class="contribute-mascot community" />
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
              <img src="${mascotImage}" alt="SGEX Mascot celebrating" class="contribute-mascot celebrate" />
            </div>
            <h3>🚀 Ready to Contribute?</h3>
            <div class="action-buttons">
              <a href="${repositoryConfig.getGitHubUrl()}/issues/new" target="_blank" class="contribute-btn primary">
                🐛 Report a Bug
              </a>
              <a href="${repositoryConfig.getGitHubUrl()}/issues/new?template=feature_request.md" target="_blank" class="contribute-btn secondary">
                ✨ Request a Feature  
              </a>
              <a href="${repositoryConfig.getGitHubUrl()}/tree/main/public/docs" target="_blank" class="contribute-btn tertiary-alt">
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

  // Main data fetching function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cachedData = branchListingCacheService.getCachedData(GITHUB_OWNER, GITHUB_REPO);
      if (cachedData && !isRefreshing) {
        console.log('Using cached branch listing data');
        setBranches(cachedData.branches);
        setPullRequests(cachedData.pullRequests);
        
        // Update cache info for display
        setCacheInfo(branchListingCacheService.getCacheInfo(GITHUB_OWNER, GITHUB_REPO));
        
        // Still check deployment statuses and other real-time data
        await checkAllDeploymentStatuses(cachedData.branches, cachedData.pullRequests);
        
        // Load workflow statuses if authenticated
        if (githubService.isAuth()) {
          await loadWorkflowStatuses(cachedData.branches, cachedData.pullRequests);
        }
        
        // Load discussion summaries for PRs
        const filtered = cachedData.pullRequests.filter(pr => 
          pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
          pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
        );
        const sorted = sortPRs(filtered, prSortBy);
        const paginated = sorted.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
        await loadDiscussionSummaries(paginated);
        
        setLoading(false);
        return;
      }
      
      // If no cache or force refresh, fetch from GitHub API
      console.log('Fetching fresh branch listing data from GitHub API');
      
      // Use githubService instead of direct GitHub API calls
      // Fetch branches
      const branchData = await githubService.getBranches(GITHUB_OWNER, GITHUB_REPO);
      
      // Fetch pull requests based on filter
      const prState = prFilter === 'all' ? 'all' : prFilter;
      const prData = await githubService.getPullRequests(GITHUB_OWNER, GITHUB_REPO, {
        state: prState,
        sort: 'updated',
        per_page: 100
      });
      
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
            url: `./${safeName}/index.html`,
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
          url: `./${safeBranchName}/index.html`,
          prUrl: pr.html_url,
          updatedAt: new Date(pr.updated_at).toLocaleDateString(),
          createdAt: new Date(pr.created_at).toLocaleDateString()
        };
      });
      
      // Cache the fetched data
      branchListingCacheService.setCachedData(GITHUB_OWNER, GITHUB_REPO, filteredBranches, formattedPRs);
      
      // Update cache info for display
      setCacheInfo(branchListingCacheService.getCacheInfo(GITHUB_OWNER, GITHUB_REPO));
      
      setBranches(filteredBranches);
      setPullRequests(formattedPRs);
      
      // Check deployment statuses
      await checkAllDeploymentStatuses(filteredBranches, formattedPRs);
      
      // Load workflow statuses if authenticated
      if (githubService.isAuth()) {
        await loadWorkflowStatuses(filteredBranches, formattedPRs);
      }
      
      // Load discussion summaries for PRs - available for all users
      await loadDiscussionSummaries(formattedPRs.slice(0, ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      
      // Only use fallback data in development or when GitHub API is blocked
      if (process.env.NODE_ENV === 'development' || err.message.includes('Failed to fetch')) {
        console.log('Using fallback mock data for demonstration...');
        const mockBranches = [
          {
            name: 'main',
            safeName: 'main',
            commit: { sha: 'abc1234' },
            url: './main/index.html',
            lastModified: new Date().toLocaleDateString()
          },
          {
            name: 'feature/user-auth',
            safeName: 'feature-user-auth',
            commit: { sha: 'def5678' },
            url: './feature-user-auth/index.html',
            lastModified: new Date(Date.now() - 86400000).toLocaleDateString()
          },
          {
            name: 'fix/api-endpoints',
            safeName: 'fix-api-endpoints',
            commit: { sha: 'ghi9012' },
            url: './fix-api-endpoints/index.html',
            lastModified: new Date(Date.now() - 172800000).toLocaleDateString()
          }
        ];

        const mockPRs = [
          {
            id: 1,
            number: 123,
            title: 'Improve multi-page selector landing page for GitHub deployment',
            state: 'open',
            author: 'copilot',
            branchName: 'copilot/fix-459',
            safeBranchName: 'copilot-fix-459',
            url: './copilot-fix-459/index.html',
            prUrl: '${repositoryConfig.getGitHubUrl()}/pull/123',
            updatedAt: new Date().toLocaleDateString(),
            createdAt: new Date(Date.now() - 86400000).toLocaleDateString()
          },
          {
            id: 2,
            number: 122,
            title: 'Add dark mode support',
            state: 'closed',
            author: 'developer',
            branchName: 'feature/dark-mode',
            safeBranchName: 'feature-dark-mode',
            url: './feature-dark-mode/index.html',
            prUrl: '${repositoryConfig.getGitHubUrl()}/pull/122',
            updatedAt: new Date(Date.now() - 172800000).toLocaleDateString(),
            createdAt: new Date(Date.now() - 345600000).toLocaleDateString()
          },
          {
            id: 3,
            number: 121,
            title: 'Fix authentication flow',
            state: 'open',
            author: 'contributor',
            branchName: 'fix/auth-flow',
            safeBranchName: 'fix-auth-flow',
            url: './fix-auth-flow/index.html',
            prUrl: '${repositoryConfig.getGitHubUrl()}/pull/121',
            updatedAt: new Date(Date.now() - 259200000).toLocaleDateString(),
            createdAt: new Date(Date.now() - 432000000).toLocaleDateString()
          }
        ];

        setBranches(mockBranches);
        setPullRequests(mockPRs);
        setError(null); // Clear error since we have fallback data
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [checkAllDeploymentStatuses, prFilter, loadWorkflowStatuses, loadDiscussionSummaries, isRefreshing, prSearchTerm, prSortBy, prPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load summaries for visible PRs when page changes
  useEffect(() => {
    if (pullRequests.length > 0) {
      const filtered = pullRequests.filter(pr => 
        pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
        pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
      );
      const sorted = sortPRs(filtered, prSortBy);
      const paginated = sorted.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
      loadDiscussionSummaries(paginated);
    }
  }, [prPage, prSearchTerm, prSortBy, pullRequests, loadDiscussionSummaries]);

  // Filter and sort PRs based on search and sorting
  const filteredPRs = pullRequests.filter(pr => 
    pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
    pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
  );
  const sortedPRs = sortPRs(filteredPRs, prSortBy);
  const paginatedPRs = sortedPRs.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
  const totalPRPages = Math.ceil(sortedPRs.length / ITEMS_PER_PAGE);

  // Filter and sort branches based on search and sorting
  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase())
  );
  const sortedBranches = sortBranches(filteredBranches, branchSortBy);

  if (loading) {
    return (
      <PageLayout pageName="branch-listing" showMascot={true} showHeader={false}>
        <div className="branch-listing">
          <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
          <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
          <div className="loading">Loading previews...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="branch-listing" showMascot={true} showHeader={false}>
        <div className="branch-listing">
          <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
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
    <PageLayout pageName="branch-listing" showMascot={true} showHeader={false}>
      <div className="branch-listing">
        <header className="branch-listing-header">
          <h1><img src={mascotImage} alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
          <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
          
          <div className="prominent-info">
            <p className="info-text">
              🐾 This landing page lists all available previews. 
              Each branch and PR is automatically deployed to its own preview environment.
            </p>
            {cacheInfo && cacheInfo.exists && (
              <div className="cache-status">
                <span className="cache-info">
                  📊 Data cached {cacheInfo.ageMinutes} minute{cacheInfo.ageMinutes !== 1 ? 's' : ''} ago
                  {cacheInfo.stale && ' (refreshing...)'}
                </span>
                <button 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="refresh-btn"
                  title="Refresh data from GitHub API"
                >
                  {isRefreshing ? '🔄' : '🔄'} {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
          </div>
          
          {/* Authentication Section */}
          <div className="auth-section">
            {!isAuthenticated ? (
              <div className="login-section">
                <h3>🔐 GitHub Authentication</h3>
                <p>Login with your GitHub Personal Access Token to view and add comments to pull requests:</p>
                <PATLogin onAuthSuccess={handleAuthSuccess} />
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
          <button 
            className="contribute-btn primary"
            onClick={() => setShowContributeModal(true)}
          >
            🌟 How to Contribute
          </button>
          <a 
            href={`${repositoryConfig.getGitHubUrl()}/issues/new`}
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
            🌿 Branch Previews ({sortedBranches.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'prs' ? 'active' : ''}`}
            onClick={() => setActiveTab('prs')}
          >
            🔄 Pull Request Previews ({sortedPRs.length})
          </button>
        </div>

        {activeTab === 'branches' && (
          <div className="branch-section">
            <div className="branch-controls">
              <input
                type="text"
                placeholder="Search branches by name..."
                value={branchSearchTerm}
                onChange={(e) => setBranchSearchTerm(e.target.value)}
                className="branch-search"
              />
              <select
                value={branchSortBy}
                onChange={(e) => setBranchSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="updated">Sort by Recent Updates</option>
                <option value="alphabetical">Sort Alphabetically</option>
              </select>
              {checkingStatuses && (
                <span className="status-checking">
                  🔄 Checking deployment status...
                </span>
              )}
            </div>

            <div className="branch-cards">
              {sortedBranches.length === 0 ? (
                <div className="no-items">
                  {branchSearchTerm ? (
                    <p>No branches match your search "{branchSearchTerm}".</p>
                  ) : (
                    <>
                      <p>No branch previews available at the moment.</p>
                      <p>Branch previews will appear here when code is pushed to branches.</p>
                    </>
                  )}
                </div>
              ) : (
                sortedBranches.map((branch) => {
                  const statusKey = `branch-${branch.name}`;
                  const deploymentStatus = deploymentStatuses[statusKey];
                  
                  return (
                    <div key={branch.name} className="preview-card">
                      <div className="card-header">
                        <h3 className="item-name">{branch.name}</h3>
                        <div className="card-badges">
                          <span className="commit-badge">
                            {branch.commit.sha.substring(0, 7)}
                          </span>
                          {deploymentStatus && (
                            <span className={`status-badge ${deploymentStatus}`}>
                              {deploymentStatus === 'active' && '🟢 Active'}
                              {deploymentStatus === 'not-found' && '🟡 Building'}
                              {deploymentStatus === 'errored' && '🔴 Error'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <p className="item-date">
                          Last updated: {branch.lastModified}
                        </p>
                        
                        <div className="branch-actions">
                          {deploymentStatus === 'active' ? (
                            <a 
                              href={branch.url} 
                              className="preview-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>🚀 View Preview</span>
                            </a>
                          ) : deploymentStatus === 'not-found' ? (
                            <div className="deployment-message">
                              <span className="building-message">
                                🔄 Deployment in progress. Please check back in a few minutes.
                              </span>
                            </div>
                          ) : deploymentStatus === 'errored' ? (
                            <div className="deployment-message">
                              <span className="error-message">
                                ❌ Deployment failed. Please check the GitHub Actions logs or contact support.
                              </span>
                              <a 
                                href={`${repositoryConfig.getGitHubUrl()}/actions`}
                                className="actions-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Actions Log
                              </a>
                            </div>
                          ) : (
                            <a 
                              href={branch.url} 
                              className="preview-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>🚀 View Preview</span>
                            </a>
                          )}
                          
                          <button 
                            className="copy-btn"
                            onClick={() => copyToClipboard(branch.url, 'branch', branch.name)}
                            title="Copy URL to clipboard"
                          >
                            📋 Copy URL
                          </button>
                        </div>

                        {/* Workflow Status */}
                        <WorkflowStatus
                          workflowStatus={workflowStatuses[branch.name]}
                          branchName={branch.name}
                          onTriggerWorkflow={triggerWorkflow}
                          isAuthenticated={isAuthenticated}
                          isLoading={loadingWorkflowStatuses}
                        />
                      </div>

                      <div className="card-footer">
                        <small className="preview-path">
                          Preview URL: <a 
                            href={branch.url} 
                            className="preview-url-link"
                            rel="noopener noreferrer"
                          >
                            {branch.url}
                          </a>
                        </small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'prs' && (
          <div className="pr-section">
            <div className="pr-controls">
              <div className="pr-filter-section">
                <label htmlFor="pr-filter">Filter PRs:</label>
                <select
                  id="pr-filter"
                  value={prFilter}
                  onChange={(e) => {
                    setPrFilter(e.target.value);
                    setPrPage(1); // Reset to first page when filtering
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
                  setPrPage(1); // Reset to first page when searching
                }}
                className="pr-search"
              />
              <select
                value={prSortBy}
                onChange={(e) => {
                  setPrSortBy(e.target.value);
                  setPrPage(1); // Reset to first page when sorting
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
                paginatedPRs.map((pr) => {
                  const statusKey = `pr-${pr.id}`;
                  const deploymentStatus = deploymentStatuses[statusKey];
                  
                  return (
                    <div key={pr.id} className="preview-card pr-card">
                      <div className="card-header">
                        <h3 className="item-name">#{pr.number}: {pr.title}</h3>
                        <div className="card-badges">
                          <span className={`state-badge ${pr.state}`}>
                            {pr.state === 'open' ? '🟢' : '🔴'} {pr.state}
                          </span>
                          {deploymentStatus && (
                            <span className={`status-badge ${deploymentStatus}`}>
                              {deploymentStatus === 'active' && '🟢 Active'}
                              {deploymentStatus === 'not-found' && '🟡 Building'}
                              {deploymentStatus === 'errored' && '🔴 Error'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <p className="pr-meta">
                          <strong>Branch:</strong> {pr.branchName} • <strong>Author:</strong> {pr.author}
                        </p>
                        <p className="item-date">
                          Created: {pr.createdAt} • Updated: {pr.updatedAt}
                        </p>
                        
                        {/* Discussion Summary Section - Show for all users */}
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
                                    href={`${repositoryConfig.getGitHubUrl()}/pull/${pr.number}/files`}
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
                              
                              {/* Comment Input at Top - Only show for authenticated users */}
                              {githubService.isAuth() ? (
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
                              ) : (
                                <div className="comment-auth-message">
                                  <p>
                                    🔐 <a href="#auth-section" onClick={() => document.querySelector('.auth-section')?.scrollIntoView()}>Sign in</a> to add comments to this discussion
                                  </p>
                                </div>
                              )}
                              
                            </div>
                          )}
                        </div>
                        
                        <div className="pr-actions">
                          {deploymentStatus === 'active' ? (
                            <a 
                              href={pr.url} 
                              className="preview-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>🚀 View Preview</span>
                            </a>
                          ) : deploymentStatus === 'not-found' ? (
                            <div className="deployment-message">
                              <span className="building-message">
                                🔄 Deployment in progress. Please check back in a few minutes.
                              </span>
                            </div>
                          ) : deploymentStatus === 'errored' ? (
                            <div className="deployment-message">
                              <span className="error-message">
                                ❌ Deployment failed. Please check the GitHub Actions logs or contact support.
                              </span>
                              <a 
                                href={`${repositoryConfig.getGitHubUrl()}/actions`}
                                className="actions-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Actions Log
                              </a>
                            </div>
                          ) : (
                            <a 
                              href={pr.url} 
                              className="preview-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>🚀 View Preview</span>
                            </a>
                          )}
                          
                          <button 
                            className="copy-btn"
                            onClick={() => copyToClipboard(pr.url, 'PR', `#${pr.number}`)}
                            title="Copy URL to clipboard"
                          >
                            📋 Copy URL
                          </button>
                          
                          <a 
                            href={pr.prUrl} 
                            className="pr-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>📋 View PR</span>
                          </a>
                        </div>

                        {/* Workflow Status */}
                        <WorkflowStatus
                          workflowStatus={workflowStatuses[pr.branchName]}
                          branchName={pr.branchName}
                          onTriggerWorkflow={triggerWorkflow}
                          isAuthenticated={isAuthenticated}
                          isLoading={loadingWorkflowStatuses}
                        />
                      </div>

                      <div className="card-footer">
                        <small className="preview-path">
                          Preview URL: <a 
                            href={pr.url} 
                            className="preview-url-link"
                            rel="noopener noreferrer"
                          >
                            {pr.url}
                          </a>
                        </small>
                      </div>
                    </div>
                  );
                })
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
        )}

        <footer className="branch-listing-footer">
          <div className="footer-content">
            <div className="footer-left">
              <a 
                href={repositoryConfig.getGitHubUrl()}
                target="_blank" 
                rel="noopener noreferrer"
                className="source-link"
              >
                📦 Source Code
              </a>
            </div>
            <div className="footer-center">
              <p>
                <strong>Main Application:</strong> <a href="./main/index.html">View Main Branch →</a>
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
