import"./modulepreload-polyfill-B5Qt9EMX.js";import{n as f}from"./navbar-Cw31nkU0.js";import{s as i}from"./db_conn-C7Nb5uSA.js";fetch("navbar.html").then(e=>e.text()).then(e=>{document.getElementById("navbar").innerHTML=e;const t=document.createElement("script");t.type="module",t.src=f,document.body.appendChild(t)}).catch(e=>console.error("Error loading navbar:",e));let l;function m(){l=$("#supplierTable").DataTable({dom:'<"top"<"row"<"col-md-6"l><"col-md-6 d-flex justify-content-end align-items-center"f>>>rt<"bottom"ip>',language:{search:"",searchPlaceholder:"Cari Supplier",lengthMenu:"Tampilkan _MENU_ entri per halaman",info:"Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",paginate:{first:"Pertama",last:"Terakhir",next:"Berikutnya",previous:"Sebelumnya"}},columnDefs:[{width:"5%",targets:0},{width:"15%",targets:1},{width:"15%",targets:2},{width:"15%",targets:3},{width:"15%",targets:4},{width:"10%",targets:5,orderable:!1}],columns:[{data:"id"},{data:"perusahaan"},{data:"cp"},{data:"no_hp"},{data:"kota"},{data:null,render:function(e,t,a){return`
                        <button class="btn btn-primary btn-sm" onclick="window.editSupplier(${a.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteSupplier(${a.id})">Delete</button>
                    `}}],autoWidth:!1,scrollX:!0,fixedColumns:!0})}function g(){const e=document.getElementById("supplierForm");e&&(e.reset(),e.dataset.supplierId="",document.getElementById("supplierModalLabel").textContent="Add Supplier",document.getElementById("submitButton").textContent="Add Supplier")}function o(e,t="success"){const a=document.getElementById("toastContainer"),r=document.createElement("div");r.classList.add("toast"),r.setAttribute("role","alert"),r.setAttribute("aria-live","assertive"),r.setAttribute("aria-atomic","true"),r.classList.add(t==="success"?"bg-success":"bg-danger"),r.classList.add("text-white");const n=document.createElement("div");n.classList.add("toast-body"),n.textContent=e,r.appendChild(n),a.appendChild(r),new bootstrap.Toast(r,{autohide:!0,delay:3e3}).show(),r.addEventListener("hidden.bs.toast",()=>{r.remove()})}async function E(){const e=document.getElementById("kota");if(!e){console.warn("Kota dropdown not found in the DOM.");return}try{const{data:t,error:a}=await i.from("kota").select("id, kota");if(a)throw a;e.innerHTML='<option value="" disabled selected>Pilih Kota</option>',t.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.text=r.kota,e.appendChild(n)})}catch(t){console.error("Error fetching cities:",t.message),o("Failed to load cities. Please try again.","error")}}async function b(){const e=document.getElementById("perusahaan").value,t=document.getElementById("cp").value,a=document.getElementById("no_hp").value,r=document.getElementById("kota").value,n=document.getElementById("supplierForm").dataset.supplierId;try{if(n){const{data:y,error:d}=await i.from("supplier").update({perusahaan:e,cp:t,no_hp:a,id_kota:r}).eq("id",n);if(d)throw d;o("Supplier updated successfully!","success")}else{const{data:y,error:d}=await i.from("supplier").insert([{perusahaan:e,cp:t,no_hp:a,id_kota:r}]);if(d)throw d;o("Supplier added successfully!","success")}bootstrap.Modal.getInstance(document.getElementById("supplierModal")).hide(),await c()}catch(p){console.error("Error saving supplier:",p.message),o("Failed to save supplier. Please try again.","error")}}async function k(e){try{const{data:t,error:a}=await i.from("supplier").select("*").eq("id",e).single();if(a)throw a;document.getElementById("perusahaan").value=t.perusahaan,document.getElementById("cp").value=t.cp,document.getElementById("no_hp").value=t.no_hp,document.getElementById("kota").value=t.id_kota,document.getElementById("supplierModalLabel").textContent="Edit Supplier",document.getElementById("submitButton").textContent="Update Supplier",document.getElementById("supplierForm").dataset.supplierId=e,new bootstrap.Modal(document.getElementById("supplierModal")).show()}catch(t){console.error("Error fetching supplier:",t.message),o("Failed to load supplier data. Please try again.","error")}}async function w(e){if(confirm("Are you sure you want to delete this supplier?"))try{const{data:t,error:a}=await i.from("supplier").delete().eq("id",e);if(a)throw a;await c(),o("Supplier deleted successfully!","success")}catch(t){console.error("Error deleting supplier:",t.message),o("Failed to delete supplier. Please try again.","error")}}async function c(){try{$("#supplierTableBody").html(`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`);const{data:e,error:t}=await i.from("supplier").select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota: id_kota (kota)
            `);if(t)throw t;const a=e.map(r=>{var n;return{id:r.id,perusahaan:r.perusahaan||"-",cp:r.cp,no_hp:r.no_hp||"-",kota:((n=r.kota)==null?void 0:n.kota)||"-",id:r.id}});l?l.clear().rows.add(a).draw():(m(),l.rows.add(a).draw())}catch(e){console.error("Error fetching suppliers:",e.message),o("Failed to load suppliers. Please try again.","error"),$("#supplierTableBody").html(`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`)}}const s={type:null,kota:null};function v(){var t,a;const e=document.getElementById("filterKota");e&&e.addEventListener("click",function(r){if(this.checked&&s.type==="kota"){this.checked=!1,u();return}s.type="kota",I()}),(t=document.getElementById("applyFilter"))==null||t.addEventListener("click",h),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",u)}async function I(){var t,a;const e=document.getElementById("filterOptionsContainer");e.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),e.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Kota</label>
            <select class="form-select" id="dropdownKota">
                <option value="">Memuat kota...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await B(),(t=document.getElementById("applyFilter"))==null||t.addEventListener("click",h),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",u)}async function B(){try{const{data:e,error:t}=await i.from("kota").select("id, kota").order("kota",{ascending:!0});if(t)throw t;const a=document.getElementById("dropdownKota");a.innerHTML='<option value="">Pilih Kota</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.kota,a.appendChild(n)})}catch(e){console.error("Error loading kota:",e),o("Gagal memuat daftar kota","error")}}function h(){s.kota=null,s.type==="kota"&&(s.kota=document.getElementById("dropdownKota").value),L()}function u(){const e=document.getElementById("filterKota");e&&(e.checked=!1),s.type=null,s.kota=null,document.getElementById("filterCard").classList.add("d-none"),c()}async function L(){const e=document.getElementById("supplierTableBody");try{e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;let t=i.from("supplier").select(`
                id, 
                perusahaan, 
                cp, 
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});s.type==="kota"&&s.kota&&(t=t.eq("id_kota",s.kota));const{data:a,error:r}=await t;if(r)throw r;updateSupplierTable(a)}catch(t){console.error("Error filtering suppliers:",t),o("Gagal memfilter supplier","error"),e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`}}document.addEventListener("DOMContentLoaded",async()=>{await E(),m(),await c(),v();const e=document.getElementById("supplierForm");e&&e.addEventListener("submit",async n=>{n.preventDefault(),await b()});const t=document.getElementById("supplierModal");t&&t.addEventListener("hidden.bs.modal",()=>{g()});const a=document.getElementById("searchInput"),r=document.getElementById("searchButton");r&&a&&(r.addEventListener("click",()=>{a.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?clearSearch():performSearch()}),a.addEventListener("keyup",n=>{updateSearchIcon(),n.key==="Enter"&&performSearch()}),a.addEventListener("input",updateSearchIcon))});window.editSupplier=k;window.deleteSupplier=w;
