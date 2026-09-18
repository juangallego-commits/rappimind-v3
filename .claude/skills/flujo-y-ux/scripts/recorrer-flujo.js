'use strict';

/**
 * Recorre el flujo completo del comercial en la demostracion y revisa los
 * invariantes de experiencia de la skill flujo-y-ux.
 *
 * Existe porque los defectos de flujo no los ve `npm test`: cada mitad del
 * codigo es correcta por separado y lo que falla es el camino entero. El del
 * filtro de Travel (una pregunta que se quedo en dos sitios y hacia inalcanzable
 * media funcionalidad) lo vio Juan en una captura, no una prueba.
 *
 * Como correrlo:
 *   npm run demo
 *   node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js
 *
 * Necesita playwright-core y un Chromium. En el contenedor remoto estan en
 * PLAYWRIGHT_BROWSERS_PATH. Si no hay navegador, el script lo dice y no falla:
 * no es parte de `npm test` ni de lo que corre Juan en Windows.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const DEMO = 'file://' + path.join(RAIZ, 'demo', 'index.html');

const resultados = [];
function revisar(nombre, condicion, detalle) {
  resultados.push({ nombre: nombre, ok: !!condicion, detalle: condicion ? '' : (detalle || '') });
}

/** Busca playwright-core y un Chromium sin instalar nada. */
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

async function recorrer() {
  const navegadorDisponible = buscarNavegador();
  if (navegadorDisponible.falta) {
    console.log('No se puede recorrer el flujo: ' + navegadorDisponible.falta + '.');
    return 0;
  }
  if (!fs.existsSync(path.join(RAIZ, 'demo', 'index.html'))) {
    console.log('Falta demo/index.html. Corre `npm run demo` primero.');
    return 1;
  }

  const navegador = await navegadorDisponible.chromium.launch({
    executablePath: navegadorDisponible.ejecutable,
    args: ['--no-sandbox'],
  });
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 1000 } });
  const pagina = await contexto.newPage();
  const erroresDeJs = [];
  pagina.on('pageerror', function (e) { erroresDeJs.push(e.message); });

  const texto = () => pagina.evaluate(() => document.body.innerText);
  const titulos = () => pagina.evaluate(() =>
    [].map.call(document.querySelectorAll('.pregunta .pregunta-titulo'), (t) => t.textContent.trim()));

  async function clic(etiqueta) {
    await pagina.evaluate((t) => {
      const boton = [].slice.call(document.querySelectorAll('button, a'))
        .filter((x) => x.textContent.trim().indexOf(t) === 0)[0];
      if (!boton) throw new Error('no encontré el botón: ' + t);
      boton.click();
    }, etiqueta);
    await pagina.waitForTimeout(350);
  }

  /** Responde "No" a todas las preguntas visibles de un filtro, una por una. */
  async function decirQueNoATodo() {
    for (let vuelta = 0; vuelta < 15; vuelta++) {
      const quedan = await pagina.evaluate(() => {
        const bloques = document.querySelectorAll('.pregunta');
        for (let i = 0; i < bloques.length; i++) {
          const no = [].slice.call(bloques[i].querySelectorAll('.opcion'))
            .filter((b) => b.textContent.trim() === 'No')[0];
          if (no && no.getAttribute('aria-pressed') !== 'true') { no.click(); return true; }
        }
        return false;
      });
      await pagina.waitForTimeout(180);
      if (!quedan) break;
    }
    await pagina.waitForTimeout(400);
  }

  async function desdeElInicio() {
    await pagina.goto(DEMO);
    await pagina.waitForTimeout(800);
    await clic('Empezar');
  }

  // --- 1. El filtro general -------------------------------------------------
  await desdeElInicio();
  const filtroGeneral = await titulos();
  revisar('el filtro general tiene exactamente dos preguntas',
    filtroGeneral.length === 2, filtroGeneral.join(' | '));
  revisar('el filtro general no pregunta por Rappi Travel',
    filtroGeneral.join(' ').indexOf('Travel') === -1, filtroGeneral.join(' | '));
  revisar('el filtro general no pregunta quién fondea',
    filtroGeneral.join(' ').indexOf('fondea') === -1, filtroGeneral.join(' | '));

  await decirQueNoATodo();
  const enPais = await texto();
  revisar('pasar el filtro lleva a la pregunta del país',
    enPais.indexOf('Colombia') !== -1, enPais.replace(/\n+/g, ' | ').slice(0, 200));

  // --- 2. País, negocio y tipo ---------------------------------------------
  await clic('Colombia');
  const enNegocio = await texto();
  revisar('después del país se pregunta Rappi o Rappi Travel',
    enNegocio.indexOf('Rappi Travel') !== -1 && enNegocio.indexOf('¿La campaña es de') !== -1,
    enNegocio.replace(/\n+/g, ' | ').slice(0, 250));

  await clic('Rappi');
  await pagina.waitForTimeout(400);
  const tiposDeRappi = await texto();
  revisar('en Rappi salen los tipos de delivery',
    tiposDeRappi.indexOf('Cashback Multitienda') !== -1 && tiposDeRappi.indexOf('Carrera de Compras') !== -1,
    tiposDeRappi.replace(/\n+/g, ' | ').slice(0, 300));
  revisar('en Rappi no se cuelan los tipos de Travel',
    tiposDeRappi.indexOf('Cashback Travel') === -1);
  revisar('la lista de tipos nunca sale vacía',
    (await pagina.evaluate(() => document.querySelectorAll('.opcion').length)) > 0);

  // "Siguiente" sin tocar nada toma la opcion preseleccionada y avanza una sola
  // pregunta. Estuvo saltandose la del negocio, porque las tres preguntas de
  // arranque estaban escritas dos veces y la lista que navegaba no la tenia.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Siguiente');
  const trasSiguiente = await titulos();
  revisar('Siguiente avanza una pregunta, no se salta el negocio',
    trasSiguiente.length === 1 && trasSiguiente[0].indexOf('tipo de campaña') !== -1,
    trasSiguiente.join(' | '));
  const conNegocio = await texto();
  revisar('el negocio queda respondido con la opción preseleccionada',
    conNegocio.indexOf('¿La campaña es de Rappi o de Rappi Travel?') !== -1 &&
    conNegocio.indexOf('Revisa antes de generar') === -1,
    conNegocio.replace(/\n+/g, ' | ').slice(0, 250));

  // --- 3. El camino de Rappi Travel ----------------------------------------
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Rappi Travel');
  const enFiltroTravel = await texto();
  revisar('elegir Rappi Travel lleva a su filtro antes del tipo',
    enFiltroTravel.indexOf('Antes de seguir con tu campaña de Rappi Travel') !== -1,
    enFiltroTravel.replace(/\n+/g, ' | ').slice(0, 250));
  revisar('el filtro de Travel deja salir a quien entró por equivocación',
    enFiltroTravel.indexOf('Esta campaña no es de Travel') !== -1);

  await decirQueNoATodo();
  const tiposDeTravel = await texto();
  revisar('pasar el filtro de Travel deja elegir un tipo de Travel',
    tiposDeTravel.indexOf('Cashback Travel') !== -1 && tiposDeTravel.indexOf('Descuento Travel') !== -1,
    tiposDeTravel.replace(/\n+/g, ' | ').slice(0, 300));
  revisar('en Travel no se cuelan los tipos de delivery',
    tiposDeTravel.indexOf('Carrera de Compras') === -1);
  // La pregunta abierta es la del tipo. El negocio queda arriba, como respondida
  // con su "Cambiar": reabrirlo pareceria que el filtro no hubiera servido.
  const abiertaEnTravel = await titulos();
  revisar('al volver del filtro la pregunta abierta es la del tipo',
    abiertaEnTravel.length === 1 && abiertaEnTravel[0].indexOf('tipo de campaña') !== -1,
    abiertaEnTravel.join(' | '));
  revisar('el negocio queda arriba como respondida, con su Cambiar',
    tiposDeTravel.indexOf('Rappi Travel\nCambiar') !== -1 || tiposDeTravel.indexOf('Cambiar') !== -1,
    tiposDeTravel.replace(/\n+/g, ' | ').slice(0, 250));

  await clic('Cashback Travel');
  const enFormularioTravel = await texto();
  revisar('elegir el tipo sigue al formulario, no al resumen',
    enFormularioTravel.indexOf('Revisa antes de generar') === -1 &&
    enFormularioTravel.indexOf('¿Qué empresa paga el beneficio?') !== -1,
    enFormularioTravel.replace(/\n+/g, ' | ').slice(0, 300));
  revisar('la vista previa se está llenando',
    enFormularioTravel.indexOf('Sin empezar') === -1,
    enFormularioTravel.replace(/\n+/g, ' | ').slice(0, 200));

  // --- 3b. Las variantes: la misma pregunta, distinta segun el tipo --------
  //
  // El mecanismo de variantes estuvo construido y probado en Node sin que la
  // interfaz lo usara: llamaba a preguntaDe() sin el tipo. En el cashback por
  // ETA, que es de una sola ciudad, la pantalla seguia preguntando "En que
  // ciudades?" en plural.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Rappi');
  await clic('15 minutos o Cashback');

  const enEta = await titulos();
  revisar('la pregunta se adapta al tipo de campaña (variantes)',
    enEta.length === 1 && enEta[0].indexOf('¿En qué ciudad corre la campaña?') !== -1,
    enEta.join(' | '));

  const ayudaEta = await texto();
  revisar('la ayuda también sale en la variante del tipo',
    ayudaEta.indexOf('el botón Turbo se habilita ciudad por ciudad') !== -1,
    ayudaEta.replace(/\n+/g, ' | ').slice(0, 250));

  const pasosDelEta = await pagina.evaluate(() =>
    [].map.call(document.querySelectorAll('.progreso li'), (l) => l.textContent.trim()).join(' > '));
  revisar('un tipo sin organizador no muestra el paso de Organizador',
    pasosDelEta.indexOf('Organizador') === -1, pasosDelEta);

  await pagina.fill('.pregunta input[type=text]', 'Bogotá');
  await pagina.waitForTimeout(250);
  await clic('Siguiente');
  const trasLaCiudad = await titulos();
  revisar('responder y avanzar lleva al paso siguiente',
    trasLaCiudad.length === 1 && trasLaCiudad[0].indexOf('día arranca') !== -1,
    trasLaCiudad.join(' | '));

  // --- 3c. El aviso de que un pais esta en pruebas -------------------------
  //
  // Los ocho paises en piloto llevan valores legales que propuso la herramienta
  // y que no ha confirmado nadie. Quien prueba tiene que saberlo antes de leer
  // el documento y darlo por bueno.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('México');

  const avisoDePruebas = await pagina.evaluate(() => {
    const a = document.querySelector('.columna-preguntas .aviso');
    return a ? a.innerText : '';
  });
  revisar('un país en pruebas lo dice mientras se llena el formulario',
    avisoDePruebas.indexOf('está en pruebas') !== -1 && avisoDePruebas.indexOf('no publiques') !== -1,
    avisoDePruebas.slice(0, 200));

  // Y sigue ahi una pregunta despues: al elegir el pais el asistente avanza
  // solo, asi que colgarlo de esa pregunta era no mostrarlo nunca.
  await clic('Rappi');
  const avisoQueSigue = await pagina.evaluate(() => {
    const a = document.querySelector('.columna-preguntas .aviso');
    return a ? a.innerText : '';
  });
  revisar('el aviso acompaña todo el formulario, no solo la pregunta del país',
    avisoQueSigue.indexOf('está en pruebas') !== -1, avisoQueSigue.slice(0, 200));

  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  const sinAviso = await pagina.evaluate(() => {
    const a = document.querySelector('.columna-preguntas .aviso');
    return a ? a.innerText : '';
  });
  revisar('un país que no está en piloto no lleva el aviso', sinAviso === '', sinAviso.slice(0, 120));

  // --- 4. Los caminos que terminan en Legal --------------------------------
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('México');
  await clic('Rappi Travel');
  await pagina.waitForTimeout(500);
  const sinTravel = await texto();
  revisar('Travel en un país sin Travel va a Legal, no a un callejón',
    sinTravel.indexOf('Esta campaña la redacta Legal') !== -1 &&
    sinTravel.indexOf('todavía no está habilitado en México') !== -1,
    sinTravel.replace(/\n+/g, ' | ').slice(0, 300));

  await desdeElInicio();
  await pagina.evaluate(() => {
    const bloque = document.querySelectorAll('.pregunta')[0];
    [].slice.call(bloque.querySelectorAll('.opcion')).filter((b) => b.textContent.trim() === 'Sí')[0].click();
  });
  await pagina.waitForTimeout(600);
  const legal = await texto();
  revisar('un sí en el filtro general va a Legal con su razón',
    legal.indexOf('Esta campaña la redacta Legal') !== -1 && legal.indexOf('azar') !== -1,
    legal.replace(/\n+/g, ' | ').slice(0, 300));
  revisar('la pantalla de Legal no se lee como un castigo',
    legal.indexOf('No es un problema ni una negativa') !== -1);
  revisar('la pantalla de Legal ofrece a dónde ir',
    legal.indexOf('formulario') !== -1);

  // --- 6. Los T&C que Legal ya publicó ---------------------------------------
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Rappi');
  await pagina.waitForTimeout(400);
  const conAtajo = await texto();
  revisar('debajo de los tipos está el atajo a los T&C publicados',
    conAtajo.indexOf('¿No ves tu campaña en la lista?') !== -1 && conAtajo.indexOf('Descuentos, cupones') !== -1,
    conAtajo.replace(/\n+/g, ' | ').slice(0, 300));

  await clic('Descuentos, cupones');
  await pagina.waitForTimeout(400);
  const listaTyc = await texto();
  revisar('la lista de T&C publicados se lee como buena noticia',
    listaTyc.indexOf('no necesitas crear T&C') !== -1, listaTyc.replace(/\n+/g, ' | ').slice(0, 200));
  const tarjetasTyc = await pagina.evaluate(() => document.querySelectorAll('.opcion').length);
  revisar('salen los catorce T&C generales', tarjetasTyc === 14, String(tarjetasTyc));

  // Lo que Legal dejó sin resolver se dice antes del enlace, no después. Los dos
  // cupones llegaron del Excel sin descripción y son los que hoy lo prueban: el
  // "Descuento en Productos Seleccionados" dejó de estar repetido con la
  // decisión 45 y ya no tiene nada pendiente.
  await clic('Cupon de descuento - Valor fijo');
  await pagina.waitForTimeout(400);
  const conPendiente = await texto();
  revisar('un T&C con algo pendiente avisa antes de dar el enlace',
    conPendiente.indexOf('Antes de usar este enlace, confirma con Legal') !== -1 &&
    conPendiente.indexOf('Antes de usar este enlace, confirma con Legal') < conPendiente.indexOf('Enlace para la pieza'),
    conPendiente.replace(/\n+/g, ' | ').slice(0, 400));
  revisar('con algo pendiente no dice "listo, tal cual"',
    conPendiente.indexOf('ese es el enlace que va, tal cual') === -1);

  await clic('Ver los otros T&C publicados');
  await pagina.waitForTimeout(400);

  // El que estuvo repetido: ahora sale uno solo y sin nada que confirmar.
  await clic('Descuento en Productos Seleccionados');
  await pagina.waitForTimeout(400);
  const yaNoRepetido = await texto();
  revisar('el T&C que estuvo repetido ya no pide confirmar cuál va',
    yaNoRepetido.indexOf('Antes de usar este enlace, confirma con Legal') === -1 &&
    yaNoRepetido.indexOf('ese es el enlace que va, tal cual') !== -1,
    yaNoRepetido.replace(/\n+/g, ' | ').slice(0, 400));

  await clic('Ver los otros T&C publicados');
  await pagina.waitForTimeout(400);
  await clic('Envío Gratis');
  await pagina.waitForTimeout(400);
  const limpio = await texto();
  revisar('un T&C sin pendientes sí dice que está listo',
    limpio.indexOf('Listo, no tienes que generar nada') !== -1 && limpio.indexOf('confirma con Legal') === -1,
    limpio.replace(/\n+/g, ' | ').slice(0, 300));
  revisar('el detalle no repite el enlace de otro', limpio.indexOf('promos.rappi.com/colombia/enviogratis') !== -1);

  await clic('Volver a los tipos de campaña');
  await pagina.waitForTimeout(400);
  const deVuelta = await titulos();
  revisar('volver de los T&C publicados deja abierta la pregunta del tipo',
    deVuelta.length === 1 && deVuelta[0].indexOf('tipo de campaña') !== -1, deVuelta.join(' | '));

  // --- 6. La pantalla final de un pais en pruebas ---------------------------
  //
  // El aviso de "no publiques" estaba en el formulario y en el resumen, pero
  // no en la pantalla que explica como publicar, que es donde se decide.
  const campanaDeMexico = {
    pais: 'MX', negocio: 'rappi', tipo: 'cashback', tienda: 'Oxxo', alcance: 'Nacional', ciudades: '',
    segmento: 'todos', metodoPago: 'todos', declaracion: false,
    fechaInicio: '2026-12-01', horaInicio: '00:00', fechaFin: '2026-12-02', horaFin: '23:59',
    organizadorRazonSocial: 'Oxxo S.A. de C.V.', organizadorId: 'PRU200101AB5',
    porcentaje: 20, tope: 200, presupuesto: 100000, maxPedidos: 1, sinLimite: false,
    carga: 'inmediata', vigencia: 'dias', diasVigencia: 30, redencion: 'tienda', condiciones: [],
  };
  async function irAlResumenCon(unaPagina, campana) {
    await unaPagina.goto(DEMO);
    await unaPagina.waitForTimeout(800);
    await unaPagina.evaluate((datos) => {
      RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), datos), {});
      RM.estado.estado.filtroRespondido = true;
      RM.app.ir('resumen');
    }, campana);
    await unaPagina.waitForTimeout(700);
  }

  await irAlResumenCon(pagina, campanaDeMexico);
  await pagina.click('#declaracion');
  await pagina.waitForTimeout(400);
  await clic('Generar T&C');
  await pagina.waitForTimeout(1200);
  const pantallaFinal = await texto();
  revisar('la pantalla final de un país en pruebas también dice "no publiques"',
    pantallaFinal.indexOf('Tu T&C está listo') !== -1 && pantallaFinal.indexOf('no publiques') !== -1,
    pantallaFinal.replace(/\n+/g, ' | ').slice(0, 300));

  // --- 7. En celular, nada queda debajo del selector de idioma --------------
  //
  // El selector ES/BR es fijo abajo a la derecha. Con poco espacio reservado
  // al final de la pagina, tapaba "Revisar y generar" y "Generar T&C".
  const celular = await navegador.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const movil = await celular.newPage();
  movil.on('pageerror', function (e) { erroresDeJs.push('celular: ' + e.message); });
  await irAlResumenCon(movil, Object.assign({}, campanaDeMexico, {
    pais: 'CO', tienda: 'Jumbo', organizadorRazonSocial: 'Jumbo S.A.S.', organizadorId: '900111222-1', tope: 20000, presupuesto: 1000000,
  }));
  await movil.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await movil.waitForTimeout(400);
  const tapados = await movil.evaluate(() => {
    const rect = (el) => el.getBoundingClientRect();
    const selector = document.querySelector('.selector-idioma');
    if (!selector) return ['no hay selector de idioma'];
    const s = rect(selector);
    const solapa = (b) => !(b.right <= s.left || s.right <= b.left || b.bottom <= s.top || s.bottom <= b.top);
    return [].slice.call(document.querySelectorAll('.fila-botones button, .fila-botones a'))
      .filter((b) => b.offsetParent !== null && solapa(rect(b)))
      .map((b) => b.textContent.trim());
  });
  revisar('en celular el selector de idioma no tapa los botones del final', tapados.length === 0, tapados.join(' | '));
  await celular.close();

  revisar('ninguna pantalla lanzó un error de JavaScript',
    erroresDeJs.length === 0, erroresDeJs.join(' | '));

  await navegador.close();

  const fallaron = resultados.filter(function (r) { return !r.ok; });
  for (const r of resultados) {
    console.log((r.ok ? 'ok    ' : 'FALLA ') + r.nombre + (r.detalle ? '\n        ' + r.detalle : ''));
  }
  console.log('\n' + (fallaron.length ? fallaron.length + ' fallaron' : 'el recorrido completo pasa'));
  return fallaron.length ? 1 : 0;
}

recorrer().then(function (codigo) { process.exit(codigo); }).catch(function (error) {
  for (const r of resultados) console.log((r.ok ? 'ok    ' : 'FALLA ') + r.nombre);
  console.error('Se rompió el recorrido: ' + error.message);
  process.exit(1);
});
