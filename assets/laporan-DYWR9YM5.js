import"./modulepreload-polyfill-B5Qt9EMX.js";import{s as f}from"./db_conn-C7Nb5uSA.js";const{jsPDF:nt}=window.jspdf;document.addEventListener("DOMContentLoaded",()=>{const S=document.getElementById("jenis"),D=document.getElementById("startDate"),T=document.getElementById("endDate"),P=document.getElementById("generateBtn"),U=document.getElementById("downloadBtn"),j=document.getElementById("report-content"),O=document.getElementById("generateText"),C=document.getElementById("generateSpinner"),v=document.getElementById("groupByContainer"),L=document.createElement("label");L.className="form-label",L.innerHTML="Pengelompokkan",v.appendChild(L);const k=document.createElement("select");k.id="groupBy",k.className="form-select",k.innerHTML="",v.style.display="none",S.addEventListener("change",()=>{S.value==="Pembelian"||S.value==="Penjualan"?(v.style.display="block",G(S.value),v.appendChild(k)):v.style.display="none"});function G(a){a==="Pembelian"?k.innerHTML=`
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="supplier">Supplier</option>
                <option value="product">Produk</option>
            `:a==="Penjualan"&&(k.innerHTML=`
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="customer">Bakul</option>
                <option value="product">Produk</option>
            `)}const I=new Date,z=new Date(I.getFullYear(),I.getMonth(),1);D.valueAsDate=z,T.valueAsDate=I;const A={"Laba Rugi":{fetchData:async(a,s)=>{const{data:d,error:l}=await f.from("pesanan_penjualan").select("total_dibayarkan").gte("tanggal_pesan",a).lte("tanggal_pesan",s);if(l)throw l;const{data:i,error:e}=await f.from("riwayat_stok").select("hpp, qty").eq("tipe_riwayat","penjualan").gte("tanggal",a).lte("tanggal",s);if(e)throw e;const o=d.reduce((p,u)=>p+(u.total_dibayarkan||0),0);let t;t=i.reduce((p,u)=>p+(u.hpp*u.qty||0),0),t=Math.round(t);const r=o-t,n=r*.3,c=r-n;return{totalRevenue:o,totalCOGS:t,grossProfit:r,operatingExpenses:n,netProfit:c}},template:(a,s,d)=>{const l=new Date(s).toLocaleDateString("id-ID"),i=new Date(d).toLocaleDateString("id-ID");return`
                    <h4 class="report-header">Laporan Laba Rugi ${l} - ${i}</h4>
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
                        <td class="text-end">${b(a.totalRevenue)}</td>
                        </tr>
                        <tr>
                        <td>Harga Pokok Penjualan (HPP)</td>
                        <td class="text-end">${b(a.totalCOGS)}</td>
                        </tr>
                        <tr class="table-active">
                        <td><strong>Laba Kotor</strong></td>
                        <td class="text-end"><strong>${b(a.grossProfit)}</strong></td>
                        </tr>
                        <tr>
                        <td>Biaya Operasional</td>
                        <td class="text-end">${b(a.operatingExpenses)}</td>
                        </tr>
                        <tr class="table-active">
                        <td><strong>Laba Bersih</strong></td>
                        <td class="text-end"><strong>${b(a.netProfit)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}},Pembelian:{fetchData:async(a,s)=>{const d=document.getElementById("groupBy").value;if(d==="supplier"){const{data:l,error:i}=await f.from("pesanan_pembelian").select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        supplier:id_supplier(perusahaan, cp),
                        item_pesanan_pembelian(id_beli, qty_dipesan)
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",s);if(i)throw i;const e=new Map;return l.forEach(o=>{var c,p,u;const t=((c=o.supplier)==null?void 0:c.perusahaan)||o.supplier.cp;e.has(t)||e.set(t,{supplier:{perusahaan:((p=o.supplier)==null?void 0:p.perusahaan)||"(Tanpa Nama Perusahaan)",cp:o.supplier.cp},totalOrders:0,totalItems:0,totalPaid:0});const r=e.get(t);r.totalOrders++,r.totalPaid+=o.total_dibayarkan||0;const n=((u=o.item_pesanan_pembelian)==null?void 0:u.reduce((g,h)=>g+(h.qty_dipesan||0),0))||0;r.totalItems+=n}),Array.from(e.values())}else if(d==="product"){const{data:l,error:i}=await f.from("item_pesanan_pembelian").select(`
                        qty_dipesan,
                        harga_beli,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_pembelian!inner(
                            id,
                            supplier:id_supplier(perusahaan, cp),
                            status_pesanan
                        )
                    `).eq("pesanan_pembelian.status_pesanan","selesai").gte("pesanan_pembelian.tanggal_pesan",a).lte("pesanan_pembelian.tanggal_pesan",s);if(i)throw i;const e=l.filter(t=>{var r;return!((r=t.pesanan_pembelian)!=null&&r.supplier)});e.length>0&&console.warn("Items with missing supplier data:",e);const o=new Map;return l.forEach(t=>{var u,g,h;const r=(g=(u=t.varian)==null?void 0:u.produk)!=null&&g.nama?`${t.varian.produk.nama} - ${t.varian.varian||""}`:"Produk Tidak Dikenal";o.has(r)||o.set(r,{product:r,totalPurchased:0,totalDibayarkan:0,totalOrders:0,suppliers:new Set,orderIds:new Set});const n=o.get(r);n.totalPurchased+=t.qty_dipesan||0,n.totalDibayarkan+=(t.qty_dipesan||0)*(t.harga_beli||0),(h=t.pesanan_pembelian)!=null&&h.id&&!n.orderIds.has(t.pesanan_pembelian.id)&&(n.orderIds.add(t.pesanan_pembelian.id),n.totalOrders++);const c=t.pesanan_pembelian.supplier,p=c.perusahaan||c.cp;n.suppliers.add(p)}),Array.from(o.values()).map(t=>({...t,suppliers:Array.from(t.suppliers).join(", ")}))}else{const{data:l,error:i}=await f.from("pesanan_pembelian").select(`
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
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",s).order("tanggal_pesan",{ascending:!0});if(i)throw i;return l.map(e=>{var o;return{...e,supplier:{perusahaan:((o=e.supplier)==null?void 0:o.perusahaan)||"(Tanpa Nama Perusahaan)",cp:e.supplier.cp},item_pesanan_pembelian:e.item_pesanan_pembelian||[]}})}},template:(a,s,d)=>{const l=document.getElementById("groupBy").value,i=new Date(s).toLocaleDateString("id-ID"),e=new Date(d).toLocaleDateString("id-ID");if(l==="supplier"){const o=a.reduce((r,n)=>r+(n.totalPaid||0),0),t=a.reduce((r,n)=>r+(n.totalItems||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Supplier ${i} - ${e}</h4>
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
                        ${a.map((r,n)=>`
                        <tr>
                            <td>${n+1}</td>
                            <td>${r.supplier.perusahaan} (${r.supplier.cp})</td>
                            <td class="text-end">${r.totalOrders}</td>
                            <td class="text-end">${r.totalItems}</td>
                            <td class="text-end">${b(r.totalPaid)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="text-end"><strong>${a.length}</strong></td>
                        <td class="text-end"><strong>${t}</strong></td>
                        <td class="text-end"><strong>${b(o)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else if(l==="product"){const o=a.reduce((n,c)=>n+(c.totalPurchased||0),0),t=a.reduce((n,c)=>n+(c.totalOrders||0),0),r=a.reduce((n,c)=>n+(c.totalDibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Produk ${i} - ${e}</h4>
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
                        ${a.map((n,c)=>`
                        <tr>
                            <td>${c+1}</td>
                            <td>${n.product}</td>
                            <td>${n.suppliers||"-"}</td>
                            <td class="text-end">${n.totalOrders}</td>
                            <td class="text-end">${n.totalPurchased}</td>
                            <td class="text-end">${b(n.totalDibayarkan)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${t}</strong></td>
                        <td class="text-end"><strong>${o}</strong></td>
                        <td class="text-end"><strong>${b(r)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else{const o=a.reduce((t,r)=>t+(r.total_dibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Order ${i} - ${e}</h4>
                    ${a.map(t=>{var r,n;return t.item_pesanan_pembelian.reduce((c,p)=>c+p.qty_dipesan,0),`
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>PO-${t.id.toString().padStart(4,"0")}</strong> - 
                                    ${w(t.tanggal_pesan)} | 
                                    Supplier: ${((r=t.supplier)==null?void 0:r.perusahaan)||"-"} (${((n=t.supplier)==null?void 0:n.cp)||"-"}) | 
                                    Total: ${b(t.total_dibayarkan)}
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
                                            ${t.item_pesanan_pembelian.map(c=>`
                                                <tr>
                                                    <td>${c.varian.produk.nama} - ${c.varian.varian}</td>
                                                    <td class="text-end">${c.qty_dipesan}</td>
                                                    <td class="text-end">${b(c.harga_beli)}</td>
                                                    <td class="text-end">${b(c.qty_dipesan*c.harga_beli)}</td>
                                                </tr>
                                            `).join("")}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `}).join("")}
                    <div class="alert alert-primary">
                        <strong>Total Pembelian: ${b(o)}</strong>
                    </div>
                `}}},Penjualan:{fetchData:async(a,s)=>{const d=document.getElementById("groupBy").value;if(d==="customer"){const{data:l,error:i}=await f.from("pesanan_penjualan").select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        bakul:id_bakul(nama),
                        item_pesanan_penjualan(id_jual, qty_dipesan)
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",s);if(i)throw i;const e=new Map;return l.forEach(o=>{var c,p;const t=((c=o.bakul)==null?void 0:c.nama)||"Walk-in";e.has(t)||e.set(t,{customer:t,totalOrders:0,totalItems:0,totalPaid:0});const r=e.get(t);r.totalOrders++,r.totalPaid+=o.total_dibayarkan||0;const n=((p=o.item_pesanan_penjualan)==null?void 0:p.reduce((u,g)=>u+(g.qty_dipesan||0),0))||0;r.totalItems+=n}),Array.from(e.values())}else if(d==="product"){const{data:l,error:i}=await f.from("item_pesanan_penjualan").select(`
                        qty_dipesan,
                        harga_jual,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_penjualan!inner(
                            id,
                            tanggal_pesan,
                            total_dibayarkan,
                            bakul:id_bakul(nama)
                        )
                    `).eq("pesanan_penjualan.status_pesanan","selesai").gte("pesanan_penjualan.tanggal_pesan",a).lte("pesanan_penjualan.tanggal_pesan",s);if(i)throw i;const e=new Map;return l.forEach(o=>{var c,p,u,g;const t=(p=(c=o.varian)==null?void 0:c.produk)!=null&&p.nama?`${o.varian.produk.nama} - ${o.varian.varian||""}`:"Produk Tidak Dikenal";e.has(t)||e.set(t,{product:t,totalSold:0,totalRevenue:0,totalOrders:0,customers:new Set,orderIds:new Set});const r=e.get(t);r.totalSold+=o.qty_dipesan||0,r.totalRevenue+=Math.round((o.qty_dipesan||0)*(o.harga_jual||0)),(u=o.pesanan_penjualan)!=null&&u.id&&!r.orderIds.has(o.pesanan_penjualan.id)&&(r.orderIds.add(o.pesanan_penjualan.id),r.totalOrders++);const n=((g=o.pesanan_penjualan.bakul)==null?void 0:g.nama)||"Walk-in";r.customers.add(n)}),Array.from(e.values()).map(o=>({...o,customers:Array.from(o.customers).join(", ")}))}else{const{data:l,error:i}=await f.from("pesanan_penjualan").select(`
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
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",s).order("tanggal_pesan",{ascending:!0});if(i)throw i;return l.map(e=>{var o;return{...e,bakul:{nama:((o=e.bakul)==null?void 0:o.nama)||"Walk-in"},item_pesanan_penjualan:(e.item_pesanan_penjualan||[]).map(t=>{var r;return{...t,priceDifference:t.harga_jual-(((r=t.varian)==null?void 0:r.harga_standar)||0)}})}})}},template:(a,s,d)=>{const l=document.getElementById("groupBy").value,i=new Date(s).toLocaleDateString("id-ID"),e=new Date(d).toLocaleDateString("id-ID");if(l==="customer"){const o=a.reduce((r,n)=>r+(n.totalPaid||0),0),t=a.reduce((r,n)=>r+(n.totalItems||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Bakul ${i} - ${e}</h4>
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
                        ${a.map((r,n)=>`
                        <tr>
                            <td>${n+1}</td>
                            <td>${r.customer}</td>
                            <td class="text-end">${r.totalOrders}</td>
                            <td class="text-end">${r.totalItems}</td>
                            <td class="text-end">${b(r.totalPaid)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="text-end"><strong>${a.length}</strong></td>
                        <td class="text-end"><strong>${t}</strong></td>
                        <td class="text-end"><strong>${b(o)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else if(l==="product"){const o=a.reduce((n,c)=>n+(c.totalSold||0),0),t=a.reduce((n,c)=>n+(c.totalRevenue||0),0),r=a.reduce((n,c)=>n+(c.totalOrders||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Produk ${i} - ${e}</h4>
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
                        ${a.map((n,c)=>`
                        <tr>
                            <td>${c+1}</td>
                            <td>${n.product}</td>
                            <td>${n.customers||"-"}</td>
                            <td class="text-end">${n.totalOrders}</td>
                            <td class="text-end">${n.totalSold}</td>
                            <td class="text-end">${b(n.totalRevenue)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${r}</strong></td>
                        <td class="text-end"><strong>${o}</strong></td>
                        <td class="text-end"><strong>${b(t)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else{const o=a.reduce((t,r)=>t+(r.total_dibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Order ${i} - ${e}</h4>
                    ${a.map(t=>{var r;return t.item_pesanan_penjualan.reduce((n,c)=>n+c.qty_dipesan,0),`
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>SO-${t.id.toString().padStart(4,"0")}</strong> - 
                                    ${w(t.tanggal_pesan)} | 
                                    Bakul: ${((r=t.bakul)==null?void 0:r.nama)||"Walk-in"} | 
                                    Total: ${b(t.total_dibayarkan)}
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
                                            ${t.item_pesanan_penjualan.map(n=>{var h;const c=((h=n.varian)==null?void 0:h.harga_standar)||0,p=n.priceDifference||0,u=p===0?"0":p>0?`+${b(p)}`:b(p),g=p>0?"text-success":p<0?"text-danger":"";return`
                                                    <tr>
                                                        <td>${n.varian.produk.nama} - ${n.varian.varian}</td>
                                                        <td class="text-end">${n.qty_dipesan}</td>
                                                        <td class="text-end">${b(n.harga_jual)}</td>
                                                        <td class="text-end">${b(c)}</td>
                                                        <td class="text-end ${g}">${u}</td>
                                                        <td class="text-end">${b(n.qty_dipesan*n.harga_jual)}</td>
                                                    </tr>
                                                `}).join("")}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `}).join("")}
                    <div class="alert alert-primary">
                        <strong>Total Penjualan: ${b(o)}</strong>
                    </div>
                `}}},"Kartu Stok":{fetchData:async(a,s)=>{const{data:d,error:l}=await f.from("riwayat_stok").select(`
                    tanggal,
                    tipe_riwayat,
                    qty,
                    saldo,
                    hpp,
                    varian:id_varian(id, varian, produk:id_produk(nama))
                `).gte("tanggal",a).lte("tanggal",s).order("tanggal",{ascending:!0});if(l)throw l;const i=new Map;return d.forEach(e=>{const o=e.varian.id;i.has(o)||i.set(o,{id:o,name:`${e.varian.produk.nama} - ${e.varian.varian}`,history:[],purchaseHistory:[]});const t=i.get(o);t.history.push(e),e.tipe_riwayat==="penjualan"&&t.purchaseHistory.push({qty:e.qty,hpp:e.hpp,tanggal:e.tanggal})}),Array.from(i.values()).map(e=>{const o=e.history.sort((h,m)=>new Date(h.tanggal)-new Date(m.tanggal));let t;if(o.length>0){const h=o[0];t=["purchase","penyesuaian_masuk"].includes(h.tipe_riwayat)?h.saldo-h.qty:h.saldo+h.qty}else t=0;const r=o.filter(h=>h.tipe_riwayat==="pembelian").reduce((h,m)=>h+m.qty,0),n=o.filter(h=>h.tipe_riwayat==="penjualan").reduce((h,m)=>h+m.qty,0),c=o.filter(h=>h.tipe_riwayat==="penyesuaian_masuk").reduce((h,m)=>h+m.qty,0),p=o.filter(h=>h.tipe_riwayat==="penyesuaian_keluar").reduce((h,m)=>h+m.qty,0),u=o.length>0?o[o.length-1].saldo:t;let g;return e.purchaseHistory.length>0?g=e.purchaseHistory[e.purchaseHistory.length-1].hpp:g=0,{id:e.id,name:e.name,initialStock:t,purchases:r,sales:n,adjustmentsIn:c,adjustmentsOut:p,finalStock:u,hpp:g}})},template:(a,s,d)=>{const l=new Date(s).toLocaleDateString("id-ID"),i=new Date(d).toLocaleDateString("id-ID");return`    
                <h4 class="report-header">Laporan Kartu Stok ${l} - ${i}</h4>
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
                        ${a.map(e=>`
                            <tr>
                                <td>VAR${e.id.toString().padStart(4,"0")}</td>
                                <td>${e.name}</td>
                                <td class="text-end">${e.initialStock}</td>
                                <td class="text-end">${e.purchases}</td>
                                <td class="text-end">${e.adjustmentsIn}</td>
                                <td class="text-end">${e.sales}</td>
                                <td class="text-end">${e.adjustmentsOut}</td>
                                <td class="text-end">${e.finalStock}</td>
                                <td class="text-end">${b(e.hpp)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `}},"Stock Opname":{fetchData:async(a,s)=>{const{data:d,error:l}=await f.from("log_opname").select(`
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
                `).gte("tanggal",a).lte("tanggal",s).order("tanggal",{ascending:!1});if(l)throw l;return{logs:d}},template:(a,s,d)=>(new Date(s).toLocaleDateString("id-ID"),new Date(d).toLocaleDateString("id-ID"),`
            <div class="stock-opname-report">
                <h4 class="report-header">Laporan Stock Opname Tahun ${year}</h4>
                
                <table class="table table-bordered table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>ID Log</th>
                            <th>Tanggal</th>
                            <th>Status Log</th>
                            <th>ID Item</th>
                            <th>Status Item</th>
                            <th>Stok Sistem</th>
                            <th>Stok Fisik</th>
                            <th>Selisih</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${a.logs.map(l=>`
                            ${l.item_opname.map((i,e)=>{var o,t,r,n,c;return`
                                <tr class="${l.status_log==="final"?"table-success":"table-warning"}">
                                    ${e===0?`
                                        <td rowspan="${l.item_opname.length}">${l.id}</td>
                                        <td rowspan="${l.item_opname.length}">${new Date(l.tanggal).toLocaleDateString("id-ID")}</td>
                                        <td rowspan="${l.item_opname.length}">
                                            ${l.status_log}
                                        </td>
                                    `:""}
                                    <td>VAR${i.id_varian.toString().padStart(4,"0")}</td>
                                    <td>
                                        ${i.status_item_log}
                                    </td>
                                    <td class="text-end">${((o=i.varian)==null?void 0:o.jumlah_stok)||0}</td>
                                    <td class="text-end">${i.stok}</td>
                                    <td class="text-end ${i.stok-(((t=i.varian)==null?void 0:t.jumlah_stok)||0)>0?"text-success":i.stok-(((r=i.varian)==null?void 0:r.jumlah_stok)||0)<0?"text-danger":""}">
                                        ${i.stok-(((n=i.varian)==null?void 0:n.jumlah_stok)||0)>0?"+":""}${i.stok-(((c=i.varian)==null?void 0:c.jumlah_stok)||0)}
                                    </td>
                                </tr>
                            `}).join("")}
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <style>
                .table {
                    border-collapse: collapse;
                    width: 100%;
                }
                .table th, .table td {
                    border: 1px solid #dee2e6;
                    padding: 8px;
                    vertical-align: middle;
                }
                .table th {
                    background-color: #f8f9fa;
                    text-align: left;
                }
                .table-success { background-color: rgba(40, 167, 69, 0.05); }
                .table-warning { background-color: rgba(255, 193, 7, 0.05); }
                .text-success { color: #28a745 !important; }
                .text-danger { color: #dc3545 !important; }
                .text-end { text-align: right; }
            </style>
            `)}};function b(a){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(a).replace("Rp","Rp ")}async function Y(){const a=S.value,s=D.value,d=T.value;if(!s||!d){showToast("Harap pilih rentang tanggal","error");return}if(new Date(s)>new Date(d)){showToast("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error");return}try{O.textContent="Memuat...",C.style.display="inline-block",P.disabled=!0;const l=await A[a].fetchData(s,d),i=A[a].template(l,s,d);j.innerHTML=i}catch(l){console.error("Error generating report:",l),j.innerHTML=`
                <div class="alert alert-danger">
                    Gagal memuat laporan: ${l.message}
                </div>
            `}finally{O.textContent="Buat Laporan",C.style.display="none",P.disabled=!1}}async function Q(){var p;const{jsPDF:a}=window.jspdf,s=new a("p","mm","a4"),d=20;let l=30;const i=S.value,e=D.value,o=T.value;if(!e||!o){showToast("Harap pilih rentang tanggal","error");return}if(new Date(e)>new Date(o)){showToast("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error");return}const t=new Date(e).toLocaleDateString("id-ID"),r=new Date(o).toLocaleDateString("id-ID");s.setFont("helvetica","bold"),s.setFontSize(12),s.setTextColor(40),s.text("GUNARTO",d,15),s.setFont("helvetica","normal"),s.setFontSize(10),s.text("Pasar Klewer, Surakarta",d,20),s.setDrawColor(150),s.line(d,22,210-d,22),s.setFontSize(16),s.setTextColor(0),s.text(`LAPORAN ${i.toUpperCase()}`,105,l,{align:"center"}),l+=8,s.setFontSize(12),s.text(`${t} - ${r}`,105,l,{align:"center"}),l+=15;const n=await A[i].fetchData(e,o),c=((p=document.getElementById("groupBy"))==null?void 0:p.value)||"order";switch(i){case"Laba Rugi":J(s,n,l,d);break;case"Pembelian":c==="supplier"?E(s,n,l,d,{entityType:"supplier",entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)"}):c==="product"?B(s,n,l,d,{entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)",qtyLabel:"TOTAL DIBELI"}):R(s,n,l,d,{prefix:"PO",contactLabel:"Supplier",reportLabel:"Pembelian",itemField:"item_pesanan_pembelian",isPenjualan:!1});break;case"Penjualan":c==="customer"?E(s,n,l,d,{entityType:"customer",entityLabel:"BAKUL",amountLabel:"TOTAL DIBERIKAN (Rp)"}):c==="product"?B(s,n,l,d,{entityLabel:"BAKUL",amountLabel:"TOTAL PENDAPATAN (Rp)",qtyLabel:"TOTAL TERJUAL"}):R(s,n,l,d,{prefix:"SO",contactLabel:"Bakul",reportLabel:"Penjualan",itemField:"item_pesanan_penjualan",isPenjualan:!0});break;case"Kartu Stok":V(s,n,l,d);break;case"Stock Opname":X(s,n,l,d);break}N(s,d),s.save(`Laporan_${i}_${new Date().getFullYear()}.pdf`)}function J(a,s,d,l){const i=[["PENDAPATAN",y(s.totalRevenue)],["Harga Pokok Penjualan (HPP)",y(s.totalCOGS)],["LABA KOTOR",y(s.grossProfit)],["Biaya Operasional",y(s.operatingExpenses)],["LABA BERSIH",y(s.netProfit)]];a.autoTable({head:[["KETERANGAN","JUMLAH (Rp)"]],body:i,startY:d,margin:{left:l,right:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",fontSize:11,lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0],cellPadding:2,fontSize:10},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{1:{halign:"right",cellWidth:50}},didDrawCell:e=>{if([0,2,4].includes(e.row.index)&&(a.setFillColor(255,255,255),a.rect(e.cell.x-1,e.cell.y-1,e.cell.width+2,e.cell.height+2,"F"),a.setTextColor(0),a.text(e.cell.raw,e.cell.x+e.cell.width-2,e.cell.y+e.cell.height-5,{align:"right"})),e.column.index===1&&e.cell.raw){const t=y(parseFloat(e.cell.raw.replace(/\./g,"")));e.cell.text=t}}})}function E(a,s,d,l,i){const{entityType:e,entityLabel:o,amountLabel:t}=i,r=s.reduce((u,g)=>u+(g.totalPaid||g.totalRevenue||0),0),n=s.reduce((u,g)=>u+(g.totalItems||g.totalSold||0),0),c=["NO",o,"TOTAL PESANAN","TOTAL ITEMS",t],p=s.map((u,g)=>{var h,m;return[g+1,e==="supplier"?`${((h=u.supplier)==null?void 0:h.perusahaan)||"-"}
${((m=u.supplier)==null?void 0:m.cp)||"-"}`:e==="customer"?u.customer:u.product,u.totalOrders,e==="product"?u.totalPurchased||u.totalSold:u.totalItems,y(u.totalPaid||u.totalRevenue||u.totalDibayarkan)]});p.push(["","TOTAL",s.length,n,y(r)]),a.autoTable({head:[c],body:p,startY:d,margin:{left:l,right:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},[p.length-1]:{fontStyle:"bold",fillColor:[220,220,220]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function B(a,s,d,l,i){const{entityLabel:e,amountLabel:o}=i,t=s.reduce((p,u)=>p+(u.totalPurchased||u.totalSold||0),0),r=s.reduce((p,u)=>p+(u.totalDibayarkan||u.totalRevenue||0),0),n=["NO","PRODUK",e,"TOTAL PESANAN",i.qtyLabel,o],c=s.map((p,u)=>[u+1,p.product,p.suppliers||p.customers||"-",p.totalOrders,p.totalPurchased||p.totalSold,y(p.totalDibayarkan||p.totalRevenue)]);c.push(["","TOTAL","",s.length,t,y(r)]),a.autoTable({head:[n],body:c,startY:d,margin:{left:l,right:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{3:{halign:"right"},4:{halign:"right"},5:{halign:"right"},[c.length-1]:{fontStyle:"bold",fillColor:[255,255,255]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function R(a,s,d,l,i){const{prefix:e,contactLabel:o,reportLabel:t,itemField:r,isPenjualan:n}=i,c=s.reduce((p,u)=>p+(u.total_dibayarkan||0),0);a.setFontSize(12),a.setTextColor(0),a.text(`Daftar Pesanan ${t}`,l,d),d+=10,s.forEach((p,u)=>{var m,q,F,M;(m=p[r])!=null&&m.reduce((_,x)=>_+(x.qty_dipesan||0),0),a.setFontSize(10),a.setFont("helvetica","bold"),a.text(`${e}-${p.id.toString().padStart(4,"0")} - ${w(p.tanggal_pesan)}`,l,d),d+=5,a.setFont("helvetica","normal"),n?a.text(`${o}: ${((q=p.bakul)==null?void 0:q.nama)||"Walk-in"}`,l,d):a.text(`${o}: ${((F=p.supplier)==null?void 0:F.perusahaan)||"-"} (${((M=p.supplier)==null?void 0:M.cp)||"-"})`,l,d),d+=5,a.text(`Total: ${y(p.total_dibayarkan)}`,l,d),d+=5;const g=n?["PRODUK","QTY","HARGA SATUAN","HARGA STANDAR","DISKON/KENAIKAN","SUBTOTAL"]:["PRODUK","QTY","HARGA SATUAN","SUBTOTAL"],h=(p[r]||[]).map(_=>{var W,K,H;const x=(K=(W=_.varian)==null?void 0:W.produk)!=null&&K.nama?`${_.varian.produk.nama} - ${_.varian.varian||""}`:"Unknown Product";if(n){const Z=((H=_.varian)==null?void 0:H.harga_standar)||0,$=_.priceDifference||0,tt=$===0?"0":$>0?`+${y($)}`:y($);return[x,_.qty_dipesan||0,y(_.harga_jual),y(Z),{content:tt,styles:{textColor:$>0?[0,128,0]:$<0?[255,0,0]:[0,0,0]}},y((_.qty_dipesan||0)*(_.harga_jual||0))]}else return[x,_.qty_dipesan||0,y(_.harga_beli||0),y((_.qty_dipesan||0)*(_.harga_beli||0))]});a.autoTable({head:[g],body:h,startY:d,margin:{left:l,right:l},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},columnStyles:{0:{cellWidth:35},1:{cellWidth:12,halign:"right"},2:{cellWidth:30,halign:"right"},...n?{3:{cellWidth:32,halign:"right"},4:{cellWidth:35,halign:"right"},5:{cellWidth:25,halign:"right"}}:{3:{cellWidth:25,halign:"right"}}},alternateRowStyles:{fillColor:[255,255,255]},styles:{fontSize:9,cellPadding:2,overflow:"linebreak"},didDrawPage:_=>{d=_.cursor.y+5}}),d+=10,d>250&&u<s.length-1&&(a.addPage(),d=30)}),a.setFont("helvetica","bold"),a.text(`Total ${t}: ${y(c)}`,l,d)}function V(a,s,d,l){a.autoTable({head:[["KODE","NAMA BARANG","STOK AWAL","PEMBELIAN","PENJUALAN","STOK AKHIR"]],body:s.map(i=>[`VAR${i.id.toString().padStart(4,"0")}`,i.name,i.initialStock,i.purchases,i.sales,i.finalStock]),startY:d,margin:{left:l,right:l},headStyles:{fillColor:[13,71,161],textColor:255,fontStyle:"bold"},columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},5:{halign:"right"}},styles:{fontSize:9,cellPadding:3}})}function X(a,s,d=30,l=14){const{logs:i}=s;a.setFont("helvetica"),a.setFontSize(16),a.setTextColor(0,0,128),a.text("LAPORAN STOCK OPNAME",105,d,{align:"center"});const e=d+25,o=[];return i.forEach(t=>{t.item_opname.forEach((r,n)=>{var u,g;const c=r.stok-(((u=r.varian)==null?void 0:u.jumlah_stok)||0),p=[n===0?{content:t.id.toString(),rowSpan:t.item_opname.length}:"",n===0?{content:w(t.tanggal),rowSpan:t.item_opname.length}:"",n===0?{content:t.status_log,rowSpan:t.item_opname.length}:"",`VAR${r.id_varian.toString().padStart(4,"0")}`,r.status_item_log,{content:(((g=r.varian)==null?void 0:g.jumlah_stok)||0).toString(),styles:{halign:"right"}},{content:r.stok.toString(),styles:{halign:"right"}},{content:c===0?"0":c>0?`+${c}`:c.toString(),styles:{halign:"right",textColor:c>0?[0,128,0]:c<0?[255,0,0]:[0,0,0]}}];o.push(p)})}),a.autoTable({head:[["ID LOG","TANGGAL","STATUS LOG","ID ITEM","STATUS ITEM","STOK SISTEM","STOK FISIK","SELISIH"]],body:o,startY:e,margin:{left:l,right:l},headStyles:{fillColor:[13,71,161],textColor:255,fontStyle:"bold"},columnStyles:{0:{cellWidth:20},1:{cellWidth:30},2:{cellWidth:25},3:{cellWidth:25},4:{cellWidth:30},5:{cellWidth:25,halign:"right"},6:{cellWidth:25,halign:"right"},7:{cellWidth:20,halign:"right"}},didDrawPage:function(t){N(a,l)},createdCell:function(t,r){t.raw!==null&&typeof t.raw=="object"&&t.raw.rowSpan&&(t.rowSpan=t.raw.rowSpan,t.content=t.raw.content)},drawCell:function(t,r){if(t.raw==="")return r.table.cell(t.x,t.y,t.width,t.height,"",t.styles),!1}}),a}function N(a,s){const d=a.internal.getNumberOfPages();for(let l=1;l<=d;l++)a.setPage(l),a.setFontSize(8),a.setTextColor(100),a.setDrawColor(200),a.line(s,285,210-s,285),a.text(`Halaman ${l} dari ${d}`,105,291,{align:"center"}),a.text(`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`,105,294,{align:"center"})}function y(a){return new Intl.NumberFormat("id-ID",{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)}function w(a){return a?new Date(a).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}):""}P.addEventListener("click",Y),U.addEventListener("click",Q)});
