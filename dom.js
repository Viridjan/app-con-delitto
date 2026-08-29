// dump del markup di ogni schermata, con le battute tutte scoperte: rete di sicurezza
const fs=require("fs"),vm=require("vm");
const node=()=>({_h:"",set innerHTML(v){this._h=v},get innerHTML(){return this._h},textContent:"",disabled:false,hidden:false,dataset:{},style:{},value:"",
  classList:{toggle(){},add(){},remove(){},contains:()=>false},addEventListener(){},focus(){},scrollIntoView(){},scrollTo(){},remove(){},
  getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),get firstElementChild(){return node()},querySelector:()=>node(),querySelectorAll:()=>[]});
const stage=node();
const doc={createElement:node,addEventListener(){},querySelector:()=>null,body:{appendChild:n=>n},
  getElementById:id=>id==="stage"?stage:node(),documentElement:{requestFullscreen:()=>Promise.resolve()}};
const js=[...fs.readFileSync("oliva-blu.html","utf8").matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join("\n");
const app=vm.runInNewContext(js+";({state,SLIDES,STORY,vai,render})",
  {document:doc,Image:class{set src(_){}},matchMedia:()=>({matches:false}),addEventListener(){},requestAnimationFrame:f=>f(),console,location:{protocol:"file:",hostname:""}});
const out=[];
for(let i=0;i<app.SLIDES.length;i++){
  const s=app.SLIDES[i];
  app.vai(i);
  if(s.t==="scene"){ app.state.step=app.STORY.scene[s.i].battute.length; app.render(); }
  out.push(`===== ${i} ${s.t} =====\n`+stage.innerHTML.replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g,"DATA").replace(/\s+/g," ").replace(/> </g,">\n<"));
}
app.state.clue=0; app.vai(app.SLIDES.findIndex(x=>x.t==="tavolo")); app.state.clue=0; app.render();
out.push("===== dettaglio indizio =====\n"+stage.innerHTML.replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g,"DATA").replace(/\s+/g," ").replace(/> </g,">\n<"));
fs.writeFileSync(process.argv[2],out.join("\n\n"));
console.log("scritto",process.argv[2]);
