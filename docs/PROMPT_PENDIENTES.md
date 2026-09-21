# Prompt: cerrar los diez puntos que quedan abiertos

Este es el prompt para trabajar con **Claude chat**, no con Claude Code. Copia
todo lo que está debajo de la línea y pégalo como primer mensaje de una
conversación nueva.

La idea es que Claude chat te haga las preguntas con el selector de opciones, de
a una tanda, y al final te devuelva un bloque listo para pegar como comentario
en el issue #2. Ese comentario es lo que después aplica una sesión de Claude
Code con `docs/PROMPT_DECISIONES.md`.

Sirve igual si lo dejas a medias: lo que contestes se aplica, y lo que no, se
queda abierto en `docs/PARA_DECIDIR.md`.

---

Quiero cerrar contigo los puntos que siguen abiertos de RappiMind. Tienes acceso
al repositorio `juangallego-commits/rappimind-v3`.

Soy Juan Camilo Gallego, abogado en Rappi Colombia, dueño de producto y aprobador
legal de esta herramienta. No soy técnico y no leo código. Háblame de lo que yo
veo en pantalla o de lo que le pasa al comercial que usa la herramienta.

## Cómo quiero que trabajemos

**Hazme las preguntas con el selector de opciones**, ese cuadro que me sale abajo
para elegir, no en texto corrido. Es lo único que hace esto rápido.

Reglas de la conversación:

1. **Una tanda a la vez.** Máximo cuatro preguntas por tanda, con dos a cuatro
   opciones cada una. Espera mi respuesta antes de seguir con la siguiente.
2. **Ve en el orden que te doy abajo.** Está ordenado por lo que más corre
   riesgo, no por lo que es más fácil.
3. **Cada opción tiene que decirme qué pasa si la elijo.** No "opción (a)" a
   secas: qué cambia en pantalla, o qué le pasa al comercial, o qué queda
   publicado.
4. **Si una pregunta no se puede contestar sin un dato que ninguno de los dos
   tiene, dímelo y sáltala.** Prefiero saber qué falta a contestar al azar.
5. **Cuando yo elija algo que no entiendas del todo, pregúntame.** Prefiero una
   pregunta a que después se aplique otra cosa.

## Lo que no se negocia

Son las reglas del proyecto y están en `CLAUDE.md`. Léelas, pero estas tres son
las que importan para esta conversación:

1. **Rappi nunca es el organizador** de una campaña. El organizador es siempre la
   tienda o la marca que fondea. Rappi es plataforma de intermediación y
   responsable del tratamiento de datos. La única excepción es Brasil, que
   autoricé el 17 de septiembre de 2026 y que no sienta precedente.
2. **El texto legal no lo redactas tú.** Puedes proponerme una frase, pero
   márcala siempre como propuesta mía por aprobar, nunca como si fuera texto de
   Legal. Lo que se imprime sale de `modelos/` y de lo que yo apruebe letra por
   letra.
3. **Todo en español**, y en lo que yo voy a leer no uses guiones como signo de
   puntuación.

## Qué leer antes de la primera pregunta

- `docs/PARA_DECIDIR.md`. Son los diez puntos abiertos, cada uno con una nota
  arriba que dice qué pasó con él el 20 de septiembre de 2026. El bloque G, al
  final, es lo ya cerrado: mira ahí antes de proponerme algo, para no reabrir
  una decisión que ya tomé.
- `CLAUDE.md`.
- Para el punto C5, la **lista 2 de la sección 9.3** de
  `docs/encargos/respuestas/03-leyendas.md`. Son 24 preguntas numeradas y ya
  contesté la 6, la 16 y la 21.
- Para el punto F8, `docs/encargos/respuestas/02-interfaz.md`, las líneas que
  dicen `(recorrido)`.
- Para el punto D3, la **decisión 36 (ii)** de
  `docs/encargos/respuestas/01-legal.md`. Ahí está el texto roto del que te
  hablo abajo.
- Para los puntos de Brasil, `docs/MODELO_BASE_BRASIL.md` y
  `docs/CORRECCIONES_BRASIL.md`.

Si algo de esto no lo puedes abrir, dímelo y seguimos igual: abajo te dejo lo
que hace falta de cada punto.

---

# Las seis tandas, en orden

## Tanda 1. Brasil, que es lo único que corre riesgo hoy

Brasil genera y publica desde el 18 de septiembre de 2026. Son tres puntos y
van juntos porque dependen de la misma gente.

**B2. Nadie comparó lo que genera la herramienta contra lo que aprobó Legal
Brasil.** Los cuatro T&C aprobados (Desconto % OFF, Frete Grátis, Taxa de
serviço mínimo de compra, Taxa de serviço e entrega grátis) **no están en el
repositorio**: se buscó en todo el árbol el 20 de septiembre y lo único que hay
es el análisis de qué traen y el antes y el después de cada corrección. Los
cuatro casos de prueba de Brasil guardan lo que el motor produce hoy: protegen
ese texto de moverse solo, no dicen que sea el texto aprobado.

Lo que necesito decidir es si consigo los cuatro documentos o si los doy por
buenos como están.

**B3. Dos detalles del documento brasileño.** La hora de inicio: el formulario
deja 00:00 por defecto en todos los países y los cuatro aprobados arrancan a las
00:01. Y cómo se escribe el límite de pedidos: el motor imprime "um (1) pedido"
y la ayuda en portugués cita el documento aprobado como "1 (um) pedido". En
Brasil los montos van con la cifra primero, así que todo apunta a que la forma
aprobada es "1 (um)", pero nadie lo ha confirmado.

**E2. Nadie de Brasil ha leído el formulario en portugués.** La traducción de la
interfaz es de producto, no de Legal, y ninguna cláusula se tradujo. Pero una
ayuda mal traducida induce una respuesta equivocada, y esa respuesta sí sale
impresa. Los contactos son Amannda Moreira y un KAM de Brasil, y el orden de
lectura propuesto es: las cuatro opciones de "O que o usuário ganha?", la ayuda
del tope del frete grátis, la del mínimo de compra y los mensajes de error.

## Tanda 2. El punto que está bloqueado por una sola frase

**D3. El valor del premio en la Carrera de Compras.** Ya decidí que entra, con
los textos del encargo y con la guarda de que la pregunta solo aparece en
Colombia y con premio físico. No se aplicó por una razón tonta: la frase del caso
de **varios ganadores** quedó corrompida en el archivo del encargo. El
renderizado la convirtió en fórmula matemática y perdió todos los espacios. La
de un ganador sí está entera.

La de un ganador, tal como está guardada:

> El ganador recibirá el siguiente premio: {descripción}, con un valor comercial
> de {valor en letras} pesos M/Cte. (${valor}), IVA incluido.

La de varios, reconstruida quitando el formato y volviendo a poner los espacios.
**Esta es la que tengo que confirmar o corregir:**

> Cada ganador recibirá el siguiente premio: {descripción}, con un valor
> comercial unitario de {valor en letras} pesos M/Cte. (${valor}), IVA incluido.
> El valor comercial total de los premios de la Campaña es de {total en letras}
> pesos M/Cte. (${total}).

Pregúntame si la reconstrucción queda tal cual, y de paso si esto se construye
solo para Colombia (que es el único país donde Carrera está habilitada hoy) o si
las frases se escriben con la moneda y el impuesto de cada país.

## Tanda 3. Tres cosas que ya decidí y solo falta construir

**D1**, **D4** y **D6** están decididas y sus textos están guardados. No se
construyeron porque cada una abre pantalla nueva y va en su propia sesión. Lo
único que falta es que yo diga cuál va primero.

- **D1. Las tiendas Turbo del cashback por ETA.** Elegí que el T&C liste las
  tiendas una por una, con la cláusula 5 escrita. Es una lista que crece, con el
  patrón de la lista de tiendas del Cashback Multitienda.
- **D4. Los productos de la Carrera con nombre y código de barras.** Hoy es un
  campo de texto libre. Pasa a filas con nombre y EAN, con validación del dígito
  de control.
- **D6. El filtro antes de la lista de T&C generales.** Seis preguntas de sí o no
  antes de darle el enlace de un T&C ya publicado, con tres salidas distintas.
  Hoy el comercial entra a la lista y copia el enlace, y nadie revisa si su
  campaña de verdad cabe en ese documento.

Pregúntame el orden. Y si ves que una de las tres desbloquea más que las otras,
dímelo antes de preguntar.

## Tanda 4. La frase que falta para las leyendas

**C3.** De las tres frases que faltaban para la pieza publicitaria, dos ya las
escribí y están aplicadas. Queda la del caso de **consumo en el local**, y
depende de un dato que nadie tiene: el nombre exacto con el que la app de
Colombia muestra hoy esa modalidad. El documento lo cita entre comillas, así que
no se puede inventar.

Mientras ese dato falte, la opción "Solo consumo en el local" no se le ofrece a
nadie en el formulario, así que hoy no deja a ninguna campaña sin leyenda.

Lo que tengo que decidir es si alguien busca ese nombre en la app, o si la opción
se borra del todo. Si me dices que alguien lo busque, dime quién es el candidato
más probable dentro de Rappi.

## Tanda 5. Las 21 preguntas de leyendas que quedan

**C5.** La lista 2 de la sección 9.3 de `docs/encargos/respuestas/03-leyendas.md`
tiene 24 preguntas. Ya contesté la 6, la 16 y la 21. Quedan 21.

Hazme esto en tandas de cuatro, con el selector, en el orden en que están. Para
cada una:

- Resúmeme en dos líneas qué se está preguntando, sin que yo tenga que abrir el
  archivo.
- Dime si la respuesta cambia algo que hoy se imprime, o si es solo dejar
  constancia. Las que cambian algo van primero.
- Cuando la pregunta tenga una propuesta escrita en el encargo, ponla como una
  de las opciones y dime que es una propuesta, no un texto aprobado.

Si alguna necesita un dato de la lista 3 (los insumos que faltan), sáltala y
apúntala aparte.

## Tanda 6. Los 22 cambios de recorrido que quedan

**F8.** El encargo de la interfaz propuso 25 cambios de comportamiento. Entraron
dos y uno más quedó resuelto de paso. Quedan 22, y ya los tengo agrupados por
tamaño en `docs/PARA_DECIDIR.md`:

- **Pequeños, los tres en una sesión.** El contador de preguntas. Las fechas en
  palabras en "Ahora dice". El aviso de tiempo estimado en el ETA, que ya quedó
  resuelto.
- **Medianos, uno por sesión.** Partir en dos la sexta pregunta del filtro de
  Travel. Ordenar la pantalla de Ayuda. Subir el atajo a los T&C publicados por
  encima de los cuatro tipos y agregar "Mi campaña no es ninguna de estas". Que
  la calculadora del tope muestre también un pedido grande. No preguntar el
  negocio en países sin tipos de Travel.
- **Grandes, sesión propia cada uno.** "¿Quién puede publicar?" con el botón que
  arma el mensaje y los diez pasos de Squarespace plegados. El campo de ayuda del
  filtro de Travel, que es lo que hace falta para poder acortar esa pregunta.
- **Los cambios de texto sueltos**, de las pantallas 1, 2, 7, 8, 9, 11, 12, 14,
  15, 16, 17, 18, 19, 20, 21 y 22. No cambian comportamiento y se pueden aplicar
  todos de una.

Pregúntame cuáles entran y en qué orden. Empieza por si los cambios de texto
sueltos van todos de una, que es lo más barato de todo.

---

# Lo que quiero al final

Cuando terminemos, o cuando yo te diga que paremos, dame **un solo bloque de
texto listo para pegar** como comentario nuevo en el issue #2 del repositorio.
Con este formato, una línea por punto contestado:

```
### Decisiones del <fecha>

- **B2.** <lo que decidí, en una o dos frases>
- **D3.** <lo que decidí>
...
```

Tres cosas sobre ese bloque:

1. **Si una decisión lleva texto que va impreso, ponlo entre comillas y letra por
   letra**, tal como quedó. Quien lo aplica lo copia, no lo interpreta.
2. **Si una decisión depende de otra persona**, escribe de quién y desde cuándo,
   para que no se dé por cerrada antes de tiempo.
3. **No metas los puntos que no contesté.** Los que queden sin contestar se
   quedan abiertos, y prefiero verlos como pendientes a verlos contestados a
   medias.

Y dime, en dos líneas, qué quedó sin contestar y por qué.
