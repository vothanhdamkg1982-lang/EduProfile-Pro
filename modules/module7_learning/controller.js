// modules/module7_learning/controller.js
export function init() {
    const formContainer = document.getElementById('learning-form-container');
    const btnAdd = document.getElementById('btn-add-learning');
    const form = document.getElementById('learning-form');
    const listEl = document.getElementById('learning-list');

    let cachedItems = [];
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

        try {
            if (cachedItems.length === 0) {
                listEl.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Đang tải học liệu...</p>';
            }

            let items = await window.db.getAll('learning_materials');
            if (!Array.isArray(items)) {
                items = [];
            }
            cachedItems = items;

            if (cachedItems.length === 0) {
                listEl.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Chưa có học liệu nào.</p>';
                return;
            }

            listEl.innerHTML = cachedItems.map(item => `
                <div class="card" style="padding: 16px; margin-bottom: 12px; background: var(--bg-card, #fff); border-radius: 8px; border: 1px solid var(--border-color, #ddd);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; color: var(--text-main, #333);">${item.title || item.name || 'Học liệu'}</h4>
                        <span class="badge" style="background:#28a745; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8rem;">${item.category || item.type || 'Tài liệu'}</span>
                    </div>
                    <p style="color: var(--text-secondary, #666); font-size:0.9rem; margin: 8px 0;">${item.description || item.subject || ''}</p>
                    
                    ${item.link ? `
                        <div style="margin-top:6px; font-size:0.85rem;">
                            <a href="${item.link}" target="_blank" style="color:#0078D4; text-decoration:none;"><i class="fas fa-external-link-alt"></i> ${item.link}</a>
                        </div>
                    ` : ''}

                    ${item.fileData ? `
                        <div style="margin-top:6px; font-size:0.85rem;">
                            <a href="${item.fileData}" target="_blank" download="${item.fileName || 'tai-lieu'}" style="color:#28a745; text-decoration:none;"><i class="fas fa-file-download"></i> Tải xuống tệp: ${item.fileName || 'Đính kèm'}</a>
                        </div>
                    ` : ''}

                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-info" onclick="viewLearningItem('${item.id}')" style="background:#17a2b8; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-eye"></i> Xem</button>
                        <button class="btn btn-sm btn-warning" onclick="editLearningItem('${item.id}')" style="background:#ffc107; color:#000; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLearningItem('${item.id}')" style="background:#d9534f; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i> Xóa</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Lỗi khi tải học liệu:", error);
            listEl.innerHTML = '<p style="color: red;">Lỗi tải dữ liệu học liệu.</p>';
        }
    }

   // Cập nhật lại hàm viewLearningItem để xử lý chuẩn xác không bị chặn Data URL
    window.viewLearningItem = (id) => {
        const item = cachedItems.find(i => String(i.id) === String(id));
        if (!item) {
            alert('Không tìm thấy học liệu!');
            return;
        }

        if (item.fileData) {
            // Kiểm tra nếu là hình ảnh base64 thì gọi hàm xem ảnh chung của hệ thống
            if (item.fileData.startsWith('data:image/')) {
                if (typeof window.viewImage === 'function') {
                    window.viewImage(item.fileData);
                } else {
                    // Fallback mở ảnh qua một cửa sổ mới an toàn bằng cách tạo Blob URL
                    const win = window.open();
                    win.document.write(`<iframe src="${item.fileData}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                }
            } else {
                // Nếu là file khác (PDF, Word,...) dùng phương thức tạo Blob URL để mở an toàn
                try {
                    const arr = item.fileData.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const blob = new Blob([u8arr], { type: mime });
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                } catch (e) {
                    // Fallback cuối cùng nếu có lỗi chuyển đổi
                    const win = window.open();
                    win.document.write(`<iframe src="${item.fileData}" style="width:100%;height:100%;border:none;"></iframe>`);
                }
            }
        } else if (item.link) {
            window.open(item.link, '_blank');
        } else {
            alert(`Tiêu đề: ${item.title}\nDanh mục: ${item.category || ''}`);
        }
    };

    window.editLearningItem = (id) => {
        const item = cachedItems.find(i => String(i.id) === String(id));
        if (!item) {
            alert('Không tìm thấy học liệu để sửa!');
            return;
        }

        editingId = item.id;
        
        const titleEl = document.getElementById('l_title');
        const categoryEl = document.getElementById('l_category');
        const linkEl = document.getElementById('l_link');

        if (titleEl) titleEl.value = item.title || '';
        if (categoryEl) categoryEl.value = item.category || '';
        if (linkEl) linkEl.value = item.link || '';

        if (formContainer) formContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteLearningItem = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa học liệu này?')) {
            try {
                cachedItems = cachedItems.filter(item => String(item.id) !== String(id));
                await window.db.save('learning_materials', cachedItems);
                
                alert('Đã xóa học liệu thành công!');
                render();
            } catch (error) {
                console.error("Lỗi khi xóa học liệu:", error);
                alert('Xóa thất bại!');
                render();
            }
        }
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleEl = document.getElementById('l_title');
            const categoryEl = document.getElementById('l_category');
            const linkEl = document.getElementById('l_link');
            const fileInput = document.getElementById('l_file');

            const title = titleEl ? titleEl.value : '';
            const category = categoryEl ? categoryEl.value : '';
            const link = linkEl ? linkEl.value : '';
            let fileData = null;
            let fileName = '';

            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                fileName = file.name;
                const reader = new FileReader();
                fileData = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }

            try {
                let existingItems = await window.db.getAll('learning_materials');
                if (!Array.isArray(existingItems)) existingItems = [];

                if (editingId) {
                    // Cập nhật học liệu cũ
                    existingItems = existingItems.map(item => {
                        if (String(item.id) === String(editingId)) {
                            return {
                                ...item,
                                title,
                                category,
                                link,
                                fileName: fileName || item.fileName,
                                fileData: fileData || item.fileData,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return item;
                    });
                    alert('Đã cập nhật học liệu thành công!');
                } else {
                    // Thêm mới học liệu
                    const newLearning = {
                        id: Date.now(),
                        title,
                        category,
                        link,
                        fileName,
                        fileData,
                        createdAt: new Date().toISOString()
                    };
                    existingItems.push(newLearning);
                    alert('Đã lưu học liệu thành công!');
                }

                await window.db.save('learning_materials', existingItems);
                cachedItems = existingItems;

                editingId = null;
                form.reset();
                if (formContainer) formContainer.style.display = 'none';
                render();
            } catch (error) {
                console.error("Lỗi khi lưu học liệu:", error);
                alert('Có lỗi xảy ra khi lưu học liệu!');
            }
        });
    }

    render();
}