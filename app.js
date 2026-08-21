gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu');
const frames = [...document.querySelectorAll('.story-frame')];
const frameStack = document.querySelector('.frame-stack');

const heroCopy = document.querySelector('#heroCopy');
const storyCard = document.querySelector('#storyCard');
const storyNumber = document.querySelector('#storyNumber');
const storyTitle = document.querySelector('#storyTitle');
const storyText = document.querySelector('#storyText');
const heroFinal = document.querySelector('#heroFinal');
const heroDarken = document.querySelector('#heroDarken');
const scrollCue = document.querySelector('#scrollCue');
const storyProgress = document.querySelector('#storyProgress');
const preloader = document.querySelector('#preloader');

const storySteps = [
  {
    number:'01 / 06',
    title:'Üres tér',
    text:'Minden a tervezéssel kezdődik. A hely még üres, de a rendszer már fejben összeállt.'
  },
  {
    number:'02 / 06',
    title:'Elektromos hálózat',
    text:'Megjelennek a nyomvonalak, az elosztás és a teljes rendszer gerince.'
  },
  {
    number:'03 / 06',
    title:'Szerelvények',
    text:'A vezetékek eltűnnek, a kapcsolók, konnektorok és vezérlők a helyükre kerülnek.'
  },
  {
    number:'04 / 06',
    title:'Világítás & Smart Home',
    text:'Spotok, LED-vonalak, TV-fal és intelligens vezérlés egészíti ki a rendszert.'
  },
  {
    number:'05 / 06',
    title:'Élettér',
    text:'A technika háttérbe húzódik, és a helyiség valódi otthonná válik.'
  },
  {
    number:'06 / 06',
    title:'Kész rendszer',
    text:'A végén már nem kábeleket és kapcsolókat látsz. Csak azt érzed, hogy minden működik.'
  }
];

let target = 0;
let current = 0;
let activeStep = -1;
let rafId = null;

const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v));
const smoothstep = t => {
  t = clamp(t);
  return t*t*(3-2*t);
};

menu.addEventListener('click', () => {
  const isOpen = header.classList.toggle('open');
  menu.setAttribute('aria-expanded',String(isOpen));
});

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    header.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
  });
});

addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scrollY > 30);
}, {passive:true});

function changeStoryText(index){
  if(index === activeStep) return;
  activeStep = index;

  const data = storySteps[index];

  gsap.killTweensOf([storyNumber,storyTitle,storyText]);

  gsap.to([storyNumber,storyTitle,storyText],{
    opacity:0,
    y:7,
    duration:.12,
    stagger:.018,
    overwrite:true,
    onComplete:()=>{
      storyNumber.textContent = data.number;
      storyTitle.textContent = data.title;
      storyText.textContent = data.text;

      gsap.fromTo(
        [storyNumber,storyTitle,storyText],
        {opacity:0,y:7},
        {
          opacity:1,
          y:0,
          duration:.3,
          stagger:.035,
          ease:'power2.out',
          overwrite:true
        }
      );
    }
  });
}

function renderStory(p){
  storyProgress.style.transform = `scaleX(${p})`;

  const heroOut = smoothstep((p-.015)/.12);
  heroCopy.style.opacity = 1 - heroOut;

  heroCopy.style.transform = `translate(-50%,calc(-50% - ${heroOut*24}px))`;

  scrollCue.style.opacity = 1 - smoothstep((p-.02)/.09);

  const seq = clamp(p/.91) * (frames.length - 1);
  const base = Math.floor(seq);
  const next = Math.min(base + 1, frames.length - 1);
  const local = smoothstep(seq - base);

  const scale = 1.032 - p*.018;
  const x = (p-.5)*-5;
  const y = (p-.5)*-2;
  frameStack.style.transform = `scale(${scale}) translate3d(${x}px,${y}px,0)`;

  frames.forEach((frame,i)=>{
    let opacity = 0;

    if(i === base) opacity = 1-local;
    if(i === next) opacity = Math.max(opacity,local);
    if(base === next && i === base) opacity = 1;

    frame.style.opacity = opacity;
  });

  const cardIn = smoothstep((p-.10)/.06);
  const cardOut = smoothstep((p-.84)/.075);

  storyCard.style.opacity = cardIn*(1-cardOut);
  storyCard.style.transform = `translateY(${(1-cardIn)*12 + cardOut*9}px)`;

  const index = Math.min(
    storySteps.length-1,
    Math.floor(clamp(p/.91) * storySteps.length)
  );

  changeStoryText(index);

  const finalIn = smoothstep((p-.88)/.105);

  heroFinal.style.opacity = finalIn;
  heroFinal.style.transform = `translate(-50%,calc(-43% + ${(1-finalIn)*20}px))`;
  heroDarken.style.opacity = finalIn*.95;
}

ScrollTrigger.create({
  trigger:'#experienceStage',
  start:'top top',
  end:()=>'+=' + innerHeight*7.2,
  pin:true,
  pinSpacing:true,
  anticipatePin:1,
  invalidateOnRefresh:true,
  onUpdate:self=>{
    target = self.progress;
    startStoryLoop();
  }
});

function storyLoop(){
  current += (target-current)*.14;

  if(Math.abs(target-current) < .00015){
    current = target;
    renderStory(current);
    rafId = null;
    return;
  }

  renderStory(current);
  rafId = requestAnimationFrame(storyLoop);
}

function startStoryLoop(){
  if(rafId === null){
    rafId = requestAnimationFrame(storyLoop);
  }
}

async function preloadFrames(){
  await Promise.all(
    frames.map(img=>{
      if(img.complete && img.naturalWidth) return Promise.resolve();

      return new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
      });
    })
  );

  preloader.classList.add('done');
  renderStory(0);

  setTimeout(()=>ScrollTrigger.refresh(),80);
}

preloadFrames();

/* GENERAL REVEALS */
const revealTargets = document.querySelectorAll(
  '.reveal-block:not(.service-lines article):not(.process-flow article):not(.review-cards article):not(.faq-grid details)'
);

revealTargets.forEach(el=>{
  gsap.from(el,{
    y:48,
    scale:.975,
    opacity:0,
    filter:'blur(9px)',
    duration:1.05,
    ease:'expo.out',
    clearProps:'filter',
    scrollTrigger:{
      trigger:el,
      start:'top 90%',
      once:true
    }
  });
});

const animatedGroups = [
  {selector:'.service-lines',x:-28,y:12,stagger:.075},
  {selector:'.process-flow',x:0,y:48,stagger:.12},
  {selector:'.review-cards',x:0,y:52,stagger:.13},
  {selector:'.faq-grid',x:0,y:32,stagger:.08}
];

animatedGroups.forEach(config=>{
  const group = document.querySelector(config.selector);
  if(!group) return;

  gsap.from([...group.children],{
    x:config.x,
    y:config.y,
    scale:.94,
    opacity:0,
    filter:'blur(8px)',
    duration:1,
    stagger:config.stagger,
    ease:'back.out(1.25)',
    clearProps:'filter',
    scrollTrigger:{
      trigger:group,
      start:'top 87%',
      once:true
    }
  });
});

gsap.from('.process-flow i',{
  scale:0,
  rotate:-90,
  duration:.55,
  stagger:.13,
  ease:'back.out(2)',
  scrollTrigger:{
    trigger:'.process-flow',
    start:'top 78%',
    once:true
  }
});

gsap.fromTo('.film-copy',
  {y:30},
  {
    y:-30,
    ease:'none',
    scrollTrigger:{
      trigger:'.site-film',
      start:'top bottom',
      end:'bottom top',
      scrub:.5
    }
  }
);

/* VIDEO: only decode while the film is near the viewport */
const siteVideo = document.querySelector('.site-film video');

if(siteVideo){
  const videoObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        siteVideo.play().catch(()=>{});
      }else{
        siteVideo.pause();
      }
    });
  },{rootMargin:'200px 0px'});

  videoObserver.observe(siteVideo);
}

/* FORM DEMO */
document.querySelector('#contactForm').addEventListener('submit',event=>{
  event.preventDefault();

  const toast = document.querySelector('#toast');
  toast.classList.add('show');

  setTimeout(()=>{
    toast.classList.remove('show');
  },2600);
});

addEventListener('resize',()=>{
  ScrollTrigger.refresh();
},{passive:true});
