# Prompt para la siguiente sesión de Claude Code

Copia todo lo que está entre las líneas y pégalo como primer mensaje.

---

Vas a retomar RappiMind v3. La sesión anterior (17 de septiembre) revisó con ojos
críticos todo lo que se había construido la noche anterior, arregló cuarenta y un
defectos con su prueba (en dos vueltas: la interfaz y Brasil primero; el servidor,
el Sheet y el cashback por ETA después), y dejó escritos los tres encargos para
Claude chat en `docs/encargos/`. Yo ya mandé esos encargos (o los voy a mandar) y voy a traer las
respuestas. Tu trabajo en esta sesión es **convertir esas respuestas en cambios**,
sin traducir nada a mano y sin decidir nada legal por tu cuenta.

## Antes de tocar nada

Lee completos, en este orden:

1. `CLAUDE.md`, que tiene las reglas no negociables.
2. `.claude/skills/flujo-y-ux/SKILL.md` y `.claude/skills/frontera-apps-script/SKILL.md`.
3. `docs/PROGRESO.md`, de abajo hacia arriba. La última entrada es la de la
   revisión crítica: ahí está lo que se arregló y lo que quedó pendiente.
4. `docs/DECISIONES.md`, las decisiones 1 a 23 del final, para no deshacerlas.

Después mira el estado real, no lo que digan los documentos:

```
npm test                                                        # deben pasar 421
npm run demo
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 40 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 25 revisiones
```

Los recorridos necesitan playwright-core y un Chromium. En el contenedor remoto
están en `/opt/node22/lib/node_modules` (`export NODE_PATH=...`) y en
`/opt/pw-browsers`. Si no los encuentras, dímelo y no sigas como si nada.

## Las respuestas de Claude chat, y qué hacer con cada una

No te las voy a pegar en el chat: las subo al repositorio, enteras y sin editar,
en `docs/encargos/respuestas/`. Ahí está `LEEME.md` con los nombres y con cómo
las subo. Antes de tocar nada, mira qué archivos hay:

```
ls docs/encargos/respuestas/
```

Si el archivo que te nombro no está, dímelo y no adivines. Trabaja **una
respuesta por sesión**: cada una toca archivos distintos y mezclarlas es la
forma más fácil de aplicar mal un texto legal.

Y una regla que vale para las tres: lo que Claude chat recomiende sin dar el
texto exacto **no lo redactas tú**. Va a `docs/PENDIENTES_LEGAL.md` y me
preguntas.

### La respuesta del encargo 01 (`respuestas/01-legal.md`)

Viene con un bloque final "PARA EL REPOSITORIO" con líneas como
`MX.termino_dias = "días naturales"` y `modelo cashback, cláusula 8: ANTES "..."
DESPUÉS "..."`. Con eso:

- Los valores de país van a `data/paises.json` **y** a la pestaña Paises del
  Sheet (la hoja manda sobre la semilla: recuérdame cambiarlos allá). Cuando un
  dato se confirma, sácalo de `por_confirmar_en_pruebas` de ese país.
- Los cambios de modelo son texto legal: aplícalos literalmente en `modelos/`,
  regenera las salidas esperadas que cambien (`pruebas/salidas_esperadas/`) y
  dime cuáles cambiaron para que yo las mire.
- Cuando un país tenga sus cuatro datos confirmados, no lo saques de piloto tú:
  dime que está listo y lo cambio yo en el Sheet.

### La respuesta del encargo 02 (`respuestas/02-interfaz.md`)

Viene con un bloque "PARA EL REPOSITORIO" con líneas
`pantalla NN | ACTUAL: "..." | PROPUESTO: "..."`. Busca cada "ACTUAL" literal en
`src/core/preguntas.js`, `src/core/preguntas_pt.js`, `src/core/textos_interfaz.js`,
`src/core/ayuda.js` y `src/client/js/`. Aplica solo los que cumplan las reglas de
`preguntas.test.js` (diez palabras, ayuda de una línea, sin guiones como
puntuación). Si un cambio toca una llave de `TEXTOS_PT`, cambia la llave y el
literal del código a la vez, o la traducción muere en silencio (hay una prueba
que lo caza). Después regenera las capturas con
`node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js`.

### La respuesta del encargo 03 (`respuestas/03-leyendas.md`)

Es trabajo nuevo, no un arreglo. Viene con fichas y con un bloque "PARA EL
REPOSITORIO" en el formato de `modelos/`. Antes de escribir código, léela entera y
dime: cuántas leyendas vienen de un playbook o de una pieza real y cuántas son
propuestas de Claude chat (esas las apruebo yo antes de que entren), qué datos
nuevos pide y cómo propone resolver el enlace que llega tarde. Con eso decidimos
juntos el diseño: dónde vive el catálogo (`modelos/leyendas/`), cómo se elige la
pieza y cómo se muestra en la pantalla final. No lo construyas sin esa conversación.

## Lo que sigue pendiente y no depende de Claude chat

Todo en `docs/PENDIENTES_LEGAL.md`. Lo que más urge:

- **Los quince enlaces** de los T&C generales de Colombia siguen sin abrirse desde
  el entorno. Si te confirmo que alguno no abre, se quita de `data/tyc_genericos.json`
  con su nota en `revisiones`.
- **Brasil**: la hora de inicio (00:00 contra 00:01), "um (1)" contra "1 (um)", y
  los cuatro casos dorados `BR01` a `BR04` contra los aprobados.
- **El cashback por ETA**: los dos casos dorados `ETA01` y `ETA02` contra los
  publicados de Bogotá y Barranquilla, y la mezcla de "tú" con "el
  Usuario/Consumidor" que dejan los bloques compartidos (puntos 8 a 10 de
  `docs/PENDIENTES_LEGAL.md`). Si yo decido cambiar un bloque compartido, dime
  el texto exacto: no lo redactes tú.
- **Después de desplegar hay que correr `setup()`** una vez: pone al día la lista
  de datos por confirmar de Brasil en la pestaña Paises. Yo lo corro; recuérdamelo.
- **Los T&C generales vencen** el 31 de octubre (uno) y el 31 de diciembre (los
  demás). Si Legal publica versiones nuevas, hay que actualizar el archivo antes.

## Cómo trabajamos

- No soy técnico. Explícame las cosas por lo que yo veo en pantalla.
- `npm test` antes de cada push, y me muestras el resultado.
- Los dos recorridos de navegador antes de dar por bueno cualquier cambio de
  interfaz.
- Puedes usar agentes en paralelo, repartidos por archivos, pero **verifica tú
  mismo lo que te reporten**: en las dos últimas sesiones, cada agente reportó su
  trabajo como terminado y en la mayoría había defectos reales.
- Tienes mi autorización para lanzar el despliegue de GitHub Actions cuando haga
  falta, pero avísame siempre. Lo que **no** puedes hacer es correr `setup()`
  dentro de Apps Script: eso lo ejecuto yo, y me tienes que decir cuándo toca.
- Si una decisión es legal o de negocio, pregúntame. Si es técnica, decídela y
  déjala escrita en `docs/DECISIONES.md`.
