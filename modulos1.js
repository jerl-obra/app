/* Pantallas 1: ingreso, menú, inicio, bitácora, fotos y personal. */
(function () {
  'use strict';
  const J = window.JERL, { el, esc, fechaCO } = J, $ = J.$;
  const MENU = [['inicio', 'Inicio'], ['bitacora', 'Bitácora diaria'], ['fotos', 'Fotos'], ['personal', 'Personal y asistencia'], ['cantidades', 'Cantidades'], ['avance', 'Cronograma y avance'],
    ['actas', 'Actas de obra'], ['adicionales', 'Adicionales y no previstos'], ['requisiciones', 'Requisiciones'], ['inventario', 'Inventario y traslados'], ['facturas', 'Facturas'], ['caja', 'Caja menor'], ['sst', 'SST'], ['documentos', 'Documentos'], ['admin', 'Administrador']];
  J.PANTALLAS = {};
  const main = () => $('#main');

  /* ---------------- INGRESO ---------------- */
  J.pantallaIngreso = () => {
    $('#app').className = 'sin-sesion';
    const u = el('input', { autocomplete: 'username', placeholder: 'Usuario' }), c = el('input', { type: 'password', autocomplete: 'current-password', placeholder: 'Clave' });
    const entrar = async () => {
      try {
        const r = await J.api('login', { usuario: u.value, clave: c.value }, { texto: 'Ingresando…' });
        J.token = r.token; sessionStorage.setItem('jerl_token', r.token);
        if (r.cambiarClave) await cambiarClave(true);
        await arrancar();
      } catch (e) { J.aviso(e.message, 'rojo'); }
    };
    c.addEventListener('keydown', e => { if (e.key === 'Enter') entrar(); });
    main().innerHTML = '';
    main().append(el('div', { class: 'ingreso' }, el('img', { src: 'logo.png', alt: 'JERL Ingeniero Civil' }), el('h1', {}, 'Gestión de Obra'),
      J.campo('Usuario', u, 'El que le entregó el administrador.'), J.campo('Clave', c, 'Mínimo 6 caracteres. La app no guarda su clave en el celular.'),
      el('button', { class: 'btn', onclick: entrar }, 'Ingresar'), el('p', { class: 'ayuda' }, 'Si olvidó su clave, pida al administrador que la restablezca.')));
  };
  async function cambiarClave(obligatorio) {
    const a = el('input', { type: 'password' }), n = el('input', { type: 'password' }), n2 = el('input', { type: 'password' });
    await J.modal(obligatorio ? 'Cree su clave personal' : 'Cambiar clave', el('div', {}, obligatorio ? el('p', { class: 'ayuda' }, 'Es su primer ingreso: cambie la clave temporal por una personal.') : '',
      J.campo('Clave actual (temporal)', a), J.campo('Clave nueva', n, 'Mínimo 6 caracteres.'), J.campo('Repita la clave nueva', n2)),
      [{ t: 'Guardar', v: async () => { if (n.value !== n2.value) { J.aviso('Las claves nuevas no coinciden', 'rojo'); return false; }
        try { await J.api('cambiarClave', { actual: a.value, nueva: n.value }); J.aviso('Clave actualizada', 'verde'); return true; } catch (e) { J.aviso(e.message, 'rojo'); return false; } } }]);
  }
  J.cambiarClave = cambiarClave;

  /* ---------------- ARRANQUE Y MENÚ ---------------- */
  async function arrancar() {
    await J.cargarInicio();
    $('#app').className = '';
    $('#proyecto').textContent = J.st.config.proyecto.nombre;
    $('#usuario').textContent = J.st.yo.nombre + ' · ' + J.st.yo.rol;
    const nav = $('#nav'); nav.innerHTML = '';
    MENU.forEach(([k, t]) => { if (J.puede(k, 'V')) nav.append(el('a', { href: '#/' + k, 'data-m': k, onclick: () => document.body.classList.remove('menu-abierto') }, t)); });
    nav.append(el('a', { href: '#', onclick: e => { e.preventDefault(); cambiarClave(false); } }, 'Cambiar mi clave'), el('a', { href: '#', onclick: e => { e.preventDefault(); J.salir(); } }, 'Salir'));
    J.estadoRed(); J.contarCola(); J.enviarCola();
    if (!location.hash || location.hash === '#') location.hash = '#/inicio'; else ruta();
  }
  J._arrancar = arrancar;
  async function ruta() {
    if (!J.st) return;
    const [, m, a, b] = (location.hash.replace(/^#\/?/, '#/').split('/'));
    const mod = m || 'inicio';
    document.querySelectorAll('#nav a').forEach(x => x.classList.toggle('activo', x.dataset.m === mod));
    if (!J.puede(mod, 'V') || !J.PANTALLAS[mod]) { main().innerHTML = ''; main().append(el('div', { class: 'card' }, 'No tiene permiso para ver este módulo.')); return; }
    main().innerHTML = ''; window.scrollTo(0, 0);
    try { await J.PANTALLAS[mod](main(), a ? decodeURIComponent(a) : '', b ? decodeURIComponent(b) : ''); }
    catch (e) { console.error(e); main().append(el('div', { class: 'card error' }, 'Error: ' + e.message)); }
  }
  addEventListener('hashchange', ruta);
  J.ir = h => { if (location.hash === h) ruta(); else location.hash = h; };
  J.titulo = (t, ...acciones) => el('div', { class: 'titulo' }, el('h1', {}, t), el('div', { class: 'acciones' }, acciones));

  /* ---------------- FLUJO DE FIRMAS (común) ---------------- */
  J.panelFlujo = (reg, flujo, alFirmar, datosAntes) => {
    const fi = reg.firmas || {}, caja = el('div', { class: 'card flujo' }, el('h2', {}, 'Firmas y aprobaciones'));
    let siguiente = null;
    flujo.forEach((p, i) => {
      const f = fi[p.clave], previasOk = flujo.slice(0, i).every(x => x.opcional || fi[x.clave]);
      if (!f && previasOk && !siguiente && reg.estado !== 'Anulado' && reg.estado !== 'Rechazado') siguiente = p;
      caja.append(el('div', { class: 'paso' + (f ? ' hecho' : '') }, el('b', {}, (f ? '✓ ' : '○ ') + p.nombre + (p.opcional ? ' (opcional)' : '')),
        el('span', {}, f ? f.nombre + ' · ' + (f.cargo || '') + ' · ' + f.fecha.replace('T', ' ').slice(0, 16) : 'Pendiente'),
        !f && previasOk && reg.estado !== 'Anulado' && reg.estado !== 'Rechazado' ? el('button', { class: 'btn mini', onclick: async () => {
          if (!navigator.onLine) return J.aviso('Para firmar se necesita señal.', 'naranja');
          const extra = datosAntes ? await datosAntes(p) : null; if (extra === false) return;
          const img = await J.pedirFirma(p.nombre); if (!img) return;
          try { const r = await J.api('registros.firmar', { id: reg.id, paso: p.clave, firma: img, datos: extra || undefined }, { texto: 'Firmando…' }); J.aviso('Firmado: ' + p.nombre, 'verde'); alFirmar(r.registro); }
          catch (e) { J.aviso(e.message, 'rojo'); }
        } }, 'Firmar') : ''));
    });
    if (Object.keys(fi).length) caja.append(el('p', { class: 'ayuda' }, 'Después de la primera firma el registro queda bloqueado. Para corregirlo, el administrador debe dar un permiso temporal.'));
    return caja;
  };

  /* ---------------- INICIO: RESUMEN EJECUTIVO (igual para todos) + alertas de cada perfil ---------------- */
  const semaforo = (ej, pg) => { const d = ej - pg; return d >= -0.02 ? ['#2E7D32', 'Al día o adelantado'] : d >= -0.1 ? ['#C9A100', 'Atraso leve'] : d >= -0.2 ? ['#E8710A', 'Atraso'] : ['#D32F2F', 'Atraso crítico']; };
  const colPct = p => p >= 0.9 ? '#2E7D32' : p >= 0.8 ? '#C9A100' : '#D32F2F';
  const CLIMA_TXT = { S: 'Seco', L: 'Lluvia', N: 'Nublado', H: 'Suelo húmedo', XL: 'Lluvia fuerte' };
  const barra = (ej, pg) => el('div', { class: 'barra-av', title: 'Ejecutado ' + J.pct(ej) + ' · Programado ' + J.pct(pg) }, el('i', { style: 'width:' + Math.min(100, ej * 100) + '%' }), el('b', { style: 'left:' + Math.min(100, pg * 100) + '%' }));
  J.PANTALLAS.inicio = async (m) => {
    await J.cargarInicio();
    if (!J.st.ejecutivo || J.st.ejecutivo.error) { m.append(el('div', { class: 'card error' }, 'No se pudo calcular el resumen: ' + ((J.st.ejecutivo || {}).error || 'sin datos'))); return; }
    const e = J.st.ejecutivo, a = e.avance, pe = e.personal, bi = e.bitacora, ec = e.economico, sm = semaforo(a.ejecutado, a.programado);
    const colores = { 'amarillo': '#C9A100', 'naranja': '#E8710A', 'rojo': '#D32F2F', 'rojo oscuro': '#7F0000' };
    m.append(J.titulo('Resumen ejecutivo · ' + fechaCO(e.hoy), el('button', { class: 'btn sec', onclick: () => pdfResumen(e) }, 'Descargar resumen (PDF)')));
    m.append(el('div', { class: 'card ejecutivo' }, el('h2', {}, e.proyecto.nombre), el('p', { class: 'ayuda' }, e.proyecto.contratista + ' · ' + e.proyecto.ciudad + ' · Plazo propuesto: ' + fechaCO(e.proyecto.inicioProp) + ' a ' + fechaCO(e.proyecto.finProp) +
      ' · Día ' + e.proyecto.diasTranscurridos + ' de ' + e.proyecto.diasTotales + ' (faltan ' + e.proyecto.diasRestantes + ' días)'),
      el('div', { class: 'tiempo' }, el('span', {}, 'Tiempo transcurrido ' + J.pct(a.tiempo)), el('div', { class: 'barra-av' }, el('i', { style: 'width:' + a.tiempo * 100 + '%;background:#4A4F55' })))));
    const k = (t, v, s, color) => { const d = el('div', { class: 'kpi' }, el('span', {}, t), el('b', {}, v), s ? el('small', {}, s) : ''); if (color) { d.style.borderLeftColor = color; d.querySelector('b').style.color = color; } return d; };
    m.append(el('div', { class: 'kpis' },
      k('Avance ejecutado', J.pct(a.ejecutado), 'Programado a hoy: ' + J.pct(a.programado) + ' · ' + sm[1], sm[0]),
      k('Obra ejecutada', J.money(a.valorEjecutado), 'Falta: ' + J.money(a.valorFaltante) + ' de ' + J.money(a.costoDirecto) + ' (costo directo)'),
      k('Personal en obra hoy', String(pe.hoy.asiste), pe.hoy.registrada ? 'NA ' + pe.hoy.noAsiste + ' · P ' + pe.hoy.permiso + ' · I ' + pe.hoy.incapacidad + ' · B ' + pe.hoy.baja : 'Asistencia de hoy sin registrar', pe.hoy.registrada ? '#1E2124' : '#E8710A'),
      k('Personal esta semana', String(pe.semana.personas), pe.semana.horasHombre + ' horas-hombre · promedio ' + pe.semana.promedioDia + ' personas/día (desde ' + fechaCO(e.semanaDesde) + ')'),
      k('Actividades', a.terminados + ' / ' + e.items.length + ' terminadas', a.enEjecucion + ' en ejecución · ' + a.sinIniciar + ' sin iniciar · ' + a.atrasados + ' atrasadas', a.atrasados ? '#D32F2F' : '#2E7D32'),
      k('Cumplimiento plan SST (mes)', J.pct(e.sst.pct), e.sst.incumplidos ? e.sst.incumplidos + ' incumplimiento(s) · ' + e.sst.pendientes + ' pendientes' : 'Sin incumplimientos · ' + e.sst.pendientes + ' pendientes', colPct(e.sst.pct)),
      k('Bitácora de hoy', bi.hoy, bi.climaHoy ? 'Clima: ' + ['manana', 'tarde', 'noche'].map(x => CLIMA_TXT[bi.climaHoy[x]] || '—').join(' / ') + (bi.alturasHoy ? ' · Hay trabajo en alturas' : '') : 'Clima sin registrar', bi.hoy === 'Aprobada' || bi.hoy === 'Con Vo.Bo.' ? '#2E7D32' : bi.hoy === 'Cerrada' ? '#C9A100' : '#E8710A'),
      k('Facturado en actas', J.pct(ec.pctFacturado), ec.actasAprobadas + ' acta(s) aprobada(s) · ' + J.money(ec.facturadoTotal) + ' con AIU e IVA')));
    // avance por actividad
    const at = d => { if (d.justificado) return el('span', { class: 'chip', style: 'background:#5B6BB5;color:#fff' }, 'Justificado'); if (!d.atraso) return el('span', { class: 'chip ok' }, 'Al día');
      const c = d.atraso <= 2 ? '#C9A100' : d.atraso <= 5 ? '#E8710A' : d.atraso <= 10 ? '#D32F2F' : '#7F0000'; return el('span', { class: 'chip', style: 'background:' + c + ';color:#fff' }, d.atraso + ' d'); };
    m.append(el('div', { class: 'card' }, el('h2', {}, 'Avance por actividad'), el('p', { class: 'ayuda' }, 'Barra = ejecutado; raya negra = lo programado a hoy. Faltante = lo que queda por ejecutar de lo contratado.'),
      J.tabla([{ t: 'Ítem', k: 'item' }, { t: 'Actividad', k: 'descripcion' }, { t: 'Estado', f: x => J.chipEstado(x.estado) }, { t: 'Avance', f: x => el('div', { class: 'av' }, barra(x.pctEj, x.pctProg), el('small', {}, J.pct(x.pctEj) + ' de ' + J.pct(x.pctProg))) },
        { t: 'Faltante', f: x => J.num(x.faltante, 2) + ' ' + x.und, c: 'num' }, { t: 'Fin propuesto', f: x => fechaCO(x.finProp) }, { t: 'Atraso', f: at }], e.items)));
    // personal, clima, económico
    const fila = (t, v) => el('tr', {}, el('td', {}, t), el('td', { class: 'num' }, el('b', {}, String(v))));
    const tabla = filas => el('table', { class: 'tdatos' }, filas);
    const cargos = Object.keys(pe.hoy.porCargo);
    const adE = ec.adicionales || {};
    m.append(el('div', { class: 'grid2' },
      el('div', { class: 'card' }, el('h2', {}, 'Personal'), tabla([fila('Trabajadores activos en la obra', pe.activos), fila('Presentes hoy', pe.hoy.asiste), fila('No asisten / permiso / incapacidad / baja hoy', pe.hoy.noAsiste + ' / ' + pe.hoy.permiso + ' / ' + pe.hoy.incapacidad + ' / ' + pe.hoy.baja),
        fila('Personas distintas esta semana', pe.semana.personas), fila('Horas-hombre esta semana', pe.semana.horasHombre), fila('Promedio de personas por día', pe.semana.promedioDia),
        fila('Seguridad social vencida', pe.ssVencida), fila('Curso de alturas vencido', pe.alturasVencido)]),
        cargos.length ? el('div', { class: 'chips' }, cargos.map(c => el('span', { class: 'chip' }, c + ': ' + pe.hoy.porCargo[c]))) : ''),
      el('div', { class: 'card' }, el('h2', {}, 'Clima y bitácora (semana)'), tabla([fila('Eventos de lluvia', bi.lluviaSemana.eventos), fila('Días con lluvia', bi.lluviaSemana.dias), fila('Horas perdidas por lluvia', bi.lluviaSemana.horasPerdidas),
        fila('Precipitación en obra (mm)', bi.lluviaSemana.precipObra), fila('Bitácoras sin cerrar esta semana', bi.sinCerrarSemana.length ? bi.sinCerrarSemana.map(fechaCO).join(', ') : 'Ninguna'), fila('Fotos tomadas esta semana', e.fotosSemana)])),
      el('div', { class: 'card' }, el('h2', {}, 'Económico'), tabla([fila('Costo directo contratado', J.money(a.costoDirecto)), fila('Actas elaboradas / aprobadas', ec.actas + ' / ' + ec.actasAprobadas), fila('Última acta', ec.ultimaActa || '—'),
        fila('Facturado (costo directo)', J.money(ec.facturadoCD) + ' · ' + J.pct(ec.pctFacturado)), fila('Facturado con AIU e IVA', J.money(ec.facturadoTotal)),
        ...['Detectado', 'Sustentado', 'Pactado', 'Aprobado', 'Cobrado', 'Rechazado'].filter(x => adE[x]).map(x => fila('Adicionales ' + x.toLowerCase(), adE[x].n + ' · ' + J.money(adE[x].valor)))])),
      el('div', { class: 'card' }, el('h2', {}, 'Compras y SST'), tabla([fila('Requisiciones por aprobar', e.compras.porAprobar), fila('Requisiciones en compra', e.compras.enCompra), fila('Requisiciones recibidas en obra', e.compras.recibidas),
        fila('Plan SST: periodos cumplidos', e.sst.cumplidos + ' de ' + e.sst.esperados), fila('Plan SST: incumplimientos', e.sst.incumplidos), fila('Plan SST: pendientes en curso', e.sst.pendientes)]),
        e.sst.peores.length ? el('p', { class: 'mal' }, 'Incumplidos: ' + e.sst.peores.join(' · ')) : '')));
    m.append(el('div', { class: 'card' }, el('h2', {}, 'Próximos hitos'), J.tabla([{ t: 'Fecha', f: x => fechaCO(x.finProp) }, { t: 'Ítem', k: 'item' }, { t: 'Actividad', k: 'descripcion' }, { t: 'Avance', f: x => J.pct(x.pctEj) }], e.proximosHitos, { vacio: 'No hay hitos pendientes.' })));
    // lo de cada perfil
    const al = J.st.alertas;
    const ca = el('div', { class: 'card' }, el('h2', {}, 'Mis alertas y pendientes (' + al.length + ')'), el('p', { class: 'ayuda' }, 'Lo que le corresponde a usted según su perfil. Toque una alerta para ir al módulo.'));
    if (!al.length) ca.append(el('p', {}, 'Sin alertas. Todo al día.'));
    al.forEach(x => ca.append(el('a', { class: 'alerta', href: '#/' + (x.modulo === 'inicio' ? 'inicio' : x.modulo), style: 'border-left-color:' + (colores[x.nivel] || '#888') }, el('b', { style: 'color:' + (colores[x.nivel] || '#888') }, x.nivel.toUpperCase()), ' ', x.mensaje)));
    m.append(ca);
    const accesos = [['bitacora', 'Bitácora de hoy', '#/bitacora/' + J.hoy(), 'R'], ['fotos', 'Tomar foto', '#/fotos/nueva', 'R'], ['personal', 'Asistencia de hoy', '#/personal', 'R'], ['cantidades', 'Registrar medición', '#/cantidades', 'R'],
      ['requisiciones', 'Nueva requisición', '#/requisiciones/nueva', 'R'], ['sst', 'Formatos SST', '#/sst', 'R'], ['avance', 'Cronograma y avance', '#/avance', 'V'], ['facturas', 'Facturas', '#/facturas', 'R'], ['caja', 'Caja menor', '#/caja', 'V']].filter(x => J.puede(x[0], x[3]));
    if (accesos.length) m.append(el('h2', {}, 'Accesos rápidos'), el('div', { class: 'accesos' }, accesos.map(x => el('a', { class: 'btn sec', href: x[2] }, x[1]))));
  };
  async function pdfResumen(e) {
    const a = e.avance, pe = e.personal, ec = e.economico, bi = e.bitacora, sm = semaforo(a.ejecutado, a.programado);
    const esq = { titulo: 'RESUMEN EJECUTIVO DE OBRA', codigo: 'Por asignar', version: 'Por asignar', fecha: 'Por asignar', secciones: [], apaisado: true };
    let h = window.FORM.documento(esq, {}, J.ctxFormulario({ consecutivo: fechaCO(e.hoy) }));
    const f = (t, v) => `<tr><td class="lab">${esc(t)}</td><td>${v}</td></tr>`;
    const cuerpo = `<table>${f('Proyecto', esc(e.proyecto.nombre))}${f('Plazo propuesto', fechaCO(e.proyecto.inicioProp) + ' a ' + fechaCO(e.proyecto.finProp) + ' · día ' + e.proyecto.diasTranscurridos + ' de ' + e.proyecto.diasTotales + ' · tiempo ' + J.pct(a.tiempo))}
      ${f('Avance ejecutado / programado', `<b style="color:${sm[0]}">${J.pct(a.ejecutado)}</b> / ${J.pct(a.programado)} · ${sm[1]}`)}${f('Obra ejecutada / faltante', J.money(a.valorEjecutado) + ' / ' + J.money(a.valorFaltante))}
      ${f('Actividades', a.terminados + ' terminadas · ' + a.enEjecucion + ' en ejecución · ' + a.sinIniciar + ' sin iniciar · ' + a.atrasados + ' atrasadas')}
      ${f('Personal hoy', pe.hoy.asiste + ' presentes · NA ' + pe.hoy.noAsiste + ' · P ' + pe.hoy.permiso + ' · I ' + pe.hoy.incapacidad + ' · B ' + pe.hoy.baja)}
      ${f('Personal semana', pe.semana.personas + ' personas · ' + pe.semana.horasHombre + ' horas-hombre · ' + pe.semana.promedioDia + ' personas/día')}
      ${f('Lluvias semana', bi.lluviaSemana.eventos + ' eventos · ' + bi.lluviaSemana.dias + ' días · ' + bi.lluviaSemana.horasPerdidas + ' h perdidas')}
      ${f('Facturado en actas', J.money(ec.facturadoTotal) + ' (' + J.pct(ec.pctFacturado) + ' del costo directo)')}${f('Plan SST del mes', J.pct(e.sst.pct) + ' · ' + e.sst.incumplidos + ' incumplimientos' + (e.sst.peores.length ? ': ' + esc(e.sst.peores.join(', ')) : ''))}
      ${f('Requisiciones', e.compras.porAprobar + ' por aprobar · ' + e.compras.enCompra + ' en compra')}</table>
      <h3>AVANCE POR ACTIVIDAD</h3><table><tr><th>Ítem</th><th>Actividad</th><th>Estado</th><th>% ejecutado</th><th>% programado</th><th>Faltante</th><th>Fin propuesto</th><th>Atraso</th></tr>
      ${e.items.map(x => `<tr><td class="c">${x.item}</td><td>${esc(x.descripcion)}</td><td class="c">${x.estado}</td><td class="c">${J.pct(x.pctEj)}</td><td class="c">${J.pct(x.pctProg)}</td><td class="c">${J.num(x.faltante, 2)} ${esc(x.und)}</td><td class="c">${fechaCO(x.finProp)}</td><td class="c ${x.atraso && !x.justificado ? 'mal' : ''}">${x.justificado ? 'Justificado' : x.atraso ? x.atraso + ' d' : 'Al día'}</td></tr>`).join('')}</table>`;
    h = h.replace('<p class="marca">', cuerpo + '<p class="marca">');
    await J.generarDoc('inicio', null, h, 'Resumen_ejecutivo_' + J.st.config.proyecto.id + '_' + e.hoy, 'pdf');
  }

  /* ---------------- BITÁCORA ---------------- */
  J.cargarPersonalBitacora = async (v, fecha) => {
    const r = await J.api('asistencia.obtener', { fecha: fecha || J._fechaBit }, { silencio: true });
    v.personal = { filas: r.registro ? r.registro.datos.filas.map(f => ({ nombre: f.nombre, cargo: f.cargo, estado: f.estado })) : [], actualizado: J.ahora() };
    if (!r.registro) J.aviso('No hay asistencia registrada para esta fecha (la marca SST en Personal).', 'naranja');
  };
  J.PANTALLAS.bitacora = async (m, fecha) => {
    if (!fecha) {
      const r = await J.api('registros.listar', { tipo: 'bitacora', limite: 120 });
      m.append(J.titulo('Bitácora diaria', J.puede('bitacora', 'R') ? el('a', { class: 'btn', href: '#/bitacora/' + J.hoy() }, 'Bitácora de hoy') : '',
        el('button', { class: 'btn sec', onclick: () => excelLluvias() }, 'Registro de lluvias (Excel)')));
      const otra = J.inp('date', J.hoy(), () => { }); m.append(el('div', { class: 'card fila-in' }, J.campo('Abrir otra fecha', otra), el('button', { class: 'btn sec', onclick: () => J.ir('#/bitacora/' + otra.value) }, 'Abrir')));
      m.append(J.tabla([{ t: 'Fecha', f: x => fechaCO(x.fecha) }, { t: 'Estado', f: x => J.chipEstado(x.estado) }, { t: 'Elaboró', f: x => ((x.firmas || {}).elaboro || {}).nombre || x.creadoPor }, { t: 'Aprobó', f: x => ((x.firmas || {}).aprobo || {}).nombre || '' }],
        r.registros, { click: x => J.ir('#/bitacora/' + x.fecha) }));
      return;
    }
    J._fechaBit = fecha;
    const lista = await J.api('registros.listar', { tipo: 'bitacora', desde: fecha, hasta: fecha });
    let reg = lista.registros.find(x => x.estado !== 'Anulado'), flujo = lista.flujo;
    if (reg) reg = (await J.api('registros.obtener', { id: reg.id, conFirmas: true })).registro;
    const esq = window.ESQ_INT.bitacora;
    const ro = !!(reg && Object.keys(reg.firmas || {}).length) || !J.puede('bitacora', 'R');
    const valores = reg ? reg.datos : {};
    if (!reg && !ro) await J.cargarPersonalBitacora(valores, fecha);
    m.append(J.titulo('Bitácora del ' + fechaCO(fecha), reg ? J.chipEstado(reg.estado) : el('span', { class: 'chip' }, 'Nueva'), el('a', { class: 'btn sec', href: '#/bitacora' }, 'Volver')));
    if (fecha < J.hoy() && !reg) m.append(el('div', { class: 'card aviso-in' }, 'Está creando la bitácora de un día anterior. Quedará registrado en la auditoría.'));
    const caja = el('div', { class: 'card form' });
    const ctx = J.ctxFormulario({ fecha, soloLectura: ro, firmasImg: reg ? reg.imagenesFirma : {}, especiales: window.INTERNOS.especiales });
    let f = window.FORM.render(caja, esq, valores, ctx);
    J.refrescarFormulario = () => { f = window.FORM.render(caja, esq, f.leer(), ctx); };
    m.append(caja);
    const guardar = async () => {
      const datos = f.leer();
      try {
        const r = await J.api('registros.guardar', { registro: { id: reg && reg.id, tipo: 'bitacora', fecha, datos } }, { cola: !reg, desc: 'Bitácora ' + fecha, texto: 'Guardando…' });
        if (r.encolado) return; reg = r.registro; J.aviso('Bitácora guardada', 'verde'); J.ir('#/bitacora/' + fecha);
      } catch (e) { J.aviso(e.message, 'rojo'); }
    };
    if (!ro) m.append(el('div', { class: 'barra' }, el('button', { class: 'btn', onclick: guardar }, 'Guardar borrador')));
    if (reg) {
      m.append(J.panelFlujo(reg, flujo, () => J.ir('#/bitacora/' + fecha), async (p) => {
        if (p.clave === 'elaboro' && !ro) { await guardar(); }
        if (p.clave === 'elaboro') { const d = f.leer(); if (!d.clima || !d.clima.manana) { J.aviso('Antes de cerrar, registre la condición climática.', 'naranja'); return false; } }
        return null;
      }));
      const fotos = await J.api('fotos.listar', { desde: fecha, hasta: fecha }, { silencio: true });
      m.append(el('div', { class: 'card' }, el('h2', {}, 'Fotos del día (' + fotos.fotos.length + ')'), el('p', { class: 'ayuda' }, 'Las fotos tomadas en la app con esta fecha salen como anexo fotográfico del documento (6 por página).')));
      m.append(el('div', { class: 'barra' },
        el('button', { class: 'btn', onclick: () => docBitacora(reg, flujo, fotos.fotos, 'pdf') }, 'Descargar PDF'),
        el('button', { class: 'btn sec', onclick: () => docBitacora(reg, flujo, fotos.fotos, 'docx') }, 'Descargar Word'),
        J.st.yo.rol === 'Administrador' ? el('button', { class: 'btn rojo sec', onclick: () => anular(reg, '#/bitacora') }, 'Anular') : ''));
    }
  };
  async function docBitacora(reg, flujo, fotos, formato) {
    const r = await J.api('registros.obtener', { id: reg.id, conFirmas: true });
    let imgs = {};
    if (formato === 'pdf' && fotos.length) { const ids = fotos.slice(0, 24).map(f => f.archivoId); imgs = (await J.api('fotos.miniaturas', { ids }, { texto: 'Preparando fotos…' })).imagenes; }
    const ctx = J.ctxFormulario({ fecha: reg.fecha, consecutivo: reg.consecutivo + ' · ' + fechaCO(reg.fecha), firmasImg: r.registro.imagenesFirma, docEspeciales: window.INTERNOS.docEspeciales,
      flujoHtml: window.FORM.flujoHtml(flujo, r.registro, { firmasImg: r.registro.imagenesFirma }), anexoHtml: formato === 'pdf' ? window.INTERNOS.anexoFotos(fotos.slice(0, 24), imgs) : '' });
    const html = window.FORM.documento(window.ESQ_INT.bitacora, r.registro.datos, ctx);
    await J.generarDoc('bitacora', reg, html, 'Bitacora_' + J.st.config.proyecto.id + '_' + reg.fecha, formato);
  }
  async function excelLluvias() {
    const mes = J.inp('month', J.hoy().slice(0, 7), () => { }), dia = J.inp('date', J.hoy(), () => { });
    const ok = await J.modal('Registro de control de lluvias', el('div', {}, J.campo('Mes', mes, 'Hoja Mensual: todos los días del mes.'), J.campo('Día de referencia', dia, 'Hojas Semanal (lunes a domingo de ese día) y Diario.')), [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Descargar', v: true }]);
    if (!ok) return;
    const [a, ms] = mes.value.split('-');
    try { const r = await J.api('excel.lluvias', { anio: a, mes: ms, fecha: dia.value }, { texto: 'Llenando el registro de lluvias…' }); J.descargar(r.xlsx); if (r.pdf) J.descargar(r.pdf); } catch (e) { J.aviso(e.message, 'rojo'); }
  }
  async function anular(reg, volver) {
    const mot = await J.preguntar('Anular registro', 'Motivo de la anulación', 'El registro no se borra: queda marcado como anulado con el motivo, quién y cuándo.');
    if (!mot) return;
    try { await J.api('registros.anular', { id: reg.id, motivo: mot }); J.aviso('Anulado', 'verde'); J.ir(volver); } catch (e) { J.aviso(e.message, 'rojo'); }
  }
  J.anular = anular;

  /* ---------------- FOTOS ---------------- */
  J.PANTALLAS.fotos = async (m, sub) => {
    const cfg = J.st.config;
    m.append(J.titulo('Fotos de la obra'));
    if (J.puede('fotos', 'R')) {
      const meta = { tipo: cfg.tiposEvidencia[0], frente: cfg.frentes[0].nombre, item: '', comentario: '' };
      const itemsDe = () => J.st.items.filter(i => !meta.frente || (cfg.frentes.find(f => f.nombre === meta.frente) || { items: [] }).items.includes(i.item));
      const selItem = el('select', { onchange: e => meta.item = e.target.value });
      const pintarItems = () => { selItem.innerHTML = ''; selItem.append(el('option', { value: '' }, 'Sin ítem')); itemsDe().forEach(i => selItem.append(el('option', { value: i.item }, i.item + ' ' + i.descripcion))); };
      pintarItems();
      const vista = el('img', { class: 'vista' }), info = el('p', { class: 'ayuda' }), entrada = el('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true });
      let lista = null;
      entrada.onchange = async e => { const a = e.target.files[0]; if (!a) return; J.cargando(true, 'Poniendo marca de agua…'); try { lista = await J.marcaDeAgua(a, Object.assign({}, meta)); vista.src = lista.imagen; vista.style.display = 'block'; info.textContent = 'Foto lista: ' + Math.round(lista.imagen.length * 0.75 / 1024) + ' KB · ' + (lista.lat ? 'con GPS ±' + lista.precision + ' m' : 'sin GPS'); } finally { J.cargando(false); e.target.value = ''; } };
      const enviar = async () => {
        if (!lista) return J.aviso('Primero tome la foto', 'naranja');
        const r = await J.api('foto.subir', { foto: lista }, { cola: true, desc: 'Foto ' + lista.tipo, texto: 'Enviando foto…' }).catch(e => J.aviso(e.message, 'rojo'));
        if (r && r.foto) J.aviso('Foto guardada: ' + r.foto.consecutivo, 'verde');
        lista = null; vista.style.display = 'none'; info.textContent = '';
      };
      m.append(el('div', { class: 'card form' }, el('h2', {}, 'Tomar foto'),
        J.campo('Tipo de evidencia (carpeta)', J.sel(cfg.tiposEvidencia, meta.tipo, v => meta.tipo = v), 'Define la carpeta donde se guarda la foto.'),
        J.campo('Frente de trabajo', J.sel(cfg.frentes.map(f => f.nombre), meta.frente, v => { meta.frente = v; pintarItems(); }), 'Frente donde se toma la foto.'),
        J.campo('Ítem del presupuesto', selItem, 'Ítem al que corresponde (opcional).'),
        J.campo('Comentario', J.inp('text', '', v => meta.comentario = v), 'Qué se ve en la foto (queda escrito en la marca de agua).'),
        el('label', { class: 'btn rojo' }, 'Tomar foto', entrada), vista, info, el('button', { class: 'btn', onclick: enviar }, 'Guardar foto'),
        el('p', { class: 'ayuda' }, 'Se guarda solo la foto con marca de agua (logo, obra, fecha y hora, GPS y quién la tomó), comprimida a 1920 px. Sin señal, queda pendiente y se envía sola.')));
    }
    const fil = { tipo: '', frente: '', desde: '', hasta: '' }, res = el('div', {});
    const buscar = async () => {
      const r = await J.api('fotos.listar', fil); res.innerHTML = '';
      res.append(el('div', { class: 'barra' }, el('span', {}, r.fotos.length + ' fotos'), r.fotos.length ? el('button', { class: 'btn sec', onclick: async () => {
        try { const z = await J.api('fotos.zip', { ids: r.fotos.map(f => f.archivoId) }, { texto: 'Armando el ZIP…' }); window.open(z.url, '_blank'); if (z.recortado) J.aviso('El ZIP se limitó a 45 MB; filtre por fechas para descargar el resto.', 'naranja'); } catch (e) { J.aviso(e.message, 'rojo'); }
      } }, 'Descargar ZIP') : ''));
      const gal = el('div', { class: 'galeria' }); res.append(gal);
      const pag = r.fotos.slice(0, 24);
      pag.forEach(f => gal.append(el('figure', { 'data-id': f.archivoId }, el('div', { class: 'mini-img' }), el('figcaption', {}, el('b', {}, f.consecutivo), ' · ' + f.tipo + ' · ' + fechaCO(f.fecha) + ' ' + f.fecha.slice(11, 16), el('br'), (f.frente || '') + ' · Ítem ' + (f.item || '—')))));
      if (pag.length) { const im = await J.api('fotos.miniaturas', { ids: pag.map(f => f.archivoId) }, { silencio: true }); gal.querySelectorAll('figure').forEach(fg => { const s = im.imagenes[fg.dataset.id]; if (s) fg.firstChild.append(el('img', { src: s, loading: 'lazy' })); }); }
    };
    m.append(el('div', { class: 'card' }, el('h2', {}, 'Buscar fotos'), el('div', { class: 'fila-in' },
      J.campo('Tipo', J.sel([{ v: '', t: 'Todos' }].concat(cfg.tiposEvidencia.map(x => ({ v: x, t: x }))), '', v => fil.tipo = v)),
      J.campo('Frente', J.sel([{ v: '', t: 'Todos' }].concat(cfg.frentes.map(x => ({ v: x.nombre, t: x.nombre }))), '', v => fil.frente = v)),
      J.campo('Desde', J.inp('date', '', v => fil.desde = v)), J.campo('Hasta', J.inp('date', '', v => fil.hasta = v))),
      el('button', { class: 'btn sec', onclick: buscar }, 'Buscar'), res));
    if (sub !== 'nueva') buscar();
  };

  /* ---------------- PERSONAL Y ASISTENCIA ---------------- */
  const ESTADOS = [['Asiste', 'Asiste'], ['No asiste', 'NA'], ['Permiso', 'P'], ['Incapacidad', 'I'], ['Baja', 'B']];
  J.PANTALLAS.personal = async (m, sub) => {
    m.append(J.titulo('Personal y asistencia', el('a', { class: 'btn sec', href: '#/personal' }, 'Asistencia'), el('a', { class: 'btn sec', href: '#/personal/trabajadores' }, 'Trabajadores'),
      el('button', { class: 'btn sec', onclick: excelPersonal }, 'Control de personal (Excel)')));
    if (sub === 'trabajadores') return trabajadores(m);
    const j = J.st.config.jornada || {};
    let fecha = J.hoy();
    const cont = el('div', {});
    let filas = [], reg = null;
    const cargar = async () => {
      const r = await J.api('asistencia.obtener', { fecha }); reg = r.registro;
      const previas = reg ? reg.datos.filas : [];
      filas = J.trabajadoresActivos().map(t => { const n = J.FORM_nom(t), p = previas.find(x => x.documento === t.documento || x.nombre === n);
        return p || { nombre: n, documento: t.documento, cargo: t.cargo, estado: '', entrada: j.entradaDefecto || '07:00', salida: j.salidaDefecto || '17:00', almuerzo: j.almuerzoDefecto ?? 60 }; });
      pintar();
    };
    const pintar = () => {
      cont.innerHTML = '';
      const cerrada = reg && reg.estado === 'Cerrada', ro = cerrada || !J.puede('personal', 'R');
      cont.append(el('div', { class: 'card' }, el('p', { class: 'ayuda' }, 'Marque a cada trabajador: Asiste (con hora de entrada, salida y minutos de almuerzo, que no hacen parte de la jornada), NA = no asiste, P = permiso, I = incapacidad, B = baja o retiro. Si trabajó otras horas en otro proyecto, regístrelas para que las horas extra se calculen bien. Sin horario fijo: la app calcula las horas extra con la ley (42 h/semana, máx. 9 h ordinarias/día, nocturno 7 p. m.–6 a. m.).'),
        cerrada ? el('p', { class: 'chip bad' }, 'Asistencia cerrada. Para corregir, pida permiso temporal al administrador.') : ''));
      if (!filas.length) cont.append(el('div', { class: 'card' }, 'No hay trabajadores activos en esta obra. Regístrelos en "Trabajadores" o pida al administrador la carga masiva.'));
      filas.forEach(f => {
        const det = el('div', { class: 'det' });
        const pintarDet = () => { det.innerHTML = ''; if (f.estado !== 'Asiste') return;
          det.append(J.campo('Entrada', J.inp('time', f.entrada, v => f.entrada = v, { disabled: ro })), J.campo('Salida', J.inp('time', f.salida, v => f.salida = v, { disabled: ro })),
            J.campo('Almuerzo (min)', J.inp('number', f.almuerzo, v => f.almuerzo = v, { disabled: ro })), J.campo('Horas en otro proyecto', J.inp('number', f.otras, v => f.otras = v, { disabled: ro, step: 'any' })),
            J.campo('De ellas nocturnas', J.inp('number', f.otrasNoct, v => f.otrasNoct = v, { disabled: ro, step: 'any' })), J.campo('Otro proyecto', J.inp('text', f.otroProy, v => f.otroProy = v, { disabled: ro }))); };
        const g = el('div', { class: 'opciones' }, ESTADOS.map(([e, c]) => el('button', { type: 'button', class: 'op' + (f.estado === e ? ' sel' : ''), disabled: ro, title: e, onclick: ev => { f.estado = e; [...g.children].forEach(b => b.classList.toggle('sel', b === ev.target)); pintarDet(); } }, c)));
        pintarDet();
        cont.append(el('div', { class: 'card trab' }, el('div', {}, el('b', {}, f.nombre), el('small', {}, ' · ' + (f.cargo || '') + ' · ' + (f.documento || ''))), g, det));
      });
      const guardar = async (cerrar) => {
        const faltan = filas.filter(f => !f.estado).length;
        if (cerrar && faltan && !(await J.confirmar(faltan + ' trabajador(es) sin marcar quedarán fuera de la asistencia. ¿Cerrar de todas formas?'))) return;
        try { const r2 = await J.api('asistencia.guardar', { fecha, filas: filas.filter(f => f.estado), cerrar }, { cola: true, desc: 'Asistencia ' + fecha }); if (!r2.encolado) { J.aviso(cerrar ? 'Asistencia cerrada' : 'Asistencia guardada', 'verde'); cargar(); } }
        catch (e) { J.aviso(e.message, 'rojo'); }
      };
      if (!ro && filas.length) cont.append(el('div', { class: 'barra' }, el('button', { class: 'btn sec', onclick: () => { filas.forEach(f => { if (!f.estado) f.estado = 'Asiste'; }); pintar(); } }, 'Marcar los vacíos "Asiste"'),
        el('button', { class: 'btn', onclick: () => guardar(false) }, 'Guardar'), el('button', { class: 'btn rojo', onclick: () => guardar(true) }, 'Guardar y cerrar el día')));
    };
    m.append(el('div', { class: 'card fila-in' }, J.campo('Fecha de la asistencia', J.inp('date', fecha, v => { fecha = v; cargar(); }), 'Por defecto hoy.')), cont);
    cargar();
  };
  J.FORM_nom = window.FORM.nomTrab;
  async function trabajadores(m) {
    const puede = J.puede('personal', 'R') || J.puede('sst', 'R');
    let filtro = '';
    const lista = el('div', {});
    const pintar = () => { lista.innerHTML = ''; const l = (J.st.trabajadores || []).filter(t => (J.FORM_nom(t) + ' ' + t.documento + ' ' + t.cargo).toLowerCase().includes(filtro.toLowerCase()));
      lista.append(J.tabla([{ t: 'Nombre', f: J.FORM_nom }, { t: 'Documento', k: 'documento' }, { t: 'Cargo', k: 'cargo' }, { t: 'Estado', f: x => J.chipEstado(x.estado) },
        { t: 'Seg. social hasta', f: x => fechaCO(x.ssHasta) }, { t: 'Alturas vence', f: x => fechaCO(x.alturasVence) }], l, { click: puede ? t => editarTrabajador(t) : null })); };
    m.append(el('div', { class: 'card' }, el('div', { class: 'barra' }, J.inp('search', '', v => { filtro = v; pintar(); }, { placeholder: 'Buscar por nombre, documento o cargo' }),
      puede ? el('button', { class: 'btn', onclick: () => editarTrabajador({}) }, '+ Nuevo trabajador') : '',
      J.puede('admin', 'R') ? el('button', { class: 'btn sec', onclick: cargaMasiva }, 'Carga masiva (Excel)') : ''), lista));
    pintar();
  }
  const CAMPOS_T = [['tipoDoc', 'Tipo de documento', 'sel', ['CC', 'CE', 'PPT', 'PA', 'TI'], 'CC = cédula de ciudadanía · CE = cédula de extranjería · PPT = permiso por protección temporal · PA = pasaporte · TI = tarjeta de identidad.'],
    ['documento', 'Número de documento', 'text', null, 'Solo números. Si ya existe, se actualizan los datos.'], ['nombres', 'Nombres', 'text'], ['apellidos', 'Apellidos', 'text'],
    ['cargo', 'Cargo', 'cargo', null, 'De la lista de cargos que administra el Administrador. Varias personas pueden tener el mismo cargo.'], ['procedencia', 'Procedencia (ciudad)', 'text'],
    ['fechaIngreso', 'Fecha de ingreso', 'date', null, 'Fecha en que empezó en esta obra.'], ['celular', 'Celular', 'tel'], ['contactoEmergencia', 'Contacto de emergencia', 'text'], ['celEmergencia', 'Celular de emergencia', 'tel'],
    ['eps', 'EPS', 'text'], ['arl', 'ARL', 'text'], ['afp', 'Fondo de pensiones', 'text'], ['ssHasta', 'Seguridad social pagada hasta', 'date', null, 'Último día cubierto por la planilla. La app avisa cuando esté por vencer.'],
    ['conceptoMedico', 'Fecha concepto médico de ingreso', 'date'], ['alturasNivel', 'Curso de alturas (nivel)', 'sel', ['', 'Ninguno', 'Trabajador autorizado', 'Avanzado', 'Coordinador', 'Reentrenamiento'], 'Sin curso vigente no puede entrar en un permiso de alturas.'],
    ['alturasVence', 'Curso de alturas vence', 'date'], ['estado', 'Estado', 'sel', ['Activo', 'Retirado'], 'Activo = trabaja en la obra. Retirado = ya no está; queda en el histórico, no se borra.'], ['fechaRetiro', 'Fecha de retiro', 'date']];
  async function editarTrabajador(t) {
    const d = Object.assign({ tipoDoc: 'CC', estado: 'Activo' }, t);
    const cont = el('div', { class: 'form' }, CAMPOS_T.map(([k, l, tipo, ops, ay]) => J.campo(l, tipo === 'sel' ? J.sel(ops, d[k], v => d[k] = v) : tipo === 'cargo' ? J.sel([''].concat(J.st.cargos.filter(c => c.activo !== false).map(c => c.nombre)), d[k], v => d[k] = v) : J.inp(tipo, d[k], v => d[k] = v), ay)),
      el('p', { class: 'ayuda' }, 'La autorización de tratamiento de datos está incluida en el contrato laboral; queda registrada como implícita al crear el trabajador.'));
    const ok = await J.modal(t.id ? 'Editar trabajador' : 'Nuevo trabajador', cont, [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Guardar', v: async () => {
      try { const r = await J.api('trabajadores.guardar', { trabajador: d }); const i = J.st.trabajadores.findIndex(x => x.documento === r.trabajador.documento); i >= 0 ? J.st.trabajadores[i] = r.trabajador : J.st.trabajadores.push(r.trabajador); J.aviso('Trabajador guardado', 'verde'); return true; }
      catch (e) { J.aviso(e.message, 'rojo'); return false; } } }]);
    if (ok) J.ir('#/personal/trabajadores');
  }
  async function cargaMasiva() {
    if (!window.XLSX) return J.aviso('No se pudo cargar el lector de Excel. Revise la conexión.', 'rojo');
    const inp = el('input', { type: 'file', accept: '.xlsx' });
    const ok = await J.modal('Carga masiva de trabajadores', el('div', {}, el('p', { class: 'ayuda' }, 'Use la plantilla "Carga_masiva_trabajadores_JERL.xlsx" (hoja Trabajadores, datos desde la fila 7). Si el documento ya existe, se actualiza.'), inp),
      [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Cargar', v: true }]);
    if (!ok || !inp.files[0]) return;
    const wb = window.XLSX.read(await inp.files[0].arrayBuffer(), { type: 'array', cellDates: true });
    const h = wb.Sheets['Trabajadores']; if (!h) return J.aviso('El archivo no tiene la hoja "Trabajadores"', 'rojo');
    const filas = window.XLSX.utils.sheet_to_json(h, { header: 1, range: 6, raw: true, defval: '' });
    const K = ['tipoDoc', 'documento', 'nombres', 'apellidos', 'cargo', 'procedencia', 'fechaIngreso', 'celular', 'contactoEmergencia', 'celEmergencia', 'eps', 'arl', 'afp', 'ssHasta', 'conceptoMedico', 'alturasNivel', 'alturasVence', 'estado', 'fechaRetiro'];
    const iso = x => x instanceof Date ? x.toISOString().slice(0, 10) : x;
    const datos = filas.filter(f => String(f[1]).trim() && String(f[2]).trim()).map(f => { const o = {}; K.forEach((k, i) => o[k] = iso(f[i])); o.documento = String(o.documento).replace(/\D/g, ''); return o; });
    if (!datos.length) return J.aviso('No se encontraron filas con documento y nombres desde la fila 7', 'naranja');
    try { const r = await J.api('trabajadores.carga', { filas: datos }, { texto: 'Cargando ' + datos.length + ' trabajadores…' });
      await J.modal('Resultado de la carga', el('div', {}, el('p', {}, 'Nuevos: ' + r.nuevos + ' · Actualizados: ' + r.actualizados), r.errores.length ? el('ul', {}, r.errores.map(x => el('li', {}, x))) : ''));
      await J.cargarInicio(); J.ir('#/personal/trabajadores'); } catch (e) { J.aviso(e.message, 'rojo'); }
  }
  async function excelPersonal() {
    const mes = J.inp('month', J.hoy().slice(0, 7), () => { });
    const ok = await J.modal('Control de personal del contratista', el('div', {}, J.campo('Mes', mes, 'Se descarga el formato lleno: cuadrante, registro diario de horas, horas extra por semana y parámetros legales.')), [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Descargar', v: true }]);
    if (!ok) return; const [a, ms] = mes.value.split('-');
    try { const r = await J.api('excel.personal', { anio: a, mes: ms }, { texto: 'Llenando el control de personal…' }); J.descargar(r.xlsx); if (r.pdf) J.descargar(r.pdf); } catch (e) { J.aviso(e.message, 'rojo'); }
  }
})();
