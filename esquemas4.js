/* Esquemas SST – parte 4 (texto literal de los formatos del proyecto) y cierre. */
var BDN = ['Bueno', 'Deficiente', 'N/A'];
ESQ.insp_equipos_maquinaria = {
  codigo: 'CÓDIGO: SST- DOC- 13', titulo: 'INSPECCIÓN EQUIPO Y MAQUINARIA OBRA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Semanal',
  secciones: [
    { tipo: 'campos', titulo: '1. NFORMACIÓN GENERAL', campos: [{ l: 'Proyecto / Obra', t: 'obra' }, { l: 'Contrato', t: 't' }, { l: 'Ubicación', t: 't' }, { l: 'Frente de trabajo', t: 'frente' },
      { l: 'Fecha de inspección', t: 'f' }, { l: 'Hora', t: 'h' }, { l: 'Responsable de la inspección', t: 'usuario' }, { l: 'Cargo', t: 't' }, { l: 'Operador', t: 'trab' },
      { l: 'Cargo del operador', t: 't' }, { l: 'Equipo / maquinaria inspeccionada', t: 'equipo' }, { l: 'Marca', t: 't' }, { l: 'Modelo', t: 't' }, { l: 'Número de serie / inventario', t: 't' },
      { l: 'Horómetro / kilometraje', t: 't' }, { l: 'Fecha de último mantenimiento', t: 'f' }] },
    { tipo: 'tabla', titulo: '2. IDENTIFICACIÓN DEL EQUIPO O MAQUINARIA', filas: 6, agregar: true, numerada: true, cols: [{ l: 'Equipo / maquinaria', t: 't' }, { l: 'Marca', t: 't' }, { l: 'Modelo', t: 't' },
      { l: 'Serie / Inventario', t: 't' }, { l: 'Capacidad', t: 't' }, { l: 'Estado', t: 'op', op: ['Operativo', 'Fuera de servicio'] }] },
    { tipo: 'nota', texto: '3. LISTA DE VERIFICACIÓN GENERAL — C = Cumple | NC = No cumple | NA = No aplica' },
    { tipo: 'lista', cab: 'Aspecto a verificar', cols: CNCNA, obs: 'Observaciones', n0: 1, items: ['El equipo se encuentra identificado y cuenta con placa, código o identificación correspondiente.',
      'El equipo se encuentra en condiciones generales adecuadas para su operación.', 'La estructura del equipo no presenta fisuras, deformaciones o daños visibles.',
      'Los elementos de protección y guardas se encuentran instalados y en buen estado.', 'Los puntos de acceso y descenso se encuentran en condiciones seguras.',
      'Escaleras, peldaños, plataformas y pasamanos se encuentran en buen estado.', 'El área del operador se encuentra limpia y libre de obstáculos.',
      'El asiento del operador se encuentra en condiciones adecuadas.', 'El cinturón de seguridad se encuentra disponible y en buen estado, cuando aplique.',
      'Los controles y mandos funcionan correctamente.', 'El sistema de encendido y apagado funciona correctamente.', 'No se evidencian fugas de aceite, combustible, refrigerante o fluidos hidráulicos.',
      'Las mangueras y conexiones hidráulicas se encuentran en buen estado.', 'Los componentes mecánicos visibles se encuentran en condiciones adecuadas.',
      'Las correas, poleas y elementos móviles cuentan con las protecciones correspondientes.', 'Las llantas, orugas o elementos de desplazamiento se encuentran en buen estado.',
      'El sistema de dirección funciona correctamente, cuando aplique.', 'El sistema de frenos funciona correctamente, cuando aplique.', 'El equipo cuenta con sistema de alarma o señalización cuando corresponde.',
      'Las luces de trabajo y señalización funcionan correctamente, cuando aplique.', 'La alarma de reversa funciona correctamente, cuando aplique.',
      'El equipo cuenta con espejos o sistemas de visibilidad requeridos.', 'El equipo no presenta ruidos, vibraciones o comportamientos anormales.',
      'Los accesorios o implementos se encuentran correctamente instalados.', 'La capacidad de carga o trabajo se encuentra identificada cuando aplica.',
      'El equipo es utilizado de acuerdo con las especificaciones del fabricante.', 'El equipo cuenta con manual o instrucciones de operación disponibles.',
      'Se cuenta con registros de mantenimiento preventivo y/o correctivo.', 'El mantenimiento requerido se encuentra actualizado.', 'El operador se encuentra autorizado y/o capacitado para operar el equipo.'] },
    { tipo: 'lista', titulo: '4. SISTEMA MECÁNICO', cab: 'Elemento', cols: BDN, critico: 'Deficiente', obs: 'Observaciones', items: ['Motor', 'Correas', 'Poleas', 'Rodamientos', 'Transmisión', 'Sistema de refrigeración',
      'Sistema de lubricación', 'Sistema de escape', 'Elementos móviles'] },
    { tipo: 'nota', titulo: '5. SISTEMA HIDRÁULICO', texto: 'Aplicable a equipos que cuenten con sistema hidráulico.' },
    { tipo: 'lista', cab: 'Elemento', cols: BDN, critico: 'Deficiente', obs: 'Observaciones', items: ['Mangueras hidráulicas', 'Conexiones', 'Cilindros hidráulicos', 'Depósito', 'Bomba hidráulica', 'Ausencia de fugas', 'Accesorios hidráulicos'] },
    { tipo: 'lista', titulo: '6. SISTEMAS DE SEGURIDAD', cab: 'Elemento', cols: CNC3, critico: 'No cumple', obs: 'Observaciones', items: ['Cinturón de seguridad', 'Guardas de seguridad', 'Alarma de reversa',
      'Luces de advertencia', 'Bocina', 'Espejos / cámara de reversa', 'Parada de emergencia', 'Extintor, cuando aplique', 'Señalización de capacidad', 'Manual / instrucciones de operación'] },
    { tipo: 'lista', titulo: '7 CONDICIONES DEL OPERADOR', cab: 'Aspecto', cols: CNC3, critico: 'No cumple', obs: 'Observaciones', items: ['Operador autorizado para manejar el equipo', 'Capacitación / entrenamiento vigente',
      'Conoce los controles del equipo', 'Conoce los riesgos asociados a la operación', 'Utiliza los EPP requeridos', 'Realiza inspección preoperacional'] }] };

function _escalera(clave, codigo, titulo, tituloEsp, notaEsp, itemsEsp) {
  ESQ[clave] = {
    codigo: codigo, titulo: titulo, version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Semanal',
    secciones: [
      { tipo: 'campos', titulo: '1. INFORMACIÓN GENERAL', campos: [{ l: 'Proyecto / Obra', t: 'obra' }, { l: 'Ubicación', t: 't' }, { l: 'Área / Frente de trabajo', t: 'frente' },
        { l: 'Fecha de inspección', t: 'f' }, { l: 'Inspector SST', t: 'usuario' }, { l: 'Responsable del área', t: 't' },
        { l: 'Tipo de escalera', t: 'op', op: ['Simple', 'Tijera', 'Extensible', 'Multipropósito', 'Otra'] }, { l: 'Material', t: 'op', op: ['Aluminio', 'Fibra de vidrio', 'Madera', 'Otro'] },
        { l: 'Altura aproximada', t: 't' }, { l: 'Capacidad de carga', t: 't' }, { l: 'Estado general', t: 'op', op: ['Bueno', 'Regular', 'Malo'] }] },
      _sec('2. INSPECCIÓN GENERAL DE LA ESCALERA', ['La escalera se encuentra limpia y libre de grasa, aceite, pintura u otras sustancias.', 'La estructura general no presenta deformaciones.',
        'No presenta grietas, fisuras, roturas o partes quebradas.', 'No presenta corrosión o deterioro que comprometa su resistencia.', 'Los largueros se encuentran en buen estado.',
        'Los peldaños se encuentran completos y firmemente instalados.', 'Los peldaños no presentan desgaste excesivo o superficies peligrosamente lisas.',
        'No existen reparaciones improvisadas o modificaciones no autorizadas.', 'La escalera conserva sus características originales de fabricación.',
        'La capacidad de carga es adecuada para el uso previsto.'], 1),
      _sec('3. BASE Y APOYO', ['Las bases o zapatas se encuentran completas.', 'Los apoyos antideslizantes están en buen estado.', 'La escalera se mantiene estable durante su utilización.',
        'Los elementos de apoyo no presentan desgaste excesivo.', 'La superficie donde se instalará la escalera es firme y estable.', 'No se requiere utilizar objetos improvisados para nivelar la escalera.'], 1),
      _sec('4. PELDAÑOS Y LARGUEROS', ['Todos los peldaños están presentes.', 'Los peldaños están firmemente sujetos.', 'Los peldaños no presentan movimiento excesivo.',
        'Los peldaños tienen superficie adecuada para evitar deslizamientos.', 'Los largueros están alineados y sin deformaciones.', 'No existen bordes cortantes o elementos sobresalientes.'], 1),
      _sec('5. CONDICIONES DE SEGURIDAD PARA EL USO', ['La escalera es adecuada para la tarea que se va a realizar.', 'Se encuentra ubicada sobre una superficie firme, nivelada y estable.',
        'Se mantiene libre de obstáculos durante su utilización.', 'Se encuentra alejada de líneas eléctricas o fuentes de energía, o se han implementado los controles correspondientes.',
        'El área se encuentra señalizada o delimitada cuando existe riesgo para terceros.', 'No se utiliza sobre cajas, bloques, andamios improvisados u otros elementos para aumentar su altura.',
        'No se excede la capacidad de carga de la escalera.', 'El trabajador conoce las condiciones seguras de utilización.', 'Se utilizan los elementos de protección personal requeridos para la actividad.',
        'Cuando existe riesgo de caída a diferente nivel, se han implementado las medidas de prevención y protección correspondientes.'], 1),
      _sec('6. CONDICIONES DE ALMACENAMIENTO', ['La escalera se almacena en un lugar seco y protegido.', 'Se encuentra protegida contra golpes o daños.', 'No se almacenan materiales pesados sobre la escalera.',
        'El almacenamiento evita deformaciones de la estructura.', 'Las escaleras se encuentran organizadas y señalizadas cuando sea necesario.'], 1),
      { tipo: 'nota', titulo: tituloEsp, texto: notaEsp },
      _sec('', itemsEsp, 1)] };
}
_escalera('insp_escalera_tijera', 'SG-SST – FO -42', 'INSPECCIÓN A ESCALERAS DE TIJERAS', 'INSPECCIÓN DE ESCALERAS DE TIJERA', 'Marcar NA cuando la escalera no corresponda a este tipo.',
  ['Las bisagras se encuentran en buen estado.', 'El sistema de apertura y cierre funciona correctamente.', 'Los dispositivos de bloqueo funcionan correctamente.', 'Los elementos de separación están firmes.',
    'La escalera abre completamente y permanece estable.', 'No presenta holguras excesivas en sus uniones.', 'No se utiliza cerrada cuando está diseñada para utilizarse abierta.']);
_escalera('insp_escalera_extensible', 'SG-SST – FO -41', 'INSPECCIÓN A ESCALERAS EXTENSIBLE', 'INSPECCIÓN DE ESCALERAS EXTENSIBLES', 'Marcar NA cuando no corresponda.',
  ['Los tramos se encuentran en buen estado.', 'Los mecanismos de extensión funcionan correctamente.', 'Los dispositivos de bloqueo de los tramos funcionan correctamente.',
    'Las guías y elementos de desplazamiento se encuentran en buen estado.', 'No existen elementos doblados o deformados.', 'Los apoyos superiores se encuentran en buen estado cuando aplique.',
    'El sistema puede instalarse y utilizarse de manera estable.']);

/* Resolver listas compartidas y numeración */
(function () {
  var COMP = { SENAL30: SENAL30 };
  Object.keys(ESQ).forEach(function (k) {
    ESQ[k].id = k;
    ESQ[k].secciones.forEach(function (s) { if (typeof s.items === 'string') s.items = COMP[s.items]; });
  });
})();

/* Orden del menú SST (como el Plan de trabajo SST) */
var SST_ORDEN = ['entrega_epp', 'induccion', 'evaluacion_induccion', 'permiso_alturas', 'ats_alturas', 'insp_trabajo_alturas', 'insp_eppcc', 'insp_andamios', 'insp_escalera_tijera',
  'insp_escalera_extensible', 'permiso_demolicion', 'ats_demolicion', 'insp_equipos_maquinaria', 'insp_herr_electricas', 'insp_herr_manuales', 'insp_orden_obra', 'insp_locativa_obra',
  'insp_senalizacion_obra', 'insp_electricas', 'insp_extintores', 'insp_botiquines', 'insp_equipos_emergencia', 'insp_orden_admin', 'insp_locativa_admin', 'insp_senalizacion_admin', 'insp_puestos_admin'];
