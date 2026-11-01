(function(){
'use strict';
const $=s=>document.querySelector(s), el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const SOL='DERDIAMANTLIEGTIMUHRWERK', WORDS=[3,7,5,2,7]; // DER DIAMANT LIEGT IM UHRWERK
const params=new URLSearchParams(location.search);
const KEY='kz_krimi_v1';
let st={done:{},open:{},sound:true};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s)st=Object.assign(st,s)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};

/* ---------- Geschenk ---------- */
let gift=null,giftOk=false;
try{const g=params.get('g');if(g){gift=kzDec(g)}}catch(e){}
const ready=(async()=>{if(gift&&gift.an&&gift.k){giftOk=(await kzSig(gift.an,gift.von||'',gift.m||''))===gift.k}
 if(giftOk){$('#giftline').textContent='Ein Fall für '+gift.an+(gift.von?'. Überreicht von '+gift.von+'.':'.');if(gift.m){const m=$('#giftmsg');m.textContent=gift.m+(gift.von?'\n\n'+gift.von:'');m.style.display='block'}st.act=1;save()}
 if(!st.act)$('#codebox').style.display='block'})();
async function access(){await ready;if(st.act)return true;const v=kzNormCode($('#code').value);if(v&&await kzSha(v)===KZ_H){st.act=1;save();$('#codebox').style.display='none';return true}
 SFX.no();toast(v?'Dieser Code stimmt nicht. Schau noch einmal in dein PDF.':'Bitte gib zuerst deinen Zugangscode ein.');$('#code').focus();return false}

/* ---------- Datum ---------- */
function berlin(){const p=new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());const o={};p.forEach(x=>o[x.type]=+x.value);return o}
const PROBE=params.get('probe')==='kz1891';
function unlocked(d){if(PROBE)return true;const b=berlin();if(b.month===12)return b.day>=d;if(b.month===1&&b.day<=31)return true;return false}
function todayNr(){const b=berlin();return b.month===12&&b.day<=24?b.day:0}

/* ---------- Audio ---------- */
let AC=null,master=null,amb=null;
function ac(){if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=st.sound?1:0;master.connect(AC.destination)}if(AC.state==='suspended')AC.resume();return AC}
function tone(f,d,type,v,t0){const c=ac(),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;const t=c.currentTime+(t0||0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.2,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.05)}
function noise(d,f,q,v,t0,type){const c=ac(),n=c.sampleRate*d,b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;const bf=c.createBiquadFilter();bf.type=type||'bandpass';bf.frequency.value=f;bf.Q.value=q||1;const g=c.createGain();const t=c.currentTime+(t0||0);g.gain.setValueAtTime(v||.2,t);g.gain.exponentialRampToValueAtTime(.0005,t+d);s.connect(bf);bf.connect(g);g.connect(master);s.start(t);return {s,bf}}
const SFX={
 tap(){tone(900,.05,'triangle',.06)},
 paper(){noise(.35,2500,.7,.25);noise(.25,5000,.8,.12,.12)},
 ribbon(){const c=ac();const r=noise(.7,800,2,.25);r.bf.frequency.exponentialRampToValueAtTime(4000,c.currentTime+.6)},
 seal(){tone(90,.35,'sine',.6);noise(.2,300,1,.4)},
 ok(){[523,659,784,1047].forEach((f,i)=>tone(f,.6,'triangle',.15,i*.09))},
 no(){tone(140,.3,'sawtooth',.12);tone(110,.35,'sawtooth',.1,.08)},
 key(){noise(.04,3000,3,.18);tone(1800,.02,'square',.03)},
 hoof(){noise(.08,900,4,.4);noise(.08,700,4,.3,.18)},
 tick(){noise(.03,4500,6,.12)},
 chime(){[0,.5,1,1.5].forEach((t,i)=>tone([392,330,294,196][i],1.8,'sine',.15,t))},
 flip(){noise(.5,1800,.6,.2)}
};
// Atmosphäre: Kaminknistern, Uhrticken, Wind
let ambOn=false,ambTimer=null;
function startAmb(){if(ambOn)return;ambOn=true;const c=ac();
 const n=c.sampleRate*4,b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=l*.995+(Math.random()*2-1)*.02;x[i]=l}
 const s=c.createBufferSource();s.buffer=b;s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=500;const g=c.createGain();g.gain.value=.5;s.connect(f);f.connect(g);g.connect(master);s.start();amb=g;
 ambTimer=setInterval(()=>{if(Math.random()<.5)noise(.02+Math.random()*.03,2000+Math.random()*3000,2,.04+Math.random()*.05);SFX.tick()},1000)}
const music=$('#music');music.volume=.16;
function setSound(on){st.sound=on;save();if(master)master.gain.value=on?1:0;music.muted=!on;$('#btn-sound').textContent=on?'🔊':'🔇'}

/* ---------- Schnee ---------- */
(function(){const cv=$('#snow'),cx=cv.getContext('2d');let W,H,fl=[];function rs(){W=cv.width=innerWidth*devicePixelRatio;H=cv.height=innerHeight*devicePixelRatio}rs();addEventListener('resize',rs);
 for(let i=0;i<70;i++)fl.push({x:Math.random(),y:Math.random(),r:Math.random()*2+.6,s:Math.random()*.4+.2,w:Math.random()*6});
 (function loop(t){cx.clearRect(0,0,W,H);cx.fillStyle='rgba(255,255,255,.75)';fl.forEach(p=>{p.y+=p.s/600;if(p.y>1.02)p.y=-.02;const x=(p.x+Math.sin(t/2000+p.w)*.01)*W;cx.beginPath();cx.arc(x,p.y*H,p.r*devicePixelRatio,0,7);cx.fill()});requestAnimationFrame(loop)})(0)})();

/* ---------- Navigation ---------- */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));const s=$(id);s.classList.add('on');s.scrollTop=0;$('#snow').style.display=(id==='#s-case'||id==='#s-akte'||id==='#s-final')?'none':'block'}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2600)}

/* ---------- Start und Intro ---------- */
$('#btn-start').onclick=()=>{ac();if(st.act)beginIntro();else access().then(ok=>ok&&beginIntro())};
function beginIntro(){SFX.paper();show('#s-intro');const v=$('#intro');v.currentTime=0;v.muted=!st.sound;v.play().catch(()=>{v.muted=true;v.play().catch(goDesk)});
 const lines=[[1.2,'Der Weihnachtsdiamant ist verschwunden.'],[4.6,'24 Tage. 24 Beweisstücke.'],[8,'Jeden Morgen eine neue Spur.'],[10.6,'']];
 const it=$('#intro-text');v.ontimeupdate=()=>{let txt='';lines.forEach(l=>{if(v.currentTime>=l[0])txt=l[1]});if(it.textContent!==txt)it.textContent=txt};
 v.onended=goDesk}
$('#btn-skip').onclick=goDesk;
function goDesk(){const v=$('#intro');v.pause();renderDesk();show('#s-desk');if(st.sound){music.play().catch(()=>{})}startAmb()}
$('#btn-sound').onclick=()=>{ac();setSound(!st.sound);if(st.sound)music.play().catch(()=>{})};
setSound(st.sound);
$('#btn-akte').onclick=()=>{SFX.paper();renderAkte();show('#s-akte')};
$('#btn-akte-back').onclick=()=>{SFX.paper();show('#s-desk')};

/* ---------- Schreibtisch ---------- */
function renderReport(box,big){box.innerHTML='';let i=0;WORDS.forEach(w=>{const g=el('div','word');for(let k=0;k<w;k++){const d=i+1;const s=el('div','slot',st.done[d]?SOL[i]:'');s.dataset.d=d;g.appendChild(s);i++}box.appendChild(g)})}
function renderDesk(){renderReport($('#report'));const g=$('#grid');g.innerHTML='';const td=todayNr();
 for(let d=1;d<=24;d++){const b=el('button','env');b.style.setProperty('--r',((d*37)%7-3)*.6+'deg');const u=unlocked(d);
  if(st.done[d])b.classList.add('open');else if(!u)b.classList.add('locked');if(d===td&&!st.done[d])b.classList.add('today');
  b.appendChild(el('span','num',d));b.appendChild(el('span','wax',st.done[d]?SOL[d-1]:(u?'KZ':'🔒')));
  b.onclick=()=>{if(!unlocked(d)){SFX.no();toast('Dieser Umschlag ist bis zum '+d+'. Dezember versiegelt.');return}SFX.tap();if(st.done[d]||st.open[d])openCase(d);else openEnv(d)};g.appendChild(b)}
 const n=Object.keys(st.done).length;$('#deskfoot').textContent=n===24?'Alle Beweisstücke gelöst. Öffne Umschlag 24 für das Finale.':n+' von 24 Beweisstücken gelöst. Jeden Tag im Dezember öffnet sich ein neuer Umschlag.'}

/* ---------- Umschlag mit Schleife ---------- */
let curDay=0;
const RB={C:[200,150],k:[200,150],p:null,t:0,free:false};
function rbDraw(){const [cx,cy]=RB.C,[kx,ky]=RB.k,set=(id,d)=>document.getElementById(id).setAttribute('d',d);
 const v1=`M200 -14 Q${(200+kx)/2} ${ky*0.45} ${kx} ${ky}`,v2=`M${kx} ${ky} Q${(200+kx)/2} ${ky+(314-ky)*0.55} 200 314`,h1=`M-14 150 Q${kx*0.45} ${(150+ky)/2} ${kx} ${ky}`,h2=`M${kx} ${ky} Q${kx+(414-kx)*0.55} ${(150+ky)/2} 414 150`;
 set('bv1',v1);set('bv2',v2);set('bh1',h1);set('bh2',h2);set('sv1',v1);set('sv2',v2);set('sh1',h1);set('sh2',h2);
 const t=RB.t,sc=1-0.8*Math.min(1,t);document.getElementById('loops').setAttribute('transform',`scale(${sc}) rotate(${t*25})`);
 document.getElementById('bowg').setAttribute('transform',`translate(${kx} ${ky})`);
 const p=RB.p||[kx+42,ky+92];const px=p[0]-kx,py=p[1]-ky;set('tailR',`M0 0 Q${px*0.4+10} ${py*0.6+18} ${px} ${py}`);
 set('tailL',`M0 0 Q${-18+t*6} ${36-t*10} ${-36+t*16} ${80-t*30}`)}
function openEnv(d){curDay=d;const e=$('#envelope');e.className='envelope';$('#rib').setAttribute('class','rib');RB.k=[200,150];RB.p=null;RB.t=0;RB.free=false;rbDraw();
 $('#env-hint').style.visibility='visible';$('#env-date').textContent=d+'. Dezember 1891';show('#s-env')}
(function(){const sv=$('#rib');let drag=false,last=0,lp=null;
 const toV=e=>{const r=sv.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*400,(p.clientY-r.top)/r.height*300]};
 const start=e=>{if(RB.free)return;ac();drag=true;sv.classList.add('dragging');move(e);e.preventDefault()};
 function move(e){if(!drag)return;const v=toV(e);const dx=v[0]-200,dy=v[1]-150,dist=Math.hypot(dx,dy);RB.t=Math.max(0,(dist-60)/150);
  const pull=Math.min(1,RB.t);RB.k=[200+dx*0.12*pull,150+dy*0.12*pull];RB.p=v;rbDraw();
  const now=performance.now();if(lp&&now-last>70){const sp=Math.hypot(v[0]-lp[0],v[1]-lp[1]);if(sp>3)noise(.07,500+dist*6,3,Math.min(.25,.04+sp/200));last=now}lp=v;
  if(navigator.vibrate&&RB.t>.7&&Math.random()<.08)navigator.vibrate(8);
  if(RB.t>=1)untie(v);e.preventDefault&&e.preventDefault()}
 function end(){if(!drag||RB.free)return;drag=false;sv.classList.remove('dragging');const k0=RB.k.slice(),p0=RB.p?RB.p.slice():null,t0=RB.t,T0=performance.now();
  (function spring(n){const u=Math.min(1,(n-T0)/550),o=1-Math.pow(1-u,3)*Math.cos(u*9)*1,w=Math.max(0,1-o);RB.k=[200+(k0[0]-200)*w,150+(k0[1]-150)*w];RB.t=t0*w;RB.p=p0?[RB.k[0]+42+(p0[0]-RB.k[0]-42)*w,RB.k[1]+92+(p0[1]-RB.k[1]-92)*w]:null;rbDraw();if(u<1)requestAnimationFrame(spring);else{RB.p=null;rbDraw()}})(T0)}
 function untie(v){if(RB.free)return;RB.free=true;drag=false;const e=$('#envelope');sv.classList.remove('dragging');sv.classList.add('free');$('#env-hint').style.visibility='hidden';
  SFX.ribbon();if(navigator.vibrate)navigator.vibrate([30,40,60]);
  const r=e.getBoundingClientRect();for(let i=0;i<16;i++){const s=el('div','sparkle');s.style.left=(r.left+r.width/2)+'px';s.style.top=(r.top+r.height/2)+'px';const a=Math.random()*6.28,d=60+Math.random()*90;s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),1000)}
  setTimeout(()=>SFX.seal(),300);setTimeout(()=>{SFX.paper();e.classList.add('opened')},1000);setTimeout(()=>{st.open[curDay]=1;save();openCase(curDay)},2500)}
 sv.addEventListener('touchstart',start,{passive:false});sv.addEventListener('mousedown',start);
 addEventListener('touchmove',move,{passive:false});addEventListener('mousemove',move);addEventListener('touchend',end);addEventListener('mouseup',end);})();
$('#btn-env-back').onclick=()=>{renderDesk();show('#s-desk')};

/* ---------- Beweisstück ---------- */
let typer=null;
function typeText(node,txt,cb){clearInterval(typer);node.innerHTML='';let i=0;const cur=el('span','cur','&nbsp;');node.appendChild(cur);
 typer=setInterval(()=>{if(i>=txt.length){clearInterval(typer);cur.remove();cb&&cb();return}cur.before(txt[i]);if(txt[i]!==' '&&i%2===0)SFX.key();i++},22);
 node.onclick=()=>{if(i<txt.length){clearInterval(typer);node.textContent=txt;cb&&cb()}}}
const norm=s=>(s||'').toUpperCase().replace(/Ä/g,'AE').replace(/Ö/g,'OE').replace(/Ü/g,'UE').replace(/ß/g,'SS').replace(/[^A-Z0-9]/g,'');
function openCase(d){curDay=d;const D=DAYS[d-1];show('#s-case');
 $('#c-date').textContent=d+'. Dezember 1891';$('#c-nr').textContent=d;$('#c-title').textContent=D.t;$('#c-q').textContent=D.q;$('#c-hint').textContent='';
 $('#c-stamp').classList.remove('on');const sv=$('#c-solved');sv.style.display='none';
 const W=$('#c-widget');W.innerHTML='';const A=$('#c-answer');A.innerHTML='';
 const ctx={d,D,submit:check,W,A,solved:!!st.done[d]};
 typeText($('#c-story'),D.s);
 (WIDGETS[D.w.k]||WIDGETS.none)(ctx);
 if(D.a&&!ctx.noInput){const inp=el('input');inp.placeholder=D.num?'Zahl':'Lösung';if(D.num)inp.inputMode='numeric';inp.autocomplete='off';inp.setAttribute('autocapitalize','characters');
  const b=el('button','btn','Prüfen');b.onclick=()=>check(inp.value);inp.onkeydown=e=>{if(e.key==='Enter')check(inp.value)};A.append(inp,b);ctx.input=inp}
 $('#btn-h1').onclick=()=>{SFX.paper();$('#c-hint').textContent='Inspektor Grimsby: '+D.h[0]};
 $('#btn-h2').onclick=()=>{SFX.paper();$('#c-hint').textContent='Inspektor Grimsby: '+D.h[1]};
 if(st.done[d])showSolved(false);
 function check(v){const ok=(D.a||[]).some(a=>norm(a)===norm(v))||(D.loose||[]).some(a=>norm(v).includes(norm(a)));
  if(ok){showSolved(true)}else{SFX.no();const p=$('.paper');p.classList.remove('shake');void p.offsetWidth;p.classList.add('shake');if(navigator.vibrate)navigator.vibrate([40,40,40]);toast('Das passt noch nicht. Schau dir die Spur noch einmal an.')}}
 ctx.check=check;
 function showSolved(fresh){const L=D.L;sv.innerHTML='<span class="stamp2">GELÖST</span>Dein Buchstabe:<b>'+L+'</b><br><span style="font-size:14px">'+D.how+'. Eingetragen in Feld '+d+' deines Ermittlungsberichts.</span>';sv.style.display='block';
  if(fresh){st.done[d]=1;save();SFX.seal();setTimeout(SFX.ok,250);if(navigator.vibrate)navigator.vibrate([20,60,20]);setTimeout(()=>sv.scrollIntoView({behavior:'smooth',block:'center'}),400)}
  if(d===24&&Object.keys(st.done).length===24){const fb=el('button','btn','Zum Finale');fb.style.marginTop='12px';fb.onclick=finale;sv.appendChild(el('br'));sv.appendChild(fb)}}}
$('#btn-case-back').onclick=()=>{SFX.paper();renderDesk();show('#s-desk');setTimeout(()=>{const s=document.querySelector('#report .slot[data-d="'+curDay+'"]');if(s&&st.done[curDay]){s.classList.add('new')}},300)};

/* ---------- Widgets ---------- */
function svgEl(t,a){const e=document.createElementNS('http://www.w3.org/2000/svg',t);for(const k in a)e.setAttribute(k,a[k]);return e}
function choice(ctx,opts,cols,render){const g=el('div','opts');g.style.gridTemplateColumns='repeat('+(cols||1)+',1fr)';opts.forEach(o=>{const b=el('button','opt');render?render(b,o):(b.innerHTML='<span class="lab">'+o[0]+'</span>'+o[1]);b.onclick=()=>{SFX.tap();g.querySelectorAll('.opt').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');ctx.check(o[0])};g.appendChild(b)});ctx.noInput=true;return g}
const WIDGETS={
 none(){},
 acro(ctx){const b=el('div','box news');b.appendChild(el('div','mast','THE EVENING CHRONICLE'));ctx.D.w.lines.forEach(l=>{const s=el('span','ln','<b>'+l[0]+'</b>'+l.slice(1));s.onclick=()=>{SFX.tap();s.classList.toggle('hl')};b.appendChild(s)});ctx.W.appendChild(b)},
 tracks(ctx){const s=svgEl('svg',{viewBox:'0 0 300 260',width:'100%'});s.style.background='#f4f7fb';s.style.borderRadius='6px';
  s.appendChild(svgEl('rect',{x:110,y:4,width:80,height:22,fill:'#3b2a1e'}));const t=svgEl('text',{x:150,y:19,'text-anchor':'middle',fill:'#fff','font-size':11,'font-family':'Special Elite'});t.textContent='SALONFENSTER';s.appendChild(t);
  const paths=[['R','M60 240 C 40 170, 120 150, 90 90 S 40 40, 30 20'],['E','M150 240 C 280 200, 290 120, 220 110 S 120 80, 150 30'],['A','M240 240 C 200 180, 130 190, 160 140 S 280 60, 270 20']];
  const gate=svgEl('rect',{x:20,y:236,width:260,height:6,fill:'#6b4a2e'});s.appendChild(gate);
  paths.forEach(([L,d])=>{const p=svgEl('path',{d,fill:'none',stroke:'#9aa7b6','stroke-width':6,'stroke-dasharray':'2 9','stroke-linecap':'round'});p.style.cursor='pointer';s.appendChild(p);
   const x=+d.split(' ')[0].slice(1),lab=svgEl('text',{x,y:256,'text-anchor':'middle','font-size':16,'font-family':'Special Elite',fill:'#8f1c20'});lab.textContent=L;s.appendChild(lab);
   const hit=svgEl('path',{d,fill:'none',stroke:'transparent','stroke-width':26});hit.style.cursor='pointer';s.appendChild(hit);
   hit.onclick=()=>{SFX.tap();const len=p.getTotalLength();const dot=svgEl('circle',{r:6,fill:'#8f1c20'});s.appendChild(dot);let t0=null;const step=ts=>{if(!t0)t0=ts;const k=Math.min(1,(ts-t0)/1800);const pt=p.getPointAtLength(len*k);dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);if(Math.floor(k*14)!==dot._k){dot._k=Math.floor(k*14);noise(.06,1200,3,.15)}if(k<1)requestAnimationFrame(step);else setTimeout(()=>dot.remove(),900)};requestAnimationFrame(step)}});
  ctx.W.appendChild(s)},
 morse(ctx){const M={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',R:'.-.',S:'...',T:'-',U:'..-',W:'.--'};
  const b=el('div','box');const lamp=el('div','lamp');const pb=el('button','btn','▶ Telegramm abspielen');pb.style.display='block';pb.style.margin='0 auto';
  pb.onclick=()=>{const c=ac();let t=0;const u=.12;ctx.D.w.word.split('').forEach(ch=>{M[ch].split('').forEach(sym=>{const d=sym==='.'?u:u*3;tone(640,d,'sine',.22,t);setTimeout(()=>lamp.classList.add('on'),t*1000);setTimeout(()=>lamp.classList.remove('on'),(t+d)*1000);t+=d+u});t+=u*3})};
  const tab=el('div','morse-tab');Object.keys(M).forEach(k=>tab.appendChild(el('div','',k+' '+M[k].replace(/\./g,'•').replace(/-/g,'–'))));
  b.append(lamp,pb,tab);ctx.W.appendChild(b)},
 clock(ctx){const w=ctx.D.w;let hh=12,mm=0;const s=svgEl('svg',{viewBox:'-120 -130 240 250',class:'clock'});
  s.appendChild(svgEl('rect',{x:-14,y:-128,width:28,height:22,rx:8,fill:'none',stroke:'#b8913f','stroke-width':6}));
  s.appendChild(svgEl('circle',{r:112,fill:'#b8913f'}));s.appendChild(svgEl('circle',{r:104,fill:'#f7efdc',stroke:'#7a5a26','stroke-width':2}));s.appendChild(svgEl('circle',{r:78,fill:'none',stroke:'#7a5a26','stroke-width':1}));
  const rom=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];const ringEls=[];
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const r1=svgEl('text',{x:Math.sin(a)*91,y:-Math.cos(a)*91+6,'text-anchor':'middle','font-size':17,'font-family':'Special Elite',fill:'#8f1c20'});r1.textContent=RING[i];s.appendChild(r1);ringEls.push(r1);
   const r2=svgEl('text',{x:Math.sin(a)*64,y:-Math.cos(a)*64+5,'text-anchor':'middle','font-size':12,'font-family':'Playfair Display',fill:'#2a1d14'});r2.textContent=rom[i];s.appendChild(r2)}
  const hH=svgEl('line',{x1:0,y1:0,x2:0,y2:-44,stroke:'#2a1d14','stroke-width':6,'stroke-linecap':'round'}),mH=svgEl('line',{x1:0,y1:0,x2:0,y2:-74,stroke:'#2a1d14','stroke-width':3.5,'stroke-linecap':'round'});
  s.append(hH,mH,svgEl('circle',{r:6,fill:'#b8913f'}));const lab=el('div','clockctl');
  function draw(){const ma=mm*6,ha=(hh%12)*30+mm*.5;mH.setAttribute('transform','rotate('+ma+')');hH.setAttribute('transform','rotate('+ha+')');ringEls.forEach((r,i)=>r.setAttribute('font-weight',i===mm/5?'700':'400'));ringEls.forEach((r,i)=>r.setAttribute('font-size',i===mm/5?22:17));lab.querySelector('span').textContent=(hh)+':'+String(mm).padStart(2,'0')+' Uhr'}
  lab.innerHTML='<button class="btn sm" data-a="h-">◀ h</button><span></span><button class="btn sm" data-a="h+">h ▶</button>';
  const lab2=el('div','clockctl');lab2.innerHTML='<button class="btn sm" data-a="m-">◀ min</button><button class="btn sm" data-a="m+">min ▶</button>';
  [lab,lab2].forEach(x=>x.onclick=e=>{const a=e.target.dataset.a;if(!a)return;if(a==='h+')hh=hh%12+1;if(a==='h-')hh=(hh+10)%12+1;if(a==='m+'){mm=(mm+5)%60;if(mm===0)hh=hh%12+1}if(a==='m-'){mm=(mm+55)%60;if(mm===55)hh=(hh+10)%12+1}SFX.tick();draw()});
  // Minutenzeiger ziehen
  let drag=false;const pos=e=>{const r=s.getBoundingClientRect(),p=e.touches?e.touches[0]:e;const x=p.clientX-(r.left+r.width/2),y=p.clientY-(r.top+r.height*130/250);let ang=Math.atan2(x,-y)*180/Math.PI;if(ang<0)ang+=360;const nm=Math.round(ang/30)%12*5;if(nm!==mm){if(mm>=45&&nm<=10)hh=hh%12+1;else if(mm<=10&&nm>=45)hh=(hh+10)%12+1;mm=nm;SFX.tick();draw()}};
  s.addEventListener('pointerdown',e=>{drag=true;pos(e)});addEventListener('pointermove',e=>{if(drag)pos(e)});addEventListener('pointerup',()=>drag=false);
  const go=el('button','btn','Buchstabe eintragen');go.style.display='block';go.style.margin='10px auto 0';go.onclick=()=>{if(hh===w.hh&&mm===w.mm)ctx.check('__OK__');else ctx.check('x')};
  ctx.D.a=['__OK__'];ctx.noInput=true;ctx.W.append(s,lab,lab2,go);draw()},
 coach(ctx){const w=ctx.D.w,g=el('div','coachgrid');let r=4,c=0;const cells=[];w.grid.forEach((row,ri)=>row.split('').forEach((ch,ci)=>{const d=el('div','',ch==='*'?'★':ch);g.appendChild(d);cells.push(d)}));
  const draw=()=>{cells.forEach(x=>x.classList.remove('car'));cells[r*5+c].classList.add('car')};
  const ar=el('div','arrows');ar.innerHTML='<span></span><button data-m="n">⬆</button><span></span><button data-m="w">⬅</button><button data-m="s">⬇</button><button data-m="e">➡</button>';
  ar.onclick=e=>{const m=e.target.dataset.m;if(!m)return;if(m==='n'&&r>0)r--;if(m==='s'&&r<4)r++;if(m==='w'&&c>0)c--;if(m==='e'&&c<4)c++;SFX.hoof();draw()};
  const stop=el('button','btn','Hier halten');stop.style.display='block';stop.style.margin='10px auto 0';stop.onclick=()=>ctx.check(r===w.target[0]&&c===w.target[1]?'__OK__':'x');
  const rs=el('button','btn ghost sm','Zurück zum Stern');rs.style.color='#2a1d14';rs.style.display='block';rs.style.margin='8px auto 0';rs.onclick=()=>{r=4;c=0;draw()};
  ctx.D.a=['__OK__'];ctx.noInput=true;ctx.W.append(g,ar,stop,rs);draw()},
 choice(ctx){ctx.W.appendChild(choice(ctx,ctx.D.w.opts,ctx.D.w.cols))},
 prints(ctx){const mk=(open,scar,whorl)=>{const s=svgEl('svg',{viewBox:'-30 -36 60 72',width:'100%'});s.appendChild(svgEl('ellipse',{rx:26,ry:33,fill:'#f2e6cf',stroke:'#c9b48a'}));
   for(let i=1;i<=7;i++){const k=i*3.4;if(whorl)s.appendChild(svgEl('ellipse',{rx:k,ry:k*1.25,fill:'none',stroke:'#3b2a1e','stroke-width':1.3}));else{const d=open>0?`M ${-k} ${k*1.6} L ${-k} ${-k*.2} A ${k} ${k} 0 0 1 ${k} ${-k*.2} L ${k} ${k*.4}`:`M ${k} ${k*1.6} L ${k} ${-k*.2} A ${k} ${k} 0 0 0 ${-k} ${-k*.2} L ${-k} ${k*.4}`;s.appendChild(svgEl('path',{d,fill:'none',stroke:'#3b2a1e','stroke-width':1.3}))}}
   if(scar)s.appendChild(svgEl('line',{x1:scar[0],y1:scar[1],x2:scar[0]+16,y2:scar[1]+11,stroke:'#f2e6cf','stroke-width':7,'stroke-linecap':'round'}));return s};
  const v=el('div','box');v.style.textAlign='center';v.innerHTML='<div class="kick" style="color:#8f1c20">Abdruck von der Vitrine</div>';const vs=mk(1,[-14,-6]);vs.style.width='90px';v.appendChild(vs);ctx.W.appendChild(v);
  const P=[['K',mk(-1,[-14,-6])],['M',mk(1,[-14,-6])],['S',mk(1,null)],['L',mk(0,null,1)],['P',mk(1,[6,10])],['B',mk(-1,null)]];
  const g=choice(ctx,P,3,(b,o)=>{b.style.textAlign='center';b.appendChild(o[1]);b.appendChild(el('div','lab',o[0]))});g.style.marginTop='10px';ctx.W.appendChild(g)},
 mirror(ctx){const w=el('div','mirror-wrap'),t=el('div','mirror-text',ctx.D.w.text);w.appendChild(t);const b=el('button','btn sm','🪞 Spiegel davorhalten');b.style.display='block';b.style.margin='10px auto 0';b.onclick=()=>{SFX.flip();t.classList.toggle('flip')};ctx.W.append(w,b)},
 scytale(ctx){const rows=ctx.D.w.rows,n=rows.length,L=rows[0].length;let band='';for(let c=0;c<L;c++)for(let r=0;r<n;r++)band+=rows[r][c];
  const bd=el('div','band',band);const stick=el('div','stick');const lab=el('div','kick','');lab.style.color='#2a1d14';lab.style.margin='10px 0 2px';const rg=el('input');rg.type='range';rg.min=2;rg.max=7;rg.value=2;
  const draw=()=>{const k=+rg.value;lab.textContent='Stockdicke: '+k;let out=[];for(let r=0;r<k;r++){let s='';for(let i=r;i<band.length;i+=k)s+=band[i];out.push('<span class="'+(r===0?'r0':'')+'">'+s+'</span>')}stick.innerHTML=out.join('\n')};
  rg.oninput=()=>{noise(.06,500,2,.15);draw()};ctx.W.append(el('div','kick','Das Papierband'),bd,lab,rg,stick);ctx.W.firstChild.style.color='#2a1d14';draw()},
 receipt(ctx){const r=el('div','receipt');r.innerHTML='<b>PFANDHAUS J. MORLEY</b><br><small>Drury Lane · London · Quittung Nr. 2417</small>';ctx.D.w.items.forEach(i=>r.appendChild(el('div','','<span>'+i[0]+'</span><span>'+i[1]+' Schilling</span>')));r.appendChild(el('div','','<span><b>Summe</b></span><span>?</span>'));ctx.W.append(r,numtab())},
 timetable(ctx){const t=el('table','tt');t.innerHTML='<tr><td colspan=3>ABFAHRT · Bahnhof Victoria</td></tr>';ctx.D.w.rows.forEach(r=>{const tr=el('tr');tr.innerHTML='<td>'+r[0]+'</td><td>'+r[1]+'</td><td>Gleis '+r[2]+'</td>';tr.onclick=()=>{SFX.tap();t.querySelectorAll('tr').forEach(x=>x.classList.remove('sel'));tr.classList.add('sel');ctx.check(r[0]==='9:15'&&r[1]==='Brighton'?'9':'x')};t.appendChild(tr)});ctx.noInput=true;ctx.W.append(t,numtab())},
 stretch(ctx){const w=el('div','stretch-wrap'),t=el('div','stretch-text',ctx.D.w.text);w.appendChild(t);const rg=el('input');rg.type='range';rg.min=0;rg.max=100;rg.value=0;
  const set=v=>{const k=1+(1-v/100)*7;t.style.transform='scaleX('+(1/k*1.0)+') scaleY('+k+')';t.style.filter='blur('+((1-v/100)*1.5)+'px)'};rg.oninput=()=>set(+rg.value);set(0);
  const tilt=el('button','btn ghost sm','📱 Handy kippen');tilt.style.color='#2a1d14';tilt.onclick=async()=>{try{if(DeviceOrientationEvent.requestPermission)await DeviceOrientationEvent.requestPermission()}catch(e){}addEventListener('deviceorientation',e=>{const b=Math.max(0,Math.min(90,e.beta||0));const v=Math.max(0,Math.min(100,(b-10)/60*100));rg.value=v;set(v)})};
  ctx.W.append(w,el('div','kick','Blickwinkel'),rg,tilt);ctx.W.children[1].style.color='#2a1d14'},
 chess(ctx){const b=el('div','chess');const P={e4:'♘',f6:'♙',h7:'♚',e1:'♔',a7:'♟',b7:'♟'};const files='abcdefgh';
  for(let r=8;r>=1;r--)for(let f=0;f<8;f++){const sq=files[f]+r;const d=el('div',(r+f)%2?'l':'d',P[sq]||'');d.appendChild(el('small','',sq));d.onclick=()=>{SFX.tap();b.querySelectorAll('div').forEach(x=>x.classList.remove('sel'));d.classList.add('sel');ctx.check(sq)};b.appendChild(d)}
  ctx.noInput=true;ctx.W.appendChild(b)},
 plan(ctx){const g=el('div','plan');ctx.D.w.rooms.forEach(([n,l])=>{const b=el('button','','<span>'+n+'</span><b>'+l+'</b>');if(n==='Halle')b.innerHTML='<span>'+n+'</span><b>'+l+'</b><span>⭐ Start</span>';b.onclick=()=>{SFX.tap();g.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');ctx.check(n)};g.appendChild(b)});ctx.noInput=true;ctx.W.appendChild(g)},
 search(ctx){const w=ctx.D.w,g=el('div','ws'),cells=[];w.grid.forEach((row,r)=>row.split('').forEach((ch,c)=>{const d=el('div','',ch);d.dataset.r=r;d.dataset.c=c;g.appendChild(d);cells.push(d)}));
  const wl=el('div','wl');const spans={};w.words.forEach(x=>{const s=el('span','',x);spans[x]=s;wl.appendChild(s)});let first=null;
  g.onclick=e=>{const d=e.target;if(!d.dataset.r)return;SFX.tap();if(!first){first=d;d.classList.add('a');return}
   const r1=+first.dataset.r,c1=+first.dataset.c,r2=+d.dataset.r,c2=+d.dataset.c;first.classList.remove('a');let word='',path=[];
   if(r1===r2||c1===c2){const dr=Math.sign(r2-r1),dc=Math.sign(c2-c1);let r=r1,c=c1;while(true){path.push(cells[r*8+c]);word+=w.grid[r][c];if(r===r2&&c===c2)break;r+=dr;c+=dc}}
   first=null;const hit=w.words.find(x=>x===word||x===word.split('').reverse().join(''));if(hit&&!spans[hit].classList.contains('x')){path.forEach(p=>p.classList.add('f'));spans[hit].classList.add('x');SFX.ok()}else SFX.no()};
  ctx.W.append(g,wl)},
 order(ctx){const ev=ctx.D.w.ev,g=el('div','opts order');let seq=[];const built=el('div','built','');
  ev.forEach(e=>{const b=el('button','opt','<span class="n"></span><span style="flex:1">'+e[1]+'</span><small>'+e[2]+'</small>');b.onclick=()=>{if(b.dataset.u)return;SFX.paper();b.dataset.u=1;seq.push(e[0]);b.querySelector('.n').textContent=seq.length;b.classList.add('sel');built.textContent=seq.join('');if(seq.length===ev.length){setTimeout(()=>{ctx.check(seq.join(''));if(seq.join('')!=='RUSS'){seq=[];built.textContent='';g.querySelectorAll('.opt').forEach(x=>{delete x.dataset.u;x.classList.remove('sel');x.querySelector('.n').textContent=''})}},400)}};g.appendChild(b)});
  ctx.noInput=true;ctx.W.append(g,built)},
 seals(ctx){const mk=n=>{const s=svgEl('svg',{viewBox:'-40 -40 80 80',width:90});s.appendChild(svgEl('circle',{r:36,fill:'#8f1c20'}));s.appendChild(svgEl('circle',{r:26,fill:'none',stroke:'#c8585c','stroke-width':2}));const t=svgEl('text',{y:8,'text-anchor':'middle','font-size':24,fill:'#f2c2b0','font-family':'Playfair Display'});t.textContent='★';s.appendChild(t);for(let i=0;i<n;i++){const a=i*2*Math.PI/5-Math.PI/2;s.appendChild(svgEl('circle',{cx:Math.cos(a)*31,cy:Math.sin(a)*31,r:3,fill:'#f2c2b0'}))}return s};
  const g=el('div','seals');[['O',5],['W',4],['F',5],['H',5]].forEach(([L,n])=>{const b=el('button');b.append(mk(n),el('span','',L));b.onclick=()=>{SFX.seal();g.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');ctx.check(L)};g.appendChild(b)});ctx.noInput=true;ctx.W.appendChild(g)},
 anagram(ctx){const w=ctx.D.w,box=el('div','letters'),built=el('div','built','');let cur='';
  w.letters.split('').forEach(L=>{const b=el('button','',L);b.onclick=()=>{if(b.classList.contains('used'))return;SFX.key();b.classList.add('used');cur+=L;built.textContent=cur+(cur.length===w.letters.length?w.suffix:'');if(cur.length===w.letters.length){setTimeout(()=>{ctx.check(cur);if(cur!=='EUSTON'){cur='';built.textContent='';box.querySelectorAll('button').forEach(x=>x.classList.remove('used'))}},500)}};box.appendChild(b)});
  ctx.noInput=true;ctx.W.append(box,built)},
 notes(ctx){const w=ctx.D.w;const F={C:262,D:294,E:330,F:349,G:392,A:440,H:494,c:523};const Y={C:110,D:105,E:100,F:95,G:90,A:85,H:80,c:75};
  const s=svgEl('svg',{viewBox:'0 40 320 90',class:'staff'});for(let i=0;i<5;i++)s.appendChild(svgEl('line',{x1:10,x2:310,y1:80+i*10-0,y2:80+i*10,stroke:'#3b2a1e'}));
  const clef=svgEl('text',{x:14,y:112,'font-size':52,fill:'#3b2a1e'});clef.textContent='𝄞';s.appendChild(clef);
  w.melody.forEach((n,i)=>{const x=80+i*48,y=Y[n]+0;if(n==='C')s.appendChild(svgEl('line',{x1:x-12,x2:x+12,y1:130,y2:130,stroke:'#3b2a1e'}));const g=svgEl('g',{});g.style.cursor='pointer';g.appendChild(svgEl('ellipse',{cx:x,cy:y,rx:8,ry:6,fill:'#3b2a1e',transform:'rotate(-20 '+x+' '+y+')'}));g.appendChild(svgEl('line',{x1:x+7,x2:x+7,y1:y,y2:y-32,stroke:'#3b2a1e','stroke-width':2}));g.appendChild(svgEl('rect',{x:x-16,y:40,width:32,height:90,fill:'transparent'}));g.onclick=()=>tone(F[n],1,'triangle',.3);s.appendChild(g)});
  const pl=el('button','btn sm','▶ Melodie spielen');pl.onclick=()=>w.melody.forEach((n,i)=>tone(F[n],.7,'triangle',.3,i*.45));
  const tab=el('div','notetab');w.table.forEach(([n,L])=>{const d=el('div','','<b>'+L+'</b><br>'+n);d.onclick=()=>tone(F[n],.8,'triangle',.3);tab.appendChild(d)});
  ctx.W.append(s,pl,el('div','kick','Notentafel: Buchstabe und Ton'),tab);ctx.W.children[2].style.cssText='color:#2a1d14;margin-top:10px'},
 watch(ctx){const box=el('div','watch');const s=svgEl('svg',{viewBox:'-110 -110 220 220'});s.appendChild(svgEl('circle',{r:104,fill:'#b8913f'}));s.appendChild(svgEl('circle',{r:96,fill:'#2b241c'}));
  const gear=(x,y,r,t,cls)=>{const g=svgEl('g',{class:'gear '+(cls||'')});let d='';for(let i=0;i<t;i++){const a=i/t*Math.PI*2,a2=(i+.5)/t*Math.PI*2;d+=(i?'L':'M')+(x+Math.cos(a)*r)+' '+(y+Math.sin(a)*r)+' L'+(x+Math.cos(a)*(r+7))+' '+(y+Math.sin(a)*(r+7))+' L'+(x+Math.cos(a2)*(r+7))+' '+(y+Math.sin(a2)*(r+7))+' L'+(x+Math.cos(a2)*r)+' '+(y+Math.sin(a2)*r)}g.appendChild(svgEl('path',{d:d+'Z',fill:'#d8b46a',stroke:'#7a5a26'}));g.appendChild(svgEl('circle',{cx:x,cy:y,r:r*.35,fill:'#2b241c'}));return g};
  s.append(gear(-30,-20,34,14),gear(38,-28,20,10,'r'),gear(28,40,26,12),gear(-36,50,12,9,'r'));
  const dia=svgEl('text',{x:-6,y:8,'font-size':22});dia.textContent='💎';dia.style.opacity=0;dia.style.transition='opacity 1s 1.4s';s.appendChild(dia);
  const lid=svgEl('svg',{viewBox:'-110 -110 220 220',class:'lid'});lid.appendChild(svgEl('circle',{r:104,fill:'#c9a24e',stroke:'#7a5a26','stroke-width':3}));lid.appendChild(svgEl('circle',{r:80,fill:'none',stroke:'#7a5a26'}));const lt=svgEl('text',{y:6,'text-anchor':'middle','font-family':'Special Elite','font-size':16,fill:'#5a3e1a'});lt.textContent='FAIRBANK & CO.';lid.appendChild(lt);
  const seal=svgEl('rect',{x:-40,y:88,width:80,height:16,fill:'#8f1c20'});lid.appendChild(seal);
  box.append(s,lid);const b=el('button','btn','Siegel brechen und aufklappen');b.style.display='block';b.style.margin='12px auto 0';b.onclick=()=>{SFX.seal();setTimeout(()=>{SFX.flip();box.classList.add('open');dia.style.opacity=1;setTimeout(SFX.chime,1500)},300);b.remove()};
  if(ctx.solved){box.classList.add('open');dia.style.opacity=1;b.remove()}ctx.W.append(box,b)}
};
function numtab(){const t=el('div','numtab');'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c,i)=>t.appendChild(el('div','',c+'<br>'+(i+1))));t.style.marginTop='12px';return t}

/* ---------- Akte ---------- */
function renderAkte(){const s=$('#suspects');s.innerHTML='';SUSPECTS.forEach(x=>s.appendChild(el('div','','<span class="ic">'+x.i+'</span><b>'+x.n+'</b>'+x.r)));const n=$('#numtab');n.replaceWith(Object.assign(numtab(),{id:'numtab'}))}

/* ---------- Finale ---------- */
function finale(){show('#s-final');renderReport($('#final-report'),true);SFX.chime();const l=$('#accuse-list');l.innerHTML='';$('#verdict').style.display='none';$('#accuse').style.display='block';
 SUSPECTS.forEach(x=>{const b=el('button','','<span class="ic">'+x.i+'</span><b>'+x.n+'</b>'+x.r);b.onclick=()=>{if(x.n!=='Silas Tolliver'){SFX.no();toast(x.n+' hat ein Alibi. Lies deinen Bericht noch einmal.');return}verdict()};l.appendChild(b)})}
function verdict(){SFX.seal();setTimeout(SFX.chime,300);$('#accuse').style.display='none';const v=$('#verdict');v.style.display='block';
 v.innerHTML='<div class="diamond">💎</div><h2>Fall gelöst!</h2><p class="story">Der Täter ist <b>Silas Tolliver</b>, der Uhrmacher. In der Nacht kam er mit seiner Werkzeugtasche zurück, öffnete die kaputte Standuhr und versteckte den Weihnachtsdiamanten im Uhrwerk. Darum tickte sie am Morgen wieder.</p><p class="story">Lady Ashcombe hält ihren Diamanten wieder in den Händen, und Inspektor Grimsby lässt ausrichten: Ohne dich hätte er diesen Fall nie gelöst.</p><video src="a/lupe.mp4" autoplay muted playsinline loop></video><p class="story" style="text-align:center"><b>Frohe Weihnachten, Ermittler!</b></p>'+(gift&&gift.von?'<p class="story" style="text-align:center">Diesen Fall hat dir '+esc(gift.von)+' geschenkt.</p>':'');
 for(let i=0;i<14;i++)setTimeout(()=>tone(800+Math.random()*900,.4,'sine',.06),i*120)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Direkt zum Schreibtisch, wenn schon gespielt
if(Object.keys(st.open).length&&!params.get('intro')){$('#btn-start').textContent='Weiter ermitteln';$('#btn-start').onclick=()=>{ac();if(st.act)goDesk();else access().then(ok=>ok&&goDesk())}}
})();
