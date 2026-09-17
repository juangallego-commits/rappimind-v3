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

### 2. El prompt para Claude chat

Tengo tres encargos que quiero mandarle a Claude chat, que no tiene acceso al
repositorio. Ya hay material preparado, pero quiero que lo revises, lo mejores y
me lo dejes en **un solo mensaje por encargo**, listo para copiar y pegar:

- **Las preguntas legales**: `docs/PAQUETE_REVISION_LEGAL.md`, 44 preguntas, 23
  bloqueantes. Revísalo y dime si falta alguna o si alguna quedó mal planteada.
- **La revisión de la interfaz**: `docs/REVISION_FRONT.md`, con 33 capturas en
  `docs/capturas/revision/` y el texto de cada pantalla.
- **Las leyendas de las piezas**: `docs/PAQUETE_LEYENDAS.md`, más
  `docs/LEYENDAS_PIEZAS_REALES.md`, que es lo más importante de los tres.

Sobre las leyendas, léete `docs/LEYENDAS_PIEZAS_REALES.md` con cuidado. Son
cuatro piezas publicadas de verdad, y entre las cuatro hay un enlace sin
rellenar, una marca equivocada, una ciudad equivocada, dos años distintos y
cuatro contradicciones de fecha entre el texto grande y el chico. Ninguno es un
error de criterio legal: todos son de copiar y pegar la letra pequeña de otra
campaña. Y los datos que salen mal son los mismos que el comercial ya le da a
RappiMind. Eso es el argumento entero de por qué esto lo tiene que generar la
herramienta.

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
