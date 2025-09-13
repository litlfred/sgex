// playwright.config.js - Configuration for SGEX Tutorial Generation

const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './scripts/playwright',
  /* Run tests in files in parallel */
  fullyParallel: false, // Disabled for tutorial recording to avoid conflicts
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1, // Single worker for tutorial recording
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.SGEX_BASE_URL || 'http://localhost:3000/sgex',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video for tutorial generation */
    video: process.env.RECORD_VIDEO === 'true' ? 'on' : 'off',

    /* Disable animations for consistent recordings */
    actionTimeout: 10000,
    navigationTimeout: 30000,

    /* Show mouse cursor and clicks for better tutorials */
    launchOptions: {
      args: [
        '--enable-features=OverlayScrollbar',
        '--enable-pointer-events'
      ],
      // Slow down actions to make them visible in recordings
      slowMo: parseInt(process.env.SLOW_MO) || 200,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-tutorial',
      use: { 
        ...devices['Desktop Chrome'],
        // Laptop-sized viewport for realistic tutorial recordings
        viewport: { 
          width: parseInt(process.env.VIDEO_WIDTH) || 1366, 
          height: parseInt(process.env.VIDEO_HEIGHT) || 768 
        },
        // Additional settings for tutorial recording
        launchOptions: {
          slowMo: parseInt(process.env.SLOW_MO) || 200, // Slow down for visibility
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--enable-features=OverlayScrollbar',
            '--force-device-scale-factor=1'
          ]
        },
        // Context options
        contextOptions: {
          recordVideo: process.env.RECORD_VIDEO === 'true' ? {
            dir: 'recordings/',
            size: { 
              width: parseInt(process.env.VIDEO_WIDTH) || 1366, 
              height: parseInt(process.env.VIDEO_HEIGHT) || 768 
            }
          } : undefined,
          // Reduce motion to make recordings clearer
          reducedMotion: 'reduce',
        }
      },
    },

    // Optional: Firefox support for cross-browser testing
    {
      name: 'firefox-tutorial',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { 
          width: parseInt(process.env.VIDEO_WIDTH) || 1366, 
          height: parseInt(process.env.VIDEO_HEIGHT) || 768 
        }
      },
    },

    // Optional: Safari support for cross-browser testing  
    {
      name: 'webkit-tutorial',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { 
          width: parseInt(process.env.VIDEO_WIDTH) || 1366, 
          height: parseInt(process.env.VIDEO_HEIGHT) || 768 
        }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.START_DEV_SERVER === 'true' ? {
    command: 'cd build && python3 -m http.server 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  } : undefined,

  /* Global setup and teardown */
  globalSetup: process.env.TUTORIAL_MODE === 'true' ? require.resolve('./scripts/tutorial-generation/globalSetup.js') : undefined,
  globalTeardown: process.env.TUTORIAL_MODE === 'true' ? require.resolve('./scripts/tutorial-generation/globalTeardown.js') : undefined,

  /* Test timeout */
  timeout: 60 * 1000, // 1 minute per test

  /* Expect timeout */
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
});