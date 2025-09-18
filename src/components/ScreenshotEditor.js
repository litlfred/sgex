import React, { useState, useRef, useEffect, useCallback } from 'react';

const ScreenshotEditor = ({ 
  screenshotBlob, 
  onSave, 
  onCancel,
  isOpen 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('draw');
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [image, setImage] = useState(null);
  const [cropStart, setCropStart] = useState(null);
  const [cropEnd, setCropEnd] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [originalImageData, setOriginalImageData] = useState(null);

  // Available colors for drawing
  const colors = [
    '#ff0000', // Red
    '#00ff00', // Green  
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#ffffff', // White
    '#000000', // Black
    '#ffa500', // Orange
    '#800080'  // Purple
  ];

  // Load image from blob
  useEffect(() => {
    if (screenshotBlob && isOpen) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          // Store original image data for reset functionality
          setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }
      };
      img.src = URL.createObjectURL(screenshotBlob);
      
      return () => {
        URL.revokeObjectURL(img.src);
      };
    }
  }, [screenshotBlob, isOpen]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  // Handle mouse down
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    if (currentTool === 'crop') {
      setCropStart(pos);
      setCropEnd(pos);
      setIsCropping(true);
    } else if (currentTool === 'draw' || currentTool === 'highlight') {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      
      // Set drawing style based on tool
      if (currentTool === 'highlight') {
        ctx.globalAlpha = 0.3;
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = currentTool === 'highlight' ? lineWidth * 3 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [currentTool, getMousePos, drawColor, lineWidth]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    if (currentTool === 'crop' && isCropping) {
      setCropEnd(pos);
      
      // Redraw image and crop selection
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (image) {
        ctx.drawImage(image, 0, 0);
      }
      
      // Draw crop selection rectangle
      const startX = Math.min(cropStart.x, pos.x);
      const startY = Math.min(cropStart.y, pos.y);
      const width = Math.abs(pos.x - cropStart.x);
      const height = Math.abs(pos.y - cropStart.y);
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(startX, startY, width, height);
      ctx.setLineDash([]);
      
    } else if ((currentTool === 'draw' || currentTool === 'highlight') && isDrawing) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }, [currentTool, isCropping, cropStart, isDrawing, getMousePos, image]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (currentTool === 'crop' && isCropping) {
      setIsCropping(false);
    } else if (currentTool === 'draw' || currentTool === 'highlight') {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.globalAlpha = 1; // Reset alpha
    }
  }, [currentTool, isCropping]);

  // Apply crop
  const applyCrop = () => {
    if (!cropStart || !cropEnd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const startX = Math.min(cropStart.x, cropEnd.x);
    const startY = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    if (width > 0 && height > 0) {
      // Get the cropped image data
      const imageData = ctx.getImageData(startX, startY, width, height);
      
      // Resize canvas to cropped dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw the cropped image
      ctx.putImageData(imageData, 0, 0);
      
      // Reset crop state
      setCropStart(null);
      setCropEnd(null);
      setCurrentTool('draw');
    }
  };

  // Reset to original image
  const resetImage = () => {
    if (originalImageData && image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.putImageData(originalImageData, 0, 0);
      
      setCropStart(null);
      setCropEnd(null);
      setCurrentTool('draw');
    }
  };

  // Save edited image
  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/png');
  };

  if (!isOpen || !screenshotBlob) {
    return null;
  }

  return (
    <div className="screenshot-editor-overlay">
      <div className="screenshot-editor">
        <div className="screenshot-editor-header">
          <h3>Edit Screenshot</h3>
          <button 
            className="close-btn"
            onClick={onCancel}
            aria-label="Close screenshot editor"
          >
            ×
          </button>
        </div>

        <div className="screenshot-editor-content">
          {/* Toolbar */}
          <div className="screenshot-toolbar">
            <div className="tool-group">
              <span className="info-label">Tool:</span>
              <button
                className={`tool-btn ${currentTool === 'draw' ? 'active' : ''}`}
                onClick={() => setCurrentTool('draw')}
              >
                Draw
              </button>
              <button
                className={`tool-btn ${currentTool === 'highlight' ? 'active' : ''}`}
                onClick={() => setCurrentTool('highlight')}
              >
                Highlight
              </button>
              <button
                className={`tool-btn ${currentTool === 'crop' ? 'active' : ''}`}
                onClick={() => setCurrentTool('crop')}
              >
                Crop
              </button>
            </div>

            {(currentTool === 'draw' || currentTool === 'highlight') && (
              <div className="tool-group">
                <span className="info-label">Color:</span>
                <div className="color-palette">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`color-btn ${drawColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setDrawColor(color)}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            )}

            {(currentTool === 'draw' || currentTool === 'highlight') && (
              <div className="tool-group">
                <label htmlFor="screenshot-size-slider">Size:</label>
                <input
                  id="screenshot-size-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseInt(e.target.value))}
                  className="size-slider"
                />
                <span className="size-value">{lineWidth}px</span>
              </div>
            )}

            {currentTool === 'crop' && cropStart && cropEnd && (
              <div className="tool-group">
                <button
                  className="action-btn primary"
                  onClick={applyCrop}
                >
                  Apply Crop
                </button>
              </div>
            )}

            <div className="tool-group">
              <button
                className="action-btn secondary"
                onClick={resetImage}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              className="screenshot-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Instructions */}
          <div className="editor-instructions">
            {currentTool === 'draw' && (
              <p>Click and drag to draw on the screenshot</p>
            )}
            {currentTool === 'highlight' && (
              <p>Click and drag to highlight areas (semi-transparent)</p>
            )}
            {currentTool === 'crop' && (
              <p>Click and drag to select an area to crop, then click "Apply Crop"</p>
            )}
          </div>
        </div>

        <div className="screenshot-editor-footer">
          <button
            className="action-btn secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="action-btn primary"
            onClick={handleSave}
          >
            Save & Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotEditor;