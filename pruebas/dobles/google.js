'use strict';

/**
 * Dobles de las APIs de Google Apps Script.
 *
 * No pretenden ser fieles a Google en todo: implementan exactamente lo que usa
 * src/server/, con el mismo comportamiento observable. Así el servidor se
 * prueba entero en Node y mañana solo queda por verificar a mano lo que de
 * verdad necesita la cuenta de Juan.
 *
 * Todo lo que escriben queda accesible para inspeccionarlo desde las pruebas.
 */

/*
 * El mundo del doble que esta instalado ahora mismo.
 *
 * Vive aqui arriba, y no dentro de instalarDobles, porque los prototipos de
 * Hoja y de Documento se definen a nivel de modulo y tambien tienen que poder
 * reventar a pedido.
 */
var mundoActivo = null;

/**
 * Revienta si la prueba pidio que este servicio fallara.
 *
 * `donde` sirve para que una prueba pueda tumbar una sola pestana: con
 * mundo.fallar.hojaSolo = 'Solicitudes', el Registro sigue funcionando, que es
 * lo que hace falta para comprobar que el fallo queda anotado.
 */
function reventarSiToca(cual, donde) {
  if (!mundoActivo || !mundoActivo.fallar || !mundoActivo.fallar[cual]) return;
  if (cual === 'hoja' && mundoActivo.fallar.hojaSolo && mundoActivo.fallar.hojaSolo !== donde) return;
  if (cual === 'escritura' && mundoActivo.fallar.escrituraSolo && mundoActivo.fallar.escrituraSolo !== donde) return;
  throw new Error(mundoActivo.fallar[cual]);
}

function iterador(elementos) {
  var indice = 0;
  return {
    hasNext: function () { return indice < elementos.length; },
    next: function () { return elementos[indice++]; },
  };
}

// --- Sheets ----------------------------------------------------------------

function Rango(hoja, fila, columna, filas, columnas) {
  this.hoja = hoja;
  this.fila = fila;
  this.columna = columna;
  this.filas = filas;
  this.columnas = columnas;
}

Rango.prototype.getValues = function () {
  var salida = [];
  for (var f = 0; f < this.filas; f++) {
    var fila = [];
    for (var c = 0; c < this.columnas; c++) {
      var origen = this.hoja.valores[this.fila - 1 + f];
      fila.push(origen && origen[this.columna - 1 + c] !== undefined ? origen[this.columna - 1 + c] : '');
    }
    salida.push(fila);
  }
  return salida;
};

Rango.prototype.setValues = function (valores) {
  reventarSiToca('escritura', this.hoja && this.hoja.nombre);
  for (var f = 0; f < valores.length; f++) {
    var destino = this.fila - 1 + f;
    while (this.hoja.valores.length <= destino) this.hoja.valores.push([]);
    for (var c = 0; c < valores[f].length; c++) {
      this.hoja.valores[destino][this.columna - 1 + c] = valores[f][c];
    }
  }
  return this;
};

Rango.prototype.setValue = function (valor) {
  return this.setValues([[valor]]);
};

function Hoja(nombre) {
  this.nombre = nombre;
  this.valores = [];
  this.filasCongeladas = 0;
}

Hoja.prototype.getName = function () { return this.nombre; };
Hoja.prototype.getLastRow = function () { return this.valores.length; };
Hoja.prototype.getLastColumn = function () {
  var ancho = 0;
  for (var i = 0; i < this.valores.length; i++) ancho = Math.max(ancho, this.valores[i].length);
  return ancho;
};
Hoja.prototype.getDataRange = function () {
  return new Rango(this, 1, 1, Math.max(this.getLastRow(), 1), Math.max(this.getLastColumn(), 1));
};
Hoja.prototype.getRange = function (fila, columna, filas, columnas) {
  return new Rango(this, fila, columna, filas || 1, columnas || 1);
};
Hoja.prototype.appendRow = function (fila) {
  reventarSiToca('hoja', this.nombre);
  this.valores.push(fila.slice());
  return this;
};
Hoja.prototype.setFrozenRows = function (n) { this.filasCongeladas = n; return this; };

function Libro(id, nombre) {
  this.id = id;
  this.nombre = nombre;
  this.hojas = [];
}

Libro.prototype.getId = function () { return this.id; };
Libro.prototype.getName = function () { return this.nombre; };
Libro.prototype.getUrl = function () { return 'https://docs.google.com/spreadsheets/d/' + this.id + '/edit'; };
Libro.prototype.getSheets = function () { return this.hojas.slice(); };
Libro.prototype.getSheetByName = function (nombre) {
  for (var i = 0; i < this.hojas.length; i++) {
    if (this.hojas[i].nombre === nombre) return this.hojas[i];
  }
  return null;
};
Libro.prototype.insertSheet = function (nombre) {
  var hoja = new Hoja(nombre);
  this.hojas.push(hoja);
  return hoja;
};
Libro.prototype.deleteSheet = function (hoja) {
  this.hojas = this.hojas.filter(function (h) { return h !== hoja; });
};

// --- Drive -----------------------------------------------------------------

function Archivo(id, nombre, tipo) {
  this.id = id;
  this.nombre = nombre;
  this.tipo = tipo;
  this.carpeta = null;
  this.lectores = [];
}
Archivo.prototype.getId = function () { return this.id; };
Archivo.prototype.getName = function () { return this.nombre; };
Archivo.prototype.moveTo = function (carpeta) { this.carpeta = carpeta; return this; };
Archivo.prototype.setTrashed = function (valor) { this.enPapelera = !!valor; return this; };
Archivo.prototype.isTrashed = function () { return !!this.enPapelera; };
Archivo.prototype.addViewer = function (correo) {
  if (this.lectores.indexOf(correo) === -1) this.lectores.push(correo);
  return this;
};

function Carpeta(id, nombre) {
  this.id = id;
  this.nombre = nombre;
  this.subcarpetas = [];
}
Carpeta.prototype.getId = function () { return this.id; };
Carpeta.prototype.getName = function () { return this.nombre; };
Carpeta.prototype.getUrl = function () { return 'https://drive.google.com/drive/folders/' + this.id; };
Carpeta.prototype.getFoldersByName = function (nombre) {
  return iterador(this.subcarpetas.filter(function (c) { return c.nombre === nombre; }));
};
Carpeta.prototype.createFolder = function (nombre) {
  var carpeta = new Carpeta('carpeta-' + nombre.replace(/\W+/g, '-').toLowerCase(), nombre);
  this.subcarpetas.push(carpeta);
  return carpeta;
};

// --- Docs ------------------------------------------------------------------

function Texto() {
  this.texto = '';
  this.negritas = [];
}
Texto.prototype.getText = function () { return this.texto; };
Texto.prototype.appendText = function (t) { this.texto += t; return this; };
Texto.prototype.setBold = function (a, b, c) {
  if (arguments.length === 1) {
    this.negritas.push({ desde: 0, hasta: this.texto.length - 1, negrita: !!a });
  } else {
    this.negritas.push({ desde: a, hasta: b, negrita: !!c });
  }
  return this;
};

function Parrafo(tipo) {
  this.tipo = tipo;
  this.texto = new Texto();
  this.alineacion = null;
  this.fuente = null;
  this.tamano = null;
  this.interlineado = null;
  this.vineta = null;
}
Parrafo.prototype.editAsText = function () { return this.texto; };
Parrafo.prototype.getText = function () { return this.texto.getText(); };
Parrafo.prototype.setAlignment = function (a) { this.alineacion = a; return this; };
Parrafo.prototype.setFontFamily = function (f) { this.fuente = f; return this; };
Parrafo.prototype.setFontSize = function (t) { this.tamano = t; return this; };
Parrafo.prototype.setLineSpacing = function (i) { this.interlineado = i; return this; };
Parrafo.prototype.setGlyphType = function (g) { this.vineta = g; return this; };
Parrafo.prototype.getType = function () { return this.tipo; };
Parrafo.prototype.asParagraph = function () { return this; };

function Cuerpo() { this.hijos = []; }
Cuerpo.prototype.clear = function () { this.hijos = []; return this; };
Cuerpo.prototype.appendParagraph = function () {
  var p = new Parrafo('PARAGRAPH');
  this.hijos.push(p);
  return p;
};
Cuerpo.prototype.appendListItem = function () {
  var p = new Parrafo('LIST_ITEM');
  this.hijos.push(p);
  return p;
};
Cuerpo.prototype.getNumChildren = function () { return this.hijos.length; };
Cuerpo.prototype.getChild = function (i) { return this.hijos[i]; };
Cuerpo.prototype.removeChild = function (hijo) {
  this.hijos = this.hijos.filter(function (h) { return h !== hijo; });
};

function Documento(id, titulo) {
  this.id = id;
  this.titulo = titulo;
  this.cuerpo = new Cuerpo();
  this.cerrado = false;
}
Documento.prototype.getId = function () { return this.id; };
Documento.prototype.getBody = function () { return this.cuerpo; };
Documento.prototype.getUrl = function () { return 'https://docs.google.com/document/d/' + this.id + '/edit'; };
Documento.prototype.saveAndClose = function () { this.cerrado = true; };

// --- Instalacion -----------------------------------------------------------

var GLOBALES = [
  'PropertiesService', 'Session', 'Utilities', 'SpreadsheetApp', 'DriveApp',
  'DocumentApp', 'MailApp', 'LockService', 'ScriptApp', 'Logger',
];

/**
 * Instala los dobles en globalThis y devuelve el mundo falso para inspeccionarlo.
 * opciones: { correo, ahora (ISO), propiedades }
 */
function instalarDobles(opciones) {
  var config = opciones || {};
  var ahora = config.ahora || '2026-09-16T10:30:00Z';

  var mundo = {
    propiedades: Object.assign({}, config.propiedades || {}),
    libros: {},
    carpetas: {},
    archivos: {},
    documentos: {},
    correos: [],
    registroDeBloqueos: 0,
    correo: config.correo || 'juan.gallego@rappi.com',
    ahora: ahora,
    /*
     * Fallos a pedido, para probar lo que pasa cuando Google no responde.
     *
     * En produccion esto pasa de verdad: el bloqueo se agota cuando dos
     * comerciales generan a la vez, Drive corta por cuota, y el Sheet puede
     * tardar mas de lo que Apps Script espera. Sin poder reproducirlo, lo unico
     * que se probaba era el camino feliz.
     *
     * Se pone con mundo.fallar.bloqueo = 'Lock timeout: ...' y se quita
     * volviendolo a null.
     */
    fallar: {
      bloqueo: null, documento: null, correo: null,
      hoja: null, hojaSolo: null,
      escritura: null, escrituraSolo: null,
    },
  };

  mundoActivo = mundo;

  var contador = 0;
  function nuevoId(prefijo) {
    contador += 1;
    return prefijo + '-' + contador;
  }

  globalThis.PropertiesService = {
    getScriptProperties: function () {
      return {
        getProperty: function (n) {
          return Object.prototype.hasOwnProperty.call(mundo.propiedades, n) ? mundo.propiedades[n] : null;
        },
        setProperty: function (n, v) { mundo.propiedades[n] = v; },
        deleteProperty: function (n) { delete mundo.propiedades[n]; },
      };
    },
  };

  globalThis.Session = {
    getActiveUser: function () { return { getEmail: function () { return mundo.correo; } }; },
    getEffectiveUser: function () { return { getEmail: function () { return mundo.correo; } }; },
    getScriptTimeZone: function () { return 'America/Bogota'; },
  };

  globalThis.Utilities = {
    formatDate: function (fecha, zona, formato) {
      var iso = new Date(mundo.ahora).toISOString();
      var dia = iso.slice(0, 10);
      var hora = iso.slice(11, 19);
      if (formato === 'yyyy-MM-dd') return dia;
      if (formato === 'HH:mm') return hora.slice(0, 5);
      return dia + ' ' + hora;
    },
    sleep: function () {},
  };

  globalThis.SpreadsheetApp = {
    create: function (nombre) {
      var libro = new Libro(nuevoId('sheet'), nombre);
      libro.insertSheet('Hoja 1');
      mundo.libros[libro.id] = libro;
      return libro;
    },
    openById: function (id) {
      if (!mundo.libros[id]) throw new Error('No existe el Sheet ' + id);
      return mundo.libros[id];
    },
  };

  globalThis.DriveApp = {
    createFolder: function (nombre) {
      var carpeta = new Carpeta(nuevoId('carpeta'), nombre);
      mundo.carpetas[carpeta.id] = carpeta;
      return carpeta;
    },
    getFolderById: function (id) {
      if (!mundo.carpetas[id]) throw new Error('No existe la carpeta ' + id);
      return mundo.carpetas[id];
    },
    getFoldersByName: function (nombre) {
      var encontradas = [];
      for (var id in mundo.carpetas) {
        if (mundo.carpetas[id].nombre === nombre) encontradas.push(mundo.carpetas[id]);
      }
      return iterador(encontradas);
    },
    getFileById: function (id) {
      if (!mundo.archivos[id]) mundo.archivos[id] = new Archivo(id, 'archivo', 'documento');
      return mundo.archivos[id];
    },
    getRootFolder: function () { return new Carpeta('raiz', 'Mi unidad'); },
  };

  globalThis.DocumentApp = {
    create: function (titulo) {
      reventarSiToca('documento');
      var documento = new Documento(nuevoId('doc'), titulo);
      mundo.documentos[documento.id] = documento;
      mundo.archivos[documento.id] = new Archivo(documento.id, titulo, 'documento');
      return documento;
    },
    GlyphType: { BULLET: 'BULLET' },
    HorizontalAlignment: { CENTER: 'CENTER', JUSTIFY: 'JUSTIFY', LEFT: 'LEFT' },
    ElementType: { PARAGRAPH: 'PARAGRAPH', LIST_ITEM: 'LIST_ITEM' },
  };

  globalThis.MailApp = {
    sendEmail: function (opciones) {
      reventarSiToca('correo');
      mundo.correos.push(opciones);
    },
  };

  globalThis.LockService = {
    getScriptLock: function () {
      return {
        waitLock: function () {
          reventarSiToca('bloqueo');
          mundo.registroDeBloqueos += 1;
        },
        releaseLock: function () {},
      };
    },
  };

  globalThis.ScriptApp = {
    getService: function () { return { getUrl: function () { return 'https://script.google.com/a/macros/rappi.com/s/demo/exec'; } }; },
  };

  globalThis.Logger = { log: function () {} };

  // Carpetas creadas desde DriveApp también viven en el índice del mundo, para
  // que getFolderById las encuentre después.
  var crearOriginal = Carpeta.prototype.createFolder;
  Carpeta.prototype.createFolder = function (nombre) {
    var carpeta = crearOriginal.call(this, nombre);
    mundo.carpetas[carpeta.id] = carpeta;
    return carpeta;
  };

  return mundo;
}

function desinstalarDobles() {
  for (var i = 0; i < GLOBALES.length; i++) {
    delete globalThis[GLOBALES[i]];
  }
  // Sin esto, un fallo pedido por una prueba se quedaría puesto para la siguiente.
  mundoActivo = null;
}

module.exports = {
  instalarDobles: instalarDobles,
  desinstalarDobles: desinstalarDobles,
  Hoja: Hoja,
  Libro: Libro,
  Carpeta: Carpeta,
  Documento: Documento,
};
