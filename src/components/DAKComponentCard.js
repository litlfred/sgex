import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from './ResponsiveImage';
import { getAltText, ALT_TEXT_KEYS } from '../utils/imageAltTextHelper';
import './DAKComponentCard.css';

const DAKComponentCard = ({ component, onClick, className = '' }) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleClick = (event) => {
    if (onClick) {
      onClick(event, component);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  return (
    <div 
      className={`component-card ${component.type.toLowerCase()} ${imageLoaded ? 'image-loaded' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ '--component-color': component.color }}
      tabIndex={0}
      role="button"
      aria-label={`${component.name} - ${component.description}`}
    >
      <div className="component-header">
        {/* Card image with fallback to icon */}
        <div className="component-image-container">
          <ResponsiveImage 
            src={component.cardImage}
            alt={getAltText(t, ALT_TEXT_KEYS.ICON_DAK_COMPONENT, component.name, { name: component.name })}
            className="component-card-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageError ? 'none' : 'block' }}
          />
          {/* Fallback icon when image fails to load */}
          {imageError && (
            <div className="component-icon" style={{ color: component.color }}>
              {component.icon}
            </div>
          )}
        </div>
      </div>
      
      <div className="component-content">
        {/* Only show title text if image failed to load or as screen reader backup */}
        <h4 className={imageLoaded && !imageError ? 'visually-hidden' : ''}>
          {component.name}
        </h4>
        <p className={imageLoaded && !imageError ? 'visually-hidden' : ''}>
          {component.description}
        </p>
        
        <div className="component-meta">
          <div className="file-types">
            {component.fileTypes.map((type) => (
              <span key={type} className="file-type-tag">{type}</span>
            ))}
          </div>
          <div className="file-count">
            {component.count} files
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAKComponentCard;