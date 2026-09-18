# Prompt para la siguiente sesión de Claude Code

Copia todo lo que está entre las líneas y pégalo como primer mensaje.

---

Vas a retomar RappiMind v3. La sesión del 18 de septiembre cerró dos cosas: sacó
de piloto a seis países y construyó las leyendas de piezas publicitarias del
encargo 03. Las tres respuestas de Claude chat (encargos 01, 02 y 03) ya están
aplicadas: no queda ninguna por convertir en cambios.

## Antes de tocar nada

Lee completos, en este orden:

1. `CLAUDE.md`, que tiene las reglas no negociables.
2. `.claude/skills/flujo-y-ux/SKILL.md` y `.claude/skills/frontera-apps-script/SKILL.md`.
3. `docs/PROGRESO.md`, de abajo hacia arriba. Las dos últimas entradas son las de
   esta sesión: los países y las leyendas.
4. `docs/DECISIONES.md`, de la 31 a la 45, que son las técnicas de las leyendas.
5. `docs/PENDIENTES_LEGAL.md`, las tres últimas secciones: Brasil en producción,
   los países que salieron de piloto y las leyendas.

Después mira el estado real, no lo que digan los documentos:

```
npm test                                                        # deben pasar 528
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 47 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 26 revisiones
npm run front                                                   # 45 de 45 pantallas
```

Los recorridos necesitan playwright y un Chromium. En el contenedor remoto están
en `/opt/node22/lib/node_modules` y en `/opt/pw-browsers`. Si no los encuentras,
dímelo y no sigas como si nada.

## Dónde quedó todo

**Los países.** Colombia, México, Perú, Argentina, Chile, Uruguay y Brasil están
activos. Ecuador y Costa Rica siguen en piloto, y solo por una razón: nadie ha
dicho si escriben los miles con punto o con coma. El estado viaja al Sheet en la
tanda `estados-2026-09-18` de `data/paises.json`, que `setup()` aplica una sola
vez. El país en piloto que usan las pruebas y los recorridos es Ecuador.

**Las leyendas.** Las 55 de la respuesta del encargo 03 están en
`modelos/leyendas/`, una por archivo. El motor es `src/core/leyendas.js` (elegir,
armar, medir y recortar) y `src/core/derivados_leyendas.js` (los marcadores
cortos). El comercial las ve en la pantalla final, una por formato. Hay una
pregunta nueva al final del formulario, la categoría del producto, en el paso
`pieza`.

## Lo que está esperando una decisión de Juan

Todo en `docs/PENDIENTES_LEGAL.md`. Lo que más urge, en orden:

1. **El espacio no alcanza.** Una campaña corriente (Farmatodo, 20%, solo Turbo,
   con compra mínima y categoría licores) da una letra pequeña de 645 caracteres
   contra un límite de 620, ya recortada hasta el último nivel. El banner corto
   de esa misma campaña mide 734 contra 300. Hay que decidir si el límite es el
   correcto, si el enlace de Turbo puede ir corto, o qué más se marca como
   recortable dentro del texto legal. Lo último es de Legal: no lo marques tú.
2. **La forma del enlace corto.** Juan aprobó que sea una dirección propia dentro
   de `promos.rappi.com`, y no bit.ly. Falta cómo se arma y quién crea la página.
   Sin eso no hay leyenda de push ni de SMS, y hoy se entrega como pendiente con
   esa razón escrita en pantalla.
3. **Las 24 preguntas de la lista 2** de `docs/encargos/respuestas/03-leyendas.md`,
   sección 9.3. Las tres que más cambian el diseño, según la propia respuesta,
   son la 21 (dónde se redimen los Créditos del ETA, donde la pieza y el T&C
   dicen cosas distintas), la 16 y la 6.
4. **Brasil está en producción con cinco puntos abiertos**, entre ellos que el
   mensaje a Legal BR sigue sin respuesta y que nadie de Brasil ha leído el
   formulario en portugués. Juan lo decidió así, avisado.
5. **Ecuador y Costa Rica** salen de piloto el día que alguien diga cómo escriben
   los miles. Es cambiar un valor y agregar una tanda.

## Lo que no se construyó, a propósito

- **Los descuentos con T&C general.** Juan decidió dejarlos para cuando exista ese
  tipo de campaña. Hoy los 15 T&C generales solo entregan enlace, sin preguntas ni
  documento, así que no son dos preguntas más: es un recorrido nuevo completo. Las
  leyendas ya están en el catálogo, marcadas `se_elige_en: ninguna_parte_todavia`.
- **Las leyendas de campaña de los otros ocho países.** La respuesta dice "no
  cubierto". Los complementos de categoría de esos países sí están.
- **Los casos dorados de Perú, Argentina, Chile y Uruguay.** Se ofrecieron y Juan
  no los pidió. Cuatro países activos sin nadie que avise si una cláusula
  compartida se mueve. La oferta sigue en pie.

## Cómo trabajamos

- No soy técnico. Explícame las cosas por lo que yo veo en pantalla.
- `npm test` antes de cada push, y me muestras el resultado.
- Los dos recorridos de navegador antes de dar por bueno cualquier cambio de
  interfaz, y abre la demostración para mirar con los ojos lo que cambió.
- Puedes usar agentes en paralelo, repartidos por archivos, pero **verifica tú
  mismo lo que te reporten**.
- Tienes mi autorización para lanzar el despliegue de GitHub Actions, pero avísame
  siempre. Lo que **no** puedes hacer es correr `setup()` dentro de Apps Script:
  eso lo ejecuto yo, y me tienes que decir cuándo toca.
- Si una decisión es legal o de negocio, pregúntame. Si es técnica, decídela y
  déjala escrita en `docs/DECISIONES.md`.
