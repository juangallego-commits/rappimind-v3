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
    'Descuento por umbral: quien supere cierto monto recibe el beneficio. La regla es la misma para todos.',
    'Cashback Day: varias tiendas hacen cashback el mismo día, cada una con su propio presupuesto.',
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
    'Participan varias tiendas en un mismo concurso: consúltalo.',
  ],
  regla: 'La prueba más simple: si dos personas hacen exactamente lo mismo y una puede ganar y la otra no, hay azar. Consulta antes de lanzar.',
};

var CONTACTOS = [
  {
    nombre: 'Juan Camilo Gallego',
    para: 'Dudas legales de fondo, campañas que no encajan en ningún tipo, y aprobación de textos nuevos.',
    correo: '[PENDIENTE: correo]',
  },
  {
    nombre: 'Anna Habermann',
    para: 'Cómo plantear la campaña con el aliado y qué se puede prometer en las piezas de marketing.',
    correo: '[PENDIENTE: correo]',
  },
  {
    nombre: 'Paula Barahona',
    para: 'Revisión de campañas de un país distinto a Colombia y coordinación con los equipos locales.',
    correo: '[PENDIENTE: correo]',
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
    notaConcursos: 'Para concursos todavía no hay una persona asignada. Pídelo por el canal de Legal.',
  },
};

/** El canal donde se centraliza todo lo de T&C. */
var CANAL_TC = {
  nombre: '#tyc-rappi',
  url: 'https://rappiplus.slack.com/archives/C0C29SK54HL',
  para: 'Cualquier solicitud, duda o revisión de T&C. Si no tienes usuario de Squarespace, pide aquí que te publiquen la página.',
};

/**
 * Los pasos para publicar en Squarespace, en el orden real de la herramienta.
 *
 * Los datos entre llaves los pone la pantalla final con los de la campaña, para
 * que el comercial no tenga que deducir nada.
 */
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
    hace: 'Copia el título de la campaña que te damos aquí abajo y pégalo en el título del evento. No lo cambies ni le agregues nada.',
    ve: 'El título arriba, donde dice "Escribe un título para el evento".',
  },
  {
    hace: 'Pon la fecha de inicio y la de fin del evento iguales a la vigencia del documento. Si no coinciden, el evento se cae del calendario antes o después de que termine la campaña.',
    ve: 'Las dos fechas debajo del título.',
  },
  {
    hace: 'Selecciona todo el documento, cópialo y pégalo en el cuerpo del evento. Revisa que las cláusulas numeradas y las viñetas se vean bien.',
    ve: 'El texto completo con sus veinte cláusulas.',
  },
  {
    hace: 'Entra a la pestaña Opciones y reemplaza la dirección del evento por la que te damos aquí abajo. La parte del país no se toca: Squarespace la pone sola.',
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
  { problema: 'No tengo usuario de Squarespace.', solucion: 'Es normal: la cuenta la tienen unas pocas personas por país. Pide la publicación por el canal de Legal y pasa el documento y la dirección que te dio RappiMind.' },
  { problema: 'La dirección que puse quedó distinta a la que me dio la herramienta.', solucion: 'Vuelve a Opciones, corrígela y publica otra vez. Si ya la publicaste con otra dirección, pega en RappiMind el enlace real, no el que te propusimos.' },
  { problema: 'Me equivoqué en un dato y ya generé el documento.', solucion: 'No edites el documento a mano. Genera uno nuevo con los datos corregidos y publica ese. El anterior queda en tu historial sin publicar.' },
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
    pregunta: 'Ya publiqué y necesito cambiar las fechas. ¿Puedo?',
    respuesta: 'Cambiar condiciones de una campaña ya publicada afecta a quien ya participó. Habla con Legal antes de tocar nada: hay reglas sobre qué se puede modificar y qué no.',
  },
  {
    pregunta: 'El NIT del aliado no pasa la validación.',
    respuesta: 'Casi siempre es el dígito de verificación, el número después del guion. Pídele el RUT a tu contacto y cópialo de ahí. Si el RUT dice un número y la validación lo rechaza, escríbele a Legal.',
  },
  {
    pregunta: '¿Puedo poner varias tiendas en una misma campaña?',
    respuesta: 'Sí, con el tipo Cashback Day. Cada tienda entra con su razón social, su NIT y su presupuesto, porque cada una organiza su propio beneficio y responde por él.',
  },
  {
    pregunta: '¿Qué es un Maker y en qué cambia las cosas?',
    respuesta: 'Es la marca que fabrica el producto, distinta de la tienda que lo vende. Si el Maker pone la plata, el Maker es el Organizador y va su razón social y su NIT, no los de la tienda.',
  },
  {
    pregunta: '¿Por qué Rappi no puede ser el organizador?',
    respuesta: 'Porque Rappi es la plataforma que conecta, no quien vende ni quien fondea. El organizador es siempre la tienda o la marca que pone la plata. Que Rappi opere la mecánica o entregue el premio no lo cambia.',
  },
  {
    pregunta: 'Mi campaña es de Rappi Travel. ¿Sirve esta herramienta?',
    respuesta: 'Todavía no. Travel tiene otra entidad legal y su propio documento. La herramienta te manda al formulario de Legal en cuanto lo indicas.',
  },
  {
    pregunta: '¿Dónde quedan guardados los documentos?',
    respuesta: 'En una carpeta de Drive por país, nunca en una carpeta general. Tú quedas como lector del documento y el enlace te llega por correo.',
  },
];

if (typeof module !== 'undefined') {
  module.exports = {
    AVISO_AZAR: AVISO_AZAR,
    CONTACTOS: CONTACTOS,
    ACCESOS_SQUARESPACE: ACCESOS_SQUARESPACE,
    CANAL_TC: CANAL_TC,
    PASOS_SQUARESPACE: PASOS_SQUARESPACE,
    SI_ALGO_SALE_MAL: SI_ALGO_SALE_MAL,
    PREGUNTAS_FRECUENTES: PREGUNTAS_FRECUENTES,
  };
}
