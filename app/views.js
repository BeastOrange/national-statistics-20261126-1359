/**
 * StatAtlas — Views & Canvas Charting Engine
 * Provides interactive charts, overview table/cards, country detail, and multi-country comparison.
 * Zero external dependencies — pure Vanilla JS and HTML5 Canvas.
 */

(function (root) {
  'use strict';

  const { YEARS, INDICATORS, COUNTRIES, GLOBAL_AVERAGES, formatValue, formatValueFull, getCountry, getIndicator } = root.StatData;

  // Chart theme colors
  const THEME = {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    gridColor: '#e2e8f0',
    gridText: '#64748b',
    tooltipBg: '#0f172a',
    tooltipText: '#ffffff',
    highlight: '#2563eb',
    avgColor: '#94a3b8'
  };

  /**
   * High-DPI Canvas Initializer
   */
  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Set display size
    const width = rect.width || canvas.parentElement.clientWidth || 600;
    const height = canvas.height || 340;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
  }

  /**
   * Draws a multi-series or single-series line chart over 2015-2024
   * seriesList: [ { label, color, data: [10 numbers], dashed: boolean } ]
   */
  function drawLineChart(canvas, seriesList, indicator, options = {}) {
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);

    const padding = {
      top: options.showLegend !== false ? 45 : 25,
      right: 35,
      bottom: 45,
      left: options.leftPad || 65
    };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    if (chartW <= 0 || chartH <= 0) return;

    // Collect all data points to find min & max
    let allVals = [];
    seriesList.forEach((s) => {
      if (s.data && s.data.length) {
        allVals.push(...s.data);
      }
    });

    if (allVals.length === 0) return;

    let minVal = Math.min(...allVals);
    let maxVal = Math.max(...allVals);

    // Padding for min/max
    if (minVal === maxVal) {
      minVal = minVal * 0.9;
      maxVal = maxVal * 1.1 || 1;
    } else {
      const range = maxVal - minVal;
      minVal = Math.max(0, minVal - range * 0.08);
      maxVal = maxVal + range * 0.08;
    }

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw Y-axis gridlines & labels
    const yTicks = 5;
    ctx.font = `11px ${THEME.font}`;
    ctx.fillStyle = THEME.gridText;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yTicks; i++) {
      const tVal = minVal + (maxVal - minVal) * (i / yTicks);
      const y = padding.top + chartH - (i / yTicks) * chartH;

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = THEME.gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      // Tick label
      let label = indicator.chartFormat ? indicator.chartFormat(tVal) : tVal.toFixed(1);
      ctx.fillText(label, padding.left - 10, y);
    }

    // X coordinates for years
    const xStep = chartW / (YEARS.length - 1);
    const getX = (idx) => padding.left + idx * xStep;
    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    // Draw X-axis ticks & year labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    YEARS.forEach((year, idx) => {
      const x = getX(idx);

      // Tick mark
      ctx.beginPath();
      ctx.strokeStyle = THEME.gridColor;
      ctx.moveTo(x, padding.top + chartH);
      ctx.lineTo(x, padding.top + chartH + 5);
      ctx.stroke();

      ctx.fillStyle = THEME.gridText;
      ctx.font = `11px ${THEME.font}`;
      ctx.fillText(year.toString(), x, padding.top + chartH + 8);
    });

    // Draw Series
    seriesList.forEach((series) => {
      const { data, color, dashed } = series;
      if (!data || data.length < 2) return;

      // Area gradient for primary single series
      if (seriesList.length === 1 && !dashed) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(data[0]));
        for (let i = 1; i < data.length; i++) {
          ctx.lineTo(getX(i), getY(data[i]));
        }
        ctx.lineTo(getX(data.length - 1), padding.top + chartH);
        ctx.lineTo(getX(0), padding.top + chartH);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        grad.addColorStop(0, color + '33'); // 20% opacity
        grad.addColorStop(1, color + '05'); // subtle fade
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = dashed ? 2 : 2.5;
      if (dashed) {
        ctx.setLineDash([5, 4]);
      } else {
        ctx.setLineDash([]);
      }

      data.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw data dots
      data.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);

        ctx.beginPath();
        ctx.arc(x, y, dashed ? 3 : 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = dashed ? 1.5 : 2;
        ctx.strokeStyle = color;
        ctx.stroke();
      });
    });

    // Draw Legend
    if (options.showLegend !== false && seriesList.length > 0) {
      let curX = padding.left;
      const legY = 18;
      ctx.font = `600 12px ${THEME.font}`;
      ctx.textBaseline = 'middle';

      seriesList.forEach((s) => {
        // Line swatch
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        if (s.dashed) ctx.setLineDash([4, 3]);
        else ctx.setLineDash([]);
        ctx.moveTo(curX, legY);
        ctx.lineTo(curX + 18, legY);
        ctx.stroke();

        // Dot swatch
        ctx.beginPath();
        ctx.arc(curX + 9, legY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = s.color;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'left';
        ctx.fillText(s.label, curX + 24, legY);

        const txtW = ctx.measureText(s.label).width;
        curX += 24 + txtW + 24;
      });
    }

    // Attach hover tooltip interaction
    setupChartHover(canvas, seriesList, indicator, { padding, chartW, chartH, minVal, maxVal, getX, getY });
  }

  /**
   * Hover tooltip interaction for line chart
   */
  function setupChartHover(canvas, seriesList, indicator, meta) {
    let tooltipEl = canvas.parentElement.querySelector('.chart-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'chart-tooltip';
      canvas.parentElement.style.position = 'relative';
      canvas.parentElement.appendChild(tooltipEl);
    }

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX < meta.padding.left || mouseX > meta.padding.left + meta.chartW ||
          mouseY < meta.padding.top || mouseY > meta.padding.top + meta.chartH) {
        tooltipEl.style.display = 'none';
        return;
      }

      // Find closest year
      const xStep = meta.chartW / (YEARS.length - 1);
      const yearIdx = Math.max(0, Math.min(YEARS.length - 1, Math.round((mouseX - meta.padding.left) / xStep)));
      const year = YEARS[yearIdx];

      let html = `<div class="chart-tooltip-title">${year}</div>`;
      seriesList.forEach((s) => {
        const val = s.data[yearIdx];
        const formatted = indicator.format(val);
        html += `
          <div class="chart-tooltip-row">
            <span class="chart-tooltip-dot" style="background:${s.color}"></span>
            <span class="chart-tooltip-label">${s.label}:</span>
            <span class="chart-tooltip-val">${formatted}</span>
          </div>`;
      });

      tooltipEl.innerHTML = html;
      tooltipEl.style.display = 'block';

      // Position tooltip near cursor
      const ttW = tooltipEl.offsetWidth || 150;
      let left = mouseX + 15;
      if (left + ttW > rect.width) {
        left = mouseX - ttW - 15;
      }
      let top = Math.max(10, mouseY - 30);
      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
    };

    canvas.onmouseleave = () => {
      if (tooltipEl) tooltipEl.style.display = 'none';
    };
  }

  /**
   * Draws a horizontal ranking bar chart of all 16 countries with the target country highlighted
   */
  function drawRankBarChart(canvas, targetCountryId, indicator) {
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);

    const padding = { top: 35, right: 65, bottom: 25, left: 110 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    if (chartW <= 0 || chartH <= 0) return;

    // Collect 2024 latest values for all countries
    const list = COUNTRIES.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      val: c.series[indicator.id][YEARS.length - 1],
      isTarget: c.id === targetCountryId
    })).sort((a, b) => b.val - a.val);

    const maxVal = Math.max(...list.map((d) => d.val)) * 1.05;
    const avgVal = GLOBAL_AVERAGES[indicator.id][YEARS.length - 1];

    ctx.clearRect(0, 0, width, height);

    // Title / subtitle
    ctx.font = `600 12px ${THEME.font}`;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'left';
    ctx.fillText(`2024 Benchmark Ranking — ${indicator.name} across all 16 nations`, padding.left, 18);

    const rowH = chartH / list.length;
    const barH = Math.max(8, rowH - 6);

    list.forEach((item, idx) => {
      const y = padding.top + idx * rowH;
      const barW = Math.max(2, (item.val / maxVal) * chartW);

      // Country label
      ctx.font = item.isTarget ? `bold 11px ${THEME.font}` : `11px ${THEME.font}`;
      ctx.fillStyle = item.isTarget ? '#1d4ed8' : '#475569';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.name, padding.left - 10, y + rowH / 2);

      // Bar
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(padding.left, y + (rowH - barH) / 2, barW, barH, 3) : ctx.rect(padding.left, y + (rowH - barH) / 2, barW, barH);
      ctx.fillStyle = item.isTarget ? '#2563eb' : '#cbd5e1';
      ctx.fill();

      // Value text
      ctx.font = item.isTarget ? `bold 10px ${THEME.font}` : `10px ${THEME.font}`;
      ctx.fillStyle = item.isTarget ? '#1e3a8a' : '#64748b';
      ctx.textAlign = 'left';
      ctx.fillText(indicator.format(item.val), padding.left + barW + 8, y + rowH / 2);
    });

    // 16-Country Average reference line
    const avgX = padding.left + (avgVal / maxVal) * chartW;
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.moveTo(avgX, padding.top);
    ctx.lineTo(avgX, padding.top + chartH);
    ctx.stroke();

    // Average label
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold 10px ${THEME.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Avg: ${indicator.format(avgVal)}`, avgX, padding.top + chartH + 15);
  }

  // ==========================================
  // VIEW RENDERERS
  // ==========================================

  /**
   * Renders the Home / Overview View
   */
  function renderOverview(container, state) {
    const { searchQuery = '', sortField = 'gdp', sortOrder = 'desc', selectedRegion = 'all' } = state;

    // Filter & Sort countries
    let list = COUNTRIES.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.capital.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'all' || c.region.toLowerCase() === selectedRegion.toLowerCase();
      return matchesSearch && matchesRegion;
    });

    list.sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortField === 'region') {
        valA = a.region;
        valB = b.region;
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        // Indicator field
        valA = a.series[sortField] ? a.series[sortField][YEARS.length - 1] : 0;
        valB = b.series[sortField] ? b.series[sortField][YEARS.length - 1] : 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    // Aggregate statistics
    const totalPop = COUNTRIES.reduce((acc, c) => acc + c.series.population[YEARS.length - 1], 0);
    const totalGdp = COUNTRIES.reduce((acc, c) => acc + c.series.gdp[YEARS.length - 1], 0);
    const avgLifeExp = COUNTRIES.reduce((acc, c) => acc + c.series.life_expectancy[YEARS.length - 1], 0) / COUNTRIES.length;
    const avgUrban = COUNTRIES.reduce((acc, c) => acc + c.series.urban_population_pct[YEARS.length - 1], 0) / COUNTRIES.length;

    const sortIndicator = (field) => {
      if (sortField === field) {
        return sortOrder === 'asc' ? '▲' : '▼';
      }
      return '⇅';
    };

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1 class="view-title">Global National Statistics Observatory</h1>
          <p class="view-subtitle">Comparative socioeconomic series, historical metrics, and demographic trends (2015–2024) across 16 major global economies.</p>
        </div>
        <div class="view-actions">
          <a href="#/compare" class="btn btn-primary">
            <span class="btn-icon">⚖️</span> Compare Nations
          </a>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="metric-strip">
        <div class="metric-card">
          <div class="metric-label">Tracked Population</div>
          <div class="metric-value">${(totalPop / 1e9).toFixed(2)} Billion</div>
          <div class="metric-sub">Across 16 sovereign nations (2024)</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Combined Output (GDP)</div>
          <div class="metric-value">$${(totalGdp / 1e12).toFixed(1)} Trillion</div>
          <div class="metric-sub">~72% of global nominal output</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Mean Life Expectancy</div>
          <div class="metric-value">${avgLifeExp.toFixed(1)} Years</div>
          <div class="metric-sub">Peer group weighted arithmetic average</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Urban Share</div>
          <div class="metric-value">${avgUrban.toFixed(1)}%</div>
          <div class="metric-sub">Urbanized resident proportion</div>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="overview-search" class="search-input" placeholder="Filter by country, capital, or code..." value="${searchQuery}" autocomplete="off">
          ${searchQuery ? `<button id="clear-search" class="btn-clear" title="Clear search">✕</button>` : ''}
        </div>

        <div class="filter-group">
          <label class="filter-label">Region:</label>
          <select id="region-filter" class="select-control">
            <option value="all" ${selectedRegion === 'all' ? 'selected' : ''}>All Continents</option>
            <option value="americas" ${selectedRegion === 'americas' ? 'selected' : ''}>Americas</option>
            <option value="asia" ${selectedRegion === 'asia' ? 'selected' : ''}>Asia</option>
            <option value="europe" ${selectedRegion === 'europe' ? 'selected' : ''}>Europe</option>
            <option value="africa" ${selectedRegion === 'africa' ? 'selected' : ''}>Africa</option>
            <option value="oceania" ${selectedRegion === 'oceania' ? 'selected' : ''}>Oceania</option>
          </select>
        </div>

        <div class="result-count">
          Showing <strong>${list.length}</strong> of ${COUNTRIES.length} nations
        </div>
      </div>

      <!-- Overview Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th data-sort="name" class="sortable col-country">
                Country <span class="sort-badge">${sortIndicator('name')}</span>
              </th>
              <th data-sort="region" class="sortable">
                Region <span class="sort-badge">${sortIndicator('region')}</span>
              </th>
              <th data-sort="population" class="sortable text-right">
                Population <span class="sort-badge">${sortIndicator('population')}</span>
              </th>
              <th data-sort="gdp" class="sortable text-right">
                GDP (Nominal) <span class="sort-badge">${sortIndicator('gdp')}</span>
              </th>
              <th data-sort="gdp_per_capita" class="sortable text-right">
                GDP / Capita <span class="sort-badge">${sortIndicator('gdp_per_capita')}</span>
              </th>
              <th data-sort="unemployment" class="sortable text-right">
                Unemployment <span class="sort-badge">${sortIndicator('unemployment')}</span>
              </th>
              <th data-sort="inflation" class="sortable text-right">
                Inflation <span class="sort-badge">${sortIndicator('inflation')}</span>
              </th>
              <th data-sort="life_expectancy" class="sortable text-right">
                Life Exp. <span class="sort-badge">${sortIndicator('life_expectancy')}</span>
              </th>
              <th data-sort="median_age" class="sortable text-right">
                Median Age <span class="sort-badge">${sortIndicator('median_age')}</span>
              </th>
              <th data-sort="urban_population_pct" class="sortable text-right">
                Urban % <span class="sort-badge">${sortIndicator('urban_population_pct')}</span>
              </th>
              <th class="text-center col-action">Explore</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((c) => {
              const pop = c.series.population[YEARS.length - 1];
              const gdp = c.series.gdp[YEARS.length - 1];
              const gdppc = c.series.gdp_per_capita[YEARS.length - 1];
              const unemp = c.series.unemployment[YEARS.length - 1];
              const infl = c.series.inflation[YEARS.length - 1];
              const life = c.series.life_expectancy[YEARS.length - 1];
              const age = c.series.median_age[YEARS.length - 1];
              const urb = c.series.urban_population_pct[YEARS.length - 1];

              return `
                <tr class="country-row" data-id="${c.id}">
                  <td class="col-country">
                    <div class="country-cell">
                      <span class="country-flag-badge" style="background:${c.color}22; color:${c.color}; border-color:${c.color}55;">${c.code}</span>
                      <div>
                        <div class="country-cell-name">${c.name}</div>
                        <div class="country-cell-capital">${c.capital}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="region-pill">${c.region}</span></td>
                  <td class="text-right font-mono">${formatValue('population', pop)}</td>
                  <td class="text-right font-mono font-semibold">${formatValue('gdp', gdp)}</td>
                  <td class="text-right font-mono">${formatValue('gdp_per_capita', gdppc)}</td>
                  <td class="text-right font-mono">${formatValue('unemployment', unemp)}</td>
                  <td class="text-right font-mono ${infl > 10 ? 'text-danger' : ''}">${formatValue('inflation', infl)}</td>
                  <td class="text-right font-mono">${formatValue('life_expectancy', life)}</td>
                  <td class="text-right font-mono">${formatValue('median_age', age)}</td>
                  <td class="text-right font-mono">${formatValue('urban_population_pct', urb)}</td>
                  <td class="text-center">
                    <a href="#/country/${c.id}" class="btn-table-action" title="View ${c.name} profile">View →</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Event listeners
    const searchInput = container.querySelector('#overview-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        state.searchQuery = e.target.value;
        renderOverview(container, state);
      };
      // Keep focus and caret position if re-rendering
      if (document.activeElement && document.activeElement.id === 'overview-search') {
        searchInput.focus();
        const len = searchInput.value.length;
        searchInput.setSelectionRange(len, len);
      }
    }

    const clearBtn = container.querySelector('#clear-search');
    if (clearBtn) {
      clearBtn.onclick = () => {
        state.searchQuery = '';
        renderOverview(container, state);
      };
    }

    const regionSelect = container.querySelector('#region-filter');
    if (regionSelect) {
      regionSelect.onchange = (e) => {
        state.selectedRegion = e.target.value;
        renderOverview(container, state);
      };
    }

    // Sort column headers
    container.querySelectorAll('th.sortable').forEach((th) => {
      th.onclick = () => {
        const field = th.dataset.sort;
        if (state.sortField === field) {
          state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortField = field;
          state.sortOrder = field === 'name' || field === 'region' ? 'asc' : 'desc';
        }
        renderOverview(container, state);
      };
    });

    // Row clicks
    container.querySelectorAll('.country-row').forEach((row) => {
      row.onclick = (e) => {
        // Do not trigger row navigation if user clicked on direct link or button
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
        const id = row.dataset.id;
        window.location.hash = `#/country/${id}`;
      };
    });
  }

  /**
   * Renders Country Detail View
   */
  function renderCountryDetail(container, countryId, selectedIndicatorId = 'gdp') {
    const country = getCountry(countryId) || COUNTRIES[0];
    const currentInd = getIndicator(selectedIndicatorId) || INDICATORS[0];

    // Compute key statistics
    const latestYearIdx = YEARS.length - 1;
    const baseYearIdx = 0;

    container.innerHTML = `
      <div class="view-header country-detail-header">
        <div>
          <div class="breadcrumb">
            <a href="#/">← All Nations</a>
            <span class="bc-sep">/</span>
            <span>${country.region}</span>
            <span class="bc-sep">/</span>
            <span class="bc-current">${country.name}</span>
          </div>
          <div class="country-title-row">
            <span class="country-large-flag" style="background:${country.color}; color:#fff;">${country.code}</span>
            <div>
              <h1 class="view-title">${country.name}</h1>
              <div class="country-meta-tags">
                <span class="meta-tag">Capital: <strong>${country.capital}</strong></span>
                <span class="meta-tag">Region: <strong>${country.subregion}</strong></span>
                <span class="meta-tag">Currency: <strong>${country.currency}</strong></span>
              </div>
            </div>
          </div>
        </div>
        <div class="view-actions">
          <a href="#/compare?countries=${country.id}" class="btn btn-secondary">
            ⚖️ Compare ${country.name}
          </a>
        </div>
      </div>

      <!-- Stat Cards Grid (8 indicators) -->
      <div class="stat-cards-grid">
        ${INDICATORS.map((ind) => {
          const val = country.series[ind.id][latestYearIdx];
          const baseVal = country.series[ind.id][baseYearIdx];
          const prevVal = country.series[ind.id][latestYearIdx - 1];
          const avgVal = GLOBAL_AVERAGES[ind.id][latestYearIdx];

          // 10-year percent change
          let deltaPct = 0;
          if (baseVal !== 0) {
            deltaPct = ((val - baseVal) / Math.abs(baseVal)) * 100;
          }

          const isSelected = ind.id === currentInd.id;
          const deltaClass = deltaPct >= 0 ? 'delta-pos' : 'delta-neg';
          const deltaSign = deltaPct >= 0 ? '+' : '';

          return `
            <div class="stat-card ${isSelected ? 'active-stat-card' : ''}" data-indicator="${ind.id}">
              <div class="stat-card-header">
                <span class="stat-card-title">${ind.name}</span>
                <span class="stat-card-badge">${ind.category}</span>
              </div>
              <div class="stat-card-value">${ind.format(val)}</div>
              <div class="stat-card-footer">
                <span class="stat-delta ${deltaClass}">${deltaSign}${deltaPct.toFixed(1)}%</span>
                <span class="stat-sub">10-yr change (vs 2015)</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Interactive Chart Section -->
      <div class="chart-section-card">
        <div class="chart-card-header">
          <div>
            <h2 class="chart-card-title">${currentInd.name} Trend (2015–2024)</h2>
            <p class="chart-card-desc">${currentInd.description}</p>
          </div>
          <div class="indicator-switcher">
            <label class="filter-label">Indicator:</label>
            <select id="country-indicator-select" class="select-control">
              ${INDICATORS.map((ind) => `
                <option value="${ind.id}" ${ind.id === currentInd.id ? 'selected' : ''}>${ind.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="canvas-wrapper">
          <canvas id="country-line-chart" height="340"></canvas>
        </div>

        <div class="chart-callout-strip">
          <div class="callout-item">
            <span class="callout-lbl">2015 Baseline:</span>
            <span class="callout-val">${currentInd.format(country.series[currentInd.id][0])}</span>
          </div>
          <div class="callout-item">
            <span class="callout-lbl">2024 Current:</span>
            <span class="callout-val font-semibold">${currentInd.format(country.series[currentInd.id][latestYearIdx])}</span>
          </div>
          <div class="callout-item">
            <span class="callout-lbl">16-Nation Average:</span>
            <span class="callout-val">${currentInd.format(GLOBAL_AVERAGES[currentInd.id][latestYearIdx])}</span>
          </div>
          <div class="callout-item">
            <span class="callout-lbl">10-Yr Relative Growth:</span>
            <span class="callout-val">${(((country.series[currentInd.id][latestYearIdx] - country.series[currentInd.id][0]) / country.series[currentInd.id][0]) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <!-- Benchmark Bar Chart -->
      <div class="chart-section-card">
        <div class="chart-card-header">
          <div>
            <h2 class="chart-card-title">Comparative Ranking (${currentInd.name})</h2>
            <p class="chart-card-desc">Where ${country.name} stands against the other 15 peer nations in 2024.</p>
          </div>
        </div>
        <div class="canvas-wrapper" style="height: 380px;">
          <canvas id="country-rank-chart" height="380"></canvas>
        </div>
      </div>

      <!-- Annual Data Matrix Table -->
      <div class="table-card">
        <div class="table-card-header">
          <h2 class="table-card-title">Historical Time-Series Data (${country.name})</h2>
          <span class="table-card-sub">Annual records 2015–2024 for all 8 national indicators</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Indicator</th>
                ${YEARS.map((y) => `<th class="text-right">${y}</th>`).join('')}
                <th class="text-right">10-Yr Δ</th>
              </tr>
            </thead>
            <tbody>
              ${INDICATORS.map((ind) => {
                const s = country.series[ind.id];
                const delta = ((s[latestYearIdx] - s[0]) / Math.abs(s[0])) * 100;
                return `
                  <tr class="${ind.id === currentInd.id ? 'highlight-row' : ''}">
                    <td class="font-semibold">${ind.name} <span class="unit-badge">(${ind.unit})</span></td>
                    ${s.map((val) => `<td class="text-right font-mono">${ind.format(val)}</td>`).join('')}
                    <td class="text-right font-mono ${delta >= 0 ? 'text-success' : 'text-danger'} font-semibold">
                      ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render Line Chart
    const lineCanvas = container.querySelector('#country-line-chart');
    if (lineCanvas) {
      const seriesList = [
        {
          label: country.name,
          color: country.color,
          data: country.series[currentInd.id],
          dashed: false
        },
        {
          label: '16-Nation Average',
          color: THEME.avgColor,
          data: GLOBAL_AVERAGES[currentInd.id],
          dashed: true
        }
      ];
      drawLineChart(lineCanvas, seriesList, currentInd);
    }

    // Render Rank Bar Chart
    const rankCanvas = container.querySelector('#country-rank-chart');
    if (rankCanvas) {
      drawRankBarChart(rankCanvas, country.id, currentInd);
    }

    // Event listeners: Stat card click switches indicator
    container.querySelectorAll('.stat-card').forEach((card) => {
      card.onclick = () => {
        const indId = card.dataset.indicator;
        renderCountryDetail(container, country.id, indId);
      };
    });

    const indSelect = container.querySelector('#country-indicator-select');
    if (indSelect) {
      indSelect.onchange = (e) => {
        renderCountryDetail(container, country.id, e.target.value);
      };
    }
  }

  /**
   * Renders Compare View
   */
  function renderCompare(container, selectedIds = ['USA', 'CHN', 'DEU'], selectedIndicatorId = 'gdp') {
    if (!selectedIds || selectedIds.length === 0) {
      selectedIds = ['USA', 'CHN', 'DEU'];
    }

    const currentInd = getIndicator(selectedIndicatorId) || INDICATORS[0];
    const selectedCountries = selectedIds.map(getCountry).filter(Boolean);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <div class="breadcrumb">
            <a href="#/">← All Nations</a>
            <span class="bc-sep">/</span>
            <span class="bc-current">Multi-Country Comparison</span>
          </div>
          <h1 class="view-title">Cross-National Comparative Analytics</h1>
          <p class="view-subtitle">Select between 2 and 4 nations to benchmark historical trends, compare key ratios, and assess relative progress.</p>
        </div>
      </div>

      <!-- Selector Panel -->
      <div class="compare-selector-card">
        <div class="compare-selector-header">
          <span class="selector-title">Select Nations to Compare (Pick 2 to 4):</span>
          <span class="selector-count font-semibold">${selectedCountries.length} / 4 Selected</span>
        </div>

        <div class="country-pill-grid">
          ${COUNTRIES.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return `
              <button class="country-pill ${isSelected ? 'pill-active' : ''}" data-id="${c.id}" style="${isSelected ? `background:${c.color}; color:#fff; border-color:${c.color};` : ''}">
                <span class="pill-code">${c.code}</span>
                <span class="pill-name">${c.name}</span>
                <span class="pill-check">${isSelected ? '✓' : '+'}</span>
              </button>
            `;
          }).join('')}
        </div>

        <div class="compare-ind-bar">
          <label class="filter-label">Comparison Indicator:</label>
          <div class="ind-pill-row">
            ${INDICATORS.map((ind) => `
              <button class="ind-btn ${ind.id === currentInd.id ? 'ind-btn-active' : ''}" data-indicator="${ind.id}">
                ${ind.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Overlaid Multi-Line Chart -->
      <div class="chart-section-card">
        <div class="chart-card-header">
          <div>
            <h2 class="chart-card-title">${currentInd.name} Comparison (2015–2024)</h2>
            <p class="chart-card-desc">Overlaid multi-series trajectory across selected nations.</p>
          </div>
        </div>

        <div class="canvas-wrapper">
          <canvas id="compare-line-chart" height="360"></canvas>
        </div>
      </div>

      <!-- Side-by-Side Comparison Matrix -->
      <div class="table-card">
        <div class="table-card-header">
          <h2 class="table-card-title">Side-by-Side Current Snapshot (2024)</h2>
          <span class="table-card-sub">Direct metric comparison for all 8 indicators</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Indicator</th>
                ${selectedCountries.map((c) => `
                  <th class="text-right" style="border-top: 3px solid ${c.color};">
                    <span class="country-pill-small" style="background:${c.color}22; color:${c.color};">${c.code}</span>
                    ${c.name}
                  </th>
                `).join('')}
                <th class="text-right">16-Nation Avg</th>
              </tr>
            </thead>
            <tbody>
              ${INDICATORS.map((ind) => {
                const avgVal = GLOBAL_AVERAGES[ind.id][YEARS.length - 1];
                return `
                  <tr class="${ind.id === currentInd.id ? 'highlight-row' : ''}">
                    <td class="font-semibold">${ind.name} <span class="unit-badge">(${ind.unit})</span></td>
                    ${selectedCountries.map((c) => {
                      const val = c.series[ind.id][YEARS.length - 1];
                      return `<td class="text-right font-mono font-semibold">${ind.format(val)}</td>`;
                    }).join('')}
                    <td class="text-right font-mono text-muted">${ind.format(avgVal)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Yearly History Comparison Table for Selected Indicator -->
      <div class="table-card">
        <div class="table-card-header">
          <h2 class="table-card-title">Annual Historical Breakdown: ${currentInd.name}</h2>
          <span class="table-card-sub">Year-by-year 2015–2024 records for selected nations</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Year</th>
                ${selectedCountries.map((c) => `
                  <th class="text-right">
                    <span class="legend-dot" style="background:${c.color};"></span>
                    ${c.name}
                  </th>
                `).join('')}
                <th class="text-right">16-Nation Avg</th>
              </tr>
            </thead>
            <tbody>
              ${YEARS.map((y, yIdx) => {
                const avgVal = GLOBAL_AVERAGES[currentInd.id][yIdx];
                return `
                  <tr>
                    <td class="font-semibold font-mono">${y}</td>
                    ${selectedCountries.map((c) => {
                      const val = c.series[currentInd.id][yIdx];
                      return `<td class="text-right font-mono">${currentInd.format(val)}</td>`;
                    }).join('')}
                    <td class="text-right font-mono text-muted">${currentInd.format(avgVal)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render Overlaid Line Chart
    const compareCanvas = container.querySelector('#compare-line-chart');
    if (compareCanvas) {
      const seriesList = selectedCountries.map((c) => ({
        label: c.name,
        color: c.color,
        data: c.series[currentInd.id],
        dashed: false
      }));

      // Add average line
      seriesList.push({
        label: '16-Nation Average',
        color: THEME.avgColor,
        data: GLOBAL_AVERAGES[currentInd.id],
        dashed: true
      });

      drawLineChart(compareCanvas, seriesList, currentInd);
    }

    // Country pill click handler
    container.querySelectorAll('.country-pill').forEach((pill) => {
      pill.onclick = () => {
        const id = pill.dataset.id;
        let nextSelected = [...selectedIds];
        if (nextSelected.includes(id)) {
          if (nextSelected.length <= 2) {
            alert('Please keep at least 2 nations selected for comparison.');
            return;
          }
          nextSelected = nextSelected.filter((x) => x !== id);
        } else {
          if (nextSelected.length >= 4) {
            alert('You can compare a maximum of 4 nations simultaneously.');
            return;
          }
          nextSelected.push(id);
        }
        window.location.hash = `#/compare?countries=${nextSelected.join(',')}&indicator=${currentInd.id}`;
      };
    });

    // Indicator button click handler
    container.querySelectorAll('.ind-btn').forEach((btn) => {
      btn.onclick = () => {
        const indId = btn.dataset.indicator;
        window.location.hash = `#/compare?countries=${selectedIds.join(',')}&indicator=${indId}`;
      };
    });
  }

  // Export to window
  root.StatViews = {
    renderOverview,
    renderCountryDetail,
    renderCompare,
    drawLineChart,
    drawRankBarChart
  };
})(typeof window !== 'undefined' ? window : globalThis);
