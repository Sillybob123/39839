// Emphasis Module - Verse Emphasis/Like Feature
import { db, getCurrentUserId } from './firebase.js';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    serverTimestamp,
    getDocs
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let emphasisListeners = {};

// Emphasis types (professional, no emojis)
export const EMPHASIS_TYPES = {
    star: {
        name: 'star',
        label: 'Important',
        icon: '★',
        description: 'Mark as especially important'
    },
    bookmark: {
        name: 'bookmark',
        label: 'Bookmark',
        icon: '🔖',
        description: 'Bookmark for later study'
    },
    heart: {
        name: 'heart',
        label: 'Inspiring',
        icon: '♥',
        description: 'Found this inspiring'
    },
    question: {
        name: 'question',
        label: 'Question',
        icon: '?',
        description: 'Have a question about this'
    }
};

// Initialize emphasis for a verse
export function initializeEmphasis(verseRef, container) {
    if (!verseRef || !container) return;

    // Create emphasis button section
    const emphasisSection = createEmphasisSection(verseRef);

    // Insert after verse indicators
    const indicators = container.querySelector('.verse-indicators');
    if (indicators) {
        indicators.appendChild(emphasisSection);
    }

    // Listen for emphasis changes
    listenForEmphasis(verseRef, (emphasisData) => {
        updateEmphasisDisplay(verseRef, emphasisData, emphasisSection);
    });
}

// Create emphasis section UI
function createEmphasisSection(verseRef) {
    const section = document.createElement('div');
    section.className = 'emphasis-section';
    section.setAttribute('data-verse-ref', verseRef);

    // Create emphasis buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'emphasis-buttons';

    Object.values(EMPHASIS_TYPES).forEach(type => {
        const button = document.createElement('button');
        button.className = `emphasis-btn emphasis-${type.name}`;
        button.setAttribute('data-emphasis-type', type.name);
        button.setAttribute('data-verse-ref', verseRef);
        button.title = type.description;

        const icon = document.createElement('span');
        icon.className = 'emphasis-icon';
        icon.textContent = type.icon;

        const count = document.createElement('span');
        count.className = 'emphasis-count';
        count.textContent = '0';

        button.appendChild(icon);
        button.appendChild(count);

        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            await toggleEmphasis(verseRef, type.name, button);
        });

        buttonsContainer.appendChild(button);
    });

    section.appendChild(buttonsContainer);
    return section;
}

// Toggle emphasis on/off
async function toggleEmphasis(verseRef, emphasisType, button) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('Please wait for authentication to complete');
        return;
    }

    try {
        // Check if user already emphasized this verse with this type
        const emphasisQuery = query(
            collection(db, 'emphasized_verses'),
            where('verseRef', '==', verseRef),
            where('userId', '==', userId),
            where('emphasisType', '==', emphasisType)
        );

        const snapshot = await getDocs(emphasisQuery);

        if (snapshot.empty) {
            // Add emphasis
            await addDoc(collection(db, 'emphasized_verses'), {
                verseRef: verseRef,
                userId: userId,
                emphasisType: emphasisType,
                timestamp: serverTimestamp()
            });
            button.classList.add('emphasis-active');
        } else {
            // Remove emphasis
            snapshot.forEach(async (docSnapshot) => {
                await deleteDoc(doc(db, 'emphasized_verses', docSnapshot.id));
            });
            button.classList.remove('emphasis-active');
        }
    } catch (error) {
        console.error('Error toggling emphasis:', error);
        alert('Failed to update emphasis. Please try again.');
    }
}

// Listen for emphasis changes
function listenForEmphasis(verseRef, callback) {
    try {
        const emphasisQuery = query(
            collection(db, 'emphasized_verses'),
            where('verseRef', '==', verseRef)
        );

        const unsubscribe = onSnapshot(emphasisQuery,
            (querySnapshot) => {
                const emphasisData = {
                    star: { count: 0, users: [] },
                    bookmark: { count: 0, users: [] },
                    heart: { count: 0, users: [] },
                    question: { count: 0, users: [] }
                };

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const type = data.emphasisType;
                    if (emphasisData[type]) {
                        emphasisData[type].count++;
                        emphasisData[type].users.push(data.userId);
                    }
                });

                callback(emphasisData);
            },
            (error) => {
                console.error('Error listening to emphasis:', error);
                callback({});
            }
        );

        emphasisListeners[verseRef] = unsubscribe;
        return unsubscribe;
    } catch (error) {
        console.error('Error setting up emphasis listener:', error);
        callback({});
    }
}

// Update emphasis display
function updateEmphasisDisplay(verseRef, emphasisData, emphasisSection) {
    const currentUserId = getCurrentUserId();

    Object.keys(emphasisData).forEach(type => {
        const button = emphasisSection.querySelector(`[data-emphasis-type="${type}"]`);
        if (!button) return;

        const countSpan = button.querySelector('.emphasis-count');
        const data = emphasisData[type];

        if (countSpan) {
            countSpan.textContent = data.count.toString();
        }

        // Highlight if current user emphasized
        if (data.users.includes(currentUserId)) {
            button.classList.add('emphasis-active');
        } else {
            button.classList.remove('emphasis-active');
        }

        // Show/hide based on count
        if (data.count > 0) {
            button.style.display = 'inline-flex';
        } else {
            button.style.display = 'inline-flex'; // Keep visible for user to click
            button.style.opacity = '0.5'; // Make it slightly faded when count is 0
        }
    });
}

// Get emphasis counts for a verse
export async function getEmphasisCounts(verseRef) {
    try {
        const emphasisQuery = query(
            collection(db, 'emphasized_verses'),
            where('verseRef', '==', verseRef)
        );
        const snapshot = await getDocs(emphasisQuery);

        const counts = {
            star: 0,
            bookmark: 0,
            heart: 0,
            question: 0,
            total: snapshot.size
        };

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (counts[data.emphasisType] !== undefined) {
                counts[data.emphasisType]++;
            }
        });

        return counts;
    } catch (error) {
        console.error('Error getting emphasis counts:', error);
        return { star: 0, bookmark: 0, heart: 0, question: 0, total: 0 };
    }
}

// Stop listening for emphasis
export function stopListeningForEmphasis(verseRef) {
    if (verseRef && emphasisListeners[verseRef]) {
        emphasisListeners[verseRef]();
        delete emphasisListeners[verseRef];
    }
}

// Stop all emphasis listeners
export function stopAllEmphasisListeners() {
    Object.keys(emphasisListeners).forEach(verseRef => {
        emphasisListeners[verseRef]();
    });
    emphasisListeners = {};
}

export {
    initializeEmphasis,
    getEmphasisCounts,
    stopListeningForEmphasis,
    stopAllEmphasisListeners
};
