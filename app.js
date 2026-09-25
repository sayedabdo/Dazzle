let language = 'ar';
try { language = localStorage.getItem('dazzle-language') === 'en' ? 'en' : 'ar'; } catch {}
const languageButton = document.getElementById('language');
function setLanguage(lang) {
 language=lang; document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-ar]').forEach(el=>el.innerHTML=el.dataset[lang]);
 document.querySelectorAll('[data-alt-ar]').forEach(el=>el.alt=el.dataset[lang==='ar'?'altAr':'altEn']);
 languageButton.innerHTML=lang==='ar'?'EN <span>↗</span>':'عربي <span>↗</span>';
 languageButton.setAttribute('aria-label',lang==='ar'?'Switch to English':'التغيير إلى العربية');
 document.querySelector('nav').setAttribute('aria-label',lang==='ar'?'التنقل الرئيسي':'Main navigation');
 document.title=lang==='ar'?'DAZZLE Automotive — الرياض':'DAZZLE Automotive — Riyadh';
 try { localStorage.setItem('dazzle-language',lang); } catch {}
 document.querySelector('.catalog-toolbar').setAttribute('aria-label',lang==='ar'?'تصفية السيارات':'Filter vehicles');
 document.querySelector('.video-tabs').setAttribute('aria-label',lang==='ar'?'فيديوهات المعرض':'Showroom videos');
 window.dispatchEvent(new Event('dazzle-language'));
}
languageButton.addEventListener('click',()=>setLanguage(language==='ar'?'en':'ar'));setLanguage(language);
document.getElementById('year').textContent=new Date().getFullYear();
const gallery=document.getElementById('gallery');
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
 const caption=button.dataset[language==='ar'?'captionAr':'captionEn'];
 document.getElementById('gallery-image').src=button.dataset.image;
 document.getElementById('gallery-image').alt=caption;
 document.getElementById('gallery-caption').textContent=caption;
 gallery.showModal();document.body.classList.add('modal-open');
}));
gallery.querySelector('.close').addEventListener('click',()=>gallery.close());
gallery.addEventListener('click',e=>{if(e.target===gallery)gallery.close()});
gallery.addEventListener('close',()=>document.body.classList.remove('modal-open'));
document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
 const video=document.getElementById('showroom-video');video.pause();video.src=button.dataset.video;video.load();
 document.querySelectorAll('[data-video]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});
}));
document.querySelectorAll('[data-video]').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
const appointmentForm = document.getElementById('appointment-form');
const dateInput = document.getElementById('visit-date');
function setMinimumDate() {
 const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part = type => today.find(p=>p.type===type).value;
 dateInput.min = `${part('year')}-${part('month')}-${part('day')}`;
}
setMinimumDate();dateInput.addEventListener('focus',setMinimumDate);
// Delivery stays disabled until email and WhatsApp delivery are connected.
appointmentForm.addEventListener('submit', event => event.preventDefault());

// One-time entrance motion: content remains visible if JS or animation is unavailable.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const animatedElements = new WeakSet();
function revealElement(element, delay = 0) {
 if (motionPreference.matches || animatedElements.has(element) || !element.animate) return;
 animatedElements.add(element);
 element.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],
 {duration:580,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
}
const entranceTargets = document.querySelectorAll('.section-top,.marque-card,.arrival-card,.showroom-copy,.video-wrap,.showroom-photo,.about-copy,.about-photo,.services-heading,.service-card,.experience-copy,.experience-number,.contact-section>div,.appointment-intro,#appointment-form,.footer-top');
if ('IntersectionObserver' in window) {
 const entranceObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if (!entry.isIntersecting) return;
   const element=entry.target;
   const delay=element.matches('.marque-card,.arrival-card,.showroom-photo,.service-card') ? Array.from(element.parentElement.children).indexOf(element)%4*75 : 0;
   revealElement(element,delay); entranceObserver.unobserve(element);
  });
 },{threshold:0.08});
 entranceTargets.forEach(element=>entranceObserver.observe(element));
}
document.querySelectorAll('.hero-content>*').forEach((element,index)=>revealElement(element,index*110));
motionPreference.addEventListener('change',event=>{if(event.matches)document.getAnimations().forEach(animation=>animation.finish())});
const sectionLinks = Array.from(document.querySelectorAll('header nav a'));
if ('IntersectionObserver' in window) {
 const visibleSections = new Map();
 const navigationObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>visibleSections.set(entry.target.id,entry.isIntersecting));
  const current=sectionLinks.find(link=>visibleSections.get(link.hash.slice(1)));
  sectionLinks.forEach(link=>{
   if(link===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
 },{rootMargin:'-15% 0px -55% 0px',threshold:0});
 document.querySelectorAll('main>section').forEach(section=>navigationObserver.observe(section));
}
// Only recognized vehicle IDs can prefill the appointment form.
const requestedVehicle = new URLSearchParams(location.search).get('vehicle');
const vehicleNames = {mclaren:'McLaren / ماكلارين',porsche:'Porsche / بورشه','rolls-royce':'Rolls-Royce / رولز رويس',mercedes:'Mercedes-Benz / مرسيدس بنز'};
if (Object.hasOwn(vehicleNames,requestedVehicle)) appointmentForm.elements.vehicle.value=vehicleNames[requestedVehicle];

const catalogButtons = [...document.querySelectorAll('.catalog-filter')];
const catalogCards = [...document.querySelectorAll('.arrival-card')];
const catalogCount = document.querySelector('.catalog-count');
catalogButtons.forEach(button => button.addEventListener('click', () => {
 const filter = button.dataset.filter;
 catalogButtons.forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
 const count = catalogCards.reduce((shown, card) => { const visible = filter === 'all' || card.dataset.category === filter; card.hidden = !visible; return shown + Number(visible); }, 0);
 catalogCount.dataset.ar = `${count} ${count === 1 ? 'سيارة مصوّرة' : 'سيارات مصوّرة'}`;
 catalogCount.dataset.en = `${count} photographed ${count === 1 ? 'selection' : 'selections'}`;
 catalogCount.textContent = catalogCount.dataset[language];
}));
