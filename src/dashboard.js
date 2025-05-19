import supabase from './db_conn.js';
import Chart from 'chart.js/auto';

// others
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function setupEventListeners() {
    // Date range functionality
    const quickRangeBtns = document.querySelectorAll('.quick-range');
    quickRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            quickRangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const days = parseInt(btn.getAttribute('data-range'));
            setDateRange(days);
            
            // Reload current tab content with new date range
            const activeTab = getActiveTab();
            if (activeTab) {
                loadTabContent(activeTab);
            }
        });
    });
    
    // Apply button
    document.getElementById('apply-btn').addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (startDate && endDate) {
            const activeTab = getActiveTab();
            if (activeTab === 'overview') {
                updateRevenueMetric(startDate, endDate);
            }
            loadTabContent(activeTab);
        }
    });
    
    // Tab switching - using Bootstrap's built-in events
    const tabEls = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabEls.forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', (event) => {
            const tabId = event.target.getAttribute('data-bs-target').substring(1);
            loadTabContent(tabId);
        });
    });
}

function getActiveTab() {
    const activeTab = document.querySelector('.nav-tabs .nav-link.active');
    return activeTab ? activeTab.getAttribute('data-bs-target').substring(1) : 'overview';
}

function setDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Format dates as YYYY-MM-DD for the input fields
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    document.getElementById('start-date').value = formatDate(startDate);
    document.getElementById('end-date').value = formatDate(endDate);
    
    // Update the active tab content with the new date range
    const activeTab = getActiveTab();
    if (activeTab === 'overview') {
        updateRevenueMetric(formatDate(startDate), formatDate(endDate));
    }
    loadTabContent(activeTab);
}

async function loadTabContent(tabId) {
    const contentDiv = document.getElementById(`${tabId}-content`);
    
    // Only show loading state if the content is empty
    if (contentDiv.innerHTML.trim() === '') {
        contentDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading ${tabId} insights...</p>
            </div>
        `;
    }
    
    try {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (tabId === 'overview') {
            await loadOverviewInsights(startDate, endDate);
        } else if (tabId === 'contact') {
            await loadContactTabInsights(startDate, endDate);
        } else if (tabId === 'log') {
            await loadLogInsights(startDate, endDate);
        }
        else if (tabId === 'inventory') {
            await loadInventoryInsights(startDate, endDate);
        }
        else if (!contentDiv.innerHTML.includes('alert')) {
            contentDiv.innerHTML = `
                <div class="alert alert-info">
                    Insights for ${tabId} will be displayed here
                </div>
            `;
        }
    } catch (error) {
        console.error(`Error loading ${tabId} tab:`, error);
        if (!contentDiv.innerHTML.includes('alert')) {
            contentDiv.innerHTML = `
                <div class="alert alert-danger">
                    Failed to load ${tabId} data: ${error.message}
                </div>
            `;
        }
    }
}

// OVERVIEW
async function loadOverviewInsights(startDate, endDate) {
    const overviewContent = document.getElementById('overview-content');
    
    // Show loading state
    overviewContent.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading overview insights...</p>
        </div>
    `;
    
    try {
        // Create the overview content structure
        overviewContent.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-3 mb-3 mb-md-0">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-subtitle mb-2 text-muted">Total Pendapatan</h6>
                            <h3 class="card-title" id="revenue-metric"><i class="fas fa-spinner fa-spin"></i></h3>
                            <p class="card-text text-success mb-0" id="revenue-change"></p>
                        </div>
                    </div>
                </div>
                <!-- Add more metric cards here if needed -->
            </div>
            <!-- Add other overview content sections here -->
        `;
        
        // Load the revenue metric
        await updateRevenueMetric(startDate, endDate);
        
        // Load other overview insights here...
        
    } catch (error) {
        console.error('Error loading overview insights:', error);
        overviewContent.innerHTML = `
            <div class="alert alert-danger">
                Failed to load overview data: ${error.message}
            </div>
        `;
    }
}

async function updateRevenueMetric(startDate, endDate) {
    try {
        // Fetch revenue data from Supabase
        const { data: revenueData, error } = await supabase
            .from('pesanan_penjualan')
            .select('total_dibayarkan, tanggal_pesan')
            .gte('tanggal_pesan', startDate)
            .lte('tanggal_pesan', endDate);
        
        if (error) throw error;
        
        // Calculate total revenue
        const totalRevenue = revenueData.reduce((sum, order) => sum + (order.total_dibayarkan || 0), 0);
        
        // Format as currency (IDR)
        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        
        // Update UI
        document.getElementById('revenue-metric').textContent = formatter.format(totalRevenue);
        
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        document.getElementById('revenue-metric').textContent = 'Error';
    }
}

// CONTACT
async function loadContactTabInsights(startDate, endDate) {
    try {
        // Load supplier insights
        await loadSupplierInsights(startDate, endDate);
        
        // Load customer insights
        await loadCustomerInsights(startDate, endDate);
    } catch (error) {
        console.error('Error loading contact tab insights:', error);
        showToast('Failed to load supplier/customer insights', 'error');
    }
}

async function loadSupplierInsights(startDate, endDate) {
    // 1. Average items per supplier
    const { data: avgItemsData, error: avgItemsError } = await supabase
        .from('pesanan_pembelian')
        .select(`
            id_supplier,
            items:item_pesanan_pembelian(
                qty_dipesan
            )
        `)
        .gte('tanggal_pesan', startDate)
        .lte('tanggal_pesan', endDate);

    if (!avgItemsError) {
        const supplierItemCounts = {};
        avgItemsData.forEach(order => {
            if (!supplierItemCounts[order.id_supplier]) {
                supplierItemCounts[order.id_supplier] = 0;
            }
            order.items.forEach(item => {
                supplierItemCounts[order.id_supplier] += item.qty_dipesan;
            });
        });

        const avgItems = Object.values(supplierItemCounts).reduce((a, b) => a + b, 0) / Object.keys(supplierItemCounts).length;
        document.getElementById('avg-items-supplier').textContent = avgItems.toFixed(1);
    }

    // 2. Lead time (from ordered to received)
    const { data: leadTimeData, error: leadTimeError } = await supabase
        .from('pesanan_pembelian')
        .select('tanggal_pesan, tanggal_diterima')
        .not('tanggal_diterima', 'is', null)
        .gte('tanggal_pesan', startDate)
        .lte('tanggal_pesan', endDate);

    if (!leadTimeError && leadTimeData.length > 0) {
        const totalDays = leadTimeData.reduce((sum, order) => {
            const orderedDate = new Date(order.tanggal_pesan);
            const receivedDate = new Date(order.tanggal_diterima);
            const diffTime = receivedDate - orderedDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return sum + diffDays;
        }, 0);
        
        const avgLeadTime = totalDays / leadTimeData.length;
        document.getElementById('avg-lead-time').textContent = avgLeadTime.toFixed(1);
    }

    // 3. Most purchased items by supplier
    const { data: purchasedItemsData, error: purchasedItemsError } = await supabase
        .from('item_pesanan_pembelian')
        .select(`
            qty_dipesan,
            produk_varian: id_varian(varian, produk: id_produk(nama)),
            pesanan_pembelian!inner(
                tanggal_pesan,
                supplier:id_supplier(id, perusahaan, cp)
            )
        `)
        .gte('pesanan_pembelian.tanggal_pesan', startDate)
        .lte('pesanan_pembelian.tanggal_pesan', endDate);

    if (!purchasedItemsError) {
        const supplierMap = {};
        
        purchasedItemsData.forEach(item => {
            const supplier = item.pesanan_pembelian.supplier;
            const displayName = getSupplierDisplayName(supplier);
            const supplierKey = `${supplier.id}-${displayName}`;
            
            if (!supplierMap[supplierKey]) {
                supplierMap[supplierKey] = {
                    id: supplier.id,
                    name: displayName,
                    items: {}
                };
            }
            
            const itemKey = `${item.produk_varian.produk.nama}-${item.produk_varian.varian}`;
            supplierMap[supplierKey].items[itemKey] = 
                (supplierMap[supplierKey].items[itemKey] || 0) + item.qty_dipesan;
        });

        const allItems = [];
        Object.values(supplierMap).forEach(supplier => {
            Object.entries(supplier.items).forEach(([itemName, qty]) => {
                allItems.push({
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                    itemName: itemName,
                    qty: qty
                });
            });
        });

        const sortedItems = allItems.sort((a, b) => b.qty - a.qty).slice(0, 10);
        
        const tableBody = document.getElementById('most-purchased-items');
        tableBody.innerHTML = sortedItems.map(item => `
            <tr>
                <td>
                    <div class="fw-bold">${item.supplierName}</div>
                    <small class="text-muted">ID: ${item.supplierId}</small>
                </td>
                <td>${item.itemName}</td>
                <td class="text-end">${item.qty}</td>
            </tr>
        `).join('');
    }

    // 4. Supplier Performance
    const { data: damagedItemsData, error: damagedItemsError } = await supabase
        .from('item_pesanan_pembelian')
        .select(`
            qty_rusak,
            pesanan_pembelian!inner(
                tanggal_pesan,
                supplier:id_supplier(id, perusahaan, cp)
            )
        `)
        .not('qty_rusak', 'is', null)
        .gte('pesanan_pembelian.tanggal_pesan', startDate)
        .lte('pesanan_pembelian.tanggal_pesan', endDate);

    if (!damagedItemsError) {
        const supplierDamaged = {};
        
        damagedItemsData.forEach(item => {
            const supplier = item.pesanan_pembelian.supplier;
            const displayName = getSupplierDisplayName(supplier);
            const supplierKey = `${supplier.id}-${displayName}`;
            supplierDamaged[supplierKey] = {
                id: supplier.id,
                name: displayName,
                qty: (supplierDamaged[supplierKey]?.qty || 0) + item.qty_rusak
            };
        });

        const sortedSuppliers = Object.values(supplierDamaged)
            .sort((a, b) => b.qty - a.qty);

        const tableBody = document.getElementById('supplier-performance');
        tableBody.innerHTML = sortedSuppliers.map(supplier => `
            <tr>
                <td>
                    <div class="fw-bold">${supplier.name}</div>
                    <small class="text-muted">ID: ${supplier.id}</small>
                </td>
                <td class="text-end">${supplier.qty}</td>
                <td>
                    <span class="badge ${supplier.qty > 10 ? 'bg-danger' : supplier.qty > 5 ? 'bg-warning' : 'bg-success'}">
                        ${supplier.qty > 10 ? 'Poor' : supplier.qty > 5 ? 'Fair' : 'Good'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

// Helper function to get supplier display name
function getSupplierDisplayName(supplier) {
    return supplier.perusahaan || `(Tanpa Nama Perusahaan) - ${supplier.cp}`;
}

async function loadCustomerInsights(startDate, endDate) {
    // 1. Total new customers
    const { data: newCustomersData, error: newCustomersError } = await supabase
        .from('pesanan_penjualan')
        .select('id_bakul')
        .eq('id_bakul', 0) 
        .gte('tanggal_pesan', startDate)
        .lte('tanggal_pesan', endDate);

    if (!newCustomersError) {
        document.getElementById('total-new-customers').textContent = newCustomersData.length;
    }

    // 2. Average purchase rate
    const { data: allCustomersData, error: allCustomersError } = await supabase
        .from('pesanan_penjualan')
        .select('id_bakul, tanggal_pesan')
        .gte('tanggal_pesan', startDate)
        .lte('tanggal_pesan', endDate);

    if (!allCustomersError) {
        const customerOrders = {};
        allCustomersData.forEach(order => {
            if (!customerOrders[order.id_bakul]) {
                customerOrders[order.id_bakul] = 0;
            }
            customerOrders[order.id_bakul]++;
        });

        const avgPurchaseRate = Object.values(customerOrders).reduce((a, b) => a + b, 0) / Object.keys(customerOrders).length;
        document.getElementById('avg-purchase-rate').textContent = avgPurchaseRate.toFixed(1);
    }

    // 3. Inactive customers (no purchases in 30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: inactiveCustomersData, error: inactiveCustomersError } = await supabase
        .from('pesanan_penjualan')
        .select('id_bakul, tanggal_pesan')
        .order('tanggal_pesan', { ascending: false })
        .lte('tanggal_pesan', thirtyDaysAgo.toISOString().split('T')[0]);

    if (!inactiveCustomersError) {
        const inactiveCustomers = {};
        inactiveCustomersData.forEach(order => {
            if (!inactiveCustomers[order.id_bakul]) {
                const lastPurchase = new Date(order.tanggal_pesan);
                const today = new Date();
                const diffTime = today - lastPurchase;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                inactiveCustomers[order.id_bakul] = {
                    lastPurchase: order.tanggal_pesan.split('T')[0],
                    daysInactive: diffDays
                };
            }
        });

        const tableBody = document.getElementById('inactive-customers');
        tableBody.innerHTML = Object.entries(inactiveCustomers)
            .slice(0, 5) // Show top 5
            .map(([id, data]) => `
                <tr>
                    <td>${id}</td>
                    <td>${data.lastPurchase}</td>
                    <td>${data.daysInactive}</td>
                </tr>
            `).join('');
    }

    // 4. Top and bottom customers
    const { data: customerSpendingData, error: customerSpendingError } = await supabase
        .from('pesanan_penjualan')
        .select('id_bakul, total_dibayarkan')
        .gte('tanggal_pesan', startDate)
        .lte('tanggal_pesan', endDate);

    if (!customerSpendingError) {
        const customerStats = {};
        customerSpendingData.forEach(order => {
            if (!customerStats[order.id_bakul]) {
                customerStats[order.id_bakul] = {
                    totalOrders: 0,
                    totalSpent: 0
                };
            }
            customerStats[order.id_bakul].totalOrders++;
            customerStats[order.id_bakul].totalSpent += order.total_dibayarkan || 0;
        });

        const sortedCustomers = Object.entries(customerStats)
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => b.totalSpent - a.totalSpent);

        // Get top and bottom 3
        const topCustomers = sortedCustomers.slice(0, 3);
        const bottomCustomers = sortedCustomers.slice(-3).reverse();

        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });

        const tableBody = document.getElementById('customer-ranking');
        tableBody.innerHTML = [
            ...topCustomers.map(customer => `
                <tr class="table-success">
                    <td>${customer.id}</td>
                    <td>${customer.totalOrders}</td>
                    <td>${formatter.format(customer.totalSpent)}</td>
                </tr>
            `),
            ...bottomCustomers.map(customer => `
                <tr class="table-danger">
                    <td>${customer.id}</td>
                    <td>${customer.totalOrders}</td>
                    <td>${formatter.format(customer.totalSpent)}</td>
                </tr>
            `)
        ].join('');
    }
}

// stock opname
async function loadLogInsights(startDate, endDate) {
    const logContent = document.getElementById('log-content');
    
    try {
        // Show loading state only if content is empty
        if (logContent.innerHTML.trim() === '') {
            logContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading stock opname insights...</p>
                </div>
            `;
        }

        // Fetch data
        const logData = await fetchLogData(startDate, endDate);
        
        // Update UI elements directly (like contact tab does)
        // Summary Cards
        document.getElementById('total-audits').textContent = logData.totalLogs;
        document.getElementById('final-audits').textContent = logData.finalLogs;
        document.getElementById('draft-audits').textContent = logData.draftLogs;
        document.getElementById('avg-items-audit').textContent = logData.avgItemsPerLog;
        document.getElementById('total-items-audited').textContent = logData.totalItems;
        
        // Mismatch Rate
        document.getElementById('mismatch-rate').textContent = logData.mismatchRate;
        document.getElementById('mismatched-items').textContent = logData.mismatchedItems;
        document.getElementById('total-checked-items').textContent = logData.totalItemsChecked;
        
        // Unadjusted Mismatches
        document.getElementById('unadjusted-badge').textContent = `${logData.unadjustedMismatches} items`;
        const unadjustedTable = document.getElementById('unadjusted-mismatches');
        unadjustedTable.innerHTML = logData.unadjustedItems.slice(0, 5).map(item => `
            <tr>
                <td>${item.product}</td>
                <td>${item.variant || ''}</td>
                <td><span class="badge bg-danger">tidak_sesuai</span></td>
            </tr>
        `).join('');
        
        // Unauthored Items
        document.getElementById('unaudited-badge').textContent = `${logData.itemsNotInLogs.length} items`;
        const unauditedTable = document.getElementById('unaudited-items');
        unauditedTable.innerHTML = logData.itemsNotInLogs.slice(0, 5).map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.variant}</td>
                <td>${item.lastAudit}</td>
            </tr>
        `).join('');
        
        // Recent Adjustments
        const recentAdjTable = document.getElementById('recent-adjustments');
        recentAdjTable.innerHTML = logData.recentAdjustments.map(item => `
            <tr>
                <td>${item.date}</td>
                <td>#${item.logId}</td>
                <td>${item.product}</td>
                <td>${item.qty}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading log insights:', error);
        showToast('Failed to load stock opname data', 'error');
        logContent.innerHTML = `
            <div class="alert alert-danger">
                Failed to load stock opname data: ${error.message}
            </div>
        `;
    }
}

// Data fetcher
async function fetchLogData(startDate, endDate) {
    // 1. Get all stock opname logs with their items
    const { data: logs, error: logsError } = await supabase
        .from('log_opname')
        .select(`
            id,
            status_log,
            waktu_dibuat,
            items:item_opname(
                id,
                stok,
                status_item_log,
                produk_varian: id_varian(varian, produk: id_produk(nama))
            )
        `)
        .gte('waktu_dibuat', startDate)
        .lte('waktu_dibuat', endDate);
    
    console.log(logs);    
    if (logsError) throw logsError;
    
    // 2. Get all products for comparison
    const { data: allProducts, error: productsError } = await supabase
        .from('produk_varian')
        .select('id, varian, produk: id_produk(nama)');
    
    if (productsError) throw productsError;
    
    // Calculate metrics
    const totalLogs = logs.length;
    console.log(totalLogs);
    const finalLogs = logs.filter(log => log.status_log === 'final').length;
    const draftLogs = logs.filter(log => log.status_log === 'draft').length;
    
    const totalItems = logs.reduce((sum, log) => sum + (log.items?.length || 0), 0);
    const avgItemsPerLog = totalLogs > 0 ? (totalItems / totalLogs).toFixed(1) : 0;
    
    let totalItemsChecked = 0;
    let mismatchedItems = 0;
    let unadjustedMismatches = 0;
    const adjustmentVolumes = [];
    const itemsInLogs = new Set();
    const unadjustedItems = [];
    const highestAdjustments = [];
    const recentAdjustments = [];
    
    logs.forEach(log => {
        log.items?.forEach(item => {
            totalItemsChecked++;
            itemsInLogs.add(item.produk_varian.id);
            
            if (item.status_item_log === 'disesuaikan' || item.status_item_log === 'tidak_sesuai') {
                mismatchedItems++;
                
                // For highest adjustments
                // highestAdjustments.push({
                //     product: `${item.produk_varian.produk.nama} (${item.produk_varian.varian})`,
                //     qty: item.stok,
                //     logId: log.id
                // });
                
                // For recent adjustments
                if (item.status_item_log === 'disesuaikan') {
                    recentAdjustments.push({
                        date: new Date(log.created_at).toLocaleDateString(),
                        logId: log.id,
                        product: `${item.produk_varian.produk.nama} (${item.produk_varian.varian})`,
                        qty: item.stok
                    });
                }
            }
            
            if (item.status_item_log === 'tidak_sesuai') {
                unadjustedMismatches++;
                unadjustedItems.push({
                    product: item.produk_varian.produk.nama,
                    variant: item.produk_varian.varian,
                    qty: item.stok
                });
            }
        });
    });
    
    const mismatchRate = totalItemsChecked > 0 
        ? ((mismatchedItems / totalItemsChecked) * 100).toFixed(1) + '%' 
        : '0%';
    
    const itemsNotInLogs = allProducts.filter(product => 
        !itemsInLogs.has(product.id))
        .map(product => ({
            name: product.produk.nama,
            variant: product.varian,
            lastAudit: 'Never'
        }));
    
    // const highestAdjustment = adjustmentVolumes.length > 0
    //     ? Math.max(...adjustmentVolumes)
    //     : 0;
    
    // Sort and limit highest adjustments
    // const topAdjustments = highestAdjustments
    //     .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    //     .slice(0, 5);
    
    return {
        totalLogs,
        finalLogs,
        draftLogs,
        totalItems,
        avgItemsPerLog,
        mismatchRate,
        mismatchedItems,
        totalItemsChecked,
        unadjustedMismatches,
        unadjustedItems,
        itemsNotInLogs,
        recentAdjustments: recentAdjustments.slice(0, 10)
    };
}

// PRRODUK/STOK
async function loadInventoryInsights(startDate, endDate) {
    const inventoryContent = document.getElementById('inventory-content');
    
    try {
        // Show loading state only if empty
        if (inventoryContent.innerHTML.trim() === '') {
            inventoryContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading inventory insights...</p>
                </div>
            `;
        }

        // Fetch data
        const {
            lowestStock,
            highestStock,
            belowMinimum,
            fastMoving,
            slowMoving,
            deadStockItems,
            deadStock30Percent,
            deadStock60Percent,
            deadStock90Percent
        } = await fetchInventoryData(startDate, endDate);

        // Update only data elements (no HTML structure changes)
        
        // 1. Update lowest stock items
        document.getElementById('lowest-stock-items').innerHTML = 
            lowestStock.map(item => `
                <div class="d-flex justify-content-between mb-2">
                    <span>${item.name} (${item.variant})</span>
                    <strong class="text-danger">${item.stock}</strong>
                </div>
            `).join('');

        // 2. Update highest stock items
        document.getElementById('highest-stock-items').innerHTML = 
            highestStock.map(item => `
                <div class="d-flex justify-content-between mb-2">
                    <span>${item.name} (${item.variant})</span>
                    <strong class="text-success">${item.stock}</strong>
                </div>
            `).join('');

        // 3. Update below minimum stock
        document.getElementById('below-minimum-badge').textContent = `${belowMinimum.length} items`;
        document.getElementById('below-minimum-items').innerHTML = 
            belowMinimum.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.variant}</td>
                    <td class="text-danger">${item.current}</td>
                    <td>${item.minimum}</td>
                    <td class="text-danger">${item.difference}</td>
                </tr>
            `).join('');

        // 4. Update product movement
        document.getElementById('product-movement').innerHTML = [
            ...fastMoving.map(item => `
                <tr class="table-success">
                    <td><span class="badge bg-success">Fast</span></td>
                    <td>${item.name}</td>
                    <td>${item.variant}</td>
                    <td>${item.qtySold}</td>
                </tr>
            `),
            ...slowMoving.map(item => `
                <tr class="table-danger">
                    <td><span class="badge bg-danger">Slow</span></td>
                    <td>${item.name}</td>
                    <td>${item.variant}</td>
                    <td>${item.qtySold}</td>
                </tr>
            `)
        ].join('');

        // 5. Update dead stock analysis
        document.getElementById('dead-stock-badge').textContent = `${deadStockItems.length} items`;
        document.getElementById('dead-stock-30').textContent = `${deadStock30Percent}%`;
        document.getElementById('dead-stock-60').textContent = `${deadStock60Percent}%`;
        document.getElementById('dead-stock-90').textContent = `${deadStock90Percent}%`;
        document.getElementById('dead-stock-items').innerHTML = 
            deadStockItems.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.variant}</td>
                    <td>${item.lastSale}</td>
                    <td>${item.daysSince}</td>
                </tr>
            `).join('');

        // progression chart
        const { stockProgression } = await fetchInventoryData(startDate, endDate);

        if (stockProgression && stockProgression.length > 0) {
            // Transform to match what your chart expects
            const chartData = stockProgression.map(item => ({
                date: item.date,
                value: item.totalStock, // or item.incoming/outgoing
                item: 'Stock Level' // or get specific product names if available
            }));
            initStockProgressionChart(chartData);
        } else {
            initStockProgressionChart(); // Fallback
        }

    } catch (error) {
        console.error('Error loading inventory insights:', error);
        showToast('Failed to load inventory data', 'error');
        inventoryContent.innerHTML = `
            <div class="alert alert-danger">
                Failed to load inventory data: ${error.message}
            </div>
        `;
    }
}

async function fetchInventoryData(startDate, endDate) {
    // 1. Fetch product variants with their stock information
    const { data: variants, error: variantsError } = await supabase
        .from('produk_varian')
        .select(`
            id,
            varian,
            jumlah_stok,
            stok_reservasi,
            produk: id_produk(
                id,
                nama,
                qty_minimum,
                supplier: id_supplier(perusahaan),
                subkategori: id_subkategori(
                    subkategori, 
                    kategori: id_kategori(kategori)
                )
            )
        `);
    
    if (variantsError) throw variantsError;

    // 2. Fetch stock history for progression analysis
    const { data: stockHistory, error: historyError } = await supabase
        .from('riwayat_stok')
        .select(`
            id_varian,
            tanggal,
            tipe_riwayat,
            qty,
            saldo
        `)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: true });
    
    if (historyError) throw historyError;

    // 3. Fetch sales data for movement analysis
    const { data: salesData, error: salesError } = await supabase
        .from('item_pesanan_penjualan')
        .select(`
            qty_dipesan,
            varian: id_varian(
                varian, 
                produk: id_produk(nama)
            ),
            penjualan: id_jual(tanggal_pesan)
        `)
        .gte('penjualan.tanggal_pesan', startDate)
        .lte('penjualan.tanggal_pesan', endDate);
    
    if (salesError) throw salesError;

    // 4. Fetch last sales for dead stock analysis
    const { data: lastSales, error: lastSalesError } = await supabase
        .from('produk_varian')
        .select(`
            id,
            varian,
            produk: id_produk(nama),
            penjualan: item_pesanan_penjualan(
                penjualan: id_jual(
                    tanggal_pesan
                )
            )
        `)
        .order('tanggal_pesan', { 
            foreignTable: 'penjualan.penjualan', 
            ascending: false 
        })
        .limit(1, { foreignTable: 'penjualan' });
    
    if (lastSalesError) throw lastSalesError;

    // Process the data
    const today = new Date();

    // Calculate product movement
    const movementMap = {};
    salesData.forEach(item => {
        const key = `${item.varian.produk.nama}-${item.varian.varian}`;
        if (!movementMap[key]) {
            movementMap[key] = {
                name: item.varian.produk.nama,    // Changed from nama_produk to nama
                variant: item.varian.varian,      // Changed from nama_varian to varian
                qtySold: 0
            };
        }
        movementMap[key].qtySold += item.qty_dipesan;
    });

    // Sort by movement speed
    const productMovement = Object.values(movementMap).sort((a, b) => b.qtySold - a.qtySold);
    const fastMoving = productMovement.slice(0, 5);
    const slowMoving = productMovement.slice(-5).reverse();

    // Calculate dead stock
    const deadStockItems = [];
    let deadStock30 = 0;
    let deadStock60 = 0;
    let deadStock90 = 0;

    lastSales.forEach(variant => {
        if (variant.penjualan && variant.penjualan.length > 0) {
            const lastSaleDate = new Date(variant.penjualan[0].penjualan.tanggal_pesan);
            const daysSince = Math.floor((today - lastSaleDate) / (1000 * 60 * 60 * 24));
            
            if (daysSince > 30) deadStock30++;
            if (daysSince > 60) deadStock60++;
            if (daysSince > 90) deadStock90++;
            
            if (daysSince > 60) {
                deadStockItems.push({
                    name: variant.produk.nama,       // Changed from nama_produk to nama
                    variant: variant.varian,         // Changed from nama_varian to varian
                    lastSale: variant.penjualan[0].penjualan.tanggal_pesan.split('T')[0],
                    daysSince: daysSince
                });
            }
        } else {
            // Variants with no sales at all
            deadStock30++;
            deadStock60++;
            deadStock90++;
            deadStockItems.push({
                name: variant.produk.nama,
                variant: variant.varian,
                lastSale: 'Never',
                daysSince: '∞'
            });
        }
    });

    // Calculate percentages
    const totalVariants = lastSales.length;
    const deadStock30Percent = totalVariants > 0 ? Math.round((deadStock30 / totalVariants) * 100) : 0;
    const deadStock60Percent = totalVariants > 0 ? Math.round((deadStock60 / totalVariants) * 100) : 0;
    const deadStock90Percent = totalVariants > 0 ? Math.round((deadStock90 / totalVariants) * 100) : 0;

    // Find below minimum stock
    const belowMinimum = variants
        .filter(variant => variant.jumlah_stok < variant.produk.qty_minimum)
        .sort((a, b) => (a.jumlah_stok - a.produk.qty_minimum) - (b.jumlah_stok - b.produk.qty_minimum))
        .map(variant => ({
            id_varian: variant.id,
            name: variant.produk.nama,    // Changed from nama_produk to nama
            variant: variant.varian,      // Changed from nama_varian to varian
            current: variant.jumlah_stok,
            minimum: variant.produk.qty_minimum,
            difference: variant.jumlah_stok - variant.produk.qty_minimum
        }));

    // Sort stock levels
    const sortedStock = [...variants].sort((a, b) => a.jumlah_stok - b.jumlah_stok);
    // For lowest/highest stock:
    const lowestStock = sortedStock.slice(0, 5).map(variant => ({
        name: variant.produk.nama,  // Changed from nama_produk to nama
        variant: variant.varian,    // Changed from nama_varian to varian
        stock: variant.jumlah_stok,
        supplier: variant.produk.supplier.perusahaan
    }));

    const highestStock = sortedStock.slice(-5).reverse().map(variant => ({
        name: variant.produk.nama,
        variant: variant.varian,
        stock: variant.jumlah_stok,
        supplier: variant.produk.supplier.perusahaan
    }));

    // Prepare stock progression data
    const progressionData = stockHistory.reduce((acc, record) => {
        const date = record.tanggal.split('T')[0];
        if (!acc[date]) {
            acc[date] = {
                date,
                totalStock: 0,
                incoming: 0,
                outgoing: 0
            };
        }
        
        if (record.tipe_riwayat === 'incoming') {
            acc[date].incoming += record.qty;
        } else {
            acc[date].outgoing += record.qty;
        }
        
        acc[date].totalStock = record.saldo;
        return acc;
    }, {});

    return {
        lowestStock,
        highestStock,
        belowMinimum,
        fastMoving,
        slowMoving,
        deadStockItems,
        deadStock30Percent,
        deadStock60Percent,
        deadStock90Percent,
        totalVariants,
        stockProgression: Object.values(progressionData)
    };
}

function initStockProgressionChart(progressionData = []) {
    const ctx = document.getElementById('stock-progression-chart');
    if (!ctx) {
        console.error('Chart canvas element not found');
        return;
    }

    // Default data if none provided
    const labels = progressionData.length > 0 
        ? progressionData.map(item => item.date) 
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const stockValues = progressionData.length > 0
        ? progressionData.map(item => item.totalStock)
        : [12000, 19000, 15000, 18000, 16000, 21000];

    // Destroy existing chart if it exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Stock',
                data: stockValues,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Stock: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Quantity'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

// <td class="${item.difference > 0 ? 'text-danger' : 'text-success'}">
            //     ${item.difference > 0 ? '+' : ''}${item.difference}
            // </td>
            //<td class="${item.difference > 0 ? 'text-danger' : 'text-success'}">
            //     ${item.difference > 0 ? '+' : ''}${item.difference}
            // </td>

async function initDashboard() {
    // Set default date range (last 90 days)
    setDateRange(90);
    
    // Initialize event listeners first
    setupEventListeners();
    
    // Then load the active tab content
    const activeTab = getActiveTab();
    if (activeTab) {
        await loadTabContent(activeTab);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the dashboard
    await initDashboard();
});