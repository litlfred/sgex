import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useThemeImage from '../hooks/useThemeImage';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';

const CollaborationModal = ({ onClose }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Theme-aware collaboration image
  const collaborationImage = useThemeImage('collaboration.png');
  
  // Theme-aware pronunciation guide image
  const pronunciationImage = useThemeImage('pronunciation-guide.png');

  const slides = [
    {
      title: "Our Mission",
      content: (
        <div className="slide-content">
          <p>
            SGEX is an experimental collaborative project developing a workbench of tools to make it easier and faster to develop high fidelity SMART Guidelines Digital Adaptation Kits (DAKs).
          </p>
          <p>
            Our mission is to empower healthcare organizations worldwide to create and maintain standards-compliant digital health implementations through:
          </p>
          <ul>
            <li><strong>Collaborative Development:</strong> Every contribution matters, whether reporting bugs, testing features, or sharing feedback</li>
            <li><strong>AI-Powered Assistance:</strong> Hybrid approach combining human insight with AI coding agents for efficient development</li>
            <li><strong>Community-Driven Evolution:</strong> Real-time improvement through collaborative discussion and iterative refinement</li>
            <li><strong>Real-World Impact:</strong> Building tools that help healthcare workers worldwide deliver better patient care</li>
          </ul>
        </div>
      )
    },
    {
      title: "How to Contribute",
      content: (
        <div className="slide-content">
          <p>
            Contributing to SGEX is a collaborative journey that combines human creativity with AI assistance:
          </p>
          <div className="contribution-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>🐛 Start with Feedback</h4>
                <p>Report bugs, request features, or suggest improvements through our issue tracker</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>🤖 AI-Powered Development</h4>
                <p>Issues may be assigned to coding agents for initial analysis and implementation</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>🌟 Community Collaboration</h4>
                <p>The community reviews, tests, and refines changes through collaborative discussion</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>🚀 Real-Time Evolution</h4>
                <p>The workbench continuously evolves based on actual usage and feedback from healthcare professionals</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Get Started",
      content: (
        <div className="slide-content">
          <div className="collaboration-image">
            <img src={collaborationImage} alt={getAltText(t, ALT_TEXT_KEYS.IMAGE_COLLABORATION, 'Collaboration in SGEX')} />
          </div>
          <p>
            Every contribution helps improve digital health tools for healthcare workers worldwide. Whether you're reporting a bug, testing a feature, or sharing feedback, you're part of building the future of digital health tooling.
          </p>
          <div className="get-started-actions">
            <h4>Ready to contribute?</h4>
            <button 
              className="action-link primary"
              onClick={() => {
                // Navigate to current site instead of external URL
                window.location.href = window.location.origin + '/sgex/';
              }}
            >
              View Main Site
            </button>
            <p className="or-text">or</p>
            <button 
              className="action-link secondary"
              onClick={onClose}
            >
              Use the help mascot on any page to quickly report issues
            </button>
          </div>
        </div>
      )
    },
    {
      title: "How to Pronounce",
      content: (
        <div className="slide-content">
          <div className="pronunciation-image">
            <img 
              src={pronunciationImage} 
              alt={getAltText(t, ALT_TEXT_KEYS.IMAGE_PRONUNCIATION, 'How to Pronounce SGeX')} 
            />
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="collaboration-modal-overlay" 
      onClick={(e) => e.target === e.currentTarget && handleOverlayClick(e)}
      role="presentation"
    >
      <div 
        className="collaboration-modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2>{slides[currentSlide].title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="slideshow-container">
            <div className="slide active">
              {slides[currentSlide].content}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="slide-navigation">
            <button 
              className="nav-button prev" 
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              ‹ Previous
            </button>
            
            <div className="slide-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            
            <button 
              className="nav-button next" 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationModal;