/**
 * StatAtlas — National Statistics Dataset
 * Covers 16 nations across 8 core socioeconomic indicators from 2015 to 2024.
 * Figures are illustrative approximations compiled from public World Bank, IMF, and UN-style statistical releases.
 */

(function (root) {
  'use strict';

  const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  const INDICATORS = [
    {
      id: 'population',
      name: 'Population',
      category: 'Demographics',
      unit: 'people',
      description: 'Total resident population regardless of legal status or citizenship.',
      format: (val) => {
        if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
        if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
        if (val >= 1e3) return (val / 1e3).toFixed(1) + 'k';
        return val.toLocaleString();
      },
      formatFull: (val) => val.toLocaleString() + ' residents',
      chartFormat: (val) => {
        if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B';
        if (val >= 1e6) return (val / 1e6).toFixed(0) + 'M';
        return val.toLocaleString();
      }
    },
    {
      id: 'gdp',
      name: 'GDP (Nominal)',
      category: 'Economy',
      unit: 'USD',
      description: 'Gross Domestic Product in current nominal United States dollars.',
      format: (val) => {
        if (val >= 1e12) return '$' + (val / 1e12).toFixed(2) + 'T';
        if (val >= 1e9) return '$' + (val / 1e9).toFixed(1) + 'B';
        return '$' + val.toLocaleString();
      },
      formatFull: (val) => '$' + val.toLocaleString() + ' USD',
      chartFormat: (val) => {
        if (val >= 1e12) return '$' + (val / 1e12).toFixed(1) + 'T';
        if (val >= 1e9) return '$' + (val / 1e9).toFixed(0) + 'B';
        return '$' + val;
      }
    },
    {
      id: 'gdp_per_capita',
      name: 'GDP per Capita',
      category: 'Economy',
      unit: 'USD',
      description: 'Gross Domestic Product divided by midyear total population.',
      format: (val) => '$' + Math.round(val).toLocaleString(),
      formatFull: (val) => '$' + Math.round(val).toLocaleString() + ' USD / person',
      chartFormat: (val) => '$' + (val >= 1e3 ? Math.round(val / 1e3) + 'k' : Math.round(val))
    },
    {
      id: 'unemployment',
      name: 'Unemployment Rate',
      category: 'Labor',
      unit: '%',
      description: 'Share of labor force that is without work but available and seeking employment.',
      format: (val) => val.toFixed(1) + '%',
      formatFull: (val) => val.toFixed(1) + '% of labor force',
      chartFormat: (val) => val.toFixed(1) + '%'
    },
    {
      id: 'inflation',
      name: 'Inflation Rate (CPI)',
      category: 'Economy',
      unit: '%',
      description: 'Annual percentage change in the cost to the average consumer of acquiring a basket of goods and services.',
      format: (val) => val.toFixed(1) + '%',
      formatFull: (val) => (val > 0 ? '+' : '') + val.toFixed(1) + '% annual CPI change',
      chartFormat: (val) => val.toFixed(1) + '%'
    },
    {
      id: 'life_expectancy',
      name: 'Life Expectancy',
      category: 'Health',
      unit: 'years',
      description: 'Number of years a newborn infant would live if prevailing patterns of mortality at the time of birth were to remain the same throughout its life.',
      format: (val) => val.toFixed(1) + ' yrs',
      formatFull: (val) => val.toFixed(1) + ' years at birth',
      chartFormat: (val) => val.toFixed(1) + 'y'
    },
    {
      id: 'median_age',
      name: 'Median Age',
      category: 'Demographics',
      unit: 'years',
      description: 'The age that divides a population into two numerically equal groups.',
      format: (val) => val.toFixed(1) + ' yrs',
      formatFull: (val) => val.toFixed(1) + ' years',
      chartFormat: (val) => val.toFixed(1) + 'y'
    },
    {
      id: 'urban_population_pct',
      name: 'Urban Population',
      category: 'Society',
      unit: '%',
      description: 'People living in urban areas as defined by national statistical offices.',
      format: (val) => val.toFixed(1) + '%',
      formatFull: (val) => val.toFixed(1) + '% of total population',
      chartFormat: (val) => val.toFixed(0) + '%'
    }
  ];

  const COUNTRIES = [
    {
      id: 'USA',
      code: 'US',
      name: 'United States',
      region: 'Americas',
      subregion: 'Northern America',
      capital: 'Washington, D.C.',
      currency: 'USD ($)',
      color: '#2563eb',
      series: {
        population: [320740000, 323070000, 325150000, 326840000, 328330000, 331510000, 332030000, 333290000, 334910000, 341810000],
        gdp: [18238e9, 18745e9, 19543e9, 20612e9, 21433e9, 21060e9, 23315e9, 25440e9, 27360e9, 28780e9],
        gdp_per_capita: [56862, 58021, 60105, 63065, 65279, 63528, 70220, 76329, 81694, 84199],
        unemployment: [5.3, 4.9, 4.4, 3.9, 3.7, 8.1, 5.4, 3.6, 3.6, 4.1],
        inflation: [0.1, 1.3, 2.1, 2.4, 1.8, 1.2, 4.7, 8.0, 4.1, 2.9],
        life_expectancy: [78.7, 78.5, 78.5, 78.6, 78.8, 77.0, 76.4, 77.5, 78.1, 78.4],
        median_age: [37.6, 37.8, 37.9, 38.1, 38.3, 38.5, 38.6, 38.7, 38.8, 38.9],
        urban_population_pct: [81.7, 81.9, 82.1, 82.3, 82.5, 82.7, 82.9, 83.1, 83.3, 83.5]
      }
    },
    {
      id: 'CHN',
      code: 'CN',
      name: 'China',
      region: 'Asia',
      subregion: 'Eastern Asia',
      capital: 'Beijing',
      currency: 'CNY (¥)',
      color: '#dc2626',
      series: {
        population: [1397000000, 1403500000, 1410270000, 1417070000, 1421860000, 1424930000, 1425890000, 1425670000, 1422000000, 1409670000],
        gdp: [11062e9, 11233e9, 12310e9, 13895e9, 14280e9, 14688e9, 17734e9, 17963e9, 17794e9, 18530e9],
        gdp_per_capita: [7918, 8004, 8729, 9805, 10043, 10308, 12437, 12600, 12513, 13145],
        unemployment: [4.6, 4.5, 4.4, 4.3, 4.6, 5.0, 4.8, 4.9, 5.2, 5.1],
        inflation: [1.4, 2.0, 1.6, 2.1, 2.9, 2.5, 0.9, 2.0, 0.2, 0.4],
        life_expectancy: [76.4, 76.7, 77.0, 77.3, 77.6, 77.9, 78.1, 78.3, 78.5, 78.6],
        median_age: [36.7, 37.0, 37.4, 37.7, 38.0, 38.4, 38.8, 39.2, 39.5, 39.8],
        urban_population_pct: [56.1, 57.3, 58.5, 59.7, 60.8, 62.0, 63.1, 64.2, 65.2, 66.2]
      }
    },
    {
      id: 'JPN',
      code: 'JP',
      name: 'Japan',
      region: 'Asia',
      subregion: 'Eastern Asia',
      capital: 'Tokyo',
      currency: 'JPY (¥)',
      color: '#db2777',
      series: {
        population: [127140000, 126990000, 126790000, 126530000, 126260000, 126150000, 125680000, 125120000, 124500000, 123990000],
        gdp: [4445e9, 5004e9, 4931e9, 5038e9, 5120e9, 5049e9, 5035e9, 4260e9, 4213e9, 4110e9],
        gdp_per_capita: [34961, 39405, 38891, 39817, 40551, 40024, 40062, 34047, 33839, 33150],
        unemployment: [3.4, 3.1, 2.8, 2.4, 2.4, 2.8, 2.8, 2.6, 2.6, 2.5],
        inflation: [0.8, -0.1, 0.5, 1.0, 0.5, 0.0, -0.2, 2.5, 3.2, 2.5],
        life_expectancy: [83.9, 84.1, 84.2, 84.3, 84.4, 84.6, 84.4, 84.5, 84.6, 84.7],
        median_age: [46.5, 46.8, 47.1, 47.4, 47.7, 48.0, 48.3, 48.6, 48.9, 49.2],
        urban_population_pct: [91.4, 91.5, 91.6, 91.7, 91.8, 91.8, 91.9, 91.9, 92.0, 92.0]
      }
    },
    {
      id: 'DEU',
      code: 'DE',
      name: 'Germany',
      region: 'Europe',
      subregion: 'Western Europe',
      capital: 'Berlin',
      currency: 'EUR (€)',
      color: '#ea580c',
      series: {
        population: [81687000, 82349000, 82657000, 82906000, 83093000, 83161000, 83200000, 83798000, 84482000, 84607000],
        gdp: [3358e9, 3467e9, 3666e9, 3977e9, 3888e9, 3889e9, 4260e9, 4080e9, 4456e9, 4590e9],
        gdp_per_capita: [41108, 42101, 44352, 47970, 46791, 46765, 51202, 48689, 52745, 54251],
        unemployment: [4.6, 4.1, 3.8, 3.4, 3.1, 3.8, 3.6, 3.1, 3.1, 3.3],
        inflation: [0.5, 0.5, 1.5, 1.7, 1.4, 0.5, 3.1, 8.7, 5.9, 2.4],
        life_expectancy: [80.6, 81.0, 81.1, 81.0, 81.3, 81.0, 80.8, 80.7, 81.0, 81.2],
        median_age: [45.6, 45.8, 45.9, 46.1, 46.2, 46.4, 46.5, 46.6, 46.7, 46.8],
        urban_population_pct: [77.0, 77.1, 77.2, 77.3, 77.4, 77.5, 77.6, 77.7, 77.7, 77.8]
      }
    },
    {
      id: 'GBR',
      code: 'GB',
      name: 'United Kingdom',
      region: 'Europe',
      subregion: 'Northern Europe',
      capital: 'London',
      currency: 'GBP (£)',
      color: '#0284c7',
      series: {
        population: [65129000, 65612000, 66059000, 66436000, 66836000, 67081000, 67026000, 67647000, 67961000, 68350000],
        gdp: [2935e9, 2699e9, 2683e9, 2878e9, 2880e9, 2709e9, 3131e9, 3089e9, 3340e9, 3495e9],
        gdp_per_capita: [45064, 41136, 40615, 43320, 43091, 40384, 46713, 45663, 49146, 51134],
        unemployment: [5.3, 4.8, 4.3, 4.0, 3.8, 4.6, 4.5, 3.7, 4.0, 4.2],
        inflation: [0.0, 0.7, 2.7, 2.5, 1.8, 0.9, 2.6, 9.1, 7.3, 2.5],
        life_expectancy: [81.0, 81.2, 81.3, 81.3, 81.4, 80.4, 80.7, 81.1, 81.3, 81.5],
        median_age: [40.0, 40.1, 40.2, 40.3, 40.4, 40.5, 40.6, 40.7, 40.8, 40.9],
        urban_population_pct: [82.6, 82.8, 83.1, 83.4, 83.7, 83.9, 84.2, 84.4, 84.6, 84.8]
      }
    },
    {
      id: 'FRA',
      code: 'FR',
      name: 'France',
      region: 'Europe',
      subregion: 'Western Europe',
      capital: 'Paris',
      currency: 'EUR (€)',
      color: '#4f46e5',
      series: {
        population: [66548000, 66724000, 66918000, 67158000, 67388000, 67571000, 67749000, 67971000, 68170000, 68373000],
        gdp: [2439e9, 2473e9, 2594e9, 2792e9, 2729e9, 2639e9, 2959e9, 2779e9, 3031e9, 3130e9],
        gdp_per_capita: [36650, 37063, 38764, 41574, 40497, 39055, 43676, 40885, 44462, 45778],
        unemployment: [10.4, 10.1, 9.4, 9.0, 8.4, 8.0, 7.9, 7.3, 7.3, 7.4],
        inflation: [0.0, 0.2, 1.0, 1.9, 1.1, 0.5, 1.6, 5.2, 4.9, 2.3],
        life_expectancy: [82.3, 82.3, 82.5, 82.7, 82.8, 82.2, 82.3, 82.4, 82.7, 82.9],
        median_age: [41.0, 41.2, 41.4, 41.5, 41.7, 41.8, 42.0, 42.1, 42.3, 42.4],
        urban_population_pct: [79.6, 79.9, 80.2, 80.4, 80.7, 81.0, 81.3, 81.5, 81.8, 82.0]
      }
    },
    {
      id: 'IND',
      code: 'IN',
      name: 'India',
      region: 'Asia',
      subregion: 'Southern Asia',
      capital: 'New Delhi',
      currency: 'INR (₹)',
      color: '#d97706',
      series: {
        population: [1322870000, 1338640000, 1354190000, 1369000000, 1383110000, 1396390000, 1407560000, 1417170000, 1428630000, 1441720000],
        gdp: [2104e9, 2295e9, 2651e9, 2703e9, 2836e9, 2671e9, 3160e9, 3385e9, 3550e9, 3937e9],
        gdp_per_capita: [1590, 1714, 1958, 1974, 2050, 1913, 2245, 2389, 2485, 2731],
        unemployment: [5.4, 5.4, 5.4, 5.3, 5.3, 8.0, 6.0, 4.8, 4.2, 4.2],
        inflation: [4.9, 4.5, 3.6, 3.4, 4.8, 6.2, 5.5, 6.7, 5.7, 5.1],
        life_expectancy: [68.6, 69.0, 69.4, 69.7, 70.0, 67.2, 67.2, 68.3, 70.4, 71.1],
        median_age: [26.8, 27.0, 27.2, 27.5, 27.7, 28.0, 28.2, 28.4, 28.6, 28.8],
        urban_population_pct: [32.8, 33.2, 33.6, 34.0, 34.5, 34.9, 35.4, 35.9, 36.4, 36.9]
      }
    },
    {
      id: 'BRA',
      code: 'BR',
      name: 'Brazil',
      region: 'Americas',
      subregion: 'Latin America and the Caribbean',
      capital: 'Brasília',
      currency: 'BRL (R$)',
      color: '#16a34a',
      series: {
        population: [204470000, 206160000, 207830000, 209470000, 211050000, 213196000, 214326000, 215313000, 216422000, 217637000],
        gdp: [1802e9, 1796e9, 2064e9, 1917e9, 1878e9, 1449e9, 1609e9, 1920e9, 2174e9, 2331e9],
        gdp_per_capita: [8813, 8712, 9931, 9152, 8898, 6797, 7507, 8917, 10045, 10710],
        unemployment: [8.4, 11.6, 12.8, 12.3, 11.9, 13.7, 13.2, 9.3, 7.8, 7.5],
        inflation: [9.0, 8.7, 3.4, 3.7, 3.7, 3.2, 8.3, 9.3, 4.6, 4.2],
        life_expectancy: [74.3, 74.5, 74.8, 75.1, 75.3, 72.8, 72.8, 74.2, 75.3, 75.6],
        median_age: [31.4, 31.7, 32.0, 32.3, 32.6, 32.9, 33.2, 33.5, 33.8, 34.1],
        urban_population_pct: [85.8, 86.0, 86.3, 86.6, 86.8, 87.1, 87.3, 87.6, 87.8, 88.0]
      }
    },
    {
      id: 'CAN',
      code: 'CA',
      name: 'Canada',
      region: 'Americas',
      subregion: 'Northern America',
      capital: 'Ottawa',
      currency: 'CAD ($)',
      color: '#b91c1c',
      series: {
        population: [35703000, 36111000, 36545000, 37072000, 37601000, 38037000, 38246000, 38939000, 40098000, 40850000],
        gdp: [1556e9, 1528e9, 1650e9, 1725e9, 1743e9, 1647e9, 2001e9, 2138e9, 2140e9, 2242e9],
        gdp_per_capita: [43582, 42314, 45155, 46531, 46355, 43300, 52319, 54906, 53370, 54884],
        unemployment: [6.9, 7.0, 6.3, 5.8, 5.7, 9.5, 7.5, 5.3, 5.4, 6.2],
        inflation: [1.1, 1.4, 1.6, 2.3, 1.9, 0.7, 3.4, 6.8, 3.9, 2.4],
        life_expectancy: [81.9, 82.0, 81.9, 82.0, 82.2, 81.7, 81.6, 81.3, 81.8, 82.2],
        median_age: [40.5, 40.6, 40.7, 40.8, 40.9, 41.0, 41.1, 41.2, 41.3, 41.4],
        urban_population_pct: [81.2, 81.3, 81.4, 81.5, 81.6, 81.6, 81.7, 81.8, 81.9, 82.0]
      }
    },
    {
      id: 'AUS',
      code: 'AU',
      name: 'Australia',
      region: 'Oceania',
      subregion: 'Australia and New Zealand',
      capital: 'Canberra',
      currency: 'AUD ($)',
      color: '#059669',
      series: {
        population: [23816000, 24191000, 24602000, 24982000, 25366000, 25655000, 25688000, 26006000, 26639000, 27150000],
        gdp: [1351e9, 1210e9, 1329e9, 1433e9, 1397e9, 1327e9, 1553e9, 1693e9, 1723e9, 1795e9],
        gdp_per_capita: [56726, 50019, 54020, 57361, 55074, 51725, 60456, 65100, 64679, 66114],
        unemployment: [6.1, 5.7, 5.6, 5.3, 5.2, 6.5, 5.1, 3.7, 3.7, 4.0],
        inflation: [1.5, 1.3, 1.9, 1.9, 1.6, 0.8, 2.9, 6.6, 5.6, 3.6],
        life_expectancy: [82.4, 82.5, 82.5, 82.8, 82.9, 83.2, 83.3, 83.2, 83.4, 83.6],
        median_age: [37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38.0],
        urban_population_pct: [85.9, 86.0, 86.1, 86.2, 86.3, 86.4, 86.5, 86.6, 86.7, 86.8]
      }
    },
    {
      id: 'KOR',
      code: 'KR',
      name: 'South Korea',
      region: 'Asia',
      subregion: 'Eastern Asia',
      capital: 'Seoul',
      currency: 'KRW (₩)',
      color: '#0891b2',
      series: {
        population: [51015000, 51218000, 51362000, 51585000, 51765000, 51836000, 51745000, 51670000, 51713000, 51680000],
        gdp: [1466e9, 1500e9, 1624e9, 1725e9, 1651e9, 1644e9, 1818e9, 1674e9, 1713e9, 1761e9],
        gdp_per_capita: [28737, 29287, 31619, 33440, 31894, 31715, 35134, 32402, 33125, 34075],
        unemployment: [3.6, 3.7, 3.7, 3.8, 3.8, 3.9, 3.7, 2.9, 2.7, 2.7],
        inflation: [0.7, 1.0, 1.9, 1.5, 0.4, 0.5, 2.5, 5.1, 3.6, 2.6],
        life_expectancy: [82.1, 82.3, 82.7, 82.7, 83.2, 83.4, 83.5, 83.6, 83.7, 83.8],
        median_age: [40.8, 41.3, 41.8, 42.4, 42.9, 43.5, 44.0, 44.5, 45.0, 45.5],
        urban_population_pct: [81.3, 81.3, 81.4, 81.4, 81.4, 81.4, 81.4, 81.4, 81.5, 81.5]
      }
    },
    {
      id: 'MEX',
      code: 'MX',
      name: 'Mexico',
      region: 'Americas',
      subregion: 'Latin America and the Caribbean',
      capital: 'Mexico City',
      currency: 'MXN ($)',
      color: '#15803d',
      series: {
        population: [121078000, 122536000, 123961000, 125328000, 126650000, 127792000, 128456000, 129151000, 129876000, 130600000],
        gdp: [1171e9, 1078e9, 1158e9, 1222e9, 1269e9, 1090e9, 1273e9, 1414e9, 1789e9, 1850e9],
        gdp_per_capita: [9671, 8797, 9342, 9750, 10020, 8529, 9910, 10948, 13775, 14165],
        unemployment: [4.3, 3.9, 3.4, 3.3, 3.5, 4.4, 4.1, 3.3, 2.8, 2.7],
        inflation: [2.7, 2.8, 6.0, 4.9, 3.6, 3.4, 5.7, 7.9, 5.5, 4.7],
        life_expectancy: [74.9, 74.8, 74.9, 75.0, 75.1, 70.1, 70.2, 72.8, 74.8, 75.3],
        median_age: [27.5, 27.7, 28.0, 28.3, 28.6, 28.9, 29.2, 29.5, 29.8, 30.1],
        urban_population_pct: [79.3, 79.6, 79.9, 80.2, 80.4, 80.7, 81.0, 81.2, 81.4, 81.6]
      }
    },
    {
      id: 'IDN',
      code: 'ID',
      name: 'Indonesia',
      region: 'Asia',
      subregion: 'South-Eastern Asia',
      capital: 'Jakarta',
      currency: 'IDR (Rp)',
      color: '#c026d3',
      series: {
        population: [258383000, 261556000, 264651000, 267671000, 270626000, 273524000, 275501000, 277534000, 279581000, 281600000],
        gdp: [861e9, 932e9, 1016e9, 1042e9, 1119e9, 1059e9, 1186e9, 1319e9, 1371e9, 1420e9],
        gdp_per_capita: [3332, 3563, 3839, 3893, 4135, 3872, 4305, 4753, 4904, 5043],
        unemployment: [6.2, 5.6, 5.5, 5.3, 5.2, 7.1, 6.5, 5.9, 5.3, 5.2],
        inflation: [6.4, 3.5, 3.8, 3.2, 2.8, 2.0, 1.6, 4.2, 3.7, 2.6],
        life_expectancy: [69.5, 69.8, 70.0, 70.3, 70.5, 68.8, 67.6, 68.3, 70.6, 71.3],
        median_age: [28.2, 28.5, 28.7, 29.0, 29.2, 29.5, 29.7, 30.0, 30.2, 30.5],
        urban_population_pct: [53.7, 54.3, 54.9, 55.4, 56.0, 56.6, 57.2, 57.8, 58.4, 59.0]
      }
    },
    {
      id: 'TUR',
      code: 'TR',
      name: 'Turkey',
      region: 'Europe',
      subregion: 'Southern Europe',
      capital: 'Ankara',
      currency: 'TRY (₺)',
      color: '#e11d48',
      series: {
        population: [78530000, 79815000, 81102000, 82320000, 83430000, 84135000, 84775000, 85280000, 85372000, 85816000],
        gdp: [864e9, 869e9, 859e9, 778e9, 761e9, 720e9, 819e9, 907e9, 1108e9, 1152e9],
        gdp_per_capita: [11002, 10888, 10592, 9451, 9122, 8558, 9661, 10636, 12978, 13424],
        unemployment: [10.2, 10.8, 10.8, 11.0, 13.7, 13.1, 12.0, 10.4, 9.4, 9.2],
        inflation: [7.7, 7.8, 11.1, 16.3, 15.2, 12.3, 19.6, 72.3, 53.9, 49.0],
        life_expectancy: [76.5, 76.9, 77.1, 77.4, 77.8, 75.9, 76.0, 77.5, 78.1, 78.4],
        median_age: [30.4, 30.7, 31.0, 31.4, 31.7, 32.0, 32.4, 32.8, 33.1, 33.5],
        urban_population_pct: [73.6, 74.0, 74.5, 75.0, 75.6, 76.1, 76.6, 77.1, 77.5, 77.9]
      }
    },
    {
      id: 'NGA',
      code: 'NG',
      name: 'Nigeria',
      region: 'Africa',
      subregion: 'Western Africa',
      capital: 'Abuja',
      currency: 'NGN (₦)',
      color: '#166534',
      series: {
        population: [181137000, 185960000, 190873000, 195875000, 200964000, 208327000, 213401000, 218541000, 223805000, 229152000],
        gdp: [493e9, 404e9, 375e9, 421e9, 474e9, 432e9, 440e9, 477e9, 362e9, 375e9],
        gdp_per_capita: [2722, 2172, 1965, 2150, 2359, 2074, 2062, 2183, 1617, 1636],
        unemployment: [9.0, 13.4, 17.5, 22.6, 27.1, 33.3, 10.5, 5.3, 5.0, 5.3],
        inflation: [9.0, 15.7, 16.5, 12.1, 11.4, 13.2, 17.0, 18.8, 24.7, 31.7],
        life_expectancy: [52.8, 53.1, 53.4, 53.8, 54.3, 52.9, 52.7, 53.6, 54.5, 55.2],
        median_age: [17.2, 17.3, 17.5, 17.6, 17.8, 18.0, 18.2, 18.3, 18.5, 18.7],
        urban_population_pct: [47.8, 48.6, 49.5, 50.3, 51.2, 52.0, 52.9, 53.7, 54.6, 55.4]
      }
    },
    {
      id: 'NZL',
      code: 'NZ',
      name: 'New Zealand',
      region: 'Oceania',
      subregion: 'Australia and New Zealand',
      capital: 'Wellington',
      currency: 'NZD ($)',
      color: '#0d9488',
      series: {
        population: [4596000, 4693000, 4794000, 4886000, 4979000, 5090000, 5111000, 5124000, 5228000, 5338000],
        gdp: [178e9, 188e9, 207e9, 212e9, 213e9, 212e9, 255e9, 248e9, 253e9, 260e9],
        gdp_per_capita: [38729, 40059, 43178, 43389, 42779, 41650, 49892, 48399, 48393, 48707],
        unemployment: [5.4, 5.1, 4.7, 4.3, 4.1, 4.6, 3.8, 3.3, 3.7, 4.6],
        inflation: [0.3, 0.6, 1.7, 1.6, 1.6, 1.7, 3.9, 7.2, 5.7, 2.8],
        life_expectancy: [81.7, 81.9, 82.0, 82.2, 82.3, 82.3, 82.2, 82.5, 82.7, 82.9],
        median_age: [37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38.0],
        urban_population_pct: [86.3, 86.4, 86.5, 86.6, 86.7, 86.7, 86.8, 86.8, 86.9, 87.0]
      }
    }
  ];

  // Global / Group Average Computations
  const GLOBAL_AVERAGES = {};
  INDICATORS.forEach((ind) => {
    GLOBAL_AVERAGES[ind.id] = YEARS.map((_, yearIdx) => {
      if (ind.id === 'population' || ind.id === 'gdp') {
        // For absolute aggregates, calculate the arithmetic mean across the 16 nations
        const sum = COUNTRIES.reduce((acc, c) => acc + c.series[ind.id][yearIdx], 0);
        return sum / COUNTRIES.length;
      } else if (ind.id === 'gdp_per_capita') {
        // Total GDP / Total Population
        const totalGdp = COUNTRIES.reduce((acc, c) => acc + c.series.gdp[yearIdx], 0);
        const totalPop = COUNTRIES.reduce((acc, c) => acc + c.series.population[yearIdx], 0);
        return totalGdp / totalPop;
      } else {
        // Average rate / index
        const sum = COUNTRIES.reduce((acc, c) => acc + c.series[ind.id][yearIdx], 0);
        return sum / COUNTRIES.length;
      }
    });
  });

  // Public API helpers
  const StatData = {
    YEARS,
    INDICATORS,
    COUNTRIES,
    GLOBAL_AVERAGES,

    getCountry: (id) => COUNTRIES.find((c) => c.id === id || c.code === id),
    getIndicator: (id) => INDICATORS.find((i) => i.id === id),

    getLatestValue: (countryId, indicatorId) => {
      const country = COUNTRIES.find((c) => c.id === countryId || c.code === countryId);
      if (!country || !country.series[indicatorId]) return null;
      return country.series[indicatorId][YEARS.length - 1];
    },

    getPreviousValue: (countryId, indicatorId) => {
      const country = COUNTRIES.find((c) => c.id === countryId || c.code === countryId);
      if (!country || !country.series[indicatorId]) return null;
      return country.series[indicatorId][YEARS.length - 2];
    },

    getBaseValue: (countryId, indicatorId) => {
      const country = COUNTRIES.find((c) => c.id === countryId || c.code === countryId);
      if (!country || !country.series[indicatorId]) return null;
      return country.series[indicatorId][0];
    },

    getGlobalAverageLatest: (indicatorId) => {
      const avgSeries = GLOBAL_AVERAGES[indicatorId];
      if (!avgSeries) return null;
      return avgSeries[YEARS.length - 1];
    },

    formatValue: (indicatorId, val) => {
      const ind = INDICATORS.find((i) => i.id === indicatorId);
      if (!ind || val === null || val === undefined) return 'N/A';
      return ind.format(val);
    },

    formatValueFull: (indicatorId, val) => {
      const ind = INDICATORS.find((i) => i.id === indicatorId);
      if (!ind || val === null || val === undefined) return 'N/A';
      return ind.formatFull(val);
    }
  };

  root.StatData = StatData;
})(typeof window !== 'undefined' ? window : globalThis);
