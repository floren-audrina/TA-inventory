import{s}from"./db_conn-CuK1RHLN.js";import{n as B}from"./navbar-BXvx_Lss.js";import{c as L,d as T}from"./import-wcpIJIsu.js";fetch("navbar.html").then(t=>t.text()).then(t=>{document.getElementById("navbar").innerHTML=t;const e=document.createElement("script");e.type="module",e.src=B,document.body.appendChild(e)}).catch(t=>console.error("Error loading navbar:",t));(async()=>await L())();function M(){$("#supplierTable").DataTable({dom:'<"top"<"row"<"col-md-6"l><"col-md-6 d-flex justify-content-end align-items-center"f>>>rt<"bottom"ip>',language:{search:"",searchPlaceholder:"Cari Supplier",lengthMenu:"Tampilkan _MENU_ entri per halaman",info:"Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",paginate:{first:"Pertama",last:"Terakhir",next:"Berikutnya",previous:"Sebelumnya"}},columnDefs:[{width:"5%",targets:0},{width:"15%",targets:1},{width:"15%",targets:2},{width:"15%",targets:3},{width:"15%",targets:4},{width:"10%",targets:5,orderable:!1}],columns:[{data:"id"},{data:"perusahaan"},{data:"cp"},{data:"no_hp"},{data:"kota"},{data:null,render:function(t,e,a){return`
                        <button class="btn btn-info btn-sm" onclick="showSupplierProducts(${a.id})">Produk</button>
                        <button class="btn btn-primary btn-sm" onclick="window.editSupplier(${a.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteSupplier(${a.id})">Delete</button>
                    `}}],autoWidth:!1,scrollX:!0,fixedColumns:!0})}function _(){const t=document.getElementById("supplierForm");t&&(t.reset(),t.dataset.supplierId="",document.getElementById("supplierModalLabel").textContent="Add Supplier",document.getElementById("submitButton").textContent="Add Supplier")}function l(t,e="success"){const a=document.getElementById("toastContainer"),n=document.createElement("div");n.classList.add("toast"),n.setAttribute("role","alert"),n.setAttribute("aria-live","assertive"),n.setAttribute("aria-atomic","true"),n.classList.add(e==="success"?"bg-success":"bg-danger"),n.classList.add("text-white");const o=document.createElement("div");o.classList.add("toast-body"),o.textContent=t,n.appendChild(o),a.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>{n.remove()})}async function S(){const t=document.getElementById("kota");if(!t){console.warn("Kota dropdown not found in the DOM.");return}try{const{data:e,error:a}=await s.from("kota").select("id, kota");if(a)throw a;t.innerHTML='<option value="" disabled selected>Pilih Kota</option>',e.forEach(n=>{const o=document.createElement("option");o.value=n.id,o.text=n.kota,t.appendChild(o)})}catch(e){console.error("Error fetching cities:",e.message),l("Failed to load cities. Please try again.","error")}}async function x(){const t=document.getElementById("perusahaan").value,e=document.getElementById("cp").value,a=document.getElementById("no_hp").value,n=document.getElementById("kota").value,o=document.getElementById("supplierForm").dataset.supplierId;try{if(o){const{data:c,error:r}=await s.from("supplier").update({perusahaan:t,cp:e,no_hp:a,id_kota:n}).eq("id",o);if(r)throw r;l("Supplier updated successfully!","success")}else{const{data:c,error:r}=await s.from("supplier").insert([{perusahaan:t,cp:e,no_hp:a,id_kota:n}]);if(r)throw r;l("Supplier added successfully!","success")}bootstrap.Modal.getInstance(document.getElementById("supplierModal")).hide(),await h()}catch(i){console.error("Error saving supplier:",i.message),l("Failed to save supplier. Please try again.","error")}}async function C(t){try{const{data:e,error:a}=await s.from("supplier").select("*").eq("id",t).single();if(a)throw a;document.getElementById("perusahaan").value=e.perusahaan,document.getElementById("cp").value=e.cp,document.getElementById("no_hp").value=e.no_hp,document.getElementById("kota").value=e.id_kota,document.getElementById("supplierModalLabel").textContent="Edit Supplier",document.getElementById("submitButton").textContent="Update Supplier",document.getElementById("supplierForm").dataset.supplierId=t,new bootstrap.Modal(document.getElementById("supplierModal")).show()}catch(e){console.error("Error fetching supplier:",e.message),l("Failed to load supplier data. Please try again.","error")}}async function F(t){if(confirm("Are you sure you want to delete this supplier?"))try{const{data:e,error:a}=await s.from("supplier").delete().eq("id",t);if(a)throw a;await h(),l("Supplier deleted successfully!","success")}catch(e){console.error("Error deleting supplier:",e.message),l("Failed to delete supplier. Please try again.","error")}}async function h(){const t=document.getElementById("supplierTableBody");if(t)try{t.innerHTML=`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;const{data:e,error:a}=await s.from("supplier").select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota: id_kota (kota)
            `);if(a)throw a;if(t.innerHTML="",!e||e.length===0){modalProductTable.innerHTML=`
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Tidak ada supplier ditemukan
                    </td>
                </tr>`;return}e.forEach(n=>{var i;const o=document.createElement("tr");o.innerHTML=`
                <td>${n.id}</td>
                <td>${n.perusahaan?n.perusahaan:"-"}</td>
                <td>${n.cp?n.cp:"-"}</td>
                <td>${n.no_hp?n.no_hp:"-"}</td> 
                <td>${(i=n.kota)!=null&&i.kota?n.kota.kota:"-"}</td> 
                <td>
                    <button class="btn btn-info btn-sm" onclick="showSupplierProducts(${n.id})">Produk</button>
                    <button class="btn btn-primary btn-sm" onclick="editSupplier(${n.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${n.id})">Delete</button>
                </td>
            `,t.appendChild(o)})}catch(e){console.error("Error fetching supplier:",e.message),l("Gagal menampilkan data supplier, silahkan coba lagi.","error")}}const d={type:null,kota:null};function H(){var e,a;const t=document.getElementById("filterKota");t&&t.addEventListener("click",function(n){if(this.checked&&d.type==="kota"){this.checked=!1,g();return}d.type="kota",P()}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",k),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",g)}async function P(){var e,a;const t=document.getElementById("filterOptionsContainer");t.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),t.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Kota</label>
            <select class="form-select" id="dropdownKota">
                <option value="">Memuat kota...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await D(),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",k),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",g)}async function D(){try{const{data:t,error:e}=await s.from("supplier").select("id_kota").not("id_kota","is",null).order("id_kota",{ascending:!0});if(e)throw e;const a=[...new Set(t.map(c=>c.id_kota))],{data:n,error:o}=await s.from("kota").select("id, kota").in("id",a).order("kota",{ascending:!0});if(o)throw o;const i=document.getElementById("dropdownKota");i.innerHTML='<option value="">Pilih Kota</option>',n.forEach(c=>{const r=document.createElement("option");r.value=c.id,r.textContent=c.kota,i.appendChild(r)})}catch(t){console.error("Error loading kota:",t),l("Gagal memuat daftar kota","error")}}function k(){d.kota=null,d.type==="kota"&&(d.kota=document.getElementById("dropdownKota").value),E()}function g(){const t=document.getElementById("filterKota");t&&(t.checked=!1),d.type=null,d.kota=null,document.getElementById("filterCard").classList.add("d-none"),h()}async function E(){const t=document.getElementById("supplierTableBody");try{t.innerHTML=`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;let e=s.from("supplier").select(`
                id, 
                perusahaan, 
                cp, 
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});d.type==="kota"&&d.kota&&(e=e.eq("id_kota",d.kota));const{data:a,error:n}=await e;if(n)throw n;w(a)}catch(e){console.error("Error filtering suppliers:",e),l("Gagal memfilter supplier","error"),t.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`}}async function f(){const t=document.getElementById("searchInput").value.trim().toLowerCase();try{const e=document.getElementById("supplierTableBody");e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;let a=s.from("supplier").select(`
                id, 
                perusahaan, 
                cp, 
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});d.type==="kota"&&d.kota&&(a=a.eq("id_kota",d.kota));const n=a;t&&n.or(`perusahaan.ilike.%${t}%,cp.ilike.%${t}%,no_hp.ilike.%${t}%`);const{data:o,error:i}=await n;let c=[];if(t&&!(d.type==="kota"&&d.kota)){const{data:u,error:p}=await s.from("kota").select("id, kota").ilike("kota",`%${t}%`);if(!p&&(u==null?void 0:u.length)>0){const m=u.map(I=>I.id),{data:y,error:v}=await a.in("id_kota",m);v||(c=y||[])}}let r;t?r=[...o||[],...c].reduce((p,m)=>(p.some(y=>y.id===m.id)||p.push(m),p),[]):r=o||[],w(r)}catch(e){console.error("Error searching suppliers:",e),l("Gagal melakukan pencarian supplier","error"),document.getElementById("supplierTableBody").innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`}}function w(t){const e=document.getElementById("supplierTableBody");if(e.innerHTML="",!t||t.length===0){e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Tidak ada supplier yang cocok dengan pencarian
                </td>
            </tr>`;return}t.forEach(a=>{var o;const n=document.createElement("tr");n.innerHTML=`
            <td>${a.id}</td>
            <td>${a.perusahaan||"-"}</td>
            <td>${a.cp}</td>
            <td>${a.no_hp||"-"}</td>
            <td>${((o=a.kota)==null?void 0:o.kota)||"-"}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="showSupplierProducts(${a.id})">Produk</button>
                <button class="btn btn-primary btn-sm" onclick="editSupplier(${a.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${a.id})">Delete</button>
            </td>
        `,e.appendChild(n)})}function b(){const t=document.getElementById("searchInput"),e=document.getElementById("searchIcon");t.value.trim()?e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`:e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`}function K(){document.getElementById("searchInput").value="",b(),E()}async function A(t){try{const{data:e,error:a}=await s.from("supplier").select("perusahaan").eq("id",t).single();if(a)throw a;const{data:n,error:o}=await s.from("produk").select(`
                id,
                nama,
                var: produk_varian(
                    id,
                    varian
                )
            `).eq("id_supplier",t).order("id",{ascending:!0});if(o)throw o;console.log(n),document.getElementById("supplierProductsModalLabel").textContent=`Produk dari ${e.perusahaan}`;const i=document.getElementById("supplierProductsTableBody");n.forEach(r=>{if(r.var&&r.var.length>0){const u=document.createElement("tr");u.innerHTML=`
                    <td colspan="5" class="fw-bold bg-light">
                        ${r.nama} (ID: ${r.id})
                    </td>
                `,i.appendChild(u),r.var.forEach(p=>{const m=document.createElement("tr");m.innerHTML=`
                        <td>${p.id}</td>
                        <td>${p.varian}</td>
                    `,i.appendChild(m)})}}),new bootstrap.Modal(document.getElementById("supplierProductsModal")).show()}catch(e){console.error("Error fetching supplier products:",e),l("Failed to load supplier products","error")}}document.addEventListener("DOMContentLoaded",async()=>{await S(),M(),await h(),await T(),H();const t=document.getElementById("supplierForm");t&&t.addEventListener("submit",async o=>{o.preventDefault(),await x()});const e=document.getElementById("supplierModal");e&&e.addEventListener("hidden.bs.modal",()=>{_()});const a=document.getElementById("searchInput"),n=document.getElementById("searchButton");n&&a&&(n.addEventListener("click",()=>{a.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?K():f()}),a.addEventListener("keyup",o=>{b(),o.key==="Enter"&&f()}),a.addEventListener("input",b))});window.editSupplier=C;window.deleteSupplier=F;window.showSupplierProducts=A;
