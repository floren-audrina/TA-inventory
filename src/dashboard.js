import supabase from './db_conn.js';

// Main application logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the dashboard
    await initDashboard();
});

async function initDashboard() {
    // Set default date range (last 90 days)
    setDateRange(90);
    
    // Load initial tab content
    loadTabContent('overview');
    
    // Initialize event listeners
    setupEventListeners();
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
        });
    });
    
    // Apply button
    document.getElementById('apply-btn').addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (startDate && endDate) {
            updateMetrics(startDate, endDate);
            loadTabContent(getActiveTab());
        }
    });
    
    // Tab switching
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (event) => {
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
    
    // Update metrics for the new date range
    updateMetrics(formatDate(startDate), formatDate(endDate));
}

async function updateMetrics(startDate, endDate) {
    try {
        // Show loading state
        document.getElementById('revenue-metric').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
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

async function loadTabContent(tabId) {
    const insightsContainer = document.getElementById('insights-content');
    
    // Show loading state
    insightsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading ${tabId} insights...</p>
        </div>
    `;
    
    try {
        // Get the current date range
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (tabId === 'overview') {
            await loadOverviewInsights(startDate, endDate);
        } else {
            insightsContainer.innerHTML = `
                <div class="alert alert-info">
                    Insights for ${tabId} will be displayed here
                </div>
            `;
        }
    } catch (error) {
        console.error(`Error loading ${tabId} tab:`, error);
        insightsContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load ${tabId} data: ${error.message}
            </div>
        `;
    }
}

async function loadOverviewInsights(startDate, endDate) {
    const insightsContainer = document.getElementById('insights-content');
    
    // In a real app, you would fetch data specific to the overview tab here
    // For now, we'll just show a simple message
    
    insightsContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Ringkasan Performa</h5>
                <p class="card-text">Data pendapatan untuk periode ${startDate} hingga ${endDate}.</p>
                <p>Fitur tambahan akan ditampilkan di sini.</p>
            </div>
        </div>
    `;
}