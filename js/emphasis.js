// Emphasis Module - Verse Emphasis/Like Feature (Professional styling)
import { db, getCurrentUserId } from './firebase.js';
import { getSavedUsername } from './ui.js';
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

export const EMPHASIS_TYPES = {
    important: {
        name: 'important',
        label: 'Important',
        description: 'Mark as especially important'
    },
    bookmark: {
        name: 'bookmark',
        label: 'Bookmark',
        description: 'Save for later study'
    },
    inspiring: {
        name: 'inspiring',
        label: 'Inspiring',
        description: 'Found this inspiring'
    },
    question: {
        name: 'question',
        label: 'Question',
        description: 'Have a question here'
    }
};

const emphasisListeners = new Map();
const emphasisState = new Map();

export function initializeEmphasis(verseRef, verseContainer) {
    if (!verseRef || !verseContainer) return;

    const section = ensureEmphasisSection(verseContainer, verseRef);
    startEmphasisListener(verseRef, section);
}

function ensureEmphasisSection(verseContainer, verseRef) {
    let section = verseContainer.querySelector('.emphasis-section');
    if (!section) {
        section = document.createElement('div');
        section.className = 'emphasis-section';
        section.dataset.verseRef = verseRef;
        verseContainer.appendChild(section);
    }

    if (!verseContainer.querySelector('.emphasis-status')) {
        const status = document.createElement('div');
        status.className = 'emphasis-status';
        verseContainer.appendChild(status);
    }

    if (section.childElementCount === 0) {
        Object.values(EMPHASIS_TYPES).forEach(type => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'emphasis-btn';
            button.dataset.emphasisType = type.name;
            button.dataset.verseRef = verseRef;
            button.title = type.description;
            button.innerHTML = `
                <span class="emphasis-label">${type.label}</span>
                <span class="emphasis-count">0</span>
            `;
            button.addEventListener('click', async (event) => {
                event.stopPropagation();
                await toggleEmphasis(verseRef, type.name, button);
            });
            section.appendChild(button);
        });
    }

    return section;
}

async function toggleEmphasis(verseRef, emphasisType, button) {
    const userId = getCurrentUserId();
    if (!userId) {
        showEmphasisStatus(button.closest('.verse-container'), 'Connecting to the study service. Please try again shortly.', true);
        return;
    }

    const username = getSavedUsername();
    if (!username) {
        showEmphasisStatus(button.closest('.verse-container'), 'Please set your display name (open the discussion panel) before emphasizing verses.', true);
        return;
    }

    try {
        const emphasisQuery = query(
            collection(db, 'emphasized_verses'),
            where('verseRef', '==', verseRef),
            where('userId', '==', userId),
            where('emphasisType', '==', emphasisType)
        );

        const snapshot = await getDocs(emphasisQuery);

        if (snapshot.empty) {
            await addDoc(collection(db, 'emphasized_verses'), {
                verseRef,
                userId,
                username,
                emphasisType,
                timestamp: serverTimestamp()
            });
            showEmphasisStatus(button.closest('.verse-container'), `${EMPHASIS_TYPES[emphasisType].label} added.`, false);
        } else {
            const removals = [];
            snapshot.forEach((docSnapshot) => {
                removals.push(deleteDoc(doc(db, 'emphasized_verses', docSnapshot.id)));
            });
            await Promise.all(removals);
            showEmphasisStatus(button.closest('.verse-container'), `${EMPHASIS_TYPES[emphasisType].label} removed.`, false);
        }
    } catch (error) {
        console.error('Error toggling emphasis:', error);
        showEmphasisStatus(button.closest('.verse-container'), 'Unable to update emphasis. Please try again.', true);
    }
}

function startEmphasisListener(verseRef, section) {
    if (emphasisListeners.has(verseRef)) {
        const dispose = emphasisListeners.get(verseRef);
        dispose();
    }

    try {
        const emphasisQuery = query(
            collection(db, 'emphasized_verses'),
            where('verseRef', '==', verseRef)
        );

        const unsubscribe = onSnapshot(emphasisQuery,
            (querySnapshot) => {
                const data = createEmptyEmphasisData();

                querySnapshot.forEach((docSnapshot) => {
                    const entry = docSnapshot.data();
                    const type = entry.emphasisType;
                    if (!data[type]) return;

                    data[type].count += 1;
                    data[type].users.push({
                        userId: entry.userId,
                        username: entry.username || 'Anonymous'
                    });
                });

                emphasisState.set(verseRef, data);
                updateEmphasisDisplay(section, data);
            },
            (error) => {
                console.error('Error listening to emphasis updates:', error);
                updateEmphasisDisplay(section, createEmptyEmphasisData());
            }
        );

        emphasisListeners.set(verseRef, unsubscribe);
    } catch (error) {
        console.error('Error creating emphasis listener:', error);
    }
}

function createEmptyEmphasisData() {
    const base = {};
    Object.values(EMPHASIS_TYPES).forEach(type => {
        base[type.name] = { count: 0, users: [] };
    });
    return base;
}

function updateEmphasisDisplay(section, emphasisData) {
    if (!section) return;

    const currentUserId = getCurrentUserId();

    Object.entries(EMPHASIS_TYPES).forEach(([typeKey, typeInfo]) => {
        const button = section.querySelector(`[data-emphasis-type="${typeInfo.name}"]`);
        if (!button) return;

        const dataForType = emphasisData[typeInfo.name] || { count: 0, users: [] };
        const countElement = button.querySelector('.emphasis-count');
        if (countElement) {
            countElement.textContent = dataForType.count;
        }

        const isActive = dataForType.users.some(user => user.userId === currentUserId);
        button.classList.toggle('emphasis-active', isActive);

        button.title = buildTooltip(typeInfo, dataForType.users);
    });
}

function buildTooltip(typeInfo, users) {
    if (!users || users.length === 0) {
        return typeInfo.description;
    }

    const names = users
        .map(user => user.username || 'Anonymous')
        .slice(0, 5);

    const remaining = users.length - names.length;

    let tooltip = `${typeInfo.description}. Marked by ${names.join(', ')}`;
    if (remaining > 0) {
        tooltip += `, and ${remaining} more`;
    }

    return tooltip;
}

function showEmphasisStatus(verseContainer, message, isError) {
    if (!verseContainer) return;
    const status = verseContainer.querySelector('.emphasis-status');
    if (!status) return;

    status.textContent = message;
    status.classList.toggle('error', Boolean(isError));
    status.classList.toggle('success', !isError);

    const timeout = isError ? 5000 : 3000;
    setTimeout(() => {
        status.textContent = '';
        status.classList.remove('error', 'success');
    }, timeout);
}

// Optional: expose cleanup
export function disposeEmphasisListener(verseRef) {
    if (emphasisListeners.has(verseRef)) {
        const dispose = emphasisListeners.get(verseRef);
        dispose();
        emphasisListeners.delete(verseRef);
    }
}
