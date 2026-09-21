'use strict';

/**
 * Arma docs/FRONT_ACTUAL.html con las pantallas ya congeladas.
 *
 * El archivo que sale no lleva JavaScript. Cada pantalla es el DOM de verdad
 * dentro de un marco, y la hoja de estilos real va acotada a ese marco, asi
 * que las pantallas se ven como en la aplicacion aunque esten una debajo de
 * otra. Quien lo lea, persona o Claude chat, lee el texto literal de la
 * interfaz, no un resumen.
 */

const { acotarEstilos } = require('./estilos-acotados');

/** El marco de cada pantalla. Toda la hoja de estilos de la app cuelga de aqui. */
const MARCO = '.rm-pantalla';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fechaEnPalabras(fecha) {
  return fecha.getDate() + ' de ' + MESES[fecha.getMonth()] + ' de ' + fecha.getFullYear();
}

/** Donde se cambia cada cosa que se ve. Es el anexo mas util para Claude chat. */
const DONDE_VIVE_CADA_TEXTO = [
  ['El enunciado, la ayuda y el "¿Por qué te preguntamos esto?" de cada pregunta', 'src/core/preguntas.js'],
  ['Esas mismas preguntas en portugués', 'src/core/preguntas_pt.js'],
  ['El nombre, la descripción y las preguntas de cada tipo de campaña', 'src/core/esquemas.js'],
  ['Cualquier otro texto de la interfaz en español (botones, títulos, avisos)', 'el archivo de src/client/js/ que dibuja esa pantalla'],
  ['La traducción al portugués de esos textos', 'src/core/textos_interfaz.js'],
  ['Todo el contenido de la pantalla de Ayuda y las nueve preguntas del filtro de Travel', 'src/core/ayuda.js'],
  ['La lista de países, su estado (activo, piloto, bloqueado) y sus datos legales', 'data/paises.json'],
  ['Los T&C que Legal ya publicó, con su enlace y sus pendientes', 'data/tyc_genericos.json'],
  ['Las secciones de la app', 'data/secciones.json'],
  ['El texto legal del documento', 'modelos/ y modelos/bloques/'],
  ['Las reglas de validación de un dato (NIT, fechas, números)', 'src/core/validaciones.js'],
  ['Las frases que un dato escribe en el documento ("Así queda en tu T&C")', 'src/core/derivados.js y sus variantes'],
  ['Los colores, las tipografías, los espaciados y el celular', 'src/client/estilos.css'],
];

/** Los archivos del front, con lo que hace cada uno. */
const ARCHIVOS_DEL_FRONT = [
  ['src/client/Index.html', 'La plantilla que evalúa Apps Script. Mete los estilos, el motor y la interfaz. Va completa en el anexo B.'],
  ['src/client/estilos.css', 'La hoja de estilos entera. Una sola superficie elevada en toda la app: la hoja del documento. Va completa en el anexo A.'],
  ['src/client/js/10-util.js', 'Crear elementos, copiar al portapapeles, iconos, anuncios para lectores de pantalla. Todo dato del usuario entra como texto, nunca como HTML.'],
  ['src/client/js/20-estado.js', 'El estado del recorrido (E), el borrador en el navegador, el idioma de la interfaz y el texto de cada pregunta.'],
  ['src/client/js/30-servidor.js', 'La única puerta al servidor. En Apps Script llama con google.script.run; en la demostración, al servidor simulado.'],
  ['src/client/js/40-documento.js', 'La hoja: dibuja el T&C que se va llenando, con los huecos en gris y lo que cambió resaltado.'],
  ['src/client/js/50-campos.js', 'Los controles de una pregunta: opciones, casillas, texto, número, fecha, hora, y el error debajo del campo.'],
  ['src/client/js/60-flujo.js', 'La máquina de estado: qué preguntas se ven, a dónde se avanza, cuándo se va a Legal.'],
  ['src/client/js/62-pasos.js', 'La pantalla de trabajo: la barra de progreso, la pregunta abierta, las respondidas plegadas y la calculadora.'],
  ['src/client/js/63-tyc-genericos.js', 'El atajo a los T&C que Legal ya publicó: la tarjeta, la lista y el detalle con su enlace.'],
  ['src/client/js/64-tiendas.js', 'La lista de tiendas del Cashback Day, con el pegado desde Excel.'],
  ['src/client/js/66-resumen.js', 'El resumen por secciones, la declaración, y la pantalla final con los pasos de Squarespace.'],
  ['src/client/js/68-pantallas.js', 'Las pantallas que no son el formulario: inicio, legal, historial, ayuda y administración.'],
  ['src/client/js/70-app.js', 'El arranque, la barra superior, el selector de idioma, la hoja deslizable del celular y el registro de pantallas.'],
];

function bloqueDeTabla(encabezados, filas) {
  return [
    '<table class="doc-tabla">',
    '<thead><tr>' + encabezados.map((h) => '<th>' + escapar(h) + '</th>').join('') + '</tr></thead>',
    '<tbody>',
    filas.map((fila) => '<tr>' + fila.map((celda) => '<td>' + celda + '</td>').join('') + '</tr>').join('\n'),
    '</tbody></table>',
  ].join('\n');
}

/** Los estilos propios del documento. Todo cuelga de .doc- para no tocar los marcos. */
function estilosDelDocumento() {
  return `
/* --- El documento que rodea a las pantallas ------------------------------- *
 *
 * Usa las mismas variables de la app (viven en :root y no se acotan), asi que
 * los dos se ven de la misma familia. Todo selector empieza por .doc- para que
 * ninguna regla de aqui se cuele dentro de un marco.
 */

:root {
  /* Cuanto se encoge una pantalla de escritorio para caber en la pagina:
     1440 por 0.78 son 1123, y la columna del documento mide 1132. */
  --rm-zoom: 0.78;
}

html { box-sizing: border-box; }
body.doc-cuerpo {
  margin: 0;
  background: #eceff3;
  color: var(--tinta);
  font-family: var(--cuerpo);
  font-size: 16px;
  line-height: 1.6;
}
.doc-ancho { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

.doc-portada { background: var(--papel); border-bottom: 1px solid var(--borde); padding: 48px 0 40px; }
.doc-portada h1 { font-family: var(--titulos); font-size: 32px; line-height: 1.15; margin: 0 0 8px; letter-spacing: -0.015em; }
.doc-portada .doc-firma { color: var(--gris-lapiz); font-size: 15px; margin: 0 0 28px; }
.doc-portada h2 { font-family: var(--titulos); font-size: 17px; margin: 28px 0 8px; }
.doc-portada p, .doc-portada li { max-width: 78ch; }
.doc-portada ol, .doc-portada ul { padding-left: 22px; }
.doc-portada li { margin-bottom: 6px; }

.doc-caja {
  background: var(--niebla); border-left: 3px solid var(--neon);
  border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 20px 0;
}
.doc-caja h2 { margin-top: 0; }
.doc-caja p:last-child { margin-bottom: 0; }

.doc-mapa {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px;
  line-height: 1.5; background: var(--tinta); color: #eef1f5;
  padding: 18px 20px; border-radius: 10px; overflow-x: auto; margin: 16px 0 0;
}

.doc-indice { padding: 36px 0 8px; }
.doc-indice h2 { font-family: var(--titulos); font-size: 21px; margin: 0 0 16px; }
.doc-indice ol { list-style: none; padding: 0; margin: 0 0 24px; columns: 2; column-gap: 40px; }
.doc-indice li { margin-bottom: 4px; font-size: 14px; break-inside: avoid; }
.doc-indice a { color: var(--neon-texto); text-decoration: none; }
.doc-indice a:hover { text-decoration: underline; }
.doc-indice .doc-numero-indice { color: var(--gris-lapiz); display: inline-block; min-width: 26px; }
.doc-indice h3 { font-family: var(--titulos); font-size: 15px; margin: 0 0 8px; color: var(--gris-lapiz); }

.doc-parte { padding: 40px 0 0; }
.doc-parte-titulo { font-family: var(--titulos); font-size: 26px; margin: 0 0 6px; letter-spacing: -0.01em; }
.doc-parte-entrada { color: var(--gris-lapiz); max-width: 78ch; margin: 0 0 8px; }

.doc-pantalla { padding: 36px 0 8px; border-top: 1px solid #dfe3e9; margin-top: 32px; }
.doc-pantalla:first-of-type { border-top: 0; }
.doc-numero {
  font-family: var(--titulos); font-size: 12px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--neon-texto); margin: 0 0 4px;
}
.doc-pantalla h3 { font-family: var(--titulos); font-size: 22px; margin: 0 0 6px; letter-spacing: -0.01em; }
.doc-ficha { color: var(--gris-lapiz); font-size: 13px; margin: 0 0 12px; }
.doc-ficha code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; background: var(--niebla); padding: 1px 5px; border-radius: 4px; }
.doc-que-hace, .doc-nota { max-width: 78ch; margin: 0 0 8px; }
.doc-nota { font-size: 14px; color: var(--gris-lapiz); }

/* El marco: la ventana de esa pantalla. */
.doc-lienzo {
  margin: 18px 0 0; border: 1px solid #cfd5dd; border-radius: 12px;
  background: var(--niebla); overflow: auto; box-shadow: 0 1px 3px rgba(22, 24, 29, 0.06);
}
.rm-pantalla {
  position: relative; overflow: hidden; display: block;
  width: var(--rm-ancho-ventana);
  --rm-ancho-ventana: 1440px;
  --rm-alto-ventana: 1000px;
  zoom: var(--rm-zoom);
  /* La app mide el 100% del alto de la ventana; aqui la ventana es el marco. */
  height: auto;
  min-height: var(--rm-alto-ventana);
}
.rm-pantalla.rm-celular {
  --rm-ancho-ventana: 390px;
  --rm-alto-ventana: 844px;
  --rm-zoom: 1;
}
.doc-lienzo-celular { width: max-content; max-width: 100%; }

/* La marca de la vista previa que no se repite. */
.rm-pantalla .rm-marca {
  border: 1px dashed var(--borde-control); border-radius: 6px;
  padding: 14px 16px; margin: 0; color: var(--gris-lapiz);
  font-size: 14px; line-height: 1.5; background: var(--niebla);
}

.doc-anexo { padding: 40px 0 0; border-top: 1px solid #dfe3e9; margin-top: 40px; }
.doc-anexo h2 { font-family: var(--titulos); font-size: 22px; margin: 0 0 8px; }
.doc-anexo h3 { font-family: var(--titulos); font-size: 17px; margin: 28px 0 8px; }
.doc-anexo p { max-width: 78ch; }

.doc-tabla { border-collapse: collapse; width: 100%; font-size: 14px; background: var(--papel); margin: 12px 0 24px; }
.doc-tabla th, .doc-tabla td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--borde); vertical-align: top; }
.doc-tabla th { font-family: var(--titulos); font-size: 13px; color: var(--gris-lapiz); }
.doc-tabla code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }

.doc-codigo {
  background: var(--papel); border: 1px solid var(--borde); border-radius: 10px;
  padding: 16px 18px; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px; line-height: 1.5; margin: 12px 0 24px; white-space: pre;
}

.doc-pie { padding: 40px 0 64px; color: var(--gris-lapiz); font-size: 14px; }

@media (max-width: 1240px) {
  :root { --rm-zoom: 0.62; }
}
@media (max-width: 760px) {
  .doc-indice ol { columns: 1; }
  :root { --rm-zoom: 0.4; }
}
`;
}

/** La portada: que es esto, como se hizo y que no sale literal. */
function portada(datos) {
  const cuandoSeGenero = fechaEnPalabras(datos.fecha);
  return `
<header class="doc-portada">
  <div class="doc-ancho">
    <h1>RappiMind v3, el front actual</h1>
    <p class="doc-firma">
      ${datos.total} pantallas de la herramienta funcionando, congeladas.
      Generado el ${escapar(cuandoSeGenero)} desde <code>${escapar(datos.commit)}</code> de la rama
      <code>${escapar(datos.rama)}</code>.
    </p>

    <div class="doc-caja">
      <h2>Para qué es este archivo</h2>
      <p>
        Es el contexto del front para una conversación de Claude chat. Cada bloque de abajo es una
        pantalla de RappiMind de verdad: el mismo HTML que dibuja la aplicación y la misma hoja de
        estilos. No es una maqueta, ni capturas, ni un resumen. Lo que se lee aquí es, letra por
        letra, lo que lee el comercial.
      </p>
      <p>
        Los botones y los campos están ahí, pero no hacen nada: el archivo no lleva una sola línea
        de JavaScript.
      </p>
    </div>

    <h2>Cómo se generó</h2>
    <p>
      Con <code>npm run front</code>. Arma la demostración de un solo archivo
      (<code>npm run demo</code>, que lleva el motor real de <code>src/core</code>), la recorre con
      un navegador sin interfaz respondiendo la campaña de ejemplo, y por cada pantalla guarda el
      DOM tal como quedó. Nada se escribió a mano.
    </p>

    <h2>Las cinco cosas que no salen literales, y por qué</h2>
    <ol>
      <li>
        <strong>El aviso de "Modo demostración"</strong> se quitó de todas las pantallas. Sale en la
        demostración y no existe en la herramienta real, que es la que este archivo describe.
      </li>
      <li>
        <strong>La vista previa del documento</strong> va completa en tres pantallas (el país, el
        porcentaje y el resumen ya completo) y marcada en las demás. Son el mismo T&amp;C creciendo
        pantalla a pantalla, y repetirlo treinta veces no agrega nada. El texto legal es de Legal y
        vive en <code>modelos/</code>.
      </li>
      <li>
        <strong>La pantalla final</strong> es la de producción, no la de la demostración: en la
        demostración el enlace del documento se reemplaza por el texto que habría salido. El enlace
        del Doc que se ve es de ejemplo; lo demás es literal.
      </li>
      <li>
        <strong>Lo que está clavado a la ventana</strong> (el selector ES/BR, el botón flotante del
        celular, la hoja deslizable) se clavó al marco de su pantalla, que aquí hace de ventana. Por
        eso el selector de idioma aparece al final de cada pantalla y no flotando sobre el
        documento.
      </li>
      <li>
        <strong>La barra superior lleva "Administración"</strong> porque la sesión de la
        demostración entra con rol de administrador, igual que Juan. Un CAM o un KAM no ve esa
        sección.
      </li>
    </ol>

    <h2>La campaña de ejemplo</h2>
    <p>
      Un Cashback de Colombia: tienda Farmatodo, 20% con tope de $20.000 y presupuesto de
      $5.000.000, del 1 al 31 de octubre de 2026, con el NIT 900.111.222-1. Los datos son
      inventados para este recorrido.
    </p>

    <h2>Cómo usarlo</h2>
    <ul>
      <li>
        <strong>Para cambiar un texto de pantalla:</strong> búscalo literal aquí, mira en qué
        pantalla está, y cámbialo en el archivo que dice el anexo C. Un texto que no esté en este
        archivo no lo ve el comercial.
      </li>
      <li>
        <strong>El texto legal no se toca.</strong> Las cláusulas del documento son de Legal y
        salen de <code>modelos/</code>. Un problema en una cláusula se anota en
        <code>docs/PENDIENTES_LEGAL.md</code>.
      </li>
      <li>
        <strong>Esto no es la fuente de verdad</strong> de la lógica ni de los textos: es lo que se
        ve. La fuente está en el repositorio, y este archivo se vuelve a generar con
        <code>npm run front</code> cada vez que la interfaz cambia.
      </li>
    </ul>

    <h2>El recorrido de una mirada</h2>
<pre class="doc-mapa">inicio
  └─ Empezar ──► filtro de entrada (2 preguntas)
                   ├─ algún sí ──► Legal
                   └─ todo no ──► formulario
                                    país ► negocio ► tipo ► las preguntas del tipo
                                      │
                                      ├─ negocio = Rappi Travel ──► filtro de Travel (9 preguntas)
                                      │                               ├─ algún sí ──► Legal
                                      │                               └─ todo no ──► vuelve al tipo
                                      │
                                      └─ última pregunta ──► resumen ──► Generar ──► listo

Mis campañas y Ayuda están siempre en la barra de arriba.
Mis campañas ─┬─ Usar como base ──► formulario con las respuestas copiadas
              └─ Ampliar ──► solo si está publicada y en curso</pre>
  </div>
</header>`;
}

function indice(partes, fichas) {
  const bloques = partes.map((parte) => {
    const suyas = fichas.filter((ficha) => ficha.parte === parte.titulo);
    return [
      '<h3>' + escapar(parte.titulo) + '</h3>',
      '<ol>',
      suyas.map((ficha) =>
        '<li><span class="doc-numero-indice">' + ficha.numero + '</span>' +
        '<a href="#' + ficha.ancla + '">' + escapar(ficha.titulo) + '</a></li>').join('\n'),
      '</ol>',
    ].join('\n');
  });
  return [
    '<nav class="doc-indice"><div class="doc-ancho">',
    '<h2>Las pantallas</h2>',
    bloques.join('\n'),
    '</div></nav>',
  ].join('\n');
}

function unaPantalla(ficha, html, faltante) {
  const ventana = ficha.ventana === 'celular' ? 'celular 390 × 844' : 'escritorio 1440 × 1000';
  const idioma = ficha.idioma === 'pt' ? 'interfaz en portugués' : 'interfaz en español';

  const cabeza = [
    '<article class="doc-pantalla" id="' + ficha.ancla + '">',
    '<p class="doc-numero">Pantalla ' + ficha.numero + '</p>',
    '<h3>' + escapar(ficha.titulo) + '</h3>',
    '<p class="doc-ficha"><code>E.pantalla = "' + escapar(ficha.pantalla) + '"</code> · ' +
      escapar(ventana) + ' · ' + escapar(idioma) + '</p>',
    '<p class="doc-que-hace"><strong>Qué hace el comercial aquí.</strong> ' + escapar(ficha.queHace) + '</p>',
    ficha.nota ? '<p class="doc-nota"><strong>Para leer el marco.</strong> ' + escapar(ficha.nota) + '</p>' : '',
  ].filter(Boolean).join('\n');

  if (faltante) {
    return [
      cabeza,
      '<p class="doc-nota"><strong>Esta pantalla no se pudo alcanzar en este recorrido.</strong> ' +
        escapar(faltante) + '</p>',
      '</article>',
    ].join('\n');
  }

  const clases = 'rm-pantalla' + (ficha.ventana === 'celular' ? ' rm-celular' : '');
  const lienzo = 'doc-lienzo' + (ficha.ventana === 'celular' ? ' doc-lienzo-celular' : '');
  return [
    cabeza,
    '<div class="' + lienzo + '">',
    '<div class="' + clases + '">',
    html,
    '</div>',
    '</div>',
    '</article>',
  ].join('\n');
}

function anexos(datos) {
  return `
<section class="doc-anexo"><div class="doc-ancho">
  <h2>Anexo A · La hoja de estilos</h2>
  <p>
    Esta es <code>src/client/estilos.css</code> completa y literal, como está en el repositorio.
    Es la fuente. La copia que hace ver las pantallas de arriba está en la cabeza de este archivo y
    no es igual: se reescribió para que cada regla valga solo dentro de su marco
    (<code>.rm-pantalla</code>), para que las reglas de celular valgan solo en los marcos de
    celular en vez de depender del ancho de la ventana de quien lee, y para que lo que estaba
    clavado a la ventana quede clavado al marco. Lo hace
    <code>scripts/lib/estilos-acotados.js</code>. Si vas a cambiar un estilo, el cambio va en el
    archivo de abajo.
  </p>
  <pre class="doc-codigo">${escapar(datos.estilos)}</pre>

  <h2>Anexo B · La plantilla</h2>
  <p>
    <code>src/client/Index.html</code>, la página que evalúa Apps Script. Las tres etiquetas
    <code>incluir</code> las reemplaza el build con los estilos, el motor y la interfaz.
  </p>
  <pre class="doc-codigo">${escapar(datos.plantilla)}</pre>

  <h2>Anexo C · Dónde se cambia cada cosa que se ve</h2>
  <p>Es el anexo que hay que mirar antes de proponer un cambio de texto.</p>
  ${bloqueDeTabla(['Lo que se ve', 'Donde vive'], DONDE_VIVE_CADA_TEXTO.map(
    ([que, donde]) => [escapar(que), '<code>' + escapar(donde) + '</code>']
  ))}

  <h2>Anexo D · Los archivos del front</h2>
  <p>
    La interfaz vive en <code>src/client/</code>. El build concatena los archivos de
    <code>src/client/js/</code> en orden alfabético, y los prefijos numéricos fijan ese orden. Cada
    uno queda envuelto en su propia función, así que se hablan por <code>window.RM</code>.
  </p>
  ${bloqueDeTabla(['Archivo', 'Líneas', 'Qué hace'], ARCHIVOS_DEL_FRONT.map(
    ([archivo, papel]) => [
      '<code>' + escapar(archivo) + '</code>',
      String(datos.lineas[archivo] || ''),
      escapar(papel),
    ]
  ))}

  <h2>Anexo E · El estado del recorrido</h2>
  <p>
    Las pantallas de arriba dicen <code>E.pantalla</code> porque no hay enrutador ni URL: la app
    vive dentro de un iframe de Apps Script, así que cambiar de pantalla es cambiar una llave del
    estado y redibujar. El estado vive en <code>src/client/js/20-estado.js</code>.
  </p>
  ${bloqueDeTabla(['Llave', 'Para qué'], [
    ['<code>E.pantalla</code>', 'cuál de las diez pantallas se dibuja'],
    ['<code>E.pasoActual</code>', 'índice del paso dentro del formulario'],
    ['<code>E.campoAbierto</code>', 'qué pregunta está abierta; vacío es la primera sin responder'],
    ['<code>E.respondidas</code>', 'qué preguntas tocó de verdad el comercial, no qué valores hay'],
    ['<code>E.errores</code>', 'qué preguntas ya pueden mostrar su error, para no regañar antes de tiempo'],
    ['<code>E.filtroRespondido</code>, <code>E.filtroDeTravelRespondido</code>', 'filtros ya pasados'],
    ['<code>E.motivoDeLegal</code>', 'la razón concreta que se lee en la pantalla de Legal'],
    ['<code>E.resultado</code>', 'lo que devolvió generar, para la pantalla final'],
  ])}
</div></section>`;
}

/**
 * Arma el documento entero.
 *
 * datos: { fecha, commit, rama, partes, fichas, capturas, fallas, estilos,
 *          plantilla, lineas }
 */
function armar(datos) {
  const fallaPorId = {};
  for (const falla of datos.fallas) fallaPorId[falla.id] = falla.motivo;

  const cuerpo = datos.partes.map((parte) => {
    const suyas = datos.fichas.filter((ficha) => ficha.parte === parte.titulo);
    return [
      '<section class="doc-parte"><div class="doc-ancho">',
      '<h2 class="doc-parte-titulo">' + escapar(parte.titulo) + '</h2>',
      '<p class="doc-parte-entrada">' + escapar(parte.entrada) + '</p>',
      suyas.map((ficha) => unaPantalla(ficha, datos.capturas[ficha.id], fallaPorId[ficha.id])).join('\n'),
      '</div></section>',
    ].join('\n');
  }).join('\n');

  const aviso = [
    '<!--',
    '  RappiMind v3, el front actual. Generado con `npm run front`; no se edita a mano.',
    '  Cada pantalla es el DOM de la aplicacion de verdad, con la hoja de estilos real',
    '  acotada a su marco. No lleva JavaScript: es HTML inerte.',
    '  La fuente esta en el repositorio; este archivo es la foto.',
    '-->',
  ].join('\n');

  return [
    '<!DOCTYPE html>',
    '<html lang="es">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<title>RappiMind v3 · el front actual, pantalla por pantalla</title>',
    aviso,
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&amp;family=Poppins:wght@500;600&amp;display=swap" rel="stylesheet" />',
    '<style>',
    '/* La hoja de estilos de la app, acotada a ' + MARCO + '. NO ES LA FUENTE: la',
    ' * fuente literal es src/client/estilos.css y va completa en el anexo A. */',
    acotarEstilos(datos.estilos, MARCO),
    '</style>',
    '<style>' + estilosDelDocumento() + '</style>',
    '</head>',
    '<body class="doc-cuerpo">',
    portada({ fecha: datos.fecha, commit: datos.commit, rama: datos.rama, total: datos.fichas.length }),
    indice(datos.partes, datos.fichas),
    '<main>',
    cuerpo,
    '</main>',
    anexos(datos),
    '<footer class="doc-pie"><div class="doc-ancho">',
    'RappiMind v3 · generado con <code>npm run front</code> el ' + escapar(fechaEnPalabras(datos.fecha)) +
      ' · ' + datos.fichas.length + ' pantallas · repositorio <code>rappimind-v3</code>',
    '</div></footer>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

module.exports = { armar, escapar, MARCO, DONDE_VIVE_CADA_TEXTO, ARCHIVOS_DEL_FRONT };
