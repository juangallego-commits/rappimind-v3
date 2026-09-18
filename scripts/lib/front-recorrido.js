'use strict';

/**
 * Recorre la demostracion con un navegador sin interfaz y congela cada
 * pantalla: devuelve, por cada una, el HTML del DOM tal como quedo.
 *
 * Es el mismo recorrido de .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js
 * (la campana de ejemplo es la misma, para que las capturas y este documento
 * cuenten lo mismo), con los caminos que ahi no salen: los T&C ya publicados,
 * un pais en piloto, otros tipos de campana, un error en vivo, ampliar una
 * campana publicada, administracion y el celular.
 *
 * Si un tramo falla, lo dice y sigue con el siguiente: una pantalla que falta
 * se nota en el documento, un script que revienta a mitad de camino deja las
 * otras cuarenta sin hacer.
 */

const fs = require('fs');
const path = require('path');

const ESCRITORIO = { width: 1440, height: 1000 };
const CELULAR = { width: 390, height: 844 };

/** El enlace del Doc en la pantalla final: en la demostracion no hay Drive. */
const DOC_DE_EJEMPLO = 'https://docs.google.com/document/d/EJEMPLO-DE-ESTE-ARCHIVO/edit';

/** Valores para responder una pregunta cualquiera, por identificador de campo. */
const VALORES_GENERICOS = {
  tienda: 'Farmatodo',
  organizadorRazonSocial: 'Farmatodo Colombia S.A.S.',
  organizadorId: '900.111.222-1',
  fechaInicio: '2026-10-01',
  horaInicio: '00:00',
  fechaFin: '2026-10-31',
  horaFin: '23:59',
  porcentaje: '20',
  tope: '20000',
  presupuesto: '5000000',
  compraMinima: '30000',
  premio: 'Un mercado de un millón de pesos',
  ciudades: 'Bogotá, Medellín y Cali',
  marca: 'Colgate',
  productos: 'Crema dental Colgate Total 12',
};

/** Busca playwright y un Chromium sin instalar nada. */
function buscarNavegador() {
  let chromium = null;
  for (const intento of ['playwright-core', 'playwright']) {
    try { chromium = require(intento).chromium; break; } catch (error) { /* sigue */ }
  }
  if (!chromium) return { falta: 'playwright no está instalado. Con NODE_PATH apuntando a los módulos globales: NODE_PATH=/opt/node22/lib/node_modules' };

  const carpeta = process.env.PLAYWRIGHT_BROWSERS_PATH;
  let ejecutable;
  if (carpeta && fs.existsSync(carpeta)) {
    for (const entrada of fs.readdirSync(carpeta)) {
      for (const candidato of [path.join(carpeta, entrada, 'chrome-linux', 'chrome'), path.join(carpeta, entrada)]) {
        if (fs.existsSync(candidato) && fs.statSync(candidato).isFile()) { ejecutable = candidato; break; }
      }
      if (ejecutable) break;
    }
  }
  return { chromium: chromium, ejecutable: ejecutable };
}

/**
 * Congela la pantalla: corre DENTRO del navegador y devuelve el HTML de #app.
 *
 * Tres cosas antes de serializar:
 *
 * 1. Lo que el usuario escribio vive en la propiedad del control, no en el
 *    atributo, y solo los atributos se serializan. Sin esto, todos los campos
 *    respondidos saldrian vacios.
 * 2. El aviso de "Modo demostración" se quita: no existe en la herramienta real
 *    y este documento describe la herramienta real.
 * 3. Los identificadores se prefijan, con sus referencias (for, aria-*, href),
 *    porque cuarenta pantallas en un mismo documento repetirian cada id.
 */
function congelar(opciones) {
  const raiz = document.getElementById('app');

  for (const campo of raiz.querySelectorAll('input')) {
    if (campo.type === 'checkbox' || campo.type === 'radio') {
      if (campo.checked) campo.setAttribute('checked', '');
      else campo.removeAttribute('checked');
    } else {
      campo.setAttribute('value', campo.value);
    }
  }
  for (const area of raiz.querySelectorAll('textarea')) area.textContent = area.value;
  for (const lista of raiz.querySelectorAll('select')) {
    for (const opcion of lista.options) {
      if (opcion.selected) opcion.setAttribute('selected', '');
      else opcion.removeAttribute('selected');
    }
  }
  for (const desplegable of raiz.querySelectorAll('details')) {
    if (desplegable.open) desplegable.setAttribute('open', '');
    else desplegable.removeAttribute('open');
  }

  const clon = raiz.cloneNode(true);
  clon.removeAttribute('id');

  for (const titulo of clon.querySelectorAll('.pagina > .aviso > h3')) {
    if (!/Modo demostra/.test(titulo.textContent)) continue;
    const bloque = titulo.parentNode.parentNode;
    if (bloque.parentNode === clon) clon.removeChild(bloque);
  }

  if (!opciones.vistaPreviaCompleta) {
    for (const hoja of clon.querySelectorAll('.hoja')) {
      const marca = document.createElement('p');
      marca.className = 'rm-marca';
      marca.textContent = hoja.hasAttribute('data-hoja') ? opciones.marcaVistaPrevia : opciones.marcaDocumento;
      while (hoja.firstChild) hoja.removeChild(hoja.firstChild);
      hoja.appendChild(marca);
    }
  }

  const mapa = {};
  for (const elemento of clon.querySelectorAll('[id]')) {
    const nuevo = opciones.prefijo + '-' + elemento.id;
    mapa[elemento.id] = nuevo;
    elemento.id = nuevo;
  }
  for (const atributo of ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'list', 'headers']) {
    for (const elemento of clon.querySelectorAll('[' + atributo + ']')) {
      const valores = elemento.getAttribute(atributo).split(/\s+/).map((v) => mapa[v] || v).join(' ');
      elemento.setAttribute(atributo, valores);
    }
  }
  for (const enlace of clon.querySelectorAll('a[href^="#"]')) {
    const destino = enlace.getAttribute('href').slice(1);
    if (mapa[destino]) enlace.setAttribute('href', '#' + mapa[destino]);
  }

  return clon.innerHTML;
}

/**
 * El recorrido completo.
 *
 * fichas: las fichas de pantalla de scripts/front.js.
 * Devuelve { capturas: { id: html }, fallas: [{ id, motivo }], errores: [] }.
 */
async function recorrer(rutaDeLaDemo, fichas, marcas) {
  const disponible = buscarNavegador();
  if (disponible.falta) throw new Error(disponible.falta);
  if (!fs.existsSync(rutaDeLaDemo)) throw new Error('Falta demo/index.html. Corre `npm run demo` primero.');

  const DEMO = 'file://' + rutaDeLaDemo;
  const navegador = await disponible.chromium.launch({ executablePath: disponible.ejecutable, args: ['--no-sandbox'] });

  const porId = {};
  for (const ficha of fichas) porId[ficha.id] = ficha;
  const capturas = {};
  const fallas = [];
  const erroresDeJs = [];
  let pagina = null;

  // --- Lo basico -------------------------------------------------------------

  async function paginaNueva(ventana, idioma) {
    if (pagina) await pagina.context().close();
    // El idioma y la zona del navegador importan: un campo de fecha vacio
    // dibuja su formato con el idioma del navegador (dd/mm/aaaa, no
    // mm/dd/yyyy), y "hoy" se cuenta con la zona horaria. Un CAM de Bogota y un
    // KAM de Sao Paulo no ven lo mismo que un navegador en ingles y en UTC.
    const region = idioma === 'pt'
      ? { locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' }
      : { locale: 'es-CO', timezoneId: 'America/Bogota' };
    const contexto = await navegador.newContext(Object.assign(region,
      ventana === 'celular'
        ? { viewport: CELULAR, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
        : { viewport: ESCRITORIO }
    ));
    pagina = await contexto.newPage();
    pagina.on('pageerror', (error) => erroresDeJs.push((ventana || 'escritorio') + ': ' + error.message));
    await pagina.goto(DEMO);
    await pagina.waitForTimeout(700);
    if (idioma === 'pt') {
      await pagina.evaluate(() => window.localStorage.setItem('rappimind.idioma', 'pt'));
      await pagina.reload();
      await pagina.waitForTimeout(700);
    }
  }

  /** Guarda la pantalla. El id tiene que estar en las fichas. */
  async function capturar(id, opciones) {
    const ficha = porId[id];
    if (!ficha) throw new Error('no hay ficha para la pantalla "' + id + '"');
    if (opciones && opciones.porQue) {
      await pagina.evaluate(() => {
        for (const desplegable of document.querySelectorAll('details.por-que')) desplegable.open = true;
      });
      await pagina.waitForTimeout(120);
    }
    await pagina.waitForTimeout(260);
    const html = await pagina.evaluate(congelar, {
      prefijo: ficha.ancla,
      vistaPreviaCompleta: !!ficha.vistaPreviaCompleta,
      marcaVistaPrevia: marcas.vistaPrevia,
      marcaDocumento: marcas.documento,
    });
    if (!html || html.length < 200) throw new Error('la pantalla "' + id + '" salió vacía');
    capturas[id] = html;
    console.log('ok    ' + ficha.numero + ' ' + ficha.titulo + ' (' + Math.round(html.length / 1024) + ' KB)');
  }

  /** Clic en el primer boton o enlace cuyo texto empieza por la etiqueta. */
  async function clic(etiqueta) {
    const etiquetas = Array.isArray(etiqueta) ? etiqueta : [etiqueta];
    const encontrado = await pagina.evaluate((lista) => {
      const botones = [].slice.call(document.querySelectorAll('button, a'));
      for (const texto of lista) {
        // getClientRects y no offsetParent: un elemento con position fixed no
        // tiene offsetParent, y el boton flotante del celular es fijo.
        const boton = botones.filter((x) => x.textContent.trim().indexOf(texto) === 0 && x.getClientRects().length > 0)[0];
        if (boton) { boton.click(); return true; }
      }
      return false;
    }, etiquetas);
    if (!encontrado) throw new Error('no encontré el botón: ' + etiquetas.join(' / '));
    await pagina.waitForTimeout(340);
  }

  function tituloAbierto() {
    return pagina.evaluate(() =>
      [].map.call(document.querySelectorAll('.pregunta .pregunta-titulo'), (t) => t.textContent.trim()).join(' | '));
  }

  /**
   * La pregunta abierta: la ultima de la columna, con su campo si lo tiene.
   *
   * No todas las preguntas llevan data-campo: la del pais, la del tipo y la de
   * "cuantas veces puede ganar" las dibuja 62-pasos.js con su propia forma. Por
   * eso la identidad es el campo cuando existe y el enunciado cuando no.
   */
  function preguntaAbierta() {
    return pagina.evaluate(() => {
      const bloques = document.querySelectorAll('.pregunta');
      const bloque = bloques[bloques.length - 1];
      const pasoActual = document.querySelector('.progreso .actual button');
      return {
        campo: bloque ? bloque.getAttribute('data-campo') : null,
        titulo: bloque ? (bloque.querySelector('.pregunta-titulo') || { textContent: '' }).textContent.trim() : '',
        paso: pasoActual ? pasoActual.textContent.trim() : '',
      };
    });
  }

  async function siguiente() {
    await clic(['Siguiente', 'Avançar', 'Revisar y generar', 'Revisar e gerar']);
  }

  /** Elige una opcion por su titulo. Si la pregunta no avanza sola, da Siguiente. */
  async function elegirOpcion(titulo) {
    const antes = await tituloAbierto();
    const encontrado = await pagina.evaluate((texto) => {
      const botones = [].slice.call(document.querySelectorAll('.opcion'));
      let boton = botones.filter((b) => {
        const cabeza = b.querySelector('.opcion-titulo');
        return (cabeza ? cabeza.textContent : b.textContent).trim() === texto;
      })[0];
      if (!boton) boton = botones.filter((b) => b.textContent.trim().indexOf(texto) === 0)[0];
      if (!boton) return false;
      boton.click();
      return true;
    }, titulo);
    if (!encontrado) throw new Error('no encontré la opción: ' + titulo);
    await pagina.waitForTimeout(340);
    const despues = await tituloAbierto();
    if (despues && despues === antes) await siguiente();
  }

  async function decirQueNoATodo() {
    for (let vuelta = 0; vuelta < 15; vuelta++) {
      const quedan = await pagina.evaluate(() => {
        const bloques = document.querySelectorAll('.pregunta');
        for (const bloque of bloques) {
          const no = [].slice.call(bloque.querySelectorAll('.opcion')).filter((b) => /^(No|Não)$/.test(b.textContent.trim()))[0];
          if (no && no.getAttribute('aria-pressed') !== 'true') { no.click(); return true; }
        }
        return false;
      });
      await pagina.waitForTimeout(170);
      if (!quedan) break;
    }
    await pagina.waitForTimeout(380);
  }

  async function escribir(valor, tipo) {
    const selector = '.pregunta input[type=' + (tipo || 'text') + ']';
    await pagina.waitForSelector(selector, { timeout: 3000 });
    await pagina.fill(selector, valor);
    await pagina.waitForTimeout(220);
  }

  async function marcarCasilla(etiqueta) {
    const encontrada = await pagina.evaluate((texto) => {
      const casillas = [].slice.call(document.querySelectorAll('label.casilla'));
      const casilla = casillas.filter((c) => c.textContent.trim().indexOf(texto) === 0)[0];
      if (!casilla) return false;
      casilla.querySelector('input').click();
      return true;
    }, etiqueta);
    if (!encontrada) throw new Error('no encontré la casilla: ' + etiqueta);
    await pagina.waitForTimeout(220);
  }

  /** Un valor que el control acepte, cuando el campo no tiene uno escrito. */
  function valorPorTipo(forma) {
    if (forma.tipo === 'date') return '2026-12-31';
    if (forma.tipo === 'time') return '23:59';
    if (forma.esNumerico || forma.tipo === 'number') return '3';
    return 'Ejemplo';
  }

  /**
   * Responde la pregunta abierta con lo primero razonable y avanza, hasta
   * llegar al objetivo: { campo: 'desempate' } o { paso: 'Tiendas' }.
   *
   * Para los caminos donde lo que interesa esta cinco preguntas adentro y las
   * de en medio no salen en el documento.
   */
  async function avanzarHasta(objetivo, maximo) {
    let anterior = null;
    for (let vuelta = 0; vuelta < (maximo || 20); vuelta++) {
      const abierta = await preguntaAbierta();
      if (objetivo.paso && abierta.paso === objetivo.paso) return abierta;
      if (objetivo.campo && abierta.campo === objetivo.campo) return abierta;
      if (!abierta.titulo && !abierta.campo) throw new Error('no hay pregunta abierta y no llegué al objetivo');

      const identidad = abierta.campo || abierta.titulo;
      if (identidad === anterior) throw new Error('la pregunta "' + identidad + '" no avanza');
      anterior = identidad;

      const forma = await pagina.evaluate(() => {
        const bloques = document.querySelectorAll('.pregunta');
        const bloque = bloques[bloques.length - 1];
        const control = bloque.querySelector('input[type=text], input[type=number], input[type=date], input[type=time], textarea');
        const opcion = [].slice.call(bloque.querySelectorAll('.opcion')).filter((b) => !b.disabled)[0];
        return {
          hayOpcion: !!opcion,
          hayControl: !!control,
          tieneValor: control ? control.value !== '' : false,
          tipo: control ? (control.tagName === 'TEXTAREA' ? 'textarea' : control.type) : null,
          // Los campos de numero son input[type=text] con inputmode numeric, y
          // filtran lo que no sea un digito: escribirles una palabra no entra.
          esNumerico: control ? control.getAttribute('inputmode') === 'numeric' : false,
          // El campo al que pertenece el control, cuando la pregunta no lo dice.
          campoDelControl: control && control.id ? control.id.replace(/^campo-/, '') : null,
        };
      });

      if (forma.hayOpcion) {
        await pagina.evaluate(() => {
          const bloques = document.querySelectorAll('.pregunta');
          const bloque = bloques[bloques.length - 1];
          [].slice.call(bloque.querySelectorAll('.opcion')).filter((b) => !b.disabled)[0].click();
        });
        await pagina.waitForTimeout(300);
        const despues = await preguntaAbierta();
        if ((despues.campo || despues.titulo) === identidad) await siguiente();
        continue;
      }

      if (forma.hayControl && !forma.tieneValor) {
        const valor = VALORES_GENERICOS[abierta.campo] || VALORES_GENERICOS[forma.campoDelControl] ||
          valorPorTipo(forma);
        // Al control de la pregunta abierta, no al primero de la pantalla:
        // arriba quedan las preguntas ya respondidas.
        await pagina.locator('.pregunta').last().locator('input, textarea').first().fill(valor);
        await pagina.waitForTimeout(220);
      }
      await siguiente();
    }
    throw new Error('no llegué al objetivo ' + JSON.stringify(objetivo) + ' en ' + (maximo || 20) + ' preguntas');
  }

  /** Corre un tramo. Si falla, anota las pantallas que se quedaron sin hacer. */
  async function tramo(nombre, ids, correr) {
    try {
      await correr();
    } catch (error) {
      for (const id of ids) {
        if (capturas[id]) continue;
        fallas.push({ id: id, motivo: error.message });
        console.log('FALTA ' + id + ' (' + nombre + ': ' + error.message + ')');
      }
    }
  }

  /** Deja el formulario lleno de una vez y salta a una pantalla. */
  async function saltarA(pantalla, campana) {
    await pagina.goto(DEMO);
    await pagina.waitForTimeout(700);
    await pagina.evaluate((datos) => {
      RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), datos.campana), {});
      RM.estado.estado.filtroRespondido = true;
      RM.app.ir(datos.pantalla);
    }, { pantalla: pantalla, campana: campana });
    await pagina.waitForTimeout(600);
  }

  /**
   * Hoy, como lo cuenta la pagina, no como lo cuenta el contenedor.
   *
   * El navegador del recorrido corre en America/Bogota y el contenedor en UTC,
   * asi que entre medianoche y las cinco de la manana UTC no son el mismo dia.
   * Con la fecha del contenedor, la campana de la pantalla 36 arrancaba
   * "manana" para la pagina, "En curso" no se cumplia y el boton Ampliar no se
   * dibujaba: la pantalla desaparecia del archivo, y solo los dias que el
   * recorrido se corriera de madrugada.
   */
  function hoyEnLaPagina() {
    return pagina.evaluate(() => RM.estado.estado.configuracion.hoy);
  }

  const CAMPANA_DE_EJEMPLO = {
    pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'Farmatodo', alcance: 'Nacional', ciudades: '',
    segmento: 'todos', metodoPago: 'todos', declaracion: false,
    fechaInicio: '2026-10-01', horaInicio: '00:00', fechaFin: '2026-10-31', horaFin: '23:59',
    organizadorRazonSocial: 'Farmatodo Colombia S.A.S.', organizadorId: '900111222-1',
    porcentaje: 20, tope: 20000, presupuesto: 5000000, maxPedidos: 1, sinLimite: false,
    carga: 'inmediata', vigencia: 'dias', diasVigencia: 30, redencion: 'tienda', condiciones: [],
    categoriaProducto: 'licores',
  };

  // --- 1. El recorrido del Cashback, de principio a fin ----------------------
  //
  // El camino va como lista para poder correr un trozo en celular sin
  // escribirlo dos veces. Cada paso es una accion o una captura.
  const CAMINO = [
    { captura: 'inicio' },
    { clic: 'Empezar' }, { captura: 'filtro' },
    { noATodo: true }, { captura: 'pais', porQue: true },
    { opcion: 'Colombia' }, { captura: 'negocio', porQue: true },
    { opcion: 'Rappi' }, { captura: 'tipos', porQue: true },
    { opcion: 'Cashback' }, { captura: 'tienda', porQue: true },
    { texto: 'Farmatodo' }, { siguiente: true }, { captura: 'cobertura', porQue: true },
    { opcion: 'En todo el país' }, { captura: 'organizador', porQue: true },
    { texto: 'Farmatodo Colombia S.A.S.' }, { siguiente: true },
    // El NIT se escribe antes de capturar: la pantalla lo muestra ya validado.
    { texto: '900.111.222-1' }, { captura: 'identificacion', porQue: true },
    // Y de paso, el error en vivo: un NIT que no existe, en la misma pregunta.
    { texto: '123' }, { siguiente: true }, { captura: 'error' },
    { texto: '900.111.222-1' }, { siguiente: true }, { captura: 'fecha-inicio', porQue: true },
    { fecha: '2026-10-01' }, { siguiente: true },
    { hora: '00:00' }, { siguiente: true },
    { fecha: '2026-10-31' }, { siguiente: true },
    { hora: '23:59' }, { siguiente: true }, { captura: 'porcentaje', porQue: true },
    { texto: '20' }, { siguiente: true }, { captura: 'tope', porQue: true },
    { texto: '20000' }, { siguiente: true }, { captura: 'presupuesto', porQue: true },
    { texto: '5000000' }, { siguiente: true }, { captura: 'veces', porQue: true },
    { opcion: 'Una sola vez' }, { captura: 'condiciones', porQue: true },
    { casilla: 'Solo si el pedido se hace por Turbo' }, { siguiente: true }, { captura: 'carga', porQue: true },
    { opcion: 'Al día siguiente del pedido' }, { captura: 'vigencia', porQue: true },
    { opcion: 'Hasta una fecha' }, { fecha: '2026-12-31' }, { siguiente: true }, { captura: 'redencion', porQue: true },
    { opcion: 'Solo en esta tienda' }, { captura: 'segmento', porQue: true },
    { opcion: 'Todos los usuarios' }, { captura: 'medio-de-pago', porQue: true },
    { opcion: 'Con cualquier medio de pago' }, { captura: 'compra-minima', porQue: true },
    { texto: '30000' }, { siguiente: true }, { captura: 'categoria-producto', porQue: true },
    // La unica pregunta nueva del encargo 03: decide la leyenda que va dentro
    // del arte, no el T&C. Las opciones salen del catalogo de modelos/leyendas/.
    { opcion: 'Licores y cervezas' }, { captura: 'resumen' },
  ];

  async function correrCamino(camino, mapa) {
    for (const paso of camino) {
      if (paso.captura) {
        const id = Object.prototype.hasOwnProperty.call(mapa, paso.captura) ? mapa[paso.captura] : paso.captura;
        if (id) await capturar(id, paso);
        continue;
      }
      if (paso.clic) await clic(paso.clic);
      else if (paso.noATodo) await decirQueNoATodo();
      else if (paso.opcion) await elegirOpcion(paso.opcion);
      else if (paso.texto !== undefined) await escribir(paso.texto);
      else if (paso.fecha) await escribir(paso.fecha, 'date');
      else if (paso.hora) await escribir(paso.hora, 'time');
      else if (paso.casilla) await marcarCasilla(paso.casilla);
      else if (paso.siguiente) await siguiente();
      else throw new Error('paso del camino que no sé hacer: ' + JSON.stringify(paso));
    }
  }

  await tramo('el recorrido del Cashback', CAMINO.filter((p) => p.captura).map((p) => p.captura).concat(['resumen-completo', 'listo', 'historial', 'ayuda']), async () => {
    await paginaNueva('escritorio', 'es');
    await correrCamino(CAMINO, {});

    await pagina.click('#declaracion');
    await pagina.waitForTimeout(280);
    await capturar('resumen-completo');

    await clic('Generar T&C');
    await pagina.waitForTimeout(1100);
    // La pantalla final de produccion, no la de la demostracion: la de la
    // demostracion cambia el enlace del documento por el texto que habria
    // salido, y lo que este documento describe es la herramienta real.
    await pagina.evaluate((enlace) => {
      RM.estado.estado.resultado.demostracion = false;
      RM.estado.estado.resultado.linkDoc = enlace;
      RM.app.dibujar();
    }, DOC_DE_EJEMPLO);
    await pagina.waitForTimeout(400);
    await capturar('listo');

    await clic(['Ver mi historial', 'Mis campañas']);
    await pagina.waitForTimeout(800);
    await capturar('historial');

    await clic('Ayuda');
    await capturar('ayuda');
  });

  // --- 2. Legal ---------------------------------------------------------------
  await tramo('el camino a Legal', ['legal'], async () => {
    await paginaNueva('escritorio', 'es');
    await clic('Empezar');
    await elegirOpcion('Sí');
    await pagina.waitForTimeout(420);
    await capturar('legal');
  });

  // --- 3. Rappi Travel --------------------------------------------------------
  await tramo('Rappi Travel', ['filtro-travel', 'tipos-travel'], async () => {
    await paginaNueva('escritorio', 'es');
    await clic('Empezar');
    await decirQueNoATodo();
    await elegirOpcion('Colombia');
    await elegirOpcion('Rappi Travel');
    await pagina.waitForTimeout(320);
    await capturar('filtro-travel');

    await decirQueNoATodo();
    await capturar('tipos-travel', { porQue: true });
  });

  // --- 4. Los T&C que Legal ya publico ----------------------------------------
  await tramo('los T&C ya publicados', ['tyc-generales', 'tyc-detalle'], async () => {
    await paginaNueva('escritorio', 'es');
    await clic('Empezar');
    await decirQueNoATodo();
    await elegirOpcion('Colombia');
    await elegirOpcion('Rappi');
    await clic('Descuentos, cupones');
    await pagina.waitForTimeout(420);
    await capturar('tyc-generales');

    await clic('Descuento en Productos Seleccionados');
    await pagina.waitForTimeout(420);
    await capturar('tyc-detalle');
  });

  // --- 5. Un pais en piloto ---------------------------------------------------
  await tramo('un país en piloto', ['pais-en-pruebas'], async () => {
    await paginaNueva('escritorio', 'es');
    await clic('Empezar');
    await decirQueNoATodo();
    // Ecuador, porque Mexico salio de piloto el 18 de septiembre. Quedan
    // Ecuador y Costa Rica, que siguen sin decir como escriben los miles.
    await elegirOpcion('Ecuador');
    await elegirOpcion('Rappi');
    await pagina.waitForTimeout(400);
    await capturar('pais-en-pruebas');
  });

  // --- 6. Cashback Day y Carrera de Compras -----------------------------------
  await tramo('Cashback Multitienda', ['cashback-day'], async () => {
    await paginaNueva('escritorio', 'es');
    await clic('Empezar');
    await decirQueNoATodo();
    await elegirOpcion('Colombia');
    await elegirOpcion('Rappi');
    await elegirOpcion('Cashback Multitienda');
    await pagina.waitForTimeout(320);
    await avanzarHasta({ paso: 'Tiendas' }, 14);
    // Con tiendas de verdad: la pantalla vacia no muestra ni la cuenta ni lo
    // que la herramienta hace con cada fila pegada.
    await pagina.evaluate(() => {
      for (const desplegable of document.querySelectorAll('details.por-que')) {
        if (/Pegar varias tiendas/.test(desplegable.textContent)) desplegable.open = true;
      }
    });
    await pagina.locator('textarea').first().fill([
      'Farmatodo\tFarmatodo Colombia S.A.S.\t900.111.222-1\tNacional\t5000000',
      'Cruz Verde\tCruz Verde Colombia S.A.S.\t900.333.444-0\tBogotá, Medellín\t3000000',
      'La Rebaja\tDrogas La Rebaja S.A.\t800.555.666-9\tNacional\t2000000',
    ].join('\n'));
    await clic('Agregar estas tiendas');
    await pagina.waitForTimeout(520);
    await capturar('cashback-day', { porQue: true });
  });

  await tramo('Carrera de Compras', ['carrera'], async () => {
    await paginaNueva('escritorio', 'es');
    await clic('Empezar');
    await decirQueNoATodo();
    await elegirOpcion('Colombia');
    await elegirOpcion('Rappi');
    await elegirOpcion('Carrera de Compras');
    await pagina.waitForTimeout(320);
    await avanzarHasta({ campo: 'desempate' }, 25);
    await capturar('carrera', { porQue: true });
  });

  // El acuerdo de transferencia de datos, que solo sale en Carrera con premio
  // fisico entregado por el Organizador. Es la unica combinacion en la que Rappi
  // le pasa a la marca el nombre, la direccion y el documento del ganador, y el
  // panel es el circuito de nueve pasos que Legal CO usa para firmarlo.
  await tramo('el acuerdo de transferencia de datos', ['acuerdo-datos'], async () => {
    await paginaNueva('escritorio', 'es');
    await pagina.evaluate(function () {
      RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), {
        pais: 'CO', negocio: 'rappi', tipo: 'carrera_compras', tienda: 'Carulla',
        alcance: 'Nacional', ciudades: '', segmento: 'todos', metodoPago: 'todos',
        fechaInicio: '2026-11-01', horaInicio: '00:00', fechaFin: '2026-11-30', horaFin: '23:59',
        organizadorRazonSocial: 'Bimbo de Colombia S.A.', organizadorId: '900111222-1',
        productos: 'marca', makerMarca: 'Bimbo', criterioGanador: 'mayor_valor',
        numeroGanadores: 1, desempate: 'primero',
        tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta de montaña rodado 29',
        entregaPor: 'organizador', acuerdoDatos: 'no_o_no_se',
        medioNotificacion: 'correo', fechaNotificacion: '2026-12-05', plazoConfirmacion: 5,
      }), {});
      RM.estado.estado.filtroRespondido = true;
      var pasos = RM.flujo.pasosDelTipo(RM.estado.entrada()).map(function (p) { return p.id; });
      RM.estado.estado.pasoActual = pasos.indexOf('premio');
      RM.estado.estado.campoAbierto = 'acuerdoDatos';
      RM.app.ir('pasos');
    });
    await pagina.waitForTimeout(600);
    await capturar('acuerdo-datos', { porQue: true });
  });

  // --- 7. Ampliar una campana publicada y en curso ----------------------------
  await tramo('ampliar una campaña', ['ampliar'], async () => {
    await paginaNueva('escritorio', 'es');
    // En curso hoy: la ampliacion solo existe para una campana publicada que
    // todavia no termino. El dia y el ano salen de la pagina, no del
    // contenedor: ver hoyEnLaPagina().
    const hoy = await hoyEnLaPagina();
    await saltarA('resumen', Object.assign({}, CAMPANA_DE_EJEMPLO, {
      fechaInicio: hoy, horaInicio: '00:00', fechaFin: hoy.slice(0, 4) + '-12-31',
    }));
    await pagina.click('#declaracion');
    await pagina.waitForTimeout(280);
    await clic('Generar T&C');
    await pagina.waitForTimeout(1100);
    await pagina.evaluate(() => {
      const id = RM.estado.estado.resultado.id;
      RM.servidorSimulado.marcarPublicado(id, 'https://promos.rappi.com/colombia/2026/cashback-farmatodo');
      RM.app.ir('historial');
    });
    await pagina.waitForTimeout(900);
    await clic('Ampliar');
    await pagina.waitForTimeout(420);
    await capturar('ampliar');
  });

  // --- 8. Administracion ------------------------------------------------------
  await tramo('administración', ['admin'], async () => {
    await paginaNueva('escritorio', 'es');
    await clic('Administración');
    await pagina.waitForTimeout(900);
    await capturar('admin');
  });

  // --- 9. La interfaz en portugues --------------------------------------------
  await tramo('la interfaz en portugués', ['pt-inicio', 'pt-filtro', 'pt-negocio', 'pt-tipos'], async () => {
    await paginaNueva('escritorio', 'pt');
    await capturar('pt-inicio');

    await clic('Começar');
    await capturar('pt-filtro');

    await decirQueNoATodo();
    await elegirOpcion('Brasil');
    await capturar('pt-negocio', { porQue: true });

    await elegirOpcion('Rappi');
    await capturar('pt-tipos', { porQue: true });
  });

  // --- 10. En celular ---------------------------------------------------------
  await tramo('en celular', ['celular-inicio', 'celular-pregunta', 'celular-hoja'], async () => {
    await paginaNueva('celular', 'es');
    await capturar('celular-inicio');

    // El mismo camino de arriba, hasta el tope: asi la hoja deslizable lleva
    // documento de verdad y no un documento vacio.
    const hastaElTope = CAMINO.slice(0, CAMINO.findIndex((p) => p.captura === 'tope') + 1);
    await correrCamino(hastaElTope, {
      inicio: null, filtro: null, pais: null, negocio: null, tipos: null, tienda: null,
      cobertura: null, organizador: null, identificacion: null, error: null,
      'fecha-inicio': null, porcentaje: null, tope: 'celular-pregunta',
    });

    await clic('Ver cómo va mi T&C');
    await pagina.waitForTimeout(520);
    await capturar('celular-hoja');
  });

  await navegador.close();

  return { capturas: capturas, fallas: fallas, erroresDeJs: erroresDeJs };
}

module.exports = { recorrer, DOC_DE_EJEMPLO };
