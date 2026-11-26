/* Pantallas 3 (versión 1.1): periodos de uso de los formatos SST, facturas con cruce contra requisiciones y caja menor. */
(function () {
  'use strict';
  const J = window.JERL, { el, esc, fechaCO } = J;
  const masDias = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const leerArchivo = f => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = mal; r.readAsDataURL(f); });
  const nuevoId = () => 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const descargarPar = r => { J.descargar(r.xlsx); if (r.pdf) J.descargar(r.pdf); };
  const barraH = (p, color) => el('div', { class: 'barra-av' }, el('i', { style: 'width:' + Math.max(0, Math.min(100, p * 100)) + '%;background:' + (color || '#2E7D32') }));
  const kpi = (t, v, s, color) => { const d = el('div', { class: 'kpi' }, el('span', {}, t), el('b', {}, v), s ? el('small', {}, s) : ''); if (color) { d.style.borderLeftColor = color; d.querySelector('b').style.color = color; } return d; };

  /* ======================= SOPORTES (foto con marca de agua o PDF) ======================= */
  /** Sube un soporte: si es imagen, le pone la marca de agua; si es PDF, lo sube tal cual. */
  J.subirSoporte = async (archivo, modulo, registroId, comentario) => {
    if (!navigator.onLine) throw new Error('Para subir soportes se necesita señal.');
    if (/pdf$/i.test(archivo.type) || /\.pdf$/i.test(archivo.name)) {
      const dataUrl = await leerArchivo(archivo);
      return J.api('soporte.pdf', { modulo, registroId, nombre: archivo.name, archivo: dataUrl, comentario }, { texto: 'Subiendo el PDF…' });
    }
    J.cargando(true, 'Poniendo marca de agua…');
    try {
      const f = await J.marcaDeAgua(archivo, { tipo: modulo === 'caja' ? 'Soporte caja menor' : 'Soporte factura', frente: '', item: '', comentario: comentario || '', registroId });
      J.cargando(false);
      return J.api('foto.subir', { foto: f }, { texto: 'Subiendo el soporte…' });
    } finally { J.cargando(false); }
  };
  const selectorSoporte = (alElegir) => {
    const inp = el('input', { type: 'file', accept: 'image/*,application/pdf', style: 'display:none', onchange: e => { const a = e.target.files[0]; e.target.value = ''; if (a) alElegir(a); } });
    return el('label', { class: 'btn rojo' }, 'Tomar foto o subir PDF del soporte', inp);
  };
  const listaSoportes = (fotos) => el('div', { class: 'chips' }, fotos.length ? fotos.map(f => el('a', { class: 'chip', href: f.url, target: '_blank', rel: 'noopener' }, f.consecutivo + ' · ' + (/\.pdf$/i.test(f.nombre) ? 'PDF' : 'Foto'))) : el('span', { class: 'chip bad' }, 'Falta el soporte'));

  /* ======================= SST: PERIODOS DE USO DE LOS FORMATOS ======================= */
  const REGLAS = [{ v: 'asistencia', t: 'Diaria (asistencia)' }, { v: 'semanal', t: 'Semanal' }, { v: 'quincenal', t: '2 veces al mes' }, { v: 'mensual', t: 'Mensual' },
    { v: 'ingreso', t: 'Cada ingreso de personal' }, { v: 'alturas', t: 'Semanal con verificación diaria (solo con trabajo en alturas)' }];
  const usoEn = (s, a, b) => (s.periodos || []).some(p => (!p.desde || p.desde <= b) && (!p.hasta || p.hasta >= a));
  J.editorPeriodosSST = (c) => {
    const adm = J.st.yo.rol === 'Administrador', puede = adm || J.puede('sst', 'A'), hoy = J.hoy(), ayer = masDias(hoy, -1);
    const lista = JSON.parse(JSON.stringify(J.st.config.sstPeriodicidad || []));
    if (adm && window.SST_ORDEN && window.ESQ) window.SST_ORDEN.forEach(id => { if (!lista.some(x => x.id === id) && ESQ[id]) lista.push({ id, nombre: ESQ[id].titulo, regla: '', periodos: [], nuevo: true }); });
    c.append(el('p', { class: 'ayuda' }, 'Aquí se define en qué fechas se usa cada formato. La app solo exige el formato (y solo cuenta incumplimientos) dentro de sus periodos de uso. ' +
      'Un formato puede tener varios periodos: por ejemplo del 1 al 10 y luego desde el 25. Desde vacío = desde el inicio del control SST (Proyecto y parámetros). Hasta vacío = sigue en uso sin fecha de fin. ' +
      '"Suspender desde hoy" cierra el periodo con fecha de ayer, así hoy ya no se exige. "Usar desde hoy" abre un periodo nuevo que empieza hoy. Los cambios quedan en la auditoría.'),
      el('p', { class: 'ayuda' }, puede ? (adm ? 'Como administrador también puede cambiar la periodicidad o agregar al plan formatos que no tienen periodicidad.' : 'La periodicidad (semanal, mensual…) la cambia solo el administrador.') : 'Solo el responsable SST (permiso A en SST) o el administrador cambian los periodos. Usted solo puede consultarlos.'));
    const cont = el('div', {});
    const pintar = () => {
      cont.innerHTML = '';
      lista.forEach(x => {
        const enUso = x.regla && usoEn(x, hoy, hoy);
        const per = el('div', {});
        (x.periodos || []).forEach((p, i) => per.append(el('div', { class: 'fila-in' },
          J.campo('Desde', J.inp('date', p.desde, v => p.desde = v, { disabled: !puede }), i === 0 && !p.desde ? 'Vacío = desde el inicio del control SST.' : ''),
          J.campo('Hasta', J.inp('date', p.hasta, v => p.hasta = v, { disabled: !puede }), p.hasta ? '' : 'Vacío = sigue en uso.'),
          puede ? el('button', { class: 'btn-x', title: 'Quitar este periodo', onclick: () => { x.periodos.splice(i, 1); pintar(); } }, '×') : '')));
        if (!(x.periodos || []).length) per.append(el('p', { class: 'ayuda' }, 'Sin periodos: este formato no se exige.'));
        const acc = puede && x.regla ? el('div', { class: 'barra' },
          enUso ? el('button', { class: 'btn mini sec', onclick: () => {
            const p = x.periodos.find(q => (!q.desde || q.desde <= hoy) && (!q.hasta || q.hasta >= hoy));
            if (p.desde && p.desde > ayer) x.periodos.splice(x.periodos.indexOf(p), 1); else p.hasta = ayer; pintar(); } }, 'Suspender desde hoy')
            : el('button', { class: 'btn mini', onclick: () => {
              const sig = (x.periodos || []).filter(q => q.desde && q.desde > hoy).sort((a, b) => a.desde < b.desde ? -1 : 1)[0];
              x.periodos = x.periodos || []; x.periodos.push({ desde: hoy, hasta: sig ? masDias(sig.desde, -1) : '' }); x.periodos.sort((a, b) => (a.desde || '') < (b.desde || '') ? -1 : 1); pintar(); } }, 'Usar desde hoy'),
          el('button', { class: 'btn mini sec', onclick: () => { x.periodos = x.periodos || []; x.periodos.push({ desde: '', hasta: '' }); pintar(); } }, '+ Agregar periodo')) : '';
        cont.append(el('div', { class: 'card' },
          el('div', { class: 'titulo' }, el('h3', {}, x.nombre), el('span', { class: 'chip ' + (enUso ? 'ok' : 'bad') }, !x.regla ? 'Sin periodicidad (no se controla)' : enUso ? 'En uso hoy' : 'No se usa hoy')),
          adm ? J.campo('Periodicidad', J.sel([{ v: '', t: 'Sin periodicidad (no se controla)' }].concat(REGLAS), x.regla, v => { x.regla = v; if (v && x.nuevo && !(x.periodos || []).length) x.periodos = [{ desde: hoy, hasta: '' }]; pintar(); }),
            'Con qué frecuencia debe diligenciarse según el Plan de trabajo SST obras.') : el('p', { class: 'ayuda' }, 'Periodicidad: ' + ((REGLAS.find(r => r.v === x.regla) || {}).t || 'sin definir')),
          x.regla ? per : '', acc));
      });
    };
    pintar(); c.append(cont);
    if (puede) c.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => {
      const env = lista.filter(x => x.regla).map(x => ({ id: x.id, nombre: x.nombre, regla: x.regla, periodos: (x.periodos || []).filter(p => p.desde || p.hasta || x.periodos.length === 1) }));
      try { const r = await J.api('sst.periodicidad.guardar', { lista: env }, { texto: 'Guardando periodos…' }); J.st.config.sstPeriodicidad = r.sstPeriodicidad; J.aviso('Periodos de uso guardados', 'verde'); location.reload(); }
      catch (e) { J.aviso(e.message, 'rojo'); }
    } }, 'Guardar periodos de uso')));
  };

  /* ======================= FACTURAS Y CRUCE ======================= */
  J.PANTALLAS.facturas = async (m, id, pest) => {
    if (id && id !== 'ver') return verFactura(m, id);
    const c = await J.api('facturas.cruce', {}, { texto: 'Cruzando facturas y requisiciones…' });
    const facts = c.facturas.filter(f => String(f.anulado) !== 'true');
    m.append(J.titulo('Facturas y cruce con requisiciones', J.puede('facturas', 'R') ? el('a', { class: 'btn', href: '#/facturas/nueva' }, '+ Nueva factura') : '',
      el('button', { class: 'btn sec', onclick: async () => { try { descargarPar(await J.api('excel.facturas', { logo: J.logoDataUrl }, { texto: 'Armando el cruce en Excel y PDF…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Cruce (Excel y PDF)')));
    m.append(el('p', { class: 'ayuda' }, 'Cuando llega una factura se registra aquí, se cita cada material contra la línea de la requisición y se sube la foto o el PDF de la factura (obligatorio). ' +
      'La app cruza lo pedido (cantidad aprobada por la Ing. Residente), lo facturado (suma de todas las facturas) y lo recibido en obra (firma "Recibido en obra" de la requisición). Una factura puede cubrir varias requisiciones y una requisición puede llegar en varias facturas.'));
    const lineas = c.requisiciones.flatMap(r => r.lineas), conDif = lineas.filter(l => l.nivel === 'dif').length, sinFac = lineas.filter(l => !l.facturada).length;
    const sinSop = facts.filter(f => !c.soportes[f.id]).length, total = facts.reduce((s, f) => s + Number(f.datos.total || 0), 0);
    m.append(el('div', { class: 'kpis' }, kpi('Facturas registradas', facts.length, facts.filter(f => f.estado === 'Verificada').length + ' verificadas por la Ing. Residente'),
      kpi('Valor facturado', J.money(total), 'Incluye ítems no pedidos: ' + J.money(c.noPedido.reduce((s, x) => s + x.valor, 0))),
      kpi('Líneas con diferencia', conDif, 'Facturado de más o lo recibido no coincide con lo facturado', conDif ? '#D32F2F' : '#2E7D32'),
      kpi('Líneas sin factura', sinFac, 'Pedidas y aún sin factura', sinFac ? '#E8710A' : '#2E7D32'),
      kpi('Facturas sin soporte', sinSop, 'Falta la foto o el PDF', sinSop ? '#D32F2F' : '#2E7D32')));
    const P = [['facturas', 'Facturas'], ['cruce', 'Cruce por requisición'], ['nopedido', 'No pedido (' + c.noPedido.length + ')'], ['caja', 'Compras de caja menor (' + c.caja.length + ')']];
    const actual = pest || 'facturas';
    m.append(el('div', { class: 'pestanas' }, P.map(([k, t]) => el('a', { href: '#/facturas/ver/' + k, class: k === actual ? 'activo' : '' }, t))));
    const card = el('div', { class: 'card' }); m.append(card);
    if (actual === 'facturas') card.append(J.tabla([{ t: 'No.', k: 'consecutivo' }, { t: 'N° factura', f: x => x.datos.numero }, { t: 'Fecha', f: x => fechaCO(x.datos.fecha) }, { t: 'Proveedor', f: x => x.datos.proveedor },
      { t: 'Valor', f: x => J.money(x.datos.total), c: 'num' }, { t: 'Soporte', f: x => c.soportes[x.id] ? '✓ ' + c.soportes[x.id] : el('span', { class: 'chip bad' }, 'Falta') }, { t: 'Estado', f: x => J.chipEstado(x.estado) }],
      c.facturas.slice().reverse(), { click: x => J.ir('#/facturas/' + x.id), vacio: 'Aún no hay facturas registradas.' }));
    if (actual === 'cruce') {
      card.append(el('p', { class: 'ayuda' }, 'Estados: Completo = pedido, facturado y recibido coinciden · Sin factura = pedido y aún sin factura · Falta por facturar = se facturó menos de lo pedido · Facturado completo · falta firmar el recibido = la factura está completa pero en la requisición aún no se firma el recibido en obra · Facturado de más = se facturó más de lo pedido · Llegó menos / más de lo facturado = lo recibido en obra no coincide con la factura. Rojo = diferencia para revisar · naranja = pendiente · verde = completo.'));
      if (!c.requisiciones.length) card.append(el('p', {}, 'No hay requisiciones.'));
      c.requisiciones.slice().reverse().forEach(r => card.append(el('h3', {}, 'Requisición No. ' + r.consecutivo + ' · ' + fechaCO(r.fecha) + ' · ', J.chipEstado(r.estado)),
        J.tabla([{ t: 'Área', k: 'area' }, { t: 'Descripción', k: 'descripcion' }, { t: 'Und', k: 'und' }, { t: 'Pedida', f: x => J.num(x.pedida, 4), c: 'num' },
          { t: 'Recibida', f: x => x.recibida === null ? 'Pendiente' : J.num(x.recibida, 4), c: 'num' }, { t: 'Facturada', f: x => J.num(x.facturada, 4), c: 'num' }, { t: 'Valor facturado', f: x => J.money(x.valor), c: 'num' },
          { t: 'Facturas', f: x => x.facturas.join(', ') }, { t: 'Estado', f: x => el('span', { class: 'chip', style: 'color:#fff;background:' + (x.nivel === 'dif' ? '#D32F2F' : x.nivel === 'pendiente' ? '#E8710A' : '#2E7D32') }, x.estado) }], r.lineas)));
    }
    if (actual === 'nopedido') card.append(el('p', { class: 'ayuda' }, 'Líneas de factura que no corresponden a ninguna requisición (fletes, ajustes, materiales no pedidos). Revíselas con Compras.'),
      J.tabla([{ t: 'Factura', f: x => x.factura + (x.numero ? ' (' + x.numero + ')' : '') }, { t: 'Proveedor', k: 'proveedor' }, { t: 'Descripción', k: 'descripcion' }, { t: 'Und', k: 'und' }, { t: 'Cantidad', f: x => J.num(x.cantidad, 4), c: 'num' }, { t: 'Valor', f: x => J.money(x.valor), c: 'num' }], c.noPedido));
    if (actual === 'caja') card.append(el('p', { class: 'ayuda' }, 'Compras pagadas con caja menor (no pasan por requisición). Se registran en el módulo Caja menor.'),
      J.tabla([{ t: 'Caja', k: 'caja' }, { t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: '#', k: 'consecutivo' }, { t: 'N° factura', k: 'factura' }, { t: 'Proveedor', k: 'proveedor' }, { t: 'Descripción', k: 'descripcion' },
        { t: 'Categoría', k: 'categoria' }, { t: 'Valor', f: x => J.money(x.valor), c: 'num' }], c.caja));
  };

  async function verFactura(m, id) {
    let reg = null, flujo = null, fotos = [];
    const cz = await J.api('facturas.cruce', {});
    if (id !== 'nueva') { const r = await J.api('registros.obtener', { id, conFirmas: true }); reg = r.registro; flujo = r.flujo; fotos = (await J.api('fotos.listar', { registroId: id })).fotos; }
    const d = reg ? reg.datos : { proveedor: '', nit: '', numero: '', fecha: J.hoy(), observaciones: '', lineas: [] };
    const editable = (!reg || !Object.keys(reg.firmas || {}).length) && reg?.estado !== 'Anulado' && J.puede('facturas', 'R');
    m.append(J.titulo(reg ? 'Factura ' + reg.consecutivo : 'Nueva factura', reg ? J.chipEstado(reg.estado) : '', el('a', { class: 'btn sec', href: '#/facturas' }, 'Volver')));
    const caja = el('div', { class: 'card form' }), tot = el('b', {});
    const recalcular = () => { tot.textContent = 'Total factura: ' + J.money(d.lineas.reduce((s, l) => s + Math.round(Number(l.cantidad || 0) * Number(l.vu || 0)), 0)); };
    const pintar = () => {
      caja.innerHTML = '';
      caja.append(el('div', { class: 'fila-in' },
        J.campo('Proveedor', J.inp('text', d.proveedor, v => d.proveedor = v, { disabled: !editable }), 'Nombre o razón social como aparece en la factura.'),
        J.campo('NIT o cédula', J.inp('text', d.nit, v => d.nit = v, { disabled: !editable }), 'Opcional.'),
        J.campo('N° factura', J.inp('text', d.numero, v => d.numero = v, { disabled: !editable }), 'Tal como aparece en la factura (ej. POVA-45205).'),
        J.campo('Fecha de la factura', J.inp('date', d.fecha, v => d.fecha = v, { disabled: !editable }))));
      caja.append(el('h3', {}, 'Líneas de la factura'), el('p', { class: 'ayuda' }, 'Cantidad facturada = la que dice la factura. Valor unitario = precio por unidad antes de IVA o con IVA, según como lo maneje Compras (use siempre el mismo criterio). Las líneas citadas a una requisición se cruzan contra lo pedido y lo recibido; las que no, quedan como "No pedido".'));
      d.lineas.forEach((l, i) => caja.append(el('div', { class: 'fila' },
        el('div', { class: 'etq' }, l.reqId ? 'Req. ' + l.reqNo : 'No pedido'),
        J.campo('Descripción', J.inp('text', l.descripcion, v => l.descripcion = v, { disabled: !editable || !!l.reqId })), J.campo('Und', J.inp('text', l.und, v => l.und = v, { disabled: !editable || !!l.reqId })),
        J.campo('Cant. facturada', J.inp('number', l.cantidad, v => { l.cantidad = v; recalcular(); }, { disabled: !editable, step: 'any' }), l.reqId && l.pendiente !== undefined ? 'Pendiente por facturar al agregarla: ' + J.num(l.pendiente, 4) : ''),
        J.campo('Valor unitario', J.inp('number', l.vu, v => { l.vu = v; recalcular(); }, { disabled: !editable, step: 'any' })),
        el('div', { class: 'etq' }, J.money(Number(l.cantidad || 0) * Number(l.vu || 0))),
        editable ? el('button', { class: 'btn-x', onclick: () => { d.lineas.splice(i, 1); pintar(); } }, '×') : '')));
      if (editable) caja.append(el('div', { class: 'barra' }, el('button', { class: 'btn sec mini', onclick: agregarDeReq }, '+ Agregar líneas de una requisición'),
        el('button', { class: 'btn sec mini', onclick: () => { d.lineas.push({ descripcion: '', und: '', cantidad: '', vu: '' }); pintar(); } }, '+ Línea no pedida (flete, ajuste…)')));
      caja.append(el('p', {}, tot), J.campo('Observaciones', el('textarea', { rows: 2, disabled: !editable, oninput: e => d.observaciones = e.target.value }, d.observaciones || '')));
      recalcular();
    };
    async function agregarDeReq() {
      const reqs = cz.requisiciones.filter(r => r.aprobada);
      if (!reqs.length) return J.aviso('No hay requisiciones aprobadas para citar.', 'naranja');
      let sel = reqs[reqs.length - 1].id; const lista = el('div', {}), marc = {};
      const pintarL = () => { lista.innerHTML = ''; const r = reqs.find(x => x.id === sel);
        r.lineas.forEach(l => { const pend = Math.max(0, l.pedida - l.facturada); marc[l.idx] = marc[l.idx] ?? (pend > 0);
          lista.append(el('label', { class: 'chkl' }, el('input', { type: 'checkbox', checked: marc[l.idx], onchange: e => marc[l.idx] = e.target.checked }),
            ' ' + l.descripcion + ' · pedida ' + J.num(l.pedida, 4) + ' ' + (l.und || '') + ' · ya facturada ' + J.num(l.facturada, 4) + ' · pendiente ' + J.num(pend, 4))); }); };
      const s = J.sel(reqs.map(r => ({ v: r.id, t: 'No. ' + r.consecutivo + ' · ' + fechaCO(r.fecha) + ' · ' + r.estado })), sel, v => { sel = v; Object.keys(marc).forEach(k => delete marc[k]); pintarL(); });
      pintarL();
      const ok = await J.modal('Agregar líneas de una requisición', el('div', {}, J.campo('Requisición', s, 'Solo aparecen las aprobadas por la Ing. Residente.'), el('p', { class: 'ayuda' }, 'Marque los materiales que trae esta factura. La cantidad se propone con lo pendiente por facturar; ajústela a lo que dice la factura.'), lista),
        [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Agregar', v: true }]);
      if (!ok) return;
      const r = reqs.find(x => x.id === sel);
      r.lineas.filter(l => marc[l.idx]).forEach(l => { if (d.lineas.some(x => x.reqId === r.id && x.idx === l.idx)) return;
        const pend = Math.max(0, l.pedida - l.facturada); d.lineas.push({ reqId: r.id, reqNo: r.consecutivo, idx: l.idx, descripcion: l.descripcion, und: l.und, cantidad: pend, vu: '', pendiente: pend }); });
      pintar();
    }
    pintar(); m.append(caja);
    if (editable) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => {
      d.lineas = d.lineas.filter(l => l.descripcion); d.lineas.forEach(l => delete l.pendiente);
      try { const r = await J.api('registros.guardar', { registro: { id: reg && reg.id, tipo: 'factura', fecha: d.fecha || J.hoy(), datos: d } }, { texto: 'Guardando factura…' });
        J.aviso(reg ? 'Factura guardada.' : 'Factura guardada. Ahora suba el soporte y fírmela.', 'verde'); J.ir('#/facturas/' + r.registro.id); } catch (e) { J.aviso(e.message, 'rojo'); }
    } }, reg ? 'Guardar cambios' : 'Guardar y continuar con el soporte')));
    if (!reg) return;
    const sop = el('div', { class: 'card' }, el('h2', {}, 'Soporte de la factura (obligatorio) · ' + fotos.length), el('p', { class: 'ayuda' }, 'Tome una foto legible de la factura (sale con marca de agua: obra, fecha, hora y GPS) o suba el PDF de la factura electrónica. Sin soporte no se puede firmar.'), listaSoportes(fotos));
    if (reg.estado !== 'Anulado' && J.puede('facturas', 'R')) sop.append(el('div', { class: 'barra' }, selectorSoporte(async a => { try { await J.subirSoporte(a, 'facturas', reg.id, 'Factura ' + (d.numero || '') + ' · ' + reg.consecutivo); J.aviso('Soporte guardado', 'verde'); J.ir('#/facturas/' + id); } catch (e) { J.aviso(e.message, 'rojo'); } })));
    m.append(sop);
    m.append(J.panelFlujo(reg, flujo, () => J.ir('#/facturas/' + id), async p => { if (!fotos.length) { J.aviso('Falta el soporte de la factura (obligatorio).', 'rojo'); return false; } return null; }));
    if (J.st.yo.rol === 'Administrador' || (J.puede('facturas', 'A') && !Object.keys(reg.firmas || {}).length)) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn sec rojo', onclick: () => J.anular(reg, '#/facturas') }, 'Anular factura')));
  }

  /* ======================= CAJA MENOR ======================= */
  const totalesCaja = (c) => { const d = c.datos, g = d.gastos || [], gastado = g.reduce((s, x) => s + Number(x.valor || 0), 0), rep = Number((d.reposicion || {}).valor || 0), valor = Number(d.valor || 0);
    return { valor, rep, gastado, saldo: valor - rep - gastado, pct: valor ? (rep + gastado) / valor : 0 }; };
  const colorSaldo = t => t.saldo < 0 ? '#D32F2F' : t.valor && t.saldo / t.valor < 0.1 ? '#E8710A' : '#2E7D32';
  const agrupar = (g, k) => { const o = {}; g.forEach(x => { const c = x[k] || 'Sin dato'; o[c] = (o[c] || 0) + Number(x.valor || 0); }); return Object.entries(o).sort((a, b) => b[1] - a[1]); };
  const bloqueBarras = (titulo, filas, total) => el('div', { class: 'card' }, el('h3', {}, titulo), filas.length ? J.tabla([{ t: '', f: x => x[0] }, { t: 'Valor', f: x => J.money(x[1]), c: 'num' },
    { t: '%', f: x => el('div', { style: 'display:flex;gap:8px;align-items:center' }, barraH(total ? x[1] / total : 0, '#4A7C8C'), J.pct(total ? x[1] / total : 0)) }], filas) : el('p', { class: 'ayuda' }, 'Sin gastos.'));

  J.PANTALLAS.caja = async (m, id) => {
    if (id) return verCaja(m, id);
    const r = await J.api('caja.resumen', {}, { texto: 'Cargando caja menor…' });
    const vivas = r.cajas.filter(c => String(c.anulado) !== 'true');
    m.append(J.titulo('Caja menor', J.puede('caja', 'R') ? el('a', { class: 'btn', href: '#/caja/nueva' }, '+ Nueva caja menor') : '',
      J.puede('caja', 'A') ? el('button', { class: 'btn sec', onclick: () => categorias(r.categorias) }, 'Categorías de gasto') : ''));
    m.append(el('p', { class: 'ayuda' }, 'Relación de gastos de caja menor con el formato JERL (obra, responsable, fecha de ingreso, valor de la caja, gastos y saldo). Cada gasto exige su soporte (foto con marca de agua o PDF). Este resumen lo ven la Ing. Residente, Gerencia y el Administrador.'));
    if (!vivas.length) { m.append(el('div', { class: 'card' }, 'Aún no hay cajas menores registradas.')); return; }
    const act = vivas.find(c => c.estado === 'Borrador') || vivas[0], t = totalesCaja(act), g = act.datos.gastos || [];
    const sinSop = g.filter(x => !r.soportes[act.id + ':' + x.id]).length;
    m.append(el('h2', {}, act.consecutivo + ' · ' + (act.estado === 'Borrador' ? 'abierta' : act.estado.toLowerCase()) + ' · Responsable: ' + (act.datos.responsable || '')));
    m.append(el('div', { class: 'kpis' }, kpi('Valor caja', J.money(t.valor), 'Ingresó el ' + fechaCO(act.datos.fechaIngreso)),
      kpi('Reposición caja anterior', J.money(t.rep), act.datos.reposicion && act.datos.reposicion.numero ? 'Caja No. ' + act.datos.reposicion.numero : 'Sin reposición'),
      kpi('Gastado', J.money(t.gastado), g.length + ' gasto(s)'), kpi('Saldo', J.money(t.saldo), t.saldo < 0 ? 'Saldo negativo: se gastó más que la caja' : 'Disponible', colorSaldo(t)),
      kpi('Ejecutado', J.pct(t.pct), 'Reposición + gastos sobre el valor de la caja', t.pct > 1 ? '#D32F2F' : t.pct >= 0.9 ? '#E8710A' : ''),
      kpi('Gastos sin soporte', sinSop, sinSop ? 'No se puede cerrar la caja' : 'Todos con soporte', sinSop ? '#D32F2F' : '#2E7D32')));
    m.append(el('div', { class: 'card' }, el('div', { class: 'tiempo' }, el('span', {}, 'Ejecución de la caja: ' + J.pct(t.pct)), barraH(t.pct, colorSaldo(t)))));
    m.append(el('div', { class: 'grid2' }, bloqueBarras('Gasto por categoría', agrupar(g, 'categoria'), t.gastado), bloqueBarras('Gasto por proveedor', agrupar(g, 'proveedor').slice(0, 8), t.gastado)));
    m.append(bloqueBarras('Gasto por día', agrupar(g, 'fecha').sort((a, b) => a[0] < b[0] ? -1 : 1).map(x => [fechaCO(x[0]), x[1]]), t.gastado));
    m.append(el('div', { class: 'card' }, el('h3', {}, 'Todas las cajas menores'), J.tabla([{ t: 'Caja', k: 'consecutivo' }, { t: 'Responsable', f: x => x.datos.responsable }, { t: 'Fecha ingreso', f: x => fechaCO(x.datos.fechaIngreso) },
      { t: 'Valor', f: x => J.money(totalesCaja(x).valor), c: 'num' }, { t: 'Reposición', f: x => J.money(totalesCaja(x).rep), c: 'num' }, { t: 'Gastado', f: x => J.money(totalesCaja(x).gastado), c: 'num' },
      { t: 'Saldo', f: x => { const tt = totalesCaja(x); return el('b', { style: 'color:' + colorSaldo(tt) }, J.money(tt.saldo)); }, c: 'num' }, { t: 'Estado', f: x => J.chipEstado(x.estado === 'Borrador' ? 'Abierta' : x.estado) }],
      r.cajas, { click: x => J.ir('#/caja/' + x.id) })));
  };
  async function categorias(actual) {
    const t = el('textarea', { rows: 9 }, (actual || []).join('\n'));
    const ok = await J.modal('Categorías de gasto de caja menor', el('div', { class: 'campo' }, el('label', {}, 'Una categoría por renglón'), t, el('div', { class: 'ayuda' }, 'Sirven para el resumen "Gasto por categoría". Cambiarlas no modifica los gastos ya registrados.')),
      [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Guardar', v: true }]);
    if (!ok) return;
    try { await J.api('caja.categorias', { categorias: t.value.split('\n') }); J.aviso('Categorías guardadas', 'verde'); J.ir('#/caja'); } catch (e) { J.aviso(e.message, 'rojo'); }
  }

  async function verCaja(m, id) {
    const res = await J.api('caja.resumen', {});
    let reg = null, flujo = null, fotos = [];
    if (id !== 'nueva') { const r = await J.api('registros.obtener', { id, conFirmas: true }); reg = r.registro; flujo = r.flujo; fotos = (await J.api('fotos.listar', { prefijo: id + ':' })).fotos; }
    const sig = res.cajas.reduce((a, c) => Math.max(a, Number(c.datos.numero || 0)), 0) + 1, ant = res.cajas.filter(c => String(c.anulado) !== 'true')[0];
    const d = reg ? reg.datos : { numero: sig, responsable: J.st.yo.nombre, cargo: J.st.yo.cargo || '', fechaIngreso: J.hoy(), valor: '', reposicion: { numero: ant ? ant.datos.numero : '', valor: '', descripcion: '' }, gastos: [], observaciones: '' };
    d.reposicion = d.reposicion || {}; d.gastos = d.gastos || [];
    const abierta = !reg || !Object.keys(reg.firmas || {}).length, editable = abierta && reg?.estado !== 'Anulado' && J.puede('caja', 'R');
    m.append(J.titulo(reg ? reg.consecutivo : 'Nueva caja menor', reg ? J.chipEstado(reg.estado === 'Borrador' ? 'Abierta' : reg.estado) : '', el('a', { class: 'btn sec', href: '#/caja' }, 'Volver')));
    const cab = el('div', { class: 'card form' }, el('h2', {}, 'Datos de la caja'),
      el('div', { class: 'fila-in' },
        J.campo('Caja menor N°', J.inp('number', d.numero, v => d.numero = v, { disabled: !!reg || !editable }), 'Número consecutivo de la caja. Se propone el siguiente; no se puede cambiar después de crearla.'),
        J.campo('Obra', J.inp('text', J.st.config.proyecto.nombre, () => { }, { disabled: true })),
        J.campo('Responsable', J.inp('text', d.responsable, v => d.responsable = v, { disabled: !editable }), 'Quien maneja el dinero y firma la relación.'),
        J.campo('Cargo del responsable', J.inp('text', d.cargo, v => d.cargo = v, { disabled: !editable }), 'Sale debajo de la firma (ej. Arquitecto, Ingeniera residente).'),
        J.campo('Fecha de ingreso', J.inp('date', d.fechaIngreso, v => d.fechaIngreso = v, { disabled: !editable }), 'Fecha en que se entregó el dinero de la caja.'),
        J.campo('Valor de la caja ($)', J.inp('number', d.valor, v => { d.valor = v; resumen(); }, { disabled: !editable, step: 'any' }), 'Valor total entregado (VALOR CAJA).')),
      el('h3', {}, 'Reposición de la caja anterior'), el('p', { class: 'ayuda' }, 'Si al responsable se le debía plata de la caja anterior (gastó más de lo que tenía), escriba ese valor aquí. Sale como primera fila, sin consecutivo, y se descuenta del saldo. Si no aplica, déjelo en blanco.'),
      el('div', { class: 'fila-in' },
        J.campo('Caja anterior N°', J.inp('number', d.reposicion.numero, v => d.reposicion.numero = v, { disabled: !editable })),
        J.campo('Valor de la reposición ($)', J.inp('number', d.reposicion.valor, v => { d.reposicion.valor = v; resumen(); }, { disabled: !editable, step: 'any' })),
        J.campo('Descripción', J.inp('text', d.reposicion.descripcion, v => d.reposicion.descripcion = v, { disabled: !editable, placeholder: 'REPOSICIÓN CAJA MENOR No.' + (d.reposicion.numero || '') }), 'Vacío = "REPOSICIÓN CAJA MENOR No." + número.')));
    m.append(cab);
    const resBox = el('div', { class: 'kpis' });
    const resumen = () => { const t = totalesCaja({ datos: d }); resBox.innerHTML = ''; resBox.append(kpi('Valor caja', J.money(t.valor)), kpi('Reposición', J.money(t.rep)), kpi('Gastos', J.money(t.gastado), (d.gastos || []).length + ' gasto(s)'), kpi('Saldo', J.money(t.saldo), t.saldo < 0 ? 'Negativo' : '', colorSaldo(t))); };
    resumen(); m.append(resBox);
    const guardar = async (msg) => {
      const r = await J.api('registros.guardar', { registro: { id: reg && reg.id, tipo: 'caja', fecha: d.fechaIngreso || J.hoy(), datos: d } }, { texto: 'Guardando caja menor…' });
      if (msg) J.aviso(msg, 'verde'); return r.registro;
    };
    if (editable) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: async () => { try { const r = await guardar(reg ? 'Guardado.' : 'Caja creada. Ahora registre los gastos.'); J.ir('#/caja/' + r.id); } catch (e) { J.aviso(e.message, 'rojo'); } } }, reg ? 'Guardar datos de la caja' : 'Crear caja y continuar con los gastos')));
    if (!reg) return;
    const sopDe = g => fotos.filter(f => f.registroId === reg.id + ':' + g.id);
    const gastoModal = async (g) => {
      const nuevo = !g; g = g ? Object.assign({}, g) : { id: nuevoId(), fecha: J.hoy(), factura: '', proveedor: '', descripcion: '', categoria: '', valor: '' };
      let archivo = null; const nom = el('span', { class: 'ayuda' }, sopDe(g).length ? 'Ya tiene ' + sopDe(g).length + ' soporte(s). Puede agregar otro.' : 'Aún sin soporte.');
      const cont = el('div', { class: 'form' },
        J.campo('Fecha', J.inp('date', g.fecha, v => g.fecha = v)), J.campo('N° factura', J.inp('text', g.factura, v => g.factura = v), 'Como aparece en el soporte. Vacío si no hay factura (ej. pago de internet).'),
        J.campo('Proveedor', J.inp('text', g.proveedor, v => g.proveedor = v)), J.campo('Descripción', J.inp('text', g.descripcion, v => g.descripcion = v), 'Qué se compró o pagó.'),
        J.campo('Categoría', J.sel([''].concat(res.categorias), g.categoria, v => g.categoria = v), 'Para el resumen por categoría.'),
        J.campo('Valor compra ($)', J.inp('number', g.valor, v => g.valor = v, { step: 'any' })),
        J.campo('Soporte (obligatorio)', el('div', {}, selectorSoporte(a => { archivo = a; nom.textContent = 'Listo para subir: ' + a.name; }), nom), 'Foto de la factura o recibo (sale con marca de agua) o PDF de la factura electrónica.'));
      const ok = await J.modal(nuevo ? 'Nuevo gasto' : 'Gasto #' + g.consecutivo, cont, [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Guardar gasto', v: () => {
        if (!g.fecha || !g.descripcion || !(Number(g.valor) > 0)) { J.aviso('Fecha, descripción y valor son obligatorios.', 'naranja'); return false; }
        if (!g.categoria) { J.aviso('Elija la categoría.', 'naranja'); return false; }
        if (!archivo && !sopDe(g).length) { J.aviso('Falta el soporte (foto o PDF).', 'naranja'); return false; }
        return true; } }]);
      if (!ok) return;
      if (nuevo) d.gastos.push(g); else Object.assign(d.gastos.find(x => x.id === g.id), g);
      try {
        await guardar();
        if (archivo) await J.subirSoporte(archivo, 'caja', reg.id + ':' + g.id, reg.consecutivo + ' · ' + (g.factura || g.descripcion));
        J.aviso('Gasto guardado', 'verde');
      } catch (e) { J.aviso(e.message + (archivo ? ' · Si el gasto quedó sin soporte, ábralo y vuelva a subirlo.' : ''), 'rojo'); }
      J.ir('#/caja/' + id);
    };
    const tg = el('div', { class: 'card' }, el('h2', {}, 'Gastos'), el('p', { class: 'ayuda' }, editable ? 'Toque un gasto para corregirlo. El consecutivo lo pone la app en orden de registro.' : 'La caja está cerrada: para corregir, el administrador da un permiso temporal.'));
    const filas = (d.reposicion.valor ? [{ rep: true, fecha: d.fechaIngreso, consecutivo: '', factura: '', proveedor: d.responsable, descripcion: d.reposicion.descripcion || 'REPOSICIÓN CAJA MENOR No.' + (d.reposicion.numero || ''), categoria: '', valor: d.reposicion.valor }] : []).concat(d.gastos);
    tg.append(J.tabla([{ t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: 'Consecutivo', k: 'consecutivo' }, { t: 'N° factura', k: 'factura' }, { t: 'Proveedor', k: 'proveedor' }, { t: 'Descripción', k: 'descripcion' }, { t: 'Categoría', k: 'categoria' },
      { t: 'Valor compra', f: x => J.money(x.valor), c: 'num' }, { t: 'Soporte', f: x => x.rep ? '—' : el('div', { onclick: e => e.stopPropagation() }, listaSoportes(sopDe(x))) },
      { t: '', f: x => editable && !x.rep ? el('button', { class: 'btn-x', title: 'Quitar gasto', onclick: async e => { e.stopPropagation(); if (!(await J.confirmar('¿Quitar el gasto "' + x.descripcion + '"? Los consecutivos se renumeran.'))) return; d.gastos = d.gastos.filter(y => y.id !== x.id); try { await guardar('Gasto quitado'); } catch (er) { J.aviso(er.message, 'rojo'); } J.ir('#/caja/' + id); } }, '×') : '' }],
      filas, { click: editable ? x => { if (!x.rep) gastoModal(x); } : null, vacio: 'Sin gastos registrados.' }));
    if (editable) tg.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: () => gastoModal(null) }, '+ Agregar gasto')));
    m.append(tg);
    m.append(el('div', { class: 'barra' }, el('button', { class: 'btn sec', onclick: async () => { try { descargarPar(await J.api('excel.caja', { id, logo: J.logoDataUrl }, { texto: 'Llenando la relación de caja menor…' })); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Descargar relación (Excel y PDF)'),
      J.st.yo.rol === 'Administrador' ? el('button', { class: 'btn sec rojo', onclick: () => J.anular(reg, '#/caja') }, 'Anular caja') : ''));
    m.append(el('p', { class: 'ayuda' }, 'Al terminar la caja (para legalizarla o pedir el reembolso), el responsable la cierra con su firma; desde ese momento no se pueden agregar gastos. La Ing. Residente puede firmar la revisión (opcional).'));
    m.append(J.panelFlujo(reg, flujo, () => J.ir('#/caja/' + id), async p => {
      if (p.clave === 'cierre') { const sin = d.gastos.filter(g => !sopDe(g).length); if (sin.length) { J.aviso('Faltan soportes en los gastos: ' + sin.map(g => '#' + g.consecutivo).join(', '), 'rojo'); return false; }
        if (!(await J.confirmar('Al cerrar la caja ya no se pueden agregar ni cambiar gastos. ¿Cerrar la ' + reg.consecutivo + '?'))) return false; }
      return null;
    }));
  }
})();
