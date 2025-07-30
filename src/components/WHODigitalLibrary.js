import React from 'react';

const WHODigitalLibrary = ({ onSelect, searchTerm }) => {
  const mockLibraryItems = [
    { id: 1, name: 'WHO Guidelines Component 1', description: 'Basic guideline component' },
    { id: 2, name: 'WHO Guidelines Component 2', description: 'Advanced guideline component' }
  ];

  return (
    <div className="who-digital-library">
      <h3>WHO Digital Library</h3>
      <div className="library-items">
        {mockLibraryItems.map(item => (
          <div key={item.id} className="library-item" onClick={() => onSelect && onSelect(item)}>
            <h4>{item.name}</h4>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WHODigitalLibrary;