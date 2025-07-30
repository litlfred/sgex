import React, { useState } from 'react';

const RepositorySelection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const mockRepositories = [
    { id: 1, name: 'who-smart-guidelines/dak-example', owner: 'WHO', description: 'Example DAK repository' },
    { id: 2, name: 'health-org/maternal-health-dak', owner: 'Health Org', description: 'Maternal health guidelines' },
    { id: 3, name: 'cdc/immunization-dak', owner: 'CDC', description: 'Immunization guidelines' }
  ];

  const filteredRepos = mockRepositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="repository-selection">
      <h2>Select Repository</h2>
      <input
        type="text"
        placeholder="Search repositories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="repository-search"
      />
      <div className="repository-list">
        {filteredRepos.map(repo => (
          <div key={repo.id} className="repository-item">
            <h3>{repo.name}</h3>
            <p>{repo.description}</p>
            <span className="repository-owner">Owner: {repo.owner}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositorySelection;