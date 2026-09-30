const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

window.addEventListener("load",()=>setTimeout(()=>$(".loader").classList.add("done"),700));

const nav=$(".nav");
window.addEventListener("scroll",()=>nav.classList.toggle("scrolled",scrollY>30));

const hamb=$(".hamb");
hamb?.addEventListener("click",()=>nav.classList.toggle("menu-open"));
$$(".nav nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("menu-open")));

const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!reduced){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");observer.unobserve(e.target)}})
  },{threshold:.12});
  $$(".reveal").forEach(el=>observer.observe(el));

  window.addEventListener("scroll",()=>{
    const y=scrollY;
    const bg=$(".hero-bg");
    if(bg) bg.style.transform=`translate3d(0,${y*.12}px,0) scale(1.04)`;
  });
  $$(".service-card").forEach(card=>{
    card.addEventListener("mousemove",e=>{
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${y*-3}deg) rotateY(${x*3}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave",()=>card.style.transform="");
  });
}

const ring=$(".cursor-ring"),dot=$(".cursor");
if(ring&&dot){
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+"px";dot.style.top=my+"px"});
  const loop=()=>{rx+=(mx-rx)*.14;ry+=(my-ry)*.14;ring.style.left=rx+"px";ring.style.top=ry+"px";requestAnimationFrame(loop)};loop();
  $$("a,button,.service-card,.fleet-stage").forEach(el=>{
    el.addEventListener("mouseenter",()=>ring.classList.add("hover"));
    el.addEventListener("mouseleave",()=>ring.classList.remove("hover"));
  });
}

$$(".magnetic").forEach(el=>{
  if(reduced)return;
  el.addEventListener("mousemove",e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.13}px,${(e.clientY-r.top-r.height/2)*.13}px)`});
  el.addEventListener("mouseleave",()=>el.style.transform="");
});

const counts=$$("[data-count]");
if(counts.length){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target,end=+el.dataset.count,start=0,duration=1100,t0=performance.now();
      const tick=t=>{const p=Math.min((t-t0)/duration,1);el.textContent=Math.floor(start+(end-start)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)};
      requestAnimationFrame(tick);obs.unobserve(el);
    })
  },{threshold:.8});
  counts.forEach(c=>obs.observe(c));
}

$("#bookingForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const msg=$(".form-message",e.currentTarget);
  msg.textContent="Thank you — your enquiry has been captured. Connect this form to your booking/CRM endpoint to complete submission.";
  e.currentTarget.reset();
});

$$("a[href^='#']").forEach(a=>a.addEventListener("click",e=>{
  const id=a.getAttribute("href");if(id.length>1){const target=$(id);if(target){e.preventDefault();target.scrollIntoView({behavior:reduced?"auto":"smooth"})}}
}));
