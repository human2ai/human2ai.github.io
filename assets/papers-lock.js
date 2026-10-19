/* Browser unlock of AES-GCM ciphertext. Details are intentionally not readable in HTML/JS source.
 * Static hosting is not secure access control; public scholarly records remain public elsewhere. */
(() => {
  const form = document.getElementById('paper-unlock-form');
  if (!form) return;
  const input = document.getElementById('paper-key');
  const message = document.getElementById('key-feedback');
  const button = form.querySelector('button');
  const vault = {"salt":"TLJVyCwRWNq7Q876mDTnnw==","iv":"XZOTJUE2yiRmhFfY","body":"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"};
  const bytes = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const make = (tag, cls, str) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (str != null) e.textContent = str;
    return e;
  };
  const link = (text, uri) => {
    const a = make('a','button button-outline',text+' ↗');
    const url = new URL(uri);
    if (url.protocol !== 'https:') throw new Error('Invalid resource URL');
    a.href = url.href; a.target='_blank'; a.rel='noopener noreferrer';
    return a;
  };
  const renderPaper = p => {
    const target = document.getElementById('unlocked-' + p.id);
    if (!target) return;
    target.replaceChildren();
    target.append(make('h3','',p.title));
    target.append(make('p','author-line',p.authors));
    target.append(make('p','research-lede',p.subtitle));
    const insight=make('div','research-insight');
    insight.append(make('span','', 'KEY FINDINGS'));
    insight.append(make('p','',p.finding));
    target.append(insight);
    const human=make('div','h2a-relevance');
    human.append(make('span','', 'THE HUMAN → AI CONNECTION'));
    human.append(make('p','',p.human));
    target.append(human);
    const details=make('details','abstract-details');
    details.append(make('summary','','More about this research'));
    details.append(make('p','',p.detail));
    target.append(details);
    target.append(make('p','venue-line',p.status+' · '+p.venue));
    const buttons=make('div','paper-actions');
    buttons.append(link('OpenReview record',p.record));
    buttons.append(link('View PDF',p.pdf));
    target.append(buttons);
    target.hidden=false;
    const placeholder=target.closest('.research-content')?.querySelector('.locked-overview');
    if(placeholder) placeholder.hidden=true;
  };
  let unlocked=false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (unlocked) {
      for(const id of ['affect','agents']){
        const target=document.getElementById('unlocked-'+id);
        if (target) {target.replaceChildren();target.hidden=true;}
        const overview=document.querySelector('#'+id+' .locked-overview');
        if(overview)overview.hidden=false;
      }
      unlocked=false; input.hidden=false; input.value=''; button.textContent='Unlock research ↗';
      message.textContent='Papers locked again.';
      return;
    }
    button.disabled=true; button.textContent='Checking key…';
    try {
      if (!globalThis.crypto?.subtle) throw Error('HTTPS is required to unlock encrypted details.');
      const encoder=new TextEncoder();
      const material=await crypto.subtle.importKey('raw',encoder.encode(input.value),'PBKDF2',false,['deriveKey']);
      const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(vault.salt),iterations:160000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
      const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(vault.iv)},key,bytes(vault.body));
      const papers=JSON.parse(new TextDecoder().decode(plain));
      papers.forEach(renderPaper);
      input.value=''; input.hidden=true;
      unlocked=true;
      message.textContent='Unlocked. Papers 02 and 03 are now visible in this tab.';
      button.textContent='Lock again';
    } catch(error) {
      message.textContent=error.message.includes('HTTPS') ? error.message : 'That key did not unlock the papers. Try again.';
      input.select();
      button.textContent='Unlock research ↗';
    } finally {button.disabled=false;}
  });
})();