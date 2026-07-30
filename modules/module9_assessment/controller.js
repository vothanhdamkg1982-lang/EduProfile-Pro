// module9_assessment/controller.js
export function init() {
    const form = document.getElementById('assessment-form');
    const canvas = document.getElementById('assessmentRadar');
    let chart = null;

    function renderChart(data) {
        if (chart) chart.destroy();
        const ctx = canvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Chuyên môn', 'CNTT', 'CĐS', 'AI', 'Đổi mới', 'NCKH', 'Phẩm chất'],
                datasets: [{
                    label: 'Điểm năng lực',
                    data: [
                        data.a_expertise || 0,
                        data.a_ict || 0,
                        data.a_digital || 0,
                        data.a_ai || 0,
                        data.a_innovate || 0,
                        data.a_research || 0,
                        data.a_ethics || 0
                    ],
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
    }

    // Load dữ liệu
    window.db.get('assessment_results', 1).then(data => {
        if (data) {
            document.getElementById('a_expertise').value = data.a_expertise || 8;
            document.getElementById('a_ict').value = data.a_ict || 7;
            document.getElementById('a_digital').value = data.a_digital || 6;
            document.getElementById('a_ai').value = data.a_ai || 7;
            document.getElementById('a_innovate').value = data.a_innovate || 8;
            document.getElementById('a_research').value = data.a_research || 6;
            document.getElementById('a_ethics').value = data.a_ethics || 9;
            renderChart(data);
        } else {
            // Dữ liệu mặc định
            const defaultData = {
                a_expertise: 8,
                a_ict: 7,
                a_digital: 6,
                a_ai: 7,
                a_innovate: 8,
                a_research: 6,
                a_ethics: 9
            };
            renderChart(defaultData);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: 1,
            a_expertise: parseInt(document.getElementById('a_expertise').value),
            a_ict: parseInt(document.getElementById('a_ict').value),
            a_digital: parseInt(document.getElementById('a_digital').value),
            a_ai: parseInt(document.getElementById('a_ai').value),
            a_innovate: parseInt(document.getElementById('a_innovate').value),
            a_research: parseInt(document.getElementById('a_research').value),
            a_ethics: parseInt(document.getElementById('a_ethics').value),
            updatedAt: new Date().toISOString()
        };
        await window.db.save('assessment_results', data);
        alert('Đã lưu đánh giá năng lực!');
        renderChart(data);
    });
}