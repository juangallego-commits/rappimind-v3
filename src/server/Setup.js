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

/** Carga los paises solo si la pestana esta vacia. Nunca pisa lo que ya hay. */
function sembrarPaises(pasos) {
  var hoja = hojaPorNombre('Paises');
  if (hoja.getLastRow() > 1) {
    pasos.push('Paises ya tenía datos, no se tocó');
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
