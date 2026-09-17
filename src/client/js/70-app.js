'use strict';

/**
 * Arranque y navegacion.
 *
 * Una sola raiz que se redibuja. No hay enrutador de verdad porque la app vive
 * dentro de un iframe de Apps Script, donde la URL no se puede tocar.
 */

var RM = window.RM;
var crear = RM.util.crear;
var vaciar = RM.util.vaciar;
var estado = RM.estado;
var E = estado.estado;

var PANTALLAS = {
  inicio: function (raiz) { RM.flujo.pantallaInicio(raiz); },
  filtro: function (raiz) { RM.flujo.pantallaFiltro(raiz); },
  filtroTravel: function (raiz) { RM.flujo.pantallaFiltroTravel(raiz); },
  legal: function (raiz) { RM.flujo.pantallaLegal(raiz); },
  pasos: function (raiz) { RM.pasos.pantallaPasos(raiz); },
  tycGenericos: function (raiz) { RM.tycGenericos.pantalla(raiz); },
  resumen: function (raiz) { RM.resumen.pantallaResumen(raiz); },
  listo: function (raiz) { RM.resumen.pantallaListo(raiz); },
  historial: function (raiz) { RM.pantallas.pantallaHistorial(raiz); },
  ayuda: function (raiz) { RM.pantallas.pantallaAyuda(raiz); },
  admin: function (raiz) { RM.pantallas.pantallaAdmin(raiz); },
};

var NAVEGACION = [
  { id: 'inicio', nombre: 'Generar' },
  { id: 'historial', nombre: 'Mis campañas' },
  { id: 'ayuda', nombre: 'Ayuda' },
];

function barraSuperior() {
  var nav = crear('nav', { 'aria-label': estado.T('Secciones') });
  for (var i = 0; i < NAVEGACION.length; i++) {
    (function (seccion) {
      nav.appendChild(crear('button', {
        clase: 'enlace-nav', type: 'button', texto: estado.T(seccion.nombre),
        'aria-current': E.pantalla === seccion.id ? 'page' : null,
        onclick: function () { ir(seccion.id); },
      }));
    })(NAVEGACION[i]);
  }

  if (E.configuracion && E.configuracion.rol === 'admin') {
    nav.appendChild(crear('button', {
      clase: 'enlace-nav', type: 'button', texto: estado.T('Administración'),
      'aria-current': E.pantalla === 'admin' ? 'page' : null,
      onclick: function () { ir('admin'); },
    }));
  }

  return crear('header', { clase: 'barra-superior' }, [
    crear('span', { clase: 'marca' }, [
      RM.util.corona(),
      document.createTextNode('RappiMind '),
      crear('em', { texto: 'v3' }),
    ]),
    nav,
  ]);
}

/** El botón fijo y la hoja deslizable del celular. */
function agregarHojaDeCelular(raiz) {
  var cortina = crear('div', { clase: 'cortina' });
  var hoja = crear('div', {
    clase: 'hoja-deslizable', role: 'dialog', 'aria-modal': 'true', 'aria-label': estado.T('Vista previa del documento'),
  }, [
    crear('div', { clase: 'asa' }),
    crear('div', { clase: 'hoja', 'data-hoja': '1' }),
    crear('div', { clase: 'fila-botones', style: 'padding: 0 16px 16px' }, [
      crear('button', { clase: 'boton boton-secundario', type: 'button', texto: estado.T('Cerrar'), onclick: cerrar }),
    ]),
  ]);

  var boton = crear('button', {
    clase: 'boton-flotante', type: 'button',
    onclick: abrir,
  }, [RM.util.icono('documento', 18), document.createTextNode(estado.T('Ver cómo va mi T&C'))]);

  function abrir() {
    cortina.classList.add('abierta');
    hoja.classList.add('abierta');
    RM.flujo.refrescarDocumento();
    hoja.querySelector('button').focus();
  }
  function cerrar() {
    cortina.classList.remove('abierta');
    hoja.classList.remove('abierta');
    boton.focus();
  }

  cortina.addEventListener('click', cerrar);
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && hoja.classList.contains('abierta')) cerrar();
  });

  raiz.appendChild(boton);
  raiz.appendChild(cortina);
  raiz.appendChild(hoja);
}

/**
 * El selector de idioma de la interfaz, fijo abajo a la derecha.
 *
 * Cambia en que idioma se lee el formulario, no en que idioma sale el documento.
 * El documento va siempre en el idioma del pais, y eso no se elige.
 */
function selectorDeIdioma() {
  var caja = crear('div', {
    clase: 'selector-idioma', role: 'group',
    'aria-label': estado.T('Idioma de la interfaz'),
  });

  for (var i = 0; i < IDIOMAS_DE_INTERFAZ.length; i++) {
    (function (idioma) {
      var elegido = estado.idiomaInterfaz() === idioma.codigo;
      caja.appendChild(crear('button', {
        type: 'button', texto: idioma.bandera,
        title: idioma.nombre,
        'aria-label': idioma.nombre,
        'aria-pressed': String(elegido),
        onclick: function () {
          if (estado.idiomaInterfaz() === idioma.codigo) return;
          estado.fijarIdiomaInterfaz(idioma.codigo);
          dibujar();
          RM.util.anunciar(idioma.nombre);
        },
      }));
    })(IDIOMAS_DE_INTERFAZ[i]);
  }
  return caja;
}

function mostrarError(mensaje) {
  var caja = RM.util.porId('error-global');
  if (!caja) return;
  vaciar(caja);
  caja.appendChild(crear('div', { clase: 'aviso aviso-serio' }, [
    crear('p', { texto: mensaje }),
  ]));
  caja.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  RM.util.anunciar(mensaje);
}

function dibujar() {
  var raiz = RM.util.porId('app');
  vaciar(raiz);
  RM.campos.ocultarGlosario();

  raiz.appendChild(barraSuperior());

  if (E.configuracion && E.configuracion.demostracion) {
    raiz.appendChild(crear('div', { clase: 'pagina', style: 'padding-bottom:0' }, [
      crear('div', { clase: 'aviso' }, [
        crear('h3', { texto: estado.T('Modo demostración') }),
        crear('p', { texto: estado.T('No se crea ningún documento, no se manda ningún correo y nada queda guardado. Al final verás el texto que habría salido.') }),
      ]),
    ]));
  }

  raiz.appendChild(crear('div', { id: 'error-global' }));

  var pintar = PANTALLAS[E.pantalla] || PANTALLAS.inicio;
  pintar(raiz);

  raiz.appendChild(selectorDeIdioma());
}

function ir(pantalla) {
  E.pantalla = pantalla;
  var caja = RM.util.porId('error-global');
  if (caja) vaciar(caja);
  dibujar();
  window.scrollTo(0, 0);
}

/**
 * Los valores con que arranca un formulario nuevo: los por defecto de cada
 * pregunta, más el país. Preseleccionar no es responder: la pregunta se muestra
 * igual, con la opción ya marcada.
 */
function valoresIniciales() {
  var iniciales = {};
  for (var campoId in PREGUNTAS) {
    if (!Object.prototype.hasOwnProperty.call(PREGUNTAS, campoId)) continue;
    if (PREGUNTAS[campoId].porDefecto !== undefined) iniciales[campoId] = PREGUNTAS[campoId].porDefecto;
  }
  // Colombia es el 99,7% de las solicitudes reales: viene preseleccionada.
  if (E.configuracion && E.configuracion.paises.length > 0) iniciales.pais = E.configuracion.paises[0].codigo;
  return iniciales;
}

function arrancar() {
  var raiz = RM.util.porId('app');
  vaciar(raiz);
  raiz.appendChild(crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Cargando RappiMind...') }),
  ]));

  RM.servidor.llamar('estadoInicial').then(function (configuracion) {
    E.configuracion = configuracion;
    estado.reiniciarFormulario(valoresIniciales(), {});
    ir('inicio');
  }).catch(function (error) {
    vaciar(raiz);
    raiz.appendChild(crear('div', { clase: 'pagina pagina-angosta' }, [
      crear('div', { clase: 'aviso aviso-serio' }, [
        crear('h3', { texto: estado.T('No pudimos abrir RappiMind') }),
        crear('p', { texto: error.message }),
        crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Si sigue pasando, avísale a Juan.') }),
      ]),
    ]));
  });
}

RM.app = {
  dibujar: dibujar,
  valoresIniciales: valoresIniciales,
  ir: ir,
  arrancar: arrancar,
  mostrarError: mostrarError,
  agregarHojaDeCelular: agregarHojaDeCelular,
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', arrancar);
} else {
  arrancar();
}
