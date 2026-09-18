# Tanda 3 de 7 · El cierre: revisar, generar y publicar

> **Antes de pegar esto, pega `PROMPT.md`.** Ahí va quién revisa, qué es
> RappiMind, qué no se puede tocar y en qué formato tiene que venir la
> respuesta. Sin eso, la revisión vuelve en prosa y no se puede aplicar.

Lo que pasa después de la última pregunta. El resumen con lo que falta, la declaración que firma el comercial, la pantalla final con lo que hay que pegar en Squarespace, el historial, la ampliación de una campaña en curso y la ayuda.

## Lo que hay que mirar en esta tanda

- El resumen: ¿se entiende qué falta y cómo se arregla, sin bajar a buscarlo?
- La declaración: ¿el comercial entiende qué está firmando?
- La pantalla final: es el momento de más riesgo del producto. ¿Queda claro qué se copia, dónde se pega y qué pasa después?
- El historial: ¿se distingue un borrador de una campaña publicada? ¿Se entiende "Usar como base" y "Ampliar"?
- La ayuda: ¿responde lo que el comercial se va a preguntar, en el orden en que se lo va a preguntar?

Van 7 pantallas, con su texto tal como se lee en la aplicación.


**Para adjuntar en el mismo mensaje** (Claude chat lee imágenes, y es lo único
que le deja juzgar el aire, la jerarquía y el tamaño de los botones). Están en
`docs/revision/capturas/`:

- `23-resumen.png` · pantalla 23, Resumen, con algo pendiente
- `25-listo.png` · pantalla 25, Listo
- `26-historial.png` · pantalla 26, Mis campañas
- `27-ayuda.png` · pantalla 27, Ayuda
- `39-admin.png` · pantalla 39, Administración

Si no las adjuntas, la revisión igual funciona: el texto va completo aquí.

---

## Pantalla 23 · Resumen, con algo pendiente

*`resumen` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Revisa todo lo que respondió, agrupado por paso, y puede editar cualquier grupo. Mientras falte algo, el botón de generar está deshabilitado y la lista "Te falta" dice qué es, en palabras.

**Lo que dice la pantalla, palabra por palabra:**

```
Revisa antes de generar

Este es el resumen de lo que respondiste. Puedes cambiar cualquier cosa antes de generar el documento.

Campaña
Cambiar
¿En qué país corre la campaña?
Colombia
¿La campaña es de Rappi o de Rappi Travel?
Rappi
¿Qué tipo de campaña vas a hacer?
Cashback
¿En qué tienda aplica?
Farmatodo
¿Dónde aplica la campaña?
En todo el país
Organizador
Cambiar
¿Qué empresa paga el beneficio?
Farmatodo Colombia S.A.S.
¿Cuál es el NIT de esa empresa?
NIT 900.111.222-1
Cuándo
Cambiar
¿Qué día arranca la campaña?
1 de octubre de 2026
¿A qué hora arranca?
12:00 a. m.
¿Qué día termina?
31 de octubre de 2026
¿A qué hora termina?
11:59 p. m.
Beneficio
Cambiar
¿Qué porcentaje del pedido se devuelve en Créditos?
20%
¿Cuál es el máximo de Créditos por pedido?
$20.000
¿Cuánto es el presupuesto total de la campaña?
$5.000.000
¿Cuántas veces puede recibir el beneficio una persona?
Una sola vez
¿El beneficio aplica solo en cierto tipo de pedido?
Solo si el pedido se hace por Turbo
Créditos
Cambiar
¿Cuándo le llegan los Créditos al usuario?
Al día siguiente del pedido
¿Hasta cuándo puede usar esos Créditos?
Hasta una fecha
¿Qué día se vencen los Créditos?
31 de diciembre de 2026
¿Dónde puede gastar los Créditos?
Solo en esta tienda
Participantes
Cambiar
¿Quiénes pueden participar?
Todos los usuarios
¿Con qué medio de pago aplica el beneficio?
Con cualquier medio de pago
¿Hay que gastar un mínimo para participar?
$30.000
Pieza
Cambiar
¿Qué categoría tiene el producto de la pieza?
Licores y cervezas
Confirmo que estos datos son ciertos y son los de mi campaña.
El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.
Te falta:
Marca la casilla para confirmar que la información es correcta.
Atrás
Generar T&C
Tu T&C
Completo

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Si lo deja en blanco: «Marca la casilla para confirmar que la información es correcta.»

---

## Pantalla 24 · Resumen, ya completo

*`resumen` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** La misma pantalla con la declaración marcada. Con eso se habilita el botón de generar.

**Para leer la pantalla.** Aquí la vista previa va completa: es el documento entero, tal como va a salir. Cero llaves, cero corchetes, cero huecos.

**Lo que dice la pantalla, palabra por palabra:**

```
Revisa antes de generar

Este es el resumen de lo que respondiste. Puedes cambiar cualquier cosa antes de generar el documento.

Campaña
Cambiar
¿En qué país corre la campaña?
Colombia
¿La campaña es de Rappi o de Rappi Travel?
Rappi
¿Qué tipo de campaña vas a hacer?
Cashback
¿En qué tienda aplica?
Farmatodo
¿Dónde aplica la campaña?
En todo el país
Organizador
Cambiar
¿Qué empresa paga el beneficio?
Farmatodo Colombia S.A.S.
¿Cuál es el NIT de esa empresa?
NIT 900.111.222-1
Cuándo
Cambiar
¿Qué día arranca la campaña?
1 de octubre de 2026
¿A qué hora arranca?
12:00 a. m.
¿Qué día termina?
31 de octubre de 2026
¿A qué hora termina?
11:59 p. m.
Beneficio
Cambiar
¿Qué porcentaje del pedido se devuelve en Créditos?
20%
¿Cuál es el máximo de Créditos por pedido?
$20.000
¿Cuánto es el presupuesto total de la campaña?
$5.000.000
¿Cuántas veces puede recibir el beneficio una persona?
Una sola vez
¿El beneficio aplica solo en cierto tipo de pedido?
Solo si el pedido se hace por Turbo
Créditos
Cambiar
¿Cuándo le llegan los Créditos al usuario?
Al día siguiente del pedido
¿Hasta cuándo puede usar esos Créditos?
Hasta una fecha
¿Qué día se vencen los Créditos?
31 de diciembre de 2026
¿Dónde puede gastar los Créditos?
Solo en esta tienda
Participantes
Cambiar
¿Quiénes pueden participar?
Todos los usuarios
¿Con qué medio de pago aplica el beneficio?
Con cualquier medio de pago
¿Hay que gastar un mínimo para participar?
$30.000
Pieza
Cambiar
¿Qué categoría tiene el producto de la pieza?
Licores y cervezas
Confirmo que estos datos son ciertos y son los de mi campaña.
El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.
Atrás
Generar T&C
Tu T&C
Completo

TÉRMINOS Y CONDICIONES

FARMATODO · 20% CASHBACK · 1 OCT 2026


[... aquí sigue el documento legal completo, que no entra en esta revisión: el texto de las cláusulas lo escribe el equipo legal y no se toca ...]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Si lo deja en blanco: «Marca la casilla para confirmar que la información es correcta.»

---

## Pantalla 25 · Listo

*`listo` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Es la pantalla donde el comercial deja la herramienta y se va a publicar. Recibe el documento, el título y la dirección listos para copiar, el paso a paso de Squarespace y la lista de quién puede publicar en su país.

**Para leer la pantalla.** Esta es la versión de producción de la pantalla, no la de la demostración: el enlace del Doc es de ejemplo, lo demás es literal.

**Lo que dice la pantalla, palabra por palabra:**

```
Tu T&C está listo

Te mandamos el documento por correo. Solicitud RM-20260918-0001.

Abrir el documento
Lo que vas a pegar en Squarespace
Título del evento
Copiar
Farmatodo · 20% Cashback · 1 oct 2026

Va tal cual en el título del evento. No lo cambies: es el mismo nombre que quedó en el documento.

Dirección del evento
Copiar
farmatodo-20-cashback-1-oct-2026

Va en la pestaña Opciones, en "URL del evento". La parte de colombia la pone Squarespace sola: reemplaza solo lo que va después.

Las fechas del evento

Inicio: 1 de octubre de 2026. Fin: 31 de octubre de 2026. Tienen que ser iguales a la vigencia del documento.

Cómo publicarlo, paso a paso

Abre el documento y léelo completo. Es el texto que vas a publicar, tal cual, sin editarlo.

Deberías ver: El documento con el nombre de tu campaña en el título.

Entra a Squarespace, a la lista de páginas, y abre la página del país de tu campaña.

Deberías ver: El menú de la izquierda con un país por línea: Brasil, Argentina, Chile, Colombia y los demás.

Dentro del país, dale al signo de más para crear un evento nuevo.

Deberías ver: El calendario del mes y, a la izquierda, la lista de los T&C que ya existen.

Copia el título que te dio RappiMind y pégalo en el título del evento. No lo cambies ni le agregues nada.

Deberías ver: El título arriba, donde dice "Escribe un título para el evento".

Pon la fecha de inicio y la de fin del evento iguales a la vigencia del documento. Si no coinciden, el evento se cae del calendario antes o después de que termine la campaña.

Deberías ver: Las dos fechas debajo del título.

Selecciona todo el documento, cópialo y pégalo en el cuerpo del evento. Revisa que las cláusulas numeradas y las viñetas se vean bien.

Deberías ver: El texto completo, con todas sus cláusulas numeradas.

Entra a la pestaña Opciones y reemplaza la dirección del evento por la que te dio RappiMind. La parte del país no se toca: Squarespace la pone sola.

Deberías ver: El campo "URL del evento", con el país a la izquierda y el resto editable.

Dale a Guardar y publicar. Guardar solo deja la página en borrador y el enlace no abre.

Deberías ver: El evento en el calendario, sin la etiqueta de borrador.

Abre el enlace en el navegador para confirmar que carga, y cópialo.

Deberías ver: Tu documento publicado, en una dirección que empieza por https://promos.rappi.com/

Vuelve a RappiMind, pega el enlace abajo y marca la campaña como publicada.

Deberías ver: Tu campaña en verde en el historial, con su enlace guardado.

¿Quién puede publicar?

En tu país tienen usuario de Squarespace:

Camilo Patiño · ivan.patino@rappi.com
Valery Medina · ext-v.reina@rappi.com

Si no eres una de estas personas, pásales el documento, el título y la dirección que te dio RappiMind.

¿No tienes usuario de Squarespace? Pide que te publiquen la página en #tyc-rappi

El texto legal de tus piezas

Enlace por confirmar. Cuando publiques la página y pegues el enlace aquí abajo, comparamos y te avisamos si la leyenda cambia.

Texto de apoyo
Copiar
Cashback máximo de $20.000 en Créditos de Rappi para redimir en Farmatodo hasta el 31 de diciembre de 2026. Válido en un solo pedido por usuario.

145 de 350 caracteres.

Letra pequeña
Copiar
Aplican términos y condiciones: https://promos.rappi.com/colombia/farmatodo-20-cashback-1-oct-2026. Válido del 1 al 31 de octubre de 2026 o hasta agotar el presupuesto disponible. Compra mínima de $30.000 en productos. Válido solo en pedidos por Turbo. Aplican términos y condiciones Turbo: https://legal.rappi.com.co/colombia/terminos-y-condiciones-del-boton-turbo/ *El tiempo de entrega es estimado y depende de condiciones climáticas y de tráfico. El exceso de alcohol es perjudicial para la salud. Ley 30 de 1986. Prohíbase el expendio de bebidas embriagantes a menores de edad y mujeres embarazadas. Ley 124 de 1994. Imágenes de referencia.

645 de 620 caracteres. Recortada hasta el mínimo, y aun así se pasa.

Se pasa por 25 caracteres. Los enlaces ocupan 142 de los 645.

No hay nada más que se pueda quitar: todo lo que queda es obligatorio. Usa un formato más grande o escríbele a Legal antes de mandar a diseñar.

Banner corto
Copiar
Aplican términos y condiciones: https://promos.rappi.com/colombia/farmatodo-20-cashback-1-oct-2026. Válido del 1 al 31 de octubre de 2026 o hasta agotar el presupuesto disponible. Cashback máximo de $20.000 en Créditos por pedido. Compra mínima de $30.000 en productos. Válido solo en pedidos por Turbo. Válido en un solo pedido por usuario. Aplican términos y condiciones Turbo: https://legal.rappi.com.co/colombia/terminos-y-condiciones-del-boton-turbo/ *El tiempo de entrega es estimado y depende de condiciones climáticas y de tráfico. El exceso de alcohol es perjudicial para la salud. Ley 30 de 1986. Prohíbase el expendio de bebidas embriagantes a menores de edad y mujeres embarazadas. Ley 124 de 1994. Imágenes de referencia.

734 de 300 caracteres.

Se pasa por 434 caracteres. Los enlaces ocupan 142 de los 734.

No hay nada más que se pueda quitar: todo lo que queda es obligatorio. Usa un formato más grande o escríbele a Legal antes de mandar a diseñar.

Valla, exterior e impresos
Copiar
Aplican términos y condiciones: https://promos.rappi.com/colombia/farmatodo-20-cashback-1-oct-2026. Válido del 1 al 31 de octubre de 2026 o hasta agotar el presupuesto disponible. Cashback máximo de $20.000 en Créditos por pedido. Compra mínima de $30.000 en productos. Válido solo en pedidos por Turbo. Válido en un solo pedido por usuario. Aplican términos y condiciones Turbo: https://legal.rappi.com.co/colombia/terminos-y-condiciones-del-boton-turbo/ *El tiempo de entrega es estimado y depende de condiciones climáticas y de tráfico. El exceso de alcohol es perjudicial para la salud. Ley 30 de 1986. Prohíbase el expendio de bebidas embriagantes a menores de edad y mujeres embarazadas. Ley 124 de 1994. Imágenes de referencia.

734 de 300 caracteres.

Se pasa por 434 caracteres. Los enlaces ocupan 142 de los 734.

No hay nada más que se pueda quitar: todo lo que queda es obligatorio. Usa un formato más grande o escríbele a Legal antes de mandar a diseñar.

Push y SMS
Copiar
Máx. $20.000 en Créditos. Compra mínima $30.000. Aplican TyC https://promos.rappi.com/colombia/farmatodo-20-cashback-1-oct-2026

127 de 70 caracteres.

Se pasa por 57 caracteres. Los enlaces ocupan 66 de los 127.

No hay nada más que se pueda quitar: todo lo que queda es obligatorio. Usa un formato más grande o escríbele a Legal antes de mandar a diseñar.

Cuando ya esté publicado

Pega el enlace de la página que publicaste.

Marcar como publicado
Hacer otra campaña
Ver mis campañas
```

---

## Pantalla 26 · Mis campañas

*`historial` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Busca sus campañas anteriores, abre otra vez un documento, marca una campaña como publicada o arranca una nueva copiando los datos de otra con "Usar como base".

**Lo que dice la pantalla, palabra por palabra:**

```
Tus campañas

Abre tus documentos, márcalos como publicados o usa uno como base para una campaña nueva.

Campaña	País	Fecha	Estado	
Farmatodo · 20% Cashback · 1 oct 2026 Farmatodo	CO	2026-09-18	
Generado	Usar como base
```

---

## Pantalla 38 · Mis campañas, ampliar una publicada

*`historial` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Una campaña publicada y en curso se puede ampliar: la vigencia solo se mueve hacia adelante y los números solo suben, porque bajarlos cambiaría las condiciones de quien ya compró.

**Lo que dice la pantalla, palabra por palabra:**

```
Tus campañas

Abre tus documentos, márcalos como publicados o usa uno como base para una campaña nueva.

Campaña	País	Fecha	Estado	
Farmatodo · 20% Cashback · 18 sep 2026 Farmatodo	CO	2026-09-18	
Publicado	Usar como baseAmpliar
Ampliar Farmatodo · 20% Cashback · 18 sep 2026

Esta campaña ya arrancó: solo puedes darle más, nunca menos, porque cambiaría las condiciones de quien ya compró.

Nueva fecha de fin

Ahora dice: 2026-12-31

Nuevo presupuesto

Ahora dice: 5000000

Llena solo lo que quieras ampliar y deja el resto vacío.

Ampliar la campaña
```

---

## Pantalla 27 · Ayuda

*`ayuda` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Consulta qué dinámicas sirven y cuáles no, cómo se publica en Squarespace, quién publica en cada país, qué hacer si algo sale mal, a quién escribirle y las preguntas frecuentes.

**Lo que dice la pantalla, palabra por palabra:**

```
Antes de lanzar: ¿tu dinámica tiene azar?

Si tienes cualquier duda de si tu dinámica tiene azar o suerte, confírmalo con el equipo legal de tu país ANTES de lanzarla. No la lances y después preguntes.

Si algo de esta página no coincide con lo que ves en la herramienta, avísanos por el canal.

En Colombia y en varios países de la región, los sorteos y las rifas son juegos de suerte y azar y necesitan permiso previo de la autoridad.

Lanzar una campaña con azar sin ese permiso es una infracción, y la responsabilidad recae sobre quien la organiza y sobre Rappi como medio de difusión.

Esta herramienta solo genera documentos para dinámicas SIN azar. Si tu campaña tiene azar, el documento lo tiene que redactar Legal.

Sirven para esta herramienta
Cashback: quien compra recibe un porcentaje de vuelta en Créditos. Todos los que cumplen reciben el beneficio.
Carrera de Compras: gana quien más compre durante la vigencia. El resultado depende del esfuerzo del participante, no de la suerte.
Cashback Multitienda: varias tiendas hacen cashback dentro de la misma jornada, cada una con su propio porcentaje, su tope y su presupuesto.
15 minutos o Cashback: Rappi promete un tiempo de entrega en el botón Turbo y, si la orden llega tarde, devuelve en Créditos parte de lo que el usuario pagó.
Cashback Travel y Descuento Travel: las dos formas de campaña de vuelos, hoteles, autos y paquetes.
No sirven: las redacta Legal
Sorteo entre todos los participantes, aunque sea "entre quienes compren".
Rifa con boletas o números.
Raspa y gana, ruleta, cofres o cajas sorpresa.
Premio al cliente número N del día, o al pedido número N.
Cualquier mecánica donde dos personas que hacen exactamente lo mismo pueden terminar con resultados distintos.
Consúltalo igual
Premios distintos por puesto en un ranking, o tabla de puntos: consúltalo.
El premio es una boleta, una experiencia o algo atado a un evento con fecha: consúltalo.
Hay un jurado que decide, o un criterio de "el más creativo": consúltalo.
Participan varias tiendas en un mismo concurso: consúltalo.

La prueba más simple: si dos personas hacen exactamente lo mismo y una puede ganar y la otra no, hay azar. Consulta antes de lanzar.

Publicar en Squarespace

Cuando generes una campaña, al final te damos el título y la dirección ya armados, listos para copiar. Esto es el paso a paso.

Abre el documento y léelo completo. Es el texto que vas a publicar, tal cual, sin editarlo.

Deberías ver: El documento con el nombre de tu campaña en el título.

Entra a Squarespace, a la lista de páginas, y abre la página del país de tu campaña.

Deberías ver: El menú de la izquierda con un país por línea: Brasil, Argentina, Chile, Colombia y los demás.

Dentro del país, dale al signo de más para crear un evento nuevo.

Deberías ver: El calendario del mes y, a la izquierda, la lista de los T&C que ya existen.

Copia el título que te dio RappiMind y pégalo en el título del evento. No lo cambies ni le agregues nada.

Deberías ver: El título arriba, donde dice "Escribe un título para el evento".

Pon la fecha de inicio y la de fin del evento iguales a la vigencia del documento. Si no coinciden, el evento se cae del calendario antes o después de que termine la campaña.

Deberías ver: Las dos fechas debajo del título.

Selecciona todo el documento, cópialo y pégalo en el cuerpo del evento. Revisa que las cláusulas numeradas y las viñetas se vean bien.

Deberías ver: El texto completo, con todas sus cláusulas numeradas.

Entra a la pestaña Opciones y reemplaza la dirección del evento por la que te dio RappiMind. La parte del país no se toca: Squarespace la pone sola.

Deberías ver: El campo "URL del evento", con el país a la izquierda y el resto editable.

Dale a Guardar y publicar. Guardar solo deja la página en borrador y el enlace no abre.

Deberías ver: El evento en el calendario, sin la etiqueta de borrador.

Abre el enlace en el navegador para confirmar que carga, y cópialo.

Deberías ver: Tu documento publicado, en una dirección que empieza por https://promos.rappi.com/

Vuelve a RappiMind, pega el enlace abajo y marca la campaña como publicada.

Deberías ver: Tu campaña en verde en el historial, con su enlace guardado.

¿Quién puede publicar?

No todo el mundo tiene usuario de Squarespace: la cuenta la tienen unas pocas personas por país. Si no eres una de ellas, pásales el documento, el título y la dirección que te dio RappiMind, o pídelo en #tyc-rappi.

Colombia

Cashback y descuentos

Camilo Patiño · ivan.patino@rappi.com
Valery Medina · ext-v.reina@rappi.com

Concursos

Para concursos todavía no hay una persona asignada. Pídelo en #tyc-rappi.

Los demás países

Todavía no tenemos la lista. Pide la publicación en #tyc-rappi.

¿No tienes usuario de Squarespace? Pide que te publiquen la página en #tyc-rappi

Si algo sale mal
El enlace no abre o da error 404.
La página quedó en borrador. Vuelve a Squarespace y dale Publicar, no solo Guardar.
El texto se ve corrido o sin viñetas.
Pégalo otra vez usando Pegar sin formato y deja que Squarespace le aplique el estilo de la página.
El enlace no empieza por promos.rappi.com.
Creaste la página en otro sitio. Tiene que estar dentro de promos.rappi.com para que RappiMind la acepte.
No tengo usuario de Squarespace.
Es normal: la cuenta la tienen unas pocas personas por país. Pide la publicación en #tyc-rappi y pasa el documento y la dirección que te dio RappiMind.
La dirección que puse quedó distinta a la que me dio la herramienta.
Vuelve a Opciones, corrígela y publica otra vez. Si ya la publicaste con otra dirección, pega en RappiMind el enlace real, no el que te propusimos.
Me equivoqué en un dato y ya generé el documento.
No edites el documento a mano. Genera uno nuevo con los datos corregidos y publica ese. El anterior queda en tu historial sin publicar.
Canal de ayuda

Si te trabaste con algo de la herramienta, escríbenos en el canal de ayuda. Ahí respondemos dudas de uso, no consultas legales.

A quién buscar
Juan Camilo Gallego

Dudas legales de fondo, campañas que no encajan en ningún tipo, y aprobación de textos nuevos.

Escríbele en #tyc-rappi.

Anna Habermann

Cómo plantear la campaña con el aliado y qué se puede prometer en las piezas de marketing.

Escríbele en #tyc-rappi.

Paula Barahona

Revisión de campañas de un país distinto a Colombia y coordinación con los equipos locales.

Escríbele en #tyc-rappi.

Preguntas frecuentes
Me equivoqué en un dato y ya generé el documento. ¿Qué hago?
¿Puedo participar yo en la campaña?
¿Qué pasa si se acaba el presupuesto antes de la fecha de fin?
¿Cuánto tarda en llegarme el documento?
¿Alguien de Legal revisa mi documento antes?
Ya publiqué y necesito cambiar las fechas. ¿Puedo?
El NIT del aliado no pasa la validación.
¿Puedo poner varias tiendas en una misma campaña?
¿Qué es un Maker y en qué cambia las cosas?
¿Por qué Rappi no puede ser el organizador?
Mi campaña es de Rappi Travel. ¿Sirve esta herramienta?
¿Dónde quedan guardados los documentos?
Mi campaña es un descuento o un cupón y no la veo en la lista de tipos.
```

---

## Pantalla 39 · Administración

*`admin` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** No es del recorrido del comercial: la ve quien tiene rol de administrador. Países y su estado, el equipo y las solicitudes, con su descarga.

**Lo que dice la pantalla, palabra por palabra:**

```
Países

Activo lo ve cualquiera. Piloto lo ven pruebas, legal y administración. Bloqueado no lo ve nadie.

País	Tipos habilitados	Estado
CO · Colombia	cashback, carrera_compras, cashback_day, cashback_eta, cashback_travel, descuento_travel	
activo
piloto
bloqueado

MX · México	cashback	
activo
piloto
bloqueado

PE · Perú	cashback	
activo
piloto
bloqueado

AR · Argentina	cashback	
activo
piloto
bloqueado

CL · Chile	cashback	
activo
piloto
bloqueado

EC · Ecuador	cashback	
activo
piloto
bloqueado

UY · Uruguay	cashback	
activo
piloto
bloqueado

CR · Costa Rica	cashback	
activo
piloto
bloqueado

BR · Brasil	promocao_br	
activo
piloto
bloqueado
Equipo
Correo	Nombre	Rol	País	Activo
demostracion@rappi.com	Demostración	admin	CO	Sí
Agregar o actualizar
comercial
pruebas
legal
admin
Guardar

Agregar muchos de una vez

Pega los correos separados por comas o uno por línea. Quien ya esté en el equipo se deja como está, así que esto nunca le baja el rol a nadie. Con rol legal, la persona ve los países en piloto.

comercial
pruebas
legal
admin
Agregar a todos
Solicitudes
Exportar a CSV

0 solicitudes

Id	Campaña	Quién	País	Tipo	Estado
```

---

## Fin de la tanda 3

Responde con las fichas de hallazgo en el formato del prompt, la tabla de cierre
y las tres preguntas para Juan. Si algo está bien, dilo en una línea y sigue: lo
que no tiene ficha se da por aprobado.
