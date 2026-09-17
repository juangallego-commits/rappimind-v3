# Prompt para la siguiente sesión de Claude Code

Copia todo lo que está entre las líneas y pégalo como primer mensaje.

---

Vas a retomar RappiMind v3. La sesión anterior (17 de septiembre) revisó con ojos
críticos todo lo que se había construido la noche anterior, arregló veinticinco
defectos con su prueba, y dejó escritos los tres encargos para Claude chat en
`docs/encargos/`. Yo ya mandé esos encargos (o los voy a mandar) y voy a traer las
respuestas. Tu trabajo en esta sesión es **convertir esas respuestas en cambios**,
sin traducir nada a mano y sin decidir nada legal por tu cuenta.

## Antes de tocar nada

Lee completos, en este orden:

1. `CLAUDE.md`, que tiene las reglas no negociables.
2. `.claude/skills/flujo-y-ux/SKILL.md` y `.claude/skills/frontera-apps-script/SKILL.md`.
3. `docs/PROGRESO.md`, de abajo hacia arriba. La última entrada es la de la
   revisión crítica: ahí está lo que se arregló y lo que quedó pendiente.
4. `docs/DECISIONES.md`, las doce decisiones del final, para no deshacerlas.

Después mira el estado real, no lo que digan los documentos:

```
npm test                                                        # deben pasar 390
npm run demo
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 38 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 25 revisiones
```

Los recorridos necesitan playwright-core y un Chromium. En el contenedor remoto
están en `/opt/node22/lib/node_modules` (`export NODE_PATH=...`) y en
`/opt/pw-browsers`. Si no los encuentras, dímelo y no sigas como si nada.

## Lo que te voy a pegar, y qué hacer con cada cosa

### La respuesta del encargo 01 (revisión legal)

Viene con un bloque final "PARA EL REPOSITORIO" con líneas como
`MX.termino_dias = "días naturales"` y `modelo cashback, cláusula 8: ANTES "..."
DESPUÉS "..."`. Con eso:

- Los valores de país van a `data/paises.json` **y** a la pestaña Paises del
  Sheet (la hoja manda sobre la semilla: recuérdame cambiarlos allá). Cuando un
  dato se confirma, sácalo de `por_confirmar_en_pruebas` de ese país.
- Los cambios de modelo son texto legal: aplícalos literalmente en `modelos/`,
  regenera las salidas esperadas que cambien (`pruebas/salidas_esperadas/`) y
  dime cuáles cambiaron para que yo las mire.
- Lo que Claude chat recomiende sin texto exacto **no lo redactes tú**: anótalo
  en `docs/PENDIENTES_LEGAL.md` y pregúntame.
- Cuando un país tenga sus cuatro datos confirmados, no lo saques de piloto tú:
  dime que está listo y lo cambio yo en el Sheet.

### La respuesta del encargo 02 (interfaz)

Viene con un bloque "PARA EL REPOSITORIO" con líneas
`pantalla NN | ACTUAL: "..." | PROPUESTO: "..."`. Busca cada "ACTUAL" literal en
`src/core/preguntas.js`, `src/core/preguntas_pt.js`, `src/core/textos_interfaz.js`,
`src/core/ayuda.js` y `src/client/js/`. Aplica solo los que cumplan las reglas de
`preguntas.test.js` (diez palabras, ayuda de una línea, sin guiones como
puntuación). Si un cambio toca una llave de `TEXTOS_PT`, cambia la llave y el
literal del código a la vez, o la traducción muere en silencio (hay una prueba
que lo caza). Después regenera las capturas con
`node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js`.

### La respuesta del encargo 03 (leyendas)

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
