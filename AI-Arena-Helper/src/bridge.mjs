import {randomBytes,timingSafeEqual} from 'node:crypto';
export const PAGES_ORIGIN='https://albertinothecoder.github.io';
export function createBridge({code=randomBytes(6).toString('hex').toUpperCase(),now=Date.now}={}){
 const sessions=new Map();let attempts=[];
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 return {code,async handle(req,res,url){
  if(req.headers.origin!==PAGES_ORIGIN)return false;
  res.setHeader('Access-Control-Allow-Origin',PAGES_ORIGIN);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, X-Arena-Token');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return true;}
  if(url.pathname==='/api/bridge/health'&&req.method==='GET'){json(res,200,{app:'ai-arena',bridgeVersion:1,version:'1.2.0'});return true;}
  if(url.pathname==='/api/bridge/pair'&&req.method==='POST'){
   attempts=attempts.filter(t=>now()-t<60000);if(attempts.length>=5){json(res,429,{error:'Too many pairing attempts. Wait one minute.'});return true;}attempts.push(now());
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>1024){json(res,413,{error:'Pairing request too large.'});return true;}}
   let input;try{input=JSON.parse(raw);}catch{json(res,400,{error:'Invalid pairing request.'});return true;}
   const candidate=String(input.code||'').replace(/[\s-]/g,'').toUpperCase();if(!/^[A-F0-9]{12}$/.test(candidate)||candidate.length!==code.length||!timingSafeEqual(Buffer.from(candidate),Buffer.from(code))){json(res,403,{error:'Incorrect code. Copy the pairing code from the helper window.'});return true;}
   for(const [key,s]of sessions)if(s.expires<=now())sessions.delete(key);if(sessions.size>=8)sessions.delete(sessions.keys().next().value);
   const token=randomBytes(32).toString('hex');sessions.set(token,{browserId:randomBytes(24).toString('hex'),expires:now()+12*3600000});json(res,200,{accessToken:token,expiresIn:43200});return true;
  }
  const bearer=req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1],session=sessions.get(bearer);if(!session||session.expires<=now()){if(bearer)sessions.delete(bearer);json(res,401,{error:'Pair this page with the local helper first.'});return true;}
  req.arenaBrowserId=session.browserId;
  if(url.pathname==='/api/bridge/disconnect'&&req.method==='POST'){sessions.delete(bearer);json(res,200,{ok:true});return true;}
  return false;
 }};
}
