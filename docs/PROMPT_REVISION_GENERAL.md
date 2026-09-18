# Prompt maestro: la revisión general de RappiMind v3

Este es el prompt de la revisión de cierre, antes de la etapa de diseño. Copia
todo lo que está entre las líneas y pégalo como primer mensaje de una sesión
nueva.

La etapa de diseño va después y tiene su propio prompt. **No la mezcles con
esta**: si se revisa y se rediseña al mismo tiempo, no se sabe qué rompió qué.

---

Vas a hacer la revisión general de RappiMind v3 antes de que entremos a la
etapa de diseño. Es la última pasada sobre el fondo, así que después de esto
solo se toca cómo se ve.

Trabajas con dos sombreros puestos, todo el tiempo, y los dos importan igual:

- **Desarrollador senior** que hereda este repositorio y tiene que responder si
  se puede confiar en él. No estás mirando código bonito, estás buscando dónde
  se rompe, dónde se rompería con un dato distinto, y qué no tiene quién avise
  cuando se rompa.
- **Experto de producto** que se sienta al lado de un comercial que nunca ha
  visto la herramienta y lo ve intentar generar un T&C. No estás mirando si la
  pantalla existe, estás mirando si la persona entiende qué le están
  preguntando, por qué, y qué hacer cuando algo le sale mal.

Soy Juan Camilo Gallego, abogado, dueño de producto y aprobador legal. No soy
técnico y no reviso código. Explícame todo por lo que yo veo en pantalla o por
lo que le pasa al comercial.

## Antes de tocar nada

Lee completos, en este orden, y no empieces a revisar hasta terminar:

1. `CLAUDE.md`. Las reglas no negociables. La 1, la 2 y la 3 son las que más se
   violan sin darse cuenta.
2. `.claude/skills/frontera-apps-script/SKILL.md`. Las cuatro fronteras donde
   este código se rompe **en silencio**, con los defectos reales que ya pasaron.
3. `.claude/skills/flujo-y-ux/SKILL.md`. El recorrido completo pantalla por
   pantalla y las reglas de producto que lo sostienen.
4. `docs/PROGRESO.md`, de abajo hacia arriba, al menos las seis últimas
   entradas.
5. `docs/DECISIONES.md`. Son las decisiones técnicas ya tomadas: si vas a
   proponer lo contrario de alguna, di cuál y por qué, no la deshagas callado.
6. `docs/PENDIENTES_LEGAL.md` entero. Es largo a propósito y es la materia prima
   de la segunda mitad de tu trabajo.

Después mira el estado real, no lo que digan los documentos:

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

## La regla de oro de esta revisión

**Nada se afirma sin reproducirlo.** Cada cosa que me reportes viene con el
comando, el caso o los pasos en pantalla que la muestran. Si no la pudiste
reproducir, se reporta como sospecha y dice que es sospecha.

Esto no es formalismo. En este repositorio ya pasaron las dos cosas: un defecto
real que las pruebas no vieron y solo apareció usando la herramienta, y un
"defecto" reportado que resultó no serlo y que se habría "arreglado" rompiendo
algo que estaba bien. Las dos direcciones cuestan igual.

Y al revés: **una prueba que pasa no es evidencia de que algo funciona**, es
evidencia de que esa prueba pasa. Pregúntate siempre qué tendría que estar roto
para que esa prueba fallara, y si la respuesta es "nada realista", la prueba no
cuenta.

## Los cinco frentes

Revisa los cinco. No los repartas para ir más rápido y luego me reportes lo que
te dijeron: si usas agentes en paralelo, verifica tú mismo cada hallazgo antes
de escribirlo.

### A. El motor, el documento y los datos derivados

Es `src/core/`, unas 10.000 líneas, y es donde vive la regla 2 de `CLAUDE.md`:
el documento final no puede tener ni un `{{ }}`, ni un `[[ ]]`, ni un valor
vacío, ni una frase rota, y si falta algo el sistema no genera.

Busca, en concreto:

- Combinaciones de respuestas que produzcan una frase rota, un doble punto, una
  coma colgando, un espacio doble o una lista de un solo elemento con la
  conjunción "y" sobrando. La forma de encontrarlas no es leer: es generar
  muchas combinaciones y revisar la salida.
- Derivados que dependan de un campo que puede venir vacío y que hoy nadie
  obliga a llenar.
- Cualquier sitio donde un derivado marcado ORACIÓN devuelva fragmento o al
  revés (regla 4).
- Fechas: cambios de mes, cambios de año, un solo día, zonas horarias.
- Números: los miles y los decimales de cada país, y qué pasa con cero.

### B. El servidor de Apps Script y las cuatro fronteras

Es `src/server/`, unas 1.400 líneas, más `scripts/build.js`. Aquí el código se
rompe en silencio, que es lo peor que puede pasar: funciona en la demostración
y falla en producción.

Lee la skill antes. Y además de lo que dice, mira:

- **Qué pasa cuando algo de afuera falla.** El Sheet no responde, Drive no deja
  crear el documento, el correo no sale, la generación se cae a la mitad. ¿El
  comercial ve un mensaje que le sirve, o ve una pantalla en blanco? ¿Queda un
  registro a medias en el Sheet?
- **Dos comerciales generando al mismo tiempo.** ¿Se pisan las filas? ¿Se
  repiten los identificadores?
- **Qué hace `setup()` si se corre dos veces.** Ya hay tandas de confirmaciones
  con identificador, pero revisa que no haya nada que se duplique o se pise.
- **El tamaño de lo que viaja al navegador.** `MotorCliente.html` carga el
  catálogo completo. Mira cuánto pesa hoy y si eso tiene techo.

### C. La interfaz, con el sombrero de producto

Es `src/client/`, unas 4.145 líneas. **Y aquí está el hallazgo que más me
importa de esta revisión: hoy hay una sola prueba automática sobre todo eso, y
solo revisa ámbitos de variables, no comportamiento.** Todo lo que hace la
pantalla lo cubren únicamente los dos recorridos de navegador. Esto no es una
crítica al pasado, es el mapa de dónde buscar.

Con el sombrero de producto, recorre la demostración como si fueras un comercial
que nunca la ha visto, y para cada pantalla pregúntate tres cosas:

1. ¿Entiendo qué me están preguntando sin saber nada de Legal?
2. Si me equivoco aquí, ¿me doy cuenta? ¿Y puedo devolverme?
3. Si esto falla, ¿el mensaje me dice qué hacer, o solo que algo salió mal?

Y busca en concreto:

- Callejones sin salida: pantallas donde la única salida es recargar.
- Mensajes de error que describen el problema técnico en vez del paso siguiente.
- Preguntas que se ven obligatorias siendo opcionales, o al revés.
- Cosas que se pierden al devolverse o al recargar.
- Celular. La herramienta se usa en la calle.
- Accesibilidad básica: contraste, tamaño de los blancos donde se hace clic,
  que se pueda recorrer con el teclado, que los lectores de pantalla no queden
  ciegos en las pantallas que cambian solas.

**No propongas cambios de estética aquí.** Eso es la etapa siguiente. Si algo se
ve feo pero funciona, anótalo en una lista aparte para el diseño y sigue.

### D. La red de seguridad

Dos huecos que ya conozco y quiero que midas bien, más los que encuentres:

- **La interfaz casi no tiene pruebas.** 4.145 líneas, una prueba de ámbitos y
  dos recorridos de navegador. Dime qué parte de eso se puede probar sin
  navegador y qué no, y propón el mínimo que valga la pena, no una batería
  completa.
- **Cuatro países activos sin un solo caso dorado.** De los 32 casos, 26 son
  Colombia. Perú, Argentina, Chile y Uruguay están activos en producción y no
  tienen ninguno, así que si alguien mueve una cláusula compartida, nadie avisa.
  Ya me lo ofrecieron antes y no lo pedí; ahora dime cuánto cuesta y qué riesgo
  corro sin ellos, y decido.

Y revisa además: ¿hay pruebas que pasarían aunque el código estuviera mal? ¿Hay
alguna que compruebe lo que el código hace en vez de lo que debería hacer?

### E. Los datos y la configuración

`data/paises.json`, `modelos/`, `pruebas/casos_base.json` y las pestañas del
Sheet. Que lo que dice la configuración sea lo que hace el código, que ningún
país activo tenga un campo vacío que alguien vaya a necesitar, y que ningún
modelo tenga un placeholder que nada llena.

## Qué haces tú y qué me traes a mí

La línea es esta, y es la misma de `CLAUDE.md` regla 5:

**Lo técnico lo decides y lo haces.** Un defecto, una prueba que falta, un
mensaje de error confuso, una función mal puesta: arréglalo, con su prueba, y
déjalo escrito en `docs/DECISIONES.md`. No me pidas permiso para arreglar algo
que está roto.

**Lo legal y lo de negocio no lo tocas.** No redactes ni "mejores" una sola
frase legal, ni siquiera si tiene una errata evidente (regla 3). Va al documento
consolidado.

Si dudas de qué lado cae algo: si la respuesta cambia lo que dice el documento
que lee un usuario, o cambia a quién se le atribuye una responsabilidad, es mío.
Si solo cambia cómo el código llega al mismo texto, es tuyo.

## El documento consolidado, que es la mitad del encargo

Quiero **un solo documento** con todo lo que depende de mí, para llevármelo a
Claude en la web y trabajarlo allá. Va en `docs/PARA_DECIDIR.md`.

Hoy eso está repartido en `docs/PENDIENTES_LEGAL.md` (847 líneas, 22 secciones,
más de 100 puntos numerados), en `docs/PROGRESO.md` y en las respuestas de los
encargos. Así no se puede trabajar.

El documento nuevo tiene que cumplir esto, y es lo más importante del encargo:

1. **Se entiende solo.** Claude en la web no va a tener el repositorio. Si un
   punto depende de una cláusula, el documento **trae la cláusula escrita**, no
   la ruta del archivo. Si depende de una pantalla, la describe. Nada de "ver
   `modelos/bloques/x.md`".
2. **Cada punto dice cuatro cosas y en este orden**: qué hay que decidir, por
   qué existe la duda, qué opciones hay, y **qué pasa con la herramienta con
   cada opción**. Ese cuarto punto es el que hace que yo pueda decidir.
3. **Está ordenado por lo que desbloquea**, no por tema ni por fecha. Arriba lo
   que hoy impide que alguien genere un documento o que un país se use; abajo lo
   que se puede vivir sin resolver.
4. **Separa lo que es mío de lo que es de otra persona.** Hay cosas que decido
   yo y cosas que tengo que pedirle a Legal de otro país, a Producto, a Data o a
   quien maneja los accesos de Drive. Dime a quién hay que preguntarle cada una.
5. **Dice qué está cerrado.** Lo ya decidido no vuelve a aparecer como pregunta
   abierta. Si algo se decidió, sale del documento o sale marcado como cerrado
   con la fecha.
6. **Cada punto cabe en una pantalla.** Si necesita más, es que son dos puntos.

`docs/PENDIENTES_LEGAL.md` se queda como está, como historia. El documento
nuevo es el de trabajo.

## Lo que no se toca en esta revisión

- **El texto legal.** Ni una coma. Regla 3.
- **El flujo, las preguntas y el orden en que salen.** Si crees que sobra o
  falta una pregunta, me lo dices, no lo haces.
- **La estética.** Es la etapa siguiente y tiene su propio prompt. Lo que veas
  feo va a una lista aparte, `docs/PARA_EL_DISENO.md`, que es lo que va a leer
  esa sesión: qué se ve mal, en qué pantalla, y qué no se puede tocar de ahí.
- Nada de `git push --force`, nada de reescribir historial, nada de borrar
  archivos de `modelos/` ni de `data/`.

## Cómo entregar

- `npm test` antes de cada push, y me muestras el número.
- Los dos recorridos de navegador antes de dar por bueno cualquier cambio de
  interfaz.
- **Empuja directo a `main`.** Te lo autoricé: no reviso código y no quiero
  pull requests. Eso significa que las pruebas son la única red que queda, así
  que córrelas siempre, y si tocas algo que no se pueda probar, dímelo en el
  reporte en vez de darlo por bueno.
- Commits en español, uno por tarea cerrada, y `docs/PROGRESO.md` actualizado al
  final.
- Tienes mi autorización para lanzar el despliegue de GitHub Actions, pero
  avísame siempre. Lo que **no** puedes hacer es correr `setup()` dentro de
  Apps Script: eso lo ejecuto yo y me tienes que decir cuándo toca.

## El reporte final

En este orden, y en mis palabras, no en las tuyas:

1. **Lo que estaba roto y arreglaste**, con qué le pasaba al comercial en cada
   caso.
2. **Lo que está frágil y no arreglaste**, por qué no, y qué haría falta.
3. **Lo que revisaste y está bien.** Quiero saber dónde sí puedo confiar, no
   solo dónde no.
4. **Lo que no alcanzaste a revisar**, dicho claro. Prefiero un hueco declarado
   que un "todo bien" que no es verdad.
5. **El documento `docs/PARA_DECIDIR.md`**, con cuántos puntos quedaron y cuáles
   son los tres que más desbloquean.
6. **La lista para el diseño**, `docs/PARA_EL_DISENO.md`.

Empieza por leer. No escribas código hasta haber recorrido la herramienta
entera al menos una vez.
