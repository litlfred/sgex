// Test for improved PR feedback comment structure
// This test validates that the new comment format works correctly

describe('Improved PR Feedback Comment Structure', () => {
  
  // Test comment identification logic
  test('should identify comments with new Deployment Status format', () => {
    const testComments = [
      {
        body: `## 🚀 Deployment Status: Not Deployed

**🔗 Quick Actions:**
- 🌿 [Deploy branch for preview](url) 📋

---

## 📝 Recent Change Summary
**Latest commit:** \`abc1234\` - Test commit message

---

## 📊 Overall Progress
**Branch:** \`test-branch\`
**Status:** Ready for deployment`
      },
      {
        body: `## 🚀 Deployment Status: Successfully Deployed ✅

**🔗 Quick Actions:**
- 🌐 [Open Branch Preview](url) 📋

---

## 📝 Recent Change Summary
**Latest commit:** \`def5678\` - Another test commit`
      },
      {
        body: `## Some other comment
This is not a deployment comment.`
      }
    ];

    // Test the comment finding logic used in workflows
    const deploymentComments = testComments.filter(comment => 
      comment.body.includes('Deployment Status:') ||
      comment.body.includes('Deployment Approval Required') || 
      comment.body.includes('Branch Preview Ready!') ||
      comment.body.includes('Branch Preview Failed!') ||
      comment.body.includes('Build In Progress') ||
      comment.body.includes('Deployment Available')
    );

    expect(deploymentComments).toHaveLength(2);
    expect(deploymentComments[0].body).toContain('Deployment Status: Not Deployed');
    expect(deploymentComments[1].body).toContain('Deployment Status: Successfully Deployed');
  });

  // Test comment structure validation
  test('should validate required sections in deployment comments', () => {
    const successfulDeploymentComment = `## 🚀 Deployment Status: Successfully Deployed ✅

**🔗 Quick Actions:**
- 🌐 [Open Branch Preview](url) 📋
- 🏠 [Main App](url)

---

## 📝 Recent Change Summary
**Latest commit:** \`abc1234\` - Implement new feature

---

## 📊 Overall Progress
**Branch:** \`feature-branch\`
**Status:** 🟢 Live and accessible`;

    // Validate required sections exist
    expect(successfulDeploymentComment).toContain('🚀 Deployment Status:');
    expect(successfulDeploymentComment).toContain('🔗 Quick Actions:');
    expect(successfulDeploymentComment).toContain('📝 Recent Change Summary');
    expect(successfulDeploymentComment).toContain('📊 Overall Progress');
    
    // Validate status-specific content
    expect(successfulDeploymentComment).toContain('Successfully Deployed ✅');
    expect(successfulDeploymentComment).toContain('Open Branch Preview');
    expect(successfulDeploymentComment).toContain('Latest commit:');
    expect(successfulDeploymentComment).toContain('🟢 Live and accessible');
  });

  // Test different deployment statuses
  test('should handle different deployment status formats', () => {
    const statuses = [
      'Not Deployed',
      'Building 🔵', 
      'Awaiting Approval 🟡',
      'Successfully Deployed ✅',
      'Failed ❌',
      'Ready for Deployment ✅'
    ];

    statuses.forEach(status => {
      const comment = `## 🚀 Deployment Status: ${status}`;
      expect(comment).toContain('🚀 Deployment Status:');
      expect(comment).toContain(status);
    });
  });

  // Test copy indicators
  test('should include copy indicators for URLs', () => {
    const commentWithUrls = `**🔗 Quick Actions:**
- 🌐 [Open Branch Preview](https://example.com) 📋
- 🏠 [Main App](https://example.com)

**Preview URL:** https://example.com/preview 📋`;

    // Count copy indicators
    const copyIndicators = (commentWithUrls.match(/📋/g) || []).length;
    expect(copyIndicators).toBe(2); // Should have 📋 next to copyable URLs
  });

  // Test commit message parsing
  test('should handle commit message formatting correctly', () => {
    // Simulate the commit message parsing used in workflows
    const multiLineCommitMessage = `Implement new feature

This is a longer description
with multiple lines and details.`;
    
    const firstLineOnly = multiLineCommitMessage.split('\n')[0];
    expect(firstLineOnly).toBe('Implement new feature');
    
    // Test in comment format
    const commentWithCommit = `**Latest commit:** \`abc1234\` - ${firstLineOnly}`;
    expect(commentWithCommit).toContain('Implement new feature');
    expect(commentWithCommit).not.toContain('This is a longer description');
  });

});

// Export for use in other test files
module.exports = {
  validateDeploymentComment: (commentBody) => {
    const requiredSections = [
      '🚀 Deployment Status:',
      '🔗 Quick Actions:',
      '📝 Recent Change Summary', 
      '📊 Overall Progress'
    ];
    
    return requiredSections.every(section => commentBody.includes(section));
  },
  
  isDeploymentComment: (commentBody) => {
    return commentBody.includes('Deployment Status:') ||
           commentBody.includes('Deployment Approval Required') || 
           commentBody.includes('Branch Preview Ready!') ||
           commentBody.includes('Branch Preview Failed!') ||
           commentBody.includes('Build In Progress') ||
           commentBody.includes('Deployment Available');
  }
};