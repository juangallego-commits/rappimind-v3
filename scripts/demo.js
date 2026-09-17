'use strict';

/**
 * Genera demo/index.html: UN solo archivo que se abre con doble clic.
 *
 * Lleva dentro el motor real de src/core, la interfaz completa, los modelos y
 * los paises, mas un servidor simulado en memoria. No necesita internet salvo
 * para las tipografias, y si no las carga se ve igual con las del sistema.
 *
 * Uso: npm run demo
 */

const path = require('path');
const {
  rutaDesdeRaiz, leerTexto, leerJson, escribirTexto, listarArchivos, asegurarCarpeta,
} = require('./lib/archivos');
const { construir, DIST } = require('./build');

/** El servidor simulado: las mismas funciones que Api.js, en memoria. */
const SERVIDOR_SIMULADO = `
/*
 * Servidor simulado de la demostración.
 *
 * Implementa las mismas funciones que src/server/Api.js, pero en memoria y sin
 * Google. Usa el motor real, así que el texto que sale aquí es el mismo que
 * saldría en producción.
 */
(function () {
  var solicitudes = [];
  var consecutivo = 0;

  var equipo = [{ email: 'demostracion@rappi.com', nombre: 'Demostración', rol: 'admin', pais: 'CO', activo: true }];
  var paises = PAISES_SEMILLA.map(paisDesdeFila);

  function hoy() {
    var ahora = new Date();
    var mes = String(ahora.getMonth() + 1);
    var dia = String(ahora.getDate());
    return ahora.getFullYear() + '-' + (mes.length < 2 ? '0' + mes : mes) + '-' + (dia.length < 2 ? '0' + dia : dia);
  }

  function catalogo() {
    var lista = [];
    for (var id in ESQUEMAS) {
      if (!Object.prototype.hasOwnProperty.call(ESQUEMAS, id)) continue;
      lista.push({
        id: ESQUEMAS[id].id, nombre: ESQUEMAS[id].nombre,
        descripcion: ESQUEMAS[id].descripcion, modelo: ESQUEMAS[id].modelo,
        filtroDeEntrada: ESQUEMAS[id].filtroDeEntrada,
        esDeTravel: !!ESQUEMAS[id].esDeTravel,
      });
    }
    return lista;
  }

  window.RM = window.RM || {};
  window.RM.servidorSimulado = {
    estadoInicial: function () {
      return {
        correo: 'demostracion@rappi.com',
        // En la demostración se entra como administrador para que se pueda ver
        // también esa pantalla. No hay nada que administrar de verdad.
        rol: 'admin',
        demostracion: true,
        paises: paisesDisponibles(paises, true),
        tipos: catalogo(),
        secciones: SECCIONES,
        versionesDeModelo: MODELOS.versiones,
        urlFormularioLegal: 'https://forms.gle/ejemplo-de-la-demostracion',
        urlCanalAyuda: 'https://rappi.slack.com/ejemplo-de-la-demostracion',
        hoy: hoy(),
      };
    },

    previsualizar: function (entrada) {
      entrada = sinRastroDeAmpliacion(entrada || {});
      var pais = paisPorCodigo(paises, entrada.pais);
      return generarTexto(entrada, pais, MODELOS, { fechaReferencia: hoy(), usuarioEnEquipo: true });
    },

    generar: function (entrada) {
      entrada = sinRastroDeAmpliacion(entrada || {});
      var pais = paisPorCodigo(paises, entrada.pais);
      var resultado = generarTexto(entrada, pais, MODELOS, { fechaReferencia: hoy(), usuarioEnEquipo: true });
      if (!resultado.valido) return { valido: false, errores: resultado.errores };

      consecutivo += 1;
      var id = identificadorDeSolicitud(hoy(), consecutivo);

      var usados = [];
      for (var s = 0; s < solicitudes.length; s++) usados.push(solicitudes[s].nombre_campana);
      var esquema = esquemaDe(entrada.tipo);
      // Con el pais, como en Api.js: sin el, el titulo para Squarespace de una
      // campana de Brasil decia "1 oct 2026" y el documento "1 OUT 2026".
      entrada.sufijoNombre = sufijoLibreDeNombre(nombreDeCampana(entrada, esquema, pais), usados);
      var nombreCampana = nombreDeCampana(entrada, esquema, pais);
      solicitudes.push({
        id: id, fecha: hoy() + ' 10:00:00', email: 'demostracion@rappi.com',
        pais: pais.codigo, tipo: entrada.tipo,
        version_modelo: MODELOS.versiones[esquemaDe(entrada.tipo).modelo] || '',
        nombre_campana: nombreCampana, direccion_sugerida: direccionDeCampana(nombreCampana),
        tienda: tieneCampo(esquema, 'tienda') ? (entrada.tienda || '') : '',
        organizador: entrada.organizadorRazonSocial || '', id_organizador: entrada.organizadorId || '',
        fecha_inicio: entrada.fechaInicio || '', fecha_fin: fechaFinDeLaCampana(entrada, esquema) || '',
        link_doc: '', estado: 'generado', link_publicado: '', fecha_publicacion: '',
        datos_json: JSON.stringify(entrada), _fila: solicitudes.length + 2,
      });

      return {
        valido: true, demostracion: true, texto: resultado.texto, id: id,
        nombreCampana: nombreCampana, direccionSugerida: direccionDeCampana(nombreCampana),
        pais: pais.codigo,
      };
    },

    historial: function (busqueda) {
      return buscarEnSolicitudes(solicitudes, busqueda).slice().reverse();
    },

    marcarPublicado: function (id, url) {
      var revision = validarLinkPublicado(url);
      if (!revision.valido) return { valido: false, errores: [{ campo: 'linkPublicado', mensaje: revision.mensaje }] };
      for (var i = 0; i < solicitudes.length; i++) {
        if (solicitudes[i].id !== id) continue;
        solicitudes[i].estado = 'publicado';
        solicitudes[i].link_publicado = revision.url;
        return { valido: true, id: id, linkPublicado: revision.url };
      }
      return { valido: false, errores: [{ campo: 'id', mensaje: 'No encontramos esa solicitud.' }] };
    },

    datosDeSolicitud: function (id) {
      for (var i = 0; i < solicitudes.length; i++) {
        if (solicitudes[i].id === id) return { valido: true, entrada: sinRastroDeAmpliacion(JSON.parse(solicitudes[i].datos_json)) };
      }
      return { valido: false, errores: [{ campo: 'id', mensaje: 'No encontramos esa solicitud.' }] };
    },

    ampliarCampana: function (id, cambios) {
      for (var i = 0; i < solicitudes.length; i++) {
        if (solicitudes[i].id !== id) continue;
        var entrada = JSON.parse(solicitudes[i].datos_json);
        var disponible = puedeAmpliar(solicitudes[i], entrada, hoy(), '12:00');
        if (!disponible.puede) return { valido: false, errores: [{ campo: 'id', mensaje: disponible.motivo }] };

        var revision = validarAmpliacion(entrada, cambios, hoy(), '12:00');
        if (!revision.valido) return { valido: false, errores: revision.errores };

        var ampliada = aplicarAmpliacion(entrada, revision.cambios, hoy());
        solicitudes[i].datos_json = JSON.stringify(ampliada);
        solicitudes[i].fecha_fin = ampliada.fechaFin || '';
        return {
          valido: true, demostracion: true, id: id,
          version: ampliada.modificaciones.length + 1,
          linkDoc: '', linkPublicado: solicitudes[i].link_publicado,
        };
      }
      return { valido: false, errores: [{ campo: 'id', mensaje: 'No encontramos esa solicitud.' }] };
    },

    adminEstado: function () {
      return { paises: paises, equipo: equipo, estados: ESTADOS, roles: ['comercial', 'pruebas', 'legal', 'admin'] };
    },

    adminGuardarEstadoDePais: function (codigo, estado) {
      if (ESTADOS.indexOf(estado) === -1) return { valido: false, errores: [{ campo: 'estado', mensaje: 'Ese estado no existe.' }] };
      var pais = paisPorCodigo(paises, codigo);
      if (!pais) return { valido: false, errores: [{ campo: 'codigo', mensaje: 'No encontramos ese país.' }] };
      pais.estado = estado;
      return { valido: true };
    },

    adminGuardarMiembro: function (miembro) {
      var correo = String(miembro.email || '').trim().toLowerCase();
      if (!esCorreoDelDominio(correo)) return { valido: false, errores: [{ campo: 'email', mensaje: 'El correo debe ser @rappi.com.' }] };
      var rol = String(miembro.rol || 'comercial').trim().toLowerCase();
      if (ROLES.indexOf(rol) === -1) return { valido: false, errores: [{ campo: 'rol', mensaje: 'Ese rol no existe.' }] };
      var pais = String(miembro.pais || '').trim().toUpperCase();
      if (pais && !paisPorCodigo(paises, pais)) return { valido: false, errores: [{ campo: 'pais', mensaje: 'No encontramos el país "' + pais + '". Escribe el código de dos letras de la pestaña Paises, como CO o MX, o déjalo vacío.' }] };
      var existente = filaDeMiembro(equipo, correo);
      var fila = { email: correo, nombre: miembro.nombre || '', rol: rol, pais: pais, activo: true };
      if (existente) { for (var k in fila) existente[k] = fila[k]; } else { equipo.push(fila); }
      return { valido: true };
    },

    // El mismo contrato que Api.js: { valido, agregados, yaEstaban, rechazados }.
    adminAgregarMiembros: function (texto, rol, pais) {
      if (ROLES.indexOf(rol) === -1) return { valido: false, errores: [{ campo: 'rol', mensaje: 'Ese rol no existe.' }] };
      var codigoPais = String(pais || '').trim().toUpperCase();
      if (codigoPais && !paisPorCodigo(paises, codigoPais)) return { valido: false, errores: [{ campo: 'pais', mensaje: 'No encontramos el país "' + codigoPais + '". Escribe el código de dos letras de la pestaña Paises, como CO o MX, o déjalo vacío.' }] };
      var correos = separarCorreos(texto);
      if (correos.length === 0) return { valido: false, errores: [{ campo: 'correos', mensaje: 'Pega al menos un correo.' }] };

      var agregados = [];
      var yaEstaban = [];
      var rechazados = [];
      for (var i = 0; i < correos.length; i++) {
        var correo = correos[i];
        if (!esCorreoDelDominio(correo)) { rechazados.push(correo); continue; }
        var fila = filaDeMiembro(equipo, correo);
        if (fila && fila.activo) { yaEstaban.push(correo); continue; }
        var datos = { email: correo, nombre: fila ? fila.nombre : '', rol: rol, pais: codigoPais, activo: true };
        if (fila) { for (var k in datos) fila[k] = datos[k]; } else { equipo.push(datos); }
        agregados.push(correo);
      }
      return { valido: true, agregados: agregados, yaEstaban: yaEstaban, rechazados: rechazados };
    },

    adminSolicitudes: function (busqueda) {
      return buscarEnSolicitudes(solicitudes, busqueda).slice().reverse();
    },

    adminSolicitudesCsv: function (busqueda) {
      var columnas = ['id', 'fecha', 'email', 'pais', 'tipo', 'nombre_campana', 'tienda', 'estado', 'link_publicado'];
      return comoCsv(buscarEnSolicitudes(solicitudes, busqueda), columnas);
    },
  };
})();
`;

function contenidoEntreEtiquetas(html, etiqueta) {
  const patron = new RegExp('<' + etiqueta + '[^>]*>([\\s\\S]*?)</' + etiqueta + '>');
  const encontrado = patron.exec(html);
  return encontrado ? encontrado[1] : '';
}

function main() {
  construir();

  const plantilla = leerTexto(path.join(DIST, 'Index.html'));
  const estilos = contenidoEntreEtiquetas(leerTexto(path.join(DIST, 'Estilos.html')), 'style');
  const motor = contenidoEntreEtiquetas(leerTexto(path.join(DIST, 'MotorCliente.html')), 'script');
  const interfaz = contenidoEntreEtiquetas(leerTexto(path.join(DIST, 'App.html')), 'script');

  // Los textos legales y los paises ya vienen dentro de MotorCliente.html: el
  // build los mete ahi para que el navegador los reciba. Aqui no se repiten.

  // La demostración corre en el navegador, sin CommonJS. En vez de recortar los
  // bloques de exportación con una expresión regular, que es frágil y puede
  // comerse el archivo siguiente, se declara un `module` de mentiras: los
  // bloques corren, escriben en él y no molestan a nadie. El bloque que carga
  // dependencias con require exige `typeof require === 'function'`, que en el
  // navegador es falso, así que se salta solo.
  const MODULO_FALSO = 'var module = { exports: {} };\n';

  // El reemplazo va como función, nunca como cadena. El código que se inyecta
  // contiene secuencias de reemplazo (las que empiezan por el signo de dólar) y
  // si se pasan como cadena, JavaScript las interpreta como patrones y corrompe
  // el archivo sin avisar.
  const poner = (valor) => () => valor;

  const html = plantilla
    .replace("<?!= incluir('Estilos') ?>", poner('<style>\n' + estilos + '\n</style>'))
    .replace(
      "<?!= incluir('MotorCliente') ?>",
      poner('<script>\n' + MODULO_FALSO + motor + '\n' + SERVIDOR_SIMULADO + '\n</script>')
    )
    .replace("<?!= incluir('App') ?>", poner('<script>\n' + interfaz + '\n</script>'))
    .replace('<title>RappiMind v3</title>', poner('<title>RappiMind v3 · demostración</title>'))
    .replace('<base target="_top" />', poner(''));

  const aviso = [
    '<!--',
    '  Demostración de RappiMind v3, generada con npm run demo.',
    '  Un solo archivo: ábrelo con doble clic, sin instalar nada.',
    '  Lleva el motor real, así que el texto que ves es el que saldría en producción.',
    '  No crea documentos, no manda correos y nada queda guardado.',
    '-->',
  ].join('\n');

  asegurarCarpeta(rutaDesdeRaiz('demo'));
  escribirTexto(rutaDesdeRaiz('demo', 'index.html'), aviso + '\n' + html);

  const tamano = Math.round(html.length / 1024);
  console.log('demo/index.html generado: ' + tamano + ' KB, un solo archivo.');
}

if (require.main === module) main();
module.exports = { main };
