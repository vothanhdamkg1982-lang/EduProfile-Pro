// module13_sync/controller.js
export function init() {
    // Xuất JSON
    document.getElementById('export-json').addEventListener('click', async () => {
        const stores = ['profile', 'job_assessment', 'evidences', 'digital_skills', 'ai_prompts', 'gallery', 'learning_materials', 'competitions', 'assessment_results'];
        const data = {};
        for (const store of stores) {
            data[store] = await window.db.getAll(store);
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'HoSoNangLuc_Backup.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import từ textarea
    document.getElementById('import-text').addEventListener('click', async () => {
        const text = document.getElementById('json-data').value;
        try {
            const data = JSON.parse(text);
            const stores = Object.keys(data);
            for (const store of stores) {
                const items = data[store];
                for (const item of items) {
                    await window.db.save(store, item);
                }
            }
            alert('Import dữ liệu thành công!');
        } catch (e) {
            alert('Lỗi: Dữ liệu JSON không hợp lệ.');
        }
    });

    // Import file
    document.getElementById('import-json').addEventListener('click', () => {
        document.getElementById('json-file').click();
    });
    document.getElementById('json-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const stores = Object.keys(data);
                for (const store of stores) {
                    const items = data[store];
                    for (const item of items) {
                        await window.db.save(store, item);
                    }
                }
                alert('Import từ file thành công!');
            } catch (err) {
                alert('Lỗi đọc file JSON.');
            }
        };
        reader.readAsText(file);
    });
}