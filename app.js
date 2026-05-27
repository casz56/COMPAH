const state = {
  currentView: 'home',
  map: null,
  markers: [],
  purchases: [...COMPAH.compras],
  contracts: [...COMPAH.contratos]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const number = (value) => new Intl.NumberFormat('es-CO').format(value);
const percent = (contract) => Math.round((contract.comprasLocales / contract.valorAlimentos) * 100);
const productNames = COMPAH.productos.map(p => p.nombre);

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function setView(view) {
  state.currentView = view;
  $$('.view').forEach(section => section.classList.remove('active-view'));
  $(`#view-${view}`).classList.add('active-view');
  $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  $('#sidebar').classList.remove('open');
  if (view === 'mapa') setTimeout(initMap, 150);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function statusClass(status) {
  if (['Validado', 'Aprobado'].includes(status)) return 'ok';
  if (['Pendiente', 'Observado', 'Requiere subsanación'].includes(status)) return 'warn';
  return 'bad';
}

function complianceClass(value) {
  if (value < 30) return 'danger';
  if (value < 50) return 'warning';
  return '';
}

function fillSelect(select, options, allLabel) {
  select.innerHTML = '';
  if (allLabel) select.insertAdjacentHTML('beforeend', `<option value="${allLabel}">${allLabel}</option>`);
  options.forEach(option => select.insertAdjacentHTML('beforeend', `<option value="${option}">${option}</option>`));
}

function renderKpis() {
  const municipiosCubiertos = new Set(COMPAH.productores.map(p => p.municipio)).size;
  const totalContratos = state.contracts.reduce((acc, c) => acc + c.valorTotal, 0);
  const totalLocal = state.contracts.reduce((acc, c) => acc + c.comprasLocales, 0);
  const totalAlimentos = state.contracts.reduce((acc, c) => acc + c.valorAlimentos, 0);
  const comprasValidadas = state.purchases.filter(p => p.estado === 'Aprobado').length;
  const alertas = state.contracts.filter(c => percent(c) < 30).length + COMPAH.productores.filter(p => p.estado !== 'Validado').length;
  const kpis = [
    ['Productores registrados', number(COMPAH.productores.length)],
    ['Organizaciones ACFC', number(COMPAH.productores.filter(p => p.tipo === 'Organización ACFC').length)],
    ['Productos ofertados', number(COMPAH.productos.length)],
    ['Municipios cubiertos', `${municipiosCubiertos}/37`],
    ['Contratos registrados', number(state.contracts.length)],
    ['Valor total contratos', money(totalContratos)],
    ['Compra local acumulada', money(totalLocal)],
    ['Cumplimiento promedio', `${Math.round((totalLocal / totalAlimentos) * 100)}%`],
    ['Compras validadas', number(comprasValidadas)],
    ['Alertas activas', number(alertas)]
  ];
  $('#kpiGrid').innerHTML = kpis.map(([label, value]) => `<article class="kpi-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
}

function renderCharts() {
  $('#contractBars').innerHTML = state.contracts.map(c => {
    const p = percent(c);
    return `<div class="bar-item">
      <div class="bar-meta"><strong>${c.nombre}</strong><span>${p}% · ${money(c.comprasLocales)}</span></div>
      <div class="bar-track"><div class="bar-fill ${complianceClass(p)}" style="width:${Math.min(p, 100)}%"></div></div>
    </div>`;
  }).join('');

  const totals = {};
  state.purchases.forEach(p => {
    const product = COMPAH.productos.find(x => x.nombre === p.producto);
    const cat = product?.categoria || 'Otros';
    totals[cat] = (totals[cat] || 0) + p.valor;
  });
  $('#categoryDonut').innerHTML = Object.entries(totals)
    .sort((a,b) => b[1]-a[1])
    .map(([cat, val]) => `<div class="donut-row"><strong>${cat}</strong><span>${money(val)}</span></div>`).join('');
}

function renderAlerts() {
  const contractAlerts = state.contracts.filter(c => percent(c) < 30).map(c => ({
    title: `Contrato bajo mínimo legal: ${c.nombre}`,
    detail: `Cumplimiento actual ${percent(c)}%. Debe alcanzar al menos 30%.`,
    level: 'Crítica'
  }));
  const producerAlerts = COMPAH.productores.filter(p => p.estado !== 'Validado').slice(0, 5).map(p => ({
    title: `Productor requiere subsanación: ${p.nombre}`,
    detail: `${p.municipio} · Actualizar documentos o requisitos sanitarios.`,
    level: 'Media'
  }));
  const alerts = [...contractAlerts, ...producerAlerts];
  $('#alertList').innerHTML = alerts.map(a => `<div class="alert-item"><div><strong>${a.title}</strong><p>${a.detail}</p></div><span class="status ${a.level === 'Crítica' ? 'bad' : 'warn'}">${a.level}</span></div>`).join('');
}

function renderProducers() {
  const search = $('#producerSearch')?.value?.toLowerCase() || '';
  const municipio = $('#producerMunicipioFilter')?.value || 'Todos';
  const tipo = $('#producerTipoFilter')?.value || 'Todos';
  const rows = COMPAH.productores.filter(p => {
    const matchesSearch = `${p.nombre} ${p.municipio} ${p.productos.join(' ')}`.toLowerCase().includes(search);
    const matchesMun = municipio === 'Todos' || p.municipio === municipio;
    const matchesTipo = tipo === 'Todos' || p.tipo === tipo;
    return matchesSearch && matchesMun && matchesTipo;
  });
  $('#producerTable').innerHTML = rows.map(p => `<tr>
    <td><strong>${p.nombre}</strong><br><small>Vereda ${p.vereda}</small></td>
    <td>${p.municipio}<br><small>${p.region}</small></td>
    <td>${p.tipo}</td>
    <td>${p.productos.map(x => `<span class="status ok">${x}</span>`).join(' ')}</td>
    <td>${number(p.capacidad)} ${p.unidad}</td>
    <td><span class="status ${statusClass(p.estado)}">${p.estado}</span></td>
  </tr>`).join('');
}

function renderProducts() {
  const search = $('#productSearch')?.value?.toLowerCase() || '';
  const products = COMPAH.productos.filter(p => `${p.nombre} ${p.categoria}`.toLowerCase().includes(search));
  $('#productCatalog').innerHTML = products.map(p => `<article class="product-card">
    <div class="product-icon">${p.icono}</div>
    <h4>${p.nombre}</h4>
    <p><strong>Categoría:</strong> ${p.categoria}<br><strong>Unidad:</strong> ${p.unidad}<br><strong>Requisito:</strong> ${p.requisito}</p>
    <span class="tag">Oferta local</span>
  </article>`).join('');
}

function renderContracts() {
  $('#contractsGrid').innerHTML = state.contracts.map(c => {
    const p = percent(c);
    const status = p < 30 ? ['Incumplimiento', 'bad'] : p < 50 ? ['Cumplimiento básico', 'warn'] : ['Cumplimiento alto', 'ok'];
    return `<article class="contract-card">
      <div class="row-between"><h4>${c.nombre}</h4><span class="status ${status[1]}">${status[0]}</span></div>
      <div class="contract-meta">
        <span><strong>Entidad:</strong> ${c.entidad}</span>
        <span><strong>Operador:</strong> ${c.operador}</span>
        <span><strong>Supervisor:</strong> ${c.supervisor}</span>
        <span><strong>Valor alimentos:</strong> ${money(c.valorAlimentos)}</span>
        <span><strong>Compra local:</strong> ${money(c.comprasLocales)}</span>
      </div>
      <div class="progress-line"><div class="${complianceClass(p)}" style="width:${Math.min(p,100)}%; background:${p < 30 ? 'var(--danger)' : p < 50 ? 'var(--warning)' : 'var(--green)'}"></div></div>
      <strong>${p}% de cumplimiento</strong>
    </article>`;
  }).join('');
}

function renderPurchases() {
  $('#purchaseTable').innerHTML = state.purchases.map(p => {
    const contract = state.contracts.find(c => c.id === p.contratoId);
    const producer = COMPAH.productores.find(x => x.id === p.productorId);
    return `<tr>
      <td>${p.fecha}</td>
      <td>${contract?.nombre || 'Sin contrato'}</td>
      <td>${producer?.nombre || 'No identificado'}<br><small>${producer?.municipio || ''}</small></td>
      <td>${p.producto}</td>
      <td>${number(p.cantidad)} ${p.unidad}</td>
      <td>${money(p.valor)}</td>
      <td><span class="status ${statusClass(p.estado)}">${p.estado}</span></td>
    </tr>`;
  }).join('');
}

function renderSupervision() {
  const pending = state.purchases.filter(p => p.estado !== 'Aprobado');
  $('#supervisionList').innerHTML = pending.map(p => {
    const contract = state.contracts.find(c => c.id === p.contratoId);
    const producer = COMPAH.productores.find(x => x.id === p.productorId);
    return `<article class="supervision-card" data-purchase-id="${p.id}">
      <div>
        <h4>${p.producto} · ${money(p.valor)}</h4>
        <p><strong>Contrato:</strong> ${contract?.nombre}<br><strong>Productor:</strong> ${producer?.nombre} · ${producer?.municipio}<br><strong>Soporte:</strong> Factura / remisión simulada · Estado actual: <span class="status ${statusClass(p.estado)}">${p.estado}</span></p>
      </div>
      <div class="supervision-actions">
        <button class="btn primary" data-action="approve">Aprobar</button>
        <button class="btn secondary" data-action="observe">Observar</button>
        <button class="btn secondary" data-action="reject">Rechazar</button>
      </div>
    </article>`;
  }).join('') || '<div class="panel"><h4>Sin compras pendientes</h4><p>Todas las compras reportadas se encuentran aprobadas.</p></div>';
}

function initMap() {
  const product = $('#mapProductFilter').value || 'Todos';
  const region = $('#mapRegionFilter').value || 'Todas las regiones';
  const filtered = COMPAH.productores.filter(p => {
    const productOk = product === 'Todos' || p.productos.includes(product);
    const regionOk = region === 'Todas las regiones' || p.region === region;
    return productOk && regionOk;
  });
  $('#mapSummary').innerHTML = [
    ['Productores visibles', filtered.length],
    ['Municipios', new Set(filtered.map(p => p.municipio)).size],
    ['Organizaciones ACFC', filtered.filter(p => p.tipo === 'Organización ACFC').length],
    ['Capacidad agregada', `${number(filtered.reduce((acc,p)=>acc+p.capacidad,0))} unidades`]
  ].map(([a,b]) => `<div class="map-summary-item"><strong>${a}</strong><span>${b}</span></div>`).join('');

  if (!window.L) {
    $('#map').innerHTML = '<div class="panel"><h4>Mapa no disponible sin conexión CDN</h4><p>Los datos territoriales están cargados y pueden integrarse con Leaflet + GeoJSON municipal del Huila.</p></div>';
    return;
  }
  if (!state.map) {
    state.map = L.map('map').setView([2.45, -75.65], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.map);
  }
  state.markers.forEach(marker => marker.remove());
  state.markers = filtered.map(p => {
    const marker = L.circleMarker([p.lat, p.lng], { radius: 8, color: '#00777a', fillColor: p.tipo === 'Organización ACFC' ? '#d5df00' : '#00777a', fillOpacity: .85, weight: 2 })
      .bindPopup(`<strong>${p.nombre}</strong><br>${p.municipio} · ${p.tipo}<br>Productos: ${p.productos.join(', ')}<br>Capacidad: ${number(p.capacidad)} ${p.unidad}`)
      .addTo(state.map);
    return marker;
  });
  setTimeout(() => state.map.invalidateSize(), 100);
}

function renderReports(type) {
  const totalLocal = state.contracts.reduce((acc, c) => acc + c.comprasLocales, 0);
  const totalAlimentos = state.contracts.reduce((acc, c) => acc + c.valorAlimentos, 0);
  const compliance = Math.round((totalLocal / totalAlimentos) * 100);
  const titles = {
    contrato: 'Reporte por contrato', municipio: 'Reporte por municipio', operador: 'Reporte por operador', ley2046: 'Cumplimiento Ley 2046', acfc: 'Participación ACFC', alertas: 'Alertas de supervisión'
  };
  $('#reportOutput').innerHTML = `<h4>${titles[type]}</h4>
    <p>Reporte simulado generado exitosamente. Cumplimiento global de compra local: <strong>${compliance}%</strong>. Valor local acumulado: <strong>${money(totalLocal)}</strong>. Este módulo exportaría PDF, Excel o CSV en versión productiva.</p>
    <button class="btn primary" onclick="window.print()">Imprimir / guardar PDF</button>`;
}

function bindEvents() {
  $$('.nav-item').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  $$('[data-view-target]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.viewTarget)));
  $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $$('[data-open-login]').forEach(btn => btn.addEventListener('click', () => $('#loginDialog').showModal()));
  $('#refreshKpis').addEventListener('click', () => { renderAll(); showToast('Indicadores actualizados.'); });
  $('#producerSearch').addEventListener('input', renderProducers);
  $('#producerMunicipioFilter').addEventListener('change', renderProducers);
  $('#producerTipoFilter').addEventListener('change', renderProducers);
  $('#productSearch').addEventListener('input', renderProducts);
  $('#mapProductFilter').addEventListener('change', initMap);
  $('#mapRegionFilter').addEventListener('change', initMap);
  $('#addPurchaseBtn').addEventListener('click', () => {
    const producer = COMPAH.productores[Math.floor(Math.random() * COMPAH.productores.length)];
    const product = producer.productos[0];
    const contract = state.contracts[Math.floor(Math.random() * state.contracts.length)];
    state.purchases.unshift({ id: Date.now(), fecha: new Date().toISOString().slice(0,10), contratoId: contract.id, productorId: producer.id, producto: product, cantidad: 1200, unidad: 'kg', valor: 8400000, estado: 'Pendiente' });
    renderPurchases(); renderSupervision(); showToast('Compra local demo registrada y enviada a supervisión.');
  });
  document.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (actionBtn) {
      const card = event.target.closest('[data-purchase-id]');
      const purchase = state.purchases.find(p => p.id == card.dataset.purchaseId);
      const action = actionBtn.dataset.action;
      purchase.estado = action === 'approve' ? 'Aprobado' : action === 'observe' ? 'Observado' : 'Rechazado';
      renderPurchases(); renderSupervision(); showToast(`Compra ${purchase.estado.toLowerCase()} por supervisor.`);
    }
    const report = event.target.closest('[data-report]');
    if (report) renderReports(report.dataset.report);
    const simulate = event.target.closest('[data-simulate-contract]');
    if (simulate) {
      state.contracts.push({ id: Date.now(), nombre: 'Contrato demo seguridad alimentaria', entidad: 'Municipio priorizado', operador: 'Operador demo', supervisor: 'Supervisor demo', valorTotal: 950000000, valorAlimentos: 700000000, comprasLocales: 160000000, programa: 'Demo', municipio: 'Neiva' });
      renderAll(); showToast('Contrato demo creado con alerta de cumplimiento.');
    }
  });
  $('#registryForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    showToast(`${data.tipo} registrado en modo demostrativo.`);
    event.target.reset();
  });
}

function populateFilters() {
  fillSelect($('#producerMunicipioFilter'), COMPAH.municipios.map(m => m.nombre), 'Todos');
  fillSelect($('#registryMunicipio'), COMPAH.municipios.map(m => m.nombre));
  fillSelect($('#registryProduct'), productNames);
  fillSelect($('#mapProductFilter'), productNames, 'Todos');
  fillSelect($('#mapRegionFilter'), ['Norte', 'Centro', 'Sur', 'Occidente'], 'Todas las regiones');
}

function renderAll() {
  renderKpis();
  renderCharts();
  renderAlerts();
  renderProducers();
  renderProducts();
  renderContracts();
  renderPurchases();
  renderSupervision();
}

document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  bindEvents();
  renderAll();
});

/* ==============================
   COMPAH v1.1 · Overrides de mejora
   ============================== */

const HUILA_POLYGON = [
  [3.45, -74.86], [3.18, -74.98], [3.02, -75.13], [2.95, -75.34], [2.78, -75.50],
  [2.58, -75.56], [2.45, -75.78], [2.25, -75.96], [2.02, -76.12], [1.80, -76.26],
  [1.62, -76.16], [1.70, -75.95], [1.92, -75.72], [2.11, -75.55], [2.30, -75.38],
  [2.55, -75.22], [2.79, -75.14], [3.02, -75.08], [3.25, -74.95]
];

function kpiSpark(seed) {
  return Array.from({ length: 8 }, (_, i) => `<i style="height:${14 + ((seed + i * 7) % 28)}px"></i>`).join('');
}

function setKpiInsight(title, value, note) {
  const target = $('#kpiInsight');
  if (!target) return;
  target.innerHTML = `<strong>${title}:</strong> <span>${value}</span><p>${note}</p>`;
}

function renderKpis() {
  const municipiosCubiertos = new Set(COMPAH.productores.map(p => p.municipio)).size;
  const totalContratos = state.contracts.reduce((acc, c) => acc + c.valorTotal, 0);
  const totalLocal = state.contracts.reduce((acc, c) => acc + c.comprasLocales, 0);
  const totalAlimentos = state.contracts.reduce((acc, c) => acc + c.valorAlimentos, 0);
  const comprasValidadas = state.purchases.filter(p => p.estado === 'Aprobado').length;
  const alertas = state.contracts.filter(c => percent(c) < 30).length + COMPAH.productores.filter(p => p.estado !== 'Validado').length;
  const compliance = Math.round((totalLocal / totalAlimentos) * 100);
  const validatedPct = Math.round((comprasValidadas / Math.max(state.purchases.length, 1)) * 100);
  const acfc = COMPAH.productores.filter(p => p.tipo === 'Organización ACFC').length;

  const kpis = [
    { label: 'Productores registrados', value: number(COMPAH.productores.length), score: 92, accent: 'var(--green)', note: 'Base territorial inicial con productores y organizaciones por municipio, producto y capacidad.' },
    { label: 'Organizaciones ACFC', value: number(acfc), score: Math.min(100, acfc * 7), accent: 'var(--lime)', note: 'Organizaciones priorizadas para compras públicas locales y asociatividad rural.' },
    { label: 'Productos ofertados', value: number(COMPAH.productos.length), score: 80, accent: 'var(--gold)', note: 'Catálogo con lácteos, carnes, frutas, pasifloras, piscícola, hortalizas, café, cacao y transformados.' },
    { label: 'Municipios cubiertos', value: `${municipiosCubiertos}/37`, score: Math.round(municipiosCubiertos / 37 * 100), accent: 'var(--green)', note: 'Cobertura departamental completa para análisis territorial de oferta y demanda.' },
    { label: 'Contratos registrados', value: number(state.contracts.length), score: Math.min(100, state.contracts.length * 15), accent: '#2d67a4', note: 'Contratos alimentarios asociados a entidad, operador, supervisor y meta Ley 2046.' },
    { label: 'Valor total contratos', value: money(totalContratos), score: 76, accent: '#2d67a4', note: 'Universo contractual simulado con recursos públicos destinados a programas alimentarios.' },
    { label: 'Compra local acumulada', value: money(totalLocal), score: Math.min(100, compliance + 28), accent: 'var(--green)', note: 'Valor reportado como comprado a pequeños productores locales y organizaciones ACFC.' },
    { label: 'Cumplimiento promedio', value: `${compliance}%`, score: compliance, accent: compliance < 30 ? 'var(--danger)' : compliance < 50 ? 'var(--warning)' : 'var(--success)', note: 'Indicador central: debe ser mínimo del 30% del valor destinado a compra de alimentos.' },
    { label: 'Compras validadas', value: number(comprasValidadas), score: validatedPct, accent: 'var(--success)', note: 'Compras con soporte aprobado por supervisor. Mejora la trazabilidad contractual.' },
    { label: 'Alertas activas', value: number(alertas), score: Math.max(8, 100 - alertas * 10), accent: alertas > 4 ? 'var(--danger)' : 'var(--warning)', note: 'Alertas por bajo cumplimiento, documentos pendientes o compras por validar.' }
  ];

  $('#kpiGrid').innerHTML = kpis.map((k, idx) => `
    <article class="kpi-card" data-kpi-index="${idx}" style="--score:${k.score}; --accent:${k.accent}">
      <span>${k.label}</span>
      <strong>${k.value}</strong>
      <small>${k.score}% lectura</small>
      <div class="spark">${kpiSpark(idx * 9)}</div>
    </article>`).join('');

  $$('.kpi-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('.kpi-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const k = kpis[Number(card.dataset.kpiIndex)];
      setKpiInsight(k.label, k.value, k.note);
    });
  });
  setKpiInsight('Cumplimiento promedio', `${compliance}%`, 'Indicador de seguimiento Ley 2046. La meta mínima es 30%; el tablero permite identificar contratos en riesgo y orientar gestión supervisora.');
}

function renderCharts() {
  $('#contractBars').innerHTML = state.contracts.map(c => {
    const p = percent(c);
    const label = p < 30 ? 'Bajo mínimo' : p < 50 ? 'Cumple básico' : 'Alto cumplimiento';
    return `<div class="bar-item" title="${label}">
      <div class="bar-meta"><strong>${c.nombre}</strong><span>${p}% · ${money(c.comprasLocales)}</span></div>
      <div class="bar-track"><div class="bar-fill ${complianceClass(p)}" style="width:${Math.min(p, 100)}%"></div></div>
    </div>`;
  }).join('');

  const totals = {};
  state.purchases.forEach(p => {
    const product = COMPAH.productos.find(x => x.nombre === p.producto);
    const cat = product?.categoria || 'Otros';
    totals[cat] = (totals[cat] || 0) + p.valor;
  });
  const max = Math.max(...Object.values(totals), 1);
  $('#categoryDonut').innerHTML = Object.entries(totals)
    .sort((a,b) => b[1]-a[1])
    .map(([cat, val]) => `<div class="donut-row"><strong>${cat}</strong><span>${money(val)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(val / max * 100)}%"></div></div></div>`).join('');
}

function staticHuilaMap(filtered) {
  const points = filtered.map(p => `<circle cx="${120 + (p.lng + 76.3) * 240}" cy="${75 + (3.55 - p.lat) * 195}" r="5" fill="${p.tipo === 'Organización ACFC' ? '#d5df00' : '#00777a'}" stroke="#fff" stroke-width="2"><title>${p.nombre} · ${p.municipio}</title></circle>`).join('');
  $('#map').innerHTML = `<div class="static-map"><svg viewBox="0 0 420 620" role="img" aria-label="Mapa esquemático del Huila"><path d="M255 20 C210 55 215 110 188 145 C160 182 125 210 145 260 C162 300 114 334 126 386 C136 432 99 487 136 548 C170 604 244 595 260 540 C276 486 322 444 298 390 C276 341 330 308 295 260 C260 212 322 178 300 125 C288 88 298 45 255 20Z" fill="#dcefe8" stroke="#00777a" stroke-width="5"/><text x="210" y="310" text-anchor="middle" fill="#005a5d" font-weight="900" font-size="28">HUILA</text>${points}</svg></div>`;
}

function initMap() {
  const product = $('#mapProductFilter')?.value || 'Todos';
  const region = $('#mapRegionFilter')?.value || 'Todas las regiones';
  const filtered = COMPAH.productores.filter(p => {
    const productOk = product === 'Todos' || p.productos.includes(product);
    const regionOk = region === 'Todas las regiones' || p.region === region;
    return productOk && regionOk;
  });

  $('#mapSummary').innerHTML = [
    ['Productores visibles', filtered.length],
    ['Municipios', new Set(filtered.map(p => p.municipio)).size],
    ['Organizaciones ACFC', filtered.filter(p => p.tipo === 'Organización ACFC').length],
    ['Capacidad agregada', `${number(filtered.reduce((acc,p)=>acc+p.capacidad,0))} unidades`]
  ].map(([a,b]) => `<div class="map-summary-item"><strong>${a}</strong><span>${b}</span></div>`).join('');

  if (!window.L) {
    staticHuilaMap(filtered);
    return;
  }

  if (!state.map) {
    state.map = L.map('map', { preferCanvas: true, zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.map);
    state.huilaLayer = L.polygon(HUILA_POLYGON, {
      color: '#00777a', weight: 3, opacity: .95, fillColor: '#d5df00', fillOpacity: .13, dashArray: '7 6'
    }).bindTooltip('Departamento del Huila', { permanent: true, direction: 'center', className: 'huila-label' }).addTo(state.map);
  }

  setTimeout(() => {
    state.map.invalidateSize(true);
    const huilaBounds = L.latLngBounds(HUILA_POLYGON);
    state.map.fitBounds(huilaBounds, { padding: [34, 34], maxZoom: 8 });
  }, 120);

  state.markers.forEach(marker => marker.remove());
  state.markers = filtered.map(p => {
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: p.tipo === 'Organización ACFC' ? 9 : 7,
      color: '#ffffff', weight: 2,
      fillColor: p.tipo === 'Organización ACFC' ? '#d5df00' : '#00777a',
      fillOpacity: .94
    })
      .bindPopup(`<strong>${p.nombre}</strong><br>${p.municipio} · ${p.tipo}<br><b>Productos:</b> ${p.productos.join(', ')}<br><b>Capacidad:</b> ${number(p.capacidad)} ${p.unidad}`)
      .addTo(state.map);
    return marker;
  });

  if (filtered.length > 0) {
    const bounds = L.latLngBounds(filtered.map(p => [p.lat, p.lng]));
    setTimeout(() => state.map.fitBounds(bounds.pad(.28), { padding: [46, 46], maxZoom: 9 }), 260);
  }
}

function bindLoginV11() {
  const form = $('#entryLoginForm');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      document.body.classList.add('authenticated');
      const selectedRole = $('#entryRole')?.value;
      if ($('#roleSelector') && selectedRole) $('#roleSelector').value = selectedRole;
      showToast(`Bienvenido a COMPAH · Rol: ${selectedRole}`);
      setTimeout(() => { if (state.currentView === 'mapa') initMap(); }, 300);
    });
  }
  const info = $('#entryMoreInfo');
  if (info && !info.dataset.bound) {
    info.dataset.bound = 'true';
    info.addEventListener('click', () => {
      document.body.classList.add('authenticated');
      setView('home');
      showToast('Conoce la arquitectura funcional de COMPAH.');
    });
  }
  const logout = $('#logoutBtn');
  if (logout && !logout.dataset.bound) {
    logout.dataset.bound = 'true';
    logout.addEventListener('click', () => {
      document.body.classList.remove('authenticated');
      showToast('Sesión cerrada.');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindLoginV11();
  const readmeVersion = document.querySelector('.brand-card .badge');
  if (readmeVersion) readmeVersion.textContent = 'Prototipo institucional v1.1';
});


/* ==============================
   COMPAH v1.2 · Mapa robusto estilo Día E Huila
   ============================== */
const HUILA_BOUNDS_V12 = [[1.60, -76.42], [3.55, -74.65]];
const HUILA_POLYGON_V12 = [
  [3.44, -74.83], [3.34, -74.97], [3.20, -75.04], [3.05, -75.09], [2.91, -75.24],
  [2.78, -75.39], [2.63, -75.52], [2.49, -75.66], [2.36, -75.82], [2.22, -75.95],
  [2.06, -76.11], [1.88, -76.28], [1.68, -76.19], [1.74, -75.99], [1.91, -75.78],
  [2.08, -75.60], [2.29, -75.43], [2.52, -75.27], [2.78, -75.13], [3.03, -75.01],
  [3.26, -74.89]
];

function buildHuilaIconV12(tipo) {
  const fill = tipo === 'Organización ACFC' ? '#d5df00' : '#00777a';
  return L.divIcon({
    className: 'compah-marker-v12',
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${fill};border:3px solid white;box-shadow:0 8px 20px rgba(0,54,56,.32)"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function resetMapContainerV12() {
  const el = $('#map');
  if (!el) return null;
  if (state.map) {
    try { state.map.remove(); } catch (e) {}
  }
  state.map = null;
  state.markers = [];
  el.innerHTML = '<div class="map-toolbar-v12"><button type="button" id="fitHuilaBtn">Ajustar Huila</button><button type="button" id="fitMarkersBtn">Ver oferta</button></div>';
  el.classList.add('map-v12-ready');
  return el;
}

function renderMapSummaryV12(filtered) {
  const target = $('#mapSummary');
  if (!target) return;
  target.innerHTML = [
    ['Productores visibles', filtered.length],
    ['Municipios', new Set(filtered.map(p => p.municipio)).size],
    ['Organizaciones ACFC', filtered.filter(p => p.tipo === 'Organización ACFC').length],
    ['Capacidad agregada', `${number(filtered.reduce((acc,p)=>acc+p.capacidad,0))} unidades`]
  ].map(([a,b]) => `<div class="map-summary-item"><strong>${a}</strong><span>${b}</span></div>`).join('');
}

function initMap() {
  const product = $('#mapProductFilter')?.value || 'Todos';
  const region = $('#mapRegionFilter')?.value || 'Todas las regiones';
  const filtered = COMPAH.productores.filter(p => {
    const productOk = product === 'Todos' || p.productos.includes(product);
    const regionOk = region === 'Todas las regiones' || p.region === region;
    return productOk && regionOk;
  });

  renderMapSummaryV12(filtered);

  if (!window.L) {
    staticHuilaMap(filtered);
    return;
  }

  const el = resetMapContainerV12();
  if (!el) return;

  state.map = L.map(el, {
    preferCanvas: false,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false,
    zoomSnap: 0.25,
    wheelDebounceTime: 80
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 6,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 3,
    attribution: '&copy; OpenStreetMap'
  }).addTo(state.map);

  const huilaLayer = L.polygon(HUILA_POLYGON_V12, {
    color: '#006e72',
    weight: 4,
    opacity: 1,
    fillColor: '#d5df00',
    fillOpacity: 0.15,
    dashArray: '8 7'
  }).addTo(state.map);

  huilaLayer.bindTooltip('HUILA', {
    permanent: true,
    direction: 'center',
    className: 'huila-label'
  });

  const markersGroup = L.featureGroup().addTo(state.map);
  filtered.forEach(p => {
    const marker = L.marker([p.lat, p.lng], { icon: buildHuilaIconV12(p.tipo), riseOnHover: true })
      .bindPopup(`<strong>${p.nombre}</strong><br>${p.municipio} · ${p.region}<br><b>Tipo:</b> ${p.tipo}<br><b>Productos:</b> ${p.productos.join(', ')}<br><b>Capacidad:</b> ${number(p.capacidad)} ${p.unidad}`);
    marker.addTo(markersGroup);
    state.markers.push(marker);
  });

  const fitHuila = () => {
    state.map.invalidateSize(true);
    state.map.fitBounds(HUILA_BOUNDS_V12, { padding: [34, 34], maxZoom: 8 });
  };
  const fitMarkers = () => {
    state.map.invalidateSize(true);
    if (filtered.length > 0) state.map.fitBounds(markersGroup.getBounds().pad(.32), { padding: [40, 40], maxZoom: 9 });
    else fitHuila();
  };

  $('#fitHuilaBtn')?.addEventListener('click', fitHuila);
  $('#fitMarkersBtn')?.addEventListener('click', fitMarkers);

  requestAnimationFrame(() => {
    fitHuila();
    setTimeout(fitMarkers, 260);
    setTimeout(() => state.map.invalidateSize(true), 650);
  });
}

function bindMapFiltersV12() {
  ['mapProductFilter', 'mapRegionFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.v12bound) {
      el.dataset.v12bound = 'true';
      el.addEventListener('change', () => {
        if (state.currentView === 'mapa') setTimeout(initMap, 50);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindMapFiltersV12();
  const badge = document.querySelector('.brand-card .badge');
  if (badge) badge.textContent = 'Prototipo institucional v1.2';
  const chip = document.querySelector('.login-chip');
  if (chip) chip.textContent = 'Versión 1.2 · Prototipo institucional';
});

/* ==============================
   COMPAH v1.3 · KPIs minimalistas y lectura del mapa al pasar el cursor
   ============================== */
function renderKpis() {
  const municipiosCubiertos = new Set(COMPAH.productores.map(p => p.municipio)).size;
  const totalContratos = state.contracts.reduce((acc, c) => acc + c.valorTotal, 0);
  const totalLocal = state.contracts.reduce((acc, c) => acc + c.comprasLocales, 0);
  const totalAlimentos = state.contracts.reduce((acc, c) => acc + c.valorAlimentos, 0);
  const comprasValidadas = state.purchases.filter(p => p.estado === 'Aprobado').length;
  const alertas = state.contracts.filter(c => percent(c) < 30).length + COMPAH.productores.filter(p => p.estado !== 'Validado').length;
  const compliance = Math.round((totalLocal / totalAlimentos) * 100);
  const validatedPct = Math.round((comprasValidadas / Math.max(state.purchases.length, 1)) * 100);
  const acfc = COMPAH.productores.filter(p => p.tipo === 'Organización ACFC').length;
  const minimalAccent = 'var(--green)';
  const kpis = [
    { label: 'Productores registrados', value: number(COMPAH.productores.length), score: 92, accent: minimalAccent, note: 'Base territorial inicial con productores y organizaciones por municipio, producto y capacidad.' },
    { label: 'Organizaciones ACFC', value: number(acfc), score: Math.min(100, acfc * 7), accent: minimalAccent, note: 'Organizaciones priorizadas para compras públicas locales y asociatividad rural.' },
    { label: 'Productos ofertados', value: number(COMPAH.productos.length), score: 80, accent: minimalAccent, note: 'Catálogo con lácteos, carnes, frutas, pasifloras, piscícola, hortalizas, café, cacao y transformados.' },
    { label: 'Municipios cubiertos', value: `${municipiosCubiertos}/37`, score: Math.round(municipiosCubiertos / 37 * 100), accent: minimalAccent, note: 'Cobertura departamental para análisis territorial de oferta y demanda.' },
    { label: 'Contratos registrados', value: number(state.contracts.length), score: Math.min(100, state.contracts.length * 15), accent: minimalAccent, note: 'Contratos alimentarios asociados a entidad, operador, supervisor y meta Ley 2046.' },
    { label: 'Valor total contratos', value: money(totalContratos), score: 76, accent: minimalAccent, note: 'Universo contractual simulado con recursos públicos destinados a programas alimentarios.' },
    { label: 'Compra local acumulada', value: money(totalLocal), score: Math.min(100, compliance + 28), accent: minimalAccent, note: 'Valor reportado como comprado a pequeños productores locales y organizaciones ACFC.' },
    { label: 'Cumplimiento promedio', value: `${compliance}%`, score: compliance, accent: compliance < 30 ? 'var(--danger)' : minimalAccent, note: 'Indicador central: debe ser mínimo del 30% del valor destinado a compra de alimentos.' },
    { label: 'Compras validadas', value: number(comprasValidadas), score: validatedPct, accent: minimalAccent, note: 'Compras con soporte aprobado por supervisor. Mejora la trazabilidad contractual.' },
    { label: 'Alertas activas', value: number(alertas), score: Math.max(8, 100 - alertas * 10), accent: alertas > 4 ? 'var(--danger)' : minimalAccent, note: 'Alertas por bajo cumplimiento, documentos pendientes o compras por validar.' }
  ];

  $('#kpiGrid').innerHTML = kpis.map((k, idx) => `
    <article class="kpi-card" data-kpi-index="${idx}" style="--score:${k.score}; --accent:${k.accent}">
      <span>${k.label}</span>
      <strong>${k.value}</strong>
      <small>${k.score}% lectura</small>
      <div class="kpi-line"><b></b></div>
    </article>`).join('');

  $$('.kpi-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('.kpi-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const k = kpis[Number(card.dataset.kpiIndex)];
      setKpiInsight(k.label, k.value, k.note);
    });
  });
  setKpiInsight('Cumplimiento promedio', `${compliance}%`, 'Indicador de seguimiento Ley 2046. La meta mínima es 30%; el tablero permite identificar contratos en riesgo y orientar gestión supervisora.');
}

function buildHuilaIconV13(tipo) {
  const fill = tipo === 'Organización ACFC' ? '#c9d600' : '#00777a';
  return L.divIcon({
    className: 'compah-marker-v13',
    html: `<span style="display:block;width:17px;height:17px;border-radius:50%;background:${fill};border:3px solid white;box-shadow:0 8px 20px rgba(0,54,56,.25)"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function mapHoverHtmlV13(p, selectedProduct) {
  const visibleProducts = selectedProduct && selectedProduct !== 'Todos' ? p.productos.filter(x => x === selectedProduct) : p.productos;
  const productsHtml = (visibleProducts.length ? visibleProducts : p.productos).map(x => `<span>${x}</span>`).join('');
  return `<h5>${p.nombre}</h5>
    <p><strong>${p.municipio}</strong> · ${p.region}<br>${p.tipo}<br>Capacidad reportada: <strong>${number(p.capacidad)} ${p.unidad}</strong></p>
    <div class="hover-tags">${productsHtml}</div>`;
}

function renderMapSummaryV13(filtered, selectedProduct) {
  const target = $('#mapSummary');
  if (!target) return;
  target.innerHTML = [
    ['Productores visibles', filtered.length],
    ['Municipios', new Set(filtered.map(p => p.municipio)).size],
    ['Organizaciones ACFC', filtered.filter(p => p.tipo === 'Organización ACFC').length],
    ['Capacidad agregada', `${number(filtered.reduce((acc,p)=>acc+p.capacidad,0))} unidades`]
  ].map(([a,b]) => `<div class="map-summary-item"><strong>${a}</strong><span>${b}</span></div>`).join('') +
  `<div id="mapHoverInfo" class="map-hover-card"><h5>Lectura al pasar el cursor</h5><p>Selecciona un producto y pasa el cursor sobre cada marcador del mapa para ver productor, municipio, línea ofertada y capacidad.</p></div>`;
}

function setMapHoverInfoV13(producer, selectedProduct) {
  const el = $('#mapHoverInfo');
  if (!el) return;
  if (!producer) {
    el.classList.remove('active');
    el.innerHTML = `<h5>Lectura al pasar el cursor</h5><p>Selecciona un producto y pasa el cursor sobre cada marcador del mapa para ver productor, municipio, línea ofertada y capacidad.</p>`;
    return;
  }
  el.classList.add('active');
  el.innerHTML = mapHoverHtmlV13(producer, selectedProduct);
}

function initMap() {
  const product = $('#mapProductFilter')?.value || 'Todos';
  const region = $('#mapRegionFilter')?.value || 'Todas las regiones';
  const filtered = COMPAH.productores.filter(p => {
    const productOk = product === 'Todos' || p.productos.includes(product);
    const regionOk = region === 'Todas las regiones' || p.region === region;
    return productOk && regionOk;
  });

  renderMapSummaryV13(filtered, product);

  if (!window.L) {
    staticHuilaMap(filtered);
    return;
  }

  const el = resetMapContainerV12();
  if (!el) return;

  state.map = L.map(el, {
    preferCanvas: false,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false,
    zoomSnap: 0.25,
    wheelDebounceTime: 80
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 6,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 3,
    attribution: '&copy; OpenStreetMap'
  }).addTo(state.map);

  const huilaLayer = L.polygon(HUILA_POLYGON_V12, {
    color: '#00777a', weight: 3, opacity: .9, fillColor: '#c9d600', fillOpacity: 0.08, dashArray: '8 7'
  }).addTo(state.map);

  huilaLayer.bindTooltip('HUILA', { permanent: true, direction: 'center', className: 'huila-label' });

  const markersGroup = L.featureGroup().addTo(state.map);
  filtered.forEach(p => {
    const marker = L.marker([p.lat, p.lng], { icon: buildHuilaIconV13(p.tipo), riseOnHover: true })
      .bindTooltip(`${p.nombre} · ${p.municipio}`, { direction: 'top', offset: [0, -10] })
      .bindPopup(`<strong>${p.nombre}</strong><br>${p.municipio} · ${p.region}<br><b>Tipo:</b> ${p.tipo}<br><b>Productos:</b> ${p.productos.join(', ')}<br><b>Capacidad:</b> ${number(p.capacidad)} ${p.unidad}`)
      .on('mouseover', () => setMapHoverInfoV13(p, product))
      .on('focus', () => setMapHoverInfoV13(p, product));
    marker.addTo(markersGroup);
    state.markers.push(marker);
  });

  state.map.on('mouseout', (e) => {
    if (e.originalEvent && e.originalEvent.relatedTarget && e.originalEvent.relatedTarget.closest && e.originalEvent.relatedTarget.closest('.leaflet-marker-icon')) return;
  });

  const fitHuila = () => {
    state.map.invalidateSize(true);
    state.map.fitBounds(HUILA_BOUNDS_V12, { padding: [34, 34], maxZoom: 8 });
  };
  const fitMarkers = () => {
    state.map.invalidateSize(true);
    if (filtered.length > 0) state.map.fitBounds(markersGroup.getBounds().pad(.32), { padding: [40, 40], maxZoom: 9 });
    else fitHuila();
  };

  $('#fitHuilaBtn')?.addEventListener('click', fitHuila);
  $('#fitMarkersBtn')?.addEventListener('click', fitMarkers);

  requestAnimationFrame(() => {
    fitHuila();
    setTimeout(fitMarkers, 260);
    setTimeout(() => state.map.invalidateSize(true), 650);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const badge = document.querySelector('.brand-card .badge');
  if (badge) badge.textContent = 'Prototipo institucional v1.3';
  const chip = document.querySelector('.login-chip');
  if (chip) chip.textContent = 'Versión 1.3 · Prototipo institucional';
});
