import React, { useState, useEffect } from 'react';
import { PageLayout } from './framework';
import githubService from '../services/githubService';
import './BranchListing.css';

const BranchListing = () => {
  const [branches, setBranches] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('branches');
  const [prSearch, setPrSearch] = useState('');
  const [prPage, setPrPage] = useState(1);
  const [prHasMore, setPrHasMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const owner = 'litlfred';
        const repo = 'sgex';
        
        // Fetch branches and PRs in parallel
        const [branchResponse, prResponse] = await Promise.allSettled([
          fetchBranches(owner, repo),
          fetchRecentPRs(owner, repo)
        ]);
        
        if (branchResponse.status === 'fulfilled') {
          setBranches(branchResponse.value);
        } else {
          console.error('Failed to fetch branches:', branchResponse.reason);
        }
        
        if (prResponse.status === 'fulfilled') {
          setPrs(prResponse.value);
          setPrHasMore(prResponse.value.length === 5); // Assume more if we got full page
        } else {
          console.error('Failed to fetch PRs:', prResponse.reason);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchBranches = async (owner, repo) => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch branches: ${response.status}`);
    }
    
    const branchData = await response.json();
    
    // Filter out gh-pages branch and format data
    return branchData
      .filter(branch => branch.name !== 'gh-pages')
      .map(branch => {
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
  };

  const fetchRecentPRs = async (owner, repo, search = '', page = 1) => {
    try {
      const response = await githubService.getRecentlyDeployedPRs(owner, repo, 5);
      return response;
    } catch (error) {
      // Fallback to direct API call if service fails (for unauthenticated access)
      const apiUrl = search 
        ? `https://api.github.com/search/issues?q=repo:${owner}/${repo}+is:pr+${search}+in:title+is:merged&sort=updated&order=desc&per_page=5&page=${page}`
        : `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=10&sort=updated&direction=desc`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PRs: ${response.status}`);
      }
      
      const data = await response.json();
      const items = search ? data.items : data;
      
      // Filter for merged PRs and format data
      return items
        .filter(pr => pr.merged_at || pr.state === 'closed')
        .slice(0, 5)
        .map(pr => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          merged_at: pr.merged_at || pr.closed_at,
          head_branch: pr.head?.ref || 'unknown',
          head_sha: pr.head?.sha || 'unknown',
          user: pr.user,
          html_url: pr.html_url,
          branch_url: `./sgex/${(pr.head?.ref || 'unknown').replace(/\//g, '-')}/index.html`
        }));
    }
  };

  const handlePrSearch = async (searchTerm) => {
    if (searchTerm.trim() === prSearch.trim()) return;
    
    setPrSearch(searchTerm);
    setPrPage(1);
    
    try {
      const owner = 'litlfred';
      const repo = 'sgex';
      const results = await fetchRecentPRs(owner, repo, searchTerm, 1);
      setPrs(results);
      setPrHasMore(results.length === 5);
    } catch (error) {
      console.error('Error searching PRs:', error);
    }
  };

  const loadMorePRs = async () => {
    try {
      const owner = 'litlfred';
      const repo = 'sgex';
      const nextPage = prPage + 1;
      const results = await fetchRecentPRs(owner, repo, prSearch, nextPage);
      
      setPrs(prev => [...prev, ...results]);
      setPrPage(nextPage);
      setPrHasMore(results.length === 5);
    } catch (error) {
      console.error('Error loading more PRs:', error);
    }
  };

  if (loading) {
    return (
      <PageLayout showMascot={true} pageName="branch-listing">
        <div className="branch-listing">
          <header className="branch-listing-header">
            <div className="header-icon">
              <img src="./sgex-mascot.png" alt="SGEX Workbench Helper" className="mascot-icon" />
            </div>
            <h1>SGEX</h1>
            <p className="subtitle">
              a collaborative workbench for WHO SMART Guidelines
            </p>
          </header>
          <div className="loading">Loading branch and PR previews...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout showMascot={true} pageName="branch-listing">
        <div className="branch-listing">
          <header className="branch-listing-header">
            <div className="header-icon">
              <img src="./sgex-mascot.png" alt="SGEX Workbench Helper" className="mascot-icon" />
            </div>
            <h1>SGEX</h1>
            <p className="subtitle">
              a collaborative workbench for WHO SMART Guidelines
            </p>
          </header>
          <div className="error">
            <p>Failed to load previews: {error}</p>
            <p>Please try refreshing the page or check back later.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showMascot={true} pageName="branch-listing">
      <div className="branch-listing">
        <header className="branch-listing-header">
          <div className="header-icon">
            <img src="./sgex-mascot.png" alt="SGEX Workbench Helper" className="mascot-icon" />
          </div>
          <h1>SGEX</h1>
          <p className="subtitle">
            a collaborative workbench for WHO SMART Guidelines
          </p>
        </header>

        <div className="selector-tabs">
          <button 
            className={`tab-button ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            🌿 Branches ({branches.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'prs' ? 'active' : ''}`}
            onClick={() => setActiveTab('prs')}
          >
            🔀 Recent Deployments ({prs.length})
          </button>
        </div>

        {activeTab === 'branches' && (
          <div className="branch-cards">
            {branches.length === 0 ? (
              <div className="no-branches">
                <p>No branch previews available at the moment.</p>
                <p>Branch previews will appear here when code is pushed to branches.</p>
              </div>
            ) : (
              branches.map((branch) => (
                <div key={branch.name} className="branch-card">
                  <div className="branch-card-header">
                    <h3 className="branch-name">{branch.name}</h3>
                    <span className="branch-commit">
                      {branch.commit.sha.substring(0, 7)}
                    </span>
                  </div>
                  
                  <div className="branch-card-body">
                    <p className="branch-date">
                      Last updated: {branch.lastModified}
                    </p>
                    
                    <a 
                      href={branch.url} 
                      className="branch-preview-link"
                      rel="noopener noreferrer"
                    >
                      <span>🚀 View Preview</span>
                    </a>
                  </div>

                  <div className="branch-card-footer">
                    <small className="branch-path">
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
            <div className="pr-search">
              <input
                type="text"
                placeholder="Search PRs by title..."
                value={prSearch}
                onChange={(e) => handlePrSearch(e.target.value)}
                className="pr-search-input"
              />
            </div>
            
            <div className="pr-cards">
              {prs.length === 0 ? (
                <div className="no-prs">
                  <p>No recent deployments found.</p>
                  <p>Recently merged pull requests will appear here.</p>
                </div>
              ) : (
                prs.map((pr) => (
                  <div key={`${pr.id}-${pr.number}`} className="pr-card">
                    <div className="pr-card-header">
                      <h3 className="pr-title">
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                          #{pr.number}: {pr.title}
                        </a>
                      </h3>
                      <span className="pr-user">by {pr.user.login}</span>
                    </div>
                    
                    <div className="pr-card-body">
                      <p className="pr-date">
                        Merged: {new Date(pr.merged_at).toLocaleDateString()}
                      </p>
                      <p className="pr-branch">
                        Branch: <code>{pr.head_branch}</code>
                      </p>
                      
                      <a 
                        href={pr.branch_url} 
                        className="pr-preview-link"
                        rel="noopener noreferrer"
                      >
                        <span>🚀 View Deployment</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {prHasMore && (
              <div className="pr-load-more">
                <button 
                  onClick={loadMorePRs}
                  className="load-more-btn"
                >
                  + Load More PRs
                </button>
              </div>
            )}
          </div>
        )}

        <footer className="branch-listing-footer">
          <div className="footer-links">
            <a href="https://github.com/litlfred/sgex" target="_blank" rel="noopener noreferrer" className="source-link">
              📂 Source Code
            </a>
          </div>
          <p>
            🐾 This landing page lists all available branch previews and recent deployments. 
            Each branch is automatically deployed to its own preview environment.
          </p>
          <p>
            <strong>Main Application:</strong> <a href="./sgex/main/index.html">View Main Branch →</a>
          </p>
        </footer>
      </div>
    </PageLayout>
  );
};

export default BranchListing;