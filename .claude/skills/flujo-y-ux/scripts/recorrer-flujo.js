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

  /*
   * Busca una frase sin importar la caja.
   *
   * texto() devuelve innerText, o sea lo que el usuario VE, y eso es lo que
   * queremos comprobar. Pero desde el cambio de identidad el titulo del aviso
   * serio lleva text-transform: uppercase, asi que innerText lo devuelve en
   * mayusculas aunque en el DOM siga escrito en caja normal. Una busqueda
   * exacta fallaria por la caja y no por lo que de verdad se comprueba, que es
   * que el aviso este y este ANTES del enlace.
   */
  const donde = (todo, frase) =>
    todo.toLocaleLowerCase('es').indexOf(frase.toLocaleLowerCase('es'));
  const contiene = (todo, frase) => donde(todo, frase) !== -1;
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

  // Nueve preguntas: la sexta metía dos en una y se partió (F8, 20 de
  // septiembre), y la de quién paga se fue el 21 porque no filtraba nada.
  // Ninguna pasa de diez palabras, y las que necesitaban ejemplos los bajaron a
  // una línea de ayuda (F6 y F8). El copy dice el número que hay de verdad: lo
  // tenía escrito a mano y se quedó diciendo diez cuando ya eran nueve.
  const preguntasDeTravel = await pagina.evaluate(() =>
    [].map.call(document.querySelectorAll('.pregunta'), (q) => ({
      titulo: q.querySelector('.pregunta-titulo').textContent.trim(),
      ayuda: (q.querySelector('.pregunta-ayuda') || {}).textContent || '',
    })));
  // El 21 de septiembre se fue la del precio "desde", que pasó a ser una
  // pregunta del formulario, y quedaron ocho.
  // Y el beneficio que cambia según el producto pasó a ser una lista del
  // formulario, así que quedaron siete.
  revisar('el filtro de Travel tiene siete preguntas, y el copy dice siete',
    preguntasDeTravel.length === 7 && enFiltroTravel.indexOf('Siete preguntas rápidas') !== -1,
    preguntasDeTravel.length + ' preguntas · ' + enFiltroTravel.slice(0, 120));
  revisar('la del precio "desde" ya no está en el filtro',
    !preguntasDeTravel.some((q) => q.titulo.indexOf('precio') !== -1),
    preguntasDeTravel.map((q) => q.titulo).join(' | '));
  revisar('la mezcla de descuento y cashback sigue en el filtro, sola',
    preguntasDeTravel.some((q) => q.titulo === '¿Mezcla descuento y cashback en la misma campaña?') &&
    !preguntasDeTravel.some((q) => q.titulo.indexOf('condiciones cambian') !== -1),
    preguntasDeTravel.map((q) => q.titulo).join(' | '));
  revisar('la del beneficio se acortó y sus ejemplos bajaron a la ayuda',
    preguntasDeTravel.some((q) => q.titulo === '¿El beneficio es otra cosa que Créditos o descuento?' &&
      q.ayuda.indexOf('noches o niños gratis') !== -1),
    preguntasDeTravel.map((q) => q.titulo + ' >> ' + q.ayuda).join(' | '));
  const largas = preguntasDeTravel
    .filter((q) => q.titulo.split(/\s+/).length > 10).map((q) => q.titulo);
  revisar('ninguna pregunta del filtro pasa de diez palabras', largas.length === 0, largas.join(' | '));

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

  /*
   * Desde el 21 de septiembre de 2026 (punto D1) el documento tiene dos formas:
   * nombra la categoria del boton Turbo, que es como corren casi todas, o
   * nombra unas tiendas concretas una por una. Lo primero que se revisa es que
   * la forma por defecto, la de los dos documentos publicados, no obligue a
   * nadie a escribir una lista que no tiene.
   */
  const enElAlcance = await titulos();
  revisar('después de la ciudad se pregunta en qué corre la campaña',
    enElAlcance.length === 1 && enElAlcance[0].indexOf('¿En qué corre la campaña?') !== -1,
    enElAlcance.join(' | '));

  const textoDelAlcance = await texto();
  revisar('la opción de casi todas las campañas va primero y se explica',
    textoDelAlcance.indexOf('En todo Turbo Restaurantes de la ciudad') !== -1 &&
    textoDelAlcance.indexOf('El Corral Turbo') !== -1,
    textoDelAlcance.replace(/\n+/g, ' | ').slice(0, 300));

  await clic('En todo Turbo Restaurantes de la ciudad');
  const trasLaCategoria = await titulos();
  revisar('con una categoría no se pide ninguna lista de tiendas',
    trasLaCategoria.length === 1 && trasLaCategoria[0].indexOf('día arranca') !== -1,
    trasLaCategoria.join(' | '));

  const documentoDeCategoria = await texto();
  revisar('el documento dice la modalidad, como los dos publicados',
    documentoDeCategoria.indexOf('bajo la modalidad') !== -1 ||
    documentoDeCategoria.indexOf('Turbo Restaurantes') !== -1,
    documentoDeCategoria.replace(/\n+/g, ' | ').slice(0, 300));

  // Y ahora la otra forma: unas tiendas concretas, que el documento lista.
  await clic('Atrás');
  await clic('En unas tiendas concretas de Turbo');

  const enLasTiendas = await titulos();
  revisar('con tiendas concretas se piden las tiendas de Turbo',
    enLasTiendas.length === 1 && enLasTiendas[0].indexOf('¿Cuáles tiendas de Turbo participan?') !== -1,
    enLasTiendas.join(' | '));

  await clic('Agregar tienda');
  await pagina.fill('[data-tienda-eta="0"] input[type=text]', 'Turbo Calleja');
  await pagina.waitForTimeout(250);

  const conUnaTienda = await texto();
  revisar('la tienda escrita sale en el documento de al lado',
    conUnaTienda.indexOf('Turbo Calleja') !== -1,
    conUnaTienda.replace(/\n+/g, ' | ').slice(0, 300));

  // La misma tienda dos veces la nombraría dos veces en la cláusula. El aviso
  // sale al salir del campo, como en la lista de productos de la Carrera:
  // redibujar en cada tecla le quitaría el foco a quien está escribiendo.
  await clic('Agregar tienda');
  await pagina.fill('[data-tienda-eta="1"] input[type=text]', 'turbo calleja');
  await pagina.locator('[data-tienda-eta="1"] input[type=text]').blur();
  await pagina.waitForTimeout(250);
  const repetida = await texto();
  revisar('la tienda repetida se avisa en la fila, no al final',
    repetida.indexOf('ya está en la lista') !== -1,
    repetida.replace(/\n+/g, ' | ').slice(0, 300));

  await pagina.fill('[data-tienda-eta="1"] input[type=text]', 'Turbo Chico');
  await pagina.waitForTimeout(250);
  await clic('Siguiente');

  const trasLaCiudad = await titulos();
  revisar('responder y avanzar lleva al paso siguiente',
    trasLaCiudad.length === 1 && trasLaCiudad[0].indexOf('día arranca') !== -1,
    trasLaCiudad.join(' | '));

  /**
   * Pone un pais en piloto en la configuracion que ya tiene el navegador.
   *
   * Desde el 20 de septiembre de 2026 los nueve paises son activos. El aviso de
   * "esta en pruebas" sigue existiendo y tiene que seguir saliendo, asi que el
   * pais en piloto se construye aqui, como se hace en las pruebas de Node.
   */
  async function ponerEnPiloto(codigo) {
    await pagina.evaluate((cod) => {
      const config = RM.estado.estado.configuracion;
      config.paises.forEach((p) => { if (p.codigo === cod) p.estado = 'piloto'; });
      RM.app.dibujar();
    }, codigo);
    await pagina.waitForTimeout(200);
  }

  // --- 3c. El aviso de que un pais esta en pruebas -------------------------
  //
  // Un pais en piloto lleva valores legales que propuso la herramienta y que no
  // ha confirmado nadie. Quien prueba tiene que saberlo antes de leer el
  // documento y darlo por bueno.
  //
  // Antes este tramo usaba Mexico, y despues Ecuador. El 20 de septiembre de
  // 2026 salieron de piloto los dos ultimos, Ecuador y Costa Rica, asi que hoy
  // no queda ninguno: el pais en piloto se pone aqui. Lo que se revisa es que el
  // aviso siga funcionando para el dia en que entre un pais nuevo.
  await desdeElInicio();
  await ponerEnPiloto('EC');
  await decirQueNoATodo();
  await clic('Ecuador');

  const avisoDePruebas = await pagina.evaluate(() => {
    const a = document.querySelector('.columna-preguntas .aviso');
    return a ? a.innerText : '';
  });
  revisar('un país en pruebas lo dice mientras se llena el formulario',
    avisoDePruebas.indexOf('está en pruebas') !== -1 && avisoDePruebas.indexOf('no publiques') !== -1,
    avisoDePruebas.slice(0, 200));

  // Y sigue ahi una pregunta despues: al elegir el pais el asistente avanza
  // solo, asi que colgarlo de esa pregunta era no mostrarlo nunca. Ecuador no
  // tiene tipos de Travel, asi que la pregunta siguiente es la del tipo.
  await clic('Cashback');
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

  // --- 3d. La pregunta de la categoria del producto -------------------------
  //
  // Es la unica pregunta nueva del encargo 03, y solo sirve para la leyenda de
  // la pieza publicitaria. Sus opciones no estan escritas en ningun esquema:
  // salen del catalogo de modelos/leyendas/, asi que si el catalogo no llega al
  // navegador la pregunta sale sin una sola opcion que ofrecer.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Rappi');
  await clic('Cashback');
  await pagina.evaluate(function () {
    var pasos = RM.flujo.pasosDelTipo(RM.estado.entrada()).map(function (p) { return p.id; });
    RM.estado.estado.pasoActual = pasos.indexOf('pieza');
    RM.estado.estado.campoAbierto = 'categoriaProducto';
    RM.app.dibujar();
  });
  await pagina.waitForTimeout(400);

  const laPieza = await texto();
  revisar('la pregunta de la categoría del producto sale con sus opciones',
    laPieza.indexOf('¿Qué categoría tiene el producto de la pieza?') !== -1 &&
    laPieza.indexOf('Ninguna de estas') !== -1 &&
    laPieza.indexOf('Licores y cervezas') !== -1,
    laPieza.replace(/\n+/g, ' | ').slice(0, 400));

  // Cada opcion adelanta la advertencia que se va a imprimir. Sin eso, todas
  // decian lo mismo debajo y no habia con que elegir.
  revisar('cada categoría adelanta la advertencia que va a imprimir',
    laPieza.indexOf('El exceso de alcohol es perjudicial para la salud') !== -1,
    laPieza.replace(/\n+/g, ' | ').slice(0, 400));

  // Las siete categorias de medicamentos y nicotina ya no se ofrecen: en su
  // lugar va una sola opcion, la que no deja seguir (20 de septiembre de 2026).
  revisar('las siete categorías de medicamentos y nicotina ya no se ofrecen',
    laPieza.indexOf('Un medicamento de venta libre') === -1 &&
    laPieza.indexOf('Cigarrillos') === -1 &&
    laPieza.indexOf('Medicamentos, fitoterapéuticos, cigarrillos, tabaco calentado, vapeadores o productos con nicotina') !== -1,
    laPieza.replace(/\n+/g, ' | ').slice(0, 500));

  // "Ninguna" viene marcada, pero la pregunta se muestra igual: marcar no es
  // responder, y un dato que nadie confirmo sale impreso en una pieza.
  const categoriaMarcada = await pagina.evaluate(function () {
    var b = [].slice.call(document.querySelectorAll('.opcion'))
      .filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0];
    return {
      marcada: b ? b.innerText.split('\n')[0] : '',
      respondida: !!RM.estado.estado.respondidas.categoriaProducto,
    };
  });
  revisar('"Ninguna" viene marcada pero la pregunta se muestra igual',
    categoriaMarcada.marcada === 'Ninguna de estas' && categoriaMarcada.respondida === false,
    JSON.stringify(categoriaMarcada));

  // Elegir la categoria que no se puede hacer se queda en la pregunta, con su
  // razon, en vez de avanzar al resumen y dejar que alguien pulse Generar.
  await clic('Medicamentos, fitoterapéuticos, cigarrillos');
  await pagina.waitForTimeout(400);
  const bloqueada = await pagina.evaluate(function () {
    return {
      texto: document.body.innerText,
      pantalla: RM.estado.estado.pantalla,
      abierto: RM.estado.estado.campoAbierto,
    };
  });
  revisar('la categoría que no se puede hacer no deja seguir, y dice por qué',
    bloqueada.texto.indexOf('Esta campaña no se puede hacer') !== -1 &&
    bloqueada.texto.indexOf('#tyc-rappi') !== -1 &&
    bloqueada.pantalla === 'pasos',
    JSON.stringify({ pantalla: bloqueada.pantalla, abierto: bloqueada.abierto }));

  // Y la misma regla se avisa arriba de la lista de tipos, antes de llenar
  // veinte preguntas para enterarse al final.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Rappi');
  await pagina.waitForTimeout(400);
  const avisoEnLosTipos = await texto();
  revisar('la advertencia sale arriba de la lista de tipos, en Colombia',
    avisoEnLosTipos.indexOf('No se hacen campañas de cashback, descuento ni concursos sobre medicamentos') !== -1,
    avisoEnLosTipos.replace(/\n+/g, ' | ').slice(0, 400));

  await desdeElInicio();
  await decirQueNoATodo();
  await clic('México');
  await pagina.waitForTimeout(400);
  const sinAvisoEnMexico = await texto();
  revisar('y no sale en los países donde esa regla no existe',
    sinAvisoEnMexico.indexOf('No se hacen campañas de cashback, descuento ni concursos') === -1,
    sinAvisoEnMexico.replace(/\n+/g, ' | ').slice(0, 300));

  // Mexico ya tiene leyendas de campana desde el 20 de septiembre de 2026
  // (punto C4), asi que su paso de la pieza existe y ofrece las categorias
  // mexicanas, no las colombianas.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('México');
  await clic('Cashback');
  const pasosDeMexico = await pagina.evaluate(function () {
    return RM.flujo.pasosDelTipo(RM.estado.entrada()).map(function (p) { return p.id; });
  });
  revisar('México ya tiene paso de pieza, porque ya tiene leyendas',
    pasosDeMexico.indexOf('pieza') !== -1, pasosDeMexico.join(' > '));

  // Y en un pais sin ninguna advertencia de categoria la pregunta no existe:
  // pedir la categoria sin nada donde imprimirla es pedir un dato por pedirlo.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Uruguay');
  await clic('Cashback');
  const pasosDeUruguay = await pagina.evaluate(function () {
    return RM.flujo.pasosDelTipo(RM.estado.entrada()).map(function (p) { return p.id; });
  });
  revisar('en un país sin categorías que ofrecer no se pregunta la categoría',
    pasosDeUruguay.indexOf('pieza') === -1, pasosDeUruguay.join(' > '));

  // --- 3e. El negocio solo se pregunta donde hay algo que elegir -----------
  //
  // En un pais sin tipos de Travel, elegir Rappi Travel llevaba siempre a
  // Legal: un camino que arranca y muere una pregunta despues. Desde el 20 de
  // septiembre de 2026 (punto F8) ahi no se pregunta, y el negocio queda
  // respondido en Rappi.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('México');
  await pagina.waitForTimeout(400);
  const enMexicoSinNegocio = await pagina.evaluate(() => ({
    texto: document.body.innerText,
    negocio: RM.estado.entrada().negocio,
    respondido: !!RM.estado.estado.respondidas.negocio,
  }));
  revisar('en un país sin Travel no se pregunta el negocio',
    enMexicoSinNegocio.texto.indexOf('¿La campaña es de Rappi o de Rappi Travel?') === -1 &&
    enMexicoSinNegocio.negocio === 'rappi' && enMexicoSinNegocio.respondido,
    JSON.stringify({ negocio: enMexicoSinNegocio.negocio, respondido: enMexicoSinNegocio.respondido }));
  revisar('y en su lugar se ven los tipos, con la salida de quien no se reconoce',
    enMexicoSinNegocio.texto.indexOf('¿Qué tipo de campaña vas a hacer?') !== -1 &&
    enMexicoSinNegocio.texto.indexOf('Mi campaña no es ninguna de estas') !== -1,
    enMexicoSinNegocio.texto.replace(/\n+/g, ' | ').slice(0, 300));

  // Y en Colombia, que sí tiene Travel, la pregunta sigue estando.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await pagina.waitForTimeout(400);
  revisar('en un país con Travel el negocio se sigue preguntando',
    (await texto()).indexOf('¿La campaña es de Rappi o de Rappi Travel?') !== -1);

  // --- 3f. El contador cuenta la pregunta que va a aparecer ----------------
  //
  // Decia "Queda 1 pregunta en este paso" y despues salian dos: al responder
  // hasta cuando puede usar los Creditos aparece la fecha o el numero de dias.
  // Punto F8, 20 de septiembre de 2026.
  await pagina.goto(DEMO);
  await pagina.waitForTimeout(800);
  await pagina.evaluate(() => {
    RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), {
      pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'El Corral',
      tiendaTurbo: 'sin_turbo', porcentaje: 20, tope: 20000, presupuesto: 5000000,
      maxPedidos: 1, carga: 'inmediata',
    }), {});
    RM.estado.estado.filtroRespondido = true;
    RM.estado.estado.respondidas = { carga: true };
    RM.estado.estado.campoAbierto = 'vigencia';
    const pasos = RM.flujo.pasosDelTipo(RM.estado.entrada()).map((x) => x.id);
    RM.estado.estado.pasoActual = pasos.indexOf('creditos');
    RM.app.ir('pasos');
  });
  await pagina.waitForTimeout(500);
  const contadorDe = () => pagina.evaluate(() => {
    const p = [].slice.call(document.querySelectorAll('.columna-preguntas .pregunta-ayuda'))
      .filter((x) => /pregunta/.test(x.textContent)).pop();
    return p ? p.textContent.trim() : '';
  });
  const antesDeResponder = await contadorDe();
  await pagina.evaluate(() => {
    [].slice.call(document.querySelectorAll('.opcion'))
      .filter((b) => /Hasta una fecha/.test(b.textContent))[0].click();
  });
  await pagina.waitForTimeout(500);
  const despuesDeResponder = await contadorDe();
  revisar('el contador cuenta la pregunta que aparece según la respuesta',
    antesDeResponder === 'Quedan 2 preguntas en este paso.' &&
    despuesDeResponder === 'Queda 1 pregunta en este paso.',
    'antes: "' + antesDeResponder + '" · después: "' + despuesDeResponder + '"');

  // --- 3g. La Ayuda, ordenada por lo que se viene a buscar -----------------
  await pagina.goto(DEMO);
  await pagina.waitForTimeout(800);
  await pagina.evaluate(() => RM.app.ir('ayuda'));
  await pagina.waitForTimeout(500);
  const laAyuda = await pagina.evaluate(() => ({
    titulos: [].map.call(document.querySelectorAll('.pagina h2'), (h) => h.textContent.trim()),
    texto: document.body.innerText,
  }));
  revisar('la Ayuda abre por la pregunta de descuentos y cupones',
    /descuento o un cupón/.test(laAyuda.titulos[0] || ''), laAyuda.titulos.join(' | '));
  revisar('y después van Publicar en Squarespace y Quién puede publicar',
    laAyuda.titulos[1] === 'Publicar en Squarespace' && laAyuda.titulos[2] === '¿Quién puede publicar?',
    laAyuda.titulos.join(' | '));
  revisar('"Me equivoqué en un dato" no se repite',
    (laAyuda.texto.match(/Me equivoqué en un dato/g) || []).length === 1,
    String((laAyuda.texto.match(/Me equivoqué en un dato/g) || []).length));
  revisar('los descuentos entran en lo que sirve para esta herramienta',
    laAyuda.texto.indexOf('ya tienen T&C publicados y no generas nada') !== -1);

  // --- 4. Los caminos que terminan en Legal --------------------------------

  // Y un pais activo no lleva el aviso de pruebas ni en el formulario.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('México');
  const mexicoYaActivo = await pagina.evaluate(() => {
    const a = document.querySelector('.columna-preguntas .aviso');
    return a ? a.innerText : '';
  });
  revisar('México, que salió de piloto, ya no lleva el aviso de pruebas',
    mexicoYaActivo.indexOf('está en pruebas') === -1, mexicoYaActivo.slice(0, 200));

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

  // Punto F8, 20 de septiembre de 2026. Llegar a Legal por marcar mal una
  // casilla era un callejon: el unico camino de vuelta era "Volver al inicio",
  // que borra todo lo respondido.
  revisar('la pantalla de Legal deja cambiar la respuesta que llevó hasta ahí',
    legal.indexOf('Cambiar mi respuesta') !== -1, legal.replace(/\n+/g, ' | ').slice(0, 400));

  await clic('Cambiar mi respuesta');
  await pagina.waitForTimeout(600);
  const deVueltaAlFiltro = await texto();
  revisar('y al pulsarlo vuelve al filtro, no al inicio',
    deVueltaAlFiltro.indexOf('¿Hay azar') !== -1 &&
    deVueltaAlFiltro.indexOf('Esta campaña la redacta Legal') === -1,
    deVueltaAlFiltro.replace(/\n+/g, ' | ').slice(0, 300));

  // --- 5a. "En cual de sus tiendas se gana el cashback" -------------------
  //
  // Reemplazo a "en que pedidos se gana el beneficio" el 20 de septiembre de
  // 2026. Va en el paso de la campana, justo detras de la tienda, porque las
  // dos preguntas hablan de lo mismo, y arranca sin nada marcado: aqui no hay
  // respuesta mayoritaria que se pueda premarcar.
  await pagina.goto(DEMO);
  await pagina.waitForTimeout(800);
  await pagina.evaluate(() => {
    RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(),
      { pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'El Corral' }), {});
    RM.estado.estado.filtroRespondido = true;
    RM.estado.estado.campoAbierto = 'tiendaTurbo';
    const pasos = RM.flujo.pasosDelTipo(RM.estado.entrada()).map((x) => x.id);
    RM.estado.estado.pasoActual = pasos.indexOf('campana');
    RM.app.ir('pasos');
  });
  await pagina.waitForTimeout(600);
  const tiendaTurbo = await pagina.evaluate(() => {
    const bloque = [].slice.call(document.querySelectorAll('.pregunta'))
      .filter((q) => /cuál de sus tiendas/i.test(q.textContent)).pop();
    if (!bloque) return null;
    return {
      casillas: bloque.querySelectorAll('.casillas').length,
      marcadas: bloque.querySelectorAll('.opcion.elegida').length,
      opciones: [].map.call(bloque.querySelectorAll('.opcion'),
        (o) => o.querySelector('.opcion-titulo').textContent.trim()),
    };
  });
  revisar('en cuál de sus tiendas es una sola elección, no casillas',
    !!tiendaTurbo && tiendaTurbo.casillas === 0, JSON.stringify(tiendaTurbo));
  revisar('ofrece las cuatro respuestas de Juan',
    !!tiendaTurbo &&
    tiendaTurbo.opciones.join(' | ') ===
      'Solo en la tienda normal | Solo en la tienda de Turbo | En las dos | No tiene tienda en Turbo',
    JSON.stringify(tiendaTurbo));
  revisar('y arranca sin ninguna marcada',
    !!tiendaTurbo && tiendaTurbo.marcadas === 0, JSON.stringify(tiendaTurbo));

  // Y al responderla, la cláusula aparece en el documento de al lado.
  const clausulaDeTurbo = await pagina.evaluate(() => {
    const bloque = [].slice.call(document.querySelectorAll('.pregunta'))
      .filter((q) => /cuál de sus tiendas/i.test(q.textContent)).pop();
    const opcion = [].slice.call(bloque.querySelectorAll('.opcion'))
      .filter((o) => /Solo en la tienda de Turbo/.test(o.textContent))[0];
    opcion.click();
    return new Promise((listo) => setTimeout(() => {
      const hoja = document.querySelector('[data-hoja]');
      listo(hoja ? hoja.textContent : '');
    }, 500));
  });
  revisar('y la cláusula sale en el documento de al lado',
    clausulaDeTurbo.indexOf('dentro del botón “Turbo” de la Plataforma Rappi') !== -1,
    clausulaDeTurbo.slice(0, 200));

  // --- 5a bis. La calculadora del tope ------------------------------------
  //
  // Usaba un solo pedido de 100.000, que con 20% da justo el tope: la pantalla
  // decia el tope sin mostrar nunca que hace. Punto F8, 20 de septiembre 2026.
  await pagina.goto(DEMO);
  await pagina.waitForTimeout(800);
  await pagina.evaluate(() => {
    RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), {
      pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'El Corral',
      tiendaTurbo: 'sin_turbo', porcentaje: 20, tope: 20000, presupuesto: 50000000,
    }), {});
    RM.estado.estado.filtroRespondido = true;
    RM.estado.estado.campoAbierto = 'tope';
    const pasos = RM.flujo.pasosDelTipo(RM.estado.entrada()).map((x) => x.id);
    RM.estado.estado.pasoActual = pasos.indexOf('beneficio');
    RM.app.ir('pasos');
  });
  await pagina.waitForTimeout(500);
  const laCalculadora = await pagina.evaluate(() => {
    const caja = [].slice.call(document.querySelectorAll('.aviso'))
      .filter((a) => /recibe/.test(a.textContent))[0];
    return caja ? caja.innerText.replace(/\n+/g, ' | ') : '';
  });
  revisar('la calculadora muestra también un pedido donde se nota el tope',
    laCalculadora.indexOf('Y uno de $300.000 también recibe $20.000, por el tope.') !== -1,
    laCalculadora);

  // --- 5b. Las tres preguntas que dejaron de venir marcadas ----------------
  //
  // Punto F8. Una respuesta que nadie leyo queda impresa, y despues no se puede
  // excluir a nadie. Las tres deciden a quien se le puede negar el beneficio.
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Rappi');
  await clic('Cashback');
  const sinMarcar = await pagina.evaluate(() => {
    const entrada = RM.estado.entrada();
    return {
      redencion: entrada.redencion === undefined || entrada.redencion === null,
      segmento: entrada.segmento === undefined || entrada.segmento === null,
      metodoPago: entrada.metodoPago === undefined || entrada.metodoPago === null,
    };
  });
  revisar('dónde se gastan los Créditos arranca sin respuesta marcada', sinMarcar.redencion, JSON.stringify(sinMarcar));
  revisar('quiénes participan arranca sin respuesta marcada', sinMarcar.segmento, JSON.stringify(sinMarcar));
  revisar('con qué se paga arranca sin respuesta marcada', sinMarcar.metodoPago, JSON.stringify(sinMarcar));

  // --- 6. Los T&C que Legal ya publicó ---------------------------------------
  await desdeElInicio();
  await decirQueNoATodo();
  await clic('Colombia');
  await clic('Rappi');
  await pagina.waitForTimeout(400);
  const conAtajo = await texto();
  // Por encima de los cuatro tipos desde el 20 de septiembre de 2026 (F8): es
  // casi la mitad de la demanda real y estaba al final de la lista.
  revisar('el atajo a los T&C publicados va por encima de los tipos',
    conAtajo.indexOf('¿Es un descuento, un cupón o envío gratis?') !== -1 &&
    conAtajo.indexOf('¿Es un descuento, un cupón o envío gratis?') < conAtajo.indexOf('Cashback'),
    conAtajo.replace(/\n+/g, ' | ').slice(0, 300));
  revisar('y debajo de los tipos está la salida de quien no se reconoce',
    conAtajo.indexOf('Mi campaña no es ninguna de estas') !== -1 &&
    conAtajo.indexOf('Cashback') < conAtajo.indexOf('Mi campaña no es ninguna de estas'),
    conAtajo.replace(/\n+/g, ' | ').slice(0, 400));

  await clic('Descuentos, cupones');
  await pagina.waitForTimeout(400);

  // --- 6 bis. El filtro de seis preguntas antes de la lista ------------------
  //
  // Punto D6. Nadie revisaba si la campana cabia de verdad en el general que
  // iba a usar, y una condicion que el general no dice no se le puede exigir al
  // usuario. Cualquier si cambia el camino, y las salidas son tres.
  const elFiltro = await texto();
  revisar('antes de la lista van las seis preguntas del filtro',
    elFiltro.indexOf('¿Sirve un T&C general para tu campaña?') !== -1 &&
    elFiltro.indexOf('¿El usuario recibe Créditos o gana un premio?') !== -1 &&
    elFiltro.indexOf('¿Aplica solo a ciertos usuarios?') !== -1,
    elFiltro.replace(/\n+/g, ' | ').slice(0, 400));

  async function responderDelFiltro(pregunta, respuesta) {
    await pagina.evaluate(function (par) {
      var bloque = [].slice.call(document.querySelectorAll('.pregunta'))
        .filter(function (b) { return b.textContent.indexOf(par[0]) !== -1; })[0];
      var opcion = [].slice.call(bloque.querySelectorAll('.opcion'))
        .filter(function (o) { return o.textContent.trim() === par[1]; })[0];
      opcion.click();
    }, [pregunta, respuesta]);
    await pagina.waitForTimeout(450);
  }

  async function volverAlFiltro() {
    await desdeElInicio();
    await decirQueNoATodo();
    await clic('Colombia');
    await clic('Rappi');
    await clic('Descuentos, cupones');
    await pagina.waitForTimeout(400);
  }

  // Salida 1: no es un T&C general, y la herramienta sabe hacer ese documento.
  await responderDelFiltro('¿El usuario recibe Créditos o gana un premio?', 'Sí');
  const aLosTipos = await texto();
  revisar('un premio o Créditos devuelve a los tipos, con la razón',
    aLosTipos.indexOf('Vuelve a los tipos y elige Cashback o Carrera de Compras') !== -1,
    aLosTipos.replace(/\n+/g, ' | ').slice(0, 300));

  // Salida 2: a Legal, con la razon, y con vuelta a lo respondido.
  await volverAlFiltro();
  await responderDelFiltro('¿Es un evento especial', 'Sí');
  const aLegalDelFiltro = await texto();
  revisar('un evento especial va a Legal con su razón',
    aLegalDelFiltro.indexOf('Esta campaña la redacta Legal') !== -1 &&
    aLegalDelFiltro.indexOf('mucha visibilidad llevan T&C propio') !== -1,
    aLegalDelFiltro.replace(/\n+/g, ' | ').slice(0, 300));
  await clic('Cambiar mi respuesta');
  await pagina.waitForTimeout(400);
  const deVueltaAlFiltroDeGenerales = await pagina.evaluate(() => ({
    pantalla: RM.estado.estado.pantalla,
    respuestas: RM.estado.estado.filtroDeGenerales,
  }));
  revisar('y "Cambiar mi respuesta" vuelve al filtro con lo marcado',
    deVueltaAlFiltroDeGenerales.pantalla === 'filtroGenerales' &&
    deVueltaAlFiltroDeGenerales.respuestas.eventoEspecial === true,
    JSON.stringify(deVueltaAlFiltroDeGenerales));

  // Salida 3: hay un general que sirve, y la lista lo pone primero.
  await volverAlFiltro();
  await responderDelFiltro('¿Aplica solo a ciertos usuarios?', 'Sí');
  await clic('Pro o Pro Black');
  await pagina.waitForTimeout(400);
  const senalados = await texto();
  revisar('la respuesta de Pro señala cuáles sirven, sin esconder los demás',
    senalados.indexOf('los que sirven son los de Rappi Pro y Pro Black') !== -1 &&
    senalados.indexOf('Envío Gratis') !== -1,
    senalados.replace(/\n+/g, ' | ').slice(0, 400));

  // Y con las seis en no, la lista entera.
  await volverAlFiltro();
  await pagina.evaluate(() => {
    [].slice.call(document.querySelectorAll('.preguntas-filtro .opcion'))
      .filter((b) => b.textContent.trim() === 'No').forEach((b) => b.click());
  });
  await pagina.waitForTimeout(700);
  const listaTyc = await texto();
  revisar('la lista de T&C publicados se lee como buena noticia',
    listaTyc.indexOf('no necesitas crear T&C') !== -1, listaTyc.replace(/\n+/g, ' | ').slice(0, 200));
  const tarjetasTyc = await pagina.evaluate(() => document.querySelectorAll('.opcion').length);
  revisar('salen los catorce T&C generales', tarjetasTyc === 14, String(tarjetasTyc));

  // Lo que Legal dejó sin resolver se dice antes del enlace, no después. Hoy lo
  // prueban los cupones de membresía, cuyo enlace apunta a la versión de 2024
  // aunque la vigencia diga 2026: hasta que alguien lo republique, el comercial
  // tiene que enterarse antes de copiar el enlace.
  //
  // Antes lo probaban los dos cupones de descuento, que llegaron del Excel sin
  // descripción. Juan las escribió el 20 de septiembre de 2026 (punto E3) y ya
  // no tienen nada pendiente.
  await clic('Cupones de Descuento para Membresía Rappi Pro y Black');
  await pagina.waitForTimeout(400);
  const conPendiente = await texto();
  revisar('un T&C con algo pendiente avisa antes de dar el enlace',
    contiene(conPendiente, 'Antes de usar este enlace, confirma con Legal') &&
    donde(conPendiente, 'Antes de usar este enlace, confirma con Legal') < donde(conPendiente, 'Enlace para la pieza'),
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
    !contiene(yaNoRepetido, 'Antes de usar este enlace, confirma con Legal') &&
    yaNoRepetido.indexOf('ese es el enlace que va, tal cual') !== -1,
    yaNoRepetido.replace(/\n+/g, ' | ').slice(0, 400));

  await clic('Ver los otros T&C publicados');
  await pagina.waitForTimeout(400);
  await clic('Envío Gratis');
  await pagina.waitForTimeout(400);
  const limpio = await texto();
  revisar('el detalle dice lo que la pieza tiene que decir',
    limpio.indexOf('Tu pieza debe decir siempre') !== -1,
    limpio.replace(/\n+/g, ' | ').slice(0, 400));
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
  const campanaEnPruebas = {
    pais: 'EC', negocio: 'rappi', tipo: 'cashback', tienda: 'Tía', alcance: 'Nacional', ciudades: '',
    segmento: 'todos', metodoPago: 'todos', declaracion: false,
    fechaInicio: '2026-12-01', horaInicio: '00:00', fechaFin: '2026-12-02', horaFin: '23:59',
    organizadorRazonSocial: 'Comercial Tía S.A.', organizadorId: '1791234561001',
    porcentaje: 20, tope: 200, presupuesto: 100000, maxPedidos: 1, sinLimite: false,
    carga: 'inmediata', vigencia: 'dias', diasVigencia: 30, redencion: 'tienda', tiendaTurbo: 'sin_turbo',
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

  await irAlResumenCon(pagina, campanaEnPruebas);
  await ponerEnPiloto('EC');
  await pagina.click('#declaracion');
  await pagina.waitForTimeout(400);
  await clic('Generar T&C');
  await pagina.waitForTimeout(1200);
  const pantallaFinal = await texto();
  revisar('la pantalla final de un país en pruebas también dice "no publiques"',
    pantallaFinal.indexOf('Tu T&C está listo') !== -1 && pantallaFinal.indexOf('no publiques') !== -1,
    pantallaFinal.replace(/\n+/g, ' | ').slice(0, 300));

  // --- 6a. Lo que dice la pantalla final sobre las leyendas ----------------
  //
  // Dos decisiones de Juan del 20 de septiembre que solo existen si se ven:
  // C2, la leyenda de push y SMS sale sin enlace y la pantalla dice por que;
  // C1, la que no cabe dice que hacer, sin subir ningun limite.
  const campanaConLeyendas = {
    pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'El Corral', alcance: 'Nacional',
    ciudades: '', segmento: 'todos', metodoPago: 'todos', declaracion: false,
    fechaInicio: '2026-12-01', horaInicio: '00:00', fechaFin: '2026-12-31', horaFin: '23:59',
    organizadorRazonSocial: 'El Corral S.A.S.', organizadorId: '900111222-1',
    porcentaje: 20, tope: 25000, presupuesto: 50000000, maxPedidos: 1, sinLimite: false,
    carga: 'dia_siguiente', vigencia: 'dias', diasVigencia: 30, redencion: 'tienda',
    tiendaTurbo: 'sin_turbo', compraMinima: 30000, categoriaProducto: 'licores',
  };
  await irAlResumenCon(pagina, campanaConLeyendas);
  await pagina.click('#declaracion');
  await pagina.waitForTimeout(400);
  await clic('Generar T&C');
  await pagina.waitForTimeout(1200);
  const conLeyendas = await texto();

  revisar('la push sale sin enlace, y la pantalla dice por qué',
    conLeyendas.indexOf('El push o el SMS tiene que llevar al usuario a la campaña dentro de la app, donde está el enlace a los T&C.') !== -1,
    conLeyendas.replace(/\n+/g, ' | ').slice(-600));

  revisar('la leyenda que no cabe dice qué hacer, y no se recorta nada',
    conLeyendas.indexOf('Se pasa por') !== -1 &&
    conLeyendas.indexOf('Esta leyenda no cabe en este formato. Usa letra pequeña o un formato más grande; en exterior, agrega el código QR al mismo enlace.') !== -1,
    conLeyendas.replace(/\n+/g, ' | ').slice(-600));

  // Lo que además tiene que llevar el arte: el icono +18 es una imagen y el
  // titular lo escribe el disenador, asi que la herramienta los dice (C5).
  revisar('la pantalla final dice lo que el arte tiene que llevar',
    conLeyendas.indexOf('Además, en el arte') !== -1 &&
    conLeyendas.indexOf('ícono +18') !== -1 &&
    conLeyendas.indexOf('no es awareness') !== -1,
    conLeyendas.replace(/\n+/g, ' | ').slice(-600));

  // --- 6a bis. Quien puede publicar va primero -----------------------------
  //
  // Para casi todos el camino real es pasarselo a otra persona, y eso estaba
  // debajo de diez pasos de Squarespace que no iban a seguir. Punto F8, 20 de
  // septiembre de 2026.
  const dondeQuien = conLeyendas.indexOf('¿Quién puede publicar?');
  const dondePegar = conLeyendas.indexOf('Lo que vas a pegar en Squarespace');
  revisar('"¿Quién puede publicar?" va antes de lo de Squarespace',
    dondeQuien !== -1 && dondePegar !== -1 && dondeQuien < dondePegar,
    'quién: ' + dondeQuien + ' · pegar: ' + dondePegar);

  const plegados = await pagina.evaluate(() =>
    [].map.call(document.querySelectorAll('details summary'), (s) => s.textContent.trim()));
  revisar('los diez pasos de Squarespace quedan plegados',
    plegados.indexOf('Si tienes usuario de Squarespace') !== -1, plegados.join(' | '));

  const mensajeArmado = await pagina.evaluate(() => {
    const boton = [].slice.call(document.querySelectorAll('button'))
      .filter((b) => /Armar el mensaje/.test(b.textContent))[0];
    if (!boton) return '';
    boton.click();
    return new Promise((listo) => setTimeout(() => {
      const caja = [].slice.call(document.querySelectorAll('.copiable-valor'))
        .filter((c) => /Squarespace/.test(c.textContent))[0];
      listo(caja ? caja.textContent : '');
    }, 300));
  });
  revisar('el botón arma el mensaje con el título y la dirección',
    mensajeArmado.indexOf('Título del evento:') !== -1 &&
    mensajeArmado.indexOf('Dirección del evento:') !== -1 &&
    mensajeArmado.indexOf('El Corral') !== -1,
    mensajeArmado.replace(/\n+/g, ' | ').slice(0, 300));

  // --- 6b. El acuerdo de transferencia de datos ----------------------------
  //
  // Solo sale en Carrera de Compras, con premio fisico que entrega el
  // Organizador, que es la unica combinacion en la que Rappi le pasa al
  // Organizador el nombre, la direccion y el documento del ganador.
  //
  // La pantalla final repite el aviso, y ahi estuvo el defecto: el bloque se
  // agregaba con appendChild aunque fuera null, asi que en un cashback normal
  // (que no lleva esa pregunta) la pantalla final moria a medio pintar con
  // "No pudimos generar el documento" sobre un documento que si se genero.
  const carreraConPremioFisico = {
    pais: 'CO', negocio: 'rappi', tipo: 'carrera_compras', tienda: 'Carulla',
    alcance: 'Nacional', ciudades: '', segmento: 'todos', metodoPago: 'todos', declaracion: false,
    fechaInicio: '2026-11-01', horaInicio: '00:00', fechaFin: '2026-11-30', horaFin: '23:59',
    organizadorRazonSocial: 'Organizador de Prueba Tres S.A.S.', organizadorId: '900555666-1',
    productos: 'marca', makerMarca: 'Bimbo', criterioGanador: 'mayor_valor', numeroGanadores: 1,
    desempate: 'primero', tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta de montaña',
    entregaPor: 'organizador', medioNotificacion: 'correo', fechaNotificacion: '2026-12-05',
    plazoConfirmacion: 5, compraMinima: 30000,
  };

  async function abrirEnElAcuerdo(datos) {
    await pagina.goto(DEMO);
    await pagina.waitForTimeout(800);
    await pagina.evaluate(function (campana) {
      RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), campana), {});
      RM.estado.estado.filtroRespondido = true;
      var pasos = RM.flujo.pasosDelTipo(RM.estado.entrada()).map(function (p) { return p.id; });
      RM.estado.estado.pasoActual = pasos.indexOf('premio');
      RM.estado.estado.campoAbierto = 'acuerdoDatos';
      RM.app.ir('pasos');
    }, datos);
    await pagina.waitForTimeout(450);
    return texto();
  }

  const acuerdoSinResponder = await abrirEnElAcuerdo(carreraConPremioFisico);
  revisar('la pregunta del acuerdo de datos sale con premio físico del Organizador',
    acuerdoSinResponder.indexOf('¿El Organizador ya firmó el acuerdo de transferencia de datos?') !== -1 &&
    acuerdoSinResponder.indexOf('La marca aparece en verde en la tabla de acuerdos marco.') !== -1,
    acuerdoSinResponder.replace(/\n+/g, ' | ').slice(0, 300));

  const acuerdoEnColombia = await abrirEnElAcuerdo(
    Object.assign({}, carreraConPremioFisico, { acuerdoDatos: 'no_o_no_se' }));
  revisar('responder que no abre el circuito de Colombia, con sus pasos',
    acuerdoEnColombia.indexOf('Cómo se firma en Colombia') !== -1 &&
    acuerdoEnColombia.indexOf('Orden de Transferencia') !== -1 &&
    acuerdoEnColombia.indexOf('certificado de supresión') !== -1 &&
    acuerdoEnColombia.indexOf('[object') === -1,
    acuerdoEnColombia.replace(/\n+/g, ' | ').slice(0, 400));

  // El boton lleva a una carpeta de Drive que hoy no todos pueden abrir. Juan
  // decidio el 20 de septiembre que el boton se queda y que debajo va como
  // conseguir el acceso, en vez de dejar al comercial delante de "pide permiso".
  revisar('el botón del modelo de acuerdo dice qué hacer si no abre',
    acuerdoEnColombia.indexOf('Abrir el modelo de acuerdo') !== -1 &&
    acuerdoEnColombia.indexOf('Si no puedes abrirlo, pide el acceso desde la misma pantalla de Google y avísanos en #tyc-rappi.') !== -1,
    acuerdoEnColombia.replace(/\n+/g, ' | ').slice(-400));

  const acuerdoEnCreditos = await abrirEnElAcuerdo(Object.assign({}, carreraConPremioFisico, {
    tipoPremio: 'creditos', creditosPremio: 500000, descripcionPremio: '',
  }));
  revisar('con premio en Créditos no se pregunta por el acuerdo',
    acuerdoEnCreditos.indexOf('acuerdo de transferencia de datos') === -1,
    acuerdoEnCreditos.replace(/\n+/g, ' | ').slice(0, 300));

  // --- 7. En celular, nada queda debajo del selector de idioma --------------
  //
  // El selector ES/BR es fijo abajo a la derecha. Con poco espacio reservado
  // al final de la pagina, tapaba "Revisar y generar" y "Generar T&C".
  const celular = await navegador.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const movil = await celular.newPage();
  movil.on('pageerror', function (e) { erroresDeJs.push('celular: ' + e.message); });
  await irAlResumenCon(movil, Object.assign({}, campanaEnPruebas, {
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

  // --- 7b. Una opción que el país no puede cumplir se bloquea con su razón ---
  //
  // Los nombres de las secciones tienen que ser los de la app, porque el
  // documento los imprime entre comillas. Cuando esa lista existia solo para
  // Colombia, en México el comercial elegia "En ciertas secciones de Rappi" y
  // quedaba delante de una pregunta sin una sola casilla que marcar.
  //
  // Desde el 20 de septiembre de 2026 la lista es comun a todos los paises, asi
  // que hoy ninguno queda bloqueado. El bloqueo se sigue revisando aqui con un
  // pais al que se le pone lista propia vacia: el mecanismo tiene que seguir
  // enchufado a la pantalla para el dia en que vuelva a hacer falta.
  async function opcionesDeLaRedencionCon(codigoPais, identificacion, sinSecciones) {
    await pagina.goto(DEMO);
    await pagina.waitForTimeout(800);
    if (sinSecciones) {
      await pagina.evaluate((codigo) => {
        const propias = {};
        propias[codigo] = [];
        const config = RM.estado.estado.configuracion;
        config.secciones = { comun: config.secciones.comun, paises: propias };
      }, codigoPais);
    }
    await pagina.evaluate((datos) => {
      RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), datos), {});
      RM.estado.estado.filtroRespondido = true;
      RM.estado.estado.pasoActual = 4;
      RM.estado.estado.campoAbierto = 'redencion';
      RM.app.ir('pasos');
    }, Object.assign({}, campanaEnPruebas, {
      pais: codigoPais, tipo: 'cashback', tienda: 'Jumbo', organizadorRazonSocial: 'Jumbo S.A.S.',
      organizadorId: identificacion, redencion: 'tienda', tope: 20000, presupuesto: 1000000,
    }));
    await pagina.waitForTimeout(600);
    return pagina.evaluate(() => {
      const bloque = [].slice.call(document.querySelectorAll('.pregunta'))
        .filter((q) => /gastar los Créditos/i.test(q.textContent)).pop();
      if (!bloque) return null;
      return [].map.call(bloque.querySelectorAll('.opcion'), (o) => ({
        texto: o.textContent.trim().replace(/\s+/g, ' '),
        bloqueada: o.disabled || o.getAttribute('aria-disabled') === 'true',
      }));
    });
  }

  const redencionCO = await opcionesDeLaRedencionCon('CO', '900111222-1');
  revisar('en Colombia se pueden elegir las tres opciones de redención',
    !!redencionCO && redencionCO.length === 3 && redencionCO.every((o) => !o.bloqueada),
    JSON.stringify(redencionCO));

  const redencionMX = await opcionesDeLaRedencionCon('MX', 'PRU200101AB5');
  revisar('en México también se pueden elegir las tres, con la lista común',
    !!redencionMX && redencionMX.length === 3 && redencionMX.every((o) => !o.bloqueada),
    JSON.stringify(redencionMX));

  await opcionesDeLaRedencionCon('MX', 'PRU200101AB5');
  await pagina.evaluate(() => {
    RM.estado.estado.campoAbierto = 'secciones';
    RM.estado.fijar('redencion', 'secciones');
    RM.app.ir('pasos');
  });
  await pagina.waitForTimeout(600);
  const nombresMX = await pagina.evaluate(() => {
    const grupo = document.querySelector('.casillas');
    if (!grupo) return null;
    return [].map.call(grupo.querySelectorAll('.casilla input'), (c) => c.value);
  });
  revisar('y al elegirla, México sí tiene casillas que marcar',
    !!nombresMX && nombresMX.length === 5 && nombresMX.indexOf('Turbo Restaurantes') !== -1,
    JSON.stringify(nombresMX));

  const redencionSinLista = await opcionesDeLaRedencionCon('MX', 'PRU200101AB5', true);
  const seccionesSinLista = (redencionSinLista || []).filter((o) => /secciones/i.test(o.texto))[0];
  revisar('un país con lista propia vacía sigue bloqueando esa opción',
    !!seccionesSinLista && seccionesSinLista.bloqueada, JSON.stringify(redencionSinLista));
  revisar('y dice por qué, nombrando al país',
    !!seccionesSinLista && seccionesSinLista.texto.indexOf('México') !== -1,
    seccionesSinLista ? seccionesSinLista.texto : '(no salió la opción)');
  revisar('las otras dos opciones siguen disponibles, no es un callejón',
    !!redencionSinLista && redencionSinLista.filter((o) => !o.bloqueada).length === 2,
    JSON.stringify(redencionSinLista));

  // --- 8. Quien no ve la pantalla también tiene que enterarse de que cambió ---
  //
  // La aplicacion redibuja el <main> entero en cada cambio de pantalla. Antes
  // de este arreglo, la region de anuncios quedaba vacia y el foco volvia al
  // <body>: el lector de pantalla no decia nada y el tabulador arrancaba otra
  // vez desde la barra de arriba, en cada pantalla.
  await desdeElInicio();
  const entrega = await pagina.evaluate(() => {
    const region = document.getElementById('anuncios');
    const foco = document.activeElement;
    const titulo = document.querySelector('#app h1');
    return {
      anuncio: region ? region.textContent.trim() : '',
      tituloDeLaPantalla: titulo ? titulo.textContent.trim() : '',
      focoEnElTitulo: !!titulo && foco === titulo,
    };
  });
  revisar('al cambiar de pantalla se anuncia dónde quedamos',
    entrega.anuncio === entrega.tituloDeLaPantalla && entrega.anuncio !== '',
    'anuncio: "' + entrega.anuncio + '" · título: "' + entrega.tituloDeLaPantalla + '"');
  revisar('el foco queda en el título de la pantalla nueva, no en el body',
    entrega.focoEnElTitulo, 'el foco no llegó al título');

  await pagina.keyboard.press('Tab');
  const siguiente = await pagina.evaluate(() => {
    const a = document.activeElement;
    return { texto: (a.textContent || '').trim().slice(0, 30), enLaBarra: !!a.closest('.barra-superior') };
  });
  revisar('el tabulador sigue dentro de la pantalla, no vuelve a la barra de arriba',
    !siguiente.enLaBarra, 'el tabulador saltó a la barra: "' + siguiente.texto + '"');

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
