// module4_digital/controller.js
export function init() {
    const form = document.getElementById('digital-form');
    const scoreSpan = document.getElementById('digital-score');

    // Hàm tính điểm
    function calcScore() {
        const selects = form.querySelectorAll('select');
        let score = 0;
        selects.forEach(sel => {
            if (sel.value === '1') score++;
        });
        scoreSpan.textContent = score;
        return score;
    }

    // Load dữ liệu
    window.db.get('digital_skills', 1).then(data => {
        if (data) {
            const fields = ['d_lms','d_classroom','d_teams','d_ai','d_canva','d_notebooklm','d_website','d_github','d_qr','d_learning','d_stem','d_iot'];
            fields.forEach(id => {
                const el = document.getElementById(id);
                if (data[id] !== undefined) el.value = data[id];
            });
        }
        calcScore();
    });

    // Cập nhật điểm khi thay đổi
    form.querySelectorAll('select').forEach(sel => {
        sel.addEventListener('change', calcScore);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: 1,
            d_lms: document.getElementById('d_lms').value,
            d_classroom: document.getElementById('d_classroom').value,
            d_teams: document.getElementById('d_teams').value,
            d_ai: document.getElementById('d_ai').value,
            d_canva: document.getElementById('d_canva').value,
            d_notebooklm: document.getElementById('d_notebooklm').value,
            d_website: document.getElementById('d_website').value,
            d_github: document.getElementById('d_github').value,
            d_qr: document.getElementById('d_qr').value,
            d_learning: document.getElementById('d_learning').value,
            d_stem: document.getElementById('d_stem').value,
            d_iot: document.getElementById('d_iot').value,
            updatedAt: new Date().toISOString()
        };
        await window.db.save('digital_skills', data);
        alert('Đã lưu đánh giá chuyển đổi số!');
    });
}