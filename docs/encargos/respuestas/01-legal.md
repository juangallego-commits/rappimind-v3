Voy a responder las 49 preguntas, cada una con su número, en orden y sin agruparlas.
Son 22 bloqueantes (de la 1 a la 23, sin la 17, que solo se confirma) y 27 no bloqueantes (de la 24 a la 49).

1. Brasil sin frase de derechos y sin cláusula de datos
Decisión: promocao_br se queda sin cláusula de datos, igual que los cuatro aprobados. La promoción no recoge datos nuevos y el cierre ya remite, con enlace, al Aviso de Privacidade, que es donde están los derechos y la forma de ejercerlos. BR.texto_derechos_datos queda vacío a propósito y sale de la lista de datos por confirmar. En el mensaje a Legal BR de la 24 se les ofrece la frase de abajo, por si la quieren.
Riesgo: si se mete una cláusula redactada desde Colombia, el único modelo que es íntegramente de Legal BR queda con texto que ellos no aprobaron.
Texto (solo si Legal BR la pide, como segunda oración del cierre br_plataforma): "O tratamento dos dados pessoais do Usuário no âmbito desta promoção observa a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais) e o Aviso de Privacidade indicado acima, no qual constam os direitos do titular e a forma de exercê-los."

2. El tope del frete grátis
Decisión: se queda la corrección que ya está: cubre hasta R$20 y el excedente lo paga el Usuário. Así describe la opción el formulario ("até o teto que você definir"), y es la lectura que impondría el art. 47 del Código de Defesa do Consumidor sobre la frase ambigua. Falta solo que alguien de Brasil confirme que la app cobra el excedente y no quita el beneficio entero. Si lo quita, va el texto B.
Riesgo: si la app quita el envío gratis completo y el T&C dice que cubre hasta R$20, cualquier usuario puede exigir esos R$20.
Texto A (va): "Esclarece-se que o frete grátis está limitado a R$20,00 (vinte reais); o valor que exceder esse limite será cobrado do Usuário."
Texto B (solo si la app lo quita entero): "Esclarece-se que o frete grátis não se aplica quando o valor do frete for superior a R$20,00 (vinte reais); nesse caso, o Usuário pagará o valor integral do frete."

3. Los cinco valores de Brasil escritos en español
Decisión: se corrigen los cinco en la hoja, con el artículo incluido, como en los demás países. En la autoridad de datos hay además un cambio de fondo: la MP 1.317/2025 convirtió la Autoridade Nacional de Proteção de Dados en Agência Nacional de Proteção de Dados, y la sigla ANPD se mantuvo. Después, el Senado la aprobó en febrero de 2026 como proyecto de ley de conversión y la mandó a sanción. Por eso el valor dice "Agência" y no "Autoridade".
Riesgo: hoy promocao_br no imprime ninguno de los cinco, pero el primer bloque en portugués que los use los sacaría con errores visibles.
Texto:
pais_legal: "a República Federativa do Brasil"
ley_aplicable: "as leis da República Federativa do Brasil"
jurisdiccion: "o Foro Central da Comarca da Capital do Estado de São Paulo"
entidad_vigilancia: "o PROCON e a Secretaria Nacional do Consumidor (SENACON)"
autoridad_datos: "a Agência Nacional de Proteção de Dados (ANPD)"
Dos avisos para quien escriba algún día un bloque en portugués que use estos valores. Primero, como traen artículo, no pueden ir después de "de", "em", "a" o "por": el portugués contrae esas palabras ("da", "na", "à", "pelo") y el documento saldría con "pelo o" o con "a a". Segundo, si el bloque usa jurisdiccion, tiene que dejar a salvo el derecho del consumidor a demandar en su domicilio (art. 101, I, del CDC). 
Senado
Migalhas

4. Los enlaces en el cierre de Brasil
Decisión: van tal como están. Confirmaste que los dos abren, y el de privacidad es el que sostiene la decisión 1.
Riesgo: si se quitan, el usuario no tiene cómo llegar al Aviso y la decisión de no poner cláusula de datos se queda sin apoyo.
Texto: sin cambio.

5. ETA: ¿segunda excepción a la regla del organizador?
Decisión: no es excepción, y así queda escrito en DECISIONES. Aquí Rappi no organiza la promoción de un tercero: garantiza el tiempo de entrega de su propio servicio y compensa si no lo cumple. Hay que dejar escritos dos límites. cashback_eta solo sirve para compensar el incumplimiento del ETA de Rappi, y nunca lleva "Organizador" ni un tercero que fondee. Si la campaña la paga una tienda o una marca, va por cashback.
Riesgo: si se anota como excepción, los equipos de otros países tienen un precedente para poner a Rappi de organizadora en promociones normales.
Texto: no hace falta.

6. ETA y la cláusula de datos
Decisión: el bloque de datos se queda en cashback_eta para todas las campañas nuevas. Los dos T&C publicados no se tocan, por tres razones: ya terminaron (fueron de un solo día), tuvieron órdenes, y tu regla es que lo que ya corrió no se modifica. El tratamiento de esas órdenes está cubierto por la Política que el usuario aceptó en la app.
Riesgo: sin la cláusula, cada ETA nuevo incumple el deber de informar finalidad, responsable y derechos del art. 12 de la Ley 1581 de 2012.
Texto: sin cambio (es el bloque datos).

7. México
Decisión: confirmo ,, "días naturales" y "hora de la Ciudad de México". La autoridad de datos está bien: la ley de marzo de 2025 define como autoridad a la Secretaría Anticorrupción y Buen Gobierno, en su artículo 2, fracción XV. PROFECO también está bien. A la frase de derechos le falta una cosa, porque la ley reconoce los cuatro derechos ARCO y, además, la revocación del consentimiento.
Nota que vale para la 7 a la 16: yo confirmo cada valor desde la ley del país, pero ningún país debería salir de piloto sin el visto bueno de su abogado local, que es justo quien va a probar la herramienta. En el hilo de transferencia de datos están los contactos: México, Ana Bravo y Samanta Anzaldo; Argentina y Uruguay, Milena Casella; Perú, Álvaro Castro; Ecuador, Claudia Apolo; Brasil, Amannda Moreira. Para Chile y Costa Rica no tengo contacto confirmado.
Riesgo: sin la revocación, el documento le enumera al usuario menos derechos de los que tiene.
Texto: MX.texto_derechos_datos = "tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO) y el de revocar tu consentimiento" 
cdp
legiscope

8. Perú
Decisión: confirmo ,, "días calendario" y "hora local de la República del Perú". ANPD e INDECOPI están bien. Sobre la pregunta de fondo: sí, en todos los países hay que enumerar los derechos con los nombres de su propia ley, porque la frase genérica no le dice al usuario qué puede pedir.
Riesgo: la frase genérica se queda corta frente al deber de informar que tiene cada ley de datos.
Texto: PE.texto_derechos_datos = "tus derechos de acceso, actualización, inclusión, rectificación, supresión y oposición sobre tus datos personales, y el de revocar tu consentimiento"

9. Argentina
Decisión: confirmo ., "días corridos" y "hora local de la República Argentina". La AAIP está bien. La autoridad de consumo la tiene que confirmar Legal AR, porque esa dependencia nacional ha cambiado de nombre varias veces y no tengo el nombre vigente.
Riesgo: con un nombre viejo, el documento manda al usuario a una dependencia que ya no se llama así.
Texto: AR.texto_derechos_datos = "tus derechos de acceso, rectificación, actualización y supresión de tus datos personales"

10. Chile
Decisión: confirmo ., "días corridos" y "hora de Santiago de Chile". SERNAC está bien. Para los derechos propongo una frase que sirve antes y después de que entre la ley nueva (ver la 11).
Riesgo: si hoy se enumeran los derechos de la Ley 21.719 (portabilidad, oposición amplia), se le promete al usuario algo que la operación chilena quizá no pueda atender antes de que la ley esté vigente.
Texto: CL.texto_derechos_datos = "tus derechos de acceso, rectificación, supresión y bloqueo de tus datos personales, y los demás que te reconozca la legislación vigente"

11. Chile: qué autoridad de datos se nombra
Decisión: no nombrar ninguna autoridad hasta que la agencia esté operando. Por ahora va "las autoridades competentes", y cuando la ley entre en vigencia se cambia por "la Agencia de Protección de Datos Personales". La fecha legal sigue siendo el 1 de diciembre de 2026, pero el Gobierno está evaluando postergarla, así que el cambio se hace a mano ese día y solo si la fecha se mantiene.
Riesgo: si hoy se nombra la agencia, el usuario queda remitido a una entidad que todavía no lo puede atender, y si la vigencia se posterga, el error queda impreso en cada documento chileno.
Texto: CL.autoridad_datos = "las autoridades competentes" 
Araya & Cia

12. Ecuador
Decisión: confirmo "días calendario" y "hora del Ecuador continental". SPDP y Defensoría del Pueblo están bien. El enlace con "persolanes" se queda: confirmaste que abre, así que esa es la dirección real. El separador de miles no lo puedo confirmar, porque en Ecuador conviven los dos formatos. Falta el dato de cómo escribe Legal EC los montos en sus T&C publicados.
Riesgo: con el separador equivocado, "$1.50" y "$1,50" dicen cosas distintas, y el monto del documento no cuadra con el de la pieza.
Texto: EC.texto_derechos_datos = "tus derechos de acceso, rectificación y actualización, eliminación, oposición, portabilidad y suspensión del tratamiento de tus datos personales"

13. Uruguay
Decisión: confirmo ., "días corridos" y "hora local de la República Oriental del Uruguay". La URCDP está bien. A la autoridad de consumo le falta decir de qué entidad es esa área.
Riesgo: "el Área de Defensa del Consumidor" sola no le dice al usuario ante quién acudir.
Texto: UY.texto_derechos_datos = "tus derechos de acceso, rectificación, actualización, inclusión y supresión de tus datos personales"; UY.entidad_vigilancia = "el Área de Defensa del Consumidor del Ministerio de Economía y Finanzas"

14. Costa Rica
Decisión: confirmo "días naturales" y "hora local de la República de Costa Rica". PRODHAB y MEIC están bien. El separador de miles tampoco lo puedo confirmar: falta el dato de cómo escriben los montos los T&C publicados de Rappi Costa Rica.
Riesgo: con el separador equivocado, un monto se puede leer como otro.
Texto: CR.texto_derechos_datos = "tus derechos de acceso, rectificación y supresión de tus datos personales, y el de revocar tu consentimiento"

15. Brasil: los cuatro datos
Decisión: confirmo ., "dias corridos" y "horário de Brasília". texto_derechos_datos queda vacío por la decisión 1.
Riesgo: si sigue en la lista de datos por confirmar, la herramienta muestra a Brasil con un pendiente que ya está resuelto.
Texto: no hace falta.

16. México: el enlace de los T&C de Créditos
Decisión: sin cambio. Si abre, "terminos-ycondiciones" es la dirección real.
Riesgo: si se corrige a ojo, se rompe un enlace que funciona.
Texto: sin cambio.

17. El nombre estructurado de la campaña
Decisión: confirmo el criterio. El nombre sale de los mismos datos que alimentan las cláusulas y por eso no las puede contradecir. El consecutivo para nombres repetidos también está bien.
Riesgo: si se vuelve al texto libre, se reabre el caso de "99%" en el título y "50%" en la cláusula, con la cláusula de condición más favorable al lado.
Texto: no hace falta.

18. Acreditación inmediata con verificación previa
Decisión: cuando la carga es inmediata, la verificación pasa a ser posterior y con reversión de los Créditos. Con "al día siguiente" o "en una fecha", la frase queda como está. Dos cosas a tener en cuenta. La frase vive en el bloque compartido acreditacion, que también usan cashback_day y cashback_eta, así que el cambio depende del tipo de carga y no del modelo. Y la misma contradicción aparece en Travel cuando la carga es "al confirmarse la reserva".
Riesgo: las dos frases juntas son una contradicción impresa, y la duda se resuelve a favor del usuario: acreditación inmediata y sin verificación.
Texto (solo con carga inmediata). ANTES: "Rappi se reserva el derecho de verificar la elegibilidad de cada pedido antes de acreditar el Beneficio; si la verificación determina que el pedido no cumple las condiciones de la Campaña, los Créditos no serán acreditados y se te informará a través de la Plataforma Rappi." DESPUÉS: "Rappi podrá verificar la elegibilidad de cada pedido después de acreditar el Beneficio; si la verificación determina que el pedido no cumple las condiciones de la Campaña, Rappi podrá descontar o revocar los Créditos acreditados y te lo informará a través de la Plataforma Rappi."
En Travel, con carga al confirmarse la reserva: "Rappi Travel podrá verificar la elegibilidad de cada orden después de acreditar el Beneficio; si la verificación determina que la orden no cumple las condiciones de la Campaña, Rappi Travel podrá descontar o revocar los Créditos acreditados y te lo informará a través de la Plataforma Rappi."

19. La lista de secciones de redención
Decisión: sin cambio, por decisión tuya. La lista queda en Restaurantes, Turbo, Supermercados, CPGs y Turbo Restaurantes. Express no entra.
Riesgo: quien necesite Express no la va a encontrar y tendrá que elegir "En cualquier sección" o ir a Legal. Es un costo de uso, no un riesgo legal.
Texto: no hace falta.

20. Cashback Multitienda: máximo de pedidos
Decisión: por tienda. El propio modelo dice que cada tienda organiza su beneficio "con cargo a su propio presupuesto" y responde sola por él, así que un tope común ata entre sí a organizadores que son independientes. Hay una condición: que CRM pueda configurar el límite por tienda. Si solo puede configurar uno global, se deja por campaña, porque el T&C tiene que decir lo que la app hace. La ayuda de la pregunta de veces por persona debe decir: "Es por cada tienda: con 1, el usuario gana una vez en cada tienda participante."
Riesgo: con el tope global, quien ya usó el beneficio en la tienda A reclama en la tienda B con la cláusula 1 en la mano.
Texto (cashback_day, TEXTO_LIMITE_PEDIDOS):
Con 1: "Puedes obtener el Beneficio en un máximo de un (1) pedido por cada Tienda Participante durante la vigencia de la Campaña; los pedidos adicionales en esa misma tienda no generarán el Beneficio y se procesarán como pedidos regulares."
Con más de 1: "Puedes obtener el Beneficio en un máximo de {N en letras} ({N}) pedidos por cada Tienda Participante durante la vigencia de la Campaña; los pedidos adicionales en esa misma tienda no generarán el Beneficio y se procesarán como pedidos regulares."
Sin límite: sin cambio.

21. El RNT de Travel Moustache
Decisión: sin cambio. Es el 79000 y vence el 31 de marzo de 2027, como confirmaste. Dos recomendaciones: reemplaza en el Drive la copia del certificado vencido por la renovada, para que nadie vuelva a tener la duda, y pon un recordatorio en febrero de 2027, porque el día del vencimiento la herramienta deja de generar Travel sola.
Riesgo: ninguno, mientras se renueve a tiempo.
Texto: no hace falta.

22. Base de cálculo del cashback de Travel
Decisión: los impuestos y las tasas no cuentan, y el documento lo tiene que decir con esas palabras. Los impuestos, tasas y contribuciones se recaudan para terceros (el Estado, los aeropuertos), no son precio del Proveedor ni de la marca que paga el beneficio, y excluirlos hace que el costo sea previsible. Si una marca quiere incluirlos, como en el T&C de octubre de 2025, esa campaña la ve Legal con el texto B. Se mantiene la regla de quitar "asistencias o seguros de viaje" cuando Asistencia es una categoría participante.
Riesgo: si el documento calla, el usuario calcula sobre todo lo que pagó, y la duda se resuelve a su favor (art. 34 de la Ley 1480).
Texto A (va). ANTES: "El Beneficio aplica únicamente sobre el valor pagado con dinero real por la tarifa o la reserva de los Productos Participantes, sin incluir cargos por servicio, asistencias o seguros de viaje ni otros servicios adicionales." DESPUÉS: "El Beneficio aplica únicamente sobre el valor pagado con dinero real por la tarifa o la reserva de los Productos Participantes, antes de impuestos, tasas y contribuciones, sin incluir cargos por servicio, asistencias o seguros de viaje ni otros servicios adicionales. No hacen parte de la base de cálculo el IVA, las tasas aeroportuarias ni ningún otro impuesto, tasa o contribución incluido en el precio total."
Texto B (solo por Legal): "El Beneficio aplica sobre el valor total pagado con dinero real por la tarifa o la reserva de los Productos Participantes, incluidos los impuestos, tasas y contribuciones que hagan parte de ese valor, sin incluir cargos por servicio, asistencias o seguros de viaje ni otros servicios adicionales."
Con el texto A cambia también el ejemplo del tope (ver la 42).

23. Travel como agencia de viajes
Decisión: el rol de agencia es el correcto y se queda. Travel Moustache está inscrita como agencia de viajes con el mismo RNT que imprime el documento, y presentarla como simple plataforma de contacto contradice ese registro y lo que dijo la Superintendencia de Transporte. La cláusula ya dice que Rappi Travel no es el organizador, así que la regla 1 está a salvo. La única cláusula que no es coherente con ese rol es la de responsabilidad (ver la 40).
Riesgo: si se reescribe como plataforma de contacto, el documento se contradice con su propio RNT.
Texto: sin cambio.

24. Ratificar la excepción con Legal BR
Decisión: sí, por escrito y en un solo mensaje a Legal BR. Ese mensaje lleva también lo decidido en la 1, 2, 25, 26, 27 y 28, más los dos pendientes de forma que ya estaban anotados (la hora de inicio 00:01 y cómo se escribe "um (1) pedido"). En DECISIONES queda escrito que la excepción es texto heredado de Legal BR, no una política de producto.
Riesgo: sin ratificación, el primer abogado de otro país que vea el modelo lo va a citar como precedente.
Texto (mensaje): "Hola equipo. RappiMind ya genera los T&C de promociones de Brasil con el texto que ustedes aprobaron, en el que Rappi concede, modifica y cancela la promoción. En los demás países la regla es que Rappi nunca es organizador; en Brasil aceptamos su redacción tal cual, como excepción solo para Brasil y sin valor de precedente. Les pido confirmar por este medio: (i) esa excepción; (ii) que el frete grátis cubre hasta el tope y el excedente lo paga el usuario; (iii) las correcciones de redacción del anexo; (iv) si quieren agregar al cierre la frase sobre datos personales que les proponemos; y (v) si la hora de inicio debe ser 00:01 y si el límite se escribe "um (1) pedido" o "1 (um) pedido"."

25. Las correcciones de redacción del texto brasileño
Decisión: apruebo las siete. Son errores verificables y ninguna toca criterio jurídico. Legal BR las ratifica en el mensaje de la 24.
Riesgo: si se devuelve alguna, queda impresa una "doação" que no existe en la promoción o una frase sin verbo.
Texto: sin cambio.

26. Las dos cláusulas duplicadas de Brasil
Decisión: se mantiene la eliminación, porque cada contenido sigue apareciendo una vez en REGRAS PRINCIPAIS.
Riesgo: la repetición no protege más y abre la puerta a que alguien cambie una copia y deje la otra igual.
Texto: sin cambio.

27. Tres detalles del texto brasileño
Decisión:

"O Rappi" se queda en masculino, que es la forma de los cuatro aprobados, y la única "a Rappi" se unifica. ANTES: "não sendo a Rappi responsável". DESPUÉS: "não sendo o Rappi responsável".
Se unifica en "pessoa física", que es la que usa el resto del documento y la configuración. ANTES: "“Usuário” para fins deste T&C significa a pessoa humana inscrita na plataforma Rappi." DESPUÉS: "“Usuário” para fins deste T&C significa a pessoa física inscrita na plataforma Rappi."
"São Paulo/SP" no va nunca. Es la línea de lugar con que cierran los documentos corporativos de Rappi Brasil: los T&C de uso de la plataforma terminan con "São Paulo/SP, Brasil". En una promoción no produce ningún efecto y obligaría a imprimir una fecha de emisión.
Riesgo: si el mismo documento usa dos nombres para la misma persona, se abre la discusión de si son dos categorías distintas. 
Rappi

28. El nombre de la política de privacidad de Brasil
Decisión: el documento está publicado con ese mismo título, con "Informação" en singular, así que se cita tal cual. Lo único que se corrige es el artículo, que no hace parte del título: va "o", no "a". Aplica el aviso de contracciones de la 3.
Riesgo: si se "corrige" el título, el T&C cita un documento con un nombre que no existe publicado.
Texto: BR.politica_privacidad = "o Aviso de Privacidade e Políticas de uso das Informação utilizadas pela Rappi" 
Rappi

29. La interfaz en portugués
Decisión: pedirle la lectura a Amannda Moreira, la persona de Brasil en el hilo de transferencia de datos, o a quien ella indique, junto con un KAM de Brasil. Que lean primero, en este orden: las cuatro opciones de "O que o usuário ganha?", la ayuda del teto del frete grátis, la del mínimo de compra y los mensajes de error.
Riesgo: una ayuda mal traducida produce una respuesta equivocada que sí queda impresa, empezando por el tope de la pregunta 2.
Texto: no hace falta.

30. ETA: "Rappi se obliga a cumplir con el ETA"
Decisión: se matiza con una oración nueva al final de la cláusula del beneficio, sin tocar la obligación. La salvedad cubre solo causas del usuario y fuerza mayor en sentido legal, que no incluye lluvia ni trancones, porque son previsibles.
Riesgo: sin salvedad, quien da una dirección errada o no sale a recibir también cobra el 100%, y eso invita al abuso.
Texto (va después de "Rappi se obliga a cumplir con el ETA exhibido dentro de la Plataforma Rappi."): "No habrá lugar al Beneficio cuando el retraso se deba a causas imputables al Usuario/Consumidor, como una dirección de entrega incorrecta o incompleta, la modificación de la orden o de la dirección después de realizada, o la falta de disponibilidad para recibirla, ni cuando obedezca a fuerza mayor o caso fortuito."

31. La cláusula de seguridad vial del ETA
Decisión: se queda la versión nueva.
Riesgo: la versión publicada ("es determinada por la gestión del restaurante") contradice la obligación de cumplir el ETA.
Texto: sin cambio.

32. Los cuatro cambios de forma del ETA
Decisión: apruebo los cuatro.
Riesgo: si se devuelven, Rappi queda sin identificar en su propio documento y el presupuesto vuelve a tener decimales en una unidad que no se fracciona.
Texto: sin cambio.

33. La modalidad fija en "Turbo Restaurantes"
Decisión: falta un dato: si la campaña de 15 minutos corre, o va a correr, en Turbo de mercado. Si la respuesta es sí, la modalidad pasa a ser una lista cerrada con "Turbo Restaurantes" (preseleccionada) y "Turbo", que son los mismos nombres de la lista de secciones que confirmaste. Si es no, queda fija.
Riesgo: si la campaña corre en Turbo con el modelo fijo en "Turbo Restaurantes", el documento promete la garantía en la modalidad equivocada.
Texto: no hace falta.

34. Cashback: los siete cambios frente al modelo de julio
Decisión: apruebo los siete.
Riesgo: si el rol de Rappi vuelve al final, el documento usa "Rappi" antes de definirlo.
Texto: sin cambio.

35. Los tres textos nuevos del catálogo de opciones
Decisión:

La frase de pagos con Créditos en "Todos" y "RappiCard" queda aprobada, porque evita dar cashback sobre cashback.
Los dos segmentos quedan aprobados, con un ajuste en "reactivados": la palabra "días" sola se presta a discutir si son hábiles, así que debe usar el término del país. ANTES: "durante los {N en letras} ({N}) días anteriores al inicio de la Campaña". DESPUÉS: "durante los {N en letras} ({N}) {termino_dias} anteriores al inicio de la Campaña" (en Colombia, "días calendario").
"Solo Turbo" queda aprobada. "Consumo en el local" se rehace en la 39, y las dos opciones dejan de ser casillas.
Riesgo: con "días" a secas, un usuario que quedó por fuera por pocos días puede alegar que eran hábiles.

36. Carrera de Compras
Decisión: los siete cambios quedan aprobados y la cláusula de impuestos no se toca. Se suman tres cosas nuevas, pero antes de la pregunta del acuerdo de datos hay dos fallas que conviene corregir.

Falla a. Hoy el formulario pregunta quién entrega el premio aunque el premio sean Créditos. El caso de prueba CC01 genera un premio en Créditos "entregado" por el Organizador, con la frase de compartir datos: un envío de datos que no tiene razón de ser. La pregunta "¿Quién entrega el premio?" solo debe salir con premio físico. Con Créditos, la viñeta de entrega quedaría así (texto nuevo, lo decides tú): "Los Créditos serán acreditados por Rappi en la Billetera de Créditos del ganador, por cuenta del Organizador, una vez aceptado el premio."

Falla b. La frase de datos no cuadra con el Acuerdo Marco que tienes en el Drive. Habla solo de "datos de contacto", y el Anexo A incluye también la dirección de entrega y el número de documento. Deja la autorización para después ("previa autorización del ganador"), cuando el acuerdo dice que la autorización consta en el T&C de la campaña. Y no dice la finalidad, que la cláusula cuarta del acuerdo exige que el T&C informe.
ANTES: "Para la entrega del premio, Rappi podrá compartir con el Organizador únicamente los datos de contacto del ganador que sean estrictamente necesarios para ese fin, previa autorización del ganador."
DESPUÉS: "Si resultas ganador, al aceptar el premio autorizas a Rappi para transferir al Organizador únicamente los datos estrictamente necesarios para entregártelo, que pueden ser tu nombre y apellidos, correo electrónico, número de teléfono celular, dirección de entrega y número de documento de identidad. El Organizador solo podrá usar esos datos para entregarte el premio, coordinar la entrega, verificar tu identidad al recibirlo y atender los reclamos sobre ella, y deberá suprimirlos una vez cumplida esa finalidad."

(i) El acuerdo de transferencia de datos. Va una pregunta nueva, que sale solo si el premio es físico y lo entrega el Organizador. No bloquea la generación del T&C, porque los datos salen después del concurso. La respuesta queda guardada en Mis campañas y la pantalla final repite el aviso.
Enunciado: "¿El Organizador ya firmó el acuerdo de transferencia de datos?"
Ayuda: "Sin ese acuerdo firmado no se le pueden enviar los datos del ganador."
Por qué: "Rappi responde por los datos de sus usuarios. Enviarlos a una marca sin acuerdo firmado nos expone ante la autoridad de datos personales."
Opciones: "Sí, ya está firmado" (nota en Colombia: "La marca aparece en verde en la tabla de acuerdos marco.") y "No, o no sé" (nota: "Te mostramos cómo se firma. Puedes generar el T&C igual.").
Panel para Colombia, si responde "No, o no sé":
"Cómo se firma en Colombia (una sola vez al año por marca)
Primero mira si la marca ya está en verde en la tabla de acuerdos marco.

Pídele a la marca razón social, NIT, domicilio, nombre y cédula del representante legal o apoderado, y el correo para la firma. Si firma un apoderado, pide también el certificado de cámara de comercio o el poder.
Pídele nombre, cargo, correo y teléfono de las personas que van a manejar las Órdenes de Transferencia. Por Rappi, esa persona eres tú.
Mándale esa información a Legal para completar el Acuerdo Marco.
Envíale el acuerdo a la marca para revisión y explícale por qué se firma.
Cerrada la negociación, Legal lo manda a firma.
Cuando esté firmado, Legal lo carga en la tabla y la marca queda en verde.
En cada campaña llenas la Orden de Transferencia: campaña, número de ganadores, qué datos se envían, cuándo se entrega el premio y cuándo se borran los datos. La marca la acepta por correo y no se vuelve a firmar nada.
Cuando entregue el premio, la marca borra los datos y le manda a Rappi el certificado de supresión.
Si la marca no está en verde o la Orden no está aceptada, ni Producto ni Data te pueden entregar los datos.
Si no alcanzan a firmar antes de la entrega, cambia tu respuesta a "Rappi, como operador logístico": la marca le entrega los premios a Rappi y Rappi se los lleva al ganador."
Panel para los demás países: "En {país} el acuerdo se firma con el modelo de Legal de tu país. Ábrelo aquí y escríbele a Legal antes de comprometer la entrega del premio." Chile y Costa Rica no tienen modelo en la carpeta, así que su panel dice: "En {país} todavía no hay modelo de acuerdo: escríbele a Legal antes de comprometer la entrega del premio." Brasil no entrega premios físicos. Los enlaces de cada país van en el bloque final. Revisa que los KAM tengan acceso de lectura: en el hilo, dos personas no pudieron abrir la carpeta.

(ii) El valor del premio. Va otra pregunta nueva, solo con premio físico.
Enunciado: "¿Cuánto vale el premio, con IVA incluido?"
Ayuda: "Por cada ganador, en pesos. Por ejemplo: 1500000."
Por qué: "Con ese valor se calculan los impuestos del premio. Si el documento no lo dice, no hay con qué medir si lo entregado es lo prometido."
Texto. ANTES: "Cada ganador recibirá el siguiente premio: {descripción}."
DESPUÉS, con un ganador: "El ganador recibirá el siguiente premio: {descripción}, con un valor comercial de {valor en letras} pesos M/Cte. (${valor}), IVA incluido."
DESPUÉS, con varios: "Cada ganador recibirá el siguiente premio: {descripción}, con un valor comercial unitario de {valor en letras} pesos M/Cte. (
𝑣
𝑎
𝑙
𝑜
𝑟
)
,
𝐼
𝑉
𝐴
𝑖
𝑛
𝑐
𝑙
𝑢
𝑖
𝑑
𝑜
.
𝐸
𝑙
𝑣
𝑎
𝑙
𝑜
𝑟
𝑐
𝑜
𝑚
𝑒
𝑟
𝑐
𝑖
𝑎
𝑙
𝑡
𝑜
𝑡
𝑎
𝑙
𝑑
𝑒
𝑙
𝑜
𝑠
𝑝
𝑟
𝑒
𝑚
𝑖
𝑜
𝑠
𝑑
𝑒
𝑙
𝑎
𝐶
𝑎
𝑚
𝑝
𝑎
𝑛
~
𝑎
𝑒
𝑠
𝑑
𝑒
𝑡
𝑜
𝑡
𝑎
𝑙
𝑒
𝑛
𝑙
𝑒
𝑡
𝑟
𝑎
𝑠
𝑝
𝑒
𝑠
𝑜
𝑠
𝑀
/
𝐶
𝑡
𝑒
.
(
valor),IVAincluido.ElvalorcomercialtotaldelospremiosdelaCampa
n
~
aesdetotalenletraspesosM/Cte.({total})."
El monto sigue la misma regla del "de" que ya usan los demás montos ("un millón de pesos M/Cte.").

(iii) Productos con nombre y EAN. El campo de texto libre "Productos (separados por comas)" pasa a ser una lista de filas con dos datos cada una: el nombre como aparece en la app y el código EAN. El EAN se valida: 8, 12, 13 o 14 números, con dígito de control correcto.
Enunciado: "¿Cuáles productos participan?"
Ayuda: "Uno por fila: el nombre como sale en la app y su EAN, el número del código de barras."
Por qué: "El EAN identifica el producto sin discusión. Si dos productos se llaman parecido, el EAN decide qué compra suma."
Errores: "El EAN tiene 8, 12, 13 o 14 números. Revisa que esté completo." y "Ese EAN no existe: el último número no cuadra. Cópialo otra vez del empaque o del catálogo."
Texto. ANTES: "Participan en el concurso únicamente los siguientes productos de la Tienda Participante (en adelante, los “Productos Participantes”): {lista}."
DESPUÉS: "Participan en el concurso únicamente los siguientes productos de la Tienda Participante, identificados con su nombre y su código de barras EAN (en adelante, los “Productos Participantes”):

{nombre} (EAN {código})
Solo suman al acumulado las unidades cuyo código EAN coincida con alguno de los anteriores."

(iv) La cláusula de impuestos: sin cambio.
Riesgo: si Rappi envía los datos del ganador sin acuerdo firmado y con un T&C que no dice a quién van ni para qué, queda sin soporte frente a la SIC, que es exactamente lo que el acuerdo marco existe para evitar.

37. El nombre estructurado dentro de la cláusula de Carrera de Compras
Decisión: sin cambio. Es el nombre oficial y tiene que ser idéntico en el título y en el articulado. Lo raro es solo estético.
Riesgo: si la cláusula usa un nombre distinto al del título, vuelve a haber dos nombres para la misma campaña.
Texto: sin cambio.

38. Nombrar las secciones donde los Créditos no aplican
Decisión: sí, hay que nombrarlas. Cuando la redención es "En cualquier sección", el formulario muestra las mismas casillas del ETA (Rappi Travel, SOAT, Cajero ATM y Rappi Favor), marcadas de entrada, y el texto las dice.
Riesgo: una exclusión que no está en el T&C no se le puede oponer al usuario. Si la app le rechaza los Créditos en Rappi Favor, reclama con el documento en la mano.
Texto. ANTES: "Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio." DESPUÉS, con casillas marcadas: "Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, a excepción de Rappi Travel, SOAT, Cajero ATM y Rappi Favor, dentro del Territorio." Si no hay ninguna casilla marcada, queda como está.

39. "Consumo en el local"
Decisión: tienes razón en que está raro, y por tres cosas. El texto no nombra una opción que el usuario pueda reconocer en la app, como sí pasa con "Turbo". El formulario deja marcar "solo Turbo" y "solo consumo en el local" al mismo tiempo, y el documento sale con dos "únicamente" que no pueden ser ciertos a la vez. Y "Solo si consume en el local" no dice quién consume, tanto que ya se leyó como dónde se gastan los Créditos. El arreglo: en el formulario, una sola elección; en el modelo, el nombre exacto de la opción entre comillas y la exclusión expresa del domicilio. Falta el dato del nombre exacto con el que la app muestra hoy esa opción en Colombia. Mientras no lo tengamos, la opción se oculta.
Riesgo: como está hoy, quien pidió a domicilio puede decir que no sabía qué era "consumo en el local", y dos condiciones incompatibles se leen a su favor.
Texto del formulario (reemplaza las casillas de condiciones):
Enunciado: "¿En qué pedidos se gana el beneficio?"
Ayuda: "Si la marca no puso ninguna condición, deja la primera opción."
Opciones: "En cualquier pedido" (nota: "Domicilio, Turbo o cualquier forma de pedir."), "Solo en pedidos por Turbo" (nota: "Un pedido por el resto de la app no da el beneficio.") y "Solo en pedidos por “{nombre en la app}”" (nota: "Un pedido a domicilio no da el beneficio.").
El "por qué" actual se queda.
Texto del modelo. ANTES: "El Beneficio aplica únicamente para pedidos realizados bajo la modalidad de consumo en el local disponible en la Plataforma Rappi." DESPUÉS: "El Beneficio aplica únicamente para pedidos realizados a través de la opción “{nombre en la app}” de la Plataforma Rappi; los pedidos con entrega a domicilio no generan el Beneficio."
El nombre de la opción va en un dato nuevo del país, no en texto libre.

40. La responsabilidad de Rappi Travel
Decisión: mi opinión, como tercero, es cambiarla por la alternativa R4, que ya está escrita. R4 conserva lo que sí protege (fallas técnicas y de conexión con los Proveedores), deja en el Proveedor las condiciones de su propio servicio y quita la exclusión general por la prestación, que es la parte que no aguanta. La decisión es tuya. Si la mantienes, déjala anotada como riesgo aceptado.
Riesgo: con la calificación de proveedor indirecto con responsabilidad solidaria, esa exclusión cae en el art. 43, numeral 1, de la Ley 1480: es ineficaz de pleno derecho y, además, sirve como prueba en una investigación.
Texto (reemplaza la cláusula completa en los dos modelos de Travel): "Las condiciones de prestación de cada servicio turístico, como equipaje, cambios, cancelaciones, demoras y penalidades, son las del Proveedor y de la tarifa adquirida, y se informan antes de pagar. Rappi Travel no será responsable por las fallas técnicas, interrupciones o limitaciones en la disponibilidad de los Sistemas Rappi Travel ajenas a su control razonable, ni por los rechazos de órdenes derivados de fallas en la conexión con los Proveedores. Nada de lo anterior limita los derechos que la ley te reconoce como consumidor. Rappi Travel es responsable de: (i) la correcta acreditación de los Créditos conforme a las condiciones de la Campaña; (ii) la publicación veraz y completa de los presentes Términos y Condiciones; y (iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña." En descuento_travel, el punto (i) dice: "la correcta aplicación del descuento conforme a las condiciones de la Campaña".

41. Los Créditos que entrega Travel
Decisión:

Créditos sin documento madre: es correcto. Se rigen por el T&C de la campaña y, cuando se pueden usar por fuera de Travel, también por los T&C de Créditos de la Plataforma Rappi.
"Cuenta" y "Créditos", como decidiste. Ojo con esto: los T&C de Uso de la Plataforma, en la versión publicada en about.rappi.com, todavía definen los Créditos como los que están en la sección "Promos y Créditos". Si la app ya dice "Cuenta" y "Créditos", el que está desactualizado es ese documento madre, no el nuestro, y vale la pena avisarle a quien lo mantiene. 
rappi
La exclusión de pagos con Créditos en las campañas de descuento se queda: evita montar un beneficio promocional sobre otro y es coherente con la cláusula de no acumulación.
Aviso y no bloqueo, como decidiste.
Riesgo: sin el párrafo de remisión del punto 1, los Créditos usados en delivery quedarían regidos por un T&C de viajes que no regula ese uso.

42. Tres frases nuevas de Travel
Decisión:

Cancelaciones: visto bueno a "Reembolso parcial" y a "Plazo".
Ejemplo del tope y descuento variable: visto bueno, con un ajuste que viene obligado por la 22. El ejemplo tiene que hablar del valor que cuenta para el cálculo, no del valor pagado. ANTES: "Por ejemplo, para recibir el máximo de {tope} Créditos en una orden, el valor pagado debe ser de al menos {umbral}; si pagas menos, recibirás el {porcentaje} de lo pagado." DESPUÉS: "Por ejemplo, para recibir el máximo de {tope} Créditos en una orden, el valor que cuenta para el cálculo del Beneficio debe ser de al menos {umbral}; si es menor, recibirás el {porcentaje} de ese valor."
Entidad de vigilancia: visto bueno a "la Superintendencia de Industria y Comercio y la Superintendencia de Transporte, según corresponda".
Riesgo: sin el ajuste, el ejemplo le promete el tope a quien paga el umbral con impuestos incluidos, aunque su tarifa sin impuestos no llegue.

43. Tres cosas raras de Travel
Decisión:

Ámbito: sí, partirlo según las categorías marcadas. Con vuelos y otras categorías juntas, va la frase completa de hoy. Solo vuelos, nacional: "Aplica únicamente para vuelos con origen y destino en {país}." Sin vuelos, nacional: "Aplica únicamente para servicios que se presten en {país}." Solo vuelos, internacional: "Aplica únicamente para vuelos con origen o destino fuera de {país}." Sin vuelos, internacional: "Aplica únicamente para servicios que se presten fuera de {país}."
Nombre sin marca: la marca pasa a ser obligatoria, y el nombre nunca empieza con "Rappi Travel", porque en el título se leería como quien hace la campaña.
Conteo por trayecto: falta el dato de si alguna campaña real lo usa. Mientras tanto la opción se queda, porque solo aclara y no agrega riesgo.
Riesgo: una campaña de hoteles que habla de vuelos confunde sobre qué compra aplica, y un título que empieza con "Rappi Travel" contradice la cláusula 1.

44. Los descuentos que siguen fuera
Decisión: quedan fuera a propósito en esta versión, y para las siguientes propongo este orden: (1) 2x1 y 3x2, pidiéndole a Legal CO que republique sus T&C generales en 2026 y sumándolos a la lista de enlaces, que es lo más barato; (2) obsequios por compra, que sí necesitan modelo propio porque prometen unidades concretas; (3) los T&C generales de los demás países, a medida que cada Legal publique los suyos. Los combos no entran como tipo: si se anuncian con descuento, usan "Descuento en Productos Seleccionados".
Riesgo: si se abren tipos sin modelo aprobado, se rompe el determinismo, que es lo que le da valor a la herramienta.
Texto: no hace falta.

45. "Descuento en Productos Seleccionados" repetido
Decisión: se conserva el de /colombia/2026/descuentoprodselecc, que es el que sigue la ruta con año de la lista de 2026, y la herramienta muestra solo ese. El otro no se borra. Si dice lo mismo, se redirige al de 2026 con un mapeo 301 en Squarespace, porque puede haber piezas vivas apuntando a él. Si no dice lo mismo, se deja quieto con un aviso de vigencia, como en la 47. Mostrar los dos con aviso es peor que mostrar uno: le pasa al comercial una decisión legal que no puede tomar.
Riesgo: dos campañas iguales terminan respaldadas por documentos distintos, según cuál eligió cada comercial.
Texto: no hace falta.

46. Descripciones de los dos cupones (propuesta mía, para que la apruebe Legal CO)
Decisión: propongo estas, que salen de los nombres que los dos cupones tenían en la lista de 2024 ("descuento en pesos" y "descuento en porcentaje sobre el valor total de la orden"). De paso: si el título publicado lo permite, "Cupón" lleva tilde y el guion de los nombres se cambia por dos puntos.
Riesgo: sin descripción, el comercial elige por el nombre y puede respaldar un cupón de porcentaje con el de valor fijo.
Texto:
Cupón de valor fijo. Beneficio: "Descuento de un monto fijo de dinero sobre el pedido al redimir un cupón o código (el valor dependerá de lo que indique la pieza publicitaria)." Para qué sirve: "Respaldo legal para cupones o códigos que descuentan un valor fijo del pedido (ej. "$10.000 OFF con el código X"). Úsalo cuando el usuario debe ingresar o activar el cupón para ver la rebaja; el valor, la compra mínima y la vigencia van en la pieza."
Cupón de toda la tienda. Beneficio: "Porcentaje de descuento sobre el valor total del pedido al redimir un cupón o código (el porcentaje y el tope dependerán de lo que indique la pieza publicitaria)." Para qué sirve: "Respaldo legal para cupones o códigos que dan un porcentaje de descuento sobre el valor total del pedido (ej. "20% OFF en toda la tienda con el código X"). Úsalo cuando el descuento no es automático y el usuario debe ingresar o activar el cupón; el porcentaje, el tope y la compra mínima van en la pieza."

47. El T&C general de Cashback que salió de la lista de 2026
Decisión: no se borra ni se redirige. Se deja publicado como prueba de lo que aceptaron los usuarios de 2025, con un encabezado que diga que no aplica a campañas desde 2026. Todo cashback de 2026 sale de RappiMind, con documento propio.
Riesgo: publicado sin fecha de corte, un usuario de 2026 lo puede invocar si le conviene más (art. 34 de la Ley 1480); borrado o redirigido, se pierde la prueba de las campañas de 2025.
Texto (encabezado): "Estos Términos y Condiciones no aplican a campañas iniciadas a partir del 1 de enero de 2026. Cada campaña de cashback vigente tiene sus propios Términos y Condiciones, publicados en su propio enlace."

48. Un enlace de 2024 para una vigencia de 2026
Decisión: republicarlo en la ruta de 2026, con la vigencia de la lista, y cambiar el enlace en la herramienta. El de 2024 se queda quieto como prueba de lo que respaldó. No abrí la página: si menciona fechas de 2024, hoy no respalda nada de 2026; si no las menciona, sí respalda, pero igual conviene republicarlo.
Riesgo: la herramienta estaría entregando como vigente un enlace que puede estar vencido por su propio texto.
Texto: no hace falta.

49. El criterio de cuándo hace falta un T&C propio
Decisión: la lógica sigue vigente, pero hay que actualizarla en cuatro puntos.
(1) Las dos filas de cashback sobran. En 2026 ya no hay T&C general de cashback (ver la 47), así que todo cashback sale de RappiMind, incluido el de Créditos redimibles en varias secciones. Los concursos siguen con T&C propio, que ahora genera RappiMind (Carrera de Compras) o Legal (azar y Travel).
(2) "Cupones que se redimen por fuera de Rappi" y "usuarios con condiciones especiales" quedaron cubiertos en parte por los generales de 2026 (Código para eventos externos, Usuarios Nuevos en Turbo, los de Pro y Pro Black). La regla correcta ahora es: si ningún T&C general describe exactamente la condición, la campaña va a Legal.
(3) Faltan dos filas: productos con reglas propias de publicidad (alcohol, tabaco, vapeadores, medicamentos, fórmulas infantiles, apuestas) y beneficios atados a un medio de pago.
(4) Los tres requisitos de la pieza siguen vigentes. Son la base del encargo de leyendas y deben ir también en la pantalla final del T&C general.
Falta un dato para cerrar el punto (2): si los dos cupones generales de 2026 cubren cupones de una sola tienda, porque la fila de 2024 decía que eso exigía T&C propio.
Riesgo: sin este filtro, un comercial usa un T&C general para una campaña con una condición que el general no dice, y esa condición no se le puede exigir al usuario.
Texto (preguntas de sí o no antes de mostrar la lista de T&C generales; cualquier sí cambia el camino, y si todas son no, se muestra la lista):

"¿El usuario recibe Créditos o gana un premio?" Si es sí: "Esto no es un T&C general. Vuelve a los tipos y elige Cashback o Carrera de Compras."
"¿Es un evento especial, como Hora Loca o Pro Week?" Si es sí, va a Legal. Por qué: "Las campañas de mucha visibilidad llevan T&C propio."
"¿Es alcohol, tabaco, vapeador, medicamento, fórmula infantil o apuesta?" Si es sí, va a Legal. Por qué: "Esas categorías tienen reglas propias de publicidad."
"¿El descuento depende del medio de pago?" Si es sí, va a Legal. Por qué: "Un descuento atado a un banco o a una tarjeta tiene otro responsable y otro documento."
"¿El cupón se usa por fuera de Rappi?" Si es sí: "Solo si es un código de descuento para un evento externo: usa ese T&C general. Si no, lo redacta Legal."
"¿Aplica solo a ciertos usuarios?" Si es sí, aparecen tres opciones: "Pro o Pro Black" (lleva a los generales de Pro), "Nunca han comprado en Turbo" (lleva a Usuarios Nuevos en Turbo) y "Otra condición" (va a Legal).
Pantalla final del T&C general: "Tu pieza debe decir siempre: el mínimo de compra, si lo hay; el máximo de descuento o de cashback; y a qué usuarios aplica, si no es para todos."

Nota sobre las fuentes: leí el encargo y el repositorio desde la copia sincronizada en este proyecto, porque GitHub me devuelve el repo como privado y no lo pude clonar. Si main cambió después de la última sincronización, dime y reviso contra la versión nueva. Los hilos de Slack y la carpeta de Drive los leí directamente, y lo de Brasil, México y Chile lo verifiqué hoy en fuentes públicas.

PARA EL REPOSITORIO

decisión 1: promocao_br sin cláusula de datos, como los cuatro aprobados; la frase opcional va en el mensaje a Legal BR (decisión 24)
BR.texto_derechos_datos = "" (vacío a propósito)
BR.por_confirmar_en_pruebas: quitar texto_derechos_datos
bloque br_plataforma, solo si Legal BR la pide: agregar al final "O tratamento dos dados pessoais do Usuário no âmbito desta promoção observa a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais) e o Aviso de Privacidade indicado acima, no qual constam os direitos do titular e a forma de exercê-los."
decisión 2: se queda el tope con excedente a cargo del Usuário, sujeto a que Brasil confirme que la app cobra solo el excedente
modelo promocao_br, frete grátis: sin cambio "Esclarece-se que o frete grátis está limitado a R$20,00 (vinte reais); o valor que exceder esse limite será cobrado do Usuário."
modelo promocao_br, frete grátis, solo si la app quita el beneficio entero: DESPUÉS "Esclarece-se que o frete grátis não se aplica quando o valor do frete for superior a R$20,00 (vinte reais); nesse caso, o Usuário pagará o valor integral do frete."
BR.pais_legal = "a República Federativa do Brasil"
BR.ley_aplicable = "as leis da República Federativa do Brasil"
BR.jurisdiccion = "o Foro Central da Comarca da Capital do Estado de São Paulo"
BR.entidad_vigilancia = "o PROCON e a Secretaria Nacional do Consumidor (SENACON)"
BR.autoridad_datos = "a Agência Nacional de Proteção de Dados (ANPD)"
decisión 3: ningún bloque en portugués puede poner estos valores después de "de", "em", "a" o "por"; si un bloque usa jurisdiccion, deja a salvo el foro del domicilio del consumidor (art. 101, I, CDC)
decisión 4: sin cambio (los dos enlaces del cierre van)
decisión 5: sin excepción (garantía de servicio); cashback_eta solo para compensar el incumplimiento del ETA de Rappi, sin Organizador ni tercero que fondee
decisión 6: sin cambio en cashback_eta (el bloque datos se queda); los dos T&C publicados no se tocan
MX.separador_miles = ","
MX.termino_dias = "días naturales"
MX.texto_hora_local = "hora de la Ciudad de México"
MX.texto_derechos_datos = "tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO) y el de revocar tu consentimiento"
MX.autoridad_datos: sin cambio ("la Secretaría Anticorrupción y Buen Gobierno")
MX.entidad_vigilancia: sin cambio ("la Procuraduría Federal del Consumidor (PROFECO)")
PE.separador_miles = ","
PE.termino_dias = "días calendario"
PE.texto_hora_local = "hora local de la República del Perú"
PE.texto_derechos_datos = "tus derechos de acceso, actualización, inclusión, rectificación, supresión y oposición sobre tus datos personales, y el de revocar tu consentimiento"
AR.separador_miles = "."
AR.termino_dias = "días corridos"
AR.texto_hora_local = "hora local de la República Argentina"
AR.texto_derechos_datos = "tus derechos de acceso, rectificación, actualización y supresión de tus datos personales"
AR.entidad_vigilancia: sin cambio hasta que Legal AR confirme el nombre vigente
CL.separador_miles = "."
CL.termino_dias = "días corridos"
CL.texto_hora_local = "hora de Santiago de Chile"
CL.texto_derechos_datos = "tus derechos de acceso, rectificación, supresión y bloqueo de tus datos personales, y los demás que te reconozca la legislación vigente"
CL.autoridad_datos = "las autoridades competentes"
CL.autoridad_datos, el 1 de diciembre de 2026 y solo si la Ley 21.719 entra en vigencia ese día = "la Agencia de Protección de Datos Personales"
EC.separador_miles: sin cambio hasta que Legal EC diga cómo escribe los montos
EC.termino_dias = "días calendario"
EC.texto_hora_local = "hora del Ecuador continental"
EC.texto_derechos_datos = "tus derechos de acceso, rectificación y actualización, eliminación, oposición, portabilidad y suspensión del tratamiento de tus datos personales"
EC.url_privacidad: sin cambio ("persolanes" es la dirección real)
UY.separador_miles = "."
UY.termino_dias = "días corridos"
UY.texto_hora_local = "hora local de la República Oriental del Uruguay"
UY.texto_derechos_datos = "tus derechos de acceso, rectificación, actualización, inclusión y supresión de tus datos personales"
UY.entidad_vigilancia = "el Área de Defensa del Consumidor del Ministerio de Economía y Finanzas"
CR.separador_miles: sin cambio hasta que Legal CR diga cómo escribe los montos
CR.termino_dias = "días naturales"
CR.texto_hora_local = "hora local de la República de Costa Rica"
CR.texto_derechos_datos = "tus derechos de acceso, rectificación y supresión de tus datos personales, y el de revocar tu consentimiento"
BR.separador_miles = "."
BR.termino_dias = "dias corridos"
BR.texto_hora_local = "horário de Brasília"
estado de MX, PE, AR, CL, EC, UY, CR y BR: siguen en piloto; por_confirmar_en_pruebas = [] cuando el abogado local de cada país dé el visto bueno
decisión 16: sin cambio (MX.url_tc_creditos abre)
decisión 17: sin cambio (se confirma el nombre estructurado)
bloque acreditacion (cláusula 8 de cashback; también cashback_day y cashback_eta), solo con carga inmediata: ANTES "Rappi se reserva el derecho de verificar la elegibilidad de cada pedido antes de acreditar el Beneficio; si la verificación determina que el pedido no cumple las condiciones de la Campaña, los Créditos no serán acreditados y se te informará a través de la Plataforma Rappi." DESPUÉS "Rappi podrá verificar la elegibilidad de cada pedido después de acreditar el Beneficio; si la verificación determina que el pedido no cumple las condiciones de la Campaña, Rappi podrá descontar o revocar los Créditos acreditados y te lo informará a través de la Plataforma Rappi."
acreditación de cashback_travel, solo con carga al confirmarse: ANTES "Rappi Travel se reserva el derecho de verificar la elegibilidad de cada orden antes de acreditar el Beneficio; si la verificación determina que la orden no cumple las condiciones de la Campaña, los Créditos no serán acreditados y se te informará a través de la Plataforma Rappi." DESPUÉS "Rappi Travel podrá verificar la elegibilidad de cada orden después de acreditar el Beneficio; si la verificación determina que la orden no cumple las condiciones de la Campaña, Rappi Travel podrá descontar o revocar los Créditos acreditados y te lo informará a través de la Plataforma Rappi."
decisión 19: sin cambio (CO: Restaurantes, Turbo, Supermercados, CPGs, Turbo Restaurantes)
decisión 20: por tienda, si CRM lo puede configurar; si no, se queda por campaña
modelo cashback_day, TEXTO_LIMITE_PEDIDOS con 1: ANTES "Puedes obtener el Beneficio en un máximo de un (1) pedido durante la vigencia de la Campaña; los pedidos adicionales no generarán el Beneficio y se procesarán como pedidos regulares." DESPUÉS "Puedes obtener el Beneficio en un máximo de un (1) pedido por cada Tienda Participante durante la vigencia de la Campaña; los pedidos adicionales en esa misma tienda no generarán el Beneficio y se procesarán como pedidos regulares."
modelo cashback_day, TEXTO_LIMITE_PEDIDOS con N: DESPUÉS "Puedes obtener el Beneficio en un máximo de {N en letras} ({N}) pedidos por cada Tienda Participante durante la vigencia de la Campaña; los pedidos adicionales en esa misma tienda no generarán el Beneficio y se procesarán como pedidos regulares."
formulario cashback_day, ayuda de la pregunta de veces por persona: "Es por cada tienda: con 1, el usuario gana una vez en cada tienda participante."
decisión 21: sin cambio (RNT 79000, vence 2027-03-31)
modelo cashback_travel, TEXTO_BASE_CALCULO_TRAVEL: ANTES "El Beneficio aplica únicamente sobre el valor pagado con dinero real por la tarifa o la reserva de los Productos Participantes, sin incluir cargos por servicio, asistencias o seguros de viaje ni otros servicios adicionales." DESPUÉS "El Beneficio aplica únicamente sobre el valor pagado con dinero real por la tarifa o la reserva de los Productos Participantes, antes de impuestos, tasas y contribuciones, sin incluir cargos por servicio, asistencias o seguros de viaje ni otros servicios adicionales. No hacen parte de la base de cálculo el IVA, las tasas aeroportuarias ni ningún otro impuesto, tasa o contribución incluido en el precio total."
decisión 22: si una marca pide incluir impuestos y tasas, la campaña va a Legal
decisión 23: sin cambio (Rappi Travel como agencia de viajes)
decisión 24: ratificar con Legal BR por escrito, con el mensaje de la respuesta 24
decisión 25: sin cambio (se quedan las siete correcciones)
decisión 26: sin cambio (se mantiene la eliminación de las dos duplicadas)
bloque br_condicoes_gerais: ANTES "não sendo a Rappi responsável" DESPUÉS "não sendo o Rappi responsável"
modelo promocao_br: ANTES "“Usuário” para fins deste T&C significa a pessoa humana inscrita na plataforma Rappi." DESPUÉS "“Usuário” para fins deste T&C significa a pessoa física inscrita na plataforma Rappi."
decisión 27: "São Paulo/SP" no va en el modelo
BR.politica_privacidad = "o Aviso de Privacidade e Políticas de uso das Informação utilizadas pela Rappi"
decisión 29: revisión de la interfaz en portugués por Legal BR (Amannda Moreira o quien ella indique) y un KAM de Brasil
modelo cashback_eta, cláusula del beneficio, agregar después de "Rappi se obliga a cumplir con el ETA exhibido dentro de la Plataforma Rappi.": "No habrá lugar al Beneficio cuando el retraso se deba a causas imputables al Usuario/Consumidor, como una dirección de entrega incorrecta o incompleta, la modificación de la orden o de la dirección después de realizada, o la falta de disponibilidad para recibirla, ni cuando obedezca a fuerza mayor o caso fortuito."
decisión 31: sin cambio (se queda la versión nueva de seguridad vial)
decisión 32: sin cambio (se quedan los cuatro cambios de forma)
decisión 33: pendiente del dato; si hay campaña ETA en Turbo de mercado, MODALIDAD_TURBO pasa a lista cerrada: "Turbo Restaurantes" (por defecto) y "Turbo"
decisión 34: sin cambio (se quedan los siete cambios de cashback)
decisión 35: se quedan los tres textos nuevos
TEXTO_SEGMENTO, reactivados: ANTES "durante los {N en letras} ({N}) días anteriores al inicio de la Campaña" DESPUÉS "durante los {N en letras} ({N}) {termino_dias} anteriores al inicio de la Campaña"
decisión 36: se quedan los siete cambios de carrera_compras; cláusula de impuestos sin cambio
formulario carrera_compras: entregaPor solo se pregunta si tipoPremio = fisico
modelo carrera_compras, viñeta Entrega con premio en Créditos (texto nuevo): "Los Créditos serán acreditados por Rappi en la Billetera de Créditos del ganador, por cuenta del Organizador, una vez aceptado el premio."
modelo carrera_compras, TEXTO_DATOS_ENTREGA: ANTES "Para la entrega del premio, Rappi podrá compartir con el Organizador únicamente los datos de contacto del ganador que sean estrictamente necesarios para ese fin, previa autorización del ganador." DESPUÉS "Si resultas ganador, al aceptar el premio autorizas a Rappi para transferir al Organizador únicamente los datos estrictamente necesarios para entregártelo, que pueden ser tu nombre y apellidos, correo electrónico, número de teléfono celular, dirección de entrega y número de documento de identidad. El Organizador solo podrá usar esos datos para entregarte el premio, coordinar la entrega, verificar tu identidad al recibirlo y atender los reclamos sobre ella, y deberá suprimirlos una vez cumplida esa finalidad."
formulario carrera_compras, pregunta nueva acuerdoDatos (nombre sugerido; solo si tipoPremio = fisico y entregaPor = organizador; no bloquea): enunciado "¿El Organizador ya firmó el acuerdo de transferencia de datos?"; ayuda "Sin ese acuerdo firmado no se le pueden enviar los datos del ganador."; por qué "Rappi responde por los datos de sus usuarios. Enviarlos a una marca sin acuerdo firmado nos expone ante la autoridad de datos personales."; opciones "Sí, ya está firmado" (nota CO "La marca aparece en verde en la tabla de acuerdos marco.") y "No, o no sé" (nota "Te mostramos cómo se firma. Puedes generar el T&C igual.")
formulario carrera_compras, panel de acuerdoDatos = "No, o no sé": el texto por país de la respuesta 36, tal cual; la respuesta queda en Mis campañas y la pantalla final repite el aviso
CO.url_acuerdo_datos = "https://drive.google.com/file/d/1qpV7hsIPT2HXidULMp6vjzO0M-HfMKEr/view" (campo nuevo)
CO.url_tabla_acuerdos = "https://docs.google.com/spreadsheets/d/1wvivWGy6UIS_kcleKzZ3zyw6oBK1rTnEeZoLzDS_TtM/edit" (campo nuevo)
MX.url_acuerdo_datos = "https://docs.google.com/document/d/1hMNNU0lZh9LLSv-SWyAVVneaeoY0h6Q_o6jMxhP8J_c/edit"
AR.url_acuerdo_datos = "https://drive.google.com/file/d/1lgI4Fq7rCdbK-NUlYGmtNzY46pX7lbl5/view"
UY.url_acuerdo_datos = "https://drive.google.com/file/d/1k4HIOM92EZWKk_bPer7K-CojJeKc0Mzu/view"
PE.url_acuerdo_datos = "https://drive.google.com/file/d/1M6F7SRilOTU19uGQS_bq6onGY6pJ_A2z/view"
EC.url_acuerdo_datos = "https://drive.google.com/file/d/19e-Zehkq6f5TNea1KjVh_OoiG6yYKpgY/view"
CL.url_acuerdo_datos = "" (no hay modelo; el panel manda a Legal)
CR.url_acuerdo_datos = "" (no hay modelo; el panel manda a Legal)
formulario carrera_compras, pregunta nueva valorPremio (nombre sugerido; solo si tipoPremio = fisico): enunciado "¿Cuánto vale el premio, con IVA incluido?"; ayuda "Por cada ganador, en pesos. Por ejemplo: 1500000."; por qué "Con ese valor se calculan los impuestos del premio. Si el documento no lo dice, no hay con qué medir si lo entregado es lo prometido."
modelo carrera_compras, LISTA_PREMIOS con premio físico y un ganador: ANTES "El ganador recibirá el siguiente premio: {descripción}." DESPUÉS "El ganador recibirá el siguiente premio: {descripción}, con un valor comercial de {valor en letras} pesos M/Cte. (${valor}), IVA incluido."
modelo carrera_compras, LISTA_PREMIOS con premio físico y varios ganadores: ANTES "Cada ganador recibirá el siguiente premio: {descripción}." DESPUÉS "Cada ganador recibirá el siguiente premio: {descripción}, con un valor comercial unitario de {valor en letras} pesos M/Cte. (${valor}), IVA incluido. El valor comercial total de los premios de la Campaña es de {total en letras} pesos M/Cte. (${total})."
formulario carrera_compras: productosLista pasa a filas productosDetalle (nombre sugerido), con nombre y EAN validado (8, 12, 13 o 14 números y dígito de control); enunciado "¿Cuáles productos participan?"; ayuda "Uno por fila: el nombre como sale en la app y su EAN, el número del código de barras."; por qué "El EAN identifica el producto sin discusión. Si dos productos se llaman parecido, el EAN decide qué compra suma."; errores "El EAN tiene 8, 12, 13 o 14 números. Revisa que esté completo." y "Ese EAN no existe: el último número no cuadra. Cópialo otra vez del empaque o del catálogo."
modelo carrera_compras, TEXTO_PRODUCTOS especificos: ANTES "Participan en el concurso únicamente los siguientes productos de la Tienda Participante (en adelante, los “Productos Participantes”): {lista}." DESPUÉS "Participan en el concurso únicamente los siguientes productos de la Tienda Participante, identificados con su nombre y su código de barras EAN (en adelante, los “Productos Participantes”):" + una viñeta por producto "• {nombre} (EAN {código})" + "Solo suman al acumulado las unidades cuyo código EAN coincida con alguno de los anteriores."
decisión 37: sin cambio
TEXTO_LUGAR_REDENCION general, con exclusiones marcadas: ANTES "Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio." DESPUÉS "Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, a excepción de {exclusiones marcadas}, dentro del Territorio."
formulario cashback y cashback_day: si redencion = general, casillas exclusionesRedencion (nombre sugerido) con Rappi Travel, SOAT, Cajero ATM y Rappi Favor, marcadas por defecto
decisión 39: condiciones pasa de casillas a una sola elección; la opción local se oculta mientras CO.nombre_modalidad_local esté vacío
formulario condiciones: enunciado "¿En qué pedidos se gana el beneficio?"; ayuda "Si la marca no puso ninguna condición, deja la primera opción."; opciones "En cualquier pedido" (nota "Domicilio, Turbo o cualquier forma de pedir."), "Solo en pedidos por Turbo" (nota "Un pedido por el resto de la app no da el beneficio.") y "Solo en pedidos por “{nombre_modalidad_local}”" (nota "Un pedido a domicilio no da el beneficio."); el por qué actual se queda
TEXTO_CONDICIONES consumo_local: ANTES "El Beneficio aplica únicamente para pedidos realizados bajo la modalidad de consumo en el local disponible en la Plataforma Rappi." DESPUÉS "El Beneficio aplica únicamente para pedidos realizados a través de la opción “{nombre_modalidad_local}” de la Plataforma Rappi; los pedidos con entrega a domicilio no generan el Beneficio."
CO.nombre_modalidad_local = "" (campo nuevo; pendiente del nombre exacto en la app)
decisión 40: recomiendo R4; Juan decide; si se mantiene, anotarlo como riesgo aceptado
bloque travel_responsabilidad, solo si Juan acepta R4: ANTES "Rappi Travel actúa como intermediario para la comercialización de productos y servicios turísticos provistos por proveedores y operadores. En consecuencia, Rappi Travel no será responsable por: (i) la prestación, calidad, idoneidad, disponibilidad o cumplimiento de los servicios turísticos a cargo de los proveedores u operadores; (ii) las cancelaciones, modificaciones o penalidades aplicadas por el proveedor, aerolínea u operador conforme a sus propias políticas; (iii) las fallas técnicas, interrupciones o limitaciones en la disponibilidad de los Sistemas Rappi Travel ajenas a su control razonable; ni (iv) los rechazos de órdenes derivados de fallas en la conexión con los proveedores u operadores. Rappi Travel sí es responsable de: (i) {{TEXTO_RESPONSABILIDAD_TRAVEL}}; (ii) la publicación veraz y completa de los presentes Términos y Condiciones; y (iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña." DESPUÉS "Las condiciones de prestación de cada servicio turístico, como equipaje, cambios, cancelaciones, demoras y penalidades, son las del Proveedor y de la tarifa adquirida, y se informan antes de pagar. Rappi Travel no será responsable por las fallas técnicas, interrupciones o limitaciones en la disponibilidad de los Sistemas Rappi Travel ajenas a su control razonable, ni por los rechazos de órdenes derivados de fallas en la conexión con los Proveedores. Nada de lo anterior limita los derechos que la ley te reconoce como consumidor. Rappi Travel es responsable de: (i) {{TEXTO_RESPONSABILIDAD_TRAVEL}}; (ii) la publicación veraz y completa de los presentes Términos y Condiciones; y (iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña."
decisión 41: (1) sin cambio, Créditos sin documento madre y remisión a los T&C de Créditos cuando se usan fuera de Travel; (2) sin cambio, "Cuenta" y "Créditos"; (3) se queda la exclusión de pagos con Créditos en descuento_travel; (4) sin cambio, aviso y no bloqueo
decisión 42: visto bueno a Reembolso parcial, Plazo, descuento variable y entidad de vigilancia de Travel
modelo cashback_travel, TEXTO_EJEMPLO_TOPE_TRAVEL: ANTES "Por ejemplo, para recibir el máximo de {tope} Créditos en una orden, el valor pagado debe ser de al menos {umbral}; si pagas menos, recibirás el {porcentaje} de lo pagado." DESPUÉS "Por ejemplo, para recibir el máximo de {tope} Créditos en una orden, el valor que cuenta para el cálculo del Beneficio debe ser de al menos {umbral}; si es menor, recibirás el {porcentaje} de ese valor."
TEXTO_AMBITO_TRAVEL, nacional, solo vuelos: "Aplica únicamente para vuelos con origen y destino en {pais_legal}."
TEXTO_AMBITO_TRAVEL, nacional, sin vuelos: "Aplica únicamente para servicios que se presten en {pais_legal}."
TEXTO_AMBITO_TRAVEL, internacional, solo vuelos: "Aplica únicamente para vuelos con origen o destino fuera de {pais_legal}."
TEXTO_AMBITO_TRAVEL, internacional, sin vuelos: "Aplica únicamente para servicios que se presten fuera de {pais_legal}."
TEXTO_AMBITO_TRAVEL, con vuelos y otras categorías: sin cambio
formulario cashback_travel y descuento_travel: marcaAliado obligatoria; el nombre de la campaña nunca empieza con "Rappi Travel"
decisión 43: el conteo por trayecto se queda, sin cambio
decisión 44: fuera a propósito; orden para las siguientes versiones: 2x1 y 3x2 (republicación de Legal CO), obsequios con modelo propio, generales de otros países; combos no entran como tipo
data/tyc_genericos.json: quitar descuento_productos_seleccionados_bis y la advertencia de descuento_productos_seleccionados (decisión 45)
cupon_valor_fijo.beneficio = "Descuento de un monto fijo de dinero sobre el pedido al redimir un cupón o código (el valor dependerá de lo que indique la pieza publicitaria)." (propuesta, pendiente de Legal CO)
cupon_valor_fijo.paraQue = "Respaldo legal para cupones o códigos que descuentan un valor fijo del pedido (ej. \"$10.000 OFF con el código X\"). Úsalo cuando el usuario debe ingresar o activar el cupón para ver la rebaja; el valor, la compra mínima y la vigencia van en la pieza." (propuesta, pendiente de Legal CO)
cupon_toda_la_tienda.beneficio = "Porcentaje de descuento sobre el valor total del pedido al redimir un cupón o código (el porcentaje y el tope dependerán de lo que indique la pieza publicitaria)." (propuesta, pendiente de Legal CO)
cupon_toda_la_tienda.paraQue = "Respaldo legal para cupones o códigos que dan un porcentaje de descuento sobre el valor total del pedido (ej. \"20% OFF en toda la tienda con el código X\"). Úsalo cuando el descuento no es automático y el usuario debe ingresar o activar el cupón; el porcentaje, el tope y la compra mínima van en la pieza." (propuesta, pendiente de Legal CO)
decisión 47: el general de cashback de 2025 se queda publicado con este encabezado: "Estos Términos y Condiciones no aplican a campañas iniciadas a partir del 1 de enero de 2026. Cada campaña de cashback vigente tiene sus propios Términos y Condiciones, publicados en su propio enlace."
decisión 48: republicar cupones_membresia_pro_black en /colombia/2026/ y cambiar su enlace cuando exista; el de 2024 se queda publicado
decisión 49: filtro de seis preguntas de sí o no antes de la lista de T&C generales (textos de la respuesta 49, tal cual)
pantalla final del T&C general, texto nuevo: "Tu pieza debe decir siempre: el mínimo de compra, si lo hay; el máximo de descuento o de cashback; y a qué usuarios aplica, si no es para todos."
