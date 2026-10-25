import path from 'node:path';import {fileURLToPath} from 'node:url';import {ensureSpeechRuntime} from '../src/speech-setup.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);try{await ensureSpeechRuntime(root);}catch(error){console.error(error.message);process.exitCode=1;}
