# Prompt: aplicar las decisiones de Juan

Este es el prompt para la sesión de **Claude Code** que recoge las decisiones y
las mete al repositorio. Copia todo lo que está debajo de la línea y pégalo como
primer mensaje de una sesión nueva.

Sirve cada vez que Juan conteste más puntos: el issue es el mismo, lo ya aplicado
está marcado en el bloque G de `docs/PARA_DECIDIR.md`, y lo que sigue abierto es
lo que quede en ese documento.

**De dónde salen las respuestas.** Normalmente de una conversación de Claude chat
hecha con `docs/PROMPT_PENDIENTES.md`, que devuelve un bloque listo para pegar
como comentario en el issue. También sirve si Juan contesta a mano.

---

Ya subí mis decisiones sobre `docs/PARA_DECIDIR.md`. Están en el **issue #2 de
GitHub**, que se llama "Decisiones de Juan sobre PARA_DECIDIR.md". Léelas de ahí
y aplícalas.

Lo que vale es **el último comentario mío**, no el cuerpo del issue. El cuerpo es
el tablero de cómo va todo; el comentario nuevo es lo que acabo de decidir.

Soy Juan Camilo Gallego, abogado, dueño de producto y aprobador legal. No soy
técnico y no reviso código. Explícame todo por lo que yo veo en pantalla o por
lo que le pasa al comercial.

## Antes de tocar nada

Lee completos, en este orden, y no empieces a cambiar nada hasta terminar:

1. `CLAUDE.md`. Las reglas no negociables.
2. `.claude/skills/frontera-apps-script/SKILL.md`.
3. `.claude/skills/flujo-y-ux/SKILL.md`.
4. `docs/PARA_DECIDIR.md` entero. Cada punto tiene su código (B2, D3, F8) y el
   issue usa los mismos. Mira el bloque G antes de aplicar nada: si un punto ya
   está ahí, está cerrado y no se reabre.
5. `docs/DECISIONES.md` y las últimas entradas de `docs/PROGRESO.md`.

Después lee el issue y mira el estado real, no lo que digan los documentos:

```
npm test
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js
npm run front
```

Si algo de eso no corre, dímelo y no sigas como si nada.

## Lo que ya sabemos, para que no lo descubras otra vez

Dos puntos vienen con un bloqueo conocido desde el 20 de septiembre de 2026:

- **B2 y B3.** Los cuatro T&C aprobados por Legal Brasil **no están en el
  repositorio**. Ya se buscó en todo el árbol. Si yo no te los adjunté ni te dije
  dónde están, no los busques otra vez: dímelo y sigue con los demás.
- **D3.** La frase del caso de varios ganadores está corrompida en
  `docs/encargos/respuestas/01-legal.md`, decisión 36 (ii). Usa la que yo te
  confirme en el issue, no la del archivo.

## Cómo leer mis decisiones

- Cada punto lleva su código y una línea de decisión. **Lo que no contesté se
  queda como está**: no lo apliques a medias ni supongas lo que quise decir.
- Si escribí `(a)`, `(b)` o `(c)`, es la opción de ese punto en
  `docs/PARA_DECIDIR.md`.
- Si pegué texto entre comillas, **ese es el texto que va impreso, letra por
  letra**. No lo mejores, no le corrijas una tilde, no lo reordenes.
- Si pegué un bloque largo sin repartir por punto, **repártelo tú y enséñame el
  reparto antes de aplicarlo**, por si te confundiste de punto.
- Si una decisión mía no se entiende, o se contradice con otra, o necesita una
  frase que yo no escribí: **pregúntame antes de tocar nada**. Prefiero una
  pregunta a un texto inventado.

## Qué haces tú y qué me traes a mí

La línea es la misma de siempre, regla 5 de `CLAUDE.md`:

**Lo técnico lo decides y lo haces.** Aplicar la decisión, con su prueba, y
dejarlo escrito en `docs/DECISIONES.md`.

**El texto legal no lo redactas.** Si mi decisión implica una cláusula nueva y no
te la di escrita, me la pides. Regla 3.

Si dudas de qué lado cae algo: si cambia lo que dice el documento que lee un
usuario, o cambia a quién se le atribuye una responsabilidad, es mío. Si solo
cambia cómo el código llega al mismo texto, es tuyo.

## Orden

El bloque A está vacío desde el 20 de septiembre: ya no queda nada que impida
generar un documento ni usar un país. Así que aplica **de arriba abajo como
estén en `docs/PARA_DECIDIR.md`**, que ya está ordenado por lo que más
desbloquea: primero B, después C, D, E y F.

Dos excepciones, por encima de ese orden:

1. **Lo de Brasil va primero.** Brasil publica desde el 18 de septiembre y es lo
   único que corre riesgo hoy.
2. **Si un punto es grande, párate y dímelo antes de construirlo**, con qué
   implica. Grande quiere decir que abre pantalla nueva o una bifurcación, no que
   reemplaza una frase. Esos van en su propia sesión. Hoy sé que D1, D4 y D6 son
   de esos, así que si los contesté es para que me digas cuál va primero, no para
   que los construyas todos.

## Cómo entregar

- `npm test` antes de cada push, y me muestras el número.
- Los dos recorridos de navegador antes de dar por bueno cualquier cambio de
  interfaz.
- **Empuja directo a `main`.** No reviso código y no quiero pull requests. Eso
  significa que las pruebas son la única red que queda: córrelas siempre, y si
  tocas algo que no se pueda probar, dímelo en el reporte en vez de darlo por
  bueno.
- **`main` se mueve mientras trabajas.** Hay más de una sesión en este
  repositorio. Antes de empujar, trae `main` y resuelve lo que choque; si el
  choque es en un archivo que se genera, quédate con el de `main` y vuelve a
  generarlo.
- Commits en español, uno por decisión aplicada o por grupo de decisiones que
  vayan juntas.
- **Cada punto que quede aplicado pasa al bloque G de `docs/PARA_DECIDIR.md`**,
  con la fecha, y sale de la lista de preguntas abiertas. El documento tiene que
  quedar siendo la lista de lo que **sigue** pendiente.
- Si un punto deja de ser una pregunta y pasa a ser algo que alguien tiene que
  hacer fuera del repositorio, va al bloque H, no se borra.
- Marca la casilla del punto en el cuerpo del issue y deja ahí un comentario
  corto diciendo qué se aplicó. Cuando no quede nada abierto, ciérralo.
- `docs/PROGRESO.md` actualizado al final.
- Tienes mi autorización para lanzar el despliegue de GitHub Actions, pero
  avísame siempre. Lo que **no** puedes hacer es correr `setup()` dentro de Apps
  Script: eso lo ejecuto yo y me tienes que decir cuándo toca.

## El reporte final

En mis palabras, no en las tuyas:

1. **Qué decisiones apliqué y qué cambió en pantalla** con cada una.
2. **Qué decisiones no pude aplicar y por qué**: porque falta un texto tuyo,
   porque es grande y va en otra sesión, o porque no entendí la decisión.
3. **Qué sigue abierto** en `docs/PARA_DECIDIR.md`, y cuántos puntos quedaron.
4. **Qué necesito de ti** para lo siguiente.
