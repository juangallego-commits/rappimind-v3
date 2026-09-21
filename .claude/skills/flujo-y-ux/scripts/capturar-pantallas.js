'use strict';

/**
 * Recorre la demostracion con Playwright y regenera las capturas de revision.
 *
 * Deja en docs/capturas/revision/ una captura por pantalla del recorrido del
 * comercial (33 en total, con los mismos nombres de siempre) y un textos.json
 * con, por cada captura, { archivo, titulo, texto }: el texto literal que se
 * lee en esa pantalla, linea por linea, tal como lo devuelve innerText.
 *
 * Con ese JSON se arma el documento de revision de copy, asi que el texto es
 * exactamente lo que ve el comercial, con tres salvedades:
 *   - la barra superior y el aviso de la demostracion no van (se repiten en
 *     todas las pantallas y el documento los describe una sola vez),
 *   - el selector de idioma (ES y BR, fijo abajo a la derecha) tampoco, ni la
 *     region de anuncios para lectores de pantalla, que no se ve,
 *   - la vista previa del documento se reemplaza por una marca, porque es
 *     texto legal y no entra en la revision de copy. En la pantalla final el
 *     documento generado se reemplaza por otra marca, por la misma razon.
 *
 * La campana de ejemplo es un Cashback de Colombia en Farmatodo, 20% con tope
 * de $20.000 y presupuesto de $5.000.000, del 1 al 31 de octubre de 2026.
 *
 * Como correrlo:
 *   npm run demo
 *   export NODE_PATH=/opt/node22/lib/node_modules   (donde este playwright)
 *   export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers (donde este Chromium)
 *   node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js
 *
 * Si una pantalla no se puede alcanzar, el script lo dice y sigue con la
 * siguiente: una captura que falta se nota, un script que revienta a mitad
 * de camino deja las otras treinta sin hacer.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const DEMO = 'file://' + path.join(RAIZ, 'demo', 'index.html');
const CARPETA = path.join(RAIZ, 'docs', 'capturas', 'revision');
const ARCHIVO_TEXTOS = path.join(CARPETA, 'textos.json');

const MARCA_VISTA_PREVIA = '[aquí va la vista previa del documento, que no se revisa]';
const MARCA_DOCUMENTO = '[aquí va el documento generado, que no se revisa]';

/** Las 33 pantallas, en el orden del documento de revision. */
const PANTALLAS = [
  { archivo: '01-inicio.png', titulo: 'Inicio' },
  { archivo: '02-filtro-de-entrada.png', titulo: 'Filtro de entrada' },
  { archivo: '03-pregunta-pais.png', titulo: 'Formulario, el país' },
  { archivo: '04-pregunta-negocio.png', titulo: 'Formulario, el negocio' },
  { archivo: '05-lista-de-tipos.png', titulo: 'Formulario, el tipo de campaña de Rappi' },
  { archivo: '06-pregunta-tienda.png', titulo: 'Formulario, la tienda' },
  { archivo: '07-pregunta-alcance.png', titulo: 'Formulario, la cobertura' },
  { archivo: '08-pregunta-organizador.png', titulo: 'Formulario, quién organiza' },
  { archivo: '09-pregunta-identificacion.png', titulo: 'Formulario, la identificación del organizador' },
  { archivo: '10-pregunta-fecha-inicio.png', titulo: 'Formulario, cuándo arranca' },
  { archivo: '11-pregunta-porcentaje.png', titulo: 'Formulario, el porcentaje' },
  { archivo: '12-pregunta-tope.png', titulo: 'Formulario, el tope por pedido' },
  { archivo: '13-pregunta-presupuesto.png', titulo: 'Formulario, el presupuesto' },
  { archivo: '14-pregunta-veces-por-persona.png', titulo: 'Formulario, cuántas veces puede ganar' },
  { archivo: '15-pregunta-condiciones.png', titulo: 'Formulario, el tipo de pedido' },
  { archivo: '16-pregunta-carga-de-creditos.png', titulo: 'Formulario, cuándo llegan los Créditos' },
  { archivo: '17-pregunta-vigencia-de-creditos.png', titulo: 'Formulario, hasta cuándo sirven los Créditos' },
  { archivo: '18-pregunta-donde-se-gastan.png', titulo: 'Formulario, dónde se gastan los Créditos' },
  { archivo: '19-pregunta-segmento.png', titulo: 'Formulario, quién participa' },
  { archivo: '20-pregunta-medio-de-pago.png', titulo: 'Formulario, el medio de pago' },
  { archivo: '21-pregunta-compra-minima.png', titulo: 'Formulario, la compra mínima' },
  { archivo: '22-resumen.png', titulo: 'Resumen, con algo pendiente' },
  { archivo: '23-resumen-declaracion.png', titulo: 'Resumen, ya completo' },
  { archivo: '24-listo.png', titulo: 'Listo' },
  { archivo: '25-mis-campanas.png', titulo: 'Mis campañas' },
  { archivo: '26-ayuda.png', titulo: 'Ayuda' },
  { archivo: '27-legal.png', titulo: 'Legal' },
  { archivo: '28-filtro-travel.png', titulo: 'Filtro de Rappi Travel' },
  { archivo: '29-tipos-travel.png', titulo: 'Formulario, el tipo de campaña de Rappi Travel' },
  { archivo: '30-inicio-portugues.png', titulo: 'Inicio, interfaz en portugués' },
  { archivo: '31-filtro-portugues.png', titulo: 'Filtro de entrada, interfaz en portugués' },
  { archivo: '32-pregunta-negocio-portugues.png', titulo: 'Formulario en portugués, el negocio' },
  { archivo: '33-tipos-portugues.png', titulo: 'Formulario en portugués, el tipo de campaña' },
];

/** Busca playwright-core y un Chromium sin instalar nada (igual que recorrer-flujo.js). */
function buscarNavegador() {
  let chromium = null;
  for (const intento of ['playwright-core', 'playwright']) {
    try { chromium = require(intento).chromium; break; } catch (e) { /* sigue */ }
  }
  if (!chromium) return { falta: 'playwright-core no está instalado' };

  const carpeta = process.env.PLAYWRIGHT_BROWSERS_PATH;
  let ejecutable;
  if (carpeta && fs.existsSync(carpeta)) {
    for (const entrada of fs.readdirSync(carpeta)) {
      const candidatos = [
        path.join(carpeta, entrada, 'chrome-linux', 'chrome'),
        path.join(carpeta, entrada),
      ];
      for (const c of candidatos) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) { ejecutable = c; break; }
      }
      if (ejecutable) break;
    }
  }
  return { chromium: chromium, ejecutable: ejecutable };
}

async function capturarTodo() {
  const navegadorDisponible = buscarNavegador();
  if (navegadorDisponible.falta) {
    console.log('No se pueden hacer las capturas: ' + navegadorDisponible.falta + '.');
    return 1;
  }
  if (!fs.existsSync(path.join(RAIZ, 'demo', 'index.html'))) {
    console.log('Falta demo/index.html. Corre `npm run demo` primero.');
    return 1;
  }
  fs.mkdirSync(CARPETA, { recursive: true });

  const navegador = await navegadorDisponible.chromium.launch({
    executablePath: navegadorDisponible.ejecutable,
    args: ['--no-sandbox'],
  });

  const capturas = [];
  const fallas = [];
  let pagina = null;

  /**
   * Lo que no se ve en escritorio y aun asi se cuela en la captura o en el texto:
   * la hoja deslizable del celular (fija, desplazada fuera de la pantalla) se
   * dibuja al pie de la captura de pagina completa, y la region de anuncios
   * para lectores de pantalla ("Generando el documento.") entra en innerText.
   * Se ocultan solo en esta sesion de captura; la demostracion no cambia.
   */
  const ESTILOS_DE_CAPTURA = '.hoja-deslizable, .cortina, .boton-flotante, #anuncios { display: none !important; }';

  async function prepararPagina() {
    await pagina.waitForTimeout(800);
    await pagina.addStyleTag({ content: ESTILOS_DE_CAPTURA });
  }

  /** Cada camino arranca en un contexto limpio: sin borrador ni idioma de la vuelta anterior. */
  async function paginaNueva() {
    if (pagina) await pagina.context().close();
    const contexto = await navegador.newContext({ viewport: { width: 1440, height: 1000 } });
    pagina = await contexto.newPage();
    pagina.on('pageerror', function (e) { console.log('  error de JavaScript en la página: ' + e.message); });
    await pagina.goto(DEMO);
    await prepararPagina();
  }

  // --- Ayudantes para navegar (la misma logica de recorrer-flujo.js) --------

  /** Hace clic en el primer boton o enlace cuyo texto empieza por la etiqueta. Acepta varias. */
  async function clic(etiqueta) {
    const etiquetas = Array.isArray(etiqueta) ? etiqueta : [etiqueta];
    const encontrado = await pagina.evaluate((lista) => {
      const botones = [].slice.call(document.querySelectorAll('button, a'));
      for (const t of lista) {
        const boton = botones.filter((x) => x.textContent.trim().indexOf(t) === 0)[0];
        if (boton) { boton.click(); return true; }
      }
      return false;
    }, etiquetas);
    if (!encontrado) throw new Error('no encontré el botón: ' + etiquetas.join(' / '));
    await pagina.waitForTimeout(350);
  }

  /** El enunciado de la pregunta abierta, para saber si una opcion avanzo sola. */
  function tituloAbierto() {
    return pagina.evaluate(() =>
      [].map.call(document.querySelectorAll('.pregunta .pregunta-titulo'), (t) => t.textContent.trim()).join(' | '));
  }

  /**
   * Elige una opcion (.opcion) por su titulo exacto. Si la pregunta no avanza
   * sola, le da a Siguiente.
   */
  async function elegirOpcion(titulo) {
    const antes = await tituloAbierto();
    const encontrado = await pagina.evaluate((t) => {
      const botones = [].slice.call(document.querySelectorAll('.opcion'));
      let boton = botones.filter((b) => {
        const cabeza = b.querySelector('.opcion-titulo');
        return (cabeza ? cabeza.textContent : b.textContent).trim() === t;
      })[0];
      if (!boton) boton = botones.filter((b) => b.textContent.trim().indexOf(t) === 0)[0];
      if (!boton) return false;
      boton.click();
      return true;
    }, titulo);
    if (!encontrado) throw new Error('no encontré la opción: ' + titulo);
    await pagina.waitForTimeout(350);
    const despues = await tituloAbierto();
    if (despues && despues === antes) await siguiente();
  }

  /** Responde "No" a todas las preguntas visibles de un filtro, una por una. */
  async function decirQueNoATodo() {
    for (let vuelta = 0; vuelta < 15; vuelta++) {
      const quedan = await pagina.evaluate(() => {
        const bloques = document.querySelectorAll('.pregunta');
        for (let i = 0; i < bloques.length; i++) {
          const no = [].slice.call(bloques[i].querySelectorAll('.opcion'))
            .filter((b) => /^(No|Não)$/.test(b.textContent.trim()))[0];
          if (no && no.getAttribute('aria-pressed') !== 'true') { no.click(); return true; }
        }
        return false;
      });
      await pagina.waitForTimeout(180);
      if (!quedan) break;
    }
    await pagina.waitForTimeout(400);
  }

  /** Escribe en el control de la pregunta abierta (texto, fecha u hora). */
  async function escribir(valor, tipo) {
    const selector = '.pregunta input[type=' + (tipo || 'text') + ']';
    await pagina.waitForSelector(selector, { timeout: 3000 });
    await pagina.fill(selector, valor);
    await pagina.waitForTimeout(250);
  }

  async function siguiente() {
    await clic(['Siguiente', 'Avançar']);
  }

  /** Marca la casilla cuyo texto empieza por la etiqueta. */
  async function marcarCasilla(etiqueta) {
    const encontrada = await pagina.evaluate((t) => {
      const casillas = [].slice.call(document.querySelectorAll('label.casilla'));
      const casilla = casillas.filter((c) => c.textContent.trim().indexOf(t) === 0)[0];
      if (!casilla) return false;
      casilla.querySelector('input').click();
      return true;
    }, etiqueta);
    if (!encontrada) throw new Error('no encontré la casilla: ' + etiqueta);
    await pagina.waitForTimeout(250);
  }

  /** Abre todos los desplegables "¿Por qué te preguntamos esto?" antes de capturar. */
  async function abrirPorQue() {
    await pagina.evaluate(() => {
      [].forEach.call(document.querySelectorAll('details.por-que'), (d) => { d.open = true; });
    });
    await pagina.waitForTimeout(150);
  }

  /**
   * El texto literal de la pantalla, sin la barra superior, sin el aviso de la
   * demostracion y sin el selector de idioma, con la vista previa reemplazada
   * por su marca. Oculta y restaura, no toca el contenido de la pagina.
   */
  function textoDePantalla() {
    return pagina.evaluate((marcas) => {
      const ocultos = [];
      function ocultar(elemento) {
        if (!elemento) return;
        ocultos.push([elemento, elemento.style.display]);
        elemento.style.display = 'none';
      }
      function reemplazar(elemento, marca) {
        if (!elemento) return;
        const texto = document.createElement('p');
        texto.textContent = marca;
        elemento.parentNode.insertBefore(texto, elemento);
        ocultos.push([texto, null]);
        ocultar(elemento);
      }

      ocultar(document.querySelector('.barra-superior'));
      ocultar(document.querySelector('.selector-idioma'));
      const avisoDemo = document.querySelector('.barra-superior + .pagina');
      if (avisoDemo && avisoDemo.querySelector('.aviso')) ocultar(avisoDemo);

      [].forEach.call(document.querySelectorAll('.hoja[data-hoja]'), (h) => reemplazar(h, marcas.vistaPrevia));
      [].forEach.call(document.querySelectorAll('.pagina-angosta > .hoja:not([data-hoja])'), (h) => reemplazar(h, marcas.documento));

      const texto = document.body.innerText;

      for (const [elemento, display] of ocultos.reverse()) {
        if (display === null) elemento.parentNode.removeChild(elemento);
        else elemento.style.display = display;
      }
      return texto;
    }, { vistaPrevia: MARCA_VISTA_PREVIA, documento: MARCA_DOCUMENTO });
  }

  /** Captura la pantalla numero n (1 a 33) y guarda su texto. */
  async function capturar(numero, opciones) {
    const pantalla = PANTALLAS[numero - 1];
    if (opciones && opciones.porQue) await abrirPorQue();
    await pagina.waitForTimeout(300);
    await pagina.evaluate(() => window.scrollTo(0, 0));
    await pagina.screenshot({ path: path.join(CARPETA, pantalla.archivo), fullPage: true });
    const texto = (await textoDePantalla()).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
    if (!texto) throw new Error('la pantalla salió sin texto');
    capturas.push({ archivo: pantalla.archivo, titulo: pantalla.titulo, texto: texto });
    console.log('ok    ' + pantalla.archivo);
  }

  /**
   * Corre un tramo del recorrido. Si algo falla, lo dice y sigue con el
   * siguiente tramo; las pantallas del tramo que no alcanzaron a salir quedan
   * anotadas como faltantes.
   */
  async function tramo(nombre, numeros, correr) {
    try {
      await correr();
    } catch (error) {
      const hechas = capturas.map((c) => c.archivo);
      const faltantes = numeros.filter((n) => hechas.indexOf(PANTALLAS[n - 1].archivo) === -1);
      for (const n of faltantes) {
        fallas.push({ archivo: PANTALLAS[n - 1].archivo, motivo: error.message });
        console.log('FALTA ' + PANTALLAS[n - 1].archivo + ' (' + nombre + ': ' + error.message + ')');
      }
    }
  }

  // --- 1 a 26. La campana de ejemplo, de principio a fin -------------------
  await tramo('el recorrido del Cashback', rango(1, 26), async () => {
    await paginaNueva();
    await capturar(1);

    await clic('Empezar');
    await capturar(2);

    await decirQueNoATodo();
    await capturar(3, { porQue: true });

    await elegirOpcion('Colombia');
    await capturar(4, { porQue: true });

    await elegirOpcion('Rappi');
    await capturar(5, { porQue: true });

    await elegirOpcion('Cashback');
    await capturar(6, { porQue: true });

    await escribir('Farmatodo');
    await siguiente();
    await capturar(7, { porQue: true });

    await elegirOpcion('En todo el país');
    await capturar(8, { porQue: true });

    await escribir('Farmatodo Colombia S.A.S.');
    await siguiente();
    // El NIT se escribe antes de capturar: la pantalla lo muestra ya validado.
    await escribir('900.111.222-1');
    await capturar(9, { porQue: true });

    await siguiente();
    await capturar(10, { porQue: true });

    // Cuando: del 1 al 31 de octubre de 2026, de medianoche a 11:59 de la noche.
    await escribir('2026-10-01', 'date');
    await siguiente();
    await escribir('00:00', 'time');
    await siguiente();
    await escribir('2026-10-31', 'date');
    await siguiente();
    await escribir('23:59', 'time');
    await siguiente();
    await capturar(11, { porQue: true });

    await escribir('20');
    await siguiente();
    await capturar(12, { porQue: true });

    await escribir('20000');
    await siguiente();
    await capturar(13, { porQue: true });

    await escribir('5000000');
    await siguiente();
    await capturar(14, { porQue: true });

    await elegirOpcion('Una sola vez');
    await capturar(15, { porQue: true });

    // Desde el 20 de septiembre de 2026 (punto D2) es una sola eleccion y
    // avanza sola: ya no hace falta pulsar Siguiente.
    await elegirOpcion('Solo pedidos por Turbo');
    await capturar(16, { porQue: true });

    await elegirOpcion('Al día siguiente del pedido');
    await capturar(17, { porQue: true });

    await elegirOpcion('Hasta una fecha');
    await escribir('2026-12-31', 'date');
    await siguiente();
    await capturar(18, { porQue: true });

    await elegirOpcion('Solo en esta tienda');
    await capturar(19, { porQue: true });

    await elegirOpcion('Todos los usuarios');
    await capturar(20, { porQue: true });

    await elegirOpcion('Con cualquier medio de pago');
    await capturar(21, { porQue: true });

    await escribir('30000');
    // Con la pregunta de la categoria detras, el boton de la compra minima dice
    // "Siguiente"; sin ella decia "Revisar y generar". Se aceptan los dos para
    // que esta captura no dependa de cuantas preguntas queden.
    await clic(['Siguiente', 'Revisar y generar']);
    // La categoria del producto es ahora la ultima pregunta del formulario:
    // decide la leyenda de la pieza publicitaria, no el T&C. Al elegirla el
    // asistente avanza solo, y como es la ultima, avanza al resumen.
    await elegirOpcion('Licores y cervezas');
    await pagina.waitForTimeout(500);
    await capturar(22);

    await pagina.click('#declaracion');
    await pagina.waitForTimeout(300);
    await capturar(23);

    await clic('Generar T&C');
    await pagina.waitForTimeout(900);
    await capturar(24);

    await clic('Mis campañas');
    await pagina.waitForTimeout(700);
    await capturar(25);

    await clic('Ayuda');
    await capturar(26);
  });

  // --- 27. Legal, respondiendo Si en el filtro de entrada ------------------
  await tramo('el camino a Legal', [27], async () => {
    await paginaNueva();
    await clic('Empezar');
    await elegirOpcion('Sí');
    await pagina.waitForTimeout(400);
    await capturar(27);
  });

  // --- 28 y 29. Rappi Travel en Colombia ------------------------------------
  await tramo('el camino de Rappi Travel', [28, 29], async () => {
    await paginaNueva();
    await clic('Empezar');
    await decirQueNoATodo();
    await elegirOpcion('Colombia');
    await elegirOpcion('Rappi Travel');
    await pagina.waitForTimeout(300);
    await capturar(28);

    await decirQueNoATodo();
    await capturar(29, { porQue: true });
  });

  // --- 30 a 33. La interfaz en portugues, con Brasil ------------------------
  await tramo('la interfaz en portugués', rango(30, 33), async () => {
    await paginaNueva();
    await pagina.evaluate(() => { window.localStorage.setItem('rappimind.idioma', 'pt'); });
    await pagina.reload();
    await prepararPagina();
    await capturar(30);

    await clic('Começar');
    await capturar(31);

    await decirQueNoATodo();
    await elegirOpcion('Brasil');
    await capturar(32, { porQue: true });

    await elegirOpcion('Rappi');
    await capturar(33, { porQue: true });
  });

  // El idioma vuelve a espanol, para no dejar la demostracion en portugues.
  try {
    await pagina.evaluate(() => { window.localStorage.setItem('rappimind.idioma', 'es'); });
  } catch (e) { /* si la pagina ya no esta, no hay nada que devolver */ }

  await navegador.close();

  // --- El JSON con los textos ------------------------------------------------
  capturas.sort((a, b) => (a.archivo < b.archivo ? -1 : 1));
  fs.writeFileSync(ARCHIVO_TEXTOS, JSON.stringify(capturas, null, 2) + '\n', 'utf8');

  console.log('\n' + capturas.length + ' de ' + PANTALLAS.length + ' capturas en ' + path.relative(RAIZ, CARPETA));
  console.log('textos en ' + path.relative(RAIZ, ARCHIVO_TEXTOS));
  if (fallas.length) {
    console.log('\nNo se pudieron capturar:');
    for (const f of fallas) console.log('  ' + f.archivo + ': ' + f.motivo);
  }
  return fallas.length ? 1 : 0;
}

function rango(desde, hasta) {
  const lista = [];
  for (let n = desde; n <= hasta; n++) lista.push(n);
  return lista;
}

capturarTodo().then(function (codigo) { process.exit(codigo); }).catch(function (error) {
  console.error('Se rompió la captura: ' + error.message);
  process.exit(1);
});
