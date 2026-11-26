/* Pantallas 2: cantidades, cronograma y avance, actas, adicionales, requisiciones, inventario, SST y documentos. */
(function () {
  'use strict';
  const J = window.JERL, { el, esc, fechaCO } = J;
  const dias = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  const colorConsumo = p => p > 1.000001 ? ['rojo', '#D32F2F'] : p >= 0.999999 ? ['Completo', '#4A7C8C'] : p >= 0.9 ? ['naranja', '#E8710A'] : p > 0.7 ? ['amarillo', '#C9A100'] : ['verde', '#2E7D32'];
  const programado = (it, f) => { if (!it.inicioProp || !it.finProp) return 0; if (f < it.inicioProp) return 0; if (f >= it.finProp) return 1; const n = dias(it.inicioProp, it.finProp) + 1; return (dias(it.inicioProp, f) + 1) / n; };
  const acumulado = (med, item, hasta) => med.filter(m => m.item === item && (!hasta || m.fecha <= hasta)).reduce((s, m) => s + Number(m.cantidad), 0);
  const descargarPar = r => { J.descargar(r.xlsx); if (r.pdf) J.descargar(r.pdf); };

  /* ---------------- CANTIDADES ---------------- */
  J.PANTALLAS.cantidades = async (m, item) => {
    const med = (await J.api('mediciones.listar')).mediciones;
    if (!item) {
      m.append(J.titulo('Cantidades de obra'), el('p', { class: 'ayuda' }, 'Consumo de cada ítem frente a lo contratado: verde ≤ 70 % · amarillo 70–90 % · naranja 90–<100 % · Completo = 100 % · rojo > 100 % (mayor cantidad: la app crea un adicional "Detectado").'));
      m.append(J.tabla([{ t: 'Ítem', k: 'item' }, { t: 'Actividad', k: 'descripcion' }, { t: 'Und', k: 'und' }, { t: 'Contratada', f: x => J.num(x.cantidad, 4), c: 'num' },
        { t: 'Medida acumulada', f: x => J.num(acumulado(med, x.item), 4), c: 'num' },
        { t: '% consumido', f: x => { const p = acumulado(med, x.item) / x.cantidad, c = colorConsumo(p); return el('span', { class: 'chip', style: 'background:' + c[1] + ';color:#fff' }, J.pct(p) + (c[0] === 'Completo' ? ' · Completo' : '')); } }],
        J.st.items, { click: x => J.ir('#/cantidades/' + x.item) }));
      return;
    }
    const it = J.st.items.find(i => i.item === item), mi = med.filter(x => x.item === item).sort((a, b) => a.fecha < b.fecha ? 1 : -1), acu = acumulado(med, item), p = acu / it.cantidad, c = colorConsumo(p);
    m.append(J.titulo('Ítem ' + it.item + ' · ' + it.descripcion, el('a', { class: 'btn sec', href: '#/cantidades' }, 'Volver')));
    m.append(el('div', { class: 'kpis' }, el('div', { class: 'kpi' }, el('span', {}, 'Contratada'), el('b', {}, J.num(it.cantidad, 4) + ' ' + it.und)), el('div', { class: 'kpi' }, el('span', {}, 'Medida acumulada'), el('b', {}, J.num(acu, 4) + ' ' + it.und)),
      el('div', { class: 'kpi', style: 'border-color:' + c[1] }, el('span', {}, 'Consumo'), el('b', { style: 'color:' + c[1] }, J.pct(p)))));
    if (J.puede('cantidades', 'R')) m.append(formMedicion(it));
    m.append(el('h2', {}, 'Mediciones registradas'), J.tabla([{ t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: 'Frente', k: 'frente' }, { t: 'Descripción / localización', k: 'descripcion' },
      { t: 'Medidas', f: x => ((x.valores || {}).f || []).map(y => y.l + ' ' + y.v).join(' × ') }, { t: 'Cantidad', f: x => J.num(x.cantidad, 4), c: 'num' }, { t: 'Acta', f: x => x.actaId ? 'Incluida' : 'Pendiente' },
      { t: '', f: x => !x.actaId && J.puede('cantidades', 'A') ? el('button', { class: 'btn mini sec', onclick: async e => { e.stopPropagation(); const mot = await J.preguntar('Anular medición', 'Motivo'); if (!mot) return; try { await J.api('mediciones.anular', { id: x.id, motivo: mot }); J.ir('#/cantidades/' + item); } catch (er) { J.aviso(er.message, 'rojo'); } } }, 'Anular') : '' }], mi));
  };
  function formMedicion(it) {
    const tb = J.st.config.tablas || {}, d = { fecha: J.hoy(), frente: it.frente, descripcion: '', signo: 1 };
    const fac = { area: [['Largo (m)'], ['Alto o ancho (m)'], ['Veces', 1]], volumen: [['Largo (m)'], ['Ancho (m)'], ['Alto o espesor (m)'], ['Veces', 1]], peso: [['Peso por metro (kg/m)'], ['Longitud (m)'], ['Cantidad de elementos', 1]],
      dias: [['Días'], ['Cantidad', 1]], conteo: [['Unidades']], viajes: [['Capacidad del vehículo (m³)'], ['Número de viajes']] }[it.tipoMedicion || 'conteo'] || [['Cantidad']];
    const vals = fac.map(f => ({ l: f[0], v: f[1] ?? '' }));
    const total = el('b', {}, '—');
    const recalc = () => { const n = vals.reduce((s, x) => s * (Number(x.v) || 0), 1) * d.signo; total.textContent = isNaN(n) ? '—' : J.num(n, 4) + ' ' + it.und; };
    const inputs = vals.map((x, i) => J.campo(x.l, J.inp('number', x.v, v => { x.v = v; recalc(); }, { step: 'any', id: 'fac' + i })));
    const ayudas = { area: 'Área = largo × alto (o ancho) × veces.', volumen: 'Volumen = largo × ancho × alto × veces.', peso: 'Peso = kg/m × longitud × cantidad. Elija el perfil de la tabla base para traer los kg/m.', dias: 'Días de alquiler o uso × cantidad.', conteo: 'Número de unidades.', viajes: 'Volumen = capacidad del vehículo × viajes. Elija el vehículo de la tabla base.' };
    const extra = [];
    if (it.tipoMedicion === 'peso' && (tb.perfiles || []).length) extra.push(J.campo('Perfil (tabla base)', J.sel([{ v: '', t: '—' }].concat(tb.perfiles.map(p => ({ v: p.kgm, t: p.nombre + ' · ' + p.kgm + ' kg/m' }))), '', v => { vals[0].v = Number(v); document.getElementById('fac0').value = v; recalc(); })));
    if (it.tipoMedicion === 'viajes' && (tb.vehiculos || []).length) extra.push(J.campo('Vehículo (tabla base)', J.sel([{ v: '', t: '—' }].concat(tb.vehiculos.map(p => ({ v: p.capacidad, t: p.placa + ' · ' + p.capacidad + ' m³ ' + (p.condicion || '') }))), '', v => { vals[0].v = Number(v); document.getElementById('fac0').value = v; recalc(); })));
    const guardar = async () => {
      if (vals.some(x => x.v === '' || isNaN(Number(x.v)))) return J.aviso('Complete todas las medidas con números', 'naranja');
      try { const r = await J.api('mediciones.guardar', { medicion: { item: it.item, fecha: d.fecha, frente: d.frente, descripcion: d.descripcion, tipo: it.tipoMedicion, signo: d.signo, valores: { f: vals } } }, { cola: true, desc: 'Medición ' + it.item });
        if (!r.encolado) J.aviso('Medición guardada: ' + J.num(r.medicion.cantidad, 4) + ' ' + it.und, 'verde'); J.ir('#/cantidades/' + it.item); } catch (e) { J.aviso(e.message, 'rojo'); }
    };
    return el('div', { class: 'card form' }, el('h2', {}, 'Nueva medición'), el('p', { class: 'ayuda' }, ayudas[it.tipoMedicion] || ''),
      el('div', { class: 'fila-in' }, J.campo('Fecha', J.inp('date', d.fecha, v => d.fecha = v)), J.campo('Frente', J.sel(J.st.config.frentes.map(f => f.nombre), d.frente, v => d.frente = v))),
      J.campo('Descripción / localización', J.inp('text', '', v => d.descripcion = v), 'Ej.: eje 3–4, paño norte, nivel 2.'), ...extra, el('div', { class: 'fila-in' }, inputs),
      J.campo('Tipo', J.sel([{ v: '1', t: 'Suma (obra ejecutada)' }, { v: '-1', t: 'Resta (descuento / corrección)' }], '1', v => { d.signo = Number(v); recalc(); }), 'Use "Resta" para descontar vacíos o corregir.'),
      el('p', {}, 'Cantidad: ', total), el('button', { class: 'btn', onclick: guardar }, 'Guardar medición'));
  }

  /* ---------------- CRONOGRAMA Y AVANCE ---------------- */
  const colorAtraso = (d, just) => just ? ['Justificado', '#5B6BB5'] : d <= 0 ? ['Al día', '#2E7D32'] : d <= 2 ? [d + ' d', '#C9A100'] : d <= 5 ? [d + ' d', '#E8710A'] : d <= 10 ? [d + ' d', '#D32F2F'] : [d + ' d', '#7F0000'];
  J.PANTALLAS.avance = async (m) => {
    const med = (await J.api('mediciones.listar')).mediciones, hoy = J.hoy(), items = J.st.items.slice().sort((a, b) => a.inicioProp < b.inicioProp ? -1 : 1);
    m.append(J.titulo('Cronograma y avance', el('button', { class: 'btn sec', onclick: async () => { try { descargarPar(await J.api('excel.cronograma', { corte: hoy }, { texto: 'Llenando el cronograma…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Cronograma (Excel)'),
      el('button', { class: 'btn sec', onclick: async () => { try { descargarPar(await J.api('excel.avance', { corte: hoy }, { texto: 'Llenando el avance y la curva S…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Avance y curva S (Excel)')));
    const propEd = ['Residente', 'Administrador'].includes(J.st.yo.rol);
    m.append(el('p', { class: 'ayuda' }, (propEd ? 'Usted puede corregir las fechas propuestas (inicio y fin) directamente en la tabla: la curva S, el % programado, los atrasos, los hitos, el resumen ejecutivo y los Excel se recalculan con las fechas nuevas, y el cambio queda en la auditoría con la fecha anterior y la nueva. ' : 'Las fechas propuestas solo las cambian la Ing. Residente y el administrador. ') + 'Las fechas reales las registra quien tenga permiso de cronograma. Atraso: verde al día · amarillo 1–2 días · naranja 3–5 · rojo 6–10 · rojo oscuro > 10 · azul = justificado por la Ing. Residente.'));
    const editable = J.puede('cronograma', 'R'), justif = J.puede('avance', 'A');
    m.append(J.tabla([{ t: 'Ítem', k: 'item' }, { t: 'Actividad', k: 'descripcion' }, { t: 'Inicio propuesto', f: x => propEd ? J.inp('date', x.inicioProp, v => guardarProp(x, 'inicioProp', v)) : fechaCO(x.inicioProp) }, { t: 'Fin propuesto (hito)', f: x => propEd ? J.inp('date', x.finProp, v => guardarProp(x, 'finProp', v)) : fechaCO(x.finProp) },
      { t: 'Inicio real', f: x => editable ? J.inp('date', x.inicioReal, v => guardarFecha(x, 'inicioReal', v)) : fechaCO(x.inicioReal) },
      { t: 'Fin real', f: x => editable ? J.inp('date', x.finReal, v => guardarFecha(x, 'finReal', v)) : fechaCO(x.finReal) },
      { t: '% programado', f: x => J.pct(programado(x, hoy)), c: 'num' }, { t: '% ejecutado', f: x => J.pct(Math.min(acumulado(med, x.item) / x.cantidad, 9.99)), c: 'num' },
      { t: 'Atraso', f: x => { const d = x.finReal ? Math.max(0, dias(x.finProp, x.finReal)) : Math.max(0, dias(x.finProp, hoy)); const c = colorAtraso(d, String(x.justificado) === 'true');
        return el('span', { class: 'chip', style: 'background:' + c[1] + ';color:#fff', title: x.justificacion || '' }, c[0]); } },
      { t: '', f: x => justif ? el('button', { class: 'btn mini sec', onclick: () => justificar(x) }, String(x.justificado) === 'true' ? 'Quitar justificación' : 'Justificar') : '' }], items));
    m.append(curvaS(items, med));
  };
  let tGuardar = null, tProp = null;
  function guardarProp(it, k, v) {
    clearTimeout(tProp); tProp = setTimeout(async () => {
      const n = { item: it.item, inicioProp: it.inicioProp, finProp: it.finProp, [k]: v };
      try { const r = await J.api('items.fechasProp', n, { texto: 'Guardando fecha propuesta…' }); Object.assign(it, r.item); J.aviso('Fecha propuesta guardada (ítem ' + it.item + '). Se recalculó la programación.', 'verde'); J.ir('#/avance'); }
      catch (e) { J.aviso(e.message, 'rojo'); J.ir('#/avance'); }
    }, 900);
  }
  function guardarFecha(it, k, v) {
    clearTimeout(tGuardar); tGuardar = setTimeout(async () => { try { const r = await J.api('items.fechas', { item: it.item, [k]: v }, { silencio: true }); Object.assign(it, r.item); J.aviso('Fecha real guardada (ítem ' + it.item + ')', 'verde'); } catch (e) { J.aviso(e.message, 'rojo'); } }, 600);
  }
  async function justificar(it) {
    if (String(it.justificado) === 'true') { await J.api('items.justificar', { item: it.item, justificado: false }); it.justificado = false; return J.ir('#/avance'); }
    const t = await J.preguntar('Justificar atraso del ítem ' + it.item, 'Observación', 'Explique la causa (ej. lluvias del 20/11 registradas en bitácora, falta de material). Queda en la auditoría.');
    if (!t) return; try { const r = await J.api('items.justificar', { item: it.item, justificado: true, justificacion: t }); Object.assign(it, r.item); J.ir('#/avance'); } catch (e) { J.aviso(e.message, 'rojo'); }
  }
  function curvaS(items, med) {
    const ini = J.st.config.proyecto.inicioSemanas || items[0].inicioProp, fin = items.reduce((a, i) => i.finProp > a ? i.finProp : a, ini);
    const cd = items.reduce((s, i) => s + i.cantidad * i.vu, 0), sem = [];
    for (let d = new Date(ini + 'T00:00:00'); ; d.setDate(d.getDate() + 7)) {
      const f = new Date(d); f.setDate(f.getDate() + 6); const fi = f.toISOString().slice(0, 10);
      const prog = items.reduce((s, i) => s + i.cantidad * i.vu * programado(i, fi), 0) / cd;
      const ej = fi <= J.hoy() || d.toISOString().slice(0, 10) <= J.hoy() ? items.reduce((s, i) => s + Math.min(acumulado(med, i.item, fi), i.cantidad) * i.vu, 0) / cd : null;
      sem.push({ et: fechaCO(d.toISOString().slice(0, 10)).slice(0, 5), prog, ej }); if (fi >= fin || sem.length > 60) break;
    }
    const W = 760, H = 300, P = 44, cv = el('canvas', { width: W, height: H, class: 'grafico' }), x = cv.getContext('2d');
    const X = i => P + i * (W - P - 16) / Math.max(1, sem.length - 1), Y = v => H - 30 - v * (H - 50);
    x.font = '11px Arial'; x.fillStyle = '#4A4F55'; x.strokeStyle = '#E2DFDA';
    for (let k = 0; k <= 4; k++) { const y = Y(k / 4); x.beginPath(); x.moveTo(P, y); x.lineTo(W - 10, y); x.stroke(); x.fillText(k * 25 + '%', 6, y + 4); }
    sem.forEach((s, i) => { if (i % Math.ceil(sem.length / 10) === 0) x.fillText(s.et, X(i) - 14, H - 10); });
    const linea = (k, color) => { x.strokeStyle = color; x.lineWidth = 2.5; x.beginPath(); let empezo = false; sem.forEach((s, i) => { if (s[k] === null) return; empezo ? x.lineTo(X(i), Y(s[k])) : x.moveTo(X(i), Y(s[k])); empezo = true; }); x.stroke(); };
    linea('prog', '#5B6BB5'); linea('ej', '#C8202A');
    x.fillStyle = '#5B6BB5'; x.fillText('— Programado', W - 220, 16); x.fillStyle = '#C8202A'; x.fillText('— Ejecutado', W - 120, 16);
    const hitos = items.slice().sort((a, b) => a.finProp < b.finProp ? -1 : 1);
    return el('div', { class: 'card' }, el('h2', {}, 'Curva S semanal (valor ponderado por costo directo)'), el('div', { class: 'scroll' }, cv),
      el('h3', {}, 'Hitos (fin propuesto de cada actividad)'), J.tabla([{ t: 'Fecha hito', f: x => fechaCO(x.finProp) }, { t: 'Ítem', k: 'item' }, { t: 'Actividad', k: 'descripcion' },
        { t: 'Estado', f: x => x.finReal ? (x.finReal <= x.finProp ? 'Cumplido a tiempo' : 'Cumplido con ' + dias(x.finProp, x.finReal) + ' d de atraso') : (J.hoy() > x.finProp ? 'Vencido' : 'Por cumplir') }], hitos));
  }
  J.PANTALLAS.cronograma = J.PANTALLAS.avance;

  /* ---------------- ACTAS ---------------- */
  J.PANTALLAS.actas = async (m, id) => {
    if (id === 'nueva') return nuevaActa(m);
    if (id) return verActa(m, id);
    const r = await J.api('registros.listar', { tipo: 'acta' });
    m.append(J.titulo('Actas parciales de obra', J.puede('actas', 'R') ? el('a', { class: 'btn', href: '#/actas/nueva' }, '+ Nueva acta') : ''));
    m.append(J.tabla([{ t: 'Acta', k: 'consecutivo' }, { t: 'Corte', f: x => fechaCO(x.fecha) }, { t: 'Estado', f: x => J.chipEstado(x.estado) }, { t: 'Valor esta acta', f: x => J.money(totalesActa(x.datos).neto), c: 'num' }],
      r.registros, { click: x => J.ir('#/actas/' + x.id) }));
  };
  function totalesActa(d) {
    const a = d.aiu || {}, cd = (d.lineas || []).reduce((s, l) => s + Math.round(l.esta * l.vu), 0), adm = Math.round(cd * (a.a || 0)), imp = Math.round(cd * (a.i || 0)), uti = Math.round(cd * (a.u || 0)), iva = Math.round(uti * (a.iva || 0));
    const comp = (d.adicionales || []).reduce((s, x) => s + Math.round(x.cantidad * x.vu), 0), compT = Math.round(comp * (1 + (a.a || 0) + (a.i || 0) + (a.u || 0) * (1 + (a.iva || 0))));
    const total = cd + adm + imp + uti + iva + compT, amort = Math.round((cd + adm + imp + uti + iva) * (d.amortizacion || 0)) + (Number(d.amortizacionNoEj) || 0);
    return { cd, adm, imp, uti, iva, comp, compT, total, amort, neto: total - amort };
  }
  function tablaActa(d) {
    const t = totalesActa(d);
    return el('div', {}, J.tabla([{ t: 'Ítem', k: 'item' }, { t: 'Actividad', k: 'descripcion' }, { t: 'Und', k: 'und' }, { t: 'Contratada', f: l => J.num(l.contratada, 4), c: 'num' }, { t: 'Vr. unitario', f: l => J.money(l.vu), c: 'num' },
      { t: 'Actas anteriores', f: l => J.num(l.anteriores, 4), c: 'num' }, { t: 'Esta acta', f: l => el('b', {}, J.num(l.esta, 4)), c: 'num' }, { t: 'Acumulada', f: l => J.num(l.anteriores + l.esta, 4), c: 'num' },
      { t: '% ejec.', f: l => J.pct((l.anteriores + l.esta) / l.contratada), c: 'num' }, { t: 'Valor esta acta', f: l => J.money(l.esta * l.vu), c: 'num' }], d.lineas),
      (d.adicionales || []).length ? el('div', {}, el('h3', {}, 'Obras complementarias (adicionales y no previstos aprobados)'), J.tabla([{ t: 'Consecutivo', k: 'consecutivo' }, { t: 'Descripción', k: 'descripcion' }, { t: 'Und', k: 'und' },
        { t: 'Cantidad', f: x => J.num(x.cantidad, 4), c: 'num' }, { t: 'Vr. unitario', f: x => J.money(x.vu), c: 'num' }, { t: 'Valor', f: x => J.money(x.cantidad * x.vu), c: 'num' }], d.adicionales)) : '',
      el('table', { class: 'tdatos totales' }, [['Costo directo esta acta', t.cd], ['Administración ' + J.pct(d.aiu.a), t.adm], ['Imprevistos ' + J.pct(d.aiu.i), t.imp], ['Utilidad ' + J.pct(d.aiu.u), t.uti], ['IVA sobre utilidad ' + J.pct(d.aiu.iva), t.iva],
        ['Obras complementarias con AIU e IVA', t.compT], ['TOTAL ESTA ACTA', t.total], ['(-) Amortización de anticipo', t.amort], ['VALOR NETO A PAGAR', t.neto]].map(x => el('tr', {}, el('td', {}, x[0]), el('td', { class: 'num' }, el('b', {}, J.money(x[1])))))));
  }
  async function nuevaActa(m) {
    let corte = J.hoy(), amort = 0, desde = '';
    m.append(J.titulo('Nueva acta parcial', el('a', { class: 'btn sec', href: '#/actas' }, 'Volver')));
    const prev = el('div', {});
    const preparar = async () => {
      const r = await J.api('acta.preparar', { corte }); prev.innerHTML = '';
      const d = { lineas: r.lineas, adicionales: r.adicionales, aiu: r.aiu, amortizacion: amort };
      prev.append(el('div', { class: 'card' }, el('h2', {}, 'Vista previa · Acta ' + String(r.numero).padStart(2, '0')), el('p', { class: 'ayuda' }, 'Esta acta incluye las mediciones hasta la fecha de corte que no estén en actas anteriores, y los adicionales y no previstos en estado "Aprobado".'), tablaActa(d),
        el('button', { class: 'btn', onclick: async () => { if (!(await J.confirmar('Se creará el Acta ' + String(r.numero).padStart(2, '0') + ' y sus mediciones quedarán amarradas a ella. ¿Continuar?'))) return;
          try { const c = await J.api('acta.crear', { corte, desde, amortizacion: amort }); J.ir('#/actas/' + c.registro.id); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Crear acta')));
    };
    m.append(el('div', { class: 'card form' }, el('div', { class: 'fila-in' }, J.campo('Fecha de corte', J.inp('date', corte, v => corte = v), 'Corte semanal (lunes a domingo) o mensual (1 al último día).'),
      J.campo('Periodo desde (opcional)', J.inp('date', '', v => desde = v)), J.campo('% de amortización del anticipo', J.inp('number', 0, v => amort = (Number(v) || 0) / 100, { step: 'any' }), 'Porcentaje que se descuenta de la obra ejecutada (0 si no hay anticipo).')),
      el('button', { class: 'btn sec', onclick: preparar }, 'Ver vista previa')), prev);
  }
  async function verActa(m, id) {
    const r = await J.api('registros.obtener', { id }), reg = r.registro;
    m.append(J.titulo(reg.consecutivo + ' · corte ' + fechaCO(reg.fecha), J.chipEstado(reg.estado), el('a', { class: 'btn sec', href: '#/actas' }, 'Volver')));
    m.append(el('div', { class: 'card' }, tablaActa(reg.datos)));
    m.append(J.panelFlujo(reg, r.flujo, () => J.ir('#/actas/' + id)));
    m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => { try { descargarPar(await J.api('excel.acta', { id }, { texto: 'Armando el acta y las preactas…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Descargar Excel y PDF'),
      J.st.yo.rol === 'Administrador' ? el('button', { class: 'btn sec rojo', onclick: () => J.anular(reg, '#/actas') }, 'Anular (libera las mediciones)') : ''));
  }

  /* ---------------- ADICIONALES Y NO PREVISTOS ---------------- */
  const ESTADOS_AD = ['Detectado', 'Sustentado', 'Pactado', 'Aprobado', 'Cobrado', 'Rechazado'];
  J.PANTALLAS.adicionales = async (m, id) => {
    if (id) return verAdicional(m, id);
    const r = await J.api('registros.listar', { tipo: 'adicional' });
    m.append(J.titulo('Adicionales y no previstos', J.puede('adicionales', 'R') ? el('a', { class: 'btn', href: '#/adicionales/nuevo' }, '+ Nuevo') : ''));
    m.append(el('p', { class: 'ayuda' }, 'Estados: Detectado (la app lo crea si lo medido supera lo contratado) → Sustentado → Pactado (precio acordado) → Aprobado (ya se puede cobrar en la siguiente acta) → Cobrado (incluido en un acta aprobada). También puede quedar Rechazado.'));
    m.append(el('div', { class: 'chips' }, ESTADOS_AD.map(e => el('span', { class: 'chip est-' + e.toLowerCase() }, e + ': ' + r.registros.filter(x => x.estado === e).length))));
    m.append(J.tabla([{ t: 'No.', k: 'consecutivo' }, { t: 'Tipo', f: x => x.datos.clase === 'NP' ? 'No previsto' : 'Adicional' }, { t: 'Descripción', f: x => x.datos.descripcion }, { t: 'Cantidad', f: x => J.num(x.datos.cantidad, 4) + ' ' + (x.datos.und || ''), c: 'num' },
      { t: 'Valor', f: x => J.money((x.datos.cantidad || 0) * (x.datos.vu || 0)), c: 'num' }, { t: 'Estado', f: x => J.chipEstado(x.estado) }, { t: 'Fecha', f: x => fechaCO(x.fecha) }], r.registros, { click: x => J.ir('#/adicionales/' + x.id) }));
  };
  async function verAdicional(m, id) {
    let reg = null, flujo = null;
    if (id !== 'nuevo') { const r = await J.api('registros.obtener', { id, conFirmas: true }); reg = r.registro; flujo = r.flujo; }
    const d = reg ? reg.datos : { clase: 'AD', apu: { equipo: [], materiales: [], transporte: [], mano: [] } };
    d.apu = d.apu || { equipo: [], materiales: [], transporte: [], mano: [] };
    const ro = reg && (Object.keys(reg.firmas || {}).length > 1 || ['Aprobado', 'Cobrado', 'Rechazado'].includes(reg.estado));
    m.append(J.titulo(reg ? reg.consecutivo + ' · ' + (d.clase === 'NP' ? 'No previsto' : 'Adicional') : 'Nuevo adicional / no previsto', reg ? J.chipEstado(reg.estado) : '', el('a', { class: 'btn sec', href: '#/adicionales' }, 'Volver')));
    const f = el('div', { class: 'card form' });
    const pintar = () => {
      f.innerHTML = '';
      f.append(J.campo('Tipo', J.sel([{ v: 'AD', t: 'AD · Adicional (mayor cantidad de un ítem del contrato)' }, { v: 'NP', t: 'NP · No previsto (actividad que no está en el presupuesto)' }], d.clase, v => { d.clase = v; pintar(); }), 'AD usa el precio unitario del contrato. NP necesita un análisis de precio unitario (APU) que se pacta.'));
      if (d.clase === 'AD') f.append(J.campo('Ítem del contrato', J.sel([{ v: '', t: '—' }].concat(J.st.items.map(i => ({ v: i.item, t: i.item + ' ' + i.descripcion }))), d.item, v => { d.item = v; const it = J.st.items.find(i => i.item === v); if (it) { d.descripcion = it.descripcion; d.und = it.und; d.vu = it.vu; } pintar(); })));
      f.append(J.campo('Descripción', J.inp('text', d.descripcion, v => d.descripcion = v)), el('div', { class: 'fila-in' }, J.campo('Unidad', J.inp('text', d.und, v => d.und = v)),
        J.campo('Cantidad', J.inp('number', d.cantidad, v => d.cantidad = v, { step: 'any' })), J.campo('Valor unitario', J.inp('number', d.vu, v => d.vu = v, { step: 'any', disabled: d.clase === 'NP' }), d.clase === 'NP' ? 'Sale del APU de abajo.' : 'Precio del contrato.')));
      if (d.detectado) f.append(el('p', { class: 'chip warn' }, d.detectado));
      f.append(J.campo('Sustento técnico', el('textarea', { rows: 4, oninput: e => d.sustento = e.target.value }, d.sustento || ''), 'Por qué se necesita: causa, ubicación, referencia a bitácora, fotos y mediciones.'));
      if (d.clase === 'NP') f.append(apu(d));
    };
    pintar(); m.append(f);
    if (!ro && J.puede('adicionales', 'R')) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => {
      if (!d.descripcion || !(Number(d.cantidad) > 0)) return J.aviso('Escriba la descripción y la cantidad', 'naranja');
      try { const r = await J.api('registros.guardar', { registro: { id: reg && reg.id, tipo: 'adicional', subtipo: d.clase, fecha: reg ? reg.fecha : J.hoy(), datos: d } }); J.aviso('Guardado', 'verde'); J.ir('#/adicionales/' + r.registro.id); } catch (e) { J.aviso(e.message, 'rojo'); }
    } }, 'Guardar')));
    if (reg) {
      m.append(J.panelFlujo(reg, flujo, () => J.ir('#/adicionales/' + id), async p => { if (p.clave === 'sustento' && !d.sustento) { J.aviso('Escriba el sustento técnico y guarde antes de firmar.', 'naranja'); return false; } return d; }));
      const docAd = async () => {
        const ctx = J.ctxFormulario({ consecutivo: reg.consecutivo, firmasImg: reg.imagenesFirma });
        const esq = { titulo: d.clase === 'NP' ? 'ACTA DE PACTACIÓN DE PRECIOS – ÍTEM NO PREVISTO ' + reg.consecutivo : 'REGISTRO DE ADICIONAL ' + reg.consecutivo, codigo: 'Por asignar', version: 'Por asignar', fecha: 'Por asignar', secciones: [] };
        let h = window.FORM.documento(esq, {}, Object.assign(ctx, { flujoHtml: '' }));
        const cuerpo = `<table><tr><td class="lab">Proyecto</td><td>${esc(J.st.config.proyecto.nombre)}</td></tr><tr><td class="lab">Tipo</td><td>${d.clase === 'NP' ? 'No previsto' : 'Adicional (mayor cantidad)'}</td></tr>
          ${d.item ? `<tr><td class="lab">Ítem del contrato</td><td>${esc(d.item)}</td></tr>` : ''}<tr><td class="lab">Descripción</td><td>${esc(d.descripcion)}</td></tr><tr><td class="lab">Cantidad</td><td>${J.num(d.cantidad, 4)} ${esc(d.und || '')}</td></tr>
          <tr><td class="lab">Valor unitario</td><td>${J.money(d.vu)}</td></tr><tr><td class="lab">Valor total (costo directo)</td><td><b>${J.money((d.cantidad || 0) * (d.vu || 0))}</b></td></tr><tr><td class="lab">Estado</td><td>${esc(reg.estado)}</td></tr>
          <tr><td class="lab">Sustento técnico</td><td>${esc(d.sustento || '').replace(/\n/g, '<br>')}</td></tr></table>${d.clase === 'NP' ? apuHtml(d) : ''}${window.FORM.flujoHtml(flujo, reg, { firmasImg: reg.imagenesFirma })}`;
        h = h.replace('<p class="marca">', cuerpo + '<p class="marca">');
        await J.generarDoc('adicionales', reg, h, reg.consecutivo + '_' + J.st.config.proyecto.id, 'pdf');
      };
      m.append(el('div', { class: 'barra' }, el('button', { class: 'btn sec', onclick: docAd }, 'Descargar PDF'),
        J.puede('adicionales', 'A') && !['Cobrado', 'Rechazado'].includes(reg.estado) ? el('button', { class: 'btn sec rojo', onclick: async () => { const mot = await J.preguntar('Rechazar', 'Motivo del rechazo'); if (!mot) return; await J.api('adicional.rechazar', { id, motivo: mot }); J.ir('#/adicionales/' + id); } }, 'Rechazar') : ''));
    }
  }
  const GR = [['equipo', 'I. EQUIPO'], ['materiales', 'II. MATERIALES'], ['transporte', 'III. TRANSPORTES'], ['mano', 'IV. MANO DE OBRA']];
  function apuCalc(d) {
    const a = d.apu, sub = {};
    sub.mano = (a.mano || []).reduce((s, r) => s + (Number(r.rend) > 0 ? Number(r.jornal || 0) / Number(r.rend) : 0), 0);
    ['materiales', 'transporte'].forEach(k => sub[k] = (a[k] || []).reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0));
    sub.equipo = (a.equipo || []).reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0) + sub.mano * 0.05;
    const total = Math.round(sub.equipo + sub.materiales + sub.transporte + sub.mano); d.vu = total; return { sub, total };
  }
  function apu(d) {
    const caja = el('div', {});
    const pintar = () => {
      caja.innerHTML = ''; const c = apuCalc(d);
      caja.append(el('h3', {}, 'Análisis de precio unitario (APU)'), el('p', { class: 'ayuda' }, 'Equipo, materiales y transportes: cantidad × precio. Mano de obra: jornal total de la cuadrilla ÷ rendimiento (unidades por día). La herramienta menor se calcula sola como el 5 % de la mano de obra.'));
      GR.forEach(([k, t]) => {
        caja.append(el('h4', {}, t + ' · ' + J.money(c.sub[k])));
        (d.apu[k] || []).forEach((r, i) => caja.append(el('div', { class: 'fila' }, J.campo('Descripción', J.inp('text', r.desc, v => r.desc = v)), J.campo('Unidad', J.inp('text', r.und, v => r.und = v)),
          k === 'mano' ? J.campo('Jornal total cuadrilla', J.inp('number', r.jornal, v => { r.jornal = v; }, { step: 'any' })) : J.campo('Cantidad', J.inp('number', r.cant, v => { r.cant = v; }, { step: 'any' })),
          k === 'mano' ? J.campo('Rendimiento (und/día)', J.inp('number', r.rend, v => { r.rend = v; }, { step: 'any' })) : J.campo('Precio unitario', J.inp('number', r.precio, v => { r.precio = v; }, { step: 'any' })),
          el('button', { class: 'btn-x', onclick: () => { d.apu[k].splice(i, 1); pintar(); } }, '×'))));
        caja.append(el('button', { class: 'btn sec mini', onclick: () => { (d.apu[k] = d.apu[k] || []).push({}); pintar(); } }, '+ Agregar'));
      });
      caja.append(el('p', {}, el('b', {}, 'TOTAL COSTO DIRECTO (valor unitario): ' + J.money(c.total))), el('button', { class: 'btn sec mini', onclick: pintar }, 'Recalcular'));
    };
    pintar(); return caja;
  }
  function apuHtml(d) {
    const c = apuCalc(d);
    return '<h3>ANÁLISIS DE PRECIO UNITARIO</h3>' + GR.map(([k, t]) => `<p><b>${t}</b></p><table><tr><th>Descripción</th><th>Und</th><th>${k === 'mano' ? 'Jornal total' : 'Cantidad'}</th><th>${k === 'mano' ? 'Rendimiento' : 'Precio unitario'}</th><th>Valor parcial</th></tr>${(d.apu[k] || []).map(r => `<tr><td>${esc(r.desc || '')}</td><td class="c">${esc(r.und || '')}</td><td class="c">${k === 'mano' ? J.money(r.jornal) : J.num(r.cant, 4)}</td><td class="c">${k === 'mano' ? J.num(r.rend, 4) : J.money(r.precio)}</td><td class="c">${J.money(k === 'mano' ? (Number(r.rend) > 0 ? r.jornal / r.rend : 0) : (r.cant || 0) * (r.precio || 0))}</td></tr>`).join('')}${k === 'equipo' ? `<tr><td>Herramienta menor (5 % de M.O.)</td><td class="c">%</td><td></td><td></td><td class="c">${J.money(c.sub.mano * 0.05)}</td></tr>` : ''}<tr><td colspan="4" style="text-align:right"><b>Subtotal</b></td><td class="c"><b>${J.money(c.sub[k])}</b></td></tr></table>`).join('') + `<p><b>TOTAL COSTO DIRECTO: ${J.money(c.total)}</b></p>`;
  }

  /* ---------------- REQUISICIONES ---------------- */
  const AREAS = ['AREA TECNICA', 'EQUIPOS', 'AREA SST', 'AREA ADMINISTRATIVA'];
  J.PANTALLAS.requisiciones = async (m, id) => {
    if (id) return verRequisicion(m, id);
    const r = await J.api('registros.listar', { tipo: 'requisicion' });
    m.append(J.titulo('Requisiciones (orden de pedido a Compras)', J.puede('requisiciones', 'R') ? el('a', { class: 'btn', href: '#/requisiciones/nueva' }, '+ Nueva requisición') : ''));
    m.append(el('p', { class: 'ayuda' }, 'Flujo: quien solicita la llena y firma → la Ing. Residente aprueba (puede ajustar cantidades) → Compras gestiona (proveedor, factura y cantidad facturada) → se firma el recibido en obra (cantidad recibida). Lo recibido entra solo al inventario.'));
    m.append(J.tabla([{ t: 'No.', k: 'consecutivo' }, { t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: 'Solicitó', f: x => ((x.firmas || {}).solicito || {}).nombre || x.creadoPor }, { t: 'Líneas', f: x => (x.datos.lineas || []).length, c: 'num' },
      { t: 'Estado', f: x => J.chipEstado(x.estado) }], r.registros, { click: x => J.ir('#/requisiciones/' + x.id) }));
  };
  async function verRequisicion(m, id) {
    let reg = null, flujo = null;
    if (id !== 'nueva') { const r = await J.api('registros.obtener', { id, conFirmas: true }); reg = r.registro; flujo = r.flujo; }
    const d = reg ? reg.datos : { lineas: [], observaciones: '' };
    const fi = reg ? reg.firmas || {} : {}, editable = !reg || !Object.keys(fi).length;
    const paso = !reg ? null : !fi.solicito ? 'solicito' : !fi.aprobo ? 'aprobo' : !fi.compras ? 'compras' : !fi.recibido ? 'recibido' : null;
    m.append(J.titulo(reg ? 'Requisición No. ' + reg.consecutivo : 'Nueva requisición', reg ? J.chipEstado(reg.estado) : '', el('a', { class: 'btn sec', href: '#/requisiciones' }, 'Volver')));
    const caja = el('div', { class: 'card form' });
    const col = (k, lab, ay) => ({ k, lab, ay });
    const extra = paso === 'aprobo' ? col('aprobada', 'Cant. aprobada', 'La define la Ing. Residente; vacío = se aprueba lo solicitado.') : paso === 'compras' ? col('facturada', 'Cant. facturada', 'Según la factura del proveedor.') : paso === 'recibido' ? col('recibida', 'Cant. recibida en obra', 'Lo que realmente llegó, contado en obra.') : null;
    const pintar = () => {
      caja.innerHTML = '';
      caja.append(el('p', { class: 'ayuda' }, 'Áreas: Área técnica = materiales y elementos de obra · Equipos = herramientas y equipos · Área SST = seguridad y EPP · Área administrativa = papelería y oficina.'));
      AREAS.forEach(a => {
        const ls = d.lineas.filter(l => l.area === a);
        caja.append(el('h3', {}, a + ' (' + ls.length + ')'));
        ls.forEach(l => caja.append(el('div', { class: 'fila' },
          J.campo('Descripción', J.inp('text', l.descripcion, v => l.descripcion = v, { disabled: !editable })), J.campo('Und', J.inp('text', l.und, v => l.und = v, { disabled: !editable })),
          J.campo('Cant. solicitada', J.inp('number', l.cantidad, v => l.cantidad = v, { disabled: !editable, step: 'any' })), J.campo('Destino y/o actividad', J.inp('text', l.destino, v => l.destino = v, { disabled: !editable })),
          !editable ? el('div', { class: 'etq' }, ['aprobada', 'facturada', 'recibida'].filter(k => l[k] !== undefined && l[k] !== '').map(k => k + ': ' + l[k]).join(' · ')) : '',
          extra ? J.campo(extra.lab, J.inp('number', l[extra.k] ?? (extra.k === 'aprobada' ? l.cantidad : extra.k === 'recibida' ? (l.facturada ?? l.aprobada ?? l.cantidad) : (l.aprobada ?? l.cantidad)), v => l[extra.k] = v, { step: 'any' }), extra.ay) : '',
          paso === 'recibido' ? J.campo('Observación', J.inp('text', l.observacion, v => l.observacion = v)) : '',
          editable ? el('button', { class: 'btn-x', onclick: () => { d.lineas.splice(d.lineas.indexOf(l), 1); pintar(); } }, '×') : '')));
        if (editable) caja.append(el('button', { class: 'btn sec mini', onclick: () => { d.lineas.push({ area: a }); pintar(); } }, '+ Agregar en ' + a));
      });
      caja.append(J.campo('Observaciones', el('textarea', { rows: 2, disabled: !editable, oninput: e => d.observaciones = e.target.value }, d.observaciones || '')));
      if (paso === 'compras') caja.append(el('div', { class: 'fila-in' }, J.campo('Proveedor', J.inp('text', d.proveedor, v => d.proveedor = v), 'La base de proveedores se agregará más adelante.'), J.campo('Factura No.', J.inp('text', d.factura, v => d.factura = v)), J.campo('Fecha factura', J.inp('date', d.fechaFactura, v => d.fechaFactura = v))));
    };
    pintar(); m.append(caja);
    if (editable && J.puede('requisiciones', 'R')) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => {
      d.lineas = d.lineas.filter(l => l.descripcion); if (!d.lineas.length) return J.aviso('Agregue al menos una línea', 'naranja');
      try { const r = await J.api('registros.guardar', { registro: { id: reg && reg.id, tipo: 'requisicion', fecha: reg ? reg.fecha : J.hoy(), datos: d } }, { cola: !reg, desc: 'Requisición' }); if (r.encolado) return J.ir('#/requisiciones'); J.aviso('Guardada. Ahora fírmela para enviarla a aprobación.', 'verde'); J.ir('#/requisiciones/' + r.registro.id); } catch (e) { J.aviso(e.message, 'rojo'); }
    } }, 'Guardar')));
    if (reg) {
      m.append(J.panelFlujo(reg, flujo, () => J.ir('#/requisiciones/' + id), async () => { d.lineas.forEach(l => { if (extra && (l[extra.k] === undefined || l[extra.k] === '')) l[extra.k] = extra.k === 'aprobada' ? l.cantidad : extra.k === 'recibida' ? (l.facturada ?? l.aprobada ?? l.cantidad) : (l.aprobada ?? l.cantidad); }); return d; }));
      m.append(el('div', { class: 'barra' }, el('button', { class: 'btn sec', onclick: async () => { try { descargarPar(await J.api('excel.requisicion', { id }, { texto: 'Llenando el formato de requisición…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Descargar Excel y PDF (con comprobación)'),
        J.st.yo.rol === 'Administrador' ? el('button', { class: 'btn sec rojo', onclick: () => J.anular(reg, '#/requisiciones') }, 'Anular') : ''));
    }
  }

  /* ---------------- INVENTARIO Y TRASLADOS ---------------- */
  J.PANTALLAS.inventario = async (m, sub, id) => {
    if (sub === 'traslado') return verTraslado(m, id);
    const r = await J.api('inventario.listar'), tr = await J.api('registros.listar', { tipo: 'traslado' });
    m.append(J.titulo('Inventario y traslados', J.puede('inventario', 'R') ? el('button', { class: 'btn', onclick: () => nuevoElemento() }, '+ Elemento') : '',
      J.puede('inventario', 'R') ? el('a', { class: 'btn sec', href: '#/inventario/traslado/nuevo' }, '+ Traslado o baja') : '',
      el('button', { class: 'btn sec', onclick: async () => { try { descargarPar(await J.api('excel.inventario', {}, { texto: 'Llenando inventario y kardex…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Inventario y kardex (Excel)')));
    m.append(el('p', { class: 'ayuda' }, 'Estado: Bueno = funciona · Regular = funciona con fallas · Dañado = no funciona · En reparación · Dado de baja · Trasladado. Recepción "Pendiente" = falta que la Ing. Residente confirme el recibido. Los códigos quedan por asignar hasta que JERL los estandarice.'));
    m.append(J.tabla([{ t: 'Código', k: 'codigo' }, { t: 'Descripción', k: 'descripcion' }, { t: 'Categoría', k: 'categoria' }, { t: 'Cant.', f: x => J.num(x.cantidad, 2) + ' ' + (x.und || ''), c: 'num' }, { t: 'Estado', f: x => J.chipEstado(x.estado) },
      { t: 'Ubicación', k: 'ubicacion' }, { t: 'Origen', k: 'origen' }, { t: 'Recepción', f: x => x.recepcion === 'Sí' ? 'Sí' : J.puede('inventario', 'A') ? el('button', { class: 'btn mini', onclick: async e => { e.stopPropagation(); await J.api('inventario.confirmar', { id: x.id }); J.ir('#/inventario'); } }, 'Confirmar recibido') : 'Pendiente' }],
      r.inventario, { click: J.puede('inventario', 'R') ? x => nuevoElemento(x) : null }));
    m.append(el('h2', {}, 'Traslados y bajas'), J.tabla([{ t: 'No.', k: 'consecutivo' }, { t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: 'Tipo', f: x => x.datos.tipoMov }, { t: 'Origen → destino', f: x => (x.datos.origen || '') + ' → ' + (x.datos.destino || '') },
      { t: 'Estado', f: x => J.chipEstado(x.estado) }], tr.registros, { click: x => J.ir('#/inventario/traslado/' + x.id) }));
    m.append(el('h2', {}, 'Kardex (últimos movimientos)'), J.tabla([{ t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: 'Descripción', k: 'descripcion' }, { t: 'Movimiento', k: 'movimiento' }, { t: 'Cant.', k: 'cantidad', c: 'num' },
      { t: 'Desde', k: 'desde' }, { t: 'Hacia', k: 'hacia' }, { t: 'Soporte', k: 'soporte' }, { t: 'Registró', k: 'registro' }], r.kardex.slice(0, 100)));
  };
  async function nuevoElemento(x) {
    const d = Object.assign({ categoria: 'Herramienta', estado: 'Bueno', origen: 'Compra nueva', und: 'Und', ubicacion: 'Obra · Bodega' }, x || {});
    const C = [['codigo', 'Código', 'text', null, 'Por asignar: JERL definirá la codificación oficial.'], ['descripcion', 'Descripción', 'text'], ['categoria', 'Categoría', 'sel', ['Equipo', 'Herramienta', 'EPP / SST', 'Material'], 'Equipo = máquina o equipo eléctrico/mecánico · Herramienta = manual · EPP / SST = protección y seguridad · Material = consumible.'],
      ['und', 'Unidad', 'text'], ['cantidad', 'Cantidad', 'number', null, x ? 'La cantidad solo cambia con movimientos (traslados, bajas).' : ''], ['estado', 'Estado', 'sel', ['Bueno', 'Regular', 'Dañado', 'En reparación', 'Dado de baja', 'Trasladado']],
      ['ubicacion', 'Ubicación actual', 'text'], ['origen', 'Origen', 'sel', ['Compra nueva', 'Traslado desde Hospital San Jorge', 'Traslado desde otra obra', 'Propiedad de la empresa', 'Alquiler']], ['responsable', 'Responsable', 'text'], ['observacion', 'Observación', 'text']];
    const cont = el('div', { class: 'form' }, C.map(([k, l, t, o, ay]) => J.campo(l, t === 'sel' ? J.sel(o, d[k], v => d[k] = v) : J.inp(t, d[k], v => d[k] = v, { disabled: x && k === 'cantidad', step: 'any' }), ay)));
    const ok = await J.modal(x ? 'Editar elemento' : 'Nuevo elemento', cont, [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Guardar', v: async () => { try { await J.api('inventario.guardar', { elemento: d }); return true; } catch (e) { J.aviso(e.message, 'rojo'); return false; } } }]);
    if (ok) J.ir('#/inventario');
  }
  async function verTraslado(m, id) {
    let reg = null, flujo = null;
    if (id && id !== 'nuevo') { const r = await J.api('registros.obtener', { id, conFirmas: true }); reg = r.registro; flujo = r.flujo; }
    const inv = (await J.api('inventario.listar', {}, { silencio: true })).inventario;
    const d = reg ? reg.datos : { tipoMov: 'Traslado entre obras', origen: '', destino: J.st.config.proyecto.nombre, lineas: [] }, ed = !reg || !Object.keys(reg.firmas || {}).length;
    m.append(J.titulo(reg ? 'Traslado / baja ' + reg.consecutivo : 'Nuevo traslado o baja', reg ? J.chipEstado(reg.estado) : '', el('a', { class: 'btn sec', href: '#/inventario' }, 'Volver')));
    const caja = el('div', { class: 'card form' });
    const pintar = () => {
      caja.innerHTML = '';
      caja.append(J.campo('Tipo de movimiento', J.sel(['Traslado entre obras', 'Baja por daño', 'Baja por pérdida o hurto', 'Baja por fin de vida útil', 'Préstamo'], d.tipoMov, v => { d.tipoMov = v; pintar(); }), 'Traslado = pasa de una obra a otra · Baja por daño = ya no sirve · Pérdida o hurto · Fin de vida útil = se gastó · Préstamo = sale y debe volver.'),
        el('div', { class: 'fila-in' }, J.campo('Obra de origen', J.inp('text', d.origen, v => d.origen = v, { disabled: !ed })), J.campo('Obra de destino', J.inp('text', d.destino, v => d.destino = v, { disabled: !ed })),
          J.campo('Requisición No.', J.inp('text', d.requisicion, v => d.requisicion = v, { disabled: !ed })), J.campo('Vehículo / placa', J.inp('text', d.placa, v => d.placa = v, { disabled: !ed })), J.campo('Conductor', J.inp('text', d.conductor, v => d.conductor = v, { disabled: !ed }))));
      d.lineas.forEach((l, i) => caja.append(el('div', { class: 'fila' },
        J.campo('Elemento', ed ? J.sel([{ v: '', t: 'Escribir uno nuevo (llega de otra obra)' }].concat(inv.map(x => ({ v: x.id, t: x.descripcion + ' · ' + x.cantidad + ' ' + x.und + ' · ' + x.ubicacion }))), l.inventarioId || '', v => { l.inventarioId = v; const x = inv.find(y => y.id === v); if (x) { l.descripcion = x.descripcion; l.und = x.und; l.codigo = x.codigo; } pintar(); }) : el('div', { class: 'etq' }, l.descripcion)),
        !l.inventarioId ? J.campo('Descripción', J.inp('text', l.descripcion, v => l.descripcion = v, { disabled: !ed })) : '', J.campo('Und', J.inp('text', l.und, v => l.und = v, { disabled: !ed })),
        J.campo('Cantidad', J.inp('number', l.cantidad, v => l.cantidad = v, { disabled: !ed, step: 'any' })), J.campo('Estado al salir', J.sel(['', 'Bueno', 'Regular', 'Dañado'], l.estadoSale, v => l.estadoSale = v)),
        J.campo('Estado al recibir', J.sel(['', 'Bueno', 'Regular', 'Dañado'], l.estadoRecibe, v => l.estadoRecibe = v)), J.campo('Observación / motivo de baja', J.inp('text', l.observacion, v => l.observacion = v)),
        ed ? el('button', { class: 'btn-x', onclick: () => { d.lineas.splice(i, 1); pintar(); } }, '×') : '')));
      if (ed) caja.append(el('button', { class: 'btn sec mini', onclick: () => { d.lineas.push({ und: 'Und' }); pintar(); } }, '+ Agregar elemento'));
      caja.append(J.campo('Observaciones', el('textarea', { rows: 2, oninput: e => d.observaciones = e.target.value }, d.observaciones || ''), 'En las bajas, tome fotos del daño en Fotos (tipo "Novedades").'));
    };
    pintar(); m.append(caja);
    if (ed && J.puede('inventario', 'R')) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => {
      if (!d.lineas.length) return J.aviso('Agregue al menos un elemento', 'naranja');
      try { const r = await J.api('registros.guardar', { registro: { id: reg && reg.id, tipo: 'traslado', fecha: reg ? reg.fecha : J.hoy(), datos: d } }); J.ir('#/inventario/traslado/' + r.registro.id); } catch (e) { J.aviso(e.message, 'rojo'); }
    } }, 'Guardar')));
    if (reg) {
      m.append(J.panelFlujo(reg, flujo, () => J.ir('#/inventario/traslado/' + id), async () => d));
      m.append(el('div', { class: 'barra' }, el('button', { class: 'btn sec', onclick: async () => { try { descargarPar(await J.api('excel.inventario', { trasladoId: id }, { texto: 'Llenando el formato…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Descargar formato (Excel y PDF)')));
    }
  }

  /* ---------------- SST ---------------- */
  const colPct = p => p >= 0.9 ? '#2E7D32' : p >= 0.8 ? '#C9A100' : '#D32F2F';
  /* Trabajadores nombrados en el formato (para verificar inducción, evaluación y EPP de cada ingreso). */
  const trabajadoresDe = (esq, datos) => {
    const out = [], add = n => { if (!n) return; const t = (J.st.trabajadores || []).find(x => J.FORM_nom(x) === n); out.push({ nombre: n, documento: t ? t.documento : '' }); };
    esq.secciones.forEach((s, i) => { const v = datos['s' + i];
      if (s.tipo === 'campos') s.campos.forEach((c, j) => { if (c.t === 'trab' && v) add(v['c' + j]); });
      if (s.tipo === 'tabla' && Array.isArray(v)) s.cols.forEach((c, j) => { if (c.t === 'trab') v.forEach(f => add(f['c' + j])); }); });
    return out;
  };
  async function panelCumplimiento(cont, anio, mes) {
    const r = await J.api('sst.cumplimiento', { anio, mes }, { silencio: true });
    cont.innerHTML = '';
    cont.append(el('div', { class: 'kpis' }, el('div', { class: 'kpi', style: 'border-left-color:' + colPct(r.pct) }, el('span', {}, 'Cumplimiento del plan SST · ' + r.mes), el('b', { style: 'color:' + colPct(r.pct) }, J.pct(r.pct)), el('small', {}, r.cumplidos + ' de ' + r.esperados + ' periodos vencidos')),
      el('div', { class: 'kpi', style: 'border-left-color:#D32F2F' }, el('span', {}, 'Incumplimientos'), el('b', { style: 'color:#D32F2F' }, String(r.incumplidos))), el('div', { class: 'kpi', style: 'border-left-color:#C9A100' }, el('span', {}, 'Pendientes en curso'), el('b', {}, String(r.pendientes)))));
    cont.append(J.tabla([{ t: 'Formato', k: 'nombre' }, { t: 'Periodicidad', k: 'reglaTxt' }, { t: 'Cumplidos', f: f => f.cumplidos + ' / ' + f.esperados, c: 'num' },
      { t: '% cumplimiento', f: f => el('span', { class: 'chip', style: 'background:' + colPct(f.pct) + ';color:#fff' }, J.pct(f.pct)) },
      { t: 'Incumplimientos', f: f => f.incumplidos.length ? el('span', { class: 'mal' }, f.incumplidos.join(' · ')) : '—' }, { t: 'En curso', f: f => f.enCurso.map(x => x.texto).join(' · ') }], r.filas));
    return r;
  }
  async function reporteCumplimiento(anio, mes) {
    const r = await J.api('sst.cumplimiento', { anio, mes }, { texto: 'Calculando el cumplimiento…' });
    const esq = { titulo: 'PLAN DE TRABAJO SST OBRAS · CONTROL MENSUAL DE CUMPLIMIENTO', codigo: 'Por asignar', version: 'Por asignar', fecha: 'Por asignar', secciones: [] };
    let h = window.FORM.documento(esq, {}, J.ctxFormulario({ consecutivo: r.mes }));
    const cuerpo = `<table><tr><td class="lab">Proyecto</td><td>${esc(J.st.config.proyecto.nombre)}</td></tr><tr><td class="lab">Mes</td><td>${r.mes}</td></tr>
      <tr><td class="lab">Cumplimiento del plan</td><td><b style="color:${colPct(r.pct)}">${J.pct(r.pct)}</b> (${r.cumplidos} de ${r.esperados} periodos vencidos)</td></tr><tr><td class="lab">Incumplimientos</td><td><b>${r.incumplidos}</b></td></tr></table>
      <table><tr><th>Formato</th><th>Periodicidad</th><th>Cumplidos</th><th>%</th><th>Incumplimientos</th><th>En curso</th></tr>${r.filas.map(f => `<tr><td>${esc(f.nombre)}</td><td>${esc(f.reglaTxt)}</td><td class="c">${f.cumplidos} / ${f.esperados}</td><td class="c" style="color:${colPct(f.pct)}"><b>${J.pct(f.pct)}</b></td><td class="mal">${esc(f.incumplidos.join(' · '))}</td><td>${esc(f.enCurso.map(x => x.texto).join(' · '))}</td></tr>`).join('')}</table>
      <p class="nota">Un periodo se cuenta como cumplido solo si el formato quedó cerrado con firma y evidencia fotográfica. Periodicidades según el Plan de trabajo SST obras.</p>
      <table><tr><td class="firma">______________________<br><b>Responsable SST</b></td><td class="firma">______________________<br><b>Ing. Residente</b></td></tr></table>`;
    h = h.replace('<p class="marca">', cuerpo + '<p class="marca">');
    await J.generarDoc('sst', null, h, 'Control_cumplimiento_plan_SST_' + r.mes, 'pdf', 'Control mensual plan SST');
  }
  J.reporteCumplimientoSST = reporteCumplimiento;
  async function evidencias(cont, reg, esq, ro) {
    cont.innerHTML = '';
    const r = await J.api('fotos.listar', { registroId: reg.id }, { silencio: true });
    cont.append(el('h2', {}, 'Evidencia fotográfica (obligatoria) · ' + r.fotos.length), el('p', { class: 'ayuda' }, 'Tome al menos una foto que demuestre la inspección o actividad. Sale con marca de agua (logo, obra, fecha y hora, GPS y quién la tomó). Sin evidencia la app no deja cerrar el formato. Sin señal, la foto queda pendiente y se envía sola.'));
    if (!ro) {
      const inp = el('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true });
      const com = J.inp('text', '', () => { }, { placeholder: 'Qué muestra la foto (opcional)' });
      inp.onchange = async e => { const a = e.target.files[0]; if (!a) return; J.cargando(true, 'Poniendo marca de agua…');
        try { const f = await J.marcaDeAgua(a, { tipo: 'SST', frente: '', item: '', comentario: (esq.titulo.slice(0, 40) + ' ' + reg.consecutivo + (com.value ? ' · ' + com.value : '')).trim(), registroId: reg.id });
          J.cargando(false); const x = await J.api('foto.subir', { foto: f }, { cola: true, desc: 'Evidencia ' + reg.consecutivo, texto: 'Enviando evidencia…' }); if (x.foto) J.aviso('Evidencia guardada: ' + x.foto.consecutivo, 'verde'); evidencias(cont, reg, esq, ro); }
        catch (er) { J.aviso(er.message, 'rojo'); } finally { J.cargando(false); e.target.value = ''; } };
      cont.append(el('div', { class: 'fila-in' }, J.campo('Descripción de la evidencia', com), el('label', { class: 'btn rojo' }, 'Tomar foto de evidencia', inp)));
    }
    const gal = el('div', { class: 'galeria' }); cont.append(gal);
    r.fotos.forEach(f => gal.append(el('figure', { 'data-id': f.archivoId }, el('div', { class: 'mini-img' }), el('figcaption', {}, el('b', {}, f.consecutivo), ' · ' + fechaCO(f.fecha) + ' ' + f.fecha.slice(11, 16)))));
    if (r.fotos.length) { const im = await J.api('fotos.miniaturas', { ids: r.fotos.slice(0, 24).map(f => f.archivoId) }, { silencio: true }); gal.querySelectorAll('figure').forEach(fg => { const s2 = im.imagenes[fg.dataset.id]; if (s2) fg.firstChild.append(el('img', { src: s2 })); }); }
    return r.fotos;
  }
  /** Estado de uso del formato hoy, según sus periodos de uso. */
  const usoSST = id => { const c = (J.st.config.sstPeriodicidad || []).find(x => x.id === id); if (!c) return el('small', {}, 'Sin periodicidad en el plan (no se controla)');
    const p = (c.periodos || []).find(q => (!q.desde || q.desde <= J.hoy()) && (!q.hasta || q.hasta >= J.hoy()));
    return el('small', { class: p ? '' : 'mal' }, p ? 'En uso' + (p.hasta ? ' hasta el ' + fechaCO(p.hasta) : '') : 'No se usa hoy (no se exige)'); };
  J.PANTALLAS.sst = async (m, formato, id) => {
    const ORD = window.SST_ORDEN;
    if (!formato) {
      const r = await J.api('registros.listar', { tipo: 'sst', limite: 2000 });
      const ult = {}; r.registros.forEach(x => { if (!ult[x.subtipo] || ult[x.subtipo] < x.fecha) ult[x.subtipo] = x.fecha; });
      let mes = J.hoy().slice(0, 7);
      m.append(J.titulo('Seguridad y salud en el trabajo', el('a', { class: 'btn sec', href: '#/sst/_periodos' }, 'Formatos en uso (periodos)'), el('button', { class: 'btn sec', onclick: () => reporteCumplimiento(mes.slice(0, 4), mes.slice(5, 7)) }, 'Control mensual del plan SST (PDF)')));
      const cum = el('div', {});
      m.append(el('div', { class: 'card' }, el('h2', {}, 'Cumplimiento del plan de trabajo SST'), el('p', { class: 'ayuda' }, 'Periodicidades: semanal (ATS alturas y demolición, escaleras, andamios, equipos y maquinaria, orden y aseo), 2 veces al mes (botiquines), mensual (extintores, emergencia, eléctricas, locativa, señalización), cada ingreso de personal (inducción, evaluación, entrega de EPP) y permiso de alturas semanal con verificación diaria solo los días en que la bitácora dice que hay trabajo en alturas. Un periodo cuenta como cumplido cuando el formato queda cerrado con firma y evidencia.'),
        J.campo('Mes', J.inp('month', mes, v => { mes = v; panelCumplimiento(cum, v.slice(0, 4), v.slice(5, 7)); })), cum));
      panelCumplimiento(cum, mes.slice(0, 4), mes.slice(5, 7));
      const grupos = {}; ORD.forEach(k => { const e = ESQ[k]; (grupos[e.grupo] = grupos[e.grupo] || []).push(e); });
      Object.keys(grupos).forEach(g => { m.append(el('h2', {}, g), el('div', { class: 'tarjetas' }, grupos[g].map(e => el('a', { class: 'tarjeta', href: '#/sst/' + e.id }, el('b', {}, e.titulo), el('small', {}, e.codigo + ' · v' + e.version),
        el('small', {}, 'Periodicidad: ' + e.periodicidad), usoSST(e.id), el('small', { class: ult[e.id] ? '' : 'mal' }, ult[e.id] ? 'Último: ' + fechaCO(ult[e.id]) : 'Sin registros'))))); });
      return;
    }
    if (formato === '_periodos') { m.append(J.titulo('Formatos SST en uso (periodos de uso)', el('a', { class: 'btn sec', href: '#/sst' }, 'Volver'))); const c = el('div', {}); m.append(c); J.editorPeriodosSST(c); return; }
    const esq = ESQ[formato]; if (!esq) return m.append(el('div', { class: 'card' }, 'Formato no encontrado'));
    if (!id) {
      const r = await J.api('registros.listar', { tipo: 'sst', subtipo: formato });
      m.append(J.titulo(esq.titulo, J.puede('sst', 'R') ? el('a', { class: 'btn', href: '#/sst/' + formato + '/nuevo' }, '+ Diligenciar') : '', el('a', { class: 'btn sec', href: '#/sst' }, 'Volver')));
      m.append(el('p', { class: 'ayuda' }, esq.codigo + ' · Versión ' + esq.version + ' · Periodicidad: ' + esq.periodicidad));
      m.append(J.tabla([{ t: 'No.', k: 'consecutivo' }, { t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: 'Diligenció', k: 'creadoPor' }, { t: 'Estado', f: x => J.chipEstado(x.estado) }], r.registros, { click: x => J.ir('#/sst/' + formato + '/' + x.id) }));
      return;
    }
    let reg = null, flujo = null;
    if (id !== 'nuevo') { const r = await J.api('registros.obtener', { id, conFirmas: true }); reg = r.registro; flujo = r.flujo; }
    const cerrado = !!(reg && Object.keys(reg.firmas || {}).length), ro = cerrado || !J.puede('sst', 'R');
    let fecha = reg ? reg.fecha : J.hoy();
    m.append(J.titulo(esq.titulo, reg ? J.chipEstado(reg.estado) : el('span', { class: 'chip' }, 'Nuevo'), el('a', { class: 'btn sec', href: '#/sst/' + formato }, 'Volver')));
    m.append(el('p', { class: 'ayuda' }, esq.codigo + ' · Versión ' + esq.version + (reg ? ' · No. ' + reg.consecutivo : '') + ' · Periodicidad: ' + esq.periodicidad + ' · Todos los campos traen su explicación debajo.'));
    if (formato === 'permiso_alturas' && !ro) m.append(el('div', { class: 'card aviso-in' }, 'Permiso semanal: ábralo cada día que haya trabajo en alturas, diligencie la columna del día en la lista de chequeo y la fila del día en el registro de autorización, y guarde. Ciérrelo con su firma al final de la semana.'));
    if (!reg) m.append(el('div', { class: 'card fila-in' }, J.campo('Fecha del registro', J.inp('date', fecha, v => fecha = v))));
    const caja = el('div', { class: 'card form' });
    const f = window.FORM.render(caja, esq, reg ? reg.datos : {}, J.ctxFormulario({ fecha, soloLectura: ro, firmasImg: reg ? reg.imagenesFirma : {}, consecutivo: reg ? reg.consecutivo : '' }));
    m.append(caja);
    const guardar = async (silencioso) => {
      const datos = f.leer(); datos._trab = trabajadoresDe(esq, datos);
      const subio = await J.subirFirmasPendientes(datos, 'sst');
      const r = await J.api('registros.guardar', { registro: { id: reg && reg.id, tipo: 'sst', subtipo: formato, fecha, datos } }, { cola: !reg, desc: esq.titulo, texto: 'Guardando…' });
      if (r.encolado) { if (!subio) J.aviso('Las firmas dentro del formato se subirán cuando haya señal.', 'naranja'); J.ir('#/sst/' + formato); return null; }
      if (!silencioso) J.aviso(reg ? 'Guardado.' : 'Guardado. Ahora tome la evidencia fotográfica y cierre con su firma.', 'verde');
      return r.registro;
    };
    if (!ro) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => { try { const r = await guardar(); if (r && !reg) J.ir('#/sst/' + formato + '/' + r.id); } catch (e) { J.aviso(e.message, 'rojo'); } } }, reg ? 'Guardar cambios' : 'Guardar y continuar con la evidencia')));
    if (reg) {
      const ev = el('div', { class: 'card' }); m.append(ev);
      let fotos = await evidencias(ev, reg, esq, ro);
      m.append(J.panelFlujo(reg, flujo, () => J.ir('#/sst/' + formato + '/' + id), async () => {
        fotos = (await J.api('fotos.listar', { registroId: reg.id }, { silencio: true })).fotos;
        if (!fotos.length) { J.aviso('Falta la evidencia fotográfica (obligatoria). Tome al menos una foto antes de cerrar.', 'rojo'); return false; }
        if (!ro) { try { await guardar(true); } catch (e) { J.aviso(e.message, 'rojo'); return false; } }
        return null;
      }));
      const doc = async (formatoDoc) => {
        const r = await J.api('registros.obtener', { id: reg.id, conFirmas: true });
        const fs = (await J.api('fotos.listar', { registroId: reg.id }, { silencio: true })).fotos.slice(0, 24);
        const imgs = formatoDoc === 'pdf' && fs.length ? (await J.api('fotos.miniaturas', { ids: fs.map(x => x.archivoId) }, { texto: 'Preparando evidencias…' })).imagenes : {};
        const anexo = formatoDoc === 'pdf' ? window.INTERNOS.anexoFotos(fs, imgs).replace('REGISTRO FOTOGRÁFICO DEL DÍA', 'EVIDENCIA FOTOGRÁFICA') : (fs.length ? '<h3>EVIDENCIA FOTOGRÁFICA</h3><p>' + fs.map(x => esc(x.consecutivo + ' · ' + x.fecha.replace('T', ' ').slice(0, 16))).join('<br>') + '</p>' : '');
        const html = window.FORM.documento(esq, r.registro.datos, J.ctxFormulario({ consecutivo: reg.consecutivo, firmasImg: r.registro.imagenesFirma, flujoHtml: window.FORM.flujoHtml(flujo, r.registro, { firmasImg: r.registro.imagenesFirma }), anexoHtml: anexo }));
        await J.generarDoc('sst', reg, html, esq.titulo.slice(0, 50).replace(/[^\wÁÉÍÓÚÑáéíóúñ ]/g, '') + '_' + reg.consecutivo, formatoDoc, esq.titulo.slice(0, 60));
      };
      m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: () => doc('pdf') }, 'Descargar PDF'), el('button', { class: 'btn sec', onclick: () => doc('docx') }, 'Descargar Word'),
        J.st.yo.rol === 'Administrador' ? el('button', { class: 'btn sec rojo', onclick: () => J.anular(reg, '#/sst/' + formato) }, 'Anular') : ''));
    }
  };

  /* ---------------- DOCUMENTOS ---------------- */
  J.PANTALLAS.documentos = async (m) => {
    const r = await J.api('documentos.listar');
    m.append(J.titulo('Documentos generados'), el('p', { class: 'ayuda' }, 'Todo lo descargado desde la app queda guardado en el Drive de la obra. Cada usuario ve solo los documentos de los módulos a los que tiene acceso.'));
    m.append(J.tabla([{ t: 'Fecha', f: x => x.fecha.replace('T', ' ').slice(0, 16) }, { t: 'Módulo', k: 'modulo' }, { t: 'Documento', k: 'nombre' }, { t: 'Generó', k: 'usuario' }],
      r.documentos, { click: async x => { try { J.descargar(await J.api('documentos.descargar', { archivoId: x.archivoId }, { texto: 'Descargando…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }));
  };
})();
