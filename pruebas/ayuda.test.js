'use strict';

/** El contenido de Ayuda, y los compromisos que adquirió con Anna. */

const test = require('node:test');
const assert = require('node:assert');

const {
  AVISO_AZAR, CONTACTOS, PASOS_SQUARESPACE, SI_ALGO_SALE_MAL, PREGUNTAS_FRECUENTES,
  FILTRO_DE_GENERALES, LO_QUE_LA_PIEZA_DEBE_DECIR, FILTRO_DE_TRAVEL, SI_ALGO_NO_COINCIDE,
} = require('../src/core/ayuda.js');

test('el aviso de azar está marcado como borrador para revisión', () => {
  assert.strictEqual(AVISO_AZAR.borrador, true, 'es contenido legal: tiene que ir marcado');
});

test('el aviso de azar dice que hay que consultar ANTES de lanzar', () => {
  assert.ok(/antes de lanzarla/i.test(AVISO_AZAR.entrada));
  assert.ok(/consulta antes de lanzar/i.test(AVISO_AZAR.regla));
});

test('el aviso trae ejemplos válidos, no válidos y de frontera', () => {
  assert.ok(AVISO_AZAR.validas.length >= 3);
  assert.ok(AVISO_AZAR.noValidas.length >= 4);
  assert.ok(AVISO_AZAR.frontera.length >= 3);
});

test('los ejemplos no válidos cubren las mecánicas que nombró Juan', () => {
  const texto = AVISO_AZAR.noValidas.join(' ').toLowerCase();
  for (const mecanica of ['sorteo', 'rifa', 'raspa y gana', 'ruleta']) {
    assert.ok(texto.indexOf(mecanica) !== -1, 'falta el ejemplo de ' + mecanica);
  }
});

test('los contactos son los tres que pidió Anna, sin Dave', () => {
  const nombres = CONTACTOS.map((c) => c.nombre);
  assert.deepStrictEqual(nombres.sort(), ['Anna Habermann', 'Juan Camilo Gallego', 'Paula Barahona']);
  assert.ok(JSON.stringify(CONTACTOS).indexOf('Dave') === -1, 'Dave tenía que salir');
});

test('no se inventó ningún correo de nadie', () => {
  for (const contacto of CONTACTOS) {
    assert.ok(contacto.correo.indexOf('@') === -1, contacto.nombre + ' tiene un correo inventado');
  }
});

/**
 * La pantalla de Ayuda la van a leer los equipos legales de todos los países,
 * así que no puede enseñar marcas de trabajo a medias como "[PENDIENTE: correo]".
 * Un contacto sin correo dice dónde buscarlo.
 */
test('un contacto sin correo no enseña una marca de pendiente', () => {
  const fs = require('node:fs');
  const path = require('node:path');

  for (const contacto of CONTACTOS) {
    assert.ok(contacto.correo.indexOf('PENDIENTE') === -1,
      contacto.nombre + ' sigue con una marca de pendiente a la vista');
    assert.ok(contacto.nombre && contacto.para, contacto.nombre + ' no dice para qué escribirle');
  }

  const pantalla = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'js', '68-pantallas.js'), 'utf8');
  assert.ok(pantalla.indexOf("CONTACTOS[c].correo || 'Escríbele en #tyc-rappi.'") !== -1,
    'la pantalla ya no ofrece una alternativa cuando el contacto no tiene correo');
});

/**
 * La Ayuda tiene que decir lo que la herramienta hace hoy. Llegó a decir que
 * Rappi Travel "todavía no" servía, cuando Travel ya tiene su filtro y sus dos
 * tipos, y nombraba tipos con nombres viejos.
 */
test('la ayuda no contradice los tipos que existen de verdad', () => {
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  const nombres = Object.keys(ESQUEMAS).map((id) => ESQUEMAS[id].nombre);
  const texto = JSON.stringify(require('../src/core/ayuda.js'));

  // Nombres viejos que ya no existen en ninguna parte.
  for (const viejo of ['Cashback Day', 'Descuento por umbral']) {
    assert.ok(nombres.indexOf(viejo) === -1, viejo + ' volvió a ser un tipo: actualiza esta prueba');
    assert.ok(texto.indexOf(viejo) === -1, 'la ayuda todavía nombra "' + viejo + '"');
  }

  assert.ok(texto.indexOf('Mi campaña es de Rappi Travel') !== -1, 'desapareció la pregunta de Travel');
  assert.ok(texto.indexOf('Todavía no. Travel tiene otra entidad legal') === -1,
    'la ayuda sigue diciendo que Travel no sirve');
});

test('la guía de Squarespace lleva al enlace de promos.rappi.com', () => {
  assert.ok(PASOS_SQUARESPACE.length >= 5);
  const texto = JSON.stringify(PASOS_SQUARESPACE);
  assert.ok(texto.indexOf('promos.rappi.com') !== -1);
  for (const paso of PASOS_SQUARESPACE) {
    assert.ok(paso.hace && paso.hace.length > 20, 'un paso no dice qué hacer');
    assert.ok(paso.ve && paso.ve.length > 10, 'un paso no dice qué se debería ver');
  }
});

test('se explica qué hacer cuando algo sale mal', () => {
  assert.ok(SI_ALGO_SALE_MAL.length >= 4);
  for (const caso of SI_ALGO_SALE_MAL) {
    assert.ok(caso.problema && caso.solucion, 'un caso está incompleto');
  }
});

test('hay al menos diez preguntas frecuentes, con respuestas útiles', () => {
  assert.ok(PREGUNTAS_FRECUENTES.length >= 10);
  for (const item of PREGUNTAS_FRECUENTES) {
    assert.ok(item.pregunta.length > 15, 'pregunta demasiado corta');
    assert.ok(item.respuesta.length > 60, 'respuesta demasiado corta: ' + item.pregunta);
    assert.ok(/[.!?]$/.test(item.respuesta.trim()), 'la respuesta no termina en punto: ' + item.pregunta);
  }
});

test('las preguntas frecuentes cubren las dudas reales de un KAM', () => {
  const texto = JSON.stringify(PREGUNTAS_FRECUENTES).toLowerCase();
  for (const tema of ['equivoqué', 'participar', 'presupuesto', 'nit', 'maker', 'travel']) {
    assert.ok(texto.indexOf(tema) !== -1, 'no se responde nada sobre ' + tema);
  }
});

test('la ayuda no usa guiones como puntuación ni emojis', () => {
  const todo = JSON.stringify([AVISO_AZAR, CONTACTOS, PASOS_SQUARESPACE, SI_ALGO_SALE_MAL, PREGUNTAS_FRECUENTES]);
  assert.ok(!/ [-–—] /.test(todo), 'hay un guion usado como puntuación');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(todo), 'hay un emoji');
});

test('la ayuda sostiene la regla de que Rappi nunca organiza', () => {
  const texto = JSON.stringify(PREGUNTAS_FRECUENTES);
  assert.ok(/Rappi no puede ser el organizador/i.test(texto), 'falta explicar por qué Rappi no organiza');
});

// --- D6: el filtro de los T&C generales -------------------------------------

test('el filtro de los generales son las seis preguntas de la decisión 49', () => {
  /*
   * Nadie revisaba si la campaña del comercial de verdad cabía en el T&C
   * general que iba a usar, y una condición que el general no dice no se le
   * puede exigir al usuario. Juan lo cerró el 20 de septiembre de 2026.
   */
  assert.deepStrictEqual(FILTRO_DE_GENERALES.map((p) => p.texto), [
    '¿El usuario recibe Créditos o gana un premio?',
    '¿Es un evento especial, como Hora Loca o Pro Week?',
    '¿Es alcohol, tabaco, vapeador, medicamento, fórmula infantil o apuesta?',
    '¿El descuento depende del medio de pago?',
    '¿El cupón se usa por fuera de Rappi?',
    '¿Aplica solo a ciertos usuarios?',
  ]);
});

test('cada "sí" del filtro dice a dónde va y por qué', () => {
  // Ir a Legal sin razón concreta no le sirve a nadie: es la regla de la skill
  // de flujo, y aquí se comprueba pregunta por pregunta.
  assert.deepStrictEqual(FILTRO_DE_GENERALES.map((p) => p.salida),
    ['tipos', 'legal', 'legal', 'legal', 'depende', 'opciones']);

  for (const pregunta of FILTRO_DE_GENERALES) {
    if (pregunta.salida === 'opciones') continue;
    assert.ok(pregunta.razon && pregunta.razon.length > 20, pregunta.id + ': sin razón');
  }
});

test('la sexta abre tres opciones, y cada una lleva a un sitio', () => {
  const sexta = FILTRO_DE_GENERALES[5];
  assert.deepStrictEqual(sexta.opciones.map((o) => o.etiqueta),
    ['Pro o Pro Black', 'Nunca han comprado en Turbo', 'Otra condición']);
  assert.deepStrictEqual(sexta.opciones.map((o) => o.salida), ['lista', 'lista', 'legal']);
  assert.ok(sexta.opciones[2].razon.indexOf('Legal') !== -1);
});

test('la pantalla final del T&C general dice los tres requisitos de la pieza', () => {
  // Decisión 49, punto 4: siguen vigentes y van también aquí, donde no se
  // genera documento y es lo único que la herramienta puede decir del arte.
  assert.strictEqual(LO_QUE_LA_PIEZA_DEBE_DECIR,
    'Tu pieza debe decir siempre: el mínimo de compra, si lo hay; el máximo de descuento o de cashback; ' +
    'y a qué usuarios aplica, si no es para todos.');

  const fs = require('node:fs');
  const path = require('node:path');
  const pantalla = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'client', 'js', '63-tyc-genericos.js'), 'utf8');
  assert.ok(pantalla.indexOf('LO_QUE_LA_PIEZA_DEBE_DECIR') !== -1,
    'la pantalla del T&C general no muestra los tres requisitos de la pieza');
});

test('el filtro va antes de la lista, no después', () => {
  // El atajo llevaba directo a los quince enlaces. Ahora pasa por el filtro.
  const fs = require('node:fs');
  const path = require('node:path');
  const pantalla = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'client', 'js', '63-tyc-genericos.js'), 'utf8');
  const atajo = pantalla.slice(pantalla.indexOf('function tarjetaDeAtajo'),
    pantalla.indexOf('// --- El filtro de seis preguntas'));
  assert.ok(atajo.indexOf("RM.app.ir('filtroGenerales')") !== -1,
    'el atajo sigue llevando directo a la lista de enlaces');
  assert.strictEqual(atajo.indexOf("RM.app.ir('tycGenericos')"), -1);
});

// --- El filtro de Travel, las tres de la misma pantalla ----------------------

test('el filtro de Travel tiene diez preguntas, con la sexta partida en dos', () => {
  // Metía dos preguntas en una ("¿cambian las condiciones... o se mezcla
  // descuento con cashback?") y quien contestaba sí no sabía cuál había
  // contestado. Punto F8, 20 de septiembre de 2026.
  assert.strictEqual(FILTRO_DE_TRAVEL.length, 10);
  const textos = FILTRO_DE_TRAVEL.map((p) => p.texto);
  assert.ok(textos.indexOf('¿Las condiciones cambian según destino, producto o usuario?') !== -1);
  assert.ok(textos.indexOf('¿Mezcla descuento y cashback en la misma campaña?') !== -1);

  // Y cada mitad dice su propia razón: mandar a Legal sin razón concreta no le
  // sirve a nadie.
  for (const pregunta of FILTRO_DE_TRAVEL) {
    assert.ok(pregunta.razon && pregunta.razon.length > 20, pregunta.id + ': sin razón');
  }
});

test('ninguna pregunta del filtro de Travel pasa de diez palabras', () => {
  // Siete de las nueve pasaban. Lo que las dejó acortar fue la línea de ayuda
  // (puntos F6 y F8): los ejemplos ya no van dentro del enunciado.
  for (const pregunta of FILTRO_DE_TRAVEL) {
    const palabras = pregunta.texto.trim().split(/\s+/).length;
    assert.ok(palabras <= 10, pregunta.id + ' tiene ' + palabras + ' palabras: ' + pregunta.texto);
  }

  const quinta = FILTRO_DE_TRAVEL.filter((p) => p.id === 'beneficioDeTercero')[0];
  assert.strictEqual(quinta.texto, '¿El beneficio es otra cosa que Créditos o descuento?');
  assert.strictEqual(quinta.ayuda,
    'Por ejemplo: noches o niños gratis, cupones, millas, eSIM, bonos o cuotas sin interés.');
});

test('la pantalla del filtro de Travel dibuja la ayuda, o el mecanismo no existe', () => {
  // Un mecanismo que la interfaz no llama es un mecanismo que no existe: ya
  // pasó una vez con las variantes de las preguntas.
  const fs = require('node:fs');
  const path = require('node:path');
  const flujo = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'client', 'js', '60-flujo.js'), 'utf8');
  assert.ok(flujo.indexOf('pregunta.ayuda') !== -1,
    'la pantalla del filtro de Travel no dibuja la línea de ayuda');
  assert.ok(flujo.indexOf('Diez preguntas rápidas') !== -1,
    'el encabezado sigue diciendo nueve preguntas');
});

// --- La Ayuda, ordenada por lo que el comercial viene a buscar ---------------

test('la Ayuda abre por la pregunta de descuentos y cupones', () => {
  /*
   * Abría con el aviso de azar, que es lo más serio pero lo menos consultado:
   * quien entra aquí suele venir de una campaña de descuento que no encuentra
   * en la lista de tipos. Punto F8, 20 de septiembre de 2026.
   */
  const fs = require('node:fs');
  const path = require('node:path');
  const pantalla = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'client', 'js', '68-pantallas.js'), 'utf8');
  const ayuda = pantalla.slice(pantalla.indexOf('function pantallaAyuda'), pantalla.indexOf('// --- Administración'));

  const orden = ['descuento o un cupón', 'Publicar en Squarespace', '¿Quién puede publicar?',
    'AVISO_AZAR.titulo', 'Si algo sale mal', 'Canal de ayuda'];
  let desde = 0;
  for (const marca of orden) {
    const donde = ayuda.indexOf(marca, desde);
    assert.ok(donde !== -1, 'la Ayuda ya no muestra "' + marca + '"');
    desde = donde;
  }
});

test('"Me equivoqué en un dato" está una sola vez', () => {
  // Estaba en Si algo sale mal y en Preguntas frecuentes, con la misma
  // respuesta escrita dos veces. Se queda en las preguntas frecuentes.
  const enProblemas = SI_ALGO_SALE_MAL.filter((x) => /Me equivoqué en un dato/.test(x.problema));
  const enPreguntas = PREGUNTAS_FRECUENTES.filter((x) => /Me equivoqué en un dato/.test(x.pregunta));
  assert.strictEqual(enProblemas.length, 0);
  assert.strictEqual(enPreguntas.length, 1);
});

test('la línea de "si algo no coincide" salió del aviso de azar', () => {
  // Una nota sobre la herramienta colgada de una advertencia legal se lee como
  // si la advertencia fuera la que está a medias. Va al canal de ayuda.
  assert.ok(SI_ALGO_NO_COINCIDE.indexOf('no coincide con lo que ves en la herramienta') !== -1);

  const fs = require('node:fs');
  const path = require('node:path');
  const pantalla = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'client', 'js', '68-pantallas.js'), 'utf8');
  const ayuda = pantalla.slice(pantalla.indexOf('function pantallaAyuda'), pantalla.indexOf('// --- Administración'));
  assert.ok(ayuda.indexOf('Canal de ayuda') < ayuda.indexOf('SI_ALGO_NO_COINCIDE'),
    'la línea sigue colgada de algo que no es el canal de ayuda');
});

test('los descuentos y cupones están entre lo que sirve para esta herramienta', () => {
  assert.ok(AVISO_AZAR.validas.some((v) => /ya tienen T&C publicados y no generas nada/.test(v)),
    AVISO_AZAR.validas.join(' | '));
});
