const menu=document.querySelector('.menu'), mobile=document.querySelector('.mobile-nav');
menu?.addEventListener('click',()=>{const open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
document.querySelectorAll('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const quotes=[...document.querySelectorAll('.quote')];let qi=0;
function quote(n){qi=(n+quotes.length)%quotes.length;quotes.forEach((q,i)=>q.classList.toggle('active',i===qi))}
document.getElementById('qprev')?.addEventListener('click',()=>quote(qi-1));
document.getElementById('qnext')?.addEventListener('click',()=>quote(qi+1));
setInterval(()=>quote(qi+1),7000);

/* Home-page header behavior */
const siteHeader=document.querySelector('.site-header');
const progress=document.querySelector('.scroll-progress');
const menuToggle=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('#mobile-menu');

function updateHeader(){
  const y=window.scrollY||0;
  siteHeader?.classList.toggle('scrolled',y>30);
  if(progress){
    const max=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.transform=`scaleX(${max>0?y/max:0})`;
  }
}
window.addEventListener('scroll',updateHeader,{passive:true});
updateHeader();

menuToggle?.addEventListener('click',()=>{
  const open=mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
});
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mobileMenu.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded','false');
  menuToggle?.setAttribute('aria-label','Open navigation');
}));

/* Services — journey rail preview */
const rail=document.querySelector('.journey');
if(rail){
  const stage=rail.querySelector('.journey-stage');
  const stageImg=stage?.querySelector('img');
  const frameNo=stage?.querySelector('[data-role="index"]');
  const captionNo=stage?.querySelector('[data-role="count"]');
  const captionName=stage?.querySelector('[data-role="name"]');
  const railBar=stage?.querySelector('[data-role="rail"]');
  const items=[...rail.querySelectorAll('.journey-item')];

  const warmed=new Set();
  const warm=index=>{
    const item=items[index];
    const src=item?.querySelector('.journey-link')?.dataset.img;
    if(!src||warmed.has(src))return;
    warmed.add(src);
    const pre=new Image();
    pre.src=src;
  };

  let engaged=false;
  rail.addEventListener('pointerenter',()=>{engaged=true;warm(1)});
  rail.addEventListener('focusin',()=>{engaged=true;warm(1)});

  let swapTimer;
  const show=index=>{
    const item=items[index];
    if(!item)return;
    const link=item.querySelector('.journey-link');
    const src=link.dataset.img;

    items.forEach(el=>el.classList.toggle('is-active',el===item));
    if(frameNo)frameNo.textContent=link.dataset.no;
    if(captionNo)captionNo.textContent=link.dataset.no;
    if(captionName)captionName.textContent=link.dataset.name;
    if(railBar)railBar.style.width=((index+1)/items.length*100)+'%';
    if(engaged)warm(index+1);

    if(!stageImg||!src||stageImg.getAttribute('src')===src)return;
    stage.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer=setTimeout(()=>{
      stageImg.src=src;
      stageImg.alt=link.dataset.name+' preview';
    },170);
  };

  const clearSwap=()=>stage.classList.remove('is-swapping');
  stageImg?.addEventListener('load',clearSwap);
  stageImg?.addEventListener('error',clearSwap);

  items.forEach((item,index)=>{
    const link=item.querySelector('.journey-link');
    link?.addEventListener('mouseenter',()=>show(index));
    link?.addEventListener('focus',()=>show(index));
  });

  show(0);
}
