import supabase from './db_conn.js';
import Chart from 'chart.js/auto';
import { checkAuth } from './auth.js';
import { displayUnpaidNotice } from './import.js';

(async () => {
    // Auth check - will redirect if not logged in
    await checkAuth(); 
})();

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

function formatIndonesianDateTime(timestamptz) {
    if (!timestamptz) return '-'; // Handle null/undefined cases
    
    const date = new Date(timestamptz);
    
    // Return early if invalid date
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format options for Indonesian locale
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta' // Explicitly set to Indonesia's timezone
    };
    
    // Format the date
    return date.toLocaleString('id-ID', options)
        .replace(/\./g, ':')     // Replace periods with colons in time
        .replace(/,/g, ' ');     // Remove comma between date and time
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

// overview
async function loadOverviewInsights(startDate, endDate) {
    const overviewContent = document.getElementById('overview-content');
    
    try {
        // Load all metrics and charts
        await updateRevenueMetric(startDate, endDate);
        await updateSalesCount(startDate, endDate);
        await updatePurchaseCount(startDate, endDate);
        await loadCategoryDemandInsights(startDate, endDate);
        await loadSalesPurchasesTrends(startDate, endDate);
        
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
        const { data: revenueData, error } = await supabase
            .from('pesanan_penjualan')
            .select('total_dibayarkan, tanggal_pesan')
            .gte('tanggal_pesan', startDate)
            .lte('tanggal_pesan', endDate);
        
        if (error) throw error;
        
        const totalRevenue = revenueData.reduce((sum, order) => sum + (order.total_dibayarkan || 0), 0);
        document.getElementById('revenue-metric').textContent = formatCurrency(totalRevenue);
        
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        document.getElementById('revenue-metric').textContent = 'Error';
    }
}

async function updateSalesCount(startDate, endDate) {
    try {
        const { count, error } = await supabase
            .from('pesanan_penjualan')
            .select('id', { count: 'exact', head: true })
            .gte('tanggal_pesan', startDate)
            .lte('tanggal_pesan', endDate);
        
        if (error) throw error;
        document.getElementById('sales-count').textContent = count ?? '0';
    } catch (error) {
        console.error('Error fetching sales count:', error);
        document.getElementById('sales-count').textContent = 'Error';
    }
}

async function updatePurchaseCount(startDate, endDate) {
    try {
        const { count, error } = await supabase
            .from('pesanan_pembelian')
            .select('id', { count: 'exact', head: true })
            .gte('tanggal_pesan', startDate)
            .lte('tanggal_pesan', endDate);
        
        if (error) throw error;
        document.getElementById('purchase-count').textContent = count ?? '0';
    } catch (error) {
        console.error('Error fetching purchase count:', error);
        document.getElementById('purchase-count').textContent = 'Error';
    }
}

async function loadCategoryDemandInsights(startDate, endDate) {
    try {
        const { data, error } = await supabase
            .from('item_pesanan_penjualan')
            .select(`
                qty_dipesan,
                harga_jual,
                produk_varian:id_varian (
                    produk:id_produk (
                        nama,
                        subkategori:id_subkategori (
                            subkategori,
                            kategori:id_kategori (kategori)
                        )
                    )
                ),
                pesanan_penjualan:id_jual (
                    tanggal_pesan
                )
            `)
            .gte('pesanan_penjualan.tanggal_pesan', startDate)
            .lte('pesanan_penjualan.tanggal_pesan', endDate);
        
        if (error) throw error;

        const categoryData = {};
        
        data.forEach(item => {
            const category = item.produk_varian?.produk?.subkategori?.kategori?.kategori || 'Uncategorized';
            const subcategory = item.produk_varian?.produk?.subkategori?.subkategori || 'No Subcategory';
            const categoryLabel = `${category} - ${subcategory}`;
            const revenue = (item.qty_dipesan * item.harga_jual) || 0;
            const quantity = item.qty_dipesan || 0;
            
            if (!categoryData[categoryLabel]) {
                categoryData[categoryLabel] = {
                    category: category,
                    subcategory: subcategory,
                    revenue: 0,
                    quantity: 0
                };
            }
            
            categoryData[categoryLabel].revenue += revenue;
            categoryData[categoryLabel].quantity += quantity;
        });

        const totalRevenue = Object.values(categoryData).reduce((sum, cat) => sum + cat.revenue, 0);
        const sortedCategories = Object.keys(categoryData).sort((a, b) => {
            return categoryData[b].revenue - categoryData[a].revenue;
        });

        renderCategoryDemandChart(sortedCategories, sortedCategories.map(cat => categoryData[cat].revenue));
        renderCategoryDemandTable(sortedCategories, categoryData, totalRevenue);
        
    } catch (error) {
        console.error('Error loading category demand insights:', error);
        document.getElementById('category-chart-container').innerHTML = `
            <div class="alert alert-danger">
                Failed to load category demand data: ${error.message}
            </div>
        `;
    }
}

function renderCategoryDemandChart(categories, revenueData) {
    const ctx = document.getElementById('category-demand-chart').getContext('2d');
    
    if (window.categoryDemandChart) {
        window.categoryDemandChart.destroy();
    }
    
    window.categoryDemandChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: revenueData,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#8AC24A', '#607D8B',
                    '#E91E63', '#9C27B0'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderCategoryDemandTable(categories, categoryData, totalRevenue) {
    const tableBody = document.getElementById('category-demand-data');
    tableBody.innerHTML = '';
    
    categories.forEach((categoryLabel) => {
        const categoryInfo = categoryData[categoryLabel];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${categoryInfo.category}</strong><br>
                <small class="text-muted">${categoryInfo.subcategory}</small>
            </td>
            <td>${formatCurrency(categoryInfo.revenue)}</td>
            <td>${categoryInfo.quantity}</td>
            <td>${(categoryInfo.revenue / totalRevenue * 100).toFixed(1)}%</td>
        `;
        tableBody.appendChild(row);
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
}

async function loadSalesPurchasesTrends(startDate, endDate) {
    try {
        // Fetch both sales and purchases data in parallel
        const [salesData, purchasesData] = await Promise.all([
            fetchSalesData(startDate, endDate),
            fetchPurchasesData(startDate, endDate)
        ]);

        // Process data into daily trends
        const salesTrend = processDailyTrends(salesData, 'Sales');
        const purchasesTrend = processDailyTrends(purchasesData, 'Purchases');

        // Render the chart
        renderTrendChart(salesTrend, purchasesTrend, startDate, endDate);

    } catch (error) {
        console.error('Error loading trends data:', error);
        document.getElementById('sales-purchases-trend-chart').closest('.card-body').innerHTML = `
            <div class="alert alert-danger">
                Failed to load trends data: ${error.message}
            </div>
        `;
    }
}

async function fetchSalesData(startDate, endDate) {
    const { data, error } = await supabase
        .from('pesanan_penjualan')
        .select(`
            id, 
            tanggal_pesan, 
            items:item_pesanan_penjualan(qty_dipesan)
        `)
        .gte('tanggal_pesan', startDate)
        .lte('tanggal_pesan', endDate)
        .order('tanggal_pesan', { ascending: true });

    if (error) throw error;
    return data;
}

async function fetchPurchasesData(startDate, endDate) {
    const { data, error } = await supabase
        .from('pesanan_pembelian')
        .select(`
            id, 
            tanggal_pesan, 
            items:item_pesanan_pembelian(qty_dipesan)
        `)
        .gte('tanggal_pesan', startDate)
        .lte('tanggal_pesan', endDate)
        .order('tanggal_pesan', { ascending: true });

    if (error) throw error;
    return data;
}

function processDailyTrends(data, type) {
    const dailyData = {};
    
    data.forEach(transaction => {
        const date = transaction.tanggal_pesan;
        if (!dailyData[date]) {
            dailyData[date] = {
                date: date,
                count: 0,
                quantity: 0
            };
        }
        
        dailyData[date].count++;
        
        // Sum quantities if available
        if (transaction.items) {
            transaction.items.forEach(item => {
                dailyData[date].quantity += item.qty_dipesan || 0;
            });
        }
    });

    return {
        type: type,
        dates: Object.keys(dailyData),
        counts: Object.values(dailyData).map(d => d.count),
        quantities: Object.values(dailyData).map(d => d.quantity)
    };
}

function renderTrendChart(salesTrend, purchasesTrend, startDate, endDate) {
    const ctx = document.getElementById('sales-purchases-trend-chart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.trendChart) {
        window.trendChart.destroy();
    }
    
    // Generate all dates in range for complete x-axis
    const allDates = generateDateRange(startDate, endDate);
    
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: [
                {
                    label: 'Sales (Transactions)',
                    data: mapDataToAllDates(salesTrend.dates, salesTrend.counts, allDates),
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Purchases (Transactions)',
                    data: mapDataToAllDates(purchasesTrend.dates, purchasesTrend.counts, allDates),
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.05)',
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Sales (Quantity)',
                    data: mapDataToAllDates(salesTrend.dates, salesTrend.quantities, allDates),
                    borderColor: '#36b9cc',
                    backgroundColor: 'rgba(54, 185, 204, 0.05)',
                    tension: 0.3,
                    yAxisID: 'y1',
                    hidden: true // Hide by default
                },
                {
                    label: 'Purchases (Quantity)',
                    data: mapDataToAllDates(purchasesTrend.dates, purchasesTrend.quantities, allDates),
                    borderColor: '#f6c23e',
                    backgroundColor: 'rgba(246, 194, 62, 0.05)',
                    tension: 0.3,
                    yAxisID: 'y1',
                    hidden: true // Hide by default
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Transactions'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Quantity'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                },
                legend: {
                    onClick: function(e, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const chart = legend.chart;
                        const meta = chart.getDatasetMeta(index);

                        // Toggle visibility
                        meta.hidden = !meta.hidden;

                        // Update chart
                        chart.update();
                    }
                }
            }
        }
    });
}

function generateDateRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

function mapDataToAllDates(sourceDates, sourceValues, allDates) {
    const dateMap = {};
    sourceDates.forEach((date, index) => {
        dateMap[date] = sourceValues[index];
    });
    
    return allDates.map(date => dateMap[date] || 0);
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
    // 1. Average number of product variants per supplier (DIRECT QUERY)
    const { data: supplierVariantsData, error: supplierVariantsError } = await supabase
        .from('produk_varian')
        .select(`
            id,
            varian,
            produk: id_produk(
                id_supplier
            )
        `);

    if (!supplierVariantsError) {
        const variantsPerSupplier = {};

        supplierVariantsData.forEach(variant => {
            const supplierId = variant.produk.id_supplier;
            
            if (!variantsPerSupplier[supplierId]) {
                variantsPerSupplier[supplierId] = new Set(); // Track unique variant IDs per supplier
            }
            variantsPerSupplier[supplierId].add(variant.id); // Add variant ID to the supplier's Set
        });

        // Calculate average variants per supplier
        const counts = Object.values(variantsPerSupplier).map(set => set.size);
        const avgVariantsPerSupplier = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);

        document.getElementById('avg-items-supplier').textContent = avgVariantsPerSupplier;
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
                    <p>Memuat insights untuk stock opname...</p>
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
        document.getElementById('avg-items-audit').textContent = Math.round(logData.avgItemsPerLog);
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
        console.log("logdata", logData);
        
    } catch (error) {
        console.error('Error loading log insights:', error);
        showToast('Gagal memuat data stock opname', 'error');
        logContent.innerHTML = `
            <div class="alert alert-danger">
                Gagal memuat data stock opname: ${error.message}
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
            tanggal,
            items:item_opname(
                id,
                stok,
                status_item_log,
                produk_varian: id_varian(id, varian, produk: id_produk(nama, id))
            )
        `)
        .gte('waktu_dibuat', startDate)
        .lte('waktu_dibuat', endDate)
        .order('tanggal', { ascending: false });

    if (logsError) throw logsError;

    // 2. Get all products for comparison
    const { data: allProducts, error: productsError } = await supabase
        .from('produk_varian')
        .select('id, varian, produk: id_produk(nama, id)');

    if (productsError) throw productsError;

    const totalLogs = logs.length;
    const finalLogs = logs.filter(log => log.status_log === 'final').length;
    const draftLogs = logs.filter(log => log.status_log === 'draft').length;

    const totalItems = logs.reduce((sum, log) => sum + (log.items?.length || 0), 0);
    const avgItemsPerLog = totalLogs > 0 ? (totalItems / totalLogs).toFixed(1) : 0;

    let totalItemsChecked = 0;
    let mismatchedItems = 0;
    let unadjustedMismatches = 0;
    const itemsInLogs = new Set();
    const unadjustedItems = [];
    const recentAdjustments = [];

    logs.forEach(log => {
        log.items?.forEach(item => {
            totalItemsChecked++;

            if (item.produk_varian?.produk?.id && item.produk_varian?.id) {
                itemsInLogs.add(`${item.produk_varian.produk.id}_${item.produk_varian.id}`);
            }

            if (item.status_item_log === 'disesuaikan' || item.status_item_log === 'tidak_sesuai') {
                mismatchedItems++;

                if (item.status_item_log === 'disesuaikan') {
                    recentAdjustments.push({
                        date: formatIndonesianDateTime(log.tanggal),
                        logId: log.id,
                        product: `${item.produk_varian.produk.nama} (${item.produk_varian.varian})`,
                        qty: item.stok
                    });
                }

                if (item.status_item_log === 'tidak_sesuai') {
                    unadjustedMismatches++;
                    unadjustedItems.push({
                        product: item.produk_varian.produk.nama,
                        variant: item.produk_varian.varian,
                        qty: item.stok
                    });
                }
            }
        });
    });

    // 3. Handle unaudited products and fetch their latest audit date (outside range)
    const itemsNotInLogs = [];

    for (const product of allProducts) {
        const produkId = product.produk?.id;
        const variantId = product.id;

        if (!produkId || !variantId) continue;

        const key = `${produkId}_${variantId}`;
        if (itemsInLogs.has(key)) continue;

        // Query the most recent log item regardless of date range
        const { data: lastLog, error: lastLogError } = await supabase
            .from('item_opname')
            .select('id_log, id_varian, log_opname!inner(tanggal)')
            .eq('id_varian', variantId)
            .order('tanggal', { 
                foreignTable: 'log_opname', 
                ascending: false 
            })
            .limit(1);

        if (lastLogError) throw lastLogError;

        const lastAuditDate = lastLog && lastLog.length > 0 ? lastLog[0].tanggal : null;

        itemsNotInLogs.push({
            name: product.produk.nama,
            variant: product.varian,
            lastAudit: lastAuditDate ? formatIndonesianDateTime(lastAuditDate) : 'Tidak pernah diperiksa'
        });
    }

    const mismatchRate = totalItemsChecked > 0
        ? ((mismatchedItems / totalItemsChecked) * 100).toFixed(1) + '%'
        : '0%';

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
    await displayUnpaidNotice();
});