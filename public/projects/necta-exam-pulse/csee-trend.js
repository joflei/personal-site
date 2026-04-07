/**
 * csee-trend.js
 * CSEE Season 1: 22-year scrollytelling page
 * Vanilla JS + Chart.js. No framework dependencies.
 */

// ─── Palette (matches necta-styles.css CSS vars) ─────────────
const C = {
    espresso:    '#2c2418',
    walnut:      '#3a2e22',
    warmGray:    '#8c7e72',
    sand:        '#faf6f1',
    sandDark:    '#f0ebe4',
    border:      '#d4c8b8',
    borderLight: '#e8e0d6',
    terracotta:  '#b8652a',
    terracottaL: '#d4874a',
    accent:      '#d97757',
    olive:       '#6b7f5e',
    oliveLight:  '#8a9e7a',
};

// Division colours (Div I → IV → Fail)
// div_fail = FLD pre-2013 + Div 0 post-2013 : unified failure series for charting
const DIV_COLORS = [C.terracotta, C.terracottaL, C.accent, C.warmGray, C.border];
const DIV_LABELS = ['Division I', 'Division II', 'Division III', 'Division IV', 'Failed'];

// Zanzibar regions to exclude from mainland charts
const ZANZIBAR_REGIONS = new Set([
    'UNGUJA','MJINI MAGHARIBI','KASKAZINI UNGUJA','KUSINI UNGUJA',
    'PEMBA','KASKAZINI PEMBA','KUSINI PEMBA',
]);

// ─── Chart.js defaults ───────────────────────────────────────
Chart.defaults.font.family = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = C.warmGray;
Chart.defaults.plugins.legend.display = false;
Chart.defaults.animation.duration = 700;

// ─── Formatters ──────────────────────────────────────────────
function fmt(n)   { return n == null ? '' : Math.round(n).toLocaleString('en-US'); }
function fmtK(n)  {
    if (n == null) return '';
    const v = Math.round(n);
    if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(v) >= 1000)    return Math.round(v / 1000) + 'K';
    return v.toString();
}
function pct(r,d) { return r == null ? '' : (r * 100).toFixed(d == null ? 1 : d) + '%'; }
function pct0(r)  { return pct(r, 0); }
function shortName(name) {
    if (!name) return '';
    return name.length > 32 ? name.slice(0, 30) + '…' : name;
}

// ─── Data loading ─────────────────────────────────────────────
let DATA = {};

async function loadAll() {
    // Use bundled global (data/trend/data.js) so the page works on file:// without a server.
    const files = ['ch1_growth','ch2_passrates','ch3_gender','ch4_schools','ch5_regions','ch6_extremes','ch7_schoolsize','ch8_schooltype'];
    if (window.TREND_DATA) {
        files.forEach(f => { DATA[f] = window.TREND_DATA[f]; });
        return;
    }
    // Fallback to fetch for when served via HTTP.
    const results = await Promise.all(
        files.map(f => fetch(`data/trend/${f}.json`).then(r => r.json()))
    );
    files.forEach((f, i) => { DATA[f] = results[i]; });
}

// ─── Scroll reveal ────────────────────────────────────────────
function initReveal() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ─── Sticky nav active state ──────────────────────────────────
function initNav() {
    const sections = ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8'].map(id => document.getElementById(id));
    const links = document.querySelectorAll('#chapter-nav a[data-ch]');

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`#chapter-nav a[data-ch="${e.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => s && io.observe(s));
}

// ─── Callout card builder ─────────────────────────────────────
function makeCallout(number, label, accent = false) {
    const d = document.createElement('div');
    d.className = 'callout-card';
    d.innerHTML = `
        <div class="cc-number${accent ? ' accent' : ''}">${number}</div>
        <div class="cc-label">${label}</div>
    `;
    return d;
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 1: Growth
// ═════════════════════════════════════════════════════════════
function buildCh1() {
    const data = DATA.ch1_growth;
    const years = data.map(r => r.year);
    const candidates = data.map(r => r.total_candidates);
    const schools = data.map(r => r.school_count);

    // Hero stats
    const first = data[0], last = data[data.length - 1];
    const schoolGrowthPct = Math.round(last.school_count / first.school_count) + '×';
    const candGrowth = Math.round(last.total_candidates / first.total_candidates) + '×';

    // Streak: count consecutive years of pass rate increase ending at the most recent year
    const pr = DATA.ch2_passrates;
    let streak = 0;
    for (let i = pr.length - 1; i > 0; i--) {
        if (pr[i].pass_rate > pr[i - 1].pass_rate) streak++;
        else break;
    }

    document.getElementById('hero-schools').textContent = schoolGrowthPct;
    document.getElementById('hero-candidates').textContent = candGrowth;
    document.getElementById('hero-growth').textContent = streak;

    // Callout cards : rates and trend stats, not raw counts
    const y2007 = data.find(r => r.year === 2007);
    const y2012 = data.find(r => r.year === 2012);
    const sedpGrowth = Math.round((y2012.total_candidates / y2007.total_candidates - 1) * 100);
    const cps2003 = Math.round(first.total_candidates / first.school_count);
    const cps2025 = Math.round(last.total_candidates  / last.school_count);
    const cpsPct  = Math.round((cps2025 / cps2003 - 1) * 100);

    const wrap = document.getElementById('ch1-callouts');
    wrap.append(
        makeCallout(Math.round(last.total_candidates / first.total_candidates) + '×',
                    'Candidate growth (2003–2025)', true),
        makeCallout(Math.round(last.school_count / first.school_count) + '×',
                    'School growth (2003–2025)'),
        makeCallout('+' + sedpGrowth + '%', 'Candidate surge during SEDP era (2007–2012)'),
        makeCallout('+' + cpsPct + '%',     'Growth in avg candidates per school (class size pressure)'),
    );

    // Chart: dual-axis line (candidates left, schools right)
    const ctx = document.getElementById('ch1-chart').getContext('2d');

    // Colour bars by source
    const barColors = data.map(r => r.source === 'necta' ? C.accent + 'cc' : C.border);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    type: 'bar',
                    label: 'Candidates',
                    data: candidates,
                    backgroundColor: barColors,
                    borderRadius: 2,
                    yAxisID: 'y',
                    order: 2,
                },
                {
                    type: 'line',
                    label: 'Schools',
                    data: schools,
                    borderColor: C.espresso,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: C.espresso,
                    tension: 0.3,
                    yAxisID: 'y2',
                    order: 1,
                },
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = ctx.parsed.y;
                            return `${ctx.dataset.label}: ${fmt(v)}`;
                        }
                    }
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 12, color: C.warmGray }
                },
                y: {
                    position: 'left',
                    grid: { color: C.borderLight },
                    ticks: { callback: v => fmt(v), color: C.warmGray, maxTicksLimit: 6 },
                    title: { display: true, text: 'Candidates', color: C.warmGray, font: { size: 11 } }
                },
                y2: {
                    position: 'right',
                    grid: { display: false },
                    ticks: { callback: v => fmt(v), color: C.espresso, maxTicksLimit: 6 },
                    title: { display: true, text: 'Schools', color: C.espresso, font: { size: 11 } }
                }
            }
        }
    });
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 2: Pass rate inflection
// ═════════════════════════════════════════════════════════════
function buildCh2() {
    const data = DATA.ch2_passrates;
    const years = data.map(r => r.year);

    // Callout cards: use 2013 and 2025 as anchors
    const r2013 = data.find(r => r.year === 2013);
    const r2025 = data.find(r => r.year === 2025);
    const rWorst = data.reduce((a,b) => ((b.pass_rate||1) < (a.pass_rate||1) ? b : a), data[0]);
    const failRate2012 = rWorst.div_fail / rWorst.total_sat;
    const failRate2025 = r2025.div_fail / r2025.total_sat;
    const pptDrop = Math.round((failRate2012 - failRate2025) * 100);
    const wrap = document.getElementById('ch2-callouts');
    wrap.append(
        makeCallout(pct0(rWorst.pass_rate),  `Worst pass rate (${rWorst.year})`, false),
        makeCallout(pct0(r2025.pass_rate),   'Pass rate 2025', true),
        makeCallout(pct0(failRate2012),      `Failure rate at peak (${rWorst.year})`),
        makeCallout(`\u2212${pptDrop} ppt`,  'Failure rate drop by 2025'),
    );

    // Stacked bar chart: division composition
    const ctx1 = document.getElementById('ch2-stacked').getContext('2d');
    // Use div_fail (= FLD pre-2013 + Div 0 post-2013) as the unified failure segment
    const divKeys = ['div_1','div_2','div_3','div_4','div_fail'];
    const totals = data.map(r =>
        (r.div_1||0) + (r.div_2||0) + (r.div_3||0) + (r.div_4||0) + (r.div_fail||0)
    );

    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: years,
            datasets: divKeys.map((k, i) => ({
                label: DIV_LABELS[i],
                data: data.map((r, j) => totals[j] > 0 ? (r[k] || 0) / totals[j] : 0),
                backgroundColor: DIV_COLORS[i],
                borderWidth: 0,
                stack: 'div',
            }))
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 10, boxHeight: 10,
                        font: { size: 11 }, color: C.warmGray,
                        padding: 12,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = ctx.parsed.y;
                            return `${ctx.dataset.label}: ${(v * 100).toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 12, color: C.warmGray } },
                y: {
                    stacked: true,
                    grid: { color: C.borderLight },
                    ticks: { callback: v => Math.round(v * 100) + '%', color: C.warmGray, maxTicksLimit: 5 },
                    max: 1,
                }
            }
        }
    });

    // Pass rate line chart
    const ctx2 = document.getElementById('ch2-passrate').getContext('2d');
    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Pass rate',
                data: data.map(r => r.pass_rate),
                borderColor: C.accent,
                backgroundColor: C.accent + '18',
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: data.map(r => r.source === 'necta' ? C.accent : C.terracotta),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `Pass rate: ${(ctx.parsed.y * 100).toFixed(1)}%`
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 12, color: C.warmGray } },
                y: {
                    grid: { color: C.borderLight },
                    ticks: { callback: v => Math.round(v * 100) + '%', color: C.warmGray, maxTicksLimit: 5 },
                    min: 0, max: 1,
                }
            }
        }
    });
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 3: Gender
// ═════════════════════════════════════════════════════════════
function buildCh3() {
    const data = DATA.ch3_gender;
    const years = data.map(r => r.year);

    const r2025 = data.find(r => r.year === 2025);
    const crossover = data.find((r, i) => {
        if (i === 0) return false;
        const prev = data[i - 1];
        return prev.male_count >= prev.female_count && r.male_count < r.female_count;
    });

    // Gender pass rate gap trend
    const r2013g = data.find(r => r.year === 2013);
    const gap2013 = r2013g ? Math.round((r2013g.male_pass_rate - r2013g.female_pass_rate) * 100 * 10) / 10 : null;
    const gap2025 = Math.round((r2025.male_pass_rate - r2025.female_pass_rate) * 100 * 10) / 10;

    const wrap = document.getElementById('ch3-callouts');
    const total2025 = r2025.male_count + r2025.female_count;
    wrap.append(
        makeCallout(pct0(r2025.female_count / total2025), 'Female share of candidates (2025)', true),
        makeCallout(crossover ? crossover.year : '2015',  'Year girls first became majority'),
        makeCallout(gap2013 != null ? gap2013 + ' ppt' : '', 'Male–female pass rate gap in 2013'),
        makeCallout(gap2025 + ' ppt', 'Male–female pass rate gap in 2025 (narrowing trend)'),
    );

    // Stacked area chart
    const ctx1 = document.getElementById('ch3-area').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Female',
                    data: data.map(r => r.female_count),
                    borderColor: C.accent,
                    backgroundColor: C.accent + '33',
                    fill: 'origin',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 2,
                },
                {
                    label: 'Male',
                    data: data.map(r => r.male_count),
                    borderColor: C.espresso,
                    backgroundColor: C.espresso + '22',
                    fill: 'origin',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 2,
                },
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true, position: 'bottom',
                    labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 }, color: C.warmGray, padding: 12 }
                },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 12, color: C.warmGray } },
                y: {
                    grid: { color: C.borderLight },
                    ticks: { callback: v => fmt(v), color: C.warmGray, maxTicksLimit: 5 },
                    stacked: false,
                }
            }
        }
    });

    // Gender pass rate line chart (post-2013 only for meaningful comparison)
    const post13 = data.filter(r => r.year >= 2013);
    const ctx2 = document.getElementById('ch3-passrate').getContext('2d');
    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: post13.map(r => r.year),
            datasets: [
                {
                    label: 'Female pass rate',
                    data: post13.map(r => r.female_pass_rate),
                    borderColor: C.accent,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: C.accent,
                },
                {
                    label: 'Male pass rate',
                    data: post13.map(r => r.male_pass_rate),
                    borderColor: C.espresso,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: C.espresso,
                },
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true, position: 'bottom',
                    labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 }, color: C.warmGray, padding: 12 }
                },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(1)}%` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: C.warmGray } },
                y: {
                    grid: { color: C.borderLight },
                    ticks: { callback: v => Math.round(v * 100) + '%', color: C.warmGray, maxTicksLimit: 5 },
                    min: 0.4, max: 1.05,
                }
            }
        }
    });
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 4: School resilience
// ═════════════════════════════════════════════════════════════
function buildCh4() {
    const data = DATA.ch4_schools;
    const top20 = data.slice(0, 20);

    // Callout cards : rates, not raw counts
    const wrap = document.getElementById('ch4-callouts');
    const top1 = data[0];
    const avgClassSize = top1.total_candidates > 0 && top1.years_present > 0
        ? Math.round(top1.total_candidates / top1.years_present) : null;
    wrap.append(
        makeCallout(pct0(top1.avg_div1_rate), `${shortName(top1.school_name)}: 22yr avg Div I`, true),
        makeCallout(pct0(data[data.length - 1].avg_div1_rate), `${shortName(data[data.length-1].school_name)}: avg Div I (rank ${data.length})`),
        makeCallout(top1.years_present + '/' + 23, 'Years in top school\'s record'),
        makeCallout(avgClassSize != null ? '~' + avgClassSize + ' /yr' : '', 'Avg class size at top school'),
    );

    // Build ranked table with sparklines
    const container = document.getElementById('ch4-table');

    // Get all years across sparklines for consistent x-axis
    const allYears = Array.from(new Set(
        data.flatMap(s => s.sparkline.map(p => p.year))
    )).sort((a,b) => a - b);
    const minY = Math.min(...allYears), maxY = Math.max(...allYears);
    const yearCount = maxY - minY + 1;

    const table = document.createElement('table');
    table.className = 'school-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>School</th>
                <th>Region</th>
                <th style="text-align:center">22yr Div I trend</th>
                <th>Avg Div I</th>
            </tr>
        </thead>
    `;
    const tbody = document.createElement('tbody');

    top20.forEach((school, idx) => {
        const tr = document.createElement('tr');

        // Build sparkline bar chart
        const sparkMap = {};
        school.sparkline.forEach(p => { sparkMap[p.year] = p.div1_rate; });

        const bars = allYears.map(y => {
            const v = sparkMap[y];
            const h = v != null ? Math.round(v * 24) : 0; // max 24px
            const bg = v != null ? C.accent : C.borderLight;
            return `<div class="spark-bar" style="height:${h}px;background:${bg};min-height:${v != null ? 1 : 0}px"></div>`;
        }).join('');

        tr.innerHTML = `
            <td class="school-rank">${idx + 1}</td>
            <td style="font-weight:500">${shortName(school.school_name)}</td>
            <td style="color:${C.warmGray};font-size:0.8125rem">${school.region || ''}</td>
            <td style="padding:0 0.5rem">
                <div class="spark-bar-row" style="width:${yearCount * 4}px">${bars}</div>
            </td>
            <td style="font-weight:700;color:${C.accent}">${pct0(school.avg_div1_rate)}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 5: Regional trends
// ═════════════════════════════════════════════════════════════
function buildCh5() {
    const data = DATA.ch5_regions;

    // Filter to mainland Tanzania only
    const mainland = data.filter(r => !ZANZIBAR_REGIONS.has(r.region));

    // Callout cards : gap and ratios, not counts
    const top = mainland[0], bot = mainland[mainland.length - 1];
    const gapRatio = bot.avg_div1_rate > 0 ? (top.avg_div1_rate / bot.avg_div1_rate).toFixed(1) + '×' : 'n/a';
    const pptGap = Math.round((top.avg_div1_rate - bot.avg_div1_rate) * 100);
    const wrap = document.getElementById('ch5-callouts');
    wrap.append(
        makeCallout(top.region,         'Top region by avg Div I rate', true),
        makeCallout(pct0(top.avg_div1_rate), `${top.region} avg Div I (2003–2025)`),
        makeCallout(bot.region,         'Lowest mainland region by avg Div I'),
        makeCallout(gapRatio,           `Top-to-bottom Div I rate ratio`),
    );

    // League table
    const leagueEl = document.getElementById('ch5-league');
    const maxRate = mainland[0].avg_div1_rate || 0.01;

    mainland.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = 'region-row';
        const barW = Math.round((r.avg_div1_rate / maxRate) * 100);
        row.innerHTML = `
            <div class="region-name">${i + 1}. ${r.region}</div>
            <div style="flex:1;min-width:80px">
                <div class="div1-bar-bg">
                    <div class="div1-bar-fill" style="width:${barW}%"></div>
                </div>
            </div>
            <div class="region-rate">${pct0(r.avg_div1_rate)}</div>
        `;
        leagueEl.appendChild(row);
    });

    // Top 3 trend line chart
    const top3 = mainland.slice(0, 3);

    // Collect all years
    const allYears = Array.from(new Set(
        mainland.flatMap(r => r.years.map(y => y.year))
    )).sort((a,b) => a - b);

    const lineColors = [C.terracotta, C.accent, C.olive];

    const ctx = document.getElementById('ch5-trend').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: allYears,
            datasets: top3.map((region, i) => {
                const yMap = {};
                region.years.forEach(y => { yMap[y.year] = y.div1_rate; });
                return {
                    label: region.region,
                    data: allYears.map(y => yMap[y] ?? null),
                    borderColor: lineColors[i],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    spanGaps: false,
                };
            })
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true, position: 'bottom',
                    labels: {
                        boxWidth: 20, boxHeight: 2,
                        font: { size: 10 }, color: C.warmGray, padding: 8,
                        usePointStyle: false,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = ctx.parsed.y;
                            return v == null ? null : `${ctx.dataset.label}: ${(v * 100).toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 12, color: C.warmGray } },
                y: {
                    grid: { color: C.borderLight },
                    ticks: { callback: v => (v * 100).toFixed(0) + '%', color: C.warmGray, maxTicksLimit: 5 },
                    min: 0,
                }
            }
        }
    });
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 6: Extreme ends
// ═════════════════════════════════════════════════════════════
function buildCh6() {
    const data = DATA.ch6_extremes;

    // Update inline counts
    document.getElementById('ch6-perfect-count').textContent = data.perfect_classes.length;
    document.getElementById('ch6-bottom-count').textContent = data.bottom_schools.length;

    // Callout cards: inequality : use rates, not raw counts
    const ineq = data.inequality_2025;
    const pr = DATA.ch2_passrates;
    const prWorst = pr.reduce((a,b) => ((b.pass_rate||1) < (a.pass_rate||1) ? b : a), pr[0]);
    const prLast  = pr[pr.length - 1];
    const div1Worst = prWorst.div_1 / prWorst.total_sat;
    const div1Last  = prLast.div_1  / prLast.total_sat;
    const div1PptGain = Math.round((div1Last - div1Worst) * 100);

    const wrap = document.getElementById('ch6-callouts');
    wrap.append(
        makeCallout(pct0(ineq.top10_share),  'Top 10 schools\' share of all Div I (2025)'),
        makeCallout(pct0(ineq.top100_share), 'Top 100 schools\' share of Div I (2025)', true),
        makeCallout(pct0(div1Last),          `Div I rate nationally in ${prLast.year}`),
        makeCallout(`+${div1PptGain} ppt`,   `Div I rate gain from ${prWorst.year} to ${prLast.year}`),
    );

    // Perfect classes table
    const perfEl = document.getElementById('ch6-perfect-table');
    const perfTable = document.createElement('table');
    perfTable.className = 'extremes-table';
    perfTable.innerHTML = `
        <thead>
            <tr>
                <th>Year</th>
                <th>School</th>
                <th>Region</th>
                <th style="text-align:right">Class size</th>
            </tr>
        </thead>
    `;
    const perfBody = document.createElement('tbody');
    data.perfect_classes.slice(0, 20).forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:${C.warmGray}">${r.year}</td>
            <td style="font-weight:500">${shortName(r.school_name)}</td>
            <td style="color:${C.warmGray}">${r.region || ''}</td>
            <td style="text-align:right;font-weight:600;color:${C.accent}">${r.total_sat}</td>
        `;
        perfBody.appendChild(tr);
    });
    perfTable.appendChild(perfBody);
    perfEl.appendChild(perfTable);
    if (data.perfect_classes.length > 20) {
        perfEl.innerHTML += `<p class="chart-note">Showing top 20 of ${data.perfect_classes.length} total (largest cohorts first).</p>`;
    }

    // Bottom schools table
    const botEl = document.getElementById('ch6-bottom-table');
    const botTable = document.createElement('table');
    botTable.className = 'extremes-table';
    botTable.innerHTML = `
        <thead>
            <tr>
                <th>School</th>
                <th>Region</th>
                <th style="text-align:right">Years</th>
                <th style="text-align:right">Avg Div 0</th>
            </tr>
        </thead>
    `;
    const botBody = document.createElement('tbody');
    data.bottom_schools.slice(0, 15).forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:500">${shortName(r.school_name)}</td>
            <td style="color:${C.warmGray}">${r.region || ''}</td>
            <td style="text-align:right;color:${C.warmGray}">${r.years_present}</td>
            <td style="text-align:right;font-weight:600;color:${C.espresso}">${pct0(r.avg_div0_rate)}</td>
        `;
        botBody.appendChild(tr);
    });
    botTable.appendChild(botBody);
    botEl.appendChild(botTable);

    // Act 4: Perfect score : only St. Francis Girls 2024 (all 91 students scored aggregate 7)
    const psEl = document.getElementById('ch6-perfect-score');
    if (psEl) {
        const card = document.createElement('div');
        card.className = 'spotlight-card';
        card.innerHTML = `
            <div class="sp-label">The only perfect score</div>
            <div class="sp-school">ST. FRANCIS GIRLS' SECONDARY SCHOOL</div>
            <div class="sp-region">Mbeya &nbsp;·&nbsp; 2024</div>
            <div class="sp-stat">
                <strong>91</strong> students sat the exam.<br>
                <strong>91</strong> scored Division I.<br>
                <strong>91</strong> scored aggregate 7, the highest possible grade in every subject.<br>
                The only time this has occurred in 22 years of data.
            </div>
        `;
        psEl.appendChild(card);
    }

    // Spotlight cards: needle + inverse needle
    const spotEl = document.getElementById('ch6-spotlight');
    const n = data.needle[0];
    const inv = data.inverse_needle[0];

    if (n) {
        const card = document.createElement('div');
        card.className = 'spotlight-card';
        card.innerHTML = `
            <div class="sp-label">The needle</div>
            <div class="sp-school">${n.school_name || n.school_code}</div>
            <div class="sp-region">${n.region || ''} &nbsp;·&nbsp; ${n.year}</div>
            <div class="sp-stat">
                <strong>1</strong> student passed in Division I.<br>
                <strong>${n.div_0}</strong> students received Division 0.<br>
                <strong>${n.total_sat}</strong> total students sat.<br>
                ${pct0(n.bottom_share)} of the class failed.
            </div>
        `;
        spotEl.appendChild(card);
    }

    if (inv) {
        const card = document.createElement('div');
        card.className = 'spotlight-card';
        card.innerHTML = `
            <div class="sp-label">The inverse needle</div>
            <div class="sp-school">${inv.school_name || inv.school_code}</div>
            <div class="sp-region">${inv.region || ''} &nbsp;·&nbsp; ${inv.year}</div>
            <div class="sp-stat">
                <strong>${inv.div_1}</strong> students passed in Division I.<br>
                <strong>1</strong> student received Division 0.<br>
                <strong>${inv.total_sat}</strong> total students sat.<br>
                ${pct0(inv.div1_share)} of the class reached Div I.
            </div>
        `;
        spotEl.appendChild(card);
    }
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 7: School size vs outcomes
// ═════════════════════════════════════════════════════════════
function buildCh7() {
    const data = DATA.ch7_schoolsize;
    const years = Array.from(new Set(data.map(r => r.year))).sort((a,b) => a - b);
    const small = years.map(y => { const r = data.find(d => d.year === y && d.size_band === 'small'); return r ? r.avg_div1_rate : null; });
    const large = years.map(y => { const r = data.find(d => d.year === y && d.size_band === 'large'); return r ? r.avg_div1_rate : null; });

    // All-year averages (trend-level, not snapshot)
    const allSmall = data.filter(d => d.size_band === 'small');
    const allLarge = data.filter(d => d.size_band === 'large');
    const avgSmallDiv1 = allSmall.reduce((s,r) => s + (r.avg_div1_rate||0), 0) / allSmall.length;
    const avgLargeDiv1 = allLarge.reduce((s,r) => s + (r.avg_div1_rate||0), 0) / allLarge.length;

    // 2025 small school share
    const sm25 = data.find(d => d.year === 2025 && d.size_band === 'small');
    const lg25 = data.find(d => d.year === 2025 && d.size_band === 'large');
    const totalSch = (sm25?.school_count || 0) + (lg25?.school_count || 0);
    const smallPct = sm25 ? Math.round(sm25.school_count / totalSch * 100) + '%' : '';

    const wrap = document.getElementById('ch7-callouts');
    wrap.append(
        makeCallout(pct0(avgSmallDiv1), 'Avg Div I rate: small schools (2003–2025)', true),
        makeCallout(pct0(avgLargeDiv1), 'Avg Div I rate: large schools (2003–2025)'),
        makeCallout(smallPct,           'Small schools as share of all schools (2025)'),
        makeCallout(pct0(sm25?.avg_div1_rate - lg25?.avg_div1_rate), 'Small-school Div I advantage in 2025'),
    );

    const ctx = document.getElementById('ch7-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Small (<40)',
                    data: small,
                    borderColor: C.accent,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 2,
                    pointBackgroundColor: C.accent,
                },
                {
                    label: 'Large (40+)',
                    data: large,
                    borderColor: C.espresso,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 2,
                    pointBackgroundColor: C.espresso,
                },
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true, position: 'bottom',
                    labels: { boxWidth: 20, boxHeight: 2, font: { size: 11 }, color: C.warmGray, padding: 12, usePointStyle: false }
                },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(1)}%` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 12, color: C.warmGray } },
                y: {
                    grid: { color: C.borderLight },
                    ticks: { callback: v => (v * 100).toFixed(0) + '%', color: C.warmGray, maxTicksLimit: 5 },
                    min: 0,
                }
            }
        }
    });
}

// ═════════════════════════════════════════════════════════════
// CHAPTER 8: Boys vs Girls vs Coed
// ═════════════════════════════════════════════════════════════
function buildCh8() {
    const data = DATA.ch8_schooltype;
    const years = Array.from(new Set(data.map(r => r.year))).sort((a,b) => a - b);

    const boys  = years.map(y => { const r = data.find(d => d.year === y && d.school_type === 'boys');  return r ? r.avg_div1_rate : null; });
    const girls = years.map(y => { const r = data.find(d => d.year === y && d.school_type === 'girls'); return r ? r.avg_div1_rate : null; });
    const coed  = years.map(y => { const r = data.find(d => d.year === y && d.school_type === 'coed');  return r ? r.avg_div1_rate : null; });

    // All-year averages per school type
    function typeAvg(type, key) {
        const rows = data.filter(d => d.school_type === type && d[key] != null);
        return rows.length ? rows.reduce((s,r) => s + r[key], 0) / rows.length : null;
    }
    const avgDiv1  = { boys: typeAvg('boys','avg_div1_rate'), girls: typeAvg('girls','avg_div1_rate'), coed: typeAvg('coed','avg_div1_rate') };
    const avgPass  = { boys: typeAvg('boys','avg_pass_rate'), girls: typeAvg('girls','avg_pass_rate'), coed: typeAvg('coed','avg_pass_rate') };

    // Build 3-column type grid instead of standard callout cards
    const wrap = document.getElementById('ch8-callouts');
    const grid = document.createElement('div');
    grid.className = 'type-stat-grid';

    [
        { key: 'boys',  label: 'Boys-only' },
        { key: 'girls', label: 'Girls-only' },
        { key: 'coed',  label: 'Coed' },
    ].forEach(({ key, label }) => {
        const col = document.createElement('div');
        col.className = 'type-col';
        col.innerHTML = `
            <div class="type-col-header">${label}</div>
            <div class="type-stat-row">
                <span class="type-stat-num accent">${pct0(avgDiv1[key])}</span>
                <span class="type-stat-label">Avg Div I rate</span>
            </div>
            <div class="type-stat-row">
                <span class="type-stat-num">${pct0(avgPass[key])}</span>
                <span class="type-stat-label">Avg pass rate</span>
            </div>
            <div class="type-stat-footnote">2003–2025 average</div>
        `;
        grid.appendChild(col);
    });
    wrap.appendChild(grid);

    const ctx = document.getElementById('ch8-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Boys-only',
                    data: boys,
                    borderColor: C.espresso,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 2,
                    pointBackgroundColor: C.espresso,
                },
                {
                    label: 'Girls-only',
                    data: girls,
                    borderColor: C.accent,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 2,
                    pointBackgroundColor: C.accent,
                },
                {
                    label: 'Coed',
                    data: coed,
                    borderColor: C.olive,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 1,
                    pointBackgroundColor: C.olive,
                },
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true, position: 'bottom',
                    labels: { boxWidth: 20, boxHeight: 2, font: { size: 11 }, color: C.warmGray, padding: 12, usePointStyle: false }
                },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(1)}%` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 12, color: C.warmGray } },
                y: {
                    grid: { color: C.borderLight },
                    ticks: { callback: v => (v * 100).toFixed(0) + '%', color: C.warmGray, maxTicksLimit: 5 },
                    min: 0,
                }
            }
        }
    });
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
    try {
        await loadAll();

        buildCh1();
        buildCh2();
        buildCh3();
        buildCh4();
        buildCh5();
        buildCh6();
        buildCh7();
        buildCh8();

        initReveal();
        initNav();

    } catch (err) {
        console.error('csee-trend.js error:', err);
    }
}

main();
