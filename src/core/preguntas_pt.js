'use strict';

/**
 * Las preguntas en portugues.
 *
 * Solo las que ve un KAM de Brasil, que son las del tipo promocao_br mas las
 * tres de arranque, y una traduccion generica de las preguntas que Brasil
 * comparte con los demas tipos (la tienda, el porcentaje, el tope, el minimo y
 * las veces), por si alguien deja la interfaz en portugues y arma una campana
 * de otro pais. Traducir las ochenta y nueve preguntas seria traducir pantallas
 * que en Brasil no existen: el pais solo tiene habilitado su propio tipo.
 *
 * Lo que no esta aqui sale en espanol, que se entiende, en vez de romperse.
 *
 * La estructura es la misma de PREGUNTAS: lo que va en la raiz vale para
 * cualquier tipo de campana, y lo que va en `variantes.promocao_br` solo para
 * Brasil. La distincion importa: "em reais" y "parceiro" son de Brasil, y
 * cuando iban en la raiz, quien tenia la interfaz en portugues y elegia
 * Colombia y Cashback leia "Qual é o teto do benefício, em reais?" para un
 * tope en pesos.
 *
 * OJO: esta traduccion es de producto, no de Legal, y la escribi yo. Conviene
 * que la lea alguien que hable portugues antes de que la usen los KAM de Brasil.
 * Anotado en docs/PENDIENTES_LEGAL.md.
 */

var PREGUNTAS_PT = {
  pais: {
    pregunta: 'Em qual país a campanha acontece?',
    ayuda: 'Se o seu país não aparecer na lista, ainda não está habilitado.',
    porQue: 'Cada país tem a sua própria entidade legal da Rappi, a sua moeda e a sua autoridade de defesa do consumidor. O documento muda inteiro conforme o país.',
    errores: { vacio: 'Escolha o país da campanha.' },
  },

  negocio: {
    pregunta: 'A campanha é da Rappi ou da Rappi Travel?',
    ayuda: 'Rappi é a entrega de sempre. Rappi Travel são voos, hotéis, carros e pacotes.',
    porQue: 'São duas empresas diferentes, e o documento inteiro muda conforme qual seja.',
    opciones: {
      rappi: { etiqueta: 'Rappi', nota: 'Restaurantes, supermercados, farmácias e tudo o que chega por entrega.' },
      travel: { etiqueta: 'Rappi Travel', nota: 'Voos, hotéis, carros, pacotes, passeios e assistência ao viajante.' },
    },
    errores: { vacio: 'Diga se a campanha é da Rappi ou da Rappi Travel.' },
  },

  tipo: {
    pregunta: 'Que tipo de campanha você vai fazer?',
    ayuda: 'Escolha a que se parece com a sua campanha. Cada opção explica do que se trata.',
    porQue: 'Cada tipo usa um modelo jurídico diferente, aprovado pelo Jurídico. Escolher errado significa gerar o documento errado.',
    errores: { vacio: 'Escolha o tipo de campanha.' },
  },

  tienda: {
    pregunta: 'Em qual loja a campanha vale?',
    ayuda: 'A marca comercial como aparece no aplicativo.',
    porQue: 'O documento nomeia a loja e a define como Loja Participante. Se o nome não coincidir com o do aplicativo, o usuário não a encontra.',
    errores: { vacio: 'Escreva a loja em que a campanha vale.' },
    variantes: {
      promocao_br: {
        pregunta: 'Em qual parceiro a campanha vale?',
        ayuda: 'O nome do parceiro como aparece no aplicativo. Por exemplo: Petz, Drogasmil, Raia.',
        porQue: 'O documento nomeia o Parceiro no parágrafo de abertura e na regra do benefício.',
        ejemplo: 'Petz',
        errores: { vacio: 'Escreva o parceiro em que a campanha vale.' },
      },
    },
  },

  fechaInicio: {
    pregunta: 'Em que dia a campanha começa?',
    ayuda: 'Pode ser hoje. Publique os T&C antes de começar.',
    porQue: 'Os Termos e Condições precisam estar publicados antes de a campanha começar. Se já começou ontem, não dá mais para publicar a tempo.',
    aviso: 'Faltam menos de 48 horas. Dá tempo, mas publique os T&C hoje mesmo.',
    errores: {
      vacio: 'Escolha o dia em que a campanha começa.',
      pasado: 'Essa data já passou. Os T&C se publicam antes de a campanha começar, então escolha hoje ou um dia futuro.',
    },
  },

  horaInicio: {
    pregunta: 'A que horas começa?',
    ayuda: 'Por padrão começa à meia-noite.',
    porQue: 'A hora exata define a partir de quando um pedido vale para a campanha. Um pedido um minuto antes não dá benefício.',
    errores: { vacio: 'Escolha a hora de início.' },
    variantes: {
      promocao_br: {
        // El formulario preselecciona 00:00, como en todos los paises. Los cuatro
        // T&C aprobados de Brasil arrancan a las 00:01, y si Legal Brasil exige
        // esa hora hay que cambiar el valor por defecto, no solo la ayuda. Esta
        // anotado en docs/PENDIENTES_LEGAL.md.
        ayuda: 'Deixamos 00:00 por padrão. Os quatro documentos aprovados começam às 00:01: altere se o Jurídico do Brasil exigir esse horário.',
      },
    },
  },

  fechaFin: {
    pregunta: 'Em que dia termina?',
    ayuda: 'Deixamos igual ao dia de início. Altere se a campanha durar mais.',
    porQue: 'Depois desta data a campanha não dá mais benefício.',
    errores: {
      vacio: 'Escolha o dia em que a campanha termina.',
      orden: 'A campanha não pode terminar antes de começar. Revise a data e a hora de término.',
    },
  },

  horaFin: {
    pregunta: 'A que horas termina?',
    ayuda: 'Por padrão termina às 23:59.',
    porQue: 'Define até que minuto um pedido conta. Os pedidos posteriores são processados como pedidos normais.',
    errores: { vacio: 'Escolha a hora de término.' },
    variantes: {
      promocao_br: {
        ayuda: 'Os documentos aprovados terminam às 23:59.',
      },
    },
  },

  beneficioBr: {
    pregunta: 'O que o usuário ganha?',
    ayuda: 'As quatro formas que o Jurídico do Brasil tem aprovadas. Cada uma muda uma única frase do documento.',
    porQue: 'Daqui saem o parágrafo de abertura e a regra que descreve o benefício. É a única coisa que diferencia os quatro modelos aprovados entre si.',
    opciones: {
      desconto: { etiqueta: 'Desconto % OFF', nota: 'Uma porcentagem de desconto no pedido, com teto em reais.' },
      frete_gratis: { etiqueta: 'Frete grátis', nota: 'A entrega sem custo, até o teto que você definir.' },
      taxa_servico: { etiqueta: 'Taxa de serviço grátis', nota: 'A taxa de serviço sem custo. Os documentos aprovados não colocam teto nela.' },
      taxa_e_frete: { etiqueta: 'Taxa de serviço e frete grátis', nota: 'As duas coisas juntas. É a única que os documentos aprovados usam sem mínimo de compra.' },
    },
    errores: { vacio: 'Escolha o que o usuário ganha.' },
  },

  porcentaje: {
    pregunta: 'Qual porcentagem do pedido você devolve em Créditos?',
    ayuda: 'Só o número. Com 20, um pedido de 50.000 recebe 10.000 em Créditos.',
    porQue: 'É a promessa central da campanha. Uma vez publicado, o usuário pode exigir exatamente essa porcentagem.',
    errores: {
      vacio: 'Escreva a porcentagem que você devolve, sem o sinal de porcentagem.',
      rango: 'A porcentagem vai de 1 a 100.',
    },
    variantes: {
      promocao_br: {
        pregunta: 'Qual é a porcentagem de desconto?',
        ayuda: 'Só o número. O documento escreve "até X%", ou seja, é o desconto máximo.',
        porQue: 'Sai escrito por extenso e em número dentro do documento, como o modelo aprovado exige.',
        errores: {
          vacio: 'Escreva a porcentagem de desconto, sem o sinal de porcentagem.',
          rango: 'A porcentagem vai de 1 a 100.',
        },
      },
    },
  },

  tope: {
    pregunta: 'Qual é o máximo que alguém recebe por pedido?',
    ayuda: 'Mesmo que o pedido seja grande, não recebe mais do que isso.',
    porQue: 'Sem teto, um pedido enorme leva o orçamento inteiro. O teto é o que torna viável um cashback alto.',
    errores: {
      vacio: 'Escreva o máximo de Créditos que uma pessoa recebe por pedido.',
      cero: 'O teto precisa ser maior que zero.',
      mayorQuePresupuesto: 'O teto por pedido é maior que o orçamento total. Assim, o primeiro pedido leva a campanha inteira. Revise os dois números.',
    },
    variantes: {
      promocao_br: {
        pregunta: 'Qual é o teto do benefício, em reais?',
        ayuda: 'O máximo que a campanha cobre em um pedido. Se deixar em branco, o documento sai sem teto.',
        porQue: 'Sem um teto escrito, a campanha não tem limite e o orçamento pode ir embora em poucos pedidos.',
        errores: {
          vacio: 'Escreva o teto do benefício, em reais.',
          cero: 'O teto precisa ser maior que zero.',
        },
      },
    },
  },

  compraMinima: {
    pregunta: 'É preciso gastar um mínimo para participar?',
    ayuda: 'É opcional: se não exigir um mínimo, deixe o campo em branco e siga.',
    porQue: 'Se você exigir, precisa ficar escrito. Se não aparecer no documento, não dá para aplicar depois.',
    errores: { cero: 'Se não quiser exigir um mínimo, deixe o campo em branco.' },
    variantes: {
      promocao_br: {
        pregunta: 'Existe um mínimo de compra, em reais?',
        ayuda: 'Opcional. Dos quatro documentos aprovados, três têm mínimo e o de taxa de serviço e frete grátis não.',
        porQue: 'O mínimo aparece duas vezes no documento: no parágrafo de abertura e na regra do benefício.',
      },
    },
  },

  maxPedidos: {
    pregunta: 'Quantas vezes a mesma pessoa pode ganhar?',
    ayuda: 'Metade das campanhas permite uma só vez por usuário.',
    porQue: 'Sem limite, poucos usuários podem consumir o orçamento em horas. Com limite, o benefício chega a mais gente.',
    opciones: {
      una: { etiqueta: 'Uma só vez', nota: 'O segundo pedido já não dá benefício.' },
      varias: { etiqueta: 'Várias vezes', nota: 'Você diz quantas.' },
      sin_limite: { etiqueta: 'Sem limite', nota: 'Só o orçamento freia.' },
    },
    errores: {
      vacio: 'Diga quantas vezes a mesma pessoa pode ganhar.',
      cuantas: 'Escreva quantos pedidos com benefício uma pessoa pode fazer.',
      rango: 'Precisa ser pelo menos um pedido.',
    },
    variantes: {
      promocao_br: {
        pregunta: 'Quantos pedidos a mesma pessoa pode fazer?',
        ayuda: 'Os documentos aprovados usam um, dois, ou sem limite.',
        porQue: 'O documento escreve por extenso e em número: "o limite de 1 (um) pedido por usuário".',
      },
    },
  },

  metodosPagoBr: {
    pregunta: 'Com quais meios de pagamento vale?',
    ayuda: 'Marque todos os que se aplicam. Os quatro documentos aprovados listam um por um.',
    porQue: 'O documento lista os meios de pagamento válidos pelo nome. Um meio que não estiver na lista não dá direito ao benefício.',
    opciones: {
      dinheiro: { etiqueta: 'Dinheiro', nota: 'Pagamento em espécie.' },
      paypal: { etiqueta: 'Paypal', nota: 'A conta PayPal do usuário.' },
      rappipay: { etiqueta: 'RappiPay', nota: 'O meio de pagamento da própria Rappi.' },
      visa: { etiqueta: 'Cartão de crédito Visa', nota: 'Cartão de crédito Visa.' },
      mastercard: { etiqueta: 'Cartão de crédito Mastercard', nota: 'Cartão de crédito Mastercard.' },
      voucher_refeicao: { etiqueta: 'Voucher Refeição', nota: 'Vale-refeição.' },
    },
    errores: { vacio: 'Marque pelo menos um meio de pagamento.' },
  },

  declaracion: {
    pregunta: 'Confirme que as informações estão corretas',
    ayuda: 'Confirmo que as informações são verdadeiras e correspondem à campanha aprovada.',
    porQue: 'O documento é gerado com o que você escreveu e publicado exatamente assim. Ninguém do Jurídico revisa antes.',
    errores: { vacio: 'Marque a caixa para confirmar que as informações estão corretas.' },
  },
};

var PREGUNTAS_POR_IDIOMA = { pt: PREGUNTAS_PT };

var TEXTOS_TRADUCIBLES = ['pregunta', 'ayuda', 'porQue', 'ejemplo', 'razonDeshabilitado', 'aviso'];

function copiaPlana(objeto) {
  var copia = {};
  for (var llave in objeto) {
    if (Object.prototype.hasOwnProperty.call(objeto, llave)) copia[llave] = objeto[llave];
  }
  return copia;
}

/**
 * La traduccion de un campo para un tipo de campana: la raiz, y encima lo que
 * diga `variantes[tipo]`. Los errores y las opciones se mezclan llave por
 * llave, para que la variante solo tenga que escribir lo que cambia.
 */
function traduccionPara(base, tipo) {
  var variante = base.variantes && tipo ? base.variantes[tipo] : null;
  var mezclada = copiaPlana(base);
  delete mezclada.variantes;
  if (!variante) return mezclada;

  for (var llave in variante) {
    if (!Object.prototype.hasOwnProperty.call(variante, llave)) continue;
    if (llave === 'errores' || llave === 'opciones') {
      var unidas = copiaPlana(mezclada[llave] || {});
      for (var sub in variante[llave]) {
        if (Object.prototype.hasOwnProperty.call(variante[llave], sub)) unidas[sub] = variante[llave][sub];
      }
      mezclada[llave] = unidas;
    } else {
      mezclada[llave] = variante[llave];
    }
  }
  return mezclada;
}

/**
 * La pregunta traducida al idioma de la interfaz, para el tipo de campana que
 * se esta llenando.
 *
 * Campo por campo: lo que no este traducido se queda en espanol. Las opciones se
 * traducen por su valor, no por su posicion, para que agregar una opcion nueva
 * en espanol no desalinee las etiquetas del otro idioma.
 *
 * `pregunta` es lo que devuelve preguntaDe(campo, tipo), ya con la variante del
 * tipo aplicada en espanol; `tipo` hace falta otra vez para elegir la variante
 * en el otro idioma.
 */
function preguntaEnIdioma(pregunta, campoId, idioma, tipo) {
  if (!pregunta || !idioma || idioma === 'es') return pregunta;

  var diccionario = PREGUNTAS_POR_IDIOMA[idioma];
  var base = diccionario ? diccionario[campoId] : null;
  if (!base) return pregunta;
  var traduccion = traduccionPara(base, tipo);

  var mezclada = copiaPlana(pregunta);

  for (var t = 0; t < TEXTOS_TRADUCIBLES.length; t++) {
    if (traduccion[TEXTOS_TRADUCIBLES[t]]) mezclada[TEXTOS_TRADUCIBLES[t]] = traduccion[TEXTOS_TRADUCIBLES[t]];
  }

  if (traduccion.errores) {
    var errores = copiaPlana(pregunta.errores || {});
    for (var e in traduccion.errores) {
      if (Object.prototype.hasOwnProperty.call(traduccion.errores, e)) errores[e] = traduccion.errores[e];
    }
    mezclada.errores = errores;
  }

  if (traduccion.opciones && pregunta.opciones) {
    var opciones = [];
    for (var o = 0; o < pregunta.opciones.length; o++) {
      var opcion = pregunta.opciones[o];
      var deIdioma = traduccion.opciones[opcion.valor];
      if (!deIdioma) { opciones.push(opcion); continue; }
      opciones.push({
        valor: opcion.valor,
        etiqueta: deIdioma.etiqueta || opcion.etiqueta,
        nota: deIdioma.nota || opcion.nota,
      });
    }
    mezclada.opciones = opciones;
  }

  return mezclada;
}

if (typeof module !== 'undefined') {
  module.exports = {
    PREGUNTAS_PT: PREGUNTAS_PT,
    preguntaEnIdioma: preguntaEnIdioma,
    traduccionPara: traduccionPara,
  };
}
