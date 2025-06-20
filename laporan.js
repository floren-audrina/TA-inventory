const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["navbar2.js","auth.js","db_conn.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill.js";import{_ as G,s as f}from"./db_conn.js";import{i as Y,c as V}from"./auth.js";import{d as J}from"./import.js";fetch("navbar.html").then(t=>t.text()).then(async t=>{document.getElementById("navbar").innerHTML=t,(await G(()=>import("./navbar2.js"),__vite__mapDeps([0,1,2]))).setupLogout()}).catch(t=>console.error("Error loading navbar:",t));Y();(async()=>await V())();let T,L,I,A,D,P,j,C;function W(t,n){const d=t.internal.getNumberOfPages();for(let r=1;r<=d;r++)t.setPage(r),t.setFontSize(8),t.setTextColor(100),t.setDrawColor(200),t.line(n,285,210-n,285),t.text(`Halaman ${r} dari ${d}`,105,291,{align:"center"}),t.text(`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`,105,294,{align:"center"})}function m(t){return new Intl.NumberFormat("id-ID",{minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}function E(t){return t?new Date(t).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}):""}function v(t,n="success"){const d=document.getElementById("toastContainer"),r=document.createElement("div");r.classList.add("toast"),r.setAttribute("role","alert"),r.setAttribute("aria-live","assertive"),r.setAttribute("aria-atomic","true"),r.classList.add(n==="success"?"bg-success":"bg-danger"),r.classList.add("text-white");const c=document.createElement("div");c.classList.add("toast-body"),c.textContent=t,r.appendChild(c),d.appendChild(r),new bootstrap.Toast(r,{autohide:!0,delay:3e3}).show(),r.addEventListener("hidden.bs.toast",()=>{r.remove()})}function Q(){const t=document.querySelector(".report-container");t&&t.scrollTo({top:0,behavior:"smooth"})}function K(t){return Array.isArray(t)?t.length===0:typeof t=="object"&&t!==null?t.logs?t.logs.length===0:Object.keys(t).length===0:!1}function X(t,n){const d=document.createElement("label");d.className="form-label",d.innerHTML="Pengelompokkan",n.appendChild(d);const r=document.createElement("select");r.id="groupBy",r.className="form-select",r.innerHTML="",n.style.display="none",t.addEventListener("change",()=>{t.value==="Pembelian"||t.value==="Penjualan"?(n.style.display="block",Z(t.value,r),n.appendChild(r)):n.style.display="none"})}function Z(t,n){t==="Pembelian"?n.innerHTML=`
            <option value="" disabled selected>Pilih kelompok</option>
            <option value="order">Pesanan</option>
            <option value="supplier">Supplier</option>
            <option value="product">Produk</option>
        `:t==="Penjualan"&&(n.innerHTML=`
            <option value="" disabled selected>Pilih kelompok</option>
            <option value="order">Pesanan</option>
            <option value="customer">Bakul</option>
            <option value="product">Produk</option>
        `)}function $(){D.disabled=!0,D.classList.add("disabled")}function tt(){D.disabled=!1,D.classList.remove("disabled")}async function at(){var s;const{jsPDF:t}=window.jspdf,n=new t("p","mm","a4"),d=20;let r=30;const c=T.value,a=L.value,l=I.value;if(!a||!l){v("Harap pilih rentang tanggal","error");return}if(new Date(a)>new Date(l)){v("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error");return}const e=new Date(a).toLocaleDateString("id-ID"),o=new Date(l).toLocaleDateString("id-ID");n.setFont("helvetica","bold"),n.setFontSize(12),n.setTextColor(40),n.text("GUNARTO",d,15),n.setFont("helvetica","normal"),n.setFontSize(10),n.text("Pasar Klewer, Surakarta",d,20),n.setDrawColor(150),n.line(d,22,210-d,22),n.setFontSize(16),n.setTextColor(0),n.text(`LAPORAN ${c.toUpperCase()}`,105,r,{align:"center"}),r+=8,n.setFontSize(12),n.text(`${e} - ${o}`,105,r,{align:"center"}),r+=15;try{const i=await O[c].fetchData(a,l);if(K(i)){n.setFontSize(12),n.setTextColor(100),n.text("Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.",105,r,{align:"center"}),W(n,d),n.save(`Laporan_${c}_${new Date().getFullYear()}.pdf`);return}const u=((s=document.getElementById("groupBy"))==null?void 0:s.value)||"order";switch(c){case"Laba Rugi":et(n,i,r,d);break;case"Pembelian":u==="supplier"?F(n,i,r,d,{entityType:"supplier",entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)"}):u==="product"?H(n,i,r,d,{entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)",qtyLabel:"TOTAL DIBELI"}):M(n,i,r,d,{prefix:"PO",contactLabel:"Supplier",reportLabel:"Pembelian",itemField:"item_pesanan_pembelian",isPenjualan:!1});break;case"Penjualan":u==="customer"?F(n,i,r,d,{entityType:"customer",entityLabel:"BAKUL",amountLabel:"TOTAL DIBERIKAN (Rp)"}):u==="product"?H(n,i,r,d,{entityLabel:"BAKUL",amountLabel:"TOTAL PENDAPATAN (Rp)",qtyLabel:"TOTAL TERJUAL"}):M(n,i,r,d,{prefix:"SO",contactLabel:"Bakul",reportLabel:"Penjualan",itemField:"item_pesanan_penjualan",isPenjualan:!0});break;case"Kartu Stok":nt(n,i,r,d);break;case"Stock Opname":lt(n,i,r,d);break}W(n,d),n.save(`Laporan_${c}_${new Date().getFullYear()}.pdf`)}catch(i){console.error("Error generating PDF:",i),v("Gagal membuat PDF: "+i.message,"error")}}function et(t,n,d,r){const c=[["Pendapatan",m(n.totalRevenue)],["Harga Pokok Penjualan (HPP)",m(n.totalCOGS)],["Laba Kotor",m(n.grossProfit)],["Biaya Operasional",m(n.operatingExpenses)],["Laba Bersih",m(n.netProfit)]];t.autoTable({head:[["KETERANGAN","JUMLAH (Rp)"]],body:c,startY:d,margin:{left:r,right:r},theme:"grid",headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",fontSize:11,halign:"center",valign:"middle",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,fontSize:10,lineWidth:.1,lineColor:[0,0,0],cellPadding:2,valign:"middle"},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{0:{halign:"left"},1:{halign:"right",cellWidth:60}},didParseCell:a=>{const l=a.row.index,e=l===2||l===4;a.section==="body"&&e&&(a.cell.styles.fontStyle="bold",a.cell.styles.fillColor=[0,0,0],a.cell.styles.textColor=[255,255,255],a.column.index===0&&(a.cell.styles.halign="right"))},didDrawCell:a=>{if(a.column.index===1&&typeof a.cell.raw=="string"){const l=parseFloat(a.cell.raw.replace(/\./g,"").replace(",","."));a.cell.text=m(l)}}})}function F(t,n,d,r,c){const{entityType:a,entityLabel:l,amountLabel:e}=c,o=n.reduce((p,g)=>p+(g.totalPaid||g.totalRevenue||0),0),s=n.reduce((p,g)=>p+(g.totalItems||g.totalSold||0),0),i=["NO",l,"TOTAL PESANAN","TOTAL ITEMS",e],u=n.map((p,g)=>{var h,b;return[g+1,a==="supplier"?`${((h=p.supplier)==null?void 0:h.perusahaan)||"-"}
${((b=p.supplier)==null?void 0:b.cp)||"-"}`:a==="customer"?p.customer:p.product,p.totalOrders,a==="product"?p.totalPurchased||p.totalSold:p.totalItems,m(p.totalPaid||p.totalRevenue||p.totalDibayarkan)]});u.push(["","TOTAL",n.length,s,m(o)]),t.autoTable({head:[i],body:u,startY:d,margin:{left:r,right:r},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},[u.length-1]:{fontStyle:"bold",fillColor:[220,220,220]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function H(t,n,d,r,c){const{entityLabel:a,amountLabel:l}=c,e=n.reduce((u,p)=>u+(p.totalPurchased||p.totalSold||0),0),o=n.reduce((u,p)=>u+(p.totalDibayarkan||p.totalRevenue||0),0),s=["NO","PRODUK","JUMLAH BAKUL","TOTAL PESANAN",c.qtyLabel,l],i=n.map((u,p)=>[p+1,u.product,u.bakulCount||"-",u.totalOrders,u.totalPurchased||u.totalSold,m(u.totalDibayarkan||u.totalRevenue)]);return i.push(["","TOTAL","",n.length,e,m(o)]),t.autoTable({head:[s],body:i,startY:d,margin:{left:r,right:r},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{2:{halign:"center"},3:{halign:"right"},4:{halign:"right"},5:{halign:"right"},[i.length-1]:{fontStyle:"bold",fillColor:[255,255,255]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}}),t.autoTable.previous.finalY+10}function M(t,n,d,r,c){const{prefix:a,contactLabel:l,reportLabel:e,itemField:o,isPenjualan:s}=c,i=n.reduce((u,p)=>u+(p.total_dibayarkan||0),0);t.setFontSize(12),t.setTextColor(0),t.text(`Daftar Pesanan ${e}`,r,d),d+=10,n.forEach((u,p)=>{var b,k,S,B;(b=u[o])!=null&&b.reduce((_,x)=>_+(x.qty_dipesan||0),0),t.setFontSize(10),t.setFont("helvetica","bold"),t.text(`${a}-${u.id.toString().padStart(4,"0")} - ${E(u.tanggal_pesan)}`,r,d),d+=5,t.setFont("helvetica","normal"),s?t.text(`${l}: ${((k=u.bakul)==null?void 0:k.nama)||"Walk-in"}`,r,d):t.text(`${l}: ${((S=u.supplier)==null?void 0:S.perusahaan)||"-"} (${((B=u.supplier)==null?void 0:B.cp)||"-"})`,r,d),d+=5,t.text(`Total: ${m(u.total_dibayarkan)}`,r,d),d+=5;const g=s?["PRODUK","QTY","HARGA SATUAN","HARGA STANDAR","DISKON/KENAIKAN","SUBTOTAL"]:["PRODUK","QTY","HARGA SATUAN","SUBTOTAL"],h=(u[o]||[]).map(_=>{var R,q,N;const x=(q=(R=_.varian)==null?void 0:R.produk)!=null&&q.nama?`${_.varian.produk.nama} - ${_.varian.varian||""}`:"Unknown Product";if(s){const U=((N=_.varian)==null?void 0:N.harga_standar)||0,w=_.priceDifference||0,z=w===0?"0":w>0?`+${m(w)}`:m(w);return[x,_.qty_dipesan||0,m(_.harga_jual),m(U),{content:z,styles:{textColor:w>0?[0,128,0]:w<0?[255,0,0]:[0,0,0]}},m((_.qty_dipesan||0)*(_.harga_jual||0))]}else return[x,_.qty_dipesan||0,m(_.harga_beli||0),m((_.qty_dipesan||0)*(_.harga_beli||0))]});t.autoTable({head:[g],body:h,startY:d,margin:{left:r,right:r},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},columnStyles:{0:{cellWidth:35},1:{cellWidth:12,halign:"right"},2:{cellWidth:30,halign:"right"},...s?{3:{cellWidth:32,halign:"right"},4:{cellWidth:35,halign:"right"},5:{cellWidth:25,halign:"right"}}:{3:{cellWidth:25,halign:"right"}}},alternateRowStyles:{fillColor:[255,255,255]},styles:{fontSize:9,cellPadding:2,overflow:"linebreak"},didDrawPage:_=>{d=_.cursor.y+5}}),d+=10,d>250&&p<n.length-1&&(t.addPage(),d=30)}),t.setFont("helvetica","bold"),t.text(`Total ${e}: ${m(i)}`,r,d)}function nt(t,n,d,r){t.setFontSize(14),t.setTextColor(0);const c=n.map(e=>[`VAR${e.id.toString().padStart(4,"0")}`,e.name,a(e.initialStock),a(e.purchases),a(e.adjustmentsIn),a(e.sales),a(e.adjustmentsOut),a(e.finalStock),l(e.hpp)]);t.autoTable({head:[[{content:"KODE",rowSpan:2},{content:"BARANG",rowSpan:2},{content:"AWAL",rowSpan:2},{content:"MASUK",colSpan:2},{content:"KELUAR",colSpan:2},{content:"AKHIR",rowSpan:2},{content:"HPP",rowSpan:2}],["PEMB.","PENY.","PENJ.","PENY."]],body:c,startY:d,margin:{left:r,right:r},tableWidth:"auto",headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",valign:"middle",halign:"center"},columnStyles:{0:{cellWidth:"auto",halign:"left"},1:{cellWidth:"auto",halign:"left"},2:{cellWidth:"auto",halign:"right"},3:{cellWidth:"auto",halign:"right"},4:{cellWidth:"auto",halign:"right"},5:{cellWidth:"auto",halign:"right"},6:{cellWidth:"auto",halign:"right"},7:{cellWidth:"auto",halign:"right"},8:{cellWidth:"auto",halign:"right"}},styles:{fontSize:9,cellPadding:3,lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{textColor:[0,0,0],valign:"middle"},alternateRowStyles:{fillColor:[255,255,255]}});function a(e){return new Intl.NumberFormat("id-ID").format(e)}function l(e){return isNaN(e)||e===null?"-":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0,maximumFractionDigits:0}).format(e).replace("Rp","").trim()}return t}function lt(t,n,d=30,r=14){const{logs:c,adjustmentsByLog:a}=n;t.setFont("helvetica"),t.setFontSize(9);const l=5,e=[];c.forEach(s=>{s.item_opname.forEach(i=>{var h,b,k;const u=(a[s.id]||[]).find(S=>S.id===i.id),p=u?u.tipe_riwayat==="penyesuaian_masuk"?`+${u.qty}`:`-${u.qty}`:"0",g=`${((b=(h=i.varian)==null?void 0:h.produk)==null?void 0:b.nama)||""} - ${((k=i.varian)==null?void 0:k.varian)||""}`;e.push([s.id.toString(),o(s.tanggal),s.status_log,`VAR${i.id_varian.toString().padStart(4,"0")}`,{content:g,styles:{cellWidth:40,valign:"middle"}},i.status_item_log,{content:i.stok.toString(),styles:{halign:"right"}},{content:i.status_item_log==="disesuaikan"?p:"0",styles:{halign:"right",textColor:p.startsWith("+")?[0,128,0]:p.startsWith("-")?[255,0,0]:[0,0,0]}}])})}),t.autoTable({head:[["ID","TANGGAL","STATUS","ITEM","PRODUK","STATUS","STOK","PENY."]],body:e,startY:d+2,margin:{left:r,right:r},tableWidth:"auto",styles:{fontSize:10,cellPadding:2,lineWidth:.1,lineColor:[0,0,0],lineHeight:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",halign:"center"},bodyStyles:{valign:"middle",textColor:0},columnStyles:{0:{cellWidth:10},1:{cellWidth:25},2:{cellWidth:20},3:{cellWidth:20},4:{cellWidth:45},5:{cellWidth:25},6:{cellWidth:15},7:{cellWidth:15}},alternateRowStyles:{fillColor:[255,255,255]},didDrawCell:s=>{if(s.column.index===4&&s.cell.raw){const i=s.cell.raw,u=s.cell.width-4,p=t.splitTextToSize(i,u);p.length>1&&(s.cell.text=p,s.row.height=Math.max(s.row.height,p.length*l))}}});function o(s){return s?new Date(s).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"2-digit"}):""}return t}const O={"Laba Rugi":{fetchData:async(t,n)=>{const{data:d,error:r}=await f.from("pesanan_penjualan").select("total_dibayarkan").gte("tanggal_pesan",t).lte("tanggal_pesan",n);if(r)throw r;const{data:c,error:a}=await f.from("riwayat_stok").select("hpp, qty").eq("tipe_riwayat","penjualan").gte("tanggal",t).lte("tanggal",n);if(a)throw a;const l=d.reduce((k,S)=>k+(S.total_dibayarkan||0),0);let e;e=c.reduce((k,S)=>k+(S.hpp*S.qty||0),0),e=Math.round(e);const o=l-e,i=135e3*4/30,u=new Date(t),p=new Date(n),g=Math.floor((p-u)/(1e3*60*60*24))+1,h=Math.round(i*g),b=o-h;return{totalRevenue:l,totalCOGS:e,grossProfit:o,operatingExpenses:h,netProfit:b}},template:(t,n,d)=>{const r=new Date(n).toLocaleDateString("id-ID"),c=new Date(d).toLocaleDateString("id-ID");return`
                <h4 class="report-header">Laporan Laba Rugi ${r} - ${c}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>Keterangan</th>
                    <th>Jumlah (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>Pendapatan</td>
                    <td class="text-end">${y(t.totalRevenue)}</td>
                    </tr>
                    <tr>
                    <td>Harga Pokok Penjualan (HPP)</td>
                    <td class="text-end">${y(t.totalCOGS)}</td>
                    </tr>
                    <tr class="table-active">
                    <td><strong>Laba Kotor</strong></td>
                    <td class="text-end"><strong>${y(t.grossProfit)}</strong></td>
                    </tr>
                    <tr>
                    <td>Biaya Operasional</td>
                    <td class="text-end">${y(t.operatingExpenses)}</td>
                    </tr>
                    <tr class="table-active">
                    <td><strong>Laba Bersih</strong></td>
                    <td class="text-end"><strong>${y(t.netProfit)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}},Pembelian:{fetchData:async(t,n)=>{const d=document.getElementById("groupBy").value;if(d==="supplier"){const{data:r,error:c}=await f.from("pesanan_pembelian").select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    supplier:id_supplier(perusahaan, cp),
                    item_pesanan_pembelian(id_beli, qty_dipesan)
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n);if(c)throw c;const a=new Map;return r.forEach(l=>{var i,u,p;const e=((i=l.supplier)==null?void 0:i.perusahaan)||l.supplier.cp;a.has(e)||a.set(e,{supplier:{perusahaan:((u=l.supplier)==null?void 0:u.perusahaan)||"(Tanpa Nama Perusahaan)",cp:l.supplier.cp},totalOrders:0,totalItems:0,totalPaid:0});const o=a.get(e);o.totalOrders++,o.totalPaid+=l.total_dibayarkan||0;const s=((p=l.item_pesanan_pembelian)==null?void 0:p.reduce((g,h)=>g+(h.qty_dipesan||0),0))||0;o.totalItems+=s}),Array.from(a.values())}else if(d==="product"){const{data:r,error:c}=await f.from("item_pesanan_pembelian").select(`
                    qty_dipesan,
                    harga_beli,
                    varian:id_varian(varian, produk:id_produk(nama)),
                    pesanan_pembelian!inner(
                        id,
                        supplier:id_supplier(perusahaan, cp),
                        status_pesanan
                    )
                `).eq("pesanan_pembelian.status_pesanan","selesai").gte("pesanan_pembelian.tanggal_pesan",t).lte("pesanan_pembelian.tanggal_pesan",n);if(c)throw c;const a=r.filter(e=>{var o;return!((o=e.pesanan_pembelian)!=null&&o.supplier)});a.length>0&&console.warn("Items with missing supplier data:",a);const l=new Map;return r.forEach(e=>{var p,g,h;const o=(g=(p=e.varian)==null?void 0:p.produk)!=null&&g.nama?`${e.varian.produk.nama} - ${e.varian.varian||""}`:"Produk Tidak Dikenal";l.has(o)||l.set(o,{product:o,totalPurchased:0,totalDibayarkan:0,totalOrders:0,suppliers:new Set,orderIds:new Set});const s=l.get(o);s.totalPurchased+=e.qty_dipesan||0,s.totalDibayarkan+=(e.qty_dipesan||0)*(e.harga_beli||0),(h=e.pesanan_pembelian)!=null&&h.id&&!s.orderIds.has(e.pesanan_pembelian.id)&&(s.orderIds.add(e.pesanan_pembelian.id),s.totalOrders++);const i=e.pesanan_pembelian.supplier,u=i.perusahaan||i.cp;s.suppliers.add(u)}),Array.from(l.values()).map(e=>({...e,suppliers:Array.from(e.suppliers).join(", ")}))}else{const{data:r,error:c}=await f.from("pesanan_pembelian").select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    supplier:id_supplier(perusahaan, cp),
                    item_pesanan_pembelian(
                        id_varian,
                        qty_dipesan,
                        harga_beli,
                        varian:id_varian(
                            varian, 
                            produk:id_produk(nama)
                        )
                    )
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n).order("tanggal_pesan",{ascending:!0});if(c)throw c;return r.map(a=>{var l;return{...a,supplier:{perusahaan:((l=a.supplier)==null?void 0:l.perusahaan)||"(Tanpa Nama Perusahaan)",cp:a.supplier.cp},item_pesanan_pembelian:a.item_pesanan_pembelian||[]}})}},template:(t,n,d)=>{const r=document.getElementById("groupBy").value,c=new Date(n).toLocaleDateString("id-ID"),a=new Date(d).toLocaleDateString("id-ID");if(r==="supplier"){const l=t.reduce((o,s)=>o+(s.totalPaid||0),0),e=t.reduce((o,s)=>o+(s.totalItems||0),0);return`
                <h4 class="report-header">Laporan Pembelian per Supplier ${c} - ${a}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>No</th>
                    <th>Supplier</th>
                    <th>Total Pesanan</th>
                    <th>Total Items</th>
                    <th>Total Dibayarkan (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map((o,s)=>`
                    <tr>
                        <td>${s+1}</td>
                        <td>${o.supplier.perusahaan} (${o.supplier.cp})</td>
                        <td class="text-end">${o.totalOrders}</td>
                        <td class="text-end">${o.totalItems}</td>
                        <td class="text-end">${y(o.totalPaid)}</td>
                    </tr>
                    `).join("")}
                    <tr class="table-active">
                    <td colspan="2"><strong>Total</strong></td>
                    <td class="text-end"><strong>${t.length}</strong></td>
                    <td class="text-end"><strong>${e}</strong></td>
                    <td class="text-end"><strong>${y(l)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else if(r==="product"){const l=t.reduce((s,i)=>s+(i.totalPurchased||0),0),e=t.reduce((s,i)=>s+(i.totalOrders||0),0),o=t.reduce((s,i)=>s+(i.totalDibayarkan||0),0);return`
                <h4 class="report-header">Laporan Pembelian per Produk ${c} - ${a}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>No</th>
                    <th>Produk</th>
                    <th>Supplier</th>
                    <th class="text-end">Total Pesanan</th>
                    <th class="text-end">Total Qty.</th>
                    <th class="text-end">Total Dibayarkan</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map((s,i)=>`
                    <tr>
                        <td>${i+1}</td>
                        <td>${s.product}</td>
                        <td>${s.suppliers||"-"}</td>
                        <td class="text-end">${s.totalOrders}</td>
                        <td class="text-end">${s.totalPurchased}</td>
                        <td class="text-end">${y(s.totalDibayarkan)}</td>
                    </tr>
                    `).join("")}
                    <tr class="table-active">
                    <td colspan="3"><strong>Total</strong></td>
                    <td class="text-end"><strong>${e}</strong></td>
                    <td class="text-end"><strong>${l}</strong></td>
                    <td class="text-end"><strong>${y(o)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else{const l=t.reduce((e,o)=>e+(o.total_dibayarkan||0),0);return`
                <h4 class="report-header">Laporan Pembelian per Order ${c} - ${a}</h4>
                ${t.map(e=>{var o,s;return e.item_pesanan_pembelian.reduce((i,u)=>i+u.qty_dipesan,0),`
                        <div class="card mb-3">
                            <div class="card-header">
                                <strong>PO-${e.id.toString().padStart(4,"0")}</strong> - 
                                ${E(e.tanggal_pesan)} | 
                                Supplier: ${((o=e.supplier)==null?void 0:o.perusahaan)||"-"} (${((s=e.supplier)==null?void 0:s.cp)||"-"}) | 
                                Total: ${y(e.total_dibayarkan)}
                            </div>
                            <div class="card-body">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th class="text-end">Qty</th>
                                            <th class="text-end">Harga Satuan</th>
                                            <th class="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${e.item_pesanan_pembelian.map(i=>`
                                            <tr>
                                                <td>${i.varian.produk.nama} - ${i.varian.varian}</td>
                                                <td class="text-end">${i.qty_dipesan}</td>
                                                <td class="text-end">${y(i.harga_beli)}</td>
                                                <td class="text-end">${y(i.qty_dipesan*i.harga_beli)}</td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `}).join("")}
                <div class="alert alert-primary">
                    <strong>Total Pembelian: ${y(l)}</strong>
                </div>
            `}}},Penjualan:{fetchData:async(t,n)=>{const d=document.getElementById("groupBy").value;if(d==="customer"){const{data:r,error:c}=await f.from("pesanan_penjualan").select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    bakul:id_bakul(nama),
                    item_pesanan_penjualan(id_jual, qty_dipesan)
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n);if(c)throw c;const a=new Map;return r.forEach(l=>{var i,u;const e=((i=l.bakul)==null?void 0:i.nama)||"Walk-in";a.has(e)||a.set(e,{customer:e,totalOrders:0,totalItems:0,totalPaid:0});const o=a.get(e);o.totalOrders++,o.totalPaid+=l.total_dibayarkan||0;const s=((u=l.item_pesanan_penjualan)==null?void 0:u.reduce((p,g)=>p+(g.qty_dipesan||0),0))||0;o.totalItems+=s}),Array.from(a.values())}else if(d==="product"){const{data:r,error:c}=await f.from("item_pesanan_penjualan").select(`
                    qty_dipesan,
                    harga_jual,
                    varian:id_varian(varian, produk:id_produk(nama)),
                    pesanan_penjualan!inner(
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        bakul:id_bakul(id, nama)
                    )
                `).eq("pesanan_penjualan.status_pesanan","selesai").gte("pesanan_penjualan.tanggal_pesan",t).lte("pesanan_penjualan.tanggal_pesan",n);if(c)throw c;const a=new Map;return r.forEach(l=>{var s,i,u,p,g;const e=(i=(s=l.varian)==null?void 0:s.produk)!=null&&i.nama?`${l.varian.produk.nama} - ${l.varian.varian||""}`:"Produk Tidak Dikenal";a.has(e)||a.set(e,{product:e,totalSold:0,totalRevenue:0,totalOrders:0,bakulCount:0,bakulIds:new Set,orderIds:new Set});const o=a.get(e);o.totalSold+=l.qty_dipesan||0,o.totalRevenue+=Math.round((l.qty_dipesan||0)*(l.harga_jual||0)),(u=l.pesanan_penjualan)!=null&&u.id&&(o.orderIds.has(l.pesanan_penjualan.id)||(o.orderIds.add(l.pesanan_penjualan.id),o.totalOrders++)),(g=(p=l.pesanan_penjualan)==null?void 0:p.bakul)!=null&&g.id&&(o.bakulIds.has(l.pesanan_penjualan.bakul.id)||(o.bakulIds.add(l.pesanan_penjualan.bakul.id),o.bakulCount++))}),Array.from(a.values()).map(l=>({product:l.product,totalSold:l.totalSold,totalRevenue:l.totalRevenue,totalOrders:l.totalOrders,bakulCount:l.bakulCount}))}else{const{data:r,error:c}=await f.from("pesanan_penjualan").select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    bakul:id_bakul(nama),
                    item_pesanan_penjualan(
                        id_varian,
                        qty_dipesan,
                        harga_jual,
                        varian:id_varian(
                            varian, 
                            produk:id_produk(nama),
                            harga_standar
                        )
                    )
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n).order("tanggal_pesan",{ascending:!0});if(c)throw c;return r.map(a=>{var l;return{...a,bakul:{nama:((l=a.bakul)==null?void 0:l.nama)||"Walk-in"},item_pesanan_penjualan:(a.item_pesanan_penjualan||[]).map(e=>{var o;return{...e,priceDifference:e.harga_jual-(((o=e.varian)==null?void 0:o.harga_standar)||0)}})}})}},template:(t,n,d)=>{const r=document.getElementById("groupBy").value,c=new Date(n).toLocaleDateString("id-ID"),a=new Date(d).toLocaleDateString("id-ID");if(r==="customer"){const l=t.reduce((o,s)=>o+(s.totalPaid||0),0),e=t.reduce((o,s)=>o+(s.totalItems||0),0);return`
                <h4 class="report-header">Laporan Penjualan per Bakul ${c} - ${a}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>No</th>
                    <th>Bakul</th>
                    <th>Total Pesanan</th>
                    <th>Total Items</th>
                    <th>Total Dibayarkan (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map((o,s)=>`
                    <tr>
                        <td>${s+1}</td>
                        <td>${o.customer}</td>
                        <td class="text-end">${o.totalOrders}</td>
                        <td class="text-end">${o.totalItems}</td>
                        <td class="text-end">${y(o.totalPaid)}</td>
                    </tr>
                    `).join("")}
                    <tr class="table-active">
                    <td colspan="2"><strong>Total</strong></td>
                    <td class="text-end"><strong>${t.length}</strong></td>
                    <td class="text-end"><strong>${e}</strong></td>
                    <td class="text-end"><strong>${y(l)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else if(r==="product"){const l=t.reduce((s,i)=>s+(i.totalSold||0),0),e=t.reduce((s,i)=>s+(i.totalRevenue||0),0),o=t.reduce((s,i)=>s+(i.totalOrders||0),0);return`
                <h4 class="report-header">Laporan Penjualan per Produk ${c} - ${a}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>No</th>
                    <th>Produk</th>
                    <th>Jumlah Bakul</th>
                    <th class="text-end">Total Pesanan</th>
                    <th class="text-end">Total Terjual</th>
                    <th class="text-end">Total Pendapatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map((s,i)=>`
                    <tr>
                        <td>${i+1}</td>
                        <td>${s.product}</td>
                        <td>${s.bakulCount}</td>
                        <td class="text-end">${s.totalOrders}</td>
                        <td class="text-end">${s.totalSold}</td>
                        <td class="text-end">${y(s.totalRevenue)}</td>
                    </tr>
                    `).join("")}
                    <tr class="table-active">
                    <td colspan="3"><strong>Total</strong></td>
                    <td class="text-end"><strong>${o}</strong></td>
                    <td class="text-end"><strong>${l}</strong></td>
                    <td class="text-end"><strong>${y(e)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else{const l=t.reduce((e,o)=>e+(o.total_dibayarkan||0),0);return`
                <h4 class="report-header">Laporan Penjualan per Order ${c} - ${a}</h4>
                ${t.map(e=>{var o;return e.item_pesanan_penjualan.reduce((s,i)=>s+i.qty_dipesan,0),`
                        <div class="card mb-3">
                            <div class="card-header">
                                <strong>SO-${e.id.toString().padStart(4,"0")}</strong> - 
                                ${E(e.tanggal_pesan)} | 
                                Bakul: ${((o=e.bakul)==null?void 0:o.nama)||"Walk-in"} | 
                                Total: ${y(e.total_dibayarkan)}
                            </div>
                            <div class="card-body">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th class="text-end">Qty</th>
                                            <th class="text-end">Harga Satuan</th>
                                            <th class="text-end">Harga Standar</th>
                                            <th class="text-end">Diskon/Kenaikan</th>
                                            <th class="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${e.item_pesanan_penjualan.map(s=>{var h;const i=((h=s.varian)==null?void 0:h.harga_standar)||0,u=s.priceDifference||0,p=u===0?"0":u>0?`+${y(u)}`:y(u),g=u>0?"text-success":u<0?"text-danger":"";return`
                                                <tr>
                                                    <td>${s.varian.produk.nama} - ${s.varian.varian}</td>
                                                    <td class="text-end">${s.qty_dipesan}</td>
                                                    <td class="text-end">${y(s.harga_jual)}</td>
                                                    <td class="text-end">${y(i)}</td>
                                                    <td class="text-end ${g}">${p}</td>
                                                    <td class="text-end">${y(s.qty_dipesan*s.harga_jual)}</td>
                                                </tr>
                                            `}).join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `}).join("")}
                <div class="alert alert-primary">
                    <strong>Total Penjualan: ${y(l)}</strong>
                </div>
            `}}},"Kartu Stok":{fetchData:async(t,n)=>{const{data:d,error:r}=await f.from("riwayat_stok").select(`
                tanggal,
                tipe_riwayat,
                qty,
                saldo,
                hpp,
                varian:id_varian(id, varian, produk:id_produk(nama))
            `).gte("tanggal",t).lte("tanggal",n).order("id_varian",{ascending:!0});if(r)throw r;const c=new Map;return d.forEach(a=>{const l=a.varian.id;c.has(l)||c.set(l,{id:l,name:`${a.varian.produk.nama} - ${a.varian.varian}`,history:[],purchaseHistory:[]});const e=c.get(l);e.history.push(a),["penjualan","penyesuaian_keluar"].includes(a.tipe_riwayat)&&(e.hppHistory=e.hppHistory||[],e.hppHistory.push({qty:a.qty,hpp:a.hpp,tanggal:a.tanggal}))}),Array.from(c.values()).map(a=>{const l=a.history.sort((h,b)=>new Date(h.tanggal)-new Date(b.tanggal));let e;if(l.length>0){const h=l[0];e=["purchase","penyesuaian_masuk"].includes(h.tipe_riwayat)?h.saldo-h.qty:h.saldo+h.qty}else e=0;const o=l.filter(h=>h.tipe_riwayat==="pembelian").reduce((h,b)=>h+b.qty,0),s=l.filter(h=>h.tipe_riwayat==="penjualan").reduce((h,b)=>h+b.qty,0),i=l.filter(h=>h.tipe_riwayat==="penyesuaian_masuk").reduce((h,b)=>h+b.qty,0),u=l.filter(h=>h.tipe_riwayat==="penyesuaian_keluar").reduce((h,b)=>h+b.qty,0),p=l.length>0?l[l.length-1].saldo:e;let g=0;return a.hppHistory&&a.hppHistory.length>0&&(a.hppHistory.sort((h,b)=>new Date(b.tanggal)-new Date(h.tanggal)),g=a.hppHistory[0].hpp,console.log(`Latest HPP for ${a.name}`,a.hppHistory[0])),{id:a.id,name:a.name,initialStock:e,purchases:o,sales:s,adjustmentsIn:i,adjustmentsOut:u,finalStock:p,hpp:g}})},template:(t,n,d)=>{const r=new Date(n).toLocaleDateString("id-ID"),c=new Date(d).toLocaleDateString("id-ID");return`    
            <h4 class="report-header">Laporan Kartu Stok ${r} - ${c}</h4>
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th rowspan="2">Kode</th>
                        <th rowspan="2">Nama Barang</th>
                        <th rowspan="2" class="text-end">Stok Awal</th>
                        <th colspan="2" class="text-center">Stok Masuk</th>
                        <th colspan="2" class="text-center">Stok Keluar</th>
                        <th rowspan="2" class="text-end">Stok Akhir</th>
                        <th rowspan="2" class="text-end">HPP</th>
                    </tr>
                    <tr>
                        <!-- Subheaders for merged columns -->
                        <th class="text-end">Pembelian</th>
                        <th class="text-end">Penyesuaian</th>
                        <th class="text-end">Penjualan</th>
                        <th class="text-end">Penyesuaian</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map(a=>`
                        <tr>
                            <td>VAR${a.id.toString().padStart(4,"0")}</td>
                            <td>${a.name}</td>
                            <td class="text-end">${a.initialStock}</td>
                            <td class="text-end">${a.purchases}</td>
                            <td class="text-end">${a.adjustmentsIn}</td>
                            <td class="text-end">${a.sales}</td>
                            <td class="text-end">${a.adjustmentsOut}</td>
                            <td class="text-end">${a.finalStock}</td>
                            <td class="text-end">${y(a.hpp)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `}},"Stock Opname":{fetchData:async(t,n)=>{const{data:d,error:r}=await f.from("log_opname").select(`
                id,
                tanggal,
                status_log,
                item_opname(
                    id,
                    id_varian,
                    stok,
                    status_item_log,
                    varian:id_varian(
                        varian,
                        produk:id_produk(nama),
                        jumlah_stok
                    )
                )
            `).gte("tanggal",t).lte("tanggal",n).order("tanggal",{ascending:!1});if(r)throw r;const c=d.map(o=>o.id),{data:a,error:l}=await f.from("riwayat_stok").select("id, id_referensi, qty, tipe_riwayat").in("id_referensi",c).or("tipe_riwayat.eq.penyesuaian_masuk,tipe_riwayat.eq.penyesuaian_keluar");if(l)throw l;const e={};return a.forEach(o=>{e[o.id_referensi]||(e[o.id_referensi]=[]),e[o.id_referensi].push(o)}),{logs:d,adjustmentsByLog:e}},template:(t,n,d)=>{const r=new Date(n).toLocaleDateString("id-ID"),c=new Date(d).toLocaleDateString("id-ID");return`
        <div class="stock-opname-report">
            <h4 class="report-header">Laporan Stock Opname ${r} - ${c}</h4>
            
            <table class="table table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>ID Log</th>
                        <th>Tanggal</th>
                        <th>Status Log</th>
                        <th>ID Item</th>
                        <th>Nama Produk</th>
                        <th>Status Item</th>
                        <th>Stok</th>
                        <th>Penyesuaian</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.logs.map(a=>`
                        ${a.item_opname.map((l,e)=>{var u,p,g;const s=(t.adjustmentsByLog[a.id]||[]).find(h=>h.id===l.id),i=s?s.tipe_riwayat==="penyesuaian_masuk"?`+${s.qty}`:`-${s.qty}`:"0";return`
                                <tr class="${a.status_log==="final"?"table-success":"table-warning"}">
                                    ${e===0?`
                                        <td rowspan="${a.item_opname.length}">${a.id}</td>
                                        <td rowspan="${a.item_opname.length}">${new Date(a.tanggal).toLocaleDateString("id-ID")}</td>
                                        <td rowspan="${a.item_opname.length}">
                                            ${a.status_log}
                                        </td>
                                    `:""}
                                    <td>VAR${l.id_varian.toString().padStart(4,"0")}</td>
                                    <td>${((p=(u=l.varian)==null?void 0:u.produk)==null?void 0:p.nama)||""} - ${((g=l.varian)==null?void 0:g.varian)||""}</td>
                                    <td>${l.status_item_log}</td>
                                    <td class="text-end">${l.stok}</td>
                                    <td class="text-end ${i.startsWith("+")?"text-success":i.startsWith("-")?"text-danger":""}">
                                        ${l.status_item_log==="disesuaikan"?i:"0"}
                                    </td>
                                </tr>
                            `}).join("")}
                    `).join("")}
                </tbody>
            </table>
        </div>
        `}}};function y(t){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(t).replace("Rp","Rp ")}async function rt(){const t=T.value,n=L.value,d=I.value;if(!t||!n||!d){v("Harap pilih semua input yang diperlukan (jenis laporan, tanggal mulai, dan tanggal akhir)","error"),$();return}if(new Date(n)>new Date(d)){v("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error"),$();return}if((t==="Pembelian"||t==="Penjualan")&&!document.getElementById("groupBy").value){v("Harap pilih pengelompokkan untuk laporan ini","error"),$();return}try{j.textContent="Memuat...",C.style.display="inline-block",A.disabled=!0,$();const r=await O[t].fetchData(n,d);if(K(r)){P.innerHTML=`
                <div class="alert alert-info text-center">
                    Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.
                </div>
            `,$();return}const c=O[t].template(r,n,d);P.innerHTML=c,tt(),setTimeout(Q,100)}catch(r){console.error("Error generating report:",r),P.innerHTML=`
            <div class="alert alert-danger">
                Gagal memuat laporan: ${r.message}
            </div>
        `,$(),v("Gagal memuat laporan: "+r.message,"error")}finally{j.textContent="Buat Laporan",C.style.display="none",A.disabled=!1}}document.addEventListener("DOMContentLoaded",async()=>{await J(),T=document.getElementById("jenis"),L=document.getElementById("startDate"),I=document.getElementById("endDate"),A=document.getElementById("generateBtn"),D=document.getElementById("downloadBtn"),P=document.getElementById("report-content"),j=document.getElementById("generateText"),C=document.getElementById("generateSpinner");const t=document.getElementById("groupByContainer");X(T,t);const n=new Date,d=new Date(n.getFullYear(),n.getMonth(),1);L.valueAsDate=d,I.valueAsDate=n,$(),A.addEventListener("click",rt),D.addEventListener("click",at)});
