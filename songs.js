// songs.js - render the Songs and Poems page from songs.json

const SONGS_URL = "songs.json";
let allEntries = [];
let activeTypeFilter = "all";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value = "") {
  return String(value).toLowerCase();
}

function getEntryType(entry = {}) {
  return normalizeText(entry.category) === "poem" ? "poem" : "song";
}

function getTypeLabel(type = "all") {
  if (type === "song") return "Songs";
  if (type === "poem") return "Poems";
  return "All entries";
}

function buildSearchText(entry) {
  const lyricText = Array.isArray(entry.lyrics)
    ? entry.lyrics
        .map(line => [line.hebrew, line.transliteration, line.english].filter(Boolean).join(" "))
        .join(" ")
    : "";

  const poemText = Array.isArray(entry.poem_lines) ? entry.poem_lines.filter(Boolean).join(" ") : "";
  const poemHebrewText = Array.isArray(entry.poem_hebrew_lines)
    ? entry.poem_hebrew_lines.filter(Boolean).join(" ")
    : "";

  return normalizeText(
    [
      entry.title_hebrew,
      entry.title_english,
      entry.artist,
      entry.overview,
      entry.published_date,
      entry.category,
      lyricText,
      poemText,
      poemHebrewText
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function buildSongCard(entry) {
  const entryType = getEntryType(entry);
  const isPoem = entryType === "poem";
  const sourceIndex = Number.isInteger(entry.sourceIndex) ? entry.sourceIndex : 0;

  const titleEnglish = entry.title_english ? escapeHtml(entry.title_english) : "";
  const titleHebrew = entry.title_hebrew ? escapeHtml(entry.title_hebrew) : "";
  const artist = entry.artist ? escapeHtml(entry.artist) : "";
  const overview = entry.overview ? escapeHtml(entry.overview) : "";
  const publishedDate = entry.published_date ? escapeHtml(entry.published_date) : "";

  const titleBlocks = [
    titleEnglish ? `<span>${titleEnglish}</span>` : "",
    titleHebrew ? `<span class="song-title-hebrew" lang="he">${titleHebrew}</span>` : ""
  ].filter(Boolean);

  const titleHtml = titleBlocks.length ? titleBlocks.join("") : "<span>Untitled Entry</span>";
  const typeLabel = isPoem ? "Poem" : "Song";
  const typeClass = isPoem ? "song-meta-chip-poem" : "song-meta-chip-song";
  const artistLabel = isPoem ? "Written by" : "Artist";
  const ctaText = isPoem ? "Read Poem" : "View Song Details";

  return `
    <article class="song-card ${isPoem ? "song-card-poem" : ""}" data-song-index="${sourceIndex}" data-entry-type="${entryType}">
      <a href="song-detail.html?song=${sourceIndex}" class="song-card-link">
        <header class="song-header">
          <div class="song-meta-row">
            <span class="song-meta-chip ${typeClass}">${typeLabel}</span>
            ${publishedDate ? `<span class="song-meta-date">${publishedDate}</span>` : ""}
          </div>
          <h3 class="song-title">${titleHtml}</h3>
          ${artist ? `<p class="song-artist">${artistLabel}: ${artist}</p>` : ""}
        </header>
        ${overview ? `<p class="song-overview">${overview}</p>` : ""}
        <div class="song-card-cta">
          <span class="song-card-cta-text">${ctaText}</span>
          <svg class="song-card-cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </a>
    </article>
  `;
}

function renderEntries(entries) {
  const container = document.getElementById("songs-container");
  if (!container) return;

  if (!entries.length) {
    container.innerHTML = '<div class="songs-empty">No songs or poems match this filter yet.</div>';
    return;
  }

  // Use a single innerHTML write to minimize reflows
  const html = [];
  for (let i = 0; i < entries.length; i++) {
    html.push(buildSongCard(entries[i]));
  }
  container.innerHTML = html.join("");
}

function getTypeCounts(entries) {
  const counts = { all: entries.length, song: 0, poem: 0 };
  entries.forEach(entry => {
    const type = getEntryType(entry);
    if (type === "poem") {
      counts.poem += 1;
    } else {
      counts.song += 1;
    }
  });
  return counts;
}

function updateTypeTabCounts(entries) {
  const counts = getTypeCounts(entries);
  const allCount = document.getElementById("songs-tab-count-all");
  const songCount = document.getElementById("songs-tab-count-song");
  const poemCount = document.getElementById("songs-tab-count-poem");

  if (allCount) allCount.textContent = String(counts.all);
  if (songCount) songCount.textContent = String(counts.song);
  if (poemCount) poemCount.textContent = String(counts.poem);
}

function updateTypeTabsActiveState() {
  const tabs = document.querySelectorAll(".songs-type-tab");
  tabs.forEach(tab => {
    const isActive = tab.dataset.typeFilter === activeTypeFilter;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
    tab.tabIndex = isActive ? 0 : -1;
  });
}

function updateCounts(filteredCount, totalCount, query, typeFilter) {
  const countLabel = document.getElementById("songs-count");
  const filterPill = document.getElementById("songs-filter-pill");
  const typeLabel = getTypeLabel(typeFilter);

  if (countLabel) {
    if (totalCount === 0) {
      countLabel.textContent = "No entries yet";
    } else if (query || typeFilter !== "all") {
      countLabel.textContent = `Showing ${filteredCount} of ${totalCount} entries`;
    } else {
      countLabel.textContent = `Showing ${totalCount} ${totalCount === 1 ? "entry" : "entries"}`;
    }
  }

  if (filterPill) {
    if (!query && typeFilter === "all") {
      filterPill.textContent = "All entries";
    } else if (query && typeFilter !== "all") {
      filterPill.textContent = `${typeLabel} • Matches: ${filteredCount}`;
    } else if (query) {
      filterPill.textContent = `Matches: ${filteredCount}`;
    } else {
      filterPill.textContent = typeLabel;
    }
  }
}

function filterEntriesByType(entries, typeFilter) {
  if (typeFilter === "all") return entries;
  return entries.filter(entry => getEntryType(entry) === typeFilter);
}

function filterEntries(query, typeFilter) {
  const typeFiltered = filterEntriesByType(allEntries, typeFilter);
  if (!query) return typeFiltered;
  return typeFiltered.filter(entry => entry.searchText.includes(query));
}

function setupSearchAndTabs() {
  const searchInput = document.getElementById("song-search");
  const clearButton = document.getElementById("clear-song-search");
  const tabs = document.querySelectorAll(".songs-type-tab");

  const applyFilters = () => {
    const query = normalizeText(searchInput ? searchInput.value.trim() : "");
    const filteredEntries = filterEntries(query, activeTypeFilter);
    renderEntries(filteredEntries);
    updateCounts(filteredEntries.length, allEntries.length, query, activeTypeFilter);
    updateTypeTabsActiveState();
  };

  updateTypeTabCounts(allEntries);
  updateTypeTabsActiveState();

  let searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilters, 150);
    });
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      applyFilters();
      searchInput.focus();
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const nextFilter = tab.dataset.typeFilter || "all";
      if (nextFilter === activeTypeFilter) return;
      activeTypeFilter = nextFilter;
      applyFilters();
    });
  });

  applyFilters();
}

async function loadEntries() {
  try {
    const response = await fetch(SONGS_URL);
    if (!response.ok) {
      throw new Error("Failed to load songs and poems");
    }

    const data = await response.json();
    allEntries = Array.isArray(data)
      ? data.map((entry, index) => ({
          ...entry,
          sourceIndex: index,
          searchText: buildSearchText(entry)
        }))
      : [];

    setupSearchAndTabs();
  } catch (error) {
    const container = document.getElementById("songs-container");
    if (container) {
      container.innerHTML = '<div class="songs-empty">Songs and poems are unavailable right now.</div>';
    }
    updateCounts(0, 0, "", "all");
    updateTypeTabCounts([]);
    updateTypeTabsActiveState();
  }
}

function loadAppleMusicEmbed() {
  const placeholder = document.getElementById("apple-music-placeholder");
  const container = document.getElementById("apple-music-embed");
  if (!placeholder || !container) return;

  function doLoad() {
    const iframe = document.createElement("iframe");
    iframe.allow = "autoplay *; encrypted-media *;";
    iframe.frameBorder = "0";
    iframe.height = "450";
    iframe.style.cssText = "width:100%;max-width:100%;overflow:hidden;border-radius:12px;";
    iframe.sandbox = "allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation";
    iframe.src = "https://embed.music.apple.com/us/playlist/%D7%9E%D7%95%D7%93%D7%94-%D7%90%D7%A0%D7%99/pl.u-WabZzV3sWGPPN4";
    placeholder.remove();
    container.appendChild(iframe);
  }

  placeholder.addEventListener("click", doLoad);
  placeholder.addEventListener("keydown", function(e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doLoad(); }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadEntries();
  loadAppleMusicEmbed();
});
