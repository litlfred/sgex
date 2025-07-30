import React from 'react';

const DAKActionSelection = () => {
  const actions = [
    { id: 'create', title: 'Create DAK', description: 'Create a new Digital Adaptation Kit' },
    { id: 'edit', title: 'Edit DAK', description: 'Edit an existing DAK' },
    { id: 'review', title: 'Review DAK', description: 'Review and validate a DAK' },
    { id: 'publish', title: 'Publish DAK', description: 'Publish a DAK for distribution' }
  ];

  return (
    <div className="dak-action-selection">
      <h2>Select DAK Action</h2>
      <div className="action-grid">
        {actions.map(action => (
          <div key={action.id} className="action-card">
            <h3>{action.title}</h3>
            <p>{action.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DAKActionSelection;