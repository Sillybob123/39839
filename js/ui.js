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
            <div class="definition-text">${escapeHtml(definition)}</div>
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
                <div class="commentary-text">${escapeHtml(commentary.explanation)}</div>
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
    
    // Clear input
    document.getElementById('comment-input').value = '';
    document.getElementById('comment-status').textContent = '';
    document.getElementById('comment-status').className = 'comment-status';
    
    // Call the onClose callback to stop listening
    if (onClose) {
        onClose();
    }
}

/**
 * Display comments in the panel
 */
export function displayComments(commentsArray) {
    const commentsList = document.getElementById('comments-list');
    
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
        const truncatedUserId = comment.userId ? comment.userId.substring(0, 8) + '...' : 'Anonymous';
        const timestamp = formatTimestamp(comment.timestamp);
        
        html += `
            <div class="comment-item">
                <div class="comment-meta">
                    <span class="comment-user">${escapeHtml(truncatedUserId)}</span>
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
 * Show comment status message
 */
export function showCommentStatus(message, isError = false) {
    const statusElement = document.getElementById('comment-status');
    statusElement.textContent = message;
    statusElement.className = 'comment-status ' + (isError ? 'error' : 'success');
    
    // Clear after 3 seconds
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'comment-status';
    }, 3000);
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
