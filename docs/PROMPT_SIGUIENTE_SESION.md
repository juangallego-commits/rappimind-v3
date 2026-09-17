# Prompt para la siguiente sesión de Claude Code

Copia todo lo que está entre las líneas y pégalo como primer mensaje.

---

Vas a retomar RappiMind v3. La sesión anterior fue muy larga y hay bastante
trabajo hecho que **yo todavía no he revisado**, así que tu primer trabajo no es
construir nada nuevo: es revisar lo que hay, encontrar lo que esté roto y
dejármelo listo para probar.

## Antes de tocar nada

Lee completos, en este orden:

1. `CLAUDE.md`, que tiene las reglas no negociables.
2. `.claude/skills/flujo-y-ux/SKILL.md` y su `references/recorrido.md`.
3. `.claude/skills/frontera-apps-script/SKILL.md` y su `references/incidentes.md`.
4. `docs/PROGRESO.md`, de abajo hacia arriba, que cuenta qué se hizo cuándo.

Después mira el estado real, no lo que digan los documentos:

```
npm test                                                        # deben pasar 358
npm run demo
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 30 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 16 revisiones
```

Los dos recorridos necesitan playwright-core y un Chromium. Si no los encuentras,
dímelo y no sigas adelante como si nada: son la única forma de ver defectos que
las pruebas no ven.

## Qué se construyó y yo no he revisado

Todo esto entró en una sola noche, entre el commit `aff1bb2` y el `393f7bb`, y
parte lo hicieron agentes en paralelo:

- **El idioma del documento sale del país.** Portugués completo, con sus reglas
  de números y fechas. El español no cambió.
- **Brasil**: un modelo con cuatro formas del beneficio, sacado de cuatro T&C
  aprobados. Brasil pasó a piloto.
- **"15 minutos o Cashback"** para Colombia, de los T&C publicados de Bogotá y
  Barranquilla.
- **La interfaz en portugués**, con un botón de idioma abajo a la derecha.
- **Carga masiva de personas** en Administración, para dar de alta a los equipos
  legales de los otros países.
- **El aviso de país en pruebas**, en el formulario y en el resumen.
- **Los quince T&C generales de Colombia**, que se ofrecen en vez de generar un
  documento cuando la campaña es un descuento o un cupón.

## Lo que quiero de ti, en este orden

### 1. Revisión crítica de lo anterior

Busca defectos de verdad, no me des un informe de que todo está bien. En la
sesión pasada, cada vez que alguien revisó con cuidado aparecieron cosas como
estas, todas reales:

- Una variable de CSS que no existía dejó el botón del idioma invisible.
- Tres preguntas tenían dos bloques `variantes` y el segundo borraba al primero
  en silencio, así que en una campaña brasileña la pantalla preguntaba cuántos
  Créditos devuelves cuando Brasil no da Créditos.
- El mecanismo de variantes estaba probado en Node y la interfaz nunca lo
  llamaba.
- Los mensajes de error escritos para cada pregunta no se usaban nunca.
- La auditoría guardaba identificadores crudos en el Sheet.
- Un valor del país llevaba la palabra "(confirmar)" dentro de un texto que se
  imprime.

Presta atención especial a lo que hicieron los agentes en paralelo, porque nadie
lo ha mirado con ojos críticos: `data/tyc_genericos.json`,
`src/core/tyc_genericos.js`, `src/client/js/63-tyc-genericos.js`,
`src/core/preguntas_pt.js` y `src/core/textos_interfaz.js`.

Cuando encuentres algo, arréglalo, escribe la prueba que lo caza, y explícame en
una frase qué habría pasado si no lo arreglas.

### 2. Prepárame los tres encargos para Claude chat

Esto es la mitad del trabajo de esta sesión, no un añadido al final.

Claude chat es otra conversación, **sin acceso a este repositorio y sin memoria
de nada de esto**. Yo voy a abrir tres conversaciones separadas y a pegar un
mensaje en cada una. Tu trabajo es dejar esos tres mensajes escritos y completos.

**Dónde los dejas.** Un archivo por encargo, y nada más que eso adentro:

- `docs/encargos/01-revision-legal.md`
- `docs/encargos/02-revision-interfaz.md`
- `docs/encargos/03-leyendas.md`

Cada archivo empieza con una línea mía de instrucciones (qué adjuntar, si hay que
adjuntar algo) y después, separado, **el mensaje entero para pegar**. Nada de
"ver el archivo X" dentro del mensaje: si hace falta un dato, va escrito ahí.

**El material que ya existe** y que tienes que revisar, mejorar y convertir en
esos tres mensajes:

| Encargo | Material de partida | Qué le pido a Claude chat |
|---|---|---|
| 01 | `docs/PAQUETE_REVISION_LEGAL.md` | Que responda las 44 preguntas legales, las 23 bloqueantes primero |
| 02 | `docs/REVISION_FRONT.md` y las 33 capturas | Que revise el copy y la experiencia de cada pantalla |
| 03 | `docs/PAQUETE_LEYENDAS.md` y `docs/LEYENDAS_PIEZAS_REALES.md` | Que arme el catálogo de leyendas para las piezas |

**Revísalos de verdad antes de convertirlos.** Los escribieron agentes en
paralelo y nadie los ha mirado con ojos críticos. Si una pregunta está mal
planteada, si falta contexto para poder responderla, o si hay algo que ya
resolvimos y quedó como pendiente, arréglalo.

**Tres cosas que tienes que resolver y que hoy no están resueltas:**

1. **Las capturas.** Claude chat no puede leerlas del repositorio: yo las tengo
   que subir a mano. Dime en la línea de instrucciones **exactamente cuáles
   subir y en qué orden**, y que el mensaje las nombre igual que los archivos,
   para que él pueda referirse a ellas. Si son 33 y eso es demasiado, elige las
   que valgan la pena y dime por qué esas.
2. **En qué orden los mando.** Los tres encargos no pesan lo mismo ni me
   desbloquean lo mismo. Dime cuál mando primero y por qué.
3. **Qué formato quiero de vuelta.** En cada encargo, dile a Claude chat cómo
   quiero la respuesta para que yo pueda traértela y tú puedas convertirla en
   código o en modelos sin traducir nada a mano. Para las leyendas, eso
   significa pedirlas con los marcadores `{{ }}` que ya usan los modelos de
   `modelos/`.

**Sobre el de las leyendas, que es el más importante de los tres.** Léete
`docs/LEYENDAS_PIEZAS_REALES.md` con cuidado. Son cuatro piezas publicadas de
verdad, y entre las cuatro hay un enlace sin rellenar, una marca equivocada, una
ciudad equivocada, dos años distintos y cuatro contradicciones de fecha entre el
texto grande y el chico. Ninguno es un error de criterio legal: todos son de
copiar y pegar la letra pequeña de otra campaña. Y los datos que salen mal son
los mismos que el comercial ya le da a RappiMind. Ese es el argumento entero de
por qué esto lo tiene que generar la herramienta, y tiene que estar dentro del
mensaje, no solo en tu cabeza.

Ojo con una cosa que ya sabemos y que Claude chat no puede adivinar: los dos
playbooks que me pasaron **no traen ni una sola leyenda de cashback**, que es el
55% de lo que genera la herramienta, ni límites de caracteres, ni tipos de pieza.
Así que buena parte de lo que le pidas lo va a **proponer**, no copiar. Exígele
que marque con claridad qué viene del playbook y qué es propuesta suya, porque
eso cambia quién lo tiene que aprobar.

### 3. Lo que quedó pendiente y sigue abierto

Está todo en `docs/PENDIENTES_LEGAL.md`. Lo que más urge:

- **Nadie ha abierto los quince enlaces** de los T&C generales. La red del
  entorno bloquea `promos.rappi.com`, así que lo tengo que hacer yo. Recuérdamelo.
- **El T&C general de Cashback desapareció** de la lista de 2026 y estaba en la
  anterior. Si sigue publicado hay dos respaldos para la misma campaña.
- **La hoja 2 del Excel de 2024** tiene una tabla, que no está en el de 2026, con
  el criterio de cuándo hace falta un T&C propio y qué está obligada a decir la
  pieza. Eso decide si una campaña necesita documento, que es la pregunta que la
  herramienta le tiene que responder al comercial.
- **El thread de Slack** está en `docs/THREAD_SLACK.md`, listo para que yo lo
  mande al canal de Legal Global.

## Cómo trabajamos

- No soy técnico. Explícame las cosas por lo que yo veo en pantalla, no por el
  nombre de la función.
- `npm test` antes de cada push, y me muestras el resultado.
- Los dos recorridos de navegador antes de dar por bueno cualquier cambio de
  interfaz.
- Puedes desplegar varios agentes en paralelo, pero repártelos por archivos para
  que no se pisen, y **verifica tú mismo lo que te reporten**. En la sesión
  pasada, cada agente reportó su trabajo como terminado y en dos de los tres
  había defectos reales.
- Tienes mi autorización para lanzar el despliegue de GitHub Actions cuando haga
  falta, pero avísame siempre. Lo que **no** puedes hacer es correr `setup()`
  dentro de Apps Script: eso lo ejecuto yo, y me tienes que decir cuándo toca.
- Si una decisión es legal o de negocio, pregúntame. Si es técnica, decídela y
  déjala escrita en `docs/DECISIONES.md`.

Empieza por la revisión crítica y cuéntame qué encontraste antes de arreglar nada
grande.
