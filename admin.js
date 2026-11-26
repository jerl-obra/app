/* Pantalla de Administrador: usuarios, permisos por rol, cargos, proyecto, presupuesto y cronograma base, tablas base, festivos, alertas, permisos temporales, delegaciones y auditoría. */
(function () {
  'use strict';
  const J = window.JERL, { el, fechaCO } = J;
  const MODS = [['inicio', 'Inicio'], ['bitacora', 'Bitácora'], ['fotos', 'Fotos'], ['personal', 'Personal'], ['cantidades', 'Cantidades'], ['cronograma', 'Cronograma (fechas reales)'], ['avance', 'Avance'],
    ['actas', 'Actas'], ['adicionales', 'Adicionales'], ['requisiciones', 'Requisiciones'], ['inventario', 'Inventario'], ['sst', 'SST'], ['documentos', 'Documentos'], ['admin', 'Administrador'], ['facturas', 'Facturas'], ['caja', 'Caja menor']];
  const PEST = [['usuarios', 'Usuarios'], ['permisos', 'Permisos por rol'], ['cargos', 'Cargos'], ['proyecto', 'Proyecto y parámetros'], ['presupuesto', 'Presupuesto y cronograma base'],
    ['tablas', 'Tablas base'], ['festivos', 'Festivos'], ['temporales', 'Permisos temporales'], ['delegaciones', 'Delegaciones'], ['sstper', 'Periodicidad SST'], ['auditoria', 'Auditoría']];
  const guardarCfg = async (clave, valor) => { try { await J.api('config.guardar', { clave, valor }); J.st.config[clave] = valor; J.aviso('Guardado', 'verde'); } catch (e) { J.aviso(e.message, 'rojo'); } };

  J.PANTALLAS.admin = async (m, pest) => {
    pest = pest || 'usuarios';
    m.append(J.titulo('Administrador'), el('div', { class: 'pestanas' }, PEST.map(([k, t]) => el('a', { href: '#/admin/' + k, class: k === pest ? 'activo' : '' }, t))));
    const c = el('div', { class: 'card' }); m.append(c);
    const esAdmin = J.st.yo.rol === 'Administrador';
    await (P[pest] || P.usuarios)(c, esAdmin);
  };
  const P = {};
  P.usuarios = async (c, adm) => {
    const r = await J.api('usuarios.listar');
    c.append(el('p', { class: 'ayuda' }, 'Cada persona tiene su usuario y clave. Al crearlo se asigna una clave temporal que la app obliga a cambiar en el primer ingreso. Los usuarios no se borran: se desactivan.'));
    if (adm) c.append(el('button', { class: 'btn', onclick: () => editarUsuario({}) }, '+ Nuevo usuario'));
    c.append(J.tabla([{ t: 'Usuario', k: 'usuario' }, { t: 'Nombre', k: 'nombre' }, { t: 'Rol', k: 'rol' }, { t: 'Cargo', k: 'cargo' }, { t: 'Correo', k: 'correo' },
      { t: 'Activo', f: x => String(x.activo) === 'true' ? 'Sí' : 'No' }, { t: 'Último ingreso', f: x => (x.ultimoIngreso || '').replace('T', ' ').slice(0, 16) }],
      r.usuarios, { click: adm ? x => editarUsuario(x) : null }));
  };
  async function editarUsuario(u) {
    const d = Object.assign({ rol: 'Maestro', activo: true }, u);
    const cont = el('div', { class: 'form' },
      J.campo('Usuario (para ingresar)', J.inp('text', d.usuario, v => d.usuario = v), 'Letras y números, sin espacios. Ej.: vpinzon.'), J.campo('Nombre completo', J.inp('text', d.nombre, v => d.nombre = v)),
      J.campo('Cédula', J.inp('text', d.cedula, v => d.cedula = v)), J.campo('Cargo', J.sel([''].concat(J.st.cargos.map(c => c.nombre)), d.cargo, v => d.cargo = v), 'Cargo que aparece en las firmas.'),
      J.campo('Rol', J.sel(J.st.config.roles, d.rol, v => d.rol = v), 'El rol define qué puede ver, registrar o aprobar (pestaña Permisos por rol).'),
      J.campo('Correo', J.inp('email', d.correo, v => d.correo = v), 'Para recibir las alertas.'), J.campo('Teléfono', J.inp('tel', d.telefono, v => d.telefono = v)),
      d.id ? J.campo('Activo', J.sel([{ v: 'true', t: 'Sí' }, { v: 'false', t: 'No (no puede ingresar)' }], String(d.activo), v => d.activo = v === 'true')) : J.campo('Clave temporal', J.inp('text', '', v => d.clave = v), 'Mínimo 6 caracteres. Entréguela a la persona; deberá cambiarla al ingresar.'));
    const bot = [{ t: 'Cancelar', v: false, c: 'sec' }];
    if (d.id) bot.push({ t: 'Restablecer clave', c: 'sec', v: async () => { const cl = prompt('Nueva clave temporal (mínimo 6 caracteres)'); if (!cl) return false; try { await J.api('usuarios.clave', { id: d.id, clave: cl }); J.aviso('Clave restablecida', 'verde'); } catch (e) { J.aviso(e.message, 'rojo'); } return false; } });
    bot.push({ t: 'Guardar', v: async () => { try { await J.api('usuarios.guardar', { usuario: d }); J.aviso('Usuario guardado', 'verde'); return true; } catch (e) { J.aviso(e.message, 'rojo'); return false; } } });
    if (await J.modal(d.id ? 'Editar usuario' : 'Nuevo usuario', cont, bot)) J.ir('#/admin/usuarios');
  }
  P.permisos = async (c, adm) => {
    const per = JSON.parse(JSON.stringify(J.st.config.permisos || {})), roles = J.st.config.roles.filter(r => r !== 'Administrador');
    c.append(el('p', { class: 'ayuda' }, 'B = bloqueado (no lo ve) · V = solo ver y descargar · R = registrar (crear, editar borradores y firmar su paso) · A = aprobar con firma. El Administrador tiene acceso total. "Backup Residente" recibe los permisos de la Residente solo mientras tenga una delegación vigente. Los documentos SST solo los ve SST salvo que aquí se habilite.'));
    const t = el('table', { class: 'tdatos matriz' }, el('tr', {}, el('th', {}, 'Módulo'), roles.map(r => el('th', {}, r))));
    MODS.forEach(([k, n]) => t.append(el('tr', {}, el('td', {}, n), roles.map(r => el('td', {}, el('select', { disabled: !adm, onchange: e => { per[r] = per[r] || {}; per[r][k] = e.target.value; } }, ['B', 'V', 'R', 'A'].map(x => el('option', { value: x, selected: (per[r] || {})[k] === x }, x))))))));
    c.append(el('div', { class: 'scroll' }, t));
    c.append(J.campo('Gerencia puede firmar', J.sel([{ v: 'false', t: 'No (solo ver)' }, { v: 'true', t: 'Sí' }], String(!!J.st.config.gerenciaFirma), v => J.st.config.gerenciaFirma = v === 'true'), 'Por defecto la Gerencia solo ve; se puede activar si se necesita su firma.'));
    if (adm) c.append(el('button', { class: 'btn', onclick: async () => { await guardarCfg('permisos', per); await guardarCfg('gerenciaFirma', !!J.st.config.gerenciaFirma); } }, 'Guardar permisos'));
  };
  P.cargos = async (c, adm) => {
    c.append(el('p', { class: 'ayuda' }, 'Lista de cargos para trabajadores y usuarios. Se pueden crear más cargos y tener varias personas en el mismo cargo. Un cargo inactivo deja de aparecer en las listas pero se conserva en el histórico.'));
    if (adm) c.append(el('button', { class: 'btn', onclick: () => editarCargo({}) }, '+ Nuevo cargo'));
    c.append(J.tabla([{ t: 'Cargo', k: 'nombre' }, { t: 'Descripción', k: 'descripcion' }, { t: 'Activo', f: x => x.activo === false || String(x.activo) === 'false' ? 'No' : 'Sí' }], J.st.cargos, { click: adm ? editarCargo : null }));
  };
  async function editarCargo(x) {
    const d = Object.assign({ activo: true }, x);
    const ok = await J.modal(d.id ? 'Editar cargo' : 'Nuevo cargo', el('div', { class: 'form' }, J.campo('Nombre', J.inp('text', d.nombre, v => d.nombre = v)), J.campo('Descripción', J.inp('text', d.descripcion, v => d.descripcion = v)),
      J.campo('Activo', J.sel([{ v: 'true', t: 'Sí' }, { v: 'false', t: 'No' }], String(d.activo !== false && String(d.activo) !== 'false'), v => d.activo = v === 'true'))),
      [{ t: 'Cancelar', v: false, c: 'sec' }, { t: 'Guardar', v: async () => { try { await J.api('cargos.guardar', { cargo: d }); return true; } catch (e) { J.aviso(e.message, 'rojo'); return false; } } }]);
    if (ok) { await J.cargarInicio(); J.ir('#/admin/cargos'); }
  }
  P.proyecto = async (c, adm) => {
    const p = JSON.parse(JSON.stringify(J.st.config.proyecto)), a = JSON.parse(JSON.stringify(J.st.config.aiu)), j = JSON.parse(JSON.stringify(J.st.config.jornada)), al = JSON.parse(JSON.stringify(J.st.config.alertasCfg || {}));
    const f = (o, k, l, t, ay) => J.campo(l, J.inp(t || 'text', o[k], v => o[k] = v, { step: 'any', disabled: !adm }), ay);
    c.append(el('h3', {}, 'Datos del proyecto'), f(p, 'nombre', 'Nombre'), f(p, 'ciudad', 'Ciudad'), f(p, 'contratista', 'Contratista'), f(p, 'contrato', 'Contrato No.', 'text', 'Pendiente por definir.'),
      f(p, 'interventoria', 'Interventoría / supervisión'), f(p, 'anticipo', 'Valor del anticipo', 'number'), f(p, 'inicioSemanas', 'Inicio de la semana 1 (curva S)', 'date', 'Lunes desde el que se cuentan las semanas del avance.'),
      f(p, 'inicioSST', 'Inicio del control SST', 'date', 'Fecha desde la que la app exige las periodicidades SST (por defecto, la misma de la semana 1). Use la fecha real de inicio de la obra.'),
      el('h3', {}, 'AIU e IVA (en decimales: 0.25 = 25 %)'), el('div', { class: 'fila-in' }, f(a, 'a', 'Administración', 'number'), f(a, 'i', 'Imprevistos', 'number'), f(a, 'u', 'Utilidad', 'number'), f(a, 'iva', 'IVA sobre utilidad', 'number')),
      el('h3', {}, 'Jornada (Código Sustantivo del Trabajo)'), el('div', { class: 'fila-in' }, f(j, 'semanal', 'Jornada semanal (h)', 'number', 'Ley 2101 de 2021: 42 h desde el 15/07/2026.'), f(j, 'maxDia', 'Máx. horas ordinarias por día', 'number'),
        f(j, 'domRef', 'Jornada de referencia dom/festivo (h)', 'number', 'Validar con nómina.'), f(j, 'entradaDefecto', 'Hora de entrada sugerida', 'time'), f(j, 'salidaDefecto', 'Hora de salida sugerida', 'time'), f(j, 'almuerzoDefecto', 'Almuerzo sugerido (min)', 'number')),
      el('h3', {}, 'Alertas'), J.campo('Enviar correos de alerta', J.sel([{ v: 'true', t: 'Sí' }, { v: 'false', t: 'No' }], String(al.correos !== false), v => al.correos = v === 'true'), 'Bitácora sin cerrar (escalando cada hora desde la hora indicada) y resumen diario a las 6 p. m.'),
      f(al, 'horaBitacora', 'Hora desde la que se exige cerrar la bitácora (0–23)', 'number'),
      J.campo('Plazo de notificación de adicionales', J.sel([{ v: 'false', t: 'Desactivado' }, { v: 'true', t: 'Activado' }], String(!!al.plazoAdicionalActivo), v => al.plazoAdicionalActivo = v === 'true'), 'Si se activa, alerta cuando un adicional detectado lleva más días sin sustentar que el plazo.'),
      f(al, 'plazoAdicionalDias', 'Plazo (días)', 'number'));
    if (adm) c.append(el('button', { class: 'btn', onclick: async () => { ['anticipo'].forEach(k => p[k] = Number(p[k]) || 0); ['a', 'i', 'u', 'iva'].forEach(k => a[k] = Number(a[k]) || 0);
      await guardarCfg('proyecto', p); await guardarCfg('aiu', a); await guardarCfg('jornada', j); al.horaBitacora = Number(al.horaBitacora) || 17; al.plazoAdicionalDias = Number(al.plazoAdicionalDias) || 0; await guardarCfg('alertasCfg', al); } }, 'Guardar'));
    c.append(el('h3', {}, 'Frentes de trabajo'), el('p', { class: 'ayuda' }, 'Los códigos son provisionales (los ajusta JERL). Se usan en el nombre de las fotos.'));
    const fr = JSON.parse(JSON.stringify(J.st.config.frentes));
    const tf = el('div', {}); const pf = () => { tf.innerHTML = ''; fr.forEach((x, i) => tf.append(el('div', { class: 'fila' }, J.campo('Frente', J.inp('text', x.nombre, v => x.nombre = v)), J.campo('Código', J.inp('text', x.codigo, v => x.codigo = v)),
      J.campo('Ítems (separados por coma)', J.inp('text', (x.items || []).join(', '), v => x.items = v.split(',').map(s => s.trim()).filter(Boolean))), el('button', { class: 'btn-x', onclick: () => { fr.splice(i, 1); pf(); } }, '×')))); };
    pf(); c.append(tf); if (adm) c.append(el('button', { class: 'btn sec mini', onclick: () => { fr.push({ nombre: '', codigo: '', items: [] }); pf(); } }, '+ Frente'), el('button', { class: 'btn', onclick: () => guardarCfg('frentes', fr) }, 'Guardar frentes'));
    c.append(el('h3', {}, 'Tipos de evidencia (carpetas de fotos)'));
    const te = el('textarea', { rows: 4 }, (J.st.config.tiposEvidencia || []).join('\n'));
    c.append(J.campo('Uno por línea', te)); if (adm) c.append(el('button', { class: 'btn', onclick: () => guardarCfg('tiposEvidencia', te.value.split('\n').map(s => s.trim()).filter(Boolean)) }, 'Guardar tipos'));
    c.append(el('h3', {}, 'Plantillas Excel'), el('p', { class: 'ayuda' }, (J.st.config.plantillasEstado || []).map(x => x.clave + ': ' + (x.lista ? 'lista' : 'FALTA')).join(' · ') || 'Sin información. Ejecute instalarPlantillas() en Apps Script.'));
  };
  P.presupuesto = async (c, adm) => {
    const it = JSON.parse(JSON.stringify(J.st.items));
    c.append(el('p', { class: 'ayuda' }, 'Presupuesto contractual y cronograma propuesto (línea base). Están bloqueados para todos: solo el Administrador los modifica y cada cambio queda en la auditoría. Tipo de medición: área, volumen, peso (kg/m × longitud), días, conteo o viajes.'));
    const t = el('table', { class: 'tdatos' }, el('tr', {}, ['Ítem', 'Descripción', 'Und', 'Cantidad', 'Vr. unitario', 'Frente', 'Tipo de medición', 'Inicio propuesto', 'Fin propuesto'].map(h => el('th', {}, h))));
    it.forEach(x => t.append(el('tr', {}, el('td', {}, x.item), ...[['descripcion', 'text'], ['und', 'text'], ['cantidad', 'number'], ['vu', 'number']].map(([k, ty]) => el('td', {}, J.inp(ty, x[k], v => x[k] = v, { disabled: !adm, step: 'any' }))),
      el('td', {}, J.sel(J.st.config.frentes.map(f => f.nombre), x.frente, v => x.frente = v)), el('td', {}, J.sel(['area', 'volumen', 'peso', 'dias', 'conteo', 'viajes'], x.tipoMedicion, v => x.tipoMedicion = v)),
      el('td', {}, J.inp('date', x.inicioProp, v => x.inicioProp = v, { disabled: !adm })), el('td', {}, J.inp('date', x.finProp, v => x.finProp = v, { disabled: !adm })))));
    c.append(el('div', { class: 'scroll' }, t), el('p', {}, 'Costo directo: ', el('b', {}, J.money(it.reduce((s, x) => s + x.cantidad * x.vu, 0)))));
    if (adm) c.append(el('button', { class: 'btn', onclick: async () => { if (!(await J.confirmar('Va a modificar la línea base del contrato. ¿Continuar?'))) return; try { await J.api('items.guardarBase', { items: it }); await J.cargarInicio(); J.aviso('Guardado', 'verde'); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Guardar presupuesto y cronograma'));
  };
  P.tablas = async (c, adm) => {
    const tb = JSON.parse(JSON.stringify(J.st.config.tablas || { perfiles: [], vehiculos: [], alquileres: [] }));
    const sec = (k, titulo, ayuda, cols) => {
      const caja = el('div', {}); const pintar = () => { caja.innerHTML = ''; (tb[k] = tb[k] || []).forEach((r, i) => caja.append(el('div', { class: 'fila' }, cols.map(([ck, cl, ct, op]) => J.campo(cl, op ? J.sel(op, r[ck], v => r[ck] = v) : J.inp(ct, r[ck], v => r[ck] = v, { step: 'any' }))), el('button', { class: 'btn-x', onclick: () => { tb[k].splice(i, 1); pintar(); } }, '×')))); };
      pintar(); c.append(el('h3', {}, titulo), el('p', { class: 'ayuda' }, ayuda), caja); if (adm) c.append(el('button', { class: 'btn sec mini', onclick: () => { tb[k].push({}); pintar(); } }, '+ Agregar'));
    };
    sec('perfiles', 'Perfiles metálicos (ítems 4.00 y 6.00)', 'Peso por metro de cada perfil, para medir en kilos.', [['nombre', 'Perfil', 'text'], ['kgm', 'kg/m', 'number']]);
    sec('vehiculos', 'Vehículos y volquetas (ítem 11.00)', 'Capacidad de cada vehículo para medir el retiro de residuos por viajes.', [['placa', 'Placa', 'text'], ['capacidad', 'Capacidad (m³)', 'number'], ['condicion', 'Medida en', 'text', ['Suelto', 'Banco']]]);
    sec('alquileres', 'Alquileres (ítem 5.00)', 'Equipos alquilados, modalidad de cobro y tarifa.', [['equipo', 'Equipo', 'text'], ['modalidad', 'Modalidad', 'text', ['Días calendario', 'Días de uso']], ['tarifa', 'Tarifa', 'number']]);
    if (adm) c.append(el('button', { class: 'btn', onclick: () => guardarCfg('tablas', tb) }, 'Guardar tablas base'));
  };
  P.festivos = async (c, adm) => {
    const fe = JSON.parse(JSON.stringify(J.st.config.festivos || []));
    c.append(el('p', { class: 'ayuda' }, 'Días de descanso obligatorio en Colombia. Se usan para las horas dominicales y festivas del control de personal. Agregue cada año los del siguiente.'));
    const caja = el('div', {}); const pintar = () => { caja.innerHTML = ''; fe.forEach((f, i) => caja.append(el('div', { class: 'fila' }, J.campo('Fecha', J.inp('date', f.fecha, v => f.fecha = v)), J.campo('Nombre', J.inp('text', f.nombre, v => f.nombre = v)), el('button', { class: 'btn-x', onclick: () => { fe.splice(i, 1); pintar(); } }, '×')))); };
    pintar(); c.append(caja); if (adm) c.append(el('button', { class: 'btn sec mini', onclick: () => { fe.push({}); pintar(); } }, '+ Festivo'), el('button', { class: 'btn', onclick: () => guardarCfg('festivos', fe.filter(f => f.fecha).sort((a, b) => a.fecha < b.fecha ? -1 : 1)) }, 'Guardar festivos'));
  };
  P.temporales = async (c, adm) => {
    const r = await J.api('desbloqueos.listar');
    c.append(el('p', { class: 'ayuda' }, 'Permiso temporal para modificar un registro ya firmado o para registrar en un módulo que el rol no tiene. Vence solo en la fecha y hora indicadas y queda en la auditoría con el motivo.'));
    const d = { modulo: 'bitacora' };
    if (adm) c.append(el('div', { class: 'form' }, J.campo('Usuario', J.sel([''].concat(J.st.usuarios.map(u => u.usuario)), '', v => d.usuario = v)), J.campo('Módulo', J.sel(MODS.map(x => ({ v: x[0], t: x[1] })), d.modulo, v => d.modulo = v)),
      J.campo('Registro específico (opcional)', J.inp('text', '', v => d.registroId = v), 'Código interno del registro (aparece en la auditoría). Vacío = todo el módulo con permiso de registrar.'),
      J.campo('Vence', J.inp('datetime-local', '', v => d.hasta = v.length === 16 ? v + ':00' : v)), J.campo('Motivo', J.inp('text', '', v => d.motivo = v)),
      el('button', { class: 'btn', onclick: async () => { try { await J.api('desbloqueos.crear', d); J.ir('#/admin/temporales'); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Dar permiso temporal')));
    c.append(J.tabla([{ t: 'Usuario', k: 'usuario' }, { t: 'Módulo', k: 'modulo' }, { t: 'Registro', k: 'registroId' }, { t: 'Vence', f: x => x.hasta.replace('T', ' ').slice(0, 16) }, { t: 'Motivo', k: 'motivo' }, { t: 'Otorgó', k: 'otorgadoPor' },
      { t: 'Activo', f: x => String(x.activo) === 'true' && adm ? el('button', { class: 'btn mini sec', onclick: async () => { await J.api('desbloqueos.revocar', { id: x.id }); J.ir('#/admin/temporales'); } }, 'Revocar') : String(x.activo) === 'true' ? 'Sí' : 'No' }], r.desbloqueos));
  };
  P.delegaciones = async (c) => {
    const l = J.st.config.delegaciones || [], puede = ['Residente', 'Administrador'].includes(J.st.yo.rol);
    c.append(el('p', { class: 'ayuda' }, 'La Ing. Residente puede delegar su aprobación en el Backup de la Residente por un periodo. Mientras esté vigente, el Backup firma con los permisos de la Residente y su firma dice "por delegación".'));
    const d = {};
    if (puede) c.append(el('div', { class: 'form' }, J.campo('Delegar en', J.sel([''].concat(J.st.usuarios.filter(u => u.rol === 'Backup Residente').map(u => u.usuario)), '', v => d.a = v)), J.campo('Desde', J.inp('date', J.hoy(), v => d.desde = v)),
      J.campo('Hasta', J.inp('date', '', v => d.hasta = v)), J.campo('Motivo', J.inp('text', '', v => d.motivo = v)),
      el('button', { class: 'btn', onclick: async () => { try { const r = await J.api('delegar', d); J.st.config.delegaciones = r.delegaciones; J.ir('#/admin/delegaciones'); } catch (e) { J.aviso(e.message, 'rojo'); } } }, 'Delegar')));
    c.append(J.tabla([{ t: 'De', k: 'de' }, { t: 'A', k: 'a' }, { t: 'Desde', f: x => fechaCO(x.desde) }, { t: 'Hasta', f: x => fechaCO(x.hasta) }, { t: 'Motivo', k: 'motivo' },
      { t: 'Estado', f: x => x.activo === false ? 'Revocada' : puede ? el('button', { class: 'btn mini sec', onclick: async () => { const r = await J.api('delegar', { revocar: x.id }); J.st.config.delegaciones = r.delegaciones; J.ir('#/admin/delegaciones'); } }, 'Revocar') : 'Vigente' }], l));
  };
  P.sstper = async (c) => { J.editorPeriodosSST(c); };
  P.auditoria = async (c) => {
    const r = await J.api('auditoria.listar');
    c.append(el('p', { class: 'ayuda' }, 'Todo lo que se crea, modifica, firma, anula o descarga queda registrado con usuario, fecha y hora. Nada se borra.'));
    c.append(J.tabla([{ t: 'Fecha', f: x => x.fecha.replace('T', ' ').slice(0, 19) }, { t: 'Usuario', k: 'usuario' }, { t: 'Acción', k: 'accion' }, { t: 'Módulo', k: 'modulo' }, { t: 'Registro', k: 'registro' }, { t: 'Detalle', f: x => String(x.detalle || '').slice(0, 120) }], r.auditoria));
  };
})();
