document.addEventListener('DOMContentLoaded', function () {
    // Helper to get data
    const getReports = () => JSON.parse(localStorage.getItem('reports') || '[]');
    const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'Inter', sans-serif", size: 12, weight: '600' },
                    color: '#64748b'
                }
            }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false } },
            x: { grid: { display: false } }
        }
    };

    const reports = getReports();

    // 1. Admin Reports Chart (Dynamic)
    const adminReportsCtx = document.getElementById('adminReportsChart');
    if (adminReportsCtx) {
        const statusGroups = {
            pending: reports.filter(r => r.status === 'pending').length,
            resolved: reports.filter(r => r.status === 'resolved').length,
            investigating: reports.filter(r => r.status === 'investigating' || r.status === 'approved').length
        };

        new Chart(adminReportsCtx, {
            type: 'bar',
            data: {
                labels: ['Real-time System Status'],
                datasets: [
                    { label: 'Pending', data: [5 + statusGroups.pending], backgroundColor: '#f59e0b', borderRadius: 4 },
                    { label: 'In Progress', data: [10 + statusGroups.investigating], backgroundColor: '#0ea5e9', borderRadius: 4 },
                    { label: 'Resolved', data: [20 + statusGroups.resolved], backgroundColor: '#10b981', borderRadius: 4 }
                ]
            },
            options: commonOptions
        });
    }

    // 2. Admin Issues Chart (Dynamic)
    const adminIssuesCtx = document.getElementById('adminIssuesChart');
    if (adminIssuesCtx) {
        const types = ['Leakage', 'Contamination', 'Shortage', 'Quality', 'Other'];
        const typeCounts = types.map(t => reports.filter(r => r.issue.toLowerCase().includes(t.toLowerCase())).length);

        new Chart(adminIssuesCtx, {
            type: 'pie',
            data: {
                labels: types,
                datasets: [{
                    data: [15, 10, 8, 12, 5].map((v, i) => v + typeCounts[i]),
                    backgroundColor: ['#3b82f6', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                ...commonOptions,
                plugins: { ...commonOptions.plugins, legend: { ...commonOptions.plugins.legend, position: 'right' } }
            }
        });
    }

    // 3. Volunteer Tasks Chart (Dynamic)
    const volunteerTasksCtx = document.getElementById('volunteerTasksChart');
    if (volunteerTasksCtx) {
        const resolved = reports.filter(r => r.status === 'resolved').length;
        new Chart(volunteerTasksCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Tasks Resolved',
                    data: [4, 7, 5, 8 + resolved],
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: commonOptions
        });
    }

    // 4. Citizen Status Chart (Dynamic)
    const citizenStatusCtx = document.getElementById('citizenStatusChart');
    if (citizenStatusCtx) {
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const pending = reports.filter(r => r.status === 'pending').length;
        const active = reports.filter(r => r.status !== 'resolved' && r.status !== 'pending').length;

        new Chart(citizenStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Resolved', 'Active', 'Pending'],
                datasets: [{
                    data: [12 + resolved, 5 + active, 3 + pending],
                    backgroundColor: ['#10b981', '#0ea5e9', '#f43f5e'],
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                ...commonOptions,
                cutout: '70%',
                plugins: { ...commonOptions.plugins, legend: { ...commonOptions.plugins.legend, position: 'right' } }
            }
        });
    }

    // 5. Additional Citizen Charts (Dynamic)
    const citizenReportsCtx = document.getElementById('citizenReportsChart');
    if (citizenReportsCtx) {
        const types = ['Leakage', 'Pollution', 'Pressure', 'Odor', 'Other'];
        const typeCounts = types.map(t => reports.filter(r => r.issue.toLowerCase().includes(t.toLowerCase())).length);

        new Chart(citizenReportsCtx, {
            type: 'bar',
            data: {
                labels: types,
                datasets: [{
                    label: 'Total Reports',
                    data: [18, 12, 15, 8, 5].map((v, i) => v + (typeCounts[i] || 0)),
                    backgroundColor: 'rgba(14, 165, 233, 0.7)',
                    borderRadius: 6
                }]
            },
            options: commonOptions
        });
    }

    const citizenQualityCtx = document.getElementById('citizenQualityChart');
    if (citizenQualityCtx) {
        new Chart(citizenQualityCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Water Purity %',
                    data: [88, 92, 90, 85, 89, 94],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: commonOptions
        });
    }

    const citizenActivityCtx = document.getElementById('citizenActivityChart');
    if (citizenActivityCtx) {
        const myReports = reports.filter(r => r.citizenId === localStorage.getItem('currentUserId')).length;
        new Chart(citizenActivityCtx, {
            type: 'radar',
            data: {
                labels: ['Reporting', 'Verification', 'Community', 'Alertness', 'Impact'],
                datasets: [{
                    label: 'My Participation',
                    data: [65 + (myReports * 5), 50, 80, 70, 60],
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: '#8b5cf6',
                    pointBackgroundColor: '#8b5cf6'
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    r: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
                }
            }
        });
    }

    // 6. Fallback Charts (Visual Richness)
    const fallbacks = [
        { id: 'volunteerDistanceChart', type: 'bar', label: 'Distance (km)', data: [5, 8, 12, 7, 4, 15, 3], color: '#10b981' },
        { id: 'adminBudgetChart', type: 'doughnut', labels: ['Equipment', 'Personnel', 'Logistics'], data: [45, 30, 25], colors: ['#0ea5e9', '#10b981', '#f59e0b'] },
        { id: 'adminResponseChart', type: 'line', label: 'Avg Response Time (hrs)', data: [12, 10, 8, 9, 7, 6, 4], color: '#f43f5e' },
        { id: 'volunteerEquipmentChart', type: 'doughnut', labels: ['Available', 'In Use', 'Repair'], data: [60, 30, 10], colors: ['#10b981', '#0ea5e9', '#f43f5e'] }
    ];

    fallbacks.forEach(chart => {
        const ctx = document.getElementById(chart.id);
        if (ctx) {
            new Chart(ctx, {
                type: chart.type,
                data: {
                    labels: chart.labels || ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                    datasets: [{
                        label: chart.label || 'Data',
                        data: chart.data,
                        backgroundColor: chart.colors || chart.color + 'cc',
                        borderColor: chart.color || 'transparent',
                        borderRadius: chart.type === 'bar' ? 4 : 0
                    }]
                },
                options: {
                    ...commonOptions,
                    cutout: chart.type === 'doughnut' ? '70%' : undefined
                }
            });
        }
    });
});
