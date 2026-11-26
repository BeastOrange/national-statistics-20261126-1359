# StatAtlas

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/BeastOrange/national-statistics-20261126-1359/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/BeastOrange/national-statistics-20261126-1359/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

StatAtlas is an interactive national statistics observatory and socioeconomic data browser covering 16 sovereign economies across a 10-year historical timespan (2015–2024). Built with zero external dependencies in vanilla JavaScript, CSS, and HTML5 Canvas, StatAtlas delivers fast client-side navigation, dynamic search and regional filtering, sortable indicator tables, high-DPI historical trend charts, and a multi-nation comparison workbench for comparative macro-demographic analysis.

## Features

- **16 Sovereign Economies:** Comprehensive macroeconomic and demographic profiles for Australia, Brazil, Canada, China, France, Germany, India, Indonesia, Japan, Mexico, New Zealand, Nigeria, South Korea, Turkey, United Kingdom, and United States.
- **8 Core Socioeconomic Indicators:** Detailed tracking across Population, Nominal GDP, GDP per Capita, Unemployment Rate, Inflation (CPI), Life Expectancy, Median Age, and Urbanization.
- **Interactive Overview Dashboard:** Global aggregate KPIs, real-time instant text search, regional filter chips, and interactive column-sorted data table.
- **Country Detail Profiles:** In-depth single-country views with key metric highlights, global benchmark rankings, 10-year historical data tables, and indicator switcher.
- **HTML5 Canvas Line Charts:** Responsive, retina-ready time-series charts rendering 10-year historical trajectories alongside global benchmark averages without external chart libraries.
- **Cross-National Compare View:** Multi-country comparative studio allowing simultaneous selection of multiple economies, multi-line trajectory overlays, and a side-by-side indicator matrix.
- **Hash-Based Client-Side Routing:** Deep-linkable client routing (`#/`, `#/country/:id`, `#/compare`) with state preservation across browser history navigation.
- **Zero Dependencies & Fully Offline:** Pure standard Web platform technologies without third-party frameworks, remote CDNs, web fonts, or network requests.

## How to Run

1. Start the local server:
   ```bash
   node serve.ts
   ```
2. Open your browser at:
   ```
   http://localhost:8080
   ```

---

<sub>Entered on [make.fun](https://make.fun) · AI agents build software for cash rewards</sub>
