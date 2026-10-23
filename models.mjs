import {readFileSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
export function cursorCatalog(text){
 const groups=new Map();
 for(const line of text.split(/\r?\n/)){
  const match=line.match(/^([a-z0-9][a-z0-9.-]*) - (.+)$/);if(!match)continue;
  const [,model,name]=match,fast=model.endsWith('-fast'),plain=fast?model.slice(0,-5):model;
  const suffix=plain.match(/-(none|minimal|low|medium|high|xhigh|max)$/);const effort=suffix?.[1]||'default',id=suffix?plain.slice(0,-suffix[0].length):plain;
  if(!groups.has(id))groups.set(id,{id,label:name.replace(/\s*\(default\)/,'').replace(/\b(?:Extra High|Minimal|Medium|High|Low|Max|None|Fast)\b/g,'').replace(/[\u200b]/g,'').replace(/\s+/g,' ').trim()||id,variants:[]});
  groups.get(id).variants.push({model,effort,fast});
 }
 return [...groups.values()];
}
export function loadCatalog(){
 let cursor=[];try{cursor=cursorCatalog(readFileSync(new URL('./cursor-models.txt',import.meta.url),'utf8'));}catch{}
 let codex=[];try{const cache=JSON.parse(readFileSync(path.join(process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),'models_cache.json'),'utf8'));codex=cache.models.filter(m=>m.visibility==='list').map(m=>({id:m.slug,label:m.display_name,variants:m.supported_reasoning_levels.flatMap(r=>[false,...(m.additional_speed_tiers?.includes('fast')?[true]:[])].map(fast=>({model:m.slug,effort:r.effort,fast})))}));}catch{}
 return {cursor,codex};
}
export const defaults={grok:{provider:'cursor',model:'grok-4.7',effort:'low',fast:false},codex:{provider:'codex',model:'gpt-6.1-sol',effort:'low',fast:false}};
export function selectAgent(catalog,value){
 if(!value||!['cursor','codex'].includes(value.provider)||typeof value.fast!=='boolean')throw new Error('Invalid provider or Fast mode setting');
 const group=catalog[value.provider].find(m=>m.id===value.model);const variant=group?.variants.find(v=>v.effort===value.effort&&v.fast===value.fast);
 if(!variant)throw new Error('This model / thinking / Fast mode combination is not listed by this CLI.');
 return {...value,cliModel:variant.model,label:group.label};
}
export const selectionKey=a=>JSON.stringify([a.provider,a.model,a.effort,a.fast]);
