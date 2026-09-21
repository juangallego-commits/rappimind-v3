'use strict';

/**
 * Los casos de pruebas/casos_base.json contra el motor completo.
 *
 * Criterio de aceptación 1: los que deben pasar pasan y los que deben fallar
 * fallan con el error esperado.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson, leerTexto, listarArchivos, existe } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { normalizarParaComparar, textoPlano } = require('../src/core/texto.js');
const { generarTexto } = require('../src/core/generar.js');

const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const modelos = cargarModelos();

const generan = casos.filter((caso) => caso.esperado.resultado === 'genera');
const fallan = casos.filter((caso) => caso.esperado.resultado === 'falla');

function correr(caso) {
  const pais = paises.find((p) => p.codigo === caso.entrada.pais);
  return generarTexto(caso.entrada, pais, modelos, {
    fechaReferencia: caso.fecha_referencia,
    usuarioEnEquipo: caso.usuario_en_equipo === true,
  });
}

function salidaEsperada(caso) {
  return normalizarParaComparar(leerTexto(rutaDesdeRaiz('pruebas', 'salidas_esperadas', caso.id + '.txt')));
}

test('hay cuarenta y ocho casos, treinta y tres que generan y quince que fallan', () => {
  assert.strictEqual(casos.length, 48);
  assert.strictEqual(generan.length, 33);
  assert.strictEqual(fallan.length, 15);

  /*
   * Un documento por cada país activo, con los mismos datos de campaña.
   *
   * Cada documento imprime dieciocho valores que salen de la fila de su país:
   * la entidad legal, el domicilio, el nombre del país, la ley aplicable, la
   * jurisdicción, la entidad de vigilancia, la autoridad de datos, tres
   * enlaces, el nombre de la política de privacidad, el nombre y el símbolo de
   * la moneda, el separador de miles, cómo se llaman los días, el texto de la
   * hora local, el texto de los derechos de datos y el tipo de identificación
   * del Organizador. Son más de ciento veinte valores publicándose.
   *
   * Hasta el 20 de septiembre de 2026 solo México y Ecuador tenían documento
   * guardado: si alguien editaba la pestaña Paises o la semilla de Perú,
   * Argentina, Chile, Uruguay o Costa Rica, no se caía ninguna prueba y se
   * enteraba quien leyera el documento publicado, si lo leía. Punto B1.
   *
   * Los datos de campaña son idénticos en los siete a propósito: así la única
   * diferencia entre un documento y otro es la fila del país, y la comparación
   * dice qué línea cambió.
   */
  const unoPorPais = ['MX01', 'EC01', 'PE01', 'AR01', 'CL01', 'UY01', 'CR01'];
  for (const id of unoPorPais) {
    assert.strictEqual(casos.filter((caso) => caso.id === id).length, 1, 'falta el caso ' + id);
  }
  const campanas = unoPorPais.map((id) => {
    const entrada = Object.assign({}, casos.filter((caso) => caso.id === id)[0].entrada);
    // Lo único que cambia es el país y lo que el país obliga a cambiar.
    for (const propia of ['pais', 'nombreCampana', 'tienda', 'organizadorRazonSocial', 'organizadorId']) {
      delete entrada[propia];
    }
    return JSON.stringify(entrada);
  });
  assert.strictEqual(new Set(campanas).size, 1,
    'los siete documentos de país ya no comparten los mismos datos de campaña');

  // CC03 es el único caso con premio físico entregado por el Organizador, que
  // es la única combinación en la que el documento autoriza transferir los
  // datos del ganador. Sin él, ese texto no tenía quien lo protegiera.
  assert.ok(casos.filter((caso) => caso.id === 'CC03').length === 1);

  // Tres del cashback por ETA: los dos publicados de Bogotá y Barranquilla, que
  // corren en toda la categoría Turbo Restaurantes, y uno de unas tiendas
  // concretas. Las dos formas de la cláusula quedan protegidas letra por letra.
  const deEta = casos.filter((caso) => String(caso.id).indexOf('ETA') === 0);
  assert.strictEqual(deEta.length, 3);

  // Los cuatro de la Promoção de Brasil, uno por forma del beneficio: el texto
  // aprobado por Legal Brasil queda protegido carácter por carácter, como el de
  // Colombia. El Cupom, que salió después, va con los tipos nuevos de abajo.
  const deBrasil = casos.filter((caso) => caso.entrada.tipo === 'promocao_br');
  assert.strictEqual(deBrasil.length, 4);

  // Los catorce de Rappi Travel: siete que generan y siete que fallan.
  const deTravel = casos.filter((caso) => String(caso.id).indexOf('TV') === 0);
  assert.strictEqual(deTravel.length, 14);
  assert.strictEqual(deTravel.filter((c) => c.esperado.resultado === 'genera').length, 7);

  /*
   * Los tipos que se habilitaron fuera de Colombia el 21 de septiembre de 2026.
   *
   * Uno por país y por forma del beneficio, porque es ahí donde cambia la
   * cláusula que dice sobre qué se calcula: DC01 es un porcentaje en México,
   * DC02 el envío gratis en Argentina, CU01 un monto fijo con código en Chile y
   * CU02 la tarifa de servicio tomada desde la sección Cupones en Perú. CC06 es
   * la Carrera fuera de Colombia, con el impuesto y el parentesco del país, y
   * BR05 el Cupom de Brasil, que va en portugués.
   */
  for (const id of ['DC01', 'DC02', 'CU01', 'CU02', 'CC06', 'BR05']) {
    assert.strictEqual(casos.filter((caso) => caso.id === id).length, 1, 'falta el caso ' + id);
  }
  const formas = ['DC01', 'DC02', 'CU01', 'CU02']
    .map((id) => casos.filter((caso) => caso.id === id)[0].entrada.formaDelDescuento);
  assert.strictEqual(new Set(formas).size, 4, 'dos casos nuevos prueban la misma forma del beneficio');
});

for (const caso of generan) {
  test(caso.id + ' genera exactamente la salida esperada', () => {
    const resultado = correr(caso);
    assert.deepStrictEqual(resultado.errores, [], caso.id + ' no debería tener errores');
    assert.ok(resultado.valido);
    assert.strictEqual(normalizarParaComparar(resultado.texto), salidaEsperada(caso));
  });

  test(caso.id + ' contiene los textos que exige el caso', () => {
    // Se busca sobre el texto plano: los fragmentos del caso describen lo que
    // el documento dice, sin las marcas de negrita.
    const plano = textoPlano(correr(caso).texto);
    for (const fragmento of caso.esperado.contiene) {
      assert.ok(plano.indexOf(fragmento) !== -1, caso.id + ' no contiene: ' + fragmento);
    }
  });
}

for (const caso of fallan) {
  test(caso.id + ' falla con el error esperado y no produce texto', () => {
    const resultado = correr(caso);
    assert.ok(!resultado.valido, caso.id + ' debería fallar');
    assert.strictEqual(resultado.texto, '', caso.id + ' no debería producir texto');

    const campos = Array.from(new Set(resultado.errores.map((e) => e.campo))).sort();
    assert.deepStrictEqual(campos, caso.esperado.errores.slice().sort());
  });

  test(caso.id + ' explica cada error en lenguaje claro', () => {
    for (const error of correr(caso).errores) {
      assert.ok(error.mensaje && error.mensaje.length > 10, 'mensaje muy corto en ' + error.campo);
      assert.ok(/[.!?]$/.test(error.mensaje), 'el mensaje de ' + error.campo + ' no termina en punto');
    }
  });
}

test('ningún documento generado conserva marcas sin resolver', () => {
  for (const caso of generan) {
    const texto = correr(caso).texto;
    assert.ok(texto.indexOf('{{') === -1 && texto.indexOf('}}') === -1, caso.id + ' dejó llaves');
    assert.ok(texto.indexOf('[[') === -1 && texto.indexOf(']]') === -1, caso.id + ' dejó corchetes');
    assert.ok(texto.indexOf('%%') === -1, caso.id + ' dejó un comentario');
  }
});

test('ningún documento generado tiene tablas', () => {
  // Regla 5: solo párrafos y viñetas; el sitio de publicación no muestra tablas.
  for (const caso of generan) {
    assert.ok(correr(caso).texto.indexOf('|') === -1, caso.id + ' parece traer una tabla');
  }
});

test('no sobran ni faltan archivos en salidas_esperadas', () => {
  const archivos = listarArchivos(rutaDesdeRaiz('pruebas', 'salidas_esperadas'), '.txt').map((n) => n.replace(/\.txt$/, ''));
  assert.deepStrictEqual(archivos.sort(), generan.map((caso) => caso.id).sort());
  for (const caso of fallan) {
    assert.ok(!existe(rutaDesdeRaiz('pruebas', 'salidas_esperadas', caso.id + '.txt')), caso.id + ' no debería tener salida esperada');
  }
});

/**
 * Los datos del ganador solo viajan cuando hay algo físico que llevar.
 *
 * Hasta el 18 de septiembre bastaba con que el premio lo entregara el
 * Organizador. Con premio en Créditos, que Rappi acredita en la Billetera, el
 * documento anunciaba una transferencia de datos que nunca ocurre: el caso
 * dorado CC01 la imprimía. Es la falla (a) de la decisión 36 de la respuesta del
 * encargo 01.
 *
 * Esta prueba mira la regla, no un caso: recorre las cuatro combinaciones de
 * premio y entrega, y solo una puede llevar la cláusula.
 */
test('solo un premio físico entregado por el Organizador transfiere datos', () => {
  const { calcularDerivados } = require('../src/core/derivados.js');
  const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
  const CO = paises.filter((p) => p.codigo === 'CO')[0];
  const base = casos.filter((c) => c.id === 'CC01')[0].entrada;

  const conDatos = (cambios) => {
    const entrada = Object.assign({}, base, cambios);
    return calcularDerivados(entrada, CO).TEXTO_DATOS_ENTREGA;
  };

  const fisico = { tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta', creditosPremio: null };

  assert.ok(conDatos(Object.assign({ entregaPor: 'organizador' }, fisico)),
    'un premio físico que entrega el Organizador sí transfiere datos');
  assert.strictEqual(conDatos(Object.assign({ entregaPor: 'rappi' }, fisico)), '',
    'si lo entrega Rappi no hay a quién transferirle nada');
  assert.strictEqual(conDatos({ tipoPremio: 'creditos', entregaPor: 'organizador' }), '',
    'los Créditos los acredita Rappi en la Billetera: no hay dirección a dónde llevarlos');
  assert.strictEqual(conDatos({ tipoPremio: 'creditos', entregaPor: 'rappi' }), '');
});

/**
 * La cláusula dice lo que el Acuerdo Marco contempla.
 *
 * La anterior hablaba solo de "datos de contacto", cuando el Anexo A incluye
 * también la dirección de entrega y el número de documento; dejaba la
 * autorización para después ("previa autorización del ganador"), cuando el
 * acuerdo dice que consta en el T&C de la campaña; y no decía la finalidad, que
 * la cláusula cuarta obliga a informar en el T&C. Falla (b) de la decisión 36.
 */
test('la cláusula de datos nombra los datos, la finalidad y la supresión', () => {
  const { calcularDerivados } = require('../src/core/derivados.js');
  const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
  const CO = paises.filter((p) => p.codigo === 'CO')[0];
  const entrada = Object.assign({}, casos.filter((c) => c.id === 'CC03')[0].entrada);
  const texto = calcularDerivados(entrada, CO).TEXTO_DATOS_ENTREGA;

  // Los cinco datos del Anexo A, con sus palabras.
  for (const dato of ['nombre y apellidos', 'correo electrónico', 'número de teléfono celular',
    'dirección de entrega', 'número de documento de identidad']) {
    assert.ok(texto.indexOf(dato) !== -1, 'la cláusula no nombra ' + dato);
  }
  // La autorización consta aquí, no queda para después.
  assert.ok(texto.indexOf('al aceptar el premio autorizas a Rappi') !== -1, texto);
  assert.strictEqual(texto.indexOf('previa autorización del ganador'), -1,
    'volvió la redacción que dejaba la autorización para después');
  // La finalidad y la supresión, que la cláusula cuarta del acuerdo exige.
  assert.ok(texto.indexOf('solo podrá usar esos datos para') !== -1, texto);
  assert.ok(texto.indexOf('suprimirlos una vez cumplida esa finalidad') !== -1, texto);
});

/**
 * La tabla de lo que cada país imprime.
 *
 * Juan la pidió junto con los casos dorados (punto B1): poder leer de un
 * vistazo los valores de todos los países, uno al lado del otro. Si se queda
 * atrás, engaña al que la lee, así que la prueba la vuelve a armar y compara.
 * Se pone al día con `npm run tabla-paises`.
 */
test('docs/VALORES_POR_PAIS.md está al día', () => {
  const { execFileSync } = require('node:child_process');
  const guardada = leerTexto(rutaDesdeRaiz('docs', 'VALORES_POR_PAIS.md'));

  execFileSync(process.execPath, [rutaDesdeRaiz('scripts', 'tabla-paises.js')], { stdio: 'pipe' });
  const recien = leerTexto(rutaDesdeRaiz('docs', 'VALORES_POR_PAIS.md'));

  assert.strictEqual(normalizarParaComparar(guardada), normalizarParaComparar(recien),
    'la tabla cambió: corre "npm run tabla-paises" y revisa el resultado');
});

test('la tabla trae todos los países con documento y todas las columnas que se imprimen', () => {
  const tabla = leerTexto(rutaDesdeRaiz('docs', 'VALORES_POR_PAIS.md'));

  // Los ocho que generan documento de cashback. Brasil no usa ese modelo.
  for (const nombre of ['Colombia', 'México', 'Perú', 'Argentina', 'Chile', 'Ecuador', 'Uruguay', 'Costa Rica']) {
    assert.ok(tabla.indexOf('**' + nombre + '.**') !== -1, 'falta ' + nombre + ' en la tabla');
  }

  // Y las columnas que más duele tener mal: las que nombran a una autoridad.
  for (const columna of ['entidad_legal', 'ley_aplicable', 'jurisdiccion', 'entidad_vigilancia',
    'autoridad_datos', 'texto_derechos_datos', 'separador_miles', 'termino_dias']) {
    assert.ok(tabla.indexOf('## ' + columna) !== -1, 'falta la columna ' + columna);
  }
});
