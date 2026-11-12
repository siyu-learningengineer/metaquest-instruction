(() => {
 const panel=document.getElementById('certificate-reward'), input=document.getElementById('certificate-name'), namePreview=document.getElementById('certificate-preview-name'), datePreview=document.getElementById('certificate-date'), image=document.getElementById('certificate-preview'), download=document.getElementById('certificate-download'), status=document.getElementById('certificate-status');
 let unlocked=false, assets, pending, timer;
 const today=()=>new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric'}).format(new Date());
 function refresh(){const name=input.value.trim()||'Your name';namePreview.textContent=name;const c=document.createElement('canvas').getContext('2d');c.font='40px Georgia';namePreview.style.fontSize=Math.min(4, 40*48/Math.max(c.measureText(name).width,1))+'cqw';datePreview.textContent=today();}
 async function loadAssets(){if(assets)return assets;if(!pending)pending=fetch('assets/certificate/template.json').then(r=>{if(!r.ok)throw Error('Template unavailable');return r.json();}).then(a=>{assets=a;image.src='data:image/jpeg;base64,'+a.preview;return a;}).catch(e=>{pending=null;throw e;});return pending;}
 function clearConfetti(){clearTimeout(timer);document.getElementById('certificate-confetti').replaceChildren();}
 function celebrate(){clearConfetti();if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const layer=document.getElementById('certificate-confetti');for(let i=0;i<140;i++){const p=document.createElement('i');p.style.cssText=`left:${Math.random()*100}%;background:${['#b8860b','#4b9cd3','#012169','#dc567a','#55bda7'][i%5]};--drift:${(Math.random()-.5)*260}px;animation-delay:${Math.random()*.6}s;animation-duration:${2.2+Math.random()*1.1}s;`;layer.append(p);}timer=setTimeout(clearConfetti,4200);}
 window.QuestCertificate={unlock(){unlocked=true;panel.hidden=false;refresh();celebrate();panel.focus();loadAssets().then(()=>{status.textContent='Enter your name to personalize your certificate.';}).catch(()=>{status.textContent='The certificate could not load. Select Download certificate to retry.';});},reset(){unlocked=false;panel.hidden=true;input.value='';clearConfetti();status.textContent='';}};
 input.addEventListener('input',refresh);window.addEventListener('focus',refresh);
 download.addEventListener('click',async()=>{
  if(!unlocked)return;if(!input.value.trim()){status.textContent='Please enter your name first.';input.focus();return;}
  download.disabled=true;status.textContent='Preparing your certificate…';
  try{
   const a=await loadAssets();refresh();if(!window.PDFLib)throw Error('PDF library unavailable');
   const {PDFDocument,rgb}=window.PDFLib;const pdf=await PDFDocument.load(Uint8Array.from(atob(a.pdf),c=>c.charCodeAt(0)));const page=pdf.getPage(0),{width:w,height:h}=page.getSize();
   // Cover only the template's participant placeholder; preserve its underline.
   page.drawRectangle({x:w*.25,y:h*(1-.399),width:w*.5,height:h*.066,color:rgb(250/255,252/255,254/255)});
   async function textImage(text,x,top,width,height,maxSize){const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=180;const ctx=canvas.getContext('2d');let size=maxSize;ctx.font=size+'px Georgia';while(ctx.measureText(text).width>1740&&size>12){size--;ctx.font=size+'px Georgia';}ctx.fillStyle='#17212a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,900,90);const png=await pdf.embedPng(canvas.toDataURL('image/png'));page.drawImage(png,{x:x*w,y:(1-top-height)*h,width:width*w,height:height*h});}
   await textImage(input.value.trim(),.25,.337,.5,.06,140);
   await textImage(today(),.155,.787,.223,.04,100);
   const blob=new Blob([await pdf.save()],{type:'application/pdf'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Meta-Quest-3-Training-Certificate.pdf';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Your personalized certificate is ready. Your name stays in this browser.';
  }catch(e){status.textContent='Could not prepare the PDF. Please try again.';}finally{download.disabled=false;}
 });
})();
