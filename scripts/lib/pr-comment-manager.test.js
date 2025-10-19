/**
 * Tests for shared PR Comment Manager
 */

const PRCommentManager = require('./pr-comment-manager');

describe('PRCommentManager', () => {
  let mockGithub;
  let mockContext;
  let manager;

  beforeEach(() => {
    mockGithub = {
      rest: {
        issues: {
          listComments: jest.fn(),
          updateComment: jest.fn(),
          createComment: jest.fn(),
          deleteComment: jest.fn(),
        },
      },
    };

    mockContext = {
      repo: {
        owner: 'test-owner',
        repo: 'test-repo',
      },
    };

    manager = new PRCommentManager(
      mockGithub,
      mockContext,
      '<!-- test-marker -->'
    );
  });

  describe('findExistingComment', () => {
    it('should find existing comment with marker', async () => {
      const mockComments = [
        { id: 1, body: 'Some other comment' },
        { id: 2, body: '<!-- test-marker -->\nTest comment' },
        { id: 3, body: 'Another comment' },
      ];

      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: mockComments,
      });

      const result = await manager.findExistingComment(123);

      expect(result).toEqual(mockComments[1]);
      expect(mockGithub.rest.issues.listComments).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        per_page: 100,
        page: 1,
      });
    });

    it('should handle pagination and find comment across multiple pages', async () => {
      // Create 3 pages of comments (100, 100, 50 comments)
      const page1Comments = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        body: `Comment ${i + 1}`,
      }));

      const page2Comments = Array.from({ length: 100 }, (_, i) => ({
        id: i + 101,
        body: `Comment ${i + 101}`,
      }));

      const page3Comments = [
        { id: 201, body: 'Comment 201' },
        { id: 202, body: '<!-- test-marker -->\nMarked comment on page 3' },
        { id: 203, body: 'Comment 203' },
      ];

      mockGithub.rest.issues.listComments
        .mockResolvedValueOnce({ data: page1Comments })
        .mockResolvedValueOnce({ data: page2Comments })
        .mockResolvedValueOnce({ data: page3Comments });

      const result = await manager.findExistingComment(123);

      expect(result).toEqual(page3Comments[1]);
      expect(mockGithub.rest.issues.listComments).toHaveBeenCalledTimes(3);
      expect(mockGithub.rest.issues.listComments).toHaveBeenNthCalledWith(1, {
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        per_page: 100,
        page: 1,
      });
      expect(mockGithub.rest.issues.listComments).toHaveBeenNthCalledWith(2, {
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        per_page: 100,
        page: 2,
      });
      expect(mockGithub.rest.issues.listComments).toHaveBeenNthCalledWith(3, {
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        per_page: 100,
        page: 3,
      });
    });

    it('should return null if no comment with marker exists', async () => {
      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: [
          { id: 1, body: 'Some comment' },
          { id: 2, body: 'Another comment' },
        ],
      });

      const result = await manager.findExistingComment(123);

      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      mockGithub.rest.issues.listComments.mockRejectedValue(
        new Error('API Error')
      );

      const result = await manager.findExistingComment(123);

      expect(result).toBeNull();
    });
  });

  describe('updateOrCreateComment', () => {
    it('should update existing comment', async () => {
      const existingComment = {
        id: 42,
        body: '<!-- test-marker -->\nOld content',
      };

      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: [existingComment],
      });

      mockGithub.rest.issues.updateComment.mockResolvedValue({});

      const newBody = '<!-- test-marker -->\nNew content';
      const result = await manager.updateOrCreateComment(123, newBody);

      expect(result).toBe(true);
      expect(mockGithub.rest.issues.updateComment).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        comment_id: 42,
        body: newBody,
      });
      expect(mockGithub.rest.issues.createComment).not.toHaveBeenCalled();
    });

    it('should create new comment if none exists', async () => {
      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: [],
      });

      mockGithub.rest.issues.createComment.mockResolvedValue({});

      const newBody = '<!-- test-marker -->\nNew content';
      const result = await manager.updateOrCreateComment(123, newBody);

      expect(result).toBe(true);
      expect(mockGithub.rest.issues.createComment).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        body: newBody,
      });
      expect(mockGithub.rest.issues.updateComment).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: [],
      });

      mockGithub.rest.issues.createComment.mockRejectedValue(
        new Error('API Error')
      );

      const result = await manager.updateOrCreateComment(
        123,
        '<!-- test-marker -->\nContent'
      );

      expect(result).toBe(false);
    });
  });

  describe('deleteCommentIfExists', () => {
    it('should delete existing comment', async () => {
      const existingComment = {
        id: 42,
        body: '<!-- test-marker -->\nContent',
      };

      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: [existingComment],
      });

      mockGithub.rest.issues.deleteComment.mockResolvedValue({});

      const result = await manager.deleteCommentIfExists(123);

      expect(result).toBe(true);
      expect(mockGithub.rest.issues.deleteComment).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        comment_id: 42,
      });
    });

    it('should return true if no comment exists', async () => {
      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: [],
      });

      const result = await manager.deleteCommentIfExists(123);

      expect(result).toBe(true);
      expect(mockGithub.rest.issues.deleteComment).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      const existingComment = {
        id: 42,
        body: '<!-- test-marker -->\nContent',
      };

      mockGithub.rest.issues.listComments.mockResolvedValue({
        data: [existingComment],
      });

      mockGithub.rest.issues.deleteComment.mockRejectedValue(
        new Error('API Error')
      );

      const result = await manager.deleteCommentIfExists(123);

      expect(result).toBe(false);
    });
  });
});
