// Firebase Module - Initialize Firebase services
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3KsU8fdztSCQ5b7sgMUWWbDDJVrQ0ymU",
  authDomain: "dvartorah-d1fad.firebaseapp.com",
  projectId: "dvartorah-d1fad",
  storageBucket: "dvartorah-d1fad.appspot.com",
  messagingSenderId: "368154467911",
  appId: "1:368154467911:web:7af511f96100559a7e9b62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Current user state
let currentUser = null;

// Initialize anonymous authentication
function initAuth(onAuthReady) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      if (onAuthReady) onAuthReady(user);
    } else {
      // Sign in anonymously if not authenticated
      signInAnonymously(auth)
        .catch((error) => {
          console.error('Anonymous sign-in error:', error);
        });
    }
  });
}

// Get current user ID
function getCurrentUserId() {
  return currentUser ? currentUser.uid : null;
}

// Submit a comment to Firestore with username
async function submitComment(verseRef, text, userId, username) {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  if (!text || text.trim().length === 0) {
    throw new Error('Comment text is empty');
  }

  if (!username || username.trim().length === 0) {
    throw new Error('Username is required');
  }

  if (username.trim().length > 50) {
    throw new Error('Username must be 50 characters or less');
  }

  try {
    const commentData = {
      verseRef: verseRef,
      text: text.trim(),
      userId: userId,
      username: username.trim(),
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'comments'), commentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Listen for comments on a specific verse
let currentCommentsUnsubscribe = null;

function listenForComments(verseRef, callback) {
  // Stop previous listener if exists
  if (currentCommentsUnsubscribe) {
    currentCommentsUnsubscribe();
    currentCommentsUnsubscribe = null;
  }

  try {
    // SIMPLIFIED QUERY - No orderBy to avoid needing an index
    // We'll sort in JavaScript instead
    const commentsQuery = query(
      collection(db, 'comments'),
      where('verseRef', '==', verseRef)
      // orderBy removed temporarily - will sort in code
    );

    currentCommentsUnsubscribe = onSnapshot(commentsQuery, 
      (querySnapshot) => {
        const comments = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          comments.push({
            id: doc.id,
            verseRef: data.verseRef,
            text: data.text,
            userId: data.userId,
            username: data.username || 'Anonymous',
            timestamp: data.timestamp
          });
        });
        
        // Sort by timestamp in JavaScript (newest first)
        comments.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp.toMillis() - a.timestamp.toMillis();
        });
        
        callback(comments);
      },
      (error) => {
        console.error('Error listening to comments:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up comment listener:', error);
    callback([]);
  }
}

// Stop listening for comments
function stopListeningForComments() {
  if (currentCommentsUnsubscribe) {
    currentCommentsUnsubscribe();
    currentCommentsUnsubscribe = null;
  }
}

// Export Firebase utilities for highlights and emphasis modules
export {
  auth,
  db,
  initAuth,
  getCurrentUserId,
  submitComment,
  listenForComments,
  stopListeningForComments,
  // Export Firestore methods for other modules to use
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  serverTimestamp
};
