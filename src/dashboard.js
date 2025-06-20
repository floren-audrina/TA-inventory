import supabase from './db_conn.js';
import { checkAuth, initAuthStateListener } from './auth.js';
import Chart from 'chart.js/auto';
import { displayUnpaidNotice } from './import.js';

initAuthStateListener();

(async () => {
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
        timeZone: 'Asia/Jakarta'
    };
    
    // Format the date
    return date.toLocaleString('id-ID', options)
        .replace(/\./g, ':')   
        .replace(/,/g, ' ');   
}

function setupEventListeners() {
    // quick date click
    const quickRangeBtns = document.querySelectorAll('.quick-range');
    quickRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            quickRangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const days = parseInt(btn.getAttribute('data-range'));
            setDateRange(days);
            
            // reload dashboard
            const activeTab = getActiveTab();
            if (activeTab) {
                loadTabContent(activeTab);
            }
        });
    });
    
    // apply date range click
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
    
    // tab switch
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
    
    // YYYY-MM-DD for input fields
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
        await loadPeakSalesTimes(startDate, endDate);
        
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    try {
        const { data: revenueData, error } = await supabase
            .from('pesanan_penjualan')
            .select('total_dibayarkan, tanggal_pesan')
            .gte('tanggal_pesan', start.toISOString())
            .lte('tanggal_pesan', end.toISOString());
        
        if (error) throw error;
        
        const totalRevenue = revenueData.reduce((sum, order) => sum + (order.total_dibayarkan || 0), 0);
        document.getElementById('revenue-metric').textContent = formatCurrency(totalRevenue);
        
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        document.getElementById('revenue-metric').textContent = 'Error';
    }
}

async function updateSalesCount(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    try {
        const { count, error } = await supabase
            .from('pesanan_penjualan')
            .select('id', { count: 'exact', head: true })
            .gte('tanggal_pesan', start.toISOString())
            .lte('tanggal_pesan', end.toISOString());
        
        if (error) throw error;
        document.getElementById('sales-count').textContent = count ?? '0';
    } catch (error) {
        console.error('Error fetching sales count:', error);
        document.getElementById('sales-count').textContent = 'Error';
    }
}

async function updatePurchaseCount(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    try {
        const { count, error } = await supabase
            .from('pesanan_pembelian')
            .select('id', { count: 'exact', head: true })
            .gte('tanggal_pesan', start.toISOString())
            .lte('tanggal_pesan', end.toISOString());
        
        if (error) throw error;
        document.getElementById('purchase-count').textContent = count ?? '0';
    } catch (error) {
        console.error('Error fetching purchase count:', error);
        document.getElementById('purchase-count').textContent = 'Error';
    }
}

async function loadCategoryDemandInsights(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // debug 
    console.log("start: ", startDate);
    console.log("end: ", endDate);

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
                pesanan_penjualan!inner(tanggal_pesan)
            `)
            .gte('pesanan_penjualan.tanggal_pesan', start.toISOString())
            .lte('pesanan_penjualan.tanggal_pesan', end.toISOString());

        console.log("data: ", data);
        
        if (error) throw error;

        // Get DOM elements
        const chartCanvas = document.getElementById('category-demand-chart');
        const chartContainer = chartCanvas.closest('.chart-container');
        const tableBody = document.getElementById('category-demand-data');
        const tableContainer = document.getElementById('category-demand-table');

        // Handle empty data case
        if (!data || data.length === 0) {
            // Clear and show empty state for chart
            if (window.categoryDemandChart) {
                window.categoryDemandChart.destroy();
                window.categoryDemandChart = null;
            }
            chartContainer.innerHTML = `
                <div class="empty-state text-center py-4">
                    <i class="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                    <p class="text-muted">Tidak ada data penjualan untuk periode ini</p>
                </div>
            `;
            
            // Clear and show empty state for table
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <i class="fas fa-table me-2"></i>
                        Tidak ada data kategori yang tersedia
                    </td>
                </tr>
            `;
            return;
        }

        // Process data
        const categoryData = {};
        
        data.forEach(item => {
            const category = item.produk_varian?.produk?.subkategori?.kategori?.kategori || 'Tidak Dikategorikan';
            const subcategory = item.produk_varian?.produk?.subkategori?.subkategori || 'Tanpa Subkategori';
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

        // Render chart
        if (window.categoryDemandChart) {
            window.categoryDemandChart.destroy();
        }
        
        // Ensure canvas exists
        if (!chartCanvas) {
            chartContainer.innerHTML = '<canvas id="category-demand-chart"></canvas>';
        }
        
        window.categoryDemandChart = new Chart(chartCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: sortedCategories,
                datasets: [{
                    data: sortedCategories.map(cat => categoryData[cat].revenue),
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

        // Render table
        tableBody.innerHTML = '';
        
        sortedCategories.forEach((categoryLabel) => {
            const categoryInfo = categoryData[categoryLabel];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${categoryInfo.category}</strong><br>
                    <small class="text-muted">${categoryInfo.subcategory}</small>
                </td>
                <td>${formatCurrency(categoryInfo.revenue)}</td>
                <td>${categoryInfo.quantity}</td>
                <td>${totalRevenue > 0 ? (categoryInfo.revenue / totalRevenue * 100).toFixed(1) : 0}%</td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading category demand insights:', error);
        
        // Show error message in chart area
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="alert alert-danger">
                    Gagal memuat data grafik: ${error.message}
                </div>
            `;
        }
        
        // Show error message in table area
        const tableBody = document.getElementById('category-demand-data');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4 text-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Gagal memuat data tabel
                    </td>
                </tr>
            `;
        }
    }
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('pesanan_penjualan')
        .select(`
            id, 
            tanggal_pesan, 
            items:item_pesanan_penjualan(qty_dipesan)
        `)
        .gte('tanggal_pesan', start.toISOString())
        .lte('tanggal_pesan', end.toISOString())
        .order('tanggal_pesan', { ascending: true });

    console.log("Sales data:", data);

    if (error) throw error;
    return data;
}

async function fetchPurchasesData(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('pesanan_pembelian')
        .select(`
            id, 
            tanggal_pesan, 
            items:item_pesanan_pembelian(qty_dipesan)
        `)
        .gte('tanggal_pesan', start.toISOString())
        .lte('tanggal_pesan', end.toISOString())
        .order('tanggal_pesan', { ascending: true });

    console.log("Purchases data:", data);

    if (error) throw error;
    return data;
}

function processDailyTrends(data, type) {
    const dailyData = {};

    data.forEach(transaction => {
        const rawDate = transaction.tanggal_pesan;
        const date = rawDate?.slice(0, 10); // Extract only 'YYYY-MM-DD'

        if (!date) {
            console.warn("Missing or invalid date:", transaction);
            return;
        }

        if (!dailyData[date]) {
            dailyData[date] = {
                date: date,
                count: 0,
                quantity: 0
            };
        }

        dailyData[date].count++;

        if (Array.isArray(transaction.items)) {
            transaction.items.forEach(item => {
                const qty = Number(item.qty_dipesan) || 0;
                dailyData[date].quantity += qty;
            });
        } else {
            console.warn(`Invalid items for date ${date}`, transaction.items);
        }
    });

    console.log(`Processed ${type}:`, {
        dates: Object.keys(dailyData),
        counts: Object.values(dailyData).map(d => d.count),
        quantities: Object.values(dailyData).map(d => d.quantity)
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
                    label: 'Transaksi Penjualan',
                    data: mapDataToAllDates(salesTrend.dates, salesTrend.counts, allDates),
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Transaksi Pembelian',
                    data: mapDataToAllDates(purchasesTrend.dates, purchasesTrend.counts, allDates),
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.05)',
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Kuantitas Penjualan',
                    data: mapDataToAllDates(salesTrend.dates, salesTrend.quantities, allDates),
                    borderColor: '#36b9cc',
                    backgroundColor: 'rgba(54, 185, 204, 0.05)',
                    tension: 0.3,
                    yAxisID: 'y1',
                    hidden: true // Hide by default
                },
                {
                    label: 'Kuantitas Pembelian',
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
                        text: 'Jumlah Transaksi'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Kuantitas'
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

async function loadPeakSalesTimes(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    try {
        // Fetch sales data with timestamps
        const { data: salesData, error } = await supabase
            .from('pesanan_penjualan')
            .select('id, tanggal_pesan')
            .gte('tanggal_pesan', start.toISOString())
            .lte('tanggal_pesan', end.toISOString());

        if (error) throw error;

        // Process the data to find peak times
        const { hourlyData, dailyData, peakTimes } = processPeakSalesData(salesData);

        // Render the charts and table
        renderPeakHoursChart(hourlyData);
        renderPeakDaysChart(dailyData);
        renderPeakTimesTable(peakTimes, salesData.length);

    } catch (error) {
        console.error('Error loading peak sales times:', error);
        showToast('Gagal memuat insight waktu penjualan tertinggi', 'error');
    }
}

function processPeakSalesData(salesData) {
    const hourlyData = Array(24).fill(0); // For hours 0-23
    const dailyData = Array(6).fill(0);   // For Monday (0) to Saturday (5)
    const dayHourData = {};               // For day-hour combinations

    // Monday=1 → index 0, ..., Saturday=6 → index 5
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    salesData.forEach(sale => {
        const date = new Date(sale.tanggal_pesan);
        const hour = date.getHours();
        const day = date.getDay(); // 0 = Sunday, ..., 6 = Saturday

        if (day === 0) return; // Skip Sundays

        // Adjust index
        const adjustedDay = day - 1;

        // Count sales by hour
        hourlyData[hour]++;

        // Count sales by day (excluding Sunday)
        dailyData[adjustedDay]++;

        // Track day-hour combinations (excluding Sunday)
        const dayHourKey = `${adjustedDay}-${hour}`;
        dayHourData[dayHourKey] = (dayHourData[dayHourKey] || 0) + 1;
    });

    // Find peak times for each day (Mon–Sat only)
    const peakTimes = [];

    for (let adjustedDay = 0; adjustedDay < 6; adjustedDay++) {
        let maxHour = 0;
        let maxCount = 0;

        for (let hour = 0; hour < 24; hour++) {
            const count = dayHourData[`${adjustedDay}-${hour}`] || 0;
            if (count > maxCount) {
                maxCount = count;
                maxHour = hour;
            }
        }

        peakTimes.push({
            dayName: dayNames[adjustedDay],
            dayNumber: adjustedDay,
            peakHour: maxHour,
            peakCount: maxCount,
            formattedHour: `${maxHour}:00 - ${maxHour + 1}:00`
        });
    }

    return {
        hourlyData,
        dailyData,
        peakTimes: peakTimes.sort((a, b) => b.peakCount - a.peakCount)
    };
}


function renderPeakHoursChart(hourlyData) {
    const ctx = document.getElementById('peak-hours-chart').getContext('2d');

    // Destroy previous chart if exists
    if (window.peakHoursChart) {
        window.peakHoursChart.destroy();
    }

    // Operational hours: 11:00 to 17:00 (indexes 11–17)
    const operationalStart = 11;
    const operationalEnd = 17;

    const labels = Array.from({ length: operationalEnd - operationalStart + 1 }, (_, i) => {
        const hour = i + operationalStart;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    const filteredData = hourlyData.slice(operationalStart, operationalEnd + 1);

    window.peakHoursChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Transaksi per Jam',
                data: filteredData,
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} transaksi`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Transaksi'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Jam Operasional'
                    }
                }
            }
        }
    });
}

function renderPeakDaysChart(dailyData) {
    const ctx = document.getElementById('peak-days-chart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.peakDaysChart) {
        window.peakDaysChart.destroy();
    }
    
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    window.peakDaysChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dayNames,
            datasets: [{
                label: 'Jumlah Transaksi per Hari',
                data: dailyData,
                backgroundColor: 'rgba(28, 200, 138, 0.7)',
                borderColor: 'rgba(28, 200, 138, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} transaksi`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Transaksi'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hari dalam Minggu'
                    }
                }
            }
        }
    });
}

function renderPeakTimesTable(peakTimes, totalTransactions) {
    const tableBody = document.getElementById('peak-times-data');
    tableBody.innerHTML = '';
    
    peakTimes.forEach(day => {
        const percentage = ((day.peakCount / totalTransactions) * 100).toFixed(1);
        const row = document.createElement('tr');
        
        // Highlight the busiest day
        const isBusiest = day.peakCount === Math.max(...peakTimes.map(d => d.peakCount));
        
        row.innerHTML = `
            <td class="${isBusiest ? 'fw-bold text-primary' : ''}">${day.dayName}</td>
            <td>${day.formattedHour}</td>
            <td>${day.peakCount}</td>
            <td>${percentage}%</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// CONTACT TAB INSIGHTS
async function loadContactTabInsights(startDate, endDate) {
    try {
        // Reset UI before loading
        resetContactTabUI();
        
        // Load supplier insights
        await loadSupplierInsights(startDate, endDate);
        
        // Load customer insights
        await loadCustomerInsights(startDate, endDate);
        
        // showToast('Contact insights loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading contact tab insights:', error);
        showToast('Gagal memuat insights untuk tab kontak', 'error');
    }
}

// Reset all UI elements
function resetContactTabUI() {
    // Supplier insights
    document.getElementById('avg-items-supplier').textContent = '0';
    document.getElementById('avg-lead-time').textContent = '0';
    document.getElementById('most-purchased-items').innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada data yang tersedia</td></tr>';
    document.getElementById('supplier-performance').innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada data yang tersedia</td></tr>';
    
    // Customer insights
    document.getElementById('total-new-customers').textContent = '0';
    document.getElementById('avg-purchase-rate').textContent = '0';
    document.getElementById('inactive-customers').innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada data yang tersedia</td></tr>';
    document.getElementById('customer-ranking').innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada data yang tersedia</td></tr>';
}

// SUPPLIER INSIGHTS
async function loadSupplierInsights(startDate, endDate) {
    try {
        // 1. Average number of product variants per supplier
        await loadAvgItemsPerSupplier(startDate, endDate);
        
        // 2. Lead time (from ordered to received)
        await loadAvgLeadTime(startDate, endDate);
        
        // 3. Most purchased items by supplier
        await loadMostPurchasedItems(startDate, endDate);
        
        // 4. Supplier Performance
        await loadSupplierPerformance(startDate, endDate);
    } catch (error) {
        console.error('Error loading supplier insights:', error);
        showToast('Gagal memuat insights untuk supplier', 'error');
        throw error;
    }
}

async function loadAvgItemsPerSupplier(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('item_pesanan_pembelian')
        .select(`
            produk_varian: id_varian(
                id,
                produk: id_produk(
                    id_supplier
                )
            ),
            pesanan_pembelian!inner(
                tanggal_pesan
            )
        `)
        .gte('pesanan_pembelian.tanggal_pesan', start.toISOString())
        .lte('pesanan_pembelian.tanggal_pesan', end.toISOString());

    if (error) throw error;

    const variantsPerSupplier = {};
    const validData = data?.filter(item => item?.produk_varian?.produk?.id_supplier);

    if (!validData || validData.length === 0) {
        document.getElementById('avg-items-supplier').textContent = '0';
        return;
    }

    validData.forEach(item => {
        const supplierId = item.produk_varian.produk.id_supplier;
        if (!variantsPerSupplier[supplierId]) {
            variantsPerSupplier[supplierId] = new Set();
        }
        variantsPerSupplier[supplierId].add(item.produk_varian.id);
    });

    const counts = Object.values(variantsPerSupplier).map(set => set.size);
    const avg = counts.length > 0 
        ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length )
        : 0;
    
    document.getElementById('avg-items-supplier').textContent = avg;
}

async function loadAvgLeadTime(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('pesanan_pembelian')
        .select('tanggal_pesan, tanggal_diterima')
        .not('tanggal_diterima', 'is', null)
        .gte('tanggal_pesan', start.toISOString())
        .lte('tanggal_pesan', end.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
        document.getElementById('avg-lead-time').textContent = '0';
        return;
    }

    const totalDays = data.reduce((sum, order) => {
        const orderedDate = new Date(order.tanggal_pesan);
        const receivedDate = new Date(order.tanggal_diterima);
        return sum + (receivedDate - orderedDate) / (1000 * 60 * 60 * 24);
    }, 0);
    
    document.getElementById('avg-lead-time').textContent = (totalDays / data.length).toFixed(1);
}

async function loadMostPurchasedItems(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('item_pesanan_pembelian')
        .select(`
            qty_dipesan,
            produk_varian: id_varian(varian, produk: id_produk(nama)),
            pesanan_pembelian!inner(
                tanggal_pesan,
                supplier:id_supplier(id, perusahaan, cp)
            )
        `)
        .gte('pesanan_pembelian.tanggal_pesan', start.toISOString())
        .lte('pesanan_pembelian.tanggal_pesan', end.toISOString());

    if (error) throw error;

    const tableBody = document.getElementById('most-purchased-items');
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada data yang tersedia</td></tr>';
        return;
    }

    const supplierMap = {};
    const validData = data.filter(item => item.pesanan_pembelian?.supplier);

    validData.forEach(item => {
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
        
        const itemName = item.produk_varian?.produk?.nama 
            ? `${item.produk_varian.produk.nama}-${item.produk_varian.varian || 'N/A'}` 
            : 'Unknown Product';
            
        supplierMap[supplierKey].items[itemName] = 
            (supplierMap[supplierKey].items[itemName] || 0) + item.qty_dipesan;
    });

    const allItems = [];
    Object.values(supplierMap).forEach(supplier => {
        Object.entries(supplier.items).forEach(([itemName, qty]) => {
            allItems.push({ supplierId: supplier.id, supplierName: supplier.name, itemName, qty });
        });
    });

    const sortedItems = allItems.sort((a, b) => b.qty - a.qty).slice(0, 10);
    
    tableBody.innerHTML = sortedItems.length > 0
        ? sortedItems.map(item => `
            <tr>
                <td>
                    <div class="fw-bold">${item.supplierName}</div>
                    <small class="text-muted">ID: ${item.supplierId}</small>
                </td>
                <td>${item.itemName}</td>
                <td class="text-end">${item.qty}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="3" class="text-center">Tidak ada data yang tersedia</td></tr>';
}

async function loadSupplierPerformance(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('item_pesanan_pembelian')
        .select(`
            qty_dipesan,
            qty_rusak,
            pesanan_pembelian!inner(
                tanggal_pesan,
                supplier:id_supplier(id, perusahaan, cp)
            )
        `)
        .gte('pesanan_pembelian.tanggal_pesan', start.toISOString())
        .lte('pesanan_pembelian.tanggal_pesan', end.toISOString());

    if (error) throw error;

    const tableBody = document.getElementById('supplier-performance');
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada data yang tersedia</td></tr>';
        return;
    }

    const supplierMap = {};
    const validData = data.filter(item => item.pesanan_pembelian?.supplier);

    validData.forEach(item => {
        const supplier = item.pesanan_pembelian.supplier;
        const displayName = getSupplierDisplayName(supplier);
        const supplierKey = `${supplier.id}-${displayName}`;

        if (!supplierMap[supplierKey]) {
            supplierMap[supplierKey] = {
                id: supplier.id,
                name: displayName,
                totalQty: 0,
                damagedQty: 0
            };
        }

        supplierMap[supplierKey].totalQty += item.qty_dipesan || 0;
        supplierMap[supplierKey].damagedQty += item.qty_rusak || 0;
    });

    const supplierList = Object.values(supplierMap)
        .map(supplier => {
            const rate = supplier.totalQty > 0
                ? (supplier.damagedQty / supplier.totalQty) * 100
                : 0;

            return {
                ...supplier,
                damageRate: rate
            };
        })
        .filter(supplier => supplier.damagedQty > 0)
        .sort((a, b) => b.damageRate - a.damageRate);

    tableBody.innerHTML = supplierList.length > 0
        ? supplierList.map(supplier => {
            const badgeClass = supplier.damageRate > 10 ? 'bg-danger' : 'bg-warning';
            const badgeLabel = supplier.damageRate > 5 ? 'Poor' : 'Fair';

            return `
                <tr>
                    <td>
                        <div class="fw-bold">${supplier.name}</div>
                        <small class="text-muted">ID: ${supplier.id}</small>
                    </td>
                    <td class="text">${supplier.totalQty}</td>
                    <td class="text">${supplier.damagedQty}</td>
                    <td class="text">${supplier.damageRate.toFixed(2)}%</td>
                    <td>
                        <span class="badge ${badgeClass}">
                            ${badgeLabel}
                        </span>
                    </td>
                </tr>
            `;
        }).join('')
        : '<tr><td colspan="5" class="text-center">Tidak ada data yang tersedia</td></tr>';
}


// CUSTOMER INSIGHTS
async function loadCustomerInsights(startDate, endDate) {
    try {
        // 1. Total new customers
        await loadNewCustomers(startDate, endDate);
        
        // 2. Average purchase rate
        await loadAvgPurchaseRate(startDate, endDate);
        
        // 3. Inactive customers
        await loadInactiveCustomers();
        
        // 4. Customer rankings
        await loadCustomerRankings(startDate, endDate);
    } catch (error) {
        console.error('Error loading customer insights:', error);
        showToast('Gagal memuat insights untuk pelanggan', 'error');
        throw error;
    }
}

async function loadNewCustomers(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('pesanan_penjualan')
        .select('id', { count: 'exact' })
        .eq('id_bakul', 0) 
        .gte('tanggal_pesan', start.toISOString())
        .lte('tanggal_pesan', end.toISOString());

    if (error) {
        console.error('Error loading new customers:', error);
        showToast('Gagal memuat insight pelanggan baru', 'error');
        throw error;
    }

    document.getElementById('total-new-customers').textContent = data?.length || '0';
}

async function loadAvgPurchaseRate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('pesanan_penjualan')
        .select('id_bakul, tanggal_pesan')
        .gte('tanggal_pesan', start.toISOString())
        .lte('tanggal_pesan', end.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
        document.getElementById('avg-purchase-rate').textContent = '0';
        return;
    }

    const customerOrders = {};
    data.forEach(order => {
        if (order.id_bakul) {
            customerOrders[order.id_bakul] = (customerOrders[order.id_bakul] || 0) + 1;
        }
    });

    const avg = Object.keys(customerOrders).length > 0
        ? Object.values(customerOrders).reduce((a, b) => a + b, 0) / Object.keys(customerOrders).length
        : 0;
    
    document.getElementById('avg-purchase-rate').textContent = avg.toFixed(1);
}

async function loadInactiveCustomers() {
    try {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Step 1: Get all customers who ordered in the selected date range
        const { data: activeCustomers, error: activeError } = await supabase
            .from('pesanan_penjualan')
            .select('id_bakul')
            .gte('tanggal_pesan', start.toISOString())
            .lte('tanggal_pesan', end.toISOString())
            .not('id_bakul', 'is', null);

        if (activeError) throw activeError;

        // Step 2: Get all customers and their last order date (regardless of date range)
        const { data: allCustomers, error: allError } = await supabase
            .from('pesanan_penjualan')
            .select('id_bakul, tanggal_pesan')
            .order('tanggal_pesan', { ascending: false })
            .not('id_bakul', 'is', null);

        if (allError) throw allError;

        // Process the data
        const activeCustomerIds = new Set(activeCustomers.map(c => c.id_bakul));
        const customerLastPurchase = {};

        allCustomers.forEach(order => {
            if (!customerLastPurchase[order.id_bakul]) {
                customerLastPurchase[order.id_bakul] = order.tanggal_pesan;
            }
        });

        // Filter inactive customers (those not in activeCustomers and with last purchase before startDate)
        const inactiveCustomers = Object.entries(customerLastPurchase)
            .filter(([id, lastDate]) => {
                return !activeCustomerIds.has(id) && new Date(lastDate) < new Date(startDate);
            })
            .map(([id, lastDate]) => {
                const daysInactive = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
                return {
                    id,
                    lastPurchase: lastDate.split('T')[0],
                    daysInactive: Math.floor(daysInactive)
                };
            })
            .sort((a, b) => b.daysInactive - a.daysInactive)
            .slice(0, 5);

        // Render results
        const tableBody = document.getElementById('inactive-customers');
        tableBody.innerHTML = inactiveCustomers.length > 0
            ? inactiveCustomers.map(customer => `
                <tr>
                    <td>${customer.id}</td>
                    <td>${customer.lastPurchase}</td>
                    <td>${customer.daysInactive}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="3" class="text-center">Tidak ada bakul yang tidak aktif</td></tr>';

    } catch (error) {
        console.error('Error loading inactive customers:', error);
        document.getElementById('inactive-customers').innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Gagal memuat data bakul tidak aktif
                </td>
            </tr>`;
    }
}

async function loadCustomerRankings(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('pesanan_penjualan')
        .select('id_bakul, total_dibayarkan')
        .gte('tanggal_pesan', start.toISOString())
        .lte('tanggal_pesan', end.toISOString());

    if (error) throw error;

    const tableBody = document.getElementById('customer-ranking');
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada data yang tersedia</td></tr>';
        return;
    }

    const customerStats = {};
    data.forEach(order => {
        if (order.id_bakul) {
            if (!customerStats[order.id_bakul]) {
                customerStats[order.id_bakul] = { totalOrders: 0, totalSpent: 0 };
            }
            customerStats[order.id_bakul].totalOrders++;
            customerStats[order.id_bakul].totalSpent += order.total_dibayarkan || 0;
        }
    });

    const sortedCustomers = Object.entries(customerStats)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.totalSpent - a.totalSpent);

    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });

    const topCustomers = sortedCustomers.slice(0, 3);
    const bottomCustomers = sortedCustomers.slice(-3).reverse();

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

// HELPER FUNCTIONS
function getSupplierDisplayName(supplier) {
    if (!supplier) return 'Unknown Supplier';
    return supplier.cp 
        ? `${supplier.perusahaan || '(No Company)'} (${supplier.cp})` 
        : supplier.perusahaan || 'Unknown Supplier';
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
        
        // Update UI elements
        // Summary Cards
        document.getElementById('total-audits').textContent = logData.totalLogs || '0';
        document.getElementById('final-audits').textContent = logData.finalLogs || '0';
        document.getElementById('draft-audits').textContent = logData.draftLogs || '0';
        document.getElementById('avg-items-audit').textContent = Math.round(logData.avgItemsPerLog) || '0';
        document.getElementById('total-items-audited').textContent = logData.totalItems || '0';
        
        // Mismatch Rate
        document.getElementById('mismatch-rate').textContent = logData.mismatchRate || '0%';
        document.getElementById('mismatched-items').textContent = logData.mismatchedItems || '0';
        document.getElementById('total-checked-items').textContent = logData.totalItemsChecked || '0';
        
        // Unadjusted Mismatches
        const unadjustedBadge = document.getElementById('unadjusted-badge');
        const unadjustedTable = document.getElementById('unadjusted-mismatches');
        
        if (!logData.unadjustedItems || logData.unadjustedItems.length === 0) {
            unadjustedBadge.textContent = '0 items';
            unadjustedTable.innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada yang belum disesuaikan</td></tr>';
        } else {
            unadjustedBadge.textContent = `${logData.unadjustedItems.length} items`;
            unadjustedTable.innerHTML = logData.unadjustedItems.slice(0, 5).map(item => `
                <tr>
                    <td>${item.product}</td>
                    <td>${item.variant || ''}</td>
                    <td><span class="badge bg-danger">tidak_sesuai</span></td>
                </tr>
            `).join('');
        }
        
        // Unauthored Items
        const unauditedBadge = document.getElementById('unaudited-badge');
        const unauditedTable = document.getElementById('unaudited-items');
        
        if (!logData.itemsNotInLogs || logData.itemsNotInLogs.length === 0) {
            unauditedBadge.textContent = '0 items';
            unauditedTable.innerHTML = '<tr><td colspan="3" class="text-center">Semua item telah diperiksa</td></tr>';
        } else {
            unauditedBadge.textContent = `${logData.itemsNotInLogs.length} items`;
            unauditedTable.innerHTML = logData.itemsNotInLogs.slice(0, 5).map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.variant}</td>
                    <td>${item.lastAudit}</td>
                </tr>
            `).join('');
        }

        // Recent Adjustments
        const recentAdjTable = document.getElementById('recent-adjustments');
        if (!logData.recentAdjustments || logData.recentAdjustments.length === 0) {
            console.log("recent:", logData.recentAdjustments);
            recentAdjTable.innerHTML = '<tr><td colspan="4" class="text-center">Tidak ada penyesuaian stok terbaru</td></tr>';
        } else {
            recentAdjTable.innerHTML = logData.recentAdjustments.map(item => `
                <tr>
                    <td>${item.date}</td>
                    <td>#${item.logId}</td>
                    <td>${item.product}</td>
                    <td>${item.qty}</td>
                </tr>
            `).join('');
        }
        
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    try {
        // 1. Get all stock opname logs with their items (optimized query)
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
            .gte('waktu_dibuat', start.toISOString())  
            .lte('waktu_dibuat', end.toISOString())   
            .order('tanggal', { ascending: false });

        if (logsError) throw logsError;

        // 2. Get all product variants in a single optimized query
        const { data: allProducts, error: productsError } = await supabase
            .from('produk_varian')
            .select(`
                id,
                varian,
                produk: id_produk(nama, id),
                item_opname(
                    id_log,
                    log_opname(tanggal)
                )
            `)
            .order('tanggal', { 
                foreignTable: 'item_opname.log_opname', 
                ascending: false 
            })
            .limit(1, { foreignTable: 'item_opname' });

        if (productsError) throw productsError;

        // Process logs data
        const totalLogs = logs.length;
        const finalLogs = logs.filter(log => log.status_log === 'final').length;
        const draftLogs = logs.filter(log => log.status_log === 'draft').length;
        const totalItems = logs.reduce((sum, log) => sum + (log.items?.length || 0), 0);
        const avgItemsPerLog = totalLogs > 0 ? (totalItems / totalLogs).toFixed(1) : 0;

        // Track items in logs
        const itemsInLogs = new Set();
        const recentAdjustments = [];
        let totalItemsChecked = 0;
        let mismatchedItems = 0;
        let unadjustedMismatches = 0;
        const unadjustedItems = [];

        logs.forEach(log => {
            log.items?.forEach(item => {
                totalItemsChecked++;
                if (item.produk_varian?.produk?.id && item.produk_varian?.id) {
                    itemsInLogs.add(`${item.produk_varian.produk.id}_${item.produk_varian.id}`);
                }

                if (item.status_item_log === 'disesuaikan') {
                    mismatchedItems++;
                    recentAdjustments.push({
                        date: formatIndonesianDateTime(log.tanggal),
                        logId: log.id,
                        product: `${item.produk_varian.produk.nama} (${item.produk_varian.varian})`,
                        qty: item.stok
                    });
                } else if (item.status_item_log === 'tidak_sesuai') {
                    mismatchedItems++;
                    unadjustedMismatches++;
                    unadjustedItems.push({
                        product: item.produk_varian.produk.nama,
                        variant: item.produk_varian.varian,
                        qty: item.stok
                    });
                }
            });
        });

        // Identify unaudited products using pre-fetched data
        const itemsNotInLogs = allProducts
            .filter(product => {
                const key = `${product.produk?.id}_${product.id}`;
                return !itemsInLogs.has(key);
            })
            .map(product => ({
                name: product.produk?.nama || 'Unknown',
                variant: product.varian || 'N/A',
                lastAudit: product.item_opname?.[0]?.log_opname?.tanggal 
                    ? formatIndonesianDateTime(product.item_opname[0].log_opname.tanggal)
                    : 'Tidak pernah diperiksa'
            }));

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

    } catch (error) {
        console.error('Error in fetchLogData:', error);
        throw error;
    }
}

// PRRODUK/STOK
async function loadInventoryInsights(startDate, endDate) {
    const inventoryContent = document.getElementById('inventory-content');
    
    try {
        // loading state
        if (inventoryContent.innerHTML.trim() === '') {
            inventoryContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading inventory insights...</p>
                </div>
            `;
        }

        await updateInventorySummaryMetrics();

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

        
        // lowest stock items
        document.getElementById('lowest-stock-items').innerHTML = 
            lowestStock.map(item => `
                <div class="d-flex justify-content-between mb-2">
                    <span>${item.name} (${item.variant})</span>
                    <strong class="text-danger">${item.stock}</strong>
                </div>
            `).join('');

        // highest stock items
        document.getElementById('highest-stock-items').innerHTML = 
            highestStock.map(item => `
                <div class="d-flex justify-content-between mb-2">
                    <span>${item.name} (${item.variant})</span>
                    <strong class="text-success">${item.stock}</strong>
                </div>
            `).join('');

        // below minimum
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

        // product movement
        document.getElementById('product-movement').innerHTML = [
            ...fastMoving.map(item => `
                <tr class="table-success">
                    <td><span class="badge bg-success">Cepat</span></td>
                    <td>${item.name}</td>
                    <td>${item.variant}</td>
                    <td>${item.qtySold}</td>
                </tr>
            `),
            ...slowMoving.map(item => `
                <tr class="table-danger">
                    <td><span class="badge bg-danger">Lambat</span></td>
                    <td>${item.name}</td>
                    <td>${item.variant}</td>
                    <td>${item.qtySold}</td>
                </tr>
            `)
        ].join('');

        // dead stock analysis
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

    } catch (error) {
        console.error('Error loading inventory insights:', error);
        showToast('Gagal memuat insights untuk tab produk/stok', 'error');
        inventoryContent.innerHTML = `
            <div class="alert alert-danger">
                Failed to load inventory data: ${error.message}
            </div>
        `;
    }
}

async function updateInventorySummaryMetrics() {
    try {
        // Fetch all product variants with their stock and cost information
        const { data: variants, error } = await supabase
            .from('produk_varian')
            .select(`
                id,
                varian,
                jumlah_stok,
                harga_standar,
                produk: id_produk(
                    nama
                )
            `);
        
        if (error) throw error;

        // Calculate total inventory value and total units
        let totalValue = 0;
        let totalUnits = 0;
        
        variants.forEach(variant => {
            const quantity = variant.jumlah_stok || 0;
            const cost = variant.harga_standar || 0;
            
            totalValue += quantity * cost;
            totalUnits += quantity;
        });

        // Update the UI
        document.getElementById('total-inventory-value').textContent = formatCurrency(totalValue);
        document.getElementById('total-units-stock').textContent = totalUnits.toLocaleString();

    } catch (error) {
        console.error('Error updating inventory summary metrics:', error);
        document.getElementById('total-inventory-value').textContent = 'Error';
        document.getElementById('total-units-stock').textContent = 'Error';
        showToast('Gagal memuat insights ringkasan inventori', 'error');
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
    // const { data: stockHistory, error: historyError } = await supabase
    //     .from('riwayat_stok')
    //     .select(`
    //         id_varian,
    //         tanggal,
    //         tipe_riwayat,
    //         qty,
    //         saldo
    //     `)
    //     .gte('tanggal', startDate)
    //     .lte('tanggal', endDate)
    //     .order('tanggal', { ascending: true });
    
    // if (historyError) throw historyError;

    // 3. Fetch sales data for movement analysis
    const { data: salesData, error: salesError } = await supabase
        .from('item_pesanan_penjualan')
        .select(`
            qty_dipesan,
            varian: id_varian(
                varian, 
                produk: id_produk(nama)
            ),
            pesanan_penjualan!inner(tanggal_pesan)
        `)
        .gte('pesanan_penjualan.tanggal_pesan', startDate)
        .lte('pesanan_penjualan.tanggal_pesan', endDate);
    
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
                name: item.varian.produk.nama,    
                variant: item.varian.varian,      
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
        if (variant.pesanan_penjualan && variant.pesanan_penjualan.length > 0) {
            const lastSaleDate = new Date(variant.pesanan_penjualan[0].pesanan_penjualan.tanggal_pesan);
            const daysSince = Math.floor((today - lastSaleDate) / (1000 * 60 * 60 * 24));
            
            if (daysSince > 30) deadStock30++;
            if (daysSince > 60) deadStock60++;
            if (daysSince > 90) deadStock90++;
            
            if (daysSince > 60) {
                deadStockItems.push({
                    name: variant.produk.nama,      
                    variant: variant.varian,         
                    lastSale: variant.pesanan_penjualan[0].pesanan_penjualan.tanggal_pesan.split('T')[0],
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
            name: variant.produk.nama,   
            variant: variant.varian,      
            current: variant.jumlah_stok,
            minimum: variant.produk.qty_minimum,
            difference: variant.jumlah_stok - variant.produk.qty_minimum
        }));

    // Sort stock levels
    const sortedStock = [...variants].sort((a, b) => a.jumlah_stok - b.jumlah_stok);
    // For lowest/highest stock:
    const lowestStock = sortedStock.slice(0, 5).map(variant => ({
        name: variant.produk.nama, 
        variant: variant.varian,    
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
    // const progressionData = stockHistory.reduce((acc, record) => {
    //     const date = record.tanggal.split('T')[0];
    //     if (!acc[date]) {
    //         acc[date] = {
    //             date,
    //             totalStock: 0,
    //             incoming: 0,
    //             outgoing: 0
    //         };
    //     }
        
    //     if (record.tipe_riwayat === 'incoming') {
    //         acc[date].incoming += record.qty;
    //     } else {
    //         acc[date].outgoing += record.qty;
    //     }
        
    //     acc[date].totalStock = record.saldo;
    //     return acc;
    // }, {});

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
        totalVariants
    };
}

async function initDashboard() {
    // default range = 90 days
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