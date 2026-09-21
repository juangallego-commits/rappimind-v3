'use strict';

/**
 * Genera docs/FRONT_ACTUAL.html: el front tal como se ve, pantalla por
 * pantalla, en un solo archivo para subir como contexto a Claude chat.
 *
 * No es una maqueta ni una descripcion. Levanta la demostracion de un solo
 * archivo (la misma de `npm run demo`, con el motor real de src/core), la
 * recorre con un navegador sin interfaz respondiendo una campana de ejemplo, y
 * por cada pantalla guarda el DOM tal como quedo. La hoja de estilos real se
 * reescribe para que cada regla valga solo dentro de su marco
 * (scripts/lib/estilos-acotados.js), asi que las pantallas se ven como se ven
 * en la aplicacion aunque esten pegadas una debajo de otra.
 *
 * El archivo que sale no lleva JavaScript: es HTML inerte, se abre con doble
 * clic y se puede subir a un proyecto de Claude chat.
 *
 * Como correrlo (arma la demostracion el solo, no hace falta `npm run demo`):
 *   export NODE_PATH=/opt/node22/lib/node_modules    (donde este playwright)
 *   export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers (donde este Chromium)
 *   npm run front
 *
 * Si una pantalla no se puede alcanzar, el script lo dice y sigue con la
 * siguiente: una pantalla que falta se nota, un script que revienta a mitad de
 * camino deja las otras cuarenta sin hacer.
 */

const fs = require('fs');
const path = require('path');
const { rutaDesdeRaiz, leerTexto, escribirTexto, asegurarCarpeta } = require('./lib/archivos');
const { hojaCompleta } = require('./lib/hoja-completa');

const RAIZ = rutaDesdeRaiz();
const SALIDA = rutaDesdeRaiz('docs', 'FRONT_ACTUAL.html');

/**
 * El mismo recorrido, en texto plano y por pantalla.
 *
 * Lo escribe este script porque el recorrido cuesta un navegador y dos minutos,
 * y `npm run revision` arma el cuadernillo de tandas leyendo de aqui, sin
 * navegador. Asi las tandas se pueden reescribir cuantas veces haga falta sin
 * volver a recorrer, y nunca cuentan una pantalla distinta de la del HTML.
 */
const SALIDA_PANTALLAS = rutaDesdeRaiz('docs', 'revision', 'pantallas.json');

const MARCA_VISTA_PREVIA =
  'Aquí va la vista previa del documento, que se llena mientras el comercial responde. ' +
  'Sale completa en tres pantallas (la del país, la del porcentaje y el resumen ya completo). ' +
  'En las demás se marca así para no repetir el mismo T&C treinta veces: el texto legal vive en modelos/.';

const MARCA_DOCUMENTO =
  'Aquí va el documento generado, completo. Es el mismo texto que se ve en la vista previa del ' +
  'resumen ya completo, unas pantallas más arriba.';

/**
 * Las pantallas del documento, en orden.
 *
 * `queHace` es lo que hace el comercial ahi. Las primeras salieron de la
 * revision del front de septiembre de 2026, que ya se borro; de ahi vienen
 * algunas con esas mismas palabras. `nota` es lo que hay que saber para leer
 * el marco.
 */
const PARTES = [
  {
    titulo: 'El recorrido del comercial',
    entrada:
      'Una campaña de Cashback en Colombia, de principio a fin, respondida como la respondería un ' +
      'KAM: tienda Farmatodo, 20% con tope de $20.000 y presupuesto de $5.000.000, del 1 al 31 de ' +
      'octubre de 2026. Los datos son inventados.',
    pantallas: [
      {
        id: 'inicio', valeFoto: true, titulo: 'Inicio', pantalla: 'inicio',
        queHace: 'Es la primera pantalla. El comercial lee la promesa de la herramienta en tres pasos y decide si arranca una campaña nueva o retoma el borrador que dejó a medias. El botón de seguir el borrador solo aparece si hay algo guardado.',
      },
      {
        id: 'filtro', valeFoto: true, titulo: 'Filtro de entrada', pantalla: 'filtro',
        queHace: 'Responde dos preguntas generales. Si contesta que sí a cualquiera, la herramienta lo manda a la pantalla de Legal y no sigue. Si contesta que no a las dos, entra al formulario.',
      },
      {
        id: 'pais', valeFoto: true, titulo: 'Formulario, el país', pantalla: 'pasos', vistaPreviaCompleta: true,
        queHace: 'Primera pregunta del formulario. Elige el país de la campaña. Colombia viene marcada, pero la pregunta se muestra igual y él la tiene que confirmar. Los países en piloto lo dicen en la opción.',
        nota: 'Aquí la vista previa va completa: es el documento todavía vacío, con los huecos grises que dicen qué falta.',
      },
      {
        id: 'negocio', titulo: 'Formulario, el negocio', pantalla: 'pasos',
        queHace: 'Dice si la campaña es de Rappi o de Rappi Travel. Es la bifurcación grande del recorrido: elegir Travel lo lleva a otro filtro y a otros tipos de campaña.',
      },
      {
        id: 'tipos', valeFoto: true, titulo: 'Formulario, el tipo de campaña de Rappi', pantalla: 'pasos',
        queHace: 'Elige el tipo de campaña entre tarjetas con nombre y descripción. Los tipos de Travel no aparecen en esta lista.',
        nota: 'Debajo de los tipos, separado por una línea, está el atajo a los T&C que Legal ya publicó.',
      },
      {
        id: 'tienda', titulo: 'Formulario, la tienda', pantalla: 'pasos',
        queHace: 'Escribe la marca comercial de la tienda. Es la primera pregunta después de elegir el tipo, y desde aquí la columna de la derecha empieza a llenarse con el documento.',
      },
      {
        id: 'tienda-turbo', titulo: 'Formulario, en cuál de sus tiendas', pantalla: 'pasos',
        queHace: 'Dice en cuál de las dos tiendas de la marca se gana el cashback: la normal, la de Turbo, las dos, o si no tiene tienda en Turbo. De aquí sale una frase de la cláusula de tienda participante.',
      },
      {
        id: 'cobertura', titulo: 'Formulario, la cobertura', pantalla: 'pasos',
        queHace: 'Dice si la campaña corre en todo el país o solo en algunas ciudades. Aquí aparece por primera vez la línea "Así queda en tu T&C", que le muestra la frase exacta que va al documento.',
      },
      {
        id: 'organizador', titulo: 'Formulario, quién organiza', pantalla: 'pasos',
        queHace: 'Escribe la razón social de la empresa que paga el beneficio. Es el Organizador, y nunca es Rappi.',
      },
      {
        id: 'identificacion', valeFoto: true, titulo: 'Formulario, la identificación del organizador', pantalla: 'pasos',
        queHace: 'Escribe el NIT del organizador. El sistema lo valida y lo muestra formateado como va a quedar en el documento.',
      },
      {
        id: 'fecha-inicio', titulo: 'Formulario, cuándo arranca', pantalla: 'pasos',
        queHace: 'Elige el día de inicio de la campaña. Al responderlo, la herramienta propone el mismo día como día de fin.',
      },
      {
        id: 'porcentaje', valeFoto: true, titulo: 'Formulario, el porcentaje', pantalla: 'pasos', vistaPreviaCompleta: true,
        queHace: 'Escribe el porcentaje que la tienda devuelve en Créditos. Es la promesa central de la campaña.',
        nota: 'Aquí la vista previa va completa: el documento a medio llenar, con lo respondido escrito y lo que falta en gris. En la aplicación, la frase que acaba de cambiar se resalta en naranja un segundo y se apaga sola.',
      },
      {
        id: 'tope', titulo: 'Formulario, el tope por pedido', pantalla: 'pasos',
        queHace: 'Escribe el máximo de Créditos que puede recibir una persona por pedido. Abajo aparece la calculadora con un ejemplo.',
      },
      {
        id: 'presupuesto', titulo: 'Formulario, el presupuesto', pantalla: 'pasos',
        queHace: 'Escribe la plata total de la campaña. Cuando se agota, la campaña termina sola y el documento lo dice.',
      },
      {
        id: 'veces', valeFoto: true, titulo: 'Formulario, cuántas veces puede ganar', pantalla: 'pasos',
        queHace: 'Elige si el beneficio se puede repetir por persona. Si elige varias veces, aparece un campo extra para decir cuántas.',
      },
      {
        id: 'carga', titulo: 'Formulario, cuándo llegan los Créditos', pantalla: 'pasos',
        queHace: 'Elige en qué momento se le acreditan los Créditos al usuario.',
      },
      {
        id: 'vigencia', titulo: 'Formulario, hasta cuándo sirven los Créditos', pantalla: 'pasos',
        queHace: 'Elige hasta cuándo puede gastarlos. Según lo que responda, la herramienta le pide después una fecha o un número de días.',
      },
      {
        id: 'redencion', titulo: 'Formulario, dónde se gastan los Créditos', pantalla: 'pasos',
        queHace: 'Elige en qué parte de la app se pueden usar esos Créditos.',
      },
      {
        id: 'segmento', titulo: 'Formulario, quién participa', pantalla: 'pasos',
        queHace: 'Elige a qué usuarios les aplica la campaña.',
      },
      {
        id: 'medio-de-pago', titulo: 'Formulario, el medio de pago', pantalla: 'pasos',
        queHace: 'Elige con qué medios de pago aplica el beneficio.',
      },
      {
        id: 'compra-minima', titulo: 'Formulario, la compra mínima', pantalla: 'pasos',
        queHace: 'La única marcada como opcional en este paso. Puede dejarla vacía y seguir.',
      },
      {
        id: 'categoria-producto', titulo: 'Formulario, la categoría del producto', pantalla: 'pasos',
        queHace: 'La última pregunta, y la única que no cambia nada del T&C: decide la leyenda que va dentro de la pieza publicitaria. Viene marcada en Ninguna, que es la respuesta de casi todas las campañas, y cada opción adelanta la advertencia que se va a imprimir. Si elige un medicamento se abren dos preguntas más, el registro sanitario y la notificación ante el INVIMA.',
        nota: 'Las opciones no están escritas en ningún esquema: salen del catálogo de modelos/leyendas/, así que cada país ofrece solo las categorías para las que Legal tiene una leyenda aprobada. Colombia ofrece diez; México, cinco; Uruguay, Costa Rica y Brasil, ninguna, y ahí la pregunta no aparece.',
      },
      {
        id: 'resumen', valeFoto: true, titulo: 'Resumen, con algo pendiente', pantalla: 'resumen',
        queHace: 'Revisa todo lo que respondió, agrupado por paso, y puede editar cualquier grupo. Mientras falte algo, el botón de generar está deshabilitado y la lista "Te falta" dice qué es, en palabras.',
      },
      {
        id: 'resumen-completo', titulo: 'Resumen, ya completo', pantalla: 'resumen', vistaPreviaCompleta: true,
        queHace: 'La misma pantalla con la declaración marcada. Con eso se habilita el botón de generar.',
        nota: 'Aquí la vista previa va completa: es el documento entero, tal como va a salir. Cero llaves, cero corchetes, cero huecos.',
      },
      {
        id: 'listo', valeFoto: true, titulo: 'Listo', pantalla: 'listo',
        queHace: 'Es la pantalla donde el comercial deja la herramienta y se va a publicar. Recibe el documento, el título y la dirección listos para copiar, el paso a paso de Squarespace y la lista de quién puede publicar en su país.',
        nota: 'Esta es la versión de producción de la pantalla, no la de la demostración: el enlace del Doc es de ejemplo, lo demás es literal.',
      },
      {
        id: 'historial', valeFoto: true, titulo: 'Mis campañas', pantalla: 'historial',
        queHace: 'Busca sus campañas anteriores, abre otra vez un documento, marca una campaña como publicada o arranca una nueva copiando los datos de otra con "Usar como base".',
      },
      {
        id: 'ayuda', valeFoto: true, titulo: 'Ayuda', pantalla: 'ayuda',
        queHace: 'Consulta qué dinámicas sirven y cuáles no, cómo se publica en Squarespace, quién publica en cada país, qué hacer si algo sale mal, a quién escribirle y las preguntas frecuentes.',
      },
    ],
  },
  {
    titulo: 'Los otros caminos',
    entrada:
      'Lo que no sale en el recorrido de arriba: la pantalla de Legal, Rappi Travel, los T&C que ' +
      'Legal ya publicó, un país en piloto, otros dos tipos de campaña, un error en vivo, ampliar ' +
      'una campaña publicada y la pantalla de administración.',
    pantallas: [
      {
        id: 'legal', valeFoto: true, titulo: 'Legal', pantalla: 'legal',
        queHace: 'Es a donde llega cuando su caso lo tiene que redactar un abogado. Lee el motivo concreto y va al formulario de Legal.',
      },
      {
        id: 'filtro-travel', valeFoto: true, titulo: 'Filtro de Rappi Travel', pantalla: 'filtroTravel',
        queHace: 'Solo lo ve quien eligió Rappi Travel. Responde nueve preguntas antes de poder elegir el tipo. Tiene una salida propia para quien entró por equivocación.',
      },
      {
        id: 'tipos-travel', titulo: 'Formulario, el tipo de campaña de Rappi Travel', pantalla: 'pasos',
        queHace: 'Después de pasar el filtro vuelve al formulario, con la pregunta del tipo abierta y solo los tipos de Travel.',
      },
      {
        id: 'tyc-filtro', valeFoto: true, titulo: 'Los T&C que Legal ya publicó, el filtro', pantalla: 'pasos',
        queHace: 'Seis preguntas de sí o no antes de dar ningún enlace. Sirven para saber si la campaña de verdad cabe en un T&C general: un sí puede devolverlo a los tipos, llevarlo a Legal o señalarle cuál de los generales es el suyo.',
      },
      {
        id: 'tyc-generales', valeFoto: true, titulo: 'Los T&C que Legal ya publicó, la lista', pantalla: 'pasos',
        queHace: 'Entra por el atajo que va por encima de los tipos, después de pasar el filtro. Si su campaña es un descuento o un cupón corriente, no tiene que generar nada: ya hay un T&C publicado y solo necesita el enlace.',
      },
      {
        id: 'tyc-detalle', titulo: 'Los T&C que Legal ya publicó, uno con pendiente', pantalla: 'pasos',
        queHace: 'Abre uno de la lista y recibe el enlace para la pieza. Cuando Legal dejó algo por confirmar, lo lee antes del enlace, no después.',
      },
      {
        id: 'pais-en-pruebas', titulo: 'Formulario en un país en piloto', pantalla: 'pasos',
        queHace: 'Elige México, que está en piloto. El aviso de no publicar todavía lo acompaña en el formulario, en el resumen y en la pantalla final.',
      },
      {
        id: 'cashback-day', valeFoto: true, titulo: 'Formulario, Cashback Multitienda y su lista de tiendas', pantalla: 'pasos',
        queHace: 'En un Cashback Multitienda el beneficio es de varias tiendas dentro de la misma jornada, y cada una organiza lo suyo con su porcentaje, su tope y su presupuesto. La herramienta le pide la lista y le deja pegarla desde Excel.',
        nota: 'Las tres tiendas del marco se pegaron desde el desplegable "Pegar varias tiendas desde Excel", que es como llega una lista de verdad.',
      },
      {
        id: 'carrera-productos', valeFoto: true, titulo: 'Formulario, los productos de la Carrera', pantalla: 'pasos',
        queHace: 'Cuando participan productos específicos, cada uno entra con su nombre y su código de barras EAN. El EAN se revisa entero, con su dígito de control, y el documento nombra los productos uno por uno.',
      },
      {
        id: 'eta-tiendas', valeFoto: true, titulo: 'Formulario, las tiendas de Turbo del cashback por ETA', pantalla: 'pasos',
        queHace: 'Casi todas estas campañas corren en toda una categoría del botón Turbo, normalmente Turbo Restaurantes, y ahí el documento la nombra y no pide ninguna lista. Esta es la otra forma: cuando corre en unas tiendas concretas, las dark stores de una zona, el documento las nombra una por una.',
        nota: 'La pregunta que decide entre las dos es "¿En qué corre la campaña?", justo después de la ciudad.',
      },
      {
        id: 'carrera', valeFoto: true, titulo: 'Formulario, Carrera de Compras con una opción bloqueada', pantalla: 'pasos',
        queHace: 'En una Carrera de Compras el desempate no puede ser el mismo criterio con el que se elige al ganador. La opción se queda a la vista, bloqueada y con su razón: entender por qué no puede es parte de la respuesta.',
      },
      {
        id: 'error', valeFoto: true, titulo: 'Formulario, un error en vivo', pantalla: 'pasos',
        queHace: 'Escribe un NIT que no existe. El error sale debajo del campo mientras escribe, sin redibujar la pantalla y sin regañarlo antes de tiempo.',
      },
      {
        id: 'acuerdo-datos', titulo: 'Formulario, el acuerdo de transferencia de datos', pantalla: 'pasos',
        queHace: 'Solo sale en Carrera de Compras cuando el premio es físico y lo entrega el Organizador, que es la única combinación en la que Rappi le pasa a la marca el nombre, la dirección y el documento del ganador. Al responder "No, o no sé" se abre el circuito completo de Colombia, con la tabla de acuerdos marco, la Orden de Transferencia de cada campaña y el certificado de supresión.',
        nota: 'No bloquea el T&C: los datos salen semanas después, cuando el concurso terminó, así que el documento se genera igual y lo que recibe el comercial es el camino para firmarlo. En los otros países el panel es una línea y el botón abre el modelo de Legal de ese país; en Chile y Costa Rica, que no tienen modelo, manda a Legal.',
      },
      {
        id: 'ampliar', titulo: 'Mis campañas, ampliar una publicada', pantalla: 'historial',
        queHace: 'Una campaña publicada y en curso se puede ampliar: la vigencia solo se mueve hacia adelante y los números solo suben, porque bajarlos cambiaría las condiciones de quien ya compró.',
      },
      {
        id: 'admin', valeFoto: true, titulo: 'Administración', pantalla: 'admin',
        queHace: 'No es del recorrido del comercial: la ve quien tiene rol de administrador. Países y su estado, el equipo y las solicitudes, con su descarga.',
      },
    ],
  },
  {
    titulo: 'La interfaz en portugués',
    entrada:
      'El selector ES/BR, abajo a la derecha, cambia el idioma de la interfaz. Nunca el del ' +
      'documento, que sale siempre en el idioma del país.',
    pantallas: [
      {
        id: 'pt-inicio', titulo: 'Inicio, interfaz en portugués', pantalla: 'inicio', idioma: 'pt',
        queHace: 'La misma pantalla de inicio después de tocar BR en el selector de idioma, abajo a la derecha. Cambia el idioma de la interfaz, no el del documento.',
      },
      {
        id: 'pt-filtro', titulo: 'Filtro de entrada, interfaz en portugués', pantalla: 'filtro', idioma: 'pt',
        queHace: 'Las dos preguntas generales con la interfaz en portugués.',
      },
      {
        id: 'pt-tipos', valeFoto: true, titulo: 'Formulario en portugués, el tipo de campaña', pantalla: 'pasos', idioma: 'pt',
        queHace: 'Los tipos disponibles en Brasil, con la interfaz en portugués.',
      },
    ],
  },
  {
    titulo: 'En celular',
    entrada:
      'La misma aplicación en una pantalla de 390 por 844. La columna del documento no cabe, así ' +
      'que se guarda detrás de un botón fijo abajo y sale en una hoja deslizable.',
    pantallas: [
      {
        id: 'celular-inicio', titulo: 'Inicio en celular', pantalla: 'inicio', ventana: 'celular',
        queHace: 'La portada en celular. La barra de arriba se desliza de lado y el selector de idioma sube para no taparle nada.',
      },
      {
        id: 'celular-pregunta', valeFoto: true, titulo: 'Una pregunta en celular', pantalla: 'pasos', ventana: 'celular',
        queHace: 'Una pregunta del formulario en celular. La barra de progreso se vuelve "Paso 2 de 7" y el documento se va a un botón fijo abajo.',
      },
      {
        id: 'celular-hoja', valeFoto: true, titulo: 'El documento en la hoja deslizable', pantalla: 'pasos', ventana: 'celular',
        queHace: 'Toca "Ver cómo va mi T&C" y el documento sube en una hoja deslizable, con la cortina detrás y el botón de cerrar abajo.',
        nota: 'La hoja lleva el mismo documento de la columna de escritorio, así que aquí va marcado. Lo que importa de esta pantalla es la hoja, no el texto.',
      },
    ],
  },
];

/** Todas las pantallas, aplanadas, con su numero y su ancla. */
function fichasDePantalla() {
  const fichas = [];
  let numero = 0;
  for (const parte of PARTES) {
    for (const pantalla of parte.pantallas) {
      numero += 1;
      fichas.push(Object.assign({}, pantalla, {
        numero: numero,
        parte: parte.titulo,
        ancla: 'p' + String(numero).padStart(2, '0'),
        ventana: pantalla.ventana || 'escritorio',
        idioma: pantalla.idioma || 'es',
      }));
    }
  }
  return fichas;
}

/** El commit y la rama, leidos del repositorio sin llamar a git. */
function versionDelRepositorio() {
  const carpeta = rutaDesdeRaiz('.git');
  const sinDatos = { commit: 'sin commit', rama: 'sin rama' };
  try {
    const cabeza = fs.readFileSync(path.join(carpeta, 'HEAD'), 'utf8').trim();
    if (cabeza.indexOf('ref: ') !== 0) return { commit: cabeza.slice(0, 7), rama: 'cabeza suelta' };
    const referencia = cabeza.slice(5).trim();
    const rama = referencia.replace('refs/heads/', '');
    const archivo = path.join(carpeta, referencia);
    if (fs.existsSync(archivo)) {
      return { commit: fs.readFileSync(archivo, 'utf8').trim().slice(0, 7), rama: rama };
    }
    const empacadas = path.join(carpeta, 'packed-refs');
    if (fs.existsSync(empacadas)) {
      for (const linea of fs.readFileSync(empacadas, 'utf8').split('\n')) {
        const partes = linea.trim().split(' ');
        if (partes[1] === referencia) return { commit: partes[0].slice(0, 7), rama: rama };
      }
    }
    return { commit: sinDatos.commit, rama: rama };
  } catch (error) {
    return sinDatos;
  }
}

function contarLineas(relativa) {
  const completa = rutaDesdeRaiz(...relativa.split('/'));
  if (!fs.existsSync(completa)) return null;
  return leerTexto(completa).split('\n').length;
}

async function main() {
  // La demostracion se vuelve a armar siempre: un documento que describe el
  // front tiene que describir el front de ahora, no el de la ultima vez.
  require('./demo').main();

  const fichas = fichasDePantalla();
  const version = versionDelRepositorio();

  console.log('\nRecorriendo la demostración para ' + fichas.length + ' pantallas...\n');
  const { recorrer } = require('./lib/front-recorrido');
  const recorrido = await recorrer(path.join(RAIZ, 'demo', 'index.html'), fichas, {
    vistaPrevia: MARCA_VISTA_PREVIA,
    documento: MARCA_DOCUMENTO,
  });

  const { armar, ARCHIVOS_DEL_FRONT } = require('./lib/front-documento');
  const lineas = {};
  for (const [archivo] of ARCHIVOS_DEL_FRONT) lineas[archivo] = contarLineas(archivo);

  const documento = armar({
    fecha: new Date(),
    commit: version.commit,
    rama: version.rama,
    partes: PARTES,
    fichas: fichas,
    capturas: recorrido.capturas,
    fallas: recorrido.fallas,
    // Con la letra incrustada. El comentario de hoja-completa.js decía que aquí
    // solo interesa el texto de las reglas, y eso dejó de ser cierto el día que
    // este documento pasó a ser la prueba visual de un cambio de tipografía: sin
    // incrustar, la url() relativa del @font-face resuelve fuera de docs/ y la
    // letra de marca no se ve en ninguna de las 48 pantallas. Cuesta 28 KB en un
    // archivo que solo se abre en local.
    estilos: hojaCompleta({ incrustarFuentes: true }),
    plantilla: leerTexto(rutaDesdeRaiz('src', 'client', 'Index.html')),
    lineas: lineas,
  });

  asegurarCarpeta(path.dirname(SALIDA));
  escribirTexto(SALIDA, documento);

  asegurarCarpeta(path.dirname(SALIDA_PANTALLAS));
  escribirTexto(SALIDA_PANTALLAS, JSON.stringify({
    generado: new Date().toISOString().slice(0, 10),
    commit: version.commit,
    rama: version.rama,
    partes: PARTES.map((parte) => ({ titulo: parte.titulo, entrada: parte.entrada })),
    pantallas: fichas
      .filter((ficha) => recorrido.textos[ficha.id])
      .map((ficha) => ({
        id: ficha.id,
        numero: ficha.numero,
        titulo: ficha.titulo,
        parte: ficha.parte,
        pantalla: ficha.pantalla,
        ventana: ficha.ventana,
        idioma: ficha.idioma,
        queHace: ficha.queHace,
        nota: ficha.nota || '',
        valeFoto: !!ficha.valeFoto,
        texto: recorrido.textos[ficha.id],
      })),
  }, null, 2) + '\n');

  const hechas = Object.keys(recorrido.capturas).length;
  console.log('\ndocs/FRONT_ACTUAL.html generado: ' + Math.round(documento.length / 1024) + ' KB, ' +
    hechas + ' de ' + fichas.length + ' pantallas, un solo archivo y sin JavaScript.');
  console.log('docs/revision/pantallas.json generado: el texto de las ' + hechas +
    ' pantallas, para `npm run revision`.');
  if (recorrido.fallas.length) {
    console.log('\nNo se pudieron alcanzar:');
    for (const falla of recorrido.fallas) console.log('  ' + falla.id + ': ' + falla.motivo);
  }
  if (recorrido.erroresDeJs.length) {
    console.log('\nErrores de JavaScript en la aplicación (esto sí es un defecto):');
    for (const error of recorrido.erroresDeJs) console.log('  ' + error);
  }
  return recorrido.fallas.length || recorrido.erroresDeJs.length ? 1 : 0;
}

module.exports = {
  PARTES, fichasDePantalla, SALIDA, SALIDA_PANTALLAS, main,
  MARCA_VISTA_PREVIA, MARCA_DOCUMENTO, versionDelRepositorio,
};

if (require.main === module) {
  main().then((codigo) => process.exit(codigo)).catch((error) => {
    console.error('Se rompió la generación: ' + error.message);
    console.error(error.stack);
    process.exit(1);
  });
}
