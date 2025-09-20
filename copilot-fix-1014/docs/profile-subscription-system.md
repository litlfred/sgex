# Profile Subscription System

The SGEX Workbench includes a profile subscription system that manages which GitHub users and organizations are available for quick access throughout the application.

## Overview

The profile subscription system provides:
- **Automatic WHO inclusion**: WorldHealthOrganization is always subscribed
- **Current user management**: Logged-in users are automatically subscribed
- **Auto-discovery**: Visited profiles are automatically added to subscriptions
- **Manual management**: Users can remove non-essential subscriptions
- **Profile selection**: Used to populate profile selection interfaces

## Core Features

### Automatic Subscriptions

#### WorldHealthOrganization (WHO)
- Always included in the subscription list
- Cannot be removed by users
- Appears first in all sorted lists
- Marked as permanent subscription

#### Current User
- Automatically added when user logs in
- Cannot be removed while logged in
- Marked as permanent subscription
- Updated with latest profile information

#### Visited Profiles
- Automatically added when browsing user/organization pages
- Added only for real GitHub profiles (not demo profiles)
- Can be removed by users if desired
- Marked as non-permanent subscriptions

### Manual Management

#### Adding Subscriptions
```javascript
import profileSubscriptionService from '../services/profileSubscriptionService';

const profile = {
  login: 'username',
  name: 'Display Name',
  avatar_url: 'https://github.com/username.png',
  type: 'User' // or 'Organization'
};

profileSubscriptionService.addSubscription(profile, isPermanent = false);
```

#### Removing Subscriptions
- Only non-permanent subscriptions can be removed
- WHO and current user cannot be removed
- Removal is handled through the UI or programmatically:

```javascript
const success = profileSubscriptionService.removeSubscription('username');
```

### Profile Selection Integration

The subscription system populates profile selection interfaces:

```javascript
const profilesForSelection = profileSubscriptionService.getSubscriptionsForSelection();
// Returns formatted profiles with display names and removability flags
```

## Technical Implementation

### ProfileSubscriptionService

Located at `src/services/profileSubscriptionService.js`, provides:

#### Core Methods
- `getSubscriptions()`: Get all subscriptions with WHO automatically included
- `addSubscription(profile, isPermanent)`: Add or update a subscription  
- `removeSubscription(login)`: Remove a non-permanent subscription
- `isSubscribed(login)`: Check if a profile is subscribed

#### Management Methods
- `ensureCurrentUserSubscribed(userProfile)`: Ensure logged-in user is subscribed
- `autoAddVisitedProfile(visitedProfile)`: Auto-add visited profiles
- `getSubscriptionsSorted()`: Get subscriptions sorted with WHO first
- `getSubscriptionsForSelection()`: Get subscriptions formatted for UI

#### Utility Methods
- `clearSubscriptions()`: Clear all except WHO
- `exportSubscriptions()`: Export as JSON string
- `importSubscriptions(jsonString, merge)`: Import from JSON

### Storage Format

Subscriptions are stored in localStorage as:

```json
[
  {
    "login": "WorldHealthOrganization",
    "name": "World Health Organization", 
    "avatar_url": "https://github.com/WorldHealthOrganization.png",
    "type": "Organization",
    "isPermanent": true,
    "addedAt": "2024-01-01T00:00:00.000Z",
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  {
    "login": "currentuser",
    "name": "Current User",
    "avatar_url": "https://github.com/currentuser.png", 
    "type": "User",
    "isPermanent": true,
    "addedAt": "2024-01-01T12:00:00.000Z",
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  },
  {
    "login": "visiteduser",
    "name": "Visited User",
    "avatar_url": "https://github.com/visiteduser.png",
    "type": "User", 
    "isPermanent": false,
    "addedAt": "2024-01-01T14:30:00.000Z",
    "lastUpdated": "2024-01-01T14:30:00.000Z"
  }
]
```

### Integration Points

#### PageProvider Integration
The `PageProvider` automatically manages profile subscriptions:

```javascript
// Ensure current user is subscribed when authenticated
const currentUser = githubService.getCurrentUser();
if (currentUser) {
  profileSubscriptionService.ensureCurrentUserSubscribed(currentUser);
}

// Auto-add visited profiles
if (profile && !profile.isDemo && isUserOrDAKOrAssetPage) {
  profileSubscriptionService.autoAddVisitedProfile(profile);
}
```

#### Profile Selection Pages
Pages that need profile selection can use:

```javascript
import profileSubscriptionService from '../services/profileSubscriptionService';

const ProfileSelectionPage = () => {
  const profiles = profileSubscriptionService.getSubscriptionsForSelection();
  
  return (
    <div>
      {profiles.map(profile => (
        <div key={profile.login} className="profile-option">
          <img src={profile.avatar_url} alt={`${profile.login} avatar`} />
          <span>{profile.displayName}</span>
          {profile.isRemovable && (
            <button onClick={() => handleRemove(profile.login)}>Remove</button>
          )}
        </div>
      ))}
    </div>
  );
};
```

## Usage Examples

### For Developers

#### Check if Profile is Subscribed
```javascript
const isSubscribed = profileSubscriptionService.isSubscribed('username');
```

#### Get All Subscriptions for UI
```javascript
const subscriptions = profileSubscriptionService.getSubscriptionsForSelection();
// Each subscription includes:
// - login, name, avatar_url, type
// - displayName (for UI)
// - isRemovable (boolean)
```

#### Manually Add Subscription
```javascript
const profile = {
  login: 'myorg',
  name: 'My Organization', 
  type: 'Organization'
};

profileSubscriptionService.addSubscription(profile);
```

### For Users

#### Automatic Behavior
- WHO is always available in profile selections
- Your profile is automatically added when you log in
- Profiles you visit are automatically added to your subscriptions
- Demo profiles are not automatically added

#### Manual Management
Users can manage subscriptions through UI components that:
1. Display all subscribed profiles
2. Show which profiles can be removed (non-permanent ones)
3. Provide remove buttons for eligible profiles
4. Maintain WHO and current user as permanent

## Best Practices

### For Developers

#### Page Implementation
- Use the PageProvider framework for automatic profile subscription management
- Don't manually manage current user subscriptions - let the framework handle it
- Test with both authenticated and demo modes

#### Profile Selection UIs
- Always use `getSubscriptionsForSelection()` for consistent formatting
- Respect the `isRemovable` flag when showing management options
- Sort by the service's default ordering (WHO first, then alphabetical)

#### Data Management
- Don't bypass the service methods for localStorage access
- Use the import/export functionality for backup features
- Handle service errors gracefully

### For Users

#### Profile Discovery
- Browse different user and organization pages to build your subscription list
- The system will automatically remember profiles you visit
- Focus on profiles you frequently access for DAK development

#### Subscription Maintenance
- Regularly review your subscribed profiles
- Remove profiles you no longer need to keep the list manageable
- Remember that WHO and your own profile cannot be removed

## Error Handling

The service includes comprehensive error handling:

### localStorage Errors
- Graceful fallback when localStorage is unavailable
- Automatic recovery from corrupted data
- Error logging for debugging

### Profile Validation
- Validates profile objects before adding
- Handles missing or invalid profile data
- Prevents duplicate subscriptions

### Permanent Profile Protection
- Prevents removal of WHO and current user profiles
- Warns when attempting to remove permanent profiles
- Maintains data integrity

## Browser Compatibility

- Uses localStorage for persistence (all modern browsers)
- Graceful degradation when storage is unavailable
- Automatic cleanup of invalid data
- Cross-browser compatibility testing

## Privacy and Security

### Data Storage
- All data stored locally in browser
- No server-side profile tracking
- User controls their own subscription list

### Profile Information
- Only stores public GitHub profile information
- No sensitive data or tokens stored
- Profile data automatically updated when available

### User Control
- Users can export their subscription data
- Full control over non-permanent subscriptions
- Clear indication of permanent vs. removable profiles

## Troubleshooting

### Subscriptions Not Saving
1. Check browser localStorage is enabled
2. Verify sufficient storage quota available
3. Check browser console for JavaScript errors
4. Try clearing and reimporting subscription data

### Missing Auto-Added Profiles
1. Ensure you're visiting actual GitHub profiles (not demo)
2. Check that you're logged in for full functionality
3. Verify the profile page is using the PageProvider framework
4. Look for console warnings about profile validation

### Current User Not Subscribed
1. Verify successful login to GitHub
2. Check that authentication token is valid
3. Ensure PageProvider is properly integrated
4. Try logging out and back in

### WHO Profile Missing
1. This should never happen - WHO is always included
2. If missing, try clearing localStorage and refreshing
3. The service will automatically re-add WHO
4. Report this as a bug if it persists

## API Reference

### Core Methods

#### `getSubscriptions(): Array<Profile>`
Returns all subscriptions with WHO automatically ensured.

#### `addSubscription(profile: Profile, isPermanent: boolean = false): Profile`
Adds or updates a subscription. Returns the final profile object.

#### `removeSubscription(login: string): boolean`
Removes a non-permanent subscription. Returns success status.

#### `isSubscribed(login: string): boolean`  
Checks if a profile is currently subscribed.

### Management Methods

#### `ensureCurrentUserSubscribed(userProfile: Profile): void`
Ensures the current authenticated user is subscribed as permanent.

#### `autoAddVisitedProfile(visitedProfile: Profile): void`
Automatically adds a visited profile if not already subscribed.

#### `getSubscriptionsSorted(): Array<Profile>`
Returns subscriptions sorted with WHO first, then alphabetically.

#### `getSubscriptionsForSelection(): Array<SelectionProfile>`
Returns subscriptions formatted for UI selection components.

### Utility Methods

#### `clearSubscriptions(): void`
Clears all subscriptions except WHO.

#### `exportSubscriptions(): string`
Exports subscriptions as JSON string.

#### `importSubscriptions(jsonString: string, merge: boolean = false): boolean`
Imports subscriptions from JSON. Returns success status.