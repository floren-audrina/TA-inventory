import supabase from './db_conn.js';
import { checkAuth, initAuthStateListener } from './auth.js';
import { displayUnpaidNotice } from './import.js';

initAuthStateListener();

(async () => {
    // Auth check - will redirect if not logged in
    await checkAuth(); 
})();

// Function to reset the form
function resetForm() {
    const bakulForm = document.getElementById('bakulForm');
    if (bakulForm) {
        bakulForm.reset(); // Reset all form fields
        bakulForm.dataset.bakulId = ''; // Clear the supplier ID
        document.getElementById('bakulModalLabel').textContent = 'Tambah Bakul'; // Reset modal title
        document.getElementById('submitButton').textContent = 'Tambah'; // Reset submit button text
    }
}

// Function to show toast messages
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');

    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    // Add background color based on type
    toast.classList.add(type === 'success' ? 'bg-success' : 'bg-danger');
    toast.classList.add('text-white');

    // Toast body
    const toastBody = document.createElement('div');
    toastBody.classList.add('toast-body');
    toastBody.textContent = message;

    // Append body to toast
    toast.appendChild(toastBody);

    // Append toast to container
    toastContainer.appendChild(toast);

    // Initialize Bootstrap toast
    const bootstrapToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000, // Toast will disappear after 3 seconds
    });

    // Show toast
    bootstrapToast.show();

    // Remove toast from DOM after it hides
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Function to populate the "Kota" dropdown
async function populateKotaDropdown() {
    const kotaDropdown = document.getElementById('kota');

    if (!kotaDropdown) {
        console.warn('Kota dropdown not found in the DOM.');
        return;
    }

    try {
        // Fetch data from the "kota" table
        const { data, error } = await supabase
            .from('kota')
            .select('id, kota');

        if (error) {
            throw error;
        }

        // Clear existing options and add a default option
        kotaDropdown.innerHTML = '<option value="" disabled selected>Pilih Kota</option>';

        // Populate dropdown with cities
        data.forEach((kota) => {
            const optionElement = document.createElement('option');
            optionElement.value = kota.id;
            optionElement.text = kota.kota;
            kotaDropdown.appendChild(optionElement);
        });
    } catch (error) {
        console.error('Error fetching cities:', error.message);
        showToast('Failed to load cities. Please try again.', 'error');
    }
}

// Function to handle form submission (for both add and edit)
async function handleFormSubmit() {
    const nama = document.getElementById('nama').value;
    const no_hp = document.getElementById('no_hp').value;
    const id_kota = document.getElementById('kota').value;
    const bakulId = document.getElementById('bakulForm').dataset.bakulId;

    try {
        if (bakulId) {
            // Update existing supplier
            const { data, error } = await supabase
                .from('bakul')
                .update({
                    nama: nama,
                    no_hp: no_hp,
                    id_kota: id_kota,
                })
                .eq('id', bakulId);

            if (error) {
                throw error;
            }

            showToast('Data bakul berhasil diperbarui!', 'success');
        } else {
            // Insert new supplier
            const { data, error } = await supabase
                .from('bakul')
                .insert([
                    {
                        nama: nama,
                        no_hp: no_hp,
                        id_kota: id_kota,
                    },
                ]);

            if (error) {
                throw error;
            }

            showToast('Data bakul berhasil ditambahkan!', 'success');
        }

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('bakulModal'));
        modal.hide();

        // Refresh the supplier list
        await fetchBakul();
    } catch (error) {
        console.error('Error saving supplier:', error.message);
        showToast('Gagal menyimpan data bakul, silahkan coba lagi.', 'error');
    }
}

// Function to edit a supplier
async function editBakul(bakulId) {
    try {
        // Fetch supplier data by ID
        const { data, error } = await supabase
            .from('bakul')
            .select('*')
            .eq('id', bakulId)
            .single();

        if (error) {
            throw error;
        }

        // Populate the form with the fetched data
        document.getElementById('nama').value = data.nama;
        document.getElementById('no_hp').value = data.no_hp;
        document.getElementById('kota').value = data.id_kota;

        // Change the modal title and submit button text
        document.getElementById('bakulModalLabel').textContent = 'Edit Bakul';
        document.getElementById('submitButton').textContent = 'Edit';

        // Store the supplier ID in a hidden field or data attribute
        document.getElementById('bakulForm').dataset.bakulId = bakulId;

        // Open the modal
        const modal = new bootstrap.Modal(document.getElementById('bakulModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching supplier:', error.message);
        showToast('Gagal mengambil data bakul, silahkan coba lagi.', 'error');
    }
}

// Function to delete a supplier
async function deleteBakul(bakulId) {
    if (confirm('Apakah Anda yakin ingin menghapus data bakul ini?')) {
        try {
            const { data, error } = await supabase
                .from('bakul')
                .delete()
                .eq('id', bakulId);

            if (error) {
                throw error;
            }

            // Refresh the supplier list
            await fetchBakul();
            showToast('Data bakul berhasil dihapus!', 'success');
        } catch (error) {
            console.error('Error deleting supplier:', error.message);
            showToast('Gagal menghapus data bakul, silahkan coba lagi.', 'error');
        }
    }
}

// Function to fetch and display suppliers
async function fetchBakul() {
    const bakulTableBody = document.getElementById('bakulTableBody');

    if (!bakulTableBody) return;

    try {
        bakulTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;
        // Fetch data from the "bakul" table (join with "kota" table to get city names)
        const { data, error } = await supabase
            .from('bakul')
            .select(`
                id,
                nama,
                no_hp,
                kota: id_kota (kota)
            `)
            .order('id', { ascending: true }); // Sort by 'id' in ascending order

        if (error) {
            throw error;
        }

        // Clear existing table rows
        bakulTableBody.innerHTML = '';

        if (!data || data.length === 0) {
            modalProductTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        Tidak ada bakul ditemukan
                    </td>
                </tr>`;
            return;
        }

        // Populate the table with bakul data
        data.forEach((bakul) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${bakul.id}</td>
                <td>${bakul.nama}</td>
                <td>${bakul.no_hp ? bakul.no_hp : '-'}</td> <!-- Handle null for no_hp -->
                <td>${bakul.kota?.kota ? bakul.kota.kota : '-'}</td> <!-- Handle null for kota -->
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editBakul(${bakul.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBakul(${bakul.id})">Delete</button>
                </td>
            `;

            bakulTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching bakul:', error.message);
        showToast('Gagal menampilkan data bakul, silahkan coba lagi.', 'error');
    }
}

// filter functions
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
        const { data, error } = await supabase
            .from('kota')
            .select('id, kota')
            .order('kota', { ascending: true });

        if (error) throw error;
        
        const select = document.getElementById('dropdownKota');
        select.innerHTML = '<option value="">Pilih Kota</option>';
        
        data.forEach(kota => {
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
    filterBakuls();
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
async function filterBakuls() {
    const tbody = document.getElementById('bakulTableBody');
    
    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;

        let query = supabase
            .from('bakul')
            .select(`
                id, 
                nama,
                no_hp,
                kota:id_kota(kota)
            `)
            .order('id', { ascending: true });

        // Apply kota filter if active
        if (activeFilters.type === 'kota' && activeFilters.kota) {
            query = query.eq('id_kota', activeFilters.kota);
        }

        const { data: bakuls, error } = await query;
        if (error) throw error;

        // Update the table
        updateBakulTable(bakuls);

    } catch (error) {
        console.error('Error filtering bakuls:', error);
        showToast('Gagal memfilter bakul', 'error');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal memuat data bakul
                </td>
            </tr>`;
    }
}

// search functions
async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    try {
        const tbody = document.getElementById('bakulTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;

        // Base query with kota filter if active
        let baseQuery = supabase
            .from('bakul')
            .select(`
                id, 
                nama,
                no_hp,
                kota:id_kota(kota)
            `)
            .order('id', { ascending: true });

        // Apply kota filter if active
        if (activeFilters.type === 'kota' && activeFilters.kota) {
            baseQuery = baseQuery.eq('id_kota', activeFilters.kota);
        }

        // 1. Search bakuls by direct fields (nama, no_hp)
        const directSearchQuery = baseQuery;
        if (searchTerm) {
            directSearchQuery.or(`nama.ilike.%${searchTerm}%,no_hp.ilike.%${searchTerm}%`);
        }
        const { data: bakulsDirect, error: directError } = await directSearchQuery;

        // 2. Search bakuls by kota name (only if searching and no kota filter already applied)
        let bakulsByKota = [];
        if (searchTerm && !(activeFilters.type === 'kota' && activeFilters.kota)) {
            const { data: kotaResults, error: kotaError } = await supabase
                .from('kota')
                .select('id, kota')
                .ilike('kota', `%${searchTerm}%`);

            if (!kotaError && kotaResults?.length > 0) {
                const kotaIds = kotaResults.map(k => k.id);
                const { data, error } = await baseQuery.in('id_kota', kotaIds);
                if (!error) bakulsByKota = data || [];
            }
        }

        // Combine results (if searching) or use direct results (if just filtering)
        let resultsToDisplay;
        if (searchTerm) {
            const combinedResults = [
                ...(bakulsDirect || []),
                ...bakulsByKota
            ];
            resultsToDisplay = combinedResults.reduce((acc, bakul) => {
                if (!acc.some(b => b.id === bakul.id)) {
                    acc.push(bakul);
                }
                return acc;
            }, []);
        } else {
            resultsToDisplay = bakulsDirect || [];
        }

        // Update the table with final results
        updateBakulTable(resultsToDisplay);

    } catch (error) {
        console.error('Error searching bakuls:', error);
        showToast('Gagal melakukan pencarian bakul', 'error');
        document.getElementById('bakulTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal memuat data bakul
                </td>
            </tr>`;
    }
}

// Update bakul table display
function updateBakulTable(bakuls) {
    const tbody = document.getElementById('bakulTableBody');
    tbody.innerHTML = '';

    if (!bakuls || bakuls.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Tidak ada bakul yang cocok dengan pencarian
                </td>
            </tr>`;
        return;
    }

    bakuls.forEach(bakul => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bakul.id}</td>
            <td>${bakul.nama || '-'}</td>
            <td>${bakul.no_hp || '-'}</td>
            <td>${bakul.kota?.kota || '-'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editBakul(${bakul.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteBakul(${bakul.id})">Delete</button>
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
    filterBakuls(); // Maintain active filters when clearing search
}

document.addEventListener('DOMContentLoaded', async () => {
    await displayUnpaidNotice();
    // Fetch cities from the "kota" table and populate the dropdown
    await populateKotaDropdown();
    await fetchBakul();

    initializeFilters();

    // Handle form submission
    const bakulForm = document.getElementById('bakulForm');
    if (bakulForm) {
        bakulForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleFormSubmit();
        });
    }

    // Reset form when modal is hidden
    const bakulModal = document.getElementById('bakulModal');
    if (bakulModal) {
        bakulModal.addEventListener('hidden.bs.modal', () => {
            resetForm();
        });
    }

    // Search functionality (updated to match product.js behavior)
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

// Expose editProduct to the global scope
window.editBakul = editBakul;
window.deleteBakul = deleteBakul;