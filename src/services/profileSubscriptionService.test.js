import profileSubscriptionService from '../services/profileSubscriptionService';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: jest.fn((key) => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ProfileSubscriptionService', () => {
  beforeEach(() => {
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('getSubscriptions', () => {
    it('should return WHO profile when no subscriptions exist', () => {
      const subscriptions = profileSubscriptionService.getSubscriptions();
      
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].login).toBe('WorldHealthOrganization');
      expect(subscriptions[0].isPermanent).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled(); // Should save WHO profile
    });

    it('should return stored subscriptions with WHO ensured', () => {
      const testSubscriptions = [
        {
          login: 'testuser',
          name: 'Test User',
          type: 'User',
          isPermanent: false
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(testSubscriptions);

      const subscriptions = profileSubscriptionService.getSubscriptions();
      
      expect(subscriptions.length).toBeGreaterThanOrEqual(2);
      expect(subscriptions.find(p => p.login === 'WorldHealthOrganization')).toBeDefined();
      expect(subscriptions.find(p => p.login === 'testuser')).toBeDefined();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const subscriptions = profileSubscriptionService.getSubscriptions();
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].login).toBe('WorldHealthOrganization');
    });
  });

  describe('addSubscription', () => {
    it('should add a new subscription', () => {
      const profile = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/testuser.png',
        type: 'User'
      };

      const result = profileSubscriptionService.addSubscription(profile);
      
      expect(result).toMatchObject({
        login: 'testuser',
        name: 'Test User',
        type: 'User',
        isPermanent: false
      });
      expect(result.addedAt).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should update existing subscription', () => {
      const existing = [
        {
          login: 'testuser',
          name: 'Old Name',
          isPermanent: false,
          addedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(existing);

      const updatedProfile = {
        login: 'testuser',
        name: 'New Name',
        type: 'User'
      };

      const result = profileSubscriptionService.addSubscription(updatedProfile);
      
      expect(result.name).toBe('New Name');
      expect(result.lastUpdated).toBeDefined();
      
      const subscriptions = profileSubscriptionService.getSubscriptions();
      expect(subscriptions.filter(p => p.login === 'testuser')).toHaveLength(1);
    });

    it('should make subscription permanent when specified', () => {
      const profile = { login: 'testuser', name: 'Test User' };
      
      const result = profileSubscriptionService.addSubscription(profile, true);
      expect(result.isPermanent).toBe(true);
    });

    it('should throw error for invalid profile', () => {
      expect(() => {
        profileSubscriptionService.addSubscription({});
      }).toThrow('Profile must have a login property');

      expect(() => {
        profileSubscriptionService.addSubscription(null);
      }).toThrow('Profile must have a login property');
    });
  });

  describe('removeSubscription', () => {
    it('should remove non-permanent subscription', () => {
      const subscriptions = [
        {
          login: 'WorldHealthOrganization',
          isPermanent: true
        },
        {
          login: 'testuser',
          name: 'Test User',
          isPermanent: false
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(subscriptions);

      const result = profileSubscriptionService.removeSubscription('testuser');
      expect(result).toBe(true);

      const remaining = profileSubscriptionService.getSubscriptions();
      expect(remaining.find(p => p.login === 'testuser')).toBeUndefined();
    });

    it('should not remove permanent subscription', () => {
      const subscriptions = [
        {
          login: 'WorldHealthOrganization',
          isPermanent: true
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(subscriptions);

      const result = profileSubscriptionService.removeSubscription('WorldHealthOrganization');
      expect(result).toBe(false);

      const remaining = profileSubscriptionService.getSubscriptions();
      expect(remaining.find(p => p.login === 'WorldHealthOrganization')).toBeDefined();
    });

    it('should return false for non-existent subscription', () => {
      const result = profileSubscriptionService.removeSubscription('nonexistent');
      expect(result).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(profileSubscriptionService.removeSubscription('')).toBe(false);
      expect(profileSubscriptionService.removeSubscription(null)).toBe(false);
    });
  });

  describe('isSubscribed', () => {
    it('should return true for subscribed profile', () => {
      const subscriptions = [
        { login: 'testuser', name: 'Test User' }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(subscriptions);

      expect(profileSubscriptionService.isSubscribed('testuser')).toBe(true);
      expect(profileSubscriptionService.isSubscribed('other')).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(profileSubscriptionService.isSubscribed('')).toBe(false);
      expect(profileSubscriptionService.isSubscribed(null)).toBe(false);
    });
  });

  describe('ensureCurrentUserSubscribed', () => {
    it('should add current user as permanent subscription', () => {
      const userProfile = {
        login: 'currentuser',
        name: 'Current User',
        avatar_url: 'https://github.com/currentuser.png'
      };

      profileSubscriptionService.ensureCurrentUserSubscribed(userProfile);

      const subscriptions = profileSubscriptionService.getSubscriptions();
      const currentUser = subscriptions.find(p => p.login === 'currentuser');
      expect(currentUser).toBeDefined();
      expect(currentUser.isPermanent).toBe(true);
    });

    it('should update existing user to be permanent', () => {
      const existing = [
        {
          login: 'currentuser',
          name: 'Current User',
          isPermanent: false
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(existing);

      const userProfile = {
        login: 'currentuser',
        name: 'Updated Name',
        avatar_url: 'https://github.com/currentuser.png'
      };

      profileSubscriptionService.ensureCurrentUserSubscribed(userProfile);

      const subscriptions = profileSubscriptionService.getSubscriptions();
      const currentUser = subscriptions.find(p => p.login === 'currentuser');
      expect(currentUser.isPermanent).toBe(true);
      expect(currentUser.name).toBe('Updated Name');
    });

    it('should handle invalid input gracefully', () => {
      expect(() => {
        profileSubscriptionService.ensureCurrentUserSubscribed(null);
      }).not.toThrow();

      expect(() => {
        profileSubscriptionService.ensureCurrentUserSubscribed({});
      }).not.toThrow();
    });
  });

  describe('autoAddVisitedProfile', () => {
    it('should add new visited profile', () => {
      const visitedProfile = {
        login: 'visiteduser',
        name: 'Visited User',
        type: 'User'
      };

      profileSubscriptionService.autoAddVisitedProfile(visitedProfile);

      const subscriptions = profileSubscriptionService.getSubscriptions();
      const visited = subscriptions.find(p => p.login === 'visiteduser');
      expect(visited).toBeDefined();
      expect(visited.isPermanent).toBe(false);
    });

    it('should not add already subscribed profile', () => {
      const existing = [
        { 
          login: 'WorldHealthOrganization',
          name: 'World Health Organization',
          isPermanent: true
        },
        { 
          login: 'existinguser', 
          name: 'Existing User' 
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(existing);

      profileSubscriptionService.autoAddVisitedProfile({
        login: 'existinguser',
        name: 'Updated Name'
      });

      const subscriptions = profileSubscriptionService.getSubscriptions();
      const existing_profiles = subscriptions.filter(p => p.login === 'existinguser');
      expect(existing_profiles).toHaveLength(1);
      expect(existing_profiles[0].name).toBe('Existing User'); // Not updated
    });

    it('should not add demo profiles', () => {
      const demoProfile = {
        login: 'demouser',
        name: 'Demo User',
        isDemo: true
      };

      profileSubscriptionService.autoAddVisitedProfile(demoProfile);

      const subscriptions = profileSubscriptionService.getSubscriptions();
      expect(subscriptions.find(p => p.login === 'demouser')).toBeUndefined();
    });
  });

  describe('getSubscriptionsSorted', () => {
    it('should sort subscriptions with WHO first', () => {
      const subscriptions = [
        { 
          login: 'WorldHealthOrganization', 
          name: 'World Health Organization', 
          isPermanent: true 
        },
        { 
          login: 'zebra', 
          name: 'Zebra User' 
        },
        { 
          login: 'alpha', 
          name: 'Alpha User' 
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(subscriptions);

      const sorted = profileSubscriptionService.getSubscriptionsSorted();
      
      expect(sorted[0].login).toBe('WorldHealthOrganization');
      expect(sorted[1].login).toBe('alpha'); // Alphabetical after WHO
      expect(sorted[2].login).toBe('zebra');
    });
  });

  describe('getSubscriptionsForSelection', () => {
    it('should format subscriptions for UI selection', () => {
      const subscriptions = [
        { 
          login: 'WorldHealthOrganization', 
          name: 'World Health Organization',
          isPermanent: true 
        },
        { 
          login: 'testuser', 
          name: 'Test User',
          isPermanent: false 
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(subscriptions);

      const forSelection = profileSubscriptionService.getSubscriptionsForSelection();
      
      expect(forSelection.length).toBeGreaterThanOrEqual(2);
      expect(forSelection[0]).toMatchObject({
        login: 'WorldHealthOrganization',
        displayName: 'World Health Organization',
        isRemovable: false
      });
      expect(forSelection[1]).toMatchObject({
        login: 'testuser',
        displayName: 'Test User',
        isRemovable: true
      });
    });
  });

  describe('clearSubscriptions', () => {
    it('should clear all subscriptions except WHO', () => {
      const subscriptions = [
        { login: 'user1', name: 'User 1' },
        { login: 'user2', name: 'User 2' }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(subscriptions);

      profileSubscriptionService.clearSubscriptions();

      const remaining = profileSubscriptionService.getSubscriptions();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].login).toBe('WorldHealthOrganization');
    });
  });

  describe('importSubscriptions', () => {
    it('should import subscriptions from JSON', () => {
      const importData = [
        { 
          login: 'WorldHealthOrganization', 
          name: 'WHO', 
          isPermanent: true 
        },
        { 
          login: 'imported1', 
          name: 'Imported 1' 
        },
        { 
          login: 'imported2', 
          name: 'Imported 2' 
        }
      ];

      const result = profileSubscriptionService.importSubscriptions(JSON.stringify(importData));
      expect(result).toBe(true);

      const subscriptions = profileSubscriptionService.getSubscriptions();
      expect(subscriptions.find(p => p.login === 'WorldHealthOrganization')).toBeDefined(); // WHO always included
      expect(subscriptions.find(p => p.login === 'imported1')).toBeDefined();
      expect(subscriptions.find(p => p.login === 'imported2')).toBeDefined();
    });

    it('should merge subscriptions when merge is true', () => {
      const existing = [
        { 
          login: 'WorldHealthOrganization', 
          name: 'World Health Organization', 
          isPermanent: true 
        },
        { 
          login: 'existing', 
          name: 'Existing User', 
          isPermanent: true 
        }
      ];
      localStorageMock.store['sgex-profile-subscriptions'] = JSON.stringify(existing);

      const importData = [
        { login: 'existing', name: 'Updated Existing', isPermanent: false }, // Should preserve permanence
        { login: 'new', name: 'New User' }
      ];

      const result = profileSubscriptionService.importSubscriptions(JSON.stringify(importData), true);
      expect(result).toBe(true);

      const subscriptions = profileSubscriptionService.getSubscriptions();
      const existingUser = subscriptions.find(p => p.login === 'existing');
      expect(existingUser.isPermanent).toBe(true); // Preserved
      expect(existingUser.name).toBe('Updated Existing'); // Updated
      expect(subscriptions.find(p => p.login === 'new')).toBeDefined();
    });

    it('should return false on invalid JSON', () => {
      const result = profileSubscriptionService.importSubscriptions('invalid json');
      expect(result).toBe(false);
    });

    it('should return false on invalid format', () => {
      const result = profileSubscriptionService.importSubscriptions('{"not": "array"}');
      expect(result).toBe(false);
    });
  });
});