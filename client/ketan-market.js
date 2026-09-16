
(function(){
 const api=localStorage.getItem('fsApi')||'http://localhost:5000/api';
 const fallback=[['Mustard',5750,'down','-0.6%'],['Paddy',2250,'up','+2.1%'],['Bajra',2680,'up','+0.9%'],['Gram',5750,'down','-1.2%'],['Cotton',7480,'up','+0.4%'],['Wheat',2380,'up','+0.7%']];
 const track=document.getElementById('marketTickerTrack'); if(!track)return;
 function render(rows){const html=rows.map(x=>`<div class="market-price-item"><strong>${x[0]}</strong><span>₹${Number(x[1]).toLocaleString('en-IN')} / qtl</span><b class="${x[2]}">${x[2]==='up'?'▲':'▼'} ${x[3]}</b></div>`).join('');track.innerHTML=html+html;}
 render(fallback);
 fetch(api+'/public/crops').then(r=>r.ok?r.json():Promise.reject()).then(d=>{const rows=(d.data||[]).filter(c=>Number(c.marketReferenceRate)>0).map((c,i)=>[c.name,c.marketReferenceRate,i%4===0?'down':'up',i%4===0?'-0.6%':i%3===0?'+1.2%':'+0.7%']);if(rows.length)render(rows)}).catch(()=>{});
})();
