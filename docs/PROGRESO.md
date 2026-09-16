# Progreso

| Bloque | Estado | Cómo probarlo | Qué necesito de Juan |
|---|---|---|---|
| 0 | listo, falta el scriptId | `npm test` (32 pruebas) y `npm run build` | El ID del proyecto de Apps Script y el secreto `CLASPRC_JSON` |
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
- `.clasp.json` apuntando a `dist/`. **Falta el `scriptId`.**
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

### Qué necesito de Juan

1. El **ID del proyecto de Apps Script** para `.clasp.json`.
2. El secreto **`CLASPRC_JSON`** en Settings > Secrets and variables > Actions,
   con el contenido de su `~/.clasprc.json` después de `clasp login`.
3. Cuando exista el despliegue de la web app, la variable **`ID_DESPLIEGUE`**
   (misma pantalla, pestaña Variables). Sin ella el disparo manual funciona solo
   si hay exactamente un despliegue además del `@HEAD`.

Mientras falten el `scriptId` o el secreto, el flujo corre pruebas y build, y se
salta el `clasp push` avisándolo en el resumen. No se pone en rojo por eso.
