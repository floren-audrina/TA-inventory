import supabase from './db_conn.js';

let supplierTable;

// data table
function initializeDataTable() {
    supplierTable = $('#supplierTable').DataTable({
        dom: '<"top"<"row"<"col-md-6"l><"col-md-6 d-flex justify-content-end align-items-center"f>>>rt<"bottom"ip>',
        language: {
            search: "",
            searchPlaceholder: "Cari Supplier",
            lengthMenu: "Tampilkan _MENU_ entri per halaman",
            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
            paginate: {
                first: "Pertama",
                last: "Terakhir",
                next: "Berikutnya",
                previous: "Sebelumnya"
            }
        },
        columnDefs: [
            { width: "5%", targets: 0 }, // ID column
            { width: "15%", targets: 1 }, // Perusahaan column
            { width: "15%", targets: 2 }, // CP column
            { width: "15%", targets: 3 }, // No HP column
            { width: "15%", targets: 4 }, // Kota column
            { width: "10%", targets: 5, orderable: false } // Action column
        ],
        columns: [
            { data: 'id' },
            { data: 'perusahaan' },
            { data: 'cp' },
            { data: 'no_hp' },
            { data: 'kota' },
            { 
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="btn btn-primary btn-sm" onclick="window.editSupplier(${row.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteSupplier(${row.id})">Delete</button>
                    `;
                }
            }
        ],
        autoWidth: false, // Disable automatic width calculation
        scrollX: true, // Enable horizontal scrolling if needed
        fixedColumns: true // Keep column widths fixed
    });
}

// Function to reset the form
function resetForm() {
    const supplierForm = document.getElementById('supplierForm');
    if (supplierForm) {
        supplierForm.reset(); // Reset all form fields
        supplierForm.dataset.supplierId = ''; // Clear the supplier ID
        document.getElementById('supplierModalLabel').textContent = 'Add Supplier'; // Reset modal title
        document.getElementById('submitButton').textContent = 'Add Supplier'; // Reset submit button text
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
// async function handleFormSubmit() {
//     const perusahaan = document.getElementById('perusahaan').value;
//     const sales = document.getElementById('sales').value;
//     const no_hp = document.getElementById('no_hp').value;
//     const id_kota = document.getElementById('kota').value;
//     const supplierId = document.getElementById('supplierForm').dataset.supplierId;

//     try {
//         if (supplierId) {
//             // Update existing supplier
//             const { data, error } = await supabase
//                 .from('supplier')
//                 .update({
//                     perusahaan: perusahaan,
//                     sales: sales,
//                     no_hp: no_hp,
//                     id_kota: id_kota,
//                 })
//                 .eq('id', supplierId);

//             if (error) {
//                 throw error;
//             }

//             showToast('Supplier updated successfully!', 'success');
//         } else {
//             // Insert new supplier
//             const { data, error } = await supabase
//                 .from('supplier')
//                 .insert([
//                     {
//                         perusahaan: perusahaan,
//                         sales: sales,
//                         no_hp: no_hp,
//                         id_kota: id_kota,
//                     },
//                 ]);

//             if (error) {
//                 throw error;
//             }

//             showToast('Supplier added successfully!', 'success');
//         }

//         // Close the modal
//         const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
//         modal.hide();

//         // Refresh the supplier list
//         await fetchSuppliers();
//     } catch (error) {
//         console.error('Error saving supplier:', error.message);
//         showToast('Failed to save supplier. Please try again.', 'error');
//     }
// }

// Function to handle form submission (for both add and edit)
async function handleFormSubmit() {
    const perusahaan = document.getElementById('perusahaan').value;
    const cp = document.getElementById('cp').value;
    const no_hp = document.getElementById('no_hp').value;
    const id_kota = document.getElementById('kota').value;
    const supplierId = document.getElementById('supplierForm').dataset.supplierId;

    try {
        if (supplierId) {
            // Update existing supplier
            const { data, error } = await supabase
                .from('supplier')
                .update({
                    perusahaan: perusahaan,
                    cp: cp,
                    no_hp: no_hp,
                    id_kota: id_kota,
                })
                .eq('id', supplierId);

            if (error) {
                throw error;
            }

            showToast('Supplier updated successfully!', 'success');
        } else {
            // Insert new supplier
            const { data, error } = await supabase
                .from('supplier')
                .insert([
                    {
                        perusahaan: perusahaan,
                        cp: cp,
                        no_hp: no_hp,
                        id_kota: id_kota,
                    },
                ]);

            if (error) {
                throw error;
            }

            showToast('Supplier added successfully!', 'success');
        }

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
        modal.hide();

        // Refresh the supplier list
        await fetchSuppliers();
    } catch (error) {
        console.error('Error saving supplier:', error.message);
        showToast('Failed to save supplier. Please try again.', 'error');
    }
}

// Function to edit a supplier
async function editSupplier(supplierId) {
    try {
        // Fetch supplier data by ID
        const { data, error } = await supabase
            .from('supplier')
            .select('*')
            .eq('id', supplierId)
            .single();

        if (error) {
            throw error;
        }

        // Populate the form with the fetched data
        document.getElementById('perusahaan').value = data.perusahaan;
        document.getElementById('cp').value = data.cp;
        document.getElementById('no_hp').value = data.no_hp;
        document.getElementById('kota').value = data.id_kota;

        // Change the modal title and submit button text
        document.getElementById('supplierModalLabel').textContent = 'Edit Supplier';
        document.getElementById('submitButton').textContent = 'Update Supplier';

        // Store the supplier ID in a hidden field or data attribute
        document.getElementById('supplierForm').dataset.supplierId = supplierId;

        // Open the modal
        const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching supplier:', error.message);
        showToast('Failed to load supplier data. Please try again.', 'error');
    }
}

// Function to delete a supplier
async function deleteSupplier(supplierId) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        try {
            const { data, error } = await supabase
                .from('supplier')
                .delete()
                .eq('id', supplierId);

            if (error) {
                throw error;
            }

            // Refresh the supplier list
            await fetchSuppliers();
            showToast('Supplier deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting supplier:', error.message);
            showToast('Failed to delete supplier. Please try again.', 'error');
        }
    }
}

// Function to fetch and display suppliers
async function fetchSuppliers() {
    // const supplierTableBody = document.getElementById('supplierTableBody');

    // if (!supplierTableBody) return;

    try {
        $('#supplierTableBody').html(`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat supplier...
                </td>
            </tr>`);

        // Fetch data from Supabase
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

        // Format data for DataTables
        const formattedData = data.map(supplier => ({
            id: supplier.id,
            perusahaan: supplier.perusahaan || '-',
            cp: supplier.cp,
            no_hp: supplier.no_hp || '-',
            kota: supplier.kota?.kota || '-',
            id: supplier.id // Needed for action buttons
        }));

        // Clear and redraw table
        if (supplierTable) {
            supplierTable.clear().rows.add(formattedData).draw();
        } else {
            initializeDataTable();
            supplierTable.rows.add(formattedData).draw();
        }

    } catch (error) {
        console.error('Error fetching suppliers:', error.message);
        showToast('Failed to load suppliers. Please try again.', 'error');
        $('#supplierTableBody').html(`
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Gagal memuat data supplier
                </td>
            </tr>`);
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
// async function performSearch() {
//     const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
//     try {
//         const tbody = document.getElementById('supplierTableBody');
//         tbody.innerHTML = `
//             <tr>
//                 <td colspan="6" class="text-center">
//                     <div class="spinner-border spinner-border-sm" role="status">
//                         <span class="visually-hidden">Loading...</span>
//                     </div>
//                     Memuat supplier...
//                 </td>
//             </tr>`;

//         // Base query with kota filter if active
//         let baseQuery = supabase
//             .from('supplier')
//             .select(`
//                 id, 
//                 perusahaan, 
//                 cp, 
//                 no_hp,
//                 kota:id_kota(kota)
//             `)
//             .order('id', { ascending: true });

//         // Apply kota filter if active
//         if (activeFilters.type === 'kota' && activeFilters.kota) {
//             baseQuery = baseQuery.eq('id_kota', activeFilters.kota);
//         }

//         // 1. Search suppliers by direct fields (perusahaan, cp, no_hp)
//         const directSearchQuery = baseQuery;
//         if (searchTerm) {
//             directSearchQuery.or(`perusahaan.ilike.%${searchTerm}%,cp.ilike.%${searchTerm}%,no_hp.ilike.%${searchTerm}%`);
//         }
//         const { data: suppliersDirect, error: directError } = await directSearchQuery;

//         // 2. Search suppliers by kota name (only if searching and no kota filter already applied)
//         let suppliersByKota = [];
//         if (searchTerm && !(activeFilters.type === 'kota' && activeFilters.kota)) {
//             const { data: kotaResults, error: kotaError } = await supabase
//                 .from('kota')
//                 .select('id, kota')
//                 .ilike('kota', `%${searchTerm}%`);

//             if (!kotaError && kotaResults?.length > 0) {
//                 const kotaIds = kotaResults.map(k => k.id);
//                 const { data, error } = await baseQuery.in('id_kota', kotaIds);
//                 if (!error) suppliersByKota = data || [];
//             }
//         }

//         // Combine results (if searching) or use direct results (if just filtering)
//         let resultsToDisplay;
//         if (searchTerm) {
//             const combinedResults = [
//                 ...(suppliersDirect || []),
//                 ...suppliersByKota
//             ];
//             resultsToDisplay = combinedResults.reduce((acc, supplier) => {
//                 if (!acc.some(s => s.id === supplier.id)) {
//                     acc.push(supplier);
//                 }
//                 return acc;
//             }, []);
//         } else {
//             resultsToDisplay = suppliersDirect || [];
//         }

//         // Update the table with final results
//         updateSupplierTable(resultsToDisplay);

//     } catch (error) {
//         console.error('Error searching suppliers:', error);
//         showToast('Gagal melakukan pencarian supplier', 'error');
//         document.getElementById('supplierTableBody').innerHTML = `
//             <tr>
//                 <td colspan="6" class="text-center text-danger">
//                     Gagal memuat data supplier
//                 </td>
//             </tr>`;
//     }
// }

// // Update supplier table display
// function updateSupplierTable(suppliers) {
//     const tbody = document.getElementById('supplierTableBody');
//     tbody.innerHTML = '';

//     if (!suppliers || suppliers.length === 0) {
//         tbody.innerHTML = `
//             <tr>
//                 <td colspan="6" class="text-center text-muted">
//                     Tidak ada supplier yang cocok dengan pencarian
//                 </td>
//             </tr>`;
//         return;
//     }

//     suppliers.forEach(supplier => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${supplier.id}</td>
//             <td>${supplier.perusahaan || '-'}</td>
//             <td>${supplier.cp}</td>
//             <td>${supplier.no_hp || '-'}</td>
//             <td>${supplier.kota?.kota || '-'}</td>
//             <td>
//                 <button class="btn btn-primary btn-sm" onclick="editSupplier(${supplier.id})">Edit</button>
//                 <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${supplier.id})">Delete</button>
//             </td>
//         `;
//         tbody.appendChild(row);
//     });
// }

// // Search icon and clear functions
// function updateSearchIcon() {
//     const searchInput = document.getElementById('searchInput');
//     const searchIcon = document.getElementById('searchIcon');
    
//     if (searchInput.value.trim()) {
//         searchIcon.innerHTML = `
//             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
//                 <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
//             </svg>`;
//     } else {
//         searchIcon.innerHTML = `
//             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
//                 <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
//             </svg>`;
//     }
// }

// function clearSearch() {
//     document.getElementById('searchInput').value = '';
//     updateSearchIcon();
//     filterSuppliers(); // Maintain active filters when clearing search
// }

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch cities from the "kota" table and populate the dropdown
    await populateKotaDropdown();
    initializeDataTable();
    await fetchSuppliers();

    // Initialize filters
    initializeFilters();

    // Handle form submission
    const supplierForm = document.getElementById('supplierForm');
    if (supplierForm) {
        supplierForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleFormSubmit();
        });
    }

    // Reset form when modal is hidden
    const supplierModal = document.getElementById('supplierModal');
    if (supplierModal) {
        supplierModal.addEventListener('hidden.bs.modal', () => {
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
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;