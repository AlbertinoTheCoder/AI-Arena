// Six physical faces. The server's fair roll alone selects the opener.
export function createDie(value,rolling=false){
 const orientations={1:[-18,-24],2:[-18,-114],3:[-108,-24],4:[72,-24],5:[-18,66],6:[-18,156]};
 const stage=document.createElement('span');stage.className='dice-stage';stage.setAttribute('role','img');stage.setAttribute('aria-label',rolling?'Rolling a six-sided die':`Die rolled ${value}`);
 const halo=document.createElement('span');halo.className='dice-halo';const shadow=document.createElement('span');shadow.className='dice-shadow';const cube=document.createElement('span');cube.className='dice-cube';
 const [x,y]=orientations[value]||orientations[1];cube.style.setProperty('--land-x',x+'deg');cube.style.setProperty('--land-y',y+'deg');
 const patterns={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
 for(let face=1;face<=6;face++){const side=document.createElement('span');side.className='die-face face-'+face;side.setAttribute('aria-hidden','true');for(let dot=1;dot<=9;dot++){const pip=document.createElement('i');if(patterns[face].includes(dot))pip.className='pip';side.append(pip);}cube.append(side);}
 stage.append(halo,shadow,cube);return stage;
}
