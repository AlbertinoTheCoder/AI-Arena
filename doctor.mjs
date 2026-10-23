import {discover,execute} from './cli.mjs';
import {existsSync} from 'node:fs';
for(const [name,spec] of Object.entries(discover())){
 try{if(!spec.entry||!existsSync(spec.entry))throw new Error('CLI entrypoint missing');const r=await execute({spec,args:['--help'],cwd:process.cwd(),timeout:20000});console.log(`${name}: installed; help OK\n${spec.entry}\n`);if(!r.out.includes('--model'))process.exitCode=1;}
 catch(e){console.error(`${name}: ${e.message}`);process.exitCode=1;}
}
console.log('No model requests made. Login and account model access are checked only when you start a run.');
