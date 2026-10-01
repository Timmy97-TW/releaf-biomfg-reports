/* ReLeaf Bioreactor Report builder.
   Everything lives in this browser. No network calls. */
(function () {
  'use strict';

  var KEY = 'releaf.bioreactor.report.v1';

  var TIERS = ['', 'measured', 'derived', 'model output', 'literature', 'not yet established'];

  /* ---------- schema ---------- */
  var SECTIONS = [
    {
      n: '1', id: 'cover', title: 'Cover',
      note: 'Who wrote this, which system it describes, and when. The version and date are what tell a reader which numbers are current.',
      fields: [
        { id: 'title', label: 'Report title', w: 2, def: 'ReLeaf Bioreactor System — Biomanufacturing Report' },
        { id: 'version', label: 'Version', ph: 'e.g. 0.1 draft' },
        { id: 'date', label: 'Date', type: 'date' },
        { id: 'authors', label: 'Prepared by', w: 2, ph: 'Names' },
        { id: 'reviewers', label: 'Reviewed by', w: 2, ph: 'Names, or leave blank until reviewed' },
        { id: 'scope', label: 'Scope sentence', type: 'textarea', w: 4,
          hint: 'One or two sentences on what this report covers and what it does not. Plant efficacy belongs on the Plants page.' }
      ]
    },
    {
      n: '2', id: 'system', title: 'System description',
      note: 'The hardware and the biology, as built. A reader should be able to tell what they would need to repeat the run.',
      fields: [
        { id: 'chassis', label: 'Chassis strain', w: 2, ph: 'e.g. B. subtilis 168 or WB800N' },
        { id: 'construct', label: 'Construct / plasmid', w: 2, ph: 'e.g. pSTK-Exp1' },
        { id: 'promoter', label: 'Promoter', ph: 'e.g. pVeg, constitutive' },
        { id: 'signalpep', label: 'Signal peptide', ph: 'e.g. Csn' },
        { id: 'product', label: 'Product', ph: 'e.g. ACC deaminase, 6xHis' },
        { id: 'marker', label: 'Selection marker', ph: 'name it, do not leave blank' },
        { id: 'module', label: 'Membrane module', w: 2, ph: 'manufacturer and model' },
        { id: 'pore', label: 'Pore size' },
        { id: 'area', label: 'Membrane area' },
        { id: 'fibers', label: 'Fibres × lumen ID × length' },
        { id: 'holdup', label: 'Lumen hold-up volume' },
        { id: 'pump', label: 'Recirculation pump', w: 2, ph: 'model and rated range' },
        { id: 'sensors', label: 'Sensors in the loop', type: 'textarea', w: 4, ph: 'What is logged, at what interval, and the range of each sensor.' }
      ]
    },
    {
      n: '3', id: 'perf', title: 'Process performance',
      note: 'One row per run. Report both fits where you have them, and say which operating mode ran. A run with an unrecorded mode still goes in the table, with "unrecorded" in that column.',
      table: {
        id: 'runs',
        cols: [
          { id: 'run', label: 'Run ID', w: '11%' },
          { id: 'date', label: 'Date', w: '10%' },
          { id: 'strain', label: 'Strain', w: '11%' },
          { id: 'temp', label: 'Temp / rpm', w: '10%' },
          { id: 'mode', label: 'Mode', w: '8%', type: 'select', opts: ['', 'A closed', 'B harvested', 'C dead-end', 'flask', 'unrecorded'] },
          { id: 'flow', label: 'Cross-flow (mL/min)', w: '10%' },
          { id: 'od0', label: 'OD₆₀₀ start', w: '8%' },
          { id: 'od1', label: 'OD₆₀₀ end', w: '8%' },
          { id: 'hours', label: 'Hours / n points', w: '9%' },
          { id: 'fit', label: 'Fit, rate, R²', w: '15%' }
        ]
      },
      fields: [
        { id: 'perf_fit', label: 'Which fit was chosen and why', type: 'textarea', w: 4,
          hint: 'Give the linear and the exponential fit, then name the operating regime the winning fit implies.' },
        { id: 'perf_limit', label: 'Limits of these numbers', type: 'textarea', w: 4,
          hint: 'Put the limit in the same place as the result. Example: feed rate was not volumetrically checked, so the dilution rate is nominal.' },
        { id: 'perf_tier', label: 'Evidence tier', type: 'select', opts: TIERS },
        { id: 'perf_src', label: 'Where the data lives', w: 3, ph: 'file path or notebook page' }
      ]
    },
    {
      n: '4', id: 'dsp', title: 'Recovery and downstream',
      note: 'How the product gets from inside a cell to a sample tube, and what fraction survives each step. Write "not measured" rather than estimating.',
      table: {
        id: 'dsp',
        cols: [
          { id: 'step', label: 'Step', w: '26%' },
          { id: 'what', label: 'What happens', w: '34%' },
          { id: 'rec', label: 'Recovery / result', w: '22%' },
          { id: 'tier', label: 'Evidence tier', w: '18%', type: 'select', opts: TIERS }
        ]
      },
      fields: [
        { id: 'dsp_qp', label: 'Permeate flow', ph: 'mL/min, or "unrecorded"' },
        { id: 'dsp_vl', label: 'Lumen loop volume', ph: 'mL' },
        { id: 'dsp_vs', label: 'Shell volume', ph: 'mL' },
        { id: 'dsp_sigma', label: 'Sieving coefficient', ph: 'and why' },
        { id: 'dsp_note', label: 'What the blot can and cannot say', type: 'textarea', w: 4,
          hint: 'The Western is semi-quantitative. Say what it supports: presence, apparent size, lumen against shell. Not g/L.' }
      ]
    },
    {
      n: '5', id: 'spec', title: 'Product specification',
      note: 'The layout from GRN 737: property, limit, method, result, n. A row with no limit is not a specification, it is an observation.',
      table: {
        id: 'spec',
        cols: [
          { id: 'prop', label: 'Property', w: '24%' },
          { id: 'limit', label: 'Specification / limit', w: '21%' },
          { id: 'method', label: 'Method', w: '21%' },
          { id: 'result', label: 'Result', w: '21%' },
          { id: 'n', label: 'n', w: '7%' },
          { id: 'tier', label: 'Tier', w: '6%', type: 'select', opts: TIERS }
        ]
      }
    },
    {
      n: '6', id: 'safety', title: 'Biosafety and regulatory route',
      note: 'What was tested, how often, and what the test could not see. Containment is a measurement, not a promise.',
      fields: [
        { id: 'host_status', label: 'Host organism safety status', w: 2, ph: 'e.g. risk group, GRAS / QPS status, with source' },
        { id: 'containment', label: 'Physical containment', w: 2, ph: 'what retains the cells, and its rated limit' },
        { id: 'plating', label: 'Shell-side plating result', type: 'textarea', w: 2,
          hint: '100 µL on LB at each sample point. Give clean plates over total, and the detection limit.' },
        { id: 'passes', label: 'What the pore does not hold back', type: 'textarea', w: 2,
          hint: 'A 0.2 µm pore passes vesicles and debris. State this rather than claiming only free enzyme crosses.' },
        { id: 'route', label: 'Regulatory route for the product', type: 'textarea', w: 4,
          hint: 'Which law a purified peptide applied to soil falls under in our target market, and whether live cells or DNA reach the field.' }
      ]
    },
    {
      n: '7', id: 'claims', title: 'Claim ledger',
      note: 'One row per claim the page makes. A row with nothing in the evidence column comes off the page.',
      table: {
        id: 'claims',
        cols: [
          { id: 'claim', label: 'Claim', w: '34%' },
          { id: 'tier', label: 'Evidence tier', w: '16%', type: 'select', opts: TIERS },
          { id: 'where', label: 'Where the data lives', w: '25%' },
          { id: 'falsify', label: 'What would falsify it', w: '25%' }
        ]
      }
    },
    {
      n: '8', id: 'gaps', title: 'Open gaps',
      note: 'The declared gaps. This section is why the rest of the report is believable, so do not trim it before export.',
      table: {
        id: 'gaps',
        cols: [
          { id: 'gap', label: 'What is missing', w: '34%' },
          { id: 'why', label: 'Why it matters', w: '30%' },
          { id: 'plan', label: 'How we would close it', w: '26%' },
          { id: 'owner', label: 'Owner', w: '10%' }
        ]
      },
      fields: [
        { id: 'refs', label: 'Sources cited in this report', type: 'textarea', w: 4,
          hint: 'One per line. Internal file paths count.' }
      ]
    }
  ];

  /* Known values. Hardware spec and the Level-1 handoff of 2026-09-02.
     Only used to fill blanks, and every one is checkable against those files. */
  var KNOWN = {
    title: 'ReLeaf Bioreactor System — Biomanufacturing Report',
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
    passes: 'A 0.2 µm pore passes membrane vesicles and cell debris, so "only free enzyme crosses" is not a claim this membrane supports. Hollow-fibre modules can also develop pinhole defects, which is why shell fluid is plated at every sample point.'
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
    { gap: 'Operating mode, permeate flow and compartment volumes', why: 'Without the permeate flow the secretion rate cannot be recovered from shell-side data at all.', plan: 'Record the mode, permeate flow, both compartment volumes and the transmembrane pressure at every sampling point.', owner: '' },
    { gap: 'Light control loop (CcaSR)', why: 'Every growth number on record is constitutive pVeg, so no dose-response claim is supported.', plan: 'Sequence the joined construct, then run an induction series.', owner: '' },
    { gap: 'Cost model', why: 'No cost or saving claim can be made without a bill of materials in the repository.', plan: 'Build the BOM, then compare cost per run against the incumbent price range.', owner: '' }
  ];

  /* ---------- state ---------- */
  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* private window or blocked storage */ }
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
  function emptyRow(t) { var r = {}; t.cols.forEach(function (c) { r[c.id] = ''; }); return r; }

  var saveTimer = null;
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      flash('Saved on this computer');
    } catch (e) {
      flash('Could not save — export .json to keep your work', true);
    }
  }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }
  function flash(msg, warn) {
    var el = document.getElementById('saveState');
    if (!el) return;
    el.textContent = msg;
    el.style.color = warn ? 'var(--amber)' : '';
    el.classList.add('flash');
    setTimeout(function () { el.classList.remove('flash'); }, 900);
  }

  /* ---------- build the form ---------- */
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

  function buildField(f) {
    var wrap = el('div', { class: 'field' });
    if (f.w) wrap.style.gridColumn = 'span ' + f.w;
    var id = 'f_' + f.id;
    wrap.appendChild(el('label', { for: id, text: f.label }));
    var input;
    if (f.type === 'textarea') {
      input = el('textarea', { id: id, placeholder: f.ph || '' });
    } else if (f.type === 'select') {
      input = el('select', { id: id });
      (f.opts || []).forEach(function (o) {
        input.appendChild(el('option', { value: o, text: o === '' ? '—' : o }));
      });
    } else {
      input = el('input', { type: f.type || 'text', id: id, placeholder: f.ph || '' });
    }
    input.value = state.fields[f.id] || '';
    input.addEventListener('input', function () { state.fields[f.id] = input.value; queueSave(); });
    input.addEventListener('change', function () { state.fields[f.id] = input.value; queueSave(); });
    wrap.appendChild(input);
    if (f.hint) wrap.appendChild(el('p', { class: 'hint', text: f.hint }));
    return wrap;
  }

  function buildTable(t) {
    var scroll = el('div', { class: 'tbl-scroll' });
    var tbl = el('table', { class: 'tbl-edit' });
    var thead = el('thead');
    var hr = el('tr');
    t.cols.forEach(function (c) {
      var th = el('th', { text: c.label });
      if (c.w) th.style.width = c.w;
      hr.appendChild(th);
    });
    hr.appendChild(el('th', { text: '' }));
    thead.appendChild(hr);
    tbl.appendChild(thead);
    var tbody = el('tbody');
    tbl.appendChild(tbody);
    scroll.appendChild(tbl);

    function render() {
      tbody.innerHTML = '';
      state.tables[t.id].forEach(function (row, i) {
        var tr = el('tr');
        t.cols.forEach(function (c) {
          var td = el('td');
          var inp;
          if (c.type === 'select') {
            inp = el('select', { 'aria-label': c.label });
            (c.opts || []).forEach(function (o) {
              inp.appendChild(el('option', { value: o, text: o === '' ? '—' : o }));
            });
          } else {
            inp = el('input', { type: 'text', 'aria-label': c.label });
          }
          inp.value = row[c.id] || '';
          inp.addEventListener('input', function () { row[c.id] = inp.value; queueSave(); });
          inp.addEventListener('change', function () { row[c.id] = inp.value; queueSave(); });
          td.appendChild(inp);
          tr.appendChild(td);
        });
        var tdd = el('td');
        var del = el('button', { class: 'del', type: 'button', title: 'Delete row', 'aria-label': 'Delete row ' + (i + 1), text: '×' });
        del.addEventListener('click', function () {
          state.tables[t.id].splice(i, 1);
          if (!state.tables[t.id].length) state.tables[t.id].push(emptyRow(t));
          save(); render();
        });
        tdd.appendChild(del);
        tr.appendChild(tdd);
        tbody.appendChild(tr);
      });
    }
    render();

    var add = el('button', { class: 'btn secondary tiny', type: 'button', text: 'Add row' });
    add.addEventListener('click', function () { state.tables[t.id].push(emptyRow(t)); save(); render(); });

    var box = el('div', {}, [scroll, el('div', { class: 'btn-row' }, [add])]);
    box.rerender = render;
    return box;
  }

  var tableViews = {};

  function buildForm() {
    var form = document.getElementById('form');
    form.innerHTML = '';
    SECTIONS.forEach(function (sec) {
      var fs = el('fieldset', { class: 'sec' });
      var lg = el('legend');
      lg.appendChild(el('span', { class: 'sec-num', text: 'Section ' + sec.n }));
      lg.appendChild(document.createTextNode(sec.title));
      fs.appendChild(lg);
      if (sec.note) fs.appendChild(el('p', { class: 'sec-note', text: sec.note }));
      if (sec.table) {
        var tv = buildTable(sec.table);
        tableViews[sec.table.id] = tv;
        fs.appendChild(tv);
      }
      if (sec.fields && sec.fields.length) {
        var row = el('div', { class: 'row c4' });
        sec.fields.forEach(function (f) { row.appendChild(buildField(f)); });
        fs.appendChild(row);
      }
      form.appendChild(fs);
    });
  }

  /* ---------- report ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function val(id) { return (state.fields[id] || '').trim(); }
  function or(id, fallback) {
    var v = val(id);
    return v ? esc(v) : '<span class="empty">' + esc(fallback || 'not filled in') + '</span>';
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function para(id, fallback) {
    var v = val(id);
    return v ? '<p>' + nl2br(v) + '</p>' : '<p class="empty">' + esc(fallback || 'Not filled in.') + '</p>';
  }
  function pill(t) {
    if (!t) return '';
    var cls = { 'measured': 'measured', 'derived': 'derived', 'model output': 'model', 'literature': 'lit', 'not yet established': 'none' }[t] || '';
    return '<span class="pill ' + cls + '">' + esc(t) + '</span>';
  }
  function rowsOf(id) {
    return (state.tables[id] || []).filter(function (r) {
      return Object.keys(r).some(function (k) { return String(r[k]).trim() !== ''; });
    });
  }
  function tableHtml(tid, cols, tierCol) {
    var rows = rowsOf(tid);
    if (!rows.length) return '<p class="empty">No rows entered.</p>';
    var h = '<table><thead><tr>' + cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr>' + cols.map(function (c) {
        var v = (r[c.id] || '').trim();
        if (c.id === tierCol) return '<td>' + (v ? pill(v) : '<span class="empty">—</span>') + '</td>';
        return '<td>' + (v ? esc(v) : '<span class="empty">—</span>') + '</td>';
      }).join('') + '</tr>';
    });
    return h + '</tbody></table>';
  }
  function kv(pairs) {
    return '<div class="kv">' + pairs.map(function (p) {
      return '<div><b>' + esc(p[0]) + '</b><span>' + p[1] + '</span></div>';
    }).join('') + '</div>';
  }
  function colsOf(id) {
    var found = null;
    SECTIONS.forEach(function (s) { if (s.table && s.table.id === id) found = s.table.cols; });
    return found || [];
  }

  function buildReport() {
    var today = new Date().toISOString().slice(0, 10);
    var h = '';
    h += '<div class="rpt">';
    h += '<div class="rpt-head">'
      + '<img src="assets/logo.png" alt="ReLeaf">'
      + '<div class="t"><h1>' + or('title', 'ReLeaf Bioreactor System — Biomanufacturing Report') + '</h1>'
      + '<p class="st">ReLeaf · iGEM 2026 · Biomanufacturing</p></div>'
      + '<div class="meta">Version ' + or('version', '—') + '<br>'
      + 'Date ' + or('date', today) + '<br>'
      + 'Prepared by ' + or('authors', '—') + '<br>'
      + 'Reviewed by ' + or('reviewers', 'not reviewed') + '</div>'
      + '</div>';

    h += '<section><h2><span class="n">1</span>Scope</h2>' + para('scope', 'Scope not stated. State what this report covers and what it does not before circulating it.') + '</section>';

    h += '<section><h2><span class="n">2</span>System description</h2>';
    h += '<h3>Biology</h3>' + kv([
      ['Chassis strain', or('chassis')], ['Construct', or('construct')],
      ['Promoter', or('promoter')], ['Signal peptide', or('signalpep')],
      ['Product', or('product')], ['Selection marker', or('marker')]
    ]);
    h += '<h3>Hardware</h3>' + kv([
      ['Membrane module', or('module')], ['Pore size', or('pore')],
      ['Membrane area', or('area')], ['Fibres', or('fibers')],
      ['Lumen hold-up', or('holdup')], ['Recirculation pump', or('pump')]
    ]);
    h += '<h3>Instrumentation</h3>' + para('sensors');
    h += '</section>';

    h += '<section><h2><span class="n">3</span>Process performance</h2>';
    h += tableHtml('runs', colsOf('runs'));
    h += '<h3>Fit</h3>' + para('perf_fit');
    h += '<h3>Limits of these numbers</h3>' + para('perf_limit');
    h += '<p class="note">Evidence tier: ' + (val('perf_tier') ? pill(val('perf_tier')) : '<span class="empty">not stated</span>')
      + ' · Data location: ' + or('perf_src', 'not stated') + '</p>';
    h += '</section>';

    h += '<section><h2><span class="n">4</span>Recovery and downstream</h2>';
    h += kv([
      ['Permeate flow', or('dsp_qp')], ['Lumen loop volume', or('dsp_vl')],
      ['Shell volume', or('dsp_vs')], ['Sieving coefficient', or('dsp_sigma')]
    ]);
    h += tableHtml('dsp', colsOf('dsp'), 'tier');
    h += '<h3>What the measurement supports</h3>' + para('dsp_note');
    h += '</section>';

    h += '<section><h2><span class="n">5</span>Product specification</h2>';
    h += tableHtml('spec', colsOf('spec'), 'tier');
    h += '<p class="note">A row with no limit is an observation, not a specification.</p>';
    h += '</section>';

    h += '<section><h2><span class="n">6</span>Biosafety and regulatory route</h2>';
    h += kv([['Host safety status', or('host_status')], ['Physical containment', or('containment')]]);
    h += '<h3>Shell-side plating</h3>' + para('plating');
    h += '<h3>What the pore does not hold back</h3>' + para('passes');
    h += '<h3>Regulatory route</h3>' + para('route');
    h += '</section>';

    h += '<section><h2><span class="n">7</span>Claim ledger</h2>';
    h += tableHtml('claims', colsOf('claims'), 'tier');
    h += '</section>';

    h += '<section><h2><span class="n">8</span>Open gaps</h2>';
    var gaps = rowsOf('gaps');
    if (!gaps.length) {
      h += '<div class="gapbox">No gaps declared. A report with no declared gaps is usually an incomplete report, not a complete system.</div>';
    } else {
      h += tableHtml('gaps', colsOf('gaps'));
    }
    h += '</section>';

    var refs = val('refs');
    h += '<section><h2><span class="n">9</span>Sources</h2>';
    if (refs) {
      h += '<ol class="note" style="padding-left:16px">' + refs.split('\n').filter(function (l) { return l.trim(); })
        .map(function (l) { return '<li>' + esc(l.trim()) + '</li>'; }).join('') + '</ol>';
    } else {
      h += '<p class="empty">No sources listed.</p>';
    }
    h += '</section>';

    h += '<div class="sign"><div>Prepared by — signature and date</div><div>Reviewed by — signature and date</div></div>';
    h += '<p class="foot">ReLeaf · iGEM 2026. Generated ' + esc(today)
      + ' from the ReLeaf Bioreactor Report builder. Every value in this report was typed by its authors; nothing here is auto-measured. '
      + 'Items marked "not filled in" were left blank at export.</p>';
    h += '</div>';
    return h;
  }

  /* ---------- actions ---------- */
  function fillKnown() {
    var n = 0;
    Object.keys(KNOWN).forEach(function (k) {
      if (!val(k)) { state.fields[k] = KNOWN[k]; n++; }
    });
    if (!val('date')) { state.fields.date = new Date().toISOString().slice(0, 10); n++; }
    if (!rowsOf('spec').length) { state.tables.spec = KNOWN_SPEC.slice().map(function (r) { return Object.assign({}, r); }); n++; }
    if (!rowsOf('gaps').length) { state.tables.gaps = KNOWN_GAPS.slice().map(function (r) { return Object.assign({}, r); }); n++; }
    save(); buildForm();
    flash(n ? 'Filled ' + n + ' empty items — check each one' : 'Nothing empty to fill');
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function exportJson() {
    var stamp = (val('date') || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    var who = (val('authors') || 'releaf').split(/[,\s]+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    download('releaf-bioreactor-' + stamp + '-' + (who || 'report') + '.json',
      JSON.stringify(state, null, 2), 'application/json');
  }

  function importJson(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var next = JSON.parse(r.result);
        if (!next || typeof next !== 'object' || !next.fields || !next.tables) throw new Error('shape');
        if (!confirm('Import replaces everything currently in this form. Export your own copy first if you have not. Continue?')) return;
        state = next;
        SECTIONS.forEach(function (s) {
          if (s.table && !Array.isArray(state.tables[s.table.id])) state.tables[s.table.id] = [emptyRow(s.table)];
        });
        save(); buildForm();
        flash('Imported');
      } catch (e) {
        alert('That file is not a report export from this page.');
      }
    };
    r.readAsText(file);
  }

  function exportPdf() {
    document.getElementById('report').innerHTML = buildReport();
    var t = (val('title') || 'ReLeaf Bioreactor Report');
    var prev = document.title;
    document.title = t;
    window.addEventListener('afterprint', function restore() {
      document.title = prev;
      window.removeEventListener('afterprint', restore);
    });
    setTimeout(function () { window.print(); }, 60);
  }

  function clearAll() {
    if (!confirm('Clear everything in this form on this computer? Export a .json first if you want to keep it.')) return;
    state = blank();
    save(); buildForm();
    flash('Cleared');
  }

  /* ---------- wire up ---------- */
  buildForm();
  document.getElementById('btnKnown').addEventListener('click', fillKnown);
  document.getElementById('btnExportJson').addEventListener('click', exportJson);
  document.getElementById('btnClear').addEventListener('click', clearAll);
  document.getElementById('btnPdf').addEventListener('click', exportPdf);
  document.getElementById('importFile').addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) importJson(e.target.files[0]);
    e.target.value = '';
  });
  window.addEventListener('beforeprint', function () {
    if (!document.getElementById('report').innerHTML) {
      document.getElementById('report').innerHTML = buildReport();
    }
  });
})();
