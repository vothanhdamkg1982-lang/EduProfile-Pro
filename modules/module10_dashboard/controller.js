// module10_dashboard/controller.js
export async function init() {
    // Thống kê số lượng
    const evidences = await window.db.getAll('evidences');
    const prompts = await window.db.getAll('ai_prompts');
    const competitions = await window.db.getAll('competitions');
    document.getElementById('kpi-evidence').textContent = evidences.length;
    document.getElementById('kpi-ai').textContent = prompts.length;
    document.getElementById('kpi-competition').textContent = competitions.length;

    // Biểu đồ Radar từ assessment
    const assessment = await window.db.get('assessment_results', 1);
    const defaultData = [8, 7, 6, 7, 8, 6, 9];
    const radarData = assessment ? [
        assessment.a_expertise || 0,
        assessment.a_ict || 0,
        assessment.a_digital || 0,
        assessment.a_ai || 0,
        assessment.a_innovate || 0,
        assessment.a_research || 0,
        assessment.a_ethics || 0
    ] : defaultData;

    const ctxRadar = document.getElementById('dashboardRadar').getContext('2d');
    new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Chuyên môn', 'CNTT', 'CĐS', 'AI', 'Đổi mới', 'NCKH', 'Phẩm chất'],
            datasets: [{
                label: 'Điểm năng lực',
                data: radarData,
                backgroundColor: 'rgba(0, 120, 212, 0.2)',
                borderColor: '#0078D4',
                pointBackgroundColor: '#0078D4',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: { stepSize: 2 }
                }
            }
        }
    });

    // Biểu đồ cột phân loại minh chứng
    const categories = {};
    evidences.forEach(ev => {
        const cat = ev.category || 'Khác';
        categories[cat] = (categories[cat] || 0) + 1;
    });
    const labels = Object.keys(categories);
    const values = Object.values(categories);

    const ctxBar = document.getElementById('dashboardBar').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['Chưa có dữ liệu'],
            datasets: [{
                label: 'Số lượng',
                data: labels.length ? values : [0],
                backgroundColor: '#0078D4',
                borderRadius: 6
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}