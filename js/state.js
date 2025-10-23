// State Management Module
export const state = {
    commentaryData: null,
    currentParshaRef: null,
    currentParshaIndex: -1,
    allParshas: [],
    isLoading: false
};

export function setState(updates) {
    Object.assign(state, updates);
}

export function getState() {
    return { ...state };
}
