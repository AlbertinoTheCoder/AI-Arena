import {spawn} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {killTree} from './cli.mjs';
export function ttsVoices(root){try{return JSON.parse(readFileSync(path.join(root,'config','tts-voices.json'),'utf8'));}catch{return [];}}
export function generateSpeech(root,text,voice,signal,tightPauses=true,pitch='+0Hz'){
 const python=path.join(root,'.venv','Scripts','python.exe');if(!existsSync(python))return Promise.reject(new Error('Neural voice runtime missing. Run Setup-Voices.cmd in the extracted helper folder, or restart Start-Arena.cmd to configure voices automatically.'));
 return new Promise((resolve,reject)=>{const child=spawn(python,[path.join(root,'src','tts.py')],{cwd:root,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});let buffers=[],size=0,err='',failure=null,done=false;
 const fail=message=>{failure=new Error(message);void killTree(child);};const timer=setTimeout(()=>fail('Neural voice service timed out. Please retry.'),50000);const abort=()=>fail('Speech generation cancelled');signal?.addEventListener('abort',abort,{once:true});
 const finish=error=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);if(error||failure)reject(failure||error);else resolve(Buffer.concat(buffers));};
 child.stdout.on('data',b=>{size+=b.length;if(size>8*1024*1024)fail('Generated audio exceeded limit');else buffers.push(b);});child.stderr.on('data',b=>err=(err+b.toString('utf8')).slice(-2000));child.once('error',finish);child.once('close',code=>finish(code===0&&size>100?null:new Error(`Voice service failed: ${err||'no audio returned'}`)));child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify({text,voice,pitch,tightPauses}));
 });
}
