# Prompt: aplicar las decisiones de Juan

Este es el prompt para la sesión que recoge las decisiones del issue de GitHub y
las mete al repositorio. Copia todo lo que está entre las líneas y pégalo como
primer mensaje de una sesión nueva.

Sirve igual cada vez que Juan conteste más puntos: el issue es el mismo y lo que
ya esté aplicado queda marcado en `docs/PARA_DECIDIR.md`, bloque G.

---

Ya subí mis decisiones sobre `docs/PARA_DECIDIR.md`. Están en el **issue #2 de
GitHub**, que se llama "Decisiones de Juan sobre PARA_DECIDIR.md". Léelas de ahí
y aplícalas.

Soy Juan Camilo Gallego, abogado, dueño de producto y aprobador legal. No soy
técnico y no reviso código. Explícame todo por lo que yo veo en pantalla o por
lo que le pasa al comercial.

## Antes de tocar nada

Lee completos, en este orden, y no empieces a cambiar nada hasta terminar:

1. `CLAUDE.md`. Las reglas no negociables.
2. `.claude/skills/frontera-apps-script/SKILL.md`.
3. `.claude/skills/flujo-y-ux/SKILL.md`.
4. `docs/PARA_DECIDIR.md` entero. Es el documento al que le estoy contestando:
   cada punto tiene su código (A1, B3, F8) y el issue usa los mismos.
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

## Cómo leer mis decisiones

- Cada punto del issue lleva su código y una línea de **Decisión**. Algunos
  están contestados y otros no. **Lo que no contesté se queda como está**: no lo
  apliques a medias ni supongas lo que quise decir.
- Si escribí `(a)`, `(b)` o `(c)`, es la opción de ese punto en
  `docs/PARA_DECIDIR.md`.
- Si pegué texto entre comillas, **ese es el texto que va impreso, letra por
  letra**. No lo mejores, no le corrijas una tilde, no lo reordenes.
- Si algo quedó en el bloque "Lo que pegué tal cual", repártelo por punto tú
  mismo y **enséñame el reparto antes de aplicarlo**, por si te confundiste de
  punto.
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

Aplica **por bloques, de arriba abajo**: primero A, después B, y así. El bloque A
es lo que hoy impide que alguien genere un documento o que un país se use, así
que es lo primero que quiero ver funcionando.

Si un punto es grande (abre pantalla nueva, no es reemplazar una frase),
**párate y dímelo antes de construirlo**, con qué implica. Esos van en su propia
sesión.

## Cómo entregar

- `npm test` antes de cada push, y me muestras el número.
- Los dos recorridos de navegador antes de dar por bueno cualquier cambio de
  interfaz.
- **Empuja directo a `main`.** No reviso código y no quiero pull requests. Eso
  significa que las pruebas son la única red que queda: córrelas siempre, y si
  tocas algo que no se pueda probar, dímelo en el reporte en vez de darlo por
  bueno.
- Commits en español, uno por decisión aplicada o por grupo de decisiones que
  vayan juntas.
- **Cada punto que quede aplicado pasa al bloque G de `docs/PARA_DECIDIR.md`**,
  con la fecha, y sale de la lista de preguntas abiertas. El documento tiene que
  quedar siendo la lista de lo que **sigue** pendiente.
- Marca la casilla del punto en el issue y deja ahí un comentario corto diciendo
  qué se aplicó. Cuando no quede nada abierto, ciérralo.
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
