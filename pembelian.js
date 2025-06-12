import"./modulepreload-polyfill.js";import{n as U,p as N,d as R,u as V}from"./import.js";import{s as h}from"./db_conn.js";import{i as W,c as z}from"./auth.js";fetch("navbar.html").then(t=>t.text()).then(t=>{document.getElementById("navbar").innerHTML=t;const e=document.createElement("script");e.type="module",e.src=U,document.body.appendChild(e)}).catch(t=>console.error("Error loading navbar:",t));W();(async()=>await z())();let T;function M(t){return{dipesan:"secondary",diterima:"success",dibayar:"primary"}[t]||"secondary"}function q(t){return t?new Date(t).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"-"}function w(t){if(!t)return"";const e=new Date(t);return new Date(e.getTime()-e.getTimezoneOffset()*6e4).toISOString().slice(0,16)}function Q(t){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(t)}function v(t,e="success"){const r=document.getElementById("toastContainer");if(!r){console.error("Toast container not found!");return}const a=document.createElement("div");a.className=`toast align-items-center text-white bg-${e==="success"?"success":"danger"} border-0`,a.setAttribute("role","alert"),a.setAttribute("aria-live","assertive"),a.setAttribute("aria-atomic","true"),a.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${t}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,r.appendChild(a),new bootstrap.Toast(a,{autohide:!0,delay:3e3}).show(),a.addEventListener("hidden.bs.toast",()=>{a.remove()})}async function Y(t,e,r,a=null){const n=t.value;if(e.disabled=!0,e.innerHTML='<option value="" selected disabled>Memuat varian...</option>',!n){e.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>';return}try{const{data:s,error:i}=await h.from("produk_varian").select("id, varian, harga_standar").eq("id_produk",n).order("varian",{ascending:!0});if(i)throw i;e.innerHTML=`
            <option value="" ${a?"":"selected"} disabled>Pilih Varian</option>
            ${s.map(o=>`<option value="${o.id}" data-price="${o.harga_standar}"
                    ${a===o.id?"selected":""}>
                    ${o.varian}
                </option>`).join("")}
        `,e.disabled=!1}catch(s){console.error("Error loading variants:",s),e.innerHTML='<option value="" selected disabled>Error memuat varian</option>'}}async function K(){try{const t=document.getElementById("supplier");if(!t){console.error("Supplier select element not found!"),v("Elemen supplier tidak ditemukan","error");return}t.innerHTML='<option value="" disabled selected>Memuat supplier...</option>';const{data:e,error:r}=await h.from("supplier").select("id, perusahaan, cp");if(r)throw r;if(!e||e.length===0){v("Tidak ada data supplier","warning"),t.innerHTML='<option value="" disabled selected>Tidak ada supplier</option>';return}t.innerHTML='<option value="" disabled selected>Pilih Supplier</option>',e.forEach(a=>{const n=document.createElement("option");n.value=a.id,n.textContent=`${a.perusahaan} (Contact Person: ${a.cp})`,t.appendChild(n)})}catch(t){console.error("Error loading suppliers:",t);const e=document.getElementById("supplier");e.innerHTML='<option value="" disabled selected>Error loading suppliers</option>',v("Gagal memuat daftar supplier: "+t.message,"error")}}async function P(){try{const{data:t,error:e}=await h.rpc("get_enum_values",{enum_name:"lokasi_penerimaan"});return e?(console.error("Error loading locations:",e),[{value:"gudang"},{value:"toko"}]):t}catch(t){return console.error("Error:",t),[{value:"gudang"},{value:"toko"}]}}async function C(){try{const{data:t,error:e}=await h.rpc("get_enum_values",{enum_name:"alat_pembayaran"});return e?(console.error("Error loading payment methods:",e),[{value:"tunai"},{value:"transfer"}]):t}catch(t){return console.error("Error:",t),[{value:"tunai"},{value:"transfer"}]}}function A(){var s,i,o,d,l,u;const t=document.getElementById("orderModal").dataset.mode,e=t==="add";let r;if(e)r="draft";else{const c=document.querySelector("#orderStatusToggle .btn-status.active");r=(c==null?void 0:c.dataset.status)||"dipesan"}const a=c=>c?new Date(c).toISOString():null,n={orderDate:a(document.getElementById("orderDate").value),supplierId:document.getElementById("supplier").value,status:r,items:Array.from(document.querySelectorAll("#productsTable tbody tr")).map(c=>{var y,p,f;const b={variantId:c.querySelector(".variant-select").value,quantity:parseInt(c.querySelector(".quantity").value)||0,rowId:c.dataset.itemId||null};return t==="edit"&&r!=="dipesan"&&(b.receivedQty=parseInt((y=c.querySelector(".received-qty"))==null?void 0:y.value)||0,b.brokenQty=parseInt((p=c.querySelector(".broken-qty"))==null?void 0:p.value)||0,b.purchasePrice=parseFloat((f=c.querySelector(".purchase-price"))==null?void 0:f.value)||0),b})};return t==="edit"&&(r==="diterima"?(n.receivedDate=a((s=document.getElementById("tanggalDiterima"))==null?void 0:s.value),n.receivingLocation=(i=document.getElementById("lokasiPenerimaan"))==null?void 0:i.value,n.deliveryNoteNumber=(o=document.getElementById("noSuratJalan"))==null?void 0:o.value):r==="dibayar"&&(n.paymentDate=a((d=document.getElementById("tanggalPembayaran"))==null?void 0:d.value),n.paymentAmount=parseFloat((l=document.getElementById("totalDibayarkan"))==null?void 0:l.value)||0,n.paymentMethod=(u=document.getElementById("alatPembayaran"))==null?void 0:u.value)),n}async function X(){const t=document.getElementById("orderModal").dataset.mode;try{t==="edit"?await ee():await Z(),T.hide(),await I()}catch(e){console.error("Save failed:",e),v("Gagal menyimpan pesanan","error")}}async function Z(){const t=A();try{const{data:e,error:r}=await h.from("pesanan_pembelian").insert({tanggal_pesan:t.orderDate,id_supplier:t.supplierId,status_pesanan:"dipesan"}).select().single();if(r)throw r;const{error:a}=await h.from("item_pesanan_pembelian").insert(t.items.map(n=>({id_beli:e.id,id_varian:n.variantId,qty_dipesan:n.quantity,qty_diterima:null,qty_rusak:null,harga_beli:null})));if(a)throw a;v("Pesanan baru berhasil dibuat","success"),await I()}catch(e){console.error("Create order error:",e),v("Gagal membuat pesanan: "+e.message,"error")}}async function ee(){const t=document.getElementById("orderModal").dataset.orderId,e=A();try{const r={tanggal_pesan:e.orderDate,id_supplier:e.supplierId,status_pesanan:e.status};e.status==="diterima"?(r.tanggal_diterima=e.receivedDate,r.lokasi_penerimaan=e.receivingLocation,r.no_surat_jalan=e.deliveryNoteNumber):e.status==="dibayar"&&(r.tanggal_pembayaran=e.paymentDate,r.total_dibayarkan=e.paymentAmount,r.alat_pembayaran=e.paymentMethod);const{error:a}=await h.from("pesanan_pembelian").update(r).eq("id",t);if(a)throw a;if(e.status==="diterima")for(const i of e.items){if(i.receivedQty===void 0||i.brokenQty===void 0)throw new Error('All items must have received and broken quantities when status is "diterima"');const o=Number(i.receivedQty)||0,d=Number(i.brokenQty)||0,l=o-d;if(isNaN(o)||isNaN(d))throw new Error("Quantities must be valid numbers");let u=l;if(i.rowId){const{data:c,error:b}=await h.from("item_pesanan_pembelian").select("qty_diterima, qty_rusak").eq("id",i.rowId).single();if(b)throw new Error(`Failed to fetch previous item data: ${b.message}`);const y=Number(c.qty_diterima)||0,p=Number(c.qty_rusak)||0,f=y-p;u=l-f}if(u!==0&&await V(i.variantId,u,"pembelian")===null)throw new Error(`Failed to update stock for variant ${i.variantId}`)}const n=[],s=[];if(e.items.forEach(i=>{const o={id_varian:i.variantId,qty_dipesan:i.quantity};e.status!=="dipesan"&&(o.qty_diterima=i.receivedQty??null,o.qty_rusak=i.brokenQty??null,o.harga_beli=i.purchasePrice??null),i.rowId?n.push({...o,id:i.rowId}):s.push({...o,id_beli:t})}),n.length>0){const{error:i}=await h.from("item_pesanan_pembelian").upsert(n);if(i)throw i}if(s.length>0){const{error:i}=await h.from("item_pesanan_pembelian").insert(s);if(i)throw i}v("Pesanan berhasil diperbarui","success"),await I()}catch(r){console.error("Update order error:",r),v("Gagal memperbarui pesanan: "+r.message,"error")}}async function G(t=null,e=null){const r=document.querySelector("#productsTable tbody"),a=document.getElementById("supplier").value;if(!a){v("Pilih supplier terlebih dahulu","warning");return}try{const{data:n,error:s}=await h.from("produk").select("id, nama").eq("id_supplier",a).order("nama",{ascending:!0});if(s)throw s;const i=document.createElement("tr");i.innerHTML=`
            <td>
                <select class="form-select product-select">
                    <option value="" selected disabled>Pilih Produk</option>
                    ${n.map(l=>`<option value="${l.id}" ${t===l.id?"selected":""}>
                            ${l.nama}
                        </option>`).join("")}
                </select>
            </td>
            <td>
                <select class="form-select variant-select" ${t?"":"disabled"}>
                    ${t?'<option value="" selected disabled>Memuat varian...</option>':'<option value="" selected disabled>Pilih Produk Dulu</option>'}
                </select>
            </td>
            <td>
                <input type="number" class="form-control quantity" min="1" value="">
            </td>
            <td>
                <button class="btn btn-danger btn-sm remove-product">×</button>
            </td>
        `,r.appendChild(i);const o=i.querySelector(".product-select"),d=i.querySelector(".variant-select");o.addEventListener("change",async function(){if(!this.value){d.innerHTML='<option value="" selected disabled>Pilih Produk Dulu</option>',d.disabled=!0;return}await Y(o,d,i,e)}),t&&o.dispatchEvent(new Event("change"))}catch(n){console.error("Error adding product row:",n),v("Gagal menambahkan produk","error")}}function te(t,e){const r=document.createElement("tr");r.dataset.itemId=t.id;const a=["diterima","dibayar","selesai"].includes(e);return r.innerHTML=`
        <td>
            <select class="form-select product-select" disabled>
                <option value="${t.produk_varian.id}" selected>
                    ${t.produk_varian.produk.nama}
                </option>
            </select>
        </td>
        <td>
            <select class="form-select variant-select" ${e!=="dipesan"?"disabled":""}>
                <option value="${t.produk_varian.id}" selected>
                    ${t.produk_varian.varian}
                </option>
            </select>
        </td>
        <td>
            <input type="number" class="form-control quantity" 
                   value="${t.qty_dipesan}" min="1" 
                   ${e!=="dipesan"?"readonly":""}>
        </td>
        ${e!=="dipesan"?`<td>
            <input type="number" class="form-control received-qty" 
                   value="${t.qty_diterima||0}" min="0"
                   ${["dibayar","selesai"].includes(e)?"readonly":""}>
        </td>`:""}
        ${e!=="dipesan"?`<td>
                <input type="number" class="form-control broken-qty" 
                       value="${t.qty_rusak||0}" min="0"
                       ${["dibayar","selesai"].includes(e)?"readonly":""}>
            </td>`:""}
        ${e!=="dipesan"?`<td>
                <input type="number" class="form-control purchase-price" 
                        value="${t.harga_beli||0}" min="0"
                        ${["dibayar","selesai"].includes(e)?"readonly":""}>
            </td>`:""}
        <td>
            <button class="btn btn-danger btn-sm remove-item" 
                    ${a?"disabled":""}>×</button>
        </td>
    `,r}function ae(t){const e=document.createElement("div");e.className="col-md-6 col-lg-4 mb-3";const r=document.createElement("div");r.className="card h-100";const a=document.createElement("div");a.className="card-header d-flex justify-content-between align-items-center";const n=document.createElement("h5");n.className="mb-0",n.textContent=`#${t.id}`;const s=document.createElement("div");s.className="d-flex align-items-center gap-2";const i=document.createElement("span");i.className=`order-status badge bg-${M(t.status_pesanan)}`,i.textContent=t.status_pesanan;const o=document.createElement("button");o.className="btn btn-sm btn-outline-secondary edit-order",o.innerHTML='<i class="bi bi-pencil"></i>',o.addEventListener("click",g=>{g.stopPropagation(),j("edit",t.id)}),a.appendChild(n),s.appendChild(i),s.appendChild(o),a.appendChild(s);const d=document.createElement("div");d.className="card-body";const l=document.createElement("p");l.className="mb-1",l.innerHTML=`<strong>Tanggal Pemesanan:</strong> ${q(t.tanggal_pesan)}`;const u=document.createElement("p");u.className="mb-1",u.innerHTML=`<strong>Supplier:</strong> ${t.supplier.perusahaan} (Contact Person: ${t.supplier.cp})`;const c=document.createElement("p");c.className="mb-1 mt-1 fw-bold",c.textContent="Items:";const b=document.createElement("ul");b.className="list-unstyled mb-0",t.items.forEach(g=>{var E,k,L;const _=document.createElement("li");_.className="d-flex justify-content-between",_.innerHTML=`
            <span>${((k=(E=g.produk_varian)==null?void 0:E.produk)==null?void 0:k.nama)||"Produk"} - ${((L=g.produk_varian)==null?void 0:L.varian)||""}</span>
            <span>${g.qty_dipesan}</span>
        `,b.appendChild(_)}),d.appendChild(l),d.appendChild(u),d.appendChild(c),d.appendChild(b);const y=document.createElement("div");y.className="card-footer bg-transparent border-top-0";const p=document.createElement("div");p.className="d-flex justify-content-between";const f=document.createElement("button");if(f.className="btn btn-sm",t.status_pesanan==="dipesan"){const g=document.createElement("button");g.className="btn btn-sm btn-outline-danger ms-2 cancel-order",g.innerHTML='<i class="bi bi-x-circle"></i> Batalkan',g.dataset.orderId=t.id,y.appendChild(g)}else if(t.status_pesanan==="dibayar"){const g=document.createElement("button");g.className="btn btn-sm btn-dark ms-2 complete-order",g.innerHTML='<i class="bi bi-check-circle"></i> Selesaikan',g.dataset.orderId=t.id,g.dataset.receivedDate=t.tanggal_diterima||new Date().toISOString();const _=t.items.map(E=>{var k;return{variantId:((k=E.produk_varian)==null?void 0:k.id)||"",receivedQty:E.qty_diterima||0,brokenQty:E.qty_rusak||0,price:E.harga_beli||0}});g.dataset.items=JSON.stringify(_),y.appendChild(g)}return p.appendChild(f),y.appendChild(p),r.appendChild(a),r.appendChild(d),r.appendChild(y),e.appendChild(r),e}async function I(){const t=document.getElementById("ongoingOrdersContainer");if(t)try{t.innerHTML=`
            <div class="col-12 text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat pesanan...
            </div>
        `;const{data:e,error:r}=await h.from("pesanan_pembelian").select(`
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
            `).neq("status_pesanan","selesai").order("id",{ascending:!1});if(r)throw r;t.innerHTML="";const a=document.createElement("div");a.className="row mt-3",e&&e.length>0?e.forEach(n=>{a.appendChild(ae(n))}):a.innerHTML='<div class="col-12 text-center text-muted">Tidak ada pesanan aktif</div>',t.appendChild(a)}catch(e){console.error("Error fetching orders:",e),v("Gagal memuat daftar pesanan","error")}}async function j(t="add",e=null){T||(T=new bootstrap.Modal(document.getElementById("orderModal")),await K()),document.getElementById("orderForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",re();const r=document.querySelector(".status-toggle-container"),a=document.getElementById("orderStatusBadge"),n=document.getElementById("orderModalLabel"),s=document.querySelector("#productsTable thead tr"),i=document.getElementById("addProduct"),o=document.getElementById("orderModal");if(o.dataset.mode=t,i&&(i.style.display="block"),t==="edit"&&e){r&&(r.style.display="block"),a&&(a.style.display="none"),n.textContent="Edit Pesanan Pembelian";const{data:d,error:l}=await h.from("pesanan_pembelian").select("status_pesanan").eq("id",e).single();!l&&d&&d.status_pesanan!=="dipesan"?s.innerHTML=`
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
            `,await ne(e),document.getElementById("saveOrder").textContent="Update";const u=o.dataset.currentStatus;i&&(i.style.display=u==="dipesan"?"block":"none")}else r&&(r.style.display="none"),a&&(a.style.display="inline-block",a.textContent="draft",a.className=`badge bg-${M("dipesan")}`),n.textContent="Tambah Pesanan Pembelian",s.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th></th>
        `,o.removeAttribute("data-sale-id"),o.removeAttribute("data-current-status"),document.getElementById("saveOrder").textContent="Simpan";T.show()}async function ne(t){try{const{data:e,error:r}=await h.from("pesanan_pembelian").select(`
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
            `).eq("id",t).single();if(r)throw r;const a=document.getElementById("orderModal");a.dataset.orderId=t,a.dataset.currentStatus=e.status_pesanan,document.getElementById("orderDate").value=w(e.tanggal_pesan),document.getElementById("supplier").value=e.id_supplier;const n=document.querySelector("#productsTable tbody");n.innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="",e.items.forEach(s=>{const i=te(s,e.status_pesanan);n.appendChild(i)}),await oe(e),ie(e.status_pesanan,e)}catch(e){throw console.error("Failed to load order:",e),v("Gagal memuat data pesanan","error"),e}}function re(){const t=document.getElementById("addProduct"),e=document.getElementById("saveOrder"),r=document.getElementById("supplier");t.replaceWith(t.cloneNode(!0)),e.replaceWith(e.cloneNode(!0)),r.replaceWith(r.cloneNode(!0)),document.getElementById("addProduct").addEventListener("click",G),document.getElementById("saveOrder").addEventListener("click",async a=>{a.preventDefault();try{await X()}catch(n){console.error("Save failed:",n),v("Gagal menyimpan: "+n.message,"error")}}),document.getElementById("supplier").addEventListener("change",async function(){document.querySelector("#productsTable tbody").innerHTML=""}),document.querySelector("#productsTable tbody").addEventListener("click",function(a){(a.target.classList.contains("remove-item")||a.target.classList.contains("remove-product"))&&a.target.closest("tr").remove()}),document.getElementById("orderModal").addEventListener("hidden.bs.modal",()=>{document.getElementById("orderForm").reset(),document.querySelector("#productsTable tbody").innerHTML="",document.getElementById("statusFieldsContainer").innerHTML="";const a=document.querySelector("#productsTable thead tr");a.innerHTML=`
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. dipesan</th>
            <th></th>
        `})}function ie(t,e){var o,d,l,u,c,b;const r=document.getElementById("orderStatusBadge"),a=document.querySelectorAll("#orderStatusToggle .btn-status"),n={};t==="diterima"?(n.tanggalDiterima=((o=document.getElementById("tanggalDiterima"))==null?void 0:o.value)||"",n.lokasiPenerimaan=((d=document.getElementById("lokasiPenerimaan"))==null?void 0:d.value)||"",n.noSuratJalan=((l=document.getElementById("noSuratJalan"))==null?void 0:l.value)||""):t==="dibayar"&&(n.tanggalPembayaran=((u=document.getElementById("tanggalPembayaran"))==null?void 0:u.value)||"",n.totalDibayarkan=((c=document.getElementById("totalDibayarkan"))==null?void 0:c.value)||"",n.alatPembayaran=((b=document.getElementById("alatPembayaran"))==null?void 0:b.value)||"");const s=["dipesan","diterima","dibayar","selesai"],i=s.indexOf(t);a.forEach(y=>{y.classList.remove("active");const p=y.dataset.status,f=s.indexOf(p);p===t?(y.classList.add("active"),y.disabled=!1):y.disabled=f!==i+1}),O(t,n),a.forEach(y=>{y.addEventListener("click",function(){var _,E,k,L,D,H;if(this.disabled)return;const p=this.dataset.status;r.textContent=p,r.className=`badge bg-${M(p)}`;const f={};p==="diterima"?(f.tanggalDiterima=((_=document.getElementById("tanggalDiterima"))==null?void 0:_.value)||(e==null?void 0:e.tanggal_diterima)||"",f.lokasiPenerimaan=((E=document.getElementById("lokasiPenerimaan"))==null?void 0:E.value)||(e==null?void 0:e.lokasi_penerimaan)||"",f.noSuratJalan=((k=document.getElementById("noSuratJalan"))==null?void 0:k.value)||(e==null?void 0:e.no_surat_jalan)||""):p==="dibayar"&&(f.tanggalPembayaran=((L=document.getElementById("tanggalPembayaran"))==null?void 0:L.value)||(e==null?void 0:e.tanggal_pembayaran)||"",f.totalDibayarkan=((D=document.getElementById("totalDibayarkan"))==null?void 0:D.value)||(e==null?void 0:e.total_dibayarkan)||"",f.alatPembayaran=((H=document.getElementById("alatPembayaran"))==null?void 0:H.value)||(e==null?void 0:e.alat_pembayaran)||""),O(p,f);const g=s.indexOf(p);a.forEach(B=>{const x=B.dataset.status,J=s.indexOf(x);B.classList.remove("active"),x===p?(B.classList.add("active"),B.disabled=!1):B.disabled=J!==g+1})})})}async function O(t,e={}){const r=document.querySelector("#productsTable thead tr");t==="dipesan"?r.innerHTML=`
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
        `,document.querySelectorAll("#productsTable tbody tr").forEach(n=>{const s=n.querySelector(".quantity"),i=n.querySelector(".variant-select"),o=n.querySelector(".received-qty"),d=n.querySelector(".broken-qty"),l=n.querySelector(".purchase-price"),u=n.querySelector(".remove-item");if(s.readOnly=t!=="dipesan",i.disabled=t!=="dipesan",t!=="dipesan")if(!o&&!d&&!l){const c=n.querySelector("td:last-child"),b=document.createElement("td");b.innerHTML=`
                    <input type="number" class="form-control received-qty" min="0"
                           ${["dibayar","selesai"].includes(t)?"readonly":""}>
                `,n.insertBefore(b,c);const y=document.createElement("td");y.innerHTML=`
                    <input type="number" class="form-control broken-qty" min="0"
                           ${["dibayar","selesai"].includes(t)?"readonly":""}>
                `,n.insertBefore(y,c);const p=document.createElement("td");p.innerHTML=`
                    <input type="number" class="form-control purchase-price" min="0"
                           ${["dibayar","selesai"].includes(t)?"readonly":""}>
                `,n.insertBefore(p,c)}else o&&(o.readOnly=["dibayar","selesai"].includes(t)),d&&(d.readOnly=["dibayar","selesai"].includes(t)),l&&(l.readOnly=["dibayar","selesai"].includes(t));else[".received-qty",".broken-qty",".purchase-price"].forEach(c=>{const b=n.querySelector(c);b&&b.parentElement.remove()});u&&(u.disabled=["diterima","dibayar","selesai"].includes(t))}),document.getElementById("addProduct").style.display=t==="dipesan"?"block":"none";const a=document.getElementById("statusFieldsContainer");if(t==="diterima"){const n=await P();let s='<option value="" disabled selected>Pilih lokasi</option>';n.forEach(i=>{const o=e.lokasiPenerimaan&&e.lokasiPenerimaan===i.value?"selected":"",d=i.value.split("_").map(l=>l.charAt(0).toUpperCase()+l.slice(1)).join(" ");s+=`<option value="${i.value}" ${o}>${d}</option>`}),a.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="datetime-local" class="form-control" id="tanggalDiterima" 
                        value="${e.tanggalDiterima||""}">
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
                        value="${e.noSuratJalan||""}">
                </div>
            </div>
        `}else if(t==="dibayar"){const n=await C();let s='<option value="" disabled selected>Pilih metode pembayaran</option>';n.forEach(i=>{const o=e.alatPembayaran===i.value?"selected":"",d=i.value.charAt(0).toUpperCase()+i.value.slice(1);s+=`<option value="${i.value}" ${o}>${d}</option>`}),a.innerHTML=`
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
                        ${s}
                    </select>
                </div>
            </div>
        `}else a.innerHTML=""}async function oe(t){const e=document.getElementById("statusFieldsContainer");if(e.innerHTML="",t.status_pesanan==="diterima"){const r=await P();let a='<option value="" disabled selected>Pilih lokasi</option>';r.forEach(n=>{const s=t.lokasi_penerimaan&&t.lokasi_penerimaan===n.value?"selected":"",i=n.value.split("_").map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" ");a+=`<option value="${n.value}" ${s}>${i}</option>`}),e.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="datetime-local" class="form-control" id="tanggalDiterima" 
                           value="${w(t.tanggal_diterima)}">
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
                           value="${t.no_surat_jalan||""}">
                </div>
            </div>
        `}else if(t.status_pesanan==="dibayar"){const r=await C();let a='<option value="" disabled selected>Pilih metode pembayaran</option>';r.forEach(n=>{const s=t.alat_pembayaran&&t.alat_pembayaran===n.value?"selected":"",i=n.value.charAt(0).toUpperCase()+n.value.slice(1);a+=`<option value="${n.value}" ${s}>${i}</option>`}),e.innerHTML=`
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="datetime-local" class="form-control" id="tanggalPembayaran" 
                           value="${w(t.tanggal_pembayaran)}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${t.total_dibayarkan||""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${a}
                    </select>
                </div>
            </div>
        `}}async function S(t=null,e=null,r=null,a=null,n=null){const s=document.querySelector("#history tbody");if(s){s.innerHTML=`
        <tr>
            <td colspan="11" class="text-center my-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Memuat riwayat pembelian...</p>
            </td>
        </tr>`;try{let i=h.from("pesanan_pembelian").select(`
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
            `).eq("status_pesanan","selesai").order("tanggal_pesan",{ascending:!1});t&&e&&(i=i.gte("tanggal_pesan",t).lte("tanggal_pesan",e)),r&&(i=i.eq("id_supplier",r)),a&&(i=i.eq("alat_pembayaran",a)),n&&(i=i.eq("lokasi_penerimaan",n));const{data:o,error:d}=await i;if(d)throw d;s.innerHTML="",o&&o.length>0?(o.forEach(l=>{const u=q(l.tanggal_pesan),c=l.tanggal_diterima?q(l.tanggal_diterima):"-",b=l.tanggal_pembayaran?q(l.tanggal_pembayaran):"-",y=l.items.reduce((_,E)=>_+E.qty_dipesan,0),p=l.items.reduce((_,E)=>_+(E.qty_diterima||0),0),f="("+l.supplier.cp+")",g=document.createElement("tr");g.innerHTML=`
                    <td>${l.id}</td>
                    <td>${u}</td>
                    <td>${l.supplier.perusahaan||f}</td>
                    <td>${l.lokasi_penerimaan||"-"}</td>
                    <td>${y}</td>
                    <td>${p}</td>
                    <td>${c}</td>
                    <td>${Q(l.total_dibayaran)}</td>
                    <td>${b}</td>
                    <td>${l.alat_pembayaran||"-"}</td>
                    <td><button class="btn btn-sm btn-outline-primary detail-btn" data-order-id="${l.id}">Detail</button></td>
                `,s.appendChild(g)}),document.querySelectorAll(".detail-btn").forEach(l=>{l.addEventListener("click",async u=>{const c=u.target.dataset.orderId;await se(c)})})):s.innerHTML=`
                <tr>
                    <td colspan="11" class="text-center text-muted">Tidak ada riwayat pesanan</td>
                </tr>
            `}catch(i){console.error("Error fetching history:",i),v("Gagal memuat riwayat pesanan","error")}}}async function se(t){try{const{data:e,error:r}=await h.from("pesanan_pembelian").select(`
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
            `).eq("id",t).single();if(r)throw r;const a=o=>o?new Date(o).toLocaleDateString("id-ID"):"-",n=`
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
                                    <p><strong>Tanggal Pesan:</strong> ${a(e.tanggal_pesan)}</p>
                                    <p><strong>Supplier:</strong> ${e.supplier.perusahaan}</p>
                                    <p><strong>Lokasi Penerimaan:</strong> ${e.lokasi_penerimaan||"-"}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tanggal Diterima:</strong> ${a(e.tanggal_diterima)}</p>
                                    <p><strong>Total Dibayarkan:</strong> ${Q(e.total_dibayarkan)}</p>
                                    <p><strong>Pembayaran:</strong> ${e.alat_pembayaran||"-"} (${a(e.tanggal_pembayaran)})</p>
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
                                        ${e.items.map(o=>`
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
                                            <td><strong>${e.items.reduce((o,d)=>o+d.qty_dipesan,0)}</strong></td>
                                            <td><strong>${e.items.reduce((o,d)=>o+(d.qty_diterima||0),0)}</strong></td>
                                            <td><strong>${e.items.reduce((o,d)=>o+(d.qty_dipesan-(d.qty_diterima||0)),0)}</strong></td>
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
        `,s=document.createElement("div");s.innerHTML=n,document.body.appendChild(s),new bootstrap.Modal(document.getElementById("orderDetailModal")).show(),document.getElementById("orderDetailModal").addEventListener("hidden.bs.modal",()=>{s.remove()})}catch(e){console.error("Error showing order details:",e),v("Gagal memuat detail pesanan","error")}}const m={type:null,date:{start:null,end:null},supplier:null,payment:null,location:null};function le(){var t,e,r,a,n,s,i;document.querySelectorAll('input[name="filterGroup"]').forEach(o=>{o.addEventListener("click",function(d){if(this.checked&&m.type===this.value){this.checked=!1,$();return}m.type=this.value;const l=document.getElementById("filterCollapse"),u=bootstrap.Collapse.getInstance(l);!u||l.classList.contains("collapsing")?new bootstrap.Collapse(l,{toggle:!0}):l.classList.contains("collapse")&&u.show(),de()})}),(t=document.getElementById("applyFilter"))==null||t.addEventListener("click",pe),(e=document.getElementById("resetFilter"))==null||e.addEventListener("click",$),(r=document.getElementById("startDate"))==null||r.addEventListener("change",function(){m.date.start=this.value}),(a=document.getElementById("endDate"))==null||a.addEventListener("change",function(){m.date.end=this.value}),(n=document.getElementById("supplierSelect"))==null||n.addEventListener("change",function(){m.supplier=this.value}),(s=document.getElementById("paymentSelect"))==null||s.addEventListener("change",function(){m.payment=this.value}),(i=document.getElementById("locationSelect"))==null||i.addEventListener("change",function(){m.location=this.value}),ce(),ue(),me()}function de(){switch(document.querySelectorAll("#filterOptionsContainer > .row").forEach(t=>{t.classList.add("d-none")}),m.type){case"date":document.getElementById("dateFilter").classList.remove("d-none");break;case"supplier":document.getElementById("supplierFilter").classList.remove("d-none");break;case"payment":document.getElementById("paymentFilter").classList.remove("d-none");break;case"location":document.getElementById("locationFilter").classList.remove("d-none");break}document.getElementById("filterCard").classList.remove("d-none")}async function ce(){try{const{data:t,error:e}=await h.from("supplier").select("id, perusahaan").order("perusahaan",{ascending:!0});if(e)throw e;const r=document.getElementById("supplierSelect");r.innerHTML='<option value="">Semua Supplier</option>',t.forEach(a=>{const n=document.createElement("option");n.value=a.id,n.textContent=a.perusahaan,r.appendChild(n)})}catch(t){console.error("Error loading suppliers:",t),v("Gagal memuat daftar supplier","error")}}async function ue(){try{const t=await C(),e=document.getElementById("paymentSelect");e.innerHTML='<option value="">Semua Metode</option>',t.forEach(r=>{const a=document.createElement("option");a.value=r.value;const n=r.value.charAt(0).toUpperCase()+r.value.slice(1);a.textContent=n,e.appendChild(a)})}catch(t){console.error("Error loading payment methods:",t),v("Gagal memuat metode pembayaran","error");const e=document.getElementById("paymentSelect");e.innerHTML=`
            <option value="">Semua Metode</option>
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer</option>
        `}}async function me(){try{const t=await P(),e=document.getElementById("locationSelect");e.innerHTML='<option value="">Semua Lokasi</option>',t.forEach(r=>{const a=document.createElement("option");a.value=r.value;const n=r.value.charAt(0).toUpperCase()+r.value.slice(1);a.textContent=n,e.appendChild(a)})}catch(t){console.error("Error loading locations:",t),v("Gagal memuat daftar lokasi","error");const e=document.getElementById("locationSelect");e.innerHTML=`
            <option value="">Semua Lokasi</option>
            <option value="gudang">Gudang</option>
            <option value="toko">Toko</option>
        `}}function pe(){switch(m.type){case"date":m.date.start=document.getElementById("startDate").value,m.date.end=document.getElementById("endDate").value;break;case"supplier":m.supplier=document.getElementById("supplierSelect").value;break;case"payment":m.payment=document.getElementById("paymentSelect").value;break;case"location":m.location=document.getElementById("locationSelect").value;break}ye()}async function ye(){try{const t=m.type==="date"?m.date.start:null,e=m.type==="date"?m.date.end:null,r=m.type==="supplier"?m.supplier:null,a=m.type==="payment"?m.payment:null,n=m.type==="location"?m.location:null;await S(t,e,r,a,n)}catch(t){console.error("Error filtering history:",t),v("Gagal memfilter riwayat","error")}}function $(){document.querySelectorAll('input[name="filterGroup"]').forEach(r=>{r.checked=!1}),m.type=null,m.date={start:null,end:null},m.supplier=null,m.payment=null,m.location=null,document.getElementById("startDate").value="",document.getElementById("endDate").value="",document.getElementById("supplierSelect").value="",document.getElementById("paymentSelect").value="",document.getElementById("locationSelect").value="",document.querySelectorAll("#filterOptionsContainer > .row").forEach(r=>{r.classList.add("d-none")});const t=document.getElementById("filterCollapse"),e=bootstrap.Collapse.getInstance(t);e&&!t.classList.contains("collapse")&&e.hide(),S()}document.addEventListener("DOMContentLoaded",async()=>{const t=document.getElementById("pembelianTabs"),e=document.getElementById("ongoing-tab"),r=document.getElementById("history-tab"),a=document.getElementById("addbtn");t.addEventListener("click",function(s){s.target&&s.target.matches("#history-tab")?a.style.display="none":s.target&&s.target.matches("#ongoing-tab")&&(a.style.display="inline-block")}),await n(),document.getElementById("addProduct").addEventListener("click",G),document.addEventListener("click",async s=>{if(s.target.closest(".cancel-order")){const i=s.target.closest(".cancel-order").dataset.orderId;if(confirm("Yakin ingin membatalkan pesanan ini?")){const{error:o}=await h.from("pesanan_pembelian").delete().eq("id",i);o||(v("Pesanan dibatalkan","success"),I())}}}),document.addEventListener("click",async s=>{if(s.target.closest(".complete-order")){const i=s.target.closest(".complete-order"),o=i.dataset.orderId,d=i.dataset.receivedDate,l=JSON.parse(i.dataset.items||"[]");try{console.log("Items data before processing:",l);for(const c of l)await N({variantId:c.variantId,type:"pembelian",id:o,quantity:c.receivedQty,price:c.price,date:d}),c.brokenQty>0&&await N({variantId:c.variantId,type:"penyesuaian_keluar",id:o,quantity:c.brokenQty,price:0});const{error:u}=await h.from("pesanan_pembelian").update({status_pesanan:"selesai"}).eq("id",o);if(u)throw u;v("Pesanan berhasil diselesaikan","success"),await I()}catch(u){console.error("Order processing failed:",u),v("Gagal menyelesaikan pesanan","error")}}});async function n(){I(),await R(),a&&a.addEventListener("click",()=>j("add")),e&&e.addEventListener("click",I),r&&r.addEventListener("click",()=>{le(),$(),S()})}});const F=document.getElementById("orderModal");F.addEventListener("hidden.bs.modal",()=>{F.setAttribute("aria-hidden","true")});
