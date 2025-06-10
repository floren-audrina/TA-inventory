import{s as k}from"./db_conn-Cc8gtU8M.js";import{i as rt,c as st,l as ot,d as it}from"./navbarLoad-DYllWcRA.js";const{jsPDF:ut}=window.jspdf;rt();(async()=>(await st(),await ot()))();function I(m,x="success"){const P=document.getElementById("toastContainer"),S=document.createElement("div");S.classList.add("toast"),S.setAttribute("role","alert"),S.setAttribute("aria-live","assertive"),S.setAttribute("aria-atomic","true"),S.classList.add(x==="success"?"bg-success":"bg-danger"),S.classList.add("text-white");const $=document.createElement("div");$.classList.add("toast-body"),$.textContent=m,S.appendChild($),P.appendChild(S),new bootstrap.Toast(S,{autohide:!0,delay:3e3}).show(),S.addEventListener("hidden.bs.toast",()=>{S.remove()})}function dt(){const m=document.querySelector(".report-container");m&&m.scrollTo({top:0,behavior:"smooth"})}function Y(m){return Array.isArray(m)?m.length===0:typeof m=="object"&&m!==null?m.logs?m.logs.length===0:Object.keys(m).length===0:!1}document.addEventListener("DOMContentLoaded",async()=>{await it();const m=document.getElementById("jenis"),x=document.getElementById("startDate"),P=document.getElementById("endDate"),S=document.getElementById("generateBtn"),$=document.getElementById("downloadBtn"),A=document.getElementById("report-content"),N=document.getElementById("generateText"),q=document.getElementById("generateSpinner"),T=document.getElementById("groupByContainer"),B=document.createElement("label");B.className="form-label",B.innerHTML="Pengelompokkan",T.appendChild(B);const v=document.createElement("select");v.id="groupBy",v.className="form-select",v.innerHTML="",T.style.display="none",m.addEventListener("change",()=>{m.value==="Pembelian"||m.value==="Penjualan"?(T.style.display="block",Q(m.value),T.appendChild(v)):T.style.display="none"});function Q(e){e==="Pembelian"?v.innerHTML=`
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="supplier">Supplier</option>
                <option value="product">Produk</option>
            `:e==="Penjualan"&&(v.innerHTML=`
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="customer">Bakul</option>
                <option value="product">Produk</option>
            `)}const O=new Date,V=new Date(O.getFullYear(),O.getMonth(),1);x.valueAsDate=V,P.valueAsDate=O;const R={"Laba Rugi":{fetchData:async(e,r)=>{const{data:d,error:s}=await k.from("pesanan_penjualan").select("total_dibayarkan").gte("tanggal_pesan",e).lte("tanggal_pesan",r);if(s)throw s;const{data:p,error:t}=await k.from("riwayat_stok").select("hpp, qty").eq("tipe_riwayat","penjualan").gte("tanggal",e).lte("tanggal",r);if(t)throw t;const l=d.reduce((c,u)=>c+(u.total_dibayarkan||0),0);let a;a=p.reduce((c,u)=>c+(u.hpp*u.qty||0),0),a=Math.round(a);const o=l-a,n=135e3*4,i=o-n;return{totalRevenue:l,totalCOGS:a,grossProfit:o,operatingExpenses:n,netProfit:i}},template:(e,r,d)=>{const s=new Date(r).toLocaleDateString("id-ID"),p=new Date(d).toLocaleDateString("id-ID");return`
                    <h4 class="report-header">Laporan Laba Rugi ${s} - ${p}</h4>
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
                        <td class="text-end">${y(e.totalRevenue)}</td>
                        </tr>
                        <tr>
                        <td>Harga Pokok Penjualan (HPP)</td>
                        <td class="text-end">${y(e.totalCOGS)}</td>
                        </tr>
                        <tr class="table-active">
                        <td><strong>Laba Kotor</strong></td>
                        <td class="text-end"><strong>${y(e.grossProfit)}</strong></td>
                        </tr>
                        <tr>
                        <td>Biaya Operasional</td>
                        <td class="text-end">${y(e.operatingExpenses)}</td>
                        </tr>
                        <tr class="table-active">
                        <td><strong>Laba Bersih</strong></td>
                        <td class="text-end"><strong>${y(e.netProfit)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}},Pembelian:{fetchData:async(e,r)=>{const d=document.getElementById("groupBy").value;if(d==="supplier"){const{data:s,error:p}=await k.from("pesanan_pembelian").select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        supplier:id_supplier(perusahaan, cp),
                        item_pesanan_pembelian(id_beli, qty_dipesan)
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",e).lte("tanggal_pesan",r);if(p)throw p;const t=new Map;return s.forEach(l=>{var i,c,u;const a=((i=l.supplier)==null?void 0:i.perusahaan)||l.supplier.cp;t.has(a)||t.set(a,{supplier:{perusahaan:((c=l.supplier)==null?void 0:c.perusahaan)||"(Tanpa Nama Perusahaan)",cp:l.supplier.cp},totalOrders:0,totalItems:0,totalPaid:0});const o=t.get(a);o.totalOrders++,o.totalPaid+=l.total_dibayarkan||0;const n=((u=l.item_pesanan_pembelian)==null?void 0:u.reduce((g,h)=>g+(h.qty_dipesan||0),0))||0;o.totalItems+=n}),Array.from(t.values())}else if(d==="product"){const{data:s,error:p}=await k.from("item_pesanan_pembelian").select(`
                        qty_dipesan,
                        harga_beli,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_pembelian!inner(
                            id,
                            supplier:id_supplier(perusahaan, cp),
                            status_pesanan
                        )
                    `).eq("pesanan_pembelian.status_pesanan","selesai").gte("pesanan_pembelian.tanggal_pesan",e).lte("pesanan_pembelian.tanggal_pesan",r);if(p)throw p;const t=s.filter(a=>{var o;return!((o=a.pesanan_pembelian)!=null&&o.supplier)});t.length>0&&console.warn("Items with missing supplier data:",t);const l=new Map;return s.forEach(a=>{var u,g,h;const o=(g=(u=a.varian)==null?void 0:u.produk)!=null&&g.nama?`${a.varian.produk.nama} - ${a.varian.varian||""}`:"Produk Tidak Dikenal";l.has(o)||l.set(o,{product:o,totalPurchased:0,totalDibayarkan:0,totalOrders:0,suppliers:new Set,orderIds:new Set});const n=l.get(o);n.totalPurchased+=a.qty_dipesan||0,n.totalDibayarkan+=(a.qty_dipesan||0)*(a.harga_beli||0),(h=a.pesanan_pembelian)!=null&&h.id&&!n.orderIds.has(a.pesanan_pembelian.id)&&(n.orderIds.add(a.pesanan_pembelian.id),n.totalOrders++);const i=a.pesanan_pembelian.supplier,c=i.perusahaan||i.cp;n.suppliers.add(c)}),Array.from(l.values()).map(a=>({...a,suppliers:Array.from(a.suppliers).join(", ")}))}else{const{data:s,error:p}=await k.from("pesanan_pembelian").select(`
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
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",e).lte("tanggal_pesan",r).order("tanggal_pesan",{ascending:!0});if(p)throw p;return s.map(t=>{var l;return{...t,supplier:{perusahaan:((l=t.supplier)==null?void 0:l.perusahaan)||"(Tanpa Nama Perusahaan)",cp:t.supplier.cp},item_pesanan_pembelian:t.item_pesanan_pembelian||[]}})}},template:(e,r,d)=>{const s=document.getElementById("groupBy").value,p=new Date(r).toLocaleDateString("id-ID"),t=new Date(d).toLocaleDateString("id-ID");if(s==="supplier"){const l=e.reduce((o,n)=>o+(n.totalPaid||0),0),a=e.reduce((o,n)=>o+(n.totalItems||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Supplier ${p} - ${t}</h4>
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
                        ${e.map((o,n)=>`
                        <tr>
                            <td>${n+1}</td>
                            <td>${o.supplier.perusahaan} (${o.supplier.cp})</td>
                            <td class="text-end">${o.totalOrders}</td>
                            <td class="text-end">${o.totalItems}</td>
                            <td class="text-end">${y(o.totalPaid)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="text-end"><strong>${e.length}</strong></td>
                        <td class="text-end"><strong>${a}</strong></td>
                        <td class="text-end"><strong>${y(l)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else if(s==="product"){const l=e.reduce((n,i)=>n+(i.totalPurchased||0),0),a=e.reduce((n,i)=>n+(i.totalOrders||0),0),o=e.reduce((n,i)=>n+(i.totalDibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Produk ${p} - ${t}</h4>
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
                        ${e.map((n,i)=>`
                        <tr>
                            <td>${i+1}</td>
                            <td>${n.product}</td>
                            <td>${n.suppliers||"-"}</td>
                            <td class="text-end">${n.totalOrders}</td>
                            <td class="text-end">${n.totalPurchased}</td>
                            <td class="text-end">${y(n.totalDibayarkan)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${a}</strong></td>
                        <td class="text-end"><strong>${l}</strong></td>
                        <td class="text-end"><strong>${y(o)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else{const l=e.reduce((a,o)=>a+(o.total_dibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Order ${p} - ${t}</h4>
                    ${e.map(a=>{var o,n;return a.item_pesanan_pembelian.reduce((i,c)=>i+c.qty_dipesan,0),`
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>PO-${a.id.toString().padStart(4,"0")}</strong> - 
                                    ${j(a.tanggal_pesan)} | 
                                    Supplier: ${((o=a.supplier)==null?void 0:o.perusahaan)||"-"} (${((n=a.supplier)==null?void 0:n.cp)||"-"}) | 
                                    Total: ${y(a.total_dibayarkan)}
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
                                            ${a.item_pesanan_pembelian.map(i=>`
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
                `}}},Penjualan:{fetchData:async(e,r)=>{const d=document.getElementById("groupBy").value;if(d==="customer"){const{data:s,error:p}=await k.from("pesanan_penjualan").select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        bakul:id_bakul(nama),
                        item_pesanan_penjualan(id_jual, qty_dipesan)
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",e).lte("tanggal_pesan",r);if(p)throw p;const t=new Map;return s.forEach(l=>{var i,c;const a=((i=l.bakul)==null?void 0:i.nama)||"Walk-in";t.has(a)||t.set(a,{customer:a,totalOrders:0,totalItems:0,totalPaid:0});const o=t.get(a);o.totalOrders++,o.totalPaid+=l.total_dibayarkan||0;const n=((c=l.item_pesanan_penjualan)==null?void 0:c.reduce((u,g)=>u+(g.qty_dipesan||0),0))||0;o.totalItems+=n}),Array.from(t.values())}else if(d==="product"){const{data:s,error:p}=await k.from("item_pesanan_penjualan").select(`
                        qty_dipesan,
                        harga_jual,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_penjualan!inner(
                            id,
                            tanggal_pesan,
                            total_dibayarkan,
                            bakul:id_bakul(nama)
                        )
                    `).eq("pesanan_penjualan.status_pesanan","selesai").gte("pesanan_penjualan.tanggal_pesan",e).lte("pesanan_penjualan.tanggal_pesan",r);if(p)throw p;const t=new Map;return s.forEach(l=>{var i,c,u,g;const a=(c=(i=l.varian)==null?void 0:i.produk)!=null&&c.nama?`${l.varian.produk.nama} - ${l.varian.varian||""}`:"Produk Tidak Dikenal";t.has(a)||t.set(a,{product:a,totalSold:0,totalRevenue:0,totalOrders:0,customers:new Set,orderIds:new Set});const o=t.get(a);o.totalSold+=l.qty_dipesan||0,o.totalRevenue+=Math.round((l.qty_dipesan||0)*(l.harga_jual||0)),(u=l.pesanan_penjualan)!=null&&u.id&&!o.orderIds.has(l.pesanan_penjualan.id)&&(o.orderIds.add(l.pesanan_penjualan.id),o.totalOrders++);const n=((g=l.pesanan_penjualan.bakul)==null?void 0:g.nama)||"Walk-in";o.customers.add(n)}),Array.from(t.values()).map(l=>({...l,customers:Array.from(l.customers).join(", ")}))}else{const{data:s,error:p}=await k.from("pesanan_penjualan").select(`
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
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",e).lte("tanggal_pesan",r).order("tanggal_pesan",{ascending:!0});if(p)throw p;return s.map(t=>{var l;return{...t,bakul:{nama:((l=t.bakul)==null?void 0:l.nama)||"Walk-in"},item_pesanan_penjualan:(t.item_pesanan_penjualan||[]).map(a=>{var o;return{...a,priceDifference:a.harga_jual-(((o=a.varian)==null?void 0:o.harga_standar)||0)}})}})}},template:(e,r,d)=>{const s=document.getElementById("groupBy").value,p=new Date(r).toLocaleDateString("id-ID"),t=new Date(d).toLocaleDateString("id-ID");if(s==="customer"){const l=e.reduce((o,n)=>o+(n.totalPaid||0),0),a=e.reduce((o,n)=>o+(n.totalItems||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Bakul ${p} - ${t}</h4>
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
                        ${e.map((o,n)=>`
                        <tr>
                            <td>${n+1}</td>
                            <td>${o.customer}</td>
                            <td class="text-end">${o.totalOrders}</td>
                            <td class="text-end">${o.totalItems}</td>
                            <td class="text-end">${y(o.totalPaid)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="text-end"><strong>${e.length}</strong></td>
                        <td class="text-end"><strong>${a}</strong></td>
                        <td class="text-end"><strong>${y(l)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else if(s==="product"){const l=e.reduce((n,i)=>n+(i.totalSold||0),0),a=e.reduce((n,i)=>n+(i.totalRevenue||0),0),o=e.reduce((n,i)=>n+(i.totalOrders||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Produk ${p} - ${t}</h4>
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
                        ${e.map((n,i)=>`
                        <tr>
                            <td>${i+1}</td>
                            <td>${n.product}</td>
                            <td>${n.customers||"-"}</td>
                            <td class="text-end">${n.totalOrders}</td>
                            <td class="text-end">${n.totalSold}</td>
                            <td class="text-end">${y(n.totalRevenue)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${o}</strong></td>
                        <td class="text-end"><strong>${l}</strong></td>
                        <td class="text-end"><strong>${y(a)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else{const l=e.reduce((a,o)=>a+(o.total_dibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Order ${p} - ${t}</h4>
                    ${e.map(a=>{var o;return a.item_pesanan_penjualan.reduce((n,i)=>n+i.qty_dipesan,0),`
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>SO-${a.id.toString().padStart(4,"0")}</strong> - 
                                    ${j(a.tanggal_pesan)} | 
                                    Bakul: ${((o=a.bakul)==null?void 0:o.nama)||"Walk-in"} | 
                                    Total: ${y(a.total_dibayarkan)}
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
                                            ${a.item_pesanan_penjualan.map(n=>{var h;const i=((h=n.varian)==null?void 0:h.harga_standar)||0,c=n.priceDifference||0,u=c===0?"0":c>0?`+${y(c)}`:y(c),g=c>0?"text-success":c<0?"text-danger":"";return`
                                                    <tr>
                                                        <td>${n.varian.produk.nama} - ${n.varian.varian}</td>
                                                        <td class="text-end">${n.qty_dipesan}</td>
                                                        <td class="text-end">${y(n.harga_jual)}</td>
                                                        <td class="text-end">${y(i)}</td>
                                                        <td class="text-end ${g}">${u}</td>
                                                        <td class="text-end">${y(n.qty_dipesan*n.harga_jual)}</td>
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
                `}}},"Kartu Stok":{fetchData:async(e,r)=>{const{data:d,error:s}=await k.from("riwayat_stok").select(`
                    tanggal,
                    tipe_riwayat,
                    qty,
                    saldo,
                    hpp,
                    varian:id_varian(id, varian, produk:id_produk(nama))
                `).gte("tanggal",e).lte("tanggal",r).order("id_varian",{ascending:!0});if(s)throw s;const p=new Map;return d.forEach(t=>{const l=t.varian.id;p.has(l)||p.set(l,{id:l,name:`${t.varian.produk.nama} - ${t.varian.varian}`,history:[],purchaseHistory:[]});const a=p.get(l);a.history.push(t),["penjualan","penyesuaian_keluar"].includes(t.tipe_riwayat)&&(a.hppHistory=a.hppHistory||[],a.hppHistory.push({qty:t.qty,hpp:t.hpp,tanggal:t.tanggal}))}),Array.from(p.values()).map(t=>{const l=t.history.sort((h,b)=>new Date(h.tanggal)-new Date(b.tanggal));let a;if(l.length>0){const h=l[0];a=["purchase","penyesuaian_masuk"].includes(h.tipe_riwayat)?h.saldo-h.qty:h.saldo+h.qty}else a=0;const o=l.filter(h=>h.tipe_riwayat==="pembelian").reduce((h,b)=>h+b.qty,0),n=l.filter(h=>h.tipe_riwayat==="penjualan").reduce((h,b)=>h+b.qty,0),i=l.filter(h=>h.tipe_riwayat==="penyesuaian_masuk").reduce((h,b)=>h+b.qty,0),c=l.filter(h=>h.tipe_riwayat==="penyesuaian_keluar").reduce((h,b)=>h+b.qty,0),u=l.length>0?l[l.length-1].saldo:a;let g=0;return t.hppHistory&&t.hppHistory.length>0&&(t.hppHistory.sort((h,b)=>new Date(b.tanggal)-new Date(h.tanggal)),g=t.hppHistory[0].hpp,console.log(`Latest HPP for ${t.name}`,t.hppHistory[0])),{id:t.id,name:t.name,initialStock:a,purchases:o,sales:n,adjustmentsIn:i,adjustmentsOut:c,finalStock:u,hpp:g}})},template:(e,r,d)=>{const s=new Date(r).toLocaleDateString("id-ID"),p=new Date(d).toLocaleDateString("id-ID");return`    
                <h4 class="report-header">Laporan Kartu Stok ${s} - ${p}</h4>
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
                        ${e.map(t=>`
                            <tr>
                                <td>VAR${t.id.toString().padStart(4,"0")}</td>
                                <td>${t.name}</td>
                                <td class="text-end">${t.initialStock}</td>
                                <td class="text-end">${t.purchases}</td>
                                <td class="text-end">${t.adjustmentsIn}</td>
                                <td class="text-end">${t.sales}</td>
                                <td class="text-end">${t.adjustmentsOut}</td>
                                <td class="text-end">${t.finalStock}</td>
                                <td class="text-end">${y(t.hpp)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `}},"Stock Opname":{fetchData:async(e,r)=>{const{data:d,error:s}=await k.from("log_opname").select(`
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
                `).gte("tanggal",e).lte("tanggal",r).order("tanggal",{ascending:!1});if(s)throw s;const p=d.map(o=>o.id),{data:t,error:l}=await k.from("riwayat_stok").select("id, id_referensi, qty, tipe_riwayat").in("id_referensi",p).or("tipe_riwayat.eq.penyesuaian_masuk,tipe_riwayat.eq.penyesuaian_keluar");if(l)throw l;const a={};return t.forEach(o=>{a[o.id_referensi]||(a[o.id_referensi]=[]),a[o.id_referensi].push(o)}),{logs:d,adjustmentsByLog:a}},template:(e,r,d)=>{const s=new Date(r).toLocaleDateString("id-ID"),p=new Date(d).toLocaleDateString("id-ID");return`
            <div class="stock-opname-report">
                <h4 class="report-header">Laporan Stock Opname ${s} - ${p}</h4>
                
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
                        ${e.logs.map(t=>`
                            ${t.item_opname.map((l,a)=>{var c,u,g;const n=(e.adjustmentsByLog[t.id]||[]).find(h=>h.id===l.id),i=n?n.tipe_riwayat==="penyesuaian_masuk"?`+${n.qty}`:`-${n.qty}`:"0";return`
                                    <tr class="${t.status_log==="final"?"table-success":"table-warning"}">
                                        ${a===0?`
                                            <td rowspan="${t.item_opname.length}">${t.id}</td>
                                            <td rowspan="${t.item_opname.length}">${new Date(t.tanggal).toLocaleDateString("id-ID")}</td>
                                            <td rowspan="${t.item_opname.length}">
                                                ${t.status_log}
                                            </td>
                                        `:""}
                                        <td>VAR${l.id_varian.toString().padStart(4,"0")}</td>
                                        <td>${((u=(c=l.varian)==null?void 0:c.produk)==null?void 0:u.nama)||""} - ${((g=l.varian)==null?void 0:g.varian)||""}</td>
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
            `}}};function y(e){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(e).replace("Rp","Rp ")}async function J(){const e=m.value,r=x.value,d=P.value;if(!r||!d){I("Harap pilih rentang tanggal","error"),w();return}if(new Date(r)>new Date(d)){I("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error"),w();return}try{N.textContent="Memuat...",q.style.display="inline-block",S.disabled=!0,w();const s=await R[e].fetchData(r,d);if(Y(s)){A.innerHTML=`
                    <div class="alert alert-info text-center">
                        Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.
                    </div>
                `,w();return}const p=R[e].template(s,r,d);A.innerHTML=p,X(),setTimeout(dt,100)}catch(s){console.error("Error generating report:",s),A.innerHTML=`
                <div class="alert alert-danger">
                    Gagal memuat laporan: ${s.message}
                </div>
            `,w()}finally{N.textContent="Buat Laporan",q.style.display="none",S.disabled=!1}}function w(){$.disabled=!0,$.classList.add("disabled")}function X(){$.disabled=!1,$.classList.remove("disabled")}w();async function Z(){var n;const{jsPDF:e}=window.jspdf,r=new e("p","mm","a4"),d=20;let s=30;const p=m.value,t=x.value,l=P.value;if(!t||!l){I("Harap pilih rentang tanggal","error");return}if(new Date(t)>new Date(l)){I("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error");return}const a=new Date(t).toLocaleDateString("id-ID"),o=new Date(l).toLocaleDateString("id-ID");r.setFont("helvetica","bold"),r.setFontSize(12),r.setTextColor(40),r.text("GUNARTO",d,15),r.setFont("helvetica","normal"),r.setFontSize(10),r.text("Pasar Klewer, Surakarta",d,20),r.setDrawColor(150),r.line(d,22,210-d,22),r.setFontSize(16),r.setTextColor(0),r.text(`LAPORAN ${p.toUpperCase()}`,105,s,{align:"center"}),s+=8,r.setFontSize(12),r.text(`${a} - ${o}`,105,s,{align:"center"}),s+=15;try{const i=await R[p].fetchData(t,l);if(Y(i)){r.setFontSize(12),r.setTextColor(100),r.text("Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.",105,s,{align:"center"}),M(r,d),r.save(`Laporan_${p}_${new Date().getFullYear()}.pdf`);return}const c=((n=document.getElementById("groupBy"))==null?void 0:n.value)||"order";switch(p){case"Laba Rugi":tt(r,i,s,d);break;case"Pembelian":c==="supplier"?W(r,i,s,d,{entityType:"supplier",entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)"}):c==="product"?F(r,i,s,d,{entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)",qtyLabel:"TOTAL DIBELI"}):H(r,i,s,d,{prefix:"PO",contactLabel:"Supplier",reportLabel:"Pembelian",itemField:"item_pesanan_pembelian",isPenjualan:!1});break;case"Penjualan":c==="customer"?W(r,i,s,d,{entityType:"customer",entityLabel:"BAKUL",amountLabel:"TOTAL DIBERIKAN (Rp)"}):c==="product"?F(r,i,s,d,{entityLabel:"BAKUL",amountLabel:"TOTAL PENDAPATAN (Rp)",qtyLabel:"TOTAL TERJUAL"}):H(r,i,s,d,{prefix:"SO",contactLabel:"Bakul",reportLabel:"Penjualan",itemField:"item_pesanan_penjualan",isPenjualan:!0});break;case"Kartu Stok":at(r,i,s,d);break;case"Stock Opname":et(r,i,s,d);break}M(r,d),r.save(`Laporan_${p}_${new Date().getFullYear()}.pdf`)}catch(i){console.error("Error generating PDF:",i),I("Gagal membuat PDF: "+i.message,"error")}}function tt(e,r,d,s){const p=[["Pendapatan",_(r.totalRevenue)],["Harga Pokok Penjualan (HPP)",_(r.totalCOGS)],["Laba Kotor",_(r.grossProfit)],["Biaya Operasional",_(r.operatingExpenses)],["Laba Bersih",_(r.netProfit)]];e.autoTable({head:[["KETERANGAN","JUMLAH (Rp)"]],body:p,startY:d,margin:{left:s,right:s},theme:"grid",headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",fontSize:11,halign:"center",valign:"middle",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,fontSize:10,lineWidth:.1,lineColor:[0,0,0],cellPadding:2,valign:"middle"},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{0:{halign:"left"},1:{halign:"right",cellWidth:60}},didParseCell:t=>{const l=t.row.index,a=l===2||l===4;t.section==="body"&&a&&(t.cell.styles.fontStyle="bold",t.cell.styles.fillColor=[0,0,0],t.cell.styles.textColor=[255,255,255],t.column.index===0&&(t.cell.styles.halign="right"))},didDrawCell:t=>{if(t.column.index===1&&typeof t.cell.raw=="string"){const l=parseFloat(t.cell.raw.replace(/\./g,"").replace(",","."));t.cell.text=_(l)}}})}function W(e,r,d,s,p){const{entityType:t,entityLabel:l,amountLabel:a}=p,o=r.reduce((u,g)=>u+(g.totalPaid||g.totalRevenue||0),0),n=r.reduce((u,g)=>u+(g.totalItems||g.totalSold||0),0),i=["NO",l,"TOTAL PESANAN","TOTAL ITEMS",a],c=r.map((u,g)=>{var h,b;return[g+1,t==="supplier"?`${((h=u.supplier)==null?void 0:h.perusahaan)||"-"}
${((b=u.supplier)==null?void 0:b.cp)||"-"}`:t==="customer"?u.customer:u.product,u.totalOrders,t==="product"?u.totalPurchased||u.totalSold:u.totalItems,_(u.totalPaid||u.totalRevenue||u.totalDibayarkan)]});c.push(["","TOTAL",r.length,n,_(o)]),e.autoTable({head:[i],body:c,startY:d,margin:{left:s,right:s},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},[c.length-1]:{fontStyle:"bold",fillColor:[220,220,220]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function F(e,r,d,s,p){const{entityLabel:t,amountLabel:l}=p,a=r.reduce((c,u)=>c+(u.totalPurchased||u.totalSold||0),0),o=r.reduce((c,u)=>c+(u.totalDibayarkan||u.totalRevenue||0),0),n=["NO","PRODUK",t,"TOTAL PESANAN",p.qtyLabel,l],i=r.map((c,u)=>[u+1,c.product,c.suppliers||c.customers||"-",c.totalOrders,c.totalPurchased||c.totalSold,_(c.totalDibayarkan||c.totalRevenue)]);i.push(["","TOTAL","",r.length,a,_(o)]),e.autoTable({head:[n],body:i,startY:d,margin:{left:s,right:s},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{3:{halign:"right"},4:{halign:"right"},5:{halign:"right"},[i.length-1]:{fontStyle:"bold",fillColor:[255,255,255]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function H(e,r,d,s,p){const{prefix:t,contactLabel:l,reportLabel:a,itemField:o,isPenjualan:n}=p,i=r.reduce((c,u)=>c+(u.total_dibayarkan||0),0);e.setFontSize(12),e.setTextColor(0),e.text(`Daftar Pesanan ${a}`,s,d),d+=10,r.forEach((c,u)=>{var b,L,C,K;(b=c[o])!=null&&b.reduce((f,E)=>f+(E.qty_dipesan||0),0),e.setFontSize(10),e.setFont("helvetica","bold"),e.text(`${t}-${c.id.toString().padStart(4,"0")} - ${j(c.tanggal_pesan)}`,s,d),d+=5,e.setFont("helvetica","normal"),n?e.text(`${l}: ${((L=c.bakul)==null?void 0:L.nama)||"Walk-in"}`,s,d):e.text(`${l}: ${((C=c.supplier)==null?void 0:C.perusahaan)||"-"} (${((K=c.supplier)==null?void 0:K.cp)||"-"})`,s,d),d+=5,e.text(`Total: ${_(c.total_dibayarkan)}`,s,d),d+=5;const g=n?["PRODUK","QTY","HARGA SATUAN","HARGA STANDAR","DISKON/KENAIKAN","SUBTOTAL"]:["PRODUK","QTY","HARGA SATUAN","SUBTOTAL"],h=(c[o]||[]).map(f=>{var U,z,G;const E=(z=(U=f.varian)==null?void 0:U.produk)!=null&&z.nama?`${f.varian.produk.nama} - ${f.varian.varian||""}`:"Unknown Product";if(n){const nt=((G=f.varian)==null?void 0:G.harga_standar)||0,D=f.priceDifference||0,lt=D===0?"0":D>0?`+${_(D)}`:_(D);return[E,f.qty_dipesan||0,_(f.harga_jual),_(nt),{content:lt,styles:{textColor:D>0?[0,128,0]:D<0?[255,0,0]:[0,0,0]}},_((f.qty_dipesan||0)*(f.harga_jual||0))]}else return[E,f.qty_dipesan||0,_(f.harga_beli||0),_((f.qty_dipesan||0)*(f.harga_beli||0))]});e.autoTable({head:[g],body:h,startY:d,margin:{left:s,right:s},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},columnStyles:{0:{cellWidth:35},1:{cellWidth:12,halign:"right"},2:{cellWidth:30,halign:"right"},...n?{3:{cellWidth:32,halign:"right"},4:{cellWidth:35,halign:"right"},5:{cellWidth:25,halign:"right"}}:{3:{cellWidth:25,halign:"right"}}},alternateRowStyles:{fillColor:[255,255,255]},styles:{fontSize:9,cellPadding:2,overflow:"linebreak"},didDrawPage:f=>{d=f.cursor.y+5}}),d+=10,d>250&&u<r.length-1&&(e.addPage(),d=30)}),e.setFont("helvetica","bold"),e.text(`Total ${a}: ${_(i)}`,s,d)}function at(e,r,d,s){e.setFontSize(14),e.setTextColor(0);const p=r.map(a=>[`VAR${a.id.toString().padStart(4,"0")}`,a.name,t(a.initialStock),t(a.purchases),t(a.adjustmentsIn),t(a.sales),t(a.adjustmentsOut),t(a.finalStock),l(a.hpp)]);e.autoTable({head:[[{content:"KODE",rowSpan:2},{content:"BARANG",rowSpan:2},{content:"AWAL",rowSpan:2},{content:"MASUK",colSpan:2},{content:"KELUAR",colSpan:2},{content:"AKHIR",rowSpan:2},{content:"HPP",rowSpan:2}],["PEMBELIAN","PENYESUAIAN","PENJUALAN","PENYESUAIAN"]],body:p,startY:d,margin:{left:s,right:s},tableWidth:"auto",headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",valign:"middle",halign:"center"},columnStyles:{0:{cellWidth:"auto",halign:"left"},1:{cellWidth:"auto",halign:"left"},2:{cellWidth:"auto",halign:"right"},3:{cellWidth:"auto",halign:"right"},4:{cellWidth:"auto",halign:"right"},5:{cellWidth:"auto",halign:"right"},6:{cellWidth:"auto",halign:"right"},7:{cellWidth:"auto",halign:"right"},8:{cellWidth:"auto",halign:"right"}},styles:{fontSize:9,cellPadding:3,lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{textColor:[0,0,0],valign:"middle"},alternateRowStyles:{fillColor:[255,255,255]}});function t(a){return new Intl.NumberFormat("id-ID").format(a)}function l(a){return isNaN(a)||a===null?"-":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0,maximumFractionDigits:0}).format(a).replace("Rp","").trim()}return e}function et(e,r,d=30,s=14){const{logs:p,adjustmentsByLog:t}=r;e.setFont("helvetica"),e.setFontSize(9);const l=5,a=[];p.forEach(n=>{n.item_opname.forEach(i=>{var h,b,L;const c=(t[n.id]||[]).find(C=>C.id===i.id),u=c?c.tipe_riwayat==="penyesuaian_masuk"?`+${c.qty}`:`-${c.qty}`:"0",g=`${((b=(h=i.varian)==null?void 0:h.produk)==null?void 0:b.nama)||""} - ${((L=i.varian)==null?void 0:L.varian)||""}`;a.push([n.id.toString(),o(n.tanggal),n.status_log,`VAR${i.id_varian.toString().padStart(4,"0")}`,{content:g,styles:{cellWidth:40,valign:"middle"}},i.status_item_log,{content:i.stok.toString(),styles:{halign:"right"}},{content:i.status_item_log==="disesuaikan"?u:"0",styles:{halign:"right",textColor:u.startsWith("+")?[0,128,0]:u.startsWith("-")?[255,0,0]:[0,0,0]}}])})}),e.autoTable({head:[["ID","TANGGAL","STATUS","ITEM","PRODUK","STATUS","STOK","PENY."]],body:a,startY:d+2,margin:{left:s,right:s},tableWidth:"auto",styles:{fontSize:10,cellPadding:2,lineWidth:.1,lineColor:[0,0,0],lineHeight:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",halign:"center"},bodyStyles:{valign:"middle",textColor:0},columnStyles:{0:{cellWidth:10},1:{cellWidth:25},2:{cellWidth:20},3:{cellWidth:20},4:{cellWidth:45},5:{cellWidth:25},6:{cellWidth:15},7:{cellWidth:15}},alternateRowStyles:{fillColor:[255,255,255]},didDrawCell:n=>{if(n.column.index===4&&n.cell.raw){const i=n.cell.raw,c=n.cell.width-4,u=e.splitTextToSize(i,c);u.length>1&&(n.cell.text=u,n.row.height=Math.max(n.row.height,u.length*l))}}});function o(n){return n?new Date(n).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"2-digit"}):""}return e}function M(e,r){const d=e.internal.getNumberOfPages();for(let s=1;s<=d;s++)e.setPage(s),e.setFontSize(8),e.setTextColor(100),e.setDrawColor(200),e.line(r,285,210-r,285),e.text(`Halaman ${s} dari ${d}`,105,291,{align:"center"}),e.text(`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`,105,294,{align:"center"})}function _(e){return new Intl.NumberFormat("id-ID",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function j(e){return e?new Date(e).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}):""}S.addEventListener("click",J),$.addEventListener("click",Z)});
