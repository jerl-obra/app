/* Esquemas de los formatos SST de JERL (texto literal de los formatos del proyecto).
   Tipos de sección: campos · leyenda · nota · lista (ítems con calificación) · tabla · checks · firmas · texto.
   Tipos de campo: t texto · a texto largo · f fecha · h hora · n número · op una opción · mc varias opciones · trab trabajador · obra proyecto.
   Este archivo se usa igual en la app y en el servidor. */
var ESQ = (typeof ESQ !== 'undefined') ? ESQ : {};
var CNCNA = ['C', 'NC', 'NA'];
var LEY_C = { tipo: 'leyenda', titulo: 'CRITERIOS DE CALIFICACIÓN', cab: ['Calificación', 'Criterio'], filas: [['C', 'Cumple'], ['NC', 'No cumple'], ['NA', 'No aplica']] };

ESQ.permiso_alturas = {
  codigo: 'SG-SST – FO - 29', titulo: 'PERMISO DE TRABAJO EN ALTURAS', version: '04', fecha: '14/10/2026', grupo: 'Permisos de trabajo', periodicidad: 'Semanal con verificación diaria (solo si hay trabajo en alturas)',
  secciones: [
    { tipo: 'campos', campos: [
      { l: 'Permiso N.º', t: 'consecutivo' }, { l: 'Proyecto/obra', t: 'obra' }, { l: 'Empresa/contratista', t: 't', def: 'JERL – Javier Eduardo Rosero Londoño' },
      { l: 'Lugar exacto / frente de trabajo', t: 'frente' }, { l: 'Actividad', t: 't' }, { l: 'Altura aproximada (m)', t: 'n' }, { l: 'Tipo de trabajo', t: 't' }, { l: 'ATS/ARO N.º', t: 't' },
      { l: 'Descripción de la tarea y procedimiento seguro', t: 'a' }, { l: 'Fecha inicio', t: 'f' }, { l: 'Hora inicio', t: 'h' }, { l: 'Fecha fin prevista', t: 'f' }, { l: 'Hora fin prevista', t: 'h' }] },
    { tipo: 'tabla', titulo: '1. PERSONAL AUTORIZADO Y VERIFICACIONES', filas: 4, agregar: true, cols: [
      { l: 'Nombre y Apellido', t: 'trab' }, { l: 'Tipo y N.º Documento', t: 'doc' }, { l: 'Cargo', t: 'cargo' }, { l: 'Seguridad Social Vigente', t: 'op', op: ['Sí', 'No'] },
      { l: 'Aptitud / Capacitación y reentrenamiento', t: 'op', op: ['Sí', 'No'] }, { l: 'Firma', t: 'firma' }] },
    { tipo: 'campos', titulo: '2. EQUIPOS, SISTEMAS Y CONTROLES DE LA TAREA', campos: [
      { l: 'Sistema de acceso', t: 'mc', op: ['Andamio', 'Escalera', 'PEMP'], otro: true }, { l: 'Herramientas', t: 't' },
      { l: 'Sistema contra caídas', t: 'mc', op: ['Restricción', 'Posicionamiento', 'Detención', 'Colectivo'] }, { l: 'Detalle', t: 't' },
      { l: 'Puntos de anclaje identificados/verificados para cada trabajador', t: 'a' },
      { l: 'EPP seleccionados según riesgo', t: 'mc', op: ['Casco con barbuquejo', 'Arnés', 'Conectores', 'Calzado', 'Guantes'], otro: 'Otros' },
      { l: 'Medidas de prevención, señalización, delimitación y control de caída de objetos', t: 'a' },
      { l: 'Riesgos adicionales (eléctrico, clima, superficies, simultaneidad, etc.) y controles ATS/ARO', t: 'a' }] },
    { tipo: 'matriz', titulo: '3. LISTA DE CHEQUEO DIARIA (S = SÍ / N = NO / NA = NO APLICA)', cab: 'Verificación', cols: ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'], op: ['S', 'N', 'NA'], critico: 'N',
      items: ['ATS/ARO actualizado y divulgado; tarea y área sin cambios no controlados', 'Trabajadores autorizados, afiliación, aptitud y formación verificadas',
        'Acceso, plataformas, barandas y delimitación seguros', 'Arnés, conectores y demás EPP inspeccionados y aptos', 'Anclajes y sistemas de protección verificados para cada trabajador',
        'Distancias a líneas eléctricas y controles de energías comprobados', 'Clima, iluminación, orden y condiciones del área seguros', 'Herramientas aseguradas; control de caída de objetos',
        'Plan de rescate específico, recursos, comunicaciones y responsable disponibles'] },
    { tipo: 'nota', texto: 'Si algún control crítico es NO, no se autoriza el inicio o continuación hasta corregirlo y revalidar.' },
    { tipo: 'tabla', titulo: '4. REGISTRO DE AUTORIZACIÓN Y REVALIDACIÓN POR DÍA', etiquetas: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], cols: [
      { l: 'Día / fecha', t: 'f' }, { l: 'Inicio-fin', t: 't' }, { l: 'Coordinador alturas: firma', t: 'firma' }, { l: 'Ayudante seguridad: firma', t: 'firma' },
      { l: 'Jefe inmediato / autorizante: firma', t: 'firma' }, { l: 'Activa plan emergencia: firma', t: 'firma' }, { l: 'Estado / cierre', t: 't' }] },
    { tipo: 'nota', texto: 'La firma diaria del coordinador corresponde a la revisión y suscripción de cada evento. La firma del jefe inmediato acredita autorización solo si ha sido designado formalmente para autorizar.' },
    { tipo: 'campos', titulo: '5. RESPONSABLES, EMERGENCIA Y RESCATE', campos: [
      { l: 'Coordinador de alturas', t: 'trab' }, { l: 'Documento coordinador', t: 't' }, { l: 'Tel. coordinador', t: 't' },
      { l: 'Ayudante de seguridad (si se designa)', t: 'trab' }, { l: 'Documento ayudante', t: 't' },
      { l: 'Jefe inmediato / persona autorizante', t: 'trab' }, { l: 'Documento jefe inmediato', t: 't' },
      { l: 'Persona que activa el plan de emergencias', t: 'trab' }, { l: 'Tel. plan de emergencias', t: 't' },
      { l: 'Plan de rescate aplicable / ubicación', t: 't' }, { l: 'Equipo y personal de rescate', t: 't' },
      { l: 'Canal de comunicación', t: 't' }, { l: 'Punto de encuentro', t: 't' }, { l: 'Contacto emergencias', t: 't' }] },
    { tipo: 'texto', titulo: '6. SUSPENSIÓN, CAMBIOS Y CIERRE', texto: 'Causas de suspensión: condiciones climáticas adversas; falla de protección o anclajes; cambios de personal, turno, coordinador o tarea; emergencia; incumplimiento de controles.' },
    { tipo: 'campos', campos: [
      { l: 'Fecha/hora suspensión', t: 't' }, { l: 'Motivo', t: 't' }, { l: 'Responsable', t: 't' }, { l: 'Medidas correctivas', t: 'a' },
      { l: 'Revalidado por coordinador', t: 't' }, { l: 'Fecha/hora revalidación', t: 't' }, { l: 'Cierre final: Fecha/hora', t: 't' },
      { l: 'Cierre', t: 'mc', op: ['Trabajo concluido', 'Área segura', 'Equipos retirados'] }, { l: 'Firma responsable del cierre', t: 'firma' }, { l: 'Observaciones', t: 'a' }] },
    { tipo: 'texto', texto: 'NOTA DE USO: Formato semanal de registro; cada jornada/evento requiere comprobación y firma antes de iniciar. Cambios relevantes exigen revalidación. Adjuntar ATS/ARO, lista de trabajadores y soportes aplicables.' },
    { tipo: 'texto', texto: 'Referencia normativa: Resolución 4272 de 2021, artículos 14 y 15; Decreto 1072 de 2015. Validar con el procedimiento y programa de protección contra caídas de la empresa.' }] };

ESQ.ats_alturas = {
  codigo: 'SG-SST – FO - 37', titulo: 'ANÁLISIS DE TRABAJO SEGURO EN ALTURAS', version: '03', fecha: '16/09/2026', grupo: 'ATS', periodicidad: 'Semanal',
  secciones: [
    { tipo: 'campos', campos: [{ l: 'Proyecto', t: 'obra' }, { l: 'Lugar', t: 'frente' }, { l: 'Fecha', t: 'f' }, { l: 'Hora inicio', t: 'h' }, { l: 'Hora final', t: 'h' }] },
    { tipo: 'tabla', titulo: '1. PERSONAL', filas: 4, agregar: true, cols: [{ l: 'Nombre', t: 'trab' }, { l: 'Cargo', t: 'cargo' }, { l: 'Firma', t: 'firma' }] },
    { tipo: 'campos', titulo: '2. DESCRIPCIÓN DE LA ACTIVIDAD', campos: [{ l: 'Descripción de la actividad', t: 'a' }] },
    { tipo: 'tabla', titulo: '3. ANÁLISIS PASO A PASO', agregar: true, cols: [{ l: 'Paso de la actividad', t: 't' }, { l: 'Peligro', t: 't' }, { l: 'Riesgo / consecuencia', t: 't' }, { l: 'Medidas de control', t: 't' }],
      precarga: [['Inspección del área', 'Caída a diferente nivel', 'Lesiones graves', 'Delimitar y señalizar'], ['Instalación del sistema de acceso', 'Caída', 'Golpes/fracturas', 'Verificar estabilidad'],
        ['Instalación de sistema contra caídas', 'Caída', 'Lesiones graves/fatales', 'Arnés, conexión y anclaje'], ['Ejecución del trabajo', 'Caída de persona/objetos', 'Lesiones', 'Protección contra caídas'],
        ['Retiro de equipos', 'Caída', 'Golpes', 'Retiro controlado']] },
    { tipo: 'checks', titulo: '4. CONTROLES PREVIOS', op: ['Trabajador autorizado', 'Aptitud para trabajo en alturas', 'Capacitación/reentrenamiento vigente', 'Arnés inspeccionado', 'Eslinga inspeccionada',
      'Anclaje verificado', 'Sistema de acceso seguro', 'Área delimitada', 'Herramientas aseguradas', 'Plan de rescate disponible', 'Condiciones climáticas adecuadas'] },
    { tipo: 'checks', titulo: '5. EPP', op: ['Casco con barbuquejo', 'Arnés', 'Eslinga', 'Guantes', 'Protección visual', 'Calzado de seguridad'], otro: 'Otros' },
    { tipo: 'campos', titulo: '6. MEDIDAS DE EMERGENCIA', campos: [{ l: 'Procedimiento de rescate', t: 'a' }, { l: 'Responsable', t: 'trab' }, { l: 'Medio de comunicación', t: 't' }] },
    { tipo: 'firmas', titulo: '7. APROBACIÓN', firmas: ['Trabajador', 'Supervisor', 'SST'] },
    { tipo: 'campos', campos: [{ l: 'ATS socializado', t: 'op', op: ['Sí', 'No'] }] }] };

ESQ.entrega_epp = {
  codigo: 'SG-SST-FO-049', titulo: 'SISTEMA DE GESTION DE LA SEGURIDAD Y SALUD EN EL TRABAJO REGISTRO DE ENTREGA DE ELEMENTOS DE PROTECCIÓN PERSONAL – EPP', version: '04', fecha: '30/10/2026', pagina: '01',
  grupo: 'EPP', periodicidad: 'Cada vez que ingresa personal', apaisado: true,
  secciones: [
    { tipo: 'campos', titulo: 'DATOS DEL COLABORADOR', campos: [{ l: 'Nombre y Apellido', t: 'trab' }, { l: 'Identificación', t: 'doc' }, { l: 'Cargo', t: 'cargo' }, { l: 'N°', t: 'consecutivo' },
      { l: 'Tipo de entrega', t: 'op', op: ['Primera vez', 'Reposición', 'Cambio'] }, { l: 'Proyecto: CONTRATO DE OBRA', t: 'obra' }] },
    { tipo: 'tabla', titulo: 'REPOSICIÓN DE LOS ELEMENTOS DE PROTECCIÓN INDIVIDUAL EPP', filas: 12, agregar: true, cols: [
      { l: 'Casco De Seguridad Y Barbuquejo', t: 'x' }, { l: 'Guante Carnaza', t: 'x' }, { l: 'Guante De Caucho', t: 'x' }, { l: 'Guante De Nitrilo', t: 'x' },
      { l: 'Gafas De Seguridad Oscuras', t: 'x' }, { l: 'Gafas De Seguridad Claras', t: 'x' }, { l: 'Protección Auditiva', t: 'x' }, { l: 'Protección Respiratoria', t: 'x' },
      { l: 'Arnés De Cuerpo Completo', t: 'x' }, { l: 'Chaleco', t: 'x' }, { l: 'Eslinga', t: 'x' }, { l: 'Devolución O Reposición Marque Según Corresponda', t: 'op', op: ['Devolución', 'Reposición'] },
      { l: 'FECHA DD / MM / AA', t: 'f' }, { l: 'FIRMA Empleado', t: 'firma' }] },
    { tipo: 'campos', titulo: 'DATOS DEL RESPONSABLE DE LA ENTREGA DE LOS EPI', campos: [{ l: 'Nombres y apellidos', t: 'usuario' }, { l: 'Cedula N°', t: 't' }, { l: 'Cargo', t: 't' }, { l: 'Firma', t: 'firma' }] },
    { tipo: 'texto', texto: 'Certifico que he recibido por parte de la empresa JAVIER EDUARDO ROSERO LONDOÑO – JERL, NIT 10.017.505, los Elementos de Protección Personal (EPP) relacionados en el presente formato, así como la inducción sobre su uso adecuado, cuidado y conservación, de conformidad con el Decreto 1072 de 2015 y demás normas vigentes en Seguridad y Salud en el Trabajo. Me comprometo a utilizarlos obligatoria y correctamente durante mis actividades laborales, mantenerlos en buen estado, reportar oportunamente cualquier daño o pérdida y devolverlos cuando corresponda, considerando el desgaste normal por su uso. Reconozco que el incumplimiento de estas obligaciones podrá dar lugar a las medidas disciplinarias establecidas por la empresa, conforme a la legislación laboral vigente y garantizando el debido proceso.' }] };

ESQ.insp_andamios = {
  codigo: 'SG-SST – FO -10', titulo: 'INSPECCIÓN ANDAMIOS', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Semanal',
  secciones: [
    { tipo: 'campos', campos: [{ l: 'Tipo de inspección', t: 'op', op: ['Programada', 'Preoperacional', 'No programada', 'Seguimiento'] }, { l: 'Obra / Proyecto', t: 'obra' },
      { l: 'Ubicación del andamio', t: 'frente' }, { l: 'Fecha de inspección', t: 'f' }, { l: 'Hora', t: 'h' }, { l: 'Inspector', t: 'usuario' }, { l: 'Cargo', t: 't' }] },
    { tipo: 'campos', titulo: '1. IDENTIFICACIÓN DEL ANDAMIO', campos: [{ l: 'Tipo de andamio', t: 'op', op: ['Multidireccional', 'Tubular', 'Fachada'], otro: true },
      { l: 'Fabricante / proveedor', t: 't' }, { l: 'Altura aproximada (m)', t: 'n' }, { l: 'Número de cuerpos', t: 'n' }, { l: 'Uso previsto', t: 't' },
      { l: 'Capacidad de carga / configuración', t: 't' }, { l: 'Fecha de armado', t: 'f' }, { l: 'Responsable del montaje', t: 't' },
      { l: '¿Cuenta con sistema de acceso?', t: 'op', op: ['Sí', 'No'] }, { l: '¿Se utiliza para trabajo en alturas?', t: 'op', op: ['Sí', 'No'] }] },
    LEY_C,
    { tipo: 'nota', texto: 'Importante: Si se identifica una condición que pueda generar riesgo grave e inmediato, el andamio deberá ser retirado de servicio hasta que la condición sea corregida y verificada.' },
    { tipo: 'lista', titulo: '3. INSPECCIÓN DEL ANDAMIO', cols: CNCNA, obs: 'Observaciones / Hallazgos', n0: 1, items: [
      'El andamio corresponde al tipo y configuración requeridos para la actividad.', 'Los componentes del andamio son compatibles entre sí y corresponden al sistema utilizado.',
      'Los elementos estructurales se encuentran completos.', 'No se observan tubos, marcos, plataformas o componentes doblados, fisurados, deformados o deteriorados.',
      'Las bases o apoyos se encuentran instalados correctamente.', 'El terreno o superficie donde se instala el andamio es firme, estable y adecuado.',
      'Las bases cuentan con elementos de apoyo adecuados cuando se requieren.', 'El andamio se encuentra nivelado y aplomado.',
      'Los elementos de unión, acople o fijación se encuentran correctamente instalados.', 'Las conexiones no presentan piezas faltantes o sueltas.',
      'El andamio cuenta con arriostramiento adecuado según su configuración.', 'Los amarres o anclajes a la estructura se encuentran instalados cuando son requeridos.',
      'Los amarres y anclajes se encuentran firmes y en buen estado.', 'Las plataformas de trabajo se encuentran completas y correctamente instaladas.',
      'Las plataformas no presentan deterioro, deformaciones o elementos sueltos.', 'Las plataformas cuentan con apoyo y fijación adecuados.',
      'La superficie de trabajo se encuentra libre de huecos o aberturas peligrosas.', 'El ancho y configuración de la plataforma son adecuados para la actividad.',
      'Las plataformas se encuentran libres de materiales innecesarios que puedan generar tropiezos.', 'El andamio cuenta con barandas de protección donde corresponda.',
      'La baranda superior se encuentra instalada y en condiciones adecuadas.', 'La protección intermedia se encuentra instalada cuando corresponde.',
      'Cuenta con rodapiés o protección contra caída de objetos cuando se requiere.', 'Los elementos de protección colectiva se encuentran firmes y correctamente instalados.',
      'El sistema de acceso al andamio es seguro y adecuado.', 'Las escaleras internas o sistemas de acceso se encuentran en buen estado.',
      'El acceso permite subir y bajar de manera segura.', 'No se utiliza la estructura exterior del andamio como medio improvisado de acceso.',
      'Se encuentra señalizada y/o delimitada el área inferior cuando existe riesgo de caída de objetos.', 'No existen materiales, herramientas u objetos con posibilidad de caer desde las plataformas.',
      'Se mantiene una distancia segura respecto de redes o instalaciones eléctricas.', 'No existen interferencias con equipos, vehículos, estructuras o instalaciones cercanas.',
      'El andamio no se encuentra sobre superficies improvisadas, inestables o no diseñadas para soportarlo.', 'No se han realizado modificaciones no autorizadas a la estructura del andamio.',
      'No se han retirado elementos estructurales o de protección sin autorización.', 'La carga sobre las plataformas se encuentra dentro de la capacidad prevista.',
      'No se utilizan elementos improvisados para aumentar la altura de trabajo.', 'El andamio se encuentra protegido frente a condiciones ambientales que puedan comprometer su estabilidad.',
      'Se han considerado las condiciones de viento cuando el trabajo o configuración del andamio lo requiere.',
      'El andamio cuenta con identificación de su condición de uso cuando el sistema de control implementado por la empresa lo contempla.'] },
    { tipo: 'lista', titulo: '4. VERIFICACIÓN PARA TRABAJO EN ALTURAS', cols: CNCNA, obs: 'Observaciones', n0: 41, items: [
      'Se ha identificado el riesgo de caída asociado al uso del andamio.', 'Se cuenta con las medidas de prevención y protección contra caídas requeridas para la actividad.',
      'Los trabajadores que utilizan el andamio cuentan con la formación requerida para trabajo en alturas, cuando aplica.', 'Los equipos de protección contra caídas utilizados se encuentran inspeccionados.',
      'Los puntos o sistemas de anclaje utilizados son adecuados para el sistema implementado.', 'Se cuenta con medidas para evitar la caída de herramientas y materiales.',
      'Los trabajadores conocen las condiciones de seguridad para utilizar el andamio.', 'Se dispone de medidas de atención y rescate ante una eventual caída, cuando corresponda.'] },
    { tipo: 'lista', titulo: '5. CONDICIONES DEL ENTORNO', cols: CNCNA, obs: 'Observaciones', n0: 49, items: [
      'El área alrededor del andamio se encuentra despejada.', 'No existen excavaciones, desniveles u otras condiciones que comprometan su estabilidad.',
      'Se encuentra delimitada el área de influencia cuando existe riesgo para terceros.', 'Existe iluminación suficiente para realizar el trabajo de manera segura.',
      'Se ha controlado la interacción con vehículos o maquinaria cercana.', 'Se ha controlado el riesgo de caída de objetos sobre trabajadores o terceros.',
      'Las condiciones climáticas permiten realizar la actividad de manera segura.'] }] };

ESQ.permiso_demolicion = {
  codigo: 'SG-SST – FO - 35', titulo: 'PERMISO DE TRABAJO PARA DEMOLICION', version: '03', fecha: '16/09/2026', grupo: 'Permisos de trabajo', periodicidad: 'Según necesidad (antes de cada demolición)',
  secciones: [
    { tipo: 'campos', campos: [{ l: 'Proyecto', t: 'obra' }, { l: 'Área', t: 'frente' }, { l: 'Elemento a demoler', t: 't' }, { l: 'Fecha', t: 'f' }, { l: 'Responsable', t: 'trab' }] },
    { tipo: 'lista', titulo: '1. VERIFICACIÓN PREVIA', cab: 'Condición', cols: ['Sí', 'No', 'N/A'], critico: 'No', items: ['Elemento estructural identificado', 'Método de demolición definido',
      'Redes de servicios identificadas', 'Área aislada', 'Señalización instalada', 'Riesgo de caída de objetos controlado', 'Estructura evaluada', 'Equipos y herramientas inspeccionados',
      'EPP definido', 'Control de polvo implementado', 'Ruta de evacuación disponible', 'Personal informado'] },
    { tipo: 'checks', titulo: '2. CONTROLES', op: ['Aislamiento del área', 'Apuntalamiento', 'Control de polvo', 'Control de caída de materiales', 'Protección contra caída de altura', 'Señalero/vigía', 'Manejo de residuos'], otro: 'Otros' },
    { tipo: 'campos', titulo: '3. AUTORIZACIÓN', campos: [{ l: 'Supervisor de obra', t: 'firma' }, { l: 'Responsable SST', t: 'firma' }, { l: 'Ejecutante', t: 'firma' }, { l: 'Hora autorización', t: 'h' }] },
    { tipo: 'checks', titulo: '4. CIERRE', op: ['Demolición suspendida/terminada', 'Área segura', 'Residuos retirados/asegurados', 'Elementos inestables controlados', 'Señalización mantenida cuando corresponda'] },
    { tipo: 'campos', campos: [{ l: 'Firma', t: 'firma' }] }] };

ESQ.ats_demolicion = {
  codigo: 'SG-SST – FO - 41', titulo: 'ANÁLISIS DE TRABAJO SEGURO PARA DEMOLICIION', version: '03', fecha: '16/09/2026', grupo: 'ATS', periodicidad: 'Semanal',
  secciones: [
    { tipo: 'campos', campos: [{ l: 'Área', t: 'frente' }, { l: 'Fecha', t: 'f' }] },
    { tipo: 'tabla', agregar: true, cols: [{ l: 'Paso', t: 't' }, { l: 'Peligro', t: 't' }, { l: 'Consecuencia', t: 't' }, { l: 'Control', t: 't' }],
      precarga: [['Inspeccionar estructura', 'Inestabilidad', 'Colapso', 'Evaluación previa'], ['Aislar área', 'Caída de materiales', 'Golpes', 'Cerramiento'],
        ['Desconectar servicios', 'Energía eléctrica/gas', 'Electrocución/incendio', 'Aislamiento'], ['Ejecutar demolición', 'Colapso', 'Aplastamiento', 'Método definido'],
        ['Retirar material', 'Polvo/cargas', 'Lesiones', 'Humectación/EPP'], ['Finalizar', 'Elementos inestables', 'Colapso', 'Inspección final']] },
    { tipo: 'checks', titulo: 'CONTROLES', op: ['Método de demolición definido', 'Estructura evaluada', 'Servicios identificados', 'Área aislada', 'Control de polvo', 'Control de caída de objetos', 'EPP',
      'Herramientas inspeccionadas', 'Ruta de evacuación', 'Permiso aprobado'] },
    { tipo: 'firmas', firmas: ['Responsable', 'Supervisor', 'SST'] }] };

ESQ.induccion = {
  codigo: 'SST – EV - 03', titulo: 'SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO · INDUCCIÓN – RE-INDUCCIÓN DEL SG-SST “OBRA”', version: '03', fecha: '16/09/2026', pagina: '02',
  grupo: 'Inducción', periodicidad: 'Cada vez que ingresa personal',
  secciones: [
    { tipo: 'campos', titulo: 'INFORMACIÓN DEL PROYECTO', campos: [{ l: 'Contrato de obra', t: 't' }, { l: 'Objeto', t: 'obra' }, { l: 'Ubicación', t: 't', def: 'Av. 30 de Agosto, Pereira' }] },
    { tipo: 'campos', titulo: 'INFORMACIÓN DEL COLABORADOR', campos: [{ l: 'Nombres y Apellidos', t: 'trab' }, { l: 'Cédula de ciudadanía', t: 'doc' }, { l: 'Cargo', t: 'cargo' },
      { l: 'Fecha de ingreso', t: 'f' }, { l: 'Fecha de Inducción', t: 'f' }, { l: 'Dirección', t: 't' }] },
    { tipo: 'campos', titulo: 'En caso de emergencias con quien nos podemos comunicar', campos: [{ l: 'Nombre', t: 't' }, { l: 'Parentesco', t: 't' }, { l: 'Teléfono', t: 't' },
      { l: 'Tipo', t: 'op', op: ['Inducción', 'Reinducción'] }, { l: 'Responsable de la Inducción – Reinducción', t: 'usuario' }] },
    { tipo: 'lista', titulo: 'TEMAS SOCIALIZADOS', cab: 'TEMAS SOCIALIZADOS', cols: ['SI', 'NO'], critico: 'NO', items: [
      ['1', 'Se socializaron los horarios establecidos por la empresa, así como los tiempos destinados para alimentación y descanso, de acuerdo con la jornada laboral aplicable.'],
      ['2', 'Todo trabajador deberá informar oportunamente a su jefe inmediato o al responsable definido por la empresa cualquier ausencia, incapacidad o situación que le impida asistir a su jornada laboral, siguiendo los canales establecidos por la organización.'],
      ['3', 'Reglamento interno de trabajo'], ['', 'Políticas de la empresa: SST- Prevención de consumo de alcohol, sustancias psicoactivas y tabaco.'],
      ['4', 'Matriz de peligro y Riesgos a los que se encuentra expuesto en la obra: FÍSICO: (ruido, vibración, temperaturas extremas) QUÍMICO: (exposición de partículas y material particulado), BIOMECÁNICO:(postura prolongada, sobre esfuerzos, manipulación manual de cargas) CONDICIONES DE SEGURIDAD (mecánico, eléctricos, superficies irregulares, caída objeto y de diferente nivel) FENÓMENOS NATURALES: (sismo) posibles riesgos que pueden ocasionar daños a la salud. (enfermedades respiratorias, fracturas, esguinces, heridas, cortadas, lumbalgias, laceraciones, machucones, incluso hasta la muerte.'],
      ['5', 'Inspecciones (equipos- maquinaria- herramienta de mano- área de trabajo-EPP - EPPCC)'], ['6', 'Si usted no sabe usar equipos informar y no maniobrarlo'],
      ['7', 'Se socializaron las responsabilidades del empleador, trabajadores, contratistas y demás partes involucradas frente al cumplimiento de las normas de Seguridad y Salud en el Trabajo, así como las consecuencias derivadas del incumplimiento de las obligaciones legales y de los procedimientos internos.'],
      ['8', 'Se socializaron los permisos, autorizaciones y controles requeridos para la ejecución de actividades que, de acuerdo con la identificación de peligros y procedimientos de la empresa, así lo requieran, incluyendo trabajo en alturas, excavaciones, espacios confinados, trabajos en caliente u otras actividades de alto riesgo aplicables al proyecto.'],
      ['9', 'Control de ingreso y salida: Los trabajadores deberán cumplir los procedimientos establecidos por la empresa para el ingreso, permanencia y salida del proyecto, informando y solicitando autorización cuando corresponda.'],
      ['10', 'Punto de encuentro, salidas de emergencias y elementos para emergencias, rutas de evacuación'],
      ['11', 'Elementos de Protección Personal: El trabajador deberá utilizar los elementos de protección personal definidos por la empresa de acuerdo con los peligros y riesgos asociados a su actividad. Como elementos básicos para las áreas de obra podrán establecerse, según corresponda, casco de seguridad, calzado de seguridad, protección visual, auditiva, respiratoria, guantes, protección contra caídas y demás elementos requeridos.'],
      ['12', 'No se puede trabajar con ningún tipo de accesorios (anillos, cadenas, pulseras, aretes, piercing, reloj)'],
      ['13', 'Los EPP que se les entrega son: Casco, protección visual, protección auditiva, protección respiratoria, guantes, barboquejo) estos se deben de utilizar dependiendo la actividad; Solo se les hace cambio de los EPP siempre y cuando entreguen el elemento viejo o deteriorado totalmente.'],
      ['14', 'Uso correcto del casco: El casco deberá utilizarse de acuerdo con las especificaciones del fabricante y las condiciones de seguridad establecidas por la empresa. No deberán utilizarse elementos que interfieran con su ajuste, estabilidad o funcionamiento. el casco si es de obligatoriedad tenerlo en todo momento. se les acepta pañoleta o escafandra. Uso obligatorio de EPI – cuido y reposición – canje.'],
      ['15', 'No se admite escuchar música con audífonos.'],
      ['16', '¿Qué hacer en caso de un ACCIDENTE LABORAL, y donde dirigirse? (informar al centro asistencial más cercano) De lo contrario dirigirse a los centros de atención que están expuestos en la cartelera y en la entrada de la obra. Estos eventos deben ser reportados el mismo día de ocurridos'],
      ['17', 'Nuestra ARL ES POSITIVA. Se informó al trabajador la ARL a la cual se encuentra afiliado, los canales de atención y el procedimiento para la atención y reporte de accidentes de trabajo y enfermedades laborales.'],
      ['18', 'Exámenes Ocupacionales Se informó al trabajador sobre la realización de las evaluaciones médicas ocupacionales que correspondan de acuerdo con los peligros, riesgos y condiciones de salud relacionados con el cargo, conforme a la normativa vigente y al programa de medicina preventiva y del trabajo de la empresa.'],
      ['19', 'Aseo en los puestos de trabajo antes, durante y después de la labor.'],
      ['20', 'Gestión de residuos: Se socializaron los procedimientos establecidos para la separación, almacenamiento y disposición de residuos generados en la obra, de acuerdo con el código de colores y las disposiciones ambientales aplicables al proyecto.'],
      ['21', 'Comportamiento seguro y convivencia: Mantener un trato respetuoso con compañeros, supervisores, contratistas y demás personas presentes en la obra. Se prohíben las conductas, juegos, bromas o comportamientos que puedan generar distracción, agresiones o situaciones de riesgo, asi mismo dar cumplimiento a la política de acoso sexual'],
      ['22', 'Señalización: Delimitar, cerrar y señalizar las zonas de trabajo, sitios y elementos que puedan generar lesiones a las personas, zonas de almacenamiento.'],
      ['23', 'Sendero de circulación en obra, salidas de emergencia y puntos de encuentro, entre otros deben estar libres de obstáculos.'],
      ['25', 'Cumplimiento de normas de SST: El incumplimiento de las normas, procedimientos e instrucciones de SST será gestionado de acuerdo con los procedimientos internos de la empresa y la normatividad laboral aplicable.'],
      ['26', 'Trabajo en alturas: Cuando la actividad implique trabajo en alturas, el trabajador deberá cumplir los requisitos de formación, autorización, equipos, inspecciones, medidas de prevención y protección y demás controles establecidos por la normativa vigente y por el procedimiento de trabajo en alturas de la empresa.'],
      ['27', 'Participación de los trabajadores: Se informó sobre los mecanismos de participación en el SG-SST, incluyendo el COPASST o Vigía de SST, según corresponda, y sobre el Comité de Convivencia Laboral, sus funciones y canales establecidos para presentar inquietudes o situaciones relacionadas con su competencia.'],
      ['28', 'Cumplir con los procedimientos de seguridad que sean socializados en obra'],
      ['29', 'Ausencias no informadas: Las ausencias deberán ser informadas oportunamente al responsable definido por la empresa y serán gestionadas conforme al reglamento interno de trabajo, contrato laboral y normatividad aplicable.'],
      ['30', 'Reporte de condiciones y actos inseguros: Todo trabajador deberán informar oportunamente cualquier acto inseguro, condición insegura, peligro, incidente o desviación de un procedimiento que pueda generar afectación a la seguridad y salud de las personas.'],
      ['31', 'Autorización para actividades de riesgo: Antes de iniciar actividades que requieran permiso, autorización o controles específicos de acuerdo con los procedimientos de la empresa y la normativa aplicable, el trabajador deberá contar con la autorización correspondiente y cumplir las medidas de prevención y protección establecidas.'],
      ['32', 'Higiene y prevención: Se socializaron las medidas de higiene, lavado de manos, limpieza y desinfección, manejo de residuos y demás controles de prevención de acuerdo con los riesgos presentes en la obra y los protocolos vigentes de la empresa.'],
      ['33', 'Alcohol y sustancias psicoactivas: Está prohibido presentarse, permanecer o ejecutar actividades laborales bajo efectos que puedan comprometer la capacidad para realizar el trabajo de manera segura, así como ingresar, consumir o distribuir bebidas alcohólicas o sustancias psicoactivas en los lugares y durante las actividades donde esté prohibido por la legislación, las políticas y los procedimientos de la empresa.']] },
    { tipo: 'texto', plantilla: true, texto: 'Yo {Nombres y Apellidos}. Identificado con número de cedula de ciudadanía N°. {Cédula de ciudadanía}, certifico con mi firma, haber RECIBIDO y ENTENDIDO la inducción y/o reinducción presentada por la profesional de Seguridad y Salud en el Trabajo de la empresa JAVIER EDUARDO ROSERO. (JERL) Además, me comprometo a acatar todo lo establecido anteriormente.' },
    { tipo: 'firmas', firmas: ['FIRMA DEL COLABORADOR', 'FIRMA DEL RESPONSABLE DE LA INDUCCIÓN', 'FIRMA AUX SST'] }] };

ESQ.evaluacion_induccion = {
  codigo: 'SST- EV -02', titulo: 'EVALUACIÓN DE INDUCCIÓN / REINDUCCIÓN EN SST', version: '03', fecha: '19/09/2026', grupo: 'Inducción', periodicidad: 'Cada vez que ingresa personal',
  secciones: [
    { tipo: 'campos', titulo: 'INFORMACIÓN DEL COLABORADOR', campos: [{ l: 'Nombres y Apellidos', t: 'trab' }, { l: 'Cédula de ciudadanía', t: 'doc' }, { l: 'Cargo', t: 'cargo' },
      { l: 'Fecha de ingreso', t: 'f' }, { l: 'Fecha de Inducción', t: 'f' }, { l: 'Firma del trabajador', t: 'firma' }] },
    { tipo: 'examen', titulo: 'EVALUACIÓN', preguntas: [
      { p: '1. ¿Qué debe hacer si identifica una condición insegura?', op: ['Continuar trabajando', 'Informar al responsable de SST y/o al jefe inmediato y aplicar las medidas establecidas por la empresa', 'Ignorarla'], ok: 1 },
      { p: '2. ¿Qué debe hacer ante un accidente de trabajo?', op: ['Ocultarlo', 'Suspender inmediatamente la actividad, informar inmediatamente a SST , y seguir indicaciones', 'Esperar varios días'], ok: 1 },
      { p: '3. ¿Puede realizar una actividad para la cual no está autorizado?', op: ['Sí', 'No'], ok: 1 },
      { p: '4. ¿Las políticas establecidas por la empresa, son de obligatorio cumplimiento para todo el personal?', op: ['Sí', 'No'], ok: 0 },
      { p: '5. ¿Los Elementos de Protección Personal son de uso obligatorio?', op: ['Sí', 'No'], ok: 0 }] }] };

ESQ.insp_senalizacion_obra = {
  codigo: 'SG-SST – FO - 22', titulo: 'INSPECCIÓN A SEÑALIZACIÓN OBRA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Mensual',
  secciones: [
    { tipo: 'campos', campos: [{ l: '1. Tipo de inspección', t: 'op', op: ['Programada', 'No programada', 'Seguimiento'] }, { l: 'Área / Obra', t: 'obra' }, { l: 'Ubicación específica', t: 'frente' },
      { l: 'Fecha de inspección', t: 'f' }, { l: 'Hora', t: 'h' }, { l: 'Inspector', t: 'usuario' }, { l: 'Cargo', t: 't' }] },
    LEY_C,
    { tipo: 'lista', titulo: '3. INSPECCIÓN DE SEÑALIZACIÓN', cols: CNCNA, obs: 'Observaciones / Hallazgos', n0: 1, items: 'SENAL30' },
    { tipo: 'lista', titulo: '4. VERIFICACIÓN ESPECÍFICA PARA OBRA', cab: 'Elemento', cols: ['Adecuada', 'Inadecuada', 'N/A'], critico: 'Inadecuada', obs: 'Observaciones', items: [
      'Señalización de excavaciones', 'Señalización de trabajos en alturas', 'Señalización de riesgo eléctrico', 'Señalización de maquinaria y equipos', 'Señalización de circulación de vehículos',
      'Señalización de circulación peatonal', 'Señalización de uso obligatorio de EPP', 'Señalización de áreas restringidas', 'Señalización de almacenamiento',
      'Señalización de sustancias o productos peligrosos, cuando aplique', 'Señalización de rutas de evacuación', 'Señalización de salidas de emergencia', 'Señalización de punto de encuentro',
      'Señalización de extintores', 'Señalización de primeros auxilios', 'Señalización de zonas de riesgo temporal'] }] };

var SENAL30 = ['Existe señalización de seguridad en los puntos donde se identifican peligros o riesgos que requieren advertencia.', 'La señalización corresponde al peligro o condición existente en el área.',
  'Las señales se encuentran en buen estado físico.', 'Las señales son visibles y pueden ser identificadas fácilmente.', 'La ubicación de las señales permite su lectura e interpretación.',
  'Las señales no se encuentran obstruidas por materiales, equipos, herramientas, vehículos u otros elementos.', 'La señalización presenta colores, símbolos y textos claramente identificables.',
  'La señalización de prohibición se encuentra instalada donde es necesaria.', 'La señalización de advertencia se encuentra instalada en zonas con peligros identificados.',
  'La señalización de obligación se encuentra instalada donde se requiere el uso de EPP o cumplimiento de una medida de seguridad.', 'Se encuentran identificadas las rutas de evacuación cuando aplica.',
  'Las salidas de emergencia se encuentran debidamente señalizadas.', 'Los puntos de encuentro se encuentran señalizados y visibles cuando aplica.',
  'Los extintores se encuentran debidamente señalizados y su ubicación es fácilmente identificable.', 'Los botiquines y elementos de primeros auxilios se encuentran señalizados cuando corresponde.',
  'Los tableros eléctricos y zonas de riesgo eléctrico cuentan con señalización preventiva y/o de advertencia.', 'Las áreas restringidas o de acceso controlado se encuentran debidamente señalizadas.',
  'Las zonas de trabajo en alturas cuentan con señalización y delimitación cuando existe riesgo de caída de personas u objetos.', 'Las excavaciones, zanjas, desniveles o aberturas cuentan con señalización y delimitación adecuada.',
  'Las zonas de circulación de vehículos y maquinaria cuentan con señalización cuando aplica.', 'Las áreas de almacenamiento de materiales se encuentran debidamente identificadas cuando corresponde.',
  'Las zonas de peligro temporal cuentan con señalización durante la ejecución de las actividades.', 'La señalización temporal de obra se encuentra instalada de manera segura.',
  'Las señales temporales se retiran o modifican cuando desaparece la condición que las originó.', 'La señalización nocturna o de baja visibilidad cuenta con elementos de visibilidad adecuados cuando se requiere.',
  'La señalización de tránsito interno permite orientar adecuadamente la circulación de trabajadores, visitantes y vehículos.',
  'Existe separación o señalización entre zonas peatonales y zonas destinadas al tránsito de vehículos o maquinaria, cuando aplica.', 'Las señales se encuentran firmemente instaladas y no presentan riesgo de caída.',
  'No existen señales deterioradas, ilegibles, rotas o desactualizadas.', 'La señalización corresponde a las condiciones actuales de la obra y no contiene información desactualizada.'];

ESQ.insp_senalizacion_admin = {
  codigo: 'SG- SST – FO - 26', titulo: 'INSPECCIÓN A SEÑALIZACIÓN AREA ADMINISTRATIVA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Mensual',
  secciones: [
    { tipo: 'campos', campos: [{ l: 'Tipo de inspección', t: 'op', op: ['Programada', 'No programada', 'Seguimiento'] }, { l: 'Área / Obra', t: 't' }, { l: 'Fecha de inspección', t: 'f' },
      { l: 'Hora', t: 'h' }, { l: 'Inspector', t: 'usuario' }, { l: 'Cargo', t: 't' }] },
    { tipo: 'texto', titulo: '1. OBJETIVO', texto: 'Verificar las condiciones de instalación, ubicación, visibilidad, estado y pertinencia de la señalización de seguridad existente en las obras y áreas administrativas de JERL INGENIERÍA CIVIL, con el fin de facilitar la identificación de peligros, advertir sobre riesgos, orientar al personal y visitantes y apoyar la prevención de accidentes e incidentes.' },
    LEY_C,
    { tipo: 'lista', titulo: '3. INSPECCIÓN DE SEÑALIZACIÓN', cols: CNCNA, obs: 'Observaciones / Hallazgos', n0: 1, items: 'SENAL30' }] };

function _sec(t, items, n0, obs) { return { tipo: 'lista', titulo: t, cols: CNCNA, obs: obs || 'OBSERVACIONES', n0: n0, items: items }; }
ESQ.insp_puestos_admin = {
  codigo: 'SG- SST – FO - 26', titulo: 'INSPECCIÓN PUESTOS DE TRABAJO AREA ADMINISTRATIVA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Según necesidad (SN)',
  secciones: [
    { tipo: 'campos', titulo: '1. INFORMACIÓN GENERAL', campos: [{ l: 'Área / Dependencia', t: 't' }, { l: 'Nombre del trabajador', t: 'trab' }, { l: 'Cargo', t: 'cargo' },
      { l: 'Fecha de inspección', t: 'f' }, { l: 'Inspector', t: 'usuario' }, { l: 'Antigüedad en el cargo', t: 't' }, { l: 'Jornada habitual', t: 't' },
      { l: 'Tipo de inspección', t: 'op', op: ['Inicial', 'Periódica', 'Seguimiento'] }, { l: 'Modalidad', t: 'op', op: ['Presencial', 'Híbrida', 'Teletrabajo'] }] },
    { tipo: 'nota', texto: 'C = Cumple / NC = No cumple / NA = No aplica' },
    _sec('2. CONDICIONES DEL PUESTO DE TRABAJO', ['El espacio de trabajo permite realizar las actividades sin restricciones de movimiento.', 'El puesto se encuentra libre de obstáculos y elementos innecesarios.',
      'El área de circulación permanece despejada.', 'El piso se encuentra en buen estado y libre de condiciones que puedan generar caídas.', 'El puesto cuenta con iluminación suficiente para realizar las actividades.',
      'No se presentan reflejos o deslumbramientos sobre la pantalla.', 'La ventilación del área es adecuada.', 'La temperatura del ambiente permite desarrollar la actividad confortablemente.'], 1),
    _sec('3. ESCRITORIO Y SUPERFICIE DE TRABAJO', ['El escritorio tiene dimensiones adecuadas para la actividad.', 'La superficie del escritorio se encuentra estable y en buen estado.',
      'Existe espacio suficiente para ubicar los elementos de trabajo sin generar posturas forzadas.', 'Los elementos de uso frecuente están ubicados al alcance del trabajador.',
      'Los cajones y compartimientos funcionan correctamente.', 'No existen objetos debajo del escritorio que interfieran con el movimiento de las piernas.'], 9),
    _sec('4. SILLA Y CONDICIONES ERGONÓMICAS', ['La silla se encuentra en buen estado.', 'La silla permite ajustar la altura del asiento, cuando corresponda.', 'El asiento proporciona apoyo adecuado al trabajador.',
      'El respaldo proporciona soporte adecuado para la espalda.', 'El respaldo permite mantener una postura adecuada durante la jornada.', 'La silla permanece estable y no presenta daños estructurales.',
      'Los pies pueden apoyarse firmemente en el piso o en un reposapiés cuando sea necesario.', 'Se evita permanecer durante periodos prolongados en posturas incómodas.'], 15),
    _sec('5. PANTALLA / COMPUTADOR', ['La pantalla se encuentra ubicada frente al trabajador.', 'La pantalla permite mantener una postura cómoda de cabeza y cuello.',
      'La distancia entre los ojos y la pantalla es adecuada para el trabajador.', 'La pantalla puede ajustarse para evitar reflejos o deslumbramientos.', 'El tamaño y configuración de la pantalla permiten una lectura cómoda.',
      'El teclado se encuentra ubicado de manera que permita una posición cómoda de brazos y manos.', 'El mouse se encuentra ubicado al alcance del trabajador.', 'El uso de computador no genera posturas forzadas evidentes.'], 23),
    _sec('6. CONDICIONES ELÉCTRICAS', ['Los tomacorrientes se encuentran en buen estado.', 'Los cables de equipos se encuentran organizados.', 'No existen cables atravesando zonas de circulación.',
      'No se presentan conexiones eléctricas improvisadas.', 'No se evidencia sobrecarga de tomacorrientes.', 'Los equipos eléctricos se encuentran en condiciones seguras de funcionamiento.'], 31),
    _sec('7. ORDEN Y ASEO', ['El puesto permanece limpio y organizado.', 'Los documentos y elementos de trabajo están organizados.', 'Los residuos son depositados en los recipientes correspondientes.',
      'No se almacenan objetos innecesarios debajo o alrededor del puesto.', 'Las zonas de circulación se encuentran libres de obstáculos.'], 37),
    _sec('8. HÁBITOS Y PAUSAS ACTIVAS', ['El trabajador conoce la importancia de realizar pausas activas.', 'Se realizan pausas activas durante la jornada según el programa establecido.',
      'Se realizan cambios de postura durante la jornada.', 'Se evita permanecer sentado durante periodos prolongados sin cambio de actividad o postura.', 'El trabajador conoce las recomendaciones ergonómicas para su puesto.'], 42),
    { tipo: 'campos', titulo: '9. RESULTADO DE LA INSPECCIÓN', campos: [{ l: 'Resultado general', t: 'op', op: [
      'SATISFACTORIO: El puesto presenta condiciones adecuadas de seguridad, orden y ergonomía.', 'REQUIERE MEJORA: Se identifican condiciones que deben ser intervenidas y objeto de seguimiento.',
      'NO SATISFACTORIO: Se identifican condiciones que requieren intervención prioritaria.'] }] },
    { tipo: 'campos', titulo: '12. RECOMENDACIONES AL TRABAJADOR', campos: [{ l: 'Recomendaciones', t: 'a' }] }] };

ESQ.insp_locativa_obra = {
  codigo: 'SG- SST – FO - 25', titulo: 'INSPECCIÓN LOCATIVA OBRA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Mensual',
  secciones: [
    { tipo: 'campos', titulo: '1. INFORMACIÓN GENERAL', campos: [{ l: 'Proyecto/Obra', t: 'obra' }, { l: 'Contratista', t: 't', def: 'JERL – Javier Eduardo Rosero Londoño' }, { l: 'Ciudad', t: 't', def: 'Pereira' },
      { l: 'Fecha', t: 'f' }, { l: 'Hora', t: 'h' }, { l: 'Responsable inspección', t: 'usuario' }] },
    { tipo: 'lista', titulo: '2. VERIFICACIÓN', cab: 'Criterio', cols: CNCNA, obs: 'Observaciones', n0: 1, items: ['Área de trabajo delimitada y señalizada', 'Ingreso restringido a personal autorizado',
      'Rutas de circulación despejadas', 'Orden y aseo adecuados', 'Materiales correctamente almacenados', 'Herramientas en buen estado', 'Equipos en condiciones seguras',
      'Guardas de seguridad instaladas cuando corresponda', 'Instalaciones eléctricas seguras', 'Cables protegidos y organizados', 'Tableros eléctricos identificados y protegidos',
      'Trabajadores utilizan EPP requerido', 'Casco de seguridad en buen estado', 'Protección visual utilizada cuando corresponde', 'Protección auditiva utilizada cuando corresponde',
      'Guantes adecuados a la actividad', 'Calzado de seguridad adecuado', 'Protección respiratoria cuando aplica', 'Sistemas de protección contra caídas adecuados', 'Escaleras inspeccionadas',
      'Andamios en condiciones seguras cuando aplica', 'Excavaciones protegidas cuando aplica', 'Señalización de peligros instalada', 'Extintores disponibles cuando corresponde',
      'Botiquín disponible', 'Rutas de evacuación identificadas', 'Condiciones de iluminación adecuadas', 'Condiciones ambientales controladas'] },
    { tipo: 'tabla', titulo: '3. HALLAZGOS Y ACCIONES', filas: 5, agregar: true, numerada: true, cols: [{ l: 'Hallazgo', t: 't' }, { l: 'Riesgo', t: 't' }, { l: 'Acción inmediata', t: 't' },
      { l: 'Acción correctiva', t: 't' }, { l: 'Responsable', t: 't' }, { l: 'Fecha cierre', t: 'f' }] }] };

ESQ.insp_locativa_admin = {
  codigo: 'SG- SST – FO - 24', titulo: 'INSPECCIÓN LOCATIVA ADMINISTRATIVA', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Mensual',
  secciones: [
    { tipo: 'campos', titulo: '1. INFORMACIÓN GENERAL', campos: [{ l: 'Fecha', t: 'f' }, { l: 'Área inspeccionada', t: 't' }, { l: 'Responsable de la inspección', t: 'usuario' }] },
    { tipo: 'nota', texto: '2. CRITERIOS DE INSPECCIÓN — C: Cumple | NC: No cumple | NA: No aplica' },
    { tipo: 'lista', cab: 'Aspecto a verificar', cols: CNCNA, obs: 'Observaciones', n0: 1, items: ['Pisos en buen estado, firmes y sin desniveles peligrosos', 'Pasillos y zonas de circulación libres de obstáculos',
      'Escaleras en buen estado y libres de obstáculos', 'Barandas y pasamanos en buen estado', 'Puertas en buen estado', 'Techos y paredes sin deterioros que representen riesgo', 'Iluminación suficiente',
      'Ventilación adecuada', 'Áreas de trabajo libres de materiales innecesarios', 'Instalaciones eléctricas en condiciones seguras', 'Tomas y enchufes en buen estado',
      'Cables organizados y sin riesgo de tropiezo', 'Extensiones eléctricas utilizadas de manera segura', 'Señalización de seguridad visible', 'Salidas de emergencia despejadas',
      'Rutas de evacuación identificadas', 'Extintores accesibles y señalizados', 'Botiquín disponible y señalizado', 'Baños en condiciones adecuadas de higiene', 'Áreas comunes en condiciones seguras',
      'Archivadores y estanterías correctamente asegurados', 'Almacenamiento seguro de documentos y materiales', 'No existen condiciones que generen riesgo de caída',
      'No existen condiciones que generen riesgo locativo evidente'] },
    { tipo: 'tabla', titulo: '3. HALLAZGOS', filas: 12, agregar: true, numerada: true, cols: [{ l: 'Hallazgo', t: 't' }, { l: 'Clasificación', t: 'op', op: ['Crítico', 'Alto', 'Medio', 'Bajo'] },
      { l: 'Acción requerida', t: 't' }, { l: 'Responsable', t: 't' }, { l: 'Fecha límite', t: 'f' }] },
    { tipo: 'campos', campos: [{ l: 'Evidencia fotográfica', t: 'op', op: ['Sí', 'No'] }] }] };

ESQ.insp_electricas = {
  codigo: 'SG- SST – FO - 23', titulo: 'INSPECCIÓN INSTALACIONES ELECTRICAS', version: '03', fecha: '16/09/2026', grupo: 'Inspecciones', periodicidad: 'Mensual',
  secciones: [
    { tipo: 'campos', titulo: '1. INFORMACIÓN GENERAL', campos: [{ l: 'Obra / Proyecto', t: 'obra' }, { l: 'Contrato', t: 't' }, { l: 'Ubicación', t: 't' }, { l: 'Área inspeccionada', t: 'frente' },
      { l: 'Fecha de inspección', t: 'f' }, { l: 'Hora', t: 'h' }, { l: 'Inspector', t: 'usuario' }, { l: 'Responsable del área', t: 't' },
      { l: 'Condiciones climáticas (Ubicación de la obra', t: 'op', op: ['Seco', 'Lluvia', 'Húmedo'] }, { l: 'Número de trabajadores expuestos', t: 'n' }] },
    { tipo: 'nota', texto: '2. CRITERIOS DE INSPECCIÓN — Marque: C = Cumple / NC = No cumple / NA = No aplica.' },
    { tipo: 'lista', cab: 'ASPECTO A INSPECCIONAR', cols: CNCNA, obs: 'OBSER HALLAZGOS', n0: 1, items: ['Los tableros eléctricos se encuentran identificados y señalizados.',
      'Los tableros cuentan con protección contra contacto directo con partes energizadas.', 'Los tableros permanecen cerrados y protegidos contra acceso no autorizado.',
      'Los tableros cuentan con protecciones eléctricas adecuadas para los circuitos instalados.', 'Los circuitos eléctricos están debidamente identificados.',
      'Los cables y conductores se encuentran en buen estado, sin cortes, peladuras o deterioro visible.', 'No existen cables con empalmes improvisados o conexiones inseguras.',
      'Los empalmes eléctricos existentes cuentan con aislamiento y protección adecuada.', 'Las extensiones eléctricas se encuentran en buen estado.',
      'Las extensiones tienen capacidad adecuada para la carga conectada.', 'Los cables no se encuentran ubicados en zonas de tránsito generando riesgo de tropiezo o daño mecánico.',
      'Cuando los cables atraviesan zonas de circulación, cuentan con protección adecuada.', 'Las instalaciones eléctricas se encuentran protegidas contra humedad y agua.',
      'Las conexiones ubicadas en exteriores cuentan con protección apropiada para las condiciones ambientales.', 'Los tomacorrientes se encuentran en buen estado.',
      'Los tomacorrientes no presentan partes rotas, sueltas o expuestas.', 'Se evita la sobrecarga de tomacorrientes y circuitos.', 'No se utilizan adaptadores o extensiones múltiples de manera insegura.',
      'Los equipos eléctricos cuentan con conexión eléctrica segura.', 'Las herramientas eléctricas se conectan mediante instalaciones apropiadas.',
      'Las instalaciones eléctricas provisionales de obra se encuentran organizadas y protegidas.', 'Las instalaciones eléctricas provisionales cuentan con señalización de riesgo eléctrico.',
      'Se dispone de acceso seguro a los tableros para realizar operación y mantenimiento.', 'Se mantiene despejada el área frente a los tableros eléctricos.',
      'Los tableros eléctricos no se encuentran expuestos a golpes, tránsito de maquinaria o almacenamiento de materiales.', 'Existe señalización de PELIGRO – RIESGO ELÉCTRICO donde corresponde.',
      'Los sistemas de puesta a tierra se encuentran instalados y en condiciones adecuadas.', 'Las carcasas metálicas de equipos que lo requieren cuentan con puesta a tierra.',
      'Se cuenta con dispositivos de protección diferencial cuando sean requeridos.', 'Las instalaciones eléctricas son intervenidas únicamente por personal competente y autorizado.',
      'Se realizan actividades de mantenimiento eléctrico aplicando medidas de seguridad y control de energías cuando corresponda.', 'Se evita realizar trabajos eléctricos con las manos mojadas o en condiciones inseguras.',
      'Se mantienen alejados materiales combustibles de instalaciones que puedan generar calentamiento.', 'No existen elementos metálicos u otros objetos apoyados sobre tableros o instalaciones eléctricas.',
      'Se cuenta con acceso seguro para desconectar los circuitos en caso de emergencia.'] },
    { tipo: 'lista', titulo: '3. INSPECCIÓN DE CABLEADO Y EXTENSIONES', cab: 'ELEMENTO', cols: ['BUENO', 'REGULAR', 'MALO', 'NA'], critico: 'MALO', obs: 'OBSERVACIONES', items: ['Cableado general',
      'Extensiones eléctricas', 'Tomas eléctricas', 'Enchufes', 'Tableros provisionales', 'Tableros generales', 'Cajas eléctricas', 'Sistema de puesta a tierra', 'Protecciones eléctricas', 'Señalización'] }] };
