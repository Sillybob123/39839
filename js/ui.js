// UI Module - Handles all DOM manipulation - NO EMOJIS
import { state } from './state.js';

/**
 * Show loading state
 */
export function showLoading() {
    document.getElementById('loading-message').classList.remove('hidden');
    document.getElementById('parsha-text').innerHTML = '';
}

/**
 * Hide loading state
 */
export function hideLoading() {
    document.getElementById('loading-message').classList.add('hidden');
}

/**
 * Show error message
 */
export function showError(message) {
    const errorElement = document.getElementById('error-message');
    document.getElementById('error-text').textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 * Hide error message
 */
export function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

/**
 * Update parsha header
 */
export function updateParshaHeader(title, reference) {
    document.getElementById('parsha-title').textContent = title;
    document.getElementById('parsha-reference').textContent = reference;
}

/**
 * Highlight current week's parsha
 */
export function highlightCurrentParsha(parshaRef) {
    const contentArea = document.getElementById('content-area');
    if (parshaRef === state.currentParshaRef) {
        contentArea.classList.add('current-parsha-highlight');
    } else {
        contentArea.classList.remove('current-parsha-highlight');
    }
}

/**
 * Update navigation buttons state
 */
export function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-parsha');
    const nextButton = document.getElementById('next-parsha');
    
    prevButton.disabled = state.currentParshaIndex <= 0;
    nextButton.disabled = state.currentParshaIndex >= state.allParshas.length - 1;
}

/**
 * Populate parsha selector dropdown
 */
export function populateParshaSelector() {
    // Get ALL select elements with id 'parsha-selector' (desktop and mobile)
    const selectors = document.querySelectorAll('select#parsha-selector');

    // Populate each select element with all parshas
    selectors.forEach((selector) => {
        selector.innerHTML = '';

        state.allParshas.forEach((parsha, index) => {
            const option = document.createElement('option');
            option.value = parsha.reference;
            option.textContent = `${parsha.name} (${parsha.reference})`;
            if (parsha.reference === state.currentParshaRef) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
    });
}

/**
 * Show info panel (modal)
 */
export function showInfoPanel() {
    document.getElementById('info-panel').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide info panel (modal)
 */
export function hideInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/**
 * Display keyword definition in info panel - NO EMOJIS
 */
export function showKeywordDefinition(word, definition) {
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = `
        <div class="definition-container">
            <div class="definition-word">${escapeHtml(word)}</div>
            <div class="definition-text">${formatText(definition)}</div>
        </div>
    `;
    showInfoPanel();
}

/**
 * Display commentary in info panel - NO EMOJIS
 */
export function showCommentary(verseRef, commentaries) {
    if (!commentaries || commentaries.length === 0) return;
    
    const infoContent = document.getElementById('info-content');
    let html = `<h4 class="text-lg font-bold mb-4 text-blue-900 border-b-2 border-blue-200 pb-2">${escapeHtml(verseRef)}</h4>`;
    
    commentaries.forEach(commentary => {
        html += `
            <div class="commentary-item">
                <div class="commentary-source">${escapeHtml(commentary.source)}</div>
                <div class="commentary-text">${formatText(commentary.explanation)}</div>
            </div>
        `;
    });
    
    infoContent.innerHTML = html;
    showInfoPanel();
}

// ========================================
// COMMENT PANEL FUNCTIONS
// ========================================

/**
 * Open comments panel for a specific verse or general parsha chat
 */
export function openCommentsPanel(verseRef, onOpen, customTitle = null) {
    const panel = document.getElementById('comment-panel');
    const overlay = document.getElementById('comment-overlay');
    const titleElement = document.getElementById('comment-panel-title');
    const verseRefInput = document.getElementById('current-comment-verse-ref');
    const commentsList = document.getElementById('comments-list');
    
    // Store verse reference
    verseRefInput.value = verseRef;
    
    // Update title - use custom title for general chat, or verse reference otherwise
    if (customTitle) {
        titleElement.textContent = `General Discussion: ${customTitle}`;
    } else {
        titleElement.textContent = `Discussion: ${verseRef}`;
    }
    
    // Update placeholder text based on type of chat
    const commentInput = document.getElementById('comment-input');
    if (verseRef.startsWith('PARSHA:')) {
        commentInput.placeholder = 'Share your thoughts about this parsha...';
    } else {
        commentInput.placeholder = 'Share your insights on this verse...';
    }
    
    // Show loading state
    commentsList.innerHTML = '<div class="loading-comments">Loading comments...</div>';
    
    // Show panel and overlay
    overlay.classList.remove('hidden');
    panel.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Check and display username status
    updateUsernameDisplay();
    
    // Restore any persistent comment status messages
    restoreCommentStatus();
    
    // Call the onOpen callback to start listening for comments
    if (onOpen) {
        onOpen(verseRef);
    }
}

/**
 * Close comments panel
 */
export function closeCommentsPanel(onClose) {
    const panel = document.getElementById('comment-panel');
    const overlay = document.getElementById('comment-overlay');
    
    // Hide panel and overlay
    panel.classList.remove('active');
    overlay.classList.add('hidden');
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Clear input but DON'T clear the status message (it should persist)
    document.getElementById('comment-input').value = '';
    
    // Call the onClose callback to stop listening
    if (onClose) {
        onClose();
    }
}

/**
 * Display comments in the panel with username
 */
export function displayComments(commentsArray) {
    const commentsList = document.getElementById('comments-list');

    if (!commentsList) {
        console.error('comments-list element not found!');
        return;
    }

    if (!commentsArray || commentsArray.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <p>No comments yet.</p>
                <p class="text-sm">Be the first to share your insights!</p>
            </div>
        `;
        return;
    }

    let html = '';
    commentsArray.forEach(comment => {
        const displayName = comment.username || 'Anonymous';
        const timestamp = formatTimestamp(comment.timestamp);

        html += `
            <div class="comment-item">
                <div class="comment-meta">
                    <span class="comment-user">${escapeHtml(displayName)}</span>
                    <span class="comment-time">${escapeHtml(timestamp)}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
            </div>
        `;
    });

    commentsList.innerHTML = html;
}

/**
 * Update comment input state based on authentication
 */
export function updateCommentInputState(isLoggedIn) {
    const commentInput = document.getElementById('comment-input');
    const submitButton = document.getElementById('submit-comment-btn');
    
    if (isLoggedIn) {
        commentInput.disabled = false;
        submitButton.disabled = false;
        commentInput.placeholder = 'Share your insights on this verse...';
    } else {
        commentInput.disabled = true;
        submitButton.disabled = true;
        commentInput.placeholder = 'Connecting...';
    }
}

/**
 * Manual name mappings for emails that don't parse well automatically
 */
const emailNameMappings = {
    // Naama Ben-Dor
    'naama.bendor': 'Naama Ben-Dor',
    'naama.bendor1': 'Naama Ben-Dor',
    'nb852': 'Naama Ben-Dor',

    // Yair Ben-Dor
    'bendoryair': 'Yair Ben-Dor',
    'yair.ben-dor': 'Yair Ben-Dor',
    'yairben-dor': 'Yair Ben-Dor',
    'yair.bendor': 'Yair Ben-Dor',
    'yairen-dor': 'Yair Ben-Dor',

    // Lori Preci
    'loripreci': 'Lori Preci',
    'loripreci03': 'Lori Preci',
    'lpreci1': 'Lori Preci',

    // Aidan Schurr
    'aidan.schurr': 'Aidan Schurr',
    'aidanitaischurr': 'Aidan Schurr',

    // Daniel Stone
    'stoneda4': 'Daniel Stone',
    'stoneda': 'Daniel Stone',

    // Erez Yarden
    'erezroy8': 'Erez Yarden',
    'erez yarden': 'Erez Yarden',
    'erezroy': 'Erez Yarden',

    // Ava Uditsky
    'ava': 'Ava Uditsky',
    'avauditsky': 'Ava Uditsky',

    // Stephanie Solomon
    'sas562': 'Stephanie Solomon'
};

/**
 * Extract name from email address
 * Intelligently parses:
 * - "firstname.lastname" -> "Firstname Lastname"
 * - "firstname-lastname" -> "Firstname-Lastname"
 * - "firstnamelastname" -> splits on common name boundaries
 * Examples:
 * "naama.bendor1@gmail.com" -> "Naama Ben-Dor"
 * "yair.ben-dor@example.com" -> "Yair Ben-Dor"
 * "loripreci03@gmail.com" -> "Lori Preci"
 * "erezroy8@gmail.com" -> "Erez Yarden"
 */
function extractNameFromEmail(email) {
    if (!email) return 'Anonymous';

    // Get the part before the @ symbol
    let localPart = email.split('@')[0].toLowerCase();

    // Remove trailing numbers
    localPart = localPart.replace(/\d+$/, '').trim();

    if (!localPart) return 'Anonymous';

    // Check for manual mappings first (for emails with special cases)
    if (emailNameMappings[localPart]) {
        return emailNameMappings[localPart];
    }

    // Handle period-separated format (first.last)
    if (localPart.includes('.')) {
        const parts = localPart.split('.')
            .map(part => capitalizeWord(part))
            .filter(part => part.length > 0);

        if (parts.length > 0) {
            return parts.join(' ');
        }
    }

    // Handle hyphen-separated format (first-last)
    if (localPart.includes('-')) {
        const parts = localPart.split('-')
            .map(part => capitalizeWord(part))
            .filter(part => part.length > 0);

        if (parts.length > 0) {
            return parts.join('-');
        }
    }

    // No separators: try to intelligently split concatenated names
    // Common pattern: firstname is longer (4+ chars), lastname is 2-4 chars
    // Examples: "loripreci" (4+5), "erezroy" (4+3), "stoneda" (5+2)
    if (localPart.length >= 6) {
        // Try to find a good split point
        // Look for patterns where splitting makes sense
        for (let splitPos = 3; splitPos < localPart.length - 1; splitPos++) {
            const firstName = localPart.substring(0, splitPos);
            const lastName = localPart.substring(splitPos);

            // Check if this split makes sense:
            // Both parts should be > 1 char, and last part should be 2-5 chars (typical last name)
            if (firstName.length > 2 && lastName.length > 1 && lastName.length <= 5) {
                // Prefer splits where lastName is 2-4 chars (most common pattern)
                if (lastName.length >= 2 && lastName.length <= 4) {
                    return capitalizeWord(firstName) + ' ' + capitalizeWord(lastName);
                }
            }
        }
    }

    // Fallback: just capitalize the whole thing
    return capitalizeWord(localPart);
}

/**
 * Helper function to capitalize a word
 */
function capitalizeWord(word) {
    if (!word) return '';
    // Handle hyphenated words
    if (word.includes('-')) {
        return word.split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join('-');
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Update name display in comment panel based on current user email
 */
export function updateUsernameDisplay() {
    const nameDisplay = document.getElementById('name-display');
    const currentUsernameSpan = document.getElementById('current-username');

    // Get the current user's email from localStorage (set during authentication)
    const userEmail = localStorage.getItem('currentUserEmail');

    if (userEmail) {
        // Show name display
        nameDisplay.classList.remove('hidden');
        const displayName = extractNameFromEmail(userEmail);
        currentUsernameSpan.textContent = displayName;
    } else {
        // Hide name display if no email
        nameDisplay.classList.add('hidden');
    }
}

/**
 * Set current user email (called during authentication)
 */
export function setCurrentUserEmail(email) {
    if (email) {
        localStorage.setItem('currentUserEmail', email);
    } else {
        localStorage.removeItem('currentUserEmail');
    }
    updateUsernameDisplay();
}

/**
 * Get display name from email
 */
export function getSavedUsername() {
    const userEmail = localStorage.getItem('currentUserEmail');
    return userEmail ? extractNameFromEmail(userEmail) : 'Anonymous';
}

/**
 * Deprecated - for backward compatibility
 * Use getSavedUsername() instead
 */
export function saveUsername(email) {
    if (email) {
        setCurrentUserEmail(email);
        return true;
    }
    return false;
}

/**
 * Show comment status message - PERSISTENT (stores in sessionStorage)
 */
export function showCommentStatus(message, isError = false) {
    const statusElement = document.getElementById('comment-status');
    statusElement.textContent = message;
    statusElement.className = 'comment-status ' + (isError ? 'error' : 'success');
    
    // Store success messages in sessionStorage so they persist across refreshes
    if (!isError) {
        sessionStorage.setItem('torahStudyCommentStatus', JSON.stringify({
            message: message,
            timestamp: Date.now()
        }));
    }
    
    // Only clear error messages after 5 seconds
    if (isError) {
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'comment-status';
        }, 5000);
    }
}

/**
 * Clear comment status message
 */
export function clearCommentStatus() {
    const statusElement = document.getElementById('comment-status');
    statusElement.textContent = '';
    statusElement.className = 'comment-status';
    sessionStorage.removeItem('torahStudyCommentStatus');
}

/**
 * Restore comment status from sessionStorage (call on panel open)
 */
export function restoreCommentStatus() {
    const stored = sessionStorage.getItem('torahStudyCommentStatus');
    if (stored) {
        try {
            const { message, timestamp } = JSON.parse(stored);
            // Only show if less than 5 minutes old
            if (Date.now() - timestamp < 5 * 60 * 1000) {
                const statusElement = document.getElementById('comment-status');
                statusElement.textContent = message;
                statusElement.className = 'comment-status success';
            } else {
                sessionStorage.removeItem('torahStudyCommentStatus');
            }
        } catch (e) {
            console.error('Error restoring comment status:', e);
        }
    }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) {
        return 'Just now';
    }
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format text with basic markdown-style formatting
 * Converts *text* to <strong>text</strong> for bold
 * While still escaping dangerous HTML
 * FIXED: Now properly removes asterisks and applies bold formatting
 */
function formatText(text) {
    if (!text) return '';
    
    // First escape all HTML to prevent XSS
    let escaped = escapeHtml(text);
    
    // Then apply safe formatting:
    // Convert *text* to <strong>text</strong> for bold
    // Use non-greedy match and replace the entire pattern including asterisks
    escaped = escaped.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
    return escaped;
}
