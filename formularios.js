/* Motor de formularios: dibuja en pantalla cualquier formato a partir de su esquema y arma el documento diligenciado (HTML → PDF / Word). */
(function () {
  'use strict';
  const AYUDA_TIPO = {
    t: 'Escriba el dato.', a: 'Escriba el texto completo.', f: 'Fecha (día/mes/año).', h: 'Hora en formato 24 h (ej. 07:00, 15:30).', n: 'Solo números (use punto para decimales).',
    trab: 'Elija el trabajador de la lista de la obra. Si no aparece, SST debe registrarlo en Personal.', doc: 'Se llena solo al elegir el trabajador.', cargo: 'Se llena solo al elegir el trabajador.',
    obra: 'Proyecto actual (se llena solo).', frente: 'Elija el frente de trabajo.', usuario: 'Su nombre (se llena solo con el usuario que diligencia).', consecutivo: 'Lo asigna la app al guardar.',
    firma: 'Toque "Firmar" y firme con el dedo. La firma queda con nombre, fecha y hora.', x: 'Marque si aplica.', item: 'Elija el ítem del presupuesto.', curso: 'Se llena solo con el nivel y vencimiento del curso de alturas.',
    equipo: 'Escriba o elija el equipo.'
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fechaCO = s => { if (!s) return ''; const p = String(s).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; };
  const el = (tag, at, ...hijos) => { const e = document.createElement(tag); for (const k in (at || {})) { if (k === 'class') e.className = at[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), at[k]); else if (at[k] !== undefined && at[k] !== null && at[k] !== false) e.setAttribute(k, at[k] === true ? '' : at[k]); } hijos.flat().forEach(h => e.append(h instanceof Node ? h : document.createTextNode(h == null ? '' : h))); return e; };
  const nomTrab = t => (t.nombres + ' ' + (t.apellidos || '')).trim();
  const itemsDe = s => (s.items || []).map((x, k) => Array.isArray(x) ? { n: x[0], t: x[1] } : { n: s.n0 ? String(s.n0 + k) : (s.numerada === false ? '' : ''), t: x });

  /* ---------------- FORMULARIO EN PANTALLA ---------------- */
  function render(cont, esq, valores, ctx) {
    const v = JSON.parse(JSON.stringify(valores || {}));
    const soloLectura = !!ctx.soloLectura;
    cont.innerHTML = '';
    const trabajadores = (ctx.trabajadores || []).filter(t => t.estado !== 'Retirado');
    const listaTrab = el('datalist', { id: 'dl-trab' }, trabajadores.map(t => el('option', { value: nomTrab(t) })));
    cont.append(listaTrab);
    const buscarTrab = n => trabajadores.find(t => nomTrab(t) === n);
    const ayuda = (txt) => el('div', { class: 'ayuda' }, txt);
    const valorDefecto = c => c.t === 'obra' ? (ctx.proyecto && ctx.proyecto.nombre) : c.t === 'usuario' ? ctx.usuario && ctx.usuario.nombre : c.t === 'f' && /fecha/i.test(c.l) && !/ingreso|armado|mantenimiento|fabricaci|vence|límite|cierre|fin prevista/i.test(c.l) ? ctx.fecha : c.def;

    function control(c, obj, clave, alCambiar) {
      if (obj[clave] === undefined) { const d = valorDefecto(c); if (d !== undefined && d !== null) obj[clave] = d; }
      const val = obj[clave];
      const set = x => { obj[clave] = x; if (alCambiar) alCambiar(x); };
      const dis = soloLectura || c.t === 'obra' || c.t === 'consecutivo' || c.t === 'doc' || c.t === 'cargo' || c.t === 'curso';
      switch (c.t) {
        case 'a': return el('textarea', { rows: 3, disabled: dis, oninput: e => set(e.target.value) }, val || '');
        case 'f': return el('input', { type: 'date', value: val || '', disabled: dis, onchange: e => set(e.target.value) });
        case 'h': return el('input', { type: 'time', value: val || '', disabled: dis, onchange: e => set(e.target.value) });
        case 'n': return el('input', { type: 'number', step: 'any', inputmode: 'decimal', value: val ?? '', disabled: dis, oninput: e => set(e.target.value === '' ? '' : Number(e.target.value)) });
        case 'x': case 'chk': { const i = el('input', { type: 'checkbox', disabled: dis, onchange: e => set(e.target.checked) }); i.checked = !!val; return el('label', { class: 'chkl' }, i, c.t === 'chk' ? '' : 'Sí'); }
        case 'op': {
          const g = el('div', { class: 'opciones' });
          const opts = c.op.concat(c.otro ? [typeof c.otro === 'string' ? c.otro : 'Otro'] : []);
          opts.forEach(o => g.append(el('button', { type: 'button', class: 'op' + (val === o || (val && val.op === o) ? ' sel' : ''), disabled: soloLectura, onclick: () => {
            [...g.children].forEach(b => b.classList && b.classList.remove('sel')); g.querySelectorAll('.op').forEach(b => { if (b.textContent === o) b.classList.add('sel'); });
            if (c.otro && o === opts[opts.length - 1]) { const t = prompt('¿Cuál?') || ''; set({ op: o, otro: t }); } else set(o);
          } }, o)));
          return g;
        }
        case 'mc': {
          const sel = (val && val.sel) || [], g = el('div', { class: 'opciones' });
          const opts = c.op.concat(c.otro ? [typeof c.otro === 'string' ? c.otro : 'Otro'] : []);
          opts.forEach(o => g.append(el('button', { type: 'button', class: 'op' + (sel.includes(o) ? ' sel' : ''), disabled: soloLectura, onclick: e => {
            const a = new Set((obj[clave] && obj[clave].sel) || []); a.has(o) ? a.delete(o) : a.add(o); e.target.classList.toggle('sel');
            const nv = { sel: [...a], otro: (obj[clave] && obj[clave].otro) || '' };
            if (c.otro && o === opts[opts.length - 1] && a.has(o)) nv.otro = prompt('¿Cuál?') || '';
            set(nv);
          } }, o)));
          return g;
        }
        case 'trab': return el('input', { list: 'dl-trab', value: val || '', disabled: soloLectura, placeholder: 'Nombre del trabajador', onchange: e => set(e.target.value) });
        case 'item': return el('select', { disabled: soloLectura, onchange: e => set(e.target.value) }, el('option', { value: '' }, '—'), (ctx.items || []).map(i => el('option', { value: i.item, selected: val === i.item }, i.item + ' ' + i.descripcion)));
        case 'frente': return el('select', { disabled: soloLectura, onchange: e => set(e.target.value) }, el('option', { value: '' }, '—'), (ctx.frentes || []).map(f => el('option', { value: f.nombre, selected: val === f.nombre }, f.nombre)), el('option', { value: 'Otro', selected: val === 'Otro' }, 'Otro'));
        case 'firma': {
          const caja = el('div', { class: 'firma-caja' });
          const pintar = () => { caja.innerHTML = ''; const f = obj[clave];
            if (f && (f.firmaId || f.pendiente)) caja.append(el('img', { src: f.pendiente || (ctx.firmasImg || {})[f.firmaId] || '', alt: 'Firma' }), el('small', {}, (f.nombre || '') + ' · ' + (f.fecha || '').replace('T', ' ').slice(0, 16)));
            if (!soloLectura) caja.append(el('button', { type: 'button', class: 'btn sec mini', onclick: async () => {
              const img = await window.JERL.pedirFirma(c.l); if (!img) return;
              obj[clave] = { pendiente: img, nombre: ctx.usuario.nombre, fecha: new Date().toISOString().slice(0, 16) }; pintar(); if (alCambiar) alCambiar(obj[clave]);
            } }, f ? 'Volver a firmar' : 'Firmar')); };
          pintar(); return caja;
        }
        default: return el('input', { type: 'text', value: (val && val.op) ? val.op : (val ?? ''), disabled: dis, oninput: e => set(e.target.value) });
      }
    }
    function ayudaDe(c) {
      if (c.ay) return c.ay;
      if (c.t === 'op' || c.t === 'mc') return (c.t === 'mc' ? 'Marque todas las que apliquen: ' : 'Elija una opción: ') + c.op.join(' · ') + (c.otro ? ' · ' + (typeof c.otro === 'string' ? c.otro : 'Otro') + ' (escriba cuál)' : '') + '.';
      return AYUDA_TIPO[c.t] || AYUDA_TIPO.t;
    }
    function autollenar(fila, cols, nombre) {
      const t = buscarTrab(nombre); if (!t) return;
      cols.forEach((c, j) => { const k = 'c' + j;
        if (c.t === 'doc') fila[k] = (t.tipoDoc || 'CC') + ' ' + t.documento;
        if (c.t === 'cargo') fila[k] = t.cargo || '';
        if (c.t === 'curso') fila[k] = (t.alturasNivel || 'Sin dato') + (t.alturasVence ? ' · vence ' + fechaCO(t.alturasVence) : '');
      });
      const avisos = [];
      if (t.ssHasta && t.ssHasta < ctx.fecha) avisos.push('seguridad social vencida (' + fechaCO(t.ssHasta) + ')');
      if (esq.id && /altura|andamio|eppcc/.test(esq.id) && (!t.alturasVence || t.alturasVence < ctx.fecha)) avisos.push('curso de alturas vencido o sin registrar');
      if (avisos.length) window.JERL.aviso(nombre + ': ' + avisos.join(' y ') + '. No debe incluirse en esta actividad hasta corregirlo.', 'rojo');
    }

    esq.secciones.forEach((s, i) => {
      const k = 's' + i; const sec = el('section', { class: 'fsec' });
      if (s.titulo) sec.append(el('h3', {}, s.titulo));
      switch (s.tipo) {
        case 'campos': {
          v[k] = v[k] || {};
          s.campos.forEach((c, j) => {
            const ctl = control(c, v[k], 'c' + j, x => {
              if (c.t === 'trab') { const t = buscarTrab(x); if (t) s.campos.forEach((c2, j2) => { if (c2.t === 'doc') v[k]['c' + j2] = (t.tipoDoc || 'CC') + ' ' + t.documento; if (c2.t === 'cargo') v[k]['c' + j2] = t.cargo || ''; }); render.refrescar && render.refrescar(); }
            });
            sec.append(el('div', { class: 'campo' }, el('label', {}, c.l), ctl, ayuda(ayudaDe(c))));
          });
          break;
        }
        case 'leyenda': sec.append(el('table', { class: 'tleg' }, (s.cab ? [el('tr', {}, s.cab.map(x => el('th', {}, x)))] : []).concat(s.filas.map(f => el('tr', {}, f.map(x => el('td', {}, x))))))); break;
        case 'nota': case 'texto':
          sec.append(el('p', { class: s.tipo === 'nota' ? 'nota' : 'texto' }, s.plantilla ? s.texto.replace(/\{([^}]+)\}/g, '______') : s.texto));
          if (s.vinetas) sec.append(el('ul', {}, s.vinetas.map(x => el('li', {}, x))));
          break;
        case 'lista': {
          v[k] = v[k] || {};
          const cols = s.cols, crit = s.critico || (cols.includes('NC') ? 'NC' : null);
          sec.append(ayuda('Califique cada aspecto: ' + cols.join(' · ') + (cols.includes('NC') ? ' (C = Cumple, NC = No cumple, NA = No aplica)' : '') + '. Escriba la observación cuando no cumpla.'));
          const tb = el('div', { class: 'lista' });
          itemsDe(s).forEach((it, n) => {
            const r = v[k]['i' + n] = v[k]['i' + n] || {};
            const fila = el('div', { class: 'li' + (r.r === crit ? ' mal' : '') });
            const bts = el('div', { class: 'opciones cmp' }, cols.map(o => el('button', { type: 'button', class: 'op' + (r.r === o ? ' sel' : ''), disabled: soloLectura, onclick: e => {
              r.r = r.r === o ? '' : o; [...bts.children].forEach(b => b.classList.toggle('sel', b.textContent === r.r)); fila.classList.toggle('mal', r.r === crit);
            } }, o)));
            fila.append(el('div', { class: 'lt' }, (it.n ? it.n + '. ' : '') + it.t), bts,
              el('input', { type: 'text', class: 'obs', placeholder: s.obs || 'Observación', value: r.o || '', disabled: soloLectura, oninput: e => { r.o = e.target.value; } }));
            tb.append(fila);
          });
          if (!soloLectura) sec.append(el('button', { type: 'button', class: 'btn sec mini', onclick: () => {
            const def = cols[0]; itemsDe(s).forEach((x, n) => { const r = v[k]['i' + n]; if (!r.r) { r.r = def; const b = tb.children[n].querySelectorAll('.op'); b.forEach(bt => bt.classList.toggle('sel', bt.textContent === def)); } }); } }, 'Marcar los vacíos como "' + cols[0] + '"'));
          sec.append(tb); break;
        }
        case 'matriz': {
          v[k] = v[k] || {};
          sec.append(ayuda('Para cada día marque ' + s.op.join(' / ') + ' (S = Sí, N = No, NA = No aplica). Si un control crítico es N no se autoriza el trabajo.'));
          const t = el('table', { class: 'tmat' }, el('tr', {}, el('th', {}, s.cab), s.cols.map(c => el('th', {}, c))));
          s.items.forEach((it, n) => {
            const r = v[k]['i' + n] = v[k]['i' + n] || {};
            t.append(el('tr', {}, el('td', {}, it), s.cols.map(c => el('td', {}, el('select', { disabled: soloLectura, class: r[c] === 'N' ? 'mal' : '', onchange: e => { r[c] = e.target.value; e.target.className = r[c] === 'N' ? 'mal' : ''; if (r[c] === 'N') window.JERL.aviso('Control crítico en NO: no se autoriza el inicio o continuación hasta corregirlo y revalidar.', 'rojo'); } },
              el('option', { value: '' }, '·'), s.op.map(o => el('option', { value: o, selected: r[c] === o }, o)))))));
          });
          sec.append(el('div', { class: 'scroll' }, t)); break;
        }
        case 'tabla': {
          const cols = s.cols, esEtq = (c, j) => c.t === 'etq' || c.t === 'etq2' || s.etqCol === j;
          if (!v[k]) {
            if (s.etiquetas) v[k] = s.etiquetas.map(e => { const f = {}; const etq = Array.isArray(e) ? e : [e]; let p = 0; cols.forEach((c, j) => { if (esEtq(c, j)) f['c' + j] = etq[p++] ?? ''; else if (c.t === 'chk') f._lbl = etq[p++] ?? ''; }); return f; });
            else if (s.precarga) v[k] = s.precarga.map(f => { const o = {}; f.forEach((x, j) => o['c' + j] = x); return o; });
            else v[k] = Array.from({ length: s.filas || 1 }, () => ({}));
          }
          const ayudas = cols.filter(c => !['etq', 'etq2'].includes(c.t)).map(c => c.l + ': ' + ayudaDe(c)).join(' · ');
          sec.append(ayuda(ayudas));
          const cajaF = el('div', { class: 'filas' });
          const dibujar = () => {
            cajaF.innerHTML = '';
            v[k].forEach((fila, n) => {
              const tarjeta = el('div', { class: 'fila' }, el('div', { class: 'fila-n' }, s.numerada || s.etiquetas ? String(n + 1) : '#' + (n + 1)));
              cols.forEach((c, j) => {
                if (esEtq(c, j)) { tarjeta.append(el('div', { class: 'etq' + (c.t === 'etq2' ? ' etq2' : '') }, fila['c' + j] || '')); return; }
                tarjeta.append(el('div', { class: 'campo mini' }, el('label', {}, c.t === 'chk' ? (fila._lbl || c.l) : c.l), control(c, fila, 'c' + j, x => { if (c.t === 'trab') { autollenar(fila, cols, x); dibujar(); } })));
              });
              if (s.agregar && !soloLectura && !s.etiquetas) tarjeta.append(el('button', { type: 'button', class: 'btn-x', title: 'Quitar fila', onclick: () => { v[k].splice(n, 1); dibujar(); } }, '×'));
              cajaF.append(tarjeta);
            });
          };
          dibujar(); sec.append(cajaF);
          if (s.agregar && !soloLectura) sec.append(el('button', { type: 'button', class: 'btn sec mini', onclick: () => { v[k].push({}); dibujar(); } }, '+ Agregar fila'));
          break;
        }
        case 'checks': {
          v[k] = v[k] || { sel: [], otro: '' };
          sec.append(ayuda('Marque todos los que apliquen.'));
          sec.append(control({ t: 'mc', l: s.titulo, op: s.op, otro: s.otro }, v, k));
          break;
        }
        case 'firmas': {
          v[k] = v[k] || {};
          s.firmas.forEach((f, j) => sec.append(el('div', { class: 'campo' }, el('label', {}, f), control({ t: 'firma', l: f }, v[k], 'f' + j), ayuda(AYUDA_TIPO.firma))));
          break;
        }
        case 'examen': {
          v[k] = v[k] || {};
          sec.append(ayuda('El trabajador responde cada pregunta; la app califica sola.'));
          s.preguntas.forEach((q, n) => sec.append(el('div', { class: 'campo' }, el('label', {}, q.p), control({ t: 'op', op: q.op }, v[k], 'p' + n, () => { const out = sec.querySelector('.res'); out.textContent = resultadoExamen(s, v[k]); }))));
          sec.append(el('div', { class: 'res destacado' }, resultadoExamen(s, v[k])));
          break;
        }
        case 'resultado': {
          const out = el('div', { class: 'destacado' });
          const calc = () => { const r = resultado(esq, v); out.innerHTML = ''; out.append(`Ítems aplicables: ${r.aplicables} · Cumplen: ${r.c} · No cumplen: ${r.nc} · Cumplimiento: ${r.pct === null ? '—' : r.pct + '%'} `, el('b', { style: 'color:' + r.color }, r.clasif || '')); };
          calc(); sec.append(el('div', { class: 'ayuda' }, s.formula + ' · 90–100% Adecuado · 80–89% Requiere mejora · <80% Deficiente'), out, el('button', { type: 'button', class: 'btn sec mini', onclick: calc }, 'Recalcular'));
          break;
        }
        default: if (ctx.especiales && ctx.especiales[s.tipo]) sec.append(ctx.especiales[s.tipo](s, v, soloLectura));
      }
      cont.append(sec);
    });
    return { leer: () => v };
  }
  function resultadoExamen(s, val) {
    const n = s.preguntas.length, ok = s.preguntas.filter((q, i) => val['p' + i] === q.op[q.ok]).length;
    return 'Resultado: ' + ok + ' / ' + n + ' · Aprobado: ' + (ok === n ? 'Sí' : 'No');
  }
  function resultado(esq, v) {
    let c = 0, nc = 0;
    esq.secciones.forEach((s, i) => { if (s.tipo === 'lista' && s.cols.includes('NC')) Object.values(v['s' + i] || {}).forEach(r => { if (r.r === 'C') c++; if (r.r === 'NC') nc++; }); });
    const pct = c + nc ? Math.round(c * 1000 / (c + nc)) / 10 : null;
    const cl = esq.secciones.find(s => s.tipo === 'resultado');
    const k = pct === null || !cl ? null : cl.clasif.find(x => pct >= x[0]);
    return { aplicables: c + nc, c, nc, pct, clasif: k ? k[1] : '', color: k ? k[2] : '#333' };
  }

  /* ---------------- DOCUMENTO DILIGENCIADO (HTML para PDF y Word) ---------------- */
  const CSS = `body{font-family:Arial,Helvetica,sans-serif;font-size:8.5pt;color:#1E2124;margin:0}
    table{border-collapse:collapse;width:100%;margin:0 0 6px 0}td,th{border:1px solid #7F858C;padding:3px 4px;vertical-align:top}
    th{background:#D9D9D9;font-weight:bold;text-align:center}.enc td{vertical-align:middle}.enc .tit{text-align:center;font-weight:bold;font-size:11pt}
    .enc .cod{font-size:7.5pt;font-weight:bold;width:22%}.lab{background:#F2F2F2;font-weight:bold;width:32%}h3{font-size:9pt;margin:8px 0 3px;background:#1E2124;color:#fff;padding:3px 5px}
    .c{text-align:center}.mal{color:#B71C1C;font-weight:bold}.nota{font-size:7.5pt;font-style:italic;color:#4A4F55;margin:3px 0}.firma img{height:42px}.firma{text-align:center;height:70px;vertical-align:bottom}
    .marca{font-size:7pt;color:#4A4F55;text-align:right}.foto{width:33%;text-align:center}.foto img{width:100%;max-height:200px;object-fit:contain}.peq{font-size:7pt}`;
  function encabezado(esq, ctx) {
    return `<table class="enc"><tr><td rowspan="4" style="width:18%;text-align:center"><img src="${ctx.logo}" style="height:46px"></td><td rowspan="4" class="tit">${esc(esq.titulo)}</td>
      <td class="cod">CÓDIGO: ${esc(esq.codigo || 'Por asignar')}</td></tr><tr><td class="cod">VERSIÓN: ${esc(esq.version || 'Por asignar')}</td></tr>
      <tr><td class="cod">FECHA: ${esc(esq.fecha || 'Por asignar')}</td></tr><tr><td class="cod">No.: ${esc(ctx.consecutivo || '')}</td></tr></table>`;
  }
  const marcar = (on) => on ? '☒' : '☐';
  function valorTexto(c, x, ctx) {
    if (x === undefined || x === null || x === '') return '';
    if (c.t === 'f') return fechaCO(x);
    if (c.t === 'x' || c.t === 'chk') return x ? 'X' : '';
    if (c.t === 'op') { const sel = x.op || x; return c.op.concat(c.otro ? [typeof c.otro === 'string' ? c.otro : 'Otro'] : []).map(o => marcar(o === sel) + ' ' + esc(o)).join('&nbsp; ') + (x.otro ? ': ' + esc(x.otro) : ''); }
    if (c.t === 'mc') { const sel = x.sel || []; return c.op.concat(c.otro ? [typeof c.otro === 'string' ? c.otro : 'Otro'] : []).map(o => marcar(sel.includes(o)) + ' ' + esc(o)).join('&nbsp; ') + (x.otro ? ': ' + esc(x.otro) : ''); }
    if (c.t === 'firma') return imgFirma(x, ctx);
    if (c.t === 'item') { const it = (ctx.items || []).find(i => i.item === x); return esc(it ? it.item + ' ' + it.descripcion : x); }
    return esc(x).replace(/\n/g, '<br>');
  }
  function imgFirma(f, ctx) {
    if (!f) return '';
    const src = f.pendiente || (ctx.firmasImg || {})[f.firmaId];
    return (src ? `<img data-firma src="${src}" style="height:38px"><br>` : '') + `<span class="peq">${esc(f.nombre || '')} · ${esc((f.fecha || '').replace('T', ' ').slice(0, 16))}</span>`;
  }
  function documento(esq, v, ctx) {
    const out = [encabezado(esq, ctx)];
    esq.secciones.forEach((s, i) => {
      const k = 's' + i, val = v[k];
      if (s.titulo && s.tipo !== 'checks') out.push(`<h3>${esc(s.titulo)}</h3>`);
      switch (s.tipo) {
        case 'campos': {
          const filas = s.campos.map((c, j) => `<tr><td class="lab">${esc(c.l)}</td><td>${valorTexto(c, (val || {})['c' + j], ctx)}</td></tr>`);
          out.push(`<table>${filas.join('')}</table>`); break;
        }
        case 'leyenda': out.push(`<table style="width:45%">${s.cab ? '<tr>' + s.cab.map(x => `<th>${esc(x)}</th>`).join('') + '</tr>' : ''}${s.filas.map(f => '<tr>' + f.map(x => `<td>${esc(x)}</td>`).join('') + '</tr>').join('')}</table>`); break;
        case 'nota': out.push(`<p class="nota">${esc(s.texto)}</p>`); break;
        case 'texto': {
          let t = esc(s.texto);
          if (s.plantilla) t = s.texto.replace(/\{([^}]+)\}/g, (m, l) => { let r = '______'; esq.secciones.forEach((s2, i2) => { if (s2.tipo === 'campos') s2.campos.forEach((c, j) => { if (c.l === l && v['s' + i2] && v['s' + i2]['c' + j]) r = '<b>' + esc(v['s' + i2]['c' + j]) + '</b>'; }); }); return r; });
          out.push(`<p>${t}</p>` + (s.vinetas ? '<ul>' + s.vinetas.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : '')); break;
        }
        case 'lista': {
          const crit = s.critico || (s.cols.includes('NC') ? 'NC' : null);
          const filas = itemsDe(s).map((it, n) => { const r = (val || {})['i' + n] || {};
            return `<tr><td class="c">${esc(it.n)}</td><td>${esc(it.t)}</td>${s.cols.map(c => `<td class="c ${r.r === c && c === crit ? 'mal' : ''}">${marcar(r.r === c)}</td>`).join('')}<td>${esc(r.o || '')}</td></tr>`; });
          out.push(`<table><tr><th style="width:5%">N.º</th><th>${esc(s.cab || 'Aspecto a verificar')}</th>${s.cols.map(c => `<th style="width:7%">${esc(c)}</th>`).join('')}<th style="width:24%">${esc(s.obs || 'Observaciones')}</th></tr>${filas.join('')}</table>`);
          break;
        }
        case 'matriz': {
          const filas = s.items.map((it, n) => { const r = (val || {})['i' + n] || {}; return `<tr><td>${esc(it)}</td>${s.cols.map(c => `<td class="c ${r[c] === 'N' ? 'mal' : ''}">${esc(r[c] || '')}</td>`).join('')}</tr>`; });
          out.push(`<table><tr><th>${esc(s.cab)}</th>${s.cols.map(c => `<th style="width:6%">${esc(c)}</th>`).join('')}</tr>${filas.join('')}</table>`); break;
        }
        case 'tabla': {
          const filas = (val || []).filter(f => Object.values(f).some(x => x !== '' && x != null && !(typeof x === 'object' && !x.sel && !x.firmaId && !x.pendiente && !x.op)) || s.etiquetas);
          const minimo = s.filas && !s.etiquetas ? Math.max(filas.length, Math.min(s.filas, 3)) : filas.length;
          while (filas.length < minimo) filas.push({});
          out.push(`<table><tr>${s.numerada ? '<th style="width:4%">N.º</th>' : ''}${s.cols.map(c => `<th>${esc(c.l)}</th>`).join('')}</tr>${filas.map((f, n) => `<tr>${s.numerada ? `<td class="c">${n + 1}</td>` : ''}${s.cols.map((c, j) => `<td class="${['op', 'x', 'n', 'f', 'h'].includes(c.t) ? 'c' : ''}">${c.t === 'chk' ? marcar(f['c' + j]) + ' ' + esc(f._lbl || '') : c.t === 'op' ? esc((f['c' + j] && f['c' + j].op) || f['c' + j] || '') : valorTexto(c, f['c' + j], ctx)}</td>`).join('')}</tr>`).join('')}</table>`);
          break;
        }
        case 'checks': { const sel = (val && val.sel) || []; out.push(`<h3>${esc(s.titulo || '')}</h3><p>${s.op.concat(s.otro ? [typeof s.otro === 'string' ? s.otro : 'Otro'] : []).map(o => marcar(sel.includes(o)) + ' ' + esc(o)).join('<br>')}${val && val.otro ? ': ' + esc(val.otro) : ''}</p>`); break; }
        case 'firmas': out.push(`<table><tr>${s.firmas.map((f, j) => `<td class="firma">${imgFirma((val || {})['f' + j], ctx)}<br>______________________<br><b>${esc(f)}</b></td>`).join('')}</tr></table>`); break;
        case 'examen': out.push(s.preguntas.map((q, n) => `<p><b>${esc(q.p)}</b><br>${q.op.map(o => marcar((val || {})['p' + n] === o) + ' ' + esc(o)).join('<br>')}</p>`).join('') + `<p><b>${resultadoExamen(s, val || {}).replace('Resultado: ', 'Resultado: ')}</b></p>`); break;
        case 'resultado': { const r = resultado(esq, v); out.push(`<table style="width:60%"><tr><td class="lab">Total de ítems aplicables</td><td>${r.aplicables}</td></tr><tr><td class="lab">Total de ítems que cumplen</td><td>${r.c}</td></tr><tr><td class="lab">Total de ítems que NO cumplen</td><td>${r.nc}</td></tr><tr><td class="lab">${esc(s.formula)}</td><td><b>${r.pct === null ? '' : r.pct + ' %'}</b></td></tr><tr><td class="lab">Clasificación</td><td><b style="color:${r.color}">${esc(r.clasif)}</b></td></tr></table>`); break; }
        default: if (ctx.docEspeciales && ctx.docEspeciales[s.tipo]) out.push(ctx.docEspeciales[s.tipo](s, v, ctx));
      }
    });
    if (ctx.flujoHtml) out.push(ctx.flujoHtml);
    if (ctx.anexoHtml) out.push(ctx.anexoHtml);
    out.push(`<p class="marca">Documento generado en JERL Gestión de Obra · ${esc(ctx.proyecto ? ctx.proyecto.nombre : '')} · ${new Date().toLocaleString('es-CO')}</p>`);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{size:letter ${esq.apaisado ? 'landscape' : 'portrait'};margin:12mm}${CSS}</style></head><body>${out.join('\n')}</body></html>`;
  }
  /** Firmas del flujo de aprobación (pie del documento). */
  function flujoHtml(flujo, registro, ctx) {
    const fi = registro.firmas || {};
    return `<h3>FIRMAS</h3><table><tr>${flujo.map(p => { const f = fi[p.clave]; return `<td class="firma">${f ? imgFirma({ firmaId: f.firmaId, nombre: f.nombre + (f.cargo ? ' · ' + f.cargo : ''), fecha: f.fecha }, ctx) : ''}<br>______________________<br><b>${esc(p.nombre)}</b></td>`; }).join('')}</tr></table>`;
  }
  window.FORM = { render, documento, flujoHtml, resultado, esc, fechaCO, el, nomTrab, CSS, encabezado, imgFirma, valorTexto };
})();
