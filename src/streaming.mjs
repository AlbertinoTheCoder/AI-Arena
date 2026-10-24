import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {execute,killTree} from './cli.mjs';

// Parse JSON lines across arbitrary stdout chunk boundaries. Unknown events stay private.
export function jsonLines(onEvent){let pending='';return {push(chunk){pending+=chunk;if(Buffer.byteLength(pending)>262144)throw new Error('CLI stream line exceeded limit.');let newline;while((newline=pending.indexOf('\n'))>=0){const line=pending.slice(0,newline).trim();pending=pending.slice(newline+1);if(line)onEvent(JSON.parse(line));}},end(){if(pending.trim())onEvent(JSON.parse(pending));pending='';}};}
export function cursorEvents(onText){let text='',result=null;return {event(event){if(event.type==='assistant'){const part=(event.message?.content||[]).filter(c=>c.type==='text'&&typeof c.text==='string').map(c=>c.text).join('');if(part&&(part!==text||event.timestamp_ms!==undefined)){text+=part;if(text.length>16000)throw new Error('Reply exceeded 16,000 characters.');onText(text);}}if(event.type==='result')result=event;},finish(){if(!result)throw new Error('Cursor stream ended without a final result.');if(result.is_error)throw new Error(String(result.result||'Cursor reported an error'));return JSON.stringify(result);}};}
export async function executeReply(opts){
 if(!opts.onText)return execute(opts);
 if(opts.agent.provider==='codex')return codexReply(opts);
 const events=cursorEvents(opts.onText),lines=jsonLines(event=>events.event(event));
 const result=await execute({...opts,onStdout:chunk=>lines.push(chunk)});lines.end();return {...result,out:events.finish()};
}
export function codexReply({spec,args,cwd,input,agent,signal,onChild=()=>{},onText=()=>{},timeout=120000,limit=262144}){
 return new Promise((resolve,reject)=>{
  if(signal?.aborted)return reject(new Error('Stopped by user'));
  const prefix=args.slice(0,args.indexOf('exec'));
  const child=spawn(spec.exe,[spec.entry,...prefix,'app-server','--listen','stdio://'],{cwd,windowsHide:true,shell:false,detached:process.platform!=='win32',stdio:['pipe','pipe','pipe'],env:{...process.env,NO_COLOR:'1'}});onChild(child);
  let settled=false,err='',bytes=0,threadId=null,text='',lastFinal='',activeItem=null;const items=new Map();
  const finish=async(error)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);await killTree(child);onChild(null);if(error)return reject(error);try{await writeFile(args[args.indexOf('--output-last-message')+1],lastFinal||text);resolve({out:'',err});}catch(e){reject(e);}};
  const fail=message=>void finish(new Error(message));const abort=()=>fail('Stopped by user');const timer=setTimeout(()=>fail('CLI timed out; the run was stopped.'),timeout);signal?.addEventListener('abort',abort,{once:true});
  const send=message=>{if(!settled)child.stdin.write(JSON.stringify(message)+'\n');};
  const accept=item=>item?.type==='agentMessage'&&item.phase!=='commentary';
  const emit=value=>{if(value.length>16000)return fail('Reply exceeded 16,000 characters.');text=value;onText(text);};
  const lines=jsonLines(message=>{
   if(settled)return;
   if(message.error&&message.id!==undefined)return fail(message.error.message||'Codex protocol error');
   if(message.id===0){send({method:'initialized',params:{}});send({id:1,method:'thread/start',params:{model:agent.cliModel,cwd,approvalPolicy:'never',sandbox:'read-only',ephemeral:true,config:{model_reasoning_effort:agent.effort,service_tier:agent.fast?'fast':'default'}}});}
   else if(message.id===1){threadId=message.result?.thread?.id;if(!threadId)return fail('Codex did not create a thread.');send({id:2,method:'turn/start',params:{threadId,input:[{type:'text',text:input}],effort:agent.effort}});}
   const p=message.params;if(p?.threadId&&threadId&&p.threadId!==threadId)return;
   if(message.method==='item/started'){items.set(p.item.id,p.item);if(accept(p.item)){activeItem=p.item.id;text='';}}
   if(message.method==='item/agentMessage/delta'&&accept(items.get(p.itemId))){if(activeItem!==p.itemId){activeItem=p.itemId;text='';}if(typeof p.delta==='string')emit(text+p.delta);}
   if(message.method==='item/completed'&&accept(p.item)){lastFinal=p.item.text||'';emit(lastFinal);}
   if(message.method==='turn/completed'){const turn=p.turn;if(turn.status!=='completed')return fail(turn.error?.message||'Codex turn '+turn.status);if(!lastFinal&&!text)return fail('Codex returned an empty reply.');void finish();}
   // Decline unsupported server requests rather than hang waiting for approval/input.
   if(message.method&&message.id!==undefined)send({id:message.id,error:{code:-32601,message:'AI Arena supports text replies only.'}});
  });
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');child.stdout.on('data',chunk=>{if(settled)return;bytes+=Buffer.byteLength(chunk);if(bytes>limit)return fail('CLI output exceeded the safety limit.');try{lines.push(chunk);}catch(e){fail('Invalid Codex stream: '+e.message);}});child.stderr.on('data',chunk=>err=(err+chunk).slice(-4000));
  child.once('error',e=>void finish(e));child.once('close',code=>{if(!settled)fail('Codex stream closed before completion ('+code+'): '+err.slice(-1000));});child.stdin.on('error',e=>{if(!settled)fail('Codex input failed: '+e.message);});
  send({id:0,method:'initialize',params:{clientInfo:{name:'ai_arena',title:'AI Arena',version:'1.1.0'}}});
 });
}
