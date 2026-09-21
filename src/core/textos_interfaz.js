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
 * Dos reglas que salieron de defectos reales:
 *
 *   1. La clave tiene que ser IDENTICA al literal que el codigo le pasa a T().
 *      Un caracter de diferencia y la traduccion no se aplica, sin avisar. Por
 *      eso pruebas/interfaz_pt.test.js busca cada clave, literal, en el codigo.
 *   2. Un numero que se inserta va como marcador {n}, nunca como una palabra
 *      del idioma. "Faltan varios datos" se traducia como "Faltam varios dados"
 *      sin tilde, y ese "varios" sin tilde era lo que el replace() buscaba
 *      para poner el numero: corregir la ortografia habria borrado el numero.
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
  'Idioma de la interfaz': 'Idioma da interface',
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
  'El documento se va escribiendo mientras respondes. Lo que ves es lo que sale.':
    'O documento vai sendo escrito enquanto você responde. O que você vê é o que sai.',
  'Publica los T&C': 'Publique os T&C',
  'Empezar': 'Começar',
  'Seguir con lo que dejaste a medias': 'Continuar de onde você parou',
  'Tu navegador no deja guardar borradores, así que no cierres esta pestaña hasta generar el documento.':
    'Seu navegador não permite salvar rascunhos, então não feche esta aba até gerar o documento.',

  /* --- Filtro de entrada -------------------------------------------------- */
  '¿Esta campaña la puedo hacer aquí?': 'Posso fazer esta campanha por aqui?',
  'Dos preguntas rápidas. Si alguna es sí, tu campaña necesita que Legal la redacte a mano.':
    'Duas perguntas rápidas. Se alguma for sim, a sua campanha precisa que o Jurídico a redija manualmente.',
  '¿Hay azar: sorteo, rifa, raspa y gana o ruleta?': 'Tem sorte envolvida: sorteio, rifa, raspadinha ou roleta?',
  '¿La tienda o la marca exige sus propios T&C?':
    'A loja ou a marca exige os próprios termos e condições?',
  'Las dinámicas con azar necesitan permiso previo de la autoridad. Legal tiene que revisarlas antes de lanzarlas.':
    'As dinâmicas com sorte precisam de autorização prévia da autoridade. O Jurídico precisa revisá-las antes do lançamento.',
  'Si el aliado impone su documento, hay que revisarlo con Legal antes de publicarlo.':
    'Se o parceiro impõe o próprio documento, ele precisa ser revisado com o Jurídico antes de publicar.',
  'Sí': 'Sim',
  'No': 'Não',

  /* --- Pantalla de Legal --------------------------------------------------- */
  'Esta campaña la redacta Legal': 'Esta campanha é redigida pelo Jurídico',
  'Tu campaña necesita revisión legal antes de publicarse.': 'Sua campanha precisa de revisão jurídica antes de ser publicada.',
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
  'Faltan {n} datos': 'Faltam {n} dados',
  'Atrás': 'Voltar',
  'Siguiente': 'Avançar',
  'Revisar y generar': 'Revisar e gerar',
  'Cambiar': 'Alterar',
  'Opcional': 'Opcional',
  'Así queda en tu T&C:': 'Assim fica no seu T&C:',
  'Ver cómo va mi T&C': 'Ver como está o meu T&C',
  'Cerrar': 'Fechar',
  'Vista previa del documento': 'Prévia do documento',
  '¿Por qué te preguntamos esto?': 'Por que perguntamos isso?',
  'Tu documento aparece aquí y se va llenando mientras respondes.':
    'Seu documento aparece aqui e vai se preenchendo enquanto você responde.',
  'Paso {n} de {m}': 'Etapa {n} de {m}',
  'Queda 1 pregunta en este paso.': 'Falta 1 pergunta nesta etapa.',
  'Quedan {n} preguntas en este paso.': 'Faltam {n} perguntas nesta etapa.',
  'Disponible.': 'Disponível.',
  'En piloto: solo para el equipo de pruebas.': 'Em piloto: só para a equipe de testes.',
  '¿Cuántas veces?': 'Quantas vezes?',
  'Sin límite': 'Sem limite',
  'Una sola vez': 'Uma só vez',
  'Varias veces': 'Várias vezes',
  '{n} veces': '{n} vezes',
  'Confirmado': 'Confirmado',

  /* --- Los pasos ----------------------------------------------------------- */
  'Campaña': 'Campanha',
  'Organizador': 'Organizador',
  'Cuándo': 'Quando',
  'Beneficio': 'Benefício',
  'Créditos': 'Créditos',
  'Participantes': 'Participantes',
  'Pieza': 'Peça',
  'Revisar': 'Revisar',
  'Tu campaña': 'Sua campanha',
  'Cuándo corre la campaña': 'Quando a campanha acontece',
  'El beneficio': 'O benefício',
  'Quién puede participar': 'Quem pode participar',
  'La pieza publicitaria': 'A peça publicitária',
  'Ninguna de estas': 'Nenhuma destas',
  'El producto no necesita advertencia por ley.': 'O produto não precisa de advertência por lei.',
  'Quién organiza la campaña': 'Quem organiza a campanha',
  'Revisa y genera': 'Revise e gere',

  /* --- Resumen y final ----------------------------------------------------- */
  'Revisa antes de generar': 'Revise antes de gerar',
  'Este es el resumen de lo que respondiste. Puedes cambiar cualquier cosa antes de generar el documento.':
    'Este é o resumo do que você respondeu. Você pode alterar qualquer coisa antes de gerar o documento.',
  'Falta': 'Falta',
  'Te falta:': 'Está faltando:',
  'Elige el país de la campaña.': 'Escolha o país da campanha.',
  'Generar T&C': 'Gerar T&C',
  'Generando...': 'Gerando...',
  'Generando el documento.': 'Gerando o documento.',
  'Tu T&C está listo': 'Seu T&C está pronto',
  'No se creó ningún documento ni se envió ningún correo. Este es el texto que habría salido.':
    'Nenhum documento foi criado nem nenhum e-mail foi enviado. Este é o texto que teria saído.',
  'Lo que vas a pegar en Squarespace': 'O que você vai colar no Squarespace',
  'Título del evento': 'Título do evento',
  'Va tal cual en el título del evento. No lo cambies: es el mismo nombre que quedó en el documento.':
    'Vai exatamente assim no título do evento. Não altere: é o mesmo nome que ficou no documento.',
  'Dirección del evento': 'Endereço do evento',
  'Las fechas del evento': 'As datas do evento',
  'Inicio: {inicio}. Fin: {fin}. Tienen que ser iguales a la vigencia del documento.':
    'Início: {inicio}. Fim: {fin}. Precisam ser iguais à vigência do documento.',
  'Cómo publicarlo, paso a paso': 'Como publicar, passo a passo',
  '¿Quién puede publicar?': 'Quem pode publicar?',
  'Abrir el documento': 'Abrir o documento',
  'Cuando ya esté publicado': 'Quando já estiver publicado',
  'Hacer otra campaña': 'Fazer outra campanha',
  'Ver mis campañas': 'Ver minhas campanhas',
  'Te llega por correo en un par de minutos, con los pasos para publicarlo o a quién pasárselo.':
    'Você recebe por e-mail em poucos minutos, com o passo a passo para publicar ou para saber a quem enviar.',

  /* --- El aviso de pais en pruebas ---------------------------------------- */
  ' está en pruebas: genera y revisa, pero todavía no publiques. Los datos legales de este país los propuso la herramienta y no los ha confirmado nadie.':
    ' está em testes: gere e revise, mas ainda não publique. Os dados jurídicos deste país foram propostos pela ferramenta e ninguém os confirmou.',
  ' está en pruebas: no publiques este documento todavía': ' está em testes: não publique este documento ainda',
  'Genera el documento, léelo y dinos si los datos legales de tu país están bien. Los propuso la herramienta por analogía con Colombia y no los ha confirmado nadie.':
    'Gere o documento, leia e nos diga se os dados jurídicos do seu país estão certos. A ferramenta os propôs por analogia com a Colômbia e ninguém os confirmou.',

  /* --- Las descripciones de los tipos de campana --------------------------- */
  'Descuento en porcentaje, envío gratis o tarifa de servicio gratis en una tienda aliada de Brasil. El usuario ve el beneficio aplicado al pagar, no recibe Créditos. Solo para Brasil.':
    'Desconto em porcentagem, frete grátis ou taxa de serviço grátis em uma loja parceira do Brasil. O usuário vê o benefício aplicado no pagamento, não recebe Créditos.',

  /* --- Historial ----------------------------------------------------------- */
  'Cargando...': 'Carregando...',
};

var DICCIONARIOS = { pt: TEXTOS_PT };

/**
 * Los nombres de los paises, solo en la pantalla.
 *
 * La columna "nombre" de la pestana Paises es una sola por pais y sale impresa
 * dentro del documento, asi que no se toca: un T&C de Ecuador dice "Ecuador"
 * aunque quien llene el formulario lo lea en portugues. Lo que cambia aqui es
 * lo que se ve en la pantalla. Juan lo decidio el 20 de septiembre de 2026
 * (punto F2).
 *
 * Solo van los cuatro que cambian. Mexico, Argentina, Chile, Costa Rica y
 * Brasil se escriben igual en los dos idiomas.
 */
var NOMBRES_DE_PAIS_PT = {
  'Colombia': 'Colômbia',
  'Perú': 'Peru',
  'Ecuador': 'Equador',
  'Uruguay': 'Uruguai',
};

var NOMBRES_DE_PAIS = { pt: NOMBRES_DE_PAIS_PT };

/** El nombre de un pais como se lee en la pantalla, en el idioma de la interfaz. */
function nombreDePaisEnIdioma(nombre, idioma) {
  if (!idioma || idioma === 'es') return nombre;
  var mapa = NOMBRES_DE_PAIS[idioma];
  if (!mapa) return nombre;
  var traducido = mapa[nombre];
  return traducido === undefined ? nombre : traducido;
}

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

if (typeof module !== 'undefined') {
  module.exports = {
    IDIOMAS_DE_INTERFAZ: IDIOMAS_DE_INTERFAZ,
    TEXTOS_PT: TEXTOS_PT,
    NOMBRES_DE_PAIS_PT: NOMBRES_DE_PAIS_PT,
    nombreDePaisEnIdioma: nombreDePaisEnIdioma,
    traducirInterfaz: traducirInterfaz,
  };
}
