'use strict';

/**
 * El flujo de generacion: inicio, filtro de entrada, los pasos, el resumen y la
 * pantalla final.
 *
 * Dentro de cada paso va UNA pregunta a la vez. Las ya respondidas quedan
 * arriba en una linea, con boton para cambiarlas. Se avanza solo cuando la
 * respuesta es inequivoca (elegir una opcion); si hay que escribir algo, el
 * comercial confirma con Siguiente.
 */

var RM = window.RM;
var crear = RM.util.crear;
var vaciar = RM.util.vaciar;
var estado = RM.estado;
var E = estado.estado;

/** Los pasos que tienen alguna pregunta visible para el tipo elegido. */
function pasosDelTipo(entrada) {
  if (!entrada.tipo) return [];
  var visibles = camposVisibles(entrada.tipo, entrada);
  var conPreguntas = {};
  for (var i = 0; i < visibles.length; i++) {
    var pregunta = preguntaDe(visibles[i].id);
    if (pregunta && pregunta.pregunta) conPreguntas[visibles[i].paso] = true;
  }
  // El paso de confirmación no entra al formulario: la casilla de declaración
  // va en el resumen, que es donde el comercial ve todo junto antes de generar.
  return PASOS.filter(function (paso) {
    return conPreguntas[paso.id] && paso.id !== 'confirmacion';
  });
}

function camposDelPaso(entrada, pasoId) {
  var visibles = camposVisibles(entrada.tipo, entrada);
  var campos = [];
  for (var i = 0; i < visibles.length; i++) {
    if (visibles[i].paso !== pasoId) continue;
    var pregunta = preguntaDe(visibles[i].id);
    if (pregunta && pregunta.pregunta) campos.push(visibles[i]);
  }
  return campos;
}

function tieneRespuesta(campoId) {
  // Un valor por defecto no basta: la pregunta se muestra igual, preseleccionada.
  if (!E.respondidas[campoId]) return false;

  var valor = estado.entrada()[campoId];
  if (campoId === 'maxPedidos') return opcionDeVeces() !== null && (opcionDeVeces() !== 'varias' || valor > 1);
  if (valor === null || valor === undefined || valor === '') return false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length > 0;
  if (valor === false) return false;
  return true;
}

/** "¿Cuántas veces puede ganar?" reúne maxPedidos y sinLimite en una pregunta. */
function opcionDeVeces() {
  var entrada = estado.entrada();
  if (entrada.sinLimite) return 'sin_limite';
  if (entrada.maxPedidos === 1) return 'una';
  if (entrada.maxPedidos > 1) return 'varias';
  if (entrada.__veces) return entrada.__veces;
  return null;
}

function fijarVeces(valor) {
  E.respondidas.maxPedidos = true;
  if (valor === 'una') estado.fijarVarios({ __veces: 'una', maxPedidos: 1, sinLimite: false });
  else if (valor === 'sin_limite') estado.fijarVarios({ __veces: 'sin_limite', maxPedidos: null, sinLimite: true });
  else estado.fijarVarios({ __veces: 'varias', maxPedidos: null, sinLimite: false });
}

/** Errores de la solicitud, indexados por campo. */
function erroresPorCampo() {
  var pais = paisElegido();
  if (!pais || !estado.entrada().tipo) return {};

  var revision = validarSolicitud(estado.entrada(), pais, {
    fechaReferencia: E.configuracion.hoy || RM.util.hoyEnElNavegador(),
    usuarioEnEquipo: puedeVerPiloto(E.configuracion.rol),
    // Los mensajes salen en el idioma de la interfaz; el documento no cambia.
    idioma: estado.idiomaInterfaz(),
  });

  var porCampo = {};
  for (var i = 0; i < revision.errores.length; i++) {
    var error = revision.errores[i];
    if (!porCampo[error.campo]) porCampo[error.campo] = error.mensaje;
  }
  return porCampo;
}

function paisElegido() {
  return paisPorCodigo(E.configuracion.paises, estado.entrada().pais);
}

function modeloDelTipo() {
  var esquema = esquemaDe(estado.entrada().tipo);
  return esquema ? esquema.modelo : null;
}

// --- Vista previa ------------------------------------------------------------

function refrescarDocumento() {
  var contenedores = document.querySelectorAll('[data-hoja]');
  if (contenedores.length === 0) return;

  var pais = paisElegido();
  var modelo = modeloDelTipo();

  // Todavía sin tipo de campaña: la hoja explica qué va a pasar ahí.
  if (!pais || !modelo) {
    for (var v = 0; v < contenedores.length; v++) RM.documento.dibujar(contenedores[v], '', '');
    var sinTipo = RM.util.porId('cuenta-huecos');
    if (sinTipo) sinTipo.textContent = estado.T('Sin empezar');
    E.ultimoTextoVistaPrevia = '';
    return;
  }

  var resultado = renderizarVistaPrevia(modelo, estado.entrada(), pais, MODELOS);

  for (var i = 0; i < contenedores.length; i++) {
    var cambiada = RM.documento.dibujar(contenedores[i], resultado.texto, E.ultimoTextoVistaPrevia);
    RM.documento.desplazarHasta(contenedores[i], cambiada);
  }

  var cuenta = RM.util.porId('cuenta-huecos');
  if (cuenta) {
    cuenta.textContent = resultado.huecos.length === 0
      ? estado.T('Completo')
      : (resultado.huecos.length === 1
        ? estado.T('Falta 1 dato')
        : estado.T('Faltan {n} datos').replace('{n}', resultado.huecos.length));
  }
  E.ultimoTextoVistaPrevia = resultado.texto;
}

// --- Pantalla de inicio ------------------------------------------------------

function pantallaInicio(raiz) {
  var pasos = [
    {
      titulo: estado.T('Cuéntanos de tu campaña'),
      detalle: estado.T('Te hacemos preguntas simples, una por una. Ninguna te pide escribir texto legal.'),
    },
    {
      titulo: estado.T('Revisa cómo va quedando'),
      detalle: estado.T('El documento se escribe solo, al lado, mientras respondes. Lo que ves es lo que sale.'),
    },
    {
      titulo: estado.T('Publica los T&Cs'),
      detalle: estado.T('En 2 minutos recibirás un email con el documento generado y listo para publicar en Squarespace. Recuerda seguir las instrucciones para asegurar que los T&Cs queden publicados exitosamente.'),
    },
  ];

  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('Genera los Términos y Condiciones de tu campaña') }),
    crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Sin escribirle a Legal y sin redactar una sola cláusula. Toma menos de cinco minutos.') }),
  ]);

  var lista = crear('ol', { clase: 'pasos-publicar' });
  for (var i = 0; i < pasos.length; i++) {
    lista.appendChild(crear('li', {}, [
      crear('h3', { texto: pasos[i].titulo }),
      crear('p', { clase: 'pregunta-ayuda', texto: pasos[i].detalle }),
    ]));
  }
  contenido.appendChild(lista);

  var acciones = crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton', type: 'button', texto: estado.T('Empezar'),
      onclick: function () {
        // Empezar es empezar de cero. Para retomar lo de antes está el otro botón.
        estado.reiniciarFormulario(RM.app.valoresIniciales(), {});
        RM.app.ir('filtro');
      },
    }),
  ]);

  var borrador = estado.leerBorrador();
  if (borrador) {
    acciones.appendChild(crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Seguir con lo que dejaste a medias'),
      onclick: function () {
        estado.reiniciarFormulario(borrador.entrada, borrador.respondidas || {});
        E.pasoActual = borrador.pasoActual || 0;
        E.filtroRespondido = true;
        RM.app.ir('pasos');
      },
    }));
  }
  contenido.appendChild(acciones);

  if (!estado.almacenamientoDisponible()) {
    contenido.appendChild(crear('div', { clase: 'aviso' }, [
      crear('p', { texto: estado.T('Tu navegador no deja guardar borradores, así que no cierres esta pestaña hasta generar el documento.') }),
    ]));
  }

  raiz.appendChild(contenido);
}

// --- Filtro de entrada -------------------------------------------------------

function pantallaFiltro(raiz) {
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('¿Esta campaña la puedo hacer aquí?') }),
    crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Dos preguntas rápidas. Si alguna es sí, tu campaña necesita que Legal la redacte a mano.') }),
  ]);

  // Primero el tipo, porque el filtro depende de él.
  var preguntas = [
    { id: 'azar', texto: '¿Hay azar: sorteo, rifa, raspa y gana o ruleta?', razon: 'Las dinámicas con azar necesitan permiso previo de la autoridad. Legal tiene que revisarlas antes de lanzarlas.' },
    { id: 'tycPropios', texto: '¿La tienda o la marca exige sus propios términos y condiciones?', razon: 'Si el aliado impone su documento, hay que revisarlo con Legal antes de publicarlo.' },
  ];

  var respuestas = {};
  var lista = crear('div', {});

  function revisar() {
    for (var i = 0; i < preguntas.length; i++) {
      if (respuestas[preguntas[i].id] === true) {
        E.motivoDeLegal = estado.T(preguntas[i].razon);
        RM.app.ir('legal');
        return;
      }
    }
    var todas = preguntas.every(function (p) { return respuestas[p.id] === false; });
    if (todas) {
      E.filtroRespondido = true;
      RM.app.ir('pasos');
    }
  }

  for (var i = 0; i < preguntas.length; i++) {
    (function (pregunta) {
      var bloque = crear('div', { clase: 'pregunta' }, [
        crear('h2', { clase: 'pregunta-titulo', texto: estado.T(pregunta.texto) }),
      ]);
      var grupo = crear('div', { clase: 'opciones', role: 'radiogroup', 'aria-label': estado.T(pregunta.texto) });
      [['no', 'No', false], ['si', 'Sí', true]].forEach(function (par) {
        grupo.appendChild(crear('button', {
          clase: 'opcion', type: 'button', texto: estado.T(par[1]),
          role: 'radio', 'aria-checked': 'false', 'aria-pressed': 'false',
          onclick: function () {
            respuestas[pregunta.id] = par[2];
            var hermanos = grupo.querySelectorAll('.opcion');
            for (var k = 0; k < hermanos.length; k++) {
              hermanos[k].setAttribute('aria-checked', 'false');
              hermanos[k].setAttribute('aria-pressed', 'false');
            }
            this.setAttribute('aria-checked', 'true');
            this.setAttribute('aria-pressed', 'true');
            revisar();
          },
        }));
      });
      bloque.appendChild(grupo);
      lista.appendChild(bloque);
    })(preguntas[i]);
  }

  contenido.appendChild(lista);
  raiz.appendChild(contenido);
}

/**
 * El filtro de Rappi Travel.
 *
 * Se muestra despues de elegir uno de los dos tipos de Travel, no antes: las
 * nueve preguntas solo tienen sentido sabiendo que la campana es de viajes.
 * Reemplaza, para Travel, las preguntas generales de fondeo y de T&C propios.
 */
function pantallaFiltroTravel(raiz) {
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: 'Antes de seguir con tu campaña de Rappi Travel' }),
    crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'Nueve preguntas rápidas. Si alguna es sí, tu campaña necesita que Legal la redacte a mano. No es un castigo: es un caso que un abogado tiene que mirar.',
    }),
  ]);

  var respuestas = {};
  var lista = crear('div', {});

  function revisar() {
    for (var i = 0; i < FILTRO_DE_TRAVEL.length; i++) {
      if (respuestas[FILTRO_DE_TRAVEL[i].id] === true) {
        E.motivoDeLegal = estado.T(FILTRO_DE_TRAVEL[i].razon);
        RM.app.ir('legal');
        return;
      }
    }
    var todas = FILTRO_DE_TRAVEL.every(function (pregunta) { return respuestas[pregunta.id] === false; });
    if (todas) {
      E.filtroDeTravelRespondido = true;
      // El tipo ya quedo respondido antes del filtro, asi que al volver hay que
      // seguir en la pregunta siguiente. Sin esto, el asistente reabre la del
      // tipo y parece que no hubiera pasado nada.
      // El filtro va justo despues de elegir Rappi Travel, asi que al volver la
      // pregunta que toca es la del tipo.
      E.campoAbierto = 'tipo';
      RM.app.ir('pasos');
    }
  }

  for (var i = 0; i < FILTRO_DE_TRAVEL.length; i++) {
    (function (pregunta) {
      var bloque = crear('div', { clase: 'pregunta' }, [
        crear('h2', { clase: 'pregunta-titulo', texto: estado.T(pregunta.texto) }),
      ]);
      var grupo = crear('div', { clase: 'opciones', role: 'radiogroup', 'aria-label': estado.T(pregunta.texto) });
      [['No', false], ['Sí', true]].forEach(function (par) {
        grupo.appendChild(crear('button', {
          clase: 'opcion', type: 'button', texto: estado.T(par[0]),
          role: 'radio', 'aria-checked': 'false', 'aria-pressed': 'false',
          onclick: function () {
            respuestas[pregunta.id] = par[1];
            var hermanos = grupo.querySelectorAll('.opcion');
            for (var k = 0; k < hermanos.length; k++) {
              hermanos[k].setAttribute('aria-checked', 'false');
              hermanos[k].setAttribute('aria-pressed', 'false');
            }
            this.setAttribute('aria-checked', 'true');
            this.setAttribute('aria-pressed', 'true');
            revisar();
          },
        }));
      });
      bloque.appendChild(grupo);
      lista.appendChild(bloque);
    })(FILTRO_DE_TRAVEL[i]);
  }

  contenido.appendChild(lista);
  contenido.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: 'Esta campaña no es de Travel',
      onclick: function () {
        estado.fijar('negocio', 'rappi');
        estado.fijar('tipo', null);
        E.filtroDeTravelRespondido = false;
        E.campoAbierto = 'tipo';
        RM.app.ir('pasos');
      },
    }),
  ]));
  raiz.appendChild(contenido);
}

function pantallaLegal(raiz) {
  var url = E.configuracion.urlFormularioLegal;
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('Esta campaña la redacta Legal') }),
    crear('div', { clase: 'aviso' }, [
      crear('p', { texto: E.motivoDeLegal || estado.T('Tu campaña necesita revisión legal antes de publicarse.') }),
    ]),
    crear('p', { texto: estado.T('No es un problema ni una negativa: es un caso que necesita que un abogado lo mire. Llena el formulario y el equipo legal te responde.') }),
    crear('div', { clase: 'fila-botones' }, [
      url
        ? crear('a', { clase: 'boton', href: url, target: '_blank', rel: 'noopener' }, [
            document.createTextNode(estado.T('Ir al formulario de Legal')), RM.util.icono('abrir', 16),
          ])
        : crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Falta configurar el enlace del formulario de Legal. Avísale a Juan.') }),
      crear('button', {
        clase: 'boton boton-secundario', type: 'button', texto: estado.T('Volver al inicio'),
        onclick: function () { RM.app.ir('inicio'); },
      }),
    ]),
  ]);
  raiz.appendChild(contenido);
}

RM.flujo = {
  pasosDelTipo: pasosDelTipo,
  camposDelPaso: camposDelPaso,
  tieneRespuesta: tieneRespuesta,
  opcionDeVeces: opcionDeVeces,
  fijarVeces: fijarVeces,
  erroresPorCampo: erroresPorCampo,
  paisElegido: paisElegido,
  modeloDelTipo: modeloDelTipo,
  refrescarDocumento: refrescarDocumento,
  pantallaInicio: pantallaInicio,
  pantallaFiltro: pantallaFiltro,
  pantallaFiltroTravel: pantallaFiltroTravel,
  pantallaLegal: pantallaLegal,
};
