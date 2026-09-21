'use strict';

/**
 * Genera docs/revision/: el paquete con el que se revisa el front en Claude chat.
 *
 * Por que un paquete y no el archivo unico. docs/FRONT_ACTUAL.html pesa unas
 * noventa mil fichas de contexto. Cabe en una conversacion, pero deja poco aire
 * para pensar, y una revision de cuarenta y seis pantallas con poco aire sale
 * en quince observaciones generales en vez de las doscientas concretas que se
 * necesitan. El paquete parte el front en tandas: cada tanda es una
 * conversacion aparte, con su material y nada mas, y con toda la ventana libre
 * para revisar de verdad.
 *
 * Que sale de aqui:
 *
 *   LEEME.md    como lo usa Juan, sin terminal.
 *   PROMPT.md   lo que se pega al empezar cada tanda: quien revisa, que es
 *               RappiMind, que no se puede tocar y en que formato responder.
 *   tanda-N-*.md  el material de cada tanda.
 *
 * De donde sale el texto. Las pantallas salen de docs/revision/pantallas.json,
 * que escribe `npm run front` con el texto tal como se lee en el navegador, no
 * copiado del codigo. Las preguntas salen de src/core/preguntas.js, la misma
 * fuente que dibuja la interfaz. Asi lo que se revisa y lo que ve el comercial
 * no se pueden separar.
 *
 * Uso:
 *   npm run front      (una vez, necesita navegador; deja pantallas.json)
 *   npm run revision   (rapido, sin navegador; se puede repetir)
 */

const fs = require('fs');
const path = require('path');
const { rutaDesdeRaiz, leerTexto, escribirTexto, asegurarCarpeta } = require('./lib/archivos');
const { PREGUNTAS, PASOS } = require('../src/core/preguntas.js');
const { ESQUEMAS } = require('../src/core/esquemas.js');
const { ficha } = require('./preguntas.js');

const CARPETA = rutaDesdeRaiz('docs', 'revision');
const PANTALLAS = path.join(CARPETA, 'pantallas.json');

/**
 * Que campo responde cada pantalla del formulario.
 *
 * Se declara aqui y no en scripts/front.js porque es un detalle del
 * cuadernillo: sirve para poner debajo de la pantalla lo que en ella no se ve
 * (las opciones que no se eligieron, los mensajes de validacion, el valor por
 * defecto). Una pantalla puede responder varios campos seguidos, como la de las
 * fechas.
 */
const CAMPOS_DE_LA_PANTALLA = {
  pais: ['pais'],
  negocio: ['negocio'],
  tipos: ['tipo'],
  tienda: ['tienda'],
  cobertura: ['alcance', 'ciudades'],
  organizador: ['organizadorRazonSocial'],
  identificacion: ['organizadorId'],
  error: ['organizadorId'],
  'fecha-inicio': ['fechaInicio', 'horaInicio', 'fechaFin', 'horaFin'],
  porcentaje: ['porcentaje'],
  tope: ['tope'],
  presupuesto: ['presupuesto'],
  veces: ['maxPedidos', 'sinLimite'],
  'tienda-turbo': ['tiendaTurbo'],
  carga: ['carga', 'fechaCarga'],
  vigencia: ['vigencia', 'diasVigencia', 'fechaFinRedencion'],
  redencion: ['redencion'],
  segmento: ['segmento', 'diasSinCompra'],
  'medio-de-pago': ['metodoPago'],
  'compra-minima': ['compraMinima'],
  'categoria-producto': ['categoriaProducto'],
  resumen: ['declaracion'],
  'resumen-completo': ['declaracion'],
  'cashback-day': ['tiendas'],
  carrera: ['desempate'],
  'acuerdo-datos': ['acuerdoDatos'],
  'pais-en-pruebas': ['pais'],
  'tipos-travel': ['tipo'],
  'pt-negocio': ['negocio'],
  'pt-tipos': ['tipo'],
  'celular-pregunta': ['tope'],
};

/**
 * Las pantallas que a proposito no entran en ninguna tanda, y por que.
 *
 * Esto existe para que una pantalla fuera de revision sea una decision escrita y
 * no un olvido. La prueba de pruebas/revision.test.js exige que toda pantalla
 * este en una tanda o aqui: si manana se agrega una y nadie la reparte, la
 * prueba lo dice antes de que la revision salga incompleta sin que se note.
 */
const EL_CELULAR = 'Juan lo dejó fuera el 21 de septiembre de 2026: el celular no es por donde los ' +
  'comerciales usan la herramienta, y las tres pantallas se llevaban el sitio de Administración, ' +
  'Mis campañas y la Ayuda, que sí importan y nunca se habían mirado con ojos de producto. Las ' +
  'pantallas siguen en docs/FRONT_ACTUAL.html, así que no se perdieron: lo que no se hace es ' +
  'pedirle a Claude chat que las revise.';

const FUERA_DE_REVISION = {
  'celular-inicio': EL_CELULAR,
  'celular-pregunta': EL_CELULAR,
  'celular-hoja': EL_CELULAR,
};

/** Las tandas, en el orden en que conviene revisarlas. */
const TANDAS = [
  {
    id: 'la-entrada',
    titulo: 'La entrada: donde el comercial decide si esto le sirve',
    deQueVa:
      'Las primeras cinco pantallas deciden si el comercial se queda o le escribe a Legal. ' +
      'Aquí también están los tres caminos que lo sacan del formulario: la pantalla de Legal, ' +
      'los T&C que Legal ya publicó y el filtro de Rappi Travel.',
    mirar: [
      'Si alguien que nunca vio esto entiende, en la primera pantalla, qué va a conseguir y cuánto le va a costar.',
      'Si las dos preguntas del filtro se entienden sin saber derecho. Un "no" equivocado aquí publica un T&C que no corresponde.',
      'Si la pantalla de Legal se lee como una salida razonable y no como un portazo.',
      'Si la lista de tipos de campaña se entiende sin conocer los nombres internos, y si un comercial sabe cuál es el suyo.',
      'Si el aviso de un país en piloto dice qué significa para él, hoy.',
      'Las nueve preguntas del filtro de Travel: son las más difíciles de todo el producto.',
    ],
    pantallas: ['inicio', 'filtro', 'pais', 'negocio', 'tipos', 'pais-en-pruebas',
      'legal', 'tyc-filtro', 'tyc-generales', 'tyc-detalle', 'filtro-travel', 'tipos-travel'],
    filtrosDe: ['cashback', 'cashback_travel'],
  },
  {
    id: 'cashback',
    titulo: 'El Cashback, pregunta por pregunta',
    deQueVa:
      'El tipo de campaña de cuatro de cada cinco solicitudes. Diecisiete preguntas seguidas, ' +
      'una por pantalla, más la validación en vivo cuando algo está mal. Si el copy de estas ' +
      'diecisiete está bien, el producto está bien.',
    mirar: [
      'Cada enunciado por separado: ¿se entiende en una leída, sin la ayuda?',
      'Cada línea de ayuda: ¿aporta algo que el enunciado no dijo, o solo lo repite con otras palabras?',
      'Cada "¿Por qué te preguntamos esto?": ¿explica la consecuencia de responder mal, o es relleno?',
      'El orden: ¿alguna pregunta llega antes de que el comercial tenga cómo responderla?',
      'Las opciones: ¿son excluyentes y completas? ¿falta un "ninguna de las anteriores" en alguna?',
      'Los mensajes de validación: ¿dicen qué pasó y cómo se arregla, o solo que está mal?',
      'Lo opcional: ¿se ve que se puede dejar en blanco?',
    ],
    pantallas: ['tienda', 'cobertura', 'organizador', 'identificacion', 'error', 'fecha-inicio',
      'porcentaje', 'tope', 'presupuesto', 'veces', 'tienda-turbo', 'carga', 'vigencia',
      'redencion', 'segmento', 'medio-de-pago', 'compra-minima', 'categoria-producto'],
  },
  {
    id: 'el-cierre',
    titulo: 'El cierre: revisar, generar y publicar',
    deQueVa:
      'Lo que pasa después de la última pregunta. El resumen con lo que todavía falta, la ' +
      'declaración que firma el comercial, y la pantalla final con lo que hay que pegar en ' +
      'Squarespace. Son tres pantallas y son el momento de más riesgo del producto: aquí el ' +
      'documento deja de ser un borrador y se publica.',
    mirar: [
      'El resumen: ¿se entiende qué falta y cómo se arregla, sin bajar a buscarlo?',
      'La declaración: ¿el comercial entiende qué está firmando? Es lo único que firma en todo el recorrido.',
      'La pantalla final: ¿queda claro qué se copia, dónde se pega y qué pasa después?',
      'Si en la pantalla final falta algo que el comercial va a necesitar y no tiene: a quién avisarle, qué hacer si se equivocó, cómo se corrige un T&C ya publicado.',
      'El paso de "generando" y la espera: ¿sabe que el correo le va a llegar, y en cuánto?',
    ],
    pantallas: ['resumen', 'resumen-completo', 'listo'],
  },
  {
    id: 'otros-tipos',
    titulo: 'Los otros tipos de campaña de Rappi',
    deQueVa:
      'Cashback Multitienda, Carrera de Compras y 15 minutos o Cashback. Comparten casi todas ' +
      'las preguntas con el Cashback, así que aquí van solo las suyas: las que nadie ha leído ' +
      'con calma porque no salen en el recorrido de siempre.',
    mirar: [
      'Cashback Multitienda: pegar una lista de tiendas desde una hoja de cálculo es lo más raro que hace el producto. ¿Se entiende qué se pega y qué pasa con lo pegado?',
      'Carrera de Compras: es un concurso con ganador y premio. El criterio del ganador y el desempate son lo que más reclamos genera. ¿Están dichos sin ambigüedad?',
      'El acuerdo de transferencia de datos: aparece solo cuando Rappi le pasa a la marca el nombre y el documento del ganador. ¿Entiende el comercial por qué se lo preguntan?',
      '15 minutos o Cashback: el beneficio depende de un tiempo de entrega. ¿Se entiende qué pasa si el pedido llega tarde?',
    ],
    pantallas: ['cashback-day', 'carrera', 'acuerdo-datos'],
    preguntasDe: ['cashback_day', 'carrera_compras', 'cashback_eta'],
    salvoLasDe: ['cashback'],
  },
  {
    id: 'travel',
    titulo: 'Rappi Travel: los dos tipos, y las preguntas que nadie ha revisado',
    deQueVa:
      'Cashback Travel y Descuento Travel. Entre los dos suman más de cuarenta preguntas ' +
      'propias sobre vuelos, hoteles, autos y paquetes. Ninguna ha pasado por una revisión de ' +
      'copy. Es la parte del producto con más riesgo de que el comercial se pierda.',
    mirar: [
      'El vocabulario: "trayecto", "ámbito", "clases excluidas", "solo operados". ¿Un KAM de Travel los usa así, o son palabras de abogado?',
      'Las preguntas de fechas: hay fecha de campaña y fecha de viaje, y son distintas. ¿Queda claro cuál es cuál?',
      'Las preguntas condicionales: muchas solo aparecen si antes eligió aéreas, o alojamiento, o autos. ¿Se entiende la cadena?',
      'Las preguntas de tope, mínimo y límite: son cuatro o cinco parecidas. ¿Se distinguen entre sí?',
      'Si alguna pregunta pide algo que el comercial no tiene a mano cuando la ve.',
    ],
    preguntasDe: ['cashback_travel', 'descuento_travel'],
    salvoLasDe: ['cashback'],
  },
  {
    id: 'brasil',
    titulo: 'Brasil y la interfaz en portugués',
    deQueVa:
      'El único país con su propio modelo y su propio idioma. La interfaz se traduce al ' +
      'portugués; el documento sale siempre en portugués, y eso no se elige. Aquí van las ' +
      'pantallas en portugués, las preguntas de la Promoção Brasil y el diccionario completo ' +
      'de la traducción.',
    mirar: [
      'El portugués: ¿suena a portugués de Brasil o a español traducido?',
      'Si algún texto se quedó en español sin traducir.',
      'Si el aviso de que Brasil está en pruebas dice qué significa para quien lo lee.',
      'Las preguntas propias de la Promoção Brasil.',
      'El botón de idioma: ¿se entiende que cambia la interfaz y no el documento?',
    ],
    pantallas: ['pt-inicio', 'pt-filtro', 'pt-negocio', 'pt-tipos'],
    preguntasDe: ['promocao_br'],
    salvoLasDe: ['cashback'],
    diccionarioPt: true,
  },
  {
    id: 'alrededores',
    titulo: 'Mis campañas, la Ayuda, Administración y lo que se lee cuando algo falla',
    deQueVa:
      'Todo lo que no es el formulario. El historial de sus campañas y la ampliación de una ' +
      'que está en curso, la pantalla de Ayuda entera, la de Administración, y los mensajes ' +
      'que salen cuando algo se equivoca o cuando Google falla. Son las pantallas menos ' +
      'miradas del producto, y a las que el comercial llega justo cuando algo no le está ' +
      'saliendo.',
    mirar: [
      'Mis campañas: ¿se distingue de un vistazo un borrador de una campaña ya publicada? ¿Se entiende qué hacen "Usar como base" y "Ampliar", y en qué se diferencian?',
      'Mis campañas con veinte campañas encima: ¿se encuentra la de uno? Nadie ha mirado esta pantalla con más de dos.',
      'Ampliar: es cambiarle la fecha a un documento ya publicado. ¿Entiende el comercial que el T&C se vuelve a generar y se vuelve a publicar?',
      'La Ayuda, línea por línea: ¿responde lo que el comercial se va a preguntar, y en el orden en que se lo va a preguntar? ¿Sobra algo? ¿Falta lo de "ya publiqué y me equivoqué"?',
      'Administración: la usa Legal, no el comercial. ¿Se entiende qué hace cada cosa y cuál es peligrosa? Nadie la ha mirado nunca con ojos de producto.',
      'Los mensajes de validación, leídos de corrido: ¿hablan todos igual? ¿Alguno culpa al comercial? ¿Alguno dice que está mal sin decir cómo se arregla?',
      'Los mensajes de falla: ¿dicen si se perdió lo que ya había respondido, y qué hacer ahora?',
    ],
    pantallas: ['historial', 'ampliar', 'ayuda', 'admin'],
    validaciones: true,
    fallas: true,
  },
];

// --- La limpieza del texto ---------------------------------------------------

/**
 * Lo que sale igual en las cuarenta y seis pantallas y no se revisa cuarenta y
 * seis veces: la barra superior y el boton de idioma. El prompt los describe
 * una vez, al principio, y asi cada pantalla empieza por lo suyo.
 */
const MARCO_REPETIDO = [
  'RappiMind v3', 'Generar', 'Mis campañas', 'Ayuda', 'Administración',
  'Gerar', 'Minhas campanhas', 'Ajuda', 'Administração',
];

/** Donde arranca el documento legal dentro de la vista previa. */
const ARRANQUE_DEL_DOCUMENTO = /^(TÉRMINOS Y CONDICIONES|TERMOS E CONDIÇÕES)$/;

/**
 * La marca que reemplaza al documento en la vista previa sale dos veces en cada
 * pantalla, porque la columna de escritorio y la hoja de celular estan las dos
 * en el DOM. En el cuadernillo va una sola vez y en una linea.
 */
const MARCA_LARGA = /^Aquí va (la vista previa del documento|el documento generado)/;
const MARCA_CORTA = '[columna derecha: aquí se ve el documento llenándose mientras responde]';

/**
 * Deja el texto de la pantalla en lo que de verdad se revisa.
 *
 * Dos recortes, y los dos se avisan donde se hacen:
 *
 * 1. La barra de arriba y el boton de idioma, que son los mismos siempre.
 * 2. El documento legal de la columna derecha cuando sale entero. Son
 *    veinticinco mil caracteres de texto que el prompt dice expresamente que no
 *    se revisa, y que en una tanda se llevarian el aire de doce pantallas. Se
 *    deja el encabezado para que se vea que ahi hay un documento llenandose,
 *    que es la promesa del producto, y el resto se marca.
 */
function limpiarTexto(texto) {
  const lineas = texto.split('\n');

  let desde = 0;
  while (desde < lineas.length && (lineas[desde].trim() === '' ||
    MARCO_REPETIDO.indexOf(lineas[desde].trim()) !== -1)) desde += 1;

  let hasta = lineas.length;
  while (hasta > desde && (lineas[hasta - 1].trim() === '' ||
    ['ES', 'BR'].indexOf(lineas[hasta - 1].trim()) !== -1)) hasta -= 1;

  const utiles = [];
  for (const linea of lineas.slice(desde, hasta)) {
    // "Cerrar" es el boton de la hoja de celular, que en escritorio no se ve.
    if (linea.trim() === 'Cerrar' || linea.trim() === 'Fechar') continue;
    if (MARCA_LARGA.test(linea.trim())) {
      if (utiles[utiles.length - 1] === MARCA_CORTA) continue;
      utiles.push(MARCA_CORTA);
      continue;
    }
    if (linea.trim() === '' && utiles[utiles.length - 1] === MARCA_CORTA) continue;
    utiles.push(linea);
  }

  const arranque = utiles.findIndex((linea) => ARRANQUE_DEL_DOCUMENTO.test(linea.trim()));
  if (arranque === -1) return { texto: utiles.join('\n'), recortado: false };

  // Tres lineas: el titulo, el subtitulo con la tienda y la fecha, y la primera
  // clausula. Con eso se ve que la columna trae un documento de verdad.
  const cabeza = utiles.slice(0, arranque + 4);
  return {
    texto: cabeza.join('\n') + '\n\n[... aquí sigue el documento legal completo, que no entra en ' +
      'esta revisión: el texto de las cláusulas lo escribe el equipo legal y no se toca ...]',
    recortado: true,
  };
}

// --- Las piezas del cuadernillo ---------------------------------------------

/** El texto de la pantalla, en un bloque, con el marco alrededor explicado. */
function bloqueDePantalla(pantalla, campos) {
  const lineas = [];
  lineas.push('## Pantalla ' + pantalla.numero + ' · ' + pantalla.titulo, '');

  const marco = [];
  marco.push('`' + pantalla.pantalla + '`');
  marco.push(pantalla.ventana === 'celular' ? 'celular 390 × 844' : 'escritorio 1440 × 1000');
  marco.push(pantalla.idioma === 'pt' ? 'interfaz en portugués' : 'interfaz en español');
  lineas.push('*' + marco.join(' · ') + '*', '');

  lineas.push('**Qué hace el comercial aquí.** ' + pantalla.queHace, '');
  if (pantalla.nota) lineas.push('**Para leer la pantalla.** ' + pantalla.nota, '');

  const limpio = limpiarTexto(pantalla.texto.trim());
  lineas.push('**Lo que dice la pantalla, palabra por palabra:**', '');
  lineas.push('```');
  lineas.push(limpio.texto);
  lineas.push('```', '');

  const oculto = loQueNoSeVe(campos);
  if (oculto.length) {
    lineas.push('**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):', '');
    lineas.push(...oculto, '');
  }
  return lineas;
}

/**
 * Lo que la pantalla no muestra pero el comercial se va a encontrar: los
 * mensajes de validacion, el valor por defecto, la nota de cada opcion y el
 * aviso. Sin esto, la mitad del copy del producto no se revisa nunca, porque
 * solo aparece cuando algo sale mal.
 */
function loQueNoSeVe(campos) {
  const lineas = [];
  for (const campoId of campos) {
    const pregunta = PREGUNTAS[campoId];
    if (!pregunta) continue;
    const suyas = [];

    if (pregunta.porDefecto !== undefined) {
      suyas.push('- Viene marcada de entrada con: **' + pregunta.porDefecto + '**');
    }
    if (pregunta.ejemplo) suyas.push('- Dentro del campo, en gris: «' + pregunta.ejemplo + '»');
    if (pregunta.confirmacion) {
      suyas.push('- Cuando el dato está bien, debajo aparece: «' + pregunta.confirmacion + '»');
    }
    if (pregunta.aviso) suyas.push('- Aviso: «' + pregunta.aviso + '»');
    if (pregunta.razonDeshabilitado) {
      suyas.push('- Cuando una opción está bloqueada, dice: «' + pregunta.razonDeshabilitado + '»');
    }
    for (const llave of Object.keys(pregunta.errores || {})) {
      suyas.push('- Si ' + nombreDelError(llave) + ': «' + pregunta.errores[llave] + '»');
    }
    if (pregunta.sugerencias) {
      suyas.push('- Sugerencias que puede tocar: ' + pregunta.sugerencias.join(', '));
    }
    if (pregunta.camposPorTienda) {
      for (const llave of Object.keys(pregunta.camposPorTienda)) {
        const sub = pregunta.camposPorTienda[llave];
        suyas.push('- Columna «' + sub.pregunta + '»: ' + sub.ayuda);
      }
    }

    if (!suyas.length) continue;
    if (campos.length > 1) lineas.push('', '*En «' + (pregunta.pregunta || campoId) + '»:*');
    lineas.push(...suyas);
  }
  return lineas;
}

/**
 * El nombre de un error, en español de Juan y no de programador.
 *
 * Son las quince llaves que existen hoy en src/core/preguntas.js. Si aparece
 * una nueva, el cuadernillo la saca con su nombre crudo entre comillas, que se
 * nota enseguida al leerlo, y se agrega aqui.
 */
function nombreDelError(llave) {
  const nombres = {
    vacio: 'lo deja en blanco',
    rango: 'el número se sale del rango',
    orden: 'las fechas van al revés',
    cero: 'escribe cero',
    formato: 'lo escribe con otro formato',
    pasado: 'la fecha ya pasó',
    mayorQuePresupuesto: 'el número supera el presupuesto',
    cuantas: 'la cuenta no cuadra con lo que respondió antes',
    antes: 'la fecha queda antes de la que debía',
    fuera: 'la fecha queda fuera de la campaña',
    igual: 'repite un valor que ya eligió',
    largo: 'el texto es muy largo',
    minimo: 'el número es muy bajo',
    maximo: 'el número es muy alto',
    repetida: 'la respuesta está repetida',
  };
  return nombres[llave] || 'pasa «' + llave + '»';
}

/** Las preguntas propias de unos tipos, sin repetir las que ya se revisaron. */
function preguntasPropias(tipos, salvoLasDe) {
  const yaVistas = new Set();
  for (const tipoId of salvoLasDe || []) {
    for (const campo of (ESQUEMAS[tipoId] || {}).campos || []) yaVistas.add(campo.id);
  }

  const bloques = [];
  for (const tipoId of tipos) {
    const esquema = ESQUEMAS[tipoId];
    if (!esquema) continue;
    const propios = esquema.campos.filter((campo) => !yaVistas.has(campo.id));
    if (!propios.length) continue;

    const lineas = ['## ' + esquema.nombre + ': sus preguntas propias', ''];
    lineas.push(esquema.descripcion, '');
    lineas.push('Las otras ' + (esquema.campos.length - propios.length) + ' preguntas de este tipo ' +
      'son las mismas del Cashback y ya van en la tanda 2.', '');

    const porPaso = {};
    for (const campo of propios) {
      if (!porPaso[campo.paso]) porPaso[campo.paso] = [];
      porPaso[campo.paso].push(campo);
    }
    for (const paso of PASOS) {
      if (!porPaso[paso.id]) continue;
      lineas.push('### Paso: ' + paso.nombre, '');
      for (const campo of porPaso[paso.id]) {
        // La ficha de scripts/preguntas.js, con dos retoques para este documento.
        lineas.push(...ficha(campo.id, campo).map((linea) => {
          // Los pasos ya son ###, asi que la pregunta baja a #### para no
          // romper el indice.
          if (linea.indexOf('### ') === 0) return '#' + linea;
          // Y la llave cruda del error se dice como se dice en las pantallas.
          return linea.replace(/^- `([a-zA-Z]+)`: /, (todo, llave) =>
            '- Si ' + nombreDelError(llave) + ': ');
        }));
      }
    }
    // Lo que este tipo saca del formulario antes de empezar.
    for (const campo of propios) yaVistas.add(campo.id);
    bloques.push(lineas.join('\n'));
  }
  return bloques;
}

/** El filtro de entrada de un tipo: las preguntas que mandan a Legal. */
function bloqueDeFiltro(tipos) {
  const lineas = ['## Los filtros de entrada, en una lista', ''];
  lineas.push('Estas preguntas van antes del formulario. Un **sí** en cualquiera saca al ' +
    'comercial del producto y lo manda a la pantalla de Legal. Son, por lejos, las preguntas ' +
    'más caras de todo el recorrido: un "no" por no haber entendido publica un T&C que no ' +
    'corresponde, y un "sí" de más le devuelve a Legal un trabajo que la herramienta sabía hacer.', '');
  for (const tipoId of tipos) {
    const esquema = ESQUEMAS[tipoId];
    if (!esquema || !esquema.filtroDeEntrada) continue;
    lineas.push('**' + esquema.nombre + '**', '');
    for (const pregunta of esquema.filtroDeEntrada) lineas.push('- ' + pregunta);
    lineas.push('');
  }
  return lineas.join('\n');
}

/** Todos los mensajes de validacion del producto, juntos y de corrido. */
function bloqueDeValidaciones() {
  const lineas = ['## Todos los mensajes de validación, de corrido', ''];
  lineas.push('Cada uno sale debajo del campo, en rojo, mientras el comercial escribe. Leídos ' +
    'uno detrás de otro se nota si hablan igual, si alguno lo culpa a él y si alguno se queda ' +
    'en decir que está mal sin decir cómo se arregla.', '');
  lineas.push('| Pregunta | Cuándo sale | Qué dice |', '|---|---|---|');
  for (const campoId of Object.keys(PREGUNTAS)) {
    const pregunta = PREGUNTAS[campoId];
    for (const llave of Object.keys(pregunta.errores || {})) {
      lineas.push('| ' + (pregunta.pregunta || campoId) + ' | ' + nombreDelError(llave) +
        ' | ' + pregunta.errores[llave].replace(/\|/g, '\\|') + ' |');
    }
  }
  lineas.push('');
  return lineas.join('\n');
}

/** Lo que el comercial lee cuando Google falla. */
function bloqueDeFallas() {
  const ruta = rutaDesdeRaiz('src', 'core', 'mensajes_de_falla.js');
  const fuente = leerTexto(ruta);
  const lineas = ['## Lo que se lee cuando Google falla', ''];
  lineas.push('La herramienta corre sobre Google Apps Script. Cuando Google falla, el mensaje ' +
    'crudo viene en inglés y habla de Google, no de la campaña. Estos son los textos con los ' +
    'que se reemplaza. Lo que importa de cada uno: si dice si se perdió lo que ya respondió, y ' +
    'si dice qué hacer ahora.', '');
  const mensajes = fuente.match(/mensaje:\s*(?:'[^']*'(?:\s*\+\s*\n?\s*'[^']*')*)/g) || [];
  for (const crudo of mensajes) {
    const texto = (crudo.match(/'([^']*)'/g) || []).map((t) => t.slice(1, -1)).join('');
    lineas.push('- «' + texto + '»');
  }
  lineas.push('');
  return lineas.join('\n');
}

/** El diccionario entero de la traduccion al portugues. */
function bloqueDeDiccionario() {
  const { TEXTOS_PT } = require('../src/core/textos_interfaz.js');
  const lineas = ['## El diccionario del portugués, entero', ''];
  lineas.push('A la izquierda, el texto en español que dibuja la interfaz. A la derecha, lo que ' +
    'lee un KAM de São Paulo. Son ' + Object.keys(TEXTOS_PT).length + ' textos. Lo que se revisa ' +
    'aquí es el portugués: si suena a portugués de Brasil o a español traducido, y si alguno ' +
    'cambió el sentido por el camino.', '');
  lineas.push('| En español | En portugués |', '|---|---|');
  for (const llave of Object.keys(TEXTOS_PT)) {
    lineas.push('| ' + llave.replace(/\|/g, '\\|') + ' | ' + String(TEXTOS_PT[llave]).replace(/\|/g, '\\|') + ' |');
  }
  lineas.push('');
  return lineas.join('\n');
}

// --- El armado ---------------------------------------------------------------

function armarTanda(tanda, numero, indice, total) {
  const lineas = [];
  lineas.push('# Tanda ' + numero + ' de ' + total + ' · ' + tanda.titulo, '');
  lineas.push('> **Antes de pegar esto, pega `PROMPT.md`.** Ahí va quién revisa, qué es');
  lineas.push('> RappiMind, qué no se puede tocar y en qué formato tiene que venir la');
  lineas.push('> respuesta. Sin eso, la revisión vuelve en prosa y no se puede aplicar.', '');
  lineas.push(tanda.deQueVa, '');

  lineas.push('## Lo que hay que mirar en esta tanda', '');
  for (const punto of tanda.mirar) lineas.push('- ' + punto);
  lineas.push('');

  const pantallas = (tanda.pantallas || []).map((id) => {
    const pantalla = indice[id];
    if (!pantalla) throw new Error('la tanda "' + tanda.id + '" pide la pantalla "' + id + '", que no está en pantallas.json');
    return pantalla;
  });

  if (pantallas.length) {
    lineas.push('Van ' + pantallas.length + ' pantallas, con su texto tal como se lee en la aplicación.', '');

    const conFoto = pantallas.filter((pantalla) => pantalla.valeFoto);
    if (conFoto.length) {
      lineas.push('');
      lineas.push('**Las pantallas que vale la pena fotografiar en esta tanda.** Claude chat lee');
      lineas.push('imágenes pero no dibuja HTML, así que una foto es lo único que le deja juzgar');
      lineas.push('el aire, la jerarquía y el tamaño de los botones. Las tomas tú, de la');
      lineas.push('aplicación, y las adjuntas en el mismo mensaje:', '');
      for (const pantalla of conFoto) {
        lineas.push('- Pantalla ' + pantalla.numero + ', ' + pantalla.titulo +
          (pantalla.idioma === 'pt' ? ' (con la interfaz en portugués)' : ''));
      }
      lineas.push('');
      lineas.push('Las demás pantallas de esta tanda son la misma forma con otro texto, y el texto');
      lineas.push('ya va completo abajo. Si no adjuntas ninguna foto, la revisión igual funciona:');
      lineas.push('pierdes lo visual, no el copy.', '');
    }

    lineas.push('---', '');
    for (const pantalla of pantallas) {
      lineas.push(...bloqueDePantalla(pantalla, CAMPOS_DE_LA_PANTALLA[pantalla.id] || []));
      lineas.push('---', '');
    }
  }

  if (tanda.filtrosDe) lineas.push(bloqueDeFiltro(tanda.filtrosDe), '---', '');
  if (tanda.preguntasDe) {
    for (const bloque of preguntasPropias(tanda.preguntasDe, tanda.salvoLasDe)) {
      lineas.push(bloque, '---', '');
    }
  }
  if (tanda.diccionarioPt) lineas.push(bloqueDeDiccionario(), '---', '');
  if (tanda.validaciones) lineas.push(bloqueDeValidaciones(), '---', '');
  if (tanda.fallas) lineas.push(bloqueDeFallas(), '---', '');

  lineas.push('## Fin de la tanda ' + numero, '');
  lineas.push('Responde con las fichas de hallazgo en el formato del prompt, la tabla de cierre');
  lineas.push('y las tres preguntas para Juan. Si algo está bien, dilo en una línea y sigue: lo');
  lineas.push('que no tiene ficha se da por aprobado.', '');

  return lineas.join('\n');
}

function main() {
  if (!fs.existsSync(PANTALLAS)) {
    console.error('Falta docs/revision/pantallas.json. Corre primero:');
    console.error('  NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run front');
    return 1;
  }

  const datos = JSON.parse(leerTexto(PANTALLAS));
  const indice = {};
  for (const pantalla of datos.pantallas) indice[pantalla.id] = pantalla;

  asegurarCarpeta(CARPETA);

  const archivos = [];
  const usadas = new Set();
  TANDAS.forEach((tanda, posicion) => {
    const numero = posicion + 1;
    const nombre = 'tanda-' + numero + '-' + tanda.id + '.md';
    const texto = armarTanda(tanda, numero, indice, TANDAS.length);
    escribirTexto(path.join(CARPETA, nombre), texto);
    for (const id of tanda.pantallas || []) usadas.add(id);
    const suyas = (tanda.pantallas || []).map((id) => indice[id]);
    archivos.push({
      nombre: nombre,
      numero: numero,
      tanda: tanda,
      kb: Math.round(texto.length / 1024),
      pantallas: suyas.length,
      fotos: suyas.filter((pantalla) => pantalla.valeFoto).length,
      nombresDeFotos: suyas.filter((pantalla) => pantalla.valeFoto)
        .map((pantalla) => 'pantalla ' + pantalla.numero + ', ' + pantalla.titulo),
      preguntas: (texto.match(/^#### /gm) || []).length,
    });
  });

  escribirTexto(path.join(CARPETA, 'PROMPT.md'), require('./lib/revision-prompt').prompt({
    tandas: archivos,
    pantallas: datos.pantallas.length,
  }));
  escribirTexto(path.join(CARPETA, 'LEEME.md'), require('./lib/revision-prompt').leeme({
    tandas: archivos,
    pantallas: datos.pantallas.length,
    fotos: datos.pantallas.filter((pantalla) => pantalla.valeFoto).length,
    generado: datos.generado,
    commit: datos.commit,
  }));

  console.log('docs/revision/ generado desde el recorrido del ' + datos.generado +
    ' (commit ' + datos.commit + '):\n');
  console.log('  LEEME.md    cómo lo usa Juan');
  console.log('  PROMPT.md   lo que se pega al empezar cada tanda');
  for (const archivo of archivos) {
    console.log('  ' + archivo.nombre.padEnd(30) + archivo.kb + ' KB');
  }

  const sueltas = datos.pantallas.filter((pantalla) =>
    !usadas.has(pantalla.id) && !FUERA_DE_REVISION[pantalla.id]);
  if (sueltas.length) {
    console.log('\nPantallas que no quedaron en ninguna tanda. Agrégalas a TANDAS, o a');
    console.log('FUERA_DE_REVISION con el motivo si de verdad no se revisan:');
    for (const pantalla of sueltas) console.log('  ' + pantalla.id + ' · ' + pantalla.titulo);
    return 1;
  }

  const fuera = Object.keys(FUERA_DE_REVISION).length;
  if (fuera) console.log('\n' + fuera + ' pantallas quedan fuera a propósito (ver FUERA_DE_REVISION).');
  return 0;
}

module.exports = { TANDAS, FUERA_DE_REVISION, CAMPOS_DE_LA_PANTALLA, CARPETA, main };

if (require.main === module) process.exit(main());
