// module2_job/controller.js
export function init() {
    // ---- Phần vị trí việc làm ----
    const jobForm = document.getElementById('job-form');
    window.db.get('job_assessment', 1).then(data => {
        if (data) {
            document.getElementById('job_title').value = data.job_title || '';
            document.getElementById('job_group').value = data.job_group || '';
            document.getElementById('job_level').value = data.job_level || '';
            document.getElementById('job_code').value = data.job_code || '';
            document.getElementById('job_desc').value = data.job_desc || '';
            document.getElementById('job_competency').value = data.job_competency || '';
            document.getElementById('job_standard').value = data.job_standard || '';
            document.getElementById('job_evidence').value = data.job_evidence || '';
        }
    });

    jobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: 1,
            job_title: document.getElementById('job_title').value,
            job_group: document.getElementById('job_group').value,
            job_level: document.getElementById('job_level').value,
            job_code: document.getElementById('job_code').value,
            job_desc: document.getElementById('job_desc').value,
            job_competency: document.getElementById('job_competency').value,
            job_standard: document.getElementById('job_standard').value,
            job_evidence: document.getElementById('job_evidence').value,
            updatedAt: new Date().toISOString()
        };
        await window.db.save('job_assessment', data);
        alert('Đã lưu vị trí việc làm!');
    });

    // ---- Phần tự đánh giá ----
    const saForm = document.getElementById('self-assessment-form');
    const radarCanvas = document.getElementById('jobRadar');
    let radarChart = null;

    function renderRadar(scores) {
        if (radarChart) radarChart.destroy();
        const ctx = radarCanvas.getContext('2d');
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Đạo đức', 'Kế hoạch', 'Phương pháp', 'CNTT', 'Số hóa', 'Đổi mới', 'NCKH'],
                datasets: [{
                    label: 'Tự đánh giá (1-5)',
                    data: scores,
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
                        max: 5,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }

    function updateAvg(scores) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        document.getElementById('avg-score').textContent = avg.toFixed(2);
    }

    // Load dữ liệu tự đánh giá từ DB (lưu trong cùng store 'job_assessment' với id 2)
    window.db.get('job_assessment', 2).then(data => {
        if (data) {
            document.getElementById('sa_ethics').value = data.sa_ethics || 4;
            document.getElementById('sa_planning').value = data.sa_planning || 4;
            document.getElementById('sa_method').value = data.sa_method || 4;
            document.getElementById('sa_ict').value = data.sa_ict || 4;
            document.getElementById('sa_digital').value = data.sa_digital || 4;
            document.getElementById('sa_innovate').value = data.sa_innovate || 3;
            document.getElementById('sa_research').value = data.sa_research || 3;
        }
        // Vẽ biểu đồ
        const scores = [
            parseInt(document.getElementById('sa_ethics').value),
            parseInt(document.getElementById('sa_planning').value),
            parseInt(document.getElementById('sa_method').value),
            parseInt(document.getElementById('sa_ict').value),
            parseInt(document.getElementById('sa_digital').value),
            parseInt(document.getElementById('sa_innovate').value),
            parseInt(document.getElementById('sa_research').value)
        ];
        renderRadar(scores);
        updateAvg(scores);
    });

    saForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const scores = [
            parseInt(document.getElementById('sa_ethics').value),
            parseInt(document.getElementById('sa_planning').value),
            parseInt(document.getElementById('sa_method').value),
            parseInt(document.getElementById('sa_ict').value),
            parseInt(document.getElementById('sa_digital').value),
            parseInt(document.getElementById('sa_innovate').value),
            parseInt(document.getElementById('sa_research').value)
        ];
        const data = {
            id: 2, // Lưu riêng cho tự đánh giá
            sa_ethics: scores[0],
            sa_planning: scores[1],
            sa_method: scores[2],
            sa_ict: scores[3],
            sa_digital: scores[4],
            sa_innovate: scores[5],
            sa_research: scores[6],
            updatedAt: new Date().toISOString()
        };
        await window.db.save('job_assessment', data);
        alert('Đã lưu tự đánh giá!');
        renderRadar(scores);
        updateAvg(scores);
    });

    // Cập nhật biểu đồ khi thay đổi ô nhập
    document.querySelectorAll('#self-assessment-form input[type="number"]').forEach(input => {
        input.addEventListener('change', () => {
            const scores = [
                parseInt(document.getElementById('sa_ethics').value),
                parseInt(document.getElementById('sa_planning').value),
                parseInt(document.getElementById('sa_method').value),
                parseInt(document.getElementById('sa_ict').value),
                parseInt(document.getElementById('sa_digital').value),
                parseInt(document.getElementById('sa_innovate').value),
                parseInt(document.getElementById('sa_research').value)
            ];
            renderRadar(scores);
            updateAvg(scores);
        });
    });
}