#!/usr/bin/env node

/**
 * Build-time Repository Configuration Script
 * 
 * This script extracts repository information and sets environment variables
 * for use in the React build process. It's designed to be run before build
 * to inject the correct repository configuration.
 */

const fs = require('fs');
const path = require('path');

// Central fallback repository configuration (shared with repositoryConfig.js)
const FALLBACK_REPOSITORY = {
  owner: 'litlfred',
  name: 'sgex',
  fullName: 'litlfred/sgex'
};

function extractRepositoryInfo() {
  try {
    // Try build-time environment variables first
    const envOwner = process.env.REACT_APP_REPO_OWNER;
    const envRepo = process.env.REACT_APP_REPO_NAME;
    
    if (envOwner && envRepo) {
      return { owner: envOwner, name: envRepo, source: 'environment' };
    }

    // Read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Extract repository info from package.json
    let packageRepoInfo = null;
    let repositoryUrl = null;
    
    if (packageJson.repository) {
      if (typeof packageJson.repository === 'string') {
        repositoryUrl = packageJson.repository;
      } else if (packageJson.repository.url) {
        repositoryUrl = packageJson.repository.url;
      }
    }
    
    // Parse GitHub repository URL from package.json
    if (repositoryUrl) {
      // Handle various GitHub URL formats:
      // - https://github.com/owner/repo.git
      // - git+https://github.com/owner/repo.git
      // - git://github.com/owner/repo.git
      // - owner/repo
      const match = repositoryUrl.match(/(?:github\.com[/:])?([\w-]+)\/([\w-]+?)(?:\.git)?$/);
      
      if (match) {
        const [, owner, name] = match;
        packageRepoInfo = { owner, name, source: 'package.json' };
      }
    }
    
    // Try to get from git remote
    let gitRepoInfo = null;
    try {
      const { execSync } = require('child_process');
      const gitRemote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const match = gitRemote.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(?:\.git)?$/);
      
      if (match) {
        const [, owner, name] = match;
        gitRepoInfo = { owner, name, source: 'git-remote' };
      }
    } catch (error) {
      console.warn('Could not extract repository from git remote:', error.message);
    }
    
    // Check for mismatch between package.json and git remote
    if (packageRepoInfo && gitRepoInfo) {
      const packageRepo = `${packageRepoInfo.owner}/${packageRepoInfo.name}`;
      const gitRepo = `${gitRepoInfo.owner}/${gitRepoInfo.name}`;
      
      if (packageRepo !== gitRepo) {
        console.warn('⚠️  REPOSITORY MISMATCH DETECTED:');
        console.warn(`   package.json repository: ${packageRepo}`);
        console.warn(`   git remote origin:       ${gitRepo}`);
        console.warn('');
        console.warn('   RECOMMENDATION:');
        console.warn('   1. Update package.json repository field to match git remote, OR');
        console.warn('   2. Change git remote origin to match package.json');
        console.warn('   3. Set environment variables REACT_APP_REPO_OWNER and REACT_APP_REPO_NAME to override');
        console.warn('');
        console.warn('   Using git remote as source of truth for now...');
        return gitRepoInfo;
      }
    }
    
    // Use package.json if available, otherwise git remote
    if (packageRepoInfo) {
      return packageRepoInfo;
    }
    
    if (gitRepoInfo) {
      return gitRepoInfo;
    }
    
    // Default fallback
    return { 
      owner: FALLBACK_REPOSITORY.owner, 
      name: FALLBACK_REPOSITORY.name, 
      source: 'default' 
    };
    
  } catch (error) {
    console.error('Error extracting repository info:', error);
    return { 
      owner: FALLBACK_REPOSITORY.owner, 
      name: FALLBACK_REPOSITORY.name, 
      source: 'error-fallback' 
    };
  }
}

function setEnvironmentVariables(repoInfo) {
  // Create .env file for build
  const envContent = `# Auto-generated repository configuration
REACT_APP_REPO_OWNER=${repoInfo.owner}
REACT_APP_REPO_NAME=${repoInfo.name}
REACT_APP_REPO_FULL_NAME=${repoInfo.owner}/${repoInfo.name}
REACT_APP_REPO_CONFIG_SOURCE=${repoInfo.source}
`;

  try {
    fs.writeFileSync('.env.build', envContent);
    console.log(`✅ Repository configuration set from ${repoInfo.source}:`);
    console.log(`   Owner: ${repoInfo.owner}`);
    console.log(`   Name: ${repoInfo.name}`);
    console.log(`   Full: ${repoInfo.owner}/${repoInfo.name}`);
    console.log(`   Env file: .env.build`);
    
    // Also update 404.html with dynamic repository configuration
    updateStaticFiles(repoInfo);
  } catch (error) {
    console.error('❌ Failed to write .env.build file:', error);
  }
}

function updateStaticFiles(repoInfo) {
  try {
    const notFoundPath = path.join(process.cwd(), 'public', '404.html');
    
    if (fs.existsSync(notFoundPath)) {
      let content = fs.readFileSync(notFoundPath, 'utf8');
      
      // Replace hardcoded repository references
      const oldRepo = FALLBACK_REPOSITORY.fullName;
      const newRepo = `${repoInfo.owner}/${repoInfo.name}`;
      
      // Replace GitHub URLs and repository references
      content = content.replace(
        new RegExp(`https://github\\.com/${oldRepo.replace('/', '\\/')}/`, 'g'),
        `https://github.com/${newRepo}/`
      );
      content = content.replace(
        new RegExp(`https://${FALLBACK_REPOSITORY.owner}\\.github\\.io/${FALLBACK_REPOSITORY.name}/`, 'g'),
        `https://${repoInfo.owner}.github.io/${repoInfo.name}/`
      );
      
      fs.writeFileSync(notFoundPath, content);
      console.log(`✅ Updated 404.html with repository: ${newRepo}`);
    }
  } catch (error) {
    console.warn(`⚠️ Failed to update static files: ${error.message}`);
  }
}

function main() {
  console.log('🔧 Configuring repository settings for build...');
  
  const repoInfo = extractRepositoryInfo();
  setEnvironmentVariables(repoInfo);
  
  console.log('✨ Repository configuration complete!');
}

if (require.main === module) {
  main();
}

module.exports = { extractRepositoryInfo, setEnvironmentVariables, updateStaticFiles, FALLBACK_REPOSITORY };