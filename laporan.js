const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["navbar2.js","auth.js","db_conn.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill.js";import{_ as G,s as f}from"./db_conn.js";import{i as Y,c as V}from"./auth.js";import{d as Q}from"./import.js";fetch("navbar.html").then(t=>t.text()).then(async t=>{document.getElementById("navbar").innerHTML=t,(await G(()=>import("./navbar2.js"),__vite__mapDeps([0,1,2]))).setupLogout()}).catch(t=>console.error("Error loading navbar:",t));Y();(async()=>await V())();let T,L,I,A,v,P,j,E;function W(t,n){const d=t.internal.getNumberOfPages();for(let l=1;l<=d;l++)t.setPage(l),t.setFontSize(8),t.setTextColor(100),t.setDrawColor(200),t.line(n,285,210-n,285),t.text(`Halaman ${l} dari ${d}`,105,291,{align:"center"}),t.text(`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`,105,294,{align:"center"})}function m(t){return new Intl.NumberFormat("id-ID",{minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}function C(t){return t?new Date(t).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}):""}function S(t,n="success"){const d=document.getElementById("toastContainer"),l=document.createElement("div");l.classList.add("toast"),l.setAttribute("role","alert"),l.setAttribute("aria-live","assertive"),l.setAttribute("aria-atomic","true"),l.classList.add(n==="success"?"bg-success":"bg-danger"),l.classList.add("text-white");const p=document.createElement("div");p.classList.add("toast-body"),p.textContent=t,l.appendChild(p),d.appendChild(l),new bootstrap.Toast(l,{autohide:!0,delay:3e3}).show(),l.addEventListener("hidden.bs.toast",()=>{l.remove()})}function J(){const t=document.querySelector(".report-container");t&&t.scrollTo({top:0,behavior:"smooth"})}function K(t){return Array.isArray(t)?t.length===0:typeof t=="object"&&t!==null?t.logs?t.logs.length===0:Object.keys(t).length===0:!1}function X(t,n){const d=document.createElement("label");d.className="form-label",d.innerHTML="Pengelompokkan",n.appendChild(d);const l=document.createElement("select");l.id="groupBy",l.className="form-select",l.innerHTML="",n.style.display="none",t.addEventListener("change",()=>{t.value==="Pembelian"||t.value==="Penjualan"?(n.style.display="block",Z(t.value,l),n.appendChild(l)):n.style.display="none"})}function Z(t,n){t==="Pembelian"?n.innerHTML=`
            <option value="" disabled selected>Pilih kelompok</option>
            <option value="order">Pesanan</option>
            <option value="supplier">Supplier</option>
            <option value="product">Produk</option>
        `:t==="Penjualan"&&(n.innerHTML=`
            <option value="" disabled selected>Pilih kelompok</option>
            <option value="order">Pesanan</option>
            <option value="customer">Bakul</option>
            <option value="product">Produk</option>
        `)}function k(){v.disabled=!0,v.classList.add("disabled")}function tt(){v.disabled=!1,v.classList.remove("disabled")}async function at(){var r;const{jsPDF:t}=window.jspdf,n=new t("p","mm","a4"),d=20;let l=30;const p=T.value,a=L.value,s=I.value;if(!a||!s){S("Harap pilih rentang tanggal","error");return}if(new Date(a)>new Date(s)){S("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error");return}const e=new Date(a).toLocaleDateString("id-ID"),o=new Date(s).toLocaleDateString("id-ID");n.setFont("helvetica","bold"),n.setFontSize(12),n.setTextColor(40),n.text("GUNARTO",d,15),n.setFont("helvetica","normal"),n.setFontSize(10),n.text("Pasar Klewer, Surakarta",d,20),n.setDrawColor(150),n.line(d,22,210-d,22),n.setFontSize(16),n.setTextColor(0),n.text(`LAPORAN ${p.toUpperCase()}`,105,l,{align:"center"}),l+=8,n.setFontSize(12),n.text(`${e} - ${o}`,105,l,{align:"center"}),l+=15;try{const i=await O[p].fetchData(a,s);if(K(i)){n.setFontSize(12),n.setTextColor(100),n.text("Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.",105,l,{align:"center"}),W(n,d),n.save(`Laporan_${p}_${new Date().getFullYear()}.pdf`);return}const c=((r=document.getElementById("groupBy"))==null?void 0:r.value)||"order";switch(p){case"Laba Rugi":et(n,i,l,d);break;case"Pembelian":c==="supplier"?F(n,i,l,d,{entityType:"supplier",entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)"}):c==="product"?H(n,i,l,d,{entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)",qtyLabel:"TOTAL DIBELI"}):M(n,i,l,d,{prefix:"PO",contactLabel:"Supplier",reportLabel:"Pembelian",itemField:"item_pesanan_pembelian",isPenjualan:!1});break;case"Penjualan":c==="customer"?F(n,i,l,d,{entityType:"customer",entityLabel:"BAKUL",amountLabel:"TOTAL DIBERIKAN (Rp)"}):c==="product"?H(n,i,l,d,{entityLabel:"BAKUL",amountLabel:"TOTAL PENDAPATAN (Rp)",qtyLabel:"TOTAL TERJUAL"}):M(n,i,l,d,{prefix:"SO",contactLabel:"Bakul",reportLabel:"Penjualan",itemField:"item_pesanan_penjualan",isPenjualan:!0});break;case"Kartu Stok":nt(n,i,l,d);break;case"Stock Opname":lt(n,i,l,d);break}W(n,d),n.save(`Laporan_${p}_${new Date().getFullYear()}.pdf`)}catch(i){console.error("Error generating PDF:",i),S("Gagal membuat PDF: "+i.message,"error")}}function et(t,n,d,l){const p=[["Pendapatan",m(n.totalRevenue)],["Harga Pokok Penjualan (HPP)",m(n.totalCOGS)],["Laba Kotor",m(n.grossProfit)],["Biaya Operasional",m(n.operatingExpenses)],["Laba Bersih",m(n.netProfit)]];t.autoTable({head:[["KETERANGAN","JUMLAH (Rp)"]],body:p,startY:d,margin:{left:l,right:l},theme:"grid",headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",fontSize:11,halign:"center",valign:"middle",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,fontSize:10,lineWidth:.1,lineColor:[0,0,0],cellPadding:2,valign:"middle"},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{0:{halign:"left"},1:{halign:"right",cellWidth:60}},didParseCell:a=>{const s=a.row.index,e=s===2||s===4;a.section==="body"&&e&&(a.cell.styles.fontStyle="bold",a.cell.styles.fillColor=[0,0,0],a.cell.styles.textColor=[255,255,255],a.column.index===0&&(a.cell.styles.halign="right"))},didDrawCell:a=>{if(a.column.index===1&&typeof a.cell.raw=="string"){const s=parseFloat(a.cell.raw.replace(/\./g,"").replace(",","."));a.cell.text=m(s)}}})}function F(t,n,d,l,p){const{entityType:a,entityLabel:s,amountLabel:e}=p,o=n.reduce((u,g)=>u+(g.totalPaid||g.totalRevenue||0),0),r=n.reduce((u,g)=>u+(g.totalItems||g.totalSold||0),0),i=["NO",s,"TOTAL PESANAN","TOTAL ITEMS",e],c=n.map((u,g)=>{var h,b;return[g+1,a==="supplier"?`${((h=u.supplier)==null?void 0:h.perusahaan)||"-"}
${((b=u.supplier)==null?void 0:b.cp)||"-"}`:a==="customer"?u.customer:u.product,u.totalOrders,a==="product"?u.totalPurchased||u.totalSold:u.totalItems,m(u.totalPaid||u.totalRevenue||u.totalDibayarkan)]});c.push(["","TOTAL",n.length,r,m(o)]),t.autoTable({head:[i],body:c,startY:d,margin:{left:l,right:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},[c.length-1]:{fontStyle:"bold",fillColor:[220,220,220]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function H(t,n,d,l,p){const{entityLabel:a,amountLabel:s}=p,e=n.reduce((c,u)=>c+(u.totalPurchased||u.totalSold||0),0),o=n.reduce((c,u)=>c+(u.totalDibayarkan||u.totalRevenue||0),0),r=["NO","PRODUK",a,"TOTAL PESANAN",p.qtyLabel,s],i=n.map((c,u)=>[u+1,c.product,c.suppliers||c.customers||"-",c.totalOrders,c.totalPurchased||c.totalSold,m(c.totalDibayarkan||c.totalRevenue)]);i.push(["","TOTAL","",n.length,e,m(o)]),t.autoTable({head:[r],body:i,startY:d,margin:{left:l,right:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{3:{halign:"right"},4:{halign:"right"},5:{halign:"right"},[i.length-1]:{fontStyle:"bold",fillColor:[255,255,255]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function M(t,n,d,l,p){const{prefix:a,contactLabel:s,reportLabel:e,itemField:o,isPenjualan:r}=p,i=n.reduce((c,u)=>c+(u.total_dibayarkan||0),0);t.setFontSize(12),t.setTextColor(0),t.text(`Daftar Pesanan ${e}`,l,d),d+=10,n.forEach((c,u)=>{var b,w,D,B;(b=c[o])!=null&&b.reduce((_,x)=>_+(x.qty_dipesan||0),0),t.setFontSize(10),t.setFont("helvetica","bold"),t.text(`${a}-${c.id.toString().padStart(4,"0")} - ${C(c.tanggal_pesan)}`,l,d),d+=5,t.setFont("helvetica","normal"),r?t.text(`${s}: ${((w=c.bakul)==null?void 0:w.nama)||"Walk-in"}`,l,d):t.text(`${s}: ${((D=c.supplier)==null?void 0:D.perusahaan)||"-"} (${((B=c.supplier)==null?void 0:B.cp)||"-"})`,l,d),d+=5,t.text(`Total: ${m(c.total_dibayarkan)}`,l,d),d+=5;const g=r?["PRODUK","QTY","HARGA SATUAN","HARGA STANDAR","DISKON/KENAIKAN","SUBTOTAL"]:["PRODUK","QTY","HARGA SATUAN","SUBTOTAL"],h=(c[o]||[]).map(_=>{var R,N,q;const x=(N=(R=_.varian)==null?void 0:R.produk)!=null&&N.nama?`${_.varian.produk.nama} - ${_.varian.varian||""}`:"Unknown Product";if(r){const U=((q=_.varian)==null?void 0:q.harga_standar)||0,$=_.priceDifference||0,z=$===0?"0":$>0?`+${m($)}`:m($);return[x,_.qty_dipesan||0,m(_.harga_jual),m(U),{content:z,styles:{textColor:$>0?[0,128,0]:$<0?[255,0,0]:[0,0,0]}},m((_.qty_dipesan||0)*(_.harga_jual||0))]}else return[x,_.qty_dipesan||0,m(_.harga_beli||0),m((_.qty_dipesan||0)*(_.harga_beli||0))]});t.autoTable({head:[g],body:h,startY:d,margin:{left:l,right:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},columnStyles:{0:{cellWidth:35},1:{cellWidth:12,halign:"right"},2:{cellWidth:30,halign:"right"},...r?{3:{cellWidth:32,halign:"right"},4:{cellWidth:35,halign:"right"},5:{cellWidth:25,halign:"right"}}:{3:{cellWidth:25,halign:"right"}}},alternateRowStyles:{fillColor:[255,255,255]},styles:{fontSize:9,cellPadding:2,overflow:"linebreak"},didDrawPage:_=>{d=_.cursor.y+5}}),d+=10,d>250&&u<n.length-1&&(t.addPage(),d=30)}),t.setFont("helvetica","bold"),t.text(`Total ${e}: ${m(i)}`,l,d)}function nt(t,n,d,l){t.setFontSize(14),t.setTextColor(0);const p=n.map(e=>[`VAR${e.id.toString().padStart(4,"0")}`,e.name,a(e.initialStock),a(e.purchases),a(e.adjustmentsIn),a(e.sales),a(e.adjustmentsOut),a(e.finalStock),s(e.hpp)]);t.autoTable({head:[[{content:"KODE",rowSpan:2},{content:"BARANG",rowSpan:2},{content:"AWAL",rowSpan:2},{content:"MASUK",colSpan:2},{content:"KELUAR",colSpan:2},{content:"AKHIR",rowSpan:2},{content:"HPP",rowSpan:2}],["PEMBELIAN","PENYESUAIAN","PENJUALAN","PENYESUAIAN"]],body:p,startY:d,margin:{left:l,right:l},tableWidth:"auto",headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",valign:"middle",halign:"center"},columnStyles:{0:{cellWidth:"auto",halign:"left"},1:{cellWidth:"auto",halign:"left"},2:{cellWidth:"auto",halign:"right"},3:{cellWidth:"auto",halign:"right"},4:{cellWidth:"auto",halign:"right"},5:{cellWidth:"auto",halign:"right"},6:{cellWidth:"auto",halign:"right"},7:{cellWidth:"auto",halign:"right"},8:{cellWidth:"auto",halign:"right"}},styles:{fontSize:9,cellPadding:3,lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{textColor:[0,0,0],valign:"middle"},alternateRowStyles:{fillColor:[255,255,255]}});function a(e){return new Intl.NumberFormat("id-ID").format(e)}function s(e){return isNaN(e)||e===null?"-":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0,maximumFractionDigits:0}).format(e).replace("Rp","").trim()}return t}function lt(t,n,d=30,l=14){const{logs:p,adjustmentsByLog:a}=n;t.setFont("helvetica"),t.setFontSize(9);const s=5,e=[];p.forEach(r=>{r.item_opname.forEach(i=>{var h,b,w;const c=(a[r.id]||[]).find(D=>D.id===i.id),u=c?c.tipe_riwayat==="penyesuaian_masuk"?`+${c.qty}`:`-${c.qty}`:"0",g=`${((b=(h=i.varian)==null?void 0:h.produk)==null?void 0:b.nama)||""} - ${((w=i.varian)==null?void 0:w.varian)||""}`;e.push([r.id.toString(),o(r.tanggal),r.status_log,`VAR${i.id_varian.toString().padStart(4,"0")}`,{content:g,styles:{cellWidth:40,valign:"middle"}},i.status_item_log,{content:i.stok.toString(),styles:{halign:"right"}},{content:i.status_item_log==="disesuaikan"?u:"0",styles:{halign:"right",textColor:u.startsWith("+")?[0,128,0]:u.startsWith("-")?[255,0,0]:[0,0,0]}}])})}),t.autoTable({head:[["ID","TANGGAL","STATUS","ITEM","PRODUK","STATUS","STOK","PENY."]],body:e,startY:d+2,margin:{left:l,right:l},tableWidth:"auto",styles:{fontSize:10,cellPadding:2,lineWidth:.1,lineColor:[0,0,0],lineHeight:s},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",halign:"center"},bodyStyles:{valign:"middle",textColor:0},columnStyles:{0:{cellWidth:10},1:{cellWidth:25},2:{cellWidth:20},3:{cellWidth:20},4:{cellWidth:45},5:{cellWidth:25},6:{cellWidth:15},7:{cellWidth:15}},alternateRowStyles:{fillColor:[255,255,255]},didDrawCell:r=>{if(r.column.index===4&&r.cell.raw){const i=r.cell.raw,c=r.cell.width-4,u=t.splitTextToSize(i,c);u.length>1&&(r.cell.text=u,r.row.height=Math.max(r.row.height,u.length*s))}}});function o(r){return r?new Date(r).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"2-digit"}):""}return t}const O={"Laba Rugi":{fetchData:async(t,n)=>{const{data:d,error:l}=await f.from("pesanan_penjualan").select("total_dibayarkan").gte("tanggal_pesan",t).lte("tanggal_pesan",n);if(l)throw l;const{data:p,error:a}=await f.from("riwayat_stok").select("hpp, qty").eq("tipe_riwayat","penjualan").gte("tanggal",t).lte("tanggal",n);if(a)throw a;const s=d.reduce((c,u)=>c+(u.total_dibayarkan||0),0);let e;e=p.reduce((c,u)=>c+(u.hpp*u.qty||0),0),e=Math.round(e);const o=s-e,r=135e3*4,i=o-r;return{totalRevenue:s,totalCOGS:e,grossProfit:o,operatingExpenses:r,netProfit:i}},template:(t,n,d)=>{const l=new Date(n).toLocaleDateString("id-ID"),p=new Date(d).toLocaleDateString("id-ID");return`
                <h4 class="report-header">Laporan Laba Rugi ${l} - ${p}</h4>
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
            `}},Pembelian:{fetchData:async(t,n)=>{const d=document.getElementById("groupBy").value;if(d==="supplier"){const{data:l,error:p}=await f.from("pesanan_pembelian").select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    supplier:id_supplier(perusahaan, cp),
                    item_pesanan_pembelian(id_beli, qty_dipesan)
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n);if(p)throw p;const a=new Map;return l.forEach(s=>{var i,c,u;const e=((i=s.supplier)==null?void 0:i.perusahaan)||s.supplier.cp;a.has(e)||a.set(e,{supplier:{perusahaan:((c=s.supplier)==null?void 0:c.perusahaan)||"(Tanpa Nama Perusahaan)",cp:s.supplier.cp},totalOrders:0,totalItems:0,totalPaid:0});const o=a.get(e);o.totalOrders++,o.totalPaid+=s.total_dibayarkan||0;const r=((u=s.item_pesanan_pembelian)==null?void 0:u.reduce((g,h)=>g+(h.qty_dipesan||0),0))||0;o.totalItems+=r}),Array.from(a.values())}else if(d==="product"){const{data:l,error:p}=await f.from("item_pesanan_pembelian").select(`
                    qty_dipesan,
                    harga_beli,
                    varian:id_varian(varian, produk:id_produk(nama)),
                    pesanan_pembelian!inner(
                        id,
                        supplier:id_supplier(perusahaan, cp),
                        status_pesanan
                    )
                `).eq("pesanan_pembelian.status_pesanan","selesai").gte("pesanan_pembelian.tanggal_pesan",t).lte("pesanan_pembelian.tanggal_pesan",n);if(p)throw p;const a=l.filter(e=>{var o;return!((o=e.pesanan_pembelian)!=null&&o.supplier)});a.length>0&&console.warn("Items with missing supplier data:",a);const s=new Map;return l.forEach(e=>{var u,g,h;const o=(g=(u=e.varian)==null?void 0:u.produk)!=null&&g.nama?`${e.varian.produk.nama} - ${e.varian.varian||""}`:"Produk Tidak Dikenal";s.has(o)||s.set(o,{product:o,totalPurchased:0,totalDibayarkan:0,totalOrders:0,suppliers:new Set,orderIds:new Set});const r=s.get(o);r.totalPurchased+=e.qty_dipesan||0,r.totalDibayarkan+=(e.qty_dipesan||0)*(e.harga_beli||0),(h=e.pesanan_pembelian)!=null&&h.id&&!r.orderIds.has(e.pesanan_pembelian.id)&&(r.orderIds.add(e.pesanan_pembelian.id),r.totalOrders++);const i=e.pesanan_pembelian.supplier,c=i.perusahaan||i.cp;r.suppliers.add(c)}),Array.from(s.values()).map(e=>({...e,suppliers:Array.from(e.suppliers).join(", ")}))}else{const{data:l,error:p}=await f.from("pesanan_pembelian").select(`
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
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n).order("tanggal_pesan",{ascending:!0});if(p)throw p;return l.map(a=>{var s;return{...a,supplier:{perusahaan:((s=a.supplier)==null?void 0:s.perusahaan)||"(Tanpa Nama Perusahaan)",cp:a.supplier.cp},item_pesanan_pembelian:a.item_pesanan_pembelian||[]}})}},template:(t,n,d)=>{const l=document.getElementById("groupBy").value,p=new Date(n).toLocaleDateString("id-ID"),a=new Date(d).toLocaleDateString("id-ID");if(l==="supplier"){const s=t.reduce((o,r)=>o+(r.totalPaid||0),0),e=t.reduce((o,r)=>o+(r.totalItems||0),0);return`
                <h4 class="report-header">Laporan Pembelian per Supplier ${p} - ${a}</h4>
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
                    ${t.map((o,r)=>`
                    <tr>
                        <td>${r+1}</td>
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
                    <td class="text-end"><strong>${y(s)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else if(l==="product"){const s=t.reduce((r,i)=>r+(i.totalPurchased||0),0),e=t.reduce((r,i)=>r+(i.totalOrders||0),0),o=t.reduce((r,i)=>r+(i.totalDibayarkan||0),0);return`
                <h4 class="report-header">Laporan Pembelian per Produk ${p} - ${a}</h4>
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
                    ${t.map((r,i)=>`
                    <tr>
                        <td>${i+1}</td>
                        <td>${r.product}</td>
                        <td>${r.suppliers||"-"}</td>
                        <td class="text-end">${r.totalOrders}</td>
                        <td class="text-end">${r.totalPurchased}</td>
                        <td class="text-end">${y(r.totalDibayarkan)}</td>
                    </tr>
                    `).join("")}
                    <tr class="table-active">
                    <td colspan="3"><strong>Total</strong></td>
                    <td class="text-end"><strong>${e}</strong></td>
                    <td class="text-end"><strong>${s}</strong></td>
                    <td class="text-end"><strong>${y(o)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else{const s=t.reduce((e,o)=>e+(o.total_dibayarkan||0),0);return`
                <h4 class="report-header">Laporan Pembelian per Order ${p} - ${a}</h4>
                ${t.map(e=>{var o,r;return e.item_pesanan_pembelian.reduce((i,c)=>i+c.qty_dipesan,0),`
                        <div class="card mb-3">
                            <div class="card-header">
                                <strong>PO-${e.id.toString().padStart(4,"0")}</strong> - 
                                ${C(e.tanggal_pesan)} | 
                                Supplier: ${((o=e.supplier)==null?void 0:o.perusahaan)||"-"} (${((r=e.supplier)==null?void 0:r.cp)||"-"}) | 
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
                    <strong>Total Pembelian: ${y(s)}</strong>
                </div>
            `}}},Penjualan:{fetchData:async(t,n)=>{const d=document.getElementById("groupBy").value;if(d==="customer"){const{data:l,error:p}=await f.from("pesanan_penjualan").select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    bakul:id_bakul(nama),
                    item_pesanan_penjualan(id_jual, qty_dipesan)
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n);if(p)throw p;const a=new Map;return l.forEach(s=>{var i,c;const e=((i=s.bakul)==null?void 0:i.nama)||"Walk-in";a.has(e)||a.set(e,{customer:e,totalOrders:0,totalItems:0,totalPaid:0});const o=a.get(e);o.totalOrders++,o.totalPaid+=s.total_dibayarkan||0;const r=((c=s.item_pesanan_penjualan)==null?void 0:c.reduce((u,g)=>u+(g.qty_dipesan||0),0))||0;o.totalItems+=r}),Array.from(a.values())}else if(d==="product"){const{data:l,error:p}=await f.from("item_pesanan_penjualan").select(`
                    qty_dipesan,
                    harga_jual,
                    varian:id_varian(varian, produk:id_produk(nama)),
                    pesanan_penjualan!inner(
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        bakul:id_bakul(nama)
                    )
                `).eq("pesanan_penjualan.status_pesanan","selesai").gte("pesanan_penjualan.tanggal_pesan",t).lte("pesanan_penjualan.tanggal_pesan",n);if(p)throw p;const a=new Map;return l.forEach(s=>{var i,c,u,g;const e=(c=(i=s.varian)==null?void 0:i.produk)!=null&&c.nama?`${s.varian.produk.nama} - ${s.varian.varian||""}`:"Produk Tidak Dikenal";a.has(e)||a.set(e,{product:e,totalSold:0,totalRevenue:0,totalOrders:0,customers:new Set,orderIds:new Set});const o=a.get(e);o.totalSold+=s.qty_dipesan||0,o.totalRevenue+=Math.round((s.qty_dipesan||0)*(s.harga_jual||0)),(u=s.pesanan_penjualan)!=null&&u.id&&!o.orderIds.has(s.pesanan_penjualan.id)&&(o.orderIds.add(s.pesanan_penjualan.id),o.totalOrders++);const r=((g=s.pesanan_penjualan.bakul)==null?void 0:g.nama)||"Walk-in";o.customers.add(r)}),Array.from(a.values()).map(s=>({...s,customers:Array.from(s.customers).join(", ")}))}else{const{data:l,error:p}=await f.from("pesanan_penjualan").select(`
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
                `).eq("status_pesanan","selesai").gte("tanggal_pesan",t).lte("tanggal_pesan",n).order("tanggal_pesan",{ascending:!0});if(p)throw p;return l.map(a=>{var s;return{...a,bakul:{nama:((s=a.bakul)==null?void 0:s.nama)||"Walk-in"},item_pesanan_penjualan:(a.item_pesanan_penjualan||[]).map(e=>{var o;return{...e,priceDifference:e.harga_jual-(((o=e.varian)==null?void 0:o.harga_standar)||0)}})}})}},template:(t,n,d)=>{const l=document.getElementById("groupBy").value,p=new Date(n).toLocaleDateString("id-ID"),a=new Date(d).toLocaleDateString("id-ID");if(l==="customer"){const s=t.reduce((o,r)=>o+(r.totalPaid||0),0),e=t.reduce((o,r)=>o+(r.totalItems||0),0);return`
                <h4 class="report-header">Laporan Penjualan per Bakul ${p} - ${a}</h4>
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
                    ${t.map((o,r)=>`
                    <tr>
                        <td>${r+1}</td>
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
                    <td class="text-end"><strong>${y(s)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else if(l==="product"){const s=t.reduce((r,i)=>r+(i.totalSold||0),0),e=t.reduce((r,i)=>r+(i.totalRevenue||0),0),o=t.reduce((r,i)=>r+(i.totalOrders||0),0);return`
                <h4 class="report-header">Laporan Penjualan per Produk ${p} - ${a}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>No</th>
                    <th>Produk</th>
                    <th>Bakul</th>
                    <th class="text-end">Total Pesanan</th>
                    <th class="text-end">Total Terjual</th>
                    <th class="text-end">Total Pendapatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map((r,i)=>`
                    <tr>
                        <td>${i+1}</td>
                        <td>${r.product}</td>
                        <td>${r.customers||"-"}</td>
                        <td class="text-end">${r.totalOrders}</td>
                        <td class="text-end">${r.totalSold}</td>
                        <td class="text-end">${y(r.totalRevenue)}</td>
                    </tr>
                    `).join("")}
                    <tr class="table-active">
                    <td colspan="3"><strong>Total</strong></td>
                    <td class="text-end"><strong>${o}</strong></td>
                    <td class="text-end"><strong>${s}</strong></td>
                    <td class="text-end"><strong>${y(e)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `}else{const s=t.reduce((e,o)=>e+(o.total_dibayarkan||0),0);return`
                <h4 class="report-header">Laporan Penjualan per Order ${p} - ${a}</h4>
                ${t.map(e=>{var o;return e.item_pesanan_penjualan.reduce((r,i)=>r+i.qty_dipesan,0),`
                        <div class="card mb-3">
                            <div class="card-header">
                                <strong>SO-${e.id.toString().padStart(4,"0")}</strong> - 
                                ${C(e.tanggal_pesan)} | 
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
                                        ${e.item_pesanan_penjualan.map(r=>{var h;const i=((h=r.varian)==null?void 0:h.harga_standar)||0,c=r.priceDifference||0,u=c===0?"0":c>0?`+${y(c)}`:y(c),g=c>0?"text-success":c<0?"text-danger":"";return`
                                                <tr>
                                                    <td>${r.varian.produk.nama} - ${r.varian.varian}</td>
                                                    <td class="text-end">${r.qty_dipesan}</td>
                                                    <td class="text-end">${y(r.harga_jual)}</td>
                                                    <td class="text-end">${y(i)}</td>
                                                    <td class="text-end ${g}">${u}</td>
                                                    <td class="text-end">${y(r.qty_dipesan*r.harga_jual)}</td>
                                                </tr>
                                            `}).join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `}).join("")}
                <div class="alert alert-primary">
                    <strong>Total Penjualan: ${y(s)}</strong>
                </div>
            `}}},"Kartu Stok":{fetchData:async(t,n)=>{const{data:d,error:l}=await f.from("riwayat_stok").select(`
                tanggal,
                tipe_riwayat,
                qty,
                saldo,
                hpp,
                varian:id_varian(id, varian, produk:id_produk(nama))
            `).gte("tanggal",t).lte("tanggal",n).order("id_varian",{ascending:!0});if(l)throw l;const p=new Map;return d.forEach(a=>{const s=a.varian.id;p.has(s)||p.set(s,{id:s,name:`${a.varian.produk.nama} - ${a.varian.varian}`,history:[],purchaseHistory:[]});const e=p.get(s);e.history.push(a),["penjualan","penyesuaian_keluar"].includes(a.tipe_riwayat)&&(e.hppHistory=e.hppHistory||[],e.hppHistory.push({qty:a.qty,hpp:a.hpp,tanggal:a.tanggal}))}),Array.from(p.values()).map(a=>{const s=a.history.sort((h,b)=>new Date(h.tanggal)-new Date(b.tanggal));let e;if(s.length>0){const h=s[0];e=["purchase","penyesuaian_masuk"].includes(h.tipe_riwayat)?h.saldo-h.qty:h.saldo+h.qty}else e=0;const o=s.filter(h=>h.tipe_riwayat==="pembelian").reduce((h,b)=>h+b.qty,0),r=s.filter(h=>h.tipe_riwayat==="penjualan").reduce((h,b)=>h+b.qty,0),i=s.filter(h=>h.tipe_riwayat==="penyesuaian_masuk").reduce((h,b)=>h+b.qty,0),c=s.filter(h=>h.tipe_riwayat==="penyesuaian_keluar").reduce((h,b)=>h+b.qty,0),u=s.length>0?s[s.length-1].saldo:e;let g=0;return a.hppHistory&&a.hppHistory.length>0&&(a.hppHistory.sort((h,b)=>new Date(b.tanggal)-new Date(h.tanggal)),g=a.hppHistory[0].hpp,console.log(`Latest HPP for ${a.name}`,a.hppHistory[0])),{id:a.id,name:a.name,initialStock:e,purchases:o,sales:r,adjustmentsIn:i,adjustmentsOut:c,finalStock:u,hpp:g}})},template:(t,n,d)=>{const l=new Date(n).toLocaleDateString("id-ID"),p=new Date(d).toLocaleDateString("id-ID");return`    
            <h4 class="report-header">Laporan Kartu Stok ${l} - ${p}</h4>
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
        `}},"Stock Opname":{fetchData:async(t,n)=>{const{data:d,error:l}=await f.from("log_opname").select(`
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
            `).gte("tanggal",t).lte("tanggal",n).order("tanggal",{ascending:!1});if(l)throw l;const p=d.map(o=>o.id),{data:a,error:s}=await f.from("riwayat_stok").select("id, id_referensi, qty, tipe_riwayat").in("id_referensi",p).or("tipe_riwayat.eq.penyesuaian_masuk,tipe_riwayat.eq.penyesuaian_keluar");if(s)throw s;const e={};return a.forEach(o=>{e[o.id_referensi]||(e[o.id_referensi]=[]),e[o.id_referensi].push(o)}),{logs:d,adjustmentsByLog:e}},template:(t,n,d)=>{const l=new Date(n).toLocaleDateString("id-ID"),p=new Date(d).toLocaleDateString("id-ID");return`
        <div class="stock-opname-report">
            <h4 class="report-header">Laporan Stock Opname ${l} - ${p}</h4>
            
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
                        ${a.item_opname.map((s,e)=>{var c,u,g;const r=(t.adjustmentsByLog[a.id]||[]).find(h=>h.id===s.id),i=r?r.tipe_riwayat==="penyesuaian_masuk"?`+${r.qty}`:`-${r.qty}`:"0";return`
                                <tr class="${a.status_log==="final"?"table-success":"table-warning"}">
                                    ${e===0?`
                                        <td rowspan="${a.item_opname.length}">${a.id}</td>
                                        <td rowspan="${a.item_opname.length}">${new Date(a.tanggal).toLocaleDateString("id-ID")}</td>
                                        <td rowspan="${a.item_opname.length}">
                                            ${a.status_log}
                                        </td>
                                    `:""}
                                    <td>VAR${s.id_varian.toString().padStart(4,"0")}</td>
                                    <td>${((u=(c=s.varian)==null?void 0:c.produk)==null?void 0:u.nama)||""} - ${((g=s.varian)==null?void 0:g.varian)||""}</td>
                                    <td>${s.status_item_log}</td>
                                    <td class="text-end">${s.stok}</td>
                                    <td class="text-end ${i.startsWith("+")?"text-success":i.startsWith("-")?"text-danger":""}">
                                        ${s.status_item_log==="disesuaikan"?i:"0"}
                                    </td>
                                </tr>
                            `}).join("")}
                    `).join("")}
                </tbody>
            </table>
        </div>
        `}}};function y(t){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(t).replace("Rp","Rp ")}async function rt(){const t=T.value,n=L.value,d=I.value;if(!t||!n||!d){S("Harap pilih semua input yang diperlukan (jenis laporan, tanggal mulai, dan tanggal akhir)","error"),k();return}if(new Date(n)>new Date(d)){S("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error"),k();return}if((t==="Pembelian"||t==="Penjualan")&&!document.getElementById("groupBy").value){S("Harap pilih pengelompokkan untuk laporan ini","error"),k();return}try{j.textContent="Memuat...",E.style.display="inline-block",A.disabled=!0,k();const l=await O[t].fetchData(n,d);if(K(l)){P.innerHTML=`
                <div class="alert alert-info text-center">
                    Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.
                </div>
            `,k();return}const p=O[t].template(l,n,d);P.innerHTML=p,tt(),setTimeout(J,100)}catch(l){console.error("Error generating report:",l),P.innerHTML=`
            <div class="alert alert-danger">
                Gagal memuat laporan: ${l.message}
            </div>
        `,k(),S("Gagal memuat laporan: "+l.message,"error")}finally{j.textContent="Buat Laporan",E.style.display="none",A.disabled=!1}}document.addEventListener("DOMContentLoaded",async()=>{await Q(),T=document.getElementById("jenis"),L=document.getElementById("startDate"),I=document.getElementById("endDate"),A=document.getElementById("generateBtn"),v=document.getElementById("downloadBtn"),P=document.getElementById("report-content"),j=document.getElementById("generateText"),E=document.getElementById("generateSpinner");const t=document.getElementById("groupByContainer");X(T,t);const n=new Date,d=new Date(n.getFullYear(),n.getMonth(),1);L.valueAsDate=d,I.valueAsDate=n,k(),A.addEventListener("click",rt),v.addEventListener("click",at)});
