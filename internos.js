/* Formato interno: Bitácora diaria de obra (diseño aprobado) con secciones especiales de clima, lluvias y personal. */
(function () {
  'use strict';
  const { el, esc, fechaCO } = window.FORM;
  const FRANJAS = [['manana', 'MAÑANA'], ['tarde', 'TARDE'], ['noche', 'NOCHE']];
  const CLIMA = [['S', 'Seco'], ['L', 'Lluvia'], ['N', 'Nublado'], ['H', 'Suelo húmedo'], ['XL', 'Lluvia fuerte']];
  const llueve = x => x === 'L' || x === 'XL';
  window.ESQ_INT = {
    bitacora: {
      id: 'bitacora', codigo: 'Por asignar', titulo: 'BITÁCORA DIARIA DE OBRA', version: 'Por asignar', fecha: 'Por asignar',
      secciones: [
        { tipo: 'campos', titulo: '1. Datos generales', campos: [{ l: 'Contratista', t: 't', def: 'JERL – Ing. Javier Eduardo Rosero Londoño' }, { l: 'Interventoría / Cliente', t: 't' },
          { l: 'Ciudad', t: 't', def: 'Pereira, Risaralda' }, { l: 'Día de obra No.', t: 'n', ay: 'Número del día desde el inicio real de la obra.' },
          { l: 'Jornada', t: 't', def: '7:00 a. m. – 5:00 p. m.', ay: 'Horario de trabajo del día.' },
          { l: '¿Hay trabajo en alturas hoy?', t: 'op', op: ['Sí', 'No'], ay: 'Sí = hoy se trabaja en alturas: SST debe tener el permiso de trabajo en alturas de la semana con la verificación de hoy antes de iniciar. Si falta, la app alerta como incumplimiento.' }] },
        { tipo: 'clima', titulo: '2. Condición climática' },
        { tipo: 'personal', titulo: '3. Personal en obra' },
        { tipo: 'tabla', titulo: '4. Equipos y maquinaria', filas: 1, agregar: true, cols: [{ l: 'Equipo', t: 'equipo' }, { l: 'Código', t: 't', ay: 'Código interno (por asignar mientras JERL lo estandariza).' },
          { l: 'Cant.', t: 'n' }, { l: 'Estado', t: 'op', op: ['Operativo', 'Varado'] }, { l: 'Horas de uso', t: 'n' }, { l: 'Observación', t: 't' }] },
        { tipo: 'tabla', titulo: '5. Actividades desarrolladas', filas: 1, agregar: true, numerada: true, cols: [{ l: 'Ítem del presupuesto', t: 'item' }, { l: 'Frente de trabajo', t: 'frente' },
          { l: 'Descripción (ejes, niveles, avance)', t: 'a' }] },
        { tipo: 'tabla', titulo: '6. Visitas, comités e instrucciones recibidas', filas: 1, agregar: true, cols: [{ l: 'Hora', t: 'h' }, { l: 'Entidad / persona', t: 't' },
          { l: 'Tema o instrucción', t: 'a' }, { l: 'Compromiso y responsable', t: 't' }] },
        { tipo: 'tabla', titulo: '7. Novedades e inconvenientes', filas: 1, agregar: true, cols: [{ l: 'Hora', t: 'h' }, { l: 'Tipo', t: 't', ay: 'Ej.: lluvia, falta de material, daño de equipo, accidente, orden de suspensión.' },
          { l: 'Descripción', t: 'a' }, { l: 'Impacto en el avance', t: 't' }, { l: 'Ítem afectado', t: 'item' },
          { l: '¿Justifica atraso?', t: 'op', op: ['Sí', 'No'], ay: 'Sí = esta novedad explica un atraso del ítem afectado; la Ing. Residente lo valida en Avance.' }] },
        { tipo: 'campos', titulo: '8. Observaciones', campos: [{ l: 'Observaciones', t: 'a' }] }]
    }
  };
  /* ---------- Sección especial: clima y lluvias ---------- */
  function seccionClima(s, v, ro) {
    v.clima = v.clima || {}; v.horasLluvia = v.horasLluvia || []; v.lluvias = v.lluvias || [];
    const caja = el('div', {});
    caja.append(el('div', { class: 'ayuda' }, 'Para cada franja elija: ' + CLIMA.map(c => c[0] + ' = ' + c[1].toLowerCase()).join(' · ') + ' (las mismas convenciones del Registro de control de lluvias).'));
    FRANJAS.forEach(([k, nom]) => {
      const g = el('div', { class: 'opciones' }, CLIMA.map(([c, t]) => el('button', { type: 'button', class: 'op' + (v.clima[k] === c ? ' sel' : ''), disabled: ro, title: t, onclick: e => {
        v.clima[k] = c; [...g.children].forEach(b => b.classList.toggle('sel', b === e.target)); pintarPrecip(); } }, c + ' · ' + t)));
      caja.append(el('div', { class: 'campo' }, el('label', {}, nom), g));
    });
    caja.append(el('label', { class: 'sub' }, 'Horas de lluvia (toque las horas en que llovió, de 1 a 24)'));
    const horas = el('div', { class: 'horas' });
    for (let h = 1; h <= 24; h++) horas.append(el('button', { type: 'button', class: 'op hora' + (v.horasLluvia.includes(h) ? ' sel' : ''), disabled: ro, onclick: e => {
      const i = v.horasLluvia.indexOf(h); i >= 0 ? v.horasLluvia.splice(i, 1) : v.horasLluvia.push(h); e.target.classList.toggle('sel'); pintarPrecip(); } }, String(h)));
    caja.append(horas);
    caja.append(el('label', { class: 'sub' }, 'Eventos de lluvia'), el('div', { class: 'ayuda' }, 'Un evento por cada lluvia. El consecutivo LL-### lo asigna la app al guardar y queda igual en el Registro de lluvias. Intensidad: L = lluvia, XL = lluvia fuerte.'));
    const ev = el('div', { class: 'filas' });
    const dibujar = () => {
      ev.innerHTML = '';
      v.lluvias.forEach((e, n) => {
        const dur = () => { if (!e.inicio || !e.fin) return ''; const [a, b] = [e.inicio, e.fin].map(x => +x.slice(0, 2) * 60 + +x.slice(3, 5)); const m = b >= a ? b - a : b + 1440 - a; return Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
        const inp = (lab, k, tipo, extra) => el('div', { class: 'campo mini' }, el('label', {}, lab), el('input', Object.assign({ type: tipo, value: e[k] ?? '', disabled: ro, oninput: x => { e[k] = tipo === 'number' ? (x.target.value === '' ? '' : Number(x.target.value)) : x.target.value; if (k === 'inicio' || k === 'fin') { e.duracion = dur(); dibujar(); } } }, extra || {})));
        ev.append(el('div', { class: 'fila' }, el('div', { class: 'fila-n' }, e.consecutivo || 'Nuevo'),
          inp('Inicio', 'inicio', 'time'), inp('Fin', 'fin', 'time'), el('div', { class: 'campo mini' }, el('label', {}, 'Duración'), el('div', { class: 'etq' }, e.duracion || dur())),
          el('div', { class: 'campo mini' }, el('label', {}, 'Intensidad'), el('select', { disabled: ro, onchange: x => { e.intensidad = x.target.value; } }, ['', 'L', 'XL'].map(o => el('option', { value: o, selected: e.intensidad === o }, o || '—')))),
          el('div', { class: 'campo mini' }, el('label', {}, '¿Afectó actividades?'), el('select', { disabled: ro, onchange: x => { e.afecto = x.target.value; } }, ['', 'Sí', 'No'].map(o => el('option', { value: o, selected: e.afecto === o }, o || '—')))),
          inp('Actividades afectadas', 'actividades', 'text'), inp('Horas perdidas en jornada', 'horasPerdidas', 'number', { step: 'any' }),
          ro ? '' : el('button', { type: 'button', class: 'btn-x', onclick: () => { v.lluvias.splice(n, 1); dibujar(); } }, '×')));
      });
    };
    dibujar(); caja.append(ev);
    if (!ro) caja.append(el('button', { type: 'button', class: 'btn sec mini', onclick: () => { v.lluvias.push({}); dibujar(); } }, '+ Agregar evento de lluvia'));
    const precip = el('div', {});
    const pintarPrecip = () => {
      precip.innerHTML = '';
      const hubo = FRANJAS.some(([k]) => llueve(v.clima[k])) || v.horasLluvia.length || v.lluvias.length;
      if (!hubo) { precip.append(el('div', { class: 'ayuda' }, 'Precipitación: solo se registra los días en que llueve.')); return; }
      precip.append(el('label', { class: 'sub' }, 'Precipitación del día (solo si hubo lluvia)'),
        el('div', { class: 'campo' }, el('label', {}, 'Pluviómetro de obra (mm)'), el('input', { type: 'number', step: 'any', value: v.precipObra ?? '', disabled: ro, oninput: e => v.precipObra = e.target.value === '' ? '' : Number(e.target.value) }),
          el('div', { class: 'ayuda' }, 'Lectura del pluviómetro de la obra (se mide a las 7 a. m. y 5 p. m.).')),
        el('div', { class: 'campo' }, el('label', {}, 'IDEAM – estación Aeropuerto de Pereira (mm)'), el('input', { type: 'number', step: 'any', value: v.precipIdeam ?? '', disabled: ro, oninput: e => v.precipIdeam = e.target.value === '' ? '' : Number(e.target.value) }),
          el('div', { class: 'ayuda' }, 'Dato oficial del IDEAM para las 24 horas del día. Se puede completar al día siguiente cuando el IDEAM lo publique.')));
    };
    pintarPrecip(); caja.append(precip);
    caja.append(el('div', { class: 'campo' }, el('label', {}, 'Observaciones del clima'), el('input', { type: 'text', value: v.observacionesClima || '', disabled: ro, oninput: e => v.observacionesClima = e.target.value })));
    return caja;
  }
  function docClima(s, v) {
    const c = v.clima || {}, h = v.horasLluvia || [], ll = v.lluvias || [];
    const celdaH = (n) => `<td class="c ${h.includes(n) ? 'mal' : ''}"><span class="peq">${n}</span>${h.includes(n) ? ' X' : ''}</td>`;
    let t = `<table><tr><th>Franja</th>${FRANJAS.map(f => `<th>${f[1]}</th>`).join('')}</tr><tr><td class="lab">Condición</td>${FRANJAS.map(([k]) => `<td class="c ${llueve(c[k]) ? 'mal' : ''}"><b>${esc(c[k] || '')}</b></td>`).join('')}</tr></table>`;
    t += `<p class="nota">Convenciones: S = seco · L = lluvia · N = nublado · H = suelo húmedo · XL = lluvia fuerte (las mismas del Registro de control de lluvias).</p>`;
    t += `<table><tr><td class="lab peq">Horas de lluvia</td>${Array.from({ length: 12 }, (_, i) => celdaH(i + 1)).join('')}</tr><tr><td class="lab peq">(marcadas con X)</td>${Array.from({ length: 12 }, (_, i) => celdaH(i + 13)).join('')}</tr></table>`;
    t += `<p><b>Eventos de lluvia</b></p><table><tr><th>Consec.</th><th>Inicio</th><th>Fin</th><th>Duración</th><th>Intensidad</th><th>¿Afectó actividades?</th><th>Horas perdidas en jornada</th></tr>${(ll.length ? ll : [{}]).map(e => `<tr><td class="c">${esc(e.consecutivo || '')}</td><td class="c">${esc(e.inicio || '')}</td><td class="c">${esc(e.fin || '')}</td><td class="c">${esc(e.duracion || '')}</td><td class="c">${esc(e.intensidad || '')}</td><td class="c">${esc(e.afecto || '')}${e.actividades ? ': ' + esc(e.actividades) : ''}</td><td class="c">${esc(e.horasPerdidas ?? '')}</td></tr>`).join('')}</table>`;
    t += `<p class="nota">Cada evento queda también en el Registro de control de lluvias con el mismo consecutivo.</p>`;
    const hubo = FRANJAS.some(([k]) => llueve(c[k])) || h.length || ll.length;
    t += `<table><tr><td class="lab">Precipitación del día (solo si hubo lluvia): pluviómetro de obra e IDEAM Aeropuerto de Pereira</td><td>${hubo ? 'Obra: ' + esc(v.precipObra ?? '—') + ' mm · IDEAM: ' + esc(v.precipIdeam ?? '—') + ' mm' : 'No llovió'}${v.observacionesClima ? '<br>' + esc(v.observacionesClima) : ''}</td></tr></table>`;
    return t;
  }
  /* ---------- Sección especial: personal (sale de la asistencia del día) ---------- */
  const CATS = ['Dirección de obra', 'Ing. Residente', 'SST', 'Maestros', 'Oficiales', 'Ayudantes', 'Otros'];
  const categoria = cargo => { const c = String(cargo || '').toLowerCase();
    if (c.includes('direcci')) return 'Dirección de obra'; if (c.includes('residente')) return 'Ing. Residente'; if (c === 'sst' || c.includes('sst') || c.includes('vigía') || c.includes('vigia')) return 'SST';
    if (c.includes('maestro')) return 'Maestros'; if (c.includes('oficial') || c.includes('soldador') || c.includes('operario')) return 'Oficiales'; if (c.includes('ayudante')) return 'Ayudantes'; return 'Otros'; };
  function resumenPersonal(filas) {
    const cat = {}; CATS.forEach(c => cat[c] = 0);
    const est = { 'Asiste': 0, 'No asiste': 0, 'Permiso': 0, 'Incapacidad': 0, 'Baja': 0 };
    (filas || []).forEach(f => { if (f.estado === 'Asiste') cat[categoria(f.cargo)]++; if (est[f.estado] !== undefined) est[f.estado]++; });
    return { cat, est, total: (filas || []).length };
  }
  function seccionPersonal(s, v, ro) {
    const caja = el('div', {});
    const p = v.personal || { filas: [] }, r = resumenPersonal(p.filas);
    caja.append(el('div', { class: 'ayuda' }, 'Se llena solo con la asistencia que marca SST en Personal para esta fecha. Si cambia la asistencia, toque "Actualizar desde asistencia".'));
    caja.append(el('div', { class: 'chips' }, CATS.map(c => el('span', { class: 'chip' }, c + ': ' + r.cat[c])), el('span', { class: 'chip ok' }, 'Presentes: ' + r.est.Asiste)));
    caja.append(el('div', { class: 'chips' }, Object.keys(r.est).map(k => el('span', { class: 'chip' }, k + ': ' + r.est[k]))));
    if (!ro) caja.append(el('button', { type: 'button', class: 'btn sec mini', onclick: async () => { await window.JERL.cargarPersonalBitacora(v); window.JERL.refrescarFormulario(); } }, 'Actualizar desde asistencia'));
    const t = el('div', { class: 'lista' }); (p.filas || []).forEach((f, i) => t.append(el('div', { class: 'li' }, el('div', { class: 'lt' }, (i + 1) + '. ' + f.nombre + ' · ' + (f.cargo || '')), el('b', {}, f.estado))));
    caja.append(t); return caja;
  }
  function docPersonal(s, v) {
    const p = v.personal || { filas: [] }, r = resumenPersonal(p.filas);
    return `<table><tr>${CATS.map(c => `<th>${c}</th>`).join('')}<th>Total</th></tr><tr>${CATS.map(c => `<td class="c">${r.cat[c]}</td>`).join('')}<td class="c"><b>${r.est.Asiste}</b></td></tr></table>
      <table><tr>${Object.keys(r.est).map(k => `<th>${k}</th>`).join('')}<th>Total registrados</th></tr><tr>${Object.keys(r.est).map(k => `<td class="c">${r.est[k]}</td>`).join('')}<td class="c">${r.total}</td></tr></table>
      <table><tr><th style="width:5%">No.</th><th>Nombre</th><th>Cargo</th><th>Asistencia</th></tr>${(p.filas || []).map((f, i) => `<tr><td class="c">${i + 1}</td><td>${esc(f.nombre)}</td><td>${esc(f.cargo || '')}</td><td class="c">${esc(f.estado)}</td></tr>`).join('')}</table>`;
  }
  /* ---------- Anexo fotográfico (6 por página) ---------- */
  function anexoFotos(fotos, imgs) {
    if (!fotos.length) return '';
    let h = '<div style="page-break-before:always"></div><h3>ANEXO · REGISTRO FOTOGRÁFICO DEL DÍA</h3>';
    for (let i = 0; i < fotos.length; i += 6) {
      const g = fotos.slice(i, i + 6);
      h += '<table>' + [0, 3].map(o => '<tr>' + [0, 1, 2].map(j => { const f = g[o + j]; return f ? `<td class="foto">${imgs[f.archivoId] ? `<img src="${imgs[f.archivoId]}">` : ''}<br><span class="peq"><b>${esc(f.consecutivo)}</b> · ${esc(f.tipo)} · ${esc(f.frente || '')} · Ítem ${esc(f.item || '')}<br>${esc((f.fecha || '').replace('T', ' ').slice(0, 16))} · ${esc(f.comentario || '')}</span></td>` : '<td class="foto"></td>'; }).join('') + '</tr>').join('') + '</table>';
      if (i + 6 < fotos.length) h += '<div style="page-break-before:always"></div>';
    }
    return h;
  }
  window.INTERNOS = { especiales: { clima: seccionClima, personal: seccionPersonal }, docEspeciales: { clima: docClima, personal: docPersonal }, anexoFotos, resumenPersonal, CLIMA };
})();
