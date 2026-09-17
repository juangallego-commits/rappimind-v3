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
const negocioPt=await txt();
ok('la pregunta del negocio en portugués', negocioPt.indexOf('A campanha é da Rappi ou da Rappi Travel?')!==-1, negocioPt.replace(/\n+/g,' | ').slice(0,250));

await clic('Rappi'); await p.waitForTimeout(400);
const tipoPt=await txt();
ok('la pregunta del tipo en portugués', tipoPt.indexOf('Que tipo de campanha você vai fazer?')!==-1, tipoPt.replace(/\n+/g,' | ').slice(0,300));

await clic('Promoção Brasil'); await p.waitForTimeout(400);
const parceiroPt=await txt();
ok('la pregunta del parceiro en portugués', parceiroPt.indexOf('Em qual parceiro a campanha vale?')!==-1, parceiroPt.replace(/\n+/g,' | ').slice(0,300));
ok('el paso y los botones también', parceiroPt.indexOf('Avançar')!==-1 && parceiroPt.indexOf('Seu T&C')!==-1);

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

ok('sin errores de JavaScript', errs.length===0, errs.join(' | '));
await nav.close();
console.log(res.join('\n'));
const f=res.filter(r=>r.startsWith('FALLA')).length;
console.log('\n'+(f?f+' fallaron':'todo bien'));
if(f) process.exit(1);
})().catch(e=>{console.log(res.join('\n'));console.error('FALLO: '+e.message);process.exit(1)});
