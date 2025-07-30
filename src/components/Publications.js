import React from 'react';

const Publications = ({ publications = [] }) => {
  return (
    <div className="publications">
      <h3>Publications</h3>
      {publications.length === 0 ? (
        <p>No publications available.</p>
      ) : (
        <ul>
          {publications.map((pub, index) => (
            <li key={index}>
              <a href={pub.url} target="_blank" rel="noopener noreferrer">
                {pub.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Publications;