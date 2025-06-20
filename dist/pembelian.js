const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["navbar2.js","auth.js","db_conn.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill.js";import{_ as R,s as f}from"./db_conn.js";import{i as U,c as V}from"./auth.js";import{p as O,d as W,u as z}from"./import.js";fetch("navbar.html").then(e=>e.text()).then(async e=>{document.getElementById("navbar").innerHTML=e,(await R(()=>import("./navbar2.js"),__vite__mapDeps([0,1,2]))).setupLogout()}).catch(e=>console.error("Error loading navbar:",e));U();(async()=>await V())();let T;function M(e){return{dipesan:"secondary",diterima:"success",dibayar:"primary"}[e]||"secondary"}function q(e){return e?new Date(e).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"-"}function $(e){if(!e)return"";const t=new Date(e);return new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16)}function A(e){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(e)}function b(e,t="success"){const r=document.getElementById("toastContainer");if(!r){console.error("Toast container not found!");return}const a=document.createElement("div");a.className=`toast align-items-center text-white bg-${t==="success"?"success":"danger"} border-0`,a.setAttribute("role","alert"),a.setAttribute("aria-live","assertive"),a.setAttribute("aria-atomic","true"),a.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,r.appendChild(a),new bootstrap.Toast(a,{autohide:!0,delay:3e3}).show(),a.addEventListener("hidden.bs.toast",()=>{a.remove()})}async function K(e,t,r,a=null){const n=e.value;if(t.disabled=!0,t.innerHTML='<option value="" selected disabled>Memuat varian...</option>',!n){t.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>';return}try{const{data:s,error:i}=await f.from("produk_varian").select("id, varian, harga_standar").eq("id_produk",n).order("varian",{ascending:!0});if(i)throw i;t.innerHTML=`
            <option value="" ${a?"":"selected"} disabled>Pilih Varian</option>
            ${s.map(o=>`<option value="${o.id}" data-price="${o.harga_standar}"
                    ${a===o.id?"selected":""}>
                    ${o.varian}
                </option>`).join("")}
        `,t.disabled=!1}catch(s){console.error("Error loading variants:",s),t.innerHTML='<option value="" selected disabled>Error memuat varian</option>'}}async function X(){try{const e=document.getElementById("supplier");if(!e){console.error("Supplier select element not found!"),b("Elemen supplier tidak ditemukan","error");return}e.innerHTML='<option value="" disabled selected>Memuat supplier...</option>';const{data:t,error:r}=await f.from("supplier").select("id, perusahaan, cp");if(r)throw r;if(!t||t.length===0){b("Tidak ada data supplier","warning"),e.innerHTML='<option value="" disabled selected>Tidak ada supplier</option>';return}e.innerHTML='<option value="" disabled selected>Pilih Supplier</option>',t.forEach(a=>{const n=document.createElement("option");n.value=a.id,n.textContent=`${a.perusahaan} (Contact Person: ${a.cp})`,e.appendChild(n)})}catch(e){console.error("Error loading suppliers:",e);const t=document.getElementById("supplier");t.innerHTML='<option value="" disabled selected>Error loading suppliers</option>',b("Gagal memuat daftar supplier: "+e.message,"error")}}async function P(){try{const{data:e,error:t}=await f.rpc("get_enum_values",{enum_name:"lokasi_penerimaan"});return t?(console.error("Error loading locations:",t),[{value:"gudang"},{value:"toko"}]):e}catch(e){return console.error("Error:",e),[{value:"gudang"},{value:"toko"}]}}async function C(){try{const{data:e,error:t}=await f.rpc("get_enum_values",{enum_name:"alat_pembayaran"});return t?(console.error("Error loading payment methods:",t),[{value:"tunai"},{value:"transfer"}]):e}catch(e){return console.error("Error:",e),[{value:"tunai"},{value:"transfer"}]}}function Q(){var s,i,o,d,l,m;const e=document.getElementById("orderModal").dataset.mode,t=e==="add";let r;if(t)r="draft";else{const c=document.querySelector("#orderStatusToggle .btn-status.active");r=(c==null?void 0:c.dataset.status)||"dipesan"}const a=c=>c?new Date(c).toISOString():null,n={orderDate:a(document.getElementById("orderDate").value),supplierId:document.getElementById("supplier").value,status:r,items:Array.from(document.querySelectorAll("#productsTable tbody tr")).map(c=>{var g,p,h;const v={variantId:c.querySelector(".variant-select").value,quantity:parseInt(c.querySelector(".quantity").value)||0,rowId:c.dataset.itemId||null};return e==="edit"&&r!=="dipesan"&&(v.receivedQty=parseInt((g=c.querySelector(".received-qty"))==null?void 0:g.value)||0,v.brokenQty=parseInt((p=c.querySelector(".broken-qty"))==null?void 0:p.value)||0,v.purchasePrice=parseFloat((h=c.querySelector(".purchase-price"))==null?void 0:h.value)||0),v})};return e==="edit"&&(r==="diterima"?(n.receivedDate=a((s=document.getElementById("tanggalDiterima"))==null?void 0:s.value),n.receivingLocation=(i=document.getElementById("lokasiPenerimaan"))==null?void 0:i.value,n.deliveryNoteNumber=(o=document.getElementById("noSuratJalan"))==null?void 0:o.value):r==="dibayar"&&(n.paymentDate=a((d=document.getElementById("tanggalPembayaran"))==null?void 0:d.value),n.paymentAmount=parseFloat((l=document.getElementById("totalDibayarkan"))==null?void 0:l.value)||0,n.paymentMethod=(m=document.getElementById("alatPembayaran"))==null?void 0:m.value)),n}async function Y(){const e=document.getElementById("saveOrder"),t=e.innerHTML,r=document.getElementById("orderModal").dataset.mode;try{e.disabled=!0,e.innerHTML=`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Menyimpan...
        `,r==="edit"?await ee():await Z(),T.hide(),await I()}catch(a){console.error("Save failed:",a),b("Gagal menyimpan pesanan","error")}finally{e.disabled=!1,e.innerHTML=t}}async function Z(){const e=Q();try{const{data:t,error:r}=await f.from("pesanan_pembelian").insert({tanggal_pesan:e.orderDate,id_supplier:e.supplierId,status_pesanan:"dipesan"}).select().single();if(r)throw r;const{error:a}=await f.from("item_pesanan_pembelian").insert(e.items.map(n=>({id_beli:t.id,id_varian:n.variantId,qty_dipesan:n.quantity,qty_diterima:null,qty_rusak:null,harga_beli:null})));if(a)throw a;b("Pesanan baru berhasil dibuat","success"),await I()}catch(t){console.error("Create order error:",t),b("Gagal membuat pesanan: "+t.message,"error")}}async function ee(){const e=document.getElementById("orderModal").dataset.orderId,t=Q();try{const r={tanggal_pesan:t.orderDate,id_supplier:t.supplierId,status_pesanan:t.status};t.status==="diterima"?(r.tanggal_diterima=t.receivedDate,r.lokasi_penerimaan=t.receivingLocation,r.no_surat_jalan=t.deliveryNoteNumber):t.status==="dibayar"&&(r.tanggal_pembayaran=t.paymentDate,r.total_dibayarkan=t.paymentAmount,r.alat_pembayaran=t.paymentMethod);const{error:a}=await f.from("pesanan_pembelian").update(r).eq("id",e);if(a)throw a;if(t.status==="diterima")for(const i of t.items){if(i.receivedQty===void 0)throw new Error('Received quantity is required for "diterima" status');const o=Number(i.receivedQty)||0;if(isNaN(o))throw new Error("Quantities must be valid numbers");let d=o;if(i.rowId){const{data:l,error:m}=await f.from("item_pesanan_pembelian").select("qty_diterima").eq("id",i.rowId).single();if(!m&&(l!=null&&l.qty_diterima)){const c=Number(l.qty_diterima)||0;d=o-c}}if(d!==0&&await z(i.variantId,d,"pembelian")===null)throw new Error(`Failed to update stock for variant ${i.variantId}`)}const n=[],s=[];if(t.items.forEach(i=>{const o={id_varian:i.variantId,qty_dipesan:i.quantity};t.status!=="dipesan"&&(o.qty_diterima=i.receivedQty??null,o.qty_rusak=i.brokenQty??null,o.harga_beli=i.purchasePrice??null),i.rowId?n.push({...o,id:i.rowId}):s.push({...o,id_beli:e})}),n.length>0){const{error:i}=await f.from("item_pesanan_pembelian").upsert(n);if(i)throw i}if(s.length>0){const{error:i}=await f.from("item_pesanan_pembelian").insert(s);if(i)throw i}b("Pesanan berhasil diperbarui","success"),await I()}catch(r){console.error("Update order error:",r),b("Gagal memperbarui pesanan: "+r.message,"error")}}async function G(e=null,t=null){const r=document.querySelector("#productsTable tbody"),a=document.getElementById("supplier").value;if(!a){b("Pilih supplier terlebih dahulu","warning");return}try{const{data:n,error:s}=await f.from("produk").select("id, nama").eq("id_supplier",a).order("nama",{ascending:!0});if(s)throw s;const i=document.createElement("tr");i.innerHTML=`
            <td>
                <select class="form-select product-select">
                    <option value="" selected disabled>Pilih Produk</option>
                    ${n.map(l=>`<option value="${l.id}" ${e===l.id?"selected":""}>
                            ${l.nama}
                        </option>`).join("")}
                </select>
            </td>
            <td>
                <select class="form-select variant-select" ${e?"":"disabled"}>
                    ${e?'<option value="" selected disabled>Memuat varian...</option>':'<option value="" selected disabled>Pilih Produk Dulu</option>'}
                </select>
            </td>
            <td>
                <input type="number" class="form-control quantity" min="1" value="">
            </td>
            <td>
                <button class="btn btn-danger btn-sm remove-product">×</button>
            </td>
        `,r.appendChild(i);const o=i.querySelector(".product-select"),d=i.querySelector(".variant-select");o.addEventListener("change",async function(){if(!this.value){d.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>',d.disabled=!0;return}await K(o,d,i,t)}),e&&o.dispatchEvent(new Event("change"))}catch(n){console.error("Error adding product row:",n),b("Gagal menambahkan produk","error")}}function te(e,t){const r=document.createElement("tr");r.dataset.itemId=e.id;const a=["diterima","dibayar","selesai"].includes(t);return console.log(e.produk_varian.produk.nama+e.produk_varian.produk.id),r.innerHTML=`
        <td>
            <select class="form-select product-select" disabled>
                <option value="${e.produk_varian.produk.id}" selected>
                    ${e.produk_varian.produk.nama}
                </option>
            </select>
        </td>
        <td>
            <select class="form-select variant-select" disabled>
                <option value="${e.produk_varian.id}" selected>
                    ${e.produk_varian.varian}
                </option>
            </select>
        </td>
        <td>
            <input type="number" class="form-control quantity" 
                   value="${e.qty_dipesan}" min="1" 
                   ${t!=="dipesan"?"readonly":""}>
        </td>
        ${t!=="dipesan"?`<td>
            <input type="number" class="form-control received-qty" 
                   value="${e.qty_diterima||0}" min="0"
                   ${["dibayar","selesai"].includes(t)?"readonly":""}>
        </td>`:""}
        ${t!=="dipesan"?`<td>
                <input type="number" class="form-control broken-qty" 
                       value="${e.qty_rusak||0}" min="0"
                       ${["dibayar","selesai"].includes(t)?"readonly":""}>
            </td>`:""}
        ${t!=="dipesan"?`<td>
                <input type="number" class="form-control purchase-price" 
                        value="${e.harga_beli||0}" min="0"
                        ${["dibayar","selesai"].includes(t)?"readonly":""}>
            </td>`:""}
        <td>
            <button class="btn btn-danger btn-sm remove-item" 
                    ${a?"disabled":""}>×</button>
        </td>
    `,r}function ae(e){const t=document.createElement("div");t.className="col-md-6 col-lg-4 mb-3";const r=document.createElement("div");r.className="card h-100";const a=document.createElement("div");a.className="card-header d-flex justify-content-between align-items-center";const n=document.createElement("h5");n.className="mb-0",n.textContent=`#${e.id}`;const s=document.createElement("div");s.className="d-flex align-items-center gap-2";const i=document.createElement("span");i.className=`order-status badge bg-${M(e.status_pesanan)}`,i.textContent=e.status_pesanan;const o=document.createElement("button");o.className="btn btn-sm btn-outline-secondary edit-order",o.innerHTML='<i class="bi bi-pencil"></i>',o.addEventListener("click",y=>{y.stopPropagation(),j("edit",e.id)}),a.appendChild(n),s.appendChild(i),s.appendChild(o),a.appendChild(s);const d=document.createElement("div");d.className="card-body";const l=document.createElement("p");l.className="mb-1",l.innerHTML=`<strong>Tanggal Pemesanan:</strong> ${q(e.tanggal_pesan)}`;const m=document.createElement("p");m.className="mb-1",m.innerHTML=`<strong>Supplier:</strong> ${e.supplier.perusahaan} (Contact Person: ${e.supplier.cp})`;const c=document.createElement("p");c.className="mb-1 mt-1 fw-bold",c.textContent="Items:";const v=document.createElement("ul");v.className="list-unstyled mb-0",e.items.forEach(y=>{var _,k,L;const E=document.createElement("li");E.className="d-flex justify-content-between",E.innerHTML=`
            <span>${((k=(_=y.produk_varian)==null?void 0:_.produk)==null?void 0:k.nama)||"Produk"} - ${((L=y.produk_varian)==null?void 0:L.varian)||""}</span>
            <span>${y.qty_dipesan}</span>
        `,v.appendChild(E)}),d.appendChild(l),d.appendChild(m),d.appendChild(c),d.appendChild(v);const g=document.createElement("div");g.className="card-footer bg-transparent border-top-0";const p=document.createElement("div");p.className="d-flex justify-content-between";const h=document.createElement("button");if(h.className="btn btn-sm",e.status_pesanan==="dipesan"){const y=document.createElement("button");y.className="btn btn-sm btn-outline-danger ms-2 cancel-order",y.innerHTML='<i class="bi bi-x-circle"></i> Batalkan',y.dataset.orderId=e.id,g.appendChild(y)}else if(e.status_pesanan==="dibayar"){const y=document.createElement("button");y.className="btn btn-sm btn-dark ms-2 complete-order",y.innerHTML='<i class="bi bi-check-circle"></i> Selesaikan',y.dataset.orderId=e.id,y.dataset.receivedDate=e.tanggal_diterima||new Date().toISOString();const E=e.items.map(_=>{var k;return{variantId:((k=_.produk_varian)==null?void 0:k.id)||"",receivedQty:_.qty_diterima||0,brokenQty:_.qty_rusak||0,price:_.harga_beli||0}});y.dataset.items=JSON.stringify(E),g.appendChild(y)}return p.appendChild(h),g.appendChild(p),r.appendChild(a),r.appendChild(d),r.appendChild(g),t.appendChild(r),t}async function I(){const e=document.getElementById("ongoingOrdersContainer");if(e)try{e.innerHTML=`
            <div class="col-12 text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat pesanan...
            </div>
        `;const{data:t,error:r}=await f.from("pesanan_pembelian").select(`
                id,
                tanggal_pesan,
                tanggal_diterima,
                status_pesanan,
                supplier:id_supplier(perusahaan, cp),
                items:item_pesanan_pembelian(
                    id,
                    produk_varian:id_varian(
                        id,
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan,
                    qty_diterima,
                    qty_rusak,
                    harga_beli
                )
            `).neq("status_pesanan","selesai").order("id",{ascending:!1});if(r)throw r;e.innerHTML="";const a=document.createElement("div");a.className="row mt-3",t&&t.length>0?t.forEach(n=>{a.appendChild(ae(n))}):a.innerHTML='<div class="col-12 text-center text-muted">Tidak ada pesanan aktif</div>',e.appendChild(a)}catch(t){console.error("Error fetching orders:",t),b("Gagal memuat daftar pesanan","error")}}async function j(e="add",t=null){T||(T=new bootstrap.Modal(document.getElementById("orderModal")),await X()),document.getElementById("orderForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",re();const r=document.querySelector(".status-toggle-container"),a=document.getElementById("orderStatusBadge"),n=document.getElementById("orderModalLabel"),s=document.querySelector("#productsTable thead tr"),i=document.getElementById("addProduct"),o=document.getElementById("orderModal");if(o.dataset.mode=e,i&&(i.style.display="block"),e==="edit"&&t){r&&(r.style.display="block"),a&&(a.style.display="none"),n.textContent="Edit Pesanan Pembelian";const{data:d,error:l}=await f.from("pesanan_pembelian").select("status_pesanan").eq("id",t).single();!l&&d&&d.status_pesanan!=="dipesan"?s.innerHTML=`
                <th>Produk</th>
                <th>Varian</th>
                <th>Qty. Dipesan</th>
                <th>Qty. Diterima</th>
                <th>Qty. Rusak</th>
                <th>Harga Beli (satuan)</th>
                <th></th>
            `:s.innerHTML=`
                <th>Produk</th>
                <th>Varian</th>
                <th>Qty. Dipesan</th>
                <th></th>
            `,await ne(t),document.getElementById("saveOrder").textContent="Update";const m=o.dataset.currentStatus;i&&(i.style.display=m==="dipesan"?"block":"none")}else r&&(r.style.display="none"),a&&(a.style.display="inline-block",a.textContent="draft",a.className=`badge bg-${M("dipesan")}`),n.textContent="Tambah Pesanan Pembelian",s.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th></th>
        `,o.removeAttribute("data-sale-id"),o.removeAttribute("data-current-status"),document.getElementById("saveOrder").textContent="Simpan";T.show()}async function ne(e){try{const{data:t,error:r}=await f.from("pesanan_pembelian").select(`
                id,
                tanggal_pesan,
                id_supplier,
                status_pesanan,
                tanggal_diterima,
                lokasi_penerimaan,
                no_surat_jalan,
                tanggal_pembayaran,
                total_dibayarkan,
                alat_pembayaran,
                items:item_pesanan_pembelian(
                    id,
                    produk_varian:id_varian(
                        id,
                        varian,
                        produk:id_produk(id, nama)
                    ),
                    qty_dipesan,
                    qty_diterima,
                    qty_rusak,
                    harga_beli
                )
            `).eq("id",e).single();if(r)throw r;const a=document.getElementById("orderModal");a.dataset.orderId=e,a.dataset.currentStatus=t.status_pesanan,document.getElementById("orderDate").value=$(t.tanggal_pesan),document.getElementById("supplier").value=t.id_supplier;const n=document.querySelector("#productsTable tbody");n.innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",t.items.forEach(s=>{const i=te(s,t.status_pesanan);n.appendChild(i)}),await oe(t),ie(t.status_pesanan,t)}catch(t){throw console.error("Failed to load order:",t),b("Gagal memuat data pesanan","error"),t}}function re(){const e=document.getElementById("addProduct"),t=document.getElementById("saveOrder"),r=document.getElementById("supplier");e.replaceWith(e.cloneNode(!0)),t.replaceWith(t.cloneNode(!0)),r.replaceWith(r.cloneNode(!0)),document.getElementById("addProduct").addEventListener("click",G),document.getElementById("saveOrder").addEventListener("click",async a=>{a.preventDefault();try{await Y()}catch(n){console.error("Save failed:",n),b("Gagal menyimpan: "+n.message,"error")}}),document.getElementById("supplier").addEventListener("change",async function(){document.querySelector("#productsTable tbody").innerHTML=""}),document.querySelector("#productsTable tbody").addEventListener("click",function(a){(a.target.classList.contains("remove-item")||a.target.classList.contains("remove-product"))&&a.target.closest("tr").remove()}),document.getElementById("orderModal").addEventListener("hidden.bs.modal",()=>{document.getElementById("orderForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="";const a=document.querySelector("#productsTable thead tr");a.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. dipesan</th>
            <th></th>
        `})}function ie(e,t){var o,d,l,m,c,v;const r=document.getElementById("orderStatusBadge"),a=document.querySelectorAll("#orderStatusToggle .btn-status"),n={};e==="diterima"?(n.tanggalDiterima=((o=document.getElementById("tanggalDiterima"))==null?void 0:o.value)||"",n.lokasiPenerimaan=((d=document.getElementById("lokasiPenerimaan"))==null?void 0:d.value)||"",n.noSuratJalan=((l=document.getElementById("noSuratJalan"))==null?void 0:l.value)||""):e==="dibayar"&&(n.tanggalPembayaran=((m=document.getElementById("tanggalPembayaran"))==null?void 0:m.value)||"",n.totalDibayarkan=((c=document.getElementById("totalDibayarkan"))==null?void 0:c.value)||"",n.alatPembayaran=((v=document.getElementById("alatPembayaran"))==null?void 0:v.value)||"");const s=["dipesan","diterima","dibayar","selesai"],i=s.indexOf(e);a.forEach(g=>{g.classList.remove("active");const p=g.dataset.status,h=s.indexOf(p);p===e?(g.classList.add("active"),g.disabled=!1):g.disabled=h!==i+1}),N(e,n),a.forEach(g=>{g.addEventListener("click",function(){var E,_,k,L,D,H;if(this.disabled)return;const p=this.dataset.status;r.textContent=p,r.className=`badge bg-${M(p)}`;const h={};p==="diterima"?(h.tanggalDiterima=((E=document.getElementById("tanggalDiterima"))==null?void 0:E.value)||(t==null?void 0:t.tanggal_diterima)||"",h.lokasiPenerimaan=((_=document.getElementById("lokasiPenerimaan"))==null?void 0:_.value)||(t==null?void 0:t.lokasi_penerimaan)||"",h.noSuratJalan=((k=document.getElementById("noSuratJalan"))==null?void 0:k.value)||(t==null?void 0:t.no_surat_jalan)||""):p==="dibayar"&&(h.tanggalPembayaran=((L=document.getElementById("tanggalPembayaran"))==null?void 0:L.value)||(t==null?void 0:t.tanggal_pembayaran)||"",h.totalDibayarkan=((D=document.getElementById("totalDibayarkan"))==null?void 0:D.value)||(t==null?void 0:t.total_dibayarkan)||"",h.alatPembayaran=((H=document.getElementById("alatPembayaran"))==null?void 0:H.value)||(t==null?void 0:t.alat_pembayaran)||""),N(p,h);const y=s.indexOf(p);a.forEach(B=>{const x=B.dataset.status,J=s.indexOf(x);B.classList.remove("active"),x===p?(B.classList.add("active"),B.disabled=!1):B.disabled=J!==y+1})})})}async function N(e,t={}){const r=document.querySelector("#productsTable thead tr");e==="dipesan"?r.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. dipesan</th>
            <th></th>
        `:r.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Qty. Diterima</th>
            <th>Qty. Rusak</th>
            <th>Harga Beli (satuan)</th>
            <th></th>
        `,document.getElementById("orderDate").disabled=e!=="dipesan"&&e!=="draft",document.getElementById("supplier").disabled=e!=="dipesan"&&e!=="draft",document.querySelectorAll("#productsTable tbody tr").forEach(n=>{const s=n.querySelector(".quantity"),i=n.querySelector(".variant-select"),o=n.querySelector(".received-qty"),d=n.querySelector(".broken-qty"),l=n.querySelector(".purchase-price"),m=n.querySelector(".remove-item");if(s.readOnly=e!=="dipesan",i.disabled=!0,e!=="dipesan")if(!o&&!d&&!l){const c=n.querySelector("td:last-child"),v=document.createElement("td");v.innerHTML=`
                    <input type="number" class="form-control received-qty" min="0"
                           ${["dibayar","selesai"].includes(e)?"readonly":""}>
                `,n.insertBefore(v,c);const g=document.createElement("td");g.innerHTML=`
                    <input type="number" class="form-control broken-qty" min="0"
                           ${["dibayar","selesai"].includes(e)?"readonly":""}>
                `,n.insertBefore(g,c);const p=document.createElement("td");p.innerHTML=`
                    <input type="number" class="form-control purchase-price" min="0"
                           ${["dibayar","selesai"].includes(e)?"readonly":""}>
                `,n.insertBefore(p,c)}else o&&(o.readOnly=["dibayar","selesai"].includes(e)),d&&(d.readOnly=["dibayar","selesai"].includes(e)),l&&(l.readOnly=["dibayar","selesai"].includes(e));else[".received-qty",".broken-qty",".purchase-price"].forEach(c=>{const v=n.querySelector(c);v&&v.parentElement.remove()});m&&(m.disabled=["diterima","dibayar","selesai"].includes(e))}),document.getElementById("addProduct").style.display=e==="dipesan"?"block":"none";const a=document.getElementById("statusFieldsContainer");if(e==="diterima"){const n=await P();let s='<option value="" disabled selected>Pilih lokasi</option>';n.forEach(i=>{const o=t.lokasiPenerimaan&&t.lokasiPenerimaan===i.value?"selected":"",d=i.value.split("_").map(l=>l.charAt(0).toUpperCase()+l.slice(1)).join(" ");s+=`<option value="${i.value}" ${o}>${d}</option>`}),a.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="datetime-local" class="form-control" id="tanggalDiterima" 
                        value="${t.tanggalDiterima||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Lokasi Penerimaan</label>
                    <select class="form-select" id="lokasiPenerimaan">
                        ${s}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">No. Surat Jalan</label>
                    <input type="text" class="form-control" id="noSuratJalan" 
                        value="${t.noSuratJalan||""}">
                </div>
            </div>
        `}else if(e==="dibayar"){const n=await C();let s='<option value="" disabled selected>Pilih metode pembayaran</option>';n.forEach(i=>{const o=t.alatPembayaran===i.value?"selected":"",d=i.value.charAt(0).toUpperCase()+i.value.slice(1);s+=`<option value="${i.value}" ${o}>${d}</option>`}),a.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="datetime-local" class="form-control" id="tanggalPembayaran" 
                           value="${t.tanggalPembayaran||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${t.totalDibayarkan||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${s}
                    </select>
                </div>
            </div>
        `}else a.innerHTML=""}async function oe(e){const t=document.getElementById("statusFieldsContainer");if(t.innerHTML="",e.status_pesanan==="diterima"){const r=await P();let a='<option value="" disabled selected>Pilih lokasi</option>';r.forEach(n=>{const s=e.lokasi_penerimaan&&e.lokasi_penerimaan===n.value?"selected":"",i=n.value.split("_").map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" ");a+=`<option value="${n.value}" ${s}>${i}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="datetime-local" class="form-control" id="tanggalDiterima" 
                           value="${$(e.tanggal_diterima)}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Lokasi Penerimaan</label>
                    <select class="form-select" id="lokasiPenerimaan">
                        ${a}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">No. Surat Jalan</label>
                    <input type="text" class="form-control" id="noSuratJalan" 
                           value="${e.no_surat_jalan||""}">
                </div>
            </div>
        `}else if(e.status_pesanan==="dibayar"){const r=await C();let a='<option value="" disabled selected>Pilih metode pembayaran</option>';r.forEach(n=>{const s=e.alat_pembayaran&&e.alat_pembayaran===n.value?"selected":"",i=n.value.charAt(0).toUpperCase()+n.value.slice(1);a+=`<option value="${n.value}" ${s}>${i}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="datetime-local" class="form-control" id="tanggalPembayaran" 
                           value="${$(e.tanggal_pembayaran)}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${e.total_dibayarkan||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${a}
                    </select>
                </div>
            </div>
        `}}async function S(e=null,t=null,r=null,a=null,n=null){const s=document.querySelector("#history tbody");if(s){s.innerHTML=`
        <tr>
            <td colspan="11" class="text-center my-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Memuat riwayat pembelian...</p>
            </td>
        </tr>`;try{let i=f.from("pesanan_pembelian").select(`
                id,
                tanggal_pesan,
                supplier: id_supplier(perusahaan, cp),
                status_pesanan,
                tanggal_diterima,
                lokasi_penerimaan,
                no_surat_jalan,
                tanggal_pembayaran,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_pembelian(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan,
                    qty_diterima
                )
            `).eq("status_pesanan","selesai").order("tanggal_pesan",{ascending:!1});e&&t&&(i=i.gte("tanggal_pesan",e).lte("tanggal_pesan",t)),r&&(i=i.eq("id_supplier",r)),a&&(i=i.eq("alat_pembayaran",a)),n&&(i=i.eq("lokasi_penerimaan",n));const{data:o,error:d}=await i;if(d)throw d;s.innerHTML="",o&&o.length>0?(o.forEach(l=>{const m=q(l.tanggal_pesan),c=l.tanggal_diterima?q(l.tanggal_diterima):"-",v=l.tanggal_pembayaran?q(l.tanggal_pembayaran):"-",g=l.items.reduce((E,_)=>E+_.qty_dipesan,0),p=l.items.reduce((E,_)=>E+(_.qty_diterima||0),0),h="("+l.supplier.cp+")",y=document.createElement("tr");y.innerHTML=`
                    <td>${l.id}</td>
                    <td>${m}</td>
                    <td>${l.supplier.perusahaan||h}</td>
                    <td>${c}</td>
                    <td>${l.lokasi_penerimaan||"-"}</td>
                    <td>${g}</td>
                    <td>${p}</td>
                    <td>${A(l.total_dibayarkan)}</td>
                    <td>${v}</td>
                    <td>${l.alat_pembayaran||"-"}</td>
                    <td><button class="btn btn-sm btn-outline-primary detail-btn" data-order-id="${l.id}">Detail</button></td>
                `,s.appendChild(y)}),document.querySelectorAll(".detail-btn").forEach(l=>{l.addEventListener("click",async m=>{const c=m.target.dataset.orderId;await se(c)})})):s.innerHTML=`
                <tr>
                    <td colspan="11" class="text-center text-muted">Tidak ada riwayat pesanan</td>
                </tr>
            `}catch(i){console.error("Error fetching history:",i),b("Gagal memuat riwayat pesanan","error")}}}async function se(e){try{const{data:t,error:r}=await f.from("pesanan_pembelian").select(`
                id,
                tanggal_pesan,
                supplier: id_supplier(perusahaan),
                status_pesanan,
                tanggal_diterima,
                lokasi_penerimaan,
                tanggal_pembayaran,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_pembelian(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan,
                    qty_diterima
                )
            `).eq("id",e).single();if(r)throw r;const a=o=>o?new Date(o).toLocaleDateString("id-ID"):"-",n=`
            <div class="modal fade" id="orderDetailModal" tabindex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="orderDetailModalLabel">Detail Pesanan #${t.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p><strong>Tanggal Pesan:</strong> ${a(t.tanggal_pesan)}</p>
                                    <p><strong>Supplier:</strong> ${t.supplier.perusahaan}</p>
                                    <p><strong>Lokasi Penerimaan:</strong> ${t.lokasi_penerimaan||"-"}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tanggal Diterima:</strong> ${a(t.tanggal_diterima)}</p>
                                    <p><strong>Total Dibayarkan:</strong> ${A(t.total_dibayarkan)}</p>
                                    <p><strong>Pembayaran:</strong> ${t.alat_pembayaran||"-"} (${a(t.tanggal_pembayaran)})</p>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Varian</th>
                                            <th>Dipesan</th>
                                            <th>Diterima</th>
                                            <th>Selisih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${t.items.map(o=>`
                                            <tr>
                                                <td>${o.produk_varian.produk.nama}</td>
                                                <td>${o.produk_varian.varian||"-"}</td>
                                                <td>${o.qty_dipesan}</td>
                                                <td>${o.qty_diterima||0}</td>
                                                <td>${o.qty_dipesan-(o.qty_diterima||0)}</td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" class="text-end"><strong>Total:</strong></td>
                                            <td><strong>${t.items.reduce((o,d)=>o+d.qty_dipesan,0)}</strong></td>
                                            <td><strong>${t.items.reduce((o,d)=>o+(d.qty_diterima||0),0)}</strong></td>
                                            <td><strong>${t.items.reduce((o,d)=>o+(d.qty_dipesan-(d.qty_diterima||0)),0)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        `,s=document.createElement("div");s.innerHTML=n,document.body.appendChild(s),new bootstrap.Modal(document.getElementById("orderDetailModal")).show(),document.getElementById("orderDetailModal").addEventListener("hidden.bs.modal",()=>{s.remove()})}catch(t){console.error("Error showing order details:",t),b("Gagal memuat detail pesanan","error")}}const u={type:null,date:{start:null,end:null},supplier:null,payment:null,location:null};function le(){var e,t,r,a,n,s,i;document.querySelectorAll('input[name="filterGroup"]').forEach(o=>{o.addEventListener("click",function(d){if(this.checked&&u.type===this.value){this.checked=!1,w();return}u.type=this.value;const l=document.getElementById("filterCollapse"),m=bootstrap.Collapse.getInstance(l);!m||l.classList.contains("collapsing")?new bootstrap.Collapse(l,{toggle:!0}):l.classList.contains("collapse")&&m.show(),de()})}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",pe),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",w),(r=document.getElementById("startDate"))==null||r.addEventListener("change",function(){u.date.start=this.value}),(a=document.getElementById("endDate"))==null||a.addEventListener("change",function(){u.date.end=this.value}),(n=document.getElementById("supplierSelect"))==null||n.addEventListener("change",function(){u.supplier=this.value}),(s=document.getElementById("paymentSelect"))==null||s.addEventListener("change",function(){u.payment=this.value}),(i=document.getElementById("locationSelect"))==null||i.addEventListener("change",function(){u.location=this.value}),ce(),ue(),me()}function de(){switch(document.querySelectorAll("#filterOptionsContainer > .row").forEach(e=>{e.classList.add("d-none")}),u.type){case"date":document.getElementById("dateFilter").classList.remove("d-none");break;case"supplier":document.getElementById("supplierFilter").classList.remove("d-none");break;case"payment":document.getElementById("paymentFilter").classList.remove("d-none");break;case"location":document.getElementById("locationFilter").classList.remove("d-none");break}document.getElementById("filterCard").classList.remove("d-none")}async function ce(){try{const{data:e,error:t}=await f.from("supplier").select("id, perusahaan").order("perusahaan",{ascending:!0});if(t)throw t;const r=document.getElementById("supplierSelect");r.innerHTML='<option value="">Semua Supplier</option>',e.forEach(a=>{const n=document.createElement("option");n.value=a.id,n.textContent=a.perusahaan,r.appendChild(n)})}catch(e){console.error("Error loading suppliers:",e),b("Gagal memuat daftar supplier","error")}}async function ue(){try{const e=await C(),t=document.getElementById("paymentSelect");t.innerHTML='<option value="">Semua Metode</option>',e.forEach(r=>{const a=document.createElement("option");a.value=r.value;const n=r.value.charAt(0).toUpperCase()+r.value.slice(1);a.textContent=n,t.appendChild(a)})}catch(e){console.error("Error loading payment methods:",e),b("Gagal memuat metode pembayaran","error");const t=document.getElementById("paymentSelect");t.innerHTML=`
            <option value="">Semua Metode</option>
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer</option>
        `}}async function me(){try{const e=await P(),t=document.getElementById("locationSelect");t.innerHTML='<option value="">Semua Lokasi</option>',e.forEach(r=>{const a=document.createElement("option");a.value=r.value;const n=r.value.charAt(0).toUpperCase()+r.value.slice(1);a.textContent=n,t.appendChild(a)})}catch(e){console.error("Error loading locations:",e),b("Gagal memuat daftar lokasi","error");const t=document.getElementById("locationSelect");t.innerHTML=`
            <option value="">Semua Lokasi</option>
            <option value="gudang">Gudang</option>
            <option value="toko">Toko</option>
        `}}function pe(){switch(u.type){case"date":u.date.start=document.getElementById("startDate").value,u.date.end=document.getElementById("endDate").value;break;case"supplier":u.supplier=document.getElementById("supplierSelect").value;break;case"payment":u.payment=document.getElementById("paymentSelect").value;break;case"location":u.location=document.getElementById("locationSelect").value;break}ye()}async function ye(){try{const e=u.type==="date"?u.date.start:null,t=u.type==="date"?u.date.end:null,r=u.type==="supplier"?u.supplier:null,a=u.type==="payment"?u.payment:null,n=u.type==="location"?u.location:null;await S(e,t,r,a,n)}catch(e){console.error("Error filtering history:",e),b("Gagal memfilter riwayat","error")}}function w(){document.querySelectorAll('input[name="filterGroup"]').forEach(e=>{e.checked=!1}),u.type=null,u.date={start:null,end:null},u.supplier=null,u.payment=null,u.location=null,document.getElementById("startDate").value="",document.getElementById("endDate").value="",document.getElementById("supplierSelect").value="",document.getElementById("paymentSelect").value="",document.getElementById("locationSelect").value="",document.getElementById("filterCard").classList.add("d-none"),S()}document.addEventListener("DOMContentLoaded",async()=>{const e=document.getElementById("pembelianTabs"),t=document.getElementById("ongoing-tab"),r=document.getElementById("history-tab"),a=document.getElementById("addbtn");e.addEventListener("click",function(s){s.target&&s.target.matches("#history-tab")?a.style.display="none":s.target&&s.target.matches("#ongoing-tab")&&(a.style.display="inline-block")}),await n(),document.getElementById("addProduct").addEventListener("click",G),document.addEventListener("click",async s=>{if(s.target.closest(".cancel-order")){const i=s.target.closest(".cancel-order").dataset.orderId;if(confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")){const{error:o}=await f.from("pesanan_pembelian").delete().eq("id",i);o||(b("Pesanan dibatalkan","success"),I())}}}),document.addEventListener("click",async s=>{if(s.target.closest(".complete-order")){const i=s.target.closest(".complete-order"),o=i.dataset.orderId,d=i.dataset.receivedDate,l=JSON.parse(i.dataset.items||"[]");try{console.log("Items data before processing:",l);for(const c of l)await O({variantId:c.variantId,type:"pembelian",id:o,quantity:c.receivedQty,price:c.price,date:d}),c.brokenQty>0&&await O({variantId:c.variantId,type:"penyesuaian_keluar",id:o,quantity:c.brokenQty,price:0});const{error:m}=await f.from("pesanan_pembelian").update({status_pesanan:"selesai"}).eq("id",o);if(m)throw m;b("Pesanan berhasil diselesaikan","success"),await I()}catch(m){console.error("Order processing failed:",m),b("Gagal menyelesaikan pesanan","error")}}});async function n(){I(),await W(),a&&a.addEventListener("click",()=>j("add")),t&&t.addEventListener("click",I),r&&r.addEventListener("click",()=>{le(),w(),S()})}});const F=document.getElementById("orderModal");F.addEventListener("hidden.bs.modal",()=>{F.setAttribute("aria-hidden","true")});
