// Mock implementation of the Device Flow Auth service for testing

const mockDeviceFlowAuthService = {
  startDeviceFlow: jest.fn((scopes, onVerification) => {
    return new Promise((resolve) => {
      // Simulate the verification callback being called
      if (onVerification) {
        setTimeout(() => {
          onVerification({
            device_code: 'mock_device_code',
            user_code: 'ABCD-1234',
            verification_uri: 'https://github.com/login/device',
            verification_uri_complete: 'https://github.com/login/device?user_code=ABCD-1234',
            expires_in: 900,
            interval: 5
          });
        }, 10);
      }
      
      // Simulate authentication completion after a short delay
      setTimeout(() => {
        resolve({
          token: 'mock_oauth_token',
          octokit: {
            rest: {
              users: {
                getAuthenticated: () => Promise.resolve({
                  data: {
                    login: 'test-user',
                    name: 'Test User',
                    avatar_url: 'https://github.com/test-user.png'
                  }
                })
              }
            }
          }
        });
      }, 100);
    });
  }),
  
  createOctokitWithToken: jest.fn((token) => ({
    rest: {
      users: {
        getAuthenticated: () => Promise.resolve({
          data: {
            login: 'test-user',
            name: 'Test User', 
            avatar_url: 'https://github.com/test-user.png'
          }
        })
      }
    }
  })),
  
  logout: jest.fn()
};

export default mockDeviceFlowAuthService;