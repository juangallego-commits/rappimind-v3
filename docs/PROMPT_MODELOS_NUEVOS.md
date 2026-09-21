# Prompt: los modelos que hoy no existen y por eso se redactan a mano

Para abrir una sesión nueva de Claude Code sobre `rappimind-v3`. Copia todo lo
que está debajo de la línea y pégalo como primer mensaje.

Juan lo encargó el 21 de septiembre de 2026, después de probar el formulario de
Rappi Travel y encontrar que cinco campañas reales, ya publicadas, caían todas
en el mismo bloqueo.

---

Vas a trabajar en RappiMind v3. Lee `CLAUDE.md` completo antes de nada, y
después `docs/piezas_publicadas/LEEME.md`, que es de donde sale este encargo.

## El problema, en una frase

El filtro de Rappi Travel manda a Legal toda campaña cuyo beneficio no sea
Créditos ni un descuento en el precio. Esa pregunta existe porque no hay modelo
para esos casos, no porque el caso sea difícil. Y es un bloqueo caro: las cinco
piezas de `docs/piezas_publicadas/` son campañas reales, aprobadas y publicadas,
que se redactaron a mano por eso.

El encargo es construir los modelos que faltan, a partir de esas piezas.

## Lo que no se negocia

Las reglas de `CLAUDE.md` valen enteras. Dos importan especialmente aquí:

1. **El texto legal es de Legal.** Tú no redactas cláusulas nuevas de cero. Lo
   que haces es **ensamblar**, a partir de texto que Legal ya publicó, el modelo
   con sus placeholders. Cuando una pieza y otra digan lo mismo con palabras
   distintas, no elijas tú: deja las dos opciones anotadas y que Juan escoja.
2. **Rappi nunca es el organizador.** En estas piezas se nota más que en
   ninguna: en la de MUSS y TANGA el Organizador es LifeMiles, y Rappi dice
   expresamente que no organiza ni responde. Respeta ese reparto.

Y la regla 5: **si una decisión es legal o de negocio, pregunta.** Aquí vas a
tener muchas. No las resuelvas solo.

## Por dónde empezar, y por qué

**Empieza por las millas.** Es la única mecánica que aparece dos veces, así que
es la que más pronto se vuelve a pedir, y es la que deja ver si el diseño
aguanta: las dos piezas de millas son de verticales distintas, Rappi Travel y
Turbo, con entidades legales distintas y cláusulas de plataforma distintas. Si
el modelo de millas sirve para las dos, el diseño está bien. Si solo sirve para
una, hay que repensarlo antes de seguir con las otras.

Después, en este orden, que es el de cuánto se repiten:

2. **Descuento variable por hotel** (dos piezas). El porcentaje no es un número,
   es una lista de hoteles, cada uno con el suyo, su beneficio de niños y sus
   fechas de venta y de viaje. En el documento va como viñetas, nunca como
   tabla (regla 5 de `CLAUDE.md`: el sitio donde se publica no las muestra).
3. **Producto de un aliado que se entrega aparte** (la eSIM de Conecty). Es el
   caso más raro: el beneficio no es plata ni descuento, es una cosa que llega
   por correo con un QR, con stock limitado y vigencia propia.

## Cómo se trabaja cada modelo

1. **Lee las piezas de esa mecánica**, enteras, en `docs/piezas_publicadas/`.
2. **Compara con `modelos/cashback_travel.md` y `modelos/descuento_travel.md`**,
   que son los dos modelos de Travel que ya existen, y con los bloques
   compartidos de `modelos/bloques/` que empiezan por `travel_`. Casi todo el
   documento se reusa: lo que cambia es la cláusula del beneficio, la de
   acreditación y la de responsabilidad.
3. **Escribe el modelo** en `modelos/`, con sus placeholders, reusando bloques
   en vez de copiar texto. Si haces un bloque nuevo, va en `modelos/bloques/`.
4. **Pon el esquema** en `src/core/esquemas.js` y las preguntas en
   `src/core/preguntas.js`, con el estándar de siempre: enunciado corto en tú,
   ayuda con un ejemplo concreto, y un `porQue` que diga la consecuencia de
   responder mal.
5. **Agrega un caso a `pruebas/casos_base.json`** con su salida esperada en
   `pruebas/salidas_esperadas/`, y compruébalo con `npm run previsualizar`.
6. **Quita del filtro de Travel** la parte que ese modelo nuevo ya cubre, y
   comprueba que el camino completo funciona en la demostración. Un modelo que
   existe pero al que el filtro no deja llegar no existe.

## Lo que Juan tiene que aprobar, uno por uno

No empujes un modelo nuevo a `main` dándolo por bueno. Cada modelo es texto
legal que se va a publicar con el nombre de un aliado encima. El trato es:

- **Prepara el modelo completo**, con su formulario, sus pruebas y el texto que
  produce, y **muéstrale a Juan el documento generado**, no el código.
- **Dile en qué te apartaste de las piezas publicadas** y por qué. Si dos piezas
  decían lo mismo distinto, enséñale las dos.
- **Anota en `docs/PENDIENTES_LEGAL.md`** lo que no puedas resolver sin él.
- Espera su visto bueno antes de dar el modelo por cerrado.

Lo que sí puedes empujar sin preguntar es el andamiaje: pruebas, esquemas,
preguntas del formulario y arreglos de código. El texto legal, no.

## Una pregunta abierta que Juan quiere resuelta

En el filtro de Travel hay una pregunta que manda a Legal cuando el producto es
un seguro, para distinguirlo de una asistencia al viajero. Juan dice que nunca
va a haber una solicitud de seguro que no sea de **Universal Assistance**, que
es el aliado de Rappi para eso, y que la pregunta sobra.

No hay ninguna pieza de Universal Assistance en el repositorio. Antes de tocar
esa pregunta, pídele a Juan dos o tres de sus T&C publicados. Sin eso, quitar la
pregunta es abrir un camino que no se sabe a dónde lleva.

## Cómo se cierra

`npm test` antes de cada push, como siempre. Al terminar cada modelo, actualiza
`docs/PROGRESO.md` con qué quedó, cómo probarlo y qué necesitas de Juan. Las
decisiones técnicas van a `docs/DECISIONES.md`.

FIN DEL PROMPT.
