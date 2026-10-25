import {ensureSpeechRuntime} from '../src/speech-setup.mjs';
import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawn} from 'node:child_process';import {startArena} from '../src/server.mjs';import {discover} from '../src/cli.mjs';import {existsSync} from 'node:fs';
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
if(Number(process.versions.node.split('.')[0])<22){console.error('Install Node.js 22+ from https://nodejs.org/');process.exit(1);}
console.log('AI Arena local helper — your accounts stay on this computer.');
for(const [slot,spec]of Object.entries(discover()))console.log((slot==='grok'?'Cursor CLI':'Codex CLI')+': '+(existsSync(spec.entry)?'found':'missing — see docs/SETUP.md'));
try{await ensureSpeechRuntime(process.cwd());}catch(error){console.error(error.message);console.error('Starting text-only Arena. Run Setup-Voices.cmd to enable or repair voices.');}
const app=startArena();app.server.once('listening',()=>{if(process.platform==='win32'){const opener=spawn('rundll32.exe',['url.dll,FileProtocolHandler','https://albertinothecoder.github.io/AI-Arena/'],{windowsHide:true,stdio:'ignore'});opener.on('error',()=>{});opener.unref();}});
