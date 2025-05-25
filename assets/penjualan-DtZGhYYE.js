import"./modulepreload-polyfill-B5Qt9EMX.js";import{n as W}from"./navbar-Cw31nkU0.js";import{s as u}from"./db_conn-C7Nb5uSA.js";import{p as J}from"./import-Cn2uwdsk.js";fetch("navbar.html").then(e=>e.text()).then(e=>{document.getElementById("navbar").innerHTML=e;const t=document.createElement("script");t.type="module",t.src=W,document.body.appendChild(t)}).catch(e=>console.error("Error loading navbar:",e));let L;function C(e){return{dipesan:"secondary",diambil:"success",dibayar:"primary"}[e]||"secondary"}function H(e){return e?new Date(e).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"-"}function q(e){if(!e)return"";const t=new Date(e);return new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16)}function E(e){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(e)}function p(e,t="success"){const a=document.getElementById("toastContainer"),n=document.createElement("div");n.className=`toast align-items-center text-white bg-${t==="success"?"success":"danger"} border-0`,n.setAttribute("role","alert"),n.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,a.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>n.remove())}async function A(){try{const{data:e,error:t}=await u.from("bakul").select("id, nama").order("nama",{ascending:!0});if(t)throw t;const a=document.getElementById("customer");a.innerHTML='<option value="" disabled selected>Pilih Bakul</option>',e.forEach(n=>{const r=document.createElement("option");r.value=n.id,r.textContent=`${n.nama}`,a.appendChild(r)})}catch(e){console.error("Error loading bakuls:",e),p("Gagal memuat daftar bakul","error")}}async function O(e="add",t=null){L||(L=new bootstrap.Modal(document.getElementById("saleModal")),await A()),document.getElementById("saleForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",K();const a=document.querySelector(".status-toggle-container"),n=document.getElementById("saleStatusBadge"),r=document.getElementById("saleModalLabel"),o=document.getElementById("addProductBtn"),i=document.getElementById("printButtonGroup"),s=document.getElementById("saleModal");if(s.dataset.mode=e,o&&(o.style.display="block"),i&&(i.style.display="none"),e==="edit"&&t){a&&(a.style.display="block"),n&&(n.style.display="none"),r.textContent="Edit Pesanan Penjualan",document.getElementById("saveSaleBtn").textContent="Update",await Y(t);const l=s.dataset.currentStatus;o&&(o.style.display=l==="dipesan"?"block":"none")}else{a&&(a.style.display="none"),n&&(n.style.display="inline-block",n.textContent="draft",n.className=`badge bg-${C("dipesan")}`),r.textContent="Tambah Pesanan Penjualan";const l=document.querySelector("#productsTable thead tr");l.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Harga</th>
            <th>Subtotal</th>
            <th></th>
        `,document.getElementById("totalAmount").textContent=E(0),s.removeAttribute("data-sale-id"),s.removeAttribute("data-current-status"),document.getElementById("saveSaleBtn").textContent="Simpan"}L.show()}async function Y(e){try{const{data:t,error:a}=await u.from("pesanan_penjualan").select(`
                id,
                tanggal_pesan,
                id_bakul,
                status_pesanan,
                tanggal_dibutuhkan,
                tanggal_diambil,
                pihak_pengambil,
                tanggal_dibayar,
                total_dibayarkan,
                alat_pembayaran,
                items:item_pesanan_penjualan(
                    id,
                    produk_varian:id_varian(
                        id,
                        varian,
                        produk:id_produk(id, nama)
                    ),
                    harga_jual,
                    qty_dipesan
                )
            `).eq("id",e).single();if(a)throw a;const n=document.getElementById("saleModal");n.dataset.saleId=e,n.dataset.currentStatus=t.status_pesanan,document.getElementById("saleDate").value=q(t.tanggal_pesan),document.getElementById("needDate").value=q(t.tanggal_dibutuhkan),document.getElementById("customer").value=t.id_bakul;const r=document.querySelector("#productsTable tbody");r.innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",t.items.forEach(o=>{const i=ee(o,t.status_pesanan);r.appendChild(i)}),D(),await Z(t),X(t.status_pesanan,t)}catch(t){throw console.error("Failed to load order:",t),p("Gagal memuat data pesanan","error"),t}}function K(){const e=document.getElementById("addProductBtn"),t=document.getElementById("saveSaleBtn"),a=document.getElementById("customer");e.replaceWith(e.cloneNode(!0)),t.replaceWith(t.cloneNode(!0)),a.replaceWith(a.cloneNode(!0)),document.getElementById("addProductBtn").addEventListener("click",R),document.getElementById("saveSaleBtn").addEventListener("click",async n=>{n.preventDefault();try{await te()}catch(r){console.error("Save failed:",r),p("Gagal menyimpan: "+r.message,"error")}}),document.getElementById("customer").addEventListener("change",async function(){document.getElementById("saleModal").dataset.mode}),document.querySelector("#productsTable tbody").addEventListener("click",function(n){(n.target.classList.contains("remove-item")||n.target.classList.contains("remove-product"))&&n.target.closest("tr").remove()}),document.getElementById("saleModal").addEventListener("hidden.bs.modal",()=>{document.getElementById("saleForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="";const n=document.querySelector("#productsTable thead tr");n.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Harga</th>
            <th>Subtotal</th>
            <th></th>
        `})}function X(e,t){var s,l,c,g,b;const a=document.getElementById("saleStatusBadge"),n=document.querySelectorAll("#saleStatusToggle .btn-status"),r={};e==="diambil"?(r.tanggalAmbil=((s=document.getElementById("tanggalAmbil"))==null?void 0:s.value)||"",r.pihakPengambil=((l=document.getElementById("pihakPengambil"))==null?void 0:l.value)||""):e==="dibayar"&&(r.tanggalPembayaran=((c=document.getElementById("tanggalPembayaran"))==null?void 0:c.value)||"",r.totalDibayarkan=((g=document.getElementById("totalDibayarkan"))==null?void 0:g.value)||"",r.alatPembayaran=((b=document.getElementById("alatPembayaran"))==null?void 0:b.value)||"");const o=["dipesan","diambil","dibayar","selesai"],i=o.indexOf(e);n.forEach(d=>{d.classList.remove("active");const y=d.dataset.status,f=o.indexOf(y);y===e?(d.classList.add("active"),d.disabled=!1):d.disabled=f!==i+1}),N(e,r),n.forEach(d=>{d.addEventListener("click",function(){var _,B,T,x,m;if(this.disabled)return;const y=this.dataset.status;a.textContent=y,a.className=`badge bg-${C(y)}`;const f={};y==="diambil"?(f.tanggalAmbil=((_=document.getElementById("tanggalAmbil"))==null?void 0:_.value)||(t==null?void 0:t.tanggal_diambil)||"",f.pihakPengambil=((B=document.getElementById("pihakPengambil"))==null?void 0:B.value)||(t==null?void 0:t.pihak_pengambil)||""):y==="dibayar"&&(f.tanggalPembayaran=((T=document.getElementById("tanggalPembayaran"))==null?void 0:T.value)||(t==null?void 0:t.tanggal_dibayar)||"",f.totalDibayarkan=((x=document.getElementById("totalDibayarkan"))==null?void 0:x.value)||(t==null?void 0:t.total_dibayarkan)||"",f.alatPembayaran=((m=document.getElementById("alatPembayaran"))==null?void 0:m.value)||(t==null?void 0:t.alat_pembayaran)||""),N(y,f);const w=o.indexOf(y);n.forEach(h=>{const v=h.dataset.status,k=o.indexOf(v);h.classList.remove("active"),v===y?(h.classList.add("active"),h.disabled=!1):h.disabled=k!==w+1})})})}async function N(e,t={}){document.querySelectorAll("#productsTable tbody tr").forEach(r=>{const o=r.querySelector(".quantity"),i=r.querySelector(".variant-select"),s=r.querySelector(".price"),l=r.querySelector(".remove-item");o.readOnly=e!=="dipesan",i.disabled=e!=="dipesan",s.readOnly=["dibayar","selesai"].includes(e),l&&(l.disabled=["diambil","dibayar","selesai"].includes(e))}),document.getElementById("addProductBtn").style.display=e==="dipesan"?"block":"none";const a=document.getElementById("statusFieldsContainer");a.innerHTML="";const n=document.getElementById("printButtonGroup");if(n.style.display=e==="dibayar"?"flex":"none",e==="diambil"){const r=await G();let o='<option value="" disabled selected>Pilih pihak pengambil</option>';r.forEach(i=>{const s=t.pihakPengambil&&t.pihakPengambil===i.value?"selected":"",l=i.value.charAt(0).toUpperCase()+i.value.slice(1);o+=`<option value="${i.value}" ${s}>${l}</option>`}),a.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-6">
                    <label class="form-label">Tanggal Diambil</label>
                    <input type="datetime-local" class="form-control" id="tanggalAmbil" 
                        value="${t.tanggalAmbil||""}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Pihak Pengambil</label>
                    <select class="form-select" id="pihakPengambil">
                        ${o}
                    </select>
                </div>
            </div>
        `}else if(e==="dibayar"){const r=await F();let o='<option value="" disabled selected>Pilih metode pembayaran</option>';r.forEach(l=>{const c=t.alatPembayaran===l.value?"selected":"",g=l.value.charAt(0).toUpperCase()+l.value.slice(1);o+=`<option value="${l.value}" ${c}>${g}</option>`}),a.innerHTML=`
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
                        ${o}
                    </select>
                </div>
            </div>
        `;const i=t.tanggalPembayaran&&t.totalDibayarkan&&t.alatPembayaran;document.getElementById("printReceiptBtn").disabled=!i,document.getElementById("exportPdfBtn").disabled=!i,["tanggalPembayaran","totalDibayarkan","alatPembayaran"].forEach(l=>{const c=document.getElementById(l);c&&c.addEventListener("input",V)})}}async function Z(e){const t=document.getElementById("statusFieldsContainer");if(t.innerHTML="",D(),e.status_pesanan==="diambil"){const a=await G();let n='<option value="" disabled selected>Pilih pihak pengambil</option>';a.forEach(r=>{const o=e.pihak_pengambil&&e.pihak_pengambil===r.value?"selected":"",i=r.value.charAt(0).toUpperCase()+r.value.slice(1);n+=`<option value="${r.value}" ${o}>${i}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-6">
                    <label class="form-label">Tanggal Diambil</label>
                    <input type="datetime-local" class="form-control" id="tanggalAmbil" 
                        value="${e.tanggal_diambil?q(e.tanggal_diambil):""}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Pihak Pengambil</label>
                    <select class="form-select" id="pihakPengambil">
                        ${n}
                    </select>
                </div>
            </div>
        `}else if(e.status_pesanan==="dibayar"){const a=await F();let n='<option value="" disabled selected>Pilih metode pembayaran</option>';a.forEach(r=>{const o=e.alat_pembayaran===r.value?"selected":"",i=r.value.charAt(0).toUpperCase()+r.value.slice(1);n+=`<option value="${r.value}" ${o}>${i}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="datetime-local" class="form-control" id="tanggalPembayaran" 
                        value="${e.tanggal_dibayar?q(e.tanggal_dibayar):""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                        value="${e.total_dibayarkan||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${n}
                    </select>
                </div>
            </div>
        `}}function V(){const e=document.getElementById("printReceiptBtn"),t=document.getElementById("exportPdfBtn"),a=document.getElementById("tanggalPembayaran").value&&document.getElementById("totalDibayarkan").value&&document.getElementById("alatPembayaran").value;e.disabled=!a,t.disabled=!a}async function F(){try{const{data:e,error:t}=await u.rpc("get_enum_values",{enum_name:"alat_pembayaran"});return t?(console.error("Error loading payment methods:",t),[{value:"tunai"},{value:"transfer"}]):e}catch(e){return console.error("Error:",e),[{value:"tunai"},{value:"transfer"}]}}async function G(){try{const{data:e,error:t}=await u.rpc("get_enum_values",{enum_name:"pihak_pengambil"});return t?(console.error("Error loading locations:",t),[{value:"sendiri"},{value:"perwakilan"}]):e}catch(e){return console.error("Error:",e),[{value:"sendiri"},{value:"perwakilan"}]}}async function S(e,t,a,n=null){const r=e.value;if(t.disabled=!0,t.innerHTML='<option value="" selected disabled>Memuat varian...</option>',!r){t.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>';return}try{const{data:o,error:i}=await u.from("produk_varian").select("id, varian, harga_standar").eq("id_produk",r).order("varian",{ascending:!0});if(i)throw i;t.innerHTML=`
            <option value="" ${n?"":"selected"} disabled>Pilih Varian</option>
            ${o.map(s=>`<option value="${s.id}" data-price="${s.harga_standar}"
                    ${n===s.id?"selected":""}>
                    ${s.varian}
                </option>`).join("")}
        `,t.disabled=!1}catch(o){console.error("Error loading variants:",o),t.innerHTML='<option value="" selected disabled>Error memuat varian</option>'}}async function R(e=null,t=null){const a=document.querySelector("#productsTable tbody");try{const{data:n,error:r}=await u.from("produk").select("id, nama").order("nama",{ascending:!0});if(r)throw r;const o=document.createElement("tr");o.innerHTML=`
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
                <input type="number" class="form-control price" min="0" step="100" value="0">
            </td>
            <td class="subtotal">${E(0)}</td>
            <td>
                <button class="btn btn-danger btn-sm remove-product">×</button>
            </td>
        `,a.appendChild(o);const i=o.querySelector(".product-select"),s=o.querySelector(".variant-select");i.addEventListener("change",async function(){await S(i,s,o,t)}),s.addEventListener("change",function(){const c=s.options[s.selectedIndex].getAttribute("data-price")||0;console.log("price: ",c),o.querySelector(".price").value=c,o.querySelector(".price").dispatchEvent(new Event("input"))}),e&&(s.innerHTML='<option value="" selected disabled>Memuat varian...</option>',s.disabled=!0,i.dispatchEvent(new Event("change"))),U(o)}catch(n){console.error("Error adding product row:",n),p("Gagal menambahkan produk","error")}}function ee(e,t){const a=document.createElement("tr");a.dataset.itemId=e.id;const n=["diambil","dibayar","selesai"].includes(t);if(a.innerHTML=`
        <td>
            <select class="form-select product-select" disabled>
                <option value="${e.produk_varian.produk.id}" selected>
                    ${e.produk_varian.produk.nama}
                </option>
            </select>
        </td>
        <td>
            <select class="form-select variant-select" ${t!=="dipesan"?"disabled":""}>
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
        <td>
            <input type="number" class="form-control price" 
                   value="${e.harga_jual||0}" min="0"
                   ${["dibayar","selesai"].includes(t)?"readonly":""}>
        </td>
        <td class="subtotal">${E((e.harga_jual||0)*e.qty_dipesan)}</td>
        <td>
            <button class="btn btn-danger btn-sm remove-item" 
                    ${n?"disabled":""}>×</button>
        </td>
    `,t==="dipesan"){const r=a.querySelector(".product-select"),o=a.querySelector(".variant-select");r.addEventListener("change",async function(){await S(r,o)}),setTimeout(async()=>{await S(r,o,a,e.produk_varian.id)},0)}return U(a),a}function U(e){const t=()=>{const n=parseFloat(e.querySelector(".price").value)||0,r=parseInt(e.querySelector(".quantity").value)||0,o=Math.round(n*r);console.log(o);const i=e.querySelector(".subtotal");i.tagName==="TD"?i.textContent=E(o):i.value=o,D()};e.querySelector(".price").addEventListener("input",t),e.querySelector(".quantity").addEventListener("input",t),t();const a=e.querySelector(".remove-product, .remove-item");a&&a.addEventListener("click",()=>{e.remove(),D()})}function D(){let e=0;document.querySelectorAll("#productsTable tbody tr").forEach(t=>{const a=t.querySelector(".subtotal").textContent,n=parseFloat(a.replace(/[^0-9]/g,""))||0;e+=n}),document.getElementById("totalAmount").textContent=E(e)}function M(){const t=document.getElementById("saleModal").dataset.mode==="add";let a;if(t)a="draft";else{const o=document.querySelector("#saleStatusToggle .btn-status.active");a=(o==null?void 0:o.dataset.status)||"dipesan"}const n=o=>o?new Date(o).toISOString():null,r={orderDate:n(document.getElementById("saleDate").value),needDate:n(document.getElementById("needDate").value),bakulID:document.getElementById("customer").value,status:t?"dipesan":a,items:Array.from(document.querySelectorAll("#productsTable tbody tr")).map(o=>({variantId:o.querySelector(".variant-select").value,quantity:parseInt(o.querySelector(".quantity").value)||0,rowId:o.dataset.itemId||null,price:parseFloat(o.querySelector(".price").value)||0}))};return t||(a==="diambil"&&(r.tanggalAmbil=n(document.getElementById("tanggalAmbil").value),r.pihakPengambil=document.getElementById("pihakPengambil").value),a==="dibayar"&&(r.tanggalPembayaran=n(document.getElementById("tanggalPembayaran").value),r.totalDibayarkan=document.getElementById("totalDibayarkan").value,r.alatPembayaran=document.getElementById("alatPembayaran").value)),r}async function te(){const e=document.getElementById("saleModal").dataset.mode;try{e==="edit"?await ne():await ae(),L.hide(),await I()}catch(t){console.error("Save failed:",t),p("Gagal menyimpan pesanan","error")}}async function ae(){const e=M();console.log(e);try{for(const r of e.items){const{error:o}=await u.rpc("adjust_reserved_stock",{p_variant_id:r.variantId,p_adjustment:r.quantity});if(o)throw o}const{data:t,error:a}=await u.from("pesanan_penjualan").insert({tanggal_pesan:e.orderDate,tanggal_dibutuhkan:e.needDate,id_bakul:e.bakulID,status_pesanan:"dipesan"}).select().single();if(a)throw a;const{error:n}=await u.from("item_pesanan_penjualan").insert(e.items.map(r=>({id_jual:t.id,id_varian:r.variantId,qty_dipesan:r.quantity,harga_jual:r.price})));if(n)throw n;p("Pesanan baru berhasil dibuat","success"),await I()}catch(t){console.error("Create order error:",t),p("Gagal membuat pesanan: "+t.message,"error")}}async function ne(){const e=document.getElementById("saleModal").dataset.saleId,t=M();try{const a={tanggal_pesan:t.orderDate,id_bakul:t.bakulID,status_pesanan:t.status};t.status==="diambil"?(a.tanggal_diambil=t.tanggalAmbil,a.pihak_pengambil=t.pihakPengambil):t.status==="dibayar"&&(a.tanggal_dibayar=t.tanggalPembayaran,a.total_dibayarkan=t.totalDibayarkan,a.alat_pembayaran=t.alatPembayaran);const{error:n}=await u.from("pesanan_penjualan").update(a).eq("id",e);if(n)throw n;const{data:r,error:o}=await u.from("item_pesanan_penjualan").select("id, id_varian, qty_dipesan").eq("id_jual",e);if(o)throw o;const i={};r.forEach(d=>{i[d.id]={id_varian:d.id_varian,qty_dipesan:d.qty_dipesan}});const s=[],l=[],c={};t.items.forEach(d=>{var f;const y={id_jual:e,id_varian:d.variantId,qty_dipesan:d.quantity,harga_jual:d.price};if(d.rowId){s.push({...y,id:d.rowId});const w=((f=i[d.rowId])==null?void 0:f.qty_dipesan)||0,_=d.quantity-w;console.log(_),_!==0&&(c[d.variantId]=(c[d.variantId]||0)+_,console.log(c[d.variantId]))}else l.push(y),c[d.variantId]=(c[d.variantId]||0)+d.quantity});const g=t.items.map(d=>Number(d.rowId)).filter(Boolean),b=r.filter(d=>!g.includes(d.id));console.log(b),console.log("Original items:",r.map(d=>d.id)),console.log("Current items:",t.items.map(d=>d.rowId));for(const d of b)c[d.id_varian]=(c[d.id_varian]||0)-d.qty_dipesan,console.log(c[d.id_varian]);for(const[d,y]of Object.entries(c))if(y!==0){console.log("adj: ",y);const{error:f}=await u.rpc("adjust_reserved_stock",{p_variant_id:d,p_adjustment:y});if(f)throw f}if(b.length>0){const{error:d}=await u.from("item_pesanan_penjualan").delete().in("id",b.map(y=>y.id));if(d)throw d}if(s.length>0){const{error:d}=await u.from("item_pesanan_penjualan").upsert(s);if(d)throw d}if(l.length>0){const{error:d}=await u.from("item_pesanan_penjualan").insert(l);if(d)throw d}p("Pesanan berhasil diperbarui","success"),await I()}catch(a){console.error("Update order error:",a),p("Gagal memperbarui pesanan: "+a.message,"error")}}async function re(e){if(confirm("Apakah Anda yakin ingin menghapus penjualan ini?"))try{await u.from("item_pesanan_penjualan").delete().eq("id_jual",e),await u.from("pesanan_penjualan").delete().eq("id",e),p("Penjualan berhasil dihapus","success")}catch(t){console.error("Error deleting sale:",t),p("Gagal menghapus penjualan","error")}}async function I(){try{const e=document.getElementById("ongoingOrdersContainer");e.innerHTML=`
            <div class="col-12 text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat pesanan...
            </div>
        `;const{data:t,error:a}=await u.from("pesanan_penjualan").select(`
                id,
                tanggal_pesan,
                tanggal_dibutuhkan,
                status_persiapan,
                status_pesanan,
                bakul:id_bakul(nama),
                items:item_pesanan_penjualan(
                    produk_varian(id, varian, produk:id_produk(nama)),
                    harga_jual,
                    qty_dipesan
                )
            `).neq("status_pesanan","selesai").order("id",{ascending:!1});if(a)throw a;if(e.innerHTML="",t.length===0){e.innerHTML=`
                <div class="col-12 text-center text-muted">
                    Tidak ada pesanan aktif
                </div>
            `;return}const n=t.map(o=>({...o,total:o.items.reduce((i,s)=>i+s.harga_jual*s.qty_dipesan,0)})),r=document.createElement("div");r.className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3",n.forEach(o=>{r.appendChild(oe(o))}),e.appendChild(r)}catch(e){console.error("Error loading ongoing sales:",e),p("Gagal memuat pesanan aktif","error"),document.getElementById("ongoingOrdersContainer").innerHTML=`
            <div class="col-12 text-center text-danger">
                Gagal memuat data
            </div>
        `}}function oe(e){var x;const t=document.createElement("div");t.className="col-md-6 col-lg-4 mb-3";const a=document.createElement("div");a.className="card h-100",a.dataset.saleId=e.id;const n=document.createElement("div");n.className="card-header d-flex justify-content-between align-items-center";const r=document.createElement("h5");r.className="mb-0",r.textContent=`#${e.id}`;const o=document.createElement("div");o.className="d-flex align-items-center gap-2";const i=document.createElement("span");i.className=`badge bg-${C(e.status_pesanan)}`,i.textContent=e.status_pesanan;const s=document.createElement("button");s.className="btn btn-sm btn-outline-secondary edit-order",s.innerHTML='<i class="bi bi-pencil"></i>',s.addEventListener("click",m=>{m.stopPropagation(),O("edit",e.id)}),n.appendChild(r),o.appendChild(i),o.appendChild(s),n.appendChild(o);const l=document.createElement("div");l.className="card-body";const c=document.createElement("p");c.className="mb-1",c.innerHTML=`<strong>Bakul:</strong> ${((x=e.bakul)==null?void 0:x.nama)||"-"}`;const g=document.createElement("p");g.className="mb-1",g.innerHTML=`<strong>Tanggal Pesan:</strong> ${H(e.tanggal_pesan)}`;const b=document.createElement("p");b.className="mb-1",b.innerHTML=`<strong>Dibutuhkan:</strong> ${H(e.tanggal_dibutuhkan)}`;const d=document.createElement("p");d.className="mb-1";const y=Math.round(e.total);d.innerHTML=`<strong>Total:</strong> ${E(y||0)}`;const f=document.createElement("p");f.className="mb-1 mt-2 fw-bold",f.textContent="Items:";const w=document.createElement("ul");w.className="list-unstyled mb-0",e.items.forEach(m=>{var v,k,P;const h=document.createElement("li");h.className="d-flex justify-content-between",h.innerHTML=`
            <span>${((k=(v=m.produk_varian)==null?void 0:v.produk)==null?void 0:k.nama)||"Produk"} - ${((P=m.produk_varian)==null?void 0:P.varian)||""}</span>
            <span>${m.qty_dipesan} × ${E(m.harga_jual)}</span>
        `,w.appendChild(h)}),l.appendChild(c),l.appendChild(g),l.appendChild(b),l.appendChild(d),l.appendChild(f),l.appendChild(w);const _=document.createElement("div");if(_.className="card-footer bg-transparent border-top-0",e.status_pesanan==="dipesan"){const m=document.createElement("div");m.className="form-check mb-2";const h=document.createElement("input");h.type="checkbox",h.className="form-check-input preparation-checkbox",h.id=`prep-${e.id}`,h.checked=e.status_persiapan||!1;const v=document.createElement("label");v.className="form-check-label",v.htmlFor=`prep-${e.id}`,v.textContent="Persiapan Selesai",ie(h,e),m.appendChild(h),m.appendChild(v),_.appendChild(m)}const B=document.createElement("div");B.className="d-flex justify-content-between";const T=document.createElement("button");if(T.className="btn btn-sm",e.status_pesanan==="dipesan"){const m=document.createElement("button");m.className="btn btn-sm btn-outline-danger ms-2 cancel-order",m.innerHTML='<i class="bi bi-x-circle"></i> Batalkan',m.dataset.orderId=e.id;const h=e.items.map(v=>{var k;return{variantId:((k=v.produk_varian)==null?void 0:k.id)||"",qty:v.qty_dipesan||0,price:v.harga_jual||0}});m.dataset.items=JSON.stringify(h),_.appendChild(m)}else if(e.status_pesanan==="dibayar"){const m=document.createElement("button");m.className="btn btn-sm btn-dark ms-2 complete-order",m.innerHTML='<i class="bi bi-check-circle"></i> Selesaikan',m.dataset.orderId=e.id;const h=e.items.map(k=>{var P;return{variantId:((P=k.produk_varian)==null?void 0:P.id)||"",qty:k.qty_dipesan||0,price:k.harga_jual||0}});m.dataset.items=JSON.stringify(h),_.appendChild(m);const v=document.createElement("button");v.className="btn btn-sm btn-outline-primary ms-2 reprint-order",v.innerHTML='<i class="bi bi-printer"></i> Cetak',v.dataset.orderId=e.id,v.addEventListener("click",k=>{k.stopPropagation(),j(e.id)}),_.appendChild(v)}return B.appendChild(T),_.appendChild(B),a.appendChild(n),a.appendChild(l),a.appendChild(_),t.appendChild(a),t}function ie(e,t){e.addEventListener("change",async function(){const a=this.checked;if(!confirm(`Yakin ingin ${a?"menandai":"membatalkan tanda"} persiapan selesai untuk pesanan #${t.id}?`)){this.checked=!a;return}this.disabled=!0;try{const{error:o}=await u.from("pesanan_penjualan").update({status_persiapan:a}).eq("id",t.id);if(o)throw o;p(`Status persiapan ${a?"diselesaikan":"dibatalkan"}`,"success");const i=this.closest(".card").querySelector(".prep-status");i&&(i.textContent=`Persiapan: ${a?"Siap":"Belum siap"}`)}catch(o){console.error("Update error:",o),this.checked=!a,p("Gagal memperbarui status","error")}finally{this.disabled=!1}})}async function de(){const e=document.querySelector("#history tbody");if(e)try{const{data:t,error:a}=await u.from("pesanan_penjualan").select(`
                id,
                tanggal_pesan,
                bakul: id_bakul(nama),
                status_pesanan,
                tanggal_diambil,
                pihak_pengambil,
                tanggal_dibayar,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_penjualan(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan
                )
            `).eq("status_pesanan","selesai").order("tanggal_pesan",{ascending:!1});if(a)throw a;e.innerHTML="",t&&t.length>0?(t.forEach(n=>{const r=new Date(n.tanggal_pesan).toLocaleDateString("id-ID"),o=n.tanggal_diambil?new Date(n.tanggal_diambil).toLocaleDateString("id-ID"):"-",i=n.tanggal_dibayar?new Date(n.tanggal_dibayar).toLocaleDateString("id-ID"):"-",s=n.items.reduce((c,g)=>c+g.qty_dipesan,0),l=document.createElement("tr");l.innerHTML=`
                    <td>${n.id}</td>
                    <td>${r}</td>
                    <td>${n.bakul.nama}</td>
                    <td>${o}</td>
                    <td>${n.pihak_pengambil||"-"}</td>
                    <td>${s}</td>
                    <td>${E(n.total_dibayarkan)}</td>
                    <td>${i}</td>
                    <td>${n.alat_pembayaran||"-"}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary detail-btn me-1" data-order-id="${n.id}">Detail</button>
                        <button class="btn btn-sm btn-outline-secondary reprint-btn" data-order-id="${n.id}">Cetak</button>
                    </td>
                `,e.appendChild(l)}),document.querySelectorAll(".reprint-btn").forEach(n=>{n.addEventListener("click",async r=>{const o=r.target.dataset.orderId;try{await j(o)}catch(i){console.error("Error printing receipt:",i),p("Gagal mencetak struk","error")}})}),document.querySelectorAll(".detail-btn").forEach(n=>{n.addEventListener("click",async r=>{const o=r.target.dataset.orderId;await se(o)})})):e.innerHTML=`
                <tr>
                    <td colspan="11" class="text-center text-muted">Tidak ada riwayat pesanan</td>
                </tr>
            `}catch(t){console.error("Error fetching history:",t),p("Gagal memuat riwayat pesanan","error")}}async function se(e){try{const{data:t,error:a}=await u.from("pesanan_penjualan").select(`
                id,
                tanggal_pesan,
                bakul: id_bakul(nama),
                status_pesanan,
                tanggal_diambil,
                pihak_pengambil,
                tanggal_dibayar,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_penjualan(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan
                )
            `).eq("id",e).single();if(a)throw a;const n=s=>s?new Date(s).toLocaleDateString("id-ID"):"-",r=`
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
                                    <p><strong>Tanggal Pesan:</strong> ${n(t.tanggal_pesan)}</p>
                                    <p><strong>Supplier:</strong> ${t.bakul.nama}</p>
                                    <p><strong>Lokasi Penerimaan:</strong> ${t.pihak_pengambil||"-"}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tanggal Diterima:</strong> ${n(t.tanggal_diambil)}</p>
                                    <p><strong>Total Dibayarkan:</strong> ${E(t.total_dibayarkan)}</p>
                                    <p><strong>Pembayaran:</strong> ${t.alat_pembayaran||"-"} (${n(t.tanggal_dibayar)})</p>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Varian</th>
                                            <th>Kuantitas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${t.items.map(s=>`
                                            <tr>
                                                <td>${s.produk_varian.produk.nama}</td>
                                                <td>${s.produk_varian.varian||"-"}</td>
                                                <td>${s.qty_dipesan}</td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" class="text-end"><strong>Total:</strong></td>
                                            <td><strong>${t.items.reduce((s,l)=>s+l.qty_dipesan,0)}</strong></td>
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
        `,o=document.createElement("div");o.innerHTML=r,document.body.appendChild(o),new bootstrap.Modal(document.getElementById("orderDetailModal")).show(),document.getElementById("orderDetailModal").addEventListener("hidden.bs.modal",()=>{o.remove()})}catch(t){console.error("Error showing order details:",t),p("Gagal memuat detail pesanan","error")}}function le(){var n;const e=document.getElementById("printReceiptBtn"),t=document.getElementById("exportPdfBtn"),a=document.getElementById("printButtonGroup");e==null||e.addEventListener("click",()=>j()),t==null||t.addEventListener("click",ce),(n=document.getElementById("saleStatusToggle"))==null||n.addEventListener("click",r=>{if(r.target.closest(".btn-status")){const o=r.target.closest(".btn-status").dataset.status;a.style.display=o==="dibayar"?"flex":"none"}})}async function j(e=null){let t;if(e?t=e:t=document.getElementById("saleModal").dataset.saleId,!t){p("Tidak ada pesanan yang dipilih","error");return}try{let a=await Q(t);if(!a.tanggal_dibayar||!a.total_dibayarkan||!a.alat_pembayaran){const r=M();if(r)a={...a,tanggal_dibayar:r.tanggalPembayaran,total_dibayarkan:parseFloat(r.totalDibayarkan),alat_pembayaran:r.alatPembayaran};else throw new Error("Data pembayaran belum lengkap")}const n=z(a);me(n)}catch(a){console.error("Error printing receipt:",a),p(a.message||"Gagal mencetak struk","error")}}async function ce(){const e=document.getElementById("saleModal").dataset.saleId;if(!e){p("Tidak ada pesanan yang dipilih","error");return}const t=document.getElementById("exportPdfBtn"),a=t.innerHTML;try{t.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span> Memproses...',t.disabled=!0;const n=await Q(e),r=z(n),{jsPDF:o}=window.jspdf;await new o({orientation:"portrait",unit:"mm",format:[80,297]}).html(r,{html2canvas:{scale:.3,logging:!1,useCORS:!0,letterRendering:!0,width:80},callback:function(s){s.save(`Struk_${e}.pdf`),t.innerHTML=a,t.disabled=!1},x:0,y:0,width:80,windowWidth:800})}catch(n){console.error("PDF export error:",n),p("Gagal membuat PDF: "+n.message,"error"),t.innerHTML=a,t.disabled=!1}}function me(e){const t=window.open("","_blank","width=800,height=600"),a=(e.match(/<tr>/g)||[]).length,n=50,r=a*3,o=Math.max(n+r,150),i="5mm 3mm";t.document.open(),t.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Struk</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @media print {
                    body { 
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        width: 80mm;
                        margin: 0;
                        padding: ${i};
                    }
                    @page {
                        size: 80mm ${o}mm;
                        margin: 0;
                    }
                    table {
                        table-layout: fixed;  // Enforces column widths
                    }
                    colgroup col:nth-child(1) { width: 50%; }
                    colgroup col:nth-child(2) { width: 15%; }
                    colgroup col:nth-child(3) { width: 35%; }
                    td, th {
                        word-wrap: break-word;  // Ensures text wraps
                        overflow-wrap: break-word;
                    }
                    .no-print { display: none !important; }
                    button { display: none !important; }
                }
                .receipt-container {
                    width: 100%;
                    padding: 0;
                    box-sizing: border-box;
                }
                .receipt-header, .receipt-footer {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .receipt-items {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 5px 0;
                }
                .receipt-items th {
                    border-bottom: 1px dashed #000;
                    padding: 4px 0;
                    text-align: left;
                }
                .receipt-items td {
                    padding: 2px 0;
                }
                .text-right {
                    text-align: right;
                }
                .text-center {
                    text-align: center;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 4px 0;
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                ${e}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 300);
                };
            <\/script>
        </body>
        </html>
    `),t.document.close()}function z(e){var n;const t=r=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(r),a=r=>new Date(r).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
    <div style="width:72mm; padding:4mm; font-family:Arial; font-size:10px;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:5px;">
            <div style="font-weight:bold; font-size:12px;">Gunarto</div>
            <div>Pasar Klewer, Surakarta</div>
            <div>Telp: 08123456789</div>
        </div>
        
        <hr style="border-top:1px dashed #000; margin:5px 0;">
        
        <!-- Order Info -->
        ${$("No. Pesanan:",e.id)}
        ${$("Tanggal:",a(e.tanggal_dibayar))}
        ${$("Pembeli:",((n=e.bakul)==null?void 0:n.nama)||"-")}
        
        <hr style="border-top:1px dashed #000; margin:5px 0;">
        
        <!-- Items Table -->
        <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
            <colgroup>
                <col style="width:50%">  <!-- Product name column -->
                <col style="width:15%">  <!-- Qty column -->
                <col style="width:35%">  <!-- Price column -->
            </colgroup>
            <thead>
                <tr>
                    <th style="text-align:left; padding:2px 0; border-bottom:1px dashed #000; word-wrap:break-word;">Item</th>
                    <th style="text-align:right; padding:2px 0; border-bottom:1px dashed #000;">Qty</th>
                    <th style="text-align:right; padding:2px 0; border-bottom:1px dashed #000;">Harga</th>
                </tr>
            </thead>
            <tbody>
                ${e.items.map(r=>{var o,i,s;return`
                    <tr>
                        <td style="padding:2px 0; word-wrap:break-word; overflow-wrap:break-word;">
                            ${((i=(o=r.produk_varian)==null?void 0:o.produk)==null?void 0:i.nama)||"Produk"} ${((s=r.produk_varian)==null?void 0:s.varian)||""}
                        </td>
                        <td style="text-align:right; padding:2px 0;">${r.qty_dipesan}</td>
                        <td style="text-align:right; padding:2px 0;">${t(r.harga_jual)}</td>
                    </tr>
                `}).join("")}
            </tbody>
        </table>
        
        <hr style="border-top:1px dashed #000; margin:5px 0;">
        
        <!-- Totals -->
        ${$("TOTAL:",t(e.total_dibayarkan),!0)}
        ${$("Pembayaran:",e.alat_pembayaran||"Tunai")}
        
        <!-- Footer -->
        <div style="text-align:center; margin-top:10px; font-size:9px;">
            <div>Terima kasih telah berbelanja</div>
            <div>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</div>
        </div>
    </div>
    `}function $(e,t,a=!1){return`
    <div style="display:flex; justify-content:space-between; margin:3px 0; ${a?"font-weight:bold;":""}">
        <span>${e}</span>
        <span>${t}</span>
    </div>
    `}async function Q(e){const{data:t,error:a}=await u.from("pesanan_penjualan").select(`
            id,
            tanggal_pesan,
            tanggal_dibayar,
            bakul: id_bakul(nama, no_hp),
            total_dibayarkan,
            alat_pembayaran,
            items: item_pesanan_penjualan(
                produk_varian: id_varian(
                    varian,
                    produk: id_produk(nama)
                ),
                harga_jual,
                qty_dipesan
            )
        `).eq("id",e).single();if(a)throw a;return t}document.addEventListener("DOMContentLoaded",async()=>{L=new bootstrap.Modal(document.getElementById("saleModal")),document.getElementById("penjualanTabs");const e=document.getElementById("addSaleBtn"),t=document.getElementById("ongoing-tab"),a=document.getElementById("history-tab");await A(),o(),document.getElementById("addProductBtn").addEventListener("click",R),document.addEventListener("click",async i=>{if(i.target.closest(".cancel-order")){const s=i.target.closest(".cancel-order"),l=s.dataset.orderId,c=JSON.parse(s.dataset.items||"[]");console.log("data: ",c);try{if(!confirm("Yakin ingin membatalkan pesanan ini?"))return;for(const b of c){console.log("item: ",b);const{error:d}=await u.rpc("adjust_reserved_stock",{p_variant_id:b.variantId,p_adjustment:-b.qty});if(d)throw d;console.log("stok_reservasi updated")}const{error:g}=await u.from("pesanan_penjualan").delete().eq("id",l);if(g)throw g;p("Pesanan dibatalkan","success"),I()}catch(g){console.error("Order processing failed:",g),p("Gagal membatalkan pesanan: "+g.message,"error")}}}),document.addEventListener("click",async i=>{if(i.target.closest(".complete-order")){const s=i.target.closest(".complete-order"),l=s.dataset.orderId,c=JSON.parse(s.dataset.items||"[]");try{for(const b of c){const{error:d}=await u.rpc("adjust_reserved_stock",{p_variant_id:b.variantId,p_adjustment:-b.qty});if(d)throw d;await J({variantId:b.variantId,type:"penjualan",id:l,quantity:b.qty,price:b.price})}const{error:g}=await u.from("pesanan_penjualan").update({status_pesanan:"selesai"}).eq("id",l);if(g)throw g;p("Pesanan berhasil diselesaikan","success"),await I()}catch(g){console.error("Order processing failed:",g),p("Gagal menyelesaikan pesanan: "+g.message,"error")}}}),le();const n=document.createElement("script");n.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",document.body.appendChild(n);const r=document.createElement("script");r.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",document.body.appendChild(r);function o(){I(),e&&e.addEventListener("click",()=>O("add")),t&&t.addEventListener("click",I),a&&a.addEventListener("click",de)}});window.deleteSale=re;window.showSaleDetail=function(e){console.log("Showing details for sale:",e)};
