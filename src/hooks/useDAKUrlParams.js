import { useState, useEffect } from 'react';

// Custom hook for DAK URL parameters
const useDAKUrlParams = () => {
  const [params, setParams] = useState({
    owner: null,
    repo: null,
    branch: null,
    dakId: null
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams({
      owner: urlParams.get('owner'),
      repo: urlParams.get('repo'),
      branch: urlParams.get('branch'),
      dakId: urlParams.get('dakId')
    });
  }, []);

  return params;
};

export default useDAKUrlParams;