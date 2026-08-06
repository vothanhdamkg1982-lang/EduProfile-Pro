// modules/module8_competition/controller.js
export function init() {
    const formContainer = document.getElementById('competition-form-container');
    const btnAdd = document.getElementById('btn-add-competition');
    const form = document.getElementById('competition-form');
    const listEl = document.getElementById('competition-list');

    let editingId = null;

    if (btnAdd && formContainer && form) {
        btnAdd.addEventListener('click', () => {
            editingId = null;
            form.reset();
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        });
    }

    async function render() {
        if (!listEl) return;
        const items = await window.db.getAll('competitions');
        if (!items || items.length === 0) {
            listEl.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Chưa có dữ liệu thi đua nào.</p>';
            return;
        }

        listEl.innerHTML = items.map(item => {
            const itemId = item.id || '';
            const itemJson = encodeURIComponent(JSON.stringify(item));
            
            const displayTitle = item.category || item.title || 'Thành tích thi đua';
            const displaySub = item.description || item.content || '';

            return `
                <div class="card" style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <!-- Đã loại bỏ thẻ badge màu tím ở đây để tránh trùng lặp -->
                        <h4 style="margin: 0; color: var(--m365-blue);">${displayTitle}</h4>
                        <div>
                            <button class="btn btn-warning btn-sm" onclick="window.editCompetitionItem('${itemJson}')" style="padding:4px 8px; cursor:pointer; margin-right:5px;" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window.deleteCompetitionItem('${itemId}')" style="padding:4px 8px; cursor:pointer;" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${item.year ? `<p style="margin: 6px 0 0 0; font-weight: 500; font-size: 0.85rem; color: var(--text-secondary);">Năm học: ${item.year}</p>` : ''}
                    ${displaySub ? `<p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 6px; margin-bottom: 0;">${displaySub}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    window.editCompetitionItem = (encodedJson) => {
        const item = JSON.parse(decodeURIComponent(encodedJson));
        editingId = item.id;

        const selects = form.querySelectorAll('select');
        const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea');

        if (selects.length > 0) selects[0].value = item.category || selects[0].value;
        if (inputs.length > 0) inputs[0].value = item.year || '';
        if (inputs.length > 1) inputs[1].value = item.description || item.content || '';

        if (formContainer) formContainer.style.display = 'block';
    };

    window.deleteCompetitionItem = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa mục thi đua này không?')) {
            const success = await window.db.delete('competitions', id);
            if (success) {
                alert('Xóa thành công!');
                await render();
            } else {
                alert('Xóa thất bại.');
            }
        }
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const selects = form.querySelectorAll('select');
            const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea');

            const categoryVal = selects.length > 0 ? selects[0].value : 'Thi đua';
            const yearVal = inputs.length > 0 ? inputs[0].value : '';
            const descVal = inputs.length > 1 ? inputs[1].value : '';

            const dataPayload = {
                category: categoryVal,
                title: categoryVal,
                year: yearVal,
                description: descVal,
                updatedAt: new Date().toISOString()
            };

            if (editingId) {
                const existingItems = await window.db.getAll('competitions');
                const target = existingItems.find(i => i.id == editingId);

                const updatedData = {
                    ...(target || {}),
                    ...dataPayload,
                    id: editingId
                };

                await window.db.save('competitions', updatedData, editingId);
                alert('Cập nhật thành công!');
            } else {
                const newData = {
                    ...dataPayload,
                    id: String(Date.now()),
                    createdAt: new Date().toISOString()
                };
                await window.db.save('competitions', newData, newData.id);
                alert('Đã lưu thành tích mới!');
            }

            form.reset();
            editingId = null;
            if (formContainer) formContainer.style.display = 'none';
            render();
        });
    }

    render();
}