'use strict';

/**
 * Instalacion. Corre las veces que haga falta sin romper nada.
 *
 * Crea la base y la carpeta si no existen, agrega las pestanas que falten,
 * carga la semilla de paises solo si la pestana esta vacia y deja a los
 * administradores. NUNCA borra ni sobrescribe filas que ya existan.
 */

function setup() {
  var pasos = [];

  var base = asegurarBase(pasos);
  guardarPropiedad(PROPIEDADES.SHEET_ID, base.getId());

  var raiz = asegurarCarpetaRaiz(pasos);
  guardarPropiedad(PROPIEDADES.CARPETA_RAIZ_ID, raiz.getId());

  asegurarPestanas(base, pasos);
  sembrarPaises(pasos);
  asegurarCarpetasPorPais(raiz, pasos);
  asegurarAdministradores(pasos);

  registrar('setup', pasos.join(' | '));

  var resumen = {
    sheetId: base.getId(),
    sheetUrl: base.getUrl(),
    carpetaId: raiz.getId(),
    carpetaUrl: raiz.getUrl(),
    pasos: pasos,
  };
  Logger.log(JSON.stringify(resumen, null, 2));
  return resumen;
}

function asegurarBase(pasos) {
  var id = leerPropiedad(PROPIEDADES.SHEET_ID);
  if (id) {
    try {
      var existente = SpreadsheetApp.openById(id);
      pasos.push('base ya existía');
      return existente;
    } catch (error) {
      pasos.push('el SHEET_ID guardado no abría, se crea una base nueva');
    }
  }
  var base = SpreadsheetApp.create(NOMBRE_DE_LA_BASE);
  pasos.push('base creada');
  return base;
}

function asegurarCarpetaRaiz(pasos) {
  var id = leerPropiedad(PROPIEDADES.CARPETA_RAIZ_ID);
  if (id) {
    try {
      var existente = DriveApp.getFolderById(id);
      pasos.push('carpeta ya existía');
      return existente;
    } catch (error) {
      pasos.push('el CARPETA_RAIZ_ID guardado no abría, se crea una carpeta nueva');
    }
  }

  var encontradas = DriveApp.getFoldersByName(NOMBRE_DE_LA_CARPETA);
  if (encontradas.hasNext()) {
    pasos.push('carpeta encontrada por nombre');
    return encontradas.next();
  }

  var carpeta = DriveApp.createFolder(NOMBRE_DE_LA_CARPETA);
  pasos.push('carpeta creada');
  return carpeta;
}

/** Crea las pestanas que falten y escribe los encabezados si no estan. */
function asegurarPestanas(base, pasos) {
  for (var nombre in PESTANAS) {
    if (!Object.prototype.hasOwnProperty.call(PESTANAS, nombre)) continue;

    var hoja = base.getSheetByName(nombre);
    if (!hoja) {
      hoja = base.insertSheet(nombre);
      pasos.push('pestaña ' + nombre + ' creada');
    }

    var encabezados = encabezadosDe(nombre);
    if (hoja.getLastRow() === 0) {
      hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
      hoja.setFrozenRows(1);
      pasos.push('encabezados de ' + nombre + ' escritos');
      continue;
    }

    // La pestana ya existia: se agregan al final las columnas nuevas y no se
    // toca ninguna de las que ya estan. Mover una columna con datos adentro
    // desalinearia todo el historico.
    var actuales = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    var faltantes = [];
    for (var c = 0; c < encabezados.length; c++) {
      if (actuales.indexOf(encabezados[c]) === -1) faltantes.push(encabezados[c]);
    }
    if (faltantes.length > 0) {
      hoja.getRange(1, actuales.length + 1, 1, faltantes.length).setValues([faltantes]);
      pasos.push(faltantes.length + ' columnas nuevas en ' + nombre + ': ' + faltantes.join(', '));
    }
  }

  // La pestana que crea Google por defecto estorba, pero solo se quita si esta vacia.
  var porDefecto = base.getSheetByName('Hoja 1') || base.getSheetByName('Sheet1');
  if (porDefecto && base.getSheets().length > 1 && porDefecto.getLastRow() === 0) {
    base.deleteSheet(porDefecto);
    pasos.push('pestaña por defecto eliminada');
  }
}

/**
 * Carga los paises, y si la pestana ya tenia datos la pone al dia.
 *
 * Antes se saltaba la pestana entera cuando ya tenia filas, y eso dejo un
 * agujero real: Juan corrio setup() cuando Rappi Travel no existia, despues se
 * agregaron los dos tipos de Travel y las nueve columnas travel_* a la semilla,
 * y la fila de Colombia del Sheet se quedo como estaba. En la app, elegir Rappi
 * Travel en Colombia decia que Travel no estaba habilitado, porque para la
 * herramienta no lo estaba.
 *
 * Poner al dia no es sobrescribir. La pestana Paises es de Legal: Juan puede
 * cambiar ahi una razon social o bloquear un pais sin desplegar nada, y eso
 * manda sobre la semilla. Asi que solo pasan dos cosas:
 *
 *   - modelos: se agregan los que la semilla tenga y la fila no. Nunca se quita
 *     ninguno, porque quitarlo pudo ser a proposito.
 *   - las demas columnas: se rellenan solo si la celda esta vacia.
 */
function sembrarPaises(pasos) {
  var hoja = hojaPorNombre('Paises');
  if (hoja.getLastRow() > 1) {
    ponerPaisesAlDia(hoja, pasos);
    return;
  }

  var encabezados = PESTANAS.Paises;
  var filas = [];
  for (var i = 0; i < PAISES_SEMILLA.length; i++) {
    filas.push(objetoComoFila(paisComoFila(PAISES_SEMILLA[i]), encabezados));
  }
  if (filas.length > 0) {
    hoja.getRange(2, 1, filas.length, encabezados.length).setValues(filas);
    pasos.push(filas.length + ' países cargados');
  }
}

/** Los modelos de la fila, mas los de la semilla que falten, en ese orden. */
function modelosUnidos(deLaFila, deLaSemilla) {
  var unidos = comoLista(deLaFila).slice();
  var semilla = comoLista(deLaSemilla);
  for (var i = 0; i < semilla.length; i++) {
    if (unidos.indexOf(semilla[i]) === -1) unidos.push(semilla[i]);
  }
  return unidos;
}

/**
 * Las columnas cuya diferencia se avisa.
 *
 * Son las que deciden si un pais aparece en la lista y que puede generar. Una
 * diferencia en el domicilio legal no vale la pena nombrarla; una en el estado
 * es la razon por la que un pais no sale.
 */
var COLUMNAS_QUE_SE_AVISAN = ['estado', 'idioma'];

function celdaVacia(valor) {
  return !String(valor === null || valor === undefined ? '' : valor).trim();
}

/**
 * Completa las filas que ya existen y agrega los paises nuevos.
 *
 * Lo que la hoja ya tiene escrito manda, siempre. Pero callarse las diferencias
 * confunde: Juan puso Brasil en piloto en la semilla, corrio setup, y Brasil
 * siguio sin aparecer porque la hoja decia "bloqueado" desde el primer dia.
 * Por eso el resumen nombra lo que encontro distinto y no toco, con su valor de
 * un lado y del otro.
 */
function ponerPaisesAlDia(hoja, pasos) {
  // Primero las columnas: sin encabezado no hay donde escribir el dato.
  encabezadosDeLaHoja(hoja, 'Paises');

  var filas = objetosDe('Paises');
  var completados = 0;
  var agregados = 0;
  var diferencias = [];

  for (var i = 0; i < PAISES_SEMILLA.length; i++) {
    var semilla = paisComoFila(PAISES_SEMILLA[i]);
    var codigo = String(semilla.codigo || '').trim().toUpperCase();

    var fila = null;
    for (var f = 0; f < filas.length; f++) {
      if (String(filas[f].codigo || '').trim().toUpperCase() === codigo) { fila = filas[f]; break; }
    }

    if (!fila) {
      agregarFila('Paises', semilla);
      agregados += 1;
      continue;
    }

    var cambios = {};
    for (var llave in semilla) {
      if (!Object.prototype.hasOwnProperty.call(semilla, llave)) continue;

      if (llave === 'modelos') {
        var unidos = modelosUnidos(fila.modelos, semilla.modelos);
        if (unidos.length !== comoLista(fila.modelos).length) cambios.modelos = unidos.join(', ');
        continue;
      }
      if (celdaVacia(fila[llave]) && !celdaVacia(semilla[llave])) {
        cambios[llave] = semilla[llave];
        continue;
      }

      // La hoja manda, pero se anota lo que quedo distinto para que nadie crea
      // que setup lo iba a cambiar. Solo las columnas que de verdad importan
      // para que un pais aparezca y genere.
      if (COLUMNAS_QUE_SE_AVISAN.indexOf(llave) !== -1 &&
          String(fila[llave]).trim() !== String(semilla[llave]).trim()) {
        diferencias.push(codigo + '.' + llave + ': la hoja dice "' + String(fila[llave]).trim() +
          '" y la semilla dice "' + String(semilla[llave]).trim() + '"');
      }
    }

    var hayCambios = false;
    for (var c in cambios) {
      if (Object.prototype.hasOwnProperty.call(cambios, c)) hayCambios = true;
    }
    if (hayCambios) {
      actualizarFila('Paises', fila._fila, cambios);
      completados += 1;
    }
  }

  if (diferencias.length > 0) {
    pasos.push('sin tocar, porque la hoja manda: ' + diferencias.join(' | ') +
      '. Si quieres cambiarlo, hazlo en la pestaña Paises o en la pantalla de Administración');
  }
  if (agregados > 0) pasos.push(agregados + ' países nuevos agregados');
  pasos.push(completados === 0
    ? 'Paises ya estaba al día'
    : completados + (completados === 1 ? ' país completado' : ' países completados') + ' con lo que faltaba de la semilla');
}

function asegurarCarpetasPorPais(raiz, pasos) {
  var creadas = 0;
  for (var i = 0; i < PAISES_SEMILLA.length; i++) {
    var pais = PAISES_SEMILLA[i];
    var nombre = pais.codigo + ' · ' + pais.nombre;
    if (!raiz.getFoldersByName(nombre).hasNext()) {
      raiz.createFolder(nombre);
      creadas += 1;
    }
  }
  pasos.push(creadas === 0 ? 'carpetas por país ya existían' : creadas + ' carpetas por país creadas');
}

/** Deja como admin a quien despliega y a los correos de CORREOS_ADMIN. */
function asegurarAdministradores(pasos) {
  var correos = correosAdministradores();
  if (correos.length === 0) {
    pasos.push('sin administradores que agregar');
    return;
  }

  var equipo = leerEquipo();
  var agregados = 0;

  for (var i = 0; i < correos.length; i++) {
    if (miembroPorCorreo(equipo, correos[i])) continue;
    agregarFila('Equipo', {
      email: correos[i],
      nombre: '',
      rol: 'admin',
      pais: '',
      activo: 'sí',
    });
    agregados += 1;
  }
  pasos.push(agregados === 0 ? 'administradores ya estaban' : agregados + ' administradores agregados');
}

if (typeof module !== 'undefined') {
  module.exports = { setup: setup };
}
