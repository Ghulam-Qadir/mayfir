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

const contactForm=document.getElementById('contactForm');
const formStatus=document.getElementById('formStatus');
contactForm?.addEventListener('submit',(e)=>{
  e.preventDefault();
  if(!contactForm.checkValidity()){
    contactForm.reportValidity();
    formStatus.textContent='Please complete the required fields.';
    formStatus.className='error';
    return;
  }
  formStatus.textContent='Thank you. Your enquiry is ready to be submitted.';
  formStatus.className='success';
  contactForm.reset();
});
