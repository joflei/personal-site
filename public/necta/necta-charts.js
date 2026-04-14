/**
 * NECTA CSEE 2025 Explorer — Charts & Interactions
 */

const C = {
    espresso: '#2c2418', walnut: '#3a2e22', warmGray: '#8c7e72',
    sand: '#faf6f1', sandDark: '#f0ebe4', border: '#d4c8b8',
    borderLight: '#e8e0d6', terracotta: '#b8652a', terracottaL: '#d4874a',
    claude: '#d97757', olive: '#6b7f5e', oliveLight: '#8a9e7a',
};
const DIV_COLORS = ['#b8652a', '#d4874a', '#d97757', '#8c7e72', '#d4c8b8'];
const DIV_LABELS = ['Division I', 'Division II', 'Division III', 'Division IV', 'Division 0'];
const SMALL_THRESHOLD = 40;

const SUBJECT_CATEGORIES = {
    'Compulsory': ['B/MATH', 'CIV', 'GEO', 'ENGL', 'KISW'],
    'STEM': ['CHEM', 'PHY', 'BIO', 'ADD MATH', 'B/MATH'],
    'Languages': ['KISW', 'LIT ENG', 'FREN', 'ARABIC', 'CHINESE'],
    'Social Studies': ['HIST', 'GEO', 'CIV'],
    'Business & Commerce': ['COMM', 'B/KEEPING'],
    'Religion': ['B/KNOWL', 'E/D/KIISLAMU'],
    'Engineering & Technical': ['ENG SC', 'ENG DRAWING', 'ELECTRICAL ENG', 'ELECTRICAL DRAUGHT',
        'ELECTRONICS DRAUGHT', 'COMM ENG', 'AUTOMOTIVE ENG', 'MANUFACTURING ENG', 'PAINT ENG'],
    'Construction & Design': ['BLD CONSTR', 'ARCH DRAUGHT', 'CIVIL ENG SURVEY'],
    'Life Skills & Applied': ['AGRI', 'FOOD', 'COMP STUD', 'PHY EDU', 'TEXTILE'],
    'Creative Arts': ['THEATRE ART', 'MUSIC', 'F.ART'],
};

Chart.defaults.font.family = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
Chart.defaults.font.size = 13;
Chart.defaults.color = C.warmGray;
Chart.defaults.plugins.legend.display = false;
Chart.defaults.animation.duration = 600;

let charts = {};
let DATA = null;
let currentFilter = 'school';
let currentSizeFilter = 'regular'; // for school search

// ─── Data loading ───────────────────────────────────────────

async function loadData() {
    const [national, schools, subjectData, extended] = await Promise.all([
        fetch('data/national_summary.json').then(r => r.json()),
        fetch('data/schools_full.json').then(r => r.json()),
        fetch('data/subject_analysis.json').then(r => r.json()),
        fetch('data/extended_analysis.json').then(r => r.json()),
    ]);
    return { national, schools, subjects: subjectData, extended, ch5_regions: window.CH5_REGIONS };
}

// ─── Helpers ────────────────────────────────────────────────

function fmt(n) { return n.toLocaleString('en-US'); }
function pct(rate, decimals) {
    const v = rate * 100;
    return decimals === 0 ? Math.round(v) + '%' : v.toFixed(decimals === undefined ? 1 : decimals) + '%';
}
function whole(rate) { return pct(rate, 0); } // whole number percent

function getSummary(national, filter) {
    if (filter === 'all') return national;
    return national.by_centre_type[filter] || national;
}
function filterSchools(schools, filter) {
    if (filter === 'all') return schools;
    return schools.filter(s => s.centre_type === filter);
}

// Quality score: weights Div I highest. Range 0–4. Like an inverse GPA.
function qualityScore(s) {
    if (!s.total_students || s.total_students === 0) return 0;
    return (s.div_1 * 4 + s.div_2 * 3 + s.div_3 * 2 + s.div_4 * 1 + s.div_0 * 0) / s.total_students;
}
function destroyChart(name) {
    if (charts[name]) { charts[name].destroy(); charts[name] = null; }
}

// ─── Hero ───────────────────────────────────────────────────

function renderHeroStats(summary) {
    // Pass rate (Div I-IV)
    document.getElementById('stat-pass').textContent = whole(summary.pass_rate);

    // Quality pass rate (Div I-III)
    const divs = summary.divisions;
    const qualityRate = (divs['I'] + divs['II'] + divs['III']) / summary.total_students;
    document.getElementById('stat-quality').textContent = whole(qualityRate);

    // YoY annotations vs 2024
    const prior = DATA.national.prior_year[currentFilter];
    function yoyLabel(current, prev) {
        const delta = Math.round((current - prev) * 1000) / 10; // one decimal pp
        const sign = delta >= 0 ? '+' : '';
        const arrow = delta >= 0 ? '\u2191' : '\u2193';
        return `(${arrow} ${sign}${delta}pp yoy)`;
    }
    document.getElementById('stat-pass-yoy').textContent =
        prior ? yoyLabel(summary.pass_rate, prior.pass_rate) : '';
    document.getElementById('stat-quality-yoy').textContent =
        prior ? yoyLabel(qualityRate, prior.quality_rate) : '';

    // Hero note: student count + centre count
    document.getElementById('stat-students').textContent = fmt(summary.total_students);
    document.getElementById('sample-count').textContent = fmt(summary.total_schools);
    const hints = { school: 'Showing active schools (S-prefix)', private: 'Showing private centres (P-prefix)', all: 'Showing all centres' };
    document.getElementById('filter-hint').textContent = hints[currentFilter];
}

// ─── Chart 1: Division Distribution (with inline %) ─────────

function renderDivisionChart(summary) {
    destroyChart('divisions');
    const ctx = document.getElementById('chart-divisions').getContext('2d');
    const divs = summary.divisions;
    const total = summary.total_students;
    const data = [divs['I'], divs['II'], divs['III'], divs['IV'], divs['0']];
    const pcts = data.map(d => Math.round((d / total) * 100));

    charts.divisions = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: DIV_LABELS,
            datasets: [{
                data: data, backgroundColor: DIV_COLORS, borderWidth: 0, borderRadius: 3,
            }],
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: true, aspectRatio: 1.6,
            plugins: {
                tooltip: { callbacks: { label: (c) => `${fmt(c.raw)} students (${pcts[c.dataIndex]}%)` } },
                // Inline percentage labels
                datalabels: false,
            },
            scales: {
                x: { display: false },
                y: { grid: { display: false } },
            },
        },
        plugins: [{
            id: 'inlineLabels',
            afterDatasetsDraw(chart) {
                const ctx = chart.ctx;
                chart.getDatasetMeta(0).data.forEach((bar, i) => {
                    ctx.save();
                    ctx.fillStyle = i < 3 ? '#fff' : C.espresso;
                    ctx.font = "600 12px 'DM Sans', sans-serif";
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    const x = bar.x + 8;
                    const y = bar.y;
                    ctx.fillText(`${pcts[i]}%`, Math.min(x, bar.x - 35 > bar.base ? bar.x - 35 : x), y);
                    ctx.restore();
                });
            },
        }],
    });

    document.getElementById('insight-national').innerHTML =
        `<strong>${whole(summary.pass_rate)}</strong> of students achieved Division I–IV (passing). ` +
        `Division IV is the most common outcome at <strong>${pcts[3]}%</strong>, while only ` +
        `<strong>${pcts[0]}%</strong> earned the top Division I.`;
}

// ─── Section 2: Div IV Narrative ────────────────────────────

function renderDiv4Narrative() {
    const d = DATA.extended.div4_narrative;
    const container = document.getElementById('div4-container');

    container.innerHTML = `<div class="anomaly-cards">
        <div class="anomaly-card">
            <h4>Division IV: Pass or Fail?</h4>
            <span class="anomaly-stat">${whole(d.div4_pct)} of all students</span>
            <p><strong>${fmt(d.div4_count)}</strong> students, nearly <strong>half</strong> of all test-takers, land in Division IV,
               the lowest passing grade. They are officially "passing" but scored between 18 and 21 points on a 7-point-per-subject scale.
               Division IV is essentially the minimum viable pass.</p>
        </div>
        <div class="anomaly-card">
            <h4>What if Division IV Was Failing?</h4>
            <span class="anomaly-stat">${whole(d.current_pass_rate)} → ${whole(d.without_div4_rate)}</span>
            <p>The national pass rate would <strong>collapse from ${whole(d.current_pass_rate)} to ${whole(d.without_div4_rate)}</strong>,
               a <strong>${d.drop_pp}pp drop</strong>. <strong>${whole(d.schools_would_flip_pct)}</strong> of schools
               (${fmt(d.schools_would_flip)}) would see their majority flip from passing to failing.
               Is a 95% pass rate meaningful when half of "passing" students barely clear the bar?</p>
        </div>
    </div>`;

    document.getElementById('insight-div4').innerHTML =
        `The gap between Division III and Division IV is the difference between a <strong>${whole(d.without_div4_rate)}</strong> ` +
        `and <strong>${whole(d.current_pass_rate)}</strong> national pass rate. Does that single boundary ` +
        `determine whether this is a story of progress or a story of grade inflation?`;
}

// ─── Chart 3: Gender (100% stacked horizontal bars) ─────────

function renderGenderChart() {
    destroyChart('gender');
    const ctx = document.getElementById('chart-gender').getContext('2d');
    const gbc = DATA.extended.gender_by_category;

    const labels = gbc.map(g => g.category);
    const maleRates = gbc.map(g => Math.round(g.male_rate * 100));
    const femaleRates = gbc.map(g => Math.round(g.female_rate * 100));
    // For 100% stacked: male portion and female portion of the "pass" metric
    // But the user wants each bar = 100% split by male/female pass rates
    // Actually: percentile stacked bar where each bar adds to 100%, broken by M/F
    // So for each category: male_share = male_rate / (male_rate + female_rate), female_share = remainder
    const maleShare = gbc.map(g => {
        const sum = g.male_rate + g.female_rate;
        return sum > 0 ? Math.round((g.male_rate / sum) * 100) : 50;
    });
    const femaleShare = maleShare.map(m => 100 - m);

    charts.gender = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Male', data: maleShare,
                    backgroundColor: C.espresso, borderWidth: 0, borderRadius: 0,
                },
                {
                    label: 'Female', data: femaleShare,
                    backgroundColor: C.claude, borderWidth: 0, borderRadius: 0,
                },
            ],
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: true, aspectRatio: 1.6,
            plugins: {
                legend: { display: true, position: 'top', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const g = gbc[ctx.dataIndex];
                            const rate = ctx.datasetIndex === 0 ? g.male_rate : g.female_rate;
                            const count = ctx.datasetIndex === 0 ? g.male_total : g.female_total;
                            return `${ctx.dataset.label}: ${whole(rate)} pass rate (${fmt(count)} students)`;
                        },
                    },
                },
            },
            scales: {
                x: { display: false, stacked: true, max: 100 },
                y: { stacked: true, grid: { display: false } },
            },
        },
        plugins: [{
            id: 'stackedLabels',
            afterDatasetsDraw(chart) {
                const ctx2 = chart.ctx;
                const meta0 = chart.getDatasetMeta(0);
                const meta1 = chart.getDatasetMeta(1);
                meta0.data.forEach((bar, i) => {
                    const g = gbc[i];
                    // Male label — center within the male segment
                    const mCenterX = (bar.base + bar.x) / 2;
                    const mw = Math.abs(bar.x - bar.base);
                    if (mw > 40) {
                        ctx2.save();
                        ctx2.fillStyle = '#fff';
                        ctx2.font = "600 11px 'DM Sans', sans-serif";
                        ctx2.textAlign = 'center';
                        ctx2.textBaseline = 'middle';
                        ctx2.fillText(whole(g.male_rate), mCenterX, bar.y);
                        ctx2.restore();
                    }
                    // Female label — center within the female segment
                    const fbar = meta1.data[i];
                    const fCenterX = (fbar.base + fbar.x) / 2;
                    const fw = Math.abs(fbar.x - fbar.base);
                    if (fw > 40) {
                        ctx2.save();
                        ctx2.fillStyle = '#fff';
                        ctx2.font = "600 11px 'DM Sans', sans-serif";
                        ctx2.textAlign = 'center';
                        ctx2.textBaseline = 'middle';
                        ctx2.fillText(whole(g.female_rate), fCenterX, fbar.y);
                        ctx2.restore();
                    }
                });
            },
        }],
    });

    let maxGap = 0, maxCat = '';
    gbc.forEach(g => {
        const gap = Math.abs(g.male_rate - g.female_rate) * 100;
        if (gap > maxGap) { maxGap = gap; maxCat = g.category; }
    });
    const bm = gbc.find(g => g.category === 'Basic Maths');

    // cGPI: Composite Gender Parity Index (extends UNESCO SDG 4.5.1)
    // Uses schools-filter gender data from national_summary (filter-independent, shown as context)
    const ggSchools = DATA.national.by_centre_type.school.gender_gap;
    const gpiParticipation = ggSchools.female_total / ggSchools.male_total;
    const gpiOutcome = ggSchools.female_pass_rate / ggSchools.male_pass_rate;
    const cgpi = Math.round(gpiParticipation * gpiOutcome * 100);
    const partPct = Math.round(gpiParticipation * 100);
    const outcomePct = Math.round(gpiOutcome * 100);

    document.getElementById('insight-gender').innerHTML =
        `<strong>${maxCat}</strong> has the widest gender gap at <strong>${Math.round(maxGap)}pp</strong>. ` +
        `In Basic Maths, <strong>${whole(bm.male_rate)}</strong> of male students pass vs ` +
        `<strong>${whole(bm.female_rate)}</strong> of female students. ` +
        `Bar widths show each gender's share of passing students. ` +
        `The more uneven the split, the larger the gap.` +
        `<br><br>` +
        `Zooming out: female students are <strong>${partPct - 100}%</strong> more represented in exam centres than male students ` +
        `(participation parity: ${partPct}), yet pass at a <strong>${100 - outcomePct}pp</strong> lower rate ` +
        `(outcome parity: ${outcomePct}). Combining both dimensions using the Composite Gender Parity Index ` +
        `(an extension of UNESCO SDG&nbsp;4.5.1) gives a cGPI of <strong>${cgpi}</strong>: ` +
        `female students are <strong>${cgpi - 100}%</strong> more likely to be in the passer pool than male students. ` +
        `Does high participation mask lower per-student quality access, or does it signal a structural shift in who shows up to sit the exam?`;
}

// ─── Chart 4: School Types ──────────────────────────────────

function renderSchoolTypes() {
    destroyChart('schoolTypes');
    const ctx = document.getElementById('chart-school-types').getContext('2d');
    const types = DATA.extended.school_types;
    const labels = types.map(t => t.type);
    const rates = types.map(t => t.avg_pass_rate * 100);
    const colors = [C.espresso, C.claude, C.olive, C.warmGray];

    charts.schoolTypes = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ data: rates, backgroundColor: colors, borderWidth: 0, borderRadius: 3, barPercentage: 0.6 }] },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2,
            plugins: {
                tooltip: { callbacks: { label: (c) => {
                    const t = types[c.dataIndex];
                    return `${Math.round(c.raw)}% avg pass rate (${fmt(t.schools)} schools, ${fmt(t.students)} students)`;
                }}},
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: C.borderLight }, min: 80, max: 102, ticks: { callback: v => v + '%' } },
            },
        },
    });

    const best = types.reduce((a, b) => a.avg_pass_rate > b.avg_pass_rate ? a : b);
    const coed = types.find(t => t.type.includes('Coed'));
    const diff = Math.round((best.avg_pass_rate - coed.avg_pass_rate) * 100);
    const minPct = Math.round(types.filter(t => !t.type.includes('Coed')).reduce((s, t) => s + t.students, 0) / types.reduce((s, t) => s + t.students, 0) * 100);
    document.getElementById('insight-school-types').innerHTML =
        `<strong>${best.type}</strong> schools lead at <strong>${whole(best.avg_pass_rate)}</strong>, ` +
        `<strong>${diff}pp</strong> above coed schools (${whole(coed.avg_pass_rate)}). ` +
        `Single-gender and religious schools outperform, but represent only <strong>${minPct}%</strong> of students.<br>` +
        `<em>* Religious schools identified by name keywords (Seminary, Islamic, Lutheran, Catholic, Adventist, Anglican, etc.). Results should be verified.</em>`;
}

// ─── Ownership classifier (name-based heuristic) ────────────
// NECTA pages have no ownership field. Classification by school name.
// High confidence: SEMINARY (~100%), LUTHERAN/LORETO/ADVENTIST (~100%), ACADEMY/INTERNATIONAL (~95%)
// Government: plain geographic names (~95% accurate)
const MISSION_RE = /\bSEMINARY\b|LUTHERAN|LORETO|ADVENTIST|SALESIAN|BENEDICTINE|FRANCISCAN|SPIRITAN|CONSOLATA|MONTFORT|MARYKNOLL|AGA KHAN|SALVATION|BAPTIST|PENTECOST|\bST\b\.?|SAINT |HOLY |CHRISTIAN |CATHOLIC|METHODIST|PRESBYTERIAN|CONVENT|MISSION SCHOOL|ISLAMIC SCHOOL/i;
const COMMERCIAL_RE = /\bINTERNATIONAL\b|\bACADEMY\b|ROYAL |ELITE |LAUREATE|EXCELLENCE|OSLO /i;

function ownershipType(name) {
    if (MISSION_RE.test(name)) return 'Mission / Religious';
    if (COMMERCIAL_RE.test(name)) return 'Private Commercial';
    return 'Government';
}

// ─── Section 4b: Ownership ──────────────────────────────────

function renderOwnership(allSchools) {
    destroyChart('ownership');
    const ctx = document.getElementById('chart-ownership').getContext('2d');

    // Only S-prefix, regular size for fair comparison
    const sSchools = filterSchools(allSchools, currentFilter === 'private' ? 'school' : currentFilter)
        .filter(s => s.total_students > SMALL_THRESHOLD);

    const groups = {
        'Mission / Religious': { schools: 0, students: 0, div1: 0, div2: 0, div3: 0, div4: 0, div0: 0 },
        'Private Commercial':  { schools: 0, students: 0, div1: 0, div2: 0, div3: 0, div4: 0, div0: 0 },
        'Government':          { schools: 0, students: 0, div1: 0, div2: 0, div3: 0, div4: 0, div0: 0 },
    };

    sSchools.forEach(s => {
        const g = groups[ownershipType(s.name)];
        if (!g) return;
        g.schools++;
        g.students += s.total_students;
        g.div1 += s.div_1; g.div2 += s.div_2; g.div3 += s.div_3;
        g.div4 += s.div_4; g.div0 += s.div_0;
    });

    const labels = Object.keys(groups);
    const colors = [C.terracotta, C.claude, C.espresso];

    // 100% stacked bar: each bar = proportion of students in each division
    const divKeys = ['div1','div2','div3','div4','div0'];
    const divColors = DIV_COLORS;
    const divLabels = ['Div I','Div II','Div III','Div IV','Div 0'];

    const datasets = divKeys.map((dk, di) => ({
        label: divLabels[di],
        data: labels.map(l => {
            const g = groups[l];
            return g.students > 0 ? (g[dk] / g.students) * 100 : 0;
        }),
        backgroundColor: divColors[di],
        borderWidth: 0,
    }));

    charts.ownership = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: true, aspectRatio: 2,
            plugins: {
                legend: { display: true, position: 'top', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
                tooltip: { callbacks: {
                    label: (c) => {
                        const g = groups[labels[c.dataIndex]];
                        return `${c.dataset.label}: ${Math.round(c.raw)}% (${fmt(g.schools)} schools, ${fmt(g.students)} students)`;
                    },
                }},
            },
            scales: {
                x: { display: false, stacked: true, max: 100 },
                y: { stacked: true, grid: { display: false } },
            },
        },
        plugins: [{
            id: 'ownershipLabels',
            afterDatasetsDraw(chart) {
                const { ctx: c } = chart;
                // Only label Div I (first dataset) — most meaningful signal
                const meta = chart.getDatasetMeta(0);
                meta.data.forEach((bar, i) => {
                    const val = Math.round(datasets[0].data[i]);
                    if (val < 3) return;
                    const segW = Math.abs(bar.x - bar.base);
                    if (segW < 30) return;
                    c.save();
                    c.fillStyle = '#fff';
                    c.font = "600 11px 'DM Sans', sans-serif";
                    c.textAlign = 'center';
                    c.textBaseline = 'middle';
                    c.fillText(`${val}% Div I`, (bar.base + bar.x) / 2, bar.y);
                    c.restore();
                });
            },
        }],
    });

    // Insight
    const g = groups['Government'], m = groups['Mission / Religious'];
    const govDiv1Pct = Math.round(g.div1 / g.students * 100);
    const misDiv1Pct = Math.round(m.div1 / m.students * 100);
    const ratio = Math.round(misDiv1Pct / govDiv1Pct);
    document.getElementById('insight-ownership').innerHTML =
        `Mission and religious schools produce <strong>${misDiv1Pct}%</strong> Division I students, ` +
        `compared to <strong>${govDiv1Pct}%</strong> at government schools, a <strong>${ratio}×</strong> difference. ` +
        `Pass rates are similar across all types; the gap is in the <em>quality</em> of passes. ` +
        `${Math.round(m.schools / (m.schools + g.schools + groups['Private Commercial'].schools) * 100)}% of schools are mission/religious: ` +
        `what explains the ${ratio}× Division I gap that pass rates alone do not show? ` +
        `<em>Classification is name-based (Seminary, Loreto, Lutheran, Academy, etc.) and not from an official registry.</em>`;
}

// ─── Section 5: Hidden Champions ────────────────────────────

function renderChampions(schools) {
    const container = document.getElementById('champions-container');
    const small = schools.filter(s => s.total_students > 0 && s.total_students <= SMALL_THRESHOLD);

    // Top 10 small schools (min 5 students for meaningful ranking)
    const top10 = [...small].filter(s => s.total_students >= 5)
        .sort((a, b) => b.pass_rate - a.pass_rate || b.total_students - a.total_students).slice(0, 10);

    // Very small anomalies (<15 students, <70% pass rate)
    const anomalies = small.filter(s => s.total_students < 15 && s.pass_rate < 0.7)
        .sort((a, b) => a.pass_rate - b.pass_rate);

    if (top10.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8c7e72;">No small schools in this view.</p>';
        document.getElementById('insight-champions').textContent = '';
        return;
    }

    let html = `<p style="font-size:0.8125rem;color:${C.warmGray};margin-bottom:1rem;">
        NECTA ranks schools with ≤40 candidates separately. ${fmt(small.length)} small schools
        (${Math.round(small.length / schools.length * 100)}% of total) in this view.</p>`;

    html += `<table class="champions-table">
        <thead><tr><th>#</th><th>School</th><th>Students</th><th>Pass Rate</th></tr></thead><tbody>`;
    top10.forEach((s, i) => {
        const rc = i < 3 ? `rank-${i + 1}` : 'rank-default';
        const bw = Math.round((s.pass_rate / (top10[0].pass_rate || 1)) * 100);
        html += `<tr><td><span class="rank-badge ${rc}">${i + 1}</span></td>
            <td><span class="school-name">${s.name}</span><span class="school-code">${s.code}</span></td>
            <td>${s.total_students}</td>
            <td><span class="pass-rate-bar" style="width:${bw}px"></span><strong>${whole(s.pass_rate)}</strong></td></tr>`;
    });
    html += '</tbody></table>';

    // Anomalies section
    if (anomalies.length > 0) {
        html += `<h4 style="margin-top:2rem;font-size:0.9375rem;color:${C.espresso};">Struggling Small Schools (&lt;15 students, &lt;70% pass rate)</h4>`;
        html += `<table class="champions-table" style="margin-top:0.5rem">
            <thead><tr><th>School</th><th>Students</th><th>Pass Rate</th></tr></thead><tbody>`;
        anomalies.forEach(s => {
            html += `<tr><td><span class="school-name">${s.name}</span><span class="school-code">${s.code}</span></td>
                <td>${s.total_students}</td><td><strong style="color:${C.claude}">${whole(s.pass_rate)}</strong></td></tr>`;
        });
        html += '</tbody></table>';
    }

    container.innerHTML = html;

    const perfect = top10.filter(c => c.pass_rate === 1).length;
    let insight = `How do schools with fewer than 40 students compete with schools ten times their size?`;
    if (perfect > 0) insight += ` <strong>${perfect}</strong> of the top 10 posted a perfect 100% pass rate.`;
    if (anomalies.length > 0) {
        insight += ` At the other end, <strong>${anomalies.length}</strong> very small schools (&lt;15 students) have pass rates below 70%. ` +
            `What separates the top performers from the struggling ones at the same scale?`;
    }
    document.getElementById('insight-champions').innerHTML = insight;
}

// ─── Section 6: Subject Pass Rates ──────────────────────────

function renderSubjectGroups(subjectData) {
    const container = document.getElementById('subjects-container');
    const subjects = subjectData.subjects;
    const minEnroll = currentFilter === 'private' ? 20 : 50;
    const byCode = {};
    subjects.forEach(s => { byCode[s.code] = s; });

    const catColors = {
        'Compulsory': C.espresso, 'STEM': C.terracotta, 'Languages': C.claude,
        'Social Studies': C.walnut, 'Business & Commerce': C.olive,
        'Religion': C.warmGray, 'Applied & Vocational': C.terracottaL,
    };

    let html = '<div class="subject-groups">';
    const shown = new Set();

    for (const [cat, codes] of Object.entries(SUBJECT_CATEGORIES)) {
        const catSubjects = codes.filter(c => !shown.has(c))
            .map(c => byCode[c]).filter(s => s && s.total_students >= minEnroll)
            .sort((a, b) => a.pass_rate - b.pass_rate);
        if (catSubjects.length === 0) continue;

        const color = catColors[cat] || C.warmGray;
        html += `<div class="subject-group"><div class="subject-group-header">${cat}</div>`;
        catSubjects.forEach(s => {
            shown.add(s.code);
            html += `<div class="subject-bar-row">
                <span class="subject-bar-name">${s.name}</span>
                <div class="subject-bar-track">
                    <div class="subject-bar-fill" style="width:${s.pass_rate * 100}%;background:${color}"></div>
                </div>
                <span class="subject-bar-value">${whole(s.pass_rate)}</span>
                <span class="subject-bar-enrollment">${fmt(s.total_students)}</span>
            </div>`;
        });
        html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;

    const allSorted = subjects.filter(s => s.total_students >= 1000).sort((a, b) => a.pass_rate - b.pass_rate);
    if (allSorted.length > 0) {
        const h = allSorted[0], e = allSorted[allSorted.length - 1];
        document.getElementById('insight-subjects').innerHTML =
            `<strong>${h.name}</strong> has the lowest pass rate at <strong>${whole(h.pass_rate)}</strong>, ` +
            `while <strong>${e.name}</strong> leads at <strong>${whole(e.pass_rate)}</strong>. ` +
            `Is Basic Mathematics a teaching gap, a curriculum problem, or simply the hardest subject to learn at scale?`;
    }
}

// ─── Section 7: STEM / Add Math ─────────────────────────────

function renderSTEM() {
    const am = DATA.extended.addmath_story;
    document.getElementById('stem-container').innerHTML = `<div class="anomaly-cards">
        <div class="anomaly-card">
            <h4>The Add Math Effect on Students</h4>
            <span class="anomaly-stat">${whole(am.dual_bm_pass_rate)} vs ${whole(am.overall_bm_pass_rate)}</span>
            <p>Students who take both Basic Math and Additional Math have a <strong>${whole(am.dual_bm_pass_rate)}</strong> Basic Math pass rate
               versus the national average of <strong>${whole(am.overall_bm_pass_rate)}</strong>.
               That covers ${fmt(am.dual_takers)} students.</p>
        </div>
        <div class="anomaly-card">
            <h4>The Add Math Effect on Schools</h4>
            <span class="anomaly-stat">${whole(am.am_school_bm_rate)} vs ${whole(am.no_am_school_bm_rate)}</span>
            <p>Schools that offer Add Math (only <strong>${am.schools_with_addmath}</strong> out of ~5,800) have a
               Basic Math pass rate of <strong>${whole(am.am_school_bm_rate)}</strong>, more than double the
               <strong>${whole(am.no_am_school_bm_rate)}</strong> at schools without it.</p>
        </div>
    </div>`;
    document.getElementById('insight-stem').innerHTML =
        `Students at schools that offer Add Math score nearly double the national average in Basic Math. ` +
        `Is that the curriculum, the teachers, or the students who self-select into those schools?`;
}

// ─── Section 8: Regional ────────────────────────────────────

function renderRegions() {
    const regions = window.TZ_REGIONS_2025;
    const container = document.getElementById('regions-map-container');

    if (!regions || !regions.length) {
        container.innerHTML = `<p style="padding:2rem;color:#8c7e72;">Regional map data unavailable.</p>`;
        return;
    }

    // ── Color interpolation (no D3 needed) ──────────────────────────────────
    // OrRd palette: #fff7ec → #fc8d59 → #7f0000
    function lerpColor(c1, c2, t) {
        const h = s => parseInt(s, 16);
        const r = Math.round(h(c1.slice(1,3)) * (1-t) + h(c2.slice(1,3)) * t);
        const g = Math.round(h(c1.slice(3,5)) * (1-t) + h(c2.slice(3,5)) * t);
        const b = Math.round(h(c1.slice(5,7)) * (1-t) + h(c2.slice(5,7)) * t);
        return `rgb(${r},${g},${b})`;
    }
    function metricColor(val, lo, hi) {
        const t = Math.max(0, Math.min(1, (val - lo) / (hi - lo)));
        if (t < 0.5) return lerpColor('#fff7ec', '#fc8d59', t * 2);
        return lerpColor('#fc8d59', '#7f0000', (t - 0.5) * 2);
    }

    const METRIC_KEY = { div1_rate: 'div1', div1_3_rate: 'div13', pass_rate: 'pass_' };
    const METRIC_LABELS = {
        div1_rate: 'Division I Rate',
        div1_3_rate: 'Quality Pass (Div I\u2013III)',
        pass_rate: 'Pass Rate (Div I\u2013IV)',
    };

    let currentMetric = 'div1_rate';

    // ── Build SVG ─────────────────────────────────────────────────────────────
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 700 720');
    svg.setAttribute('width', '100%');
    svg.style.display = 'block';

    // Tooltip
    const tip = document.createElement('div');
    Object.assign(tip.style, {
        position: 'absolute', pointerEvents: 'none', background: '#2c2418',
        color: '#faf6f1', fontSize: '0.75rem', lineHeight: '1.5',
        padding: '0.35rem 0.65rem', borderRadius: '3px',
        opacity: '0', whiteSpace: 'nowrap', transition: 'opacity 0.1s',
    });
    container.appendChild(svg);
    container.appendChild(tip);

    // Draw paths
    const pathEls = regions.map(r => {
        const el = document.createElementNS(NS, 'path');
        el.setAttribute('d', r.d);
        el.setAttribute('stroke', '#c8bfb2');
        el.setAttribute('stroke-width', '0.8');
        el.setAttribute('fill', '#e8e0d6');
        el.style.cursor = 'default';

        el.addEventListener('mousemove', e => {
            const rect = container.getBoundingClientRect();
            tip.style.opacity = '1';
            tip.style.left = (e.clientX - rect.left + 12) + 'px';
            tip.style.top  = (e.clientY - rect.top  - 10) + 'px';
            tip.innerHTML =
                `<strong>${r.name}</strong><br>` +
                `Div I Rate: ${(r.div1 * 100).toFixed(1)}%<br>` +
                `Quality Pass (I\u2013III): ${(r.div13 * 100).toFixed(1)}%<br>` +
                `Pass Rate (I\u2013IV): ${(r.pass_ * 100).toFixed(1)}%<br>` +
                `Schools: ${r.schools.toLocaleString()}<br>` +
                `Candidates: ${r.candidates.toLocaleString()}`;
            el.setAttribute('stroke', '#2c2418');
            el.setAttribute('stroke-width', '1.5');
        });
        el.addEventListener('mouseleave', () => {
            tip.style.opacity = '0';
            el.setAttribute('stroke', '#c8bfb2');
            el.setAttribute('stroke-width', '0.8');
        });

        svg.appendChild(el);
        return { el, r };
    });

    // ── Legend ────────────────────────────────────────────────────────────────
    const legendDiv = document.createElement('div');
    legendDiv.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:0.5rem;font-size:0.625rem;color:#8c7e72;';
    const gradBar = document.createElement('div');
    gradBar.style.cssText = 'width:160px;height:8px;border-radius:2px;background:linear-gradient(to right,#fff7ec,#fc8d59,#7f0000);flex-shrink:0;';
    const legendLabelEl = document.createElement('span');
    legendLabelEl.textContent = 'Division I Rate, 2025';
    legendDiv.innerHTML = '<span>Lower</span>';
    legendDiv.appendChild(gradBar);
    legendDiv.appendChild(document.createTextNode(' Higher \u2014 '));
    legendDiv.appendChild(legendLabelEl);
    container.appendChild(legendDiv);

    // ── Color regions ─────────────────────────────────────────────────────────
    function applyColors(metric) {
        const key = METRIC_KEY[metric];
        const vals = regions.map(r => r[key]).filter(v => v > 0);
        const lo = Math.min(...vals), hi = Math.max(...vals);
        pathEls.forEach(({ el, r }) => {
            const v = r[key];
            el.setAttribute('fill', v > 0 ? metricColor(v, lo, hi) : '#e8e0d6');
        });
        legendLabelEl.textContent = METRIC_LABELS[metric] + ', 2025';
        updateInsight(metric);
    }

    function updateInsight(metric) {
        const key = METRIC_KEY[metric];
        const sorted = [...regions].sort((a, b) => a[key] - b[key]);
        const worst = sorted[0], best = sorted[sorted.length - 1];
        const spread = ((best[key] - worst[key]) * 100).toFixed(1);
        document.getElementById('insight-regions').innerHTML =
            `${best.name} leads at <strong>${(best[key] * 100).toFixed(1)}%</strong> ${METRIC_LABELS[metric].toLowerCase()}; ` +
            `${worst.name} trails at <strong>${(worst[key] * 100).toFixed(1)}%</strong>, ` +
            `a <strong>${spread}pp</strong> gap across 26 mainland regions.`;
    }

    window.setRegionsMetric = function(metric) {
        currentMetric = metric;
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        const btnId = { div1_rate: 'regions-metric-div1', div1_3_rate: 'regions-metric-q', pass_rate: 'regions-metric-pass' }[metric];
        if (btnId) document.getElementById(btnId).classList.add('active');
        applyColors(metric);
    };

    applyColors(currentMetric);

    document.getElementById('map-note').textContent =
        'Source: NECTA 2025 CSEE. Zanzibar excluded (separate exam authority). Hover regions for detail.';
}

// ─── Section 9: Anomalies ───────────────────────────────────

function renderAnomalies(schools, summary, subjectData) {
    const container = document.getElementById('anomalies-container');
    const filtered = filterSchools(schools, currentFilter);
    const ext = DATA.extended;
    const cards = [];

    const basicMath = subjectData.subjects.find(s => s.code === 'B/MATH');
    if (basicMath) {
        cards.push({ title: 'The Basic Math Crisis', stat: whole(1 - basicMath.pass_rate) + ' fail',
            text: `<strong>${whole(1 - basicMath.pass_rate)}</strong> of students fail Basic Mathematics, the lowest pass rate of any compulsory subject.` });
    }

    const perfectSchools = filtered.filter(s => s.pass_rate === 1 && s.total_students >= 10);
    if (perfectSchools.length > 0) {
        const pPct = Math.round(perfectSchools.length / filtered.length * 100);
        cards.push({ title: 'Perfect Score Schools', stat: pPct + '%',
            text: `<strong>${pPct}%</strong> of schools (${fmt(perfectSchools.length)}) achieved 100% pass rate with 10+ students.` });
    }

    if (ext.all_div1_schools > 0) {
        cards.push({ title: 'All Division I vs All Division 0', stat: `${ext.all_div1_schools} vs ${ext.all_div0_schools}`,
            text: `<strong>${whole(ext.all_div1_pct)}</strong> of schools have <em>every</em> student in Division I ` +
                  `(${ext.all_div1_schools} schools), while ${ext.all_div0_schools} have all Division 0.` });
    }

    const gap = summary.gender_gap;
    const femalePct = Math.round(gap.female_total / (gap.male_total + gap.female_total) * 100);
    cards.push({ title: 'Enrollment Imbalance', stat: femalePct + '% female',
        text: `Female students make up <strong>${femalePct}%</strong> of test-takers but have a lower pass rate across most subjects.` });

    const niche = subjectData.subjects.filter(s => s.total_students < 500 && s.total_students >= 50);
    if (niche.length > 0) {
        cards.push({ title: 'Rare Subjects', stat: niche.length + ' subjects',
            text: `${niche.length} subjects have fewer than 500 students. Additional Mathematics has only 416 students but a strong 91% pass rate.` });
    }

    container.innerHTML = cards.map(c => `<div class="anomaly-card"><h4>${c.title}</h4>
        <span class="anomaly-stat">${c.stat}</span><p>${c.text}</p></div>`).join('');
}

// ─── Section 10: Distribution & Top 1% ──────────────────────

function renderDistribution(schools) {
    destroyChart('bell');
    const filtered = filterSchools(schools, currentFilter);
    const regular = filtered.filter(s => s.total_students > SMALL_THRESHOLD);
    const small = filtered.filter(s => s.total_students <= SMALL_THRESHOLD && s.total_students > 0);

    // Build smooth KDE-style bell curve using 20 fine bins (5% each)
    // then smooth with a simple moving average for the curve
    const NUM_BINS = 20;
    function buildBins(list) {
        const bins = Array(NUM_BINS).fill(0);
        list.forEach(s => {
            const idx = Math.min(Math.floor(s.pass_rate * NUM_BINS), NUM_BINS - 1);
            bins[idx]++;
        });
        return bins;
    }
    function smooth(arr, window = 2) {
        return arr.map((_, i) => {
            const slice = arr.slice(Math.max(0, i - window), i + window + 1);
            return slice.reduce((a, b) => a + b, 0) / slice.length;
        });
    }

    const regBins = smooth(buildBins(regular));
    const smallBins = smooth(buildBins(small));
    const binLabels = Array.from({length: NUM_BINS}, (_, i) => `${i * 5}%`);

    const ctx = document.getElementById('chart-bell').getContext('2d');
    charts.bell = new Chart(ctx, {
        type: 'line',
        data: {
            labels: binLabels,
            datasets: [
                {
                    label: 'Regular Schools (>40)',
                    data: regBins,
                    borderColor: C.espresso,
                    backgroundColor: C.espresso + '22',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                },
                {
                    label: 'Small Schools (≤40)',
                    data: smallBins,
                    borderColor: C.claude,
                    backgroundColor: C.claude + '22',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: true, position: 'top', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
                tooltip: { callbacks: {
                    title: (items) => `Pass rate: ${items[0].label}–${parseInt(items[0].label) + 5}%`,
                    label: (c) => `${c.dataset.label}: ~${Math.round(c.raw)} schools`,
                }},
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 }, maxTicksLimit: 10 },
                },
                y: { display: false, beginAtZero: true },
            },
        },
        plugins: [{
            id: 'distLabels',
            afterDraw(chart) { /* no per-point labels on smooth curve */ },
        }],
    });

    // Top 1% tables — regular and small
    const container = document.getElementById('top1-container');
    function getTop1(list, label) {
        const sorted = [...list].sort((a, b) => qualityScore(b) - qualityScore(a) || b.total_students - a.total_students);
        const cutoff = Math.min(10, Math.max(1, Math.ceil(list.length * 0.01)));
        const top = sorted.slice(0, cutoff);
        return { top, cutoff, total: list.length, label };
    }

    const regTop = getTop1(regular, 'Regular Schools');
    const smallTop = getTop1(small, 'Small Schools');

    let html = '';
    [regTop, smallTop].forEach(g => {
        if (g.top.length === 0) return;
        html += `<h4 style="margin-top:1.5rem;font-size:0.9375rem;color:${C.espresso};">
            Top ${g.cutoff}: ${g.label} <span style="color:${C.warmGray};font-weight:400;">(of ${fmt(g.total)})</span></h4>`;
        html += `<table class="champions-table" style="margin-top:0.5rem">
            <thead><tr><th>#</th><th>School</th><th>Students</th><th>Div I</th><th>Pass Rate</th></tr></thead><tbody>`;
        g.top.forEach((s, i) => {
            const rc = i < 3 ? `rank-${i + 1}` : 'rank-default';
            const div1Rate = s.total_students > 0 ? whole(s.div_1 / s.total_students) : '—';
            html += `<tr><td><span class="rank-badge ${rc}">${i + 1}</span></td>
                <td><span class="school-name">${s.name}</span><span class="school-code">${s.code}</span></td>
                <td>${s.total_students}</td>
                <td>${div1Rate}</td>
                <td><strong>${whole(s.pass_rate)}</strong></td></tr>`;
        });
        html += '</tbody></table>';
    });
    container.innerHTML = html;

    // Insight
    const regMedian = [...regular].sort((a, b) => a.pass_rate - b.pass_rate)[Math.floor(regular.length / 2)];
    const smallMedian = small.length > 0 ? [...small].sort((a, b) => a.pass_rate - b.pass_rate)[Math.floor(small.length / 2)] : null;
    let insight = `The median regular school has a <strong>${whole(regMedian?.pass_rate || 0)}</strong> pass rate.`;
    if (smallMedian) {
        insight += ` Small schools have a wider spread, with a median of <strong>${whole(smallMedian.pass_rate)}</strong>.`;
    }
    insight += ` The distribution shows where most schools cluster and how wide the spread is at both ends.`;
    document.getElementById('insight-distribution').innerHTML = insight;
}

// ─── School Search ──────────────────────────────────────────

let schoolDivisionChart = null;

let _searchHandler = null;
let _docClickHandler = null;

function initSchoolSearch(allSchools) {
    const input = document.getElementById('school-input');
    const resultsDiv = document.getElementById('search-results');

    // Clear previous value and results
    input.value = '';
    resultsDiv.innerHTML = '';
    resultsDiv.classList.remove('active');

    // Remove old listeners
    if (_searchHandler) input.removeEventListener('input', _searchHandler);
    if (_docClickHandler) document.removeEventListener('click', _docClickHandler);

    // Build scoped sets fresh each time
    function getSearchPool() {
        return filterSchools(allSchools, currentFilter);
    }
    function getSizeFiltered(list) {
        if (currentSizeFilter === 'small') return list.filter(s => s.total_students <= SMALL_THRESHOLD && s.total_students > 0);
        if (currentSizeFilter === 'regular') return list.filter(s => s.total_students > SMALL_THRESHOLD);
        return list.filter(s => s.total_students > 0);
    }
    function getScopedAndSorted() {
        const centreFiltered = getSearchPool();
        const scoped = getSizeFiltered(centreFiltered);
        const sorted = [...scoped].sort((a, b) => a.pass_rate - b.pass_rate);
        return { scoped, sorted };
    }

    _searchHandler = () => {
        const query = input.value.toLowerCase().trim();
        resultsDiv.innerHTML = '';
        if (query.length < 2) { resultsDiv.classList.remove('active'); return; }

        // Search within the centre-filtered set (respects S/P/All toggle)
        const searchPool = getSearchPool();
        const matches = searchPool
            .filter(s => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query))
            .slice(0, 10);

        if (matches.length === 0) { resultsDiv.classList.remove('active'); return; }
        resultsDiv.classList.add('active');
        matches.forEach(school => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            const tags = [];
            if (school.total_students <= SMALL_THRESHOLD && school.total_students > 0) tags.push('Small');
            const tagStr = tags.length ? ` <span style="color:${C.warmGray};font-size:0.7rem">(${tags.join(', ')})</span>` : '';
            div.innerHTML = `<span class="result-code">${school.code}</span>${school.name}${tagStr}`;
            div.addEventListener('click', () => {
                input.value = school.name;
                resultsDiv.classList.remove('active');
                const { scoped, sorted } = getScopedAndSorted();
                showSchoolCard(school, sorted, scoped);
            });
            resultsDiv.appendChild(div);
        });
    };

    _docClickHandler = (e) => {
        if (!e.target.closest('.search-wrapper')) resultsDiv.classList.remove('active');
    };

    input.addEventListener('input', _searchHandler);
    document.addEventListener('click', _docClickHandler);
}

function showSchoolCard(school, sorted, scopedSchools) {
    const card = document.getElementById('school-card');
    card.classList.remove('hidden');

    const typeLabel = school.centre_type === 'private' ? ' (Private Centre)' : '';
    const isSmall = school.total_students <= SMALL_THRESHOLD && school.total_students > 0;
    document.getElementById('card-name').textContent = `${school.code}: ${school.name}${typeLabel}`;

    const sizeNote = isSmall
        ? `Small School (≤${SMALL_THRESHOLD} students), ranked separately per NECTA guidelines`
        : `Regular School (>${SMALL_THRESHOLD} students)`;
    document.getElementById('card-size-note').textContent = sizeNote;

    document.getElementById('card-students').textContent = school.total_students;
    document.getElementById('card-passrate').textContent = whole(school.pass_rate);

    // Percentile by quality score (weighted by division) within same centre type + size
    function calcPercentile(pool, target) {
        const sorted = [...pool].sort((a, b) => qualityScore(a) - qualityScore(b));
        const idx = sorted.findIndex(s => s.code === target.code);
        if (idx < 0) return null;
        return Math.round((idx / sorted.length) * 100);
    }

    let pctl = calcPercentile(scopedSchools, school);
    if (pctl === null) {
        // Fallback: school outside current size filter
        const allCentreType = filterSchools(DATA.schools, currentFilter);
        const sameSize = isSmall
            ? allCentreType.filter(s => s.total_students <= SMALL_THRESHOLD && s.total_students > 0)
            : allCentreType.filter(s => s.total_students > SMALL_THRESHOLD);
        pctl = calcPercentile(sameSize, school);
    }
    document.getElementById('card-rank').textContent = pctl !== null ? `Top ${100 - pctl}%` : 'N/A';

    const avgPassRate = scopedSchools.length > 0 ? scopedSchools.reduce((s, x) => s + x.pass_rate, 0) / scopedSchools.length : 0;
    const diff = school.pass_rate - avgPassRate;
    const dir = diff >= 0 ? 'above' : 'below';
    const catLabel = isSmall ? 'small schools' : 'regular schools';
    document.getElementById('card-comparison').innerHTML =
        `This school is <strong>${Math.round(Math.abs(diff * 100))}pp ${dir}</strong> the ${catLabel} average (${whole(avgPassRate)}).`;

    if (schoolDivisionChart) schoolDivisionChart.destroy();
    const ctx = document.getElementById('chart-school-divisions').getContext('2d');
    const divData = [school.div_1, school.div_2, school.div_3, school.div_4, school.div_0];
    schoolDivisionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Div I', 'Div II', 'Div III', 'Div IV', 'Div 0'],
            datasets: [{ data: divData,
                backgroundColor: DIV_COLORS, borderWidth: 0, borderRadius: 2 }],
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.5,
            plugins: { tooltip: { callbacks: { label: (c) => `${fmt(c.raw)} students` } } },
            scales: {
                x: { grid: { display: false } },
                y: { display: false, beginAtZero: true },
            },
        },
        plugins: [{
            id: 'schoolDivLabels',
            afterDatasetsDraw(chart) {
                const { ctx: c } = chart;
                chart.getDatasetMeta(0).data.forEach((bar, i) => {
                    if (divData[i] === 0) return;
                    c.save();
                    c.font = "600 11px 'DM Sans', sans-serif";
                    c.textAlign = 'center';
                    // Inside bar, near top — use white text on dark bars, espresso on light
                    const barHeight = bar.base - bar.y;
                    if (barHeight > 20) {
                        c.fillStyle = i < 3 ? '#fff' : C.espresso;
                        c.textBaseline = 'top';
                        c.fillText(divData[i], bar.x, bar.y + 4);
                    } else {
                        // Bar too short — put above
                        c.fillStyle = C.espresso;
                        c.textBaseline = 'bottom';
                        c.fillText(divData[i], bar.x, bar.y - 2);
                    }
                    c.restore();
                });
            },
        }],
    });
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─── Render all ─────────────────────────────────────────────

function renderAll() {
    const summary = getSummary(DATA.national, currentFilter);
    const schools = filterSchools(DATA.schools, currentFilter);

    renderHeroStats(summary);
    renderDivisionChart(summary);
    renderDiv4Narrative();
    renderGenderChart();
    renderSchoolTypes();
    renderOwnership(DATA.schools);
    renderChampions(schools);
    renderSubjectGroups(DATA.subjects);
    renderSTEM();
    renderRegions();
    renderAnomalies(DATA.schools, summary, DATA.subjects);
    renderDistribution(DATA.schools);
    initSchoolSearch(DATA.schools);
    document.getElementById('school-card').classList.add('hidden');
}

// ─── Filter toggles ─────────────────────────────────────────

function initFilterToggle() {
    document.querySelectorAll('#filter-toggle .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (filter === currentFilter) return;
            document.querySelectorAll('#filter-toggle .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = filter;
            renderAll();
            document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Size toggle for school search
    document.querySelectorAll('#size-toggle .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            if (size === currentSizeFilter) return;
            document.querySelectorAll('#size-toggle .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSizeFilter = size;
            initSchoolSearch(DATA.schools);
            document.getElementById('school-card').classList.add('hidden');
        });
    });
}

// ─── Initialize ─────────────────────────────────────────────

async function init() {
    try {
        DATA = await loadData();
        initFilterToggle();
        renderAll();
    } catch (err) {
        console.error('Failed to load NECTA data:', err);
        document.querySelector('.hero-subtitle').textContent = 'Error loading data. Check console.';
    }
}

document.addEventListener('DOMContentLoaded', init);
