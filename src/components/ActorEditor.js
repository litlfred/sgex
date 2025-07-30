import React, { useState } from 'react';

const ActorEditor = () => {
  const [actor, setActor] = useState({
    name: '',
    description: '',
    role: '',
    responsibilities: []
  });

  const handleChange = (field, value) => {
    setActor(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="actor-editor">
      <h2>Actor Editor</h2>
      <form className="actor-form">
        <div className="form-group">
          <label>Actor Name</label>
          <input
            type="text"
            value={actor.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={actor.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select
            value={actor.role}
            onChange={(e) => handleChange('role', e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="healthcare_provider">Healthcare Provider</option>
            <option value="patient">Patient</option>
            <option value="administrator">Administrator</option>
          </select>
        </div>
        <button type="submit">Save Actor</button>
      </form>
    </div>
  );
};

export default ActorEditor;