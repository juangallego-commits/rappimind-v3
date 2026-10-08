'use strict';

/**
 * El recorrido del comercial de Brasil, con la interfaz en portugues.
 *
 * Existe porque el idioma de la interfaz es lo mas facil de dejar a medias: con
 * traducir la mitad de las pantallas ya parece que esta en portugues, y el KAM
 * se topa con el espanol justo en la pregunta que no entiende.
 *
 * Tambien vigila que volver a espanol devuelva todo, y que la preferencia
 * sobreviva a recargar la pagina.
 *
 * Como correrlo:
 *   npm run demo
 *   node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js
 *
 * Necesita playwright-core y un Chromium, igual que recorrer-flujo.js.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const DEMO = 'file://' + path.join(RAIZ, 'demo', 'index.html');

function buscarNavegador() {
  let chromium = null;
  for (const intento of ['playwright-core', 'playwright']) {
    try { chromium = require(intento).chromium; break; } catch (e) { /* sigue */ }
  }
  if (!chromium) { console.log('No se puede recorrer: playwright-core no está instalado.'); process.exit(0); }

  const carpeta = process.env.PLAYWRIGHT_BROWSERS_PATH;
  let ejecutable;
  if (carpeta && fs.existsSync(carpeta)) {
    for (const entrada of fs.readdirSync(carpeta)) {
      const c = path.join(carpeta, entrada, 'chrome-linux', 'chrome');
      if (fs.existsSync(c)) { ejecutable = c; break; }
    }
  }
  return { chromium, ejecutable };
}

const { chromium, ejecutable } = buscarNavegador();
const res=[]; const ok=(n,c,d)=>res.push((c?'ok    ':'FALLA ')+n+(c?'':'  '+(d||'')));
(async()=>{const nav=await chromium.launch({executablePath: ejecutable, args:['--no-sandbox']});
const p=await(await nav.newContext({viewport:{width:1440,height:1100}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(DEMO); await p.waitForTimeout(900);
const txt=()=>p.evaluate(()=>document.body.innerText);
const clic=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button,a')].find(x=>x.textContent.trim().indexOf(t)===0);if(!b)throw new Error('no encontré: '+t);b.click()},t);await p.waitForTimeout(350)};
const noAtodo=async()=>{for(let i=0;i<15;i++){const q=await p.evaluate(()=>{for(const b of document.querySelectorAll('.pregunta')){const no=[...b.querySelectorAll('.opcion')].find(x=>/^(No|Não)$/.test(x.textContent.trim()));if(no&&no.getAttribute('aria-pressed')!=='true'){no.click();return true}}return false});await p.waitForTimeout(150);if(!q)break}await p.waitForTimeout(400)};

// El botón existe y está abajo a la derecha.
const caja=await p.evaluate(()=>{const e=document.querySelector('.selector-idioma');if(!e)return null;const r=e.getBoundingClientRect();return{botones:[...e.querySelectorAll('button')].map(b=>b.textContent.trim()),derecha:window.innerWidth-r.right,abajo:window.innerHeight-r.bottom}});
ok('el selector de idioma existe', !!caja, 'no lo encontré');
ok('está abajo a la derecha', caja && caja.derecha<60 && caja.abajo<60, JSON.stringify(caja));
ok('ofrece español y portugués', caja && caja.botones.join(',')==='ES,BR', caja&&caja.botones.join(','));

await p.evaluate(()=>[...document.querySelectorAll('.selector-idioma button')].find(b=>b.textContent.trim()==='BR').click());
await p.waitForTimeout(400);
const inicioPt=await txt();
ok('el inicio queda en portugués', inicioPt.indexOf('Gere os Termos e Condições da sua campanha')!==-1, inicioPt.replace(/\n+/g,' | ').slice(0,250));
ok('la navegación también', inicioPt.indexOf('Minhas campanhas')!==-1 && inicioPt.indexOf('Ajuda')!==-1);
ok('el botón de empezar también', inicioPt.indexOf('Começar')!==-1);

await clic('Começar'); await p.waitForTimeout(300);
const filtroPt=await txt();
ok('el filtro de entrada en portugués', filtroPt.indexOf('Posso fazer esta campanha por aqui?')!==-1, filtroPt.replace(/\n+/g,' | ').slice(0,250));
ok('las respuestas Sim y Não', filtroPt.indexOf('Sim')!==-1 && filtroPt.indexOf('Não')!==-1);

await noAtodo();
const paisPt=await txt();
ok('la pregunta del país en portugués', paisPt.indexOf('Em qual país a campanha acontece?')!==-1, paisPt.replace(/\n+/g,' | ').slice(0,250));

await clic('Brasil'); await p.waitForTimeout(400);
const tipoPt=await txt();
// Brasil no tiene tipos de Rappi Travel, asi que desde el 20 de septiembre de
// 2026 (punto F8) no se le pregunta el negocio: se va derecho a los tipos.
ok('en Brasil no se pregunta el negocio, porque no hay Travel',
  tipoPt.indexOf('A campanha é da Rappi ou da Rappi Travel?')===-1,
  tipoPt.replace(/\n+/g,' | ').slice(0,250));
ok('la pregunta del tipo en portugués', tipoPt.indexOf('Que tipo de campanha você vai fazer?')!==-1, tipoPt.replace(/\n+/g,' | ').slice(0,300));

await clic('Promoção Brasil'); await p.waitForTimeout(400);
const parceiroPt=await txt();
ok('la pregunta del parceiro en portugués', parceiroPt.indexOf('Em qual parceiro a campanha vale?')!==-1, parceiroPt.replace(/\n+/g,' | ').slice(0,300));
ok('el paso y los botones también', parceiroPt.indexOf('Avançar')!==-1 && parceiroPt.indexOf('Seu T&C')!==-1);

// El "por qué" y las notas de los países también, en las preguntas que no pasan por dibujarPregunta.
ok('el por qué del país y del tipo también en portugués',
  paisPt.indexOf('¿Por qué te preguntamos esto?')===-1 && tipoPt.indexOf('¿Por qué te preguntamos esto?')===-1 && paisPt.indexOf('Por que perguntamos isso?')!==-1,
  (paisPt+tipoPt).replace(/\n+/g,' | ').slice(0,300));
// "Em piloto" ya no sale en ninguna tarjeta, porque desde el 20 de septiembre de
// 2026 los nueve paises son activos. La nota traducida se revisa mas abajo, con
// un pais puesto en piloto a mano.
ok('las notas de los países en portugués', paisPt.indexOf('Disponível.')!==-1 && paisPt.indexOf('Disponible.')===-1, paisPt.replace(/\n+/g,' | ').slice(0,300));
ok('Brasil, que salió de piloto el 18 de septiembre, ya no lleva el aviso de pruebas', parceiroPt.indexOf('está em testes')===-1 && parceiroPt.indexOf('está en pruebas')===-1, parceiroPt.replace(/\n+/g,' | ').slice(0,300));
ok('la vista previa vacía en portugués', paisPt.indexOf('Seu documento aparece aqui')!==-1 && paisPt.indexOf('Tu documento aparece aquí')===-1, paisPt.replace(/\n+/g,' | ').slice(0,300));

// Un error de validación sale en portugués, no en español.
await clic('Avançar'); await p.waitForTimeout(400);
const conError=await txt();
ok('el mensaje de campo vacío sale en portugués', conError.indexOf('Escreva o parceiro em que a campanha vale.')!==-1 && conError.indexOf('Escribe el parceiro')===-1, conError.replace(/\n+/g,' | ').slice(0,300));

// Las fechas respondidas se escriben como el documento, en portugués.
await p.fill('.pregunta input[type=text]', 'Petz'); await clic('Avançar'); await p.waitForTimeout(400);
// La pregunta opcional del nombre comercial (H20) viene antes de las fechas; se deja vacia.
const nombrePt=await txt();
ok('el nombre comercial también se pregunta en portugués, y es opcional', nombrePt.indexOf('Com que nome a campanha é divulgada ao público?')!==-1 && nombrePt.toLowerCase().indexOf('opcional')!==-1, nombrePt.replace(/\n+/g,' | ').slice(0,300));
await clic('Avançar'); await p.waitForTimeout(400);
await p.fill('.pregunta input[type=date]', '2026-10-01'); await clic('Avançar'); await p.waitForTimeout(400);
const conFecha=await txt();
ok('la fecha respondida sale en portugués', conFecha.indexOf('1 de outubro de 2026')!==-1 && conFecha.indexOf('1 de octubre de 2026')===-1, conFecha.replace(/\n+/g,' | ').slice(0,400));
ok('"Assim fica" en portugués', conFecha.indexOf('Assim fica no seu T&C:')!==-1 || conFecha.indexOf('Así queda')===-1);

// El resumen de un país en pruebas dice qué falta de verdad, en portugués.
await p.evaluate(()=>{window.RM.app.ir('resumen')}); await p.waitForTimeout(500);
const resumenPt=await txt();
ok('el resumen en portugués, y sin el aviso de pruebas porque Brasil ya es activo', resumenPt.indexOf('está em testes')===-1 && resumenPt.indexOf('Confirmo que as informações')!==-1, resumenPt.replace(/\n+/g,' | ').slice(0,400));
const faltando=resumenPt.slice(resumenPt.indexOf('Está faltando:'), resumenPt.indexOf('Voltar'));
ok('"Está faltando" lista lo que falta, no los datos del país',
  faltando.indexOf('Está faltando:')===0 && faltando.indexOf('miles')===-1 && faltando.indexOf('Escolha')!==-1 && faltando.indexOf('Marque a caixa')!==-1,
  faltando.replace(/\n+/g,' | ').slice(0,300));
// De vuelta al primer paso, donde está la tienda respondida, para las comprobaciones que siguen.
await p.evaluate(()=>{window.RM.estado.estado.pasoActual=0; window.RM.estado.estado.campoAbierto=null; window.RM.app.ir('pasos')}); await p.waitForTimeout(400);

// Y al volver a español, todo vuelve.
await p.evaluate(()=>[...document.querySelectorAll('.selector-idioma button')].find(b=>b.textContent.trim()==='ES').click());
await p.waitForTimeout(400);
const vuelta=await txt();
ok('volver a español devuelve todo', vuelta.indexOf('¿En qué parceiro aplica?')!==-1 && vuelta.indexOf('Siguiente')!==-1, vuelta.replace(/\n+/g,' | ').slice(0,250));

// La preferencia sobrevive a recargar.
await p.evaluate(()=>[...document.querySelectorAll('.selector-idioma button')].find(b=>b.textContent.trim()==='BR').click());
await p.waitForTimeout(300);
await p.reload(); await p.waitForTimeout(900);
ok('la preferencia sobrevive a recargar', (await txt()).indexOf('Gere os Termos e Condições')!==-1);

// El aviso de pais en pruebas en portugues. Desde el 20 de septiembre de 2026 no
// queda ningun pais en piloto, asi que aqui se pone uno: sin esta comprobacion
// la frase se queda traducida y sin nadie que la mire, porque Brasil, el unico
// pais que lee en portugues, salio de piloto el 18 de septiembre.
await p.goto(DEMO); await p.waitForTimeout(900);
await p.evaluate(()=>[...document.querySelectorAll('.selector-idioma button')].find(b=>b.textContent.trim()==='BR').click());
await p.waitForTimeout(400);
await clic('Começar'); await p.waitForTimeout(300);
await noAtodo();
await p.evaluate(()=>{
  const config=RM.estado.estado.configuracion;
  config.paises.forEach((x)=>{ if(x.codigo==='EC') x.estado='piloto'; });
  RM.app.dibujar();
});
await p.waitForTimeout(300);
const notasPt=await txt();
ok('la nota "Em piloto" sale traducida en la tarjeta del país', notasPt.indexOf('Em piloto')!==-1 && notasPt.indexOf('En piloto')===-1, notasPt.replace(/\n+/g,' | ').slice(0,300));

// Punto F2, 20 de septiembre de 2026: los nombres de los paises se leen en
// portugues, y solo en la pantalla. La columna nombre no se toca, asi que el
// documento sigue diciendo "Ecuador".
ok('los nombres de los países se leen en portugués',
  notasPt.indexOf('Colômbia')!==-1 && notasPt.indexOf('Equador')!==-1 &&
  notasPt.indexOf('Peru')!==-1 && notasPt.indexOf('Uruguai')!==-1 &&
  notasPt.indexOf('Colombia')===-1 && notasPt.indexOf('Ecuador')===-1,
  notasPt.replace(/\n+/g,' | ').slice(0,400));

await clic('Equador'); await p.waitForTimeout(500);
const ecuadorPt=await p.evaluate(()=>{const a=document.querySelector('.columna-preguntas .aviso');return a?a.innerText:''});
ok('un país en piloto sí lleva el aviso en portugués', ecuadorPt.indexOf('está em testes')!==-1 && ecuadorPt.indexOf('está en pruebas')===-1, ecuadorPt.replace(/\n+/g,' | ').slice(0,300));

ok('sin errores de JavaScript', errs.length===0, errs.join(' | '));
await nav.close();
console.log(res.join('\n'));
const f=res.filter(r=>r.startsWith('FALLA')).length;
console.log('\n'+(f?f+' fallaron':'todo bien'));
if(f) process.exit(1);
})().catch(e=>{console.log(res.join('\n'));console.error('FALLO: '+e.message);process.exit(1)});
