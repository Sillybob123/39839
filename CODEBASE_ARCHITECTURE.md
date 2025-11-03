# A Letter in the Scroll - Codebase Architecture Summary

## Executive Overview
A Letter in the Scroll is a **client-side web application** for interactive Torah study with authentication, bookmarking, commenting, and community discussion features. The project is a single-page application (SPA) built with vanilla JavaScript, Tailwind CSS, and Firebase for backend services.

---

## 1. Technology Stack

### Frontend
- **HTML5** - Structure (index.html, prayers.html, about.html)
- **CSS3 + Tailwind CSS** - Styling (style.css with Tailwind via CDN)
- **Vanilla JavaScript (ES6 Modules)** - Application logic
  - No frontend framework (React, Vue, etc.)
  - Modern browser APIs (fetch, localStorage, etc.)

### Backend/Database
- **Firebase (Google Cloud)** - Backend as a Service
  - **Firebase Authentication** - Email/password sign-in
  - **Firestore (NoSQL Database)** - Real-time data storage
  - Version: Firebase SDK v10.7.1

### External APIs
- **Sefaria.org API** - Torah text retrieval
  - Endpoint: `https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js`
  - v3 text API with fallback to v1
  - Provides Hebrew and English Torah text

---

## 2. Project Structure

### Root Directory Files
```
/Users/yairben-dor/XCode/FriendTorahStudy/
├── index.html                        # Main application page
├── prayers.html                      # Prayers section
├── about.html                        # About page
├── style.css                         # Main stylesheet
├── text-size-control.js              # Text sizing functionality
├── script.js                         # Utility scripts
├── prayers.js / prayers-data.js      # Prayer-related logic
│
├── data.json                         # Parsha commentary data
├── parsha_significance.json          # Parsha significance information
│
├── FIREBASE_SETUP_GUIDE.md           # Setup documentation
├── FIRESTORE_SECURITY_RULES.txt      # Database access rules
├── BOOKMARKING_IMPLEMENTATION_GUIDE.md
│
└── js/                               # Core application modules
    ├── main.js                       # Application entry point (1660 lines)
    ├── firebase.js                   # Firebase integration & auth
    ├── api.js                        # Sefaria API interaction
    ├── config.js                     # Configuration & Torah Parshas data
    ├── state.js                      # State management
    ├── ui.js                         # DOM manipulation & UI logic
    └── main_backup.js                # Backup file
```

---

## 3. Authentication System

### Method: Email/Password via Firebase Auth

#### Login Flow
1. User loads app -> Login modal appears (if not authenticated)
2. User enters email & password
3. `signInWithEmail(email, password)` function called
4. Firebase validates credentials
5. On success: User session stored, modal hidden, UI updates
6. Session persists via `browserLocalPersistence` (survives browser refresh)

#### Key Functions (firebase.js)
```javascript
initAuth(onAuthReady)                    // Initialize auth listener
signInWithEmail(email, password)         // Email/password login
createAccountWithEmail(email, password)  // Account creation
signOutUser()                            // Sign out
getCurrentUserId()                       // Get current user's Firebase UID
getCurrentUserEmail()                    // Get current user's email
sendPasswordReset(email)                 // Password reset via email
```

#### Test Accounts (Pre-created in Firebase)
```
naama.bendor1@gmail.com
loripreci@gwmail.gwu.edu
loripreci03@gmail.com
lpreci1@jh.edu
aidan.schurr@gwmail.gwu.edu
aidanitaischurr@gmail.com
erezroy8@gmail.com
stoneda4@gmail.com
sas562@georgetown.edu
avauditsky@gmail.com
```

#### Firebase Configuration
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC3KsU8fdztSCQ5b7sgMUWWbDDJVrQ0ymU",
  authDomain: "dvartorah-d1fad.firebaseapp.com",
  projectId: "dvartorah-d1fad",
  storageBucket: "dvartorah-d1fad.appspot.com",
  messagingSenderId: "368154467911",
  appId: "1:368154467911:web:7af511f96100559a7e9b62"
};
```

### Session Tracking
- **Session Storage**: Firebase handles this internally
- **Persistence**: `browserLocalPersistence` - user stays logged in across browser sessions
- **Current User State**: Tracked in `currentUser` variable in firebase.js
- **Auth Ready Flag**: `isAuthReady` flag in main.js ensures auth state is initialized before using protected features

---

## 4. Database Schema (Firestore)

### Collection: `comments`
**Purpose**: Store verse discussions and parsha general chat

**Document ID**: Auto-generated

**Fields**:
```javascript
{
  verseRef: string,        // e.g., "Genesis 1:1" or "PARSHA:Genesis 1:1-6:8"
  text: string,            // Comment content (max 1000 chars)
  userId: string,          // Firebase Auth UID
  username: string,        // Display name (max 50 chars)
  timestamp: timestamp     // When created (server-side timestamp)
}
```

**Firestore Rules**:
- Read: Authenticated users only
- Create: Authenticated users, must have userId matching auth user
- Delete: Only comment author can delete
- Update: Disabled

---

### Collection: `reactions`
**Purpose**: Track user reactions (emphasize, heart) on verses

**Document ID**: `{encodeURIComponent(verseRef)}__{userId}__{reactionType}`
Example: `Genesis%201%3A1__user123abc__heart`

**Fields**:
```javascript
{
  verseRef: string,        // e.g., "Genesis 1:1"
  userId: string,          // Firebase Auth UID
  reactionType: string,    // "heart" or "emphasize"
  timestamp: timestamp     // When created
}
```

**Firestore Rules**:
- Read: Authenticated users only
- Create: Authenticated users, must have valid reaction type
- Delete: Only author can delete
- Update: Disabled

---

### Collection: `bookmarks`
**Purpose**: Store user's saved/bookmarked verses

**Document ID**: `{userId}__{encodeURIComponent(verseRef)}`
Example: `user123abc__Genesis%201%3A1`

**Fields**:
```javascript
{
  verseRef: string,        // e.g., "Genesis 1:1"
  userId: string,          // Firebase Auth UID
  timestamp: timestamp,    // When bookmarked
  verseText?: string       // Optional: verse text snapshot
}
```

**Firestore Rules**:
- Read: User can only read their own bookmarks
- Create: Authenticated users, must own the bookmark
- Delete: Only bookmark owner can delete
- Update: Disabled

---

### Collection: `bookmarkCounts`
**Purpose**: Track aggregate bookmark statistics per verse

**Document ID**: `{encodeURIComponent(verseRef)}`
Example: `Genesis%201%3A1`

**Fields**:
```javascript
{
  verseRef: string,        // e.g., "Genesis 1:1"
  count: number,           // Total number of bookmarks (uses increment)
  updatedAt: timestamp     // Last update time
}
```

**Public Visibility**: Yes - all users can see bookmark counts (helps drive engagement)

---

## 5. Website Structure & Features

### Main Pages

#### index.html - Main Study Page
- **Header**: Navigation with logo, user controls
- **Navigation Bar**: Parsha selector, navigation buttons, text size controls
- **Main Content**: Torah text display with verse-by-verse layout
- **Comment Panel**: Side panel for verse discussions and general chat
- **Info Panel**: Modal for commentary and definitions
- **Login Modal**: Sign-in interface
- **Password Reset Modal**: Password recovery

#### prayers.html - Prayer Resources
- Collection of important prayers and readings
- Related style/script files: prayers-style.css, prayers.js, prayers-data.js

#### about.html - About Section
- Project information

### Core Features Implemented

1. **Torah Text Display**
   - All 54 Torah Parshas (weekly portions)
   - English and Hebrew text from Sefaria
   - Per-verse organization with references

2. **Authentication & Sessions**
   - Email/password login
   - Password reset via email
   - Session persistence
   - Sign out functionality

3. **Bookmarking System**
   - Bookmark individual verses
   - View all bookmarks in "My Bookmarks" panel
   - Bookmark counters (show aggregate count per verse)
   - Bookmark state UI updates

4. **Comments & Discussion**
   - Verse-specific comments
   - General parsha discussion ("Parsha Chat")
   - Real-time comment loading
   - Delete own comments
   - Username display (extracted from email)

5. **Reactions**
   - Emphasize reactions (bookmark-like)
   - Heart reactions
   - Toggle on/off per user
   - Aggregate reaction counts displayed on verses

6. **Parsha Significance**
   - Modal showing significance/themes of current parsha

7. **Navigation**
   - Dropdown selector for all parshas
   - Previous/Next buttons
   - "This Week's Parsha" button
   - Keyboard navigation (arrow keys)

8. **Accessibility**
   - Text size controls (small, normal, large)
   - Responsive design (desktop & mobile)
   - ARIA labels and semantic HTML

---

## 6. Session/Login Tracking

### How Sessions Work

#### Authentication State Management
```javascript
// In firebase.js
let currentUser = null;  // Holds Firebase User object

function initAuth(onAuthReady) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;  // User authenticated
      showLoginModal();
      if (onAuthReady) onAuthReady(user);
    } else {
      currentUser = null;  // User not authenticated
      hideLoginModal();
      if (onAuthReady) onAuthReady(null);
    }
  });
}
```

#### Session Persistence
- **Method**: Firebase's `browserLocalPersistence`
- **Storage**: Browser's localStorage (Firebase SDK manages this)
- **Duration**: Indefinite (until user signs out or localStorage cleared)
- **Scope**: Per-origin (only this app can access)

#### Login Modal
- Displayed if `currentUser === null`
- Hidden if user is authenticated
- Forces authentication before accessing features

#### Auth-Protected Features
- Comment posting: Requires `getCurrentUserId()`
- Bookmarking: Requires authenticated user
- Viewing bookmarks: Only sees own bookmarks
- Comment deletion: Only own comments

#### Tracking Implementation Details

1. **Initial Auth Check** (main.js init())
   ```javascript
   await new Promise((resolve) => {
     initAuth(async (user) => {
       isAuthReady = true;
       await handleAuthStateChange(user);  // Updates UI
       resolve();
     });
   });
   ```

2. **Auth State Change Handler** (main.js)
   ```javascript
   async function handleAuthStateChange(user) {
     updateCommentInputState(Boolean(user));  // Enable/disable comment input
     if (user) {
       setCurrentUserEmail(user.email);
       updateUsernameDisplay();
       await refreshBookmarkedVerses();  // Load user's bookmarks
     } else {
       setCurrentUserEmail(null);
       updateUsernameDisplay();
       bookmarkedVerses.clear();
       clearBookmarkUIState();
     }
   }
   ```

3. **Header Updates**
   - "My Bookmarks" button: Only visible when logged in
   - "Sign Out" button: Only visible when logged in
   - Username display: Shows email prefix (before @) as username

4. **Data Isolation**
   - Each user can only access/modify their own:
     - Bookmarks
     - Comments they created
     - Reactions they created
   - Firestore security rules enforce this at database level

---

## 7. Data Flow

### Application Initialization
```
1. Page loads (index.html)
2. main.js module imported
3. init() function called
   a. Firebase auth listener registered
   b. Wait for auth state to resolve
   c. Load Torah commentary data (data.json)
   d. Populate parsha list
   e. Fetch current week's parsha from Sefaria
   f. Load Torah text via Sefaria API
   g. Display verses with interactive features
4. User interactions handled via event listeners
```

### Feature: Viewing a Verse's Comments
```
1. User clicks verse text
2. openCommentsPanel() called
3. Comments loaded via Firestore query:
   query(collection(db, 'comments'), where('verseRef', '==', verseRef))
4. Real-time listener started (onSnapshot)
5. Comments displayed sorted by timestamp (newest first)
6. User can submit comment if authenticated
```

### Feature: Bookmarking a Verse
```
1. User clicks bookmark icon (if authenticated)
2. handleBookmarkClick() called
3. Check if already bookmarked
4. If not: addBookmark(verseRef, userId, verseText)
   - Creates document in 'bookmarks' collection
   - Increments count in 'bookmarkCounts' collection
5. UI updates immediately
6. On next login, bookmarks auto-loaded from Firestore
```

---

## 8. Security Model

### Firestore Security Rules
Located in: `FIRESTORE_SECURITY_RULES.txt`

**Key Principles**:
1. All access requires authentication
2. Users can only CRUD (Create, Read, Update, Delete) their own data
3. Data validation at database level
4. No anonymous access to protected data

**Rule Examples**:
```
- Bookmarks: Users can only read/modify their own
- Comments: Users can only delete their own
- Reactions: Users can only delete their own
- Bookmark counts: Public read (all users see counts)
```

### API Key Security
- Firebase web API key is embedded in code (js/firebase.js)
- This is intentional: web apps must expose key, use Firestore rules for security
- Rules validate:
  - User ID matches auth user
  - Required fields present
  - Field values meet constraints (string length, types, etc.)

---

## 9. Additional Notes

### Local Data Caching
- Commentary data: Loaded once at init from data.json
- Verse bookmark state: Cached in `bookmarkedVerses` Set
- Reaction counts: Cached in `verseReactionCounts` object
- Comment counts: Cached in `verseCommentCounts` object
- Real-time Firestore listeners keep these in sync

### Firestore Query Limitations (Handled in Code)
- 'in' operator limited to 30 items - code batches queries
- Multiple 'where' clauses require indexes
- Client-side filtering used as workaround for complex queries

### Email Handling
- Emails normalized (lowercase, trimmed) during login
- Passwords preserve case (not normalized)
- Username extracted from email (text before @ symbol)

### Environment
- No .env file in production
- Firebase config hardcoded (acceptable for web apps with security rules)

---

## 10. Summary Table

| Aspect | Details |
|--------|---------|
| **Architecture** | Client-side SPA with serverless backend |
| **Frontend Framework** | None (vanilla JS + Tailwind CSS) |
| **Backend** | Firebase (Auth + Firestore) |
| **Database** | Firestore (NoSQL, document-based) |
| **Authentication** | Email/password via Firebase Auth |
| **Session Persistence** | Browser localStorage (Firebase-managed) |
| **Main Collections** | comments, reactions, bookmarks, bookmarkCounts |
| **Access Model** | User-based isolation + Firestore rules |
| **API Source** | Sefaria.org (Torah text) |
| **Public Features** | Torah reading, commentary, parsha info |
| **Authenticated Features** | Commenting, bookmarking, reactions |
| **Key Challenge** | Session management in static hosting (solved with Firebase) |

