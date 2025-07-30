import React from 'react';

const Publications = ({ dakId }) => {
  const mockPublications = [
    { id: 1, title: 'Publication 1', type: 'guideline', date: '2024-01-01' },
    { id: 2, title: 'Publication 2', type: 'reference', date: '2024-02-01' }
  ];

  return (
    <div className="publications">
      <h3>Publications</h3>
      <div className="publications-list">
        {mockPublications.map(pub => (
          <div key={pub.id} className="publication-item">
            <h4>{pub.title}</h4>
            <span className="publication-type">{pub.type}</span>
            <span className="publication-date">{pub.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Publications;