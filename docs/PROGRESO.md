# Progreso

| Bloque | Estado | Cómo probarlo | Qué necesito de Juan |
|---|---|---|---|
| 0 | cerrado | `npm test` (32 pruebas), `npm run build` y el flujo de Actions en verde | Crear el despliegue de la web app (lo hace el disparo manual) |
| 1 | pendiente | | |
| 2 | pendiente | | |
| 3 | pendiente | | |
| 4 | pendiente | | |

## Bloque 0 · Repo, build y despliegue

### Qué quedó

- `package.json` con los comandos de `CLAUDE.md`: `test`, `build`,
  `previsualizar`, `push` y `limpiar`. Todos corren con Node, sin comandos de
  bash, así que funcionan en Windows.
- `scripts/build.js`: arma `dist/` según la sección 2 de la especificación.
  Copia `src/core` y `src/server`, convierte `modelos/**/*.md` en
  `dist/Modelos.js`, `data/paises.json` en `dist/PaisesSemilla.js` y
  `data/secciones.json` en `dist/Secciones.js`, arma `Index.html`,
  `Estilos.html`, `App.html` y `MotorCliente.html`, y copia `appsscript.json`.
- `src/core/texto.js`: normalización de texto compartida. El motor ignora los
  retornos de carro, así que el documento sale igual se edite en Windows o en
  Linux.
- `src/server/Codigo.js` y `src/client/`: una página mínima que confirma que el
  despliegue responde y muestra cuántos modelos, bloques y países cargaron. El
  formulario por pasos llega en el Bloque 2.
- `appsscript.json` con la web app como `USER_DEPLOYING` y acceso `DOMAIN`.
- `.clasp.json` apuntando a `dist/` con el `scriptId` del proyecto.
- 32 pruebas en verde (`node:test`, sin dependencias): normalización de texto,
  coherencia de los insumos legales (los `[[INCLUIR:…]]` resuelven, no hay
  bloques huérfanos, los 9 países traen estado válido), coherencia de los 11
  casos de prueba y verificación del build.
- `.github/workflows/despliegue.yml`: pruebas y build en cada push a `main`,
  luego `clasp push`; y un disparo manual que además crea versión y actualiza el
  despliegue de la web app.

### Cómo probarlo

```
npm test
npm run build
npm run previsualizar
```

En GitHub: pestaña **Actions**, flujo **Pruebas y despliegue**.

### Punto de control

Hecho. El flujo corrió en verde y `clasp push` subió los 10 archivos de `dist/`
al proyecto de Apps Script (run 2, commit `133cd32`).

### Qué necesito de Juan

1. Disparar una vez el flujo a mano (**Actions > Pruebas y despliegue > Run
   workflow**) para crear la primera versión y el despliegue de la web app.
2. Guardar el ID que salga en el resumen en la variable **`ID_DESPLIEGUE`**
   (Settings > Secrets and variables > Actions > Variables). Desde ahí los
   disparos manuales siguientes actualizan ese mismo despliegue, sin cambiar la
   URL que usan los comerciales.
3. Completar en el proyecto de Apps Script las propiedades del script
   `URL_FORMULARIO_LEGAL`, `CANAL_AYUDA_URL` y, si quiere copia de cada
   documento, `CORREO_COPIA_LEGAL`.

Si faltan el `scriptId` o el secreto, el flujo corre pruebas y build y se salta
el `clasp push` avisándolo en el resumen, en vez de ponerse en rojo.
