/* Esquemas SST – parte 2 (texto literal de los formatos del proyecto). */
var PRIO = ['Alta', 'Media', 'Baja'], ABCE = ['Abierto', 'Cerrado'];
var RESULTADO_OA = { tipo: 'resultado', titulo: 'RESULTADO DE LA INSPECCIÓN', formula: '% Cumplimiento = C / (C + NC) × 100',
  clasif: [[90, 'Adecuado', '#2E7D32', '90% – 100%'], [80, 'Requiere mejora', '#C9A100', '80% – 89%'], [0, 'Deficiente', '#D32F2F', '< 80%']] };
var PLAN_OA = function (n) { return { tipo: 'tabla', titulo: 'HALLAZGOS Y PLAN DE ACCIÓN', filas: n, agregar: true, numerada: true, cols: [
  { l: 'Hallazgo / condición encontrada', t: 't' }, { l: 'Prioridad', t: 'op', op: PRIO }, { l: 'Acción correctiva', t: 't' }, { l: 'Responsable', t: 't' },
  { l: 'Fecha límite', t: 'f' }, { l: 'Fecha de cierre', t: 'f' }, { l: 'Estado', t: 'op', op: ABCE }] }; };
var CRIT_OA = { tipo: 'leyenda', titulo: 'CRITERIOS DE CALIFICACIÓN', filas: [['C', 'Cumple'], ['NC', 'No cumple'], ['NA', 'No aplica']] };

ESQ.insp_orden_obra = {
  codigo: 'SG-SST – FO - 27', titulo: 'INSPECCIÓN ORDEN Y ASEO AREA OBRA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Semanal',
  secciones: [
    { tipo: 'campos', campos: [{ l: 'CONTRATISTA / OBRA', t: 'obra' }, { l: 'ÁREA / FRENTE DE TRABAJO', t: 'frente' }, { l: 'FECHA', t: 'f' }, { l: 'HORA', t: 'h' },
      { l: 'INSPECCIONÓ', t: 'usuario' }, { l: 'CARGO', t: 't' }] },
    CRIT_OA,
    { tipo: 'lista', cab: 'ASPECTO A VERIFICAR', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['El área de trabajo se encuentra limpia y organizada', 'Los pisos y superficies de trabajo están libres de obstáculos',
      'Los pasillos y zonas de circulación están despejados', 'Las rutas de evacuación permanecen libres', 'Las salidas de emergencia están despejadas y señalizadas',
      'Los materiales están organizados y almacenados de forma segura', 'Los materiales no presentan riesgo de caída o volcamiento', 'Las estibas se encuentran en buenas condiciones',
      'Los materiales se encuentran correctamente apilados', 'No existen materiales innecesarios acumulados en el frente de trabajo', 'Las herramientas se encuentran organizadas',
      'Las herramientas son almacenadas después de su utilización', 'No existen herramientas tiradas en zonas de circulación', 'Los cables y extensiones eléctricas están organizados',
      'No existen cables atravesando zonas de circulación sin protección', 'Los residuos son retirados oportunamente', 'Los residuos se encuentran separados según corresponda',
      'Los recipientes para residuos están disponibles y en buen estado', 'No se evidencia acumulación de residuos de construcción',
      'Los residuos peligrosos se encuentran identificados y almacenados adecuadamente', 'No existen derrames de aceites, combustibles o sustancias químicas',
      'Las áreas de almacenamiento están delimitadas y señalizadas', 'Las zonas de cargue y descargue se encuentran organizadas',
      'Los equipos y maquinaria están ubicados en lugares seguros cuando no están en uso', 'Los elementos de protección personal están organizados y almacenados adecuadamente',
      'Los extintores permanecen visibles y libres de obstáculos', 'Los botiquines permanecen accesibles y señalizados', 'Los tableros eléctricos están libres de materiales y obstáculos',
      'Las escaleras se encuentran libres de objetos y materiales', 'Los andamios y plataformas no presentan acumulación innecesaria de materiales',
      'Las excavaciones y áreas de riesgo se encuentran delimitadas y señalizadas', 'Los materiales cortantes o punzantes se encuentran controlados',
      'No existen clavos, puntillas, alambres u otros elementos peligrosos en zonas de paso', 'Las áreas de trabajo cuentan con iluminación adecuada',
      'Los baños y áreas de servicios se encuentran limpios', 'El campamento se encuentra organizado y limpio', 'Las áreas de alimentación se encuentran limpias y ordenadas',
      'Se evidencia cumplimiento de las normas de orden y aseo por parte de los trabajadores'] },
    RESULTADO_OA, PLAN_OA(4)] };

ESQ.insp_orden_admin = {
  codigo: 'SG-SST – FO -16', titulo: 'INSPECCIÓN ORDEN Y ASEO AREA ADMINISTRTIVA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Semanal',
  secciones: [
    { tipo: 'campos', campos: [{ l: 'AREA / OFICINA', t: 't' }, { l: 'FECHA', t: 'f' }, { l: 'HORA', t: 'h' }, { l: 'INSPECCIONÓ', t: 'usuario' }, { l: 'CARGO', t: 't' }] },
    CRIT_OA,
    { tipo: 'lista', cab: 'ASPECTO A VERIFICAR', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['El área de trabajo se encuentra limpia y organizada', 'Los escritorios se encuentran organizados',
      'No existen documentos o elementos innecesarios acumulados', 'Los documentos se encuentran archivados adecuadamente', 'Los archivadores se encuentran organizados',
      'Los cajones permanecen cerrados cuando no están en uso', 'Los pasillos se encuentran libres de obstáculos', 'Las rutas de evacuación están despejadas',
      'Las salidas de emergencia están libres y señalizadas', 'Los pisos se encuentran limpios y secos', 'No existen cables atravesando zonas de circulación',
      'Los cables de computadores y equipos están organizados', 'Las conexiones eléctricas se encuentran en buenas condiciones', 'No existen sobrecargas en tomacorrientes o extensiones',
      'Los equipos de cómputo se encuentran organizados', 'Las impresoras y equipos comunes están ubicados adecuadamente', 'Las zonas de circulación permanecen despejadas',
      'Las escaleras se encuentran libres de objetos', 'Los elementos almacenados en estanterías están organizados', 'Los elementos pesados se encuentran ubicados en niveles inferiores',
      'Las estanterías se encuentran estables y en buen estado', 'No existen objetos con riesgo de caída', 'Los residuos son depositados en los recipientes correspondientes',
      'Los recipientes de residuos se encuentran limpios y disponibles', 'La zona de alimentación/cocineta se encuentra limpia', 'Los baños se encuentran limpios y en condiciones adecuadas',
      'Los elementos de limpieza están organizados', 'El botiquín se encuentra accesible y señalizado', 'Los extintores están visibles y libres de obstáculos',
      'Las señalizaciones de seguridad son visibles', 'La iluminación es adecuada', 'La ventilación es adecuada', 'No existen derrames o humedad en pisos',
      'No existen elementos innecesarios debajo de escritorios', 'Las áreas comunes permanecen limpias y organizadas', 'El personal mantiene hábitos adecuados de orden y aseo'] },
    RESULTADO_OA, PLAN_OA(5)] };

var INFO_GEN = function (extra) {
  return { tipo: 'campos', titulo: '1. INFORMACIÓN GENERAL', campos: [{ l: 'Obra / Proyecto / Área', t: 'obra' }].concat(extra) };
};
var TIPO_PPS = { l: 'Tipo de inspección', t: 'op', op: ['Planeada', 'Periódica', 'Seguimiento'] };

ESQ.insp_equipos_emergencia = {
  codigo: 'SG-SST – FO – 20', titulo: 'INSPECCIÓN A EQUIPOS DE EMERGENCIA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Mensual',
  secciones: [
    INFO_GEN([{ l: 'Ubicación', t: 'frente' }, { l: 'Fecha de inspección', t: 'f' }, { l: 'Inspector', t: 'usuario' }, { l: 'Cargo', t: 't' }, TIPO_PPS]),
    { tipo: 'nota', texto: 'C = Cumple / NC = No cumple / NA = No aplica' },
    { tipo: 'lista', titulo: '2. ESTADO GENERAL DE LOS EQUIPOS', cab: 'EQUIPO / ELEMENTO', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['Extintores', 'Botiquín de primeros auxilios', 'Camilla',
      'Inmovilizadores / elementos de inmovilización', 'Alarma o sistema de alerta', 'Luces de emergencia', 'Señalización de emergencia', 'Señalización de rutas de evacuación',
      'Señalización de punto de encuentro', 'Kit para atención de derrames, cuando aplique', 'Linternas', 'Megáfono / sistema de comunicación', 'Equipos de comunicación para brigada',
      'Elementos de protección para brigadistas', 'Otros equipos definidos en el plan de emergencias'] },
    { tipo: 'lista', titulo: '3. ALARMA Y SISTEMA DE ALERTA', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['El sistema de alarma se encuentra disponible.', 'La alarma es fácilmente identificable.',
      'Se ha verificado su funcionamiento.', 'Los trabajadores conocen el significado de la alarma.', 'El sistema cuenta con fuente de alimentación disponible, cuando aplique.',
      'Existe un mecanismo alterno de comunicación en caso de falla.'] },
    { tipo: 'lista', titulo: '6. SEÑALIZACIÓN Y EVACUACIÓN', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['Las rutas de evacuación se encuentran señalizadas.', 'Las señales son visibles y legibles.',
      'Las rutas de evacuación se encuentran libres de obstáculos.', 'Las salidas de emergencia se encuentran identificadas.', 'Las puertas o salidas de emergencia pueden utilizarse sin dificultad.',
      'El punto de encuentro se encuentra identificado.', 'La señalización corresponde a la distribución actual del área u obra.',
      'Los cambios en la distribución de la obra han sido considerados en la señalización.'] },
    { tipo: 'lista', titulo: '7. ILUMINACIÓN DE EMERGENCIA', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['Las luces de emergencia están instaladas en los puntos definidos.',
      'Las luminarias se encuentran en buen estado.', 'Se ha verificado su funcionamiento.', 'La iluminación permite identificar rutas y salidas cuando sea necesario.',
      'Las baterías o fuentes de respaldo se encuentran operativas, cuando aplique.'] }] };

ESQ.insp_extintores = {
  codigo: 'SG-SST – FO - 21', titulo: 'INSPECCIÓN EXTINTORES', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Mensual',
  secciones: [
    INFO_GEN([{ l: 'Ubicación específica', t: 'frente' }, { l: 'Fecha de inspección', t: 'f' }, { l: 'Inspector', t: 'usuario' }, { l: 'Cargo', t: 't' }, TIPO_PPS]),
    { tipo: 'tabla', titulo: '2. IDENTIFICACIÓN DEL EXTINTOR', filas: 13, agregar: true, numerada: true, cols: [{ l: 'UBICACIÓN', t: 't' }, { l: 'CÓDIGO / ID', t: 't' }, { l: 'TIPO DE EXTINTOR', t: 't' },
      { l: 'CAPACIDAD', t: 't' }, { l: 'AGENTE EXTINTOR', t: 't' }, { l: 'FECHA ÚLTIMO MANTENIMIENTO', t: 'f' }] },
    { tipo: 'nota', texto: '3. LISTA DE VERIFICACIÓN — Marque: C = Cumple / NC = No cumple / NA = No aplica.' },
    { tipo: 'lista', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['El extintor se encuentra ubicado en el lugar definido por la empresa.', 'El extintor se encuentra visible y fácilmente identificable.',
      'El acceso al extintor se encuentra libre de obstáculos.', 'Cuenta con señalización visible que permita identificar su ubicación.', 'El soporte, gabinete o sistema de fijación se encuentra en buen estado.',
      'El extintor se encuentra correctamente asegurado.', 'El cilindro no presenta golpes, abolladuras o deformaciones.', 'No presenta corrosión significativa.',
      'No presenta fugas o evidencia de pérdida del agente extintor.', 'La manguera se encuentra en buen estado.', 'La boquilla o difusor se encuentra en buen estado y libre de obstrucciones.',
      'El pasador de seguridad se encuentra instalado.', 'El sello de seguridad se encuentra íntegro.', 'El manómetro, cuando aplique, se encuentra en condición normal de operación.',
      'No se observan daños en la válvula o mecanismo de accionamiento.', 'La etiqueta del extintor es legible.', 'Se identifica claramente el tipo de agente extintor.',
      'Se identifica la capacidad del extintor.', 'La fecha del último mantenimiento es identificable.', 'El extintor se encuentra dentro del periodo de mantenimiento establecido.',
      'El extintor corresponde al tipo de riesgo del área donde está ubicado.', 'El extintor se encuentra en condiciones adecuadas de limpieza.',
      'El extintor no está siendo utilizado como soporte para herramientas, materiales u otros objetos.',
      'El área alrededor del extintor permanece libre de materiales combustibles o elementos que dificulten su utilización.', 'El extintor se encuentra disponible para uso inmediato en caso de emergencia.'] },
    { tipo: 'tabla', titulo: '4. ESTADO DEL EXTINTOR', cols: [{ l: 'CONDICIÓN', t: 'etq' }, { l: 'CANTIDAD', t: 'n' }], etiquetas: ['Extintores en buen estado', 'Extintores que requieren mantenimiento',
      'Extintores descargados o con presión inadecuada', 'Extintores con daños físicos', 'Extintores con acceso obstruido', 'Extintores sin señalización', 'Extintores fuera de vigencia de mantenimiento',
      'Total de extintores inspeccionados'] }] };

var EPCC_INS = ['Cumple', 'No cumple', 'N/A'];
ESQ.insp_eppcc = {
  codigo: 'SG-SST – FO – 19', titulo: 'INSPECCIÓN A ELEMENTOS DE PROTECCIÓN CONTRA CAIDAS', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Según necesidad (preuso)',
  secciones: [
    { tipo: 'campos', titulo: '. INFORMACIÓN GENERAL', campos: [{ l: 'Proyecto / Obra', t: 'obra' }, { l: 'Ubicación', t: 't' }, { l: 'Área / Frente de trabajo', t: 'frente' },
      { l: 'Fecha de inspección', t: 'f' }, { l: 'Hora', t: 'h' }, { l: 'Inspector', t: 'usuario' }, { l: 'Cargo', t: 't' }, { l: 'Responsable del equipo', t: 'trab' },
      { l: 'Tipo de inspección', t: 'op', op: ['Inicial', 'Periódica', 'Preuso', 'Extraordinaria'] }, { l: 'Condiciones climáticas', t: 'op', op: ['Normal', 'Lluvia', 'Viento'], otro: 'Otra' }] },
    { tipo: 'tabla', titulo: '2. IDENTIFICACIÓN DEL ELEMENTO', numerada: true, cols: [{ l: 'Elemento EPCC', t: 'chk' }, { l: 'Marca', t: 't' }, { l: 'Referencia', t: 't' }, { l: 'Serial / Código', t: 't' },
      { l: 'Fecha de fabricación', t: 'f' }, { l: 'Fecha de ingreso', t: 'f' }, { l: 'Estado', t: 't' }], etiquetas: ['Arnés cuerpo completo', 'Eslinga con absorbedor', 'Eslinga de posicionamiento',
      'Línea de vida vertical', 'Línea de vida horizontal', 'Conector / mosquetón', 'Dispositivo anticaídas', 'Punto de anclaje', 'Cuerda / sistema de conexión', 'Otro: __________'] },
    { tipo: 'nota', texto: '3. LISTA DE VERIFICACIÓN — Convenciones: C: Cumple | NC: No cumple | NA: No aplica' },
    { tipo: 'lista', cab: 'Aspecto a verificar', cols: CNCNA, obs: 'Observaciones', n0: 1, items: ['El elemento se encuentra identificado y puede trazarse su registro',
      'Cuenta con información o marcación del fabricante legible', 'El elemento se encuentra limpio y en condiciones adecuadas de uso', 'No presenta cortes, quemaduras, deshilachados o abrasiones',
      'Las cintas o bandas no presentan deterioro estructural', 'Las costuras se encuentran completas y sin desprendimientos', 'Las hebillas funcionan correctamente', 'Los ajustadores funcionan correctamente',
      'Los anillos en D no presentan deformaciones, fisuras o corrosión', 'Los mosquetones y conectores cierran y bloquean correctamente', 'Los ganchos de seguridad funcionan correctamente',
      'No existen elementos deformados, fracturados o modificados', 'Los componentes metálicos no presentan corrosión que comprometa su integridad', 'La eslinga se encuentra en buenas condiciones',
      'El absorbedor de energía no presenta señales de activación', 'La línea de vida no presenta deterioro, cortes o contaminación', 'El sistema anticaídas funciona correctamente',
      'El punto de anclaje se encuentra instalado y asegurado correctamente', 'El sistema es compatible entre sus diferentes componentes', 'El equipo corresponde al trabajo y sistema de protección definido',
      'El elemento no ha sufrido una caída o evento que pueda comprometer su integridad', 'Se dispone de registro de inspecciones anteriores cuando aplica', 'El equipo ha sido almacenado adecuadamente',
      'Se encuentra dentro de la vida útil establecida por el fabricante, cuando aplique', 'El equipo se encuentra apto para continuar en servicio'] },
    { tipo: 'lista', titulo: '4. INSPECCIÓN ESPECÍFICA DEL ARNÉS', cab: 'Elemento a revisar', cols: EPCC_INS, critico: 'No cumple', obs: 'Observaciones', items: ['Cintas sin cortes o desgaste', 'Costuras completas',
      'Hebillas en buen estado', 'Anillos de conexión en buen estado', 'Punto dorsal de conexión en buen estado', 'Punto frontal de conexión, cuando aplique', 'Etiquetas y marcación legibles',
      'Sin contaminación por sustancias químicas', 'Sin evidencia de caída previa', 'Ajuste y funcionamiento adecuados'] },
    { tipo: 'lista', titulo: '5. INSPECCIÓN DE ESLINGAS Y CONECTORES', cab: 'Elemento a revisar', cols: EPCC_INS, critico: 'No cumple', obs: 'Observaciones', items: ['Cinta/cuerda en buen estado',
      'Sin cortes o deshilachados', 'Costuras en buen estado', 'Ganchos sin deformaciones', 'Mosquetones funcionan correctamente', 'Sistema de bloqueo funcional', 'Absorbedor sin activación',
      'Sin corrosión significativa', 'Etiquetas legibles', 'Sin modificaciones no autorizadas'] },
    { tipo: 'lista', titulo: '6. INSPECCIÓN DE LÍNEAS DE VIDA Y SISTEMAS DE ANCLAJE', cab: 'Aspecto', cols: EPCC_INS, critico: 'No cumple', obs: 'Observaciones', items: ['Línea de vida correctamente instalada',
      'Sistema compatible con el trabajo', 'Anclajes correctamente instalados', 'Anclajes sin deformaciones o daños visibles', 'Elementos de fijación completos', 'Línea sin cortes, desgaste o deterioro',
      'Sistema protegido contra bordes cortantes', 'No presenta modificaciones no autorizadas', 'Cuenta con documentación técnica cuando aplique', 'Cumple las condiciones definidas para su uso'] },
    { tipo: 'campos', titulo: '7. RESULTADO DE LA INSPECCIÓN', campos: [{ l: 'Estado general del EPCC', t: 'op', op: ['APTO PARA USO', 'APTO CON OBSERVACIONES', 'NO APTO – RETIRAR DE SERVICIO'] }] },
    { tipo: 'checks', titulo: 'Condición encontrada', op: ['Sin novedades', 'Requiere limpieza', 'Requiere mantenimiento autorizado', 'Requiere seguimiento', 'Requiere retiro inmediato', 'Requiere reposición', 'Otro'] },
    { tipo: 'tabla', titulo: '8. ACCIONES CORRECTIVAS', filas: 3, agregar: true, numerada: true, cols: [{ l: 'Hallazgo', t: 't' }, { l: 'Acción requerida', t: 't' }, { l: 'Responsable', t: 't' },
      { l: 'Fecha límite', t: 'f' }, { l: 'Fecha de cierre', t: 'f' }, { l: 'Verificación', t: 't' }] },
    { tipo: 'texto', titulo: '9. CRITERIOS PARA RETIRO INMEDIATO DEL SERVICIO', texto: 'El elemento deberá ser retirado inmediatamente de servicio cuando se identifique, entre otras situaciones:',
      vinetas: ['Cortes, roturas, quemaduras o deterioro significativo.', 'Deshilachado o daño estructural de cintas o cuerdas.', 'Costuras deterioradas o desprendidas.',
        'Deformación, fisuras o daño de componentes metálicos.', 'Corrosión que pueda comprometer la resistencia del elemento.', 'Fallas en mosquetones, ganchos, hebillas o sistemas de bloqueo.',
        'Evidencia de activación del absorbedor de energía.', 'Evidencia de haber estado involucrado en una caída, cuando el fabricante o procedimiento aplicable determine su retiro.',
        'Modificaciones, reparaciones o alteraciones no autorizadas.', 'Pérdida de identificación o imposibilidad de verificar las condiciones de seguridad requeridas.',
        'Vencimiento o superación de la vida útil establecida por el fabricante, cuando aplique.'] },
    { tipo: 'nota', texto: 'Nota: Un elemento retirado de servicio deberá identificarse claramente como “NO USAR” y mantenerse separado para evitar su utilización accidental, mientras se determina su disposición final conforme al procedimiento de la empresa y las instrucciones del fabricante.' }] };

ESQ.insp_botiquines = {
  codigo: 'SG-SST – FO -11', titulo: 'INSPECCIÓN BOTIQUINES', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: '2 veces al mes',
  secciones: [
    INFO_GEN([{ l: 'Ubicación del botiquín', t: 'frente' }, { l: 'Fecha de inspección', t: 'f' }, { l: 'Inspector', t: 'usuario' }, { l: 'Cargo', t: 't' }, { l: 'Responsable del botiquín', t: 'trab' }, TIPO_PPS]),
    { tipo: 'nota', texto: 'C = Cumple / NC = No cumple / NA = No aplica' },
    { tipo: 'lista', titulo: '2. CONDICIONES GENERALES DEL BOTIQUÍN', cols: CNCNA, obs: 'OBSERVACIONES', n0: 1, items: ['El botiquín se encuentra ubicado en un lugar conocido por los trabajadores.',
      'El acceso al botiquín se encuentra libre de obstáculos.', 'El botiquín cuenta con identificación o señalización visible.', 'El botiquín se encuentra limpio y organizado.',
      'El recipiente, gabinete o maletín se encuentra en buen estado.', 'El botiquín permanece protegido contra humedad, polvo y contaminación.',
      'Los elementos se encuentran organizados y son fácilmente identificables.', 'Se cuenta con inventario actualizado de los elementos.', 'Se registra la reposición de elementos utilizados.',
      'Los elementos disponibles se encuentran dentro de su fecha de vencimiento, cuando esta aplique.', 'No se encuentran medicamentos no autorizados dentro del botiquín.',
      'Los elementos utilizados o deteriorados han sido reemplazados.', 'El contenido corresponde a las necesidades y riesgos identificados en la empresa.',
      'En obra, el botiquín puede trasladarse o disponerse de manera adecuada para atender emergencias en los frentes de trabajo.'] },
    { tipo: 'tabla', titulo: '3. INVENTARIO DEL BOTIQUÍN', numerada: true, cols: [{ l: 'ELEMENTO', t: 'etq' }, { l: 'CANTIDAD REQUERIDA', t: 'n' }, { l: 'CANTIDAD ENCONTRADA', t: 'n' },
      { l: 'ESTADO', t: 'op', op: ['B', 'M'] }, { l: 'VENCIMIENTO', t: 'f' }, { l: 'REQUIERE REPOSICIÓN', t: 'op', op: ['Sí', 'No'] }], etiquetas: ['Gasas estériles', 'Apósitos estériles',
      'Venda elástica', 'Venda de gasa', 'Esparadrapo / cinta médica', 'Curitas / apósitos adhesivos', 'Guantes desechables', 'Tapabocas', 'Solución salina / suero fisiológico',
      'Antiséptico autorizado', 'Tijeras de primeros auxilios', 'Pinzas', 'Termómetro', 'Linterna', 'Bolsas para disposición de residuos', 'Elementos para control de hemorragias',
      'Compresas frías instantáneas', 'Otros elementos definidos por la empresa'] },
    { tipo: 'lista', titulo: '4. ELEMENTOS CRÍTICOS PARA OBRA', cab: 'ASPECTO', cols: CNCNA, obs: 'OBSERVACIONES', items: ['El botiquín está disponible en el frente de trabajo o punto definido.',
      'Existe un mecanismo para su traslado al lugar del evento cuando sea necesario.', 'Los trabajadores conocen la ubicación del botiquín.',
      'Se cuenta con personal capacitado en primeros auxilios según lo definido en el plan de emergencias.', 'El botiquín se encuentra protegido de materiales, herramientas y equipos de obra.',
      'El contenido está protegido contra polvo, humedad y contaminación propia de la actividad.',
      'Se cuenta con elementos adecuados para atención inicial de heridas y lesiones frecuentes identificadas en la obra.'] }] };
