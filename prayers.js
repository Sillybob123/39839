// prayers.js - renders the Important Prayers/Readings page using structured data

const TEXT_SECTIONS = [
  { key: "english", title: "English", className: "english-section" },
  { key: "hebrew", title: "Hebrew", className: "hebrew-section" },
  { key: "transliteration", title: "Transliteration", className: "transliteration-section" }
];

const RAW_PRAYER_DATA = typeof window !== "undefined" ? window.PRAYER_DATA : [];
const RAW_CATEGORY_DATA = typeof window !== "undefined" ? window.PRAYER_CATEGORIES : [];
const DEFAULT_DATA = Array.isArray(RAW_PRAYER_DATA) ? [...RAW_PRAYER_DATA] : [];
const CATEGORY_DATA = Array.isArray(RAW_CATEGORY_DATA) ? [...RAW_CATEGORY_DATA] : [];
const PRAYER_MAP = DEFAULT_DATA.reduce((map, entry) => map.set(entry.id, entry), new Map());
const CATEGORY_TITLE_MAP = CATEGORY_DATA.reduce((map, category) => map.set(category.id, category.title), new Map());

const VISIBLE_SECTIONS = new Set(TEXT_SECTIONS.map(section => section.key));
let allPrayers = [];
let currentPrayers = [];

function formatParagraph(text = "") {
  return text.split("\n").join("<br>");
}

function titleCase(value = "") {
  return value
    .toLowerCase()
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCategoryLabel(value = "") {
  if (!value) return "";
  return CATEGORY_TITLE_MAP.get(value) || titleCase(value);
}

function matchesQuery(prayer, query = "") {
  if (!query) {
    return true;
  }
  const haystack = [
    prayer.title,
    prayer.label,
    prayer.summary,
    prayer.english,
    prayer.hebrew,
    prayer.transliteration,
    prayer.details?.significance,
    prayer.details?.when,
    formatCategoryLabel(prayer.category)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function buildPrayerSection(prayer) {
  return `
        <section id="${prayer.id}" class="prayer-section">
            <div class="prayer-title"><span class="prayer-index">${prayer.order}.</span> ${prayer.title}</div>
            ${buildPrayerMeta(prayer)}
            ${prayer.summary ? `<p class="prayer-summary">${prayer.summary}</p>` : ""}
            ${buildPrayerDetails(prayer)}
            <div class="prayer-content">
                ${TEXT_SECTIONS.map(section => buildTextBlock(prayer, section)).join("")}
            </div>
        </section>
    `;
}

function buildPrayerMeta(prayer) {
  const label = formatCategoryLabel(prayer.category);
  if (!label) return "";
  return `<div class="prayer-meta"><span class="category-chip">${label}</span></div>`;
}

function buildPrayerDetails(prayer) {
  const details = prayer.details || {};
  const items = [
    details.significance
      ? `<div class="detail-item"><span class="detail-label">Significance</span><p>${details.significance}</p></div>`
      : "",
    details.when ? `<div class="detail-item"><span class="detail-label">When</span><p>${details.when}</p></div>` : ""
  ].filter(Boolean);

  if (!items.length) {
    return "";
  }

  return `<div class="prayer-details">${items.join("")}</div>`;
}

function buildTextBlock(prayer, section) {
  if (!VISIBLE_SECTIONS.has(section.key)) {
    return "";
  }
  const content = prayer[section.key];
  if (!content) {
    return "";
  }
  return `
        <div class="text-section ${section.className}">
            <div class="section-title">${section.title}</div>
            <div class="section-text">${formatParagraph(content)}</div>
        </div>
    `;
}

function renderPrayerSections(prayers) {
  const container = document.getElementById("prayers-container");
  if (!container) return;

  if (!prayers.length) {
    container.innerHTML = buildEmptyState();
    return;
  }

  const html = prayers.map(buildPrayerSection).join("\n");
  container.innerHTML = html;
}

function buildEmptyState() {
  return `
        <div class="empty-state">
            <h4 class="empty-title">No prayers match yet</h4>
            <p class="empty-copy">Try a different keyword or reset your filters to see everything again.</p>
            <button type="button" class="reset-button ghost" data-reset-filters>Reset filters</button>
        </div>
    `;
}

function renderCategoryCards(categories) {
  const target = document.getElementById("category-cards");
  if (!target) return;

  const cards = categories.map(category => {
    const links = (category.links || [])
      .map(link => {
        const prayer = PRAYER_MAP.get(link.id);
        if (!prayer) return "";
        return `<a href="#${prayer.id}" class="category-link">${link.label || prayer.title}</a>`;
      })
      .join("");

    return `
            <article class="category-card">
                <h3 class="category-title">${category.title}</h3>
                <p class="category-description">${category.description || ""}</p>
                <div class="category-links">${links}</div>
            </article>
        `;
  });

  target.innerHTML = cards.join("\n");
}

function renderPrayerDirectory(prayers) {
  const directory = document.getElementById("prayer-directory");
  if (!directory) return;

  if (!prayers.length) {
    directory.innerHTML = `<p class="directory-empty">No entries match your current filters.</p>`;
    return;
  }

  const links = prayers
    .map(
      prayer =>
        `<a href="#${prayer.id}" class="directory-link"><span class="directory-index">${prayer.order}.</span> ${
          prayer.label || prayer.title
        }</a>`
    )
    .join("\n");

  directory.innerHTML = links;
}

function updateResultCount(count) {
  const label = document.getElementById("prayer-count");
  if (!label) return;
  label.textContent = count === 1 ? "Showing 1 prayer" : `Showing ${count} prayers`;
}

function populateCategoryFilter(prayers, selectElement) {
  if (!selectElement) return;
  const categories = getUniqueCategories(prayers)
    .map(value => ({ value, label: formatCategoryLabel(value) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category.value;
    option.textContent = category.label;
    selectElement.appendChild(option);
  });
}

function getUniqueCategories(prayers) {
  return Array.from(new Set(prayers.map(prayer => prayer.category).filter(Boolean)));
}

function setupBackToTop() {
  const backToTop = document.getElementById("back-to-top");
  if (!backToTop) return;

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop.addEventListener("click", event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupSmoothScroll() {
  document.addEventListener("click", event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setupResetFilters(handler) {
  if (typeof handler !== "function") return;
  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-reset-filters]");
    if (!trigger) return;
    event.preventDefault();
    handler();
  });
}

function setupPrayerFinder(prayers) {
  const filterState = { query: "", category: "" };
  const searchInput = document.getElementById("prayer-search");
  const categorySelect = document.getElementById("prayer-category");
  const toggleInputs = document.querySelectorAll("[data-language-toggle]");

  populateCategoryFilter(prayers, categorySelect);

  const applyFilters = () => {
    const filtered = prayers.filter(prayer => {
      if (filterState.category && prayer.category !== filterState.category) {
        return false;
      }
      return matchesQuery(prayer, filterState.query);
    });
    refreshPrayers(filtered);
  };

  if (searchInput) {
    searchInput.addEventListener("input", event => {
      filterState.query = (event.target.value || "").trim().toLowerCase();
      applyFilters();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", event => {
      filterState.category = event.target.value;
      applyFilters();
    });
  }

  const syncToggleState = input => {
    const label = input.closest(".toggle-pill");
    if (!label) return;
    if (input.checked) {
      label.classList.add("active");
    } else {
      label.classList.remove("active");
    }
  };

  if (toggleInputs.length) {
    toggleInputs.forEach(input => {
      syncToggleState(input);
      input.addEventListener("change", event => {
        const key = event.target.getAttribute("data-language-toggle");
        if (!key) return;

        if (event.target.checked) {
          VISIBLE_SECTIONS.add(key);
        } else if (VISIBLE_SECTIONS.size > 1) {
          VISIBLE_SECTIONS.delete(key);
        } else {
          // keep at least one section visible
          event.target.checked = true;
          return;
        }
        syncToggleState(event.target);
        renderPrayerSections(currentPrayers);
      });
    });
  }

  const resetFilters = () => {
    filterState.query = "";
    filterState.category = "";
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "";

    VISIBLE_SECTIONS.clear();
    TEXT_SECTIONS.forEach(section => VISIBLE_SECTIONS.add(section.key));
    toggleInputs.forEach(input => {
      input.checked = true;
      syncToggleState(input);
    });

    refreshPrayers(prayers);
  };

  setupResetFilters(resetFilters);
}

function refreshPrayers(prayers) {
  currentPrayers = [...prayers];
  renderPrayerDirectory(currentPrayers);
  renderPrayerSections(currentPrayers);
  updateResultCount(currentPrayers.length);
}

function initializePrayersPage() {
  if (!DEFAULT_DATA.length) return;
  allPrayers = [...DEFAULT_DATA].sort((a, b) => (a.order || 0) - (b.order || 0));
  currentPrayers = [...allPrayers];

  renderCategoryCards(CATEGORY_DATA);
  refreshPrayers(currentPrayers);
  setupBackToTop();
  setupSmoothScroll();
  setupPrayerFinder(allPrayers);

  // Light usability: focus search on first load if present
  const searchInput = document.getElementById('prayer-search');
  if (searchInput) {
    // Defer focus to avoid layout shift
    setTimeout(() => {
      try { searchInput.focus({ preventScroll: true }); } catch (_) {}
    }, 50);
  }
}

document.addEventListener("DOMContentLoaded", initializePrayersPage);
