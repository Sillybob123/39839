// Highlights Module - User Quote Highlighting Feature
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

let currentHighlightsUnsubscribe = null;
let activeHighlights = {};

// Initialize highlighting for a verse
export function initializeHighlighting(verseRef, englishTextElement, hebrewTextElement) {
    // TEMPORARILY DISABLED to prevent breaking existing functionality
    // Will be re-enabled once properly integrated with keyword highlighting
    return;

    /* DISABLED CODE
    if (!verseRef || !englishTextElement) return;

    // Listen for highlights on this verse
    listenForHighlights(verseRef, (highlights) => {
        applyHighlightsToVerse(englishTextElement, highlights, verseRef);
        activeHighlights[verseRef] = highlights;
    });

    // Set up text selection handler
    const verseContainer = englishTextElement.closest('.verse-container');
    if (verseContainer) {
        verseContainer.addEventListener('mouseup', (e) => handleTextSelection(e, verseRef, englishTextElement));
    }
    */
}

// Handle text selection
function handleTextSelection(event, verseRef, textElement) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText || selectedText.length === 0) return;

    // Check if selection is within the verse text
    if (!textElement.contains(selection.anchorNode) || !textElement.contains(selection.focusNode)) {
        return;
    }

    // Show highlight menu
    showHighlightMenu(event, verseRef, selectedText, selection);
}

// Show highlight menu popup
function showHighlightMenu(event, verseRef, selectedText, selection) {
    // Remove existing menu if any
    const existingMenu = document.getElementById('highlight-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'highlight-menu';
    menu.className = 'highlight-menu';

    const colors = [
        { name: 'yellow', label: 'Highlight Yellow' },
        { name: 'green', label: 'Highlight Green' },
        { name: 'blue', label: 'Highlight Blue' },
        { name: 'red', label: 'Highlight Red' }
    ];

    colors.forEach(color => {
        const button = document.createElement('button');
        button.className = `highlight-menu-btn highlight-${color.name}`;
        button.textContent = color.label;
        button.onclick = async () => {
            await saveHighlight(verseRef, selectedText, color.name, selection);
            menu.remove();
            window.getSelection().removeAllRanges();
        };
        menu.appendChild(button);
    });

    // Add cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'highlight-menu-btn highlight-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        menu.remove();
        window.getSelection().removeAllRanges();
    };
    menu.appendChild(cancelBtn);

    document.body.appendChild(menu);

    // Position the menu near the selection
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.zIndex = '9999';

    // Close menu on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Save highlight to Firebase
async function saveHighlight(verseRef, selectedText, color, selection) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('Please wait for authentication to complete');
        return;
    }

    try {
        const range = selection.getRangeAt(0);
        const textContent = range.startContainer.parentElement.closest('.english-text').textContent;

        const highlightData = {
            verseRef: verseRef,
            userId: userId,
            selectedText: selectedText,
            color: color,
            startOffset: getTextOffset(textContent, range.startOffset, range.startContainer),
            endOffset: getTextOffset(textContent, range.endOffset, range.endContainer),
            timestamp: serverTimestamp()
        };

        await addDoc(collection(db, 'highlights'), highlightData);
    } catch (error) {
        console.error('Error saving highlight:', error);
        alert('Failed to save highlight. Please try again.');
    }
}

// Get text offset within the verse
function getTextOffset(fullText, offset, node) {
    const parent = node.parentElement.closest('.english-text');
    if (!parent) return offset;

    const range = document.createRange();
    range.selectNodeContents(parent);
    range.setEnd(node, offset);
    return range.toString().length;
}

// Listen for highlights on a verse
function listenForHighlights(verseRef, callback) {
    try {
        const highlightsQuery = query(
            collection(db, 'highlights'),
            where('verseRef', '==', verseRef)
        );

        const unsubscribe = onSnapshot(highlightsQuery,
            (querySnapshot) => {
                const highlights = [];
                querySnapshot.forEach((doc) => {
                    highlights.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(highlights);
            },
            (error) => {
                console.error('Error listening to highlights:', error);
                callback([]);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up highlights listener:', error);
        callback([]);
    }
}

// Apply highlights to verse text
function applyHighlightsToVerse(textElement, highlights, verseRef) {
    // TEMPORARILY DISABLED - This function was interfering with keyword highlighting
    // Will be re-enabled in a future update with proper keyword preservation
    return;

    /* DISABLED CODE
    if (!textElement || highlights.length === 0) return;

    const currentUserId = getCurrentUserId();
    const userHighlights = highlights.filter(h => h.userId === currentUserId);
    const otherHighlights = highlights.filter(h => h.userId !== currentUserId);

    // Get original text
    let originalText = textElement.getAttribute('data-original-text');
    if (!originalText) {
        originalText = textElement.textContent;
        textElement.setAttribute('data-original-text', originalText);
    }

    // Sort highlights by start offset
    const allHighlights = [...userHighlights, ...otherHighlights].sort((a, b) => a.startOffset - b.startOffset);

    // Build highlighted HTML
    let html = '';
    let lastIndex = 0;

    allHighlights.forEach(highlight => {
        const start = highlight.startOffset;
        const end = highlight.endOffset;

        if (start < lastIndex) return; // Skip overlapping

        // Add non-highlighted text
        html += escapeHtml(originalText.substring(lastIndex, start));

        // Add highlighted text
        const isCurrentUser = highlight.userId === currentUserId;
        const highlightClass = `highlight highlight-${highlight.color} ${isCurrentUser ? 'highlight-own' : 'highlight-other'}`;
        const title = isCurrentUser ? 'Your highlight - Click to remove' : `Highlighted by another user`;

        html += `<span class="${highlightClass}" data-highlight-id="${highlight.id}" data-is-own="${isCurrentUser}" title="${title}">${escapeHtml(originalText.substring(start, end))}</span>`;

        lastIndex = end;
    });

    // Add remaining text
    html += escapeHtml(originalText.substring(lastIndex));

    textElement.innerHTML = html;

    // Add click handlers to remove own highlights
    textElement.querySelectorAll('.highlight-own').forEach(span => {
        span.style.cursor = 'pointer';
        span.addEventListener('click', async (e) => {
            e.stopPropagation();
            const highlightId = span.getAttribute('data-highlight-id');
            if (confirm('Remove this highlight?')) {
                await removeHighlight(highlightId);
            }
        });
    });
    */
}

// Remove highlight
async function removeHighlight(highlightId) {
    try {
        await deleteDoc(doc(db, 'highlights', highlightId));
    } catch (error) {
        console.error('Error removing highlight:', error);
        alert('Failed to remove highlight. Please try again.');
    }
}

// Load highlights count for a verse (for badges)
export async function getHighlightCount(verseRef) {
    try {
        const highlightsQuery = query(
            collection(db, 'highlights'),
            where('verseRef', '==', verseRef)
        );
        const snapshot = await getDocs(highlightsQuery);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting highlight count:', error);
        return 0;
    }
}

// Escape HTML for security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Stop listening for highlights
export function stopListeningForHighlights() {
    if (currentHighlightsUnsubscribe) {
        currentHighlightsUnsubscribe();
        currentHighlightsUnsubscribe = null;
    }
}

export {
    initializeHighlighting,
    listenForHighlights,
    getHighlightCount
};
