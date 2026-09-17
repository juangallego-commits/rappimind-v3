'use strict';

/**
 * La interfaz en portugues.
 *
 * El idioma de la interfaz NO es el idioma del documento. Son dos cosas
 * distintas a proposito:
 *
 *   - El documento sale en el idioma del pais (src/core/idiomas.js). Eso no se
 *     elige: un T&C de Brasil va en portugues siempre, y uno de Colombia en
 *     espanol siempre. Dejar elegirlo seria dejar publicar un documento
 *     brasileno en espanol.
 *   - La interfaz sale en el idioma que prefiera quien la usa. Un KAM de Sao
 *     Paulo quiere el formulario en portugues, y esa es una preferencia suya
 *     que se guarda en su navegador.
 *
 * Como funciona: la clave del diccionario es el propio texto en espanol. Asi el
 * codigo se sigue leyendo en espanol, que es la regla 8 de CLAUDE.md, y una
 * cadena sin traducir sale en espanol en vez de romperse o quedar vacia.
 *
 * Ojo: esto es texto de producto, no texto legal. Las clausulas siguen saliendo
 * de modelos/ y nadie las traduce aqui.
 */

var IDIOMAS_DE_INTERFAZ = [
  { codigo: 'es', nombre: 'Español', bandera: 'ES' },
  { codigo: 'pt', nombre: 'Português', bandera: 'BR' },
];

var TEXTOS_PT = {
  /* --- Navegacion y marco ------------------------------------------------ */
  'Generar': 'Gerar',
  'Mis campañas': 'Minhas campanhas',
  'Ayuda': 'Ajuda',
  'Administración': 'Administração',
  'Secciones': 'Seções',
  'Cargando RappiMind...': 'Carregando o RappiMind...',
  'No pudimos abrir RappiMind': 'Não conseguimos abrir o RappiMind',
  'Si sigue pasando, avísale a Juan.': 'Se continuar acontecendo, avise o Juan.',
  'Modo demostración': 'Modo demonstração',
  'No se crea ningún documento, no se manda ningún correo y nada queda guardado. Al final verás el texto que habría salido.':
    'Nenhum documento é criado, nenhum e-mail é enviado e nada fica salvo. No final você vê o texto que teria saído.',

  /* --- Inicio ------------------------------------------------------------- */
  'Genera los Términos y Condiciones de tu campaña': 'Gere os Termos e Condições da sua campanha',
  'Sin escribirle a Legal y sin redactar una sola cláusula. Toma menos de cinco minutos.':
    'Sem escrever para o Jurídico e sem redigir uma única cláusula. Leva menos de cinco minutos.',
  'Cuéntanos de tu campaña': 'Conte para nós sobre a sua campanha',
  'Te hacemos preguntas simples, una por una. Ninguna te pide escribir texto legal.':
    'Fazemos perguntas simples, uma por uma. Nenhuma pede que você escreva texto jurídico.',
  'Revisa cómo va quedando': 'Veja como está ficando',
  'El documento se escribe solo, al lado, mientras respondes. Lo que ves es lo que sale.':
    'O documento se escreve sozinho, ao lado, enquanto você responde. O que você vê é o que sai.',
  'Publica los T&Cs': 'Publique os T&C',
  'Empezar': 'Começar',
  'Seguir con lo que dejaste a medias': 'Continuar de onde você parou',
  'Tu navegador no deja guardar borradores, así que no cierres esta pestaña hasta generar el documento.':
    'Seu navegador não permite salvar rascunhos, então não feche esta aba até gerar o documento.',

  /* --- Filtro de entrada -------------------------------------------------- */
  '¿Esta campaña la puedo hacer aquí?': 'Posso fazer esta campanha por aqui?',
  'Dos preguntas rápidas. Si alguna es sí, tu campaña necesita que Legal la redacte a mano.':
    'Duas perguntas rápidas. Se alguma for sim, a sua campanha precisa que o Jurídico a redija manualmente.',
  '¿Hay azar: sorteo, rifa, raspa y gana o ruleta?': 'Tem sorte envolvida: sorteio, rifa, raspadinha ou roleta?',
  '¿La tienda o la marca exige sus propios términos y condiciones?':
    'A loja ou a marca exige os próprios termos e condições?',
  'Sí': 'Sim',
  'No': 'Não',

  /* --- Pantalla de Legal --------------------------------------------------- */
  'Esta campaña la redacta Legal': 'Esta campanha é redigida pelo Jurídico',
  'No es un problema ni una negativa: es un caso que necesita que un abogado lo mire. Llena el formulario y el equipo legal te responde.':
    'Não é um problema nem uma recusa: é um caso que precisa que um advogado olhe. Preencha o formulário e o time jurídico responde.',
  'Ir al formulario de Legal': 'Ir para o formulário do Jurídico',
  'Volver al inicio': 'Voltar ao início',
  'Falta configurar el enlace del formulario de Legal. Avísale a Juan.':
    'Falta configurar o link do formulário do Jurídico. Avise o Juan.',

  /* --- El formulario por pasos -------------------------------------------- */
  'Tu T&C': 'Seu T&C',
  'Sin empezar': 'Ainda não começou',
  'Completo': 'Completo',
  'Falta 1 dato': 'Falta 1 dado',
  'Faltan varios datos': 'Faltam varios dados',
  'Atrás': 'Voltar',
  'Siguiente': 'Avançar',
  'Revisar y generar': 'Revisar e gerar',
  'Cambiar': 'Alterar',
  'Ver cómo va mi T&C': 'Ver como está o meu T&C',
  'Cerrar': 'Fechar',
  'Vista previa del documento': 'Prévia do documento',
  '¿Por qué te preguntamos esto?': 'Por que perguntamos isso?',
  'Tu documento aparece aquí y se va llenando mientras respondes.':
    'Seu documento aparece aqui e vai se preenchendo enquanto você responde.',

  /* --- Los pasos ----------------------------------------------------------- */
  'Campaña': 'Campanha',
  'Organizador': 'Organizador',
  'Cuándo': 'Quando',
  'Beneficio': 'Benefício',
  'Créditos': 'Créditos',
  'Participantes': 'Participantes',
  'Revisar': 'Revisar',
  'Tu campaña': 'Sua campanha',
  'Cuándo corre la campaña': 'Quando a campanha acontece',
  'El beneficio': 'O benefício',
  'Quién puede participar': 'Quem pode participar',
  'Quién organiza la campaña': 'Quem organiza a campanha',
  'Revisa y genera': 'Revise e gere',

  /* --- Resumen y final ----------------------------------------------------- */
  'Revisa antes de generar': 'Revise antes de gerar',
  'Este es el resumen de lo que respondiste. Puedes cambiar cualquier cosa antes de generar el documento.':
    'Este é o resumo do que você respondeu. Você pode alterar qualquer coisa antes de gerar o documento.',
  'Editar': 'Editar',
  'Falta': 'Falta',
  'Te falta:': 'Está faltando:',
  'Generar T&C': 'Gerar T&C',
  'Generando...': 'Gerando...',
  'Generando el documento.': 'Gerando o documento.',
  'Mis campañas': 'Minhas campanhas',

  'Queda 1 pregunta en este paso.': 'Falta 1 pergunta nesta etapa.',
  'Quedan varias preguntas en este paso.': 'Faltam varias perguntas nesta etapa.',
  'En 2 minutos recibirás un email con el documento generado y listo para publicar en Squarespace. Recuerda seguir las instrucciones para asegurar que los T&Cs queden publicados exitosamente.':
    'Em 2 minutos você recebe um e-mail com o documento gerado e pronto para publicar no Squarespace. Siga as instruções para garantir que os T&C fiquem publicados corretamente.',

  /* --- El aviso de pais en pruebas ---------------------------------------- */
  ' está en pruebas: genera y revisa, pero todavía no publiques. Los datos legales de este país los propuso la herramienta y no los ha confirmado nadie.':
    ' está em testes: gere e revise, mas ainda não publique. Os dados jurídicos deste país foram propostos pela ferramenta e ninguém os confirmou.',

  /* --- Las descripciones de los tipos de campana --------------------------- */
  'Descuento en porcentaje, envío gratis o tarifa de servicio gratis en una tienda aliada de Brasil. El usuario ve el beneficio aplicado al pagar, no recibe Créditos. Solo para Brasil.':
    'Desconto em porcentagem, frete grátis ou taxa de serviço grátis em uma loja parceira do Brasil. O usuário vê o benefício aplicado no pagamento, não recebe Créditos. Só para o Brasil.',

  /* --- Historial ----------------------------------------------------------- */
  'Cargando...': 'Carregando...',
};

var DICCIONARIOS = { pt: TEXTOS_PT };

/**
 * Traduce un texto de interfaz. Sin traduccion devuelve el espanol, que es la
 * degradacion correcta: se entiende, aunque no este en el idioma pedido.
 */
function traducirInterfaz(texto, idioma) {
  if (!idioma || idioma === 'es') return texto;
  var diccionario = DICCIONARIOS[idioma];
  if (!diccionario) return texto;
  var traducido = diccionario[texto];
  return traducido === undefined ? texto : traducido;
}

/** Cuantas cadenas faltan por traducir, para la prueba que lo vigila. */
function cadenasTraducidas(idioma) {
  var diccionario = DICCIONARIOS[idioma] || {};
  var cuantas = 0;
  for (var llave in diccionario) {
    if (Object.prototype.hasOwnProperty.call(diccionario, llave)) cuantas += 1;
  }
  return cuantas;
}

if (typeof module !== 'undefined') {
  module.exports = {
    IDIOMAS_DE_INTERFAZ: IDIOMAS_DE_INTERFAZ,
    TEXTOS_PT: TEXTOS_PT,
    traducirInterfaz: traducirInterfaz,
    cadenasTraducidas: cadenasTraducidas,
  };
}
