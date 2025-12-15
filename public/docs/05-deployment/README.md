# Deployment Guide

Documentation for deploying SGEX Workbench to various environments, including GitHub Pages, Docker, and custom hosting.

## 📚 Documentation Contents

- **[Overview](overview.md)** - Deployment strategy and architecture
- **[GitHub Pages](github-pages.md)** - GitHub Pages deployment (primary)
- **[Workflows Analysis](workflows-analysis.md)** - CI/CD workflows detailed analysis
- **Docker Deployment** *(Coming Soon)* - Docker containerization
- **Custom Hosting** *(Coming Soon)* - Self-hosted deployment

## 🚀 Deployment Overview

SGEX Workbench uses a **multi-branch deployment strategy** with GitHub Pages as the primary deployment target. Each branch gets its own preview URL, enabling parallel development and testing.

### Deployment Architecture

```
Production: https://litlfred.github.io/sgex/main/
Feature Branches: https://litlfred.github.io/sgex/{branch-name}/
Landing Page: https://litlfred.github.io/sgex/
```

### Key Features
- ✅ Automatic deployment on push
- ✅ Branch-specific preview URLs
- ✅ Pull request integration
- ✅ Independent landing page
- ✅ Zero-downtime deployments

## 📦 Deployment Options

### 1. GitHub Pages (Recommended)
**Best For**: Public projects, collaboration, preview deployments

**Pros**:
- Free hosting
- Automatic HTTPS
- CDN distribution
- GitHub integration
- Multi-branch support

**Cons**:
- Public repositories only (for free)
- Static sites only
- Limited to 1GB size

**Setup**: See [GitHub Pages Guide](github-pages.md)

### 2. Docker Container
**Best For**: Self-hosted environments, custom infrastructure

**Pros**:
- Consistent environment
- Easy scaling
- Version control
- Works anywhere

**Cons**:
- Requires infrastructure
- More complex setup
- Manual updates

**Quick Start**:
```bash
# Build image
docker build -t sgex .

# Run container
docker run -p 3000:3000 sgex
```

### 3. Custom Hosting
**Best For**: Enterprise environments, air-gapped networks

**Pros**:
- Full control
- Custom domains
- Private networks
- Security compliance

**Cons**:
- Manual setup
- Ongoing maintenance
- Infrastructure costs

## 🔄 CI/CD Workflows

### Automated Workflows

#### 1. Branch Deployment
**Trigger**: Push to any branch  
**Action**: Builds and deploys to `/{branch-name}/`  
**Output**: Preview URL in PR comment

**Workflow**: `.github/workflows/branch-deployment.yml`

```yaml
name: Deploy Feature Branch
on:
  push:
    branches-ignore:
      - gh-pages
```

#### 2. Landing Page Deployment
**Trigger**: Manual workflow dispatch  
**Action**: Updates landing page with branch selector  
**Output**: Updated root page

**Workflow**: `.github/workflows/landing-page-deployment.yml`

```yaml
name: Deploy Landing Page
on:
  workflow_dispatch:
```

#### 3. Code Quality
**Trigger**: Pull request  
**Action**: Linting, tests, type checking  
**Output**: Status checks on PR

**Workflow**: `.github/workflows/code-quality.yml`

#### 4. Security Checks
**Trigger**: Pull request  
**Action**: Security scanning, dependency audit  
**Output**: Security report

**Workflow**: `.github/workflows/pr-security-check.yml`

## 🛠️ Manual Deployment

### Build for Production
```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Output in build/ directory
```

### Deploy to GitHub Pages
```bash
# Using gh-pages package
npm install -g gh-pages

# Deploy build directory
gh-pages -d build -b gh-pages
```

### Deploy with GitHub Actions
Push to main branch - automatic deployment triggered.

## 🔐 Environment Configuration

### Environment Variables
Create `.env` file (not committed):
```bash
REACT_APP_GITHUB_API_URL=https://api.github.com
REACT_APP_ENVIRONMENT=production
```

### Build Configuration
`package.json`:
```json
{
  "homepage": "/sgex/"
}
```

### GitHub Pages Configuration
Repository Settings → Pages:
- Source: Deploy from branch
- Branch: `gh-pages`
- Folder: `/ (root)`

## 📊 Deployment Workflow

### Standard Deployment
```
1. Developer pushes to branch
   ↓
2. GitHub Actions triggered
   ↓
3. Build process runs
   ↓
4. Tests executed
   ↓
5. Deploy to GitHub Pages
   ↓
6. Comment added to PR with URL
   ↓
7. Preview available
```

### Landing Page Update
```
1. Manual trigger in GitHub Actions
   ↓
2. Landing page build process
   ↓
3. Preserves existing branch deployments
   ↓
4. Updates root page with branch selector
   ↓
5. Landing page deployed
```

## 🔍 Monitoring & Verification

### Post-Deployment Checks
- [ ] Site loads correctly
- [ ] All routes accessible
- [ ] Assets loading properly
- [ ] No console errors
- [ ] GitHub authentication works
- [ ] DAK selection functional

### Health Check Endpoints
```bash
# Check if site is up
curl https://litlfred.github.io/sgex/main/

# Verify asset loading
curl -I https://litlfred.github.io/sgex/main/static/js/main.js
```

### Debug Deployment Issues
```bash
# Check build logs in GitHub Actions
# Navigate to: Actions → Recent workflow run → View logs

# Verify gh-pages branch content
git checkout gh-pages
ls -la
```

## 🚨 Troubleshooting

### Common Issues

#### Site Shows 404
**Solution**: Verify `homepage` in `package.json` matches deployment path

#### Assets Not Loading
**Solution**: Check PUBLIC_URL environment variable and asset paths

#### Routing Not Working
**Solution**: Verify 404.html is properly configured for SPA routing

#### Build Fails
**Solution**: Check Node.js version, clear `node_modules/`, reinstall

#### GitHub Pages Not Updating
**Solution**: Check gh-pages branch, clear GitHub cache, trigger rebuild

See [Troubleshooting Guide](../01-getting-started/troubleshooting.md) for more.

## 📈 Performance Optimization

### Build Optimization
- Code splitting by route
- Tree shaking unused code
- Minification and compression
- Source maps for debugging

### Deployment Optimization
- CDN caching headers
- Gzip compression
- Image optimization
- Lazy loading components

### Cache Strategy
```javascript
// Service worker caching (future)
{
  "cache-first": ["images", "fonts"],
  "network-first": ["api", "dynamic"],
  "stale-while-revalidate": ["documents"]
}
```

## 🔄 Rollback Procedure

### Rollback to Previous Version
```bash
# Via GitHub Actions
1. Navigate to Actions → Workflows
2. Find successful deployment
3. Re-run workflow

# Via Git
git revert HEAD
git push origin main
```

### Emergency Rollback
```bash
# Revert gh-pages branch to previous commit
git checkout gh-pages
git reset --hard HEAD~1
git push -f origin gh-pages
```

## 📦 Docker Deployment Details

### Building Docker Image
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Running Container
```bash
# Build
docker build -t sgex:latest .

# Run
docker run -d \
  -p 3000:3000 \
  --name sgex \
  sgex:latest

# Check logs
docker logs sgex
```

### Docker Compose
```yaml
version: '3.8'
services:
  sgex:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 🔗 Related Documentation

- [GitHub Pages Guide](github-pages.md) - Detailed GitHub Pages setup
- [Workflows Analysis](workflows-analysis.md) - CI/CD workflows
- [Architecture](../03-architecture/) - System architecture
- [Development Guide](../04-development/) - Development practices

## 🔗 Quick Links

- [Back to Documentation Index](../INDEX.md)
- [Architecture](../03-architecture/)
- [Development Guide](../04-development/)
- [Main README](../../README.md)

## 📞 Support

### Deployment Issues
- Check [GitHub Actions](https://github.com/litlfred/sgex/actions)
- Review [Troubleshooting](../01-getting-started/troubleshooting.md)
- Create [Issue](https://github.com/litlfred/sgex/issues)

### Questions
- [GitHub Discussions](https://github.com/litlfred/sgex/discussions)
- [Documentation Index](../INDEX.md)

---

**Last Updated**: December 2024  
**Deployment Version**: 2.0  
**Maintained By**: SGEX Workbench DevOps Team