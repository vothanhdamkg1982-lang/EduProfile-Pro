// modules/module3_evidence/controller.js
export function init() {
    const formContainer = document.getElementById('evidence-form-container');
    const btnAdd = document.getElementById('btn-add-evidence');
    const form = document.getElementById('evidence-form');
    const listEl = document.getElementById('evidence-list');
    
    let cachedItems = [];
    let editingId = null; // Biến lưu trạng thái đang sửa bản ghi nào

    if (btnAdd && formContainer && form) {
        btnAdd.addEventListener('click', () => {
            editingId = null; // Reset trạng thái sửa
            form.reset();
            const formTitle = document.getElementById('form-title-text');
            if (formTitle) formTitle.innerText = 'Thêm minh chứng mới';
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        });
    }

    async function render() {
        if (!listEl) return;
        
        try {
            if (cachedItems.length === 0) {
                listEl.innerHTML = '<p style="color: var(--text-secondary);">Đang tải dữ liệu minh chứng...</p>';
            }

            let items = await window.db.getAll('ed_evidences');
            if (!Array.isArray(items)) {
                items = [];
            }
            
            cachedItems = items;

            if (cachedItems.length === 0) {
                listEl.innerHTML = '<p style="color: var(--text-secondary);">Chưa có minh chứng nào.</p>';
                return;
            }

            listEl.innerHTML = cachedItems.map(item => `
                <div class="card" style="padding: 16px; margin-bottom: 12px; background: var(--bg-card, #fff); border-radius: 8px; border: 1px solid var(--border-color, #ddd);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; color: var(--text-main, #333);">${item.title || item.name || 'Không có tiêu đề'}</h4>
                        <span class="badge" style="background:#0078D4; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8rem;">${item.category || 'Minh chứng'}</span>
                    </div>
                    <p style="color: var(--text-secondary, #666); font-size:0.9rem; margin: 8px 0;">${item.description || ''}</p>
                    
                    ${item.fileData ? `
                        <div style="margin-top:8px; display:flex; align-items:center; gap:10px;">
                            <img src="${item.fileData}" style="height:50px; width:50px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="viewImage('${item.fileData}')" alt="Xem trước" loading="lazy" />
                            <span style="font-size:0.85rem; color: var(--text-secondary);"><i class="fas fa-paperclip"></i> Đã đính kèm tệp</span>
                        </div>
                    ` : ''}

                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-info" onclick="viewEvidence('${item.id}')" style="background:#17a2b8; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-eye"></i> Xem</button>
                        <button class="btn btn-sm btn-warning" onclick="editEvidence('${item.id}')" style="background:#ffc107; color:#000; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEvidence('${item.id}')" style="background:#d9534f; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i> Xóa</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Lỗi khi render minh chứng:", error);
            listEl.innerHTML = '<p style="color: red;">Lỗi tải dữ liệu minh chứng.</p>';
        }
    }

    window.viewEvidence = async (id) => {
        const item = cachedItems.find(i => String(i.id) === String(id));
        if (item && item.fileData) {
            window.viewImage(item.fileData);
        } else if (item) {
            alert(`Chi tiết minh chứng:\nTiêu đề: ${item.title || 'Không có'}\nMô tả: ${item.description || 'Không có'}`);
        } else {
            alert('Không tìm thấy minh chứng!');
        }
    };

    // Hàm Sửa: Đổ dữ liệu cũ lên form và mở form để người dùng chỉnh sửa
    window.editEvidence = async (id) => {
        const item = cachedItems.find(i => String(i.id) === String(id));
        if (!item) {
            alert('Không tìm thấy dữ liệu để sửa!');
            return;
        }

        editingId = item.id; // Ghi nhận ID đang sửa

        const titleEl = document.getElementById('ev_title');
        const categoryEl = document.getElementById('ev_category');
        const descEl = document.getElementById('ev_desc');

        if (titleEl) titleEl.value = item.title || '';
        if (categoryEl) categoryEl.value = item.category || '';
        if (descEl) descEl.value = item.description || '';

        if (formContainer) formContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Hàm Xóa: Tối ưu hóa bằng cách xử lý trên cache và cập nhật trực tiếp nhanh chóng
    window.deleteEvidence = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa minh chứng này?')) {
            try {
                // Xóa trực tiếp trên mảng cache hiện tại để phản hồi lập tức giao diện
                cachedItems = cachedItems.filter(item => String(item.id) !== String(id));
                
                // Lưu mảng đã lọc ngược lại vào database
                await window.db.save('ed_evidences', cachedItems);
                
                // Cập nhật lại giao diện ngay lập tức mà không cần gọi lại lệnh getAll nặng nề
                if (cachedItems.length === 0) {
                    listEl.innerHTML = '<p style="color: var(--text-secondary);">Chưa có minh chứng nào.</p>';
                } else {
                    render();
                }
                alert('Đã xóa minh chứng thành công!');
            } catch (error) {
                console.error("Lỗi khi xóa minh chứng:", error);
                alert('Xóa thất bại!');
                render(); // Load lại nếu lỗi
            }
        }
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleEl = document.getElementById('ev_title');
            const categoryEl = document.getElementById('ev_category');
            const descEl = document.getElementById('ev_desc');
            const fileInput = document.getElementById('ev_file');

            const title = titleEl ? titleEl.value : '';
            const category = categoryEl ? categoryEl.value : '';
            const description = descEl ? descEl.value : '';
            let fileData = null;
            let fileName = '';

            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                fileName = file.name;
                const reader = new FileReader();
                fileData = await new Promise((resolve) => {
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsDataURL(file);
                });
            }

            try {
                let existingItems = await window.db.getAll('ed_evidences');
                if (!Array.isArray(existingItems)) existingItems = [];

                if (editingId) {
                    // Trường hợp đang ở chế độ Cập nhật/Sửa
                    existingItems = existingItems.map(item => {
                        if (String(item.id) === String(editingId)) {
                            return {
                                ...item,
                                title,
                                category,
                                description,
                                fileName: fileName || item.fileName,
                                fileData: fileData || item.fileData, // Giữ file cũ nếu không chọn file mới
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return item;
                    });
                    alert('Đã cập nhật minh chứng thành công!');
                } else {
                    // Trường hợp Thêm mới
                    const newEvidence = {
                        id: Date.now(),
                        title,
                        category,
                        description,
                        fileName,
                        fileData,
                        createdAt: new Date().toISOString()
                    };
                    existingItems.push(newEvidence);
                    alert('Đã lưu minh chứng thành công!');
                }

                await window.db.save('ed_evidences', existingItems);
                cachedItems = existingItems; // Cập nhật lại cache
                
                editingId = null; // Reset trạng thái
                form.reset();
                if (formContainer) formContainer.style.display = 'none';
                render();
            } catch (error) {
                console.error("Lỗi khi lưu minh chứng:", error);
                alert('Có lỗi xảy ra khi lưu minh chứng!');
            }
        });
    }

    render();
}