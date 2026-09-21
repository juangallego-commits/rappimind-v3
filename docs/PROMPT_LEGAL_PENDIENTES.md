# Prompt: las decisiones legales abiertas y los modelos que faltan

Para llevar a Claude chat. Pega todo lo que está debajo de la línea en una
conversación nueva y adjunta, en el mismo mensaje, estos archivos del
repositorio:

- `docs/piezas_publicadas/` completo: son las cinco piezas reales, aprobadas y
  publicadas, de las que sale casi todo.
- Los dos T&C que genera hoy el modelo de millas, que yo te mandé por chat.

Si no puedes adjuntar los archivos, la conversación sirve igual: cada decisión
trae abajo las dos versiones enfrentadas, copiadas letra por letra.

---

Necesito que actúes como **abogado senior de derecho del consumidor y publicidad
en Colombia**, con experiencia en promociones y concursos de plataformas
digitales. Vas a desempatar decisiones legales concretas sobre un generador de
Términos y Condiciones, y a diseñar los modelos que todavía le faltan.

No tienes el código ni la herramienta. Todo lo que necesitas está en este
mensaje.

## Qué es RappiMind, en tres frases

1. Es una herramienta interna de Rappi donde un comercial genera los T&C de su
   campaña de marketing sin escribirle al equipo legal.
2. La herramienta le hace preguntas sobre hechos y arma el documento con textos
   legales que Legal ya aprobó. El comercial nunca escribe texto legal.
3. Cuando un caso no está cubierto, la herramienta lo manda a Legal. Cada caso
   que se manda a Legal es trabajo manual que la herramienta existe para evitar,
   así que cerrar uno vale mucho; pero cerrarlo mal publica un documento
   equivocado con el nombre de un aliado encima.

## Las reglas que no se tocan

1. **Rappi nunca es el Organizador.** El Organizador es siempre la tienda, la
   marca o el programa que pone el beneficio. Rappi es plataforma de
   intermediación y responsable del tratamiento de datos. Que Rappi opere la
   mecánica no lo vuelve organizador.
2. **El comercial no escribe texto legal.** Los únicos campos libres son
   nombres, razones sociales, ciudades, la descripción de un premio físico y
   listas de productos. Si tu propuesta necesita que alguien redacte una frase
   en el formulario, no sirve.
3. **Nada de tablas** en el documento: el sitio donde se publica no las muestra.
   Todo va en párrafos y viñetas.
4. **Si falta un dato, no se genera.** El documento final no lleva espacios en
   blanco ni frases a medias.
5. **Español de Colombia, en tú**, y sin guiones como signo de puntuación.

## Cómo quiero que decidas

Para cada punto quiero **una recomendación, no un menú**. Dime qué harías tú y
por qué, con la norma o el criterio concreto cuando lo haya. Si el riesgo de las
dos opciones es parecido, dilo y escoge igual. Lo que no me sirve es "depende
del apetito de riesgo".

Y cuando una decisión dependa de un hecho que yo no te di, pídemelo en vez de
suponerlo.

---

# PARTE A · Las once decisiones del modelo de millas

Contexto: dos campañas reales de millas LifeMiles, ya publicadas, que se
redactaron a mano. Una corre en Rappi Travel (tours de Civitatis) y otra en la
Plataforma Rappi (productos MUSS y TANGA en la sección Turbo). Son la misma
mecánica en dos verticales, con entidades legales distintas: Rappi Travel lo
opera Travel Moustache S.A.S. y la Plataforma la opera Rappi S.A.S.

Hicimos un modelo que genera las dos. Esto es lo que quedó abierto.

**M1. Quién es el Organizador en la pieza de Civitatis.** La pieza de Turbo dice
expresamente "el Organizador (Lifemiles)". La de Civitatis no nombra ningún
Organizador: solo dice que Rappi Travel es agencia intermediaria y que las millas
se rigen por el reglamento de LifeMiles. Por la regla 1, el modelo pone al
programa de lealtad como Organizador en las dos. ¿Es correcto que el programa de
lealtad sea el Organizador, o hay una lectura mejor? ¿Qué pasa con la
responsabilidad frente al consumidor si el programa no es quien vende el
producto que origina la acumulación?

**M2. Los pagos con Créditos.** Las dos piezas siguen reglas distintas:

- *Civitatis:* "El beneficio aplica únicamente sobre el valor pagado con dinero
  real, excluyendo cualquier porción de la compra que haya sido pagada con
  Créditos de la Plataforma u otros cupones."
- *Lo ya aprobado en RappiMind:* "No se obtendrá el Beneficio respecto de
  órdenes pagadas parcial o totalmente con Créditos de la Plataforma."

La primera prorratea, la segunda descalifica la orden entera. El modelo imprime
hoy la segunda. Ojo con un efecto: la pieza de Turbo no excluía los Créditos en
absoluto, así que el documento generado es **más restrictivo que lo publicado**.
¿Cuál dejamos, y hay algún problema en volverse más restrictivo que una campaña
que ya corrió?

**M3. La acumulación con otras promociones.** Las dos piezas dicen lo contrario:

- *Civitatis:* "El Beneficio obtenido en virtud de la presente Campaña no es
  acumulable con otras promociones de acumulación acelerada de Millas."
- *Turbo:* "El Beneficio obtenido en virtud de la presente Campaña sí es
  acumulable con otras promociones exhibidas en la Plataforma Rappi."

Hoy las dos están como opción en el formulario. ¿Sirven las dos redacciones tal
cual? ¿La de Turbo, al decir "sí es acumulable", abre algún riesgo de que el
usuario exija apilar promociones que no estaban pensadas?

**M4. Los requisitos de vinculación al programa**, también distintos:

- *Civitatis:* "Se encuentren afiliados y tengan una cuenta activa en el programa
  de lealtad LifeMiles."
- *Turbo:* "Estar vinculados (enrolados) al programa de lealtad Lifemiles dentro
  de la Plataforma Rappi" y "Tener a Lifemiles seleccionado como su programa
  preferido de acumulación dentro de la Plataforma Rappi."

El segundo exige más. ¿Las dos valen? ¿Hay que advertir al usuario de que si no
tiene el programa seleccionado como preferido pierde el beneficio?

**M5. Dos cláusulas seguidas sobre el rol de Rappi, que se pisan.** La cláusula
estándar dice "Rappi actúa únicamente como plataforma de contacto e
intermediación tecnológica y como medio de difusión; Rappi no es el organizador".
La de la pieza de Turbo es más fuerte: "Rappi S.A.S. no organiza, patrocina,
administra ni asume responsabilidad alguna respecto de la mecánica, la
selección, o la acreditación y entrega del Beneficio". Las dos están publicadas
y el documento las lleva las dos, seguidas. ¿Se juntan en una? Si sí, escribe la
cláusula unificada.

**M6. La limitación de responsabilidad en la vertical de Travel.** Los modelos de
Cashback Travel y Descuento Travel cierran diciendo de qué SÍ responde Rappi
Travel: "la correcta acreditación de los Créditos". En una campaña de millas
Rappi Travel no acredita nada, acredita el programa. El modelo usó en su lugar la
"Declaración" de la pieza de Civitatis más la responsabilidad e indemnidad del
Organizador de la de Turbo. **¿De qué responde Rappi Travel en una campaña de
millas?** Si la respuesta es "de nada", dilo con las palabras que irían en el
documento.

**M7. La política de privacidad del programa va sin enlace.** La pieza de Turbo
enlaza los T&C de LifeMiles; la de Civitatis no. El formulario no puede pedirle
un enlace al comercial (regla 2). Tres caminos: (a) dejarlo sin enlace; (b)
hacer una excepción y permitir la pregunta del enlace; (c) guardar el enlace de
cada programa en la configuración, con Legal como dueño. ¿Cuál, y es suficiente
nombrar la política sin enlazarla?

**M8. La cláusula de datos se armó con dos fuentes.** La autorización para
compartir la identificación y los datos de la transacción con el Organizador sale
de la pieza de Turbo; el cierre con los derechos del titular sale del bloque
estándar. **La pieza de Civitatis no tiene cláusula de datos personales**, y ahí
los datos del usuario salen hacia un tercero. ¿La cláusula armada cubre las dos?
¿Falta algo de la Ley 1581 de 2012 para una transferencia a un tercero?

**M9. El filtro de entrada puede seguir mandando las millas a Legal.** Antes de
elegir el tipo, la herramienta pregunta a todos: "¿La tienda o la marca exige
sus propios términos y condiciones?". En una campaña de millas el programa
**siempre** tiene los suyos, y el documento ya remite a ellos. Un comercial que
responda "sí" se va a Legal aunque el caso esté cubierto. ¿Cómo reformular esa
pregunta para que siga atrapando los casos de verdad problemáticos sin arrastrar
las millas?

**M10. La jurisdicción.** La pieza de Turbo dice "la jurisdicción ordinaria de la
ciudad de Bogotá D.C."; el documento generado dice "la justicia ordinaria de la
República de Colombia", como todos los demás modelos. ¿Se puede pactar la
ciudad, o con un consumidor eso no se pacta?

**M11. El título del documento ya no nombra al programa.** Los títulos publicados
eran "LIFEMILES, MUSS & TANGA EN TURBO" y "Compra tours & actividades y acumula
millas con LifeMiles". La herramienta arma el nombre con tienda, beneficio y
día, así que sale "Turbo · 400 Millas · 18 may 2026". ¿Importa legalmente que el
programa no aparezca en el título?

---

# PARTE B · Las tres decisiones de los bloqueos de Travel

Acabamos de sacar del filtro tres casos que antes iban derecho a Legal. Estas
cláusulas ya están escritas y funcionando, y quiero que las revises.

**B1. La cláusula del precio anunciado.** Sale cuando la pieza anuncia un precio
o un "desde". Si el comercial dice que ese precio NO incluye impuestos, tasas y
cargos, la herramienta no genera y lo manda a Legal.

> **Precio anunciado.** Los precios que se anuncian en las piezas publicitarias
> de la Campaña, incluidos los que se presentan precedidos de la expresión
> "desde", corresponden al valor final por Producto Participante e incluyen los
> impuestos, tasas y cargos aplicables. Estos precios corresponden a la tarifa
> más baja disponible al momento de la publicación de la pieza, están sujetos a
> disponibilidad y pueden variar según la fecha de viaje, el destino, la clase o
> categoría seleccionada y la fecha en que se realice la reserva. El precio
> aplicable a cada orden será el que se muestre en los Sistemas Rappi Travel al
> momento de completar la compra.

¿Alcanza para el Estatuto del Consumidor y para el Reglamento Aeronáutico? Hubo
una sanción previa a Rappi Travel por anuncios de tarifas: ¿esta cláusula la
habría evitado, o falta algo?

**B2. La cláusula del beneficio que cambia según el producto.** Sale cuando cada
hotel o destino tiene su propio porcentaje. El comercial pega la lista desde su
hoja de cálculo.

> **Beneficio por Producto Participante.** El Beneficio varía según el Producto
> Participante seleccionado y está sujeto a disponibilidad. Participan
> únicamente los siguientes, con el Beneficio que se indica para cada uno:
> • **Hard Rock Hotel Los Cabos:** un descuento del cincuenta y cinco por ciento
>   (55%). Aplica si se compra hasta el 18 de diciembre de 2026 y se viaja hasta
>   el 18 de diciembre de 2026.
> El Beneficio aplicable a cada orden será el que corresponda al Producto
> Participante seleccionado, conforme a la lista anterior. Los Productos
> Participantes no incluidos en ella no dan lugar a Beneficio alguno. La
> aplicación del Beneficio está sujeta a la disponibilidad, a las fechas y a las
> políticas de reserva, modificación y cancelación de cada Proveedor; en caso de
> discrepancia entre la lista anterior y la política del Proveedor, prevalecerá
> esta última.

**Esta es la que más me preocupa: la última frase le da al Proveedor la última
palabra sobre lo que Rappi anunció.** Viene de las dos piezas de hoteles ya
publicadas, así que no la inventamos, pero quiero tu lectura. ¿Es oponible al
consumidor una cláusula que dice que prevalece la política de un tercero sobre
lo que la pieza publicitaria prometió? ¿O es una cláusula abusiva del artículo
43 del Estatuto del Consumidor?

**B3. Las cuotas sin interés.** Partimos la pregunta del filtro en dos. Que la
campaña aplique pagando con cierta tarjeta salió del filtro, porque el banco solo
es el medio de pago. Las cuotas sin interés se quedaron en Legal, con esta
razón: quien otorga la financiación es el banco, con su tasa, su plazo y su
aprobación, y esa publicidad la vigila la Superintendencia Financiera, no la SIC.

¿Estoy en lo correcto? ¿Se podría cubrir con un modelo propio, y qué tendría que
decir?

---

# PARTE C · Los modelos que todavía faltan

Hoy la herramienta manda a Legal toda campaña cuyo beneficio no sea Créditos ni
un descuento en el precio. Ya cubrimos las millas y el descuento variable. Falta
esto, y quiero que diseñes el esqueleto de cada uno: qué cláusulas lleva, qué
hay que preguntarle al comercial y qué casos deberían seguir yendo a Legal.

**C1. Un producto de un aliado que se entrega aparte.** El caso real: usuarios
Pro Black que compran un producto internacional en Rappi Travel reciben una eSIM
de 1 GB del aliado Conecty, por correo, con un código QR y un enlace de
redención, en un plazo de 24 horas, con stock limitado de mil unidades y una
vigencia de un mes desde la recepción. Lo raro: el beneficio no es plata ni
descuento, es una cosa que llega después y por otro canal.

¿Qué tiene que decir ese documento que no diga un cashback? Me interesan sobre
todo: qué pasa si el correo no llega, quién responde por la calidad del servicio
del aliado, qué pasa cuando se acaba el stock a mitad de campaña, y si el plazo
de vigencia del cupón necesita alguna advertencia especial.

**C2. Los beneficios para menores de edad.** Las dos piezas de hoteles ofrecen
"2 niños gratis" o "niños se hospedan y comen gratis", con la regla de que
"niños" son los menores de hasta doce años salvo que el hotel diga otra cosa.
Eso hoy es un bloqueo. ¿Se puede documentar? ¿Qué cuidado especial hay al
publicitar un beneficio que involucra menores, y cómo se redacta el límite de
edad para que no dependa de la política de un tercero que el usuario no conoce
al comprar?

**C3. Asistencia al viajero.** El filtro tiene una pregunta que manda a Legal
cuando el producto es un seguro, para distinguirlo de una asistencia al viajero.
El aliado de Rappi para esto es Universal Assistance, y no tenemos ninguna pieza
suya. Antes de quitar esa pregunta quiero entender: **¿cuál es la diferencia
legal entre un seguro y una asistencia al viajero en Colombia**, y por qué
importa para una campaña promocional? ¿Qué tendría que traer el documento de una
campaña sobre asistencias, y qué haría que siguiera siendo de Legal?

---

# Cómo quiero la respuesta

Por partes, y en este orden. Si te quedas sin espacio, para y dime dónde vas.

**Para cada punto de las partes A y B**, una ficha así:

```
### M1 · <título corto>
- **Mi recomendación:** en una frase.
- **Por qué:** dos o tres, con la norma o el criterio cuando lo haya.
- **El texto:** si la decisión cambia una cláusula, escríbela completa y lista
  para pegar. Si no cambia nada, di "el texto se queda como está".
- **Riesgo si nos equivocamos:** una frase, concreta.
```

**Para cada punto de la parte C**, el esqueleto del modelo:

```
### C1 · <nombre>
- **Cláusulas que lleva**, en orden, con una línea de qué dice cada una.
- **Qué hay que preguntarle al comercial**, en preguntas cortas y cerradas.
- **Qué casos siguen yendo a Legal**, y por qué.
- **De qué piezas publicadas habría que partir**, si crees que faltan.
```

Y al final, dos cosas:

1. **Lo que haría falta y no tenemos.** Datos, piezas firmadas, confirmaciones de
   otro equipo. Sé concreto: a quién habría que pedírselo.
2. **Lo que harías distinto** si esto fuera tuyo. Máximo cinco líneas.

FIN DEL PROMPT.
