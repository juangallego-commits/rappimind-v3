'use strict';

/**
 * El build tiene que dejar dist/ listo para clasp: los archivos que espera
 * Apps Script, los textos legales embebidos y nada de retornos de carro.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const { rutaDesdeRaiz, leerTexto, listarArchivos, existe } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { tieneRetornoDeCarro, normalizarTexto } = require('../src/core/texto.js');
const { construir, DIST, revisarColisionesDeNombre } = require('../scripts/build.js');
const { ORDEN } = require('../scripts/lib/hoja-completa');

/** Lo que debe quedar en dist/: el codigo de src/ mas lo que genera el build. */
function archivosEsperados() {
  const codigo = listarArchivos(rutaDesdeRaiz('src', 'core'), '.js').concat(
    listarArchivos(rutaDesdeRaiz('src', 'server'), '.js')
  );
  const generados = [
    'App.html',
    'Estilos.html',
    'Index.html',
    'CategoriasTravel.js',
    'LeyendasCatalogo.js',
  'Modelos.js',
    'MotorCliente.html',
    'PaisesSemilla.js',
    'Secciones.js',
    'TycGenericos.js',
    'appsscript.json',
  ];
  return codigo.concat(generados).sort();
}

test.before(() => {
  construir();
});

test('dist/ queda con los archivos que sube clasp', () => {
  assert.deepStrictEqual(listarArchivos(DIST).sort(), archivosEsperados());
});

test('el manifiesto llega a dist/ con la web app configurada', () => {
  const manifiesto = JSON.parse(leerTexto(path.join(DIST, 'appsscript.json')));
  assert.strictEqual(manifiesto.runtimeVersion, 'V8');
  assert.strictEqual(manifiesto.webapp.executeAs, 'USER_DEPLOYING');
  assert.strictEqual(manifiesto.webapp.access, 'DOMAIN');
});

test('Modelos.js conserva el texto legal exacto', () => {
  delete require.cache[require.resolve(path.join(DIST, 'Modelos.js'))];
  const { MODELOS } = require(path.join(DIST, 'Modelos.js'));
  const { modelos, bloques } = cargarModelos();

  assert.deepStrictEqual(Object.keys(MODELOS.modelos).sort(), Object.keys(modelos).sort());
  assert.deepStrictEqual(Object.keys(MODELOS.bloques).sort(), Object.keys(bloques).sort());

  for (const [nombre, texto] of Object.entries(modelos)) {
    assert.strictEqual(MODELOS.modelos[nombre], normalizarTexto(texto), 'cambio el texto del modelo ' + nombre);
  }
  for (const [nombre, texto] of Object.entries(bloques)) {
    assert.strictEqual(MODELOS.bloques[nombre], normalizarTexto(texto), 'cambio el texto del bloque ' + nombre);
  }
});

test('PaisesSemilla.js trae los nueve paises', () => {
  delete require.cache[require.resolve(path.join(DIST, 'PaisesSemilla.js'))];
  const { PAISES_SEMILLA } = require(path.join(DIST, 'PaisesSemilla.js'));
  assert.strictEqual(PAISES_SEMILLA.length, 9);
  assert.ok(PAISES_SEMILLA.some((pais) => pais.codigo === 'CO'));
});

test('ningun archivo generado queda con retornos de carro', () => {
  for (const archivo of listarArchivos(DIST)) {
    assert.ok(!tieneRetornoDeCarro(leerTexto(path.join(DIST, archivo))), 'quedo un \\r en dist/' + archivo);
  }
});

test('MotorCliente.html lleva el motor al navegador', () => {
  const contenido = leerTexto(path.join(DIST, 'MotorCliente.html'));
  assert.ok(contenido.startsWith('<!--'));
  assert.ok(contenido.includes('<script>'));
  assert.ok(contenido.includes('function normalizarTexto'));
});

test('el build es repetible: correrlo dos veces deja lo mismo', () => {
  const antes = listarArchivos(DIST).map((archivo) => [archivo, leerTexto(path.join(DIST, archivo))]);
  construir();
  const despues = listarArchivos(DIST).map((archivo) => [archivo, leerTexto(path.join(DIST, archivo))]);
  assert.deepStrictEqual(despues, antes);
});

test('.clasp.json apunta a dist/', () => {
  assert.ok(existe(rutaDesdeRaiz('.clasp.json')));
  const clasp = JSON.parse(leerTexto(rutaDesdeRaiz('.clasp.json')));
  assert.strictEqual(clasp.rootDir, 'dist');
});

/**
 * Esta es la prueba que faltaba cuando la vista previa salio en blanco en Apps
 * Script: el navegador solo recibe lo que va dentro de MotorCliente.html. Los
 * archivos sueltos de dist/ (Modelos.js, PaisesSemilla.js, Secciones.js) son
 * del servidor. Si los textos legales no viajan dentro del HTML, MODELOS queda
 * sin definir, la vista previa revienta y la pantalla se queda a medias.
 *
 * Se corre el script tal cual, en un ambiente parecido al del navegador: sin
 * module y sin require, que es lo que hay del lado del usuario.
 */
test('MotorCliente.html corre solo en el navegador y arma la vista previa', () => {
  const vm = require('node:vm');
  const html = leerTexto(path.join(DIST, 'MotorCliente.html'));
  const guion = /<script>\n([\s\S]*)\n<\/script>/.exec(html);
  assert.ok(guion, 'MotorCliente.html no trae un bloque de script');

  const ambiente = { console: console };
  ambiente.window = ambiente;
  vm.createContext(ambiente);
  vm.runInContext(guion[1], ambiente, { filename: 'MotorCliente.html' });

  // TYC_GENERICOS entra a esta lista porque la pantalla de los T&C que Legal ya
  // publico se pinta enteramente en el navegador: si el dato se queda en el
  // archivo suelto de dist/, que es del servidor, la pantalla sale sin una sola
  // opcion que ofrecer, igual que paso con los tipos de campana.
  for (const nombre of ['MODELOS', 'PAISES_SEMILLA', 'SECCIONES', 'TYC_GENERICOS', 'ESQUEMAS', 'PREGUNTAS']) {
    assert.notStrictEqual(ambiente[nombre], undefined, 'falta ' + nombre + ' en el navegador');
  }
  assert.ok(Object.keys(ambiente.MODELOS.modelos).length > 0, 'los textos legales no viajaron al navegador');

  // Con la campana a medio llenar la vista previa tiene que salir igual, con
  // huecos marcados donde falta el dato. Esto es lo que ve el comercial.
  const pais = ambiente.paisDesdeFila(ambiente.PAISES_SEMILLA.find((fila) => fila.codigo === 'CO'));
  const vista = ambiente.renderizarVistaPrevia(
    ambiente.esquemaDe('cashback').modelo,
    { tipo: 'cashback', pais: 'CO' },
    pais,
    ambiente.MODELOS
  );
  assert.ok(vista.texto.length > 0, 'la vista previa salio vacia');
  assert.ok(vista.huecos.length > 0, 'la vista previa no marco ningun hueco');
});

test('ninguna función de nivel superior se declara dos veces entre core y servidor', () => {
  // En Apps Script todos los archivos comparten un ámbito: dos funciones con
  // el mismo nombre se pisan y gana la del archivo que cargue de último, sin
  // aviso. tieneValor llegó a estar en tres archivos de derivados a la vez.
  const vistas = {};
  const repetidas = [];
  for (const carpeta of ['core', 'server']) {
    for (const archivo of listarArchivos(rutaDesdeRaiz('src', carpeta), '.js')) {
      const texto = leerTexto(rutaDesdeRaiz('src', carpeta, archivo));
      const patron = /^function (\w+)\s*\(/gm;
      let encontrado;
      while ((encontrado = patron.exec(texto)) !== null) {
        const nombre = encontrado[1];
        if (vistas[nombre]) repetidas.push(nombre + ' (' + vistas[nombre] + ' y ' + carpeta + '/' + archivo + ')');
        else vistas[nombre] = carpeta + '/' + archivo;
      }
    }
  }
  assert.deepStrictEqual(repetidas, [], repetidas.join('\n'));
});

test('el build se niega si dos archivos se llaman igual salvo por mayúsculas', () => {
  // Apps Script no distingue Secciones.js de secciones.js: uno pisaría al otro.
  assert.throws(() => revisarColisionesDeNombre(['core/Secciones.js', 'server/secciones.js']), /mayusculas/);
  assert.doesNotThrow(() => revisarColisionesDeNombre(['core/a.js', 'server/b.js']));
});

/**
 * Un alias de require que se llama distinto al global queda sin definir.
 *
 * Los archivos de src/core/ comparten un solo ámbito en Apps Script y en el
 * navegador. La línea `var formatearFecha = require('./fechas.js').formatearFecha`
 * no se ejecuta ahí, pero no hace daño: `var` vuelve a declarar un nombre que ya
 * existe sin pisarle el valor, así que sigue apuntando a la función global.
 *
 * Lo que sí hace daño es ponerle otro nombre. `var formatearFechaLey = require(...)`
 * crea un nombre nuevo que nadie asigna nunca, y la primera llamada revienta con
 * "no es una función". En Node pasa, en npm test pasa, y revienta al abrir la
 * demostración o en producción.
 *
 * Pasó de verdad al construir las leyendas: nueve alias con sufijo, y la
 * pantalla final se quedó sin leyendas con "tieneValorLey is not a function".
 */
/** Los bloques `if (typeof module !== 'undefined' ...) { ... }` de un archivo. */
function bloquesDeRequire(texto) {
  const bloques = [];
  const marca = /if \(typeof module !== 'undefined'[^)]*\) \{/g;
  let encontrado;
  while ((encontrado = marca.exec(texto)) !== null) {
    let nivel = 1;
    let i = encontrado.index + encontrado[0].length;
    const desde = i;
    while (i < texto.length && nivel > 0) {
      if (texto[i] === '{') nivel += 1;
      else if (texto[i] === '}') nivel -= 1;
      i += 1;
    }
    bloques.push(texto.slice(desde, i));
  }
  return bloques;
}

test('ningún archivo de core renombra lo que importa de otro archivo de core', () => {
  const carpeta = rutaDesdeRaiz('src', 'core');
  const renombrados = [];

  for (const archivo of listarArchivos(carpeta, '.js')) {
    const texto = leerTexto(path.join(carpeta, archivo));

    // Solo dentro del bloque que Node ejecuta y Apps Script no. Fuera de él,
    // "var inicio = entrada.fechaInicio" es una variable local cualquiera.
    for (const bloque of bloquesDeRequire(texto)) {
      const patron = /\bvar\s+(\w+)\s*=\s*(?:require\([^)]*\)|\w+)\.(\w+)\s*;/g;
      let encontrado;
      while ((encontrado = patron.exec(bloque)) !== null) {
        const alias = encontrado[1];
        const original = encontrado[2];
        if (alias !== original) renombrados.push(archivo + ': ' + alias + ' debería llamarse ' + original);
      }
    }
  }

  assert.deepStrictEqual(renombrados, [],
    'estos alias quedan sin definir fuera de Node:\n  ' + renombrados.join('\n  '));
});

test('dist/Estilos.html cruza la frontera: sin @import, con la letra incrustada', () => {
  // La cuarta frontera de la skill frontera-apps-script, y falla callada.
  //
  // Apps Script sirve la hoja embebida en un solo <style>, dentro del HTML que
  // arma doGet. Ahí no existe el sistema de archivos del repositorio: un
  // @import a "tokens/colors.css" y una url() a "../assets/fonts/x.woff2"
  // apuntan a rutas que del lado del usuario no están. No lanzan ningún error.
  // El navegador se queda sin esos valores, cada var() cae a su valor por
  // defecto, y la aplicación sale despintada sin que nada avise.
  //
  // Por eso scripts/lib/hoja-completa.js concatena los cinco archivos de
  // tokens y mete la letra en base64, y por eso esta prueba mira dist/ y no la
  // demostración: la demo hereda dist/Estilos.html, así que no ve la frontera.
  const estilos = leerTexto(path.join(DIST, 'Estilos.html'));

  assert.ok(estilos.indexOf('@import') === -1,
    'quedó un @import en dist/Estilos.html, y no sobrevive a Apps Script');

  // Se exige que TODA url() sea un data:, no que ninguna lleve "../". Buscar el
  // patron de la ruta relativa dejaba pasar url('logo.png') y
  // url('assets/logo/x.png'), que en Apps Script tampoco resuelven, y ademas
  // incrustarArchivos solo convierte las extensiones que conoce: una imagen de
  // colaria intacta.
  const sinResolver = (estilos.match(/url\(\s*(?!['"]?data:)[^)]*\)/g) || []);
  assert.deepStrictEqual(sinResolver, [],
    'quedaron url() sin resolver en dist/Estilos.html, y en Apps Script no existe el sistema de archivos del repositorio: ' + sinResolver.join(', '));

  // Las cinco capas de token tienen que estar, y rappimind.css la última, que
  // es la que pisa a las de marca.
  for (const relativa of ORDEN) {
    assert.ok(estilos.indexOf('/* src/client/' + relativa + ' */') !== -1,
      'dist/Estilos.html no trae ' + relativa);
  }
  const posiciones = ORDEN.map((r) => estilos.indexOf('/* src/client/' + r + ' */'));
  const ordenadas = posiciones.slice().sort((a, b) => a - b);
  assert.deepStrictEqual(posiciones, ordenadas,
    'los archivos de la hoja salieron en otro orden, así que las capas se pisan al revés');

  assert.ok(/@font-face\s*\{[^}]*url\(data:font\/woff2;base64,/.test(estilos),
    'la letra de marca no viajó en base64: en Apps Script no se vería');

  // Y el logotipo de Rappi, por lo mismo. Va aparte de la comprobación de
  // arriba porque la de arriba pasaría igual si la regla de .marca-logotipo
  // desapareciera entera: ahí no quedaría ninguna url() sin resolver, y el
  // lockup saldría sin logotipo. Esto exige que esté.
  assert.ok(/\.marca-logotipo\s*\{[^}]*url\(data:image\/png;base64,/.test(estilos),
    'el logotipo de Rappi no viajó en base64 dentro de .marca-logotipo: o se cayó la regla, o quedó apuntando a una ruta del repositorio, que en Apps Script no existe');
});
