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
    const selector = document.getElementById('parsha-selector');
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
 * Open comments panel for a specific verse
 */
export function openCommentsPanel(verseRef, onOpen) {
    const panel = document.getElementById('comment-panel');
    const overlay = document.getElementById('comment-overlay');
    const titleElement = document.getElementById('comment-panel-title');
    const verseRefInput = document.getElementById('current-comment-verse-ref');
    const commentsList = document.getElementById('comments-list');
    
    // Store verse reference
    verseRefInput.value = verseRef;
    
    // Update title
    titleElement.textContent = `Discussion: ${verseRef}`;
    
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
    console.log('displayComments called with:', commentsArray);
    const commentsList = document.getElementById('comments-list');
    
    if (!commentsList) {
        console.error('comments-list element not found!');
        return;
    }
    
    if (!commentsArray || commentsArray.length === 0) {
        console.log('No comments to display');
        commentsList.innerHTML = `
            <div class="no-comments">
                <p>No comments yet.</p>
                <p class="text-sm">Be the first to share your insights!</p>
            </div>
        `;
        return;
    }
    
    console.log(`Displaying ${commentsArray.length} comments`);
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
    console.log('Comments HTML updated successfully');
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
 * Update username display in comment panel
 */
export function updateUsernameDisplay() {
    const usernameSetup = document.getElementById('username-setup');
    const usernameDisplay = document.getElementById('username-display');
    const currentUsernameSpan = document.getElementById('current-username');
    
    const savedUsername = getSavedUsername();
    
    if (savedUsername) {
        // Show username display, hide setup
        usernameSetup.classList.add('hidden');
        usernameDisplay.classList.remove('hidden');
        currentUsernameSpan.textContent = savedUsername;
    } else {
        // Show setup, hide display
        usernameSetup.classList.remove('hidden');
        usernameDisplay.classList.add('hidden');
    }
}

/**
 * Save username to localStorage
 */
export function saveUsername(username) {
    if (username && username.trim().length > 0 && username.trim().length <= 50) {
        localStorage.setItem('torahStudyUsername', username.trim());
        updateUsernameDisplay();
        return true;
    }
    return false;
}

/**
 * Get saved username from localStorage
 */
export function getSavedUsername() {
    return localStorage.getItem('torahStudyUsername');
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
