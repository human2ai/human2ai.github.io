/* Human2AI Labs — client-side portrait editor.
 * Edits are local previews, not server-side GitHub publication.
 * Do not mistake this passphrase gate for secure authorization. */
(() => {
  'use strict';
  const editor=document.getElementById('portrait-editor');
  if(!editor)return;
  const $=id=>document.getElementById(id);
  const users={
    aman:{name:'Aman Syed',initials:'AS',filename:'aman-syed.png'},
    maheen:{name:'Maheen Rassell',initials:'MR',filename:'maheen-rassell.png'},
    benjamin:{name:'Benjamin Li',initials:'BL',filename:'benjamin-li.png'},
    raghav:{name:'Raghav Balamurugan',initials:'RB',filename:'raghav-balamurugan.png'}
  };
  const gate=$('portrait-gate'),unlock=$('portrait-unlock-form'),notice=$('portrait-status');
  const hash='0f3cff4a6f70738f811f180ef84f69102167e8047a245578276c0ddef164376b'; // hash only; client-side gate, not secret auth
  const byId=Object.fromEntries(Object.entries(users).map(([id])=>[id,document.querySelector('[data-person-id="'+id+'"]')]));
  const snapshots=new Map(),activeUrls=new Map();
  const controls={zoom:$('portrait-zoom'),x:$('portrait-x'),y:$('portrait-y'),shape:$('portrait-shape')};
  const canvas=$('portrait-preview'),ctx=canvas.getContext('2d');
  const previewFrame=$('portrait-preview-frame');
  const mini=$('portrait-mini-image'),miniFallback=$('portrait-mini-fallback'),miniFrame=$('portrait-card-mini');
  const defaults=()=>({zoom:1,x:0,y:0,shape:'rounded'});
  let chosen='aman',draft=null,loadSerial=0,db=null,pointer=null;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const updateStatus=(message)=>{notice.textContent=message;};
  function openDatabase(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){reject(new Error('Local browser storage unavailable'));return;}
      const request=indexedDB.open('Human2AI_Labs_Portrait_Drafts',1);
      request.onupgradeneeded=()=>{const d=request.result;if(!d.objectStoreNames.contains('images'))d.createObjectStore('images',{keyPath:'id'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Unable to open local storage'));
      request.onblocked=()=>reject(new Error('Local storage is blocked'));
    });
  }
  function getAll(){
    return new Promise((resolve,reject)=>{
      if(!db){resolve([]);return;}
      const tx=db.transaction('images','readonly'),req=tx.objectStore('images').getAll();
      req.onsuccess=()=>resolve(req.result||[]);
      req.onerror=()=>reject(req.error);
    });
  }
  function put(value){
    return new Promise((resolve,reject)=>{
      if(!db){reject(new Error('Browser storage unavailable'));return;}
      const tx=db.transaction('images','readwrite');tx.objectStore('images').put(value);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Unable to save'));
      tx.onabort=()=>reject(tx.error||new Error('Save aborted'));
    });
  }
  function erase(id){
    return new Promise((resolve,reject)=>{
      if(!db){reject(new Error('Browser storage unavailable'));return;}
      const tx=db.transaction('images','readwrite');tx.objectStore('images').delete(id);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Unable to delete'));
    });
  }
  function clearImageURL(id){const url=activeUrls.get(id);if(url){URL.revokeObjectURL(url);activeUrls.delete(id);}}
  function setCard(id,url,shape){
    const frame=byId[id];if(!frame)return;
    const img=frame.querySelector('.person-photo'),fallback=frame.querySelector('.avatar-fallback');
    frame.dataset.shape=shape||'rounded';
    const has=Boolean(url);
    img.hidden=!has;fallback.hidden=has;
    if(has){
      img.src=url;
      img.style.objectPosition='center';
      frame.classList.add('has-portrait');
    } else {img.removeAttribute('src');frame.classList.remove('has-portrait');}
  }
  function setStoredImage(id,blob,shape){
    clearImageURL(id);const url=URL.createObjectURL(blob);activeUrls.set(id,url);setCard(id,url,shape);
  }
  function cardDraft(id,sourceCanvas,shape){
    // Temporary preview is deliberately not published or stored until "Save".
    if(!sourceCanvas || !draft?.image)return;
    setCard(id,sourceCanvas.toDataURL('image/png'),shape);
  }
  function roundedPath(c,size,r){
    c.moveTo(r,0);c.lineTo(size-r,0);c.quadraticCurveTo(size,0,size,r);
    c.lineTo(size,size-r);c.quadraticCurveTo(size,size,size-r,size);
    c.lineTo(r,size);c.quadraticCurveTo(0,size,0,size-r);
    c.lineTo(0,r);c.quadraticCurveTo(0,0,r,0);c.closePath();
  }
  function drawInto(target,image,config){
    const sz=target.width,c=target.getContext('2d');
    c.clearRect(0,0,sz,sz);if(!image)return;
    c.save();c.beginPath();
    if(config.shape==='circle')c.arc(sz/2,sz/2,sz/2,0,Math.PI*2);
    else roundedPath(c,sz,sz*.11);
    c.clip();
    const scale=Math.max(sz/image.naturalWidth,sz/image.naturalHeight)*config.zoom;
    const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
    const dx=(sz-w)/2+(w-sz)*config.x/200,dy=(sz-h)/2+(h-sz)*config.y/200;
    c.drawImage(image,dx,dy,w,h);
    c.restore();
  }
  function config(){
    return {zoom:Number(controls.zoom.value),x:Number(controls.x.value),y:Number(controls.y.value),shape:controls.shape.value};
  }
  function outputs(){
    $('portrait-zoom-value').textContent=Math.round(+controls.zoom.value*100)+'%';
    for(const [id,output] of [['x','portrait-x-value'],['y','portrait-y-value']]){
      const n=Number(controls[id].value);
      $(output).textContent=n===0?'Center':Math.abs(n)+'% '+(id==='x'?(n>0?'right':'left'):(n>0?'down':'up'));
    }
  }
  function toggles(){
    const has=!!draft?.image;
    $('portrait-save').disabled=!has;$('portrait-download').disabled=!has;
    controls.zoom.disabled=!has;controls.x.disabled=!has;controls.y.disabled=!has;controls.shape.disabled=!has;
    $('portrait-drop-hint').hidden=has;
  }
  function showPreview(){
    const cfg=config();
    previewFrame.dataset.shape=cfg.shape;miniFrame.dataset.shape=cfg.shape;
    drawInto(canvas,draft?.image,cfg);
    const has=!!draft?.image;
    mini.hidden=!has;miniFallback.hidden=has;
    if(has){const data=canvas.toDataURL('image/png');mini.src=data;cardDraft(chosen,canvas,cfg.shape);}
    else mini.removeAttribute('src');
    outputs();toggles();
  }
  function applyControls(cfg){
    const c=cfg||defaults();
    controls.zoom.value=clamp(+c.zoom||1,1,3);
    controls.x.value=clamp(Number(c.x)||0,-100,100);
    controls.y.value=clamp(Number(c.y)||0,-100,100);
    controls.shape.value=c.shape==='circle'?'circle':'rounded';
  }
  function releaseDraft(){if(draft?.url){URL.revokeObjectURL(draft.url);}draft=null;}
  function restoreCard(id){
    clearImageURL(id);
    setCard(id,'assets/portraits/'+id+'.webp','rounded');
  }
  async function decode(blob){
    const url=URL.createObjectURL(blob),image=new Image();
    try{
      await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Could not decode this image'));image.src=url;});
      if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>80000000)throw new Error('Image dimensions are too large');
      return {image,url};
    }catch(error){URL.revokeObjectURL(url);throw error;}
  }
  async function choose(id){
    if(!users[id])return;
    const previous=chosen;const ticket=++loadSerial;
    if(previous!==id)restoreCard(previous);
    releaseDraft();chosen=id;$('portrait-person').value=id;
    $('portrait-selected-name').textContent=users[id].name;
    $('portrait-mini-name').textContent=users[id].name;$('portrait-mini-fallback').textContent=users[id].initials;
    const saved=snapshots.get(id);applyControls(saved?.config);showPreview();
    if(saved?.sourceBlob){
      try{
        const loaded=await decode(saved.sourceBlob);
        if(ticket!==loadSerial){URL.revokeObjectURL(loaded.url);return;}
        draft={image:loaded.image,url:loaded.url,sourceBlob:saved.sourceBlob};
        showPreview();updateStatus('Loaded saved preview for '+users[id].name+'.');
      }catch(error){updateStatus('Saved source photo could not be loaded; please upload it again.');}
    }else updateStatus('Choose a photo for '+users[id].name+'.');
  }
  async function uploadFile(file){
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){updateStatus('Please choose a JPG, PNG or WebP image.');return;}
    if(file.size>12*1024*1024){updateStatus('That image is larger than 12 MB. Please reduce its size.');return;}
    const id=chosen,ticket=++loadSerial;updateStatus('Opening image…');
    try{
      const loaded=await decode(file);
      if(ticket!==loadSerial || chosen!==id){URL.revokeObjectURL(loaded.url);return;}
      releaseDraft();
      draft={...loaded,sourceBlob:file};
      applyControls({...defaults(),shape:controls.shape.value});
      showPreview();updateStatus('Photo ready. Drag the image or adjust the sliders, then save locally or export.');
    }catch(error){updateStatus(error.message||'Could not open the image.');}
  }
  const blobOf=canvas=>new Promise((resolve,reject)=>{
    canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not export PNG')),'image/png');
  });
  async function exportBlob(){
    if(!draft?.image)throw Error('Upload a photo first.');
    const output=document.createElement('canvas');output.width=960;output.height=960;
    drawInto(output,draft.image,config());return blobOf(output);
  }
  $('portrait-save').addEventListener('click',async()=>{
    if(!draft?.image)return;const id=chosen;updateStatus('Saving browser preview…');
    try{
      const cropBlob=await exportBlob();
      const record={id,sourceBlob:draft.sourceBlob,cropBlob,config:config(),updatedAt:Date.now()};
      await put(record);snapshots.set(id,record);setStoredImage(id,cropBlob,record.config.shape);
      updateStatus('Saved for this browser. Download the cropped PNG to publish for everyone.');
    }catch(error){updateStatus('Could not save in this browser: '+error.message+'. You can still download the PNG.');}
  });
  $('portrait-download').addEventListener('click',async()=>{
    try{
      const blob=await exportBlob(),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.download=users[chosen].filename;a.href=url;document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      updateStatus('Cropped PNG downloaded. Send it here to publish to the GitHub website.');
    }catch(error){updateStatus('Export failed: '+error.message);}
  });
  $('portrait-reset').addEventListener('click',async()=>{
    const id=chosen;const proceed=window.confirm('Remove '+users[id].name+'\'s portrait draft from this browser?');if(!proceed)return;
    ++loadSerial;releaseDraft();snapshots.delete(id);
    try{await erase(id);updateStatus('Local portrait cleared.');}catch(error){updateStatus('Local preview cleared, but browser storage could not be updated.');}
    restoreCard(id);applyControls(defaults());showPreview();
  });
  $('portrait-file').addEventListener('change',e=>{
    const file=e.target.files?.[0];if(file)void uploadFile(file);e.target.value='';
  });
  $('portrait-person').addEventListener('change',e=>void choose(e.target.value));
  for(const c of Object.values(controls))c.addEventListener('input',showPreview);
  for(const c of Object.values(controls))c.addEventListener('change',showPreview);
  // Drag the crop inside the bounded preview: delta is normalized to remaining image overflow.
  canvas.addEventListener('pointerdown',e=>{
    if(!draft?.image||e.button!==0)return;
    pointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:+controls.x.value,startY:+controls.y.value};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId||!draft?.image)return;
    const rect=canvas.getBoundingClientRect(),size=canvas.width,img=draft.image;
    const sc=Math.max(size/img.naturalWidth,size/img.naturalHeight)*(+controls.zoom.value);
    const overX=Math.max(0,img.naturalWidth*sc-size),overY=Math.max(0,img.naturalHeight*sc-size);
    const dx=(e.clientX-pointer.x)*size/Math.max(rect.width,1);
    const dy=(e.clientY-pointer.y)*size/Math.max(rect.height,1);
    controls.x.value=overX?clamp(Math.round(pointer.startX+dx*200/overX),-100,100):0;
    controls.y.value=overY?clamp(Math.round(pointer.startY+dy*200/overY),-100,100):0;
    showPreview();
  });
  const release=()=>pointer=null;canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  // Accept images dropped onto the crop area.
  previewFrame.addEventListener('dragover',e=>{e.preventDefault();previewFrame.classList.add('drag-hover');});
  previewFrame.addEventListener('dragleave',()=>previewFrame.classList.remove('drag-hover'));
  previewFrame.addEventListener('drop',e=>{e.preventDefault();previewFrame.classList.remove('drag-hover');const file=[...e.dataTransfer.files].find(x=>x.type.startsWith('image/'));if(file)void uploadFile(file);});
  unlock.addEventListener('submit',async e=>{
    e.preventDefault();
    const field=$('portrait-password'),status=$('portrait-unlock-status');
    if(!window.crypto?.subtle){status.textContent='Please open the HTTPS website to use this editor.';return;}
    const bytes=new TextEncoder().encode(field.value);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
    field.value='';
    if(hex!==hash){status.textContent='Incorrect key. Please try again.';return;}
    gate.hidden=true;editor.hidden=false;status.textContent='';
    void choose(chosen);
  });
  $('portrait-lock').addEventListener('click',()=>{
    editor.hidden=true;gate.hidden=false;
    releaseDraft();++loadSerial;pointer=null;restoreCard(chosen);updateStatus('');
  });
  window.addEventListener('pagehide',()=>{releaseDraft();for(const id of Object.keys(users))clearImageURL(id);});
  // Saved drafts load on this browser without requiring the key; only editing is gated.
  (async()=>{
    try{
      db=await openDatabase();const records=await getAll();
      for(const record of records){if(users[record.id]&&record.cropBlob){snapshots.set(record.id,record);}}
    }catch(error){/* In private browsing, local preview can still work without persistence. */}
    applyControls(defaults());showPreview();
  })();
})();
