/*
 * Shared sidebar navigation controller for the global header.
 * - Desktop: always-visible left panel, collapsible to icon strip
 * - Mobile:  hidden drawer revealed by a fixed hamburger button
 *
 * Hamburger is appended directly to document.body so it is never
 * affected by ancestor overflow, z-index stacking contexts, or
 * transforms on the header element.
 */
(function initSidebarNavigation() {
    'use strict';

    var DESKTOP_BREAKPOINT = 960;
    var COLLAPSE_KEY = 'siteSidebarCollapsed';

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    onReady(function () {
        var body        = document.body;
        var header      = document.querySelector('.header-main');
        var hContainer  = header ? header.querySelector('.header-container') : null;
        var actionsWrap = hContainer ? hContainer.querySelector('.header-actions-wrapper') : null;
        var hActions    = actionsWrap ? actionsWrap.querySelector('#header-actions') : null;

        // Bail if the required header structure is missing on this page
        if (!body || !header || !hContainer || !actionsWrap || !hActions) {
            return;
        }

        // Prevent double-init
        if (body.classList.contains('sidebar-nav-enabled')) return;
        body.classList.add('sidebar-nav-enabled');

        // ── 1. Pull the actions wrapper out of the header and make it the sidebar
        actionsWrap.parentNode.removeChild(actionsWrap);
        actionsWrap.className = 'site-sidebar';
        actionsWrap.id = 'site-sidebar';
        actionsWrap.setAttribute('role', 'navigation');
        actionsWrap.setAttribute('aria-label', 'Primary navigation');
        document.body.appendChild(actionsWrap);

        // ── 2. Build the sidebar head (brand link → home + collapse btn)
        var sidebarHead = document.createElement('div');
        sidebarHead.className = 'site-sidebar-head';

        // Wrap brand icon + site name in a home link
        var brandLink = document.createElement('a');
        brandLink.href = 'index.html';
        brandLink.className = 'site-sidebar-brand-link';
        brandLink.title = 'A Letter in the Scroll — Home';

        var brand = document.createElement('span');
        brand.className = 'site-sidebar-brand';
        brand.setAttribute('aria-hidden', 'true');
        brand.innerHTML = '<img src="media/images/IconOnly.png" alt="" style="width:28px;height:28px;object-fit:contain;display:block;">';

        var sidebarTitle = document.createElement('span');
        sidebarTitle.className = 'site-sidebar-title';
        sidebarTitle.textContent = 'A Letter in the Scroll';

        brandLink.appendChild(brand);
        brandLink.appendChild(sidebarTitle);

        var collapseBtn = document.createElement('button');
        collapseBtn.type = 'button';
        collapseBtn.className = 'site-sidebar-collapse';
        collapseBtn.setAttribute('aria-controls', 'site-sidebar');
        collapseBtn.setAttribute('aria-label', 'Collapse navigation');
        collapseBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

        // Mobile-only close button inside the drawer
        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'site-sidebar-close-btn';
        closeBtn.setAttribute('aria-label', 'Close navigation');
        closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

        sidebarHead.appendChild(brandLink);
        sidebarHead.appendChild(collapseBtn);
        sidebarHead.appendChild(closeBtn);
        actionsWrap.insertBefore(sidebarHead, hActions);

        // ── 3. Hamburger button — appended directly to document.body
        //       so NO ancestor CSS can interfere with its visibility or z-index
        var hamburger = document.createElement('button');
        hamburger.type = 'button';
        hamburger.id = 'site-hamburger';
        hamburger.className = 'site-header-nav-toggle';
        hamburger.setAttribute('aria-controls', 'site-sidebar');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        hamburger.innerHTML =
            '<span class="site-header-nav-toggle-icon" aria-hidden="true">' +
            '<span></span><span></span><span></span>' +
            '</span>';
        document.body.appendChild(hamburger);   // <-- body, not header!

        // ── 4. Backdrop for mobile
        var backdrop = document.createElement('div');
        backdrop.className = 'site-sidebar-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);

        // ── 5. State helpers
        var mql = window.matchMedia('(max-width: ' + DESKTOP_BREAKPOINT + 'px)');

        function isMobile() { return mql.matches; }
        function isOpen()   { return body.classList.contains('sidebar-nav-mobile-open'); }

        function getSaved() {
            try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) { return false; }
        }
        function saveCollapsed(v) {
            try { localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0'); } catch (e) { /* ignore */ }
        }

        // ── 6. Open / close mobile drawer
        function openDrawer() {
            body.classList.add('sidebar-nav-mobile-open');
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.setAttribute('aria-label', 'Close navigation menu');
            // Prevent body scroll while drawer is open
            body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            body.classList.remove('sidebar-nav-mobile-open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Open navigation menu');
            body.style.overflow = '';
        }

        // ── 7. Collapse desktop sidebar
        function setCollapsed(next) {
            body.classList.toggle('sidebar-nav-collapsed', next);
            collapseBtn.setAttribute('aria-label', next ? 'Expand navigation' : 'Collapse navigation');
            collapseBtn.setAttribute('aria-expanded', String(!next));
            saveCollapsed(next);
        }

        // ── 8. Sync state when screen size changes
        function sync() {
            if (isMobile()) {
                body.classList.remove('sidebar-nav-collapsed');
                closeDrawer();
            } else {
                closeDrawer();
                setCollapsed(getSaved());
            }
        }

        // ── 9. Event listeners
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isMobile()) {
                isOpen() ? closeDrawer() : openDrawer();
            } else {
                setCollapsed(!body.classList.contains('sidebar-nav-collapsed'));
            }
        });

        closeBtn.addEventListener('click', function () {
            closeDrawer();
        });

        collapseBtn.addEventListener('click', function () {
            if (isMobile()) {
                closeDrawer();
            } else {
                setCollapsed(!body.classList.contains('sidebar-nav-collapsed'));
            }
        });

        backdrop.addEventListener('click', function () {
            closeDrawer();
        });

        // Close when the user navigates away via a link/button inside the drawer
        actionsWrap.addEventListener('click', function (e) {
            if (!isMobile()) return;
            if (e.target.closest('.site-sidebar-close-btn')) return;
            if (e.target.closest('.site-sidebar-collapse')) return;
            if (e.target.closest('.text-size-control')) return;
            if (e.target.closest('a') || e.target.closest('button')) {
                closeDrawer();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) closeDrawer();
        });

        if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', sync);
        } else if (typeof mql.addListener === 'function') {
            mql.addListener(sync);
        }

        sync();
    });
})();
