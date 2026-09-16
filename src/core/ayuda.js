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

var PASOS_SQUARESPACE = [
  { hace: 'Abre el documento y léelo completo. Es el texto que vas a publicar tal cual.', ve: 'El documento con el nombre de tu campaña en el título.' },
  { hace: 'Selecciona todo el contenido del documento y cópialo.', ve: 'Todo el texto resaltado.' },
  { hace: 'Entra a Squarespace y crea una página nueva dentro de promos.rappi.com.', ve: 'El editor de la página en blanco.' },
  { hace: 'Pega el contenido y revisa que los títulos y las viñetas se vean bien.', ve: 'El texto con sus cláusulas numeradas y sus viñetas.' },
  { hace: 'Publica la página y copia el enlace de la barra del navegador.', ve: 'Un enlace que empieza por https://promos.rappi.com/' },
  { hace: 'Vuelve a RappiMind, pega el enlace y marca la campaña como publicada.', ve: 'Tu campaña en verde en el historial.' },
];

var SI_ALGO_SALE_MAL = [
  { problema: 'El enlace no abre o da error 404.', solucion: 'La página quedó en borrador. Vuelve a Squarespace y dale Publicar, no solo Guardar.' },
  { problema: 'El texto se ve corrido o sin viñetas.', solucion: 'Pégalo otra vez usando Pegar sin formato y deja que Squarespace le aplique el estilo de la página.' },
  { problema: 'El enlace no empieza por promos.rappi.com.', solucion: 'Creaste la página en otro sitio. Tiene que estar dentro de promos.rappi.com para que RappiMind la acepte.' },
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
    PASOS_SQUARESPACE: PASOS_SQUARESPACE,
    SI_ALGO_SALE_MAL: SI_ALGO_SALE_MAL,
    PREGUNTAS_FRECUENTES: PREGUNTAS_FRECUENTES,
  };
}
