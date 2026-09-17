# Brasil: cada corrección, con su antes y su después

Juan autorizó el 17 de septiembre de 2026 corregir el texto brasileño donde
hubiera oportunidad de mejora. Esto es la lista completa de lo que cambió, para
que nada quede corregido a escondidas.

**El criterio que usé.** Corregí errores verificables: erratas, palabras que no
encajan, frases sin verbo, concordancias rotas, ambigüedades que cambian el
sentido y diferencias de forma entre los cuatro documentos. **No toqué criterio
jurídico**: donde había una decisión de abogado y no un error, la dejé como
está y la anoté abajo.

Y un recordatorio que no es objeción, solo prudencia: Brasil no es tu
jurisdicción. Todo lo de esta página debería pasar por Legal Brasil antes de
publicarse, aunque sean correcciones de redacción.

---

## A. Errores de redacción corregidos

### A1. "doação" donde debía decir "benefício"

Aparece en los cuatro documentos.

- **Antes:** "O Rappi se reserva o direito de encerrar esta promoção a qualquer
  momento em caso de fraude ou **desviação da doação** para terceiros."
- **Después:** "...em caso de fraude ou **desvio do benefício** para terceiros."

Dos cosas: "doação" es donación, que no tiene nada que ver con una promoción de
descuento, y parece arrastrada de otra plantilla. Y "desviação" no es la palabra
portuguesa para desvío en este sentido; es "desvio".

### A2. Un gerundio que rompe la frase

- **Antes:** "cancelar a promoção, cancelar o código e **bloqueando** a conta do
  Usuário"
- **Después:** "cancelar a promoção, cancelar o código e **bloquear** a conta do
  Usuário"

La enumeración va en infinitivo y el tercer verbo se salía.

### A3. Una frase sin verbo principal

- **Antes:** "...quando for verificado que as contas referidas são fictícias ou
  falsas. **Usuários que realmente não constituem uma pessoa física
  identificável** por meio de um documento de identidade emitido pela autoridade
  competente."
- **Después:** "...quando for verificado que as contas referidas são fictícias ou
  falsas, **ou seja, que não constituem uma pessoa física identificável** por
  meio de um documento de identidade emitido pela autoridade competente."

La segunda oración no tenía verbo principal y quedaba colgando. Unida a la
primera, dice lo mismo y sí es una oración.

### A4. Dos concordancias rotas en la misma línea

- **Antes:** "no momento do carregamento **do dados** solicitados **pelos
  Usuário**"
- **Después:** "no momento do carregamento **dos dados** solicitados **ao
  Usuário**"

"do dados" es un singular con un plural, y "pelos Usuário" al revés. Además los
datos se le solicitan **al** usuario, no son solicitados **por** él.

---

## B. Ambigüedades que cambiaban el sentido

### B1. El tope del envío gratis

Está en `Frete Grátis` y es el más delicado de los cuatro.

- **Antes:** "Esclarece-se que o frete grátis não será aplicado caso **o valor**
  seja superior a **20,00 (vinte reais)**."
- **Después:** "Esclarece-se que o frete grátis está limitado a **R$20,00 (vinte
  reais)**; o valor que exceder esse limite será cobrado do Usuário."

Tres problemas en una línea. Le faltaba el `R$`. "O valor" no decía de qué: leído
solo, un usuario entiende el valor **del pedido**, o sea que si compra más de
R$20 pierde el envío gratis, que es exactamente lo contrario de lo que la campaña
quiere. Y "não será aplicado" sugiere que el beneficio desaparece entero, cuando
la intención es que se cubra hasta ese tope.

**Este es el que más quiero que confirmes**, porque el "después" que escribí
supone que la intención es cubrir hasta R$20 y cobrar el resto. Si la intención
real es que el envío gratis no aplique del todo cuando el flete pasa de R$20, el
texto tiene que decir otra cosa y lo cambio.

---

## C. Diferencias de forma entre los cuatro documentos

Los cuatro dicen lo mismo de cuatro maneras. Unifiqué con la forma que usan tres
de los cuatro, que es la mayoritaria.

| Concepto | Formas que aparecían | Quedó |
|---|---|---|
| Presentación | "por meio da qual" / "na qual" | "na qual" (3 de 4) |
| El socio | "no parceiro Petz" / "nas lojas do Parceiro X" | "nas lojas do Parceiro X" (3 de 4) |
| La plataforma | "mediante aplicativo Rappi" / "na plataforma Rappi" / "dentro da plataforma Rappi" | "na plataforma Rappi" |
| La viñeta del período | "O preço especial será concedido aos usuários que..." / "Esta campanha aplica-se apenas aos usuários cadastrados..." | la segunda (3 de 4) |
| Mayúsculas del beneficio | "Frete grátis" / "frete grátis" / "Taxa de serviço grátis" | minúscula dentro de la frase |

### C1. Una fecha a la que le faltaba una palabra

- **Antes:** "no período de **20 de janeiro 2025** às 00:01"
- **Después:** "no período de **20 de janeiro de 2025** às 00:01"

Ya no puede repetirse: las fechas las escribe el motor, no una persona.

### C2. El guion y la redundancia de la cobertura

- **Antes:** "em todo território brasileiro **- Brasil**, onde houver lojas..."
- **Después:** "em todo **o** território brasileiro, onde houver lojas..."

"Território brasileiro - Brasil" repite la misma idea dos veces, y la regla 8 de
`CLAUDE.md` prohíbe el guion como signo de puntuación en lo que el usuario lee.

### C3. Dos cláusulas duplicadas

Las CONDIÇÕES GERAIS repetían dos cosas que ya estaban en REGRAS PRINCIPAIS:

- "Promoção válida na área de cobertura do Rappi para usuários do Rappi no
  Brasil" repetía la viñeta de cobertura.
- "Promoção não acumulável com outras promoções" repetía "Promoção não
  cumulativa".

Dejé una sola vez cada una. **Esta es la corrección más agresiva de la lista**,
porque quita texto en vez de arreglarlo. Si prefieres que se queden las dos, se
devuelven en un minuto.

---

## D. Lo que NO toqué, porque es criterio de abogado

1. **"O Rappi"**, en masculino, en los trece párrafos. En portugués de Brasil
   una empresa suele ir en femenino ("a Rappi"), y el propio documento dice "não
   sendo **a Rappi** responsável" en un sitio. Pero "O Rappi" es consistente en
   los cuatro documentos y puede ser una decisión de marca, así que la respeté.

2. **"pessoa humana"** en la definición de Usuário, mientras que más abajo el
   mismo documento dice "pessoa física", que es también lo que tienes puesto
   para Brasil en `data/paises.json`. Las dos son válidas en derecho brasileño.
   Que el mismo documento use las dos sí es raro, pero elegir cuál es de Legal.

3. **"São Paulo/SP"** al final. Aparece en uno solo de los cuatro y no lo puse en
   el modelo, porque no sé si es la sede que debe constar siempre o quedó de un
   documento anterior. Dime y lo agrego.

4. **Rappi como quien concede y cancela la promoción.** Ya está resuelto: lo
   autorizaste como excepción explícita y quedó escrito en `CLAUDE.md` y en
   `docs/DECISIONES.md`. Vale solo para Brasil.

---

## E. Los enlaces que pediste

El texto aprobado nombraba los dos documentos sin ninguna dirección:

- **Antes:** "Consulte nossos Termos de Uso e Condições da Plataforma Rappi e
  Aviso de Privacidade de Dados."
- **Después:** "Consulte nossos Termos de Uso e Condições da Plataforma Rappi,
  disponíveis em: `<enlace>`, e o Aviso de Privacidade de Dados, disponível em:
  `<enlace>`."

Los dos enlaces salen de la fila de Brasil del Sheet, así que se cambian ahí sin
tocar código:

- Plataforma: `https://legal.rappi.com.co/brazil/termos-e-condicoes-de-uso-da-plataforma-rappi/`
- Privacidad: `https://legal.rappi.com.co/brazil/aviso-de-privacidade-e-politicas-de-uso-das-informacao-utilizadas-pela-rappi/`

**No pude comprobar que abran**, porque la red de este entorno bloquea ese
dominio. Dales clic antes de publicar el primer documento: un enlace roto en un
T&C publicado es peor que no ponerlo.

Y un detalle que vi de paso en la fila de Brasil: el nombre de la política está
guardado como "**a** Aviso de Privacidade e Políticas de uso das **Informação**
utilizadas pela Rappi". En portugués sería "**o** Aviso" (es masculino) y "das
**Informações**". No lo cambié porque puede ser el nombre exacto con el que está
publicado el documento, erratas incluidas, y en ese caso hay que citarlo tal cual.
