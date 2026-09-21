'use strict';

/**
 * RappiMind v3 - punto de entrada de la web app.
 *
 * Bloque 0: solo sirve la pagina y expone el estado del despliegue, que es lo
 * que hace falta para confirmar que clasp push llega al proyecto correcto.
 * El servidor real (setup, Sheet, Drive, Docs, correo) llega en el Bloque 2.
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('RappiMind')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Permite componer los HTML desde la plantilla con <?!= incluir('Estilos') ?>. */
function incluir(nombre) {
  return HtmlService.createHtmlOutputFromFile(nombre).getContent();
}

/** Datos minimos para verificar que el despliegue responde y quien lo abre. */
function estadoDelDespliegue() {
  return {
    nombre: 'RappiMind v3',
    bloque: 0,
    correo: Session.getActiveUser().getEmail(),
    modelos: typeof MODELOS !== 'undefined' ? Object.keys(MODELOS.modelos).length : 0,
    bloques: typeof MODELOS !== 'undefined' ? Object.keys(MODELOS.bloques).length : 0,
    paises: typeof PAISES_SEMILLA !== 'undefined' ? PAISES_SEMILLA.length : 0,
  };
}
