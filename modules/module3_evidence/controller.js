// module3_evidence/controller.js
export function init() {
    const formContainer = document.getElementById('evidence-form-container');
    const btnAdd = document.getElementById('btn-add-evidence');
    const form = document.getElementById('evidence-form');
    const listEl = document.getElementById('evidence-list');

    // Hiển thị form thêm mới
    btnAdd.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        form.reset();
    });

    // Render danh sách
    async function render() {
        const items = await window.db.getAll('evidences');
        if (items.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-secondary);">Chưa có minh chứng nào.</p>';
            return;
        }
        listEl.innerHTML = items.map(item => `
            <div class="card" style="padding: 16px; margin-bottom: 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>${item.title}</h4>
                    <span class="badge badge-blue">${item.category}</span>
                </div>
                <p style="color: var(--text-secondary); font-size:0.9rem;">${item.description || ''}</p>
                ${item.fileName ? `<p><i class="fas fa-paperclip"></i> ${item.fileName}</p>` : ''}
                <div style="margin-top:10px;">
                    <button class="btn btn-danger btn-sm" onclick="deleteEvidence(${item.id})"><i class="fas fa-trash"></i> Xóa</button>
                </div>
            </div>
        `).join('');
        // Gắn hàm xóa vào window để dùng onclick
        window.deleteEvidence = async (id) => {
            if (confirm('Xóa minh chứng này?')) {
                await window.db.delete('evidences', id);
                render();
            }
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('ev_title').value;
        const category = document.getElementById('ev_category').value;
        const description = document.getElementById('ev_desc').value;
        const fileInput = document.getElementById('ev_file');
        let fileData = null;
        let fileName = '';

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileName = file.name;
            // Đọc file thành base64 để lưu (giới hạn kích thước)
            const reader = new FileReader();
            fileData = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        const evidence = {
            title,
            category,
            description,
            fileName,
            fileData,
            createdAt: new Date().toISOString()
        };
        await window.db.save('evidences', evidence);
        alert('Đã lưu minh chứng!');
        form.reset();
        formContainer.style.display = 'none';
        render();
    });

    render();
}