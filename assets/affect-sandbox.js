/* Human2AI Labs — illustrative toy, NOT a fitted research model */
(()=>{const svg=document.getElementById('affect-chart');if(!svg)return;
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';const history=[];let model={v:0,a:.5,d:0};
const knobs=[['affect-val','val-out',true],['affect-aro','aro-out',false],['affect-dom','dom-out',true],['affect-memory','mem-out',false],['affect-noise','noise-out',false]];
function read(id){return Number($(id).value);}const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));const fmt=n=>(n>0?'+':'')+n.toFixed(2);
function labels(){for(const [id,out,signed] of knobs){let v=read(id);$(out).textContent=id==='affect-memory'?Math.round(v*100)+'%':signed?fmt(v):v.toFixed(2);}}
function svgEl(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;}
function randomInput(){const pick=(min,max)=>Math.round((min+Math.random()*(max-min))*20)/20;$('affect-val').value=pick(-1,1);$('affect-aro').value=pick(0,1);$('affect-dom').value=pick(-1,1);labels();}
function next(){const input={v:read('affect-val'),a:read('affect-aro'),d:read('affect-dom')},mem=read('affect-memory'),noise=read('affect-noise');const n=()=>((Math.random()*2)-1)*noise;
model={v:clamp((1-mem)*input.v+mem*model.v+n(),-1,1),a:clamp((1-mem)*input.a+mem*model.a+n(),0,1),d:clamp((1-mem)*input.d+mem*model.d+n(),-1,1)};
history.push({...model});if(history.length>30)history.shift();draw();}
function draw(){svg.replaceChildren();const width=800,height=400,left=60,right=25,top=32,bottom=40,plotW=width-left-right,plotH=height-top-bottom;
const axis=svgEl('g',{class:'affect-axes'});svg.append(axis);
for(let i=0;i<=4;i++){const y=top+(i*plotH/4);axis.append(svgEl('line',{x1:left,x2:width-right,y1:y,y2:y}));const t=svgEl('text',{x:left-18,y:y+4,'text-anchor':'end'});t.textContent=(1-i*.5).toFixed(1);axis.append(t);}
if(!history.length){const msg=svgEl('text',{x:width/2,y:height/2,'text-anchor':'middle',class:'affect-empty'});msg.textContent='Press “Next turn” to begin';svg.append(msg);}
else{const lines=[['v','#db6d32',x=>x],['a','#1b9d92',x=>x*2-1],['d','#9d75bc',x=>x]];for(const [key,color,scale] of lines){const path=svgEl('path',{fill:'none',stroke:color,'stroke-width':3.5,'stroke-linecap':'round','stroke-linejoin':'round'});const d=history.map((r,i)=>{const x=left+((history.length===1?0.5:i/Math.max(1,history.length-1))*plotW),y=top+(1-scale(r[key]))*plotH/2;return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);}).join(' ');path.setAttribute('d',d);svg.append(path);const last=history.at(-1),cx=left+(history.length===1?.5:1)*plotW,cy=top+(1-scale(last[key]))*plotH/2;svg.append(svgEl('circle',{cx,cy,r:5,fill:color,stroke:'#fff','stroke-width':2}));}}
$('current-val').textContent=fmt(model.v);$('current-aro').textContent=model.a.toFixed(2);$('current-dom').textContent=fmt(model.d);$('affect-turns').textContent=history.length+' TURN'+(history.length===1?'':'S');}
knobs.forEach(([id])=>$(id).addEventListener('input',labels));
$('affect-next').addEventListener('click',next);$('affect-random').addEventListener('click',randomInput);
$('affect-reset').addEventListener('click',()=>{history.length=0;model={v:0,a:.5,d:0};draw();});
labels();draw();
})();