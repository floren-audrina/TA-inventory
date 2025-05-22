import"./modulepreload-polyfill-B5Qt9EMX.js";import{n as A}from"./navbar-Cw31nkU0.js";import{s as v}from"./db_conn-C7Nb5uSA.js";import{p as M,u as F}from"./import-Cn2uwdsk.js";fetch("navbar.html").then(a=>a.text()).then(a=>{document.getElementById("navbar").innerHTML=a;const e=document.createElement("script");e.type="module",e.src=A,document.body.appendChild(e)}).catch(a=>console.error("Error loading navbar:",a));let T;function q(a){return{dipesan:"secondary",diterima:"success",dibayar:"primary"}[a]||"secondary"}function D(a){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(a)}function g(a,e="success"){const r=document.getElementById("toastContainer");if(!r){console.error("Toast container not found!");return}const t=document.createElement("div");t.className=`toast align-items-center text-white bg-${e==="success"?"success":"danger"} border-0`,t.setAttribute("role","alert"),t.setAttribute("aria-live","assertive"),t.setAttribute("aria-atomic","true"),t.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${a}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,r.appendChild(t),new bootstrap.Toast(t,{autohide:!0,delay:3e3}).show(),t.addEventListener("hidden.bs.toast",()=>{t.remove()})}async function j(a,e,r,t=null){const n=a.value;if(e.disabled=!0,e.innerHTML='<option value="" selected disabled>Memuat varian...</option>',!n){e.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>';return}try{const{data:o,error:i}=await v.from("produk_varian").select("id, varian, harga_standar").eq("id_produk",n).order("varian",{ascending:!0});if(i)throw i;e.innerHTML=`
            <option value="" ${t?"":"selected"} disabled>Pilih Varian</option>
            ${o.map(s=>`<option value="${s.id}" data-price="${s.harga_standar}"
                    ${t===s.id?"selected":""}>
                    ${s.varian}
                </option>`).join("")}
        `,e.disabled=!1}catch(o){console.error("Error loading variants:",o),e.innerHTML='<option value="" selected disabled>Error memuat varian</option>'}}async function G(){try{const a=document.getElementById("supplier");if(!a){console.error("Supplier select element not found!"),g("Elemen supplier tidak ditemukan","error");return}a.innerHTML='<option value="" disabled selected>Memuat supplier...</option>';const{data:e,error:r}=await v.from("supplier").select("id, perusahaan, cp");if(r)throw r;if(!e||e.length===0){g("Tidak ada data supplier","warning"),a.innerHTML='<option value="" disabled selected>Tidak ada supplier</option>';return}a.innerHTML='<option value="" disabled selected>Pilih Supplier</option>',e.forEach(t=>{const n=document.createElement("option");n.value=t.id,n.textContent=`${t.perusahaan} (Contact Person: ${t.cp})`,a.appendChild(n)})}catch(a){console.error("Error loading suppliers:",a);const e=document.getElementById("supplier");e.innerHTML='<option value="" disabled selected>Error loading suppliers</option>',g("Gagal memuat daftar supplier: "+a.message,"error")}}async function S(){try{const{data:a,error:e}=await v.rpc("get_enum_values",{enum_name:"lokasi_penerimaan"});return e?(console.error("Error loading locations:",e),[{value:"gudang"},{value:"toko"}]):a}catch(a){return console.error("Error:",a),[{value:"gudang"},{value:"toko"}]}}async function H(){try{const{data:a,error:e}=await v.rpc("get_enum_values",{enum_name:"alat_pembayaran"});return e?(console.error("Error loading payment methods:",e),[{value:"tunai"},{value:"transfer"}]):a}catch(a){return console.error("Error:",a),[{value:"tunai"},{value:"transfer"}]}}function x(){var o,i,s,l,d,m;const a=document.getElementById("orderModal").dataset.mode,e=a==="add";let r;if(e)r="draft";else{const c=document.querySelector("#orderStatusToggle .btn-status.active");r=(c==null?void 0:c.dataset.status)||"dipesan"}const t=c=>c?new Date(c).toISOString():null,n={orderDate:t(document.getElementById("orderDate").value),supplierId:document.getElementById("supplier").value,status:r,items:Array.from(document.querySelectorAll("#productsTable tbody tr")).map(c=>{var y,p,h;const u={variantId:c.querySelector(".variant-select").value,quantity:parseInt(c.querySelector(".quantity").value)||0,rowId:c.dataset.itemId||null};return a==="edit"&&r!=="dipesan"&&(u.receivedQty=parseInt((y=c.querySelector(".received-qty"))==null?void 0:y.value)||0,u.brokenQty=parseInt((p=c.querySelector(".broken-qty"))==null?void 0:p.value)||0,u.purchasePrice=parseFloat((h=c.querySelector(".purchase-price"))==null?void 0:h.value)||0),u})};return a==="edit"&&(r==="diterima"?(n.receivedDate=t((o=document.getElementById("tanggalDiterima"))==null?void 0:o.value),n.receivingLocation=(i=document.getElementById("lokasiPenerimaan"))==null?void 0:i.value,n.deliveryNoteNumber=(s=document.getElementById("noSuratJalan"))==null?void 0:s.value):r==="dibayar"&&(n.paymentDate=t((l=document.getElementById("tanggalPembayaran"))==null?void 0:l.value),n.paymentAmount=parseFloat((d=document.getElementById("totalDibayarkan"))==null?void 0:d.value)||0,n.paymentMethod=(m=document.getElementById("alatPembayaran"))==null?void 0:m.value)),n}async function J(){const a=document.getElementById("orderModal").dataset.mode;try{a==="edit"?await U():await R(),T.hide(),await k()}catch(e){console.error("Save failed:",e),g("Gagal menyimpan pesanan","error")}}async function R(){const a=x();try{const{data:e,error:r}=await v.from("pesanan_pembelian").insert({tanggal_pesan:a.orderDate,id_supplier:a.supplierId,status_pesanan:"dipesan"}).select().single();if(r)throw r;const{error:t}=await v.from("item_pesanan_pembelian").insert(a.items.map(n=>({id_beli:e.id,id_varian:n.variantId,qty_dipesan:n.quantity,qty_diterima:null,qty_rusak:null,harga_beli:null})));if(t)throw t;g("Pesanan baru berhasil dibuat","success"),await k()}catch(e){console.error("Create order error:",e),g("Gagal membuat pesanan: "+e.message,"error")}}async function U(){const a=document.getElementById("orderModal").dataset.orderId,e=x();try{const r={tanggal_pesan:e.orderDate,id_supplier:e.supplierId,status_pesanan:e.status};e.status==="diterima"?(r.tanggal_diterima=e.receivedDate,r.lokasi_penerimaan=e.receivingLocation,r.no_surat_jalan=e.deliveryNoteNumber):e.status==="dibayar"&&(r.tanggal_pembayaran=e.paymentDate,r.total_dibayarkan=e.paymentAmount,r.alat_pembayaran=e.paymentMethod);const{error:t}=await v.from("pesanan_pembelian").update(r).eq("id",a);if(t)throw t;if(e.status==="diterima")for(const i of e.items){if(i.receivedQty===void 0||i.brokenQty===void 0)throw new Error('All items must have received and broken quantities when status is "diterima"');const s=Number(i.receivedQty)||0,l=Number(i.brokenQty)||0,d=s-l;if(isNaN(s)||isNaN(l))throw new Error("Quantities must be valid numbers");if(await F(i.variantId,d,"pembelian")===null)throw new Error(`Failed to update stock for variant ${i.variantId}`)}const n=[],o=[];if(e.items.forEach(i=>{const s={id_varian:i.variantId,qty_dipesan:i.quantity};e.status!=="dipesan"&&(s.qty_diterima=i.receivedQty||null,s.qty_rusak=i.brokenQty||null,s.harga_beli=i.purchasePrice||null),i.rowId?n.push({...s,id:i.rowId}):o.push({...s,id_beli:a})}),n.length>0){const{error:i}=await v.from("item_pesanan_pembelian").upsert(n);if(i)throw i}if(o.length>0){const{error:i}=await v.from("item_pesanan_pembelian").insert(o);if(i)throw i}g("Pesanan berhasil diperbarui","success"),await k()}catch(r){console.error("Update order error:",r),g("Gagal memperbarui pesanan: "+r.message,"error")}}async function N(a=null,e=null){const r=document.querySelector("#productsTable tbody"),t=document.getElementById("supplier").value;if(!t){g("Pilih supplier terlebih dahulu","warning");return}try{const{data:n,error:o}=await v.from("produk").select("id, nama").eq("id_supplier",t).order("nama",{ascending:!0});if(o)throw o;const i=document.createElement("tr");i.innerHTML=`
            <td>
                <select class="form-select product-select">
                    <option value="" selected disabled>Pilih Produk</option>
                    ${n.map(d=>`<option value="${d.id}" ${a===d.id?"selected":""}>
                            ${d.nama}
                        </option>`).join("")}
                </select>
            </td>
            <td>
                <select class="form-select variant-select" ${a?"":"disabled"}>
                    ${a?'<option value="" selected disabled>Memuat varian...</option>':'<option value="" selected disabled>Pilih Produk Dulu</option>'}
                </select>
            </td>
            <td>
                <input type="number" class="form-control quantity" min="1" value="">
            </td>
            <td>
                <button class="btn btn-danger btn-sm remove-product">×</button>
            </td>
        `,r.appendChild(i);const s=i.querySelector(".product-select"),l=i.querySelector(".variant-select");s.addEventListener("change",async function(){if(!this.value){l.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>',l.disabled=!0;return}await j(s,l,i,e)}),a&&s.dispatchEvent(new Event("change"))}catch(n){console.error("Error adding product row:",n),g("Gagal menambahkan produk","error")}}function V(a,e){const r=document.createElement("tr");r.dataset.itemId=a.id;const t=["diterima","dibayar","selesai"].includes(e);return r.innerHTML=`
        <td>
            <select class="form-select product-select" disabled>
                <option value="${a.produk_varian.id}" selected>
                    ${a.produk_varian.produk.nama}
                </option>
            </select>
        </td>
        <td>
            <select class="form-select variant-select" ${e!=="dipesan"?"disabled":""}>
                <option value="${a.produk_varian.id}" selected>
                    ${a.produk_varian.varian}
                </option>
            </select>
        </td>
        <td>
            <input type="number" class="form-control quantity" 
                   value="${a.qty_dipesan}" min="1" 
                   ${e!=="dipesan"?"readonly":""}>
        </td>
        ${e!=="dipesan"?`<td>
            <input type="number" class="form-control received-qty" 
                   value="${a.qty_diterima||0}" min="0"
                   ${["dibayar","selesai"].includes(e)?"readonly":""}>
        </td>`:""}
        ${e!=="dipesan"?`<td>
                <input type="number" class="form-control broken-qty" 
                       value="${a.qty_rusak||0}" min="0"
                       ${["dibayar","selesai"].includes(e)?"readonly":""}>
            </td>`:""}
        ${e!=="dipesan"?`<td>
                <input type="number" class="form-control purchase-price" 
                        value="${a.harga_beli||0}" min="0"
                        ${["dibayar","selesai"].includes(e)?"readonly":""}>
            </td>`:""}
        <td>
            <button class="btn btn-danger btn-sm remove-item" 
                    ${t?"disabled":""}>×</button>
        </td>
    `,r}function Y(a){const e=document.createElement("div");e.className="col-md-6 col-lg-4 mb-3";const r=document.createElement("div");r.className="card h-100";const t=document.createElement("div");t.className="card-header d-flex justify-content-between align-items-center";const n=document.createElement("h5");n.className="mb-0",n.textContent=`#${a.id}`;const o=document.createElement("div");o.className="d-flex align-items-center gap-2";const i=document.createElement("span");i.className=`order-status badge bg-${q(a.status_pesanan)}`,i.textContent=a.status_pesanan;const s=document.createElement("button");s.className="btn btn-sm btn-outline-secondary edit-order",s.innerHTML='<i class="bi bi-pencil"></i>',s.addEventListener("click",b=>{b.stopPropagation(),O("edit",a.id)}),t.appendChild(n),o.appendChild(i),o.appendChild(s),t.appendChild(o);const l=document.createElement("div");l.className="card-body";const d=document.createElement("p");d.className="mb-1",d.innerHTML=`<strong>Tanggal Pemesanan:</strong> ${a.tanggal_pesan}`;const m=document.createElement("p");m.className="mb-1",m.innerHTML=`<strong>Supplier:</strong> ${a.supplier.perusahaan} (Contact Person: ${a.supplier.cp})`;const c=document.createElement("p");c.className="mb-1 mt-1 fw-bold",c.textContent="Items:";const u=document.createElement("ul");u.className="list-unstyled mb-0",a.items.forEach(b=>{var f,E,I;const _=document.createElement("li");_.className="d-flex justify-content-between",_.innerHTML=`
            <span>${((E=(f=b.produk_varian)==null?void 0:f.produk)==null?void 0:E.nama)||"Produk"} - ${((I=b.produk_varian)==null?void 0:I.varian)||""}</span>
            <span>${b.qty_dipesan}</span>
        `,u.appendChild(_)}),l.appendChild(d),l.appendChild(m),l.appendChild(c),l.appendChild(u);const y=document.createElement("div");y.className="card-footer bg-transparent border-top-0";const p=document.createElement("div");p.className="d-flex justify-content-between";const h=document.createElement("button");if(h.className="btn btn-sm",a.status_pesanan==="dipesan"){const b=document.createElement("button");b.className="btn btn-sm btn-outline-danger ms-2 cancel-order",b.innerHTML='<i class="bi bi-x-circle"></i> Batalkan',b.dataset.orderId=a.id,y.appendChild(b)}else if(a.status_pesanan==="dibayar"){const b=document.createElement("button");b.className="btn btn-sm btn-dark ms-2 complete-order",b.innerHTML='<i class="bi bi-check-circle"></i> Selesaikan',b.dataset.orderId=a.id;const _=a.items.map(f=>{var E;return{variantId:((E=f.produk_varian)==null?void 0:E.id)||"",receivedQty:f.qty_diterima||0,brokenQty:f.qty_rusak||0,price:f.harga_beli||0}});b.dataset.items=JSON.stringify(_),y.appendChild(b)}return p.appendChild(h),y.appendChild(p),r.appendChild(t),r.appendChild(l),r.appendChild(y),e.appendChild(r),e}async function k(){const a=document.getElementById("ongoingOrdersContainer");if(a)try{a.innerHTML=`
            <div class="col-12 text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat pesanan...
            </div>
        `;const{data:e,error:r}=await v.from("pesanan_pembelian").select(`
                id,
                tanggal_pesan,
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
            `).neq("status_pesanan","selesai").order("id",{ascending:!1});if(r)throw r;a.innerHTML="";const t=document.createElement("div");t.className="row mt-3",e&&e.length>0?e.forEach(n=>{t.appendChild(Y(n))}):t.innerHTML='<div class="col-12 text-center text-muted">Tidak ada pesanan yang sedang berlangsung</div>',a.appendChild(t)}catch(e){console.error("Error fetching orders:",e),g("Gagal memuat daftar pesanan","error")}}async function O(a="add",e=null){T||(T=new bootstrap.Modal(document.getElementById("orderModal")),await G()),document.getElementById("orderForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",K();const r=document.querySelector(".status-toggle-container"),t=document.getElementById("orderStatusBadge"),n=document.getElementById("orderModalLabel"),o=document.querySelector("#productsTable thead tr"),i=document.getElementById("addProduct"),s=document.getElementById("orderModal");if(s.dataset.mode=a,i&&(i.style.display="block"),a==="edit"&&e){r&&(r.style.display="block"),t&&(t.style.display="none"),n.textContent="Edit Pesanan Pembelian";const{data:l,error:d}=await v.from("pesanan_pembelian").select("status_pesanan").eq("id",e).single();!d&&l&&l.status_pesanan!=="dipesan"?o.innerHTML=`
                <th>Produk</th>
                <th>Varian</th>
                <th>Qty. Dipesan</th>
                <th>Qty. Diterima</th>
                <th>Qty. Rusak</th>
                <th>Harga Beli (satuan)</th>
                <th></th>
            `:o.innerHTML=`
                <th>Produk</th>
                <th>Varian</th>
                <th>Qty. Dipesan</th>
                <th></th>
            `,await z(e),document.getElementById("saveOrder").textContent="Update";const m=s.dataset.currentStatus;i&&(i.style.display=m==="dipesan"?"block":"none")}else r&&(r.style.display="none"),t&&(t.style.display="inline-block",t.textContent="draft",t.className=`badge bg-${q("dipesan")}`),n.textContent="Tambah Pesanan Pembelian",o.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th></th>
        `,s.removeAttribute("data-sale-id"),s.removeAttribute("data-current-status"),document.getElementById("saveOrder").textContent="Simpan";T.show()}async function z(a){try{const{data:e,error:r}=await v.from("pesanan_pembelian").select(`
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
            `).eq("id",a).single();if(r)throw r;const t=document.getElementById("orderModal");t.dataset.orderId=a,t.dataset.currentStatus=e.status_pesanan,document.getElementById("orderDate").value=e.tanggal_pesan?new Date(e.tanggal_pesan).toISOString().slice(0,16):"",document.getElementById("supplier").value=e.id_supplier;const n=document.querySelector("#productsTable tbody");n.innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",e.items.forEach(o=>{const i=V(o,e.status_pesanan);n.appendChild(i)}),await X(e),W(e.status_pesanan,e)}catch(e){throw console.error("Failed to load order:",e),g("Gagal memuat data pesanan","error"),e}}function K(){document.getElementById("addProduct").addEventListener("click",N),document.getElementById("saveOrder").addEventListener("click",async a=>{a.preventDefault();try{await J()}catch(e){console.error("Save failed:",e),g("Gagal menyimpan: "+e.message,"error")}}),document.getElementById("supplier").addEventListener("change",async function(){document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("orderModal").dataset.mode}),document.querySelector("#productsTable tbody").addEventListener("click",function(a){(a.target.classList.contains("remove-item")||a.target.classList.contains("remove-product"))&&a.target.closest("tr").remove()}),document.getElementById("orderModal").addEventListener("hidden.bs.modal",()=>{document.getElementById("orderForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="";const a=document.querySelector("#productsTable thead tr");a.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. dipesan</th>
            <th></th>
        `})}function W(a,e){var s,l,d,m,c,u;const r=document.getElementById("orderStatusBadge"),t=document.querySelectorAll("#orderStatusToggle .btn-status"),n={};a==="diterima"?(n.tanggalDiterima=((s=document.getElementById("tanggalDiterima"))==null?void 0:s.value)||"",n.lokasiPenerimaan=((l=document.getElementById("lokasiPenerimaan"))==null?void 0:l.value)||"",n.noSuratJalan=((d=document.getElementById("noSuratJalan"))==null?void 0:d.value)||""):a==="dibayar"&&(n.tanggalPembayaran=((m=document.getElementById("tanggalPembayaran"))==null?void 0:m.value)||"",n.totalDibayarkan=((c=document.getElementById("totalDibayarkan"))==null?void 0:c.value)||"",n.alatPembayaran=((u=document.getElementById("alatPembayaran"))==null?void 0:u.value)||"");const o=["dipesan","diterima","dibayar","selesai"],i=o.indexOf(a);t.forEach(y=>{y.classList.remove("active");const p=y.dataset.status,h=o.indexOf(p);p===a?(y.classList.add("active"),y.disabled=!1):y.disabled=h!==i+1}),B(a,n),t.forEach(y=>{y.addEventListener("click",function(){var _,f,E,I,L,P;if(this.disabled)return;const p=this.dataset.status;r.textContent=p,r.className=`badge bg-${q(p)}`;const h={};p==="diterima"?(h.tanggalDiterima=((_=document.getElementById("tanggalDiterima"))==null?void 0:_.value)||(e==null?void 0:e.tanggal_diterima)||"",h.lokasiPenerimaan=((f=document.getElementById("lokasiPenerimaan"))==null?void 0:f.value)||(e==null?void 0:e.lokasi_penerimaan)||"",h.noSuratJalan=((E=document.getElementById("noSuratJalan"))==null?void 0:E.value)||(e==null?void 0:e.no_surat_jalan)||""):p==="dibayar"&&(h.tanggalPembayaran=((I=document.getElementById("tanggalPembayaran"))==null?void 0:I.value)||(e==null?void 0:e.tanggal_pembayaran)||"",h.totalDibayarkan=((L=document.getElementById("totalDibayarkan"))==null?void 0:L.value)||(e==null?void 0:e.total_dibayarkan)||"",h.alatPembayaran=((P=document.getElementById("alatPembayaran"))==null?void 0:P.value)||(e==null?void 0:e.alat_pembayaran)||""),B(p,h);const b=o.indexOf(p);t.forEach($=>{const w=$.dataset.status,Q=o.indexOf(w);$.classList.remove("active"),w===p?($.classList.add("active"),$.disabled=!1):$.disabled=Q!==b+1})})})}async function B(a,e={}){const r=document.querySelector("#productsTable thead tr");a==="dipesan"?r.innerHTML=`
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
        `,document.querySelectorAll("#productsTable tbody tr").forEach(n=>{const o=n.querySelector(".quantity"),i=n.querySelector(".variant-select"),s=n.querySelector(".received-qty"),l=n.querySelector(".broken-qty"),d=n.querySelector(".purchase-price"),m=n.querySelector(".remove-item");if(o.readOnly=a!=="dipesan",i.disabled=a!=="dipesan",a!=="dipesan")if(!s&&!l&&!d){const c=n.querySelector("td:last-child"),u=document.createElement("td");u.innerHTML=`
                    <input type="number" class="form-control received-qty" min="0"
                           ${["dibayar","selesai"].includes(a)?"readonly":""}>
                `,n.insertBefore(u,c);const y=document.createElement("td");y.innerHTML=`
                    <input type="number" class="form-control broken-qty" min="0"
                           ${["dibayar","selesai"].includes(a)?"readonly":""}>
                `,n.insertBefore(y,c);const p=document.createElement("td");p.innerHTML=`
                    <input type="number" class="form-control purchase-price" min="0"
                           ${["dibayar","selesai"].includes(a)?"readonly":""}>
                `,n.insertBefore(p,c)}else s&&(s.readOnly=["dibayar","selesai"].includes(a)),l&&(l.readOnly=["dibayar","selesai"].includes(a)),d&&(d.readOnly=["dibayar","selesai"].includes(a));else[".received-qty",".broken-qty",".purchase-price"].forEach(c=>{const u=n.querySelector(c);u&&u.parentElement.remove()});m&&(m.disabled=["diterima","dibayar","selesai"].includes(a))}),document.getElementById("addProduct").style.display=a==="dipesan"?"block":"none";const t=document.getElementById("statusFieldsContainer");if(a==="diterima"){const n=await S();let o='<option value="" disabled selected>Pilih lokasi</option>';n.forEach(i=>{const s=e.lokasiPenerimaan&&e.lokasiPenerimaan===i.value?"selected":"",l=i.value.split("_").map(d=>d.charAt(0).toUpperCase()+d.slice(1)).join(" ");o+=`<option value="${i.value}" ${s}>${l}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="datetime-local" class="form-control" id="tanggalDiterima" 
                        value="${e.tanggalDiterima||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Lokasi Penerimaan</label>
                    <select class="form-select" id="lokasiPenerimaan">
                        ${o}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">No. Surat Jalan</label>
                    <input type="text" class="form-control" id="noSuratJalan" 
                        value="${e.noSuratJalan||""}">
                </div>
            </div>
        `}else if(a==="dibayar"){const n=await H();let o='<option value="" disabled selected>Pilih metode pembayaran</option>';n.forEach(i=>{const s=e.alatPembayaran===i.value?"selected":"",l=i.value.charAt(0).toUpperCase()+i.value.slice(1);o+=`<option value="${i.value}" ${s}>${l}</option>`}),t.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="datetime-local" class="form-control" id="tanggalPembayaran" 
                           value="${e.tanggalPembayaran||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${e.totalDibayarkan||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${o}
                    </select>
                </div>
            </div>
        `}else t.innerHTML=""}async function X(a){const e=document.getElementById("statusFieldsContainer");if(e.innerHTML="",a.status_pesanan==="diterima"){const r=await S();let t='<option value="" disabled selected>Pilih lokasi</option>';r.forEach(n=>{const o=a.lokasi_penerimaan&&a.lokasi_penerimaan===n.value?"selected":"",i=n.value.split("_").map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(" ");t+=`<option value="${n.value}" ${o}>${i}</option>`}),e.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="datetime-local" class="form-control" id="tanggalDiterima" 
                           value="${a.tanggal_diterima?new Date(a.tanggal_diterima).toISOString().slice(0,16):""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Lokasi Penerimaan</label>
                    <select class="form-select" id="lokasiPenerimaan">
                        ${t}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">No. Surat Jalan</label>
                    <input type="text" class="form-control" id="noSuratJalan" 
                           value="${a.no_surat_jalan||""}">
                </div>
            </div>
        `}else if(a.status_pesanan==="dibayar"){const r=await H();let t='<option value="" disabled selected>Pilih metode pembayaran</option>';r.forEach(n=>{const o=a.alat_pembayaran&&a.alat_pembayaran===n.value?"selected":"",i=n.value.charAt(0).toUpperCase()+n.value.slice(1);t+=`<option value="${n.value}" ${o}>${i}</option>`}),e.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="datetime-local" class="form-control" id="tanggalPembayaran" 
                           value="${a.tanggal_pembayaran?new Date(a.tanggal_pembayaran).toISOString().slice(0,16):""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${a.total_dibayarkan||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${t}
                    </select>
                </div>
            </div>
        `}}async function Z(){const a=document.querySelector("#history tbody");if(a){a.innerHTML=`
        <div class="text-center my-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Memuat riwayat pembelian...</p>
        </div>`;try{const{data:e,error:r}=await v.from("pesanan_pembelian").select(`
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
            `).eq("status_pesanan","selesai").order("tanggal_pesan",{ascending:!1});if(r)throw r;a.innerHTML="",e&&e.length>0?(e.forEach(t=>{const n=new Date(t.tanggal_pesan).toLocaleDateString("id-ID"),o=t.tanggal_diterima?new Date(t.tanggal_diterima).toLocaleDateString("id-ID"):"-",i=t.tanggal_pembayaran?new Date(t.tanggal_pembayaran).toLocaleDateString("id-ID"):"-",s=t.items.reduce((c,u)=>c+u.qty_dipesan,0),l=t.items.reduce((c,u)=>c+(u.qty_diterima||0),0),d="("+t.supplier.cp+")",m=document.createElement("tr");m.innerHTML=`
                    <td>${t.id}</td>
                    <td>${n}</td>
                    <td>${t.supplier.perusahaan||d}</td>
                    <td>${t.lokasi_penerimaan||"-"}</td>
                    <td>${s}</td>
                    <td>${l}</td>
                    <td>${o}</td>
                    <td>${D(t.total_dibayarkan)}</td>
                    <td>${i}</td>
                    <td>${t.alat_pembayaran||"-"}</td>
                    <td><button class="btn btn-sm btn-outline-primary detail-btn" data-order-id="${t.id}">Detail</button></td>
                `,a.appendChild(m)}),document.querySelectorAll(".detail-btn").forEach(t=>{t.addEventListener("click",async n=>{const o=n.target.dataset.orderId;await ee(o)})})):a.innerHTML=`
                <tr>
                    <td colspan="11" class="text-center text-muted">Tidak ada riwayat pesanan</td>
                </tr>
            `}catch(e){console.error("Error fetching history:",e),g("Gagal memuat riwayat pesanan","error")}}}async function ee(a){try{const{data:e,error:r}=await v.from("pesanan_pembelian").select(`
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
            `).eq("id",a).single();if(r)throw r;const t=s=>s?new Date(s).toLocaleDateString("id-ID"):"-",n=`
            <div class="modal fade" id="orderDetailModal" tabindex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="orderDetailModalLabel">Detail Pesanan #${e.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p><strong>Tanggal Pesan:</strong> ${t(e.tanggal_pesan)}</p>
                                    <p><strong>Supplier:</strong> ${e.supplier.perusahaan}</p>
                                    <p><strong>Lokasi Penerimaan:</strong> ${e.lokasi_penerimaan||"-"}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tanggal Diterima:</strong> ${t(e.tanggal_diterima)}</p>
                                    <p><strong>Total Dibayarkan:</strong> ${D(e.total_dibayarkan)}</p>
                                    <p><strong>Pembayaran:</strong> ${e.alat_pembayaran||"-"} (${t(e.tanggal_pembayaran)})</p>
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
                                        ${e.items.map(s=>`
                                            <tr>
                                                <td>${s.produk_varian.produk.nama}</td>
                                                <td>${s.produk_varian.varian||"-"}</td>
                                                <td>${s.qty_dipesan}</td>
                                                <td>${s.qty_diterima||0}</td>
                                                <td>${s.qty_dipesan-(s.qty_diterima||0)}</td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" class="text-end"><strong>Total:</strong></td>
                                            <td><strong>${e.items.reduce((s,l)=>s+l.qty_dipesan,0)}</strong></td>
                                            <td><strong>${e.items.reduce((s,l)=>s+(l.qty_diterima||0),0)}</strong></td>
                                            <td><strong>${e.items.reduce((s,l)=>s+(l.qty_dipesan-(l.qty_diterima||0)),0)}</strong></td>
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
        `,o=document.createElement("div");o.innerHTML=n,document.body.appendChild(o),new bootstrap.Modal(document.getElementById("orderDetailModal")).show(),document.getElementById("orderDetailModal").addEventListener("hidden.bs.modal",()=>{o.remove()})}catch(e){console.error("Error showing order details:",e),g("Gagal memuat detail pesanan","error")}}document.addEventListener("DOMContentLoaded",function(){const a=document.getElementById("pembelianTabs"),e=document.getElementById("addbtn"),r=document.getElementById("ongoing-tab"),t=document.getElementById("history-tab");a.addEventListener("click",function(o){o.target&&o.target.matches("#history-tab")?e.style.display="none":o.target&&o.target.matches("#ongoing-tab")&&(e.style.display="inline-block")}),n(),document.getElementById("addProduct").addEventListener("click",N),document.addEventListener("click",async o=>{if(o.target.closest(".cancel-order")){const i=o.target.closest(".cancel-order").dataset.orderId;if(confirm("Yakin ingin membatalkan pesanan ini?")){const{error:s}=await v.from("pesanan_pembelian").delete().eq("id",i);s||(g("Pesanan dibatalkan","success"),k())}}}),document.addEventListener("click",async o=>{if(o.target.closest(".complete-order")){const i=o.target.closest(".complete-order"),s=i.dataset.orderId,l=JSON.parse(i.dataset.items||"[]");try{console.log("Items data before processing:",l);for(const m of l)await M({variantId:m.variantId,type:"pembelian",id:s,quantity:m.receivedQty,price:m.price}),m.brokenQty>0&&await M({variantId:m.variantId,type:"penyesuaian_keluar",id:s,quantity:m.brokenQty,price:0});const{error:d}=await v.from("pesanan_pembelian").update({status_pesanan:"selesai"}).eq("id",s);if(d)throw d;g("Pesanan berhasil diselesaikan","success"),await k()}catch(d){console.error("Order processing failed:",d),g("Gagal menyelesaikan pesanan","error")}}});function n(){k(),e&&e.addEventListener("click",()=>O("add")),r&&r.addEventListener("click",k),t&&t.addEventListener("click",Z)}});const C=document.getElementById("orderModal");C.addEventListener("hidden.bs.modal",()=>{C.setAttribute("aria-hidden","true")});
