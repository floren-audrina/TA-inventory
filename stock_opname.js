const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["navbar2.js","auth.js","db_conn.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill.js";import{_ as R,s as b}from"./db_conn.js";import{i as F,c as W}from"./auth.js";import{d as U,p as Z}from"./import.js";fetch("navbar.html").then(e=>e.text()).then(async e=>{document.getElementById("navbar").innerHTML=e,(await R(()=>import("./navbar2.js"),__vite__mapDeps([0,1,2]))).setupLogout()}).catch(e=>console.error("Error loading navbar:",e));F();(async()=>await W())();let $;const y=new Set;function q(e){const t=e.getTimezoneOffset()*6e4;return new Date(e.getTime()-t).toISOString().slice(0,16)}function C(e){return e?new Date(e).toISOString():null}function B(e){return e.toLocaleString("id-ID",{timeZone:"Asia/Jakarta",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}function D(e){return e.toLocaleDateString("id-ID",{timeZone:"Asia/Jakarta"})}function k(e,t="success"){const a=document.getElementById("toastContainer");if(!a){console.error("Toast container not found!");return}const o=document.createElement("div");o.className=`toast align-items-center text-white bg-${t==="success"?"success":"danger"} border-0`,o.setAttribute("role","alert"),o.setAttribute("aria-live","assertive"),o.setAttribute("aria-atomic","true"),o.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,a.appendChild(o),new bootstrap.Toast(o,{autohide:!0,delay:3e3}).show(),o.addEventListener("hidden.bs.toast",()=>{o.remove()})}function P(e){switch(e){case"sesuai":return"bg-success";case"tidak_sesuai":return"bg-warning";case"disesuaikan":return"bg-info";default:return"bg-secondary"}}async function N(e="add",t=null){const a=document.getElementById("stockOpnameModal");a.dataset.mode=e;const o=document.getElementById("tanggal");o.value=q(new Date),document.querySelector("#productsTable tbody").innerHTML="",e==="add"&&y.clear();const n=a.querySelector(".modal-title"),s=document.getElementById("submitLogButton");if(e==="edit"){n.textContent="Edit Stock Opname",s.textContent="Update",a.dataset.logId=t.id,a.dataset.logData=JSON.stringify(t);const i=new Date(t.tanggal);o.value=q(i),await M(!0,t)}else n.textContent="Buat Stock Opname Baru",s.textContent="Simpan",await M(!1)}async function M(e=!1,t=null,a=1,o=10){const n=document.querySelector("#stockOpnameModal table tbody"),s=document.getElementById("selectAll");e&&t&&t.items.forEach(i=>{y.add(i.produk_varian.id)});try{n.innerHTML=`
            <tr>
                <td colspan="3" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;const i=(a-1)*o,{data:d,error:v,count:g}=await b.from("produk_varian").select(`
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
                )`,{count:"exact"}).order("produk(nama)",{ascending:!0}).range(i,i+o-1);if(v)throw v;if(n.innerHTML="",!d||d.length===0){n.innerHTML=`
                <tr class="no-products">
                    <td colspan="3" class="text-center text-muted">
                        Tidak ada produk ditemukan
                    </td>
                </tr>`;return}const m=e&&t?t.items.map(c=>c.produk_varian.id):[];d.forEach(c=>{m.includes(c.id)&&y.add(c.id);const I=document.createElement("tr");I.innerHTML=`
                <td>
                    <input type="checkbox" 
                        class="form-check-input product-checkbox" 
                        data-product-id="${c.produk.id}"
                        data-variant-id="${c.id}"
                        ${y.has(c.id)?"checked":""}>
                </td>
                <td>${c.produk.nama}</td>
                <td>
                    ${c.varian} 
                    <span class="badge bg-light text-dark ms-2">
                        Stok: ${c.jumlah_stok||0}
                    </span>
                </td>
            `,I.querySelector("input").addEventListener("change",r=>{r.target.checked?y.add(c.id):y.delete(c.id)}),n.appendChild(I)}),s.checked=!1,s.addEventListener("change",function(){document.querySelectorAll(".product-checkbox").forEach(f=>{f.checked=this.checked;const I=parseInt(f.dataset.variantId);this.checked?y.add(I):y.delete(I)})});const w=document.querySelector("#stockOpnameModal .pagination-container");if(w&&w.remove(),g>o){const c=Math.ceil(g/o),f=document.createElement("div");f.className="pagination-container d-flex justify-content-between align-items-center mt-3";let I=Math.max(1,a-2),r=Math.min(c,a+2);r-I<4&&(a<3?r=Math.min(5,c):I=Math.max(1,c-4)),f.innerHTML=`
            <div class="text-muted small">
                Menampilkan ${i+1}-${Math.min(i+o,g)} dari ${g} produk
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${a===1?"disabled":""}">
                        <button class="page-link" data-page="${a-1}">
                            &laquo;
                        </button>
                    </li>
                    ${Array.from({length:r-I+1},(l,u)=>{const p=I+u;return`
                            <li class="page-item ${p===a?"active":""}">
                                <button class="page-link" data-page="${p}">
                                    ${p}
                                </button>
                            </li>
                        `}).join("")}
                    <li class="page-item ${a===c?"disabled":""}">
                        <button class="page-link" data-page="${a+1}">
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
            <div class="ms-3">
                <select class="form-select form-select-sm page-size-selector">
                    <option value="10" ${o===10?"selected":""}>10 per halaman</option>
                    <option value="25" ${o===25?"selected":""}>25 per halaman</option>
                    <option value="50" ${o===50?"selected":""}>50 per halaman</option>
                </select>
            </div>
            `,n.closest("table").parentNode.appendChild(f),f.querySelectorAll(".page-link").forEach(l=>{l.addEventListener("click",u=>{const p=parseInt(u.target.dataset.page);p>=1&&p<=c&&M(e,t,p,o)})}),f.querySelector(".page-size-selector").addEventListener("change",l=>{const u=parseInt(l.target.value);M(e,t,1,u)})}}catch(i){console.error("Error loading products:",i),n.innerHTML=`
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Gagal memuat daftar produk. Silakan coba lagi.
                </td>
            </tr>`}}async function K(){document.getElementById("stockOpnameModal").dataset.mode==="edit"?await X():await Q()}async function Q(){const e=document.getElementById("tanggal"),t=document.getElementById("submitLogButton"),a=document.querySelectorAll("#stockOpnameModal .product-checkbox:checked");if(!e.value){k("Tanggal harus diisi","error");return}if(a.length===0){k("Pilih minimal 1 produk","error");return}try{t.disabled=!0,t.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span> Menyimpan...';const{data:o,error:n}=await b.from("log_opname").insert({tanggal:C(e.value),status_log:"draft",waktu_dibuat:new Date().toISOString()}).select("id").single();if(n)throw n;const s=Array.from(a).map(d=>({id_log:o.id,id_varian:parseInt(d.dataset.variantId),stok:null,status_item_log:"pending"})),{error:i}=await b.from("item_opname").insert(s);if(i)throw i;k("Stock opname berhasil dibuat"),$.hide(),await T()}catch(o){console.error("Error submitting stock opname:",o),k("Gagal menyimpan stock opname: "+o.message,"error")}finally{t&&(t.disabled=!1,t.innerHTML="Simpan")}}async function X(){const e=document.getElementById("stockOpnameModal"),t=document.getElementById("tanggal"),a=document.getElementById("submitLogButton"),o=document.querySelectorAll("#stockOpnameModal .product-checkbox:checked"),n=e.dataset.logId;if(!t.value){k("Tanggal harus diisi","error");return}try{a.disabled=!0,a.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span> Menyimpan...';const{error:s}=await b.from("log_opname").update({tanggal:C(t.value)}).eq("id",n);if(s)throw s;const{data:i,error:d}=await b.from("item_opname").select("id_varian").eq("id_log",n);if(d)throw d;const v=i.map(m=>m.id_varian),g=Array.from(o).map(m=>parseInt(m.dataset.variantId)).filter(m=>!v.includes(m));if(g.length>0){const m=g.map(c=>({id_log:n,id_varian:c,stok:null,status_item_log:"pending"})),{error:w}=await b.from("item_opname").insert(m);if(w)throw w}k("Perubahan stock opname berhasil disimpan"),$.hide(),await A()}catch(s){console.error("Error editing stock opname:",s),k("Gagal menyimpan perubahan: "+s.message,"error")}finally{a&&(a.disabled=!1,a.innerHTML="Update")}}async function Y(){try{const{error:e}=await b.from("log_opname").delete().eq("status_log","draft");if(e)throw e;k("Log stock opname berhasil dihapus"),await T()}catch(e){console.error("Error deleting stock opname:",e),k("Gagal menghapus log stock opname: "+e.message,"error")}}async function T(){try{const e=await tt();rt(e),e?await A():et()}catch(e){console.error("Error in checkActiveLog:",e)}}async function tt(){try{const{data:e,error:t}=await b.from("log_opname").select("id").eq("status_log","draft").maybeSingle();if(t)throw t;return!!e}catch(e){return console.error("Error checking active draft log:",e),!1}}function et(){const e=document.getElementById("active");e.innerHTML=`
        <div class="alert alert-info">
            Tidak ada log aktif saat ini. Klik tombol "+ Buat log baru" untuk memulai stock opname.
        </div>`}async function A(){const e=document.getElementById("active");e.innerHTML=`
        <div class="card">
            <div class="card-body">
                <div class="text-center my-4">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Memuat log aktif...</p>
                </div>
            </div>
        </div>`;try{const{data:t,error:a}=await b.from("log_opname").select(`
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
            `).eq("status_log","draft").single();if(a)throw a;const o=await j(t.id);e.innerHTML=`
            <div class="card" data-log-id="${t.id}">  <!-- Add data-log-id here -->
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <div>
                            <strong>Tanggal:</strong> ${B(new Date(t.tanggal))}
                            <strong class="ms-1 me-1">|</strong>
                            <strong>Status:</strong> ${t.status_log}
                            <button id="editLogBtn" class="btn btn-sm btn-outline-primary ms-2">✏️ Edit</button>
                            <button id="deleteLogBtn" class="btn btn-sm btn-outline-danger">🗑️ Hapus</button>
                        </div>
                        <div>
                            <button id="finalizeBtn" class="btn btn-sm btn-success" 
                                    ${o?'disabled title="Masih ada item yang belum disesuaikan"':""}>
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
            </div>`,document.getElementById("editLogBtn").addEventListener("click",()=>{N("edit",t),$.show()}),document.getElementById("deleteLogBtn").addEventListener("click",async()=>{confirm("Apakah Anda yakin ingin menghapus log ini?")&&await Y()}),at(t.items,t.id),V(t.id,o)}catch(t){console.error("Error loading active log:",t),e.innerHTML=`
            <div class="alert alert-danger">
                Gagal memuat log aktif. Silakan coba lagi.
            </div>`}}function at(e,t){const a=document.getElementById("activeLogItems");a.innerHTML="",e.forEach(o=>{const n=o.stok!==null?o.stok:"",s=o.produk_varian.jumlah_stok||0,i=s===n?"sesuai":o.status_item_log,d=document.createElement("tr");d.innerHTML=`
            <td>${o.produk_varian.produk.nama}</td>
            <td data-variant-id="${o.produk_varian.id}">${o.produk_varian.varian}</td>
            <td>${s}</td>
            <td>
                <input type="number" class="form-control form-control-sm physical-stock" 
                       data-item-id="${o.id}"
                       value="${n}"
                       style="width: 70px;">
                <span class="difference-preview small ms-2 ${s===n?"text-success":"text-warning"}">
                    (${n-s>0?"+":""}${n-s})
                </span>
            </td>
            <td>
                <span class="badge ${P(i)}">
                    ${i}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-match me-1" 
                        data-item-id="${o.id}"
                        ${i==="sesuai"||i==="disesuaikan"?"disabled":""}>
                    Match
                </button>
                <button class="btn btn-sm btn-link text-danger btn-remove-item" 
                        data-item-id="${o.id}"
                        data-log-id="${t}">
                    ✖
                </button>
            </td>
        `,a.appendChild(d)})}function nt(){document.addEventListener("input",async function(e){if(e.target.classList.contains("physical-stock")){const t=e.target,a=t.dataset.itemId,o=t.closest("tr"),n=parseInt(o.querySelector("td:nth-child(3)").textContent)||0,s=parseInt(t.value)||0,i=s-n,d=o.querySelector(".badge"),v=o.querySelector(".btn-match"),g=o.querySelector(".difference-preview");g.textContent=`(${i>0?"+":""}${i})`,g.className=`difference-preview small ms-2 ${i===0?"text-success":"text-warning"}`,i===0?(d.className="badge bg-success",d.textContent="sesuai",v.disabled=!0,await O(a,"sesuai",s)):(d.className="badge bg-warning",d.textContent="tidak_sesuai",v.disabled=!1,await O(a,"tidak_sesuai",s)),await z()}})}function ot(){document.addEventListener("click",async function(e){var t;if(e.target.classList.contains("btn-match")){const a=e.target,o=a.dataset.itemId,n=a.closest("tr"),s=n.querySelector(".physical-stock"),i=n.querySelector("td:nth-child(2)").dataset.variantId,d=parseInt(n.querySelector("td:nth-child(3)").textContent)||0,v=parseInt(s.value)||0,g=v-d,w=(t=document.getElementById("active").querySelector(".card"))==null?void 0:t.dataset.logId;if(g===0){k("Tidak ada penyesuaian diperlukan");return}try{a.disabled=!0,a.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span>';const c=g>0?"penyesuaian_masuk":"penyesuaian_keluar";await Z({variantId:i,type:c,id:w,quantity:Math.abs(g),price:0,date:new Date().toISOString()}),await O(o,"disesuaikan",v,new Date().toISOString());const f=n.querySelector(".badge");f.className="badge bg-info",f.textContent="disesuaikan",n.querySelector("td:nth-child(3)").textContent=v,k(`Stok berhasil disesuaikan (${g>0?"+":""}${g})`),await z()}catch(c){k("Gagal menyamakan stok: "+c.message,"error")}finally{a.disabled=!1,a.textContent="Match"}}})}function st(){document.addEventListener("click",async function(e){if(e.target.classList.contains("btn-remove-item")){const t=e.target,a=t.dataset.itemId;if(t.dataset.logId,confirm("Apakah Anda yakin ingin menghapus item ini dari log?"))try{t.disabled=!0,t.innerHTML='<span class="spinner-border spinner-border-sm" role="status"></span>';const{error:o}=await b.from("item_opname").delete().eq("id",a);if(o)throw o;k("Item berhasil dihapus"),await A()}catch(o){k("Gagal menghapus item: "+o.message,"error"),t.disabled=!1,t.innerHTML="✖"}}})}async function O(e,t,a,o=null){const n={status_item_log:t,stok:a};o&&(n.waktu_penyesuaian=o);const{error:s}=await b.from("item_opname").update(n).eq("id",e);if(s)throw s}async function j(e){const{data:t,error:a}=await b.from("item_opname").select("status_item_log").eq("id_log",e).in("status_item_log",["pending","tidak_sesuai"]);if(a)throw a;return t.length>0}async function z(){const e=document.getElementById("finalizeBtn");if(!e)return;const t=e.dataset.logId;if(!t)return;const a=await j(t);e.disabled=a,e.title=a?"Masih ada item yang belum disesuaikan":"",V(t,a)}function V(e,t){const a=document.getElementById("finalizeBtn");a&&(a.dataset.logId=e,a.disabled=t,a.title=t?"Masih ada item yang belum disesuaikan":"",t||a.addEventListener("click",async()=>{confirm("Apakah Anda yakin ingin memfinalisasi stock opname ini?")&&await it(e)}))}async function it(e){try{const{error:t}=await b.from("log_opname").update({status_log:"final",waktu_penyelesaian:new Date().toISOString()}).eq("id",e);if(t)throw t;k("Stock opname berhasil difinalisasi"),await T()}catch(t){k("Gagal memfinalisasi: "+t.message,"error")}}function rt(e){const t=document.querySelector('[data-bs-target="#stockOpnameModal"]');t&&(t.disabled=e,t.title=e?"Selesaikan log aktif terlebih dahulu":"")}async function H(){const e=document.getElementById("history");e.innerHTML=`
        <div class="text-center my-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Memuat riwayat stock opname...</p>
        </div>`;try{const{data:t,error:a}=await b.from("log_opname").select(`
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
            </div>`;const o=document.getElementById("riwayatTableBody");t.forEach(n=>{const s=document.createElement("tr");s.innerHTML=`
                <td>${D(new Date(n.tanggal))}</td>
                <td><span class="badge bg-success">${n.status_log}</span></td>
                <td>${B(new Date(n.waktu_dibuat))}</td>
                <td>${n.waktu_penyelesaian?B(new Date(n.waktu_penyelesaian)):"-"}</td>
                <td>${n.items.length} item</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-view-details" 
                            data-log-id="${n.id}">
                        Detail
                    </button>
                </td>
            `,o.appendChild(s)}),document.querySelectorAll(".btn-view-details").forEach(n=>{n.addEventListener("click",function(){const s=this.dataset.logId,i=t.find(d=>d.id==s);dt(i)})})}catch(t){console.error("Error loading riwayat data:",t),e.innerHTML=`
            <div class="alert alert-danger">
                Gagal memuat riwayat stock opname: ${t.message}
            </div>`}}function dt(e){let t=document.getElementById("riwayatDetailsModal");t||(t=document.createElement("div"),t.className="modal fade",t.id="riwayatDetailsModal",t.innerHTML=`
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detail Stock Opname</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <strong>Tanggal:</strong> ${D(new Date(e.tanggal))}<br>
                            <strong>Status:</strong> <span class="badge bg-success">${e.status_log}</span><br>
                            <strong>Waktu Dibuat:</strong> ${B(new Date(e.waktu_dibuat))}<br>
                            <strong>Waktu Selesai:</strong> ${e.waktu_penyelesaian?B(new Date(e.waktu_penyelesaian)):"-"}
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
            </div>`,document.body.appendChild(t));const a=document.getElementById("riwayatDetailsBody");a.innerHTML="",e.items.forEach(n=>{const s=document.createElement("tr");s.innerHTML=`
            <td>${n.produk_varian.produk.nama}</td>
            <td>${n.produk_varian.varian}</td>
            <td>${n.stok}</td>
            <td><span class="badge ${P(n.status_item_log)}">${n.status_item_log}</span></td>
        `,a.appendChild(s)}),new bootstrap.Modal(t).show()}async function S(e=1,t=10){const a=document.getElementById("stockOpnameModal"),o=document.getElementById("searchInput").value.trim().toLowerCase(),n=document.querySelector("#stockOpnameModal table tbody"),s=document.getElementById("stockOpnameModal").dataset.mode==="edit",i=s&&a.dataset.logData?JSON.parse(a.dataset.logData):null;try{n.innerHTML=`
            <tr>
                <td colspan="3" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    ${o?"Mencari produk...":"Memuat produk..."}
                </td>
            </tr>`;const d=(e-1)*t;let v,g,m=[],w=0;if(o){const{data:r,error:l,count:u}=await b.from("produk_varian").select(`
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
                    )`,{count:"exact"}).ilike("varian",`%${o}%`).range(d,d+t-1);if(l)throw l;const{data:p,error:_}=await b.from("produk").select(`
                    id,
                    nama,
                    varian:produk_varian(
                        id,
                        varian,
                        jumlah_stok
                    )
                `).ilike("nama",`%${o}%`);if(_)throw _;m=r||[],p&&p.length>0&&p.forEach(h=>{h.varian&&h.varian.length>0&&h.varian.forEach(L=>{m.push({id:L.id,varian:L.varian,jumlah_stok:L.jumlah_stok,produk:{id:h.id,nama:h.nama,subkategori:null}})})});const E=m.reduce((h,L)=>(h.some(J=>J.id===L.id)||h.push(L),h),[]);w=E.length,m=E.slice(d,d+t)}else{v=b.from("produk_varian").select(`
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
                    )`,{count:"exact"}).order("produk(nama)",{ascending:!0}).range(d,d+t-1);const{data:r,error:l,count:u}=await v;if(l)throw l;m=r,w=u}if(n.innerHTML="",!m||m.length===0){n.innerHTML=`
                <tr class="no-products">
                    <td colspan="3" class="text-center text-muted">
                        Tidak ada produk ditemukan
                    </td>
                </tr>`;const r=document.querySelector("#stockOpnameModal .pagination-container");r&&r.remove();return}const c=s&&i?i.items.map(r=>r.produk_varian.id):[];m.forEach(r=>{c.includes(r.id)&&y.add(r.id);const u=document.createElement("tr");u.innerHTML=`
                <td>
                    <input type="checkbox" 
                        class="form-check-input product-checkbox" 
                        data-product-id="${r.produk.id}"
                        data-variant-id="${r.id}"
                        ${y.has(r.id)?"checked":""}>
                </td>
                <td>${r.produk.nama}</td>
                <td>
                    ${r.varian} 
                    <span class="badge bg-light text-dark ms-2">
                        Stok: ${r.jumlah_stok||0}
                    </span>
                </td>
            `,u.querySelector("input").addEventListener("change",p=>{p.target.checked?y.add(r.id):y.delete(r.id)}),n.appendChild(u)});const f=document.getElementById("selectAll");f.checked=!1,f.addEventListener("change",function(){document.querySelectorAll(".product-checkbox").forEach(l=>{l.checked=this.checked;const u=parseInt(l.dataset.variantId);this.checked?y.add(u):y.delete(u)})});const I=document.querySelector("#stockOpnameModal .pagination-container");if(I&&I.remove(),w>t){const r=Math.ceil(w/t),l=document.createElement("div");l.className="pagination-container d-flex justify-content-between align-items-center mt-3";let u=Math.max(1,e-2),p=Math.min(r,e+2);p-u<4&&(e<3?p=Math.min(5,r):u=Math.max(1,r-4)),l.innerHTML=`
            <div class="text-muted small">
                Menampilkan ${d+1}-${Math.min(d+t,w)} dari ${w} produk
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${e===1?"disabled":""}">
                        <button class="page-link" data-page="${e-1}">
                            &laquo;
                        </button>
                    </li>
                    ${Array.from({length:p-u+1},(_,E)=>{const h=u+E;return`
                            <li class="page-item ${h===e?"active":""}">
                                <button class="page-link" data-page="${h}">
                                    ${h}
                                </button>
                            </li>
                        `}).join("")}
                    <li class="page-item ${e===r?"disabled":""}">
                        <button class="page-link" data-page="${e+1}">
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
            <div class="ms-3">
                <select class="form-select form-select-sm page-size-selector">
                    <option value="10" ${t===10?"selected":""}>10 per halaman</option>
                    <option value="25" ${t===25?"selected":""}>25 per halaman</option>
                    <option value="50" ${t===50?"selected":""}>50 per halaman</option>
                </select>
            </div>
            `,n.closest("table").parentNode.appendChild(l),l.querySelectorAll(".page-link").forEach(_=>{_.addEventListener("click",E=>{const h=parseInt(E.target.dataset.page);h>=1&&h<=r&&S(h,t)})}),l.querySelector(".page-size-selector").addEventListener("change",_=>{const E=parseInt(_.target.value);S(1,E)})}}catch(d){console.error("Error searching products:",d),n.innerHTML=`
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Gagal memuat daftar produk. Silakan coba lagi.
                </td>
            </tr>`}}function x(){const e=document.getElementById("searchInput"),t=document.getElementById("searchIcon");e.value.trim()?(t.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`,t.onclick=G):(t.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`,t.onclick=null)}function G(){document.getElementById("searchInput").value="",x();const e=document.getElementById("stockOpnameModal"),t=e.dataset.mode==="edit",a=t&&e.dataset.logData?JSON.parse(e.dataset.logData):null,o=document.querySelector("#stockOpnameModal .page-size-selector"),n=o?parseInt(o.value):10;M(t,a,1,n)}document.addEventListener("DOMContentLoaded",async()=>{await U(),document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(n=>{n.addEventListener("shown.bs.tab",function(s){s.target.id==="riwayat-tab"&&H()})});const t=document.getElementById("history-tab");t&&t.addEventListener("shown.bs.tab",function(){H()}),$=new bootstrap.Modal(document.getElementById("stockOpnameModal")),document.getElementById("stockOpnameModal").addEventListener("hidden.bs.modal",function(){y.clear(),document.getElementById("searchInput").value="",x(),document.getElementById("tanggal").value=q(new Date),document.querySelector("#productsTable tbody").innerHTML="";const n=document.querySelector("#stockOpnameModal .pagination-container");n&&n.remove()}),document.getElementById("createLogButton").addEventListener("click",()=>{N("add"),$.show()});const a=document.getElementById("searchInput"),o=document.getElementById("searchButton");o&&a&&(o.addEventListener("click",()=>{if(a.value.trim())if(document.getElementById("searchIcon").innerHTML.includes("bi-x"))G();else{const n=document.querySelector("#stockOpnameModal .page-size-selector"),s=n?parseInt(n.value):10;S(1,s)}else{const n=document.querySelector("#stockOpnameModal .page-size-selector"),s=n?parseInt(n.value):10;S(1,s)}}),a.addEventListener("keyup",n=>{if(x(),n.key==="Enter"){const s=document.querySelector("#stockOpnameModal .page-size-selector"),i=s?parseInt(s.value):10;S(1,i)}}),a.addEventListener("input",x)),document.getElementById("selectAll").addEventListener("change",function(){document.querySelectorAll(".product-checkbox").forEach(s=>{s.checked=this.checked})}),document.getElementById("submitLogButton").addEventListener("click",K),T(),nt(),ot(),st()});window.loadProductsIntoModal=M;
