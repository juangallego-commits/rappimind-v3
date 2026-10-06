# RappiMind v3 · Reglas para Claude Code

Lee este archivo completo al iniciar cada sesión. La especificación completa está en `docs/ESPECIFICACION_V3.md`.

## Qué es

RappiMind es una web app interna de Rappi (Google Apps Script) donde los comerciales (CAM/KAM) generan los Términos y Condiciones (T&C) de sus campañas de marketing a partir de modelos aprobados por Legal, sin escribirle a Legal. Este repo es una versión nueva, desde cero. No reutilices código de la versión anterior.

Dueño de producto y aprobador legal: Juan Camilo Gallego.

## Reglas no negociables

1. **Rappi nunca es el organizador** de una campaña. El organizador es siempre la tienda (aliado) o la marca (maker) que fondea. Rappi es plataforma de intermediación y responsable del tratamiento de datos. Que Rappi opere la mecánica o gestione la entrega de un premio no lo vuelve organizador.

   **Única excepción, Brasil.** Los T&C aprobados de Brasil están escritos con Rappi como quien concede, modifica y cancela la promoción, y no nombran a un organizador distinto. Juan lo autorizó como excepción explícita el 17 de septiembre de 2026. Vale solo para el modelo de Brasil y no se extiende a ningún otro país ni sirve de precedente. Ver `docs/DECISIONES.md`.
2. **Determinismo.** El comercial solo entrega hechos (listas, números, fechas, nombres). El texto legal sale únicamente de `modelos/`. El documento final tiene cero `{{ }}`, cero `[[ ]]`, cero valores vacíos y cero frases rotas. Si algo falta, el sistema no genera.
3. **El texto legal es de Legal.** No redactes ni "mejores" cláusulas. Si un texto de `modelos/` o de la especificación parece tener un error, déjalo anotado en `docs/PENDIENTES_LEGAL.md` y sigue.
4. **Oración vs fragmento.** Los derivados marcados ORACIÓN devuelven oración completa (mayúscula inicial y punto final). Los FRAGMENTO se insertan dentro de otra frase (sin mayúscula inicial ni punto final).
5. **Nada de tablas** en el documento generado: solo párrafos y viñetas (el sitio de publicación no muestra tablas).
6. **Sin texto libre legal en el formulario.** Los únicos campos de texto libre permitidos son los listados en la especificación (nombres, razones sociales, ciudades, descripción de un premio físico, lista de productos).
7. **Datos de producción.** Este sistema usa su propio Google Sheet y su propia carpeta de Drive (se crean con `setup`). Nunca toques el Sheet ni el proyecto de Apps Script de la versión anterior.
8. **Todo en español**: interfaz, mensajes de error, comentarios de negocio y documentación. En los textos visibles no uses guiones como signo de puntuación.

## Cómo trabajamos

1. Trabaja por bloques (ver especificación, sección "Plan de 3 horas"). Commit al cerrar cada tarea, con mensaje claro en español.
2. Al cerrar cada bloque actualiza `docs/PROGRESO.md`: qué quedó, cómo probarlo y qué necesitas de Juan.
3. Antes de cada `clasp push` o `clasp deploy`, corre `npm test` y muéstrale el resultado a Juan.
4. No hagas `git push --force`, no reescribas historial y no borres archivos de `modelos/` ni de `data/`.
5. Si una decisión es de negocio o legal, pregunta. Si es técnica, decide y déjala escrita en `docs/DECISIONES.md`.
6. Antes de tocar `src/server/`, `scripts/build.js` o cualquier cosa que viaje entre el servidor y la interfaz, lee la skill `.claude/skills/frontera-apps-script/`. Ahí están las cuatro fronteras donde el código se rompe en silencio y los cinco defectos reales que ya pasaron.
7. Antes de tocar cualquier cosa que el comercial vea o recorra (`src/client/`, las preguntas, el filtro, la lista de tipos, el resumen, el historial o la ayuda), lee la skill `.claude/skills/flujo-y-ux/`. Ahí está el recorrido completo pantalla por pantalla y las reglas de producto que lo sostienen.

## Mapa del repo

```
modelos/            textos legales con placeholders (fuente de verdad legal)
modelos/bloques/    cláusulas compartidas (se incluyen con [[INCLUIR:nombre]])
data/paises.json    configuración legal por país y estado (activo, piloto, bloqueado)
pruebas/            casos de prueba con resultado esperado
src/core/           lógica pura compartida por Node (tests) y Apps Script (motor, derivados, validaciones)
src/server/         código de Apps Script (web app, Sheet, Drive, Docs, correo)
src/client/         interfaz (HTML, CSS, JS)
src/visor/          visor de la página /tyc de promos.rappi.com (se pega una vez en Squarespace)
scripts/            build y utilidades (generar dist/, previsualizar casos)
dist/               salida del build que se sube con clasp (no editar a mano)
docs/               especificación, progreso, decisiones y pendientes legales
```

## Comandos

```
npm test                        corre las pruebas (node:test, sin dependencias externas)
npm run build                   genera dist/ (copia core y server, convierte modelos a Modelos.js, arma los HTML)
npm run previsualizar           imprime el texto final de cada caso de pruebas/casos_base.json
npm run push                    build + clasp push (pedir aprobación a Juan)
npm run visor -- --bucket X     arma el bloque del visor para pegar en Squarespace (docs/PUBLICACION_WEB.md)
```
