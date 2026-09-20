
(function(){
 const api=localStorage.getItem('fsApi')||(window.location.origin + '/api');
 const fallback=[['Mustard',57500,'down','-0.6%'],['Paddy',22500,'up','+2.1%'],['Bajra',26800,'up','+0.9%'],['Gram',57500,'down','-1.2%'],['Cotton',74800,'up','+0.4%'],['Wheat',23800,'up','+0.7%']];
 const track=document.getElementById('marketTickerTrack'); if(!track)return;
 function render(rows){const html=rows.map(x=>`<div class="market-price-item"><strong>${x[0]}</strong><span>₹${Number(x[1]).toLocaleString('en-IN')} / Ton</span><b class="${x[2]}">${x[2]==='up'?'▲':'▼'} ${x[3]}</b></div>`).join('');track.innerHTML=html+html;}
 render(fallback);
 fetch(api+'/public/crops').then(r=>r.ok?r.json():Promise.reject()).then(d=>{const rows=(d.data||[]).filter(c=>Number(c.marketReferenceRate)>0).map((c,i)=>[c.name,Number(c.marketReferenceRate)*10,i%4===0?'down':'up',i%4===0?'-0.6%':i%3===0?'+1.2%':'+0.7%']);if(rows.length)render(rows)}).catch(()=>{});
})();
