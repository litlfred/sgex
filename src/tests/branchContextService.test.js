import branchContextService from '../services/branchContextService';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

describe('BranchContextService', () => {
  const mockRepository = {
    name: 'test-repo',
    owner: { login: 'test-owner' },
    full_name: 'test-owner/test-repo',
    default_branch: 'main'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('getRepositoryKey', () => {
    it('should generate correct repository key from owner and name', () => {
      const key = branchContextService.getRepositoryKey(mockRepository);
      expect(key).toBe('test-owner/test-repo');
    });

    it('should handle repository with full_name format', () => {
      const repo = {
        name: 'test-repo',
        full_name: 'test-owner/test-repo'
      };
      const key = branchContextService.getRepositoryKey(repo);
      expect(key).toBe('test-owner/test-repo');
    });

    it('should return null for invalid repository', () => {
      expect(branchContextService.getRepositoryKey(null)).toBeNull();
      expect(branchContextService.getRepositoryKey({})).toBeNull();
    });
  });

  describe('getSelectedBranch', () => {
    it('should return null when no branch context exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const branch = branchContextService.getSelectedBranch(mockRepository);
      expect(branch).toBeNull();
    });

    it('should return stored branch for repository', () => {
      const storedContext = {
        'test-owner/test-repo': 'feature-branch'
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedContext));
      
      const branch = branchContextService.getSelectedBranch(mockRepository);
      expect(branch).toBe('feature-branch');
    });

    it('should handle corrupted storage gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid-json');
      
      const branch = branchContextService.getSelectedBranch(mockRepository);
      expect(branch).toBeNull();
    });
  });

  describe('setSelectedBranch', () => {
    it('should store branch for repository', () => {
      mockSessionStorage.getItem.mockReturnValue('{}');
      
      branchContextService.setSelectedBranch(mockRepository, 'feature-branch');
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'sgex_branch_context',
        JSON.stringify({ 'test-owner/test-repo': 'feature-branch' })
      );
    });

    it('should merge with existing context', () => {
      const existingContext = {
        'other-owner/other-repo': 'main'
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(existingContext));
      
      branchContextService.setSelectedBranch(mockRepository, 'feature-branch');
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'sgex_branch_context',
        JSON.stringify({ 
          'other-owner/other-repo': 'main',
          'test-owner/test-repo': 'feature-branch' 
        })
      );
    });

    it('should handle invalid inputs gracefully', () => {
      branchContextService.setSelectedBranch(null, 'branch');
      branchContextService.setSelectedBranch(mockRepository, null);
      
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getDefaultBranchName', () => {
    it('should prefer "main" when available', () => {
      const branches = [
        { name: 'master' },
        { name: 'main' },
        { name: 'develop' }
      ];
      
      const defaultBranch = branchContextService.getDefaultBranchName(mockRepository, branches);
      expect(defaultBranch).toBe('main');
    });

    it('should use repository default branch if "main" not available', () => {
      const branches = [
        { name: 'master' },
        { name: 'develop' }
      ];
      const repo = { ...mockRepository, default_branch: 'master' };
      
      const defaultBranch = branchContextService.getDefaultBranchName(repo, branches);
      expect(defaultBranch).toBe('master');
    });

    it('should use first available branch as fallback', () => {
      const branches = [
        { name: 'develop' },
        { name: 'feature' }
      ];
      const repo = { ...mockRepository, default_branch: 'non-existent' };
      
      const defaultBranch = branchContextService.getDefaultBranchName(repo, branches);
      expect(defaultBranch).toBe('develop');
    });

    it('should return "main" when no branches available', () => {
      const defaultBranch = branchContextService.getDefaultBranchName(mockRepository, []);
      expect(defaultBranch).toBe('main');
    });
  });

  describe('clearAllBranchContext', () => {
    it('should remove branch context from session storage', () => {
      branchContextService.clearAllBranchContext();
      
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('sgex_branch_context');
    });
  });

  describe('hasBranchContext', () => {
    it('should return true when branch context exists', () => {
      const storedContext = {
        'test-owner/test-repo': 'feature-branch'
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedContext));
      
      const hasContext = branchContextService.hasBranchContext(mockRepository);
      expect(hasContext).toBe(true);
    });

    it('should return false when no branch context exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const hasContext = branchContextService.hasBranchContext(mockRepository);
      expect(hasContext).toBe(false);
    });
  });

  describe('getBranchDisplayInfo', () => {
    it('should return display info for selected branch', () => {
      const storedContext = {
        'test-owner/test-repo': 'main'
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedContext));
      
      const displayInfo = branchContextService.getBranchDisplayInfo(mockRepository);
      expect(displayInfo).toEqual({
        branch: 'main',
        isDefault: true,
        displayText: 'main (default)'
      });
    });

    it('should return null when no branch context exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const displayInfo = branchContextService.getBranchDisplayInfo(mockRepository);
      expect(displayInfo).toBeNull();
    });
  });
});