# A Letter in the Scroll - Quick Reference Guide

## Key Files at a Glance

| File | Purpose | Key Exports/Functions |
|------|---------|---------------------|
| **js/firebase.js** | Firebase integration | `initAuth()`, `signInWithEmail()`, `getCurrentUserId()`, `submitComment()`, `addBookmark()` |
| **js/main.js** | Application logic | `init()`, `handleAuthStateChange()`, `handleBookmarkClick()`, `loadParsha()` |
| **js/api.js** | Sefaria API calls | `fetchParshaText()`, `fetchCurrentParsha()`, `loadCommentaryData()` |
| **js/config.js** | Configuration | `TORAH_PARSHAS[]`, `API_CONFIG` |
| **js/state.js** | State management | `state`, `setState()` |
| **js/ui.js** | DOM manipulation | `showLoading()`, `updateParshaHeader()`, `openCommentsPanel()`, `showCommentary()` |
| **index.html** | Main page | Login modal, comment panel, Torah text area |
| **style.css** | Styling | All CSS (Tailwind + custom) |
| **data.json** | Commentary data | Parsha commentaries, keywords, definitions |

---

## Authentication Flow - Step by Step

```
User visits index.html
        ↓
main.js initializes
        ↓
Firebase auth listener started (initAuth)
        ↓
Is user in localStorage? (from Firebase session)
        ├─ YES → Load user, hide login modal, show "Sign Out" button
        └─ NO → Show login modal, ask for email/password
        ↓
User enters credentials
        ↓
signInWithEmail(email, password)
        ↓
Firebase validates in cloud
        ├─ Valid → Store in localStorage, call handleAuthStateChange
        └─ Invalid → Show error message, prompt retry
        ↓
handleAuthStateChange(user)
        ├─ Update UI (show username, enable bookmarking)
        ├─ Load user's bookmarks from Firestore
        └─ Hide login modal
        ↓
User can now:
- Comment on verses
- Bookmark verses
- React to verses
- View personal bookmarks
```

---

## Database Collections Quick View

### Comments
- **Triggered by**: User clicks verse, writes comment, clicks Submit
- **Data saved**: `{ verseRef, text, userId, username, timestamp }`
- **Query**: `where('verseRef', '==', verseRef)`
- **Real-time**: Yes (onSnapshot listener)

### Reactions (Emphasize & Heart)
- **Triggered by**: User clicks heart or emphasize icon
- **Data saved**: `{ verseRef, userId, reactionType, timestamp }`
- **Query**: `where('userId', '==', userId)` + `where('verseRef', 'in', [...verseRefs])`
- **Real-time**: No (queries on demand)

### Bookmarks
- **Triggered by**: User clicks bookmark icon
- **Data saved**: `{ verseRef, userId, timestamp, verseText? }`
- **Query**: `where('userId', '==', userId)`
- **Real-time**: No (loaded once at login, cached locally)

### Bookmark Counts
- **Triggered by**: Same as bookmarks (auto-increment)
- **Data saved**: `{ verseRef, count, updatedAt }`
- **Query**: `where('verseRef', '>=', startRef), where('verseRef', '<=', endRef)`
- **Real-time**: No
- **Public**: Yes (all users see these)

---

## Session Persistence Details

### What Gets Saved in Browser
```javascript
// Firebase SDK automatically saves to localStorage:
{
  "firebase:authUser:...": {
    uid: "user123abc",
    email: "user@example.com",
    accessToken: "...",
    expiresAt: timestamp
  }
}
```

### How It Works
1. User signs in → Token saved to localStorage
2. Page refreshes → Firebase checks localStorage
3. Token valid → User auto-logged-in
4. Token expired → Firebase refreshes token automatically
5. User signs out → Token deleted from localStorage

### Where to Check Session
```javascript
// In browser console:
localStorage  // Shows Firebase tokens

// In code:
import { getCurrentUserId } from './js/firebase.js';
getCurrentUserId()  // Returns UID if logged in, null if not

import { getCurrentUserEmail } from './js/firebase.js';
getCurrentUserEmail()  // Returns email if logged in, null if not
```

---

## Common User Workflows

### Login
1. App loads → Login modal appears
2. Enter email & password
3. Click "Sign In"
4. Success → Modal closes, bookmarks load
5. Error → See error message, try again

### Bookmark a Verse
1. Log in
2. Read verse
3. Click bookmark icon
4. See count increase (you're now in list)
5. Sign out/in → Bookmark still there

### Comment on Verse
1. Log in (username auto-set from email)
2. Click verse text
3. Comments panel opens
4. Type comment in text area
5. Click "Submit Comment"
6. See comment appear instantly (real-time)

### View My Bookmarks
1. Log in
2. Click "My Bookmarks" button (header)
3. See all verses you've bookmarked
4. Click verse to jump to it
5. See bookmark highlighted

### Parsha Chat
1. Log in
2. Click "Parsha Chat" button
3. Discuss current parsha with others
4. Comments are verse-independent
5. Use prefix `PARSHA:` internally

---

## Important Code Patterns

### Checking if User is Logged In
```javascript
import { getCurrentUserId } from './js/firebase.js';

const userId = getCurrentUserId();
if (userId) {
  // User is logged in
} else {
  // Show login modal or alert
}
```

### Listening to Comments Real-time
```javascript
import { listenForComments, stopListeningForComments } from './js/firebase.js';

listenForComments('Genesis 1:1', (comments) => {
  console.log('Comments:', comments);
  // Update UI with comments array
  // This callback fires whenever comments change
});

// Later, stop listening:
stopListeningForComments();
```

### Saving a Bookmark
```javascript
import { addBookmark } from './js/firebase.js';

const userId = getCurrentUserId();
await addBookmark('Genesis 1:1', userId, { verseText: 'In the beginning...' });
// Document created in 'bookmarks' collection
// Count incremented in 'bookmarkCounts' collection
```

### Getting Reaction Counts
```javascript
import { getReactionCounts } from './js/firebase.js';

const counts = await getReactionCounts(['Genesis 1:1', 'Genesis 1:2']);
// Returns: {
//   'Genesis 1:1': { emphasize: 5, heart: 3 },
//   'Genesis 1:2': { emphasize: 2, heart: 7 }
// }
```

---

## Firestore Rules Summary

### Who Can Do What

| Action | Comments | Reactions | Bookmarks | Bookmark Counts |
|--------|----------|-----------|-----------|-----------------|
| Create | Authed only | Authed only | Authed only | Auto (by code) |
| Read | Authed only | Authed only | Own only | Anyone |
| Update | Never | Never | Never | Auto (by code) |
| Delete | Own only | Own only | Own only | Auto (by code) |

### Key Security Rules
- `request.auth.uid == resource.data.userId` → Only own data
- `request.auth != null` → Must be authenticated
- Field validation: text length, types, ranges
- No direct writes to bookmarkCounts (use Firebase increment operator)

---

## Testing Checklist

- [ ] Can create account (or use pre-created test account)
- [ ] Login persists after page refresh
- [ ] Can bookmark verses (bookmark count increases)
- [ ] Bookmarks visible in "My Bookmarks"
- [ ] Can comment on verses (appears instantly)
- [ ] Can delete own comments
- [ ] Cannot see other users' bookmarks
- [ ] Cannot delete others' comments
- [ ] Can react with heart/emphasize
- [ ] Parsha Chat works (no verse context)
- [ ] Text size controls work
- [ ] Navigation (prev/next/dropdown) works
- [ ] Password reset sends email
- [ ] Sign out clears session

---

## Troubleshooting Guide

### Issue: Login modal never disappears
- Check browser console for Firebase errors
- Verify Firebase config in js/firebase.js is correct
- Check Firestore Rules are published
- Clear browser cache and localStorage

### Issue: Bookmarks don't save
- Verify user is authenticated: `getCurrentUserId()` in console
- Check Firestore Rules → bookmarks collection
- Verify 'bookmarks' collection exists in Firebase
- Check browser console for Firestore errors

### Issue: Comments not loading
- Verify 'comments' collection exists in Firestore
- Check if user is authenticated
- Verify Firestore Rules allow read access
- Look for Firebase SDK errors in console

### Issue: User stays logged in after closing browser
- This is expected behavior (browserLocalPersistence)
- To test logout: Click "Sign Out" button
- To clear session manually: Delete localStorage or use incognito mode

### Issue: Parsha text not loading
- Check Sefaria API status: https://www.sefaria.org/api
- Verify parsha reference format (should be like "Genesis 1:1-6:8")
- Check browser console for fetch errors
- Try refreshing page

---

## File Sizes & Dependencies

```
js/main.js      1660 lines (core logic)
js/firebase.js  ~650 lines (auth + database)
js/ui.js        ~400 lines (DOM operations)
js/api.js       ~250 lines (API calls)
index.html      ~350 lines (markup)
style.css       ~1000+ lines (styles)

Dependencies:
- Firebase SDK v10.7.1 (from CDN)
- Tailwind CSS (from CDN)
- Sefaria API (external)
```

---

## Important URLs

- **Firebase Console**: https://console.firebase.google.com/ (Project: dvartorah-d1fad)
- **Sefaria API Docs**: https://www.sefaria.org/api
- **Torah Texts**: https://www.sefaria.org (source of text)

