/**
 * Shared PR Comment Management for GitHub Actions
 * 
 * Provides common functionality for finding and updating PR comments
 * with consistent behavior across different workflows.
 */

class PRCommentManager {
  constructor(github, context, commentMarker) {
    this.github = github;
    this.context = context;
    this.commentMarker = commentMarker;
  }
  
  /**
   * Find existing comment with the given marker
   * @param {number} prNumber - Pull request number
   * @returns {Promise<object|null>} - Existing comment or null
   */
  async findExistingComment(prNumber) {
    try {
      const { data: comments } = await this.github.rest.issues.listComments({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: prNumber,
      });
      
      return comments.find(comment => 
        comment.body && comment.body.includes(this.commentMarker)
      ) || null;
    } catch (error) {
      console.error('Error finding existing comment:', error);
      return null;
    }
  }
  
  /**
   * Update existing comment or create new one
   * @param {number} prNumber - Pull request number
   * @param {string} body - Comment body with marker included
   * @returns {Promise<boolean>} - Success status
   */
  async updateOrCreateComment(prNumber, body) {
    try {
      const existing = await this.findExistingComment(prNumber);
      
      if (existing) {
        // Update existing comment
        console.log(`Updating existing comment (ID: ${existing.id})`);
        await this.github.rest.issues.updateComment({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          comment_id: existing.id,
          body: body
        });
        console.log('✅ Comment updated successfully');
      } else {
        // Create new comment
        console.log('Creating new comment');
        await this.github.rest.issues.createComment({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          issue_number: prNumber,
          body: body
        });
        console.log('✅ Comment created successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating/creating comment:', error);
      return false;
    }
  }
  
  /**
   * Delete comment if it exists
   * @param {number} prNumber - Pull request number
   * @returns {Promise<boolean>} - Success status
   */
  async deleteCommentIfExists(prNumber) {
    try {
      const existing = await this.findExistingComment(prNumber);
      
      if (existing) {
        console.log(`Deleting comment (ID: ${existing.id})`);
        await this.github.rest.issues.deleteComment({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          comment_id: existing.id
        });
        console.log('✅ Comment deleted successfully');
        return true;
      }
      
      console.log('No comment found to delete');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }
}

module.exports = PRCommentManager;
