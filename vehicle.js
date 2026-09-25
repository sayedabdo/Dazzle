let lang='ar';try{lang=localStorage.getItem('dazzle-language')==='en'?'en':'ar'}catch{}
const languageControl=document.getElementById('language');
function translate(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelectorAll('[data-ar]').forEach(el=>el.textContent=el.dataset[lang]);languageControl.textContent=lang==='ar'?'EN ↗':'عربي ↗';languageControl.setAttribute('aria-label',lang==='ar'?'Switch to English':'التغيير إلى العربية');document.querySelector('nav').setAttribute('aria-label',lang==='ar'?'التنقل الرئيسي':'Main navigation');try{localStorage.setItem('dazzle-language',lang)}catch{}}
languageControl.addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';translate()});translate();
const photoDialog=document.getElementById('vehicle-gallery');
document.getElementById('open-photo').addEventListener('click',()=>{photoDialog.showModal();document.body.classList.add('modal-open')});
photoDialog.querySelector('.close').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',e=>{if(e.target===photoDialog)photoDialog.close()});
photoDialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
