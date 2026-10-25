import {spawn} from 'node:child_process';import {existsSync} from 'node:fs';import {readFile} from 'node:fs/promises';import path from 'node:path';import {killTree} from './cli.mjs';
export function runSetupCommand(exe,args,{cwd,quiet=false,timeout=300000}={}){return new Promise((resolve,reject)=>{const child=spawn(exe,args,{cwd,windowsHide:true,shell:false,stdio:quiet?'ignore':'inherit'});let settled=false;const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);if(error)reject(error);else resolve();};const timer=setTimeout(()=>{void killTree(child);finish(new Error('Voice setup timed out. Check Internet access and run Setup-Voices.cmd again.'));},timeout);child.once('error',finish);child.once('close',code=>finish(code===0?null:new Error('Voice setup command failed ('+code+'). Run Setup-Voices.cmd to retry.')));});}
export async function ensureSpeechRuntime(root,{run=runSetupCommand,exists=existsSync,log=console.log}={}){
 const python=path.join(root,'.venv','Scripts','python.exe'),requirements=path.join(root,'requirements.txt');
 const pins=(await readFile(requirements,'utf8')).split(/\r?\n/).map(l=>l.trim().match(/^([a-z0-9-]+)==([a-z0-9.]+)$/i)).filter(Boolean).map(m=>[m[1],m[2]]);
 const check='import sys,pathlib; assert sys.version_info >= (3,12); import edge_tts,imageio_ffmpeg; from importlib.metadata import version; assert all(version(k)==v for k,v in '+JSON.stringify(pins)+'); assert pathlib.Path(imageio_ffmpeg.get_ffmpeg_exe()).is_file()';
 const attempt=async(exe,args)=>{try{await run(exe,args,{cwd:root,quiet:true,timeout:15000});return true;}catch{return false;}};
 if(exists(python)&&await attempt(python,['-c',check])){log('Neural voices: runtime ready.');return {python,installed:false};}
 log('Setting up neural voices in this helper folder. No administrator rights are needed.');
 let selected;for(const candidate of [{exe:'py.exe',args:['-3']},{exe:'python.exe',args:[]},{exe:'python3',args:[]}])if(await attempt(candidate.exe,[...candidate.args,'-c','import sys; sys.exit(0 if sys.version_info >= (3,12) else 1)'])){selected=candidate;break;}
 if(!selected)throw new Error('Python 3.12+ was not found. Install it from https://www.python.org/downloads/windows/ then run Setup-Voices.cmd. Text debates can still run.');
 log('Creating/repairing the local Python environment…');await run(selected.exe,[...selected.args,'-m','venv',path.join(root,'.venv')],{cwd:root});
 log('Installing edge-tts and the local FFmpeg helper from PyPI…');await run(python,['-m','pip','--isolated','install','--disable-pip-version-check','--index-url','https://pypi.org/simple','-r',requirements],{cwd:root});
 if(!await attempt(python,['-c',check]))throw new Error('Voice packages did not pass verification. Run Setup-Voices.cmd again and check its output.');
 log('Neural voices ready. Internet is required when speaking.');return {python,installed:true};
}
