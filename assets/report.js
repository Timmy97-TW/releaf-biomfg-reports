/* ReLeaf Bioreactor Report builder.
   Everything stays in this browser. No network calls. */
(function () {
  'use strict';

  var KEY = 'releaf.bioreactor.report.v1';
  var TIERS = ['', 'measured', 'derived', 'model output', 'literature', 'not yet established'];

  /* ---------------------------------------------------------- schema */
  var SECTIONS = [
    {
      n: '0', id: 'control', title: 'Document control', short: 'Document control',
      note: 'What goes on the cover. A reader checks the version and the date before reading anything else, so these come first rather than last.',
      fields: [
        { id: 'title', label: 'Report title', w: 2, def: 'ReLeaf Bioreactor System — Biomanufacturing Report', key: 1 },
        { id: 'docno', label: 'Document number', ph: 'e.g. RLF-BIO-001' },
        { id: 'version', label: 'Version', ph: 'e.g. 0.1', key: 1 },
        { id: 'date', label: 'Date', type: 'date', key: 1 },
        { id: 'status', label: 'Status', type: 'select', opts: ['', 'Draft', 'For review', 'Approved', 'Superseded'], key: 1 },
        { id: 'classification', label: 'Classification', type: 'select', opts: ['', 'Team internal', 'Shareable', 'Public'] },
        { id: 'authors', label: 'Prepared by', ph: 'Names', key: 1 },
        { id: 'reviewers', label: 'Reviewed by', w: 2, ph: 'Names, or leave blank until reviewed' },
        { id: 'approver', label: 'Approved by', w: 2, ph: 'Name' },
        { id: 'abstract', label: 'Summary for the cover', type: 'textarea', w: 4, key: 1,
          hint: 'Two or three sentences a reader could stop after: what was run, what came out, and what is still missing.' }
      ],
      table: { id: 'revs', label: 'Revision history',
        cols: [ { id: 'ver', label: 'Version', w: '12%' }, { id: 'date', label: 'Date', w: '15%' },
                { id: 'by', label: 'By', w: '18%' }, { id: 'what', label: 'What changed', w: '55%' } ] }
    },
    {
      n: '1', id: 'scope', title: 'Scope', short: 'Scope',
      note: 'What this report covers, and what it deliberately does not. The second half is what keeps the first half honest.',
      fields: [
        { id: 'scope', label: 'In scope', type: 'textarea', w: 2, key: 1, ph: 'What this report covers.' },
        { id: 'outscope', label: 'Out of scope', type: 'textarea', w: 2,
          hint: 'Name where that material lives instead. Plant efficacy belongs on the Plants page.' }
      ]
    },
    {
      n: '2', id: 'system', title: 'System description', short: 'System',
      note: 'The hardware and the biology as built. A reader should be able to tell what they would need in order to repeat the run.',
      fields: [
        { id: 'chassis', label: 'Chassis strain', w: 2, ph: 'e.g. B. subtilis 168 or WB800N', key: 1 },
        { id: 'construct', label: 'Construct / plasmid', w: 2, ph: 'e.g. pSTK-Exp1' },
        { id: 'promoter', label: 'Promoter', ph: 'e.g. pVeg, constitutive' },
        { id: 'signalpep', label: 'Signal peptide', ph: 'e.g. Csn' },
        { id: 'product', label: 'Product', ph: 'e.g. ACC deaminase, 6xHis', key: 1 },
        { id: 'marker', label: 'Selection marker', ph: 'name it, do not leave blank' },
        { id: 'module', label: 'Membrane module', w: 2, ph: 'manufacturer and model' },
        { id: 'pore', label: 'Pore size' },
        { id: 'area', label: 'Membrane area' },
        { id: 'fibers', label: 'Fibres × lumen ID × length' },
        { id: 'holdup', label: 'Lumen hold-up volume' },
        { id: 'pump', label: 'Recirculation pump', w: 2, ph: 'model and rated range' },
        { id: 'sensors', label: 'Sensors in the loop', type: 'textarea', w: 4,
          hint: 'What is logged, how often, and the range of each sensor.' }
      ]
    },
    {
      n: '3', id: 'perf', title: 'Process performance', short: 'Performance',
      note: 'One row per run. Report both fits where you have them, and say which operating mode ran. A run with an unrecorded mode still goes in the table, with "unrecorded" in that column.',
      table: { id: 'runs', label: 'Run record',
        cols: [
          { id: 'run', label: 'Run ID', w: '11%' }, { id: 'date', label: 'Date', w: '10%' },
          { id: 'strain', label: 'Strain', w: '11%' }, { id: 'temp', label: 'Temp / rpm', w: '10%' },
          { id: 'mode', label: 'Mode', w: '9%', type: 'select', opts: ['', 'A closed', 'B harvested', 'C dead-end', 'flask', 'unrecorded'] },
          { id: 'flow', label: 'Cross-flow mL/min', w: '10%' },
          { id: 'od0', label: 'OD₆₀₀ start', w: '8%' }, { id: 'od1', label: 'OD₆₀₀ end', w: '8%' },
          { id: 'hours', label: 'Hours', w: '7%' }, { id: 'n', label: 'n points', w: '7%' },
          { id: 'fit', label: 'Fit, rate, R²', w: '14%' } ] },
      fields: [
        { id: 'perf_fit', label: 'Which fit was chosen, and why', type: 'textarea', w: 4, key: 1,
          hint: 'Give the linear and the exponential fit, then name the operating regime the winning fit implies.' },
        { id: 'perf_limit', label: 'Limits of these numbers', type: 'textarea', w: 4, key: 1,
          hint: 'The limit belongs with the result. Example: the feed rate was never checked volumetrically, so the dilution rate is nominal.' },
        { id: 'perf_tier', label: 'Evidence tier', type: 'select', opts: TIERS },
        { id: 'perf_src', label: 'Where the data lives', w: 3, ph: 'file path or notebook page' }
      ]
    },
    {
      n: '4', id: 'dsp', title: 'Recovery and downstream', short: 'Recovery',
      note: 'How the product gets from inside a cell to a sample tube, and what fraction survives each step. Write "not measured" rather than estimating.',
      table: { id: 'dsp', label: 'Recovery steps',
        cols: [ { id: 'step', label: 'Step', w: '24%' }, { id: 'what', label: 'What happens', w: '34%' },
                { id: 'rec', label: 'Recovery / result', w: '24%' },
                { id: 'tier', label: 'Evidence tier', w: '18%', type: 'select', opts: TIERS } ] },
      fields: [
        { id: 'dsp_qp', label: 'Permeate flow', ph: 'mL/min, or "unrecorded"' },
        { id: 'dsp_vl', label: 'Lumen loop volume', ph: 'mL' },
        { id: 'dsp_vs', label: 'Shell volume', ph: 'mL' },
        { id: 'dsp_sigma', label: 'Sieving coefficient', ph: 'and why' },
        { id: 'dsp_note', label: 'What the measurement supports', type: 'textarea', w: 4, key: 1,
          hint: 'The Western is semi-quantitative. Say what it supports: presence, apparent size, lumen against shell. Not g/L.' }
      ]
    },
    {
      n: '5', id: 'spec', title: 'Product specification', short: 'Specification',
      note: 'The layout from GRN 737: property, limit, method, result, n. A row with no limit is not a specification, it is an observation.',
      table: { id: 'spec', label: 'Product specification',
        cols: [ { id: 'prop', label: 'Property', w: '23%' }, { id: 'limit', label: 'Specification / limit', w: '21%' },
                { id: 'method', label: 'Method', w: '21%' }, { id: 'result', label: 'Result', w: '21%' },
                { id: 'n', label: 'n', w: '6%' },
                { id: 'tier', label: 'Tier', w: '8%', type: 'select', opts: TIERS } ] }
    },
    {
      n: '6', id: 'safety', title: 'Biosafety and regulatory route', short: 'Biosafety',
      note: 'What was tested, how often, and what the test could not see. Containment is a measurement, not a promise.',
      fields: [
        { id: 'host_status', label: 'Host organism safety status', w: 2, ph: 'risk group, GRAS or QPS status, with source' },
        { id: 'containment', label: 'Physical containment', w: 2, ph: 'what retains the cells, and its rated limit' },
        { id: 'plating', label: 'Shell-side plating result', type: 'textarea', w: 2, key: 1,
          hint: '100 µL on LB at each sample point. Give clean plates over total, and the detection limit.' },
        { id: 'passes', label: 'What the pore does not hold back', type: 'textarea', w: 2,
          hint: 'A 0.2 µm pore passes vesicles and debris. State that rather than claiming only free enzyme crosses.' },
        { id: 'route', label: 'Regulatory route for the product', type: 'textarea', w: 4,
          hint: 'Which law a purified peptide applied to soil falls under in our target market, and whether live cells or DNA reach the field.' }
      ]
    },
    {
      n: '7', id: 'claims', title: 'Claim ledger', short: 'Claims',
      note: 'One row per claim the page makes. A row with nothing in the evidence column comes off the page.',
      table: { id: 'claims', label: 'Claim ledger',
        cols: [ { id: 'claim', label: 'Claim', w: '34%' },
                { id: 'tier', label: 'Evidence tier', w: '16%', type: 'select', opts: TIERS },
                { id: 'where', label: 'Where the data lives', w: '25%' },
                { id: 'falsify', label: 'What would falsify it', w: '25%' } ] }
    },
    {
      n: '8', id: 'gaps', title: 'Open gaps and sources', short: 'Gaps',
      note: 'The declared gaps are why the rest of the report is believable. Do not trim this section before exporting.',
      table: { id: 'gaps', label: 'Open gaps',
        cols: [ { id: 'gap', label: 'What is missing', w: '32%' }, { id: 'why', label: 'Why it matters', w: '30%' },
                { id: 'plan', label: 'How we would close it', w: '26%' }, { id: 'owner', label: 'Owner', w: '12%' } ] },
      fields: [ { id: 'refs', label: 'Sources cited in this report', type: 'textarea', w: 4, key: 1,
                  hint: 'One per line. Internal file paths count.' } ]
    }
  ];

  /* Known values: the locked hardware spec and the Level-1 handoff of 2026-09-02. */
  var KNOWN = {
    title: 'ReLeaf Bioreactor System — Biomanufacturing Report',
    docno: 'RLF-BIO-001', status: 'Draft', classification: 'Team internal',
    chassis: 'B. subtilis 168',
    construct: 'pSTK-Exp1',
    promoter: 'pVeg, constitutive',
    signalpep: 'Csn',
    product: 'ACC deaminase (P. entomophila), C-terminal 6xHis; mature 37,636 Da, precursor 41,900 Da',
    module: 'Biophsep mPES Minilab HF-E-MI-M020-10-60-P',
    pore: '0.2 µm microfiltration',
    area: '150 cm² (0.0150 m²)',
    fibers: '8 fibres × 1.0 mm ID × 60 cm',
    holdup: '3.77 mL (calculated from geometry)',
    pump: 'Leirong ZP4000-N79H peristaltic, N-tube, rated 230–2600 mL/min',
    dsp_sigma: '≈1. A 0.2 µm pore against a 37.6 kDa protein does not sieve it, so shell concentration can lag lumen but not exceed it.',
    containment: 'Hollow-fibre lumen, 0.2 µm pore. Rods of 1–2 µm are retained.',
    passes: 'A 0.2 µm pore passes membrane vesicles and cell debris, so "only free enzyme crosses" is not a claim this membrane supports. Hollow-fibre modules can also develop pinhole defects, which is why shell fluid is plated at every sample point.',
    outscope: 'What the enzyme does once it reaches a plant. That evidence lives on the Plants page and is not repeated or summarised here.'
  };

  var KNOWN_SPEC = [
    { prop: 'Identity, mature protein', limit: 'band at 37.6 kDa; 41.9 kDa indicates unprocessed precursor', method: 'anti-His Western, lumen and shell', result: '', n: '', tier: '' },
    { prop: 'Concentration', limit: 'not yet set', method: 'ELISA (planned, not run)', result: 'not yet measured', n: '', tier: 'not yet established' },
    { prop: 'Enzyme activity', limit: 'not yet set', method: 'ACC deaminase assay, α-ketobutyrate', result: '', n: '', tier: '' },
    { prop: 'Viable cells in shell fluid', limit: 'no growth', method: '100 µL plated on LB at each sample point', result: '', n: '', tier: '' },
    { prop: 'Antibiotic-resistance genes in strain', limit: 'declare all', method: 'plasmid map', result: '', n: '', tier: '' }
  ];
  var KNOWN_GAPS = [
    { gap: 'OD₆₀₀ to dry cell weight conversion', why: 'Every OD-based number stays in OD units and cannot be converted to mass.', plan: 'Pellet known volumes across the OD range, wash, dry to constant weight, regress.', owner: '' },
    { gap: 'Operating mode, permeate flow and compartment volumes', why: 'Without the permeate flow the secretion rate cannot be recovered from shell-side data at all.', plan: 'Record the mode, permeate flow, both volumes and the transmembrane pressure at every sampling point.', owner: '' },
    { gap: 'Light control loop (CcaSR)', why: 'Every growth number on record is constitutive pVeg, so no dose-response claim is supported.', plan: 'Sequence the joined construct, then run an induction series.', owner: '' },
    { gap: 'Cost model', why: 'No cost or saving claim can be made without a bill of materials in the repository.', plan: 'Build the BOM, then compare cost per run against the incumbent price range.', owner: '' }
  ];

  /* ---------------------------------------------------------- state */
  var state = load(), lastSaved = null;

  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) {}
    return blank();
  }
  function blank() {
    var s = { fields: {}, tables: {} };
    SECTIONS.forEach(function (sec) {
      (sec.fields || []).forEach(function (f) { if (f.def) s.fields[f.id] = f.def; });
      if (sec.table) s.tables[sec.table.id] = [emptyRow(sec.table)];
    });
    return s;
  }
  function migrate(s) {
    if (!s.fields) s.fields = {};
    if (!s.tables) s.tables = {};
    SECTIONS.forEach(function (sec) {
      if (sec.table && !Array.isArray(s.tables[sec.table.id])) s.tables[sec.table.id] = [emptyRow(sec.table)];
    });
    return s;
  }
  function emptyRow(t) { var r = {}; t.cols.forEach(function (c) { r[c.id] = ''; }); return r; }

  var saveTimer = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); lastSaved = new Date(); flash(savedLabel()); }
    catch (e) { flash('Could not save — export .json to keep your work', true); }
    updateProgress();
  }
  function savedLabel() {
    if (!lastSaved) return 'Saved on this computer';
    var h = lastSaved.getHours(), m = lastSaved.getMinutes();
    return 'Saved ' + h + ':' + (m < 10 ? '0' : '') + m + ' on this computer';
  }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }
  function flash(msg, warn) {
    var el = document.getElementById('saveState');
    if (!el) return;
    el.textContent = msg;
    el.style.color = warn ? 'var(--amber)' : '';
    el.classList.add('flash');
    setTimeout(function () { el.classList.remove('flash'); }, 1000);
  }

  /* ---------------------------------------------------------- helpers */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function val(id) { return (state.fields[id] || '').trim(); }
  function rowsOf(id) {
    return (state.tables[id] || []).filter(function (r) {
      return Object.keys(r).some(function (k) { return String(r[k]).trim() !== ''; });
    });
  }
  function colsOf(id) {
    var f = null; SECTIONS.forEach(function (s) { if (s.table && s.table.id === id) f = s.table.cols; });
    return f || [];
  }
  function num(v) { var n = parseFloat(String(v).replace(/[^0-9.eE+-]/g, '')); return isFinite(n) ? n : null; }

  /* ---------------------------------------------------------- progress */
  function secStats(sec) {
    var tot = 0, got = 0;
    (sec.fields || []).forEach(function (f) { tot++; if (val(f.id)) got++; });
    if (sec.table) { tot++; if (rowsOf(sec.table.id).length) got++; }
    return { tot: tot, got: got };
  }
  function missingKeys() {
    var out = [];
    SECTIONS.forEach(function (sec) {
      (sec.fields || []).forEach(function (f) { if (f.key && !val(f.id)) out.push(sec.title + ' — ' + f.label); });
    });
    return out;
  }
  function updateProgress() {
    var tot = 0, got = 0;
    SECTIONS.forEach(function (sec) {
      var s = secStats(sec); tot += s.tot; got += s.got;
      var dot = document.querySelector('[data-dot="' + sec.id + '"]');
      if (dot) dot.className = 'dot' + (s.got === 0 ? '' : s.got === s.tot ? ' done' : ' part');
    });
    var pct = tot ? Math.round(got / tot * 100) : 0;
    var bar = document.getElementById('progBar'), lab = document.getElementById('progPct');
    if (bar) bar.style.width = pct + '%';
    if (lab) lab.textContent = pct + '% · ' + got + ' of ' + tot;
  }

  /* ---------------------------------------------------------- form */
  function buildField(f) {
    var wrap = el('div', { class: 'field' });
    if (f.w) wrap.style.gridColumn = 'span ' + f.w;
    var id = 'f_' + f.id;
    wrap.appendChild(el('label', { for: id, text: f.label }));
    var input;
    if (f.type === 'textarea') input = el('textarea', { id: id, placeholder: f.ph || '' });
    else if (f.type === 'select') {
      input = el('select', { id: id });
      (f.opts || []).forEach(function (o) { input.appendChild(el('option', { value: o, text: o === '' ? '—' : o })); });
    } else input = el('input', { type: f.type || 'text', id: id, placeholder: f.ph || '' });
    input.value = state.fields[f.id] || '';
    function on() { state.fields[f.id] = input.value; queueSave(); }
    input.addEventListener('input', on);
    input.addEventListener('change', on);
    wrap.appendChild(input);
    if (f.hint) wrap.appendChild(el('p', { class: 'hint', text: f.hint }));
    return wrap;
  }

  function buildTable(t) {
    var scroll = el('div', { class: 'tbl-scroll' });
    var tbl = el('table', { class: 'tbl-edit' });
    var hr = el('tr');
    t.cols.forEach(function (c) {
      var th = el('th', { text: c.label });
      if (c.w) th.style.width = c.w;
      hr.appendChild(th);
    });
    hr.appendChild(el('th', { text: '' }));
    tbl.appendChild(el('thead', {}, [hr]));
    var tbody = el('tbody');
    tbl.appendChild(tbody);
    scroll.appendChild(tbl);
    var count = el('span', { class: 'rowcount' });

    function render() {
      tbody.innerHTML = '';
      state.tables[t.id].forEach(function (row, i) {
        var tr = el('tr');
        t.cols.forEach(function (c) {
          var td = el('td'), inp;
          if (c.type === 'select') {
            inp = el('select', { 'aria-label': c.label });
            (c.opts || []).forEach(function (o) { inp.appendChild(el('option', { value: o, text: o === '' ? '—' : o })); });
          } else inp = el('input', { type: 'text', 'aria-label': c.label + ', row ' + (i + 1) });
          inp.value = row[c.id] || '';
          function on() { row[c.id] = inp.value; queueSave(); }
          inp.addEventListener('input', on);
          inp.addEventListener('change', on);
          td.appendChild(inp);
          tr.appendChild(td);
        });
        var tdd = el('td');
        var dup = el('button', { class: 'rowbtn', type: 'button', title: 'Duplicate this row', 'aria-label': 'Duplicate row ' + (i + 1), text: '⧉' });
        dup.addEventListener('click', function () {
          state.tables[t.id].splice(i + 1, 0, Object.assign({}, row)); save(); render();
        });
        var del = el('button', { class: 'rowbtn del', type: 'button', title: 'Delete this row', 'aria-label': 'Delete row ' + (i + 1), text: '✕' });
        del.addEventListener('click', function () {
          state.tables[t.id].splice(i, 1);
          if (!state.tables[t.id].length) state.tables[t.id].push(emptyRow(t));
          save(); render();
        });
        tdd.appendChild(dup); tdd.appendChild(del);
        tr.appendChild(tdd);
        tbody.appendChild(tr);
      });
      var n = rowsOf(t.id).length;
      count.textContent = n === 0 ? 'no rows filled in yet' : n === 1 ? '1 row' : n + ' rows';
    }
    render();

    var add = el('button', { class: 'btn secondary tiny', type: 'button', text: 'Add row' });
    add.addEventListener('click', function () { state.tables[t.id].push(emptyRow(t)); save(); render(); });
    return el('div', {}, [
      t.label ? el('h3', { style: 'font-size:15px;margin:0 0 8px', text: t.label }) : null,
      scroll, el('div', { class: 'btn-row' }, [add, count])
    ]);
  }

  function buildForm() {
    var form = document.getElementById('form');
    form.innerHTML = '';
    SECTIONS.forEach(function (sec) {
      var fs = el('fieldset', { class: 'sec', id: 'sec-' + sec.id });
      var lg = el('legend');
      lg.appendChild(el('span', { class: 'sec-num', text: 'Section ' + sec.n }));
      lg.appendChild(document.createTextNode(sec.title));
      fs.appendChild(lg);
      if (sec.note) fs.appendChild(el('p', { class: 'sec-note', text: sec.note }));
      if (sec.table) fs.appendChild(buildTable(sec.table));
      if (sec.fields && sec.fields.length) {
        var row = el('div', { class: 'row' });
        sec.fields.forEach(function (f) { row.appendChild(buildField(f)); });
        fs.appendChild(row);
      }
      form.appendChild(fs);
    });
    buildRail();
    updateProgress();
  }

  function buildRail() {
    var rail = document.getElementById('rail');
    if (!rail) return;
    var ol = el('ol');
    SECTIONS.forEach(function (sec) {
      var a = el('a', { href: '#sec-' + sec.id, 'data-sec': sec.id });
      a.appendChild(el('span', { class: 'n', text: sec.n }));
      var lab = el('span', {});
      lab.appendChild(document.createTextNode(sec.short));
      lab.appendChild(el('span', { class: 'dot', 'data-dot': sec.id }));
      a.appendChild(lab);
      ol.appendChild(el('li', {}, [a]));
    });
    rail.innerHTML = '';
    rail.appendChild(ol);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id.replace('sec-', '');
          rail.querySelectorAll('a').forEach(function (a) { a.classList.toggle('on', a.dataset.sec === id); });
        });
      }, { rootMargin: '-120px 0px -60% 0px' });
      SECTIONS.forEach(function (s) { var n = document.getElementById('sec-' + s.id); if (n) io.observe(n); });
    }
  }

  /* ---------------------------------------------------------- document */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function or(id, fb) { var v = val(id); return v ? esc(v) : '<span class="empty">' + esc(fb || 'not filled in') + '</span>'; }
  function para(id, fb) {
    var v = val(id);
    return v ? '<p>' + esc(v).replace(/\n/g, '<br>') + '</p>' : '<p class="empty">' + esc(fb || 'Not filled in.') + '</p>';
  }
  function pill(t) {
    if (!t) return '';
    var c = { 'measured': 'measured', 'derived': 'derived', 'model output': 'model', 'literature': 'lit', 'not yet established': 'none' }[t] || '';
    return '<span class="pill ' + c + '">' + esc(t) + '</span>';
  }
  function kv(pairs) {
    return '<div class="kv">' + pairs.map(function (p) {
      return '<div><b>' + esc(p[0]) + '</b><span>' + p[1] + '</span></div>';
    }).join('') + '</div>';
  }

  var TBL = 0, FIG = 0;
  function table(tid, caption, tierCol) {
    var rows = rowsOf(tid), cols = colsOf(tid);
    if (!rows.length) return '<p class="empty">No rows entered.</p>';
    TBL++;
    var h = '<table class="data"><thead><tr>' + cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr>' + cols.map(function (c) {
        var v = (r[c.id] || '').trim();
        if (c.id === tierCol) return '<td>' + (v ? pill(v) : '<span class="empty">—</span>') + '</td>';
        return '<td>' + (v ? esc(v) : '<span class="empty">—</span>') + '</td>';
      }).join('') + '</tr>';
    });
    h += '</tbody></table>';
    h += '<p class="cap"><b>Table ' + TBL + '.</b> ' + caption + '</p>';
    return h;
  }

  /* Figure: start and end optical density, drawn from the run record */
  function figGrowth() {
    var rows = rowsOf('runs').map(function (r) {
      return { id: r.run || '—', a: num(r.od0), b: num(r.od1), h: num(r.hours) };
    }).filter(function (r) { return r.a !== null && r.b !== null; });
    if (!rows.length) return '';
    var max = 0;
    rows.forEach(function (r) { max = Math.max(max, r.a, r.b); });
    max = max * 1.18 || 1;
    var X0 = 104, X1 = 500, top = 24, step = 26, H = top + rows.length * step + 32;
    var x = function (v) { return X0 + v / max * (X1 - X0); };
    var s = '<svg viewBox="0 0 600 ' + H + '" role="img" aria-label="Optical density at the start and the end of each run.">';
    for (var g = 0; g <= 4; g++) {
      var gv = max * g / 4, gx = x(gv);
      s += '<line x1="' + gx.toFixed(1) + '" y1="' + (top - 12) + '" x2="' + gx.toFixed(1) + '" y2="' + (top + rows.length * step - 10) + '" stroke="#e2e2e7" stroke-width="1"/>';
      s += '<text x="' + gx.toFixed(1) + '" y="' + (top + rows.length * step + 6) + '" text-anchor="middle" font-size="8" fill="#85858e">' + gv.toFixed(2) + '</text>';
    }
    rows.forEach(function (r, i) {
      var y = top + i * step;
      s += '<text x="' + (X0 - 10) + '" y="' + (y + 3) + '" text-anchor="end" font-size="8.5" fill="#16161a">' + esc(r.id) + '</text>';
      s += '<line x1="' + x(r.a).toFixed(1) + '" y1="' + y + '" x2="' + x(r.b).toFixed(1) + '" y2="' + y + '" stroke="#16161a" stroke-width="1.5"/>';
      s += '<circle cx="' + x(r.a).toFixed(1) + '" cy="' + y + '" r="3.4" fill="#fff" stroke="#16161a" stroke-width="1.5"/>';
      s += '<circle cx="' + x(r.b).toFixed(1) + '" cy="' + y + '" r="3.8" fill="#16161a"/>';
      s += '<text x="' + (x(r.b) + 9).toFixed(1) + '" y="' + (y + 3) + '" font-size="8" fill="#4a4a52">' +
        esc(r.b.toFixed(2) + (r.h ? ' after ' + r.h + ' h' : '')) + '</text>';
    });
    s += '<text x="' + X0 + '" y="' + (top + rows.length * step + 22) + '" font-size="8" fill="#85858e">OD600 · open circle = start, filled = end</text>';
    s += '</svg>';
    FIG++;
    return '<figure><div class="figbox">' + s + '</div><p class="cap"><b>Figure ' + FIG +
      '.</b> Optical density at the start and the end of each run in Table 1, drawn from the values entered above. ' +
      'It records two endpoints per run and is not a growth curve.</p></figure>';
  }

  /* Figure: how much of this report rests on measurement */
  function figEvidence() {
    var counts = {}, total = 0;
    ['spec', 'dsp', 'claims'].forEach(function (tid) {
      rowsOf(tid).forEach(function (r) {
        var t = (r.tier || '').trim() || 'not stated';
        counts[t] = (counts[t] || 0) + 1; total++;
      });
    });
    if (!total) return '';
    var order = ['measured', 'derived', 'model output', 'literature', 'not yet established', 'not stated'];
    var fills = { 'measured': '#16161a', 'derived': '#4a4a52', 'model output': '#7c7c86', 'literature': '#a8a8b2', 'not yet established': '#cfcfd6', 'not stated': 'url(#hatch)' };
    var X0 = 6, W = 588, x = X0;
    var s = '<svg viewBox="0 0 600 78" role="img" aria-label="How many entries in this report carry each evidence tier.">';
    s += '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="6" height="6" fill="#ffffff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#9a9aa4" stroke-width="2"/></pattern></defs>';
    order.forEach(function (k) {
      if (!counts[k]) return;
      var w = counts[k] / total * W;
      s += '<rect x="' + x.toFixed(1) + '" y="6" width="' + Math.max(w - 2, 1).toFixed(1) + '" height="22" rx="3" fill="' + fills[k] + '" stroke="#c7c7ce" stroke-width=".5"/>';
      if (w > 30) s += '<text x="' + (x + (w - 2) / 2).toFixed(1) + '" y="21" text-anchor="middle" font-size="9" font-weight="700" fill="' +
        (k === 'measured' || k === 'derived' || k === 'model output' ? '#ffffff' : '#16161a') + '">' + counts[k] + '</text>';
      x += w;
    });
    var lx = X0, ly = 48;
    order.forEach(function (k) {
      if (!counts[k]) return;
      var label = k + ' (' + counts[k] + ')';
      var wpx = label.length * 4.6 + 20;
      if (lx + wpx > 594) { lx = X0; ly += 15; }
      s += '<rect x="' + lx + '" y="' + (ly - 7) + '" width="8" height="8" rx="2" fill="' + fills[k] + '" stroke="#9a9aa4" stroke-width=".6"/>';
      s += '<text x="' + (lx + 12) + '" y="' + ly + '" font-size="8" fill="#4a4a52">' + esc(label) + '</text>';
      lx += wpx;
    });
    s += '</svg>';
    FIG++;
    return '<figure><div class="figbox">' + s + '</div><p class="cap"><b>Figure ' + FIG +
      '.</b> Evidence tier of all ' + total + ' entries in the specification, recovery and claim tables. ' +
      'The hatched segment is entries with no tier at all, counted separately because an untiered claim is not yet evidence.</p></figure>';
  }

  function schematic() {
    var src = document.querySelector('figure.fig svg.chart');
    if (!src) return '';
    FIG++;
    return '<figure><div class="figbox">' + src.outerHTML + '</div><p class="cap"><b>Figure ' + FIG +
      '.</b> The loop, with each measurement point tagged by the section of this report it fills.</p></figure>';
  }

  function buildReport() {
    TBL = 0; FIG = 0;
    var today = new Date().toISOString().slice(0, 10);
    var cls = val('classification') || 'Team internal';
    var titleTxt = val('title') || 'ReLeaf Bioreactor System — Biomanufacturing Report';
    var h = '<div class="rpt">';

    h += '<div class="runfoot">' + esc(titleTxt) + ' · ' + esc(val('docno') || 'no document number') +
      ' · version ' + esc(val('version') || '—') + ' · ' + esc(cls) + '</div>';

    /* cover */
    h += '<div class="cover">';
    h += '<div class="cover-top"><img src="assets/logo.png" alt="">' +
      '<div class="org">ReLeaf<span>iGEM 2026 · Biomanufacturing</span></div>' +
      '<div class="cls">' + esc(cls) + '</div></div>';
    h += '<div class="cover-mid"><p class="kind">Biomanufacturing report</p><h1>' + esc(titleTxt) + '</h1>' +
      '<div class="abs">' + (val('abstract') ? esc(val('abstract')).replace(/\n/g, '<br>') :
        '<span class="empty">No summary written. A reader who stops after the cover should still learn what was run and what came out.</span>') +
      '</div></div>';
    h += '<div class="cover-foot"><table class="ctrl">' +
      '<tr><th>Document number</th><td>' + or('docno', 'not assigned') + '</td></tr>' +
      '<tr><th>Version</th><td>' + or('version', '—') + '</td></tr>' +
      '<tr><th>Status</th><td>' + or('status', 'not stated') + '</td></tr>' +
      '<tr><th>Date</th><td>' + or('date', today) + '</td></tr>' +
      '<tr><th>Prepared by</th><td>' + or('authors', '—') + '</td></tr>' +
      '<tr><th>Reviewed by</th><td>' + or('reviewers', 'not reviewed') + '</td></tr>' +
      '<tr><th>Approved by</th><td>' + or('approver', 'not approved') + '</td></tr>' +
      '</table></div></div>';

    /* contents */
    h += '<section><h2><span class="n">—</span>Contents</h2><ol class="toc">';
    SECTIONS.slice(1).forEach(function (s) { h += '<li><b>' + s.n + '</b>' + esc(s.title) + '</li>'; });
    h += '<li><b>9</b>Sources</li></ol>';
    h += '<h3>Revision history</h3>' + table('revs', 'Every version of this document and what changed in it.');
    h += '</section>';

    h += '<section><h2><span class="n">1</span>Scope</h2>';
    h += '<h3>In scope</h3>' + para('scope', 'Scope not stated. Say what this report covers before circulating it.');
    h += '<h3>Out of scope</h3>' + para('outscope', 'Not stated.');
    h += '</section>';

    h += '<section><h2><span class="n">2</span>System description</h2>';
    h += '<h3>Biology</h3>' + kv([['Chassis strain', or('chassis')], ['Construct', or('construct')],
      ['Promoter', or('promoter')], ['Signal peptide', or('signalpep')],
      ['Product', or('product')], ['Selection marker', or('marker')]]);
    h += '<h3>Hardware</h3>' + kv([['Membrane module', or('module')], ['Pore size', or('pore')],
      ['Membrane area', or('area')], ['Fibres', or('fibers')],
      ['Lumen hold-up', or('holdup')], ['Recirculation pump', or('pump')]]);
    h += schematic();
    h += '<h3>Instrumentation</h3>' + para('sensors');
    h += '</section>';

    h += '<section><h2><span class="n">3</span>Process performance</h2>';
    h += table('runs', 'Every run behind the numbers in this section. A blank cell means the value was not recorded, not that it was zero.');
    h += figGrowth();
    h += '<h3>Fit</h3>' + para('perf_fit');
    h += '<h3>Limits of these numbers</h3>' + para('perf_limit');
    h += '<p class="note">Evidence tier: ' + (val('perf_tier') ? pill(val('perf_tier')) : '<span class="empty">not stated</span>') +
      ' · Data location: ' + or('perf_src', 'not stated') + '</p>';
    h += '</section>';

    h += '<section><h2><span class="n">4</span>Recovery and downstream</h2>';
    h += kv([['Permeate flow', or('dsp_qp')], ['Lumen loop volume', or('dsp_vl')],
      ['Shell volume', or('dsp_vs')], ['Sieving coefficient', or('dsp_sigma')]]);
    h += table('dsp', 'Each recovery step and what survives it.', 'tier');
    h += '<h3>What the measurement supports</h3>' + para('dsp_note');
    h += '</section>';

    h += '<section><h2><span class="n">5</span>Product specification</h2>';
    h += table('spec', 'Specification, method and result for each property. A row with no limit is an observation, not a specification.', 'tier');
    h += '</section>';

    h += '<section><h2><span class="n">6</span>Biosafety and regulatory route</h2>';
    h += kv([['Host safety status', or('host_status')], ['Physical containment', or('containment')]]);
    h += '<h3>Shell-side plating</h3>' + para('plating');
    h += '<h3>What the pore does not hold back</h3>' + para('passes');
    h += '<h3>Regulatory route</h3>' + para('route');
    h += '</section>';

    h += '<section><h2><span class="n">7</span>Claim ledger</h2>';
    h += table('claims', 'Every claim this report supports, with the evidence behind it and the result that would overturn it.', 'tier');
    h += figEvidence();
    h += '</section>';

    h += '<section><h2><span class="n">8</span>Open gaps</h2>';
    h += rowsOf('gaps').length ? table('gaps', 'What is missing, why it matters, and what would close it.')
      : '<div class="gapbox">No gaps declared. A report with no declared gaps is usually an incomplete report rather than a complete system.</div>';
    h += '</section>';

    h += '<section><h2><span class="n">9</span>Sources</h2>';
    var refs = val('refs');
    h += refs ? '<ol class="note" style="padding-left:16px">' + refs.split('\n').filter(function (l) { return l.trim(); })
      .map(function (l) { return '<li>' + esc(l.trim()) + '</li>'; }).join('') + '</ol>'
      : '<p class="empty">No sources listed.</p>';
    h += '</section>';

    h += '<div class="sign"><div>Prepared by<br>signature and date</div><div>Reviewed by<br>signature and date</div><div>Approved by<br>signature and date</div></div>';
    h += '<p class="endnote">Generated ' + esc(today) + ' from the ReLeaf Bioreactor Report builder. ' +
      'Every value in this document was typed by its authors; nothing here is read automatically from an instrument. ' +
      'Items shown as "not filled in" were blank at the time of export.</p>';
    h += '</div>';
    return h;
  }

  /* ---------------------------------------------------------- actions */
  function fillKnown() {
    var n = 0;
    Object.keys(KNOWN).forEach(function (k) { if (!val(k)) { state.fields[k] = KNOWN[k]; n++; } });
    if (!val('date')) { state.fields.date = new Date().toISOString().slice(0, 10); n++; }
    if (!rowsOf('spec').length) { state.tables.spec = KNOWN_SPEC.map(function (r) { return Object.assign({}, r); }); n++; }
    if (!rowsOf('gaps').length) { state.tables.gaps = KNOWN_GAPS.map(function (r) { return Object.assign({}, r); }); n++; }
    save(); buildForm();
    flash(n ? 'Filled ' + n + ' empty items — check each one' : 'Nothing empty to fill');
  }

  function download(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type }));
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function exportJson() {
    var stamp = (val('date') || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    var who = (val('authors') || 'releaf').split(/[,;\s]+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    download('releaf-bioreactor-' + stamp + '-' + (who || 'report') + '.json', JSON.stringify(state, null, 2), 'application/json');
    flash('Exported .json');
  }
  function importJson(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var next = JSON.parse(r.result);
        if (!next || typeof next !== 'object' || !next.fields || !next.tables) throw new Error('shape');
        if (!confirm('Import replaces everything in this form. Export your own copy first if you have not. Continue?')) return;
        state = migrate(next); save(); buildForm(); flash('Imported');
      } catch (e) { alert('That file is not a report export from this page.'); }
    };
    r.readAsText(file);
  }
  function clearAll() {
    if (!confirm('Clear everything in this form on this computer? Export a .json first if you want to keep it.')) return;
    state = blank(); save(); buildForm(); flash('Cleared');
  }

  function openPreview() {
    var html = buildReport();
    document.getElementById('report').innerHTML = html;
    document.getElementById('pvPage').innerHTML = html;
    var miss = missingKeys();
    document.getElementById('pvMiss').textContent = miss.length
      ? (miss.length === 1 ? '1 key field is still empty: ' : miss.length + ' key fields are still empty: ') +
        miss.slice(0, 2).join('; ') + (miss.length > 2 ? ', and ' + (miss.length - 2) + ' more' : '')
      : 'Every key field is filled in.';
    document.getElementById('previewWrap').classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closePreview() {
    document.getElementById('previewWrap').classList.remove('on');
    document.body.style.overflow = '';
  }
  function exportPdf() {
    document.getElementById('report').innerHTML = buildReport();
    var prev = document.title;
    document.title = (val('docno') ? val('docno') + ' ' : '') + (val('title') || 'ReLeaf Bioreactor Report');
    window.addEventListener('afterprint', function restore() {
      document.title = prev; window.removeEventListener('afterprint', restore);
    });
    setTimeout(function () { window.print(); }, 60);
  }

  /* ---------------------------------------------------------- wire up */
  buildForm();
  flash(savedLabel());
  document.getElementById('btnKnown').addEventListener('click', fillKnown);
  document.getElementById('btnExportJson').addEventListener('click', exportJson);
  document.getElementById('btnClear').addEventListener('click', clearAll);
  document.getElementById('btnPreview').addEventListener('click', openPreview);
  document.getElementById('btnPdf').addEventListener('click', exportPdf);
  document.getElementById('pvClose').addEventListener('click', closePreview);
  document.getElementById('pvPdf').addEventListener('click', exportPdf);
  document.getElementById('importFile').addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) importJson(e.target.files[0]);
    e.target.value = '';
  });
  document.addEventListener('keydown', function (e) {
    var meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); exportJson(); }
    if (e.key === 'Escape' && document.getElementById('previewWrap').classList.contains('on')) closePreview();
  });
  window.addEventListener('beforeprint', function () {
    if (!document.getElementById('report').innerHTML) document.getElementById('report').innerHTML = buildReport();
  });
})();
