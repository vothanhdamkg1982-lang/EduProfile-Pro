// module7_learning/controller.js
export function init() {
    const formContainer = document.getElementById('learning-form-container');
    const btnAdd = document.getElementById('btn-add-learning');
    const form = document.getElementById('learning-form');
    const listEl = document.getElementById('learning-list');

    btnAdd.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        form.reset();
    });

    async function render() {
        const items = await window.db.getAll('learning_materials');
        if (items.length === 0) {
            listEl.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Chưa có học liệu nào.</p>';
            return;
        }
        listEl.innerHTML = items.map(item => `
            <div class="card" style="margin-bottom:0;">
                <div style="display:flex; justify-content:space-between;">
                    <h4>${item.title}</h4>
                    <button class="btn btn-danger btn-sm" onclick="deleteLearning(${item.id})" style="padding:2px 8px;"><i class="fas fa-trash"></i></button>
                </div>
                <span class="badge badge-green">${item.category}</span>
                ${item.link ? `<p><a href="${item.link}" target="_blank">${item.link}</a></p>` : ''}
                ${item.fileName ? `<p><i class="fas fa-paperclip"></i> ${item.fileName}</p>` : ''}
            </div>
        `).join('');
        window.deleteLearning = async (id) => {
            if (confirm('Xóa học liệu này?')) {
                await window.db.delete('learning_materials', id);
                render();
            }
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('l_title').value;
        const category = document.getElementById('l_category').value;
        const link = document.getElementById('l_link').value;
        const fileInput = document.getElementById('l_file');
        let fileData = null;
        let fileName = '';

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileName = file.name;
            const reader = new FileReader();
            fileData = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        const data = { title, category, link, fileName, fileData, createdAt: new Date().toISOString() };
        await window.db.save('learning_materials', data);
        alert('Đã lưu học liệu!');
        form.reset();
        formContainer.style.display = 'none';
        render();
    });

    render();
}