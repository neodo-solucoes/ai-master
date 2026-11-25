// Ícone de cada tema (nível) da trilha — traço 24x24, cor herdada
window.THEME_ICONS=[
  // 0 Computação, Python e matemática: código + somatório
  '<path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/><path d="M14.5 6.5h-5l3 5.5-3 5.5h5"/>',
  // 1 Dados e ML clássico: banco de dados + tendência
  '<ellipse cx="9" cy="5.5" rx="6" ry="2.5"/><path d="M3 5.5v11c0 1.4 2.7 2.5 6 2.5"/><path d="M15 5.5V10"/><path d="M3 11c0 1.4 2.7 2.5 6 2.5"/><path d="m12 19 3.5-3.5 2.5 2.5 4-5"/>',
  // 2 Deep Learning: rede neural
  '<circle cx="4.5" cy="7" r="1.8"/><circle cx="4.5" cy="17" r="1.8"/><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/><circle cx="19.5" cy="12" r="1.8"/><path d="m6.2 7.4 4 4M6.2 6.5l4-1M6.2 16.6l4-4M6.2 17.5l4 1M13.7 5.6l4.3 5.4M13.8 12h3.9M13.7 18.4l4.3-5.4"/>',
  // 3 LLMs, RAG e agentes: conversa + brilho
  '<path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20.5l1.4-4.5A7.5 7.5 0 1 1 20 12.5z"/><path d="M12.5 8.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
  // 4 Engenharia e MLOps: ciclo de entrega com engrenagem
  '<circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2M7 7l1.4 1.4M15.6 15.6 17 17M7 17l1.4-1.4M15.6 8.4 17 7"/><path d="M20.5 7.5A9.5 9.5 0 0 0 4.2 6.3M3.5 16.5a9.5 9.5 0 0 0 16.3 1.2"/><path d="M20.5 3.5v4h-4M3.5 20.5v-4h4"/>',
  // 5 Especialização: alvo com seta
  '<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><circle cx="11" cy="13" r=".8"/><path d="m11 13 9-9M16.5 4H20v3.5"/>',
  // 6 Leitura contínua: livro aberto
  '<path d="M12 6.5C10 5 7 4.5 3 4.8v13.4c4-.3 7 .2 9 1.8 2-1.6 5-2.1 9-1.8V4.8c-4-.3-7 .2-9 1.7z"/><path d="M12 6.5V20"/>'
];
window.themeIcon=function(n,cls){var p=window.THEME_ICONS[n];if(!p)return '';return '<svg class="'+(cls||'ticon')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
