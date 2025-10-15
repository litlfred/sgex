/**
 * Profile Subscription Service
 * 
 * Manages profile subscriptions in localStorage.
 * 
 * Provides functionality to manage profile subscriptions:
 * - Always includes WorldHealthOrganization
 * - Includes logged-in user when authenticated
 * - Auto-adds users when browsing their profiles
 * - Allows removal of profiles (except WHO and current user)
 * 
 * @module profileSubscriptionService
 */

/**
 * Profile subscription
 * @example { "login": "octocat", "name": "The Octocat", "type": "User", "isPermanent": false }
 */
export interface ProfileSubscription {
  /** GitHub username */
  login: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatar_url: string;
  /** Account type */
  type: 'User' | 'Organization';
  /** Whether profile cannot be removed */
  isPermanent: boolean;
  /** When profile was added */
  addedAt: string;
  /** When profile was last updated */
  lastUpdated?: string;
  /** Whether this is a demo profile */
  isDemo?: boolean;
}

/**
 * Profile for selection UI
 * @example { "login": "octocat", "displayName": "The Octocat", "isRemovable": true }
 */
export interface ProfileForSelection extends ProfileSubscription {
  /** Display name for UI */
  displayName: string;
  /** Whether profile can be removed */
  isRemovable: boolean;
}

/**
 * Profile Subscription Service class
 * 
 * Manages user profile subscriptions in localStorage.
 * 
 * @openapi
 * components:
 *   schemas:
 *     ProfileSubscription:
 *       type: object
 *       properties:
 *         login:
 *           type: string
 *         name:
 *           type: string
 *         avatar_url:
 *           type: string
 *         type:
 *           type: string
 *           enum: [User, Organization]
 *         isPermanent:
 *           type: boolean
 *         addedAt:
 *           type: string
 *           format: date-time
 */
class ProfileSubscriptionService {
  private readonly storageKey: string;
  private readonly whoProfile: string;

  constructor() {
    this.storageKey = 'sgex-profile-subscriptions';
    this.whoProfile = 'WorldHealthOrganization';
  }

  /**
   * Get profile subscriptions from localStorage
   * 
   * @openapi
   * /api/profile-subscriptions:
   *   get:
   *     summary: Get profile subscriptions
   *     responses:
   *       200:
   *         description: List of subscribed profiles
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/ProfileSubscription'
   */
  getSubscriptions(): ProfileSubscription[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const subscriptions: ProfileSubscription[] = stored ? JSON.parse(stored) : [];
      
      // Always ensure WHO is included
      if (!subscriptions.find(profile => profile.login === this.whoProfile)) {
        subscriptions.unshift({
          login: this.whoProfile,
          name: 'World Health Organization',
          avatar_url: `https://github.com/${this.whoProfile}.png`,
          type: 'Organization',
          isPermanent: true,
          addedAt: new Date().toISOString()
        });
        this.saveSubscriptions(subscriptions);
      }
      
      return subscriptions;
    } catch (error) {
      console.warn('Error reading profile subscriptions from localStorage:', error);
      // Return minimal default with WHO
      return [{
        login: this.whoProfile,
        name: 'World Health Organization',
        avatar_url: `https://github.com/${this.whoProfile}.png`,
        type: 'Organization',
        isPermanent: true,
        addedAt: new Date().toISOString()
      }];
    }
  }

  /**
   * Save profile subscriptions to localStorage
   */
  saveSubscriptions(subscriptions: ProfileSubscription[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(subscriptions));
    } catch (error) {
      console.error('Error saving profile subscriptions to localStorage:', error);
      throw error;
    }
  }

  /**
   * Add a profile to subscriptions
   * 
   * @openapi
   * /api/profile-subscriptions:
   *   post:
   *     summary: Add profile subscription
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ProfileSubscription'
   *     responses:
   *       200:
   *         description: Profile added
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProfileSubscription'
   */
  addSubscription(profile: Partial<ProfileSubscription>, isPermanent: boolean = false): ProfileSubscription {
    if (!profile || !profile.login) {
      throw new Error('Profile must have a login property');
    }

    const subscriptions = this.getSubscriptions();
    
    // Check if already subscribed
    const existingIndex = subscriptions.findIndex(p => p.login === profile.login);
    if (existingIndex !== -1) {
      // Update existing subscription
      subscriptions[existingIndex] = {
        ...subscriptions[existingIndex],
        ...profile,
        login: profile.login,
        name: profile.name || subscriptions[existingIndex].name,
        avatar_url: profile.avatar_url || subscriptions[existingIndex].avatar_url,
        type: profile.type || subscriptions[existingIndex].type,
        addedAt: subscriptions[existingIndex].addedAt,
        isPermanent: subscriptions[existingIndex].isPermanent || isPermanent,
        lastUpdated: new Date().toISOString()
      };
      this.saveSubscriptions(subscriptions);
      return subscriptions[existingIndex];
    }

    // Add new subscription
    const newSubscription: ProfileSubscription = {
      login: profile.login,
      name: profile.name || profile.login,
      avatar_url: profile.avatar_url || `https://github.com/${profile.login}.png`,
      type: profile.type || 'User',
      isPermanent,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    subscriptions.push(newSubscription);
    this.saveSubscriptions(subscriptions);
    return newSubscription;
  }

  /**
   * Remove a profile from subscriptions
   */
  removeSubscription(login: string): boolean {
    if (!login) {
      return false;
    }

    try {
      const subscriptions = this.getSubscriptions();
      const profileIndex = subscriptions.findIndex(p => p.login === login);
      
      if (profileIndex === -1) {
        return false; // Profile not found
      }

      const profile = subscriptions[profileIndex];
      
      // Cannot remove permanent profiles (WHO, current user)
      if (profile.isPermanent) {
        console.warn(`Cannot remove permanent profile: ${login}`);
        return false;
      }

      subscriptions.splice(profileIndex, 1);
      this.saveSubscriptions(subscriptions);
      return true;
    } catch (error) {
      console.error('Error removing profile subscription:', error);
      return false;
    }
  }

  /**
   * Check if a profile is subscribed
   */
  isSubscribed(login: string): boolean {
    if (!login) return false;
    const subscriptions = this.getSubscriptions();
    return subscriptions.some(p => p.login === login);
  }

  /**
   * Get a specific subscription by login
   */
  getSubscription(login: string): ProfileSubscription | null {
    if (!login) return null;
    const subscriptions = this.getSubscriptions();
    return subscriptions.find(p => p.login === login) || null;
  }

  /**
   * Auto-add current user to subscriptions (when logged in)
   */
  ensureCurrentUserSubscribed(userProfile: Partial<ProfileSubscription>): void {
    if (!userProfile || !userProfile.login) {
      return;
    }

    const existing = this.getSubscription(userProfile.login);
    if (!existing) {
      this.addSubscription({
        ...userProfile,
        isPermanent: true // Current user cannot be removed
      }, true);
    } else if (!existing.isPermanent) {
      // Update existing to be permanent
      this.addSubscription({
        ...existing,
        ...userProfile,
        isPermanent: true
      }, true);
    }
  }

  /**
   * Auto-add a visited user profile (from browsing)
   */
  autoAddVisitedProfile(visitedProfile: Partial<ProfileSubscription>): void {
    if (!visitedProfile || !visitedProfile.login) {
      return;
    }

    // Don't auto-add if already subscribed
    if (this.isSubscribed(visitedProfile.login)) {
      return;
    }

    // Don't auto-add demo profiles
    if (visitedProfile.isDemo) {
      return;
    }

    this.addSubscription(visitedProfile, false);
  }

  /**
   * Get subscriptions sorted alphabetically by name
   */
  getSubscriptionsSorted(): ProfileSubscription[] {
    const subscriptions = this.getSubscriptions();
    return subscriptions.sort((a, b) => {
      // WHO always first
      if (a.login === this.whoProfile) return -1;
      if (b.login === this.whoProfile) return 1;
      
      // Then sort by name/login
      const nameA = a.name || a.login;
      const nameB = b.name || b.login;
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * Get subscriptions for profile selection (formatted for UI)
   */
  getSubscriptionsForSelection(): ProfileForSelection[] {
    return this.getSubscriptionsSorted().map(profile => ({
      ...profile,
      displayName: profile.name || profile.login,
      isRemovable: !profile.isPermanent
    }));
  }

  /**
   * Update subscription with latest profile information
   */
  updateSubscription(login: string, updatedProfile: Partial<ProfileSubscription>): boolean {
    if (!login || !updatedProfile) {
      return false;
    }

    try {
      const subscriptions = this.getSubscriptions();
      const index = subscriptions.findIndex(p => p.login === login);
      
      if (index === -1) {
        return false;
      }

      subscriptions[index] = {
        ...subscriptions[index],
        ...updatedProfile,
        login, // Preserve original login
        lastUpdated: new Date().toISOString()
      };

      this.saveSubscriptions(subscriptions);
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }

  /**
   * Clear all subscriptions (except WHO)
   */
  clearSubscriptions(): void {
    try {
      const whoProfile: ProfileSubscription = {
        login: this.whoProfile,
        name: 'World Health Organization',
        avatar_url: `https://github.com/${this.whoProfile}.png`,
        type: 'Organization',
        isPermanent: true,
        addedAt: new Date().toISOString()
      };
      this.saveSubscriptions([whoProfile]);
    } catch (error) {
      console.error('Error clearing subscriptions:', error);
    }
  }

  /**
   * Export subscriptions as JSON
   */
  exportSubscriptions(): string {
    const subscriptions = this.getSubscriptions();
    return JSON.stringify(subscriptions, null, 2);
  }

  /**
   * Import subscriptions from JSON
   */
  importSubscriptions(jsonString: string, merge: boolean = false): boolean {
    try {
      const importedSubscriptions: ProfileSubscription[] = JSON.parse(jsonString);
      
      if (!Array.isArray(importedSubscriptions)) {
        throw new Error('Invalid subscription format');
      }

      let finalSubscriptions: ProfileSubscription[];
      
      if (merge) {
        const existingSubscriptions = this.getSubscriptions();
        const mergedSubscriptions = [...existingSubscriptions];
        
        importedSubscriptions.forEach(imported => {
          const existingIndex = mergedSubscriptions.findIndex(p => p.login === imported.login);
          if (existingIndex !== -1) {
            // Preserve permanence of existing subscriptions
            mergedSubscriptions[existingIndex] = {
              ...imported,
              isPermanent: mergedSubscriptions[existingIndex].isPermanent || imported.isPermanent
            };
          } else {
            mergedSubscriptions.push(imported);
          }
        });
        
        finalSubscriptions = mergedSubscriptions;
      } else {
        finalSubscriptions = importedSubscriptions;
      }

      // Ensure WHO is always included
      if (!finalSubscriptions.find(p => p.login === this.whoProfile)) {
        finalSubscriptions.unshift({
          login: this.whoProfile,
          name: 'World Health Organization',
          avatar_url: `https://github.com/${this.whoProfile}.png`,
          type: 'Organization',
          isPermanent: true,
          addedAt: new Date().toISOString()
        });
      }
      
      this.saveSubscriptions(finalSubscriptions);
      return true;
    } catch (error) {
      console.error('Error importing subscriptions:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const profileSubscriptionService = new ProfileSubscriptionService();

export default profileSubscriptionService;
