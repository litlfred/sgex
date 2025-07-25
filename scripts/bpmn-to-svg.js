#!/usr/bin/env node

/**
 * Convert BPMN diagram to SVG
 * This script uses bpmn-js to render BPMN files as SVG
 */

const fs = require('fs');
const path = require('path');
const BpmnJS = require('bpmn-js/lib/Viewer');

// Mock DOM environment for Node.js
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><div id="container"></div>');
global.window = dom.window;
global.document = dom.window.document;

async function convertBpmnToSvg(bpmnFilePath, svgOutputPath) {
  try {
    // Read BPMN file
    const bpmnXml = fs.readFileSync(bpmnFilePath, 'utf8');
    
    // Create container element
    const container = document.getElementById('container');
    
    // Initialize BPMN viewer
    const viewer = new BpmnJS({
      container,
      width: 1600,
      height: 1200
    });
    
    // Import BPMN diagram
    await viewer.importXML(bpmnXml);
    
    // Export as SVG
    const { svg } = await viewer.saveSVG();
    
    // Write SVG to file
    fs.writeFileSync(svgOutputPath, svg);
    
    console.log(`Successfully converted ${bpmnFilePath} to ${svgOutputPath}`);
    
    // Clean up
    viewer.destroy();
    
  } catch (error) {
    console.error('Error converting BPMN to SVG:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const bpmnFile = process.argv[2];
  const svgFile = process.argv[3];
  
  if (!bpmnFile || !svgFile) {
    console.error('Usage: node bpmn-to-svg.js <input.bpmn> <output.svg>');
    process.exit(1);
  }
  
  convertBpmnToSvg(bpmnFile, svgFile)
    .then(() => {
      console.log('Conversion completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Conversion failed:', error.message);
      process.exit(1);
    });
}

module.exports = { convertBpmnToSvg };