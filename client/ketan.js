(function(){
  'use strict';
  const apiBase=(localStorage.getItem('fsApi')||'http://localhost:5000/api').replace(/\/$/,'');
  const langEl=document.getElementById('ketanLanguage');
  const input=document.getElementById('ketanInput');
  const messages=document.getElementById('ketanMessages');
  const form=document.getElementById('ketanForm');
  const mic=document.getElementById('ketanMic');
  const bigVoice=document.getElementById('ketanBigVoice');
  const bigLabel=document.getElementById('ketanBigVoiceLabel');
  const status=document.getElementById('ketanVoiceStatus');
  const typing=document.getElementById('ketanTyping');
  if(!form||!messages)return;

  let recognition=null, listening=false;
  let currentLang=localStorage.getItem('ketanLanguage')||localStorage.getItem('ketanLang')||'hinglish';
  if(langEl){
    if(!['en','hi','hinglish'].includes(currentLang)) currentLang='hinglish';
    langEl.value=currentLang;
  }
  let farmerContext=null;

  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function normalize(s){return String(s||'').toLowerCase().trim().replace(/[^\p{L}\p{M}\p{N}\s]/gu,' ').replace(/\s+/g,' ');}
  function tokens(s){return normalize(s).split(' ').filter(x=>x.length>1)}

  // Lightweight language detection for Roman Hindi vs English vs Devanagari Hindi
  function detectLanguage(text){
    const str=String(text||'').trim();
    if(!str) return 'en';
    if(/[\u0900-\u097F]/.test(str)) return 'hi';

    const norm=normalize(str);
    const words=norm.split(' ').filter(w=>w.length>0);

    const hinglishKeywords=new Set([
      'mera','meri','mere','aap','apka','aapka','aapke','aapki','apni','apne',
      'kaise','kya','kab','kahan','kitna','kitni','kaunsa','kaunsi','hota','hoti','hote',
      'hai','hain','hoga','hogi','honge','karna','karni','karne','karein','karu','karoon',
      'chahiye','milega','milegi','batao','dikhao','paisa','fasal','kheti','kisaan',
      'mandi','gaadi','bhejna','lena','dena','sakta','sakti','sakte','wali','wala',
      'bhai','pehle','jaakar','khata','paise','samajh','aaya','aayega','nahi','nhi','nhn',
      'aur','bhi','par','mein','me','se','ko','tak','ne','toh','ya','dhundun'
    ]);

    let matchCount=0;
    for(const w of words){
      if(hinglishKeywords.has(w)) matchCount++;
    }
    if(matchCount>=1) return 'hinglish';
    return 'en';
  }

  // Centralized response language decision logic
  function resolveResponseLanguage(userText, selectedLang){
    if(selectedLang==='en') return 'en';
    if(selectedLang==='hi') return 'hi';
    if(selectedLang==='hinglish'){
      const det=detectLanguage(userText);
      if(det==='hi') return 'hi';
      return 'hinglish';
    }
    return 'hinglish';
  }

  function score(intent,ts,raw){
    let sc=0, n=ts.join(' ');
    const rawLower=String(raw||'').toLowerCase();
    const rawNorm=normalize(raw);
    for(const k of (intent.keywords||[])){
      const q=normalize(k);
      if(q && (n.includes(q) || rawLower.includes(String(k).toLowerCase()) || rawNorm.includes(q))) sc+=q.split(' ').length*3;
      else for(const t of ts) if(t===q||q.includes(t)||t.includes(q)) sc+=1;
    }
    for(const p of (intent.phrases||[])){
      const q=normalize(p);
      if(q && (n.includes(q) || rawLower.includes(String(p).toLowerCase()) || rawNorm.includes(q))) sc+=4;
    }
    return sc;
  }

  function fallback(q, resLang){
    const kb=window.KETAN_KB||[];
    const ts=tokens(q);
    if(!ts.length && !String(q||'').trim()){
      if(resLang==='hi') return {response:'कृपया अपना सवाल दोबारा लिखें या बोलकर पूछें।'};
      if(resLang==='hinglish') return {response:'Kripya apna sawal dobara likhein ya mic se poochhein.'};
      return {response:'Please ask your question again or use the microphone.'};
    }
    let best=null, bs=0;
    for(const i of kb){
      const s=score(i,ts,q);
      if(s>bs){bs=s;best=i}
    }
    if(best && bs>0){
      // Adapt response to target language if needed
      let resp=best.response;
      if(resLang==='hi' && best.response_hi) resp=best.response_hi;
      else if(resLang==='en' && best.response_en) resp=best.response_en;
      return {response:resp, action:best.action, source:'fallback'};
    }
    if(resLang==='hi') return {response:'मैं टोकन, कतार, खरीद केंद्र, स्लॉट, फसल, परिवहन और भुगतान जैसे Fasal Setu सवालों में मदद कर सकता हूँ।', source:'fallback'};
    if(resLang==='hinglish') return {response:'Main token, queue, procurement centre, slot, crop, transport aur payment jaise Fasal Setu sawalon mein madad kar sakta hoon.', source:'fallback'};
    return {response:'I can help with Fasal Setu questions about tokens, queues, centres, slots, crops, transport and payments.', source:'fallback'};
  }

  async function dapi(path){
    const token=localStorage.getItem('fsToken');
    const h={'Content-Type':'application/json'};
    if(token) h.Authorization='Bearer '+token;
    const r=await fetch(apiBase+path,{headers:h});
    let d={};try{d=await r.json()}catch{}
    if(!r.ok) throw new Error(d.message||'Request failed');
    return d;
  }

  async function loadContext(){
    try{
      const [st,pr]=await Promise.all([dapi('/farmer/status'),dapi('/farmer/profile')]);
      farmerContext={status:st.data||{},profile:pr.data||{}};
    }catch(e){farmerContext=null;}
  }

  function dynamicAnswer(q, resLang){
    const raw=String(q||'').toLowerCase();
    const n=normalize(q);
    const d=farmerContext?.status||{}, u=farmerContext?.profile||{};
    const queue=d.queue, pays=d.payments||[];

    // Quality check
    if(/quality|क्वालिटी|गुणवत्ता|check|चेक|जांच|grain|ग्रेन/i.test(raw) || /quality|क्वालिटी|गुणवत्ता|check|चेक|जांच|grain|ग्रेन/i.test(n)){
      if(resLang==='hi') return {response:'फसल की क्वालिटी चेक करने के लिए AI Grain Quality Check सेक्शन खोलें और अपनी फसल की फोटो अपलोड करें। AI सिस्टम आपको नमी, दाने का आकार और ग्रेड की रिपोर्ट देगा।', action:'quality'};
      if(resLang==='hinglish') return {response:'Crop ki quality check karne ke liye AI Grain Quality Check section open karein aur crop ki clear photo upload karein. System moisture aur grade report show karega.', action:'quality'};
      return {response:'Open AI Grain Quality Check section to upload a photo of your crop for instant quality and moisture analysis.', action:'quality'};
    }

    // Token / Queue status
    if(/token|टोकन|meri bari|बारी/i.test(raw) || /token|टोकन|meri bari|बारी/i.test(n)){
      if(queue?.token){
        if(resLang==='hi') return {response:`आपका वर्तमान टोकन ${queue.token} है। स्थिति: ${queue.status||'प्रतीक्षा'}, आपसे पहले ${Math.max(0,(queue.position||1)-1)} किसान हैं।`, action:'queue'};
        if(resLang==='hinglish') return {response:`Aapka current token ${queue.token} hai. Status: ${queue.status||'Waiting'}, aapse pehle ${Math.max(0,(queue.position||1)-1)} farmer(s) hain.`, action:'queue'};
        return {response:`Your current token is ${queue.token}. Status: ${queue.status||'waiting'}, with ${Math.max(0,(queue.position||1)-1)} farmer(s) ahead of you.`, action:'queue'};
      }
    }

    // Payment status
    if(/payment|भुगतान|paisa|पैसा|credit|क्रेडिट/i.test(raw) || /payment|भुगतान|paisa|पैसा|credit|क्रेडिट/i.test(n)){
      if(pays.length){
        const p=pays[0];
        if(resLang==='hi') return {response:`आपके भुगतान की वर्तमान स्थिति ${p.status||'Pending'} है। विवरण के लिए अपने Payments सेक्शन में देखें।`, action:'payments'};
        if(resLang==='hinglish') return {response:`Aapke latest payment ki status ${p.status||'Pending'} hai. Details ke liye Payments section open karein.`, action:'payments'};
        return {response:`Your latest payment status is ${p.status||'Pending'}. Open Payments in your dashboard for details.`, action:'payments'};
      }
    }

    // Queue wait
    if(/queue|कतार|wait|प्रतीक्षा|farmers ahead|आगे किसान/i.test(raw) || /queue|कतार|wait|प्रतीक्षा|farmers ahead|आगे किसान/i.test(n)){
      if(queue){
        if(resLang==='hi') return {response:`आपकी कतार स्थिति ${queue.status||'Waiting'} है। ${Math.max(0,(queue.position||1)-1)} किसान आगे हैं और अनुमानित प्रतीक्षा ${queue.estimatedWait||0} मिनट है।`, action:'queue'};
        if(resLang==='hinglish') return {response:`Aapki queue status ${queue.status||'Waiting'} hai. ${Math.max(0,(queue.position||1)-1)} farmer(s) aage hain aur estimated wait ${queue.estimatedWait||0} minutes hai.`, action:'queue'};
        return {response:`Your queue status is ${queue.status||'Waiting'}. There are ${Math.max(0,(queue.position||1)-1)} farmer(s) ahead and estimated wait is ${queue.estimatedWait||0} minutes.`, action:'queue'};
      }
    }

    // Registered Crops
    if((/crop|फसल|fasal|फसलें/i.test(raw)||/crop|फसल|fasal|फसलें/i.test(n)) && (/my|meri|मेरी|registered|रजिस्ट/i.test(raw)||/my|meri|मेरी|registered|रजिस्ट/i.test(n))){
      const crops=u.crops||d.crops||[];
      if(crops.length){
        if(resLang==='hi') return {response:`आपकी प्रोफ़ाइल में ${crops.length} फसल रिकॉर्ड हैं। My Crops सेक्शन खोलकर पूरी जानकारी देखें।`, action:'crops'};
        if(resLang==='hinglish') return {response:`Aapki profile mein ${crops.length} registered crop record(s) hain. Details ke liye My Crops section open karein.`, action:'crops'};
        return {response:`Your profile has ${crops.length} registered crop record(s). Open My Crops to see details.`, action:'crops'};
      }
    }

    // Procurement Centre / Mandi
    if(/centre|center|केंद्र|mandi|मंडी|near me|पास/i.test(raw) || /centre|center|केंद्र|mandi|मंडी|near me|पास/i.test(n)){
      if(resLang==='hi') return {response:'नजदीकी खरीद केंद्र देखने के लिए Find Centre खोलें। वहां लाइव कतार और अनुमानित प्रतीक्षा भी देख सकते हैं।', action:'centres'};
      if(resLang==='hinglish') return {response:'Nearest procurement centre dekhne ke liye Find Centre section open karein. Wahan live queue aur wait time bhi dekh sakte hain.', action:'centres'};
      return {response:'Open Find Centre to view procurement centres, queue information and estimated wait times.', action:'centres'};
    }

    // Slot Booking
    if(/slot|स्लॉट|booking|बुक|बुकिंग|बुकर/i.test(raw) || /slot|स्लॉट|booking|बुक|बुकिंग|बुकर/i.test(n)){
      if(resLang==='hi') return {response:'आप अपने Farmer Dashboard के Book Slot सेक्शन से procurement slot बुक कर सकते हैं। वहां केंद्र, फसल, मात्रा और अपनी पसंदीदा तारीख चुनें।', action:'booking'};
      if(resLang==='hinglish') return {response:'Aap apne Farmer Dashboard ke Book Slot section se procurement slot book kar sakte hain. Wahan centre, crop, quantity aur preferred date select karein.', action:'booking'};
      return {response:'You can book your procurement slot from the Book Slot section of your Farmer Dashboard. Select your centre, crop, quantity, and date.', action:'booking'};
    }

    // Transport / Trolley Booking
    if(/transport|trolley|ट्रॉली|परिवहन|transporter|गाड़ी/i.test(raw) || /transport|trolley|ट्रॉली|परिवहन|transporter|गाड़ी/i.test(n)){
      if(resLang==='hi') return {response:'पहले procurement slot बुक करें। उसके बाद Book Trolley में उपलब्ध transporter चुनकर अनुरोध भेज सकते हैं।', action:'trolley'};
      if(resLang==='hinglish') return {response:'Pehle procurement slot book karein. Phir Book Trolley section mein jaakar transporter select kar sakte hain.', action:'trolley'};
      return {response:'Book your procurement slot first. Then open Book Trolley to choose an available transporter.', action:'trolley'};
    }

    // MSP / Rates
    if(/msp|एमएसपी|support price|न्यूनतम समर्थन/i.test(raw) || /msp|एमएसपी|support price|न्यूनतम समर्थन/i.test(n)){
      if(resLang==='hi') return {response:'MSP यानी न्यूनतम समर्थन मूल्य सरकार द्वारा तय की गई गारंटीकृत कीमत है। MSP Calculator में अपनी फसल की मात्रा दर्ज करके अनुमानित कुल राशि देख सकते हैं।', action:'msp'};
      if(resLang==='hinglish') return {response:'MSP yani Minimum Support Price government dwara decide ki gayi guaranteed price hai. MSP Calculator mein apni crop quantity daalkar estimate dekh sakte hain.', action:'msp'};
      return {response:'MSP (Minimum Support Price) is the guaranteed minimum price set by the government. Use the MSP Calculator to estimate your total payout.', action:'msp'};
    }

    return null;
  }

  async function aiAnswer(q, resLang){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),9000);
    try{
      const token=localStorage.getItem('fsToken');
      const h={'Content-Type':'application/json'};
      if(token) h.Authorization='Bearer '+token;
      const r=await fetch(apiBase+'/public/ask',{
        method:'POST',
        headers:h,
        body:JSON.stringify({question:q, language:resLang, lang:resLang}),
        signal:controller.signal
      });
      let d={};try{d=await r.json()}catch{}
      if(r.ok&&d?.data?.answer) return {response:d.data.answer, language:d.data.language||resLang, source:'ai'};
      if(status&&d?.message) status.textContent=d.message;
    }catch(e){
      if(status) status.textContent=e.name==='AbortError'?'AI response timed out. Using KETAN offline help.':'AI server unavailable. Using KETAN offline help.';
    }finally{clearTimeout(timer)}
    return null;
  }

  function add(role,text){
    const el=document.createElement('div');
    el.className='ketan-message '+role;
    el.innerHTML=esc(text).replace(/\n/g,'<br>')+'<small>'+(role==='user'?'You':'KETAN')+'</small>';
    messages.appendChild(el);
    messages.scrollTop=messages.scrollHeight;
  }

  function navigate(action){
    const pages={crops:'crops.html',centres:'procurement-centres.html',queue:'live-status.html'};
    if(typeof window.showSection==='function'){
      if(action) setTimeout(()=>window.showSection(action),650);
      return;
    }
    if(pages[action]) setTimeout(()=>location.href=pages[action],650);
  }

  async function ask(q, speakResponse){
    q=String(q||'').trim();
    if(!q) return;

    const resLang=resolveResponseLanguage(q, currentLang);
    add('user',q);
    if(input) input.value='';
    if(typing) typing.hidden=false;

    if(localStorage.getItem('fsToken')) await loadContext();

    let result=dynamicAnswer(q, resLang);
    if(!result) result=fallback(q, resLang);

    if(result?.source!=='fallback' && result?.response){}
    else {
      const ai=await aiAnswer(q, resLang);
      if(ai) result=ai;
    }

    if(!result||!result.response){
      const defs={
        hi:'अभी AI सेवा उपलब्ध नहीं है। कृपया सवाल दोबारा पूछें।',
        hinglish:'Abhi AI service available nahi hai. Kripya sawal dobara poochhein.',
        en:'KETAN could not answer right now. Please try the question again.'
      };
      result={response:defs[resLang]||defs.hinglish};
    }

    if(typing) typing.hidden=true;
    add('assistant', result.response);
    if(result.action) navigate(result.action);
    if(speakResponse) speak(result.response, resLang);
  }

  // STT Speech recognition locale mapping
  function sttLanguageCode(){
    return (currentLang==='en')?'en-IN':'hi-IN';
  }

  function setListening(v){
    listening=v;
    mic?.classList.toggle('listening',v);
    bigVoice?.classList.toggle('listening',v);
    if(bigLabel) bigLabel.textContent=v?'Sun raha hoon…':'Tap and speak';
    if(status){
      if(v) status.textContent='Sun raha hoon… ab boliye.';
      else {
        if(currentLang==='hi') status.textContent='माइक्रोफ़ोन दबाकर हिंदी, हिंग्लिश या अंग्रेज़ी में बोलें।';
        else if(currentLang==='hinglish') status.textContent='Tap the microphone and speak in Hinglish, Hindi or English.';
        else status.textContent='Tap the microphone and speak in English, Hindi or Hinglish.';
      }
    }
  }

  function getBestVoice(targetLocale){
    if(!('speechSynthesis' in window)) return null;
    const voices=window.speechSynthesis.getVoices()||[];
    if(!voices.length) return null;

    let voice=voices.find(v=>v.lang===targetLocale || v.lang.replace('_','-')===targetLocale);
    if(!voice){
      const prefix=targetLocale.split('-')[0];
      voice=voices.find(v=>v.lang.startsWith(prefix));
    }
    if(!voice && targetLocale.startsWith('hi')){
      voice=voices.find(v=>v.name.toLowerCase().includes('hindi')||v.name.toLowerCase().includes('india'));
    }
    return voice||null;
  }

  // TTS Speech Synthesis output
  function speak(text, resLang){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const u=new SpeechSynthesisUtterance(text);
    const targetLocale=(resLang==='en')?'en-IN':'hi-IN';
    u.lang=targetLocale;

    const v=getBestVoice(targetLocale);
    if(v) u.voice=v;

    u.rate=0.95;
    u.pitch=1.0;
    u.onstart=()=>{ if(bigLabel) bigLabel.textContent='KETAN bol raha hai…'; };
    u.onend=()=>{ if(bigLabel) bigLabel.textContent='Tap and speak'; };
    window.speechSynthesis.speak(u);
  }

  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged=()=>{ window.speechSynthesis.getVoices(); };
  }

  async function startVoice(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){
      if(status) status.textContent='Voice input is not supported in this browser. Please use Microsoft Edge/Chrome on localhost or type your question.';
      return;
    }
    if(listening){
      try{recognition?.stop()}catch{}
      setListening(false);
      return;
    }
    window.speechSynthesis?.cancel();

    // Request stream permission safely without blocking SpeechRecognition initialization
    if(navigator.mediaDevices?.getUserMedia){
      try{
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        stream.getTracks().forEach(t=>t.stop());
      }catch(e){
        if(e.name==='NotAllowedError'){
          if(status) status.textContent='Microphone permission was denied. Click the lock icon near the address bar and allow Microphone, then try again.';
          return;
        }
      }
    }

    try{
      if(recognition) recognition.abort();
    }catch(e){}

    recognition=new SR();
    recognition.lang=sttLanguageCode();
    recognition.interimResults=true;
    recognition.maxAlternatives=3;
    recognition.continuous=false;

    let gotResult=false;
    recognition.onstart=()=>{gotResult=false; setListening(true);};
    recognition.onresult=e=>{
      let transcript='';
      for(let i=e.resultIndex;i<e.results.length;i++) transcript+=e.results[i][0].transcript;
      if(input&&transcript.trim()) input.value=transcript.trim();
      const last=e.results[e.results.length-1];
      if(last?.isFinal){
        gotResult=true;
        setListening(false);
        const q=transcript.trim();
        if(q) ask(q, true);
      }
    };
    recognition.onerror=e=>{
      setListening(false);
      const messages={
        'not-allowed':'Microphone permission was denied. Allow Microphone for this localhost site and try again.',
        'service-not-allowed':'Browser speech service is blocked. Allow speech recognition and try again.',
        'no-speech':'I could not hear you. Please speak after the microphone turns orange.',
        'audio-capture':'No microphone was found. Check your Windows microphone settings.',
        'network':'Speech recognition needs the browser speech service. Check your internet connection and try again.',
        'aborted':'Voice input stopped. Tap the microphone and speak again.'
      };
      if(status) status.textContent=messages[e.error]||('Voice recognition error: '+e.error+'. Please try again.');
    };
    recognition.onend=()=>{ if(!gotResult&&!listening) setListening(false); };
    try{
      recognition.start();
      if(status) status.textContent='Microphone is ready. Speak now…';
    }catch(e){
      setListening(false);
      if(status) status.textContent='Could not start the microphone. Please try again.';
    }
  }

  form.addEventListener('submit',e=>{e.preventDefault(); ask(input?.value, false);});
  mic?.addEventListener('click', startVoice);
  bigVoice?.addEventListener('click', startVoice);

  document.querySelectorAll('[data-ketan-action]').forEach(b=>b.addEventListener('click',()=>{
    const a=b.dataset.ketanAction;
    const q={
      crops:'Meri registered fasal dikhaiye',
      booking:'Slot kaise book karein?',
      centres:'Nearest procurement centre kahan hai?',
      token:'Token status batao',
      payments:'Mera payment status kya hai?',
      trolley:'Transport kaise book karein?'
    }[a];
    ask(q, false);
  }));

  if(langEl){
    langEl.addEventListener('change', ()=>{
      currentLang=langEl.value;
      localStorage.setItem('ketanLanguage', currentLang);
      localStorage.setItem('ketanLang', currentLang);
      if(status){
        if(currentLang==='hi') status.textContent='हिंदी चुनी गई है। माइक्रोफ़ोन दबाकर बोलें।';
        else if(currentLang==='hinglish') status.textContent='Hinglish selected. Tap the microphone to speak.';
        else status.textContent='English selected. Tap the microphone to speak.';
      }
    });
  }

  const widget=document.getElementById('ketanFloat');
  const toggle=document.getElementById('ketanWidgetToggle');
  const panel=document.getElementById('ketanWidgetPanel');
  const closeBtn=document.getElementById('ketanWidgetClose');

  function setOpen(open){
    if(!widget||!toggle) return;
    widget.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if(open){ setTimeout(()=>input?.focus(), 120); }
  }

  toggle?.addEventListener('click', ()=>setOpen(!widget.classList.contains('open')));
  closeBtn?.addEventListener('click', ()=>setOpen(false));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') setOpen(false); });

})();
