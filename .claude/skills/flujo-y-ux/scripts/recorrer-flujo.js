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
