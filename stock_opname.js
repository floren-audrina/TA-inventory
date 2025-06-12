import"./modulepreload-polyfill.js";import{n as G,d as J,p as R}from"./import.js";import{s as p}from"./db_conn.js";import{i as F,c as U}from"./auth.js";fetch("navbar.html").then(e=>e.text()).then(e=>{document.getElementById("navbar").innerHTML=e;const t=document.createElement("script");t.type="module",t.src=G,document.body.appendChild(t)}).catch(e=>console.error("Error loading navbar:",e));F();(async()=>await U())();let L;const I=new Set;function A(e){const t=e.getTimezoneOffset()*6e4;return new Date(e.getTime()-t).toISOString().slice(0,16)}function C(e){return e?new Date(e).toISOString():null}function S(e){return e.toLocaleString("id-ID",{timeZone:"Asia/Jakarta",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}function O(e){return e.toLocaleDateString("id-ID",{timeZone:"Asia/Jakarta"})}function g(e,t="success"){const a=document.getElementById("toastContainer");if(!a){console.error("Toast container not found!");return}const n=document.createElement("div");n.className=`toast align-items-center text-white bg-${t==="success"?"success":"danger"} border-0`,n.setAttribute("role","alert"),n.setAttribute("aria-live","assertive"),n.setAttribute("aria-atomic","true"),n.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,a.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>{n.remove()})}function D(e){switch(e){case"sesuai":return"bg-success";case"tidak_sesuai":return"bg-warning";case"disesuaikan":return"bg-info";default:return"bg-secondary"}}async function P(e="add",t=null){const a=document.getElementById("stockOpnameModal");a.dataset.mode=e;const n=document.getElementById("tanggal");n.value=A(new Date),document.querySelector("#productsTable tbody").innerHTML="";const s=a.querySelector(".modal-title"),o=document.getElementById("submitLogButton");if(e==="edit"){s.textContent="Edit Stock Opname",o.textContent="Update",a.dataset.logId=t.id,a.dataset.logData=JSON.stringify(t);const i=new Date(t.tanggal);n.value=A(i),await _(!0,t)}else s.textContent="Buat Stock Opname Baru",o.textContent="Simpan",await _(!1)}async function _(e=!1,t=null,a=1,n=10){const s=document.querySelector("#stockOpnameModal table tbody"),o=document.getElementById("selectAll");e&&t&&t.items.forEach(i=>{I.add(i.produk_varian.id)});try{s.innerHTML=`
            <tr>
                <td colspan="3" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;const i=(a-1)*n,{data:d,error:k,count:u}=await p.from("produk_varian").select(`
                id,
                varian,
                jumlah_stok,
                produk!inner(
                id,
                nama,
                subkategori:id_subkategori(
                    subkategori,
                    kategori:id_kategori(kategori)
                )
                )`,{count:"exact"}).order("produk(nama)",{ascending:!0}).range(i,i+n-1);if(k)throw k;if(s.innerHTML="",!d||d.length===0){s.innerHTML=`
                <tr class="no-products">
                    <td colspan="3" class="text-center text-muted">
                        Tidak ada produk ditemukan
                    </td>
                </tr>`;return}const b=e&&t?t.items.map(r=>r.produk_varian.id):[];d.forEach(r=>{b.includes(r.id)&&I.add(r.id);const h=document.createElement("tr");h.innerHTML=`
                <td>
                    <input type="checkbox" 
                        class="form-check-input product-checkbox" 
                        data-product-id="${r.produk.id}"
                        data-variant-id="${r.id}"
                        ${I.has(r.id)?"checked":""}>
                </td>
                <td>${r.produk.nama}</td>
                <td>
                    ${r.varian} 
                    <span class="badge bg-light text-dark ms-2">
                        Stok: ${r.jumlah_stok||0}
                    </span>
                </td>
            `,h.querySelector("input").addEventListener("change",v=>{v.target.checked?I.add(r.id):I.delete(r.id)}),s.appendChild(h)}),o.checked=!1,o.addEventListener("change",function(){document.querySelectorAll(".product-checkbox").forEach(m=>{m.checked=this.checked;const h=parseInt(m.dataset.variantId);this.checked?I.add(h):I.delete(h)})});const c=document.querySelector("#stockOpnameModal .pagination-container");if(c&&c.remove(),u>n){const r=Math.ceil(u/n),m=document.createElement("div");m.className="pagination-container d-flex justify-content-between align-items-center mt-3";let h=Math.max(1,a-2),v=Math.min(r,a+2);v-h<4&&(a<3?v=Math.min(5,r):h=Math.max(1,r-4)),m.innerHTML=`
            <div class="text-muted small">
                Menampilkan ${i+1}-${Math.min(i+n,u)} dari ${u} produk
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${a===1?"disabled":""}">
                        <button class="page-link" data-page="${a-1}">
                            &laquo;
                        </button>
                    </li>
                    ${Array.from({length:v-h+1},(w,E)=>{const f=h+E;return`
                            <li class="page-item ${f===a?"active":""}">
                                <button class="page-link" data-page="${f}">
                                    ${f}
                                </button>
                            </li>
                        `}).join("")}
                    <li class="page-item ${a===r?"disabled":""}">
                        <button class="page-link" data-page="${a+1}">
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
            <div class="ms-3">
                <select class="form-select form-select-sm page-size-selector">
                    <option value="10" ${n===10?"selected":""}>10 per halaman</option>
                    <option value="25" ${n===25?"selected":""}>25 per halaman</option>
                    <option value="50" ${n===50?"selected":""}>50 per halaman</option>
                </select>
            </div>
            `,s.closest("table").parentNode.appendChild(m),m.querySelectorAll(".page-link").forEach(w=>{w.addEventListener("click",E=>{const f=parseInt(E.target.dataset.page);f>=1&&f<=r&&_(e,t,f,n)})}),m.querySelector(".page-size-selector").addEventListener("change",w=>{const E=parseInt(w.target.value);_(e,t,1,E)})}}catch(i){console.error("Error loading products:",i),s.innerHTML=`
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Gagal memuat daftar produk. Silakan coba lagi.
                </td>
            </tr>`}}async function W(){document.getElementById("stockOpnameModal").dataset.mode==="edit"?await K():await Z()}async function Z(){const e=document.getElementById("tanggal"),t=document.getElementById("submitLogButton"),a=document.querySelectorAll("#stockOpnameModal .product-checkbox:checked");if(!e.value){g("Tanggal harus diisi","error");return}if(a.length===0){g("Pilih minimal 1 produk","error");return}try{t.disabled=!0,t.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span> Menyimpan...';const{data:n,error:s}=await p.from("log_opname").insert({tanggal:C(e.value),status_log:"draft",waktu_dibuat:new Date().toISOString()}).select("id").single();if(s)throw s;const o=Array.from(a).map(d=>({id_log:n.id,id_varian:parseInt(d.dataset.variantId),stok:null,status_item_log:"pending"})),{error:i}=await p.from("item_opname").insert(o);if(i)throw i;g("Stock opname berhasil dibuat"),L.hide(),await B()}catch(n){console.error("Error submitting stock opname:",n),g("Gagal menyimpan stock opname: "+n.message,"error")}finally{t&&(t.disabled=!1,t.innerHTML="Simpan")}}async function K(){const e=document.getElementById("stockOpnameModal"),t=document.getElementById("tanggal"),a=document.getElementById("submitLogButton"),n=document.querySelectorAll("#stockOpnameModal .product-checkbox:checked"),s=e.dataset.logId;if(!t.value){g("Tanggal harus diisi","error");return}try{a.disabled=!0,a.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span> Menyimpan...';const{error:o}=await p.from("log_opname").update({tanggal:C(t.value)}).eq("id",s);if(o)throw o;const{data:i,error:d}=await p.from("item_opname").select("id_varian").eq("id_log",s);if(d)throw d;const k=i.map(b=>b.id_varian),u=Array.from(n).map(b=>parseInt(b.dataset.variantId)).filter(b=>!k.includes(b));if(u.length>0){const b=u.map(r=>({id_log:s,id_varian:r,stok:null,status_item_log:"pending"})),{error:c}=await p.from("item_opname").insert(b);if(c)throw c}g("Perubahan stock opname berhasil disimpan"),L.hide(),await q()}catch(o){console.error("Error editing stock opname:",o),g("Gagal menyimpan perubahan: "+o.message,"error")}finally{a&&(a.disabled=!1,a.innerHTML="Update")}}async function Q(){try{const{error:e}=await p.from("log_opname").delete().eq("status_log","draft");if(e)throw e;g("Log stock opname berhasil dihapus"),await B()}catch(e){console.error("Error deleting stock opname:",e),g("Gagal menghapus log stock opname: "+e.message,"error")}}async function B(){try{const e=await X();ot(e),e?await q():Y()}catch(e){console.error("Error in checkActiveLog:",e)}}async function X(){try{const{data:e,error:t}=await p.from("log_opname").select("id").eq("status_log","draft").maybeSingle();if(t)throw t;return!!e}catch(e){return console.error("Error checking active draft log:",e),!1}}function Y(){const e=document.getElementById("active");e.innerHTML=`
        <div class="alert alert-info">
            Tidak ada log aktif saat ini. Klik tombol "+ Buat log baru" untuk memulai stock opname.
        </div>`}async function q(){const e=document.getElementById("active");e.innerHTML=`
        <div class="card">
            <div class="card-body">
                <div class="text-center my-4">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Memuat log aktif...</p>
                </div>
            </div>
        </div>`;try{const{data:t,error:a}=await p.from("log_opname").select(`
                id,
                tanggal,
                status_log,
                items:item_opname(
                    id,
                    stok,
                    waktu_penyesuaian,
                    status_item_log,
                    produk_varian:id_varian(
                        id,
                        varian,
                        jumlah_stok,
                        produk:id_produk(nama)
                    )
                )
            `).eq("status_log","draft").single();if(a)throw a;const n=await N(t.id);e.innerHTML=`
            <div class="card" data-log-id="${t.id}">  <!-- Add data-log-id here -->
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <div>
                            <strong>Tanggal:</strong> ${S(new Date(t.tanggal))}
                            <strong class="ms-1 me-1">|</strong>
                            <strong>Status:</strong> ${t.status_log}
                            <button id="editLogBtn" class="btn btn-sm btn-outline-primary ms-2">✏️ Edit</button>
                            <button id="deleteLogBtn" class="btn btn-sm btn-outline-danger">🗑️ Hapus</button>
                        </div>
                        <div>
                            <button id="finalizeBtn" class="btn btn-sm btn-success" 
                                    ${n?'disabled title="Masih ada item yang belum disesuaikan"':""}>
                                Finalisasi
                            </button>
                        </div>
                    </div>
                    <table class="table table-bordered table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Produk</th>
                                <th>Varian</th>
                                <th>Stok Sistem</th>
                                <th>Stok Fisik</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="activeLogItems"></tbody>
                    </table>
                </div>
            </div>`,document.getElementById("editLogBtn").addEventListener("click",()=>{P("edit",t),L.show()}),document.getElementById("deleteLogBtn").addEventListener("click",async()=>{confirm("Apakah Anda yakin ingin menghapus log ini?")&&await Q()}),tt(t.items,t.id),V(t.id,n)}catch(t){console.error("Error loading active log:",t),e.innerHTML=`
            <div class="alert alert-danger">
                Gagal memuat log aktif. Silakan coba lagi.
            </div>`}}function tt(e,t){const a=document.getElementById("activeLogItems");a.innerHTML="",e.forEach(n=>{const s=n.stok!==null?n.stok:"",o=n.produk_varian.jumlah_stok||0,i=o===s?"sesuai":n.status_item_log,d=document.createElement("tr");d.innerHTML=`
            <td>${n.produk_varian.produk.nama}</td>
            <td data-variant-id="${n.produk_varian.id}">${n.produk_varian.varian}</td>
            <td>${o}</td>
            <td>
                <input type="number" class="form-control form-control-sm physical-stock" 
                       data-item-id="${n.id}"
                       value="${s}"
                       style="width: 70px;">
                <span class="difference-preview small ms-2 ${o===s?"text-success":"text-warning"}">
                    (${s-o>0?"+":""}${s-o})
                </span>
            </td>
            <td>
                <span class="badge ${D(i)}">
                    ${i}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-match me-1" 
                        data-item-id="${n.id}"
                        ${i==="sesuai"||i==="disesuaikan"?"disabled":""}>
                    Match
                </button>
                <button class="btn btn-sm btn-link text-danger btn-remove-item" 
                        data-item-id="${n.id}"
                        data-log-id="${t}">
                    ✖
                </button>
            </td>
        `,a.appendChild(d)})}function et(){document.addEventListener("input",async function(e){if(e.target.classList.contains("physical-stock")){const t=e.target,a=t.dataset.itemId,n=t.closest("tr"),s=parseInt(n.querySelector("td:nth-child(3)").textContent)||0,o=parseInt(t.value)||0,i=o-s,d=n.querySelector(".badge"),k=n.querySelector(".btn-match"),u=n.querySelector(".difference-preview");u.textContent=`(${i>0?"+":""}${i})`,u.className=`difference-preview small ms-2 ${i===0?"text-success":"text-warning"}`,i===0?(d.className="badge bg-success",d.textContent="sesuai",k.disabled=!0,await $(a,"sesuai",o)):(d.className="badge bg-warning",d.textContent="tidak_sesuai",k.disabled=!1,await $(a,"tidak_sesuai",o)),await j()}})}function at(){document.addEventListener("click",async function(e){var t;if(e.target.classList.contains("btn-match")){const a=e.target,n=a.dataset.itemId,s=a.closest("tr"),o=s.querySelector(".physical-stock"),i=s.querySelector("td:nth-child(2)").dataset.variantId,d=parseInt(s.querySelector("td:nth-child(3)").textContent)||0,k=parseInt(o.value)||0,u=k-d,c=(t=document.getElementById("active").querySelector(".card"))==null?void 0:t.dataset.logId;if(u===0){g("Tidak ada penyesuaian diperlukan");return}try{a.disabled=!0,a.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span>';const r=u>0?"penyesuaian_masuk":"penyesuaian_keluar";await R({variantId:i,type:r,id:c,quantity:Math.abs(u),price:0,date:new Date().toISOString()}),await $(n,"disesuaikan",k,new Date().toISOString());const m=s.querySelector(".badge");m.className="badge bg-info",m.textContent="disesuaikan",s.querySelector("td:nth-child(3)").textContent=k,g(`Stok berhasil disesuaikan (${u>0?"+":""}${u})`),await j()}catch(r){g("Gagal menyamakan stok: "+r.message,"error")}finally{a.disabled=!1,a.textContent="Match"}}})}function nt(){document.addEventListener("click",async function(e){if(e.target.classList.contains("btn-remove-item")){const t=e.target,a=t.dataset.itemId;if(t.dataset.logId,confirm("Apakah Anda yakin ingin menghapus item ini dari log?"))try{t.disabled=!0,t.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span>';const{error:n}=await p.from("item_opname").delete().eq("id",a);if(n)throw n;g("Item berhasil dihapus"),await q()}catch(n){g("Gagal menghapus item: "+n.message,"error"),t.disabled=!1,t.innerHTML="✖"}}})}async function $(e,t,a,n=null){const s={status_item_log:t,stok:a};n&&(s.waktu_penyesuaian=n);const{error:o}=await p.from("item_opname").update(s).eq("id",e);if(o)throw o}async function N(e){const{data:t,error:a}=await p.from("item_opname").select("status_item_log").eq("id_log",e).in("status_item_log",["pending","tidak_sesuai"]);if(a)throw a;return t.length>0}async function j(){const e=document.getElementById("finalizeBtn");if(!e)return;const t=e.dataset.logId;if(!t)return;const a=await N(t);e.disabled=a,e.title=a?"Masih ada item yang belum disesuaikan":"",V(t,a)}function V(e,t){const a=document.getElementById("finalizeBtn");a&&(a.dataset.logId=e,a.disabled=t,a.title=t?"Masih ada item yang belum disesuaikan":"",t||a.addEventListener("click",async()=>{confirm("Apakah Anda yakin ingin memfinalisasi stock opname ini?")&&await st(e)}))}async function st(e){try{const{error:t}=await p.from("log_opname").update({status_log:"final",waktu_penyelesaian:new Date().toISOString()}).eq("id",e);if(t)throw t;g("Stock opname berhasil difinalisasi"),await B()}catch(t){g("Gagal memfinalisasi: "+t.message,"error")}}function ot(e){const t=document.querySelector('[data-bs-target="#stockOpnameModal"]');t&&(t.disabled=e,t.title=e?"Selesaikan log aktif terlebih dahulu":"")}async function H(){const e=document.getElementById("history");e.innerHTML=`
        <div class="text-center my-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Memuat riwayat stock opname...</p>
        </div>`;try{const{data:t,error:a}=await p.from("log_opname").select(`
                id,
                tanggal,
                status_log,
                waktu_dibuat,
                waktu_penyelesaian,
                items:item_opname(
                    id,
                    stok,
                    status_item_log,
                    produk_varian:id_varian(
                        varian,
                        produk:id_produk(nama)
                    )
                )
            `).eq("status_log","final").order("tanggal",{ascending:!1});if(a)throw a;if(!t||t.length===0){e.innerHTML=`
                <div class="alert alert-info">
                    Tidak ada riwayat log stock opname ditemukan.
                </div>`;return}e.innerHTML=`
            <div class="table-responsive">
                <table class="table table-bordered table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Tanggal</th>
                            <th>Status</th>
                            <th>Waktu Dibuat</th>
                            <th>Waktu Selesai</th>
                            <th>Jumlah Item</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="riwayatTableBody"></tbody>
                </table>
            </div>`;const n=document.getElementById("riwayatTableBody");t.forEach(s=>{const o=document.createElement("tr");o.innerHTML=`
                <td>${O(new Date(s.tanggal))}</td>
                <td><span class="badge bg-success">${s.status_log}</span></td>
                <td>${S(new Date(s.waktu_dibuat))}</td>
                <td>${s.waktu_penyelesaian?S(new Date(s.waktu_penyelesaian)):"-"}</td>
                <td>${s.items.length} item</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-view-details" 
                            data-log-id="${s.id}">
                        Detail
                    </button>
                </td>
            `,n.appendChild(o)}),document.querySelectorAll(".btn-view-details").forEach(s=>{s.addEventListener("click",function(){const o=this.dataset.logId,i=t.find(d=>d.id==o);it(i)})})}catch(t){console.error("Error loading riwayat data:",t),e.innerHTML=`
            <div class="alert alert-danger">
                Gagal memuat riwayat stock opname: ${t.message}
            </div>`}}function it(e){let t=document.getElementById("riwayatDetailsModal");t||(t=document.createElement("div"),t.className="modal fade",t.id="riwayatDetailsModal",t.innerHTML=`
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detail Stock Opname</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <strong>Tanggal:</strong> ${O(new Date(e.tanggal))}<br>
                            <strong>Status:</strong> <span class="badge bg-success">${e.status_log}</span><br>
                            <strong>Waktu Dibuat:</strong> ${S(new Date(e.waktu_dibuat))}<br>
                            <strong>Waktu Selesai:</strong> ${e.waktu_penyelesaian?S(new Date(e.waktu_penyelesaian)):"-"}
                        </div>
                        <table class="table table-bordered table-sm">
                            <thead class="table-light">
                                <tr>
                                    <th>Produk</th>
                                    <th>Varian</th>
                                    <th>Stok Akhir</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="riwayatDetailsBody"></tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>`,document.body.appendChild(t));const a=document.getElementById("riwayatDetailsBody");a.innerHTML="",e.items.forEach(s=>{const o=document.createElement("tr");o.innerHTML=`
            <td>${s.produk_varian.produk.nama}</td>
            <td>${s.produk_varian.varian}</td>
            <td>${s.stok}</td>
            <td><span class="badge ${D(s.status_item_log)}">${s.status_item_log}</span></td>
        `,a.appendChild(o)}),new bootstrap.Modal(t).show()}async function x(){const e=document.getElementById("stockOpnameModal"),t=document.getElementById("searchInput").value.trim().toLowerCase(),a=document.querySelector("#stockOpnameModal table tbody"),n=document.getElementById("stockOpnameModal").dataset.mode==="edit",s=n&&e.dataset.logData?JSON.parse(e.dataset.logData):null;try{a.innerHTML=`
            <tr>
                <td colspan="3" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Mencari produk...
                </td>
            </tr>`;let o=p.from("produk_varian").select(`
                id,
                varian,
                jumlah_stok,
                produk:id_produk(
                    id,
                    nama,
                    subkategori:id_subkategori(
                        subkategori,
                        kategori:id_kategori(kategori)
                    )
                )`,{count:"exact"}).order("id_produk",{ascending:!0});if(t){o=o.ilike("varian",`%${t}%`);const{data:c,error:r}=await p.from("produk").select(`
                    id,
                    nama,
                    varian:produk_varian(
                        id,
                        varian,
                        jumlah_stok
                    )
                `).ilike("nama",`%${t}%`);if(r)throw r;const{data:m,error:h}=await o;if(h)throw h;let v=m||[];c&&c.length>0&&c.forEach(l=>{l.varian&&l.varian.length>0&&l.varian.forEach(y=>{v.push({id:y.id,varian:y.varian,jumlah_stok:y.jumlah_stok,produk:{id:l.id,nama:l.nama,subkategori:null}})})});const w=v.reduce((l,y)=>(l.some(M=>M.id===y.id)||l.push(y),l),[]);if(a.innerHTML="",w.length===0){a.innerHTML=`
                    <tr class="no-products">
                        <td colspan="3" class="text-center text-muted">
                            Tidak ada produk ditemukan
                        </td>
                    </tr>`;return}const E=n&&s?s.items.map(l=>l.produk_varian.id):[];w.forEach(l=>{const y=E.includes(l.id),M=document.createElement("tr");M.innerHTML=`
                    <td>
                        <input type="checkbox" 
                               class="form-check-input product-checkbox" 
                               data-product-id="${l.produk.id}"
                               data-variant-id="${l.id}"
                               ${y?"checked":""}>
                    </td>
                    <td>${l.produk.nama}</td>
                    <td>
                        ${l.varian} 
                        <span class="badge bg-light text-dark ms-2">
                            Stok: ${l.jumlah_stok||0}
                        </span>
                    </td>
                `,a.appendChild(M)});const f=document.getElementById("selectAll");f.checked=!1,f.addEventListener("change",function(){document.querySelectorAll(".product-checkbox:not(:disabled)").forEach(y=>{y.checked=this.checked})});return}const{data:i,error:d,count:k}=await o;if(d)throw d;if(a.innerHTML="",!i||i.length===0){a.innerHTML=`
                <tr class="no-products">
                    <td colspan="3" class="text-center text-muted">
                        Tidak ada produk ditemukan
                    </td>
                </tr>`;return}const u=n&&s?s.items.map(c=>c.produk_varian.id):[];i.forEach(c=>{const r=u.includes(c.id),m=document.createElement("tr");m.innerHTML=`
                <td>
                    <input type="checkbox" 
                           class="form-check-input product-checkbox" 
                           data-product-id="${c.produk.id}"
                           data-variant-id="${c.id}"
                           ${r?"checked":""}>
                </td>
                <td>${c.produk.nama}</td>
                <td>
                    ${c.varian} 
                    <span class="badge bg-light text-dark ms-2">
                        Stok: ${c.jumlah_stok||0}
                    </span>
                </td>
            `,a.appendChild(m)});const b=document.getElementById("selectAll");b.checked=!1,b.addEventListener("change",function(){document.querySelectorAll(".product-checkbox:not(:disabled)").forEach(r=>{r.checked=this.checked})})}catch(o){console.error("Error searching products:",o),a.innerHTML=`
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Gagal mencari produk. Silakan coba lagi.
                </td>
            </tr>`}}function T(){const e=document.getElementById("searchInput"),t=document.getElementById("searchIcon");e.value.trim()?(t.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`,t.onclick=z):(t.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`,t.onclick=null)}function z(){document.getElementById("searchInput").value="",T();const e=document.getElementById("stockOpnameModal"),t=e.dataset.mode==="edit",a=t&&e.dataset.logData?JSON.parse(e.dataset.logData):null,n=document.querySelector("#stockOpnameModal .page-size-selector"),s=n?parseInt(n.value):10;_(t,a,1,s)}document.addEventListener("DOMContentLoaded",async()=>{await J(),document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(s=>{s.addEventListener("shown.bs.tab",function(o){o.target.id==="riwayat-tab"&&H()})});const t=document.getElementById("history-tab");t&&t.addEventListener("shown.bs.tab",function(){H()}),L=new bootstrap.Modal(document.getElementById("stockOpnameModal")),document.getElementById("createLogButton").addEventListener("click",()=>{P("add"),L.show()});const a=document.getElementById("searchInput"),n=document.getElementById("searchButton");n&&a&&(n.addEventListener("click",()=>{a.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?z():x()}),a.addEventListener("keyup",s=>{T(),s.key==="Enter"&&x()}),a.addEventListener("input",T)),document.getElementById("selectAll").addEventListener("change",function(){document.querySelectorAll(".product-checkbox").forEach(o=>{o.checked=this.checked})}),document.getElementById("submitLogButton").addEventListener("click",W),B(),et(),at(),nt()});window.loadProductsIntoModal=_;
