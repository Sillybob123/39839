// API Service Module
import { API_CONFIG } from './config.js';

/**
 * Fetch current week's parsha from Sefaria calendar
 */
export async function fetchCurrentParsha() {
    try {
        const response = await fetch(`${API_CONFIG.SEFARIA_BASE}/calendars`);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.calendar_items) {
            const parashatHashavua = data.calendar_items.find(
                item => item.title && item.title.en === 'Parashat Hashavua'
            );
            if (parashatHashavua && parashatHashavua.displayValue) {
                return parashatHashavua.displayValue.en;
            }
        }
        return null;
    } catch (error) {
        console.warn('Could not fetch current parsha from calendar:', error);
        return null;
    }
}

/**
 * Fetch Torah text for a specific parsha reference using v3 API
 */
export async function fetchParshaText(parshaRef) {
    try {
        // Use v3 API endpoint with both English and Hebrew versions
        const apiUrl = `${API_CONFIG.SEFARIA_BASE}/v3/texts/${encodeURIComponent(parshaRef)}?version=english&version=hebrew&return_format=default`;
        
        console.log('Fetching from API:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Transform v3 response to expected format
        return transformV3Response(data);
    } catch (error) {
        console.error('Error in fetchParshaText:', error);
        // Fallback to v1 API if v3 fails
        return fetchParshaTextV1(parshaRef);
    }
}

/**
 * Fallback to v1 API if v3 fails
 */
async function fetchParshaTextV1(parshaRef) {
    const apiUrl = `${API_CONFIG.SEFARIA_BASE}/texts/${encodeURIComponent(parshaRef)}?context=0&commentary=0`;
    
    console.log('Falling back to v1 API:', apiUrl);
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clean the v1 API response text as well
    if (data.text) {
        data.text = cleanTextArray(data.text);
    }
    
    return data;
}

/**
 * Clean Sefaria annotations from English text
 * Removes embedded footnotes, alternate translations, and annotation markers
 */
function cleanSefariaAnnotations(text) {
    if (!text || typeof text !== 'string') return text;
    
    let cleaned = text;
    
    // STEP 0: Decode HTML entities first
    // Create a temporary element to decode entities like &gt; to >
    const temp = document.createElement('textarea');
    temp.innerHTML = cleaned;
    cleaned = temp.value;
    
    // STEP 1: First remove "Others", "Or", "Lit." annotations (keep main text)
    // Example: "a first day Others 'one day.'" -> "a first day"
    cleaned = cleaned.replace(/\s+Others\s+['"][^'"]+['"]\s*/gi, '');
    cleaned = cleaned.replace(/\s+Or\s+['"][^'"]+['"]\s*/gi, '');
    cleaned = cleaned.replace(/\s+Lit\.\s+['"][^'"]+['"]\s*/gi, '');
    
    // STEP 2: Remove complete footnote/annotation spans (but keep any cleaned text inside)
    // First extract the text content from footnote spans, then clean it
    cleaned = cleaned.replace(/<span[^>]*class=["']footnote["'][^>]*>(.*?)<\/span>/gi, '$1');
    
    // STEP 3: Remove other span tags (keep content)
    cleaned = cleaned.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');
    
    // STEP 4: Remove patterns with > followed by repeated text
    // Example: "When God began to create >When God began to create Others..." -> "When God began to create"
    // This handles both > and &gt; patterns
    cleaned = cleaned.replace(/([^>]+)\s*>\s*\1[^.]*(?:Others|Or|Lit\.)?[^.]*\./gi, '$1');
    
    // STEP 5: Remove text starting with asterisk followed by repeated phrase
    // Example: "When God began to create*When God began to create Others..." -> "When God began to create"
    cleaned = cleaned.replace(/([^*]+)\*\s*\1[^.]*\./g, '$1');
    
    // STEP 6: Remove standalone annotations starting with asterisk or >
    // Example: "text*Some annotation here" -> "text"
    cleaned = cleaned.replace(/[*>][^*>]+?(?=\s|$)/g, '');
    
    // STEP 7: Remove <i> tags and their content (alternate translations)
    // Example: "text<i>alternate translation</i>" -> "text"
    cleaned = cleaned.replace(/<i[^>]*>.*?<\/i>/gi, '');
    
    // STEP 8: Remove <sup> tags (superscript footnote markers)
    cleaned = cleaned.replace(/<sup[^>]*>.*?<\/sup>/gi, '');
    
    // STEP 9: Remove any remaining HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    
    // STEP 10: Clean up stray HTML attribute text
    cleaned = cleaned.replace(/\bclass=["'][^"']*["']/gi, '');
    
    // STEP 11: Clean up extra whitespace and punctuation issues
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

/**
 * Recursively clean text arrays
 */
function cleanTextArray(textArray) {
    if (!Array.isArray(textArray)) {
        return cleanSefariaAnnotations(textArray);
    }
    
    return textArray.map(item => {
        if (Array.isArray(item)) {
            return cleanTextArray(item);
        }
        return cleanSefariaAnnotations(item);
    });
}

/**
 * Transform v3 API response to expected format
 */
function transformV3Response(v3Data) {
    // v3 API returns versions array with text and language info
    const englishVersion = v3Data.versions?.find(v => 
        v.languageFamilyName === 'english' || v.language === 'en'
    );
    const hebrewVersion = v3Data.versions?.find(v => 
        v.languageFamilyName === 'hebrew' || v.language === 'he'
    );
    
    // If no versions found, try to use the data directly
    const rawEnglishText = englishVersion?.text || v3Data.text || [];
    const hebrewText = hebrewVersion?.text || v3Data.he || [];
    
    // Clean the English text of all Sefaria annotations
    const englishText = cleanTextArray(rawEnglishText);
    
    console.log('Transformed data:', {
        book: v3Data.indexTitle,
        textLength: englishText.length,
        hebrewLength: hebrewText.length
    });
    
    return {
        book: v3Data.indexTitle || v3Data.title || 'Torah',
        sections: v3Data.sections || [1],
        text: englishText,
        he: hebrewText,
        ref: v3Data.ref,
        heRef: v3Data.heRef,
        indexTitle: v3Data.indexTitle,
        sectionRef: v3Data.sectionRef
    };
}

/**
 * Load local commentary data from data.json
 */
export async function loadCommentaryData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load commentary data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading commentary data:', error);
        return { parshas: [] };
    }
}
