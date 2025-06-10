import supabase from './db_conn.js';
import { processEntry, displayUnpaidNotice } from './import.js';
import { checkAuth, initAuthStateListener } from './auth.js';

initAuthStateListener();

(async () => {
    // Auth check - will redirect if not logged in
    await checkAuth(); 
})();

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta' // Ensure it's always in WIB
    });
}

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

// Function to get the variant ID from the URL
function getVariantIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('variantId');
}

// Function to fetch variant details by ID (including product info)
async function fetchVariantDetails(variantId) {
    const { data, error } = await supabase
        .from('produk_varian')
        .select(`
            *,
            produk:id_produk(*)
        `)
        .eq('id', variantId)
        .single();

    if (error) {
        console.error('Error fetching variant details:', error);
        return null;
    }

    return data;
}

// Function to load enum values for "tipe_riwayat"
async function loadTipeRiwayatEnum() {
    const tipeRiwayatSelect = document.getElementById('tipe_riwayat');

    // Show loading state
    tipeRiwayatSelect.innerHTML = '<option value="">Memuat tipe riwayat...</option>';

    try {
        // Fetch all enum values from the API
        const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'tipe_riwayat' });

        if (error) {
            throw error;
        }

        // Clear and prepare the dropdown
        tipeRiwayatSelect.innerHTML = '<option value="" disabled selected>Pilih tipe riwayat</option>';

        // Filter to only include adjustment types
        const adjustmentTypes = data.filter(item => 
            item.value === 'penyesuaian_masuk' || 
            item.value === 'penyesuaian_keluar'
        );

        // Add the filtered options
        adjustmentTypes.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.text = item.value.charAt(0).toUpperCase() + item.value.slice(1).replace('_', ' ');
            tipeRiwayatSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching tipe_riwayat enum:', error);
        tipeRiwayatSelect.innerHTML = '<option value="">Error loading tipe riwayat</option>';
        showToast('Gagal memuat tipe riwayat', 'error');
    }
}

// // Function to update the stock in the variant table
// async function updateVariantStock(variantId, quantity, tipeRiwayat) {
//     const { data: variant, error: fetchError } = await supabase
//         .from('produk_varian')
//         .select('jumlah_stok')
//         .eq('id', variantId)
//         .single();

//     if (fetchError) {
//         console.error('Error fetching variant stock:', fetchError);
//         return null;
//     }

//     let newStock = variant.jumlah_stok;
//     if (tipeRiwayat === 'pembelian' || tipeRiwayat === 'penyesuaian_masuk') {
//         newStock += quantity;
//     } else if (tipeRiwayat === 'penjualan' || tipeRiwayat === 'penyesuaian_keluar') {
//         newStock -= quantity;
//     }

//     const { error: updateError } = await supabase
//         .from('produk_varian')
//         .update({ 
//             jumlah_stok: newStock
//         })
//         .eq('id', variantId);

//     if (updateError) {
//         console.error('Error updating variant stock:', updateError);
//         return null;
//     }

//     return newStock;
// }

// // Function to calculate HPP using FIFO method for a specific variant
// // async function calculateHPP(variantId, quantity) {
// //     const { data: stockHistory, error } = await supabase
// //         .from('riwayat_stok')
// //         .select('*')
// //         .eq('id_varian', variantId)
// //         .order('tanggal', { ascending: true });

// //     if (error) {
// //         console.error('Error fetching stock history for HPP calculation:', error);
// //         return;
// //     }

// //     let remainingQty = quantity;
// //     let totalCost = 0;

// //     for (const entry of stockHistory) {
// //         if (remainingQty <= 0) break;

// //         if (entry.tipe_riwayat === 'pembelian') {
// //             const usedQty = Math.min(remainingQty, entry.quantity);
// //             totalCost += usedQty * entry.harga;
// //             remainingQty -= usedQty;
// //         }
// //     }

// //     return totalCost;
// // }

// async function calculateHPP(variantId, saleQty) {
//     // Get only purchases with remaining stock (FIFO order)
//     const { data: purchases } = await supabase
//       .from('riwayat_stok')
//       .select('id, qty, stok_sisa, harga')
//       .eq('id_varian', variantId)
//       .eq('tipe_riwayat', 'pembelian')
//       .gt('stok_sisa', 0)  // Only consider purchases with stock left
//       .order('tanggal', { ascending: true }) // Oldest first
//       .limit(100); // Safety limit
  
//     let remainingQty = saleQty;
//     let totalCost = 0;
//     const updates = [];
  
//     for (const purchase of purchases) {
//       if (remainingQty <= 0) break;
      
//       const usedQty = Math.min(remainingQty, purchase.stok_sisa);
//       totalCost = purchase.harga;
//       remainingQty -= usedQty;
  
//       updates.push({
//         id: purchase.id,
//         newRemaining: purchase.stok_sisa - usedQty
//       });
//     }
  
//     // Batch update remaining stock
//     if (updates.length > 0) {
//       await supabase.rpc('batch_update_remaining', {
//         updates: updates.map(u => ({
//           id: u.id,
//           remaining: u.newRemaining
//         }))
//       });
//     }
  
//     return totalCost;
// }

// async function processEntry({
//     variantId = null, 
//     type = null, 
//     id = null, 
//     quantity = null,
//     price = null,
//     date = new Date().toISOString()
// }) {
//     try {
//         if (!variantId || !type || quantity === null) {
//             throw new Error('Missing required parameters');
//         }

//         // Update stock in variant table
//         const newStock = await updateVariantStock(variantId, quantity, type);
//         if (newStock === null) {
//             throw new Error('Failed to update variant stock');
//         }

//         // Calculate HPP only for outgoing transactions
//         let hpp = null;
//         if (type === 'penjualan' || type === 'penyesuaian_keluar') {
//             hpp = await calculateHPP(variantId, quantity);
//             if (hpp === null) {
//                 console.warn('HPP calculation failed, proceeding without HPP');
//             }
//         }

//         // Insert stock history record
//         const { error } = await supabase
//             .from('riwayat_stok')
//             .insert([{
//                 id_varian: variantId,
//                 tipe_riwayat: type,
//                 qty: quantity,
//                 saldo: newStock,
//                 harga: price,
//                 hpp: hpp,
//                 tanggal: date,
//                 id_referensi: id
//             }]);

//         if (error) throw error;

//         return { success: true, newStock };
//     } catch (error) {
//         console.error('Error in processEntry:', error);
//         throw error; // Re-throw for caller to handle
//     }
// }

async function handleFormSubmit(event) {
    event.preventDefault();

    const variantId = getVariantIdFromUrl();
    const tanggal = document.getElementById('tanggal').value
    const tipeRiwayat = document.getElementById('tipe_riwayat').value;
    const quantity = parseInt(document.getElementById('qty').value, 10);
    const harga = document.getElementById('harga') ? parseFloat(document.getElementById('harga').value) : 0;

    if (!variantId || !tipeRiwayat || !quantity) {
        alert('Harap isi semua field yang diperlukan.');
        return;
    }

    await processEntry({
        variantId,
        tipeRiwayat,
        quantity,
        harga,
        tanggal
    });
}

async function fetchStockHistory(variantId) {
    const historyTableBody = document.getElementById('historyTableBody');
    
    try {
        // Show loading state
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat entri...
                </td>
            </tr>`;

        if (!variantId) {
            historyTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Tidak ditemukan ID varian dalam URL.</td></tr>';
            return;
        }

        // Fetch variant details
        const variant = await fetchVariantDetails(variantId);
        if (!variant) {
            historyTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Varian tidak ditemukan.</td></tr>';
            return;
        }

        // Update UI with variant info
        const header = document.querySelector('h3');
        if (header) {
            header.textContent = `Riwayat stok untuk "${variant.produk.nama}" - ${variant.varian}`;
        }

        const stockDisplay = document.getElementById('currentStock');
        if (stockDisplay) {
            stockDisplay.textContent = `Stok saat ini: ${variant.jumlah_stok}`;
        }

        // Fetch stock history
        const { data, error } = await supabase
            .from('riwayat_stok')
            .select('*')
            .eq('id_varian', variantId)
            .order('tanggal', { ascending: false });

        if (error) {
            throw error;
        }

        console.log("History data:", data);

        // Handle empty data
        if (!data || data.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Tidak ada riwayat stok yang ditemukan untuk varian ini.</td></tr>';
            return;
        }

        // Clear loading state
        historyTableBody.innerHTML = '';

        // Populate table
        data.forEach(history => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${history.id}</td>
                <td>${formatDate(history.tanggal)}</td>
                <td>${history.tipe_riwayat.charAt(0).toUpperCase() + history.tipe_riwayat.slice(1)}</td>
                <td>${history.qty}</td>
                <td>${history.saldo ?? '-'}</td>
                <td>${history.harga !== null ? 'Rp ' + history.harga.toLocaleString('id-ID') : '-'}</td>
                <td>${history.hpp ? 'Rp ' + history.hpp.toLocaleString('id-ID') : '-'}</td>
                <td>${history.stok_sisa ?? '-'}</td>
            `;
            historyTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error:', error);
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat riwayat stok: ${error.message}
                </td>
            </tr>`;
        showToast('Gagal memuat riwayat stok', 'error');
    }
}

// filter
const activeFilters = {
    type: null,
    tipe: null
};

// Initialize filter UI components
function initializeFilters() {
    // Handle filter type selection
    const filterRadio = document.getElementById('filterTipe');
    if (filterRadio) {
        filterRadio.addEventListener('click', function(e) {
            if (this.checked && activeFilters.type === 'tipe') {
                // Clicking the already selected radio should uncheck it
                this.checked = false;
                resetFilters();
                return;
            }
            activeFilters.type = 'tipe';
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
    
    container.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Tipe</label>
            <select class="form-select" id="dropdownTipe">
                <option value="">Memuat tipe...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`;
    
    await loadTipeForFilter();

    // Reattach event listeners for new buttons
    document.getElementById('applyFilter')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilter')?.addEventListener('click', resetFilters);
}

// Load tipe for filter
async function loadTipeForFilter() {
    try {
        const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'tipe_riwayat' });
        const tipeRiwayatSelect = document.getElementById('dropdownTipe');

        if (error) throw error;

        tipeRiwayatSelect.innerHTML = '<option value="">Pilih Tipe Riwayat</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.value.charAt(0).toUpperCase() + item.value.slice(1);
            tipeRiwayatSelect.appendChild(option);
        });

        // Preselect current filter if exists
        if (activeFilters.tipe) {
            tipeRiwayatSelect.value = activeFilters.tipe;
        }
    } catch (error) {
        console.error('Error loading type:', error);
        document.getElementById('dropdownTipe').innerHTML = '<option value="">Error loading types</option>';
        showToast('Gagal memuat daftar tipe riwayat', 'error');
    }
}

// Apply selected filters
function applyFilters() {
    // Reset previous filter values
    activeFilters.tipe = null;

    // Get current filter values
    if (activeFilters.type === 'tipe') {
        activeFilters.tipe = document.getElementById('dropdownTipe').value;
    }
    
    filterTypes();
}

// Reset all filters
function resetFilters() {
    const filterRadio = document.getElementById('filterTipe');
    if (filterRadio) filterRadio.checked = false;

    // Reset active filters
    activeFilters.type = null;
    activeFilters.tipe = null;

    // Hide filter card
    document.getElementById('filterCard').classList.add('d-none');
    
    const variantId = getVariantIdFromUrl();
    // Refresh the history list
    fetchStockHistory(variantId);
}

// Filter history based on active filters
async function filterTypes() {
    const tbody = document.getElementById('historyTableBody');
    const variantId = getVariantIdFromUrl(); // Add this line
    
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat entri...
            </td>
        </tr>`;

    try {
        let query = supabase
            .from('riwayat_stok')
            .select('*')
            .eq('id_varian', variantId)  // Now variantId is defined
            .order('tanggal', { ascending: false });  // Changed to order by date

        if (activeFilters.type === 'tipe' && activeFilters.tipe) {
            query = query.eq('tipe_riwayat', activeFilters.tipe);
        }

        const { data: entries, error } = await query;
        if (error) throw error;

        updateHistoryTable(entries);
    } catch (error) {
        console.error('Error filtering entries:', error);
        showToast('Gagal memfilter entri', 'error');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat entri riwayat
                </td>
            </tr>`;
    }
}

function updateHistoryTable(entries) {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    if (!entries || entries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">  
                    Tidak ada entri yang cocok dengan pencarian
                </td>
            </tr>`;
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.id}</td>
            <td>${formatDate(history.tanggal)}</td>
            <td>${entry.tipe_riwayat.charAt(0).toUpperCase() + entry.tipe_riwayat.slice(1)}</td>
            <td>${entry.qty}</td>
            <td>${entry.saldo ?? '-'}</td>
            <td>${entry.harga ? 'Rp ' + entry.harga.toLocaleString('id-ID') : '-'}</td>
            <td>${entry.hpp ? 'Rp ' + entry.hpp.toLocaleString('id-ID') : '-'}</td>
            <td>${entry.stok_sisa ?? '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await displayUnpaidNotice();
    // Check for variant ID in URL
    const variantId = getVariantIdFromUrl();
    if (!variantId) {
        alert('ID varian tidak valid. Kembali ke halaman produk.');
        window.location.href = 'product.html';
        return;
    }

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize components
    await loadTipeRiwayatEnum();
    await fetchStockHistory(variantId);
    initializeFilters();

    // Setup form submission
    const form = document.getElementById('historyForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Add back button functionality
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'product.html';
        });
    }
});