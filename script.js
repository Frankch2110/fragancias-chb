let DATA=[], PAGE=1, PER_PAGE=25;
const $=sel=>document.querySelector(sel);
const $$=sel=>document.querySelectorAll(sel);

async function load(){
  try{
    const res=await fetch('catalog.json');
    DATA=await res.json();
  }catch(e){
    console.error('No se pudo cargar catalog.json', e);
    DATA=[];
  }
  buildBrandIndex(); render();
}
function peso(v){
  if(v===null||v===undefined) return NaN;
  const n=String(v).replace(/[^0-9.]/g,''); return parseFloat(n||'0');
}
function buildBrandIndex(){
  const brands=[...new Set(DATA.map(r=>r.brand_general))].sort();
  const ul=$('#index'); ul.innerHTML='';
  brands.forEach(b=>{
    const a=document.createElement('a'); a.textContent=b; a.href='#';
    a.onclick=(e)=>{e.preventDefault(); $('#brandFilter').value=b; PAGE=1; render();};
    ul.appendChild(a);
  });
  const bf=$('#brandFilter'); bf.innerHTML='<option value="">Todas las marcas</option>';
  brands.forEach(b=>{
    const o=document.createElement('option'); o.value=b; o.textContent=b; bf.appendChild(o);
  });
}

function filtered(){
  const q=$('#search').value.trim().toLowerCase();
  const bf=$('#brandFilter').value;
  const tf=$('#typeFilter').value;
  let rows=DATA.filter(r=>{
    const matchesQ= !q || (r.brand_general+' '+(r.brand_base||'')+' '+(r.perfume||'')+' '+(r.size||'')+' '+(r.type||'')+' '+(r.product_raw||'')).toLowerCase().includes(q);
    const matchesB= !bf || r.brand_general===bf;
    const matchesT= !tf || (r.type||'')===tf;
    return matchesQ && matchesB && matchesT;
  });
  const sort=$('#sortBy').value;
  if(sort==='brand') rows.sort((a,b)=>(a.brand_general+a.perfume).localeCompare(b.brand_general+b.perfume));
  if(sort==='perfume') rows.sort((a,b)=>(String(a.perfume||'')).localeCompare(String(b.perfume||'')));
  if(sort==='priceAsc') rows.sort((a,b)=>peso(a.precio_venta)-peso(b.precio_venta));
  if(sort==='priceDesc') rows.sort((a,b)=>peso(b.precio_venta)-peso(a.precio_venta));
  return rows;
}

function render(){
  const rows=filtered();
  $('#count').textContent=`${rows.length} resultados`;
  const start=(PAGE-1)*PER_PAGE, end=start+PER_PAGE;
  const pageRows=rows.slice(start,end);
  const tbody=$('#table tbody'); tbody.innerHTML='';
  pageRows.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${r.brand_general||''}</td><td>${r.perfume || r.product_raw || ''}</td><td>${r.size||''}</td><td>${r.type||''}</td><td>${r.precio_venta??''}</td>`;
    tbody.appendChild(tr);
  });
  const totalPages=Math.max(1, Math.ceil(rows.length/PER_PAGE));
  $('#pageInfo').textContent=`Página ${PAGE} / ${totalPages}`;
  $('#prev').disabled=PAGE<=1; $('#next').disabled=PAGE>=totalPages;
}

document.addEventListener('DOMContentLoaded',()=>{
  $('#search').addEventListener('input', ()=>{PAGE=1; render();});
  $('#brandFilter').addEventListener('change', ()=>{PAGE=1; render();});
  $('#typeFilter').addEventListener('change', ()=>{PAGE=1; render();});
  $('#sortBy').addEventListener('change', ()=>{PAGE=1; render();});
  $('#prev').addEventListener('click', ()=>{PAGE=Math.max(1, PAGE-1); render();});
  $('#next').addEventListener('click', ()=>{PAGE=PAGE+1; render();});
  load();
});