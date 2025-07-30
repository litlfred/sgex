import React, { useState, useEffect } from 'react';
import { PageLayout } from './framework';
import './BranchListing.css';

const BranchListing = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        
        // Use GitHub API to fetch branches for the sgex repository
        const owner = 'litlfred';
        const repo = 'sgex';
        
        // Make API call without requiring authentication for public repo
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch branches: ${response.status}`);
        }
        
        const branchData = await response.json();
        
        // Filter out gh-pages branch and format data
        const filteredBranches = branchData
          .filter(branch => branch.name !== 'gh-pages')
          .map(branch => ({
            name: branch.name,
            commit: branch.commit,
            url: `./sgex/${branch.name}/index.html`,
            lastModified: branch.commit.commit?.committer?.date 
              ? new Date(branch.commit.commit.committer.date).toLocaleDateString()
              : 'Unknown'
          }));
        
        setBranches(filteredBranches);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="branch-listing">
          <h1>🐱 SGEX Branch Previews</h1>
          <div className="loading">Loading branch previews...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="branch-listing">
          <h1>🐱 SGEX Branch Previews</h1>
          <div className="error">
            <p>Failed to load branch previews: {error}</p>
            <p>Please try refreshing the page or check back later.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="branch-listing">
        <header className="branch-listing-header">
          <h1>🐱 SGEX Branch Previews</h1>
          <p className="subtitle">
            WHO SMART Guidelines Exchange - Multi-Branch Preview Dashboard
          </p>
        </header>

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

        <footer className="branch-listing-footer">
          <p>
            🐾 This landing page lists all available branch previews. 
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