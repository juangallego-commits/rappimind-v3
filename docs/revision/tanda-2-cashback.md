# Tanda 2 de 7 · El Cashback, pregunta por pregunta

> **Antes de pegar esto, pega `PROMPT.md`.** Ahí va quién revisa, qué es
> RappiMind, qué no se puede tocar y en qué formato tiene que venir la
> respuesta. Sin eso, la revisión vuelve en prosa y no se puede aplicar.

El tipo de campaña de cuatro de cada cinco solicitudes. Diecisiete preguntas seguidas, una por pantalla, más la validación en vivo cuando algo está mal. Si el copy de estas diecisiete está bien, el producto está bien.

## Lo que hay que mirar en esta tanda

- Cada enunciado por separado: ¿se entiende en una leída, sin la ayuda?
- Cada línea de ayuda: ¿aporta algo que el enunciado no dijo, o solo lo repite con otras palabras?
- Cada "¿Por qué te preguntamos esto?": ¿explica la consecuencia de responder mal, o es relleno?
- El orden: ¿alguna pregunta llega antes de que el comercial tenga cómo responderla?
- Las opciones: ¿son excluyentes y completas? ¿falta un "ninguna de las anteriores" en alguna?
- Los mensajes de validación: ¿dicen qué pasó y cómo se arregla, o solo que está mal?
- Lo opcional: ¿se ve que se puede dejar en blanco?

Van 18 pantallas, con su texto tal como se lee en la aplicación.


**Para adjuntar en el mismo mensaje** (Claude chat lee imágenes, y es lo único
que le deja juzgar el aire, la jerarquía y el tamaño de los botones). Están en
`docs/revision/capturas/`:

- `09-identificacion.png` · pantalla 9, Formulario, la identificación del organizador
- `36-error.png` · pantalla 36, Formulario, un error en vivo
- `11-porcentaje.png` · pantalla 11, Formulario, el porcentaje
- `14-veces.png` · pantalla 14, Formulario, cuántas veces puede ganar

Si no las adjuntas, la revisión igual funciona: el texto va completo aquí.

---

## Pantalla 6 · Formulario, la tienda

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Escribe la marca comercial de la tienda. Es la primera pregunta después de elegir el tipo, y desde aquí la columna de la derecha empieza a llenarse con el documento.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Tu campaña
¿En qué país corre la campaña?
Cambiar

Colombia

¿La campaña es de Rappi o de Rappi Travel?
Cambiar

Rappi

¿Qué tipo de campaña vas a hacer?
Cambiar

Cashback

¿En qué tienda aplica?

La marca comercial como aparece en la app. Por ejemplo: Pollo Dorado.

¿Por qué te preguntamos esto?

El documento nombra la tienda y la define como Tienda Participante. Si el nombre no coincide con el de la app, el usuario no la encuentra.

Queda 1 pregunta en este paso.

Atrás
Siguiente
Tu T&C
Faltan 10 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «Pollo Dorado»
- Si lo deja en blanco: «Escribe la tienda donde aplica la campaña.»

---

## Pantalla 7 · Formulario, la cobertura

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Dice si la campaña corre en todo el país o solo en algunas ciudades. Aquí aparece por primera vez la línea "Así queda en tu T&C", que le muestra la frase exacta que va al documento.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Tu campaña
¿En qué país corre la campaña?
Cambiar

Colombia

¿La campaña es de Rappi o de Rappi Travel?
Cambiar

Rappi

¿Qué tipo de campaña vas a hacer?
Cambiar

Cashback

¿En qué tienda aplica?
Cambiar

Farmatodo

¿Dónde aplica la campaña?

Si es solo en algunas ciudades, las escribes en la siguiente pregunta.

En todo el país
Donde sea que Rappi tenga cobertura.
Solo en algunas ciudades
Por ejemplo: Bogotá y Medellín.
Así queda en tu T&C:
el territorio nacional de la República de Colombia
¿Por qué te preguntamos esto?

La cobertura define dónde puede reclamar el usuario. Si el documento dice más de lo que la campaña cubre, el usuario tiene derecho a exigirlo.

Atrás
Siguiente
Tu T&C
Faltan 9 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):


*En «¿Dónde aplica la campaña?»:*
- Viene marcada de entrada con: **Nacional**
- Si lo deja en blanco: «Elige si la campaña es nacional o por ciudades.»

*En «¿En qué ciudades?»:*
- Dentro del campo, en gris: «Bogotá, Medellín, Cali»
- Si lo deja en blanco: «Escribe al menos una ciudad, o vuelve y elige cobertura nacional.»
- Sugerencias que puede tocar: Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cúcuta

---

## Pantalla 8 · Formulario, quién organiza

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Escribe la razón social de la empresa que paga el beneficio. Es el Organizador, y nunca es Rappi.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Quién organiza la campaña
¿Qué empresa paga el beneficio?

Tal como sale en su RUT, por ejemplo: Alimentos del Norte S.A.S. Nunca es Rappi.

¿Por qué te preguntamos esto?

El Organizador responde por la campaña frente al usuario y frente a la autoridad. Rappi solo pone la plataforma, así que el nombre tiene que ser exacto.

Queda 1 pregunta en este paso.

Atrás
Siguiente
Tu T&C
Faltan 9 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «Alimentos del Norte S.A.S.»
- Si lo deja en blanco: «Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda.»

---

## Pantalla 9 · Formulario, la identificación del organizador

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Escribe el NIT del organizador. El sistema lo valida y lo muestra formateado como va a quedar en el documento.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Quién organiza la campaña
¿Qué empresa paga el beneficio?
Cambiar

Farmatodo Colombia S.A.S.

¿Cuál es el NIT de esa empresa?

Con dígito de verificación, tal como sale en el RUT: 900.111.222-1.

NIT 900.111.222-1 válido

Así queda en tu T&C:
NIT 900.111.222-1
¿Por qué te preguntamos esto?

El documento identifica al Organizador con su número tributario. Un número mal escrito deja el documento sin un responsable identificable.

Atrás
Siguiente
Tu T&C
Faltan 7 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «900.111.222-1»
- Cuando el dato está bien, debajo aparece: «válido»
- Si lo deja en blanco: «Escribe el NIT de la empresa organizadora, con el dígito de verificación.»
- Si lo escribe con otro formato: «Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion.»

---

## Pantalla 36 · Formulario, un error en vivo

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Escribe un NIT que no existe. El error sale debajo del campo mientras escribe, sin redibujar la pantalla y sin regañarlo antes de tiempo.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Quién organiza la campaña
¿Qué empresa paga el beneficio?
Cambiar

Farmatodo Colombia S.A.S.

¿Cuál es el NIT de esa empresa?

Con dígito de verificación, tal como sale en el RUT: 900.111.222-1.

El NIT tiene 9 dígitos más el de verificación, por ejemplo 900.111.222-1.

¿Por qué te preguntamos esto?
Atrás
Siguiente
Tu T&C
Faltan 8 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «900.111.222-1»
- Cuando el dato está bien, debajo aparece: «válido»
- Si lo deja en blanco: «Escribe el NIT de la empresa organizadora, con el dígito de verificación.»
- Si lo escribe con otro formato: «Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion.»

---

## Pantalla 10 · Formulario, cuándo arranca

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige el día de inicio de la campaña. Al responderlo, la herramienta propone el mismo día como día de fin.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Cuándo corre la campaña
¿Qué día arranca la campaña?

Puede ser hoy. Publica los T&C antes de que arranque.

¿Por qué te preguntamos esto?

Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

Quedan 3 preguntas en este paso.

Atrás
Siguiente
Tu T&C
Faltan 7 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):


*En «¿Qué día arranca la campaña?»:*
- Aviso: «Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.»
- Si lo deja en blanco: «Elige el día en que arranca la campaña.»
- Si la fecha ya pasó: «Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.»

*En «¿A qué hora arranca?»:*
- Viene marcada de entrada con: **00:00**
- Si lo deja en blanco: «Elige la hora de inicio.»

*En «¿Qué día termina?»:*
- Si lo deja en blanco: «Elige el día en que termina la campaña.»
- Si las fechas van al revés: «La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.»

*En «¿A qué hora termina?»:*
- Viene marcada de entrada con: **23:59**
- Si lo deja en blanco: «Elige la hora de fin.»
- Si las fechas van al revés: «La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.»

---

## Pantalla 11 · Formulario, el porcentaje

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Escribe el porcentaje que la tienda devuelve en Créditos. Es la promesa central de la campaña.

**Para leer la pantalla.** Aquí la vista previa va completa: el documento a medio llenar, con lo respondido escrito y lo que falta en gris. En la aplicación, la frase que acaba de cambiar se resalta en naranja un segundo y se apaga sola.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
El beneficio
¿Qué porcentaje del pedido se devuelve en Créditos?

Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

¿Por qué te preguntamos esto?

Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

Quedan 4 preguntas en este paso.

Atrás
Siguiente
Tu T&C
Faltan 4 datos

TÉRMINOS Y CONDICIONES

FARMATODO · CASHBACK · 1 OCT 2026


[... aquí sigue el documento legal completo, que no entra en esta revisión: el texto de las cláusulas lo escribe el equipo legal y no se toca ...]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «20»
- Si lo deja en blanco: «Escribe el porcentaje que devuelves, sin el signo de porcentaje.»
- Si el número se sale del rango: «El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.»

---

## Pantalla 12 · Formulario, el tope por pedido

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Escribe el máximo de Créditos que puede recibir una persona por pedido. Abajo aparece la calculadora con un ejemplo.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
El beneficio
¿Qué porcentaje del pedido se devuelve en Créditos?
Cambiar

20%

¿Cuál es el máximo de Créditos por pedido?

Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

$
¿Por qué te preguntamos esto?

Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

Con estos datos, un pedido de $100.000 recibe $20.000 en Créditos.

Quedan 3 preguntas en este paso.

Atrás
Siguiente
Tu T&C
Faltan 3 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «25000»
- Si lo deja en blanco: «Escribe el máximo de Créditos que recibe una persona por pedido.»
- Si escribe cero: «El tope tiene que ser mayor que cero.»
- Si el número supera el presupuesto: «El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.»

---

## Pantalla 13 · Formulario, el presupuesto

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Escribe la plata total de la campaña. Cuando se agota, la campaña termina sola y el documento lo dice.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
El beneficio
¿Qué porcentaje del pedido se devuelve en Créditos?
Cambiar

20%

¿Cuál es el máximo de Créditos por pedido?
Cambiar

$20.000

¿Cuánto es el presupuesto total de la campaña?

Cuando se acabe, la campaña termina sola. Lo habitual va de 5 a 40 millones.

$
¿Por qué te preguntamos esto?

El documento dice que la campaña termina al agotarse el presupuesto. Es lo que te protege si el consumo se dispara.

Con estos datos, un pedido de $100.000 recibe $20.000 en Créditos.

Quedan 2 preguntas en este paso.

Atrás
Siguiente
Tu T&C
Faltan 2 datos

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «20000000»
- Si lo deja en blanco: «Escribe el presupuesto total de la campaña.»
- Si escribe cero: «El presupuesto tiene que ser mayor que cero.»

---

## Pantalla 14 · Formulario, cuántas veces puede ganar

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige si el beneficio se puede repetir por persona. Si elige varias veces, aparece un campo extra para decir cuántas.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
El beneficio
¿Qué porcentaje del pedido se devuelve en Créditos?
Cambiar

20%

¿Cuál es el máximo de Créditos por pedido?
Cambiar

$20.000

¿Cuánto es el presupuesto total de la campaña?
Cambiar

$5.000.000

¿Cuántas veces puede recibir el beneficio una persona?

Se cuenta por persona, durante toda la campaña.

Una sola vez
Lo más común. El segundo pedido ya no da beneficio.
Varias veces
Tú dices cuántas.
Sin límite
Solo lo frena el presupuesto.
Así queda en tu T&C:
Puedes obtener el Beneficio en un máximo de un (1) pedido durante la vigencia de la Campaña; los pedidos adicionales no generarán el Beneficio y se procesarán como pedidos regulares.
¿Por qué te preguntamos esto?

Sin límite, unos pocos usuarios pueden consumir el presupuesto en horas. Con límite, el beneficio llega a más gente.

Queda 1 pregunta en este paso.

Atrás
Siguiente
Tu T&C
Falta 1 dato

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):


*En «¿Cuántas veces puede recibir el beneficio una persona?»:*
- Viene marcada de entrada con: **1**
- Si lo deja en blanco: «Dinos cuántas veces puede ganar la misma persona.»
- Si la cuenta no cuadra con lo que respondió antes: «Escribe cuántos pedidos con beneficio puede hacer una persona.»
- Si el número se sale del rango: «Tiene que ser al menos un pedido.»

---

## Pantalla 15 · Formulario, el tipo de pedido

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Puede restringir el beneficio a cierto tipo de pedido. Es opcional y puede seguir sin marcar nada.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
El beneficio
¿Qué porcentaje del pedido se devuelve en Créditos?
Cambiar

20%

¿Cuál es el máximo de Créditos por pedido?
Cambiar

$20.000

¿Cuánto es el presupuesto total de la campaña?
Cambiar

$5.000.000

¿Cuántas veces puede recibir el beneficio una persona?
Cambiar

Una sola vez

¿El beneficio aplica solo en cierto tipo de pedido?Opcional

Si aplica en cualquier pedido, no marques nada.

Solo si el pedido se hace por Turbo
Un pedido por el resto de la app no da el beneficio.
Solo si consume en el local
Pide por la app y come en el local. Un domicilio no da el beneficio.
¿Por qué te preguntamos esto?

Esta pregunta es sobre el pedido con el que el usuario se gana el beneficio, no sobre dónde gasta después los Créditos: eso se pregunta más adelante. Si la restricción no queda escrita, el usuario puede reclamar el beneficio en cualquier pedido.

Atrás
Siguiente
Tu T&C
Falta 1 dato

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

---

## Pantalla 16 · Formulario, cuándo llegan los Créditos

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige en qué momento se le acreditan los Créditos al usuario.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Los Créditos
¿Cuándo le llegan los Créditos al usuario?

Es el momento en que el saldo le queda disponible en la Billetera.

Al día siguiente del pedido
Lo más usado.
Apenas termina el pedido
Inmediato, sin verificación previa.
En una fecha específica
Todos reciben el mismo día.
Así queda en tu T&C:
al día siguiente de la finalización de la orden Rappi se reserva el derecho de verificar la elegibilidad de cada pedido antes de acreditar el Beneficio; si la verificación determina que el pedido no cumple las condiciones de la Campaña, los Créditos no serán acreditados y se te informará a través de la Plataforma Rappi.
¿Por qué te preguntamos esto?

El documento fija en qué momento el usuario recibe los Créditos, y eso es lo que el usuario va a esperar. Elige lo que el equipo de operaciones puede cumplir.

Quedan 2 preguntas en este paso.

Atrás
Siguiente
Tu T&C
Falta 1 dato

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):


*En «¿Cuándo le llegan los Créditos al usuario?»:*
- Viene marcada de entrada con: **dia_siguiente**
- Si lo deja en blanco: «Dinos cuándo le llegan los Créditos al usuario.»

*En «¿Qué día les cargas los Créditos?»:*
- Si lo deja en blanco: «Elige el día de la carga.»
- Si la fecha queda antes de la que debía: «La carga no puede ser antes de que arranque la campaña.»

---

## Pantalla 17 · Formulario, hasta cuándo sirven los Créditos

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige hasta cuándo puede gastarlos. Según lo que responda, la herramienta le pide después una fecha o un número de días.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Los Créditos
¿Cuándo le llegan los Créditos al usuario?
Cambiar

Al día siguiente del pedido

¿Hasta cuándo puede usar esos Créditos?

Por ejemplo: hasta el 31 de diciembre, o 30 días desde que le llegan.

Hasta una fecha
Todos vencen el mismo día.
Durante unos días
Cuenta desde que le llegan a cada uno.
¿Por qué te preguntamos esto?

Los Créditos se vencen y eso tiene que estar escrito. Si no lo dices, el usuario puede sostener que no vencen.

Queda 1 pregunta en este paso.

Atrás
Siguiente
Tu T&C
Falta 1 dato

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):


*En «¿Hasta cuándo puede usar esos Créditos?»:*
- Si lo deja en blanco: «Dinos hasta cuándo sirven los Créditos.»

*En «¿Cuántos días le duran?»:*
- Dentro del campo, en gris: «30»
- Si lo deja en blanco: «Escribe cuántos días duran los Créditos.»
- Si el número se sale del rango: «Los días van de 1 a 365.»

*En «¿Qué día se vencen los Créditos?»:*
- Si lo deja en blanco: «Elige el día en que se vencen los Créditos.»
- Si las fechas van al revés: «Los Créditos tienen que vencerse después de que termine la campaña. Si no, quien compre el último día no alcanza a usarlos.»

---

## Pantalla 18 · Formulario, dónde se gastan los Créditos

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige en qué parte de la app se pueden usar esos Créditos.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Los Créditos
¿Cuándo le llegan los Créditos al usuario?
Cambiar

Al día siguiente del pedido

¿Hasta cuándo puede usar esos Créditos?
Cambiar

Hasta una fecha

¿Qué día se vencen los Créditos?
Cambiar

31 de diciembre de 2026

¿Dónde puede gastar los Créditos?

Por ejemplo: solo en la tienda donde se los ganó, que es lo más común.

Solo en esta tienda
Vuelve a comprar donde ganó el beneficio.
En ciertas secciones de Rappi
Tú eliges cuáles.
En cualquier parte de Rappi
Donde sea que se acepten Créditos.
Así queda en tu T&C:
Los Créditos podrán redimirse únicamente en la Tienda Participante donde se originó el Beneficio, dentro del Territorio.
¿Por qué te preguntamos esto?

Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni Rappi Travel.

Atrás
Siguiente
Tu T&C
Completo

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Viene marcada de entrada con: **tienda**
- Si lo deja en blanco: «Dinos dónde puede gastar los Créditos.»

---

## Pantalla 19 · Formulario, quién participa

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige a qué usuarios les aplica la campaña.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Quién puede participar
¿Quiénes pueden participar?

Por ejemplo: solo Pro, o quienes no compran hace 60 días.

Todos los usuarios
Cualquier persona mayor de edad.
Solo Pro y Pro Black
Con la suscripción activa.
Solo usuarios nuevos
Su primer pedido en Rappi.
Usuarios que no compran hace rato
Tú dices desde cuándo.
Así queda en tu T&C:
Pueden participar todos los Usuarios/Consumidores de la Plataforma Rappi que sean mayores de edad.
¿Por qué te preguntamos esto?

Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

Quedan 2 preguntas en este paso.

Atrás
Siguiente
Tu T&C
Completo

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):


*En «¿Quiénes pueden participar?»:*
- Viene marcada de entrada con: **todos**
- Si lo deja en blanco: «Dinos quiénes pueden participar.»

*En «¿Cuántos días sin comprar?»:*
- Dentro del campo, en gris: «60»
- Si lo deja en blanco: «Escribe cuántos días sin comprar.»
- Si el número se sale del rango: «Los días van de 1 a 365.»

---

## Pantalla 20 · Formulario, el medio de pago

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige con qué medios de pago aplica el beneficio.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Quién puede participar
¿Quiénes pueden participar?
Cambiar

Todos los usuarios

¿Con qué medio de pago aplica el beneficio?

Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.

Con cualquier medio de pago
Lo más común.
Con todo menos efectivo
Tarjetas y billeteras sí, efectivo no.
Solo con RappiCard
Únicamente la tarjeta de Rappi.
Así queda en tu T&C:
Campaña válida para pedidos pagados con cualquiera de los medios de pago habilitados en la Plataforma Rappi. Los pedidos pagados total o parcialmente con Créditos no son válidos para la Campaña.
¿Por qué te preguntamos esto?

Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

Queda 1 pregunta en este paso.

Atrás
Siguiente
Tu T&C
Completo

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Viene marcada de entrada con: **todos**
- Si lo deja en blanco: «Dinos con qué puede pagar el usuario.»

---

## Pantalla 21 · Formulario, la compra mínima

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** La única marcada como opcional en este paso. Puede dejarla vacía y seguir.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
Quién puede participar
¿Quiénes pueden participar?
Cambiar

Todos los usuarios

¿Con qué medio de pago aplica el beneficio?
Cambiar

Con cualquier medio de pago

¿Hay que gastar un mínimo para participar?Opcional

Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.

$
¿Por qué te preguntamos esto?

Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.

Atrás
Siguiente
Tu T&C
Completo

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «100000»
- Si escribe cero: «Si no quieres exigir un mínimo, deja el campo vacío.»

---

## Pantalla 22 · Formulario, la categoría del producto

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** La última pregunta, y la única que no cambia nada del T&C: decide la leyenda que va dentro de la pieza publicitaria. Viene marcada en Ninguna, que es la respuesta de casi todas las campañas, y cada opción adelanta la advertencia que se va a imprimir. Si elige un medicamento se abren dos preguntas más, el registro sanitario y la notificación ante el INVIMA.

**Para leer la pantalla.** Las opciones no están escritas en ningún esquema: salen del catálogo de modelos/leyendas/, así que cada país ofrece solo las categorías para las que Legal tiene una leyenda aprobada. Colombia ofrece diez; México, cinco; Uruguay, Costa Rica y Brasil, ninguna, y ahí la pregunta no aparece.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Organizador
Cuándo
Beneficio
Créditos
Participantes
Pieza
La pieza publicitaria
¿Qué categoría tiene el producto de la pieza?Opcional

Casi siempre es Ninguna. Solo cambia la leyenda del arte, no tu T&C.

Ninguna de estas
El producto no necesita advertencia por ley.
Cervezas y bebidas 0.0%
No se recomienda para mujeres embarazadas ni para menores de…
Cigarrillos
El tabaco es nocivo para la salud. Ley 30 de 1986. Verificar…
Fitoterapéuticos PFM
Preparaciones farmacéuticas con base en plantas medicinales…
Fitoterapéuticos PFT o PFTI
Producto fitoterapéutico de uso tradicional (PFT o PFTI). No…
Licores y cervezas
El exceso de alcohol es perjudicial para la salud. Ley 30 de…
Productos con nicotina de PMI
Este producto no es libre de riesgo y contiene nicotina que es…
Suplementos dietarios
Este producto no sirve para el diagnóstico, tratamiento, cura o…
Un medicamento de venta libre
Es medicamento, leer indicaciones y contraindicaciones, si…
Vapeadores
Prohibida la venta a menores de edad. Producto nocivo para la…
Varios medicamentos de venta libre
Son medicamentos, leer indicaciones y contraindicaciones, si…
¿Por qué te preguntamos esto?

Algunas categorías tienen que llevar una advertencia por ley dentro de la pieza, como los licores o los medicamentos. La leyenda que te damos ya la trae.

Atrás
Revisar y generar
Tu T&C
Completo

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):


*En «¿Qué categoría tiene el producto de la pieza?»:*
- Viene marcada de entrada con: **ninguna**
- Si lo deja en blanco: «Elige una categoría, o Ninguna si el producto no es de ninguna de esas.»

*En «¿Cuál es el registro sanitario?»:*
- Dentro del campo, en gris: «INVIMA 2020M-0012345»
- Si lo deja en blanco: «Escribe el registro sanitario del producto.»

*En «¿Tiene número de notificación ante el INVIMA?»:*
- Dentro del campo, en gris: «20251234567»

---

## Fin de la tanda 2

Responde con las fichas de hallazgo en el formato del prompt, la tabla de cierre
y las tres preguntas para Juan. Si algo está bien, dilo en una línea y sigue: lo
que no tiene ficha se da por aprobado.
