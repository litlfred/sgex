# Video Hosting Options for SGEX Tutorial System

Since video files can be large and GitHub Pages has size limitations, here are several hosting alternatives for tutorial videos:

## Current Video File Sizes

Based on our compression settings (1/3 size reduction):
- **Capture Resolution**: 1366x768 (laptop size)
- **Output Resolution**: ~789x443 (compressed for web)
- **Estimated file sizes**: 5-15 MB per 2-3 minute tutorial
- **Total size for all tutorials**: ~50-150 MB for complete set

## GitHub Hosting Options (Recommended)

### 1. GitHub Releases (Recommended)
- **Pros**: Integrated with repository, version controlled, unlimited bandwidth
- **Cons**: Manual upload process, 2GB per file limit
- **Implementation**: Upload tutorial videos as release assets
- **Access**: Direct links like `https://github.com/owner/repo/releases/download/v1.0/tutorial-name.mp4`

### 2. GitHub Large File Storage (LFS)
- **Pros**: Git integration, version controlled
- **Cons**: 1GB free bandwidth per month, then paid
- **Implementation**: Store videos in `tutorials/` folder with LFS tracking
- **Cost**: $5/month for 50GB bandwidth pack

### 3. GitHub Artifacts (Temporary)
- **Pros**: Free, automated via GitHub Actions
- **Cons**: 90-day retention limit, requires download workflow
- **Implementation**: GitHub Actions generates and uploads artifacts
- **Use case**: Temporary hosting for testing/review

## External Hosting Options

### 4. CDN Integration
- **Cloudflare R2**: $0.015/GB storage, $0.01/GB bandwidth
- **AWS S3 + CloudFront**: Similar pricing, enterprise features
- **Implementation**: Upload via GitHub Actions, serve via CDN

### 5. Video Platforms
- **YouTube**: Free, excellent compression, built-in player
- **Vimeo**: Professional features, custom player
- **Implementation**: Upload via API, embed in documentation

## Recommended Implementation

### Option 1: GitHub Releases (Best for SGEX)
```yaml
# GitHub Actions workflow addition
- name: Upload tutorials to release
  uses: softprops/action-gh-release@v1
  with:
    files: tutorials/*.mp4
    tag_name: tutorial-v${{ github.run_number }}
    name: Tutorial Videos ${{ github.run_number }}
```

### Option 2: Hybrid Approach
- **Small tutorials** (< 10MB): GitHub Releases
- **Large tutorials** (> 10MB): Cloudflare R2 with CDN
- **Documentation**: Generate index with appropriate links

## Implementation Steps

1. **Modify GitHub Actions workflow** to upload to releases instead of artifacts
2. **Update documentation generator** to create links to release assets
3. **Add `.gitignore` entries** to exclude video files from repository
4. **Create release management script** for automated uploads

## Cost Analysis

For ~100MB of tutorial videos:
- **GitHub Releases**: Free
- **GitHub LFS**: ~$5/month after free tier
- **Cloudflare R2**: ~$2/month
- **YouTube**: Free

## Recommended Solution

**GitHub Releases** is the best option because:
- ✅ Free and unlimited
- ✅ Integrated with repository
- ✅ Version controlled
- ✅ No bandwidth limitations
- ✅ Direct HTTP access
- ✅ Works with existing GitHub infrastructure

Would you like me to implement the GitHub Releases approach?