// modules/module5_ai/controller.js
export function init() {
    const formContainer = document.getElementById('ai-form-container');
    const btnAdd = document.getElementById('btn-add-prompt');
    const form = document.getElementById('ai-form');
    const listEl = document.getElementById('ai-list');

    let editingId = null; // Biến lưu ID khi đang ở chế độ sửa

    if (btnAdd && formContainer && form) {
        btnAdd.addEventListener('click', () => {
            editingId = null; // Reset về chế độ thêm mới
            form.reset();
            const titleEl = document.getElementById('form-title-ai');
            if (titleEl) titleEl.innerText = 'Thêm Prompt Mới';
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        });
    }

    async function render() {
        if (!listEl) return;
        const prompts = await window.db.getAll('ai_prompts');
        if (!prompts || prompts.length === 0) {
            listEl.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Chưa có prompt nào.</p>';
            return;
        }

        listEl.innerHTML = prompts.map(p => {
            const itemId = p.id || '';
            const safeContent = (p.content || '').replace(/'/g, "\\'").replace(/\n/g, '\\n');
            
            // Mã hóa dữ liệu JSON an toàn để đưa vào hàm edit
            const pJson = encodeURIComponent(JSON.stringify(p));

            return `
                <div class="card" style="margin-bottom:0;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge badge-purple">${p.category || 'Chung'}</span>
                        <div>
                            <button class="btn btn-warning btn-sm" onclick="window.editPromptItem('${pJson}')" style="padding:4px 8px; cursor:pointer; margin-right:5px;" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window.deletePromptItem('${itemId}')" style="padding:4px 8px; cursor:pointer;" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <h4 style="margin: 10px 0; color: var(--m365-blue);">${p.title || 'Không có tiêu đề'}</h4>
                    <div style="background: var(--bg-color); padding: 10px; border-radius: 4px; font-family: monospace; font-size:0.85rem; max-height:100px; overflow-y:auto; white-space: pre-wrap;">
                        ${p.content || ''}
                    </div>
                    <button class="btn btn-outline" style="margin-top:10px; width:100%; cursor:pointer;" onclick="window.copyPromptContent('${safeContent}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            `;
        }).join('');
    }

    // Hàm chuẩn bị dữ liệu lên form để sửa
    window.editPromptItem = (encodedJson) => {
        const p = JSON.parse(decodeURIComponent(encodedJson));
        editingId = p.id;

        document.getElementById('ai_title').value = p.title || '';
        if (document.getElementById('ai_category')) document.getElementById('ai_category').value = p.category || '';
        document.getElementById('ai_content').value = p.content || '';

        if (formContainer) formContainer.style.display = 'block';
    };

    window.deletePromptItem = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa prompt này không?')) {
            const success = await window.db.delete('ai_prompts', id);
            if (success) {
                alert('Xóa thành công!');
                render();
            } else {
                alert('Xóa thất bại.');
            }
        }
    };

    window.copyPromptContent = (text) => {
        navigator.clipboard.writeText(text).then(() => alert('Đã copy Prompt!'));
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleEl = document.getElementById('ai_title');
            const categoryEl = document.getElementById('ai_category');
            const contentEl = document.getElementById('ai_content');

            if (!titleEl || !contentEl) return;

            if (editingId) {
                // Chế độ Cập nhật (Sửa)
                const existingData = await window.db.getAll('ai_prompts');
                const target = existingData.find(item => item.id == editingId);
                
                const updatedData = {
                    ...(target || {}),
                    id: editingId,
                    title: titleEl.value,
                    category: categoryEl ? categoryEl.value : 'Chung',
                    content: contentEl.value,
                    updatedAt: new Date().toISOString()
                };

                await window.db.save('ai_prompts', updatedData, editingId);
                alert('Đã cập nhật Prompt thành công!');
            } else {
                // Chế độ Thêm mới
                const newData = {
                    id: String(Date.now()),
                    title: titleEl.value,
                    category: categoryEl ? categoryEl.value : 'Chung',
                    content: contentEl.value,
                    createdAt: new Date().toISOString()
                };
                await window.db.save('ai_prompts', newData, newData.id);
                alert('Đã lưu Prompt mới!');
            }

            form.reset();
            editingId = null;
            if (formContainer) formContainer.style.display = 'none';
            render();
        });
    }

    render();
}