export function cleanPlainText(text){
 return String(text).replace(/```(?:\w+)?\s*([\s\S]*?)```/g,'$1').replace(/!\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/^\s{0,3}#{1,6}\s+/gm,'').replace(/^\s*>\s?/gm,'').replace(/\*\*([^]*?)\*\*/g,'$1').replace(/__([^]*?)__/g,'$1').replace(/~~([^]*?)~~/g,'$1').replace(/`([^`]+)`/g,'$1').replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,!?;:]|$)/g,'$1$2').replace(/(^|\s)_([^_\n]+)_(?=\s|[.,!?;:]|$)/g,'$1$2').replace(/^\s*[-*+]\s+/gm,'').replace(/\n{3,}/g,'\n\n').trim();
}
export function enforceReply(text,{words=60,maxSentences=2,language='English'}={}){
 const plain=cleanPlainText(text);let result=plain;
 if(maxSentences>0){const codes={English:'en',Italian:'it',French:'fr',Spanish:'es',German:'de'};const raw=[...new Intl.Segmenter(codes[language]||'en',{granularity:'sentence'}).segment(result)];const segments=[];for(const part of raw){const previous=segments.at(-1)||'';if(/(?:\b(?:Dr|Mr|Mrs|Ms|Prof|Sr|Jr|St|vs|Sig|Mme|Mlle)\.|\b(?:e\.g|i\.e)\.)\s*$/i.test(previous))segments[segments.length-1]+=part.segment;else segments.push(part.segment);}result=segments.slice(0,maxSentences).join('').trim();}
 const tokens=result.match(/\S+/g)||[];if(tokens.length>words){const shortened=tokens.slice(0,words).join(' ');const ends=[...shortened.matchAll(/[.!?](?=\s|$)/g)];const last=ends.at(-1)?.index;result=last!==undefined&&last>shortened.length*.45?shortened.slice(0,last+1):shortened.replace(/[,;:\s]+$/,'')+'…';}
 return {text:result,trimmed:result!==plain,wordCount:(result.match(/\S+/g)||[]).length};
}
