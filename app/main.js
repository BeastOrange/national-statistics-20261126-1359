/**
 * StatAtlas — Main Application Router & Controller
 * Manages hash routing, state persistence, and responsive window resizing.
 */

(function () {
  'use strict';

  const { renderOverview, renderCountryDetail, renderCompare } = window.StatViews;

  // Global application state
  const appState = {
    overview: {
      searchQuery: '',
      sortField: 'gdp',
      sortOrder: 'desc',
      selectedRegion: 'all'
    },
    activeRoute: '',
    countryDetail: {
      indicator: 'gdp'
    },
    compare: {
      countries: ['USA', 'CHN', 'DEU'],
      indicator: 'gdp'
    }
  };

  /**
   * Parse current window hash and query parameters
   */
  function parseHash() {
    const raw = window.location.hash.slice(1) || '/';
    const [pathPart, queryPart] = raw.split('?');
    const path = pathPart.replace(/\/+$/, '') || '/';

    const params = new URLSearchParams(queryPart || '');
    return { path, params };
  }

  /**
   * Update active navigation links in the header
   */
  function updateNav(path) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (path === '/' && href === '#/') {
        link.classList.add('nav-active');
      } else if (path.startsWith('/compare') && href === '#/compare') {
        link.classList.add('nav-active');
      } else {
        link.classList.remove('nav-active');
      }
    });
  }

  /**
   * Main Router
   */
  function router() {
    const { path, params } = parseHash();
    const appEl = document.getElementById('app');
    if (!appEl) return;

    appState.activeRoute = path;
    updateNav(path);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    if (path === '/' || path === '') {
      renderOverview(appEl, appState.overview);
    } else if (path.startsWith('/country/')) {
      const parts = path.split('/');
      const countryId = (parts[2] || 'USA').toUpperCase();
      const indicator = params.get('indicator') || appState.countryDetail.indicator || 'gdp';
      appState.countryDetail.indicator = indicator;
      renderCountryDetail(appEl, countryId, indicator);
    } else if (path === '/compare') {
      let countriesParam = params.get('countries');
      let countries = countriesParam ? countriesParam.split(',').filter(Boolean) : appState.compare.countries;
      if (!countries || countries.length < 2) {
        countries = ['USA', 'CHN', 'DEU'];
      }
      const indicator = params.get('indicator') || appState.compare.indicator || 'gdp';
      appState.compare.countries = countries;
      appState.compare.indicator = indicator;
      renderCompare(appEl, countries, indicator);
    } else {
      // Fallback 404 in UI -> redirect to overview
      window.location.hash = '#/';
    }
  }

  // Handle window resizing with debounce for canvas redrawing
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-run current router to redraw canvas charts at correct container width
      router();
    }, 150);
  });

  // Listen to hash changes and initial DOM ready
  window.addEventListener('hashchange', router);
  window.addEventListener('DOMContentLoaded', router);
})();
