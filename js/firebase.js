// Firebase Module - Initialize Firebase services
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
      console.log('User authenticated:', user.uid);
      if (onAuthReady) onAuthReady(user);
    } else {
      // Sign in anonymously if not authenticated
      signInAnonymously(auth)
        .then(() => {
          console.log('Anonymous sign-in successful');
        })
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

// Submit a comment to Firestore
async function submitComment(verseRef, text, userId) {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  if (!text || text.trim().length === 0) {
    throw new Error('Comment text is empty');
  }

  try {
    const commentData = {
      verseRef: verseRef,
      text: text.trim(),
      userId: userId,
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'comments'), commentData);
    console.log('Comment added with ID:', docRef.id);
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
    const commentsQuery = query(
      collection(db, 'comments'),
      where('verseRef', '==', verseRef),
      orderBy('timestamp', 'desc')
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
            timestamp: data.timestamp
          });
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
    console.log('Stopped listening for comments');
  }
}

export {
  auth,
  db,
  initAuth,
  getCurrentUserId,
  submitComment,
  listenForComments,
  stopListeningForComments
};
