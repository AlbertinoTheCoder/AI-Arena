import {existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
export function discover(){
 const local=[process.env.LOCALAPPDATA,path.join(os.homedir(),'AppData','Local')].filter(Boolean).find(p=>existsSync(path.join(p,'cursor-agent','versions'))) || path.join(os.homedir(),'AppData','Local');
 const roaming=process.env.APPDATA || path.join(os.homedir(),'AppData','Roaming');
 const versions=path.join(local,'cursor-agent','versions');
 const version=existsSync(versions)?readdirSync(versions).filter(n=>/^\d{4}\.\d+\.\d+.*-[a-f0-9]+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true})).find(n=>existsSync(path.join(versions,n,'index.js'))):null;
 const cursor=process.env.ARENA_CURSOR_ENTRY || (version?path.join(versions,version,'index.js'):'');
 const codex=process.env.ARENA_CODEX_ENTRY || path.join(roaming,'npm','node_modules','@openai','codex','bin','codex.js');
 return {grok:{entry:cursor,exe:version?path.join(versions,version,'node.exe'):process.execPath},codex:{entry:codex,exe:process.execPath}};
}
export function cliArgs(who,output,agent,stream=false){
 const cursor=agent?agent.provider==='cursor':who==='grok';
 return cursor?['-p','--trust','--model',agent?.cliModel||'grok-4.7-high','--mode','ask','--output-format',stream?'stream-json':'json',...(stream?['--stream-partial-output']:[])]:
 ['-m',agent?.cliModel||'gpt-6.1-sol',...(agent?['-c',`model_reasoning_effort="${agent.effort}"`,'-c',`service_tier=${agent.fast?'"fast"':'"default"'}`]:[]),'-s','read-only','-c','mcp_servers.unreal-mcp.enabled=false','-c','mcp_servers.unityMCP.enabled=false','exec','--skip-git-repo-check','--ephemeral','--color','never','--output-last-message',output,'-'];
}
export function killTree(child){
 if(!child?.pid)return Promise.resolve();
 if(process.platform==='win32')return new Promise(resolve=>{const p=spawn('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});p.once('error',resolve);p.once('close',resolve);});
 try{process.kill(-child.pid,'SIGKILL');}catch{child.kill('SIGKILL');}return Promise.resolve();
}
export function execute({spec,args,cwd,input='',timeout=120000,signal,onChild=()=>{},onStdout=()=>{},limit=262144}){
 return new Promise((resolve,reject)=>{
  if(signal?.aborted)return reject(new Error('Stopped by user'));
  const child=spawn(spec.exe,[spec.entry,...args],{cwd,windowsHide:true,shell:false,detached:process.platform!=='win32',stdio:['pipe','pipe','pipe'],env:{...process.env,NO_COLOR:'1'}});
  onChild(child);let out='',err='',failure=null,settled=false;
  const fail=message=>{if(!failure){failure=new Error(message);void killTree(child);}};
  const timer=setTimeout(()=>fail('CLI timed out; the run was stopped.'),timeout);
  const abort=()=>fail('Stopped by user');signal?.addEventListener('abort',abort,{once:true});
  const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);onChild(null);if(error||failure)reject(failure||error);else resolve({out,err});};
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  child.stdout.on('data',b=>{out+=b;if(Buffer.byteLength(out)>limit)return fail('CLI output exceeded the safety limit.');try{onStdout(b);}catch(e){fail(e.message);}});
  child.stderr.on('data',b=>{err=(err+b.toString('utf8')).slice(-16000);});
  child.once('error',finish);child.once('close',code=>finish(code===0?null:new Error(`CLI exited ${code}: ${err.slice(-4000)||out.slice(-1000)}`)));
  child.stdin.on('error',()=>{});child.stdin.end(input);
 });
}
