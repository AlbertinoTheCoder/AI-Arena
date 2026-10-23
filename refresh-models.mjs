import {discover,execute} from './cli.mjs';
import {writeFile} from 'node:fs/promises';
import {cursorCatalog} from './models.mjs';
try{const result=await execute({spec:discover().grok,args:['--list-models'],cwd:process.cwd(),timeout:30000});if(!cursorCatalog(result.out).length)throw new Error('No models returned');await writeFile(new URL('./cursor-models.txt',import.meta.url),result.out);console.log('Cursor model listing refreshed. No model replies requested.');}catch(e){console.warn(`Could not refresh Cursor listing: ${e.message}. Using the saved listing; account access remains unverified.`);}
