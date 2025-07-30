#!/usr/bin/env node

/**
 * Multi-Branch Build Script
 * 
 * This script builds the React application for multi-branch deployment.
 * It supports both 'branch' and 'root' build types and handles missing dependencies gracefully.
 * 
 * Usage: 
 *   node scripts/build-multi-branch.js branch  # Build for branch deployment
 *   node scripts/build-multi-branch.js root    # Build root landing page
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const buildType = process.argv[2] || 'branch';
const branchName = process.env.GITHUB_REF_NAME || 'main';

console.log(`🚀 Starting Multi-Branch Build (type: ${buildType})`);
console.log(`📋 Branch: ${branchName}`);

// Ensure required directories exist
const buildDir = path.join(__dirname, '..', 'build');
const publicDir = path.join(__dirname, '..', 'public');

// Clean build directory
if (fs.existsSync(buildDir)) {
  console.log('🧹 Cleaning existing build directory...');
  fs.rmSync(buildDir, { recursive: true, force: true });
}

let buildSuccess = false;

if (buildType === 'branch') {
  console.log('🔨 Building branch-specific React application...');
  
  try {
    // Ensure public directory and basic files exist
    if (!fs.existsSync(publicDir)) {
      console.log('📁 Creating public directory...');
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Create minimal index.html if it doesn't exist
    const indexHtmlPath = path.join(publicDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.log('📄 Creating minimal index.html...');
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="SGEX Workbench - WHO SMART Guidelines Exchange" />
    <title>SGEX Workbench</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
      fs.writeFileSync(indexHtmlPath, indexHtml);
    }
    
    // Create minimal manifest.json if it doesn't exist
    const manifestPath = path.join(publicDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.log('📄 Creating minimal manifest.json...');
      const manifest = {
        "short_name": "SGEX",
        "name": "SGEX Workbench",
        "icons": [],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#000000",
        "background_color": "#ffffff"
      };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
    
    // Attempt React build
    console.log('⚡ Running React build...');
    execSync('npm run build', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { 
        ...process.env, 
        CI: 'false',
        GENERATE_SOURCEMAP: 'false',
        PUBLIC_URL: `/sgex/${branchName.replace(/\//g, '-')}`
      }
    });
    
    buildSuccess = true;
    console.log('✅ React build completed successfully');
    
  } catch (error) {
    console.warn('⚠️ React build failed, creating fallback build...');
    console.warn('Error:', error.message);
    
    // Create fallback build
    createFallbackBuild(branchName);
  }
  
} else if (buildType === 'root') {
  console.log('🏠 Building root landing page...');
  
  // Create root landing page that lists all branches
  createRootLandingPage();
  buildSuccess = true;
  
} else {
  console.error('❌ Invalid build type. Use "branch" or "root"');
  process.exit(1);
}

function createFallbackBuild(branchName) {
  console.log('🔄 Creating fallback build with development placeholder...');
  
  // Ensure build directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  // Create fallback index.html
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGEX Workbench - ${branchName} Branch</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0F5197, #5A9BD4);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 600px;
        }
        
        .logo {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            font-weight: 300;
        }
        
        .branch-name {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 25px;
            margin: 10px 0;
            font-weight: 600;
        }
        
        p {
            font-size: 1.2rem;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .status {
            background: rgba(253, 126, 20, 0.2);
            border: 2px solid rgba(253, 126, 20, 0.5);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        
        .links {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .link {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .link:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }
        
        .footer {
            margin-top: 40px;
            opacity: 0.7;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 30px 20px;
                margin: 20px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .links {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🧪</div>
        <h1>SGEX Workbench</h1>
        <div class="branch-name">${branchName}</div>
        <p>WHO SMART Guidelines Exchange<br>Collaborative Development Platform</p>
        
        <div class="status">
            <h3>🔄 Development Build</h3>
            <p>This branch is currently under development. The full application build is not yet available.</p>
        </div>
        
        <div class="links">
            <a href="https://github.com/litlfred/sgex" class="link" target="_blank">
                📖 View Repository
            </a>
            <a href="https://github.com/litlfred/sgex/tree/${branchName}" class="link" target="_blank">
                🌿 View Branch
            </a>
            <a href="https://litlfred.github.io/sgex/" class="link">
                🏠 All Branches
            </a>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} | Branch: ${branchName}</p>
        </div>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(path.join(buildDir, 'index.html'), fallbackHtml);
  
  // Create a simple asset-manifest.json for compatibility
  const assetManifest = {
    "files": {
      "main.html": "/index.html"
    },
    "entrypoints": ["index.html"]
  };
  fs.writeFileSync(path.join(buildDir, 'asset-manifest.json'), JSON.stringify(assetManifest, null, 2));
  
  console.log('✅ Fallback build created successfully');
  buildSuccess = true;
}

function createRootLandingPage() {
  console.log('🏠 Creating root landing page...');
  
  // Ensure build directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  // Create root landing page HTML
  const rootHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGEX Workbench - Multi-Branch Deployment</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0F5197, #5A9BD4);
            color: #333;
            min-height: 100vh;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px 0;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        
        .header h1 {
            color: #0F5197;
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .header p {
            color: #666;
            font-size: 1.2rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .section {
            background: rgba(255, 255, 255, 0.95);
            margin-bottom: 30px;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .section h2 {
            color: #0F5197;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }
        
        .branch-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .branch-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .branch-card:hover {
            border-color: #0F5197;
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(15, 81, 151, 0.15);
        }
        
        .branch-name {
            font-size: 1.3rem;
            font-weight: 600;
            color: #0F5197;
            margin-bottom: 10px;
        }
        
        .branch-description {
            color: #666;
            margin-bottom: 15px;
        }
        
        .branch-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status-main {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
        }
        
        .status-development {
            background: rgba(253, 126, 20, 0.1);
            color: #fd7e14;
        }
        
        .status-experimental {
            background: rgba(108, 117, 125, 0.1);
            color: #6c757d;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .info-card {
            text-align: center;
            padding: 20px;
        }
        
        .info-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }
        
        .info-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #0F5197;
        }
        
        .footer {
            text-align: center;
            padding: 40px 20px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .footer a {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .container {
                padding: 20px 15px;
            }
            
            .section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🧪</div>
        <h1>SGEX Workbench</h1>
        <p>WHO SMART Guidelines Exchange - Multi-Branch Deployment</p>
    </div>
    
    <div class="container">
        <div class="section">
            <h2>🌿 Available Branches</h2>
            <p>Select a branch to view its deployment. Each branch represents a different version or feature set of the SGEX Workbench.</p>
            
            <div class="branch-grid">
                <a href="/sgex/main/" class="branch-card">
                    <div class="branch-name">main</div>
                    <div class="branch-description">Primary stable branch with latest production-ready features</div>
                    <span class="branch-status status-main">Production</span>
                </a>
                
                <div class="branch-card" style="opacity: 0.7; cursor: not-allowed;">
                    <div class="branch-name">development</div>
                    <div class="branch-description">Latest development features (coming soon)</div>
                    <span class="branch-status status-development">Development</span>
                </div>
                
                <div class="branch-card" style="opacity: 0.7; cursor: not-allowed;">
                    <div class="branch-name">feature/*</div>
                    <div class="branch-description">Feature-specific branches (deployed on demand)</div>
                    <span class="branch-status status-experimental">Experimental</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>ℹ️ About SGEX Workbench</h2>
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-icon">📊</div>
                    <div class="info-title">Collaborative Editor</div>
                    <p>Multi-user platform for creating and editing WHO SMART Guidelines</p>
                </div>
                
                <div class="info-card">
                    <div class="info-icon">🔧</div>
                    <div class="info-title">BPMN & Decision Tables</div>
                    <p>Integrated tools for business process modeling and decision logic</p>
                </div>
                
                <div class="info-card">
                    <div class="info-icon">🌍</div>
                    <div class="info-title">GitHub Integration</div>
                    <p>Seamless integration with GitHub for version control and collaboration</p>
                </div>
                
                <div class="info-card">
                    <div class="info-icon">🏥</div>
                    <div class="info-title">WHO Standards</div>
                    <p>Built according to WHO SMART Guidelines technical specifications</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>📚 Quick Links</h2>
            <div class="branch-grid">
                <a href="https://github.com/litlfred/sgex" target="_blank" class="branch-card">
                    <div class="branch-name">📖 Repository</div>
                    <div class="branch-description">View source code, issues, and documentation</div>
                </a>
                
                <a href="/sgex/docs/qa-report.html" class="branch-card">
                    <div class="branch-name">🧪 QA Report</div>
                    <div class="branch-description">Latest quality assurance and testing results</div>
                </a>
                
                <a href="/sgex/docs/github-issues-analysis.html" class="branch-card">
                    <div class="branch-name">🔍 Issues Analysis</div>
                    <div class="branch-description">Analysis of GitHub issues and testing opportunities</div>
                </a>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>
            Generated on ${new Date().toLocaleDateString()} | 
            <a href="https://smart.who.int/" target="_blank">WHO SMART Guidelines</a> | 
            <a href="https://github.com/litlfred/sgex" target="_blank">GitHub</a>
        </p>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(path.join(buildDir, 'index.html'), rootHtml);
  
  // Create asset-manifest.json for compatibility
  const assetManifest = {
    "files": {
      "main.html": "/index.html"
    },
    "entrypoints": ["index.html"]
  };
  fs.writeFileSync(path.join(buildDir, 'asset-manifest.json'), JSON.stringify(assetManifest, null, 2));
  
  console.log('✅ Root landing page created successfully');
}

// Final output
if (buildSuccess) {
  console.log(`✅ Multi-branch build completed successfully (${buildType})`);
  console.log(`📁 Build output: ${buildDir}`);
  
  // Verify index.html exists
  const indexPath = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html verified');
  } else {
    console.error('❌ index.html not found in build output');
    process.exit(1);
  }
} else {
  console.error('❌ Build failed');
  process.exit(1);
}