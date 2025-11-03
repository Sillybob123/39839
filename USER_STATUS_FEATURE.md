# User Status & Presence Feature

This document explains the new "Last Login" and "Online Status" feature added to the Torah Study Portal.

## What's New

Your website now shows:
1. **Who's Online Right Now** - See which other users are currently logged in and studying
2. **Last Login Time** - See when you (and others) last logged into the site

## How It Works

### For Users

When you log in:
- Your login time is recorded automatically
- Your status is marked as "Online"
- Other users can see you in the "Online Now" section in the header
- Your presence updates every 30 seconds while you're active
- When you log out, you're marked as "Offline"

### What You'll See

**In the Header:**
- **"Online Now" badge** - Shows which users are currently online (e.g., "naama, john (2 people)")
- **"Last Login" display** - Shows your last login time (e.g., "naama logged in 10 minutes ago")

These appear in the top right area of the header when you're logged in.

## Technical Details

### Backend (Firestore)

A new `users` collection has been created with the following structure:

```javascript
{
  userId: string,           // Firebase Auth UID
  email: string,            // User's email
  username: string,         // Username extracted from email prefix
  lastLogin: timestamp,     // When user last logged in
  isOnline: boolean,        // Whether user is currently online
  lastSeen: timestamp       // Last time user was seen active
}
```

### Presence Tracking

- **Login**: Recorded when user signs in
- **Active Updates**: User presence updates every 30 seconds while logged in
- **Logout**: User marked as offline when they log out

### Security

- **Firestore Rules**: Users can read all user profiles (to see who's online), but can only update their own
- **No Personal Data Exposed**: Only username, email, and online status are visible
- **Private**: Each user's online status is independent

## API Functions

The following new functions have been added to `firebase.js`:

### Login Tracking
```javascript
recordUserLogin(userId, email)        // Record user login
updateUserPresence(userId)             // Update online status
markUserOffline(userId)                // Mark user as offline
```

### Querying User Status
```javascript
getOnlineUsers()                       // Get all currently online users
getUsersSortedByLogin(limit)           // Get users by last login time
getUserInfo(userId)                    // Get specific user info
listenForOnlineUsers(callback)         // Real-time listener for online users
formatTimeAgo(timestamp)               // Format time for display
```

## UI Functions

The following new functions have been added to `ui.js`:

```javascript
displayOnlineUsers(onlineUsers)        // Show online users badge
hideOnlineUsers()                      // Hide online users badge
displayLastLogin(username, loginTime)  // Show last login display
hideLastLogin()                        // Hide last login display
```

## Example Usage

When a user logs in with email "naama.bendor1@gmail.com":
- Username is set to "naama"
- Last login time is recorded
- Status is set to "Online"
- Other users see "naama (1 person)" in the Online Now badge

After 30 seconds of inactivity when refreshing the page:
- Their presence updates again
- The time display updates (e.g., "naama logged in 10 minutes ago" → "naama logged in 11 minutes ago")

## Benefits

1. **Engagement**: Know when others are reading/studying
2. **Community**: See who else is learning Torah at the same time
3. **Last Seen**: Know when someone last visited (useful for group discussions)
4. **Real-time**: Updates happen automatically without page refresh

## Files Modified

- `js/firebase.js` - Added user tracking functions and Firestore integration
- `js/main.js` - Integrated login tracking and presence monitoring
- `js/ui.js` - Added UI display functions for user status
- `index.html` - Added UI elements for online users and last login displays
- `FIRESTORE_SECURITY_RULES.txt` - Updated to allow users collection

## Future Enhancements

Possible future additions:
- Show "Last Seen" time for offline users
- User profiles with last login history
- Notifications when specific friends come online
- Activity status (reading, commenting, bookmarking)
- Time zone aware displays
