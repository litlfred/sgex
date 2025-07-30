// Navigation utilities
export const navigateToDAK = (dakId) => {
  console.log('Navigate to DAK:', dakId);
};

export const navigateToComponent = (componentId) => {
  console.log('Navigate to component:', componentId);
};

export const goBack = () => {
  window.history.back();
};

export const goHome = () => {
  window.location.href = '/';
};

export const handleNavigationClick = (e, path) => {
  e.preventDefault();
  console.log('Navigate to:', path);
  // Add your navigation logic here
};