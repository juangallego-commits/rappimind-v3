# Capturas

Generadas con un navegador sin interfaz recorriendo `demo/index.html` de verdad:
no son maquetas, es la aplicación funcionando.

Escritorio 1440x900, celular 390x844.

| Archivo | Qué muestra |
|---|---|
| `01-inicio` | Los tres pasos, con el texto que pediste en "Publica los T&Cs" |
| `02-filtro` | El filtro de entrada: "¿Esta campaña la puedo hacer aquí?" |
| `03-paso-campana` | Primer paso, con la respuesta anterior ya plegada arriba |
| `04-pregunta-nombre` | Una pregunta con su ayuda y "Por qué te preguntamos esto" |
| `05-nit-validado` | El NIT validado en vivo |
| `06-porcentaje-y-documento` | El documento llenándose al lado mientras se responde |
| `07-calculadora` | La calculadora de ejemplo del Cashback |
| `08-resumen-con-faltantes` | El resumen por secciones, con Editar en cada una |
| `09-resumen-completo` | Con la declaración marcada y el botón ya habilitado |
| `10-listo` | "Tu T&C está listo", con los pasos de Squarespace y los marcadores de captura |
| `11-ayuda` | El aviso de azar, que abre la pantalla de Ayuda |
| `12-historial` | Mis campañas, con estado y "Usar como base" |
| `13-administracion` | Países, equipo y solicitudes |
| `14-carrera-desempate-deshabilitado` | Carrera de Compras |
| `15-cashback-day-tiendas` | Cashback Day con la lista de tiendas |
| `20-inicio-celular` | Inicio en celular |
| `21-pregunta-celular` | Una pregunta en celular, con el botón fijo abajo |
| `22-hoja-deslizable-celular` | El documento en la hoja deslizable, con los huecos grises |

Para volver a generarlas hace falta un navegador, que no es dependencia del
proyecto. El recorrido vive fuera del repositorio.

## La carpeta `revision/`

Son las 33 capturas del recorrido completo que se le mandan a Claude chat para
revisar el copy (encargo `docs/encargos/02-revision-interfaz.md`), más
`textos.json` con el texto literal de cada pantalla. Se regeneran con:

```
npm run demo
node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js
```

Hay que regenerarlas después de cualquier cambio de interfaz, porque el encargo
se arma desde `textos.json` y tiene que describir la versión que se revisa.
