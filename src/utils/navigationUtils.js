// Navigation utilities
export const handleNavigationClick = (url) => {
  console.log(`Navigating to: ${url}`);
  window.location.href = url;
};

export const openInNewTab = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};