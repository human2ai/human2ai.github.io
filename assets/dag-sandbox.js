/* Human2AI Labs DAG Sandbox — dependency-free graph editor. */
(()=>{
const svg=document.getElementById('dag-board'); if(!svg)return;
const NS='http://www.w3.org/2000/svg', nodesLayer=document.getElementById('dag-vertices'), edgesLayer=document.getElementById('dag-connections');
const $=id=>document.getElementById(id);
const state={nodes:[],edges:[],exposure:'X',outcome:'Y',selectedNode:null,selectedEdge:null,connecting:null,mode:'select',dragging:null};
const presets={
mixed:{nodes:[['C','Context',185,200],['X','Exposure',392,145],['Y','Outcome',780,295],['M','Mediator',580,265],['K','Collider',560,425],['T','Other cause',285,432]],edges:[['C','X'],['C','Y'],['X','M'],['M','Y'],['X','K'],['T','K']]},
chain:{nodes:[['X','Start',190,235],['M','Middle',485,235],['Y','Result',780,235]],edges:[['X','M'],['M','Y']]},
fork:{nodes:[['C','Shared cause',485,115],['X','Exposure',290,365],['Y','Outcome',680,365]],edges:[['C','X'],['C','Y']]},
collider:{nodes:[['X','Exposure',195,160],['T','Other cause',195,415],['Y','Collider',700,275]],edges:[['X','Y'],['T','Y']]},
diamond:{nodes:[['X','Source',160,275],['M','Path A',450,120],['K','Path B',450,425],['Y','Outcome',790,275]],edges:[['X','M'],['X','K'],['M','Y'],['K','Y']]},
blank:{nodes:[['X','Exposure',270,275],['Y','Outcome',720,275]],edges:[]}
};
const byId=id=>state.nodes.find(n=>n.id===id);
const outgoing=id=>state.edges.filter(e=>e.from===id).map(e=>e.to);
const incoming=id=>state.edges.filter(e=>e.to===id).map(e=>e.from);
function reachable(a,b){if(a===b)return false;const seen=new Set([a]),q=[a];while(q.length){const u=q.shift();for(const v of outgoing(u)){if(v===b)return true;if(!seen.has(v)){seen.add(v);q.push(v);}}}return false;}
function ancestors(id){const seen=new Set(),q=[id];while(q.length){for(const v of incoming(q.shift())){if(!seen.has(v)){seen.add(v);q.push(v);}}}return seen;}
function engine(){return window.H2ADagLogic.graph(state.nodes,state.edges);}
function roles(id){return engine().classify(id,state.exposure,state.outcome);}
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const ctm=svg.getScreenCTM();return ctm?p.matrixTransform(ctm.inverse()):{x:0,y:0};}
function element(tag,attrs={}){const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs)){el.setAttribute(k,String(v));}return el;}
function notice(s){$('dag-notice').textContent=s;}
function reset(which){const x=presets[which]||presets.mixed;state.nodes=x.nodes.map(([id,label,x,y])=>({id,label,x,y}));state.edges=x.edges.map(([from,to])=>({from,to}));state.exposure=byId('X')?'X':state.nodes[0].id;state.outcome=byId('Y')?'Y':state.nodes[state.nodes.length-1].id;state.selectedNode=null;state.selectedEdge=null;state.mode='select';state.connecting=null;notice('Loaded '+which+' example');render();}
function selectNode(id){state.selectedNode=id;state.selectedEdge=null;}
function addEdge(from,to){if(from===to){notice('A variable cannot cause itself in a DAG.');return;}if(state.edges.some(e=>e.from===from&&e.to===to)){notice('That arrow already exists.');return;}if(reachable(to,from)){notice('Blocked: that arrow would create a cycle.');return;}state.edges.push({from,to});notice('Connected '+byId(from).label+' → '+byId(to).label);}
function interactNode(id){if(state.mode==='connect'){if(!state.connecting){state.connecting=id;notice('Now select the effect variable.');}else{addEdge(state.connecting,id);state.connecting=null;state.mode='select';}}selectNode(id);render();}
function edgeShape(from,to){const dx=to.x-from.x,dy=to.y-from.y,len=Math.max(1,Math.hypot(dx,dy));const ux=dx/len,uy=dy/len;const sx=from.x+ux*43,sy=from.y+uy*43,ex=to.x-ux*50,ey=to.y-uy*50;return 'M '+sx+' '+sy+' L '+ex+' '+ey;}
function rebuildSelect(el,value){const old=value;el.replaceChildren();for(const n of state.nodes){const opt=document.createElement('option');opt.value=n.id;opt.textContent=n.label+' ('+n.id+')';el.append(opt);}if(byId(old))el.value=old;}
function draw(){
edgesLayer.replaceChildren();nodesLayer.replaceChildren();
for(const e of state.edges){const a=byId(e.from),b=byId(e.to);if(!a||!b)continue;const p=edgeShape(a,b);
const hit=element('path',{d:p,class:'dag-edge-hit',tabindex:0,'aria-label':'Select arrow from '+a.label+' to '+b.label});
const visible=element('path',{d:p,class:'dag-edge'+(state.selectedEdge===e?' selected':''),'marker-end':'url(#dag-arrow)'});
hit.addEventListener('click',ev=>{ev.stopPropagation();state.selectedEdge=e;state.selectedNode=null;render();});
hit.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();state.selectedEdge=e;state.selectedNode=null;render();}});
edgesLayer.append(visible,hit);
}
for(const n of state.nodes){const g=element('g',{transform:'translate('+n.x+' '+n.y+')',class:'dag-node'+(state.selectedNode===n.id?' selected':'')+(state.connecting===n.id?' connecting':''),tabindex:0,role:'button','aria-label':'Select '+n.label});
const info=roles(n.id),r=[...info.target.map(x=>x+' (X→Y)'),...info.structural];const circle=element('circle',{r:40,cx:0,cy:0,class:'dag-node-circle'});g.append(circle);
if(r.length){const halo=element('circle',{r:45,cx:0,cy:0,class:'dag-node-halo'});g.insertBefore(halo,circle); }
const short=n.label.length>17?n.label.slice(0,16)+'…':n.label;
const txt=element('text',{x:0,y:4,'text-anchor':'middle',class:'dag-node-text'});txt.textContent=short;g.append(txt);
const id=element('text',{x:0,y:62,'text-anchor':'middle',class:'dag-node-id'});id.textContent=n.id;g.append(id);
if(r.length){const label=element('text',{x:0,y:76,'text-anchor':'middle',class:'dag-node-role'});label.textContent=r.slice(0,2).join(' · ')+(r.length>2?' +'+(r.length-2):'');g.append(label);}
g.addEventListener('pointerdown',ev=>{if(ev.button!==0)return;ev.stopPropagation();if(state.mode==='connect'){interactNode(n.id);return;}selectNode(n.id);const p=point(ev);state.dragging={id:n.id,dx:n.x-p.x,dy:n.y-p.y};try{svg.setPointerCapture(ev.pointerId);}catch(_){}render();});
g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();interactNode(n.id);}});
nodesLayer.append(g);
}
}
function inspector(){
const node=byId(state.selectedNode);
$('dag-selected-label').textContent=node?node.label:(state.selectedEdge?byId(state.selectedEdge.from).label+' → '+byId(state.selectedEdge.to).label:'Choose a variable');
$('dag-label-input').disabled=!node;$('dag-label-input').value=node?node.label:'';
const box=$('dag-role-tags');box.replaceChildren();
if(node){
const r=roles(node.id);
for(const [heading,list] of [['Relative to selected X → Y',r.target],['Structure of entire graph',r.structural]]){
const section=document.createElement('div');section.className='dag-role-section';
const title=document.createElement('strong');title.className='dag-role-section-title';title.textContent=heading;section.append(title);
const row=document.createElement('div');row.className='dag-tag-row';
if(list.length) for(const label of list){const span=document.createElement('span');span.className='role-tag role-'+label.toLowerCase();span.textContent=label;row.append(span);}
else {const empty=document.createElement('span');empty.className='role-muted';empty.textContent='No matching role';row.append(empty);}
section.append(row);box.append(section);
}
}else{const empty=document.createElement('span');empty.className='role-muted';empty.textContent=state.selectedEdge?'Selected an arrow':'Select a variable to inspect.';box.append(empty);}
$('dag-node-description').textContent=node?'Incoming: '+incoming(node.id).length+' · Outgoing: '+outgoing(node.id).length+'. Intermediate is any node along a chain; Mediator requires a path from your selected X to Y.':state.selectedEdge?'Use Delete selected to remove this arrow.':'Fork, collider and intermediate roles appear across the graph. Confounder and mediator depend on the chosen X and Y.';
$('dag-connect').classList.toggle('is-active',state.mode==='connect');
$('dag-connect').setAttribute('aria-pressed',String(state.mode==='connect'));
$('dag-mode').textContent=state.connecting?'Now click the effect variable':state.mode==='connect'?'Click the cause variable, then the effect':state.selectedEdge?'Arrow selected':'Select a variable or arrow to inspect it';
}
function metrics(){
const n=state.nodes.length,graph=engine(),values=graph.matrix(),totals=graph.totals();
$('stat-nodes').textContent=n;$('stat-edges').textContent=totals.direct;
$('stat-reach').textContent=totals.reachable;$('stat-max').textContent=n*(n-1)/2;$('stat-indirect').textContent=totals.indirect;
const matrix=document.createElement('table');matrix.className='connection-matrix';
const caption=document.createElement('caption');caption.className='sr-only';caption.textContent='Row cause to column effect: direct and indirect paths';matrix.append(caption);
const thead=document.createElement('thead'),head=document.createElement('tr'),corner=document.createElement('th');
corner.textContent='Cause ↓ / Effect →';corner.scope='col';corner.className='matrix-corner';head.append(corner);
function addName(target,node,cls,scope){
const cell=document.createElement('th');cell.className=cls;cell.scope=scope;cell.title=node.label+' ('+node.id+')';
const label=document.createElement('span');label.className='axis-label';label.textContent=node.label||node.id;cell.append(label);target.append(cell);
}
for(const node of state.nodes)addName(head,node,'matrix-axis','col');
thead.append(head);matrix.append(thead);
const tbody=document.createElement('tbody');
state.nodes.forEach((a,i)=>{
const row=document.createElement('tr');addName(row,a,'matrix-row-label','row');
state.nodes.forEach((b,j)=>{
const type=values[i][j],cell=document.createElement('td');cell.className='matrix-'+type;
cell.textContent={self:'—',direct:'→',indirect:'↝',none:'·'}[type];
cell.title=a.label+' → '+b.label+': '+({self:'Same variable',direct:'Direct arrow',indirect:'Indirect multi-step path',none:'No directed path'}[type]);cell.setAttribute('aria-label',cell.title);row.append(cell);
});tbody.append(row);});
matrix.append(tbody);$('dag-matrix').replaceChildren(matrix);
const overview=$('dag-all-roles');if(overview){overview.replaceChildren();
for(const node of state.nodes){const r=graph.classify(node.id,state.exposure,state.outcome),all=[...r.target.map(t=>t+' (X→Y)'),...r.structural];if(!all.length)continue;
const entry=document.createElement('div');entry.className='dag-summary-row';const name=document.createElement('strong');name.textContent=node.label||node.id;entry.append(name);
const tags=document.createElement('div');tags.className='dag-summary-tags';for(const value of all){const t=document.createElement('span');t.textContent=value;t.className='role-tag role-'+value.split(' ')[0].toLowerCase();tags.append(t);}entry.append(tags);overview.append(entry);}
if(!overview.childElementCount){const t=document.createElement('p');t.className='role-muted';t.textContent='Add some arrows to find structural roles.';overview.append(t);}}
}
function render(){rebuildSelect($('dag-exposure'),state.exposure);rebuildSelect($('dag-outcome'),state.outcome);draw();inspector();metrics();}
svg.addEventListener('pointermove',ev=>{if(!state.dragging)return;const n=byId(state.dragging.id),p=point(ev);if(!n)return;n.x=Math.max(65,Math.min(915,p.x+state.dragging.dx));n.y=Math.max(65,Math.min(460,p.y+state.dragging.dy));draw();});
const endDrag=()=>{state.dragging=null;};svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
svg.addEventListener('click',ev=>{if(ev.target===svg){state.selectedNode=null;state.selectedEdge=null;render();}});
$('dag-add').addEventListener('click',()=>{if(state.nodes.length>=14){notice('Up to 14 variables are supported in this demo.');return;}let i=1;while(byId('V'+i))i++;const id='V'+i;const j=state.nodes.length;state.nodes.push({id,label:'Variable '+i,x:210+(j%4)*180,y:120+(Math.floor(j/4)%3)*155});selectNode(id);notice('Added '+id);render();$('dag-label-input').focus();$('dag-label-input').select();});
$('dag-connect').addEventListener('click',()=>{state.mode=state.mode==='connect'?'select':'connect';state.connecting=null;notice(state.mode==='connect'?'Select two variables to draw an arrow.':'Connection mode cancelled.');render();});
$('dag-remove').addEventListener('click',()=>{if(state.selectedEdge){state.edges=state.edges.filter(e=>e!==state.selectedEdge);state.selectedEdge=null;notice('Arrow deleted.');}else if(state.selectedNode){if(state.nodes.length<=2){notice('Keep at least two variables.');return;}const id=state.selectedNode;state.nodes=state.nodes.filter(n=>n.id!==id);state.edges=state.edges.filter(e=>e.from!==id&&e.to!==id);state.selectedNode=null;if(state.exposure===id)state.exposure=state.nodes[0].id;if(state.outcome===id)state.outcome=state.nodes[state.nodes.length-1].id;notice('Variable removed.');}else notice('Select a node or arrow first.');render();});
$('dag-label-input').addEventListener('input',ev=>{const n=byId(state.selectedNode);if(!n)return;n.label=ev.target.value.slice(0,28);rebuildSelect($('dag-exposure'),state.exposure);rebuildSelect($('dag-outcome'),state.outcome);draw();metrics();$('dag-selected-label').textContent=n.label;});
$('dag-exposure').addEventListener('change',ev=>{state.exposure=ev.target.value;render();});
$('dag-outcome').addEventListener('change',ev=>{state.outcome=ev.target.value;render();});
$('dag-preset').addEventListener('change',ev=>reset(ev.target.value));
$('dag-export').addEventListener('click',()=>{const payload=JSON.stringify({nodes:state.nodes,edges:state.edges,exposure:state.exposure,outcome:state.outcome},null,2);const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='human2ai-dag.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);});
reset('mixed');
})();