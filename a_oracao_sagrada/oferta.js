(() => {
  'use strict';
  const cfg=window.SACRED_CONFIG||{};
  const video=document.querySelector('#video-stage');
  if(cfg.vslUrl){
    try {
      const link=new URL(cfg.vslUrl);
      if(link.protocol==='https:'||link.protocol==='http:') {
        const iframe=document.createElement('iframe');
        iframe.src=link.toString();iframe.title='Apresentação A Oração Sagrada';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allowFullscreen=true;video.replaceChildren(iframe);
      }
    } catch {console.warn('URL da VSL inválida.');}
  }
  if(cfg.preco){const p=document.querySelector('#price-label');p.textContent=cfg.preco;p.style.display='block';}
  if(cfg.garantia) document.querySelector('#guarantee-line').textContent=`Garantia: ${cfg.garantia}. Consulte os termos da compra para conhecer as condições.`;
  const modal=document.querySelector('#checkout-modal');const dialog=modal.querySelector('.modal-dialog');
  const close=()=>{modal.hidden=true;document.body.style.overflow='';};
  document.querySelectorAll('.checkout-button').forEach(b=>b.addEventListener('click',()=>{
    if(cfg.checkoutUrl){try{const link=new URL(cfg.checkoutUrl);if(['https:','http:'].includes(link.protocol)){window.location.href=link.toString();return;}}catch{}}
    modal.hidden=false;document.body.style.overflow='hidden';dialog.focus();
  }));
  document.querySelector('#checkout-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();
