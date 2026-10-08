'use strict';

/**
 * Contenido de la pantalla de Ayuda.
 *
 * Vive en core porque lo usan la interfaz, la demostracion y el generador de
 * docs/CONTENIDO_AYUDA.md.
 *
 * OJO: el bloque sobre azar es contenido legal y esta marcado como BORRADOR
 * hasta que Juan lo revise. Sigue la regla de la casa: ante la duda, consultar.
 */

var AVISO_AZAR = {
  borrador: true,
  titulo: 'Antes de lanzar: ¿tu dinámica tiene azar?',
  entrada: 'Si tienes cualquier duda de si tu dinámica tiene azar o suerte, confírmalo con el equipo legal de tu país ANTES de lanzarla. No la lances y después preguntes.',
  porQue: [
    'En Colombia y en varios países de la región, los sorteos y las rifas son juegos de suerte y azar y necesitan permiso previo de la autoridad.',
    'Lanzar una campaña con azar sin ese permiso es una infracción, y la responsabilidad recae sobre quien la organiza y sobre Rappi como medio de difusión.',
    'Esta herramienta solo genera documentos para dinámicas SIN azar. Si tu campaña tiene azar, el documento lo tiene que redactar Legal.',
  ],
  validas: [
    'Cashback: quien compra recibe un porcentaje de vuelta en Créditos. Todos los que cumplen reciben el beneficio.',
    'Carrera de Compras: gana quien más compre durante la vigencia. El resultado depende del esfuerzo del participante, no de la suerte.',
    'Cashback Multitienda: varias tiendas hacen cashback dentro de la misma jornada, cada una con su propio porcentaje, su tope y su presupuesto.',
    '15 minutos o Cashback: Rappi promete un tiempo de entrega en el botón Turbo y, si la orden llega tarde, devuelve en Créditos parte de lo que el usuario pagó.',
    'Cashback Travel y Descuento Travel: las dos formas de campaña de vuelos, hoteles, autos y paquetes.',
    'Descuento: la tienda baja el precio, o regala el envío o la tarifa de servicio. Todos los que compran lo reciben.',
    'Cupón: lo mismo, pero el usuario lo activa con un código o desde la sección “Cupones”. Quien lo activa lo recibe.',
    // No genera documento, pero sí se resuelve aquí: el comercial entra, pasa
    // el filtro y se lleva el enlace que va en la pieza (encargo 02).
    'En Colombia, los descuentos, los cupones, el envío gratis y la tarifa de servicio ya tienen T&C publicados y no generas nada.',
  ],
  noValidas: [
    'Sorteo entre todos los participantes, aunque sea "entre quienes compren".',
    'Rifa con boletas o números.',
    'Raspa y gana, ruleta, cofres o cajas sorpresa.',
    'Premio al cliente número N del día, o al pedido número N.',
    'Cualquier mecánica donde dos personas que hacen exactamente lo mismo pueden terminar con resultados distintos.',
  ],
  frontera: [
    'Premios distintos por puesto en un ranking, o tabla de puntos: consúltalo.',
    'El premio es una boleta, una experiencia o algo atado a un evento con fecha: consúltalo.',
    'Hay un jurado que decide, o un criterio de "el más creativo": consúltalo.',
  ],
  regla: 'La prueba más simple: si dos personas hacen exactamente lo mismo y una puede ganar y la otra no, hay azar. Consulta antes de lanzar.',
};

var CONTACTOS = [
  {
    nombre: 'Juan Camilo Gallego',
    para: 'Dudas legales de fondo, campañas que no encajan en ningún tipo, y aprobación de textos nuevos.',
    correo: '',
  },
  {
    nombre: 'Anna Habermann',
    para: 'Cómo plantear la campaña con el aliado y qué se puede prometer en las piezas de marketing.',
    correo: '',
  },
  {
    nombre: 'Paula Barahona',
    para: 'Revisión de campañas de un país distinto a Colombia y coordinación con los equipos locales.',
    correo: '',
  },
];

/**
 * Quien tiene usuario de Squarespace, por pais.
 *
 * No todo el mundo puede publicar: la cuenta la tienen unas pocas personas por
 * pais. Si el comercial no esta en esta lista, el paso de publicar no es suyo y
 * tiene que pedirlo por el canal.
 *
 * Por ahora solo esta Colombia. Los demas paises los confirma Juan.
 */
var ACCESOS_SQUARESPACE = {
  CO: {
    cashback: [
      { nombre: 'Camilo Patiño', correo: 'ivan.patino@rappi.com' },
      { nombre: 'Valery Medina', correo: 'ext-v.reina@rappi.com' },
    ],
    concursos: [],
    notaConcursos: 'Para concursos todavía no hay una persona asignada. Pídelo en #tyc-rappi.',
  },
};

/** El canal donde se centraliza todo lo de T&C. */
/*
 * La linea de "si algo no coincide, avisanos".
 *
 * Vivia dentro del aviso de azar, que es lo primero y lo mas serio de la
 * pantalla: una nota sobre la herramienta colgada de una advertencia legal se
 * lee como si la advertencia fuera la que estuviera a medias. Va al canal de
 * ayuda, que es donde se pide. Punto F8, 20 de septiembre de 2026.
 */
var SI_ALGO_NO_COINCIDE =
  'Si algo de esta página no coincide con lo que ves en la herramienta, avísanos por el canal.';

var CANAL_TC = {
  nombre: '#tyc-rappi',
  url: 'https://rappiplus.slack.com/archives/C0C29SK54HL',
  para: '¿No tienes usuario de Squarespace? Pide que te publiquen la página en',
};

/**
 * Los pasos para publicar en Squarespace, en el orden real de la herramienta.
 *
 * Los datos entre llaves los pone la pantalla final con los de la campaña, para
 * que el comercial no tenga que deducir nada.
 */
/**
 * El filtro de los T&C generales.
 *
 * Antes de darle a nadie el enlace de un T&C general hay que saber si su
 * campana de verdad cabe en ese documento. Hasta el 20 de septiembre de 2026 no
 * lo revisaba nadie: el comercial entraba a la lista de los quince publicados y
 * copiaba el enlace, y si su campana tenia una condicion que el general no dice,
 * esa condicion no se le podia exigir al usuario.
 *
 * Los textos son los de la decision 49 del encargo 01, tal cual. Cada pregunta
 * dice a donde va un "si", y hay tres salidas distintas:
 *
 *   - `tipos`: no es un T&C general, la herramienta sabe hacer ese documento.
 *   - `legal`: lo redacta un abogado, con la razon escrita.
 *   - `depende`: hay un T&C general que sirve, pero solo en un caso.
 *
 * La sexta no es de si o no: abre tres opciones, y cada una lleva a un sitio.
 */
var FILTRO_DE_GENERALES = [
  {
    id: 'creditosOPremio',
    texto: '¿El usuario recibe Créditos o gana un premio?',
    salida: 'tipos',
    razon: 'Esto no es un T&C general. Vuelve a los tipos y elige Cashback o Carrera de Compras.',
  },
  {
    id: 'eventoEspecial',
    texto: '¿Es un evento especial, como Hora Loca o Pro Week?',
    salida: 'legal',
    razon: 'Las campañas de mucha visibilidad llevan T&C propio.',
  },
  {
    id: 'categoriaRegulada',
    texto: '¿Es alcohol, tabaco, vapeador, medicamento, fórmula infantil o apuesta?',
    salida: 'legal',
    razon: 'Esas categorías tienen reglas propias de publicidad.',
  },
  {
    id: 'dependeDelMedioDePago',
    texto: '¿El descuento depende del medio de pago?',
    salida: 'legal',
    razon: 'Un descuento atado a un banco o a una tarjeta tiene otro responsable y otro documento.',
  },
  {
    id: 'cuponPorFuera',
    texto: '¿El cupón se usa por fuera de Rappi?',
    salida: 'depende',
    razon: 'Solo si es un código de descuento para un evento externo: usa ese T&C general. Si no, lo redacta Legal.',
  },
  {
    id: 'soloCiertosUsuarios',
    texto: '¿Aplica solo a ciertos usuarios?',
    salida: 'opciones',
    opciones: [
      {
        valor: 'pro',
        etiqueta: 'Pro o Pro Black',
        nota: 'Legal tiene publicados los T&C de esas campañas.',
        salida: 'lista',
      },
      {
        valor: 'nuevos_turbo',
        etiqueta: 'Nunca han comprado en Turbo',
        nota: 'Es el T&C general de Usuarios Nuevos en Turbo.',
        salida: 'lista',
      },
      {
        valor: 'otra',
        etiqueta: 'Otra condición',
        nota: 'Ningún T&C general describe esa condición.',
        salida: 'legal',
        razon: 'Ningún T&C general describe esa condición, así que la campaña la redacta Legal.',
      },
    ],
  },
];

/**
 * Los tres requisitos de la pieza, en la pantalla final del T&C general.
 *
 * Son la base del encargo de leyendas y siguen vigentes (decision 49, punto 4).
 * Aqui no se genera documento, asi que es lo unico que la herramienta puede
 * decirle al comercial sobre su arte.
 */
var LO_QUE_LA_PIEZA_DEBE_DECIR =
  'Tu pieza debe decir siempre: el mínimo de compra, si lo hay; el máximo de descuento o de cashback; ' +
  'y a qué usuarios aplica, si no es para todos.';

/**
 * El filtro de entrada de Rappi Travel.
 *
 * Se muestra despues de elegir uno de los dos tipos de Travel y reemplaza, para
 * Travel, las preguntas generales. Cualquier si lleva a Legal con su razon.
 * Ver docs/MODELO_BASE_TRAVEL.md, seccion 11.
 */
var FILTRO_DE_TRAVEL = [
  {
    id: 'tycPropiosTravel',
    texto: '¿El aliado exige sus propios términos y condiciones?',
    razon: 'Si el aliado impone su documento, hay que revisarlo con Legal antes de publicarlo.',
  },
  {
    id: 'azarTravel',
    texto: '¿Hay sorteo o concurso?',
    razon: 'Las dinámicas con azar necesitan permiso previo de Coljuegos.',
  },
  {
    // Medía 25 palabras y sus ejemplos eran la mitad. Desde el 20 de septiembre
    // de 2026 las preguntas del filtro aceptan una línea de ayuda, así que el
    // enunciado se queda corto y los ejemplos van debajo (puntos F6 y F8).
    id: 'beneficioDeTercero',
    texto: '¿El beneficio es otra cosa que Créditos o descuento?',
    ayuda: 'Por ejemplo: noches o niños gratis, cupones, millas, eSIM, bonos o cuotas sin interés.',
    razon: 'Ese beneficio lo presta un tercero con sus propias condiciones, así que necesita otro documento.',
  },
  {
    id: 'mezclaDescuentoYCashback',
    texto: '¿Mezcla descuento y cashback en la misma campaña?',
    razon: 'Cada uno tiene su propio modelo y sus propias cláusulas: en un mismo documento se contradicen.',
  },
  {
    id: 'dependeDeBanco',
    texto: '¿El beneficio son cuotas sin interés o una financiación?',
    razon: 'Quien otorga la financiación es el banco, con sus propias condiciones de tasa, plazo y aprobación. Ese documento lo redacta Legal con el banco.',
  },
  {
    id: 'esSeguro',
    texto: '¿El producto es un seguro, no una asistencia al viajero?',
    razon: 'Los seguros tienen reglas propias de la Superintendencia Financiera.',
  },
  {
    id: 'empleadosOSinFin',
    texto: '¿Es solo para empleados o no tiene fecha de fin?',
    razon: 'Necesita un documento distinto.',
  },
];

var PASOS_SQUARESPACE = [
  {
    hace: 'Abre el documento y léelo completo. Es el texto que vas a publicar, tal cual, sin editarlo.',
    ve: 'El documento con el nombre de tu campaña en el título.',
  },
  {
    hace: 'Entra a Squarespace, a la lista de páginas, y abre la página del país de tu campaña.',
    ve: 'El menú de la izquierda con un país por línea: Brasil, Argentina, Chile, Colombia y los demás.',
  },
  {
    hace: 'Dentro del país, dale al signo de más para crear un evento nuevo.',
    ve: 'El calendario del mes y, a la izquierda, la lista de los T&C que ya existen.',
  },
  {
    hace: 'Copia el título que te dio RappiMind y pégalo en el título del evento. No lo cambies ni le agregues nada.',
    ve: 'El título arriba, donde dice "Escribe un título para el evento".',
  },
  {
    hace: 'Pon la fecha de inicio y la de fin del evento iguales a la vigencia del documento. Si no coinciden, el evento se cae del calendario antes o después de que termine la campaña.',
    ve: 'Las dos fechas debajo del título.',
  },
  {
    hace: 'Selecciona todo el documento, cópialo y pégalo en el cuerpo del evento. Revisa que las cláusulas numeradas y las viñetas se vean bien.',
    ve: 'El texto completo, con todas sus cláusulas numeradas.',
  },
  {
    hace: 'Entra a la pestaña Opciones y reemplaza la dirección del evento por la que te dio RappiMind. La parte del país no se toca: Squarespace la pone sola.',
    ve: 'El campo "URL del evento", con el país a la izquierda y el resto editable.',
  },
  {
    hace: 'Dale a Guardar y publicar. Guardar solo deja la página en borrador y el enlace no abre.',
    ve: 'El evento en el calendario, sin la etiqueta de borrador.',
  },
  {
    hace: 'Abre el enlace en el navegador para confirmar que carga, y cópialo.',
    ve: 'Tu documento publicado, en una dirección que empieza por https://promos.rappi.com/',
  },
  {
    hace: 'Vuelve a RappiMind, pega el enlace abajo y marca la campaña como publicada.',
    ve: 'Tu campaña en verde en el historial, con su enlace guardado.',
  },
];

var SI_ALGO_SALE_MAL = [
  { problema: 'El enlace no abre o da error 404.', solucion: 'La página quedó en borrador. Vuelve a Squarespace y dale Publicar, no solo Guardar.' },
  { problema: 'El texto se ve corrido o sin viñetas.', solucion: 'Pégalo otra vez usando Pegar sin formato y deja que Squarespace le aplique el estilo de la página.' },
  { problema: 'El enlace no empieza por promos.rappi.com.', solucion: 'Creaste la página en otro sitio. Tiene que estar dentro de promos.rappi.com para que RappiMind la acepte.' },
  { problema: 'No tengo usuario de Squarespace.', solucion: 'Es normal: la cuenta la tienen unas pocas personas por país. Pide la publicación en #tyc-rappi y pasa el documento y la dirección que te dio RappiMind.' },
  { problema: 'La dirección que puse quedó distinta a la que me dio la herramienta.', solucion: 'Vuelve a Opciones, corrígela y publica otra vez. Si ya la publicaste con otra dirección, pega en RappiMind el enlace real, no el que te propusimos.' },
  // "Me equivoque en un dato" estaba aqui y en Preguntas frecuentes, con la
  // misma respuesta escrita dos veces. Se queda alla, que es donde el comercial
  // la busca. Punto F8, 20 de septiembre de 2026.
];

var PREGUNTAS_FRECUENTES = [
  {
    pregunta: 'Me equivoqué en un dato y ya generé el documento. ¿Qué hago?',
    respuesta: 'Genera uno nuevo con los datos corregidos y publica ese. No edites el documento a mano: lo que se publica tiene que ser exactamente lo que generó la herramienta, porque es lo que Legal aprobó.',
  },
  {
    pregunta: '¿Puedo participar yo en la campaña?',
    respuesta: 'No. Los empleados de Rappi y del Organizador están excluidos, y eso ya está escrito en el documento. Si participas, el beneficio se puede anular.',
  },
  {
    pregunta: '¿Qué pasa si se acaba el presupuesto antes de la fecha de fin?',
    respuesta: 'La campaña termina sola en ese momento. El documento lo dice, así que estás cubierto. Avísale al aliado para que no siga pautando.',
  },
  {
    pregunta: '¿Cuánto tarda en llegarme el documento?',
    respuesta: 'Un par de minutos. Te llega por correo con el enlace y los pasos para publicar. También queda en tu historial dentro de RappiMind.',
  },
  {
    pregunta: '¿Alguien de Legal revisa mi documento antes?',
    respuesta: 'No, y por eso importa que los datos estén bien. El texto legal ya está aprobado por Legal: lo que tú aportas son los hechos. Si tu campaña necesita revisión, la herramienta te lo dice antes de empezar.',
  },
  {
    pregunta: '¿Y si mi campaña va a Legal y no soy de Colombia ni de Costa Rica?',
    respuesta: 'El formulario de esa pantalla es solo para Colombia y Costa Rica. Si tu campaña es de otro país, escríbele a tu equipo legal por los canales que ya usan hoy: todavía estamos confirmando el formulario o el canal para cada país.',
  },
  {
    pregunta: 'Ya publiqué y necesito cambiar las fechas. ¿Puedo?',
    respuesta: 'Si es para alargarla o subir el presupuesto, sí: en Mis campañas, botón Ampliar. Para acortarla o bajar algo, habla con Legal, porque afecta a quien ya participó.',
  },
  {
    pregunta: 'La identificación del aliado no pasa la validación.',
    respuesta: 'El número que te pedimos cambia según el país: NIT en Colombia, RFC en México, RUC en Perú y Ecuador, CUIT en Argentina, RUT en Chile y Uruguay, cédula jurídica en Costa Rica y CNPJ en Brasil. La pregunta te dice cuál es y dónde buscarlo. Casi siempre falla el dígito de verificación: pídele el documento tributario a tu contacto y cópialo de ahí. Si el documento dice un número y la validación lo rechaza, avísanos en el canal de ayuda: es una falla de la herramienta.',
  },
  {
    pregunta: '¿Puedo ponerle a la campaña el nombre que usa la marca?',
    respuesta: 'Sí, y es opcional. Casi al final de la pregunta de la campaña te pedimos el nombre con el que sale al público, por ejemplo Skindays. Es el que dice el documento. Sin él, el documento usa el nombre de siempre (la tienda, el beneficio y la fecha). El título del archivo y la dirección de la página no cambian: siguen saliendo del nombre de siempre. El nombre no puede llevar porcentajes, precios ni cifras (salvo un año), ni hablar de sorteo, rifa, lotería, azar o suerte, porque el beneficio lo dice el documento y esta herramienta no hace juegos de azar.',
  },
  {
    pregunta: '¿Puedo poner varias tiendas en una misma campaña?',
    respuesta: 'Sí. En la Carrera de Compras agregas una fila por tienda: las compras en todas suman a un mismo ranking, y en cada fila dices en cuál de sus tiendas cuentan los pedidos (la normal, la de Turbo o las dos). Con el tipo Cashback Multitienda, cada tienda entra con su razón social, su NIT y su presupuesto, porque cada una organiza su propio beneficio y responde por él.',
  },
  {
    pregunta: '¿Qué es un Maker y en qué cambia las cosas?',
    respuesta: 'Es la marca que fabrica el producto, distinta de la tienda que lo vende. Si el Maker pone la plata, el Maker es el Organizador y van su razón social y su identificación tributaria, no las de la tienda.',
  },
  {
    pregunta: '¿Por qué Rappi no puede ser el organizador?',
    respuesta: 'Porque Rappi es la plataforma que conecta, no quien vende ni quien fondea. El organizador es siempre la tienda o la marca que pone la plata. Que Rappi opere la mecánica o entregue el premio no lo cambia.',
  },
  {
    pregunta: 'Mi campaña es de Rappi Travel. ¿Sirve esta herramienta?',
    respuesta: 'Sí. Después de elegir el país, la primera pregunta es si la campaña es de Rappi o de Rappi Travel. Travel tiene su propia entidad legal, sus propios tipos (Cashback Travel y Descuento Travel) y un filtro de diez preguntas antes de empezar, porque hay casos de viajes que sí tiene que redactar Legal.',
  },
  {
    pregunta: '¿Dónde quedan guardados los documentos?',
    respuesta: 'En una carpeta de Drive por país, nunca en una carpeta general. Tú quedas como lector del documento y el enlace te llega por correo.',
  },
  {
    pregunta: 'Mi campaña es un descuento o un cupón. ¿Qué hago?',
    respuesta: 'Depende del país. En Colombia no hay que generar nada: Legal ya publicó los T&C generales de los descuentos, los cupones, el envío gratis y la tarifa de servicio gratis, y debajo de la lista de tipos de campaña hay una opción que te lleva a ellos para copiar el enlace que va en la pieza. En los demás países sí generas tu documento, con los tipos Descuento y Cupón.',
  },
  {
    pregunta: 'Usé un T&C general. ¿Qué letra pequeña le pongo a la pieza?',
    respuesta: 'La herramienta te la arma. En la pantalla del T&C que elegiste, debajo del enlace, dinos desde y hasta cuándo vale tu campaña y, si los tienes, las unidades disponibles y el máximo por usuario. Te damos la leyenda escrita y aprobada por Legal, lista para copiar, en los formatos de la pieza: letra pequeña, banner, exterior y push. Si a tu formato no le cabe, te decimos por cuánto se pasa para que lo veas antes de diseñar. En el envío gratis y en la tarifa de servicio gratis no te la damos, porque la leyenda aprobada dice que el descuento no incluye esas dos cosas y en esas campañas diría lo contrario de lo que prometes: ahí escríbele a Legal.',
  },
  {
    pregunta: '¿En qué se diferencian el Descuento y el Cupón?',
    respuesta: 'En una sola cosa: quién hace algo. El Descuento se aplica solo, en el precio que el usuario ve antes de pagar. El Cupón hay que activarlo: el usuario escribe un código o lo toma en la sección “Cupones” de la app, y si no lo activa no recibe el beneficio. Si tu campaña tiene código, es Cupón.',
  },
  {
    pregunta: 'Quiero hacer una Carrera de Compras en Brasil y no me aparece.',
    respuesta: 'En Brasil un concurso con premio necesita autorización previa de la Secretaria de Prêmios e Apostas antes de lanzarse, así que esa campaña no se puede generar sola: escríbele a Legal con tiempo, porque el trámite no es inmediato. En los demás países sí la generas aquí, porque la Carrera se gana por lo que cada persona compró y no por suerte.',
  },
];

if (typeof module !== 'undefined') {
  module.exports = {
    AVISO_AZAR: AVISO_AZAR,
    SI_ALGO_NO_COINCIDE: SI_ALGO_NO_COINCIDE,
    CONTACTOS: CONTACTOS,
    FILTRO_DE_TRAVEL: FILTRO_DE_TRAVEL,
    FILTRO_DE_GENERALES: FILTRO_DE_GENERALES,
    LO_QUE_LA_PIEZA_DEBE_DECIR: LO_QUE_LA_PIEZA_DEBE_DECIR,
    ACCESOS_SQUARESPACE: ACCESOS_SQUARESPACE,
    CANAL_TC: CANAL_TC,
    PASOS_SQUARESPACE: PASOS_SQUARESPACE,
    SI_ALGO_SALE_MAL: SI_ALGO_SALE_MAL,
    PREGUNTAS_FRECUENTES: PREGUNTAS_FRECUENTES,
  };
}
