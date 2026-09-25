(() => {
 const brands = [
  // Source-pixel windows isolate the emblem without showing the answer text.
  {id:'bugatti', ar:'بوغاتي', en:'Bugatti', source:'marques', size:[1024,768], crop:[460,240,110,82]},
  {id:'pagani', ar:'باغاني', en:'Pagani', source:'marques', size:[1440,900], crop:[395,285,300,135]},
  {id:'koenigsegg', ar:'كونيغسيغ', en:'Koenigsegg', source:'marques', size:[2048,2048], crop:[485,85,1080,1470]},
  {id:'rolls-royce', ar:'رولز رويس', en:'Rolls-Royce', source:'marques', size:[2048,2048], crop:[540,525,980,1030]},
  {id:'ferrari', ar:'فيراري', en:'Ferrari', source:'marques', size:[640,426], crop:[235,90,180,240]},
  {id:'lamborghini', ar:'لامبورغيني', en:'Lamborghini', source:'marques', size:[640,426], crop:[236,99,185,215]},
  {id:'bentley', ar:'بنتلي', en:'Bentley', source:'marques', size:[640,426], crop:[27,64,587,200]},
  {id:'porsche', ar:'بورشه', en:'Porsche', source:'marques', size:[640,426], crop:[293,157,57,55]},
  {id:'acura', ar:'أكيورا', en:'Acura', source:'quiz', size:[1024,768], crop:[345,140,335,325]},
  {id:'audi', ar:'أودي', en:'Audi', source:'quiz', size:[640,426], crop:[18,100,607,225]},
  {id:'alfa-romeo', ar:'ألفا روميو', en:'Alfa Romeo', source:'quiz', size:[1920,1080], crop:[665,235,600,610]},
  {id:'cadillac', ar:'كاديلاك', en:'Cadillac', source:'quiz', size:[640,426], crop:[110,88,425,168]},
  {id:'infiniti', ar:'إنفينيتي', en:'Infiniti', source:'quiz', size:[2560,1440], crop:[550,150,1450,720]},
  {id:'jaguar', ar:'جاكوار', en:'Jaguar', source:'quiz', size:[640,426], crop:[76,75,525,205]},
  {id:'maserati', ar:'مازيراتي', en:'Maserati', source:'quiz', size:[640,426], crop:[250,80,145,195]},
  {id:'mercedes-benz', ar:'مرسيدس بنز', en:'Mercedes-Benz', source:'quiz', size:[1920,1080], crop:[660,90,610,600]},
  {id:'polestar', ar:'بولستار', en:'Polestar', source:'quiz', size:[1366,768], crop:[425,120,520,535]},
  {id:'tesla', ar:'تسلا', en:'Tesla', source:'quiz', size:[640,426], crop:[180,24,280,285]}
 ];
 const $ = id => document.getElementById(id);
 const intro = $('quiz-intro'), playing = $('quiz-playing'), result = $('quiz-result');
 const logo = $('quiz-logo'), options = $('quiz-options'), counter = $('quiz-counter');
 const symbol = $('quiz-symbol');
 const timer = $('quiz-timer'), progress = $('quiz-progress'), feedback = $('quiz-feedback');
 let rounds = [], index = 0, correct = 0, deadline = 0, tick = null, next = null;
 let selected = null, locked = false, finished = false, resultTimedOut = false;
 const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ar';
 const copy = (ar,en) => lang() === 'ar' ? ar : en;
 const shuffle = items => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
 };
 function makeRounds() {
  return shuffle(brands).slice(0,15).map(brand => ({
   brand,
   choices:shuffle([brand,...shuffle(brands.filter(item => item.id !== brand.id)).slice(0,3)])
  }));
 }
 function show(view) {
  intro.hidden = view !== intro;
  playing.hidden = view !== playing;
  result.hidden = view !== result;
 }
 function updateTimer() {
  if (finished) return;
  const remaining = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
  timer.textContent = `${String(Math.floor(remaining / 60)).padStart(2,'0')}:${String(remaining % 60).padStart(2,'0')}`;
  timer.classList.toggle('is-urgent', remaining <= 10);
  if (remaining === 0) finish(true);
 }
 function renderQuestion() {
  const round = rounds[index];
  counter.textContent = copy(`السؤال ${index+1} من ١٥`,`Question ${index+1} of 15`);
  $('quiz-question').textContent = copy('أي ماركة يمثل هذا الشعار؟','Which marque does this emblem represent?');
  const [imageWidth,imageHeight] = round.brand.size;
  const [x,y,width,height] = round.brand.crop;
  const scale = Math.min(245 / width, 155 / height);
  symbol.style.width = `${width * scale}px`;
  symbol.style.height = `${height * scale}px`;
  logo.style.width = `${imageWidth * scale}px`;
  logo.style.height = `${imageHeight * scale}px`;
  logo.style.left = `${-x * scale}px`;
  logo.style.top = `${-y * scale}px`;
  logo.src = `assets/${round.brand.source}/${round.brand.id}.png`;
  logo.alt = copy('شعار سيارة للتعرّف عليه','Car emblem to identify');
  logo.className = `quiz-logo-${round.brand.id}`;
  progress.replaceChildren(...rounds.map((_,i) => {
   const segment = document.createElement('span');
   segment.className = i < index ? 'done' : i === index ? 'current' : '';
   return segment;
  }));
  options.replaceChildren(...round.choices.map(choice => {
   const button = document.createElement('button');
   button.type = 'button';
   button.className = 'quiz-option';
   button.textContent = choice[lang()];
   if (locked) {
    button.disabled = true;
    if (choice.id === round.brand.id) button.classList.add('is-correct');
    else if (choice.id === selected) button.classList.add('is-wrong');
   }
   button.addEventListener('click',() => answer(choice.id));
   return button;
  }));
  feedback.textContent = locked ? (selected === round.brand.id ? copy('إجابة صحيحة!','Correct!') : copy('إجابة غير صحيحة','Not quite')) : '';
 }
 function answer(id) {
  if (locked || finished) return;
  if (performance.now() >= deadline) { finish(true); return; }
  locked = true;
  selected = id;
  if (id === rounds[index].brand.id) correct++;
  renderQuestion();
  if (index === 14) { finish(false); return; }
  next = setTimeout(() => {
   next = null;
   if (finished) return;
   if (performance.now() >= deadline) { finish(true); return; }
   index++;
   locked = false; selected = null;
   renderQuestion();
  }, 360);
 }
 function renderResult() {
  const won = !resultTimedOut && index === 14 && correct === 15;
  $('quiz-result-icon').textContent = won ? '✦' : resultTimedOut ? '⌛' : '↗';
  $('quiz-result-title').textContent = won ? copy('مبروك! أجبت عن الكل.','Congratulations! A perfect run.') : resultTimedOut ? copy('انتهى الوقت.','Time is up.') : copy('أكملت التحدي.','Challenge complete.');
  $('quiz-result-score').textContent = copy(`${correct} / ١٥ إجابة صحيحة`,`${correct} / 15 correct answers`);
  $('quiz-result-copy').textContent = won
   ? copy('تأهلت مبدئيًا لجلسة تصوير مجانية داخل المعرض. تواصل مع فريق DAZZLE لتأكيد النتيجة وترتيب الموعد.','You have provisionally qualified for a complimentary photoshoot in the showroom. Contact DAZZLE to verify your result and arrange a date.')
   : copy('للتأهل، تحتاج إلى ١٥ إجابة صحيحة خلال دقيقة واحدة. جرّب مرة أخرى!','To qualify, answer all 15 correctly within one minute. Try again!');
 }
 function finish(timedOut) {
  if (finished) return;
  finished = true;
  resultTimedOut = timedOut;
  clearInterval(tick);
  clearTimeout(next);
  timer.textContent = timedOut ? '00:00' : timer.textContent;
  renderResult();
  show(result);
 }
 function start() {
  clearInterval(tick); clearTimeout(next);
  rounds = makeRounds(); index = 0; correct = 0; locked = false; finished = false; selected = null;
  deadline = performance.now() + 60000;
  show(playing);
  renderQuestion(); updateTimer();
  tick = setInterval(updateTimer,100);
 }
 $('quiz-start').addEventListener('click',start);
 $('quiz-retry').addEventListener('click',start);
 document.addEventListener('visibilitychange',() => { if (!document.hidden && !finished && !playing.hidden) updateTimer(); });
 window.addEventListener('dazzle-language',() => {
  if (!playing.hidden && !finished) renderQuestion();
  if (!result.hidden && finished) renderResult();
 });
})();
