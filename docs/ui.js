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
  const app=document.getElementById('app');
  new MutationObserver(()=>{
    decorate(app);
    const key=(typeof view!=='undefined'?view:'')+'|'+(typeof arg!=='undefined'?arg:'');
    if(key!==lastKey&&!reduce.matches){lastKey=key;app.classList.remove('view-enter');void app.offsetWidth;app.classList.add('view-enter');countUp(app)}
    else lastKey=key;
  }).observe(app,{childList:true});
  if(gate)new MutationObserver(()=>decorate(gate)).observe(gate,{childList:true,subtree:true});
  document.getElementById('nav')&&decorate(document.getElementById('nav'));

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
