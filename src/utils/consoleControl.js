/**
 * Console Control Utility for SGEX Workbench
 * Provides easy methods to silence verbose console output
 */

class ConsoleControl {
  constructor() {
    this.originalConsole = {
      log: console.log,
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    this.isQuiet = false;
  }

  /**
   * Enable quiet mode - silences console.log and console.debug
   * Keeps errors and warnings visible for important issues
   */
  enableQuietMode() {
    if (!this.isQuiet) {
      console.log('[SGEX] Enabling quiet mode - silencing verbose console output');
      console.log = () => {}; // Silent
      console.debug = () => {}; // Silent
      // Keep console.info, console.warn, and console.error active
      this.isQuiet = true;
      
      // Store preference
      try {
        localStorage.setItem('sgex-quiet-mode', 'true');
      } catch (error) {
        // localStorage not available
      }
    }
  }

  /**
   * Disable quiet mode - restore all console output
   */
  disableQuietMode() {
    if (this.isQuiet) {
      // Restore original console methods
      console.log = this.originalConsole.log;
      console.debug = this.originalConsole.debug;
      this.isQuiet = false;
      
      console.log('[SGEX] Quiet mode disabled - console output restored');
      
      // Store preference
      try {
        localStorage.setItem('sgex-quiet-mode', 'false');
      } catch (error) {
        // localStorage not available
      }
    }
  }

  /**
   * Toggle quiet mode on/off
   */
  toggleQuietMode() {
    if (this.isQuiet) {
      this.disableQuietMode();
    } else {
      this.enableQuietMode();
    }
  }

  /**
   * Check if quiet mode should be enabled based on stored preference
   */
  checkStoredPreference() {
    try {
      const storedPreference = localStorage.getItem('sgex-quiet-mode');
      if (storedPreference === 'true') {
        this.enableQuietMode();
      }
    } catch (error) {
      // localStorage not available
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isQuiet: this.isQuiet,
      availableMethods: [
        'enableQuietMode() - Silence verbose console output',
        'disableQuietMode() - Restore console output', 
        'toggleQuietMode() - Toggle quiet mode on/off'
      ]
    };
  }
}

// Export singleton instance
const consoleControl = new ConsoleControl();

// Make available globally for easy access
if (typeof window !== 'undefined') {
  window.sgexConsole = consoleControl;
  
  // Auto-enable quiet mode if preference is stored
  consoleControl.checkStoredPreference();
}

export default consoleControl;