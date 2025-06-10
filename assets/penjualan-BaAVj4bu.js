import{s as y}from"./db_conn-Cc8gtU8M.js";import{n as K,i as X,c as Z,p as V,d as ee}from"./import-DEtOz7nN.js";fetch("navbar.html").then(e=>e.text()).then(e=>{document.getElementById("navbar").innerHTML=e;const t=document.createElement("script");t.type="module",t.src=K,document.body.appendChild(t)}).catch(e=>console.error("Error loading navbar:",e));X();(async()=>await Z())();let L;function F(e){return{dipesan:"secondary",diambil:"success",dibayar:"primary"}[e]||"secondary"}function q(e){return e?new Date(e).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"-"}function C(e){if(!e)return"";const t=new Date(e);return new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16)}function I(e){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(e)}function m(e,t="success"){const a=document.getElementById("toastContainer"),n=document.createElement("div");n.className=`toast align-items-center text-white bg-${t==="success"?"success":"danger"} border-0`,n.setAttribute("role","alert"),n.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,a.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>n.remove())}function te(e,t){const a=document.querySelector(`tr[data-variant-id="${e}"]`);if(!a)return;a.classList.add("table-danger");let n=a.querySelector(".stock-error");n||(n=document.createElement("div"),n.className="stock-error text-danger small mt-1",a.querySelector("td:last-child").appendChild(n)),n.textContent=t}function ae(e){const t=document.querySelector(`tr[data-variant-id="${e}"]`);if(!t)return;t.classList.remove("table-danger");const a=t.querySelector(".stock-error");a&&a.remove()}async function U(){try{const{data:e,error:t}=await y.from("bakul").select("id, nama").order("nama",{ascending:!0});if(t)throw t;const a=document.getElementById("customer");a.innerHTML='<option value="" disabled selected>Pilih Bakul</option>',e.forEach(n=>{const r=document.createElement("option");r.value=n.id,r.textContent=`${n.nama}`,a.appendChild(r)})}catch(e){console.error("Error loading bakuls:",e),m("Gagal memuat daftar bakul","error")}}async function z(e="add",t=null){L||(L=new bootstrap.Modal(document.getElementById("saleModal")),await U()),document.getElementById("saleForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",re();const a=document.querySelector(".status-toggle-container"),n=document.getElementById("saleStatusBadge"),r=document.getElementById("saleModalLabel"),o=document.getElementById("addProductBtn"),l=document.getElementById("printButtonGroup"),i=document.getElementById("saleModal");if(i.dataset.mode=e,o&&(o.style.display="block"),l&&(l.style.display="none"),e==="edit"&&t){a&&(a.style.display="block"),n&&(n.style.display="none"),r.textContent="Edit Pesanan Penjualan",document.getElementById("saveSaleBtn").textContent="Update",await ne(t);const c=i.dataset.currentStatus;o&&(o.style.display=c==="dipesan"?"block":"none")}else{a&&(a.style.display="none"),n&&(n.style.display="inline-block",n.textContent="draft",n.className=`badge bg-${F("dipesan")}`),r.textContent="Tambah Pesanan Penjualan";const c=document.querySelector("#productsTable thead tr");c.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Harga</th>
            <th>Subtotal</th>
            <th></th>
        `,document.getElementById("totalAmount").textContent=I(0),i.removeAttribute("data-sale-id"),i.removeAttribute("data-current-status"),document.getElementById("saveSaleBtn").textContent="Simpan"}L.show()}async function ne(e){try{const{data:t,error:a}=await y.from("pesanan_penjualan").select(`
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
            `).eq("id",e).single();if(a)throw a;const n=document.getElementById("saleModal");n.dataset.saleId=e,n.dataset.currentStatus=t.status_pesanan,document.getElementById("saleDate").value=C(t.tanggal_pesan),document.getElementById("needDate").value=C(t.tanggal_dibutuhkan),document.getElementById("customer").value=t.id_bakul;const r=document.querySelector("#productsTable tbody");r.innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",t.items.forEach(o=>{const l=de(o,t.status_pesanan);r.appendChild(l)}),M(),await ie(t),oe(t.status_pesanan,t)}catch(t){throw console.error("Failed to load order:",t),m("Gagal memuat data pesanan","error"),t}}function re(){const e=document.getElementById("addProductBtn"),t=document.getElementById("saveSaleBtn"),a=document.getElementById("customer");e.replaceWith(e.cloneNode(!0)),t.replaceWith(t.cloneNode(!0)),a.replaceWith(a.cloneNode(!0)),document.getElementById("addProductBtn").addEventListener("click",W),document.getElementById("saveSaleBtn").addEventListener("click",async n=>{n.preventDefault();try{await se()}catch(r){console.error("Save failed:",r),m("Gagal menyimpan: "+r.message,"error")}}),document.getElementById("customer").addEventListener("change",async function(){document.getElementById("saleModal").dataset.mode}),document.querySelector("#productsTable tbody").addEventListener("click",function(n){(n.target.classList.contains("remove-item")||n.target.classList.contains("remove-product"))&&n.target.closest("tr").remove()}),document.getElementById("saleModal").addEventListener("hidden.bs.modal",()=>{document.getElementById("saleForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="";const n=document.querySelector("#productsTable thead tr");n.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Harga</th>
            <th>Subtotal</th>
            <th></th>
        `})}function oe(e,t){var i,c,s,h,b;const a=document.getElementById("saleStatusBadge"),n=document.querySelectorAll("#saleStatusToggle .btn-status"),r={};e==="diambil"?(r.tanggalAmbil=((i=document.getElementById("tanggalAmbil"))==null?void 0:i.value)||"",r.pihakPengambil=((c=document.getElementById("pihakPengambil"))==null?void 0:c.value)||""):e==="dibayar"&&(r.tanggalPembayaran=((s=document.getElementById("tanggalPembayaran"))==null?void 0:s.value)||"",r.totalDibayarkan=((h=document.getElementById("totalDibayarkan"))==null?void 0:h.value)||"",r.alatPembayaran=((b=document.getElementById("alatPembayaran"))==null?void 0:b.value)||"");const o=["dipesan","diambil","dibayar","selesai"],l=o.indexOf(e);n.forEach(d=>{d.classList.remove("active");const u=d.dataset.status,v=o.indexOf(u);u===e?(d.classList.add("active"),d.disabled=!1):d.disabled=v!==l+1}),R(e,r),n.forEach(d=>{d.addEventListener("click",function(){var E,T,x,P,g;if(this.disabled)return;const u=this.dataset.status;a.textContent=u,a.className=`badge bg-${F(u)}`;const v={};u==="diambil"?(v.tanggalAmbil=((E=document.getElementById("tanggalAmbil"))==null?void 0:E.value)||(t==null?void 0:t.tanggal_diambil)||"",v.pihakPengambil=((T=document.getElementById("pihakPengambil"))==null?void 0:T.value)||(t==null?void 0:t.pihak_pengambil)||""):u==="dibayar"&&(v.tanggalPembayaran=((x=document.getElementById("tanggalPembayaran"))==null?void 0:x.value)||(t==null?void 0:t.tanggal_dibayar)||"",v.totalDibayarkan=((P=document.getElementById("totalDibayarkan"))==null?void 0:P.value)||(t==null?void 0:t.total_dibayarkan)||"",v.alatPembayaran=((g=document.getElementById("alatPembayaran"))==null?void 0:g.value)||(t==null?void 0:t.alat_pembayaran)||""),R(u,v);const w=o.indexOf(u);n.forEach(f=>{const k=f.dataset.status,_=o.indexOf(k);f.classList.remove("active"),k===u?(f.classList.add("active"),f.disabled=!1):f.disabled=_!==w+1})})})}async function R(e,t={}){document.querySelectorAll("#productsTable tbody tr").forEach(r=>{const o=r.querySelector(".quantity"),l=r.querySelector(".variant-select"),i=r.querySelector(".price"),c=r.querySelector(".remove-item");o.readOnly=e!=="dipesan",l.disabled=e!=="dipesan",i.readOnly=["dibayar","selesai"].includes(e),c&&(c.disabled=["diambil","dibayar","selesai"].includes(e))}),document.getElementById("addProductBtn").style.display=e==="dipesan"?"block":"none";const a=document.getElementById("statusFieldsContainer");a.innerHTML="";const n=document.getElementById("printButtonGroup");if(n.style.display=e==="dibayar"?"flex":"none",e==="diambil"){const r=await N();let o='<option value="" disabled selected>Pilih pihak pengambil</option>';r.forEach(l=>{const i=t.pihakPengambil&&t.pihakPengambil===l.value?"selected":"",c=l.value.charAt(0).toUpperCase()+l.value.slice(1);o+=`<option value="${l.value}" ${i}>${c}</option>`}),a.innerHTML=`
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
        `}else if(e==="dibayar"){const r=await A();let o='<option value="" disabled selected>Pilih metode pembayaran</option>';r.forEach(c=>{const s=t.alatPembayaran===c.value?"selected":"",h=c.value.charAt(0).toUpperCase()+c.value.slice(1);o+=`<option value="${c.value}" ${s}>${h}</option>`}),a.innerHTML=`
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
        `;const l=t.tanggalPembayaran&&t.totalDibayarkan&&t.alatPembayaran;document.getElementById("printReceiptBtn").disabled=!l,document.getElementById("exportPdfBtn").disabled=!l,["tanggalPembayaran","totalDibayarkan","alatPembayaran"].forEach(c=>{const s=document.getElementById(c);s&&s.addEventListener("input",le)})}}async function ie(e){const t=document.getElementById("statusFieldsContainer");if(t.innerHTML="",M(),e.status_pesanan==="diambil"){const a=await N();let n='<option value="" disabled selected>Pilih pihak pengambil</option>';a.forEach(r=>{const o=e.pihak_pengambil&&e.pihak_pengambil===r.value?"selected":"",l=r.value.charAt(0).toUpperCase()+r.value.slice(1);n+=`<option value="${r.value}" ${o}>${l}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-6">
                    <label class="form-label">Tanggal Diambil</label>
                    <input type="datetime-local" class="form-control" id="tanggalAmbil" 
                        value="${e.tanggal_diambil?C(e.tanggal_diambil):""}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Pihak Pengambil</label>
                    <select class="form-select" id="pihakPengambil">
                        ${n}
                    </select>
                </div>
            </div>
        `}else if(e.status_pesanan==="dibayar"){const a=await A();let n='<option value="" disabled selected>Pilih metode pembayaran</option>';a.forEach(r=>{const o=e.alat_pembayaran===r.value?"selected":"",l=r.value.charAt(0).toUpperCase()+r.value.slice(1);n+=`<option value="${r.value}" ${o}>${l}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="datetime-local" class="form-control" id="tanggalPembayaran" 
                        value="${e.tanggal_dibayar?C(e.tanggal_dibayar):""}">
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
        `}}function le(){const e=document.getElementById("printReceiptBtn"),t=document.getElementById("exportPdfBtn"),a=document.getElementById("tanggalPembayaran").value&&document.getElementById("totalDibayarkan").value&&document.getElementById("alatPembayaran").value;e.disabled=!a,t.disabled=!a}async function A(){try{const{data:e,error:t}=await y.rpc("get_enum_values",{enum_name:"alat_pembayaran"});return t?(console.error("Error loading payment methods:",t),[{value:"tunai"},{value:"transfer"}]):e}catch(e){return console.error("Error:",e),[{value:"tunai"},{value:"transfer"}]}}async function N(){try{const{data:e,error:t}=await y.rpc("get_enum_values",{enum_name:"pihak_pengambil"});return t?(console.error("Error loading taker:",t),[{value:"sendiri"},{value:"perwakilan"}]):e}catch(e){return console.error("Error:",e),[{value:"sendiri"},{value:"perwakilan"}]}}async function j(e,t,a,n=null){const r=e.value;if(t.disabled=!0,t.innerHTML='<option value="" selected disabled>Memuat varian...</option>',!r){t.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>';return}try{const{data:o,error:l}=await y.from("produk_varian").select("id, varian, harga_standar").eq("id_produk",r).order("varian",{ascending:!0});if(l)throw l;t.innerHTML=`
            <option value="" ${n?"":"selected"} disabled>Pilih Varian</option>
            ${o.map(i=>`<option value="${i.id}" data-price="${i.harga_standar}"
                    ${n===i.id?"selected":""}>
                    ${i.varian}
                </option>`).join("")}
        `,t.disabled=!1}catch(o){console.error("Error loading variants:",o),t.innerHTML='<option value="" selected disabled>Error memuat varian</option>'}}async function W(e=null,t=null){const a=document.querySelector("#productsTable tbody");try{const{data:n,error:r}=await y.from("produk").select("id, nama").order("nama",{ascending:!0});if(r)throw r;const o=document.createElement("tr");t&&(o.dataset.variantId=t),o.innerHTML=`
            <td>
                <select class="form-select product-select">
                    <option value="" selected disabled>Pilih Produk</option>
                    ${n.map(c=>`<option value="${c.id}" ${e===c.id?"selected":""}>
                            ${c.nama}
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
            <td class="subtotal">${I(0)}</td>
            <td>
                <button class="btn btn-danger btn-sm remove-product">×</button>
            </td>
        `,a.appendChild(o);const l=o.querySelector(".product-select"),i=o.querySelector(".variant-select");l.addEventListener("change",async function(){await j(l,i,o,t)}),i.addEventListener("change",function(){o.dataset.variantId=this.value;const s=i.options[i.selectedIndex].getAttribute("data-price")||0;console.log("price: ",s),o.querySelector(".price").value=s,o.querySelector(".price").dispatchEvent(new Event("input"))}),e&&(i.innerHTML='<option value="" selected disabled>Memuat varian...</option>',i.disabled=!0,l.dispatchEvent(new Event("change"))),Q(o)}catch(n){console.error("Error adding product row:",n),m("Gagal menambahkan produk","error")}}function de(e,t){const a=document.createElement("tr");a.dataset.itemId=e.id,a.dataset.variantId=e.produk_varian.id;const n=["diambil","dibayar","selesai"].includes(t);if(a.innerHTML=`
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
        <td class="subtotal">${I((e.harga_jual||0)*e.qty_dipesan)}</td>
        <td>
            <button class="btn btn-danger btn-sm remove-item" 
                    ${n?"disabled":""}>×</button>
        </td>
    `,t==="dipesan"){const r=a.querySelector(".product-select"),o=a.querySelector(".variant-select");r.addEventListener("change",async function(){await j(r,o)}),setTimeout(async()=>{await j(r,o,a,e.produk_varian.id)},0)}return Q(a),a}function Q(e){const t=()=>{const n=parseFloat(e.querySelector(".price").value)||0,r=parseInt(e.querySelector(".quantity").value)||0,o=Math.round(n*r);console.log(o);const l=e.querySelector(".subtotal");l.tagName==="TD"?l.textContent=I(o):l.value=o,M()};e.querySelector(".price").addEventListener("input",t),e.querySelector(".quantity").addEventListener("input",t),t();const a=e.querySelector(".remove-product, .remove-item");a&&a.addEventListener("click",()=>{e.remove(),M()})}function M(){let e=0;document.querySelectorAll("#productsTable tbody tr").forEach(t=>{const a=t.querySelector(".subtotal").textContent,n=parseFloat(a.replace(/[^0-9]/g,""))||0;e+=n}),document.getElementById("totalAmount").textContent=I(e)}function D(){const t=document.getElementById("saleModal").dataset.mode==="add";let a;if(t)a="draft";else{const o=document.querySelector("#saleStatusToggle .btn-status.active");a=(o==null?void 0:o.dataset.status)||"dipesan"}const n=o=>o?new Date(o).toISOString():null,r={orderDate:n(document.getElementById("saleDate").value),needDate:n(document.getElementById("needDate").value),bakulID:document.getElementById("customer").value,status:t?"dipesan":a,items:Array.from(document.querySelectorAll("#productsTable tbody tr")).map(o=>({variantId:o.querySelector(".variant-select").value,quantity:parseInt(o.querySelector(".quantity").value)||0,rowId:o.dataset.itemId||null,price:parseFloat(o.querySelector(".price").value)||0}))};return t||(a==="diambil"&&(r.tanggalAmbil=n(document.getElementById("tanggalAmbil").value),r.pihakPengambil=document.getElementById("pihakPengambil").value),a==="dibayar"&&(r.tanggalPembayaran=n(document.getElementById("tanggalPembayaran").value),r.totalDibayarkan=document.getElementById("totalDibayarkan").value,r.alatPembayaran=document.getElementById("alatPembayaran").value)),r}async function se(){const e=document.getElementById("saleModal").dataset.mode;try{e==="edit"?(await ue(),L.hide(),await B()):await ce()||(L.hide(),await B())}catch(t){console.error("Save failed:",t),m("Gagal menyimpan pesanan","error")}}async function ce(){const e=D();let t=!1;const a=[];try{for(const n of e.items)try{const{error:r}=await y.rpc("adjust_reserved_stock",{p_variant_id:n.variantId,p_adjustment:n.quantity});if(r)throw r;ae(n.variantId)}catch(r){t=!0,a.push(r.message),te(n.variantId,r.message)}if(t)return m("Beberapa stok tidak mencukupi. Periksa daftar produk.","error"),!0;{const{data:n,error:r}=await y.from("pesanan_penjualan").insert({tanggal_pesan:e.orderDate,tanggal_dibutuhkan:e.needDate,id_bakul:e.bakulID,status_pesanan:"dipesan"}).select().single();if(r)throw r;const{error:o}=await y.from("item_pesanan_penjualan").insert(e.items.map(l=>({id_jual:n.id,id_varian:l.variantId,qty_dipesan:l.quantity,harga_jual:l.price})));if(o)throw o;return m("Pesanan baru berhasil dibuat","success"),!1}}catch(n){return console.error("Create order error:",n),m("Gagal membuat pesanan: "+n.message,"error"),!0}}async function ue(){const e=document.getElementById("saleModal").dataset.saleId,t=D();try{const a={tanggal_pesan:t.orderDate,id_bakul:t.bakulID,status_pesanan:t.status};t.status==="diambil"?(a.tanggal_diambil=t.tanggalAmbil,a.pihak_pengambil=t.pihakPengambil):t.status==="dibayar"&&(a.tanggal_dibayar=t.tanggalPembayaran,a.total_dibayarkan=t.totalDibayarkan,a.alat_pembayaran=t.alatPembayaran);const{error:n}=await y.from("pesanan_penjualan").update(a).eq("id",e);if(n)throw n;const{data:r,error:o}=await y.from("item_pesanan_penjualan").select("id, id_varian, qty_dipesan").eq("id_jual",e);if(o)throw o;const l={};r.forEach(d=>{l[d.id]={id_varian:d.id_varian,qty_dipesan:d.qty_dipesan}});const i=[],c=[],s={};t.items.forEach(d=>{var v;const u={id_jual:e,id_varian:d.variantId,qty_dipesan:d.quantity,harga_jual:d.price};if(d.rowId){i.push({...u,id:d.rowId});const w=((v=l[d.rowId])==null?void 0:v.qty_dipesan)||0,E=d.quantity-w;console.log(E),E!==0&&(s[d.variantId]=(s[d.variantId]||0)+E,console.log(s[d.variantId]))}else c.push(u),s[d.variantId]=(s[d.variantId]||0)+d.quantity});const h=t.items.map(d=>Number(d.rowId)).filter(Boolean),b=r.filter(d=>!h.includes(d.id));console.log(b),console.log("Original items:",r.map(d=>d.id)),console.log("Current items:",t.items.map(d=>d.rowId));for(const d of b)s[d.id_varian]=(s[d.id_varian]||0)-d.qty_dipesan,console.log(s[d.id_varian]);for(const[d,u]of Object.entries(s))if(u!==0){console.log("adj: ",u);const{error:v}=await y.rpc("adjust_reserved_stock",{p_variant_id:d,p_adjustment:u});if(v)throw v}if(b.length>0){const{error:d}=await y.from("item_pesanan_penjualan").delete().in("id",b.map(u=>u.id));if(d)throw d}if(i.length>0){const{error:d}=await y.from("item_pesanan_penjualan").upsert(i);if(d)throw d}if(c.length>0){const{error:d}=await y.from("item_pesanan_penjualan").insert(c);if(d)throw d}m("Pesanan berhasil diperbarui","success"),await B()}catch(a){console.error("Update order error:",a),m("Gagal memperbarui pesanan: "+a.message,"error")}}async function me(e){if(confirm("Apakah Anda yakin ingin menghapus penjualan ini?"))try{await y.from("item_pesanan_penjualan").delete().eq("id_jual",e),await y.from("pesanan_penjualan").delete().eq("id",e),m("Penjualan berhasil dihapus","success")}catch(t){console.error("Error deleting sale:",t),m("Gagal menghapus penjualan","error")}}async function B(){try{const e=document.getElementById("ongoingOrdersContainer");e.innerHTML=`
            <div class="col-12 text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat pesanan...
            </div>
        `;const{data:t,error:a}=await y.from("pesanan_penjualan").select(`
                id,
                tanggal_pesan,
                tanggal_dibutuhkan,
                tanggal_diambil,
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
            `;return}const n=t.map(o=>({...o,total:o.items.reduce((l,i)=>l+i.harga_jual*i.qty_dipesan,0)})),r=document.createElement("div");r.className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3",n.forEach(o=>{r.appendChild(pe(o))}),e.appendChild(r)}catch(e){console.error("Error loading ongoing sales:",e),m("Gagal memuat pesanan aktif","error"),document.getElementById("ongoingOrdersContainer").innerHTML=`
            <div class="col-12 text-center text-danger">
                Gagal memuat data
            </div>
        `}}function pe(e){var P;const t=document.createElement("div");t.className="col-md-6 col-lg-4 mb-3";const a=document.createElement("div");a.className="card h-100",a.dataset.saleId=e.id;const n=document.createElement("div");n.className="card-header d-flex justify-content-between align-items-center";const r=document.createElement("h5");r.className="mb-0",r.textContent=`#${e.id}`;const o=document.createElement("div");o.className="d-flex align-items-center gap-2";const l=document.createElement("span");l.className=`badge bg-${F(e.status_pesanan)}`,l.textContent=e.status_pesanan;const i=document.createElement("button");i.className="btn btn-sm btn-outline-secondary edit-order",i.innerHTML='<i class="bi bi-pencil"></i>',i.addEventListener("click",g=>{g.stopPropagation(),z("edit",e.id)}),n.appendChild(r),o.appendChild(l),o.appendChild(i),n.appendChild(o);const c=document.createElement("div");c.className="card-body";const s=document.createElement("p");s.className="mb-1",s.innerHTML=`<strong>Bakul:</strong> ${((P=e.bakul)==null?void 0:P.nama)||"-"}`;const h=document.createElement("p");h.className="mb-1",h.innerHTML=`<strong>Tanggal Pesan:</strong> ${q(e.tanggal_pesan)}`;const b=document.createElement("p");b.className="mb-1",b.innerHTML=`<strong>Dibutuhkan:</strong> ${q(e.tanggal_dibutuhkan)}`;const d=document.createElement("p");d.className="mb-1";const u=Math.round(e.total);d.innerHTML=`<strong>Total:</strong> ${I(u||0)}`;const v=document.createElement("p");v.className="mb-1 mt-2 fw-bold",v.textContent="Items:";const w=document.createElement("ul");w.className="list-unstyled mb-0",e.items.forEach(g=>{var k,_,S;const f=document.createElement("li");f.className="d-flex justify-content-between",f.innerHTML=`
            <span>${((_=(k=g.produk_varian)==null?void 0:k.produk)==null?void 0:_.nama)||"Produk"} - ${((S=g.produk_varian)==null?void 0:S.varian)||""}</span>
            <span>${g.qty_dipesan} × ${I(g.harga_jual)}</span>
        `,w.appendChild(f)}),c.appendChild(s),c.appendChild(h),c.appendChild(b),c.appendChild(d),c.appendChild(v),c.appendChild(w);const E=document.createElement("div");if(E.className="card-footer bg-transparent border-top-0",e.status_pesanan==="dipesan"){const g=document.createElement("div");g.className="form-check mb-2";const f=document.createElement("input");f.type="checkbox",f.className="form-check-input preparation-checkbox",f.id=`prep-${e.id}`,f.checked=e.status_persiapan||!1;const k=document.createElement("label");k.className="form-check-label",k.htmlFor=`prep-${e.id}`,k.textContent="Persiapan Selesai",ge(f,e),g.appendChild(f),g.appendChild(k),E.appendChild(g)}const T=document.createElement("div");T.className="d-flex justify-content-between";const x=document.createElement("button");if(x.className="btn btn-sm",e.status_pesanan==="dipesan"){const g=document.createElement("button");g.className="btn btn-sm btn-outline-danger ms-2 cancel-order",g.innerHTML='<i class="bi bi-x-circle"></i> Batalkan',g.dataset.orderId=e.id;const f=e.items.map(k=>{var _;return{variantId:((_=k.produk_varian)==null?void 0:_.id)||"",qty:k.qty_dipesan||0,price:k.harga_jual||0}});g.dataset.items=JSON.stringify(f),E.appendChild(g)}else if(e.status_pesanan==="dibayar"){const g=document.createElement("button");g.className="btn btn-sm btn-dark ms-2 complete-order",g.innerHTML='<i class="bi bi-check-circle"></i> Selesaikan',g.dataset.orderId=e.id,g.dataset.takenDate=e.tanggal_diambil;const f=e.items.map(_=>{var S;return{variantId:((S=_.produk_varian)==null?void 0:S.id)||"",qty:_.qty_dipesan||0,price:_.harga_jual||0}});g.dataset.items=JSON.stringify(f),E.appendChild(g);const k=document.createElement("button");k.className="btn btn-sm btn-outline-primary ms-2 reprint-order",k.innerHTML='<i class="bi bi-printer"></i> Cetak',k.dataset.orderId=e.id,k.addEventListener("click",_=>{_.stopPropagation(),G(e.id)}),E.appendChild(k)}return T.appendChild(x),E.appendChild(T),a.appendChild(n),a.appendChild(c),a.appendChild(E),t.appendChild(a),t}function ge(e,t){e.addEventListener("change",async function(){const a=this.checked;if(!confirm(`Yakin ingin ${a?"menandai":"membatalkan tanda"} persiapan selesai untuk pesanan #${t.id}?`)){this.checked=!a;return}this.disabled=!0;try{const{error:o}=await y.from("pesanan_penjualan").update({status_persiapan:a}).eq("id",t.id);if(o)throw o;m(`Status persiapan ${a?"diselesaikan":"dibatalkan"}`,"success");const l=this.closest(".card").querySelector(".prep-status");l&&(l.textContent=`Persiapan: ${a?"Siap":"Belum siap"}`)}catch(o){console.error("Update error:",o),this.checked=!a,m("Gagal memperbarui status","error")}finally{this.disabled=!1}})}async function O(e=null,t=null,a=null,n=null,r=null){const o=document.querySelector("#history tbody");if(o)try{o.innerHTML=`
            <tr>
                <td colspan="10" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat riwayat penjualan...
                </td>
            </tr>`;let l=y.from("pesanan_penjualan").select(`
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
            `).eq("status_pesanan","selesai").order("tanggal_pesan",{ascending:!1});e&&t&&(l=l.gte("tanggal_pesan",e).lte("tanggal_pesan",t)),a&&(l=l.eq("id_bakul",a)),n&&(l=l.eq("pihak_pengambil",n)),r&&(l=l.eq("alat_pembayaran",r));const{data:i,error:c}=await l;if(c)throw c;o.innerHTML="",i&&i.length>0?(i.forEach(s=>{const h=q(s.tanggal_pesan),b=s.tanggal_diambil?q(s.tanggal_diambil):"-",d=s.tanggal_dibayar?q(s.tanggal_dibayar):"-",u=s.items.reduce((w,E)=>w+E.qty_dipesan,0),v=document.createElement("tr");v.innerHTML=`
                    <td>${s.id}</td>
                    <td>${h}</td>
                    <td>${s.bakul.nama}</td>
                    <td>${b}</td>
                    <td>${s.pihak_pengambil||"-"}</td>
                    <td>${u}</td>
                    <td>${I(s.total_dibayarkan)}</td>
                    <td>${d}</td>
                    <td>${s.alat_pembayaran||"-"}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary detail-btn me-1" data-order-id="${s.id}">Detail</button>
                        <button class="btn btn-sm btn-outline-secondary reprint-btn" data-order-id="${s.id}">Cetak</button>
                    </td>
                `,o.appendChild(v)}),document.querySelectorAll(".reprint-btn").forEach(s=>{s.addEventListener("click",async h=>{const b=h.target.dataset.orderId;try{await G(b)}catch(d){console.error("Error printing receipt:",d),m("Gagal mencetak struk","error")}})}),document.querySelectorAll(".detail-btn").forEach(s=>{s.addEventListener("click",async h=>{const b=h.target.dataset.orderId;await ye(b)})})):o.innerHTML=`
                <tr>
                    <td colspan="10" class="text-center text-muted">Tidak ada riwayat penjualan</td>
                </tr>
            `}catch(l){console.error("Error fetching history:",l),m("Gagal memuat riwayat penjualan","error")}}async function ye(e){try{const{data:t,error:a}=await y.from("pesanan_penjualan").select(`
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
            `).eq("id",e).single();if(a)throw a;const n=i=>i?new Date(i).toLocaleDateString("id-ID"):"-",r=`
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
                                    <p><strong>Bakul:</strong> ${t.bakul.nama}</p>
                                    <p><strong>Pihak Pengambil:</strong> ${t.pihak_pengambil||"-"}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tanggal Diterima:</strong> ${n(t.tanggal_diambil)}</p>
                                    <p><strong>Total Dibayarkan:</strong> ${I(t.total_dibayarkan)}</p>
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
                                        ${t.items.map(i=>`
                                            <tr>
                                                <td>${i.produk_varian.produk.nama}</td>
                                                <td>${i.produk_varian.varian||"-"}</td>
                                                <td>${i.qty_dipesan}</td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" class="text-end"><strong>Total:</strong></td>
                                            <td><strong>${t.items.reduce((i,c)=>i+c.qty_dipesan,0)}</strong></td>
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
        `,o=document.createElement("div");o.innerHTML=r,document.body.appendChild(o),new bootstrap.Modal(document.getElementById("orderDetailModal")).show(),document.getElementById("orderDetailModal").addEventListener("hidden.bs.modal",()=>{o.remove()})}catch(t){console.error("Error showing order details:",t),m("Gagal memuat detail pesanan","error")}}const p={type:null,date:{start:null,end:null},bakul:null,payment:null,taker:null};function be(){var e,t,a,n,r,o,l;document.querySelectorAll('input[name="filterGroup"]').forEach(i=>{i.addEventListener("click",function(c){if(this.checked&&p.type===this.value){this.checked=!1,H();return}p.type=this.value;const s=document.getElementById("filterCollapse"),h=bootstrap.Collapse.getInstance(s);!h||s.classList.contains("collapsing")?new bootstrap.Collapse(s,{toggle:!0}):s.classList.contains("collapse")&&h.show(),he()})}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",Ee),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",H),(a=document.getElementById("startDate"))==null||a.addEventListener("change",function(){p.date.start=this.value}),(n=document.getElementById("endDate"))==null||n.addEventListener("change",function(){p.date.end=this.value}),(r=document.getElementById("bakulSelect"))==null||r.addEventListener("change",function(){p.bakul=this.value}),(o=document.getElementById("paymentSelect"))==null||o.addEventListener("change",function(){p.payment=this.value}),(l=document.getElementById("takerSelect"))==null||l.addEventListener("change",function(){p.taker=this.value}),ve(),fe(),ke()}function he(){switch(document.querySelectorAll("#filterOptionsContainer > .row").forEach(e=>{e.classList.add("d-none")}),p.type){case"date":document.getElementById("dateFilter").classList.remove("d-none");break;case"bakul":document.getElementById("bakulFilter").classList.remove("d-none");break;case"payment":document.getElementById("paymentFilter").classList.remove("d-none");break;case"taker":document.getElementById("takerFilter").classList.remove("d-none");break}document.getElementById("filterCard").classList.remove("d-none")}async function ve(){try{const{data:e,error:t}=await y.from("bakul").select("id, nama").order("nama",{ascending:!0});if(t)throw t;const a=document.getElementById("bakulSelect");a.innerHTML='<option value="">Semua Bakul</option>',e.forEach(n=>{const r=document.createElement("option");r.value=n.id,r.textContent=n.nama,a.appendChild(r)})}catch(e){console.error("Error loading bakul:",e),m("Gagal memuat daftar bakul","error")}}async function fe(){try{const e=await A(),t=document.getElementById("paymentSelect");t.innerHTML='<option value="">Semua Metode</option>',e.forEach(a=>{const n=document.createElement("option");n.value=a.value;const r=a.value.charAt(0).toUpperCase()+a.value.slice(1);n.textContent=r,t.appendChild(n)})}catch(e){console.error("Error loading payment methods:",e),m("Gagal memuat metode pembayaran","error");const t=document.getElementById("paymentSelect");t.innerHTML=`
            <option value="">Semua Metode</option>
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer</option>
        `}}async function ke(){try{const e=await N(),t=document.getElementById("takerSelect");t.innerHTML='<option value="">Semua Pihak</option>',e.forEach(a=>{const n=document.createElement("option");n.value=a.value;const r=a.value.charAt(0).toUpperCase()+a.value.slice(1);n.textContent=r,t.appendChild(n)})}catch(e){console.error("Error loading taker:",e),m("Gagal memuat daftar pihak pengambil","error");const t=document.getElementById("takerSelect");t.innerHTML=`
            <option value="">Semua Pihak</option>
            <option value="gudang">Sendiri</option>
            <option value="toko">Perwakilan</option>
        `}}function Ee(){switch(p.type){case"date":p.date.start=document.getElementById("startDate").value,p.date.end=document.getElementById("endDate").value;break;case"bakul":p.bakul=document.getElementById("bakulSelect").value;break;case"payment":p.payment=document.getElementById("paymentSelect").value;break;case"taker":p.taker=document.getElementById("takerSelect").value;break}_e()}async function _e(){try{const e=p.type==="date"?p.date.start:null,t=p.type==="date"?p.date.end:null,a=p.type==="bakul"?p.bakul:null,n=p.type==="payment"?p.payment:null,r=p.type==="taker"?p.taker:null;await O(e,t,a,n,r)}catch(e){console.error("Error filtering history:",e),m("Gagal memfilter riwayat","error")}}function H(){document.querySelectorAll('input[name="filterGroup"]').forEach(a=>{a.checked=!1}),p.type=null,p.date={start:null,end:null},p.bakul=null,p.payment=null,p.taker=null,document.getElementById("startDate").value="",document.getElementById("endDate").value="",document.getElementById("bakulSelect").value="",document.getElementById("paymentSelect").value="",document.getElementById("takerSelect").value="",document.querySelectorAll("#filterOptionsContainer > .row").forEach(a=>{a.classList.add("d-none")});const e=document.getElementById("filterCollapse"),t=bootstrap.Collapse.getInstance(e);t&&!e.classList.contains("collapse")&&t.hide(),O()}function we(){var n;const e=document.getElementById("printReceiptBtn"),t=document.getElementById("exportPdfBtn"),a=document.getElementById("printButtonGroup");e==null||e.addEventListener("click",()=>G()),t==null||t.addEventListener("click",Ie),(n=document.getElementById("saleStatusToggle"))==null||n.addEventListener("click",r=>{if(r.target.closest(".btn-status")){const o=r.target.closest(".btn-status").dataset.status;a.style.display=o==="dibayar"?"flex":"none"}})}async function G(e=null){let t;if(e?t=e:t=document.getElementById("saleModal").dataset.saleId,!t){m("Tidak ada pesanan yang dipilih","error");return}try{let a=await Y(t);if(!a.tanggal_dibayar||!a.total_dibayarkan||!a.alat_pembayaran){const r=D();if(r)a={...a,tanggal_dibayar:r.tanggalPembayaran,total_dibayarkan:parseFloat(r.totalDibayarkan),alat_pembayaran:r.alatPembayaran};else throw new Error("Data pembayaran belum lengkap")}const n=J(a);Be(n)}catch(a){console.error("Error printing receipt:",a),m(a.message||"Gagal mencetak struk","error")}}async function Ie(){const e=document.getElementById("saleModal").dataset.saleId;if(!e){m("Tidak ada pesanan yang dipilih","error");return}const t=document.getElementById("exportPdfBtn"),a=t.innerHTML;try{t.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span> Memproses...',t.disabled=!0;const n=await Y(e);if(!n.tanggal_dibayar||!n.total_dibayarkan||!n.alat_pembayaran){const i=D();if(i)n={...n,tanggal_dibayar:i.tanggalPembayaran,total_dibayarkan:parseFloat(i.totalDibayarkan),alat_pembayaran:i.alatPembayaran};else throw new Error("Data pembayaran belum lengkap")}const r=J(n),{jsPDF:o}=window.jspdf;await new o({orientation:"portrait",unit:"mm",format:[80,297]}).html(r,{html2canvas:{scale:.3,logging:!1,useCORS:!0,letterRendering:!0,width:80},callback:function(i){i.save(`Struk_${e}.pdf`),t.innerHTML=a,t.disabled=!1},x:0,y:0,width:80,windowWidth:800})}catch(n){console.error("PDF export error:",n),m("Gagal membuat PDF: "+n.message,"error"),t.innerHTML=a,t.disabled=!1}}function Be(e){const t=window.open("","_blank","width=800,height=600"),a=(e.match(/<tr>/g)||[]).length,n=50,r=a*3,o=Math.max(n+r,150),l="5mm 3mm";t.document.open(),t.document.write(`
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
                        padding: ${l};
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
    `),t.document.close()}function J(e){var n;const t=r=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(r),a=r=>new Date(r).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
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
                <col style="width:50%"> 
                <col style="width:15%"> 
                <col style="width:35%">  
            </colgroup>
            <thead>
                <tr>
                    <th style="text-align:left; padding:2px 0; border-bottom:1px dashed #000; word-wrap:break-word;">Item</th>
                    <th style="text-align:right; padding:2px 0; border-bottom:1px dashed #000;">Qty</th>
                    <th style="text-align:right; padding:2px 0; border-bottom:1px dashed #000;">Harga</th>
                </tr>
            </thead>
            <tbody>
                ${e.items.map(r=>{var o,l,i;return`
                    <tr>
                        <td style="padding:2px 0; word-wrap:break-word; overflow-wrap:break-word;">
                            ${((l=(o=r.produk_varian)==null?void 0:o.produk)==null?void 0:l.nama)||"Produk"} ${((i=r.produk_varian)==null?void 0:i.varian)||""}
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
    `}async function Y(e){const{data:t,error:a}=await y.from("pesanan_penjualan").select(`
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
        `).eq("id",e).single();if(a)throw a;return t}document.addEventListener("DOMContentLoaded",async()=>{L=new bootstrap.Modal(document.getElementById("saleModal"));const e=document.getElementById("penjualanTabs"),t=document.getElementById("addSaleBtn"),a=document.getElementById("ongoing-tab"),n=document.getElementById("history-tab");e.addEventListener("click",function(i){i.target&&i.target.matches("#history-tab")?t.style.display="none":i.target&&i.target.matches("#ongoing-tab")&&(t.style.display="inline-block")}),await U(),await l(),document.getElementById("addProductBtn").addEventListener("click",W),document.addEventListener("click",async i=>{if(i.target.closest(".cancel-order")){const c=i.target.closest(".cancel-order"),s=c.dataset.orderId,h=JSON.parse(c.dataset.items||"[]");console.log("data: ",h);try{if(!confirm("Yakin ingin membatalkan pesanan ini?"))return;for(const d of h){console.log("item: ",d);const{error:u}=await y.rpc("adjust_reserved_stock",{p_variant_id:d.variantId,p_adjustment:-d.qty});if(u)throw u;console.log("stok_reservasi updated")}const{error:b}=await y.from("pesanan_penjualan").delete().eq("id",s);if(b)throw b;m("Pesanan dibatalkan","success"),B()}catch(b){console.error("Order processing failed:",b),m("Gagal membatalkan pesanan: "+b.message,"error")}}}),document.addEventListener("click",async i=>{if(i.target.closest(".complete-order")){const c=i.target.closest(".complete-order"),s=c.dataset.orderId,h=c.dataset.takenDate,b=JSON.parse(c.dataset.items||"[]");try{for(const u of b){const{error:v}=await y.rpc("adjust_reserved_stock",{p_variant_id:u.variantId,p_adjustment:-u.qty});if(v)throw v;await V({variantId:u.variantId,type:"penjualan",id:s,quantity:u.qty,price:u.price,date:h})}const{error:d}=await y.from("pesanan_penjualan").update({status_pesanan:"selesai"}).eq("id",s);if(d)throw d;m("Pesanan berhasil diselesaikan","success"),await B()}catch(d){console.error("Order processing failed:",d),m("Gagal menyelesaikan pesanan: "+d.message,"error")}}}),we();const r=document.createElement("script");r.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",document.body.appendChild(r);const o=document.createElement("script");o.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",document.body.appendChild(o);async function l(){B(),be(),t&&t.addEventListener("click",()=>z("add")),a&&a.addEventListener("click",B),n&&n.addEventListener("click",()=>{H(),O()}),await ee()}});window.deleteSale=me;window.showSaleDetail=function(e){console.log("Showing details for sale:",e)};
