// Debug the exact test case that's failing
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

describe('Debug Test', () => {
  beforeEach(() => {
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('should add new visited profile - debug', () => {
    console.log('=== DEBUG TEST START ===');
    
    // Start fresh
    console.log('1. Initial localStorage store:', localStorageMock.store);
    
    const visitedProfile = {
      login: 'visiteduser',
      name: 'Visited User',
      type: 'User'
    };

    console.log('2. Profile to add:', visitedProfile);
    console.log('3. Before - isSubscribed:', profileSubscriptionService.isSubscribed('visiteduser'));
    
    // Get initial subscriptions
    const initialSubs = profileSubscriptionService.getSubscriptions();
    console.log('4. Initial subscriptions:', initialSubs.map(p => ({ login: p.login, name: p.name })));
    
    // Add the profile
    console.log('5. Calling autoAddVisitedProfile...');
    profileSubscriptionService.autoAddVisitedProfile(visitedProfile);
    
    console.log('6. After - localStorage store:', localStorageMock.store);
    
    const subscriptions = profileSubscriptionService.getSubscriptions();
    console.log('7. Final subscriptions:', subscriptions.map(p => ({ login: p.login, name: p.name })));
    
    const visited = subscriptions.find(p => p.login === 'visiteduser');
    console.log('8. Found visited profile:', visited ? { login: visited.login, name: visited.name, isPermanent: visited.isPermanent } : 'NOT FOUND');
    
    expect(visited).toBeDefined();
    expect(visited.isPermanent).toBe(false);
    
    console.log('=== DEBUG TEST END ===');
  });
});