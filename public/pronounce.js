// Phonetic respellings for words that neural voices mispronounce when they appear inside another language.
// Only the spoken text is rewritten; the displayed reply is never touched. Keys are matched on word boundaries,
// case-insensitively, with an optional plural "s"; keys containing uppercase letters (AI, OpenAI) match exactly.
// Multi-word entries always win over single words. Add new languages as extra arrays (en, es, fr, de…).
export const pronunciations={
 it:[
  ['machine learning','mashìn lèrning'],['deep learning','dip lèrning'],['open source','òpen sors'],['cloud computing','clàud compiùting'],['data center','dèita sènter'],['fake news','fèic nius'],['big data','big dèita'],['smart working','smart uòrking'],['fine tuning','fàin tiùning'],['fine-tuning','fàin tiùning'],
  ['AI','A I'],['OpenAI','Open A I'],
  ['plugin','plàghin'],['login','lòghin'],['logout','logàut'],['download','dàunlod'],['upload','àplod'],['update','apdèit'],['upgrade','apgrèid'],['browser','bràuser'],['cloud','clàud'],['software','sòftuer'],['hardware','hàrduer'],['firmware','fèrmuer'],['malware','màluer'],['ransomware','rànsomuer'],['spyware','spàiuer'],
  ['online','onlàin'],['offline','oflàin'],['token','tòchen'],['bug','bag'],['debug','dibàg'],['cache','chèsh'],['backup','bècap'],['framework','frèimuork'],['feature','fìciur'],['release','rilìs'],['default','difòlt'],['chatbot','ciàtbot'],['deepfake','dipfèic'],['fake','fèic'],
  ['streaming','strìming'],['streamer','strìmer'],['gaming','ghèiming'],['gamer','ghèimer'],['privacy','pràivasi'],['mainstream','mèinstrim'],['hype','hàip'],['startup','stàrtap'],['workflow','uòrkflou'],['pipeline','pàiplain'],['dataset','dèitaset'],['database','dèitabeis'],['firewall','fàieruol'],['password','pàssuord'],
  ['hashtag','hèshtag'],['hacker','hàcher'],['hacking','hàching'],['phishing','fìscing'],['layout','lèiaut'],['router','ràuter'],['wireless','uàirles'],['bluetooth','blùtuth'],['template','tèmpleit'],['feedback','fìdbec'],['deadline','dèdlain'],['query','cuìri'],['keyword','chìuord'],['cookie','cùchi'],
  ['embedding','embèding'],['jailbreak','gèilbreik'],['copyright','còpirait'],['influencer','ìnfluenser'],['follower','fòllouer'],['engagement','enghèigment'],['screenshot','scrìnsciot'],['touchscreen','tàcscrin'],['cybersecurity','sàiber-secùriti'],['cyber','sàiber']
 ]
};
const compiled={};
function compile(lang){
 if(compiled[lang]!==undefined)return compiled[lang];const entries=pronunciations[lang];if(!entries)return compiled[lang]=null;
 const map=new Map(entries.map(([key,value])=>[key.toLowerCase(),{key,value}]));const keys=entries.map(([key])=>key).sort((a,b)=>b.length-a.length);
 const alternation=keys.map(key=>key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+')+(key===key.toLowerCase()?'s?':'')).join('|');
 return compiled[lang]={map,regex:new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternation})(?![\\p{L}\\p{N}])`,'giu')};
}
function restoreCase(source,value){if(source.length>1&&source===source.toUpperCase()&&/\p{L}/u.test(source))return value.toUpperCase();if(source[0]!==source[0].toLowerCase())return value[0].toUpperCase()+value.slice(1);return value;}
export function speakable(text,lang){
 const table=compile(lang);if(!table||typeof text!=='string')return text;
 return text.replace(table.regex,match=>{const normalized=match.toLowerCase().replace(/\s+/g,' ');const entry=table.map.get(normalized)||table.map.get(normalized.replace(/s$/,''));if(!entry)return match;if(entry.key!==entry.key.toLowerCase())return match===entry.key?entry.value:match;return restoreCase(match,entry.value);});
}
