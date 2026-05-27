/* ══════════════════════════════════════════════════
   UNI PROGRAM DASHBOARD — app.js
   Dynamic executive-level single-page orchestration
   ══════════════════════════════════════════════════ */

'use strict';

// ── UTILITY HELPERS ───────────────────────────────
function fmt(n) { return Math.round(n).toLocaleString('en-IN'); }
function fmtRs(n) {
  n = Math.round(n);
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
}
function fmtRevenueNumber(val) {
  return Math.round(val / 100000).toLocaleString('en-IN');
}
function pct(a, b) { return b ? ((a / b) * 100).toFixed(1) : '0.0'; }
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
function progressColor(p) {
  if (p >= 90) return 'accent-green';
  if (p >= 70) return 'accent-amber';
  return 'accent-red';
}
function trendClass(v) { return v >= 0 ? 'up' : 'down'; }
function trendLabel(v) { return (v >= 0 ? '↑' : '↓') + ' ' + Math.abs(v).toFixed(1) + '%'; }

// ── STATE ─────────────────────────────────────────
let activeProgram = 'ALL';

// Local Section Filters
const sectionCohortFilters = { fc: 'ALL' };
const sectionMonthFilters = { fm: 'ALL' };

// Leadership Name Filters
const leaderFilters = {
  'tl-fc': 'ALL', 'tl-fm': 'ALL',
  'gm-fc': 'ALL', 'gm-fm': 'ALL'
};

// Leadership Cohort Filters
const leaderCohortFilters = {
  'tl-fc': 'ALL',
  'gm-fc': 'ALL'
};

// Leadership Month Filters
const leaderMonthFilters = {
  'tl-fm': 'ALL',
  'gm-fm': 'ALL'
};

// Leadership Sort State
const leaderSorts = {
  'tl-fc': 'ach-desc', 'tl-fm': 'ach-desc',
  'gm-fc': 'ach-desc', 'gm-fm': 'ach-desc'
};

// ── MOCK DATA ─────────────────────────────────────
const MOCK_TLS = [
  { name: 'Sanjay Dutt',    gm: 'Vikram Malhotra' },
  { name: 'Meera Joshi',    gm: 'Vikram Malhotra' },
  { name: 'Arjun Kapoor',   gm: 'Vikram Malhotra' },
  { name: 'Neha Sharma',    gm: 'Ananya Sen' },
  { name: 'Rohan Verma',    gm: 'Ananya Sen' },
  { name: 'Kriti Sanon',    gm: 'Rajesh Iyer' },
  { name: 'Rahul Bose',     gm: 'Rajesh Iyer' },
  { name: 'Aditi Rao',      gm: 'Priyanka Nair' },
  { name: 'Ishaan Khatter', gm: 'Priyanka Nair' }
];

const MOCK_FP_COHORT_RAW = [
  { cohort: '2024-A', program: 'FullStackDev',  cohortTarget: 100, cohortAch: 88,  revTarget: 12000000, revAch: 10560000 },
  { cohort: '2024-A', program: 'AIML',          cohortTarget: 70,  cohortAch: 63,  revTarget:  9800000, revAch:  8820000 },
  { cohort: '2024-A', program: 'CyberSecurity', cohortTarget: 50,  cohortAch: 40,  revTarget:  5000000, revAch:  4000000 },
  { cohort: '2024-A', program: 'CloudComputing', cohortTarget: 60, cohortAch: 54,  revTarget:  4200000, revAch:  3780000 },
  { cohort: '2024-A', program: 'DataScience',   cohortTarget: 45,  cohortAch: 38,  revTarget:  6750000, revAch:  5700000 },
  { cohort: '2024-B', program: 'FullStackDev',  cohortTarget: 110, cohortAch: 98,  revTarget: 13200000, revAch: 11760000 },
  { cohort: '2024-B', program: 'AIML',          cohortTarget: 78,  cohortAch: 71,  revTarget: 10920000, revAch:  9940000 },
  { cohort: '2024-B', program: 'CyberSecurity', cohortTarget: 55,  cohortAch: 46,  revTarget:  5500000, revAch:  4600000 },
  { cohort: '2024-B', program: 'CloudComputing', cohortTarget: 65, cohortAch: 60,  revTarget:  4550000, revAch:  4200000 },
  { cohort: '2024-B', program: 'DataScience',   cohortTarget: 50,  cohortAch: 45,  revTarget:  7500000, revAch:  6750000 },
  { cohort: '2025-A', program: 'FullStackDev',  cohortTarget: 120, cohortAch: 108, revTarget: 14400000, revAch: 12960000 },
  { cohort: '2025-A', program: 'AIML',          cohortTarget: 85,  cohortAch: 78,  revTarget: 11900000, revAch: 10920000 },
  { cohort: '2025-A', program: 'CyberSecurity', cohortTarget: 60,  cohortAch: 50,  revTarget:  6000000, revAch:  5000000 },
  { cohort: '2025-A', program: 'CloudComputing', cohortTarget: 70, cohortAch: 64,  revTarget:  4900000, revAch:  4480000 },
  { cohort: '2025-A', program: 'DataScience',   cohortTarget: 55,  cohortAch: 50,  revTarget:  8250000, revAch:  7500000 },
  { cohort: '2025-B', program: 'FullStackDev',  cohortTarget: 130, cohortAch: 120, revTarget: 15600000, revAch: 14400000 },
  { cohort: '2025-B', program: 'AIML',          cohortTarget: 92,  cohortAch: 86,  revTarget: 12880000, revAch: 12040000 },
  { cohort: '2025-B', program: 'CyberSecurity', cohortTarget: 65,  cohortAch: 55,  revTarget:  6500000, revAch:  5500000 },
  { cohort: '2025-B', program: 'CloudComputing', cohortTarget: 75, cohortAch: 70,  revTarget:  5250000, revAch:  4900000 },
  { cohort: '2025-B', program: 'DataScience',   cohortTarget: 60,  cohortAch: 57,  revTarget:  9000000, revAch:  8550000 },
  { cohort: '2026-A', program: 'FullStackDev',  cohortTarget: 140, cohortAch: 118, revTarget: 16800000, revAch: 14160000 },
  { cohort: '2026-A', program: 'AIML',          cohortTarget: 100, cohortAch: 88,  revTarget: 14000000, revAch: 12320000 },
  { cohort: '2026-A', program: 'CyberSecurity', cohortTarget: 70,  cohortAch: 56,  revTarget:  7000000, revAch:  5600000 },
  { cohort: '2026-A', program: 'CloudComputing', cohortTarget: 80, cohortAch: 68,  revTarget:  5600000, revAch:  4760000 },
  { cohort: '2026-A', program: 'DataScience',   cohortTarget: 65,  cohortAch: 60,  revTarget:  9750000, revAch:  9000000 },
];

const MOCK_FP_MONTH_RAW = [
  { month: 'Jan', program: 'FullStackDev',  cohortTarget: 22, cohortAch: 19, revTarget: 2640000,  revAch: 2280000  },
  { month: 'Jan', program: 'AIML',          cohortTarget: 16, cohortAch: 14, revTarget: 2240000,  revAch: 1960000  },
  { month: 'Jan', program: 'CyberSecurity', cohortTarget: 12, cohortAch:  9, revTarget: 1200000,  revAch:  900000  },
  { month: 'Jan', program: 'CloudComputing', cohortTarget: 14, cohortAch: 12, revTarget:  980000,  revAch:  840000  },
  { month: 'Jan', program: 'DataScience',   cohortTarget: 11, cohortAch:  9, revTarget: 1650000,  revAch: 1350000  },
  { month: 'Feb', program: 'FullStackDev',  cohortTarget: 23, cohortAch: 21, revTarget: 2760000,  revAch: 2520000  },
  { month: 'Feb', program: 'AIML',          cohortTarget: 17, cohortAch: 16, revTarget: 2380000,  revAch: 2240000  },
  { month: 'Feb', program: 'CyberSecurity', cohortTarget: 13, cohortAch: 11, revTarget: 1300000,  revAch: 1100000  },
  { month: 'Feb', program: 'CloudComputing', cohortTarget: 15, cohortAch: 13, revTarget: 1050000,  revAch:  910000  },
  { month: 'Feb', program: 'DataScience',   cohortTarget: 12, cohortAch: 11, revTarget: 1800000,  revAch: 1650000  },
  { month: 'Mar', program: 'FullStackDev',  cohortTarget: 25, cohortAch: 23, revTarget: 3000000,  revAch: 2760000  },
  { month: 'Mar', program: 'AIML',          cohortTarget: 19, cohortAch: 17, revTarget: 2660000,  revAch: 2380000  },
  { month: 'Mar', program: 'CyberSecurity', cohortTarget: 14, cohortAch: 12, revTarget: 1400000,  revAch: 1200000  },
  { month: 'Mar', program: 'CloudComputing', cohortTarget: 16, cohortAch: 15, revTarget: 1120000,  revAch: 1050000  },
  { month: 'Mar', program: 'DataScience',   cohortTarget: 13, cohortAch: 12, revTarget: 1950000,  revAch: 1800000  },
  { month: 'Apr', program: 'FullStackDev',  cohortTarget: 27, cohortAch: 24, revTarget: 3240000,  revAch: 2880000  },
  { month: 'Apr', program: 'AIML',          cohortTarget: 21, cohortAch: 19, revTarget: 2940000,  revAch: 2660000  },
  { month: 'Apr', program: 'CyberSecurity', cohortTarget: 15, cohortAch: 13, revTarget: 1500000,  revAch: 1300000  },
  { month: 'Apr', program: 'CloudComputing', cohortTarget: 18, cohortAch: 16, revTarget: 1260000,  revAch: 1120000  },
  { month: 'Apr', program: 'DataScience',   cohortTarget: 14, cohortAch: 13, revTarget: 2100000,  revAch: 1950000  },
  { month: 'May', program: 'FullStackDev',  cohortTarget: 29, cohortAch: 26, revTarget: 3480000,  revAch: 3120000  },
  { month: 'May', program: 'AIML',          cohortTarget: 22, cohortAch: 20, revTarget: 3080000,  revAch: 2800000  },
  { month: 'May', program: 'CyberSecurity', cohortTarget: 16, cohortAch: 14, revTarget: 1600000,  revAch: 1400000  },
  { month: 'May', program: 'CloudComputing', cohortTarget: 19, cohortAch: 17, revTarget: 1330000,  revAch: 1190000  },
  { month: 'May', program: 'DataScience',   cohortTarget: 15, cohortAch: 14, revTarget: 2250000,  revAch: 2100000  },
  { month: 'Jun', program: 'FullStackDev',  cohortTarget: 30, cohortAch: 27, revTarget: 3600000,  revAch: 3240000  },
  { month: 'Jun', program: 'AIML',          cohortTarget: 23, cohortAch: 21, revTarget: 3220000,  revAch: 2940000  },
  { month: 'Jun', program: 'CyberSecurity', cohortTarget: 17, cohortAch: 14, revTarget: 1700000,  revAch: 1400000  },
  { month: 'Jun', program: 'CloudComputing', cohortTarget: 20, cohortAch: 17, revTarget: 1400000,  revAch: 1190000  },
  { month: 'Jun', program: 'DataScience',   cohortTarget: 16, cohortAch: 14, revTarget: 2400000,  revAch: 2100000  },
];

// ── DYNAMIC LEADERSHIP MAPPING ────────────────────
function getLeadershipForProgramRow(program, index) {
  const list = [
    { tl: 'Sanjay Dutt',    gm: 'Vikram Malhotra' },
    { tl: 'Meera Joshi',    gm: 'Vikram Malhotra' },
    { tl: 'Arjun Kapoor',   gm: 'Vikram Malhotra' },
    { tl: 'Neha Sharma',    gm: 'Ananya Sen' },
    { tl: 'Rohan Verma',    gm: 'Ananya Sen' },
    { tl: 'Kriti Sanon',    gm: 'Rajesh Iyer' },
    { tl: 'Rahul Bose',     gm: 'Rajesh Iyer' },
    { tl: 'Aditi Rao',      gm: 'Priyanka Nair' },
    { tl: 'Ishaan Khatter', gm: 'Priyanka Nair' }
  ];
  let offset = 0;
  if (program === 'FullStackDev') offset = 0;
  else if (program === 'AIML') offset = 3;
  else if (program === 'CyberSecurity') offset = 5;
  else if (program === 'CloudComputing') offset = 6;
  else if (program === 'DataScience') offset = 7;
  
  return list[(offset + (index % 2)) % list.length];
}

function enrichRawMockData() {
  MOCK_FP_COHORT_RAW.forEach((row, i) => {
    const leader = getLeadershipForProgramRow(row.program, i);
    row.tl = leader.tl; row.gm = leader.gm;
  });
  MOCK_FP_MONTH_RAW.forEach((row, i) => {
    const leader = getLeadershipForProgramRow(row.program, i);
    row.tl = leader.tl; row.gm = leader.gm;
  });
}

// ── DATA FILTERS & AGGREGATORS ────────────────────
function filterByProgram(rows) {
  if (activeProgram === 'ALL') return rows;
  return rows.filter(r => r.program === activeProgram);
}

function aggregateData(rows) {
  return rows.reduce((acc, r) => {
    acc.cohortTarget += r.cohortTarget;
    acc.cohortAch    += r.cohortAch;
    acc.revTarget    += r.revTarget;
    acc.revAch       += r.revAch;
    return acc;
  }, { cohortTarget: 0, cohortAch: 0, revTarget: 0, revAch: 0 });
}

function aggregateLeadershipData(rows, field, filterVal, isRevenue) {
  const map = {};
  rows.forEach(r => {
    const nameKey = r[field];
    if (!map[nameKey]) {
      map[nameKey] = { name: nameKey, target: 0, ach: 0 };
    }
    if (isRevenue) {
      map[nameKey].target += r.revTarget;
      map[nameKey].ach += r.revAch;
    } else {
      map[nameKey].target += r.cohortTarget;
      map[nameKey].ach += r.cohortAch;
    }
  });

  let list = Object.values(map);
  if (filterVal !== 'ALL') {
    list = list.filter(item => item.name === filterVal);
  }
  return list;
}

// ── DOM ASSIGNMENT HELPERS ───────────────────────
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setProgress(id, pctVal, colorClass) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = clamp(pctVal, 0, 100) + '%';
  el.className = `card-progress-fill ${colorClass}`;
}
function setTrend(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `trend-badge ${trendClass(val)}`;
  el.textContent = trendLabel(val);
}

// ── THEME STYLING SYSTEM ──────────────────────────
function isDark() { return document.documentElement.classList.contains('dark'); }

// ── LEADER PROGRESS RENDERING LOGIC ───────────────
function renderLeadershipList(chartKey) {
  const listContainer = document.getElementById(`list-${chartKey}`);
  if (!listContainer) return;

  const [role, type] = chartKey.split('-'); // role='tl'|'gm', type='fc'|'fm'
  const isRevenue = type.includes('m');
  const filterVal = leaderFilters[chartKey] || 'ALL';
  const sortVal = leaderSorts[chartKey] || 'ach-desc';

  let rawRows = [];
  if (type === 'fc') rawRows = MOCK_FP_COHORT_RAW;
  else if (type === 'fm') rawRows = MOCK_FP_MONTH_RAW;

  let filteredRows = filterByProgram(rawRows);

  // Apply leadership Cohort or Month filter dynamically!
  if (type.includes('c')) {
    const cohFilter = leaderCohortFilters[chartKey] || 'ALL';
    if (cohFilter !== 'ALL') {
      filteredRows = filteredRows.filter(r => r.cohort === cohFilter);
    }
  } else if (type.includes('m')) {
    const monFilter = leaderMonthFilters[chartKey] || 'ALL';
    if (monFilter !== 'ALL') {
      filteredRows = filteredRows.filter(r => r.month === monFilter);
    }
  }

  let list = aggregateLeadershipData(filteredRows, role, filterVal, isRevenue);

  // Apply sorting based on sortVal
  list.sort((a, b) => {
    if (sortVal === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortVal === 'ach-desc') {
      return b.ach - a.ach;
    }
    if (sortVal === 'ach-asc') {
      return a.ach - b.ach;
    }
    return 0;
  });

  // Calculate max achievement in active list for Full Payment relative scaling
  const maxAch = Math.max(...list.map(item => item.ach), 1);

  // Map rows to HTML
  let colorClass = '';
  if (chartKey.includes('fc')) colorClass = 'color-fp-cohort';
  else if (chartKey.includes('fm')) colorClass = 'color-fp-monthly';

  if (!list.length) {
    listContainer.innerHTML = `<div style="text-align:center;padding:24px;color:var(--muted);font-size:12px;">No records found</div>`;
    return;
  }

  listContainer.innerHTML = list.map(item => {
    let progressPct = 0;
    let rightSideValues = '';
    let reportsToSub = '';

    // If TL, show reporting GM as subtitle
    if (role === 'tl') {
      const tlInfo = MOCK_TLS.find(tl => tl.name === item.name);
      if (tlInfo) {
        reportsToSub = `<span class="leader-row-subtext">Reports to: ${tlInfo.gm}</span>`;
      }
    }

    // Full Payment: ONLY Achievement, relative scaling, NO target
    progressPct = (item.ach / maxAch) * 100;
    rightSideValues = isRevenue ? fmtRevenueNumber(item.ach) : fmt(item.ach);

    return `
      <div class="leader-progress-row">
        <div class="leader-row-name-wrap">
          <span class="leader-row-name" title="${item.name}">${item.name}</span>
          ${reportsToSub}
        </div>
        <div class="leader-row-bar-container">
          <div class="leader-slim-track">
            <div class="leader-slim-fill ${colorClass}" style="width: ${clamp(progressPct, 0, 100)}%"></div>
          </div>
        </div>
        <div class="leader-row-values">
          ${rightSideValues}
        </div>
      </div>
    `;
  }).join('');
}

// ── RENDER CORE SECTIONS ──────────────────────────
function renderCardsSection(prefix, rawData) {
  let rows = filterByProgram(rawData);

  // Filter by local cohort filter if cohort-based
  if (prefix === 'fc') {
    const cohVal = sectionCohortFilters[prefix];
    if (cohVal !== 'ALL') {
      rows = rows.filter(r => r.cohort === cohVal);
    }
  }

  // Filter by local month filter if month-based
  if (prefix === 'fm') {
    const monVal = sectionMonthFilters[prefix];
    if (monVal !== 'ALL') {
      rows = rows.filter(r => r.month === monVal);
    }
  }

  const agg = aggregateData(rows);

  const achPct = parseFloat(pct(agg.cohortAch, agg.cohortTarget));
  const revPct = parseFloat(pct(agg.revAch, agg.revTarget));

  setText(`card-${prefix}-tgt`,    fmt(agg.cohortTarget));
  setText(`card-${prefix}-ach`,    fmt(agg.cohortAch));
  setText(`card-${prefix}-pct`,    achPct.toFixed(1) + '%');
  setText(`card-${prefix}-revtgt`, fmtRs(agg.revTarget));
  setText(`card-${prefix}-revach`, fmtRs(agg.revAch));
  setText(`card-${prefix}-revpct`, revPct.toFixed(1) + '%');

  setTrend(`trend-${prefix}-ach`, achPct - 75); // simulated trend
  setTrend(`trend-${prefix}-rev`, revPct - 70); // simulated trend

  setProgress(`prog-${prefix}-ach`,    achPct, progressColor(achPct));
  setProgress(`prog-${prefix}-pct`,    achPct, progressColor(achPct));
  setProgress(`prog-${prefix}-rev`,    revPct, progressColor(revPct));
  setProgress(`prog-${prefix}-revpct`, revPct, progressColor(revPct));
}

// ── GLOBAL LAYOUT ORCHESTRATOR ────────────────────
function render() {
  // Render Section 3: Full Payment Cohort Wise (6 Cards)
  renderCardsSection('fc', MOCK_FP_COHORT_RAW);

  // Render Section 4: Full Payment Monthly Wise (6 Cards)
  renderCardsSection('fm', MOCK_FP_MONTH_RAW);

  // Render Section 5: TL Wise Analytics (2 list lines)
  renderLeadershipList('tl-fc');
  renderLeadershipList('tl-fm');

  // Render Section 6: GM Wise Analytics (2 list lines)
  renderLeadershipList('gm-fc');
  renderLeadershipList('gm-fm');
}

// ── FILTER ACTIONS ────────────────────────────────
function onProgramChange(val) {
  activeProgram = val;
  render();
}

function onSectionCohortChange(prefix, value) {
  sectionCohortFilters[prefix] = value;
  renderCardsSection('fc', MOCK_FP_COHORT_RAW);
}

function onSectionMonthChange(prefix, value) {
  sectionMonthFilters[prefix] = value;
  renderCardsSection('fm', MOCK_FP_MONTH_RAW);
}

function onLeaderFilterChange(chartKey, value) {
  leaderFilters[chartKey] = value;
  renderLeadershipList(chartKey);
}

// ── SPECIAL FILTER ACTIONS ────────────────────────
function onLeaderCohortFilterChange(chartKey, value) {
  leaderCohortFilters[chartKey] = value;
  renderLeadershipList(chartKey);
}

function onLeaderMonthFilterChange(chartKey, value) {
  leaderMonthFilters[chartKey] = value;
  renderLeadershipList(chartKey);
}

function onLeaderSortChange(chartKey, value) {
  leaderSorts[chartKey] = value;
  renderLeadershipList(chartKey);
}

// ── THEME SWITCHER ───────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  const isDarkMode = html.classList.contains('dark');
  localStorage.setItem('certification-theme', isDarkMode ? 'dark' : 'light');
  document.getElementById('theme-icon-sun').style.display  = isDarkMode ? 'block' : 'none';
  document.getElementById('theme-icon-moon').style.display = isDarkMode ? 'none'  : 'block';
  
  // Refreshes the HTML lists to correctly apply theme contrast
  render();
}

// ── INITIALIZER ──────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('certification-theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon-sun').style.display  = 'block';
    document.getElementById('theme-icon-moon').style.display = 'none';
  }
}

function handleRefresh() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  
  setTimeout(() => {
    render();
    btn.classList.remove('spinning');
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setText('last-updated-text', `Last updated: ${dateStr} ${timeStr}`);
  }, 750);
}

function initLeaderDropdowns() {
  const tls = ['Sanjay Dutt', 'Meera Joshi', 'Arjun Kapoor', 'Neha Sharma', 'Rohan Verma', 'Kriti Sanon', 'Rahul Bose', 'Aditi Rao', 'Ishaan Khatter'];
  const gms = ['Vikram Malhotra', 'Ananya Sen', 'Rajesh Iyer', 'Priyanka Nair'];
  
  ['tl-fc', 'tl-fm'].forEach(id => {
    const select = document.getElementById(`select-${id}`);
    if (select) {
      select.innerHTML = '<option value="ALL">All TLs</option>' + 
        tls.map(name => `<option value="${name}">${name}</option>`).join('');
    }
  });
  ['gm-fc', 'gm-fm'].forEach(id => {
    const select = document.getElementById(`select-${id}`);
    if (select) {
      select.innerHTML = '<option value="ALL">All GMs</option>' + 
        gms.map(name => `<option value="${name}">${name}</option>`).join('');
    }
  });
}

function init() {
  initTheme();
  enrichRawMockData();
  initLeaderDropdowns();
  render();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  setText('last-updated-text', `Last updated: ${dateStr} ${timeStr}`);
}

document.addEventListener('DOMContentLoaded', init);
