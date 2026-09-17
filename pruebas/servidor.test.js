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
  // mandarlo igual, el servidor tiene que rechazarlo.
  const resultado = generar(solicitudValida({ pais: 'MX' }));
  assert.ok(!resultado.valido);
  assert.strictEqual(resultado.errores[0].campo, 'pais');
});

test('a alguien del equipo de pruebas sí se le permite un país en piloto', () => {
  const mundo = conSetup();
  adminGuardarMiembro({ email: 'pruebas@rappi.com', rol: 'pruebas' });
  mundo.correo = 'pruebas@rappi.com';

  const resultado = generar(solicitudValida({
    pais: 'MX', organizadorId: 'PRU200101AB5', compraMinima: null,
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
  assert.strictEqual(paisPorCodigo(leerPaises(), 'MX').estado, 'piloto');

  assert.ok(adminGuardarEstadoDePais('MX', 'activo').valido);
  assert.strictEqual(paisPorCodigo(leerPaises(), 'MX').estado, 'activo');

  const malo = adminGuardarEstadoDePais('MX', 'inventado');
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
