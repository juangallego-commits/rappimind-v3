# Progreso

| Bloque | Estado | Cómo probarlo | Qué necesito de Juan |
|---|---|---|---|
| 0 | cerrado | `npm test` (32 pruebas), `npm run build` y el flujo de Actions en verde | Crear el despliegue de la web app (lo hace el disparo manual) |
| 1 | listo, en punto de control A | `npm test` (103 pruebas) y `npm run previsualizar` | Revisar 3 textos y `docs/PENDIENTES_LEGAL.md` |
| 2 | listo, falta verificar en Google | `npm test` (157 pruebas) | Correr `setup()` y completar las propiedades |
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

## Bloque 1 · Motor, derivados y validaciones

### Qué quedó

`src/core/` completo, con 103 pruebas en verde:

| Archivo | Qué hace |
|---|---|
| `texto.js` | Normalización: sin BOM, sin `\r`, y texto plano sin negritas |
| `numeros.js` | Números en letras, apócope, montos, porcentajes y cantidades de Créditos |
| `fechas.js` | Fechas y horas en español, comparación sin `Date`, listas con "y" |
| `identificaciones.js` | Dígito verificador de los 8 países (NIT, RFC, RUC, CUIT, RUT, cédula) |
| `derivados.js` | Los textos de Legal de la sección 5, marcados ORACIÓN o FRAGMENTO |
| `esquemas.js` | Los 3 tipos: pasos, campos, visibilidad, obligatoriedad y filtro de entrada |
| `validaciones.js` | Obligatorios, formatos, cruces, país en piloto y lista de tiendas |
| `motor.js` | Los 7 pasos del render y la red de seguridad del texto final |
| `generar.js` | Valida y, solo si todo está bien, renderiza |

### Cómo probarlo

```
npm test
npm run previsualizar            todos los casos
npm run previsualizar CB01       un caso
```

Los 5 casos que deben generar producen un texto **idéntico carácter por
carácter** a `pruebas/salidas_esperadas/`. Los 6 que deben fallar fallan
exactamente en los campos que declara `pruebas/casos_base.json`, y no producen
texto. Los 8 identificadores reales de las sociedades Rappi validan.

### Punto de control A · qué necesito de Juan

1. Revisar los 3 textos que te paso en el chat de Legal (Cashback CO, Carrera y
   Cashback Day) y confirmar o corregir.
2. Revisar `docs/PENDIENTES_LEGAL.md`, sobre todo los textos marcados como
   nuevos: medios de pago con Créditos, segmentos nuevos, condiciones
   opcionales, desempate y datos para la entrega.
3. Confirmar los nombres de las secciones de `data/secciones.json`.
4. Cashback Day: confirmar si el máximo de pedidos aplica a toda la campaña
   (como está hoy) o por tienda.

### Nota para el Bloque 2

Las opciones del campo `secciones` todavía no salen de `data/secciones.json`:
el motor usa los nombres que le llegan. Hay que conectarlo al armar el
formulario.

## Bloque 2 · Servidor

### Qué quedó

| Archivo | Qué hace |
|---|---|
| `src/server/Config.js` | Propiedades del script, pestañas, modo demostración |
| `src/server/Datos.js` | Lectura y escritura del Sheet, carpeta por país |
| `src/server/Setup.js` | `setup()` idempotente |
| `src/server/Documento.js` | Adaptador de DocumentApp |
| `src/server/Correo.js` | Envío del correo |
| `src/server/Api.js` | Lo que llama la interfaz con google.script.run |

Piezas puras nuevas en `src/core/`: `tablas.js`, `paises.js`, `documento.js`,
`correo.js`.

**157 pruebas en verde**, incluido el servidor completo contra dobles de las APIs de
Google: setup idempotente, generación, formato del documento, carpeta por país,
compartir como lector, correo, fila en Solicitudes, consecutivo, historial por rol,
publicación, administración y registro.

### Modo demostración

Sin `SHEET_ID` la app usa los países de `data/`, avisa en pantalla y, en vez de crear
el documento, muestra el texto final. No toca Drive, ni el Sheet, ni manda correos.

### Qué falta verificar con la cuenta de Juan

Lo único que no se puede probar en Node: que Google acepte de verdad las llamadas.
Está en `docs/REVISION_MANANA.md`.
