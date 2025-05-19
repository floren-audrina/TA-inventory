import"./modulepreload-polyfill-B5Qt9EMX.js";import{s as i}from"./db_conn-C7Nb5uSA.js";let l;function m(){l=$("#supplierTable").DataTable({dom:'<"top"<"row"<"col-md-6"l><"col-md-6 d-flex justify-content-end align-items-center"f>>>rt<"bottom"ip>',language:{search:"",searchPlaceholder:"Cari Supplier",lengthMenu:"Tampilkan _MENU_ entri per halaman",info:"Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",paginate:{first:"Pertama",last:"Terakhir",next:"Berikutnya",previous:"Sebelumnya"}},columnDefs:[{width:"5%",targets:0},{width:"15%",targets:1},{width:"15%",targets:2},{width:"15%",targets:3},{width:"15%",targets:4},{width:"10%",targets:5,orderable:!1}],columns:[{data:"id"},{data:"perusahaan"},{data:"cp"},{data:"no_hp"},{data:"kota"},{data:null,render:function(e,t,a){return`
                        <button class="btn btn-primary btn-sm" onclick="window.editSupplier(${a.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteSupplier(${a.id})">Delete</button>
                    `}}],autoWidth:!1,scrollX:!0,fixedColumns:!0})}function f(){const e=document.getElementById("supplierForm");e&&(e.reset(),e.dataset.supplierId="",document.getElementById("supplierModalLabel").textContent="Add Supplier",document.getElementById("submitButton").textContent="Add Supplier")}function n(e,t="success"){const a=document.getElementById("toastContainer"),r=document.createElement("div");r.classList.add("toast"),r.setAttribute("role","alert"),r.setAttribute("aria-live","assertive"),r.setAttribute("aria-atomic","true"),r.classList.add(t==="success"?"bg-success":"bg-danger"),r.classList.add("text-white");const o=document.createElement("div");o.classList.add("toast-body"),o.textContent=e,r.appendChild(o),a.appendChild(r),new bootstrap.Toast(r,{autohide:!0,delay:3e3}).show(),r.addEventListener("hidden.bs.toast",()=>{r.remove()})}async function g(){const e=document.getElementById("kota");if(!e){console.warn("Kota dropdown not found in the DOM.");return}try{const{data:t,error:a}=await i.from("kota").select("id, kota");if(a)throw a;e.innerHTML='<option value="" disabled selected>Pilih Kota</option>',t.forEach(r=>{const o=document.createElement("option");o.value=r.id,o.text=r.kota,e.appendChild(o)})}catch(t){console.error("Error fetching cities:",t.message),n("Failed to load cities. Please try again.","error")}}async function E(){const e=document.getElementById("perusahaan").value,t=document.getElementById("cp").value,a=document.getElementById("no_hp").value,r=document.getElementById("kota").value,o=document.getElementById("supplierForm").dataset.supplierId;try{if(o){const{data:y,error:d}=await i.from("supplier").update({perusahaan:e,cp:t,no_hp:a,id_kota:r}).eq("id",o);if(d)throw d;n("Supplier updated successfully!","success")}else{const{data:y,error:d}=await i.from("supplier").insert([{perusahaan:e,cp:t,no_hp:a,id_kota:r}]);if(d)throw d;n("Supplier added successfully!","success")}bootstrap.Modal.getInstance(document.getElementById("supplierModal")).hide(),await c()}catch(p){console.error("Error saving supplier:",p.message),n("Failed to save supplier. Please try again.","error")}}async function b(e){try{const{data:t,error:a}=await i.from("supplier").select("*").eq("id",e).single();if(a)throw a;document.getElementById("perusahaan").value=t.perusahaan,document.getElementById("cp").value=t.cp,document.getElementById("no_hp").value=t.no_hp,document.getElementById("kota").value=t.id_kota,document.getElementById("supplierModalLabel").textContent="Edit Supplier",document.getElementById("submitButton").textContent="Update Supplier",document.getElementById("supplierForm").dataset.supplierId=e,new bootstrap.Modal(document.getElementById("supplierModal")).show()}catch(t){console.error("Error fetching supplier:",t.message),n("Failed to load supplier data. Please try again.","error")}}async function k(e){if(confirm("Are you sure you want to delete this supplier?"))try{const{data:t,error:a}=await i.from("supplier").delete().eq("id",e);if(a)throw a;await c(),n("Supplier deleted successfully!","success")}catch(t){console.error("Error deleting supplier:",t.message),n("Failed to delete supplier. Please try again.","error")}}async function c(){try{$("#supplierTableBody").html(`
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
            `);if(t)throw t;const a=e.map(r=>{var o;return{id:r.id,perusahaan:r.perusahaan||"-",cp:r.cp,no_hp:r.no_hp||"-",kota:((o=r.kota)==null?void 0:o.kota)||"-",id:r.id}});l?l.clear().rows.add(a).draw():(m(),l.rows.add(a).draw())}catch(e){console.error("Error fetching suppliers:",e.message),n("Failed to load suppliers. Please try again.","error"),$("#supplierTableBody").html(`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`)}}const s={type:null,kota:null};function w(){var t,a;const e=document.getElementById("filterKota");e&&e.addEventListener("click",function(r){if(this.checked&&s.type==="kota"){this.checked=!1,u();return}s.type="kota",v()}),(t=document.getElementById("applyFilter"))==null||t.addEventListener("click",h),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",u)}async function v(){var t,a;const e=document.getElementById("filterOptionsContainer");e.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),e.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Kota</label>
            <select class="form-select" id="dropdownKota">
                <option value="">Memuat kota...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await I(),(t=document.getElementById("applyFilter"))==null||t.addEventListener("click",h),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",u)}async function I(){try{const{data:e,error:t}=await i.from("kota").select("id, kota").order("kota",{ascending:!0});if(t)throw t;const a=document.getElementById("dropdownKota");a.innerHTML='<option value="">Pilih Kota</option>',e.forEach(r=>{const o=document.createElement("option");o.value=r.id,o.textContent=r.kota,a.appendChild(o)})}catch(e){console.error("Error loading kota:",e),n("Gagal memuat daftar kota","error")}}function h(){s.kota=null,s.type==="kota"&&(s.kota=document.getElementById("dropdownKota").value),B()}function u(){const e=document.getElementById("filterKota");e&&(e.checked=!1),s.type=null,s.kota=null,document.getElementById("filterCard").classList.add("d-none"),c()}async function B(){const e=document.getElementById("supplierTableBody");try{e.innerHTML=`
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
            `).order("id",{ascending:!0});s.type==="kota"&&s.kota&&(t=t.eq("id_kota",s.kota));const{data:a,error:r}=await t;if(r)throw r;updateSupplierTable(a)}catch(t){console.error("Error filtering suppliers:",t),n("Gagal memfilter supplier","error"),e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`}}document.addEventListener("DOMContentLoaded",async()=>{await g(),m(),await c(),w();const e=document.getElementById("supplierForm");e&&e.addEventListener("submit",async o=>{o.preventDefault(),await E()});const t=document.getElementById("supplierModal");t&&t.addEventListener("hidden.bs.modal",()=>{f()});const a=document.getElementById("searchInput"),r=document.getElementById("searchButton");r&&a&&(r.addEventListener("click",()=>{a.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?clearSearch():performSearch()}),a.addEventListener("keyup",o=>{updateSearchIcon(),o.key==="Enter"&&performSearch()}),a.addEventListener("input",updateSearchIcon))});window.editSupplier=b;window.deleteSupplier=k;
