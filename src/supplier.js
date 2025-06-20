import supabase from './db_conn.js';
import { checkAuth, initAuthStateListener } from './auth.js';
import { displayUnpaidNotice } from './import.js';

initAuthStateListener();

(async () => {
    await checkAuth();
})();

function resetForm() {
    const supplierForm = document.getElementById('supplierForm');
    if (supplierForm) {
        supplierForm.reset();
        supplierForm.dataset.supplierId = '';
        document.getElementById('supplierModalLabel').textContent = 'Add Supplier';
        document.getElementById('submitButton').textContent = 'Add Supplier';
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error('Toast container not found!');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

async function populateKotaDropdown() {
    const kotaDropdown = document.getElementById('kota');

    if (!kotaDropdown) return;

    try {
        const { data, error } = await supabase
            .from('kota')
            .select('id, kota');

        if (error) throw error;

        kotaDropdown.innerHTML = '<option value="" disabled selected>Pilih Kota</option>';

        data.forEach((kota) => {
            const optionElement = document.createElement('option');
            optionElement.value = kota.id;
            optionElement.text = kota.kota;
            kotaDropdown.appendChild(optionElement);
        });
    } catch (error) {
        console.error('Error fetching cities:', error.message);
        showToast('Gagal memuat kota. Silahkan coba lagi.', 'error');
    }
}

async function handleFormSubmit() {
    try {
        const perusahaan = document.getElementById('perusahaan').value;
        const cp = document.getElementById('cp').value;
        const no_hp = document.getElementById('no_hp').value;
        const id_kota = document.getElementById('kota').value;
        const supplierId = document.getElementById('supplierForm').dataset.supplierId;

        if (supplierId) {
            const {error} = await supabase
                .from('supplier')
                .update({ perusahaan, cp, no_hp, id_kota })
                .eq('id', supplierId);

            if (error) {
                throw error;
            }

            showToast('Data supplier berhasil diperbarui!', 'success');
        } else {
            const {error} = await supabase
                .from('supplier')
                .insert([{ perusahaan, cp, no_hp, id_kota }]);

            if (error) {
                throw error;
            }

            showToast('Data supplier berhasil ditambahkan!', 'success');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
        modal.hide();
        
        await fetchSuppliers();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Gagal menyimpan supplier, silahkan coba lagi.', 'error');
    }
}

async function editSupplier(supplierId) {
    try {
        const { data, error } = await supabase
            .from('supplier')
            .select('*')
            .eq('id', supplierId)
            .single();

        if (error) throw error;

        document.getElementById('perusahaan').value = data.perusahaan;
        document.getElementById('cp').value = data.cp;
        document.getElementById('no_hp').value = data.no_hp;
        document.getElementById('kota').value = data.id_kota;

        document.getElementById('supplierModalLabel').textContent = 'Edit Supplier';
        document.getElementById('submitButton').textContent = 'Update Supplier';
        document.getElementById('supplierForm').dataset.supplierId = supplierId;

        const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching supplier:', error.message);
        showToast('Gagal memuat data supplier. Silahkan coba lagi.', 'error');
    }
}

async function deleteSupplier(supplierId) {
    if (confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
        try {
            await supabase
                .from('supplier')
                .delete()
                .eq('id', supplierId);

            await fetchSuppliers();
            showToast('Supplier berhasil dihapus!', 'success');
        } catch (error) {
            console.error('Error deleting supplier:', error.message);
            showToast('Gagal menghapus supplier. Silahkan coba lagi.', 'error');
        }
    }
}

async function fetchSuppliers() {
    const supplierTableBody = document.getElementById('supplierTableBody');

    if (!supplierTableBody) return;

    try {
        supplierTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;

        const { data, error } = await supabase
            .from('supplier')
            .select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota: id_kota (kota)
            `);

        if (error) throw error;

        supplierTableBody.innerHTML = '';

        if (!data || data.length === 0) {
            supplierTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Tidak ada supplier ditemukan
                    </td>
                </tr>`;
            return;
        }

        data.forEach((supplier) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.id}</td>
                <td>${supplier.perusahaan || '-'}</td>
                <td>${supplier.cp || '-'}</td>
                <td>${supplier.no_hp || '-'}</td>
                <td>${supplier.kota?.kota || '-'}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="showSupplierProducts(${supplier.id})">Produk</button>
                    <button class="btn btn-primary btn-sm" onclick="editSupplier(${supplier.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${supplier.id})">Delete</button>
                </td>
            `;
            supplierTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching supplier:', error.message);
        showToast('Gagal menampilkan data supplier, silahkan coba lagi.', 'error');
    }
}

// filter functions
// Global filter state
const activeFilters = {
    type: null,
    kota: null
};


// Initialize filter UI components
function initializeFilters() {
    // Handle filter type selection (with uncheck capability)
    const filterRadio = document.getElementById('filterKota');
    if (filterRadio) {
        filterRadio.addEventListener('click', function(e) {
            if (this.checked && activeFilters.type === 'kota') {
                // Clicking the already selected radio should uncheck it
                this.checked = false;
                resetFilters();
                return;
            }
            activeFilters.type = 'kota';
            updateFilterUI();
        });
    }


    // Apply filter button
    document.getElementById('applyFilter')?.addEventListener('click', applyFilters);


    // Reset filter button
    document.getElementById('resetFilter')?.addEventListener('click', resetFilters);
}


// Update filter UI based on selected type
async function updateFilterUI() {
    const container = document.getElementById('filterOptionsContainer');
    container.innerHTML = '';
   
    // Show filter card
    document.getElementById('filterCard').classList.remove('d-none');
   
    // Only kota filter available
    container.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Kota</label>
            <select class="form-select" id="dropdownKota">
                <option value="">Memuat kota...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`;
   
    await loadKotaForFilter();


    // Reattach event listeners for new buttons
    document.getElementById('applyFilter')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilter')?.addEventListener('click', resetFilters);
}


// Load kota for filter
async function loadKotaForFilter() {
    try {
        // First get distinct kota IDs from suppliers
        const { data: supplierKotas, error: supplierError } = await supabase
            .from('supplier')
            .select('id_kota') // Change to your actual column name
            .not('id_kota', 'is', null) // Exclude null values
            .order('id_kota', { ascending: true });


        if (supplierError) throw supplierError;


        // Extract just the kota IDs
        const kotaIds = [...new Set(supplierKotas.map(item => item.id_kota))];


        // Now get kota details only for these IDs
        const { data: kotaData, error: kotaError } = await supabase
            .from('kota')
            .select('id, kota')
            .in('id', kotaIds) // Only cities used by suppliers
            .order('kota', { ascending: true });


        if (kotaError) throw kotaError;
       
        const select = document.getElementById('dropdownKota');
        select.innerHTML = '<option value="">Pilih Kota</option>';
       
        kotaData.forEach(kota => {
            const option = document.createElement('option');
            option.value = kota.id;
            option.textContent = kota.kota;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading kota:', error);
        showToast('Gagal memuat daftar kota', 'error');
    }
}


// Apply selected filters
function applyFilters() {
    // Reset previous filter values
    activeFilters.kota = null;


    // Get current filter values
    if (activeFilters.type === 'kota') {
        activeFilters.kota = document.getElementById('dropdownKota').value;
    }


    // Apply filters to the table
    filterSuppliers();
}


// Reset all filters
function resetFilters() {
    // Uncheck radio button
    const filterRadio = document.getElementById('filterKota');
    if (filterRadio) filterRadio.checked = false;


    // Reset active filters
    activeFilters.type = null;
    activeFilters.kota = null;


    // Hide filter card
    document.getElementById('filterCard').classList.add('d-none');


    // Refresh the supplier list
    fetchSuppliers();
}


// Filter suppliers based on active filters
async function filterSuppliers() {
    const tbody = document.getElementById('supplierTableBody');
   
    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;


        let query = supabase
            .from('supplier')
            .select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota:id_kota(kota)
            `)
            .order('id', { ascending: true });


        // Apply kota filter if active
        if (activeFilters.type === 'kota' && activeFilters.kota) {
            query = query.eq('id_kota', activeFilters.kota);
        }


        const { data: suppliers, error } = await query;
        if (error) throw error;


        // Update the table
        updateSupplierTable(suppliers);


    } catch (error) {
        console.error('Error filtering suppliers:', error);
        showToast('Gagal memfilter supplier', 'error');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`;
    }
}


// search functions
async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
   
    try {
        const tbody = document.getElementById('supplierTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`;


        // Base query with kota filter if active
        let baseQuery = supabase
            .from('supplier')
            .select(`
                id,
                perusahaan,
                cp,
                no_hp,
                kota:id_kota(kota)
            `)
            .order('id', { ascending: true });


        // Apply kota filter if active
        if (activeFilters.type === 'kota' && activeFilters.kota) {
            baseQuery = baseQuery.eq('id_kota', activeFilters.kota);
        }


        // 1. Search suppliers by direct fields (perusahaan, cp, no_hp)
        const directSearchQuery = baseQuery;
        if (searchTerm) {
            directSearchQuery.or(`perusahaan.ilike.%${searchTerm}%,cp.ilike.%${searchTerm}%,no_hp.ilike.%${searchTerm}%`);
        }
        const { data: suppliersDirect, error: directError } = await directSearchQuery;


        // 2. Search suppliers by kota name (only if searching and no kota filter already applied)
        let suppliersByKota = [];
        if (searchTerm && !(activeFilters.type === 'kota' && activeFilters.kota)) {
            const { data: kotaResults, error: kotaError } = await supabase
                .from('kota')
                .select('id, kota')
                .ilike('kota', `%${searchTerm}%`);


            if (!kotaError && kotaResults?.length > 0) {
                const kotaIds = kotaResults.map(k => k.id);
                const { data, error } = await baseQuery.in('id_kota', kotaIds);
                if (!error) suppliersByKota = data || [];
            }
        }


        // Combine results (if searching) or use direct results (if just filtering)
        let resultsToDisplay;
        if (searchTerm) {
            const combinedResults = [
                ...(suppliersDirect || []),
                ...suppliersByKota
            ];
            resultsToDisplay = combinedResults.reduce((acc, supplier) => {
                if (!acc.some(s => s.id === supplier.id)) {
                    acc.push(supplier);
                }
                return acc;
            }, []);
        } else {
            resultsToDisplay = suppliersDirect || [];
        }


        // Update the table with final results
        updateSupplierTable(resultsToDisplay);


    } catch (error) {
        console.error('Error searching suppliers:', error);
        showToast('Gagal melakukan pencarian supplier', 'error');
        document.getElementById('supplierTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`;
    }
}


// Update supplier table display
function updateSupplierTable(suppliers) {
    const tbody = document.getElementById('supplierTableBody');
    tbody.innerHTML = '';


    if (!suppliers || suppliers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Tidak ada supplier yang cocok dengan pencarian
                </td>
            </tr>`;
        return;
    }


    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.id}</td>
            <td>${supplier.perusahaan || '-'}</td>
            <td>${supplier.cp}</td>
            <td>${supplier.no_hp || '-'}</td>
            <td>${supplier.kota?.kota || '-'}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="showSupplierProducts(${supplier.id})">Produk</button>
                <button class="btn btn-primary btn-sm" onclick="editSupplier(${supplier.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${supplier.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


// Search icon and clear functions
function updateSearchIcon() {
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');
   
    if (searchInput.value.trim()) {
        searchIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`;
    } else {
        searchIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`;
    }
}


function clearSearch() {
    document.getElementById('searchInput').value = '';
    updateSearchIcon();
    filterSuppliers(); // Maintain active filters when clearing search
}


async function showSupplierProducts(supplierId) {
    try {
        const { data: supplier, error: supplierError } = await supabase
            .from('supplier')
            .select('perusahaan')
            .eq('id', supplierId)
            .single();
        
        if (supplierError) throw supplierError;

        const { data: products, error: productsError } = await supabase
            .from('produk')
            .select(`
                id,
                nama,
                var: produk_varian(
                    id,
                    varian
                )
            `)
            .eq('id_supplier', supplierId)
            .order('id', { ascending: true });

        if (productsError) throw productsError;

        document.getElementById('supplierProductsModalLabel').textContent = 
            `Produk dari ${supplier.perusahaan}`;

        const tbody = document.getElementById('supplierProductsTableBody');
        tbody.innerHTML = '';

        products.forEach(product => {
            if (product.var && product.var.length > 0) {
                const productRow = document.createElement('tr');
                productRow.innerHTML = `
                    <td colspan="5" class="fw-bold bg-light">
                        ${product.nama} (ID: ${product.id})
                    </td>
                `;
                tbody.appendChild(productRow);

                product.var.forEach(variant => {
                    const variantRow = document.createElement('tr');
                    variantRow.innerHTML = `
                        <td>${variant.id}</td>
                        <td>${variant.varian}</td>
                    `;
                    tbody.appendChild(variantRow);
                });
            }
        });

        const modal = new bootstrap.Modal(document.getElementById('supplierProductsModal'));
        modal.show();

    } catch (error) {
        console.error('Error fetching supplier products:', error);
        showToast('Gagal memuat produk milik supplier', 'error');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateKotaDropdown();
    await fetchSuppliers();
    await displayUnpaidNotice();
    initializeFilters();

    const supplierForm = document.getElementById('supplierForm');
    if (supplierForm) {
        supplierForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleFormSubmit();
        });
    }

    const supplierModal = document.getElementById('supplierModal');
    if (supplierModal) {
        supplierModal.addEventListener('hidden.bs.modal', () => {
            resetForm();
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            if (searchInput.value.trim()) {
                if (document.getElementById('searchIcon').innerHTML.includes('bi-x')) {
                    clearSearch();
                } else {
                    performSearch();
                }
            } else {
                performSearch();
            }
        });
        
        searchInput.addEventListener('keyup', (e) => {
            updateSearchIcon();
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        searchInput.addEventListener('input', updateSearchIcon);
    }
});

window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;
window.showSupplierProducts = showSupplierProducts;