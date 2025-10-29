// Main Application Entry Point - QUERY FIX FOR COMMENT BADGES + GENERAL PARSHA CHAT
import { TORAH_PARSHAS } from './config.js';
import { fetchCurrentParsha, fetchParshaText, loadCommentaryData } from './api.js';
import { state, setState } from './state.js';
import {
    showLoading,
    hideLoading,
    showError,
    hideError,
    updateParshaHeader,
    highlightCurrentParsha,
    updateNavigationButtons,
    populateParshaSelector,
    hideInfoPanel,
    showInfoPanel,
    showKeywordDefinition,
    showCommentary,
    openCommentsPanel,
    closeCommentsPanel,
    displayComments,
    updateCommentInputState,
    showCommentStatus,
    saveUsername,
    getSavedUsername,
    updateUsernameDisplay
} from './ui.js';

import {
    initAuth,
    getCurrentUserId,
    submitComment,
    listenForComments,
    stopListeningForComments,
    db
} from './firebase.js';

import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let verseCommentCounts = {};
let isAuthReady = false;

async function init() {
    try {
        // CRITICAL: Wait for authentication to complete before proceeding
        await new Promise((resolve) => {
            initAuth((user) => {
                isAuthReady = true;
                updateCommentInputState(true);
                resolve();
            });
        });
        
        const commentaryData = await loadCommentaryData();
        setState({ commentaryData });
        setState({ allParshas: TORAH_PARSHAS });
        
        const currentParshaName = await fetchCurrentParsha();
        
        if (currentParshaName) {
            const matchingParsha = TORAH_PARSHAS.find(p => 
                p.name.toLowerCase() === currentParshaName.toLowerCase() ||
                currentParshaName.toLowerCase().includes(p.name.toLowerCase())
            );
            
            if (matchingParsha) {
                setState({
                    currentParshaRef: matchingParsha.reference,
                    currentParshaIndex: TORAH_PARSHAS.indexOf(matchingParsha)
                });
            }
        }
        
        if (!state.currentParshaRef && TORAH_PARSHAS.length > 0) {
            setState({
                currentParshaRef: TORAH_PARSHAS[0].reference,
                currentParshaIndex: 0
            });
        }
        
        populateParshaSelector();
        updateNavigationButtons();
        setupEventListeners();
        
        if (state.currentParshaRef) {
            await loadParsha(state.currentParshaRef);
        }
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

function setupEventListeners() {
    document.getElementById('parsha-selector').addEventListener('change', async (e) => {
        const selectedRef = e.target.value;
        const index = state.allParshas.findIndex(p => p.reference === selectedRef);
        setState({ currentParshaIndex: index });
        await loadParsha(selectedRef);
        updateNavigationButtons();
    });
    
    document.getElementById('prev-parsha').addEventListener('click', async () => {
        if (state.currentParshaIndex > 0) {
            const newIndex = state.currentParshaIndex - 1;
            setState({ currentParshaIndex: newIndex });
            const prevParsha = state.allParshas[newIndex];
            document.getElementById('parsha-selector').value = prevParsha.reference;
            await loadParsha(prevParsha.reference);
            updateNavigationButtons();
        }
    });
    
    document.getElementById('next-parsha').addEventListener('click', async () => {
        if (state.currentParshaIndex < state.allParshas.length - 1) {
            const newIndex = state.currentParshaIndex + 1;
            setState({ currentParshaIndex: newIndex });
            const nextParsha = state.allParshas[newIndex];
            document.getElementById('parsha-selector').value = nextParsha.reference;
            await loadParsha(nextParsha.reference);
            updateNavigationButtons();
        }
    });
    
    const weeklyButton = document.getElementById('go-to-weekly');
    if (weeklyButton) {
        weeklyButton.addEventListener('click', async () => {
            if (state.currentParshaRef) {
                const index = state.allParshas.findIndex(p => p.reference === state.currentParshaRef);
                setState({ currentParshaIndex: index });
                document.getElementById('parsha-selector').value = state.currentParshaRef;
                await loadParsha(state.currentParshaRef);
                updateNavigationButtons();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    // General Parsha Chat Button (Desktop)
    const parshaChatButton = document.getElementById('general-parsha-chat');
    if (parshaChatButton) {
        parshaChatButton.addEventListener('click', () => {
            const parshaRef = state.currentParshaRef || 'Genesis 1:1';
            const parshaName = state.allParshas[state.currentParshaIndex]?.name || 'Torah Portion';
            const generalChatRef = `PARSHA:${parshaRef}`;
            openCommentsPanel(generalChatRef, (ref) => {
                listenForComments(ref, displayComments);
            }, parshaName);
        });
    }

    // General Parsha Chat Button (Mobile)
    const parshaChatButtonMobile = document.getElementById('general-parsha-chat-mobile');
    if (parshaChatButtonMobile) {
        parshaChatButtonMobile.addEventListener('click', () => {
            const parshaRef = state.currentParshaRef || 'Genesis 1:1';
            const parshaName = state.allParshas[state.currentParshaIndex]?.name || 'Torah Portion';
            const generalChatRef = `PARSHA:${parshaRef}`;
            openCommentsPanel(generalChatRef, (ref) => {
                listenForComments(ref, displayComments);
            }, parshaName);
        });
    }
    
    document.getElementById('close-panel-button').addEventListener('click', hideInfoPanel);
    
    document.getElementById('info-panel').addEventListener('click', (e) => {
        if (e.target.id === 'info-panel') {
            hideInfoPanel();
        }
    });
    
    document.getElementById('parsha-text').addEventListener('click', handleTextClick);
    
    setupCommentPanelListeners();
    setupUsernameListener();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideInfoPanel();
            closeCommentsPanel(stopListeningForComments);
        }
        
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft' && state.currentParshaIndex > 0) {
                document.getElementById('prev-parsha').click();
            } else if (e.key === 'ArrowRight' && state.currentParshaIndex < state.allParshas.length - 1) {
                document.getElementById('next-parsha').click();
            }
        }
    });
}

function setupUsernameListener() {
    const saveButton = document.getElementById('save-username-btn');
    const usernameInput = document.getElementById('username-input');
    
    if (saveButton && usernameInput) {
        saveButton.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            
            if (!username) {
                showCommentStatus('Please enter a name', true);
                return;
            }
            
            if (username.length > 50) {
                showCommentStatus('Name must be 50 characters or less', true);
                return;
            }
            
            if (saveUsername(username)) {
                usernameInput.value = '';
                showCommentStatus('Name saved successfully!', false);
            } else {
                showCommentStatus('Failed to save name', true);
            }
        });
        
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveButton.click();
            }
        });
    }
}

function setupCommentPanelListeners() {
    document.getElementById('close-comment-panel').addEventListener('click', () => {
        closeCommentsPanel(stopListeningForComments);
    });
    
    document.getElementById('comment-overlay').addEventListener('click', () => {
        closeCommentsPanel(stopListeningForComments);
    });
    
    document.getElementById('submit-comment-btn').addEventListener('click', handleCommentSubmit);
    
    document.getElementById('comment-input').addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaCmd) && e.key === 'Enter') {
            handleCommentSubmit();
        }
    });
}

async function handleCommentSubmit() {
    const commentInput = document.getElementById('comment-input');
    const verseRefInput = document.getElementById('current-comment-verse-ref');
    const submitButton = document.getElementById('submit-comment-btn');

    const text = commentInput.value.trim();
    const verseRef = verseRefInput.value;
    const userId = getCurrentUserId();
    const username = getSavedUsername();

    if (!userId) {
        showCommentStatus('Please wait, connecting...', true);
        return;
    }

    if (!username) {
        showCommentStatus('Please set your name first', true);
        document.getElementById('username-setup').classList.remove('hidden');
        return;
    }

    if (!text) {
        showCommentStatus('Please enter a comment', true);
        return;
    }

    if (!verseRef) {
        showCommentStatus('Error: No verse selected', true);
        return;
    }

    submitButton.disabled = true;
    commentInput.disabled = true;
    showCommentStatus('Submitting...', false);

    try {
        await submitComment(verseRef, text, userId, username);
        commentInput.value = '';
        showCommentStatus('Comment added!', false);

        await updateCommentCount(verseRef);

    } catch (error) {
        console.error('Error submitting comment:', error);
        showCommentStatus('Error submitting comment. Please try again.', true);
    } finally {
        submitButton.disabled = false;
        commentInput.disabled = false;
    }
}

async function loadCommentCounts(parshaRef) {
    if (!isAuthReady) {
        return;
    }
    
    const { bookName, startChapter, startVerse, endChapter, endVerse } = parseParshaReference(parshaRef);
    
    // Query full book range (lexicographic safe) and filter to parsha client-side
    const startRef = `${bookName} `;
    const endRef = `${bookName}~`;
    
    try {
        const commentsQuery = query(
            collection(db, 'comments'),
            where('verseRef', '>=', startRef),
            where('verseRef', '<=', endRef)
        );
        const querySnapshot = await getDocs(commentsQuery);
        const counts = {};
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const verseRef = data.verseRef;
            
            // Additional client-side filtering to ensure verse is in our exact range
            const match = verseRef.match(/^(\w+)\s+(\d+):(\d+)$/);
            if (match) {
                const [, book, chapter, verse] = match;
                const chapterNum = parseInt(chapter);
                const verseNum = parseInt(verse);
                
                // Check if this verse is within our parsha range
                if (book === bookName) {
                    let isInRange = false;
                    
                    if (!endChapter) {
                        // Single chapter parsha
                        isInRange = chapterNum === startChapter;
                    } else {
                        // Multi-chapter parsha
                        if (chapterNum > startChapter && chapterNum < endChapter) {
                            // Middle chapters - include all verses
                            isInRange = true;
                        } else if (chapterNum === startChapter && verseNum >= startVerse) {
                            // First chapter - only verses >= startVerse
                            isInRange = true;
                        } else if (chapterNum === endChapter && verseNum <= endVerse) {
                            // Last chapter - only verses <= endVerse
                            isInRange = true;
                        }
                    }
                    
                    if (isInRange) {
                        counts[verseRef] = (counts[verseRef] || 0) + 1;
                    }
                }
            }
        });
        
        verseCommentCounts = counts;
        
        // Use requestAnimationFrame for better DOM sync
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                updateAllCommentBadges();
            });
        });
        
    } catch (error) {
        console.error('❌ Error loading comment counts:', error);
        console.error('❌ Error details:', error.message);
        if (error.code) {
            console.error('❌ Error code:', error.code);
        }
    }
}

async function updateCommentCount(verseRef) {
    try {
        const commentsQuery = query(
            collection(db, 'comments'),
            where('verseRef', '==', verseRef)
        );
        
        const querySnapshot = await getDocs(commentsQuery);
        verseCommentCounts[verseRef] = querySnapshot.size;
        
        const verseContainer = document.querySelector(`[data-ref="${verseRef}"]`);
        if (verseContainer) {
            updateCommentBadge(verseContainer, verseRef);
        }
        
    } catch (error) {
        console.error('Error updating comment count:', error);
    }
}

function updateCommentBadge(container, verseRef) {
    if (!container) {
        return;
    }
    
    const indicatorsSection = container.querySelector('.verse-indicators');
    if (!indicatorsSection) {
        return;
    }
    
    const count = verseCommentCounts[verseRef] || 0;
    let badge = indicatorsSection.querySelector('.comment-count-badge');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'comment-count-badge';
        badge.dataset.verseRef = verseRef;
        indicatorsSection.appendChild(badge);
    }
    
    if (count > 0) {
        badge.textContent = `${count} ${count === 1 ? 'comment' : 'comments'}`;
        badge.style.display = 'inline-flex';
        badge.style.visibility = 'visible';
        badge.style.opacity = '1';
    } else {
        badge.style.display = 'none';
    }
}

function updateAllCommentBadges() {
    const containers = document.querySelectorAll('.verse-container');
    
    let visibleCount = 0;
    containers.forEach(container => {
        const verseRef = container.dataset.ref;
        if (verseRef) {
            updateCommentBadge(container, verseRef);
            if (verseCommentCounts[verseRef] > 0) {
                visibleCount++;
            }
        }
    });
}

async function loadParsha(parshaRef) {
    showLoading();
    hideError();
    
    try {
        const data = await fetchParshaText(parshaRef);
        
        renderParsha(data, parshaRef);
        highlightCurrentParsha(parshaRef);
        
        await loadCommentCounts(parshaRef);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Error loading parsha:', error);
        showError('Failed to load the Torah text. Please try again later.');
    } finally {
        hideLoading();
    }
}

function parseParshaReference(parshaRef) {
    const match = parshaRef.match(/^(\w+)\s+(\d+):(\d+)(?:-(\d+):(\d+))?$/);
    
    if (!match) {
        const simpleMatch = parshaRef.match(/^(\w+)\s+(\d+):(\d+)$/);
        if (simpleMatch) {
            return {
                bookName: simpleMatch[1],
                startChapter: parseInt(simpleMatch[2]),
                startVerse: parseInt(simpleMatch[3]),
                endChapter: null,
                endVerse: null
            };
        }
        return { bookName: 'Torah', startChapter: 1, startVerse: 1, endChapter: null, endVerse: null };
    }
    
    return {
        bookName: match[1],
        startChapter: parseInt(match[2]),
        startVerse: parseInt(match[3]),
        endChapter: match[4] ? parseInt(match[4]) : null,
        endVerse: match[5] ? parseInt(match[5]) : null
    };
}

function renderParsha(data, parshaRef) {
    const textContainer = document.getElementById('parsha-text');
    
    updateParshaHeader(data.book || 'Torah Portion', parshaRef);
    textContainer.innerHTML = '';
    
    const englishText = Array.isArray(data.text) ? data.text : [data.text];
    const hebrewText = Array.isArray(data.he) ? data.he : [data.he];
    
    const { bookName, startChapter, startVerse, endChapter, endVerse } = parseParshaReference(parshaRef);
    
    if (Array.isArray(englishText[0])) {
        let currentChapterNumber = startChapter;
        let isFirstChapter = true;
        
        englishText.forEach((chapterVerses, chapterIndex) => {
            if (!Array.isArray(chapterVerses)) {
                chapterVerses = [chapterVerses];
            }
            
            const hebrewChapterVerses = Array.isArray(hebrewText[chapterIndex]) ? 
                hebrewText[chapterIndex] : [hebrewText[chapterIndex] || ''];
            
            const isStartChapter = currentChapterNumber === startChapter;
            const isEndChapter = endChapter ? currentChapterNumber === endChapter : false;
            const chapterStartVerse = isStartChapter ? startVerse : 1;
            const chapterEndVerse = isEndChapter ? endVerse : null;
            
            if (!isFirstChapter) {
                const chapterHeader = document.createElement('div');
                chapterHeader.className = 'chapter-header';
                chapterHeader.textContent = `${bookName} Chapter ${currentChapterNumber}`;
                textContainer.appendChild(chapterHeader);
            }
            isFirstChapter = false;
            
            for (let localIndex = 0; localIndex < chapterVerses.length; localIndex++) {
                const verseText = chapterVerses[localIndex];
                if (!verseText || verseText.trim() === '') continue;
                
                const verseNumber = chapterStartVerse + localIndex;
                
                if (chapterEndVerse && verseNumber > chapterEndVerse) {
                    break;
                }
                
                const hebrewVerseText = hebrewChapterVerses[localIndex] || '';
                const verseRef = `${bookName} ${currentChapterNumber}:${verseNumber}`;
                
                const verseElement = createVerseElement(verseText, hebrewVerseText, verseRef, verseNumber);
                textContainer.appendChild(verseElement);
            }
            
            currentChapterNumber++;
        });
    } else {
        const flatEnglish = flattenTextArray(englishText);
        const flatHebrew = flattenTextArray(hebrewText);
        
        flatEnglish.forEach((verseText, index) => {
            if (!verseText || verseText.trim() === '') return;
            
            const hebrewVerseText = flatHebrew[index] || '';
            const verseNumber = startVerse + index;
            const verseRef = `${bookName} ${startChapter}:${verseNumber}`;
            
            const verseElement = createVerseElement(verseText, hebrewVerseText, verseRef, verseNumber);
            textContainer.appendChild(verseElement);
        });
    }
}

function createVerseElement(englishText, hebrewText, verseRef, verseNumber) {
    const container = document.createElement('div');
    container.className = 'verse-container';
    container.dataset.ref = verseRef;
    
    const hasCommentary = checkForCommentary(verseRef);
    const hasKeywords = checkForKeywords(verseRef);
    
    if (hasCommentary || hasKeywords) {
        container.classList.add('has-content');
        if (hasCommentary) container.classList.add('has-commentary');
        if (hasKeywords) container.classList.add('has-keywords');
    }
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'verse-content-wrapper';
    
    const verseNumSpan = document.createElement('div');
    verseNumSpan.className = 'verse-number';
    verseNumSpan.textContent = verseNumber;
    contentWrapper.appendChild(verseNumSpan);
    
    const textContainer = document.createElement('div');
    textContainer.className = 'verse-text-container';
    
    const hebrewDiv = document.createElement('div');
    hebrewDiv.className = 'hebrew-text';
    hebrewDiv.setAttribute('lang', 'he');
    hebrewDiv.setAttribute('dir', 'rtl');
    hebrewDiv.innerHTML = hebrewText;
    
    const englishDiv = document.createElement('div');
    englishDiv.className = 'english-text';
    const cleanedEnglish = cleanSefariaAnnotationsFromText(englishText);
    const processedEnglish = processKeywords(cleanedEnglish, verseRef);
    englishDiv.innerHTML = processedEnglish;
    
    textContainer.appendChild(hebrewDiv);
    textContainer.appendChild(englishDiv);
    contentWrapper.appendChild(textContainer);
    
    container.appendChild(contentWrapper);
    
    const indicatorsSection = document.createElement('div');
    indicatorsSection.className = 'verse-indicators';
    
    if (hasCommentary) {
        const commentaryIndicator = document.createElement('div');
        commentaryIndicator.className = 'content-indicator commentary-indicator';
        commentaryIndicator.textContent = 'Commentary Available';
        commentaryIndicator.title = 'Click to view commentary';
        indicatorsSection.appendChild(commentaryIndicator);
    }
    
    if (hasKeywords) {
        const keywordIndicator = document.createElement('div');
        keywordIndicator.className = 'content-indicator keyword-indicator';
        keywordIndicator.textContent = 'Definitions Available';
        keywordIndicator.title = 'Click highlighted words for definitions';
        indicatorsSection.appendChild(keywordIndicator);
    }
    
    // Create badge element (will be updated by loadCommentCounts)
    const commentBadge = document.createElement('div');
    commentBadge.className = 'comment-count-badge';
    commentBadge.style.display = 'none';
    commentBadge.dataset.verseRef = verseRef;
    indicatorsSection.appendChild(commentBadge);
    
    container.appendChild(indicatorsSection);
    
    return container;
}

function cleanSefariaAnnotationsFromText(text) {
    if (!text || typeof text !== 'string') return text;
    
    let cleaned = text;
    
    const temp = document.createElement('textarea');
    temp.innerHTML = cleaned;
    cleaned = temp.value;
    
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

function checkForKeywords(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return false;
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.keywords && verse.keywords.length > 0) {
                return true;
            }
        }
    }
    return false;
}

function flattenTextArray(arr) {
    const result = [];
    arr.forEach(item => {
        if (Array.isArray(item)) {
            result.push(...item);
        } else {
            result.push(item);
        }
    });
    return result;
}

function checkForCommentary(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return false;
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.commentary && verse.commentary.length > 0) {
                return true;
            }
        }
    }
    return false;
}

function processKeywords(text, verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return text;
    
    let keywords = [];
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.keywords) {
                keywords = verse.keywords;
                break;
            }
        }
    }
    
    if (keywords.length === 0) return text;
    
    let processedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${escapeRegex(keyword.word)})\\b`, 'gi');
        processedText = processedText.replace(regex, 
            `<span class="keyword" data-definition="${escapeHtml(keyword.definition)}">$1</span>`
        );
    });
    
    return processedText;
}

function handleTextClick(e) {
    if (e.target.classList.contains('keyword')) {
        e.stopPropagation();
        e.preventDefault();
        const definition = e.target.dataset.definition;
        const word = e.target.textContent;
        showKeywordDefinition(word, definition);
        return;
    }
    
    if (e.target.closest('.keyword-indicator')) {
        e.stopPropagation();
        const verseContainer = e.target.closest('.verse-container');
        if (verseContainer) {
            const verseRef = verseContainer.dataset.ref;
            const keywords = getKeywordsForVerse(verseRef);
            showAllDefinitions(verseRef, keywords);
        }
        return;
    }
    
    if (e.target.closest('.commentary-indicator')) {
        e.stopPropagation();
        const verseContainer = e.target.closest('.verse-container');
        if (verseContainer) {
            const verseRef = verseContainer.dataset.ref;
            const commentaries = getCommentariesForVerse(verseRef);
            showCommentary(verseRef, commentaries);
        }
        return;
    }
    
    if (e.target.closest('.comment-count-badge')) {
        e.stopPropagation();
        const verseContainer = e.target.closest('.verse-container');
        if (verseContainer) {
            const verseRef = verseContainer.dataset.ref;
            openCommentsPanel(verseRef, (ref) => {
                listenForComments(ref, displayComments);
            });
        }
        return;
    }

    if (e.target.classList.contains('verse-indicators')) {
        return;
    }

    const verseContainer = e.target.closest('.verse-container');
    if (verseContainer && !e.target.closest('.verse-indicators')) {
        const verseRef = verseContainer.dataset.ref;
        openCommentsPanel(verseRef, (ref) => {
            listenForComments(ref, displayComments);
        });
    }
}

function getCommentariesForVerse(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return [];
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.commentary) {
                return verse.commentary;
            }
        }
    }
    return [];
}

function getKeywordsForVerse(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return [];
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.keywords) {
                return verse.keywords;
            }
        }
    }
    return [];
}

function showAllDefinitions(verseRef, keywords) {
    if (!keywords || keywords.length === 0) return;
    
    const infoContent = document.getElementById('info-content');
    let html = `<h4 class="text-lg font-bold mb-4 text-blue-900 border-b-2 border-blue-200 pb-2">Definitions for ${escapeHtml(verseRef)}</h4>`;
    
    keywords.forEach(keyword => {
        html += `
            <div class="definition-container mb-4">
                <div class="definition-word">${escapeHtml(keyword.word)}</div>
                <div class="definition-text">${formatText(keyword.definition)}</div>
            </div>
        `;
    });
    
    infoContent.innerHTML = html;
    showInfoPanel();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatText(text) {
    if (!text) return '';
    
    let escaped = escapeHtml(text);
    escaped = escaped.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
    return escaped;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

document.addEventListener('DOMContentLoaded', init);
