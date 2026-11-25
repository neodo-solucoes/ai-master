/* AI Master · comportamento da interface: tema, transições entre telas, luz que segue o mouse. */
'use strict';
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const SUN='<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON='<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  // Tema inicial: preferência salva; sem preferência, segue o sistema.
  try{if(!localStorage.getItem('ai_master_theme_chosen')&&matchMedia('(prefers-color-scheme: light)').matches&&state.theme==='dark'){state.theme='light'}}catch{}
  document.documentElement.dataset.theme=state.theme;

  function themeButton(extra=''){
    const b=document.createElement('button');b.type='button';b.className='theme-toggle '+extra;
    b.setAttribute('aria-label','Alternar tema claro/escuro');b.title='Tema claro/escuro';b.innerHTML=SUN+MOON;
    b.addEventListener('click',ev=>toggleTheme(ev));return b;
  }
  function applyTheme(){
    try{localStorage.setItem('ai_master_theme_chosen','1')}catch{}
    document.documentElement.dataset.theme=state.theme;
    if(typeof save==='function')save();
    if(!document.getElementById('learningShell').hidden&&typeof render==='function')render();
  }
  window.toggleTheme=function(ev){
    state.theme=state.theme==='light'?'dark':'light';
    const root=document.documentElement;
    if(document.startViewTransition&&!reduce.matches&&ev){
      const x=ev.clientX||innerWidth-40,y=ev.clientY||40,r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
      const vt=document.startViewTransition(applyTheme);
      vt.ready.then(()=>root.animate({clipPath:[`circle(0 at ${x}px ${y}px)`,`circle(${r}px at ${x}px ${y}px)`]},{duration:550,easing:'cubic-bezier(.22,1,.36,1)',pseudoElement:'::view-transition-new(root)'})).catch(()=>{});
    }else{root.classList.add('theme-anim');applyTheme();setTimeout(()=>root.classList.remove('theme-anim'),500)}
  };

  // Botão de tema no cabeçalho do app
  const header=document.querySelector('header');
  if(header){const form=header.querySelector('form');const wrap=document.createElement('div');wrap.className='headerright';form.replaceWith(wrap);wrap.append(themeButton(),form)}

  // Botão de tema também nas telas de acesso
  const gate=document.getElementById('accessGate');
  if(gate)new MutationObserver(()=>{if(!gate.hidden&&!gate.querySelector('.theme-toggle'))gate.append(themeButton('gate-theme'))}).observe(gate,{childList:true,attributes:true});

  // Detalhes depois de cada render: setas animadas, luz dos cartões, entrada da tela
  let lastKey='';
  function decorate(root){
    root.querySelectorAll('button').forEach(b=>{
      if(b.dataset.dec)return;b.dataset.dec='1';
      const t=b.innerHTML;
      if(/\s→\s*$/.test(t))b.innerHTML=t.replace(/\s→\s*$/,' <span class="arrow" aria-hidden="true">→</span>');
      else if(/^\s*←\s/.test(t))b.innerHTML=t.replace(/^\s*←\s/,'<span class="arrow-l" aria-hidden="true">←</span> ');
    });
  }

  // Ícones das tecnologias de cada nível (lista da trilha)
  const LEVEL_ICONS=[['python','git','linux','jupyter','numpy'],['pandas','numpy','postgresql','jupyter'],['pytorch','tensorflow','opencv'],['openai','huggingface','langchain','anthropic'],['fastapi','docker','kubernetes','aws','postgresql'],['opencv','pytorch','huggingface','streamlit'],[]];
  function levelIcons(root){root.querySelectorAll('.level').forEach(row=>{if(row.querySelector('.lvl-icons'))return;const n=parseInt(row.querySelector('.num')?.textContent,10);const list=LEVEL_ICONS[n];if(!list||!list.length)return;
    const box=document.createElement('span');box.className='lvl-icons';box.setAttribute('aria-hidden','true');box.innerHTML=list.map(i=>`<img src="brand/icons/${i}.svg" alt="" loading="lazy">`).join('');
    const txt=row.children[1];if(txt)txt.append(box)})}

  // Ícone do tema dentro do botão de cada módulo e nível
  const G={sigma:'<path d="M18 6V4H6l6 8-6 8h12v-2"/>',fx:'<path d="M9 4c-2 0-3 1-3 3v13"/><path d="M4 11h6"/><path d="m13 11 7 9M20 11l-7 9"/>',
    chart:'<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',tree:'<circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v4M12 11l-6 5M12 11l6 5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',dots:'<circle cx="7" cy="8" r="2"/><circle cx="16" cy="7" r="2"/><circle cx="9" cy="16" r="2"/><circle cx="17" cy="15" r="2"/><circle cx="12" cy="11" r="1.5"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 15h10"/>',
    shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/>',
    rocket:'<path d="M5 15c-1 1-2 4-2 6 2 0 5-1 6-2"/><path d="M9 15l-3-3c2-6 7-9 14-9 0 7-3 12-9 14z"/><circle cx="15" cy="9" r="1.5"/>',doc:'<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>'};
  const MOD={'n0-m1':'git','n0-m2':'python','n0-m3':'g:tree','n0-m4':'g:sigma','n0-m5':'g:fx','n0-m6':'g:chart',
    'n1-m1':'pandas','n1-m2':'postgresql','n1-m3':'g:flask','n1-m4':'g:target','n1-m5':'g:dots','n1-m6':'g:check',
    'n2-m1':'pytorch','n2-m2':'pytorch','n2-m3':'opencv','n2-m4':'huggingface','n2-m5':'huggingface','n2-m6':'jupyter',
    'n3-m1':'openai','n3-m2':'anthropic','n3-m3':'langchain','n3-m4':'langchain','n3-m5':'huggingface','n3-m6':'g:shield',
    'n4-m1':'fastapi','n4-m2':'postgresql','n4-m3':'docker','n4-m4':'github','n4-m5':'aws','n4-m6':'g:shield',
    'n5-m1':'g:target','n5-m2':'g:book','n5-m3':'g:flask','n5-m4':'g:shield','n5-m5':'g:rocket','n5-m6':'g:doc'};
  const LVL=['python','pandas','pytorch','langchain','docker','opencv','g:book'];
  function iconHTML(k){if(!k)return '';if(k.startsWith('g:'))return `<svg class="bico g" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G[k.slice(2)]}</svg>`;return `<img class="bico" src="brand/icons/${k}.svg" alt="" aria-hidden="true">`}
  function buttonIcons(root){root.querySelectorAll('button[onclick]').forEach(b=>{if(b.dataset.ico)return;const oc=b.getAttribute('onclick')||'';let k=null;
    let m=oc.match(/go\('study','(n\d-m\d)'\)/);if(m&&b.closest('.module,.hero,.studygrid'))k=MOD[m[1]];
    if(!k){m=oc.match(/go\('level',(\d)\)/);if(m&&b.closest('.level'))k=LVL[+m[1]]}
    if(!k)return;b.dataset.ico='1';b.classList.add('has-ico');b.insertAdjacentHTML('afterbegin',iconHTML(k))})}
  window.moduleIcon=k=>iconHTML(MOD[k]);
  const app=document.getElementById('app');
  new MutationObserver(()=>{
    decorate(app);levelIcons(app);buttonIcons(app);
    const key=(typeof view!=='undefined'?view:'')+'|'+(typeof arg!=='undefined'?arg:'');
    if(key!==lastKey&&!reduce.matches){lastKey=key;app.classList.remove('view-enter');void app.offsetWidth;app.classList.add('view-enter');countUp(app)}
    else lastKey=key;
  }).observe(app,{childList:true});
  if(app.children.length){decorate(app);levelIcons(app);buttonIcons(app)}
  if(gate)new MutationObserver(()=>decorate(gate)).observe(gate,{childList:true,subtree:true});
  document.getElementById('nav')&&decorate(document.getElementById('nav'));

  app.addEventListener('click',ev=>{const row=ev.target.closest('.module');if(!row||ev.target.closest('button,a,input,label'))return;row.querySelector('button')?.click()});
  // Números das métricas sobem ao abrir a tela
  function countUp(root){
    root.querySelectorAll('.metric').forEach(el=>{
      const m=el.textContent.match(/^(\d+)/);if(!m)return;const end=+m[1];if(end<1)return;
      const rest=el.textContent.slice(m[1].length),t0=performance.now(),d=700;
      const step=t=>{const p=Math.min(1,(t-t0)/d),v=Math.round(end*(1-Math.pow(1-p,3)));el.textContent=v+rest;if(p<1)requestAnimationFrame(step)};
      requestAnimationFrame(step);
    });
  }
})();
