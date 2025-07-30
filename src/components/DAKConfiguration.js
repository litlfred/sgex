import React, { useState } from 'react';

const DAKConfiguration = () => {
  const [config, setConfig] = useState({
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    license: 'MIT'
  });

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="dak-configuration">
      <h2>DAK Configuration</h2>
      <form className="config-form">
        <div className="form-group">
          <label>DAK Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Version</label>
          <input
            type="text"
            value={config.version}
            onChange={(e) => handleChange('version', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={config.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Author</label>
          <input
            type="text"
            value={config.author}
            onChange={(e) => handleChange('author', e.target.value)}
          />
        </div>
        <button type="submit">Save Configuration</button>
      </form>
    </div>
  );
};

export default DAKConfiguration;