const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["navbar2.js","auth.js","db_conn.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill.js";import{_ as B,s as d}from"./db_conn.js";import{i as L,c as M}from"./auth.js";import{d as T}from"./import.js";fetch("navbar.html").then(t=>t.text()).then(async t=>{document.getElementById("navbar").innerHTML=t,(await B(()=>import("./navbar2.js"),__vite__mapDeps([0,1,2]))).setupLogout()}).catch(t=>console.error("Error loading navbar:",t));L();(async()=>await M())();function _(){const t=document.getElementById("supplierForm");t&&(t.reset(),t.dataset.supplierId="",document.getElementById("supplierModalLabel").textContent="Add Supplier",document.getElementById("submitButton").textContent="Add Supplier")}function l(t,e="success"){const n=document.getElementById("toastContainer");if(!n){console.error("Toast container not found!");return}const a=document.createElement("div");a.className=`toast align-items-center text-white bg-${e==="success"?"success":"danger"} border-0`,a.setAttribute("role","alert"),a.setAttribute("aria-live","assertive"),a.setAttribute("aria-atomic","true"),a.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${t}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,n.appendChild(a),new bootstrap.Toast(a,{autohide:!0,delay:3e3}).show(),a.addEventListener("hidden.bs.toast",()=>{a.remove()})}async function S(){const t=document.getElementById("kota");if(t)try{const{data:e,error:n}=await d.from("kota").select("id, kota");if(n)throw n;t.innerHTML='<option value="" disabled selected>Pilih Kota</option>',e.forEach(a=>{const r=document.createElement("option");r.value=a.id,r.text=a.kota,t.appendChild(r)})}catch(e){console.error("Error fetching cities:",e.message),l("Gagal memuat kota. Silahkan coba lagi.","error")}}async function x(){try{const t=document.getElementById("perusahaan").value,e=document.getElementById("cp").value,n=document.getElementById("no_hp").value,a=document.getElementById("kota").value,r=document.getElementById("supplierForm").dataset.supplierId;if(r){const{error:i}=await d.from("supplier").update({perusahaan:t,cp:e,no_hp:n,id_kota:a}).eq("id",r);if(i)throw i;l("Data supplier berhasil diperbarui!","success")}else{const{error:i}=await d.from("supplier").insert([{perusahaan:t,cp:e,no_hp:n,id_kota:a}]);if(i)throw i;l("Data supplier berhasil ditambahkan!","success")}bootstrap.Modal.getInstance(document.getElementById("supplierModal")).hide(),await h()}catch(t){console.error("Error:",t),l("Gagal menyimpan supplier, silahkan coba lagi.","error")}}async function $(t){try{const{data:e,error:n}=await d.from("supplier").select("*").eq("id",t).single();if(n)throw n;document.getElementById("perusahaan").value=e.perusahaan,document.getElementById("cp").value=e.cp,document.getElementById("no_hp").value=e.no_hp,document.getElementById("kota").value=e.id_kota,document.getElementById("supplierModalLabel").textContent="Edit Supplier",document.getElementById("submitButton").textContent="Update Supplier",document.getElementById("supplierForm").dataset.supplierId=t,new bootstrap.Modal(document.getElementById("supplierModal")).show()}catch(e){console.error("Error fetching supplier:",e.message),l("Gagal memuat data supplier. Silahkan coba lagi.","error")}}async function H(t){if(confirm("Apakah Anda yakin ingin menghapus supplier ini?"))try{await d.from("supplier").delete().eq("id",t),await h(),l("Supplier berhasil dihapus!","success")}catch(e){console.error("Error deleting supplier:",e.message),l("Gagal menghapus supplier. Silahkan coba lagi.","error")}}async function h(){const t=document.getElementById("supplierTableBody");if(t)try{t.innerHTML=`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;const{data:e,error:n}=await d.from("supplier").select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota: id_kota (kota)
            `);if(n)throw n;if(t.innerHTML="",!e||e.length===0){t.innerHTML=`
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Tidak ada supplier ditemukan
                    </td>
                </tr>`;return}e.forEach(a=>{var c;const r=document.createElement("tr");r.innerHTML=`
                <td>${a.id}</td>
                <td>${a.perusahaan||"-"}</td>
                <td>${a.cp||"-"}</td>
                <td>${a.no_hp||"-"}</td>
                <td>${((c=a.kota)==null?void 0:c.kota)||"-"}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="showSupplierProducts(${a.id})">Produk</button>
                    <button class="btn btn-primary btn-sm" onclick="editSupplier(${a.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${a.id})">Delete</button>
                </td>
            `,t.appendChild(r)})}catch(e){console.error("Error fetching supplier:",e.message),l("Gagal menampilkan data supplier, silahkan coba lagi.","error")}}const o={type:null,kota:null};function C(){var e,n;const t=document.getElementById("filterKota");t&&t.addEventListener("click",function(a){if(this.checked&&o.type==="kota"){this.checked=!1,y();return}o.type="kota",F()}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",k),(n=document.getElementById("resetFilter"))==null||n.addEventListener("click",y)}async function F(){var e,n;const t=document.getElementById("filterOptionsContainer");t.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),t.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Kota</label>
            <select class="form-select" id="dropdownKota">
                <option value="">Memuat kota...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await P(),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",k),(n=document.getElementById("resetFilter"))==null||n.addEventListener("click",y)}async function P(){try{const{data:t,error:e}=await d.from("supplier").select("id_kota").not("id_kota","is",null).order("id_kota",{ascending:!0});if(e)throw e;const n=[...new Set(t.map(i=>i.id_kota))],{data:a,error:r}=await d.from("kota").select("id, kota").in("id",n).order("kota",{ascending:!0});if(r)throw r;const c=document.getElementById("dropdownKota");c.innerHTML='<option value="">Pilih Kota</option>',a.forEach(i=>{const s=document.createElement("option");s.value=i.id,s.textContent=i.kota,c.appendChild(s)})}catch(t){console.error("Error loading kota:",t),l("Gagal memuat daftar kota","error")}}function k(){o.kota=null,o.type==="kota"&&(o.kota=document.getElementById("dropdownKota").value),E()}function y(){const t=document.getElementById("filterKota");t&&(t.checked=!1),o.type=null,o.kota=null,document.getElementById("filterCard").classList.add("d-none"),h()}async function E(){const t=document.getElementById("supplierTableBody");try{t.innerHTML=`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;let e=d.from("supplier").select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});o.type==="kota"&&o.kota&&(e=e.eq("id_kota",o.kota));const{data:n,error:a}=await e;if(a)throw a;v(n)}catch(e){console.error("Error filtering suppliers:",e),l("Gagal memfilter supplier","error"),t.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`}}async function b(){const t=document.getElementById("searchInput").value.trim().toLowerCase();try{const e=document.getElementById("supplierTableBody");e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;let n=d.from("supplier").select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});o.type==="kota"&&o.kota&&(n=n.eq("id_kota",o.kota));const a=n;t&&a.or(`perusahaan.ilike.%${t}%,cp.ilike.%${t}%,no_hp.ilike.%${t}%`);const{data:r,error:c}=await a;let i=[];if(t&&!(o.type==="kota"&&o.kota)){const{data:u,error:p}=await d.from("kota").select("id, kota").ilike("kota",`%${t}%`);if(!p&&(u==null?void 0:u.length)>0){const m=u.map(I=>I.id),{data:g,error:w}=await n.in("id_kota",m);w||(i=g||[])}}let s;t?s=[...r||[],...i].reduce((p,m)=>(p.some(g=>g.id===m.id)||p.push(m),p),[]):s=r||[],v(s)}catch(e){console.error("Error searching suppliers:",e),l("Gagal melakukan pencarian supplier","error"),document.getElementById("supplierTableBody").innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`}}function v(t){const e=document.getElementById("supplierTableBody");if(e.innerHTML="",!t||t.length===0){e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Tidak ada supplier yang cocok dengan pencarian
                </td>
            </tr>`;return}t.forEach(n=>{var r;const a=document.createElement("tr");a.innerHTML=`
            <td>${n.id}</td>
            <td>${n.perusahaan||"-"}</td>
            <td>${n.cp}</td>
            <td>${n.no_hp||"-"}</td>
            <td>${((r=n.kota)==null?void 0:r.kota)||"-"}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="showSupplierProducts(${n.id})">Produk</button>
                <button class="btn btn-primary btn-sm" onclick="editSupplier(${n.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${n.id})">Delete</button>
            </td>
        `,e.appendChild(a)})}function f(){const t=document.getElementById("searchInput"),e=document.getElementById("searchIcon");t.value.trim()?e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`:e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`}function D(){document.getElementById("searchInput").value="",f(),E()}async function K(t){try{const{data:e,error:n}=await d.from("supplier").select("perusahaan").eq("id",t).single();if(n)throw n;const{data:a,error:r}=await d.from("produk").select(`
                id,
                nama,
                var: produk_varian(
                    id,
                    varian
                )
            `).eq("id_supplier",t).order("id",{ascending:!0});if(r)throw r;document.getElementById("supplierProductsModalLabel").textContent=`Produk dari ${e.perusahaan}`;const c=document.getElementById("supplierProductsTableBody");c.innerHTML="",a.forEach(s=>{if(s.var&&s.var.length>0){const u=document.createElement("tr");u.innerHTML=`
                    <td colspan="5" class="fw-bold bg-light">
                        ${s.nama} (ID: ${s.id})
                    </td>
                `,c.appendChild(u),s.var.forEach(p=>{const m=document.createElement("tr");m.innerHTML=`
                        <td>${p.id}</td>
                        <td>${p.varian}</td>
                    `,c.appendChild(m)})}}),new bootstrap.Modal(document.getElementById("supplierProductsModal")).show()}catch(e){console.error("Error fetching supplier products:",e),l("Gagal memuat produk milik supplier","error")}}document.addEventListener("DOMContentLoaded",async()=>{await S(),await h(),await T(),C();const t=document.getElementById("supplierForm");t&&t.addEventListener("submit",async r=>{r.preventDefault(),await x()});const e=document.getElementById("supplierModal");e&&e.addEventListener("hidden.bs.modal",()=>{_()});const n=document.getElementById("searchInput"),a=document.getElementById("searchButton");a&&n&&(a.addEventListener("click",()=>{n.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?D():b()}),n.addEventListener("keyup",r=>{f(),r.key==="Enter"&&b()}),n.addEventListener("input",f))});window.editSupplier=$;window.deleteSupplier=H;window.showSupplierProducts=K;
