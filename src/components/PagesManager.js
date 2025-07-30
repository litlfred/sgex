import React, { useState } from 'react';

const PagesManager = () => {
  const [pages, setPages] = useState([
    { id: 1, title: 'Landing Page', route: '/', status: 'published' },
    { id: 2, title: 'DAK Dashboard', route: '/dashboard', status: 'draft' },
    { id: 3, title: 'Component Editor', route: '/editor', status: 'published' }
  ]);

  const createPage = () => {
    const newPage = {
      id: pages.length + 1,
      title: 'New Page',
      route: '/new-page',
      status: 'draft'
    };
    setPages([...pages, newPage]);
  };

  return (
    <div className="pages-manager">
      <h2>Pages Manager</h2>
      <button onClick={createPage} className="create-page-btn">Create New Page</button>
      <div className="pages-list">
        {pages.map(page => (
          <div key={page.id} className="page-item">
            <h3>{page.title}</h3>
            <span className="page-route">{page.route}</span>
            <span className={`page-status ${page.status}`}>{page.status}</span>
            <div className="page-actions">
              <button>Edit</button>
              <button>Preview</button>
              <button>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesManager;