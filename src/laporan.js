import supabase from './db_conn.js';
const { jsPDF } = window.jspdf;
import { checkAuth } from './auth.js';
import { displayUnpaidNotice } from './import.js';

(async () => {
    // Auth check - will redirect if not logged in
    await checkAuth(); 
})();

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

function scrollReportToTop() {
    const container = document.querySelector('.report-container');
    if (container) {
        container.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function isEmptyData(data) {
    if (Array.isArray(data)) {
        return data.length === 0;
    }
    if (typeof data === 'object' && data !== null) {
        if (data.logs) { // For Stock Opname report
            return data.logs.length === 0;
        }
        return Object.keys(data).length === 0;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async() => {
    await displayUnpaidNotice();
    // DOM elements
    const jenisSelect = document.getElementById('jenis');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const reportContent = document.getElementById('report-content');
    const generateText = document.getElementById('generateText');
    const generateSpinner = document.getElementById('generateSpinner');
    const groupByContainer = document.getElementById('groupByContainer');
    
    // Create group by dropdown for Pembelian report
    const label = document.createElement('label');
    label.className = 'form-label';
    label.innerHTML = 'Pengelompokkan';
    groupByContainer.appendChild(label);

    const groupBySelect = document.createElement('select');
    groupBySelect.id = 'groupBy';
    groupBySelect.className = 'form-select';
    groupBySelect.innerHTML = '';
    
    // Hide group by dropdown initially
    groupByContainer.style.display = 'none';

    // Show/hide group by dropdown based on report type
    jenisSelect.addEventListener('change', () => {
        if (jenisSelect.value === 'Pembelian' || jenisSelect.value === 'Penjualan') {
            groupByContainer.style.display = 'block';
            // Update the grouping options based on report type
            updateGroupByOptions(jenisSelect.value);
            groupByContainer.appendChild(groupBySelect);
        } else {
            groupByContainer.style.display = 'none';
        }
    });

    // Add this helper function
    function updateGroupByOptions(reportType) {
        if (reportType === 'Pembelian') {
            groupBySelect.innerHTML = `
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="supplier">Supplier</option>
                <option value="product">Produk</option>
            `;
        } else if (reportType === 'Penjualan') {
            groupBySelect.innerHTML = `
                <option value="" disabled selected>Pilih kelompok</option>
                <option value="order">Pesanan</option>
                <option value="customer">Bakul</option>
                <option value="product">Produk</option>
            `;
        }
    }

    // Set default date range (current month)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    startDateInput.valueAsDate = firstDayOfMonth;
    endDateInput.valueAsDate = today;

    // Report templates with dynamic data fetching
    const reportData = {
    "Laba Rugi": {
        fetchData: async (startDate, endDate) => {
            // const startDate = `${year}-01-01`;
            // const endDate = `${year}-12-31`;
            
            // 1. Fetch SALES (Pendapatan) from pesanan_penjualan
            const { data: sales, error: salesError } = await supabase
            .from('pesanan_penjualan')
            .select('total_dibayarkan')
            .gte('tanggal_pesan', startDate)
            .lte('tanggal_pesan', endDate);
            
            if (salesError) throw salesError;
            
            // 2. Fetch COGS (HPP) from riwayat_stok (for sales transactions)
            const { data: cogsData, error: cogsError } = await supabase
            .from('riwayat_stok')
            .select('hpp, qty')
            .eq('tipe_riwayat', 'penjualan') // Only sales transactions
            .gte('tanggal', startDate)
            .lte('tanggal', endDate);
            
            if (cogsError) throw cogsError;
            
            // Calculate TOTAL REVENUE (Pendapatan)
            const totalRevenue = sales.reduce((sum, item) => sum + (item.total_dibayarkan || 0), 0);
            
            // Calculate TOTAL COGS (HPP * Quantity Sold)
            let totalCOGS;
            totalCOGS = cogsData.reduce((sum, item) => sum + (item.hpp * item.qty || 0), 0);
            totalCOGS = Math.round(totalCOGS);
            
            // Calculate Profits
            const grossProfit = totalRevenue - totalCOGS;
            const operatingExpenses = 135000 * 4; // Assuming 30% operating expenses
            const netProfit = grossProfit - operatingExpenses;
            
            return {
            totalRevenue,
            totalCOGS,
            grossProfit,
            operatingExpenses,
            netProfit
            };
        },
        template: (data, startDate, endDate) => {
                // Update the header to show date range
                const start = new Date(startDate).toLocaleDateString('id-ID');
                const end = new Date(endDate).toLocaleDateString('id-ID');
                return `
                    <h4 class="report-header">Laporan Laba Rugi ${start} - ${end}</h4>
                    <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                        <th>Keterangan</th>
                        <th>Jumlah (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>Pendapatan</td>
                        <td class="text-end">${formatCurrency(data.totalRevenue)}</td>
                        </tr>
                        <tr>
                        <td>Harga Pokok Penjualan (HPP)</td>
                        <td class="text-end">${formatCurrency(data.totalCOGS)}</td>
                        </tr>
                        <tr class="table-active">
                        <td><strong>Laba Kotor</strong></td>
                        <td class="text-end"><strong>${formatCurrency(data.grossProfit)}</strong></td>
                        </tr>
                        <tr>
                        <td>Biaya Operasional</td>
                        <td class="text-end">${formatCurrency(data.operatingExpenses)}</td>
                        </tr>
                        <tr class="table-active">
                        <td><strong>Laba Bersih</strong></td>
                        <td class="text-end"><strong>${formatCurrency(data.netProfit)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `;
            }
        },
    "Pembelian": {
        fetchData: async (startDate, endDate) => {
            const groupBy = document.getElementById('groupBy').value;
            
            if (groupBy === 'supplier') {
                // Group by Supplier
                const { data: orders, error: ordersError } = await supabase
                    .from('pesanan_pembelian')
                    .select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        supplier:id_supplier(perusahaan, cp),
                        item_pesanan_pembelian(id_beli, qty_dipesan)
                    `)
                    .eq('status_pesanan', 'selesai')
                    .gte('tanggal_pesan', startDate)
                    .lte('tanggal_pesan', endDate);
                
                if (ordersError) throw ordersError;
                
                // Group by supplier using cp as fallback
                const supplierMap = new Map();
                
                orders.forEach(order => {
                    // Use cp as supplier identifier if perusahaan is null
                    const supplierIdentifier = order.supplier?.perusahaan || order.supplier.cp;
                    
                    if (!supplierMap.has(supplierIdentifier)) {
                        supplierMap.set(supplierIdentifier, {
                            supplier: {
                                perusahaan: order.supplier?.perusahaan || '(Tanpa Nama Perusahaan)',
                                cp: order.supplier.cp  // cp is guaranteed
                            },
                            totalOrders: 0,
                            totalItems: 0,
                            totalPaid: 0
                        });
                    }
                    
                    const supplierData = supplierMap.get(supplierIdentifier);
                    supplierData.totalOrders++;
                    supplierData.totalPaid += order.total_dibayarkan || 0;
                    
                    // Calculate total items
                    const itemsCount = order.item_pesanan_pembelian?.reduce((sum, item) => 
                        sum + (item.qty_dipesan || 0), 0) || 0;
                    supplierData.totalItems += itemsCount;
                });
                
                return Array.from(supplierMap.values());
                
            } else if (groupBy === 'product') {
                // Group by Product - improved query with explicit joins
                const { data: items, error: itemsError } = await supabase
                    .from('item_pesanan_pembelian')
                    .select(`
                        qty_dipesan,
                        harga_beli,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_pembelian!inner(
                            id,
                            supplier:id_supplier(perusahaan, cp),
                            status_pesanan
                        )
                    `)
                    .eq('pesanan_pembelian.status_pesanan', 'selesai')
                    .gte('pesanan_pembelian.tanggal_pesan', startDate)
                    .lte('pesanan_pembelian.tanggal_pesan', endDate);
                
                if (itemsError) throw itemsError;
                
                // Debug: Check if any items are missing supplier data
                const itemsWithMissingSupplier = items.filter(item => 
                    !item.pesanan_pembelian?.supplier
                );
                if (itemsWithMissingSupplier.length > 0) {
                    console.warn('Items with missing supplier data:', itemsWithMissingSupplier);
                }

                // Group by product
                const productMap = new Map();
                
                items.forEach(item => {
                    const productName = item.varian?.produk?.nama 
                        ? `${item.varian.produk.nama} - ${item.varian.varian || ''}` 
                        : 'Produk Tidak Dikenal';
                    
                    if (!productMap.has(productName)) {
                        productMap.set(productName, {
                            product: productName,
                            totalPurchased: 0,
                            totalDibayarkan: 0,
                            totalOrders: 0,
                            suppliers: new Set(),
                            orderIds: new Set()
                        });
                    }
                    
                    const productData = productMap.get(productName);
                    productData.totalPurchased += item.qty_dipesan || 0;
                    productData.totalDibayarkan += (item.qty_dipesan || 0) * (item.harga_beli || 0);
                    
                    // Track unique orders
                    if (item.pesanan_pembelian?.id && !productData.orderIds.has(item.pesanan_pembelian.id)) {
                        productData.orderIds.add(item.pesanan_pembelian.id);
                        productData.totalOrders++;
                    }
                    
                    // Handle supplier - guaranteed to exist
                    const supplier = item.pesanan_pembelian.supplier;
                    const supplierName = supplier.perusahaan || supplier.cp;
                    productData.suppliers.add(supplierName);
                });
                
                // Convert to array format
                return Array.from(productMap.values()).map(item => ({
                    ...item,
                    suppliers: Array.from(item.suppliers).join(', ')
                }));
            } else {
                // Default: Group by Order
                const { data: orders, error: ordersError } = await supabase
                    .from('pesanan_pembelian')
                    .select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        supplier:id_supplier(perusahaan, cp),
                        item_pesanan_pembelian(
                            id_varian,
                            qty_dipesan,
                            harga_beli,
                            varian:id_varian(
                                varian, 
                                produk:id_produk(nama)
                            )
                        )
                    `)
                    .eq('status_pesanan', 'selesai')
                    .gte('tanggal_pesan', startDate)
                    .lte('tanggal_pesan', endDate)
                    .order('tanggal_pesan', { ascending: true });
                
                if (ordersError) throw ordersError;
                
                return orders.map(order => ({
                    ...order,
                    // Handle null perusahaan but guaranteed cp
                    supplier: {
                        perusahaan: order.supplier?.perusahaan || '(Tanpa Nama Perusahaan)',
                        cp: order.supplier.cp
                    },
                    // Ensure items array exists
                    item_pesanan_pembelian: order.item_pesanan_pembelian || []
                }));
            }
        },
        template: (data, startDate, endDate) => {
            const groupBy = document.getElementById('groupBy').value;
            const start = new Date(startDate).toLocaleDateString('id-ID');
            const end = new Date(endDate).toLocaleDateString('id-ID');
            
            if (groupBy === 'supplier') {
                // Supplier grouping template
                const totalPaid = data.reduce((sum, item) => sum + (item.totalPaid || 0), 0);
                const totalItems = data.reduce((sum, item) => sum + (item.totalItems || 0), 0);
                
                return `
                    <h4 class="report-header">Laporan Pembelian per Supplier ${start} - ${end}</h4>
                    <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                        <th>No</th>
                        <th>Supplier</th>
                        <th>Total Pesanan</th>
                        <th>Total Items</th>
                        <th>Total Dibayarkan (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.supplier.perusahaan} (${item.supplier.cp})</td>
                            <td class="text-end">${item.totalOrders}</td>
                            <td class="text-end">${item.totalItems}</td>
                            <td class="text-end">${formatCurrency(item.totalPaid)}</td>
                        </tr>
                        `).join('')}
                        <tr class="table-active">
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="text-end"><strong>${data.length}</strong></td>
                        <td class="text-end"><strong>${totalItems}</strong></td>
                        <td class="text-end"><strong>${formatCurrency(totalPaid)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `;
            } else if (groupBy === 'product') {
                // Product grouping template
                const totalPurchased = data.reduce((sum, item) => sum + (item.totalPurchased || 0), 0);
                const totalOrders = data.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
                const totalDibayarkan = data.reduce((sum, item) => sum + (item.totalDibayarkan || 0), 0);
                
                return `
                    <h4 class="report-header">Laporan Pembelian per Produk ${start} - ${end}</h4>
                    <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                        <th>No</th>
                        <th>Produk</th>
                        <th>Supplier</th>
                        <th class="text-end">Total Pesanan</th>
                        <th class="text-end">Total Qty.</th>
                        <th class="text-end">Total Dibayarkan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.product}</td>
                            <td>${item.suppliers || '-'}</td>
                            <td class="text-end">${item.totalOrders}</td>
                            <td class="text-end">${item.totalPurchased}</td>
                            <td class="text-end">${formatCurrency(item.totalDibayarkan)}</td>
                        </tr>
                        `).join('')}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${totalOrders}</strong></td>
                        <td class="text-end"><strong>${totalPurchased}</strong></td>
                        <td class="text-end"><strong>${formatCurrency(totalDibayarkan)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `;
            } else {
                // Order grouping template (default)
                const total = data.reduce((sum, order) => sum + (order.total_dibayarkan || 0), 0);
                
                return `
                    <h4 class="report-header">Laporan Pembelian per Order ${start} - ${end}</h4>
                    ${data.map(order => {
                        const orderTotalItems = order.item_pesanan_pembelian.reduce((sum, item) => sum + item.qty_dipesan, 0);
                        return `
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>PO-${order.id.toString().padStart(4, '0')}</strong> - 
                                    ${formatDate(order.tanggal_pesan)} | 
                                    Supplier: ${order.supplier?.perusahaan || '-'} (${order.supplier?.cp || '-'}) | 
                                    Total: ${formatCurrency(order.total_dibayarkan)}
                                </div>
                                <div class="card-body">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Produk</th>
                                                <th class="text-end">Qty</th>
                                                <th class="text-end">Harga Satuan</th>
                                                <th class="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${order.item_pesanan_pembelian.map(item => `
                                                <tr>
                                                    <td>${item.varian.produk.nama} - ${item.varian.varian}</td>
                                                    <td class="text-end">${item.qty_dipesan}</td>
                                                    <td class="text-end">${formatCurrency(item.harga_beli)}</td>
                                                    <td class="text-end">${formatCurrency(item.qty_dipesan * item.harga_beli)}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    <div class="alert alert-primary">
                        <strong>Total Pembelian: ${formatCurrency(total)}</strong>
                    </div>
                `;
            }
        }
    },
    "Penjualan": {
        fetchData: async (startDate, endDate) => {
            const groupBy = document.getElementById('groupBy').value;
            
            if (groupBy === 'customer') {
                // Group by Customer
                const { data: orders, error: ordersError } = await supabase
                    .from('pesanan_penjualan')
                    .select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        bakul:id_bakul(nama),
                        item_pesanan_penjualan(id_jual, qty_dipesan)
                    `)
                    .eq('status_pesanan', 'selesai')
                    .gte('tanggal_pesan', startDate)
                    .lte('tanggal_pesan', endDate);
                
                if (ordersError) throw ordersError;
                
                const customerMap = new Map();
                
                orders.forEach(order => {
                    const customerName = order.bakul?.nama || 'Walk-in';
                    
                    if (!customerMap.has(customerName)) {
                        customerMap.set(customerName, {
                            customer: customerName,
                            totalOrders: 0,
                            totalItems: 0,
                            totalPaid: 0
                        });
                    }
                    
                    const customerData = customerMap.get(customerName);
                    customerData.totalOrders++;
                    customerData.totalPaid += order.total_dibayarkan || 0;
                    
                    // Calculate total items
                    const itemsCount = order.item_pesanan_penjualan?.reduce((sum, item) => 
                        sum + (item.qty_dipesan || 0), 0) || 0;
                    customerData.totalItems += itemsCount;
                });
                
                return Array.from(customerMap.values());
                
            } else if (groupBy === 'product') {
                // Group by Product
                const { data: items, error: itemsError } = await supabase
                    .from('item_pesanan_penjualan')
                    .select(`
                        qty_dipesan,
                        harga_jual,
                        varian:id_varian(varian, produk:id_produk(nama)),
                        pesanan_penjualan!inner(
                            id,
                            tanggal_pesan,
                            total_dibayarkan,
                            bakul:id_bakul(nama)
                        )
                    `)
                    .eq('pesanan_penjualan.status_pesanan', 'selesai')
                    .gte('pesanan_penjualan.tanggal_pesan', startDate)
                    .lte('pesanan_penjualan.tanggal_pesan', endDate);
                
                if (itemsError) throw itemsError;
                
                const productMap = new Map();
                
                items.forEach(item => {
                    const productName = item.varian?.produk?.nama 
                        ? `${item.varian.produk.nama} - ${item.varian.varian || ''}` 
                        : 'Produk Tidak Dikenal';
                    
                    if (!productMap.has(productName)) {
                        productMap.set(productName, {
                            product: productName,
                            totalSold: 0,
                            totalRevenue: 0,
                            totalOrders: 0,
                            customers: new Set(),
                            orderIds: new Set()
                        });
                    }
                    
                    const productData = productMap.get(productName);
                    productData.totalSold += item.qty_dipesan || 0;
                    productData.totalRevenue += Math.round((item.qty_dipesan || 0) * (item.harga_jual || 0));
                    
                    // Track unique orders
                    if (item.pesanan_penjualan?.id && !productData.orderIds.has(item.pesanan_penjualan.id)) {
                        productData.orderIds.add(item.pesanan_penjualan.id);
                        productData.totalOrders++;
                    }
                    
                    // Handle customer
                    const customerName = item.pesanan_penjualan.bakul?.nama || 'Walk-in';
                    productData.customers.add(customerName);
                });
                
                // Convert to array format
                return Array.from(productMap.values()).map(item => ({
                    ...item,
                    customers: Array.from(item.customers).join(', ')
                }));
                
            } else {
                // Default: Group by Order - MODIFIED to include harga_standar
                const { data: orders, error: ordersError } = await supabase
                    .from('pesanan_penjualan')
                    .select(`
                        id,
                        tanggal_pesan,
                        total_dibayarkan,
                        bakul:id_bakul(nama),
                        item_pesanan_penjualan(
                            id_varian,
                            qty_dipesan,
                            harga_jual,
                            varian:id_varian(
                                varian, 
                                produk:id_produk(nama),
                                harga_standar
                            )
                        )
                    `)
                    .eq('status_pesanan', 'selesai')
                    .gte('tanggal_pesan', startDate)
                    .lte('tanggal_pesan', endDate)
                    .order('tanggal_pesan', { ascending: true });
                
                if (ordersError) throw ordersError;
                
                return orders.map(order => ({
                    ...order,
                    bakul: {
                        nama: order.bakul?.nama || 'Walk-in'
                    },
                    item_pesanan_penjualan: (order.item_pesanan_penjualan || []).map(item => ({
                        ...item,
                        // Calculate price difference for each item
                        priceDifference: item.harga_jual - (item.varian?.harga_standar || 0)
                    }))
                }));
            }
        },
        template: (data, startDate, endDate) => {
            const groupBy = document.getElementById('groupBy').value;
            const start = new Date(startDate).toLocaleDateString('id-ID');
            const end = new Date(endDate).toLocaleDateString('id-ID');
            
            if (groupBy === 'customer') {
                // Customer grouping template
                const totalPaid = data.reduce((sum, item) => sum + (item.totalPaid || 0), 0);
                const totalItems = data.reduce((sum, item) => sum + (item.totalItems || 0), 0);
                
                return `
                    <h4 class="report-header">Laporan Penjualan per Bakul ${start} - ${end}</h4>
                    <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                        <th>No</th>
                        <th>Bakul</th>
                        <th>Total Pesanan</th>
                        <th>Total Items</th>
                        <th>Total Dibayarkan (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.customer}</td>
                            <td class="text-end">${item.totalOrders}</td>
                            <td class="text-end">${item.totalItems}</td>
                            <td class="text-end">${formatCurrency(item.totalPaid)}</td>
                        </tr>
                        `).join('')}
                        <tr class="table-active">
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="text-end"><strong>${data.length}</strong></td>
                        <td class="text-end"><strong>${totalItems}</strong></td>
                        <td class="text-end"><strong>${formatCurrency(totalPaid)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `;
            } else if (groupBy === 'product') {
                // Product grouping template
                const totalSold = data.reduce((sum, item) => sum + (item.totalSold || 0), 0);
                const totalRevenue = data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
                const totalOrders = data.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
                
                return `
                    <h4 class="report-header">Laporan Penjualan per Produk ${start} - ${end}</h4>
                    <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                        <th>No</th>
                        <th>Produk</th>
                        <th>Bakul</th>
                        <th class="text-end">Total Pesanan</th>
                        <th class="text-end">Total Terjual</th>
                        <th class="text-end">Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.product}</td>
                            <td>${item.customers || '-'}</td>
                            <td class="text-end">${item.totalOrders}</td>
                            <td class="text-end">${item.totalSold}</td>
                            <td class="text-end">${formatCurrency(item.totalRevenue)}</td>
                        </tr>
                        `).join('')}
                        <tr class="table-active">
                        <td colspan="3"><strong>Total</strong></td>
                        <td class="text-end"><strong>${totalOrders}</strong></td>
                        <td class="text-end"><strong>${totalSold}</strong></td>
                        <td class="text-end"><strong>${formatCurrency(totalRevenue)}</strong></td>
                        </tr>
                    </tbody>
                    </table>
                `;
            } else {
                // Order grouping template (default) - MODIFIED to show price difference
                const total = data.reduce((sum, order) => sum + (order.total_dibayarkan || 0), 0);
                
                return `
                    <h4 class="report-header">Laporan Penjualan per Order ${start} - ${end}</h4>
                    ${data.map(order => {
                        const orderTotalItems = order.item_pesanan_penjualan.reduce((sum, item) => sum + item.qty_dipesan, 0);
                        return `
                            <div class="card mb-3">
                                <div class="card-header">
                                    <strong>SO-${order.id.toString().padStart(4, '0')}</strong> - 
                                    ${formatDate(order.tanggal_pesan)} | 
                                    Bakul: ${order.bakul?.nama || 'Walk-in'} | 
                                    Total: ${formatCurrency(order.total_dibayarkan)}
                                </div>
                                <div class="card-body">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Produk</th>
                                                <th class="text-end">Qty</th>
                                                <th class="text-end">Harga Satuan</th>
                                                <th class="text-end">Harga Standar</th>
                                                <th class="text-end">Diskon/Kenaikan</th>
                                                <th class="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${order.item_pesanan_penjualan.map(item => {
                                                const standardPrice = item.varian?.harga_standar || 0;
                                                const difference = item.priceDifference || 0;
                                                const differenceText = difference === 0 ? 
                                                    '0' : 
                                                    (difference > 0 ? `+${formatCurrency(difference)}` : formatCurrency(difference));
                                                const differenceClass = difference > 0 ? 
                                                    'text-success' : 
                                                    difference < 0 ? 'text-danger' : '';
                                                
                                                return `
                                                    <tr>
                                                        <td>${item.varian.produk.nama} - ${item.varian.varian}</td>
                                                        <td class="text-end">${item.qty_dipesan}</td>
                                                        <td class="text-end">${formatCurrency(item.harga_jual)}</td>
                                                        <td class="text-end">${formatCurrency(standardPrice)}</td>
                                                        <td class="text-end ${differenceClass}">${differenceText}</td>
                                                        <td class="text-end">${formatCurrency(item.qty_dipesan * item.harga_jual)}</td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    <div class="alert alert-primary">
                        <strong>Total Penjualan: ${formatCurrency(total)}</strong>
                    </div>
                `;
            }
        }
    },
    "Kartu Stok": {
        fetchData: async (startDate, endDate) => {
            // 1. Fetch stock history
            const { data, error } = await supabase
                .from('riwayat_stok')
                .select(`
                    tanggal,
                    tipe_riwayat,
                    qty,
                    saldo,
                    hpp,
                    varian:id_varian(id, varian, produk:id_produk(nama))
                `)
                .gte('tanggal', startDate)
                .lte('tanggal', endDate)
                .order('id_varian', { ascending: true });

            if (error) throw error;

            // 2. Group by variant and calculate
            const variantsMap = new Map();

            data.forEach(record => {
                const varianId = record.varian.id;
                
                if (!variantsMap.has(varianId)) {
                    variantsMap.set(varianId, {
                        id: varianId,
                        name: `${record.varian.produk.nama} - ${record.varian.varian}`,
                        history: [],
                        purchaseHistory: [] // Track purchases separately for FIFO
                    });
                }
                
                const variant = variantsMap.get(varianId);
                variant.history.push(record);
                
                // Store purchases for FIFO HPP calculation
                if (['penjualan', 'penyesuaian_keluar'].includes(record.tipe_riwayat)) {
                    variant.hppHistory = variant.hppHistory || [];
                    variant.hppHistory.push({
                        qty: record.qty,
                        hpp: record.hpp,
                        tanggal: record.tanggal
                    });
                }
            });

            // 3. Process each variant
            return Array.from(variantsMap.values()).map(variant => {
                const history = variant.history.sort((a, b) => 
                    new Date(a.tanggal) - new Date(b.tanggal));

                // A. Opening Balance (handles all transaction types)
                let openingBalance;
                if (history.length > 0) {
                    const firstRecord = history[0];
                    openingBalance = ['purchase', 'penyesuaian_masuk'].includes(firstRecord.tipe_riwayat)
                        ? firstRecord.saldo - firstRecord.qty  // Subtract for inbound
                        : firstRecord.saldo + firstRecord.qty; // Add for outbound
                } else {
                    openingBalance = 0;
                }

                // B. Transactions
                const purchases = history
                    .filter(item => item.tipe_riwayat === 'pembelian')
                    .reduce((sum, item) => sum + item.qty, 0);

                const sales = history
                    .filter(item => item.tipe_riwayat === 'penjualan')
                    .reduce((sum, item) => sum + item.qty, 0);

                const adjustmentsIn = history
                    .filter(item => item.tipe_riwayat === 'penyesuaian_masuk')
                    .reduce((sum, item) => sum + item.qty, 0);

                const adjustmentsOut = history
                    .filter(item => item.tipe_riwayat === 'penyesuaian_keluar')
                    .reduce((sum, item) => sum + item.qty, 0);

                // C. Closing Balance
                const closingBalance = history.length > 0 
                    ? history[history.length - 1].saldo 
                    : openingBalance;

                // D. HPP Calculation (FIFO-compatible approach)
                let hpp = 0;
                if (variant.hppHistory && variant.hppHistory.length > 0) {
                    variant.hppHistory.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)); // descending
                    hpp = variant.hppHistory[0].hpp;

                    console.log(`Latest HPP for ${variant.name}`, variant.hppHistory[0]);
                }

                return {
                    id: variant.id,
                    name: variant.name,
                    initialStock: openingBalance,
                    purchases,
                    sales,
                    adjustmentsIn,
                    adjustmentsOut,
                    finalStock: closingBalance,
                    hpp: hpp
                };
            });
        },
        template: (data, startDate, endDate) => {
             const start = new Date(startDate).toLocaleDateString('id-ID');
            const end = new Date(endDate).toLocaleDateString('id-ID');

            return `    
                <h4 class="report-header">Laporan Kartu Stok ${start} - ${end}</h4>
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th rowspan="2">Kode</th>
                            <th rowspan="2">Nama Barang</th>
                            <th rowspan="2" class="text-end">Stok Awal</th>
                            <th colspan="2" class="text-center">Stok Masuk</th>
                            <th colspan="2" class="text-center">Stok Keluar</th>
                            <th rowspan="2" class="text-end">Stok Akhir</th>
                            <th rowspan="2" class="text-end">HPP</th>
                        </tr>
                        <tr>
                            <!-- Subheaders for merged columns -->
                            <th class="text-end">Pembelian</th>
                            <th class="text-end">Penyesuaian</th>
                            <th class="text-end">Penjualan</th>
                            <th class="text-end">Penyesuaian</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                <td>VAR${item.id.toString().padStart(4, '0')}</td>
                                <td>${item.name}</td>
                                <td class="text-end">${item.initialStock}</td>
                                <td class="text-end">${item.purchases}</td>
                                <td class="text-end">${item.adjustmentsIn}</td>
                                <td class="text-end">${item.sales}</td>
                                <td class="text-end">${item.adjustmentsOut}</td>
                                <td class="text-end">${item.finalStock}</td>
                                <td class="text-end">${formatCurrency(item.hpp)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    },
    "Stock Opname": {
        fetchData: async (startDate, endDate) => {
            // Fetch stock opname logs
            const { data: logs, error: logsError } = await supabase
                .from('log_opname')
                .select(`
                    id,
                    tanggal,
                    status_log,
                    item_opname(
                        id,
                        id_varian,
                        stok,
                        status_item_log,
                        varian:id_varian(
                            varian,
                            produk:id_produk(nama),
                            jumlah_stok
                        )
                    )
                `)
                .gte('tanggal', startDate)
                .lte('tanggal', endDate)
                .order('tanggal', { ascending: false });
            
            if (logsError) throw logsError;

            // Fetch adjustment history for all logs
            const logIds = logs.map(log => log.id);
            const { data: adjustments, error: adjError } = await supabase
                .from('riwayat_stok')
                .select('id, id_referensi, qty, tipe_riwayat')
                .in('id_referensi', logIds)
                .or('tipe_riwayat.eq.penyesuaian_masuk,tipe_riwayat.eq.penyesuaian_keluar');
            
            if (adjError) throw adjError;

            // Group adjustments by log id
            const adjustmentsByLog = {};
            adjustments.forEach(adj => {
                if (!adjustmentsByLog[adj.id_referensi]) {
                    adjustmentsByLog[adj.id_referensi] = [];
                }
                adjustmentsByLog[adj.id_referensi].push(adj);
            });

            return {
                logs,
                adjustmentsByLog
            };
        },
        template: (data, startDate, endDate) => {
            const start = new Date(startDate).toLocaleDateString('id-ID');
            const end = new Date(endDate).toLocaleDateString('id-ID');
            return `
            <div class="stock-opname-report">
                <h4 class="report-header">Laporan Stock Opname ${start} - ${end}</h4>
                
                <table class="table table-bordered table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>ID Log</th>
                            <th>Tanggal</th>
                            <th>Status Log</th>
                            <th>ID Item</th>
                            <th>Nama Produk</th>
                            <th>Status Item</th>
                            <th>Stok</th>
                            <th>Penyesuaian</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.logs.map(log => `
                            ${log.item_opname.map((item, index) => {
                                // Find adjustment for this item
                                const adjustments = data.adjustmentsByLog[log.id] || [];
                                const itemAdjustment = adjustments.find(adj => adj.id === item.id);
                                const adjustmentValue = itemAdjustment ? 
                                    (itemAdjustment.tipe_riwayat === 'penyesuaian_masuk' ? 
                                    `+${itemAdjustment.qty}` : 
                                    `-${itemAdjustment.qty}`) : 
                                    '0';
                                
                                return `
                                    <tr class="${log.status_log === 'final' ? 'table-success' : 'table-warning'}">
                                        ${index === 0 ? `
                                            <td rowspan="${log.item_opname.length}">${log.id}</td>
                                            <td rowspan="${log.item_opname.length}">${new Date(log.tanggal).toLocaleDateString('id-ID')}</td>
                                            <td rowspan="${log.item_opname.length}">
                                                ${log.status_log}
                                            </td>
                                        ` : ''}
                                        <td>VAR${item.id_varian.toString().padStart(4, '0')}</td>
                                        <td>${item.varian?.produk?.nama || ''} - ${item.varian?.varian || ''}</td>
                                        <td>${item.status_item_log}</td>
                                        <td class="text-end">${item.stok}</td>
                                        <td class="text-end ${adjustmentValue.startsWith('+') ? 'text-success' : adjustmentValue.startsWith('-') ? 'text-danger' : ''}">
                                            ${item.status_item_log === 'disesuaikan' ? adjustmentValue : '0'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        `).join('')}
                    </tbody>
                </table>
            </div>
            `;
        }
    }
    };

    // Helper functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount).replace('Rp', 'Rp ');
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID');
    }

    // Generate report function
    async function generateReport() {
        const jenis = jenisSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Validate date range
        if (!startDate || !endDate) {
            showToast('Harap pilih rentang tanggal', 'error');
            disableDownloadButton(); // Disable download button
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            showToast('Tanggal mulai tidak boleh lebih besar dari tanggal akhir', 'error');
            disableDownloadButton(); // Disable download button
            return;
        }
        
        try {
            // Show loading state
            generateText.textContent = 'Memuat...';
            generateSpinner.style.display = 'inline-block';
            generateBtn.disabled = true;
            disableDownloadButton(); // Disable download button while loading
            
            // Fetch data with date range
            const data = await reportData[jenis].fetchData(startDate, endDate);
            
            // Check if data is empty
            if (isEmptyData(data)) {
                reportContent.innerHTML = `
                    <div class="alert alert-info text-center">
                        Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.
                    </div>
                `;
                disableDownloadButton(); // Disable download button when no data
                return;
            }
            
            // Generate HTML with date range
            const content = reportData[jenis].template(data, startDate, endDate);
            reportContent.innerHTML = content;
            enableDownloadButton(); // Enable download button when data is available
            setTimeout(scrollReportToTop, 100);
        } catch (error) {
            console.error('Error generating report:', error);
            reportContent.innerHTML = `
                <div class="alert alert-danger">
                    Gagal memuat laporan: ${error.message}
                </div>
            `;
            disableDownloadButton(); // Disable download button on error
        } finally {
            // Reset loading state
            generateText.textContent = 'Buat Laporan';
            generateSpinner.style.display = 'none';
            generateBtn.disabled = false;
        }
    }

    // Add these helper functions to enable/disable the download button
    function disableDownloadButton() {
        downloadBtn.disabled = true;
        downloadBtn.classList.add('disabled');
    }

    function enableDownloadButton() {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('disabled');
    }

    // Initialize with download button disabled
    disableDownloadButton();

    // Download PDF function
    // async function downloadPDF() {
    //     const element = document.getElementById("report");
    //     const year = periodeSelect.value;
    //     const jenis = jenisSelect.value;
        
    //     try {
    //         const canvas = await html2canvas(element); // Now using global html2canvas
    //         const imgData = canvas.toDataURL('image/png');
    //         const pdf = new jsPDF('p', 'mm', 'a4'); // jsPDF is from window.jspdf
    //         const imgProps = pdf.getImageProperties(imgData);
    //         const pdfWidth = pdf.internal.pageSize.getWidth();
    //         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
    //         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    //         pdf.save(`Laporan_${jenis}_${year}.pdf`);
    //     } 
    //     catch (error) {
    //         console.error('Error generating PDF:', error);
    //         alert('Gagal mengunduh PDF. Silakan coba lagi.');
    //     }
    // }

    async function generatePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        let yPos = 30;
        const jenis = jenisSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Validate date range
        if (!startDate || !endDate) {
            showToast('Harap pilih rentang tanggal', 'error');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            showToast('Tanggal mulai tidak boleh lebih besar dari tanggal akhir', 'error');
            return;
        }
        
        // Update title to show date range
        const start = new Date(startDate).toLocaleDateString('id-ID');
        const end = new Date(endDate).toLocaleDateString('id-ID');
        
        // 1. Letterhead Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(40);
        pdf.text('GUNARTO', margin, 15);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('Pasar Klewer, Surakarta', margin, 20);
        pdf.setDrawColor(150);
        pdf.line(margin, 22, 210 - margin, 22);
        
        // 2. Report Title
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text(`LAPORAN ${jenis.toUpperCase()}`, 105, yPos, {align: 'center'});
        yPos += 8;
        
        pdf.setFontSize(12);
        pdf.text(`${start} - ${end}`, 105, yPos, {align: 'center'});
        yPos += 15;
        
        try {
            // 3. Get report data
            const data = await reportData[jenis].fetchData(startDate, endDate);
            
            // Check if data is empty
            if (isEmptyData(data)) {
                pdf.setFontSize(12);
                pdf.setTextColor(100);
                pdf.text('Tidak ada data yang tersedia untuk laporan ini dengan filter yang dipilih.', 
                        105, yPos, {align: 'center'});
                
                // Add footer to all pages
                addFooter(pdf, margin);
                
                pdf.save(`Laporan_${jenis}_${new Date().getFullYear()}.pdf`);
                return;
            }
            
            const groupBy = document.getElementById('groupBy')?.value || 'order';
            
            // 4. Generate report-specific content
            switch(jenis) {
                case 'Laba Rugi':
                    generateProfitLossTable(pdf, data, yPos, margin);
                    break;
                    
                case 'Pembelian':
                    if (groupBy === 'supplier') {
                        generateByEntity(pdf, data, yPos, margin, {
                            entityType: 'supplier',
                            entityLabel: 'SUPPLIER',
                            amountLabel: 'TOTAL DIBERIKAN (Rp)'
                        });
                    } else if (groupBy === 'product') {
                        generateByProduct(pdf, data, yPos, margin, {
                            entityLabel: 'SUPPLIER',
                            amountLabel: 'TOTAL DIBERIKAN (Rp)',
                            qtyLabel: 'TOTAL DIBELI'
                        });
                    } else {
                        generateByOrder(pdf, data, yPos, margin, {
                            prefix: 'PO',
                            contactLabel: 'Supplier',
                            reportLabel: 'Pembelian',
                            itemField: 'item_pesanan_pembelian',
                            isPenjualan: false
                        });
                    }
                    break;

                case 'Penjualan':
                    if (groupBy === 'customer') {
                        generateByEntity(pdf, data, yPos, margin, {
                            entityType: 'customer',
                            entityLabel: 'BAKUL',
                            amountLabel: 'TOTAL DIBERIKAN (Rp)'
                        });
                    } else if (groupBy === 'product') {
                        generateByProduct(pdf, data, yPos, margin, {
                            entityLabel: 'BAKUL',
                            amountLabel: 'TOTAL PENDAPATAN (Rp)',
                            qtyLabel: 'TOTAL TERJUAL'
                        });
                    } else {
                        generateByOrder(pdf, data, yPos, margin, {
                            prefix: 'SO',
                            contactLabel: 'Bakul',
                            reportLabel: 'Penjualan',
                            itemField: 'item_pesanan_penjualan',
                            isPenjualan: true
                        });
                    }
                    break;
                    
                case 'Kartu Stok':
                    generateStockCardTable(pdf, data, yPos, margin);
                    break;
                    
                case 'Stock Opname':
                    generateStockOpname(pdf, data, yPos, margin);
                    break;
            }
            
            // 5. Add footer to all pages
            addFooter(pdf, margin);
            
            pdf.save(`Laporan_${jenis}_${new Date().getFullYear()}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Gagal membuat PDF: ' + error.message, 'error');
        }
    }
    
    // ===== REPORT TYPE TEMPLATES ===== //
    
    function generateProfitLossTable(pdf, data, yPos, margin) {
        const financialData = [
            ['Pendapatan', formatCurrencyPDF(data.totalRevenue)],
            ['Harga Pokok Penjualan (HPP)', formatCurrencyPDF(data.totalCOGS)],
            ['Laba Kotor', formatCurrencyPDF(data.grossProfit)],
            ['Biaya Operasional', formatCurrencyPDF(data.operatingExpenses)],
            ['Laba Bersih', formatCurrencyPDF(data.netProfit)]
        ];

        pdf.autoTable({
            head: [['KETERANGAN', 'JUMLAH (Rp)']],
            body: financialData,
            startY: yPos,
            margin: { left: margin, right: margin },
            theme: 'grid',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: 'bold',
                fontSize: 11,
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontSize: 10,
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                cellPadding: 2,
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right', cellWidth: 60 }
            },

            didParseCell: (data) => {
                const rowIndex = data.row.index;
                const isResultRow = rowIndex === 2 || rowIndex === 4;

                if (data.section === 'body' && isResultRow) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [0,0,0]; // dark grey
                    data.cell.styles.textColor = [255, 255, 255]; // white text

                    if (data.column.index === 0) {
                        data.cell.styles.halign = 'right'; // align KETERANGAN to right
                    }
                }
            },

            didDrawCell: (data) => {
                // Ensure currency is properly formatted
                if (data.column.index === 1 && typeof data.cell.raw === 'string') {
                    const numeric = parseFloat(data.cell.raw.replace(/\./g, '').replace(',', '.'));
                    data.cell.text = formatCurrencyPDF(numeric);
                }
            }
        });
    }

    function generateByEntity(pdf, data, yPos, margin, options) {
        const { entityType, entityLabel, amountLabel } = options;
        const totalAmount = data.reduce((sum, item) => sum + (item.totalPaid || item.totalRevenue || 0), 0);
        const totalItems = data.reduce((sum, item) => sum + (item.totalItems || item.totalSold || 0), 0);
        
        const headers = [
            'NO', 
            entityLabel,
            'TOTAL PESANAN', 
            entityType === 'product' ? 'TOTAL ITEMS' : 'TOTAL ITEMS',
            amountLabel
        ];
        
        const body = data.map((item, index) => [
            index + 1,
            entityType === 'supplier' ? 
                `${item.supplier?.perusahaan || '-'}\n${item.supplier?.cp || '-'}` :
                entityType === 'customer' ?
                item.customer :
                item.product,
            item.totalOrders,
            entityType === 'product' ? 
                (item.totalPurchased || item.totalSold) : 
                item.totalItems,
            formatCurrencyPDF(item.totalPaid || item.totalRevenue || item.totalDibayarkan)
        ]);
        
        body.push([
            '', 
            'TOTAL',
            data.length,
            totalItems,
            formatCurrencyPDF(totalAmount)
        ]);
        
        pdf.autoTable({
            head: [headers],
            body: body,
            startY: yPos,
            margin: {left: margin, right: margin},
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: 'bold',
                lineWidth: 0.1,             // thin border
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                fillColor: [255, 255, 255], // white background for rows
                textColor: 0,               // black text
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255] // disable striping
            },
            columnStyles: {
                2: {halign: 'right'},
                3: {halign: 'right'},
                4: {halign: 'right'},
                [body.length-1]: {
                    fontStyle: 'bold',
                    fillColor: [220, 220, 220]
                }
            },
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak'
            }
        });
    }

    function generateByProduct(pdf, data, yPos, margin, options) {
        const { entityLabel, amountLabel } = options;
        const totalQty = data.reduce((sum, item) => sum + (item.totalPurchased || item.totalSold || 0), 0);
        const totalAmount = data.reduce((sum, item) => sum + (item.totalDibayarkan || item.totalRevenue || 0), 0);
        
        const headers = [
            'NO', 
            'PRODUK',
            entityLabel,
            'TOTAL PESANAN',
            options.qtyLabel,
            amountLabel
        ];
        
        const body = data.map((item, index) => [
            index + 1,
            item.product,
            item.suppliers || item.customers || '-',
            item.totalOrders,
            item.totalPurchased || item.totalSold,
            formatCurrencyPDF(item.totalDibayarkan || item.totalRevenue)
        ]);
        
        body.push([
            '', 
            'TOTAL', 
            '', 
            data.length, 
            totalQty, 
            formatCurrencyPDF(totalAmount)
        ]);
        
        pdf.autoTable({
            head: [headers],
            body: body,
            startY: yPos,
            margin: {left: margin, right: margin},
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: 'bold',
                lineWidth: 0.1,             // thin border
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                fillColor: [255, 255, 255], // white background for rows
                textColor: 0,               // black text
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255] // disable striping
            },
            columnStyles: {
                3: {halign: 'right'},
                4: {halign: 'right'},
                5: {halign: 'right'},
                [body.length-1]: {
                    fontStyle: 'bold',
                    fillColor: [255, 255, 255]
                }
            },
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak'
            }
        });
    }

    function generateByOrder(pdf, data, yPos, margin, options) {
        const { prefix, contactLabel, reportLabel, itemField, isPenjualan } = options;
        const total = data.reduce((sum, order) => sum + (order.total_dibayarkan || 0), 0);
        
        // Add title for orders list
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text(`Daftar Pesanan ${reportLabel}`, margin, yPos);
        yPos += 10;
        
        // Process each order
        data.forEach((order, orderIndex) => {
            const orderTotalItems = order[itemField]?.reduce((sum, item) => sum + (item.qty_dipesan || 0), 0) || 0;
            
            // Add order header
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${prefix}-${order.id.toString().padStart(4, '0')} - ${formatDate(order.tanggal_pesan)}`, margin, yPos);
            yPos += 5;
            
            pdf.setFont('helvetica', 'normal');
            if (isPenjualan) {
                pdf.text(`${contactLabel}: ${order.bakul?.nama || 'Walk-in'}`, margin, yPos);
            } else {
                pdf.text(`${contactLabel}: ${order.supplier?.perusahaan || '-'} (${order.supplier?.cp || '-'})`, margin, yPos);
            }
            yPos += 5;
            pdf.text(`Total: ${formatCurrencyPDF(order.total_dibayarkan)}`, margin, yPos);
            yPos += 5;
            
            // Prepare items table - modified to include price difference for sales
            const headers = isPenjualan 
                ? ['PRODUK', 'QTY', 'HARGA SATUAN', 'HARGA STANDAR', 'DISKON/KENAIKAN', 'SUBTOTAL']
                : ['PRODUK', 'QTY', 'HARGA SATUAN', 'SUBTOTAL'];
            
            const body = (order[itemField] || []).map(item => {
                const productName = item.varian?.produk?.nama 
                    ? `${item.varian.produk.nama} - ${item.varian.varian || ''}` 
                    : 'Unknown Product';
                
                if (isPenjualan) {
                    const standardPrice = item.varian?.harga_standar || 0;
                    const difference = item.priceDifference || 0;
                    const differenceText = difference === 0 
                        ? '0' 
                        : (difference > 0 ? `+${formatCurrencyPDF(difference)}` : formatCurrencyPDF(difference));
                    
                    return [
                        productName,
                        item.qty_dipesan || 0,
                        formatCurrencyPDF(item.harga_jual),
                        formatCurrencyPDF(standardPrice),
                        { 
                            content: differenceText,
                            styles: {
                                textColor: difference > 0 ? [0, 128, 0] : difference < 0 ? [255, 0, 0] : [0, 0, 0]
                            }
                        },
                        formatCurrencyPDF((item.qty_dipesan || 0) * (item.harga_jual || 0))
                    ];
                } else {
                    return [
                        productName,
                        item.qty_dipesan || 0,
                        formatCurrencyPDF(item.harga_beli || 0),
                        formatCurrencyPDF((item.qty_dipesan || 0) * (item.harga_beli || 0))
                    ];
                }
            });
            
            // Generate items table
            pdf.autoTable({
                head: [headers],
                body: body,
                startY: yPos,
                margin: {left: margin, right: margin},
                headStyles: {
                    fillColor: [255,255,255],
                    textColor: 0,
                    fontStyle: 'bold',
                    lineWidth: 0.1,             // thin border
                    lineColor: [0, 0, 0]
                },
                bodyStyles: {
                    fillColor: [255, 255, 255], // white background for rows
                    textColor: 0,               // black text
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                },
                columnStyles: {
                    // index 0: "PRODUK"
                    0: { cellWidth: 35 }, // make this the widest

                    // index 1: "QTY"
                    1: { cellWidth: 12, halign: 'right' },

                    // index 2: "HARGA SATUAN"
                    2: { cellWidth: 30, halign: 'right' },

                    ...(isPenjualan ? {
                        // index 3: "HARGA STANDAR"
                        3: { cellWidth: 32, halign: 'right' },
                        // index 4: "DISKON/KENAIKAN"
                        4: { cellWidth: 35, halign: 'right' },
                        // index 5: "SUBTOTAL"
                        5: { cellWidth: 25, halign: 'right' }
                    } : {
                        // index 3: "SUBTOTAL"
                        3: { cellWidth: 25, halign: 'right' }
                    })
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255] // disable striping
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 2,
                    overflow: 'linebreak'
                },
                didDrawPage: (data) => {
                    yPos = data.cursor.y + 5;
                }
            });
            
            yPos += 10;
            
            // Add page break if needed
            if (yPos > 250 && orderIndex < data.length - 1) {
                pdf.addPage();
                yPos = 30;
            }
        });
        
        // Add total at the end
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Total ${reportLabel}: ${formatCurrencyPDF(total)}`, margin, yPos);
    }

    function generateStockCardTable(pdf, data, yPos, margin) {
        // Add report title with date range
        pdf.setFontSize(14);
        pdf.setTextColor(0);
        // pdf.text('LAPORAN KARTU STOK', 105, yPos, {align: 'center'});
        // yPos += 8;
        
        // Add date range
        // const startDate = document.getElementById('startDate').value;
        // const endDate = document.getElementById('endDate').value;
        // const start = new Date(startDate).toLocaleDateString('id-ID');
        // const end = new Date(endDate).toLocaleDateString('id-ID');
        // pdf.setFontSize(11);
        // pdf.text(`Periode: ${start} - ${end}`, 105, yPos, {align: 'center'});
        // yPos += 15;

        // Prepare table data with all columns
        const body = data.map(item => [
            `VAR${item.id.toString().padStart(4, '0')}`,
            item.name,
            formatNumber(item.initialStock),
            formatNumber(item.purchases),
            formatNumber(item.adjustmentsIn),
            formatNumber(item.sales),
            formatNumber(item.adjustmentsOut),
            formatNumber(item.finalStock),
            formatCurrencyPDF(item.hpp)
        ]);

        // Generate table
        pdf.autoTable({
            head: [
                [
                    {content: 'KODE', rowSpan: 2},
                    {content: 'BARANG', rowSpan: 2},
                    {content: 'AWAL', rowSpan: 2},
                    {content: 'MASUK', colSpan: 2},
                    {content: 'KELUAR', colSpan: 2},
                    {content: 'AKHIR', rowSpan: 2},
                    {content: 'HPP', rowSpan: 2}
                ],
                [
                    'PEMBELIAN',
                    'PENYESUAIAN',
                    'PENJUALAN',
                    'PENYESUAIAN'
                ]
            ],
            body: body,
            startY: yPos,
            margin: {left: margin, right: margin},
            tableWidth: 'auto',
            headStyles: {
                fillColor: [255,255,255],
                textColor: 0,
                fontStyle: 'bold',
                valign: 'middle',
                halign: 'center'
            },
            columnStyles: {
                0: {cellWidth: 'auto', halign: 'left'}, // Kode
                1: {cellWidth: 'auto', halign: 'left'}, // Nama Barang
                2: {cellWidth: 'auto', halign: 'right'}, // Stok Awal
                3: {cellWidth: 'auto', halign: 'right'}, // Pembelian
                4: {cellWidth: 'auto', halign: 'right'}, // Penyesuaian Masuk
                5: {cellWidth: 'auto', halign: 'right'}, // Penjualan
                6: {cellWidth: 'auto', halign: 'right'}, // Penyesuaian Keluar
                7: {cellWidth: 'auto', halign: 'right'}, // Stok Akhir
                8: {cellWidth: 'auto', halign: 'right'}  // HPP
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            }
        });

        // Helper function to format numbers with thousand separators
        function formatNumber(num) {
            return new Intl.NumberFormat('id-ID').format(num);
        }

        // Helper function to format currency for PDF
        function formatCurrencyPDF(amount) {
            if (isNaN(amount) || amount === null) return '-';
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace('Rp', '').trim();
        }

        return pdf;
    }
    
    function generateStockOpname(pdf, data, startY = 30, margin = 14) {
        const { logs, adjustmentsByLog } = data;
        
        pdf.setFont('helvetica');
        
        // Enable jsPDF text wrapping
        pdf.setFontSize(9); // Set base font size
        const lineHeight = 5; // Adjust line height for wrapped text
        
        const body = [];
        logs.forEach(log => {
            log.item_opname.forEach(item => {
                const adjustment = (adjustmentsByLog[log.id] || []).find(adj => adj.id === item.id);
                const adjustmentValue = adjustment ? 
                    (adjustment.tipe_riwayat === 'penyesuaian_masuk' ? 
                    `+${adjustment.qty}` : 
                    `-${adjustment.qty}`) : 
                    '0';
                
                const productName = `${item.varian?.produk?.nama || ''} - ${item.varian?.varian || ''}`;
                
                body.push([
                    log.id.toString(),
                    formatShortDate(log.tanggal),
                    log.status_log,
                    `VAR${item.id_varian.toString().padStart(4, '0')}`,
                    { 
                        content: productName,
                        styles: { 
                            cellWidth: 40,  // Fixed width for wrapping
                            valign: 'middle'
                        }
                    },
                    item.status_item_log,
                    { 
                        content: item.stok.toString(), 
                        styles: { halign: 'right' } 
                    },
                    { 
                        content: item.status_item_log === 'disesuaikan' ? adjustmentValue : '0',
                        styles: { 
                            halign: 'right',
                            textColor: adjustmentValue.startsWith('+') ? [0, 128, 0] : 
                                    adjustmentValue.startsWith('-') ? [255, 0, 0] : [0, 0, 0]
                        }
                    }
                ]);
            });
        });

        pdf.autoTable({
            head: [['ID', 'TANGGAL', 'STATUS', 'ITEM', 'PRODUK', 'STATUS', 'STOK', 'PENY.']],
            body: body,
            startY: startY + 2,
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            styles: {
                fontSize: 10,
                cellPadding: 2,
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                lineHeight: lineHeight  // Set uniform line height
            },
            headStyles: {
                fillColor: [255,255,255],
                textColor: 0,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                valign: 'middle',
                textColor: 0,
            },
            columnStyles: {
                0: { cellWidth: 10 },  // ID
                1: { cellWidth: 25 },  // Date
                2: { cellWidth: 20 },  // Status
                3: { cellWidth: 20 },  // Item ID
                4: { cellWidth: 45 },  // Product (will wrap)
                5: { cellWidth: 25 },  // Item Status
                6: { cellWidth: 15 },  // Stock
                7: { cellWidth: 15 }   // Adjustment
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
            didDrawCell: (data) => {
                if (data.column.index === 4 && data.cell.raw) { // Product name column
                    const text = data.cell.raw;
                    const cellWidth = data.cell.width - 4; // Account for padding
                    
                    // Split text into multiple lines if needed
                    const lines = pdf.splitTextToSize(text, cellWidth);
                    if (lines.length > 1) {
                        data.cell.text = lines;
                        data.row.height = Math.max(data.row.height, lines.length * lineHeight);
                    }
                }
            }
        });

        function formatShortDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
        }

        return pdf;
    }
    
    // ===== UTILITY FUNCTIONS ===== //
    
    function addFooter(pdf, margin) {
        const pageCount = pdf.internal.getNumberOfPages();
        
        for(let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            
            // Footer line
            pdf.setDrawColor(200);
            pdf.line(margin, 285, 210 - margin, 285);
            
            // Footer text
            pdf.text(`Halaman ${i} dari ${pageCount}`, 105, 291, {align: 'center'});
            pdf.text(`Dibuat pada ${new Date().toLocaleDateString('id-ID')}`, 105, 294, {align: 'center'});
        }
    }
    
    // Improved currency formatting
    function formatCurrencyPDF(amount) {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Event listeners
    generateBtn.addEventListener('click', generateReport);
    downloadBtn.addEventListener('click', generatePDF);

    // Initialize
    // function init() {
    // periodeSelect.value = new Date().getFullYear().toString();
    // }

    // init();
});