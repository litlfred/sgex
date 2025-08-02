import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from './framework';
import HelpModal from './HelpModal';
import PATLogin from './PATLogin';
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
  const [prSortBy, setPrSortBy] = useState('updated'); // updated, number, alphabetical
  const [branchSortBy, setBranchSortBy] = useState('updated'); // updated, alphabetical
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [deploymentStatuses, setDeploymentStatuses] = useState({});
  const [checkingStatuses, setCheckingStatuses] = useState(false);
  const [prFilter, setPrFilter] = useState('open'); // 'open', 'closed', 'all'
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
    // Store token for session
    sessionStorage.setItem('github_token', token);
  };

  const handleLogout = () => {
    setGithubToken(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('github_token');
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

  // Function to fetch PR comments
  const fetchPRComments = useCallback(async (prNumber) => {
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
      // Return last 4 comments, truncated to 2 lines each
      return comments.slice(-4).map(comment => ({
        id: comment.id,
        author: comment.user.login,
        body: comment.body.split('\n').slice(0, 2).join('\n').substring(0, 200) + (comment.body.length > 200 ? '...' : ''),
        created_at: new Date(comment.created_at).toLocaleDateString(),
        avatar_url: comment.user.avatar_url
      }));
    } catch (error) {
      console.error(`Error fetching comments for PR ${prNumber}:`, error);
      return [];
    }
  }, [githubToken]);

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
      
      // Clear the comment input
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

  // Function to load comments for all visible PRs
  const loadCommentsForPRs = useCallback(async (prs) => {
    if (!githubToken || prs.length === 0) return;
    
    setLoadingComments(true);
    const comments = {};
    
    for (const pr of prs) {
      comments[pr.number] = await fetchPRComments(pr.number);
    }
    
    setPrComments(comments);
    setLoadingComments(false);
  }, [githubToken, fetchPRComments]);

  // Check for existing authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('github_token');
    if (token) {
      setGithubToken(token);
      setIsAuthenticated(true);
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
              <img src="./sgex-mascot.png" alt="SGEX Mascot" class="contribute-mascot" />
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
              <img src="./sgex-mascot.png" alt="SGEX Mascot examining a bug" class="contribute-mascot bug-report" />
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
              <img src="./sgex-mascot.png" alt="Robotic SGEX Mascot" class="contribute-mascot coding-agent" />
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
                <img src="./sgex-mascot.png" alt="SGEX Mascot 1" class="contribute-mascot community" />
                <img src="./sgex-mascot.png" alt="SGEX Mascot 2" class="contribute-mascot community" />
                <img src="./sgex-mascot.png" alt="SGEX Mascot 3" class="contribute-mascot community" />
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
              <img src="./sgex-mascot.png" alt="SGEX Mascot celebrating" class="contribute-mascot celebrate" />
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
        
        // Fetch pull requests based on filter
        const prState = prFilter === 'all' ? 'all' : prFilter;
        const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=${prState}&sort=updated&per_page=100`);
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
        
        setBranches(filteredBranches);
        setPullRequests(formattedPRs);
        
        // Check deployment statuses
        await checkAllDeploymentStatuses(filteredBranches, formattedPRs);
        
        // Load discussion summaries for PRs if authenticated
        if (githubToken) {
          await loadDiscussionSummaries(formattedPRs.slice(0, ITEMS_PER_PAGE));
        }
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
              prUrl: 'https://github.com/litlfred/sgex/pull/123',
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
              prUrl: 'https://github.com/litlfred/sgex/pull/122',
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
              prUrl: 'https://github.com/litlfred/sgex/pull/121',
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
      }
    };

    fetchData();
  }, [checkAllDeploymentStatuses, prFilter, githubToken, loadCommentsForPRs]);

  // Load summaries for visible PRs when page changes
  useEffect(() => {
    if (isAuthenticated && pullRequests.length > 0) {
      const filtered = pullRequests.filter(pr => 
        pr.title.toLowerCase().includes(prSearchTerm.toLowerCase()) ||
        pr.author.toLowerCase().includes(prSearchTerm.toLowerCase())
      );
      const sorted = sortPRs(filtered, prSortBy);
      const paginated = sorted.slice((prPage - 1) * ITEMS_PER_PAGE, prPage * ITEMS_PER_PAGE);
      loadDiscussionSummaries(paginated);
    }
  }, [prPage, prSearchTerm, prSortBy, pullRequests, isAuthenticated, loadDiscussionSummaries]);

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
          <h1><img src="./sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
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
          <h1><img src="./sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
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
          <h1><img src="./sgex-mascot.png" alt="SGEX Icon" className="sgex-icon" /> SGEX</h1>
          <p className="subtitle">a collaborative workbench for WHO SMART Guidelines</p>
          
          <div className="prominent-info">
            <p className="info-text">
              🐾 This landing page lists all available previews. 
              Each branch and PR is automatically deployed to its own preview environment.
            </p>
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
                                href={`https://github.com/litlfred/sgex/actions`}
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
                        
                        {/* Discussion Summary Section */}
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
                                  {loadingComments ? (
                                    <div className="comments-loading">Loading full discussion...</div>
                                  ) : prComments[pr.number] && prComments[pr.number].length > 0 ? (
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
                          {deploymentStatus === 'active' ? (
                            <a 
                              href={pr.url} 
                              className="preview-link"
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
                                href={`https://github.com/litlfred/sgex/actions`}
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