import"./modulepreload-polyfill-B5Qt9EMX.js";import{n as et}from"./navbar-Cw31nkU0.js";import{s as S}from"./db_conn-C7Nb5uSA.js";fetch("navbar.html").then(y=>y.text()).then(y=>{document.getElementById("navbar").innerHTML=y;const k=document.createElement("script");k.type="module",k.src=et,document.body.appendChild(k)}).catch(y=>console.error("Error loading navbar:",y));const{jsPDF:st}=window.jspdf;function U(y){return Array.isArray(y)?y.length===0:typeof y=="object"&&y!==null?y.logs?y.logs.length===0:Object.keys(y).length===0:!1}document.addEventListener("DOMContentLoaded",()=>{const y=document.getElementById("jenis"),k=document.getElementById("startDate"),T=document.getElementById("endDate"),P=document.getElementById("generateBtn"),G=document.getElementById("downloadBtn"),L=document.getElementById("report-content"),E=document.getElementById("generateText"),C=document.getElementById("generateSpinner"),x=document.getElementById("groupByContainer"),I=document.createElement("label");I.className="form-label",I.innerHTML="Pengelompokkan",x.appendChild(I);const $=document.createElement("select");$.id="groupBy",$.className="form-select",$.innerHTML="",x.style.display="none",y.addEventListener("change",()=>{y.value==="Pembelian"||y.value==="Penjualan"?(x.style.display="block",z(y.value),x.appendChild($)):x.style.display="none"});function z(a){a==="Pembelian"?$.innerHTML=`
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="supplier">Supplier</option>
                <option value="product">Produk</option>
            `:a==="Penjualan"&&($.innerHTML=`
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="customer">Bakul</option>
                <option value="product">Produk</option>
            `)}const A=new Date,Y=new Date(A.getFullYear(),A.getMonth(),1);k.valueAsDate=Y,T.valueAsDate=A;const j={"Laba Rugi":{fetchData:async(a,r)=>{const{data:c,error:n}=await S.from("pesanan_penjualan").select("total_dibayarkan").gte("tanggal_pesan",a).lte("tanggal_pesan",r);if(n)throw n;const{data:d,error:e}=await S.from("riwayat_stok").select("hpp, qty").eq("tipe_riwayat","penjualan").gte("tanggal",a).lte("tanggal",r);if(e)throw e;const o=c.reduce((p,u)=>p+(u.total_dibayarkan||0),0);let t;t=d.reduce((p,u)=>p+(u.hpp*u.qty||0),0),t=Math.round(t);const l=o-t,s=l*.3,i=l-s;return{totalRevenue:o,totalCOGS:t,grossProfit:l,operatingExpenses:s,netProfit:i}},template:(a,r,c)=>{const n=new Date(r).toLocaleDateString("id-ID"),d=new Date(c).toLocaleDateString("id-ID");return`
                    <h4 class="report-header">Laporan Laba Rugi ${n} - ${d}</h4>
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
                `}},Pembelian:{fetchData:async(a,r)=>{const c=document.getElementById("groupBy").value;if(c==="supplier"){const{data:n,error:d}=await S.from("pesanan_pembelian").select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        supplier:id_supplier(perusahaan, cp),
                        item_pesanan_pembelian(id_beli, qty_dipesan)
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",r);if(d)throw d;const e=new Map;return n.forEach(o=>{var i,p,u;const t=((i=o.supplier)==null?void 0:i.perusahaan)||o.supplier.cp;e.has(t)||e.set(t,{supplier:{perusahaan:((p=o.supplier)==null?void 0:p.perusahaan)||"(Tanpa Nama Perusahaan)",cp:o.supplier.cp},totalOrders:0,totalItems:0,totalPaid:0});const l=e.get(t);l.totalOrders++,l.totalPaid+=o.total_dibayarkan||0;const s=((u=o.item_pesanan_pembelian)==null?void 0:u.reduce((g,h)=>g+(h.qty_dipesan||0),0))||0;l.totalItems+=s}),Array.from(e.values())}else if(c==="product"){const{data:n,error:d}=await S.from("item_pesanan_pembelian").select(`
                        qty_dipesan,
                        harga_beli,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_pembelian!inner(
                            id,
                            supplier:id_supplier(perusahaan, cp),
                            status_pesanan
                        )
                    `).eq("pesanan_pembelian.status_pesanan","selesai").gte("pesanan_pembelian.tanggal_pesan",a).lte("pesanan_pembelian.tanggal_pesan",r);if(d)throw d;const e=n.filter(t=>{var l;return!((l=t.pesanan_pembelian)!=null&&l.supplier)});e.length>0&&console.warn("Items with missing supplier data:",e);const o=new Map;return n.forEach(t=>{var u,g,h;const l=(g=(u=t.varian)==null?void 0:u.produk)!=null&&g.nama?`${t.varian.produk.nama} - ${t.varian.varian||""}`:"Produk Tidak Dikenal";o.has(l)||o.set(l,{product:l,totalPurchased:0,totalDibayarkan:0,totalOrders:0,suppliers:new Set,orderIds:new Set});const s=o.get(l);s.totalPurchased+=t.qty_dipesan||0,s.totalDibayarkan+=(t.qty_dipesan||0)*(t.harga_beli||0),(h=t.pesanan_pembelian)!=null&&h.id&&!s.orderIds.has(t.pesanan_pembelian.id)&&(s.orderIds.add(t.pesanan_pembelian.id),s.totalOrders++);const i=t.pesanan_pembelian.supplier,p=i.perusahaan||i.cp;s.suppliers.add(p)}),Array.from(o.values()).map(t=>({...t,suppliers:Array.from(t.suppliers).join(", ")}))}else{const{data:n,error:d}=await S.from("pesanan_pembelian").select(`
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
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",r).order("tanggal_pesan",{ascending:!0});if(d)throw d;return n.map(e=>{var o;return{...e,supplier:{perusahaan:((o=e.supplier)==null?void 0:o.perusahaan)||"(Tanpa Nama Perusahaan)",cp:e.supplier.cp},item_pesanan_pembelian:e.item_pesanan_pembelian||[]}})}},template:(a,r,c)=>{const n=document.getElementById("groupBy").value,d=new Date(r).toLocaleDateString("id-ID"),e=new Date(c).toLocaleDateString("id-ID");if(n==="supplier"){const o=a.reduce((l,s)=>l+(s.totalPaid||0),0),t=a.reduce((l,s)=>l+(s.totalItems||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Supplier ${d} - ${e}</h4>
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
                        ${a.map((l,s)=>`
                        <tr>
                            <td>${s+1}</td>
                            <td>${l.supplier.perusahaan} (${l.supplier.cp})</td>
                            <td class="text-end">${l.totalOrders}</td>
                            <td class="text-end">${l.totalItems}</td>
                            <td class="text-end">${b(l.totalPaid)}</td>
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
                `}else if(n==="product"){const o=a.reduce((s,i)=>s+(i.totalPurchased||0),0),t=a.reduce((s,i)=>s+(i.totalOrders||0),0),l=a.reduce((s,i)=>s+(i.totalDibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Produk ${d} - ${e}</h4>
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
                        ${a.map((s,i)=>`
                        <tr>
                            <td>${i+1}</td>
                            <td>${s.product}</td>
                            <td>${s.suppliers||"-"}</td>
                            <td class="text-end">${s.totalOrders}</td>
                            <td class="text-end">${s.totalPurchased}</td>
                            <td class="text-end">${b(s.totalDibayarkan)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${t}</strong></td>
                        <td class="text-end"><strong>${o}</strong></td>
                        <td class="text-end"><strong>${b(l)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else{const o=a.reduce((t,l)=>t+(l.total_dibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Pembelian per Order ${d} - ${e}</h4>
                    ${a.map(t=>{var l,s;return t.item_pesanan_pembelian.reduce((i,p)=>i+p.qty_dipesan,0),`
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>PO-${t.id.toString().padStart(4,"0")}</strong> - 
                                    ${w(t.tanggal_pesan)} | 
                                    Supplier: ${((l=t.supplier)==null?void 0:l.perusahaan)||"-"} (${((s=t.supplier)==null?void 0:s.cp)||"-"}) | 
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
                                            ${t.item_pesanan_pembelian.map(i=>`
                                                <tr>
                                                    <td>${i.varian.produk.nama} - ${i.varian.varian}</td>
                                                    <td class="text-end">${i.qty_dipesan}</td>
                                                    <td class="text-end">${b(i.harga_beli)}</td>
                                                    <td class="text-end">${b(i.qty_dipesan*i.harga_beli)}</td>
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
                `}}},Penjualan:{fetchData:async(a,r)=>{const c=document.getElementById("groupBy").value;if(c==="customer"){const{data:n,error:d}=await S.from("pesanan_penjualan").select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        bakul:id_bakul(nama),
                        item_pesanan_penjualan(id_jual, qty_dipesan)
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",r);if(d)throw d;const e=new Map;return n.forEach(o=>{var i,p;const t=((i=o.bakul)==null?void 0:i.nama)||"Walk-in";e.has(t)||e.set(t,{customer:t,totalOrders:0,totalItems:0,totalPaid:0});const l=e.get(t);l.totalOrders++,l.totalPaid+=o.total_dibayarkan||0;const s=((p=o.item_pesanan_penjualan)==null?void 0:p.reduce((u,g)=>u+(g.qty_dipesan||0),0))||0;l.totalItems+=s}),Array.from(e.values())}else if(c==="product"){const{data:n,error:d}=await S.from("item_pesanan_penjualan").select(`
                        qty_dipesan,
                        harga_jual,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_penjualan!inner(
                            id,
                            tanggal_pesan,
                            total_dibayarkan,
                            bakul:id_bakul(nama)
                        )
                    `).eq("pesanan_penjualan.status_pesanan","selesai").gte("pesanan_penjualan.tanggal_pesan",a).lte("pesanan_penjualan.tanggal_pesan",r);if(d)throw d;const e=new Map;return n.forEach(o=>{var i,p,u,g;const t=(p=(i=o.varian)==null?void 0:i.produk)!=null&&p.nama?`${o.varian.produk.nama} - ${o.varian.varian||""}`:"Produk Tidak Dikenal";e.has(t)||e.set(t,{product:t,totalSold:0,totalRevenue:0,totalOrders:0,customers:new Set,orderIds:new Set});const l=e.get(t);l.totalSold+=o.qty_dipesan||0,l.totalRevenue+=Math.round((o.qty_dipesan||0)*(o.harga_jual||0)),(u=o.pesanan_penjualan)!=null&&u.id&&!l.orderIds.has(o.pesanan_penjualan.id)&&(l.orderIds.add(o.pesanan_penjualan.id),l.totalOrders++);const s=((g=o.pesanan_penjualan.bakul)==null?void 0:g.nama)||"Walk-in";l.customers.add(s)}),Array.from(e.values()).map(o=>({...o,customers:Array.from(o.customers).join(", ")}))}else{const{data:n,error:d}=await S.from("pesanan_penjualan").select(`
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
                    `).eq("status_pesanan","selesai").gte("tanggal_pesan",a).lte("tanggal_pesan",r).order("tanggal_pesan",{ascending:!0});if(d)throw d;return n.map(e=>{var o;return{...e,bakul:{nama:((o=e.bakul)==null?void 0:o.nama)||"Walk-in"},item_pesanan_penjualan:(e.item_pesanan_penjualan||[]).map(t=>{var l;return{...t,priceDifference:t.harga_jual-(((l=t.varian)==null?void 0:l.harga_standar)||0)}})}})}},template:(a,r,c)=>{const n=document.getElementById("groupBy").value,d=new Date(r).toLocaleDateString("id-ID"),e=new Date(c).toLocaleDateString("id-ID");if(n==="customer"){const o=a.reduce((l,s)=>l+(s.totalPaid||0),0),t=a.reduce((l,s)=>l+(s.totalItems||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Bakul ${d} - ${e}</h4>
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
                        ${a.map((l,s)=>`
                        <tr>
                            <td>${s+1}</td>
                            <td>${l.customer}</td>
                            <td class="text-end">${l.totalOrders}</td>
                            <td class="text-end">${l.totalItems}</td>
                            <td class="text-end">${b(l.totalPaid)}</td>
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
                `}else if(n==="product"){const o=a.reduce((s,i)=>s+(i.totalSold||0),0),t=a.reduce((s,i)=>s+(i.totalRevenue||0),0),l=a.reduce((s,i)=>s+(i.totalOrders||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Produk ${d} - ${e}</h4>
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
                        ${a.map((s,i)=>`
                        <tr>
                            <td>${i+1}</td>
                            <td>${s.product}</td>
                            <td>${s.customers||"-"}</td>
                            <td class="text-end">${s.totalOrders}</td>
                            <td class="text-end">${s.totalSold}</td>
                            <td class="text-end">${b(s.totalRevenue)}</td>
                        </tr>
                        `).join("")}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${l}</strong></td>
                        <td class="text-end"><strong>${o}</strong></td>
                        <td class="text-end"><strong>${b(t)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `}else{const o=a.reduce((t,l)=>t+(l.total_dibayarkan||0),0);return`
                    <h4 class="report-header">Laporan Penjualan per Order ${d} - ${e}</h4>
                    ${a.map(t=>{var l;return t.item_pesanan_penjualan.reduce((s,i)=>s+i.qty_dipesan,0),`
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>SO-${t.id.toString().padStart(4,"0")}</strong> - 
                                    ${w(t.tanggal_pesan)} | 
                                    Bakul: ${((l=t.bakul)==null?void 0:l.nama)||"Walk-in"} | 
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
                                            ${t.item_pesanan_penjualan.map(s=>{var h;const i=((h=s.varian)==null?void 0:h.harga_standar)||0,p=s.priceDifference||0,u=p===0?"0":p>0?`+${b(p)}`:b(p),g=p>0?"text-success":p<0?"text-danger":"";return`
                                                    <tr>
                                                        <td>${s.varian.produk.nama} - ${s.varian.varian}</td>
                                                        <td class="text-end">${s.qty_dipesan}</td>
                                                        <td class="text-end">${b(s.harga_jual)}</td>
                                                        <td class="text-end">${b(i)}</td>
                                                        <td class="text-end ${g}">${u}</td>
                                                        <td class="text-end">${b(s.qty_dipesan*s.harga_jual)}</td>
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
                `}}},"Kartu Stok":{fetchData:async(a,r)=>{const{data:c,error:n}=await S.from("riwayat_stok").select(`
                    tanggal,
                    tipe_riwayat,
                    qty,
                    saldo,
                    hpp,
                    varian:id_varian(id, varian, produk:id_produk(nama))
                `).gte("tanggal",a).lte("tanggal",r).order("tanggal",{ascending:!0});if(n)throw n;const d=new Map;return c.forEach(e=>{const o=e.varian.id;d.has(o)||d.set(o,{id:o,name:`${e.varian.produk.nama} - ${e.varian.varian}`,history:[],purchaseHistory:[]});const t=d.get(o);t.history.push(e),e.tipe_riwayat==="penjualan"&&t.purchaseHistory.push({qty:e.qty,hpp:e.hpp,tanggal:e.tanggal})}),Array.from(d.values()).map(e=>{const o=e.history.sort((h,f)=>new Date(h.tanggal)-new Date(f.tanggal));let t;if(o.length>0){const h=o[0];t=["purchase","penyesuaian_masuk"].includes(h.tipe_riwayat)?h.saldo-h.qty:h.saldo+h.qty}else t=0;const l=o.filter(h=>h.tipe_riwayat==="pembelian").reduce((h,f)=>h+f.qty,0),s=o.filter(h=>h.tipe_riwayat==="penjualan").reduce((h,f)=>h+f.qty,0),i=o.filter(h=>h.tipe_riwayat==="penyesuaian_masuk").reduce((h,f)=>h+f.qty,0),p=o.filter(h=>h.tipe_riwayat==="penyesuaian_keluar").reduce((h,f)=>h+f.qty,0),u=o.length>0?o[o.length-1].saldo:t;let g;return e.purchaseHistory.length>0?g=e.purchaseHistory[e.purchaseHistory.length-1].hpp:g=0,{id:e.id,name:e.name,initialStock:t,purchases:l,sales:s,adjustmentsIn:i,adjustmentsOut:p,finalStock:u,hpp:g}})},template:(a,r,c)=>{const n=new Date(r).toLocaleDateString("id-ID"),d=new Date(c).toLocaleDateString("id-ID");return`    
                <h4 class="report-header">Laporan Kartu Stok ${n} - ${d}</h4>
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
            `}},"Stock Opname":{fetchData:async(a,r)=>{const{data:c,error:n}=await S.from("log_opname").select(`
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
                `).gte("tanggal",a).lte("tanggal",r).order("tanggal",{ascending:!1});if(n)throw n;return{logs:c}},template:(a,r,c)=>(new Date(r).toLocaleDateString("id-ID"),new Date(c).toLocaleDateString("id-ID"),`
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
                        ${a.logs.map(n=>`
                            ${n.item_opname.map((d,e)=>{var o,t,l,s,i;return`
                                <tr class="${n.status_log==="final"?"table-success":"table-warning"}">
                                    ${e===0?`
                                        <td rowspan="${n.item_opname.length}">${n.id}</td>
                                        <td rowspan="${n.item_opname.length}">${new Date(n.tanggal).toLocaleDateString("id-ID")}</td>
                                        <td rowspan="${n.item_opname.length}">
                                            ${n.status_log}
                                        </td>
                                    `:""}
                                    <td>VAR${d.id_varian.toString().padStart(4,"0")}</td>
                                    <td>
                                        ${d.status_item_log}
                                    </td>
                                    <td class="text-end">${((o=d.varian)==null?void 0:o.jumlah_stok)||0}</td>
                                    <td class="text-end">${d.stok}</td>
                                    <td class="text-end ${d.stok-(((t=d.varian)==null?void 0:t.jumlah_stok)||0)>0?"text-success":d.stok-(((l=d.varian)==null?void 0:l.jumlah_stok)||0)<0?"text-danger":""}">
                                        ${d.stok-(((s=d.varian)==null?void 0:s.jumlah_stok)||0)>0?"+":""}${d.stok-(((i=d.varian)==null?void 0:i.jumlah_stok)||0)}
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
            `)}};function b(a){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(a).replace("Rp","Rp ")}async function Q(){const a=y.value,r=k.value,c=T.value;if(!r||!c){showToast("Harap pilih rentang tanggal","error");return}if(new Date(r)>new Date(c)){showToast("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error");return}try{E.textContent="Memuat...",C.style.display="inline-block",P.disabled=!0;const n=await j[a].fetchData(r,c);if(U(n)){L.innerHTML=`
                    <div class="alert alert-info text-center">
                        Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.
                    </div>
                `;return}const d=j[a].template(n,r,c);L.innerHTML=d}catch(n){console.error("Error generating report:",n),L.innerHTML=`
                <div class="alert alert-danger">
                    Gagal memuat laporan: ${n.message}
                </div>
            `}finally{E.textContent="Buat Laporan",C.style.display="none",P.disabled=!1}}async function J(){var s;const{jsPDF:a}=window.jspdf,r=new a("p","mm","a4"),c=20;let n=30;const d=y.value,e=k.value,o=T.value;if(!e||!o){showToast("Harap pilih rentang tanggal","error");return}if(new Date(e)>new Date(o)){showToast("Tanggal mulai tidak boleh lebih besar dari tanggal akhir","error");return}const t=new Date(e).toLocaleDateString("id-ID"),l=new Date(o).toLocaleDateString("id-ID");r.setFont("helvetica","bold"),r.setFontSize(12),r.setTextColor(40),r.text("GUNARTO",c,15),r.setFont("helvetica","normal"),r.setFontSize(10),r.text("Pasar Klewer, Surakarta",c,20),r.setDrawColor(150),r.line(c,22,210-c,22),r.setFontSize(16),r.setTextColor(0),r.text(`LAPORAN ${d.toUpperCase()}`,105,n,{align:"center"}),n+=8,r.setFontSize(12),r.text(`${t} - ${l}`,105,n,{align:"center"}),n+=15;try{const i=await j[d].fetchData(e,o);if(U(i)){r.setFontSize(12),r.setTextColor(100),r.text("Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.",105,n,{align:"center"}),O(r,c),r.save(`Laporan_${d}_${new Date().getFullYear()}.pdf`);return}const p=((s=document.getElementById("groupBy"))==null?void 0:s.value)||"order";switch(d){case"Laba Rugi":V(r,i,n,c);break;case"Pembelian":p==="supplier"?B(r,i,n,c,{entityType:"supplier",entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)"}):p==="product"?R(r,i,n,c,{entityLabel:"SUPPLIER",amountLabel:"TOTAL DIBERIKAN (Rp)",qtyLabel:"TOTAL DIBELI"}):N(r,i,n,c,{prefix:"PO",contactLabel:"Supplier",reportLabel:"Pembelian",itemField:"item_pesanan_pembelian",isPenjualan:!1});break;case"Penjualan":p==="customer"?B(r,i,n,c,{entityType:"customer",entityLabel:"BAKUL",amountLabel:"TOTAL DIBERIKAN (Rp)"}):p==="product"?R(r,i,n,c,{entityLabel:"BAKUL",amountLabel:"TOTAL PENDAPATAN (Rp)",qtyLabel:"TOTAL TERJUAL"}):N(r,i,n,c,{prefix:"SO",contactLabel:"Bakul",reportLabel:"Penjualan",itemField:"item_pesanan_penjualan",isPenjualan:!0});break;case"Kartu Stok":X(r,i,n,c);break;case"Stock Opname":Z(r,i,n,c);break}O(r,c),r.save(`Laporan_${d}_${new Date().getFullYear()}.pdf`)}catch(i){console.error("Error generating PDF:",i),showToast("Gagal membuat PDF: "+i.message,"error")}}function V(a,r,c,n){const d=[["PENDAPATAN",m(r.totalRevenue)],["Harga Pokok Penjualan (HPP)",m(r.totalCOGS)],["LABA KOTOR",m(r.grossProfit)],["Biaya Operasional",m(r.operatingExpenses)],["LABA BERSIH",m(r.netProfit)]];a.autoTable({head:[["KETERANGAN","JUMLAH (Rp)"]],body:d,startY:c,margin:{left:n,right:n},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",fontSize:11,lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0],cellPadding:2,fontSize:10},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{1:{halign:"right",cellWidth:50}},didDrawCell:e=>{if([0,2,4].includes(e.row.index)&&(a.setFillColor(255,255,255),a.rect(e.cell.x-1,e.cell.y-1,e.cell.width+2,e.cell.height+2,"F"),a.setTextColor(0),a.text(e.cell.raw,e.cell.x+e.cell.width-2,e.cell.y+e.cell.height-5,{align:"right"})),e.column.index===1&&e.cell.raw){const t=m(parseFloat(e.cell.raw.replace(/\./g,"")));e.cell.text=t}}})}function B(a,r,c,n,d){const{entityType:e,entityLabel:o,amountLabel:t}=d,l=r.reduce((u,g)=>u+(g.totalPaid||g.totalRevenue||0),0),s=r.reduce((u,g)=>u+(g.totalItems||g.totalSold||0),0),i=["NO",o,"TOTAL PESANAN","TOTAL ITEMS",t],p=r.map((u,g)=>{var h,f;return[g+1,e==="supplier"?`${((h=u.supplier)==null?void 0:h.perusahaan)||"-"}
${((f=u.supplier)==null?void 0:f.cp)||"-"}`:e==="customer"?u.customer:u.product,u.totalOrders,e==="product"?u.totalPurchased||u.totalSold:u.totalItems,m(u.totalPaid||u.totalRevenue||u.totalDibayarkan)]});p.push(["","TOTAL",r.length,s,m(l)]),a.autoTable({head:[i],body:p,startY:c,margin:{left:n,right:n},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},[p.length-1]:{fontStyle:"bold",fillColor:[220,220,220]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function R(a,r,c,n,d){const{entityLabel:e,amountLabel:o}=d,t=r.reduce((p,u)=>p+(u.totalPurchased||u.totalSold||0),0),l=r.reduce((p,u)=>p+(u.totalDibayarkan||u.totalRevenue||0),0),s=["NO","PRODUK",e,"TOTAL PESANAN",d.qtyLabel,o],i=r.map((p,u)=>[u+1,p.product,p.suppliers||p.customers||"-",p.totalOrders,p.totalPurchased||p.totalSold,m(p.totalDibayarkan||p.totalRevenue)]);i.push(["","TOTAL","",r.length,t,m(l)]),a.autoTable({head:[s],body:i,startY:c,margin:{left:n,right:n},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},alternateRowStyles:{fillColor:[255,255,255]},columnStyles:{3:{halign:"right"},4:{halign:"right"},5:{halign:"right"},[i.length-1]:{fontStyle:"bold",fillColor:[255,255,255]}},styles:{fontSize:10,cellPadding:2,overflow:"linebreak"}})}function N(a,r,c,n,d){const{prefix:e,contactLabel:o,reportLabel:t,itemField:l,isPenjualan:s}=d,i=r.reduce((p,u)=>p+(u.total_dibayarkan||0),0);a.setFontSize(12),a.setTextColor(0),a.text(`Daftar Pesanan ${t}`,n,c),c+=10,r.forEach((p,u)=>{var f,q,F,M;(f=p[l])!=null&&f.reduce((_,D)=>_+(D.qty_dipesan||0),0),a.setFontSize(10),a.setFont("helvetica","bold"),a.text(`${e}-${p.id.toString().padStart(4,"0")} - ${w(p.tanggal_pesan)}`,n,c),c+=5,a.setFont("helvetica","normal"),s?a.text(`${o}: ${((q=p.bakul)==null?void 0:q.nama)||"Walk-in"}`,n,c):a.text(`${o}: ${((F=p.supplier)==null?void 0:F.perusahaan)||"-"} (${((M=p.supplier)==null?void 0:M.cp)||"-"})`,n,c),c+=5,a.text(`Total: ${m(p.total_dibayarkan)}`,n,c),c+=5;const g=s?["PRODUK","QTY","HARGA SATUAN","HARGA STANDAR","DISKON/KENAIKAN","SUBTOTAL"]:["PRODUK","QTY","HARGA SATUAN","SUBTOTAL"],h=(p[l]||[]).map(_=>{var H,W,K;const D=(W=(H=_.varian)==null?void 0:H.produk)!=null&&W.nama?`${_.varian.produk.nama} - ${_.varian.varian||""}`:"Unknown Product";if(s){const tt=((K=_.varian)==null?void 0:K.harga_standar)||0,v=_.priceDifference||0,at=v===0?"0":v>0?`+${m(v)}`:m(v);return[D,_.qty_dipesan||0,m(_.harga_jual),m(tt),{content:at,styles:{textColor:v>0?[0,128,0]:v<0?[255,0,0]:[0,0,0]}},m((_.qty_dipesan||0)*(_.harga_jual||0))]}else return[D,_.qty_dipesan||0,m(_.harga_beli||0),m((_.qty_dipesan||0)*(_.harga_beli||0))]});a.autoTable({head:[g],body:h,startY:c,margin:{left:n,right:n},headStyles:{fillColor:[255,255,255],textColor:0,fontStyle:"bold",lineWidth:.1,lineColor:[0,0,0]},bodyStyles:{fillColor:[255,255,255],textColor:0,lineWidth:.1,lineColor:[0,0,0]},columnStyles:{0:{cellWidth:35},1:{cellWidth:12,halign:"right"},2:{cellWidth:30,halign:"right"},...s?{3:{cellWidth:32,halign:"right"},4:{cellWidth:35,halign:"right"},5:{cellWidth:25,halign:"right"}}:{3:{cellWidth:25,halign:"right"}}},alternateRowStyles:{fillColor:[255,255,255]},styles:{fontSize:9,cellPadding:2,overflow:"linebreak"},didDrawPage:_=>{c=_.cursor.y+5}}),c+=10,c>250&&u<r.length-1&&(a.addPage(),c=30)}),a.setFont("helvetica","bold"),a.text(`Total ${t}: ${m(i)}`,n,c)}function X(a,r,c,n){a.autoTable({head:[["KODE","NAMA BARANG","STOK AWAL","PEMBELIAN","PENJUALAN","STOK AKHIR"]],body:r.map(d=>[`VAR${d.id.toString().padStart(4,"0")}`,d.name,d.initialStock,d.purchases,d.sales,d.finalStock]),startY:c,margin:{left:n,right:n},headStyles:{fillColor:[13,71,161],textColor:255,fontStyle:"bold"},columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},5:{halign:"right"}},styles:{fontSize:9,cellPadding:3}})}function Z(a,r,c=30,n=14){const{logs:d}=r;a.setFont("helvetica"),a.setFontSize(16),a.setTextColor(0,0,128),a.text("LAPORAN STOCK OPNAME",105,c,{align:"center"});const e=c+25,o=[];return d.forEach(t=>{t.item_opname.forEach((l,s)=>{var u,g;const i=l.stok-(((u=l.varian)==null?void 0:u.jumlah_stok)||0),p=[s===0?{content:t.id.toString(),rowSpan:t.item_opname.length}:"",s===0?{content:w(t.tanggal),rowSpan:t.item_opname.length}:"",s===0?{content:t.status_log,rowSpan:t.item_opname.length}:"",`VAR${l.id_varian.toString().padStart(4,"0")}`,l.status_item_log,{content:(((g=l.varian)==null?void 0:g.jumlah_stok)||0).toString(),styles:{halign:"right"}},{content:l.stok.toString(),styles:{halign:"right"}},{content:i===0?"0":i>0?`+${i}`:i.toString(),styles:{halign:"right",textColor:i>0?[0,128,0]:i<0?[255,0,0]:[0,0,0]}}];o.push(p)})}),a.autoTable({head:[["ID LOG","TANGGAL","STATUS LOG","ID ITEM","STATUS ITEM","STOK SISTEM","STOK FISIK","SELISIH"]],body:o,startY:e,margin:{left:n,right:n},headStyles:{fillColor:[13,71,161],textColor:255,fontStyle:"bold"},columnStyles:{0:{cellWidth:20},1:{cellWidth:30},2:{cellWidth:25},3:{cellWidth:25},4:{cellWidth:30},5:{cellWidth:25,halign:"right"},6:{cellWidth:25,halign:"right"},7:{cellWidth:20,halign:"right"}},didDrawPage:function(t){O(a,n)},createdCell:function(t,l){t.raw!==null&&typeof t.raw=="object"&&t.raw.rowSpan&&(t.rowSpan=t.raw.rowSpan,t.content=t.raw.content)},drawCell:function(t,l){if(t.raw==="")return l.table.cell(t.x,t.y,t.width,t.height,"",t.styles),!1}}),a}function O(a,r){const c=a.internal.getNumberOfPages();for(let n=1;n<=c;n++)a.setPage(n),a.setFontSize(8),a.setTextColor(100),a.setDrawColor(200),a.line(r,285,210-r,285),a.text(`Halaman ${n} dari ${c}`,105,291,{align:"center"}),a.text(`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`,105,294,{align:"center"})}function m(a){return new Intl.NumberFormat("id-ID",{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)}function w(a){return a?new Date(a).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}):""}P.addEventListener("click",Q),G.addEventListener("click",J)});
