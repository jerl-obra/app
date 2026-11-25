/* Núcleo de la app: conexión con el servidor, cola sin señal, sesión, firma con el dedo, fotos con marca de agua y utilidades de pantalla. */
(function () {
  'use strict';
  const { el, esc, fechaCO } = window.FORM;
  const SERVIDOR = (window.JERL_CONFIG || {}).servidor || '';
  const J = window.JERL = { st: null, token: sessionStorage.getItem('jerl_token') || '' };
  const $ = s => document.querySelector(s);
  J.$ = $; J.el = el; J.esc = esc; J.fechaCO = fechaCO;
  J.hoy = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  J.ahora = () => new Date().toISOString();
  J.money = n => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-CO');
  J.num = (n, d = 2) => (Number(n) || 0).toLocaleString('es-CO', { maximumFractionDigits: d });
  J.pct = n => (Math.round((Number(n) || 0) * 1000) / 10).toLocaleString('es-CO') + ' %';
  J.puede = (modulo, nivel) => { const N = { B: 0, V: 1, R: 2, A: 3 }; return J.st && N[(J.st.permisos || {})[modulo] || 'B'] >= N[nivel]; };

  /* ---------- avisos ---------- */
  J.aviso = (txt, tipo) => {
    const c = $('#avisos'); const d = el('div', { class: 'aviso ' + (tipo || '') }, txt);
    c.append(d); while (c.children.length > 3) c.firstChild.remove();
    setTimeout(() => d.remove(), tipo === 'rojo' ? 9000 : 4500);
  };
  J.cargando = (si, txt) => { const c = $('#cargando'); c.style.display = si ? 'flex' : 'none'; c.querySelector('span').textContent = txt || 'Procesando…'; };

  /* ---------- servidor ---------- */
  async function llamar(accion, p) {
    if (!SERVIDOR.startsWith('http')) throw new Error('Falta configurar la dirección del servidor en config.js');
    const r = await fetch(SERVIDOR, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ accion, token: J.token }, p || {})) });
    const j = await r.json();
    if (!j.ok) { const e = new Error(j.error || 'Error del servidor'); e.servidor = true; e.sesion = j.sesion === false; throw e; }
    return j;
  }
  /** Llama al servidor. Con {cola:true}, si no hay señal guarda la operación en el celular y la envía sola al volver la conexión. */
  J.api = async (accion, p, op = {}) => {
    try {
      if (!navigator.onLine) throw new Error('sin señal');
      if (!op.silencio) J.cargando(true, op.texto);
      return await llamar(accion, p);
    } catch (e) {
      if (e.sesion) { J.salir(true); throw e; }
      if (!e.servidor && op.cola) {
        await cola('readwrite', s => s.add({ accion, p, desc: op.desc || accion, fecha: J.ahora() }));
        contarCola(); J.aviso('Sin conexión: quedó guardado en el celular y se enviará solo cuando vuelva la señal.', 'naranja');
        return { encolado: true };
      }
      if (!e.servidor) e.message = 'No hay conexión con el servidor. ' + (op.cola ? '' : 'Esta acción necesita señal.');
      throw e;
    } finally { if (!op.silencio) J.cargando(false); }
  };
  const db = new Promise((ok, mal) => { const r = indexedDB.open('jerl_obra', 1); r.onupgradeneeded = () => r.result.createObjectStore('pendientes', { keyPath: 'id', autoIncrement: true }); r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); });
  const cola = async (modo, fn) => { const d = await db; return new Promise((ok, mal) => { const t = d.transaction('pendientes', modo); const q = fn(t.objectStore('pendientes')); t.oncomplete = () => ok(q && q.result); t.onerror = () => mal(t.error); }); };
  J.cola = cola;
  async function contarCola() { const n = await cola('readonly', s => s.count()); const b = $('#bCola'); if (b) { b.textContent = n ? n + ' pendiente' + (n > 1 ? 's' : '') : ''; b.style.display = n ? 'inline-flex' : 'none'; } return n; }
  J.contarCola = contarCola;
  let enviando = false;
  J.enviarCola = async () => {
    if (enviando || !navigator.onLine || !J.token) return; enviando = true;
    try {
      const l = await cola('readonly', s => s.getAll());
      for (const it of l) {
        try { await llamar(it.accion, it.p); await cola('readwrite', s => s.delete(it.id)); J.aviso('Enviado: ' + it.desc, 'verde'); }
        catch (e) { if (!e.servidor) break; it.error = e.message; await cola('readwrite', s => s.put(it)); }
      }
    } finally { enviando = false; contarCola(); }
  };
  addEventListener('online', () => { estadoRed(); J.enviarCola(); }); addEventListener('offline', estadoRed);
  function estadoRed() { const b = $('#bRed'); if (b) { b.textContent = navigator.onLine ? 'En línea' : 'Sin señal'; b.className = 'chip ' + (navigator.onLine ? 'ok' : 'bad'); } }
  setInterval(J.enviarCola, 30000);

  /* ---------- sesión ---------- */
  J.salir = (expiro) => { sessionStorage.removeItem('jerl_token'); J.token = ''; J.st = null; if (expiro) J.aviso('La sesión expiró. Ingrese de nuevo.', 'naranja'); location.hash = ''; J.pantallaIngreso(); };
  J.cargarInicio = async () => { J.st = await J.api('inicio', {}, { texto: 'Cargando la obra…' }); return J.st; };

  /* ---------- descargas ---------- */
  J.descargar = (arch) => {
    if (!arch || !arch.base64) return;
    const bin = atob(arch.base64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([u8], { type: arch.mime }));
    const a = el('a', { href: url, download: arch.nombre }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  /* ---------- ventana modal ---------- */
  J.modal = (titulo, contenido, botones) => new Promise(res => {
    const fondo = el('div', { class: 'modal-fondo' }), caja = el('div', { class: 'modal' }, el('h2', {}, titulo), contenido);
    const pie = el('div', { class: 'modal-pie' });
    (botones || [{ t: 'Cerrar', v: null }]).forEach(b => pie.append(el('button', { class: 'btn ' + (b.c || ''), onclick: async () => { const v = typeof b.v === 'function' ? await b.v() : b.v; if (v === false) return; fondo.remove(); res(v); } }, b.t)));
    caja.append(pie); fondo.append(caja); document.body.append(fondo);
  });
  J.confirmar = (txt) => J.modal('Confirmar', el('p', {}, txt), [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Sí, continuar', v: true }]);
  J.preguntar = async (titulo, etiqueta, ayuda) => { const i = el('textarea', { rows: 3 }); const r = await J.modal(titulo, el('div', { class: 'campo' }, el('label', {}, etiqueta), i, el('div', { class: 'ayuda' }, ayuda || '')), [{ t: 'Cancelar', v: null, c: 'sec' }, { t: 'Aceptar', v: () => i.value.trim() || false }]); return r; };

  /* ---------- firma con el dedo ---------- */
  J.pedirFirma = (para) => {
    const cv = el('canvas', { class: 'pad', width: 600, height: 220 });
    const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 220); x.lineWidth = 3; x.lineCap = 'round'; x.strokeStyle = '#111';
    let dib = false, trazo = false;
    const pos = e => { const r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * 600 / r.width, (t.clientY - r.top) * 220 / r.height]; };
    const ini = e => { dib = true; const [a, b] = pos(e); x.beginPath(); x.moveTo(a, b); e.preventDefault(); };
    const mov = e => { if (!dib) return; const [a, b] = pos(e); x.lineTo(a, b); x.stroke(); trazo = true; e.preventDefault(); };
    const fin = () => { dib = false; };
    cv.addEventListener('pointerdown', ini); cv.addEventListener('pointermove', mov); addEventListener('pointerup', fin);
    cv.addEventListener('touchstart', ini, { passive: false }); cv.addEventListener('touchmove', mov, { passive: false }); cv.addEventListener('touchend', fin);
    const cont = el('div', {}, el('p', { class: 'ayuda' }, 'Firme dentro del recuadro con el dedo. Firmando: ' + (J.st ? J.st.yo.nombre : '') + (para ? ' · ' + para : '')), cv);
    return J.modal('Firma', cont, [{ t: 'Borrar', c: 'sec', v: () => { x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 220); trazo = false; return false; } }, { t: 'Cancelar', c: 'sec', v: null },
      { t: 'Aceptar firma', v: () => { if (!trazo) { J.aviso('Falta la firma', 'naranja'); return false; } const c2 = el('canvas', { width: 300, height: 110 }); c2.getContext('2d').drawImage(cv, 0, 0, 300, 110); return c2.toDataURL('image/png'); } }]);
  };

  /* ---------- foto con marca de agua (una sola foto, 1920 px, JPEG) ---------- */
  let logoImg = new Image(); logoImg.src = 'logo.png';
  J.logoDataUrl = '';
  fetch('logo.png').then(r => r.blob()).then(b => { const f = new FileReader(); f.onload = () => J.logoDataUrl = f.result; f.readAsDataURL(b); }).catch(() => { });
  J.gps = () => new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(p => res({ lat: +p.coords.latitude.toFixed(6), lon: +p.coords.longitude.toFixed(6), precision: Math.round(p.coords.accuracy) }), () => res(null), { enableHighAccuracy: true, timeout: 15000, maximumAge: 20000 });
  });
  J.marcaDeAgua = async (archivo, meta) => {
    const capturada = new Date(), gps = await J.gps();
    const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = URL.createObjectURL(archivo); });
    const k = Math.min(1, 1920 / Math.max(img.naturalWidth, img.naturalHeight)), W = Math.round(img.naturalWidth * k), H = Math.round(img.naturalHeight * k);
    const c = el('canvas', { width: W, height: H }), x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
    const fs = Math.max(16, Math.round(W / 55)), lh = Math.round(fs * 1.35), banda = lh * 4 + fs;
    x.fillStyle = 'rgba(20,20,20,.62)'; x.fillRect(0, H - banda, W, banda);
    const lgH = banda - fs, lgW = logoImg.complete && logoImg.naturalWidth ? lgH * logoImg.naturalWidth / logoImg.naturalHeight : 0;
    if (lgW) { x.fillStyle = '#fff'; x.fillRect(fs / 2, H - banda + fs / 2, lgW + fs / 2, lgH); x.drawImage(logoImg, fs * 0.75, H - banda + fs / 2, lgW, lgH); }
    const xt = lgW ? lgW + fs * 1.6 : fs, p2 = n => String(n).padStart(2, '0');
    const fh = p2(capturada.getDate()) + '/' + p2(capturada.getMonth() + 1) + '/' + capturada.getFullYear() + ' ' + p2(capturada.getHours()) + ':' + p2(capturada.getMinutes());
    const lineas = ['JERL · ' + J.st.config.proyecto.nombre, meta.tipo + ' · ' + (meta.frente || 'Sin frente') + ' · Ítem ' + (meta.item || '—'),
      fh + ' · ' + (gps ? 'Lat ' + gps.lat + '  Lon ' + gps.lon + '  (±' + gps.precision + ' m)' : 'Sin ubicación GPS'), 'Registró: ' + J.st.yo.nombre + (meta.comentario ? ' · ' + meta.comentario.slice(0, 80) : '')];
    x.fillStyle = '#fff'; x.textBaseline = 'top';
    lineas.forEach((t, i) => { x.font = (i === 0 ? '700 ' : '400 ') + fs + 'px system-ui, Arial, sans-serif'; x.fillText(t, xt, H - banda + fs / 2 + i * lh, W - xt - fs); });
    return Object.assign({ imagen: c.toDataURL('image/jpeg', 0.82), capturada: capturada.toISOString() }, meta, gps || {});
  };

  /* ---------- utilidades de pantalla ---------- */
  J.tabla = (cols, filas, op = {}) => {
    const t = el('table', { class: 'tdatos' }, el('thead', {}, el('tr', {}, cols.map(c => el('th', {}, c.t)))));
    const b = el('tbody'); filas.forEach(f => { const tr = el('tr', { class: op.clase ? op.clase(f) : '' }, cols.map(c => el('td', { class: c.c || '' }, c.f ? c.f(f) : (f[c.k] ?? ''))));
      if (op.click) { tr.style.cursor = 'pointer'; tr.addEventListener('click', () => op.click(f)); } b.append(tr); });
    if (!filas.length) b.append(el('tr', {}, el('td', { colspan: cols.length, class: 'vacio' }, op.vacio || 'Sin registros.')));
    t.append(b); return el('div', { class: 'scroll' }, t);
  };
  J.chipEstado = (e) => el('span', { class: 'chip est-' + String(e || '').toLowerCase().replace(/[^a-záéíóúñ]+/g, '-') }, e || '');
  J.campo = (etq, ctl, ayuda) => el('div', { class: 'campo' }, el('label', {}, etq), ctl, ayuda ? el('div', { class: 'ayuda' }, ayuda) : '');
  J.sel = (opts, val, on) => el('select', { onchange: e => on(e.target.value) }, opts.map(o => typeof o === 'string' ? el('option', { value: o, selected: o === val }, o) : el('option', { value: o.v, selected: o.v === val }, o.t)));
  J.inp = (tipo, val, on, at) => el('input', Object.assign({ type: tipo, value: val ?? '', oninput: e => on(tipo === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value) }, at || {}));
  J.trabajadoresActivos = () => (J.st.trabajadores || []).filter(t => t.estado !== 'Retirado' && (t.proyectos || []).includes(J.st.config.proyecto.id));
  J.ctxFormulario = (extra) => Object.assign({ proyecto: J.st.config.proyecto, trabajadores: J.trabajadoresActivos(), items: J.st.items, frentes: J.st.config.frentes, usuario: J.st.yo, fecha: J.hoy(), logo: J.logoDataUrl }, extra || {});
  J.estadoRed = estadoRed;
  /* Sube las firmas pendientes dentro de los datos de un formulario (antes de guardar). */
  J.subirFirmasPendientes = async (obj, tipo) => {
    const tareas = [];
    const recorrer = o => { if (!o || typeof o !== 'object') return; if (o.pendiente) tareas.push(o); else Object.values(o).forEach(recorrer); };
    recorrer(obj);
    for (const f of tareas) { if (!navigator.onLine) return false; const r = await J.api('firma.subir', { firma: f.pendiente, tipo, campo: 'campo' }, { silencio: true }); f.firmaId = r.firmaId; delete f.pendiente; }
    return true;
  };
  /* Documento: arma el HTML y lo pide al servidor en PDF o Word. */
  J.generarDoc = async (modulo, registro, html, nombre, formato, subcarpeta) => {
    const r = await J.api('documento.generar', { modulo, registroId: registro ? registro.id : '', html, nombre, formato, subcarpeta }, { texto: 'Generando ' + (formato === 'docx' ? 'Word' : 'PDF') + '…' });
    J.descargar(r); J.aviso('Documento guardado en el repositorio de la obra y descargado.', 'verde');
  };
})();
