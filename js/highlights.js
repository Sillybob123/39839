// Highlights Module - User Quote Highlighting Feature (Professional, no emojis)
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
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const HIGHLIGHT_COLORS = [
    { id: 'gold', label: 'Golden', className: 'highlight-color-gold' },
    { id: 'sage', label: 'Sage', className: 'highlight-color-sage' },
    { id: 'sky', label: 'Sky', className: 'highlight-color-sky' }
];

const highlightListeners = new Map();
const highlightState = new Map();
const activeMenus = new Map();

export function initializeHighlighting(verseRef, verseContainer, englishTextElement) {
    if (!verseRef || !verseContainer || !englishTextElement) return;

    ensureHighlightUI(verseContainer);
    setupSelectionHandlers(verseRef, verseContainer, englishTextElement);
    startHighlightListener(verseRef, verseContainer, englishTextElement);
}

function ensureHighlightUI(verseContainer) {
    let indicatorsSection = verseContainer.querySelector('.verse-indicators');
    if (!indicatorsSection) {
        indicatorsSection = document.createElement('div');
        indicatorsSection.className = 'verse-indicators';
        verseContainer.appendChild(indicatorsSection);
    }

    if (!verseContainer.querySelector('.highlight-indicator')) {
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.className = 'content-indicator highlight-indicator';
        indicator.textContent = 'Highlights';
        indicator.dataset.state = 'closed';
        indicator.addEventListener('click', () => toggleHighlightSummary(verseContainer));

        indicatorsSection.insertBefore(indicator, indicatorsSection.firstChild);
    }

    if (!verseContainer.querySelector('.highlight-summary')) {
        const summary = document.createElement('div');
        summary.className = 'highlight-summary hidden';
        verseContainer.appendChild(summary);
    }

    if (!verseContainer.querySelector('.highlight-status')) {
        const status = document.createElement('div');
        status.className = 'highlight-status';
        verseContainer.appendChild(status);
    }
}

function setupSelectionHandlers(verseRef, verseContainer, englishTextElement) {
    const handler = (event) => handleTextSelection(event, verseRef, verseContainer, englishTextElement);
    englishTextElement.addEventListener('mouseup', handler);
    englishTextElement.addEventListener('touchend', handler);
}

function startHighlightListener(verseRef, verseContainer, englishTextElement) {
    if (highlightListeners.has(verseRef)) {
        const dispose = highlightListeners.get(verseRef);
        dispose();
    }

    try {
        const highlightsQuery = query(
            collection(db, 'highlights'),
            where('verseRef', '==', verseRef)
        );

        const unsubscribe = onSnapshot(highlightsQuery,
            (snapshot) => {
                const highlights = [];
                snapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    highlights.push({
                        id: docSnapshot.id,
                        verseRef: data.verseRef,
                        userId: data.userId,
                        username: data.username || 'Anonymous',
                        selectedText: data.selectedText || '',
                        color: data.color || 'gold',
                        startOffset: data.startOffset ?? 0,
                        endOffset: data.endOffset ?? 0,
                        timestamp: data.timestamp
                    });
                });

                highlights.sort((a, b) => a.startOffset - b.startOffset);
                highlightState.set(verseRef, highlights);

                applyHighlightsToVerse(englishTextElement, highlights);
                renderHighlightSummary(verseContainer, highlights);
                updateHighlightIndicator(verseContainer, highlights.length);
            },
            (error) => {
                console.error('Error listening to highlights:', error);
                renderHighlightSummary(verseContainer, []);
                updateHighlightIndicator(verseContainer, 0);
            }
        );

        highlightListeners.set(verseRef, unsubscribe);
    } catch (error) {
        console.error('Error setting up highlight listener:', error);
    }
}

function handleTextSelection(event, verseRef, verseContainer, englishTextElement) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!englishTextElement.contains(range.commonAncestorContainer)) return;

    const rawText = selection.toString();
    const trimmedText = rawText.trim();

    if (!trimmedText || trimmedText.length < 2) {
        return;
    }

    const username = getSavedUsername();
    if (!username) {
        showHighlightStatus(verseContainer, 'Please open the discussion panel and set your display name before highlighting.', true);
        return;
    }

    showHighlightMenu(event, verseRef, verseContainer, englishTextElement, selection);
}

function showHighlightMenu(event, verseRef, verseContainer, englishTextElement, selection) {
    removeHighlightMenu(verseRef);

    const menu = document.createElement('div');
    menu.className = 'highlight-menu';

    HIGHLIGHT_COLORS.forEach(color => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `highlight-menu-btn ${color.className}`;
        button.textContent = `Highlight – ${color.label}`;
        button.addEventListener('click', async () => {
            await saveHighlight(verseRef, verseContainer, englishTextElement, selection, color.id);
            removeHighlightMenu(verseRef);
            window.getSelection().removeAllRanges();
        });
        menu.appendChild(button);
    });

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'highlight-menu-btn highlight-cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        removeHighlightMenu(verseRef);
        window.getSelection().removeAllRanges();
    });
    menu.appendChild(cancelButton);

    document.body.appendChild(menu);
    positionMenuNearSelection(menu, selection);

    const outsideClickHandler = (e) => {
        if (!menu.contains(e.target)) {
            removeHighlightMenu(verseRef);
            document.removeEventListener('mousedown', outsideClickHandler);
        }
    };

    document.addEventListener('mousedown', outsideClickHandler);
    activeMenus.set(verseRef, { menu, outsideClickHandler });
}

function removeHighlightMenu(verseRef) {
    const activeMenu = activeMenus.get(verseRef);
    if (activeMenu) {
        const { menu, outsideClickHandler } = activeMenu;
        if (menu && menu.parentNode) {
            menu.parentNode.removeChild(menu);
        }
        if (outsideClickHandler) {
            document.removeEventListener('mousedown', outsideClickHandler);
        }
        activeMenus.delete(verseRef);
    }
}

function positionMenuNearSelection(menu, selection) {
    try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;

        menu.style.top = `${rect.bottom + scrollY + 8}px`;
        menu.style.left = `${rect.left + scrollX}px`;
    } catch (error) {
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
    }
}

async function saveHighlight(verseRef, verseContainer, englishTextElement, selection, colorId) {
    const userId = getCurrentUserId();
    if (!userId) {
        showHighlightStatus(verseContainer, 'Connecting to the study service. Please try again in a moment.', true);
        return;
    }

    const username = getSavedUsername();
    if (!username) {
        showHighlightStatus(verseContainer, 'Please set your display name before adding a highlight.', true);
        return;
    }

    const offsets = computeOffsets(englishTextElement, selection);
    if (!offsets) return;

    const { trimmedText, startOffset, endOffset } = offsets;

    if (!trimmedText || trimmedText.length < 2) {
        showHighlightStatus(verseContainer, 'Highlights should include at least two characters.', true);
        return;
    }

    const existing = (highlightState.get(verseRef) || []).find(h =>
        h.userId === userId &&
        h.startOffset === startOffset &&
        h.endOffset === endOffset
    );

    if (existing) {
        showHighlightStatus(verseContainer, 'You already highlighted that quote.', true);
        return;
    }

    try {
        await addDoc(collection(db, 'highlights'), {
            verseRef,
            userId,
            username,
            selectedText: trimmedText,
            color: colorId,
            startOffset,
            endOffset,
            timestamp: serverTimestamp()
        });

        showHighlightStatus(verseContainer, 'Highlight saved.', false);
    } catch (error) {
        console.error('Error saving highlight:', error);
        showHighlightStatus(verseContainer, 'Unable to save highlight. Please try again.', true);
    }
}

function computeOffsets(englishTextElement, selection) {
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);

    const preRange = range.cloneRange();
    preRange.selectNodeContents(englishTextElement);
    preRange.setEnd(range.startContainer, range.startOffset);

    const startOffsetRaw = preRange.toString().length;
    const selectionText = selection.toString();
    const leadingWhitespace = selectionText.match(/^\s*/)?.[0].length || 0;
    const trailingWhitespace = selectionText.match(/\s*$/)?.[0].length || 0;
    const trimmedText = selectionText.trim();

    const startOffset = startOffsetRaw + leadingWhitespace;
    const endOffset = startOffset + trimmedText.length;

    if (startOffset >= endOffset) {
        return null;
    }

    return {
        trimmedText,
        startOffset,
        endOffset
    };
}

function applyHighlightsToVerse(englishTextElement, highlights) {
    clearExistingHighlights(englishTextElement);

    if (!highlights || highlights.length === 0) {
        return;
    }

    highlights.forEach(highlight => {
        const range = createRangeFromOffsets(englishTextElement, highlight.startOffset, highlight.endOffset);
        if (!range) {
            return;
        }

        const highlightSpan = document.createElement('span');
        highlightSpan.className = `user-highlight ${getHighlightColorClass(highlight.color)}`;
        highlightSpan.dataset.highlightId = highlight.id;
        highlightSpan.dataset.username = highlight.username || 'Anonymous';
        highlightSpan.title = `Highlighted by ${highlight.username || 'Anonymous'}`;

        try {
            range.surroundContents(highlightSpan);
        } catch (error) {
            // If the range cannot be wrapped (likely due to complex markup), skip this highlight but log for debugging.
            console.warn('Could not apply highlight for range', highlight, error);
        }
    });
}

function clearExistingHighlights(englishTextElement) {
    const existingHighlights = englishTextElement.querySelectorAll('.user-highlight');
    existingHighlights.forEach(span => {
        const parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parent.normalize();
    });
}

function createRangeFromOffsets(container, startOffset, endOffset) {
    if (startOffset == null || endOffset == null) return null;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const range = document.createRange();

    let currentOffset = 0;
    let startNode = null;
    let startNodeOffset = 0;
    let endNode = null;
    let endNodeOffset = 0;

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.nodeValue.length;
        const nextOffset = currentOffset + nodeLength;

        if (!startNode && nextOffset > startOffset) {
            startNode = node;
            startNodeOffset = startOffset - currentOffset;
        }

        if (!endNode && nextOffset >= endOffset) {
            endNode = node;
            endNodeOffset = endOffset - currentOffset;
            break;
        }

        currentOffset = nextOffset;
    }

    if (!startNode || !endNode) {
        return null;
    }

    range.setStart(startNode, startNodeOffset);
    range.setEnd(endNode, endNodeOffset);

    return range;
}

function renderHighlightSummary(verseContainer, highlights) {
    const summary = verseContainer.querySelector('.highlight-summary');
    if (!summary) return;

    if (!highlights || highlights.length === 0) {
        summary.innerHTML = '';
        summary.classList.add('hidden');
        verseContainer.classList.remove('has-highlights');
        return;
    }

    verseContainer.classList.add('has-highlights');
    summary.classList.remove('hidden');

    const items = highlights.map(highlight => {
        const text = truncateText(highlight.selectedText, 240);
        return `
            <div class="highlight-entry" data-highlight-id="${highlight.id}">
                <div class="highlight-quote">${escapeHtml(text)}</div>
                <div class="highlight-meta">
                    <span class="highlight-user">${escapeHtml(highlight.username || 'Anonymous')}</span>
                    ${renderRemoveButton(highlight)}
                </div>
            </div>
        `;
    }).join('');

    summary.innerHTML = items;

    summary.querySelectorAll('.remove-highlight-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            const highlightId = button.dataset.highlightId;
            if (!highlightId) return;

            try {
                await deleteDoc(doc(db, 'highlights', highlightId));
            } catch (error) {
                console.error('Error removing highlight:', error);
            }
        });
    });
}

function renderRemoveButton(highlight) {
    const currentUserId = getCurrentUserId();
    if (highlight.userId !== currentUserId) {
        return '';
    }

    return `<button type="button" class="remove-highlight-btn" data-highlight-id="${highlight.id}">Remove</button>`;
}

function updateHighlightIndicator(verseContainer, count) {
    const indicator = verseContainer.querySelector('.highlight-indicator');
    if (!indicator) return;

    indicator.textContent = count > 0 ? `Highlights (${count})` : 'Highlights';
    indicator.dataset.state = count > 0 ? 'open' : 'closed';
}

function toggleHighlightSummary(verseContainer) {
    const summary = verseContainer.querySelector('.highlight-summary');
    const indicator = verseContainer.querySelector('.highlight-indicator');
    if (!summary || !indicator) return;

    if (summary.classList.contains('hidden')) {
        summary.classList.remove('hidden');
        indicator.dataset.state = 'open';
    } else {
        summary.classList.add('hidden');
        indicator.dataset.state = 'closed';
    }
}

function getHighlightColorClass(colorId) {
    const color = HIGHLIGHT_COLORS.find(c => c.id === colorId);
    return color ? color.className : 'highlight-color-gold';
}

function showHighlightStatus(verseContainer, message, isError) {
    const status = verseContainer.querySelector('.highlight-status');
    if (!status) return;

    status.textContent = message;
    status.classList.toggle('error', Boolean(isError));
    status.classList.toggle('success', !isError);

    if (!isError) {
        setTimeout(() => {
            status.textContent = '';
            status.classList.remove('success');
        }, 3000);
    } else {
        setTimeout(() => {
            status.textContent = '';
            status.classList.remove('error');
        }, 5000);
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// For completeness, export a cleanup function (currently unused but available)
export function disposeHighlightListener(verseRef) {
    if (highlightListeners.has(verseRef)) {
        const dispose = highlightListeners.get(verseRef);
        dispose();
        highlightListeners.delete(verseRef);
    }
}
