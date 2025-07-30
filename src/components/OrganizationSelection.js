import React, { useState } from 'react';

const OrganizationSelection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const mockOrganizations = [
    { id: 1, name: 'World Health Organization', acronym: 'WHO' },
    { id: 2, name: 'UNICEF', acronym: 'UNICEF' },
    { id: 3, name: 'Centers for Disease Control', acronym: 'CDC' }
  ];

  const filteredOrgs = mockOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.acronym.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="organization-selection">
      <h2>Select Organization</h2>
      <input
        type="text"
        placeholder="Search organizations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="organization-search"
      />
      <div className="organization-list">
        {filteredOrgs.map(org => (
          <div key={org.id} className="organization-item">
            <h3>{org.acronym}</h3>
            <p>{org.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationSelection;