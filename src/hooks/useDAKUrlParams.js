import { useParams } from 'react-router-dom';

// Hook for DAK URL parameters
const useDAKUrlParams = () => {
  const params = useParams();
  
  return {
    user: params.user,
    repo: params.repo,
    branch: params.branch || 'main'
  };
};

export default useDAKUrlParams;