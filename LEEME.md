# RappiMind v3 · Kit de arranque

Este kit tiene todo lo que Claude Code necesita para construir RappiMind desde cero.

## Qué hay

| Ruta | Para qué |
|---|---|
| `CLAUDE.md` | Reglas que Claude Code lee al empezar cada sesión |
| `docs/ESPECIFICACION_V3.md` | Qué construir y cómo (flujo, datos, motor, textos, validaciones, plan de 3 horas) |
| `modelos/` | Textos legales de Cashback, Carrera de Compras y Cashback Day, con cláusulas compartidas en `bloques/` |
| `data/paises.json` | Configuración legal de los 9 países (tabla final de septiembre), limpia y con estado |
| `data/secciones.json` | Secciones de la app para la redención de Créditos (confirmar nombres) |
| `pruebas/casos_base.json` | 11 casos de prueba (los que deben generar y los que deben fallar) |
| `pruebas/salidas_esperadas/` | Texto exacto que debe salir en los casos que generan |
| `docs/PENDIENTES_LEGAL.md` | Lo que Juan revisa en el punto de control A |
| `docs/referencia/motor_prototipo.py` | Prototipo que se usó para validar los modelos (referencia, no se sube) |

## Arranque (15 minutos)

1. Crea en GitHub un repositorio privado vacío llamado `rappimind-v3` y clónalo.
2. Descomprime este kit en la raíz del repositorio y haz el primer commit.
3. Si no tienes clasp: `npm install -g @google/clasp`. Luego `clasp login` y activa la API de Apps Script en https://script.google.com/home/usersettings
4. Abre Claude Code en la carpeta del repositorio, acepta la confianza de la carpeta y pega el prompt de arranque.
5. Cuando Claude Code despliegue por primera vez, entra al proyecto de Apps Script y completa las propiedades del script: `URL_FORMULARIO_LEGAL`, `CANAL_AYUDA_URL` y, si quieres copia de cada documento, `CORREO_COPIA_LEGAL`.

La versión anterior de RappiMind (proyecto de Apps Script, Sheet y repositorio) no se toca y sigue funcionando hasta que la v3 pase las pruebas.
