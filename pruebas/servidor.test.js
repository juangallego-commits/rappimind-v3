'use strict';

/**
 * El servidor completo, contra dobles de las APIs de Google.
 *
 * Todo lo que se puede probar sin la cuenta de Juan se prueba aquí: setup,
 * generación, documento, correo, registro, historial, publicación y
 * administración. Mañana solo queda verificar a mano lo que de verdad necesita
 * Google.
 */

const test = require('node:test');
const assert = require('node:assert');

const { levantarEntorno, solicitudValida } = require('./dobles/entorno.js');

/** Cada prueba arranca con un mundo limpio. */
function nuevoMundo(opciones) {
  return levantarEntorno(opciones || {});
}

function conSetup(opciones) {
  const mundo = nuevoMundo(opciones);
  setup();
  return mundo;
}

/**
 * setup() deja como administrador a quien despliega, que es lo correcto: si no,
 * nadie podría entrar. Para probar lo que ve un comercial hay que cambiar de
 * usuario después de instalar.
 */
function comoComercial(mundo, correo) {
  mundo.correo = correo;
  assert.strictEqual(rolDe(leerEquipo(), correo), 'comercial', correo + ' debería ser comercial');
  return mundo;
}

// --- setup -----------------------------------------------------------------

test('setup crea la base, la carpeta, las pestañas y los países', () => {
  const mundo = nuevoMundo();
  const resumen = setup();

  assert.ok(resumen.sheetId);
  assert.ok(resumen.carpetaId);
  assert.strictEqual(leerPaises().length, 9);
  assert.strictEqual(paisPorCodigo(leerPaises(), 'CO').estado, 'activo');
  assert.deepStrictEqual(paisPorCodigo(leerPaises(), 'CO').modelos, ['cashback', 'carrera_compras', 'cashback_day', 'cashback_eta', 'cashback_travel', 'descuento_travel']);
  assert.ok(Object.keys(mundo.carpetas).length >= 10, 'faltan carpetas por país');
});

test('setup es idempotente: la segunda vez no crea nada', () => {
  conSetup();
  const paisesAntes = leerPaises().length;
  const equipoAntes = leerEquipo().length;

  const resumen = setup();

  assert.strictEqual(leerPaises().length, paisesAntes);
  assert.strictEqual(leerEquipo().length, equipoAntes);
  assert.ok(resumen.pasos.join(' ').indexOf('Paises ya estaba al día') !== -1, resumen.pasos.join(' | '));
});

test('setup nunca pisa lo que ya está en Paises', () => {
  conSetup();
  adminGuardarEstadoDePais('MX', 'activo');
  setup();
  assert.strictEqual(paisPorCodigo(leerPaises(), 'MX').estado, 'activo');
});

test('quien despliega queda como administrador', () => {
  conSetup({ correo: 'juan.gallego@rappi.com' });
  assert.strictEqual(rolDe(leerEquipo(), 'juan.gallego@rappi.com'), 'admin');
});

// --- modo demostración -----------------------------------------------------

test('sin SHEET_ID la app arranca en modo demostración', () => {
  nuevoMundo();
  assert.ok(enModoDemostracion());

  const estado = estadoInicial();
  assert.strictEqual(estado.demostracion, true);
  assert.ok(estado.paises.length > 1, 'en demostración se ven también los países en piloto');
});

test('en modo demostración se devuelve el texto y no se crea nada', () => {
  const mundo = nuevoMundo();
  const resultado = generar(solicitudValida({ fechaReferencia: '2026-09-16' }));

  assert.ok(resultado.valido);
  assert.strictEqual(resultado.demostracion, true);
  assert.ok(resultado.texto.indexOf('TÉRMINOS Y CONDICIONES') !== -1);
  assert.strictEqual(Object.keys(mundo.documentos).length, 0, 'no debería crear documentos');
  assert.strictEqual(mundo.correos.length, 0, 'no debería mandar correos');
});

test('después de setup ya no está en modo demostración', () => {
  conSetup();
  assert.ok(!enModoDemostracion());
  assert.strictEqual(estadoInicial().demostracion, false);
});

// --- generación ------------------------------------------------------------

test('generar crea el documento con el título de la especificación', () => {
  const mundo = conSetup();
  const resultado = generar(solicitudValida({ tienda: 'Jumbo', porcentaje: 50 }));

  assert.ok(resultado.valido);
  assert.strictEqual(resultado.id, 'RM-20260916-0001');
  // El nombre lo arma la herramienta con la tienda, el porcentaje y el día de
  // inicio. Nadie lo escribe, así que no puede contradecir el articulado.
  assert.strictEqual(resultado.nombreCampana, 'Jumbo · 50% Cashback · 20 sep 2026');
  assert.strictEqual(resultado.direccionSugerida, 'jumbo-50-cashback-20-sep-2026');
  assert.strictEqual(resultado.titulo, 'T&C · Jumbo · 50% Cashback · 20 sep 2026 · Colombia · RM-20260916-0001');
  assert.strictEqual(Object.keys(mundo.documentos).length, 1);
});

test('el documento queda en la carpeta del país, nunca en una general', () => {
  const mundo = conSetup();
  const resultado = generar(solicitudValida());

  const documento = mundo.documentos[Object.keys(mundo.documentos)[0]];
  const archivo = mundo.archivos[documento.getId()];
  assert.ok(archivo.carpeta, 'el documento no se movió');
  assert.strictEqual(archivo.carpeta.getName(), 'CO · Colombia');
  assert.ok(resultado.linkDoc.indexOf('docs.google.com') !== -1);
});

test('el documento se comparte con el solicitante como lector', () => {
  const mundo = conSetup({ correo: 'kam@rappi.com' });
  generar(solicitudValida());

  const documento = mundo.documentos[Object.keys(mundo.documentos)[0]];
  assert.deepStrictEqual(mundo.archivos[documento.getId()].lectores, ['kam@rappi.com']);
});

test('el cuerpo del documento lleva el formato de la especificación', () => {
  const mundo = conSetup();
  generar(solicitudValida());

  const cuerpo = mundo.documentos[Object.keys(mundo.documentos)[0]].getBody();
  assert.ok(cuerpo.hijos.length > 40);

  const titulo = cuerpo.hijos[0];
  assert.strictEqual(titulo.alineacion, 'CENTER');
  assert.strictEqual(titulo.fuente, 'Arial');
  assert.strictEqual(titulo.interlineado, 1.15);

  const vinetas = cuerpo.hijos.filter((h) => h.getType() === 'LIST_ITEM');
  assert.ok(vinetas.length > 0, 'no hay viñetas');
  assert.strictEqual(vinetas[0].vineta, 'BULLET');

  const parrafos = cuerpo.hijos.filter((h) => h.getType() === 'PARAGRAPH');
  assert.ok(parrafos.some((p) => p.alineacion === 'JUSTIFY'), 'nada quedó justificado');
});

test('se manda un correo con el enlace del documento', () => {
  const mundo = conSetup({ correo: 'kam@rappi.com' });
  const resultado = generar(solicitudValida({ tienda: 'Jumbo' }));

  assert.strictEqual(mundo.correos.length, 1);
  const correo = mundo.correos[0];
  assert.strictEqual(correo.to, 'kam@rappi.com');
  assert.ok(correo.subject.indexOf('Jumbo · 20% Cashback') !== -1, correo.subject);
  assert.ok(correo.htmlBody.indexOf(resultado.linkDoc) !== -1);
  assert.strictEqual(correo.name, 'RappiMind');
  assert.ok(!correo.cc, 'sin CORREO_COPIA_LEGAL no debería haber copia');
});

test('CORREO_COPIA_LEGAL agrega la copia', () => {
  const mundo = conSetup();
  guardarPropiedad(PROPIEDADES.CORREO_COPIA_LEGAL, 'legal@rappi.com');
  generar(solicitudValida());
  assert.strictEqual(mundo.correos[0].cc, 'legal@rappi.com');
});

test('la solicitud queda registrada con cada dato en su columna', () => {
  conSetup({ correo: 'kam@rappi.com' });
  const resultado = generar(solicitudValida({ tienda: 'Jumbo' }));

  const solicitudes = leerSolicitudes();
  assert.strictEqual(solicitudes.length, 1);

  const fila = solicitudes[0];
  assert.strictEqual(fila.id, resultado.id);
  assert.strictEqual(fila.email, 'kam@rappi.com');
  assert.strictEqual(fila.pais, 'CO');
  assert.strictEqual(fila.tipo, 'cashback');
  assert.strictEqual(fila.nombre_campana, 'Jumbo · 20% Cashback · 20 sep 2026');
  assert.strictEqual(fila.direccion_sugerida, 'jumbo-20-cashback-20-sep-2026');
  assert.strictEqual(fila.tienda, 'Jumbo');
  assert.strictEqual(fila.estado, 'generado');
  assert.strictEqual(fila.version_modelo, '3.0');
  assert.ok(JSON.parse(fila.datos_json).porcentaje, 'datos_json debería traer el formulario completo');
});

test('la solicitud guarda cada respuesta en su propia columna', () => {
  // Para auditar hay que poder abrir el Sheet y ver qué contestó el comercial,
  // sin tener que leer el JSON.
  conSetup();
  generar(solicitudValida({ tienda: 'Jumbo', redencion: 'secciones', secciones: ['Restaurantes', 'Turbo'] }));

  const fila = leerSolicitudes()[0];
  assert.strictEqual(fila.resp_tienda, 'Jumbo');
  assert.strictEqual(fila.resp_porcentaje, 20);
  assert.strictEqual(fila.resp_redencion, 'En ciertas secciones de Rappi');
  assert.strictEqual(fila.resp_secciones, 'Restaurantes, Turbo');
  assert.strictEqual(fila.resp_declaracion, 'Sí');
  // Una pregunta que no aplica queda vacía, que es la verdad: no se hizo.
  assert.strictEqual(fila.resp_diasSinCompra, '');
});

test('dos campañas nunca se llaman igual', () => {
  conSetup();
  const primera = generar(solicitudValida({ tienda: 'Jumbo' }));
  const segunda = generar(solicitudValida({ tienda: 'Jumbo' }));
  const tercera = generar(solicitudValida({ tienda: 'Jumbo' }));

  assert.strictEqual(primera.nombreCampana, 'Jumbo · 20% Cashback · 20 sep 2026');
  assert.strictEqual(segunda.nombreCampana, 'Jumbo · 20% Cashback · 20 sep 2026 · 2');
  assert.strictEqual(tercera.nombreCampana, 'Jumbo · 20% Cashback · 20 sep 2026 · 3');

  // El nombre va adentro del articulado, así que el documento se rearma con él.
  assert.ok(segunda.titulo.indexOf('· 2 ·') !== -1, segunda.titulo);
  assert.notStrictEqual(primera.direccionSugerida, segunda.direccionSugerida);
});

test('el consecutivo avanza dentro del mismo día', () => {
  conSetup();
  assert.strictEqual(generar(solicitudValida()).id, 'RM-20260916-0001');
  assert.strictEqual(generar(solicitudValida()).id, 'RM-20260916-0002');
  assert.strictEqual(generar(solicitudValida()).id, 'RM-20260916-0003');
});

test('una solicitud inválida no crea nada', () => {
  const mundo = conSetup();
  const resultado = generar(solicitudValida({ organizadorId: '900111222-5' }));

  assert.ok(!resultado.valido);
  assert.strictEqual(resultado.errores[0].campo, 'organizadorId');
  assert.strictEqual(Object.keys(mundo.documentos).length, 0);
  assert.strictEqual(mundo.correos.length, 0);
  assert.strictEqual(leerSolicitudes().length, 0);
});

test('el servidor vuelve a validar aunque el navegador diga que está bien', () => {
  const mundo = conSetup();
  comoComercial(mundo, 'kam@rappi.com');
  // Un país en piloto para alguien que no es del equipo: el cliente podría
  // mandarlo igual, el servidor tiene que rechazarlo. Ecuador, porque México
  // salió de piloto el 18 de septiembre.
  const resultado = generar(solicitudValida({ pais: 'EC' }));
  assert.ok(!resultado.valido);
  assert.strictEqual(resultado.errores[0].campo, 'pais');
});

test('a alguien del equipo de pruebas sí se le permite un país en piloto', () => {
  const mundo = conSetup();
  adminGuardarMiembro({ email: 'pruebas@rappi.com', rol: 'pruebas' });
  mundo.correo = 'pruebas@rappi.com';

  const resultado = generar(solicitudValida({
    pais: 'EC', organizadorId: '1791234561001', compraMinima: null,
  }));
  assert.ok(resultado.valido, JSON.stringify(resultado.errores));
});

test('previsualizar no crea nada', () => {
  const mundo = conSetup();
  const resultado = previsualizar(solicitudValida());
  assert.ok(resultado.valido);
  assert.ok(resultado.texto.length > 1000);
  assert.strictEqual(Object.keys(mundo.documentos).length, 0);
});

// --- historial y publicación ----------------------------------------------

test('el historial solo muestra lo propio a un comercial', () => {
  const mundo = conSetup();
  comoComercial(mundo, 'uno@rappi.com');
  generar(solicitudValida({ tienda: 'De uno' }));

  agregarFila('Solicitudes', {
    id: 'RM-20260916-0099', fecha: '2026-09-16 09:00:00', email: 'otro@rappi.com',
    pais: 'CO', tipo: 'cashback', nombre_campana: 'De otro', estado: 'generado',
  });

  const mio = historial('');
  assert.strictEqual(mio.length, 1);
  assert.strictEqual(mio[0].nombre_campana, 'De uno · 20% Cashback · 20 sep 2026');
});

test('la búsqueda del historial funciona', () => {
  conSetup();
  generar(solicitudValida({ tienda: 'Jumbo MT' }));
  generar(solicitudValida({ tienda: 'Farmacia Vida' }));

  assert.strictEqual(historial('').length, 2);
  assert.strictEqual(historial('jumbo').length, 1);
  assert.strictEqual(historial('nada de nada').length, 0);
});

test('marcar publicado exige un enlace de promos.rappi.com', () => {
  conSetup();
  const resultado = generar(solicitudValida());

  const malo = marcarPublicado(resultado.id, 'https://otro.com/x');
  assert.ok(!malo.valido);
  assert.ok(malo.errores[0].mensaje.indexOf('promos.rappi.com') !== -1);

  const bueno = marcarPublicado(resultado.id, 'https://promos.rappi.com/jumbo-mt');
  assert.ok(bueno.valido);

  const fila = leerSolicitudes()[0];
  assert.strictEqual(fila.estado, 'publicado');
  assert.strictEqual(fila.link_publicado, 'https://promos.rappi.com/jumbo-mt');
  assert.ok(fila.fecha_publicacion);
});

test('no se puede publicar la solicitud de otra persona', () => {
  const mundo = conSetup();
  comoComercial(mundo, 'uno@rappi.com');
  agregarFila('Solicitudes', {
    id: 'RM-20260916-0099', email: 'otro@rappi.com', pais: 'CO', estado: 'generado',
  });
  const resultado = marcarPublicado('RM-20260916-0099', 'https://promos.rappi.com/x');
  assert.ok(!resultado.valido);
});

test('usar como base devuelve el formulario guardado', () => {
  conSetup();
  const resultado = generar(solicitudValida({ nombreCampana: 'Jumbo MT', porcentaje: 45 }));
  const datos = datosDeSolicitud(resultado.id);

  assert.ok(datos.valido);
  assert.strictEqual(datos.entrada.nombreCampana, 'Jumbo MT');
  assert.strictEqual(datos.entrada.porcentaje, 45);
});

// --- administración --------------------------------------------------------

test('solo un administrador entra a la administración', () => {
  const mundo = conSetup();
  comoComercial(mundo, 'kam@rappi.com');

  assert.throws(function () { adminEstado(); }, /administradores/);
  assert.throws(function () { adminSolicitudes(''); }, /administradores/);
  assert.throws(function () { adminGuardarEstadoDePais('MX', 'activo'); }, /administradores/);
});

test('un administrador cambia el estado de un país', () => {
  conSetup();
  assert.strictEqual(paisPorCodigo(leerPaises(), 'EC').estado, 'piloto');

  assert.ok(adminGuardarEstadoDePais('EC', 'activo').valido);
  assert.strictEqual(paisPorCodigo(leerPaises(), 'EC').estado, 'activo');

  const malo = adminGuardarEstadoDePais('EC', 'inventado');
  assert.ok(!malo.valido);
});

test('un administrador agrega y actualiza a alguien del equipo', () => {
  conSetup();
  assert.ok(adminGuardarMiembro({ email: 'Ana@Rappi.com', nombre: 'Ana', rol: 'pruebas', pais: 'mx' }).valido);

  let miembro = miembroPorCorreo(leerEquipo(), 'ana@rappi.com');
  assert.strictEqual(miembro.rol, 'pruebas');
  assert.strictEqual(miembro.pais, 'MX');

  adminGuardarMiembro({ email: 'ana@rappi.com', nombre: 'Ana', rol: 'legal', pais: 'MX' });
  assert.strictEqual(leerEquipo().filter((m) => m.email === 'ana@rappi.com').length, 1, 'no debería duplicar');
  assert.strictEqual(miembroPorCorreo(leerEquipo(), 'ana@rappi.com').rol, 'legal');
});

test('el equipo solo acepta correos del dominio', () => {
  conSetup();
  const resultado = adminGuardarMiembro({ email: 'alguien@gmail.com', rol: 'comercial' });
  assert.ok(!resultado.valido);
  assert.strictEqual(resultado.errores[0].campo, 'email');
});

test('la exportación es un CSV sin la columna de datos crudos', () => {
  conSetup();
  generar(solicitudValida({ tienda: 'Jumbo MT' }));

  const csv = adminSolicitudesCsv('');
  const encabezados = csv.split('\n')[0];
  assert.ok(encabezados.indexOf('id,fecha,email') === 0);
  assert.ok(encabezados.indexOf('datos_json') === -1, 'el JSON crudo no se exporta');
  assert.ok(csv.indexOf('Jumbo MT') !== -1);
});

// --- registro --------------------------------------------------------------

test('cada acción importante deja rastro en Registro', () => {
  conSetup();
  const resultado = generar(solicitudValida());
  marcarPublicado(resultado.id, 'https://promos.rappi.com/x');
  adminGuardarEstadoDePais('MX', 'activo');

  const acciones = objetosDe('Registro').map((f) => f.accion);
  assert.ok(acciones.indexOf('setup') !== -1);
  assert.ok(acciones.indexOf('generar') !== -1);
  assert.ok(acciones.indexOf('publicar') !== -1);
  assert.ok(acciones.indexOf('admin_pais') !== -1);
});

// --- lo que cruza a google.script.run ---------------------------------------

/**
 * Apps Script solo deja pasar números, textos, booleanos, nulos, listas y
 * objetos de esos. Una fecha no pasa: si va una sola en toda la respuesta,
 * Apps Script no falla ni avisa, le entrega null al navegador, y la pantalla
 * revienta con un "no puedo leer length de null" que no apunta a ninguna parte.
 *
 * Google Sheets convierte sola a fecha una celda que diga 2026-09-17, así que
 * esto pasa apenas hay una campaña guardada. Fue justo lo que rompió "Mis
 * campañas" en producción.
 */
function tieneFechas(valor) {
  if (Object.prototype.toString.call(valor) === '[object Date]') return true;
  if (valor && typeof valor === 'object') {
    for (const llave of Object.keys(valor)) {
      if (tieneFechas(valor[llave])) return true;
    }
  }
  return false;
}

test('el historial no devuelve fechas, que Apps Script convierte en null', () => {
  conSetup();
  generar(solicitudValida({ tienda: 'Jumbo' }));

  // Sheets convierte sola la celda de fecha. Aquí se reproduce a mano.
  const hoja = hojaPorNombre('Solicitudes');
  const columna = encabezadosDe('Solicitudes').indexOf('fecha_inicio');
  hoja.valores[1][columna] = new Date(2026, 8, 17);

  const filas = historial('');
  assert.strictEqual(filas.length, 1);
  assert.ok(!tieneFechas(filas), 'el historial devolvió una fecha: el navegador recibiría null');
  assert.strictEqual(filas[0].fecha_inicio, '2026-09-17');
});

test('el estado inicial y el panel de administración tampoco llevan fechas', () => {
  conSetup();
  generar(solicitudValida());

  assert.ok(!tieneFechas(estadoInicial()), 'estadoInicial devolvió una fecha');
  assert.ok(!tieneFechas(adminEstado()), 'adminEstado devolvió una fecha');
  assert.ok(!tieneFechas(adminSolicitudes('')), 'adminSolicitudes devolvió una fecha');
});

test('una hoja vieja se pone al día sola, sin correr setup otra vez', () => {
  // El caso real: el Sheet ya existía con las columnas de antes y las nuevas
  // columnas de auditoría no estaban. Generar no puede escribir corrido.
  conSetup();
  const hoja = hojaPorNombre('Solicitudes');

  // Se deja la hoja como estaba antes: solo las columnas de siempre.
  const viejas = PESTANAS.Solicitudes.slice();
  hoja.valores = [viejas.slice()];

  const resultado = generar(solicitudValida({ tienda: 'Jumbo' }));
  assert.ok(resultado.valido);

  const fila = leerSolicitudes()[0];
  assert.strictEqual(fila.nombre_campana, 'Jumbo · 20% Cashback · 20 sep 2026');
  assert.strictEqual(fila.resp_tienda, 'Jumbo', 'la columna nueva no se agregó sola');
  assert.strictEqual(fila.id, resultado.id, 'los datos quedaron corridos de columna');
});

/**
 * El caso real de Rappi Travel en produccion.
 *
 * Juan corrio setup() cuando Travel no existia. Despues se agregaron los dos
 * tipos de Travel y las nueve columnas travel_* a la semilla, pero la pestana
 * Paises ya tenia datos, asi que setup no la tocaba: en la app, elegir Rappi
 * Travel en Colombia decia que Travel no estaba habilitado.
 */
function hojaDePaisesComoEstabaAntesDeTravel() {
  const hoja = hojaPorNombre('Paises');
  const encabezadosViejos = PESTANAS.Paises.filter((c) => c.indexOf('travel_') !== 0);

  const filas = [encabezadosViejos.slice()];
  for (const semilla of PAISES_SEMILLA) {
    const fila = paisComoFila(semilla);
    // Antes de Travel, la columna modelos no traia los dos tipos de viajes.
    fila.modelos = comoLista(fila.modelos).filter((m) => m.indexOf('travel') === -1).join(', ');
    filas.push(encabezadosViejos.map((c) => (fila[c] === undefined ? '' : fila[c])));
  }
  hoja.valores = filas;
  return hoja;
}

test('una pestaña de Países de antes de Travel se pone al día al correr setup', () => {
  conSetup();
  hojaDePaisesComoEstabaAntesDeTravel();

  // Asi estaba: Colombia sin los tipos de Travel y sin sus datos legales.
  const antes = paisPorCodigo(leerPaises(), 'CO');
  assert.strictEqual(antes.modelos.indexOf('cashback_travel'), -1);
  assert.strictEqual(travelDisponible(antes, '2026-09-17').disponible, false);

  setup();

  const despues = paisPorCodigo(leerPaises(), 'CO');
  assert.ok(despues.modelos.indexOf('cashback_travel') !== -1, 'no se agregó el cashback de Travel');
  assert.ok(despues.modelos.indexOf('descuento_travel') !== -1, 'no se agregó el descuento de Travel');
  assert.strictEqual(despues.travel_entidad, 'Travel Moustache S.A.S.');
  assert.strictEqual(travelDisponible(despues, '2026-09-17').disponible, true,
    travelDisponible(despues, '2026-09-17').motivo);

  // Y los tipos de siempre siguen ahí, en su orden.
  assert.deepStrictEqual(despues.modelos.slice(0, 3), ['cashback', 'carrera_compras', 'cashback_day']);
});

test('setup avisa lo que dejó sin tocar porque la hoja manda', () => {
  // El caso real: Brasil pasó a piloto en la semilla, Juan corrió setup, y
  // Brasil siguió sin aparecer porque la hoja decía "bloqueado" desde el primer
  // día. La regla es correcta, pero callarse la diferencia confunde.
  conSetup();
  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaBr = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'BR');
  hoja.valores[filaBr][encabezados.indexOf('estado')] = 'bloqueado';

  const resumen = setup();
  const texto = resumen.pasos.join(' | ');

  assert.ok(texto.indexOf('BR.estado') !== -1, texto);
  assert.ok(texto.indexOf('la hoja dice "bloqueado"') !== -1, texto);
  assert.ok(texto.indexOf('la semilla dice "activo"') !== -1, texto);
  assert.ok(texto.indexOf('Administración') !== -1, 'no dice dónde cambiarlo');

  // Y no lo cambió: la hoja sigue mandando.
  assert.strictEqual(paisPorCodigo(leerPaises(), 'BR').estado, 'bloqueado');
});

test('poner al día los países no pisa lo que Legal cambió a mano', () => {
  conSetup();
  const hoja = hojaDePaisesComoEstabaAntesDeTravel();

  // Legal ajusta a mano la razon social y bloquea un pais. Eso manda.
  const encabezados = hoja.valores[0];
  const filaCo = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'CO');
  hoja.valores[filaCo][encabezados.indexOf('entidad_legal')] = 'Rappi S.A.S. (en reorganización)';
  hoja.valores[filaCo][encabezados.indexOf('estado')] = 'bloqueado';

  setup();

  const colombia = paisPorCodigo(leerPaises(), 'CO');
  assert.strictEqual(colombia.entidad_legal, 'Rappi S.A.S. (en reorganización)');
  assert.strictEqual(colombia.estado, 'bloqueado');
  // Pero lo que faltaba sí se completó.
  assert.ok(colombia.modelos.indexOf('cashback_travel') !== -1);
  assert.strictEqual(colombia.travel_rnt, '79000');
});

test('el vencimiento del RNT se lee bien aunque el Sheet lo vuelva fecha', () => {
  conSetup();
  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaCo = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'CO');

  // Esto es lo que hace Google Sheets solo con una celda que diga 2027-03-31.
  hoja.valores[filaCo][encabezados.indexOf('travel_rnt_vence')] = new Date(2027, 2, 31);

  const colombia = paisPorCodigo(leerPaises(), 'CO');
  assert.strictEqual(colombia.travel_rnt_vence, '2027-03-31', 'la fecha llegó como objeto Date');
  assert.strictEqual(travelDisponible(colombia, '2026-09-17').disponible, true);

  // Y un registro vencido sí bloquea, que es para lo que existe la fecha.
  const vencido = travelDisponible(colombia, '2027-06-01');
  assert.strictEqual(vencido.disponible, false);
  assert.ok(vencido.motivo.indexOf('Registro Nacional de Turismo') !== -1, vencido.motivo);
});

test('poner al día no borra un modelo que alguien quitó a propósito', () => {
  conSetup();
  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaCo = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'CO');

  // Se deja Colombia solo con cashback, a mano.
  hoja.valores[filaCo][encabezados.indexOf('modelos')] = 'cashback';
  setup();

  // Los de la semilla se agregan, pero el orden de quien editó se respeta.
  const colombia = paisPorCodigo(leerPaises(), 'CO');
  assert.strictEqual(colombia.modelos[0], 'cashback');
  assert.ok(colombia.modelos.indexOf('cashback_travel') !== -1);
});

// --- ampliar una campaña en curso ------------------------------------------

/**
 * Una campaña que ya arrancó solo puede recibir más: más días, más presupuesto,
 * más órdenes o más unidades. El enlace publicado no cambia, porque la gente ya
 * lo tiene: lo que cambia es el texto que el comercial pega ahí.
 */
function campanaEnCurso() {
  // El mundo de prueba está en 2026-09-16, así que esta campaña ya arrancó.
  const resultado = generar(solicitudValida({ tienda: 'Jumbo', fechaInicio: '2026-09-16', fechaFin: '2026-09-30' }));
  marcarPublicado(resultado.id, 'https://promos.rappi.com/colombia/jumbo');
  return resultado;
}

test('ampliar una campaña en curso genera otra versión del documento', () => {
  conSetup();
  const original = campanaEnCurso();

  const ampliada = ampliarCampana(original.id, { fechaFin: '2026-10-15', presupuesto: 3000000 });
  assert.ok(ampliada.valido, JSON.stringify(ampliada.errores));
  assert.strictEqual(ampliada.version, 2);
  assert.ok(ampliada.titulo.indexOf('versión 2') !== -1, ampliada.titulo);

  // El enlace publicado es el mismo: el comercial reemplaza el texto ahí.
  assert.strictEqual(ampliada.linkPublicado, 'https://promos.rappi.com/colombia/jumbo');

  const fila = leerSolicitudes()[0];
  assert.strictEqual(fila.link_publicado, 'https://promos.rappi.com/colombia/jumbo');
  assert.strictEqual(fila.link_doc, ampliada.linkDoc, 'el historial debería apuntar a la versión nueva');
  assert.strictEqual(JSON.parse(fila.datos_json).presupuesto, 3000000);
  assert.strictEqual(JSON.parse(fila.datos_json).modificaciones.length, 1);
});

test('ampliar nunca deja bajar un número ni adelantar el fin', () => {
  conSetup();
  const original = campanaEnCurso();

  const bajar = ampliarCampana(original.id, { presupuesto: 500000 });
  assert.ok(!bajar.valido);
  assert.ok(bajar.errores[0].mensaje.indexOf('quien ya compró') !== -1, bajar.errores[0].mensaje);

  const adelantar = ampliarCampana(original.id, { fechaFin: '2026-09-20' });
  assert.ok(!adelantar.valido);
  assert.ok(adelantar.errores[0].mensaje.indexOf('hacia adelante') !== -1, adelantar.errores[0].mensaje);
});

test('una campaña sin publicar no se amplía', () => {
  conSetup();
  const sinPublicar = generar(solicitudValida({ fechaInicio: '2026-09-16', fechaFin: '2026-09-30' }));

  const resultado = ampliarCampana(sinPublicar.id, { presupuesto: 3000000 });
  assert.ok(!resultado.valido);
  assert.ok(resultado.errores[0].mensaje.indexOf('no está publicada') !== -1, resultado.errores[0].mensaje);
});

test('la ampliación de otra persona se rechaza', () => {
  const mundo = conSetup();
  const original = campanaEnCurso();

  comoComercial(mundo, 'otro@rappi.com');
  const resultado = ampliarCampana(original.id, { presupuesto: 3000000 });
  assert.ok(!resultado.valido);
  assert.strictEqual(resultado.errores[0].mensaje, 'Esa solicitud no es tuya.');
});

test('cada ampliación queda en el Registro', () => {
  const mundo = conSetup();
  const original = campanaEnCurso();
  ampliarCampana(original.id, { presupuesto: 3000000 });

  const registro = objetosDe('Registro');
  assert.ok(registro.some((fila) => fila.accion === 'ampliar' && String(fila.detalle).indexOf(original.id) !== -1));
});

/**
 * El estado inicial es lo primero que recibe el navegador, y de ahí sale la
 * lista de tipos de campaña. Esta prueba existe porque se rompió de verdad:
 * al limpiar las fechas para que pasaran por google.script.run, la lista
 * `pais.modelos` se convirtió en la cadena "cashback,carrera_compras,..." y la
 * pantalla se quedó sin una sola opción que elegir.
 *
 * En la demostración no se veía, porque ahí el servidor simulado no limpia
 * nada. Solo se veía en Apps Script.
 */
test('el estado inicial conserva las listas, no las vuelve texto', () => {
  conSetup();
  const inicial = estadoInicial();

  const colombia = inicial.paises.filter((p) => p.codigo === 'CO')[0];
  assert.ok(colombia, 'Colombia debería estar disponible');
  assert.ok(Array.isArray(colombia.modelos), 'pais.modelos llegó como ' + typeof colombia.modelos);
  assert.ok(colombia.modelos.indexOf('cashback_travel') !== -1, JSON.stringify(colombia.modelos));

  // Y con esa lista, la pantalla tiene los seis tipos que ofrecer.
  const disponibles = tiposDelPais(colombia, inicial.tipos);
  assert.strictEqual(disponibles.length, 6, disponibles.map((t) => t.id).join(', '));
});

test('el historial conserva las listas de cada solicitud', () => {
  conSetup();
  generar(solicitudValida({ tienda: 'Jumbo', redencion: 'secciones', secciones: ['Restaurantes', 'Turbo'] }));

  const fila = historial('')[0];
  const guardado = JSON.parse(fila.datos_json);
  assert.ok(Array.isArray(guardado.secciones), 'las secciones llegaron como ' + typeof guardado.secciones);
  assert.deepStrictEqual(guardado.secciones, ['Restaurantes', 'Turbo']);
});

// --- abrir la herramienta a los equipos legales de los demás países --------

/**
 * Un país en piloto solo lo ve quien tenga rol legal, pruebas o admin. Para que
 * los equipos legales de los ocho países puedan probar hay que agregarlos, y
 * agregarlos de uno en uno no lo hace nadie.
 */
test('pegar una lista de correos agrega a todos de una vez', () => {
  conSetup();

  const respuesta = adminAgregarMiembros(
    'ana@rappi.com, bruno@rappi.com\ncarla@rappi.com; diego@rappi.com',
    'legal',
    'mx'
  );

  assert.strictEqual(respuesta.valido, true, JSON.stringify(respuesta.errores));
  assert.strictEqual(respuesta.agregados.length, 4, respuesta.agregados.join(', '));

  const equipo = leerEquipo();
  assert.strictEqual(rolDe(equipo, 'ana@rappi.com'), 'legal');
  assert.strictEqual(rolDe(equipo, 'diego@rappi.com'), 'legal');
  assert.strictEqual(miembroPorCorreo(equipo, 'carla@rappi.com').pais, 'MX');
});

test('con rol legal, la persona ya ve los países en piloto', () => {
  const mundo = conSetup();
  adminAgregarMiembros('ana@rappi.com', 'legal', 'mx');

  mundo.correo = 'ana@rappi.com';
  const inicial = estadoInicial();
  const codigos = inicial.paises.map((p) => p.codigo);

  assert.ok(codigos.indexOf('MX') !== -1, 'no ve México: ' + codigos.join(', '));
  assert.ok(codigos.indexOf('BR') !== -1, 'no ve Brasil: ' + codigos.join(', '));
  assert.ok(codigos.length > 1, 'solo ve un país');
});

test('sin rol, la persona solo ve los países activos', () => {
  const mundo = conSetup();
  mundo.correo = 'nadie@rappi.com';

  // Desde el 18 de septiembre son siete los activos. Ecuador y Costa Rica, que
  // siguen en piloto, no le pueden salir a un comercial sin rol.
  const codigos = estadoInicial().paises.map((p) => p.codigo);
  assert.deepStrictEqual(codigos.slice().sort(), ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY']);
  assert.strictEqual(codigos.indexOf('EC'), -1, 'un comercial nuevo no debería ver Ecuador');
  assert.strictEqual(codigos.indexOf('CR'), -1, 'un comercial nuevo no debería ver Costa Rica');
});

test('la carga masiva nunca le baja el rol a quien ya estaba', () => {
  const mundo = conSetup({ correo: 'juan.gallego@rappi.com' });
  assert.strictEqual(rolDe(leerEquipo(), 'juan.gallego@rappi.com'), 'admin');

  const respuesta = adminAgregarMiembros('juan.gallego@rappi.com, nueva@rappi.com', 'comercial', '');

  assert.deepStrictEqual(respuesta.yaEstaban, ['juan.gallego@rappi.com']);
  assert.strictEqual(rolDe(leerEquipo(), 'juan.gallego@rappi.com'), 'admin', 'le bajaron el rol al administrador');
  assert.strictEqual(rolDe(leerEquipo(), 'nueva@rappi.com'), 'comercial');
});

test('los correos que no son de Rappi se rechazan, y los demás sí entran', () => {
  conSetup();
  const respuesta = adminAgregarMiembros('ana@rappi.com, alguien@gmail.com', 'legal', '');

  assert.deepStrictEqual(respuesta.agregados, ['ana@rappi.com']);
  assert.deepStrictEqual(respuesta.rechazados, ['alguien@gmail.com']);
});

test('un correo repetido en el mismo pegado entra una sola vez', () => {
  conSetup();
  const respuesta = adminAgregarMiembros('ana@rappi.com, ANA@rappi.com\nana@rappi.com', 'legal', '');

  assert.strictEqual(respuesta.agregados.length, 1, respuesta.agregados.join(', '));
  const cuantas = leerEquipo().filter((m) => m.email === 'ana@rappi.com').length;
  assert.strictEqual(cuantas, 1, 'quedó duplicado en la hoja');
});

test('los correos llegan pegados de un chat, con picos y espacios', () => {
  conSetup();
  const respuesta = adminAgregarMiembros('  <ana@rappi.com>  ;\n\n (bruno@rappi.com) ', 'legal', '');
  assert.deepStrictEqual(respuesta.agregados, ['ana@rappi.com', 'bruno@rappi.com']);
});

test('un rol que no existe se rechaza', () => {
  conSetup();
  const respuesta = adminAgregarMiembros('ana@rappi.com', 'jefe', '');
  assert.strictEqual(respuesta.valido, false);
  assert.strictEqual(respuesta.errores[0].campo, 'rol');
});

test('sin correos, dice qué falta', () => {
  conSetup();
  const respuesta = adminAgregarMiembros('   ', 'legal', '');
  assert.strictEqual(respuesta.valido, false);
  assert.ok(respuesta.errores[0].mensaje.indexOf('Pega al menos un correo') !== -1);
});

test('la respuesta cruza a google.script.run sin fechas', () => {
  conSetup();
  const respuesta = adminAgregarMiembros('ana@rappi.com', 'legal', '');
  // Listas de texto, nada de objetos Date: si no, la pantalla recibiría null.
  assert.ok(Array.isArray(respuesta.agregados));
  for (const valor of respuesta.agregados.concat(respuesta.yaEstaban, respuesta.rechazados)) {
    assert.strictEqual(typeof valor, 'string', 'un valor no primitivo en la respuesta');
  }
});


// --- lo que salió de la revisión crítica del 17 de septiembre ---------------

test('ampliar funciona aunque la campaña haya arrancado días atrás', () => {
  // Ampliar rearma el documento completo, y la validación decía "Esa fecha ya
  // pasó" por el inicio. Solo funcionaba el mismo día del inicio, que era
  // justo lo único que se probaba.
  const mundo = conSetup({ ahora: '2026-09-10T10:30:00Z' });
  const original = generar(solicitudValida({ tienda: 'Jumbo', fechaInicio: '2026-09-10', fechaFin: '2026-09-30' }));
  assert.ok(original.valido, JSON.stringify(original.errores));
  marcarPublicado(original.id, 'https://promos.rappi.com/colombia/jumbo');

  mundo.ahora = '2026-09-16T10:30:00Z';
  const ampliada = ampliarCampana(original.id, { presupuesto: 3000000 });
  assert.ok(ampliada.valido, JSON.stringify(ampliada.errores));
  assert.strictEqual(ampliada.version, 2);
});

/** El caso TV01 de casos_base.json: un Cashback Travel de Colombia que genera. */
function solicitudDeTravel() {
  const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
  const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
  return Object.assign({}, casos.find((c) => c.id === 'TV01').entrada);
}

test('ampliar una campaña de Travel no tropieza con la primera comunicación, que ya salió', () => {
  const mundo = conSetup();
  const original = generar(solicitudDeTravel());
  assert.ok(original.valido, JSON.stringify(original.errores));
  marcarPublicado(original.id, 'https://promos.rappi.com/colombia/travel');

  mundo.ahora = '2026-10-10T10:30:00Z';
  const ampliada = ampliarCampana(original.id, { presupuesto: 6000000 });
  assert.ok(ampliada.valido, JSON.stringify(ampliada.errores));
});

test('usar como base no arrastra la nota de la ampliación ni el consecutivo del nombre', () => {
  // La copia de una campaña ampliada salía con "Modificación del 16 de
  // septiembre..." al final del documento nuevo.
  const mundo = conSetup();
  const original = generar(solicitudDeTravel());
  marcarPublicado(original.id, 'https://promos.rappi.com/colombia/travel');
  mundo.ahora = '2026-10-10T10:30:00Z';
  assert.ok(ampliarCampana(original.id, { presupuesto: 6000000 }).valido);

  const base = datosDeSolicitud(original.id).entrada;
  assert.strictEqual(base.modificaciones, undefined, 'la base trae las modificaciones de la vieja');
  assert.strictEqual(base.sufijoNombre, undefined, 'la base trae el consecutivo de la vieja');

  const copia = Object.assign(base, { fechaPrimeraComunicacion: '2026-11-20', fechaInicio: '2026-12-01', fechaFin: '2026-12-31' });
  const vista = previsualizar(copia);
  assert.ok(vista.valido, JSON.stringify(vista.errores));
  assert.ok(vista.texto.indexOf('Modificación del') === -1, 'la copia imprime la nota de modificación de la vieja');
});

test('la primera ampliación de una copia es la versión 2', () => {
  conSetup();
  const original = generar(solicitudValida({ tienda: 'Jumbo', fechaInicio: '2026-09-16', fechaFin: '2026-09-30' }));
  marcarPublicado(original.id, 'https://promos.rappi.com/colombia/jumbo');
  assert.strictEqual(ampliarCampana(original.id, { presupuesto: 3000000 }).version, 2);

  const copia = generar(Object.assign(datosDeSolicitud(original.id).entrada, { fechaInicio: '2026-09-16', fechaFin: '2026-10-30' }));
  assert.ok(copia.valido, JSON.stringify(copia.errores));
  marcarPublicado(copia.id, 'https://promos.rappi.com/colombia/jumbo-2');

  const ampliada = ampliarCampana(copia.id, { presupuesto: 4000000 });
  assert.ok(ampliada.valido, JSON.stringify(ampliada.errores));
  assert.strictEqual(ampliada.version, 2, ampliada.titulo);
});

test('el país y el rol de un miembro tienen que existir', () => {
  // El historial compara el país del miembro con el de cada solicitud: un
  // legal con "MZ" no veía ninguna campaña y nadie se enteraba.
  conSetup();
  const paisMalo = adminAgregarMiembros('ana@rappi.com', 'legal', 'MZ');
  assert.strictEqual(paisMalo.valido, false);
  assert.strictEqual(paisMalo.errores[0].campo, 'pais');

  const rolMalo = adminGuardarMiembro({ email: 'ana@rappi.com', rol: 'jefe' });
  assert.strictEqual(rolMalo.valido, false);
  assert.strictEqual(rolMalo.errores[0].campo, 'rol');

  const paisInventado = adminGuardarMiembro({ email: 'ana@rappi.com', rol: 'legal', pais: 'ZZ' });
  assert.strictEqual(paisInventado.valido, false);
  assert.strictEqual(paisInventado.errores[0].campo, 'pais');

  assert.strictEqual(leerEquipo().filter((m) => m.email === 'ana@rappi.com').length, 0, 'algo se guardó igual');
  assert.ok(adminGuardarMiembro({ email: 'ana@rappi.com', rol: 'legal', pais: '' }).valido, 'sin país también vale');
});

test('reactivar a alguien no duplica su fila en Equipo', () => {
  conSetup();
  adminGuardarMiembro({ email: 'ana@rappi.com', rol: 'legal', pais: 'MX' });
  adminGuardarMiembro({ email: 'ana@rappi.com', rol: 'legal', pais: 'MX', activo: false });
  assert.strictEqual(miembroPorCorreo(leerEquipo(), 'ana@rappi.com'), null, 'debería estar inactiva');

  adminGuardarMiembro({ email: 'ana@rappi.com', rol: 'pruebas', pais: 'MX' });
  const filas = leerEquipo().filter((m) => m.email === 'ana@rappi.com');
  assert.strictEqual(filas.length, 1, 'quedaron ' + filas.length + ' filas');
  assert.strictEqual(filas[0].activo, true);
  assert.strictEqual(filas[0].rol, 'pruebas');

  // Por la carga masiva igual: vuelve a entrar con el rol pedido, en su fila.
  adminGuardarMiembro({ email: 'bea@rappi.com', nombre: 'Bea', rol: 'legal', activo: false });
  const respuesta = adminAgregarMiembros('bea@rappi.com', 'pruebas', 'CO');
  assert.deepStrictEqual(respuesta.agregados, ['bea@rappi.com']);
  const bea = leerEquipo().filter((m) => m.email === 'bea@rappi.com');
  assert.strictEqual(bea.length, 1);
  assert.strictEqual(bea[0].activo, true);
  assert.strictEqual(bea[0].rol, 'pruebas');
  assert.strictEqual(bea[0].nombre, 'Bea', 'el nombre que ya tenía se conserva');
});

test('los correos pegados de Gmail entran con nombre y todo', () => {
  // "Ana Pérez <ana@rappi.com>" se partía por espacios y "ana" y "pérez"
  // salían como correos rechazados: el admin leía "no son correos de Rappi" y
  // dudaba de si los había agregado.
  conSetup();
  const respuesta = adminAgregarMiembros('Ana Pérez <ana@rappi.com>, Bruno Díaz <bruno@rappi.com>; mailto:carla@rappi.com', 'legal', '');
  assert.deepStrictEqual(respuesta.agregados, ['ana@rappi.com', 'bruno@rappi.com', 'carla@rappi.com']);
  assert.deepStrictEqual(respuesta.rechazados, []);

  // Lo que parece un correo mal escrito sí se rechaza, con su nombre.
  const malos = adminAgregarMiembros('diego.rappi.com, elena@rappi, fer@gmail.com, ANA@RAPPI.COM', 'legal', '');
  assert.deepStrictEqual(malos.rechazados.slice().sort(), ['diego.rappi.com', 'elena@rappi', 'fer@gmail.com']);
  assert.deepStrictEqual(malos.yaEstaban, ['ana@rappi.com']);
  assert.deepStrictEqual(malos.agregados, []);
});

test('poner al día los países agrega los datos por confirmar nuevos de la semilla', () => {
  // La lista de Brasil creció de cinco a diez datos, pero una hoja que ya
  // existía se quedaba con la vieja y el aviso al abogado brasileño salía
  // corto. Esa columna la mantiene la herramienta, como la de modelos.
  conSetup();
  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaBr = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'BR');
  hoja.valores[filaBr][encabezados.indexOf('por_confirmar_en_pruebas')] = '';

  setup();

  const brasil = paisPorCodigo(leerPaises(), 'BR');
  const semilla = PAISES_SEMILLA.find((p) => p.codigo === 'BR').por_confirmar_en_pruebas;
  for (const llave of semilla) {
    assert.ok(brasil.por_confirmar_en_pruebas.indexOf(llave) !== -1, 'falta ' + llave);
  }
  assert.strictEqual(brasil.por_confirmar_en_pruebas.length, semilla.length);
});

/**
 * Lo que setup sí hace y lo que no, con los datos por confirmar.
 *
 * Esa columna solo crece: setup une lo de la hoja con lo de la semilla. Cuando
 * Legal confirma un dato y sale de data/paises.json, la hoja se queda con él
 * hasta que alguien lo borre a mano, porque la hoja manda. Esta prueba existe
 * para que nadie dé por hecho que desplegar y correr setup limpia la lista.
 */
test('setup no borra de la hoja un dato por confirmar que la semilla ya no trae', () => {
  conSetup();
  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaMx = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'MX');
  hoja.valores[filaMx][encabezados.indexOf('por_confirmar_en_pruebas')] =
    'separador_miles, termino_dias, texto_hora_local, texto_derechos_datos';

  setup();

  const mexico = paisPorCodigo(leerPaises(), 'MX');
  assert.ok(mexico.por_confirmar_en_pruebas.indexOf('termino_dias') !== -1,
    'setup borró de la hoja un dato viejo: hay que quitarlo a mano en la pestaña Paises');
});

test('previsualizar y generar aguantan una entrada vacía en modo demostración', () => {
  nuevoMundo();
  assert.doesNotThrow(() => previsualizar(null));
  assert.doesNotThrow(() => generar(undefined));
  assert.strictEqual(previsualizar(null).valido, false);
});

// --- los valores que Legal confirma llegan solos a la hoja -----------------

/**
 * La hoja manda sobre la semilla, y eso no cambia. Lo que cambia es que un
 * valor confirmado por Legal ya no se queda esperando a que alguien lo copie
 * celda por celda: la semilla declara la tanda, setup la escribe una vez, y
 * guarda que ya la escribió.
 */
function hojaDePaisesComoEstabaAntesDelEncargo01() {
  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const fila = (codigo) => hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === codigo);

  hoja.valores[fila('MX')][encabezados.indexOf('texto_derechos_datos')] =
    'tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO)';
  hoja.valores[fila('MX')][encabezados.indexOf('por_confirmar_en_pruebas')] =
    'separador_miles, termino_dias, texto_hora_local, texto_derechos_datos';
  hoja.valores[fila('BR')][encabezados.indexOf('pais_legal')] = 'a República Federativa del Brasil';
  hoja.valores[fila('BR')][encabezados.indexOf('entidad_vigilancia')] =
    'el PROCON y la Secretaría Nacional del Consumidor (SENACON)';
  return hoja;
}

test('setup escribe en la hoja los valores que Legal confirmó', () => {
  // El caso real: el Sheet de Juan existe desde antes, con los valores viejos,
  // y nunca ha visto una tanda de confirmaciones.
  const mundo = conSetup();
  hojaDePaisesComoEstabaAntesDelEncargo01();
  delete mundo.propiedades.CONFIRMACIONES_APLICADAS;

  setup();

  const mexico = paisPorCodigo(leerPaises(), 'MX');
  assert.ok(mexico.texto_derechos_datos.indexOf('revocar tu consentimiento') !== -1,
    'no se escribió el texto de derechos confirmado: ' + mexico.texto_derechos_datos);
  assert.deepStrictEqual(mexico.por_confirmar_en_pruebas, [],
    'los datos ya confirmados siguen marcados como pendientes');

  const brasil = paisPorCodigo(leerPaises(), 'BR');
  assert.strictEqual(brasil.pais_legal, 'a República Federativa do Brasil');
  assert.ok(brasil.entidad_vigilancia.indexOf('Secretaria Nacional do Consumidor') !== -1, brasil.entidad_vigilancia);
});

test('la tanda de confirmaciones se aplica una sola vez', () => {
  // Si se aplicara en cada setup, un valor que Legal corrija a mano después
  // volvería solo al de la semilla, que es justo lo que la regla evita.
  const mundo = conSetup();
  hojaDePaisesComoEstabaAntesDelEncargo01();
  delete mundo.propiedades.CONFIRMACIONES_APLICADAS;
  setup();

  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaMx = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'MX');
  hoja.valores[filaMx][encabezados.indexOf('texto_derechos_datos')] = 'lo que Legal escribió después';

  setup();

  assert.strictEqual(paisPorCodigo(leerPaises(), 'MX').texto_derechos_datos, 'lo que Legal escribió después',
    'la segunda corrida revivió el valor de la semilla');
});

test('las confirmaciones solo tocan las columnas que declaran', () => {
  const mundo = conSetup();
  delete mundo.propiedades.CONFIRMACIONES_APLICADAS;
  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaMx = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'MX');
  hoja.valores[filaMx][encabezados.indexOf('entidad_legal')] = 'Rappi México, editado a mano';

  setup();

  assert.strictEqual(paisPorCodigo(leerPaises(), 'MX').entidad_legal, 'Rappi México, editado a mano');
});

test('cada confirmación declarada nombra un país y una columna que existen', () => {
  const { leerJson, rutaDesdeRaiz } = require('../scripts/lib/archivos');
  const semilla = leerJson(rutaDesdeRaiz('data', 'paises.json'));
  const { PESTANAS } = require('../src/server/Config.js');
  const codigos = semilla.paises.map((p) => p.codigo);

  for (const tanda of semilla.confirmaciones || []) {
    assert.ok(tanda.id, 'una tanda de confirmaciones sin id');
    for (const campo of tanda.campos || []) {
      const partes = String(campo).split('.');
      assert.strictEqual(partes.length, 2, 'mal escrito: ' + campo);
      assert.ok(codigos.indexOf(partes[0]) !== -1, 'país que no existe: ' + campo);
      assert.ok(PESTANAS.Paises.indexOf(partes[1]) !== -1, 'columna que no existe: ' + campo);
    }
  }
});

/**
 * La tanda que saca seis paises de piloto.
 *
 * El Sheet de Juan existe desde antes y dice "piloto" en las seis filas. La
 * regla general es que la hoja manda sobre la semilla, asi que cambiar
 * data/paises.json no mueve una fila que ya existe: sin la tanda, Juan despliega,
 * corre setup(), y Mexico le sigue saliendo solo al equipo de pruebas.
 *
 * Esta prueba corre el camino entero: hoja vieja, setup(), y los seis paises
 * salen activos, con Ecuador y Costa Rica intactos en piloto.
 */
test('la tanda de estados saca de piloto a los seis países en una hoja vieja', () => {
  const mundo = conSetup();

  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const columnaEstado = encabezados.indexOf('estado');
  const fila = (codigo) => hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === codigo);

  // La hoja como estaba antes: los ocho en piloto.
  for (const codigo of ['MX', 'PE', 'AR', 'CL', 'UY', 'BR', 'EC', 'CR']) {
    hoja.valores[fila(codigo)][columnaEstado] = 'piloto';
  }
  delete mundo.propiedades.CONFIRMACIONES_APLICADAS;

  setup();

  const paises = leerPaises();
  for (const codigo of ['MX', 'PE', 'AR', 'CL', 'UY', 'BR']) {
    assert.strictEqual(paisPorCodigo(paises, codigo).estado, 'activo',
      codigo + ' siguió en piloto después de correr setup');
  }
  assert.strictEqual(paisPorCodigo(paises, 'EC').estado, 'piloto', 'Ecuador no debía salir de piloto');
  assert.strictEqual(paisPorCodigo(paises, 'CR').estado, 'piloto', 'Costa Rica no debía salir de piloto');
});

test('si Juan vuelve a poner un país en piloto, setup no lo saca otra vez', () => {
  // Cada tanda se aplica una sola vez. Si Juan cierra México a mano porque algo
  // salió mal, correr setup() no puede reabrirlo.
  const mundo = conSetup();
  delete mundo.propiedades.CONFIRMACIONES_APLICADAS;
  setup();
  assert.strictEqual(paisPorCodigo(leerPaises(), 'MX').estado, 'activo');

  const hoja = hojaPorNombre('Paises');
  const encabezados = hoja.valores[0];
  const filaMx = hoja.valores.findIndex((f) => f[encabezados.indexOf('codigo')] === 'MX');
  hoja.valores[filaMx][encabezados.indexOf('estado')] = 'piloto';

  setup();

  assert.strictEqual(paisPorCodigo(leerPaises(), 'MX').estado, 'piloto',
    'setup reabrió un país que Juan había cerrado a mano');
});

// --- Las leyendas de las piezas publicitarias ------------------------------

/**
 * El camino 4 de la seccion 6 de la respuesta del encargo 03, que Juan aprobo
 * el 18 de septiembre: enlace previsto y confirmado.
 *
 * Al generar, la herramienta arma la direccion donde va a quedar publicado el
 * T&C y entrega las leyendas completas con esa direccion, marcadas "enlace por
 * confirmar". Cuando el comercial pega el enlace publicado, se comparan: si es
 * distinto, las leyendas se rehacen con el real y hay que cambiar el arte.
 */
test('generar entrega las leyendas con el enlace previsto', () => {
  conSetup();
  const resultado = generar(solicitudValida());

  assert.ok(resultado.valido, JSON.stringify(resultado.errores));
  assert.ok(resultado.leyendas, 'la respuesta no trae leyendas');
  assert.strictEqual(resultado.leyendas.hay, true);
  assert.strictEqual(resultado.leyendas.enlaceConfirmado, false);
  assert.ok(resultado.leyendas.enlacePrevisto.indexOf('https://promos.rappi.com/colombia/') === 0,
    resultado.leyendas.enlacePrevisto);

  // Los cinco formatos. La push entra desde que Juan decidió que el enlace es
  // uno solo: antes se quedaba esperando un enlace corto que ya no va a existir.
  const formatos = resultado.leyendas.leyendas.map((l) => l.formato);
  assert.deepStrictEqual(formatos, ['texto_apoyo', 'letra_pequena', 'banner_corto', 'exterior', 'push_sms']);
  for (const leyenda of resultado.leyendas.leyendas) {
    assert.ok(leyenda.texto.indexOf(resultado.leyendas.enlacePrevisto) !== -1 || leyenda.formato === 'texto_apoyo',
      leyenda.formato + ' no lleva el enlace: ' + leyenda.texto);
    assert.strictEqual(/\{\{|\[\[/.test(leyenda.texto), false, leyenda.formato + ': ' + leyenda.texto);
  }
});

test('pegar un enlace distinto rehace las leyendas y lo dice', () => {
  conSetup();
  const generado = generar(solicitudValida());
  const previsto = generado.leyendas.enlacePrevisto;

  const publicado = 'https://promos.rappi.com/colombia/2026/9/20/otra-direccion';
  const respuesta = marcarPublicado(generado.id, publicado);

  assert.ok(respuesta.valido, JSON.stringify(respuesta.errores));
  assert.ok(respuesta.leyendas, 'al publicar no se rehicieron las leyendas');
  assert.strictEqual(respuesta.leyendas.enlaceConfirmado, true);
  assert.strictEqual(respuesta.leyendas.enlaceCambio, true);

  const letra = respuesta.leyendas.leyendas.filter((l) => l.formato === 'letra_pequena')[0];
  assert.ok(letra.texto.indexOf(publicado) !== -1, letra.texto);
  assert.strictEqual(letra.texto.indexOf(previsto), -1, 'quedó el enlace viejo: ' + letra.texto);
});

test('si el enlace publicado es el previsto, la leyenda no cambia', () => {
  conSetup();
  const generado = generar(solicitudValida());
  const respuesta = marcarPublicado(generado.id, generado.leyendas.enlacePrevisto);

  assert.strictEqual(respuesta.leyendas.enlaceCambio, false);
  assert.strictEqual(respuesta.leyendas.enlaceConfirmado, true);
  const antes = generado.leyendas.leyendas.map((l) => l.texto).join('|');
  const despues = respuesta.leyendas.leyendas.map((l) => l.texto).join('|');
  assert.strictEqual(antes, despues, 'la leyenda cambió sin que el enlace cambiara');
});

/**
 * Frontera 1: lo que sale del servidor tiene que cruzar google.script.run.
 *
 * Solo pasan numeros, textos, booleanos, nulos, listas y objetos hechos de eso.
 * Una fecha enterrada en cualquier parte de la respuesta se convierte en null y
 * la pantalla final se queda en blanco, sin ningun error en el registro.
 */
test('las leyendas cruzan al navegador sin nada que Apps Script convierta en null', () => {
  conSetup();
  const resultado = generar(solicitudValida());

  const revisar = (valor, camino) => {
    if (valor === null || valor === undefined) return;
    const tipo = typeof valor;
    if (tipo === 'string' || tipo === 'number' || tipo === 'boolean') return;
    if (Object.prototype.toString.call(valor) === '[object Array]') {
      valor.forEach((v, i) => revisar(v, camino + '[' + i + ']'));
      return;
    }
    assert.strictEqual(Object.prototype.toString.call(valor), '[object Object]',
      camino + ' es un ' + Object.prototype.toString.call(valor) + ', que no cruza a google.script.run');
    for (const llave of Object.keys(valor)) revisar(valor[llave], camino + '.' + llave);
  };

  revisar(resultado.leyendas, 'leyendas');
});

test('una solicitud sin datos legibles se puede publicar igual, sin leyendas', () => {
  // Las solicitudes viejas del Sheet no tienen por qué traer un datos_json que
  // se pueda leer. Marcarlas como publicadas no se puede caer por eso.
  const mundo = conSetup();
  const generado = generar(solicitudValida());

  const hoja = hojaPorNombre('Solicitudes');
  const encabezados = hoja.valores[0];
  const fila = hoja.valores.findIndex((f) => f[encabezados.indexOf('id')] === generado.id);
  hoja.valores[fila][encabezados.indexOf('datos_json')] = 'esto no es JSON';

  const respuesta = marcarPublicado(generado.id, 'https://promos.rappi.com/colombia/algo');
  assert.strictEqual(respuesta.valido, true, JSON.stringify(respuesta.errores));
  assert.strictEqual(respuesta.leyendas, null);
  assert.strictEqual(mundo.propiedades ? true : true, true);
});
