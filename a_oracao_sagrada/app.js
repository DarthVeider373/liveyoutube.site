/* A ORAÇÃO SAGRADA — INTERAÇÕES DO APLICATIVO */
(() => {
  'use strict';
  const data = window.SACRED_DATA;
  const cfg = window.SACRED_CONFIG || {};
  if (!data) { console.error('Arquivo conteudo.js não encontrado.'); return; }
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const esc = (v = '') => String(v).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const views = ['inicio','oracao','manuscrito','biblioteca','bonus'];
  const storageRead = key => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const readSet = key => new Set(Array.isArray(storageRead(key)) ? storageRead(key) : []);
  const completed = readSet('sagrada-concluidas-v1');
  const favorites = readSet('sagrada-favoritas-v1');
  const saveSet = (name,set) => { try { localStorage.setItem(name,JSON.stringify([...set])); } catch {} };
  let activeCategory = 'todas';
  let activeAudio = null;
  let closeFocusTarget = null;
  let toastTimeout = null;

  function toast(message) {
    const el=$('#toast');el.textContent=message;el.classList.add('show');
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3100);
  }
  function go(view, hash = true) {
    if (!views.includes(view)) view = 'inicio';
    stopAudio();
    $$('.view').forEach(el => el.classList.toggle('active', el.id === `view-${view}`));
    $$('[data-go]').forEach(el => {
      const active=el.dataset.go === view;
      if (el.classList.contains('nav-link') || el.classList.contains('mobile-nav-item')) {
        el.classList.toggle('active',active);
        if (active) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current');
      }
    });
    if (hash && location.hash !== `#${view}`) history.replaceState(null,'',`#${view}`);
    window.scrollTo({top:0,behavior:'instant'});
    document.title=`${({inicio:'Sua jornada',oracao:'Oração de Salomão',manuscrito:'O Manuscrito',biblioteca:'Biblioteca de orações',bonus:'Meus bônus'})[view]} • A Oração Sagrada`;
  }
  function setProgress(){
    const total=data.prayers.length+1;
    const count=[...completed].filter(id=>id==='principal'||data.prayers.some(p=>p.id===id)).length;
    $('#progress-count').textContent=`${count}/${total}`;
    $('#progress-fill').style.width=`${count/total*100}%`;
    const button=$('#complete-main');
    button.innerHTML=icon('check')+(completed.has('principal')?' Oração concluída':' Marcar como concluída');
  }
  function markComplete(id){
    if (completed.has(id)) completed.delete(id); else completed.add(id);
    saveSet('sagrada-concluidas-v1',completed);setProgress();renderPrayers();
    toast(completed.has(id)?'Momento de oração registrado.':'Marcação desfeita.');
    if (!$('#detail-modal').hidden && $('.modal-dialog').dataset.prayerId === id) showPrayer(id,false);
  }
  function toggleFavorite(id){
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    saveSet('sagrada-favoritas-v1',favorites);
    toast(favorites.has(id)?'Oração salva como favorita.':'Oração removida dos favoritos.');
    if (!$('#detail-modal').hidden && $('.modal-dialog').dataset.prayerId === id) showPrayer(id,false);
  }
  function renderHome(){
    $('#home-categories').innerHTML=data.categories.map(c=>`<button type="button" class="category-tile" data-category-go="${esc(c.id)}" style="--cat-color:${esc(c.color)}"><span class="category-symbol">${esc(c.icon)}</span><strong>${esc(c.label)}</strong><small>7 orações ${icon('arrow')}</small></button>`).join('');
    $('#home-bonus-grid').innerHTML=data.bonuses.map((b,i)=>`<button type="button" class="mini-bonus" data-bonus="${esc(b.id)}"><img src="${esc(b.image)}" alt="${esc(b.title)}" loading="lazy"><div><span>BÔNUS ${String(i+1).padStart(2,'0')}</span><strong>${esc(b.title)}</strong></div>${icon('arrow')}</button>`).join('');
    try { $('#today-date').textContent = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long'}).format(new Date()); }catch{}
  }
  function renderMain(){
    $('#prayer-title').textContent=data.principal.title;
    $('#prayer-subtitle').textContent=data.principal.subtitle;
    $('#prayer-text').innerHTML=data.principal.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('');
    $('#main-reflection').textContent=data.principal.reflection;
    $('#prayer-note').textContent=data.principal.note;
  }
  function renderChapters(){
    $('#chapter-list').innerHTML=data.chapters.map((c,i)=>`<section class="chapter-item ${i===0?'open':''}" id="chapter-${esc(c.id)}"><button class="chapter-toggle" type="button" aria-expanded="${i===0?'true':'false'}" aria-controls="chapter-body-${esc(c.id)}"><span class="chapter-number">${esc(c.number)}</span><span class="chapter-toggle-text"><small>${esc(c.theme)} • ${esc(c.verse)}</small><strong>${esc(c.title)}</strong></span><svg class="icon chapter-chevron"><use href="#i-chevron"/></svg></button><div class="chapter-body" id="chapter-body-${esc(c.id)}"><p>${esc(c.text)}</p><div class="chapter-practice"><strong>Para praticar:</strong> ${esc(c.practice)}</div></div></section>`).join('');
  }
  function renderFilters(){
    $('#filter-chips').innerHTML=[{id:'todas',label:'Todas'},...data.categories].map(c=>`<button type="button" class="filter-chip ${activeCategory===c.id?'active':''}" data-filter="${esc(c.id)}" aria-pressed="${activeCategory===c.id}">${esc(c.label)}</button>`).join('');
  }
  function renderPrayers(){
    const query=$('#prayer-search').value.toLocaleLowerCase('pt-BR').trim();
    const normalized = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const q = normalized(query);
    const filtered=data.prayers.filter(p=>(activeCategory==='todas'||p.category===activeCategory)&&normalized(`${p.title} ${p.description} ${p.text}`).includes(q));
    $('#library-count').textContent=`${filtered.length} ${filtered.length===1?'oração encontrada':'orações encontradas'} • ${data.prayers.length} disponíveis na biblioteca`;
    $('#prayer-grid').innerHTML=filtered.map(p=>{
      const c=data.categories.find(c=>c.id===p.category);
      return `<button type="button" class="prayer-card" data-prayer="${esc(p.id)}"><div class="prayer-card-top"><span class="prayer-card-symbol" style="color:${esc(c.color)}">${esc(c.icon)}</span>${completed.has(p.id)?'<span class="done-tick">✓ Concluída</span>':`<span class="card-overline">${esc(c.label)}</span>`}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><span class="prayer-card-bottom">Ler ou ouvir oração ${icon('arrow')}</span></button>`;
    }).join('');
    $('#no-results').hidden=filtered.length!==0;
    renderFilters();
  }
  function renderBonuses(){
    $('#bonus-grid').innerHTML=data.bonuses.map((b,i)=>`<article class="bonus-card"><div class="bonus-card-image"><img src="${esc(b.image)}" alt="Ilustração do bônus ${esc(b.title)}" loading="lazy"><span class="bonus-ribbon">PRESENTE ${String(i+1).padStart(2,'0')}</span></div><div class="bonus-card-body"><span>${esc(b.subtitle)}</span><h3>${esc(b.title)}</h3><p>${esc(b.description)}</p><button class="btn btn-outline" type="button" data-bonus="${esc(b.id)}">Explorar bônus ${icon('arrow')}</button></div></article>`).join('');
  }
  function modalOpen(html,prayerId=''){
    closeFocusTarget=document.activeElement;
    const backdrop=$('#detail-modal');
    $('.modal-dialog').dataset.prayerId=prayerId;
    $('#modal-content').innerHTML=html;
    backdrop.hidden=false;document.body.style.overflow='hidden';
    $('.modal-dialog').focus();
  }
  function modalClose(){
    if ($('#detail-modal').hidden) return;
    stopAudio();$('#detail-modal').hidden=true;document.body.style.overflow='';
    if(closeFocusTarget?.focus)closeFocusTarget.focus();
  }
  function showPrayer(id,initial=true){
    const p=data.prayers.find(item=>item.id===id);if(!p)return;
    const cat=data.categories.find(c=>c.id===p.category);
    const html=`<span class="modal-content-category">${esc(cat.label)} • ORAÇÃO</span><h2 id="modal-title">${esc(p.title)}</h2><p class="modal-description">${esc(p.description)}</p><div class="modal-prayer-text">${esc(p.text)}</div><div class="modal-actions"><button type="button" class="btn btn-dark" data-modal-play="${esc(p.id)}">${icon('headphones')} <span>Ouvir oração</span></button><button type="button" class="btn btn-outline" data-complete="${esc(p.id)}">${icon('check')} ${completed.has(id)?'Concluída ✓':'Concluir'}</button><button type="button" class="btn btn-outline" data-favorite="${esc(p.id)}">${icon('heart')} ${favorites.has(id)?'Salva ♥':'Salvar'}</button></div><p class="editorial-note">Texto devocional autoral. Em assuntos de saúde, mantenha os cuidados e tratamentos profissionais recomendados.</p>`;
    if(initial)modalOpen(html,id);else $('#modal-content').innerHTML=html;
  }
  function showBonus(id){
    const b=data.bonuses.find(item=>item.id===id);if(!b)return;
    const audioButton=id==='cantico'?`<button class="btn btn-dark" type="button" data-bonus-audio="cantico">${icon('music')} Tentar reproduzir o áudio</button>`:'';
    const recipes=b.recipes?.length?`<div class="recipes"><h3>Receitas para experimentar</h3>${b.recipes.map((r,i)=>`<article class="recipe-card"><strong>0${i+1} • ${esc(r.title)}</strong><p><b>Ingredientes:</b> ${esc(r.ingredients)}</p><p><b>Modo de preparo:</b> ${esc(r.preparation)}</p></article>`).join('')}<p class="editorial-note">Alimentação equilibrada é individual. Este guia não promete tratar, curar ou prevenir doenças.</p></div>`:'';
    const personal=id==='biblia'?`<div class="personalization-box"><label for="personal-name">Prévia de dedicatória na capa</label><div class="personalization-row"><input type="text" id="personal-name" maxlength="55" placeholder="Digite seu nome"><button class="btn btn-dark" type="button" id="preview-name">Visualizar</button></div><p id="personal-result">Exemplo: Edição preparada para [seu nome].</p><small>Esta prévia não realiza pedido, impressão ou envio da edição física.</small></div>`:'';
    modalOpen(`<span class="modal-content-category">UM PRESENTE PARA VOCÊ</span><h2 id="modal-title">${esc(b.title)}</h2><p class="modal-description">${esc(b.subtitle)}</p><img class="modal-detail-image" src="${esc(b.image)}" alt="Ilustração do bônus ${esc(b.title)}"><p class="modal-description">${esc(b.description)}</p><ul class="bonus-details">${b.details.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>${recipes}${personal}${audioButton}<p class="modal-audio-status" id="bonus-status">${esc(b.status)}</p>`);
  }
  function resetButton(button,label){if(button){button.disabled=false;const span=button.querySelector('span:not(.play-round)');if(span)span.textContent=label;}}
  function stopAudio(){
    if(activeAudio){
      if(activeAudio.kind==='file'){activeAudio.audio.pause();activeAudio.audio.currentTime=0;}
      if(activeAudio.kind==='tts'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
      if(activeAudio.button && activeAudio.button.id!=='play-main') activeAudio.button.innerHTML=(activeAudio.id==='cantico'?icon('music'):icon('headphones'))+' <span>'+esc(activeAudio.label)+'</span>';
      activeAudio=null;
    }
    const main=$('#play-main');if(main){main.innerHTML=`<span class="play-round">${icon('play')}</span><span id="main-play-label">Ouvir esta oração</span>`;}
  }
  function showPlaying(button, label){
    if(button?.id==='play-main'){button.innerHTML=`<span class="play-round">${icon('pause')}</span><span>Parar leitura</span>`;}
    else if(button)button.innerHTML=icon('pause')+' <span>Parar áudio</span>';
  }
  function speech(id,text,button,label){
    if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)){
      toast('Este navegador não permite leitura por voz. Adicione o arquivo MP3.');return;
    }
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang='pt-BR';utterance.rate=.87;utterance.pitch=1;
    utterance.onend=()=>{if(activeAudio?.utterance===utterance)stopAudio();};
    utterance.onerror=()=>{if(activeAudio?.utterance===utterance)stopAudio();};
    activeAudio={kind:'tts',id,utterance,button,label};
    showPlaying(button,label);
    window.speechSynthesis.speak(utterance);
  }
  async function playAudio(id,content,src,button,label,allowSpeech=true){
    if(activeAudio?.id===id){stopAudio();return;}
    stopAudio();
    // Nenhum arquivo de áudio fictício é gerado: arquivos reais são reproduzidos quando fornecidos.
    if(!src){if(allowSpeech)speech(id,content,button,label);else toast('Adicione o MP3 para habilitar este bônus.');return;}
    const audio=new Audio(src);audio.preload='none';audio.setAttribute('playsinline','');
    activeAudio={kind:'file',audio,id,button,label};
    audio.onended=()=>{if(activeAudio?.audio===audio)stopAudio();};
    try{await audio.play();if(activeAudio?.audio===audio)showPlaying(button,label);}
    catch{
      if(activeAudio?.audio!==audio)return;
      activeAudio=null;
      if(allowSpeech){speech(id,content,button,label);toast('Áudio MP3 ausente. Iniciando leitura do navegador.');}
      else {toast('O áudio ainda não foi adicionado à pasta audios.');}
    }
  }
  function copyPrayer(){
    const text=data.principal.paragraphs.join('\n\n');
    if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>toast('Oração copiada!')).catch(()=>fallbackCopy(text));}
    else fallbackCopy(text);
  }
  function fallbackCopy(text){
    const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();
    try{document.execCommand('copy');toast('Oração copiada!');}catch{toast('Não foi possível copiar neste navegador.');}t.remove();
  }
  document.addEventListener('click',event=>{
    const goButton=event.target.closest('[data-go]');if(goButton){go(goButton.dataset.go);return;}
    const categoryGo=event.target.closest('[data-category-go]');if(categoryGo){activeCategory=categoryGo.dataset.categoryGo;$('#prayer-search').value='';renderPrayers();go('biblioteca');return;}
    const category=event.target.closest('[data-filter]');if(category){activeCategory=category.dataset.filter;renderPrayers();return;}
    const prayer=event.target.closest('[data-prayer]');if(prayer){showPrayer(prayer.dataset.prayer);return;}
    const bonus=event.target.closest('[data-bonus]');if(bonus){showBonus(bonus.dataset.bonus);return;}
    const complete=event.target.closest('[data-complete]');if(complete){markComplete(complete.dataset.complete);return;}
    const favorite=event.target.closest('[data-favorite]');if(favorite){toggleFavorite(favorite.dataset.favorite);return;}
    const play=event.target.closest('[data-modal-play]');if(play){const id=play.dataset.modalPlay;const p=data.prayers.find(p=>p.id===id);if(p)playAudio(id,p.text,`audios/${id}.mp3`,play,'Ouvir oração');return;}
    if(event.target.closest('#preview-name')){const name=$('#personal-name')?.value.trim();$('#personal-result').textContent=name?`Edição preparada para ${name}.`:'Digite um nome para visualizar a dedicatória.';return;}
    const bonusAudio=event.target.closest('[data-bonus-audio]');if(bonusAudio){playAudio('cantico','',cfg.audios?.cantico,bonusAudio,'Tentar reproduzir o áudio',false);return;}
    const toggle=event.target.closest('.chapter-toggle');if(toggle){const item=toggle.closest('.chapter-item');const willOpen=!item.classList.contains('open');item.classList.toggle('open',willOpen);toggle.setAttribute('aria-expanded',String(willOpen));return;}
    if(event.target===$('#detail-modal') || event.target.closest('#modal-close'))modalClose();
  });
  $('#prayer-search').addEventListener('input',renderPrayers);
  $('#clear-search').addEventListener('click',()=>{activeCategory='todas';$('#prayer-search').value='';renderPrayers();});
  $('#complete-main').addEventListener('click',()=>markComplete('principal'));
  $('#copy-main').addEventListener('click',copyPrayer);
  $('#play-main').addEventListener('click',()=>playAudio('principal',data.principal.paragraphs.join(' '),cfg.audios?.principal,$('#play-main'),'Ouvir esta oração'));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')modalClose();
    if(event.key==='Tab'&&!$('#detail-modal').hidden){
      const focusable=$$('button:not(:disabled),a[href],input:not(:disabled)',$('#detail-modal'));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){last.focus();event.preventDefault();}
      else if(!event.shiftKey&&document.activeElement===last){first.focus();event.preventDefault();}
    }
  });
  window.addEventListener('hashchange',()=>go(location.hash.slice(1),false));
  window.addEventListener('beforeunload',stopAudio);
  renderHome();renderMain();renderChapters();renderPrayers();renderBonuses();setProgress();
  go(location.hash.slice(1) || 'inicio',false);
})();
