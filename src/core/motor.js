'use strict';

/**
 * Motor de documentos: convierte un modelo de modelos/ y los hechos del
 * formulario en el texto final del documento.
 *
 * Pasos del render (seccion 4.2 de la especificacion):
 *   1. Expandir [[INCLUIR:...]]
 *   2. Quitar los comentarios %%
 *   3. Calcular los valores derivados
 *   4. Expandir los bloques repetibles [[#TIENDAS]]
 *   5. Resolver los bloques opcionales [[?CAMPO]]
 *   6. Reemplazar los placeholders {{CAMPO}}
 *   7. Numerar las clausulas
 *
 * Determinismo (regla 2 de CLAUDE.md): si algo falta, el motor lo reporta y no
 * se genera el documento. Nunca completa ni inventa texto.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloTexto = require('./texto.js');
  var normalizarTexto = moduloTexto.normalizarTexto;
  var textoPlano = moduloTexto.textoPlano;

  var moduloDerivados = require('./derivados.js');
  var calcularDerivados = moduloDerivados.calcularDerivados;
  var valoresDeTienda = moduloDerivados.valoresDeTienda;
}

/** Marcas que nunca pueden quedar en el documento final. */
var MARCAS_SIN_RESOLVER = /\{\{|\}\}|\[\[|\]\]/;

/**
 * Red de seguridad sobre el texto final (seccion 4.3, punto 5).
 * Cada patron delata una frase rota por un valor vacio.
 */
var SENALES_DE_TEXTO_ROTO = [
  { nombre: 'un espacio antes de una coma', patron: / ,/ },
  { nombre: 'un espacio antes de un punto', patron: / \./ },
  { nombre: 'dos puntos seguidos', patron: /(^|[^.])\.\.(?!\.)/ },
  { nombre: 'un parentesis vacío', patron: /\(\s*\)/ },
  { nombre: 'dos espacios seguidos', patron: {} },
  { nombre: 'una coma seguida de un punto', patron: /, \./ },
];
// El patron de dos espacios se arma aparte para que no se pierda al leerlo.
SENALES_DE_TEXTO_ROTO[4].patron = /  /;

/** Paso 1: reemplaza cada [[INCLUIR:nombre]] por el bloque correspondiente. */
function expandirInclusiones(texto, bloques) {
  var faltantes = [];
  var resultado = normalizarTexto(texto).replace(/^\[\[INCLUIR:(\w+)\]\]$/gm, function (todo, nombre) {
    if (!Object.prototype.hasOwnProperty.call(bloques, nombre)) {
      faltantes.push(nombre);
      return todo;
    }
    return normalizarTexto(bloques[nombre]).replace(/\n+$/, '');
  });
  return { texto: resultado, faltantes: faltantes };
}

/** Paso 2: quita las lineas de comentario. */
function quitarComentarios(texto) {
  var lineas = texto.split('\n');
  var conservadas = [];
  for (var i = 0; i < lineas.length; i++) {
    if (lineas[i].indexOf('%%') !== 0) conservadas.push(lineas[i]);
  }
  return conservadas.join('\n');
}

/** Paso 4: repite el bloque de tiendas una vez por tienda. */
function expandirTiendas(texto, tiendas, pais) {
  return texto.replace(/^\[\[#TIENDAS\]\]\n([\s\S]*?)\n\[\[\/TIENDAS\]\]$/gm, function (todo, cuerpo) {
    var salida = [];
    for (var i = 0; i < tiendas.length; i++) {
      var valores = valoresDeTienda(tiendas[i], pais);
      salida.push(
        cuerpo.replace(/\{\{(TIENDA_\w+)\}\}/g, function (marca, llave) {
          return Object.prototype.hasOwnProperty.call(valores, llave) ? valores[llave] : marca;
        })
      );
    }
    return salida.join('\n');
  });
}

/** Paso 5: conserva el bloque opcional solo si el campo tiene valor. */
function resolverOpcionales(texto, valores) {
  return texto.replace(/\[\[\?(\w+)\]\]([\s\S]*?)\[\[\/\?\]\]/g, function (todo, llave, cuerpo) {
    return valores[llave] ? cuerpo : '';
  });
}

/** Paso 6: reemplaza los placeholders y anota los que quedaron vacios. */
function reemplazarPlaceholders(texto, valores) {
  var vacios = [];
  var resultado = texto.replace(/\{\{(\w+)\}\}/g, function (todo, llave) {
    var valor = valores[llave];
    if (!valor) {
      if (vacios.indexOf(llave) === -1) vacios.push(llave);
      return '';
    }
    return valor;
  });
  return { texto: resultado, vacios: vacios };
}

/** Paso 7: numera las clausulas y quita las lineas vacias. */
function numerarClausulas(texto) {
  var lineas = texto.split('\n');
  var salida = [];
  var numero = 0;

  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i];
    if (!linea.trim()) continue;

    if (linea.indexOf('§ ') === 0) {
      numero += 1;
      var cuerpo = linea.slice(2);
      var titulo;
      var resto;
      var corte = cuerpo.indexOf('. ');
      if (corte !== -1) {
        titulo = cuerpo.slice(0, corte);
        resto = cuerpo.slice(corte + 2);
      } else {
        titulo = cuerpo.replace(/\.+$/, '');
        resto = '';
      }
      linea = ('**' + numero + '. ' + titulo + '.** ' + resto).replace(/\s+$/, '');
    }
    salida.push(linea);
  }
  return salida.join('\n');
}

/** Devuelve los nombres de las senales de texto roto encontradas. */
function senalesDeTextoRoto(texto) {
  var plano = textoPlano(texto);
  var encontradas = [];
  for (var i = 0; i < SENALES_DE_TEXTO_ROTO.length; i++) {
    var senal = SENALES_DE_TEXTO_ROTO[i];
    if (senal.patron.test(plano)) encontradas.push(senal.nombre);
  }
  // Una vineta sin contenido tambien delata un valor vacio.
  if (/^•\s*$/m.test(texto)) encontradas.push('una viñeta vacía');
  return encontradas;
}

/**
 * Render completo.
 *
 * modelos: { modelos: {nombre: texto}, bloques: {nombre: texto} }
 * Devuelve { texto, errores, placeholdersVacios }.
 * Si errores tiene algo, el documento no se debe crear.
 */
function renderizar(nombreModelo, entrada, pais, modelos) {
  var errores = [];

  if (!Object.prototype.hasOwnProperty.call(modelos.modelos, nombreModelo)) {
    return { texto: '', errores: ['No existe el modelo "' + nombreModelo + '".'], placeholdersVacios: [] };
  }

  var inclusiones = expandirInclusiones(modelos.modelos[nombreModelo], modelos.bloques);
  for (var i = 0; i < inclusiones.faltantes.length; i++) {
    errores.push('El modelo incluye el bloque "' + inclusiones.faltantes[i] + '", que no existe.');
  }

  var texto = quitarComentarios(inclusiones.texto);
  var valores = calcularDerivados(entrada, pais);

  texto = expandirTiendas(texto, entrada.tiendas || [], pais);
  texto = resolverOpcionales(texto, valores);

  var reemplazo = reemplazarPlaceholders(texto, valores);
  texto = numerarClausulas(reemplazo.texto);

  for (var j = 0; j < reemplazo.vacios.length; j++) {
    errores.push('Falta un dato: el documento necesita "' + reemplazo.vacios[j] + '" y quedó vacío.');
  }

  if (MARCAS_SIN_RESOLVER.test(texto)) {
    errores.push('Quedaron marcas sin resolver en el documento.');
  }

  var senales = senalesDeTextoRoto(texto);
  for (var k = 0; k < senales.length; k++) {
    errores.push('El texto quedó roto: hay ' + senales[k] + '.');
  }

  return { texto: texto, errores: errores, placeholdersVacios: reemplazo.vacios };
}

/** Marca que envuelve un hueco en la vista previa. Nunca aparece en el documento. */
var MARCA_HUECO = String.fromCharCode(1);

/**
 * Render para la vista previa en vivo.
 *
 * Igual que renderizar(), pero en vez de dejar vacio un dato que falta pone un
 * hueco marcado. La interfaz lo convierte en un espacio en blanco gris que dice
 * que pregunta lo llena.
 *
 * Esto NUNCA genera el documento: generar() usa renderizar(), que bloquea si
 * falta algo. Los huecos viven solo en la pantalla.
 */
function renderizarVistaPrevia(nombreModelo, entrada, pais, modelos) {
  if (!Object.prototype.hasOwnProperty.call(modelos.modelos, nombreModelo)) {
    return { texto: '', huecos: [] };
  }

  var inclusiones = expandirInclusiones(modelos.modelos[nombreModelo], modelos.bloques);
  var texto = quitarComentarios(inclusiones.texto);
  var valores = calcularDerivados(entrada, pais);
  var huecos = [];

  // Un bloque repetible sin tiendas deja la lista vacia: se anuncia el hueco.
  var tiendas = entrada.tiendas || [];
  if (tiendas.length === 0) {
    texto = texto.replace(/^\[\[#TIENDAS\]\]\n[\s\S]*?\n\[\[\/TIENDAS\]\]$/gm, function () {
      huecos.push('TIENDA_MARCA');
      return '\u2022 {{TIENDA_MARCA}}';
    });
  } else {
    texto = expandirTiendas(texto, tiendas, pais);
  }

  texto = resolverOpcionales(texto, valores);

  texto = texto.replace(/\{\{(\w+)\}\}/g, function (todo, llave) {
    var valor = valores[llave];
    if (valor) return valor;
    if (huecos.indexOf(llave) === -1) huecos.push(llave);
    return MARCA_HUECO + llave + MARCA_HUECO;
  });

  return { texto: numerarClausulas(texto), huecos: huecos };
}

/**
 * Parte una linea de la vista previa en tramos de texto y de hueco.
 * Devuelve [{ tipo: 'texto' | 'hueco', valor }].
 */
function tramosDeVistaPrevia(linea) {
  var partes = String(linea).split(MARCA_HUECO);
  var tramos = [];
  for (var i = 0; i < partes.length; i++) {
    if (!partes[i]) continue;
    tramos.push({ tipo: i % 2 === 1 ? 'hueco' : 'texto', valor: partes[i] });
  }
  return tramos;
}
if (typeof module !== 'undefined') {
  module.exports = {
    renderizar: renderizar,
    renderizarVistaPrevia: renderizarVistaPrevia,
    tramosDeVistaPrevia: tramosDeVistaPrevia,
    MARCA_HUECO: MARCA_HUECO,
    expandirInclusiones: expandirInclusiones,
    quitarComentarios: quitarComentarios,
    expandirTiendas: expandirTiendas,
    resolverOpcionales: resolverOpcionales,
    reemplazarPlaceholders: reemplazarPlaceholders,
    numerarClausulas: numerarClausulas,
    senalesDeTextoRoto: senalesDeTextoRoto,
  };
}
