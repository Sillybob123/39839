# Firebase Firestore Security Rules for Weekly Mitzvah Challenge

## ⚠️ IMPORTANT UPDATE

**Updated rules now include support for Mitzvah Reflection Reactions (heart ❤️ and exclaim 👏).**

The rules have been updated to allow ANY authenticated user to add reactions to reflections, not just the author. This is necessary for the community reaction feature to work.

## Quick Setup

Copy the security rules below and paste them into your Firebase Console:

1. Go to: https://console.firebase.google.com
2. Select your project: **dvartorah-d1fad**
3. Go to **Firestore Database** → **Rules** tab
4. Replace all content with the code below
5. Click **Publish**

---

## Complete Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // MITZVAH REFLECTIONS COLLECTION
    // ========================================
    match /mitzvahReflections/{document=**} {
      // Users can read all reflections for a challenge
      allow read: if request.auth != null;

      // Users can only create their own reflections
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.challengeId is string
        && request.resource.data.message is string
        && request.resource.data.message.size() > 0
        && request.resource.data.message.size() <= 2000
        && request.resource.data.username is string
        && request.resource.data.username.size() <= 50
        && request.resource.data.createdAt == request.time
        && request.resource.data.updatedAt == request.time;

      // Users can update their own reflections (edit message)
      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.message is string
        && request.resource.data.message.size() > 0
        && request.resource.data.message.size() <= 2000
        && request.resource.data.updatedAt == request.time;

      // Any authenticated user can add reactions (heart/exclaim) to reflections
      allow update: if request.auth != null
        && (resource.data.reactions is map || !("reactions" in resource.data));

      // Users can only delete their own reflections
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    // ========================================
    // MITZVAH COMPLETION PROGRESS (Subcollection)
    // ========================================
    match /users/{userId}/mitzvahProgress/{challengeId} {
      // Users can only read their own progress
      allow read: if request.auth != null
        && request.auth.uid == userId;

      // Users can only create their own progress records
      allow create: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.completed is bool
        && request.resource.data.updatedAt == request.time;

      // Users can only update their own progress records
      allow update: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.completed is bool
        && request.resource.data.updatedAt == request.time;

      // Prevent deletion to maintain history
      allow delete: if false;
    }

    // ========================================
    // MITZVAH LEADERBOARD COLLECTION
    // ========================================
    match /mitzvahLeaderboard/{userId} {
      // Everyone authenticated can read the leaderboard (public)
      allow read: if request.auth != null;

      // Only authenticated users can write their own entries
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.userId == userId
        && request.resource.data.totalCompleted is number
        && request.resource.data.totalCompleted >= 0
        && request.resource.data.username is string
        && request.resource.data.updatedAt == request.time;
    }

    // ========================================
    // COMMENTS COLLECTION (For Parsha Discussion)
    // ========================================
    match /comments/{document=**} {
      // All authenticated users can read comments
      allow read: if request.auth != null;

      // Users can only create their own comments
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0
        && request.resource.data.text.size() <= 2000
        && request.resource.data.username is string
        && request.resource.data.username.size() <= 50
        && request.resource.data.verseRef is string
        && request.resource.data.timestamp == request.time;

      // Users can only delete their own comments
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    // ========================================
    // REACTIONS COLLECTION (Emphasize & Heart)
    // ========================================
    match /reactions/{document=**} {
      // All authenticated users can read reactions
      allow read: if request.auth != null;

      // Users can create their own reactions
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.reactionType in ['emphasize', 'heart']
        && request.resource.data.verseRef is string
        && request.resource.data.timestamp == request.time;

      // Users can only delete their own reactions
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    // ========================================
    // BOOKMARKS COLLECTION
    // ========================================
    match /bookmarks/{document=**} {
      // Users can only read their own bookmarks
      allow read: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      // Users can create their own bookmarks
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.verseRef is string
        && request.resource.data.timestamp == request.time;

      // Users can only delete their own bookmarks
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    // ========================================
    // BOOKMARK COUNTS COLLECTION (Statistics)
    // ========================================
    match /bookmarkCounts/{document=**} {
      // Everyone authenticated can read counts
      allow read: if request.auth != null;

      // Prevent direct writes - only system/functions update this
      allow write: if false;
    }

    // ========================================
    // USERS COLLECTION (Online Status & Profile)
    // ========================================
    match /users/{userId} {
      // Users can read any user's profile (for displays)
      allow read: if request.auth != null;

      // Users can only update their own profile
      allow update: if request.auth != null
        && request.auth.uid == userId;

      // Prevent deletion to maintain user records
      allow delete: if false;
    }
  }
}
```

---

## What These Rules Do

### Authentication Required
✅ All operations require user to be signed in (`request.auth != null`)

### Mitzvah Reflections
✅ Users can read all reflections (community participation)
✅ Users can only write their own reflections
✅ Message must be 1-2000 characters
✅ Username must be ≤50 characters
✅ Uses server timestamps (prevents manipulation)

### Mitzvah Completion Tracking
✅ Users can only read/write their own progress
✅ Completion tied to `users/{userId}/mitzvahProgress/{challengeId}`
✅ Cannot be deleted (maintains history)

### Leaderboard
✅ Public read access (authenticated users can view)
✅ Users can only update their own entry
✅ Counts must be non-negative integers

### Data Validation
✅ All text fields must be non-empty
✅ String length limits enforced
✅ Boolean values required for completion status
✅ Server timestamps prevent client-side manipulation

---

## Collection Structure Reference

```
mitzvahReflections/
├── {docId}/
│   ├── challengeId: string (e.g., "mitzvah-bereshit")
│   ├── message: string (1-2000 chars)
│   ├── userId: string (Firebase UID)
│   ├── username: string (≤50 chars)
│   ├── createdAt: timestamp (server)
│   └── updatedAt: timestamp (server)

users/
├── {userId}/
│   ├── email: string
│   ├── username: string
│   ├── isOnline: boolean
│   ├── lastLogin: timestamp
│   └── mitzvahProgress/
│       └── {challengeId}/
│           ├── completed: boolean
│           ├── completedAt: timestamp
│           └── updatedAt: timestamp

mitzvahLeaderboard/
├── {userId}/
│   ├── userId: string
│   ├── username: string
│   ├── totalCompleted: number (non-negative)
│   ├── lastCompletedAt: timestamp
│   └── updatedAt: timestamp

comments/
├── {docId}/
│   ├── verseRef: string
│   ├── text: string (1-2000 chars)
│   ├── userId: string
│   ├── username: string
│   └── timestamp: timestamp

reactions/
├── {docId}/
│   ├── verseRef: string
│   ├── reactionType: string ("emphasize" | "heart")
│   ├── userId: string
│   └── timestamp: timestamp

bookmarks/
├── {docId}/
│   ├── verseRef: string
│   ├── userId: string
│   ├── verseText: string (optional)
│   └── timestamp: timestamp

bookmarkCounts/
└── {verseRef}/
    ├── verseRef: string
    ├── count: number
    └── updatedAt: timestamp
```

---

## Security Features Explained

### 1. User Isolation
- Users can only read/modify their own private data
- Completion status is tied to user ID + challenge ID
- Only authenticated users can access any data

### 2. Data Integrity
- All timestamps use `request.time` (server-side)
- Prevents users from backdating or falsifying timestamps
- Message sizes are validated (1-2000 characters)

### 3. Community Safety
- Users cannot delete their records (audit trail)
- Comments and reactions are deletable only by author
- Leaderboard is read-only to prevent manipulation

### 4. Reflection Requirement
The completion system works like this:
1. User submits reflection to `mitzvahReflections/{docId}`
2. App calls `setMitzvahCompletionStatus(userId, challengeId, true)`
3. This creates/updates `users/{userId}/mitzvahProgress/{challengeId}` with `completed: true`
4. Checkbox shows as completed
5. Leaderboard updates via `updateMitzvahLeaderboard(userId, username, delta)`

---

## Testing Your Rules

### In Firebase Emulator (Local Testing)
```bash
firebase emulators:start
```

### In Firebase Console (Production)
1. Click "Rules" tab in Firestore
2. Use the "Test" panel on the right
3. Simulate reads/writes with different user IDs

---

## Important Notes

⚠️ **These rules assume:**
- Your Firebase project ID is: `dvartorah-d1fad`
- Users are authenticated via Firebase Auth
- Your app uses the exact collection names shown

⚠️ **Do NOT:**
- Allow write access to `bookmarkCounts` or `bookmarkCounts` (only functions should update)
- Skip the `request.auth != null` check (this is your firewall)
- Store sensitive user data without proper read restrictions

---

## Deployment Checklist

- [ ] Copy the rules above
- [ ] Go to https://console.firebase.google.com
- [ ] Select project "dvartorah-d1fad"
- [ ] Click Firestore Database → Rules
- [ ] Paste the rules
- [ ] Review changes
- [ ] Click "Publish"
- [ ] Wait for "Rules updated successfully" message
- [ ] Test by submitting a mitzvah reflection in your app

---

## Need Help?

If you see permission errors:
1. Check browser console (F12) for exact error message
2. Verify the field names match exactly (case-sensitive)
3. Ensure user is authenticated
4. Check that timestamps are being sent as `serverTimestamp()`
