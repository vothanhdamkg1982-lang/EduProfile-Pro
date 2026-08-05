// modules/module6_gallery/controller.js
export function init() {
    const grid = document.getElementById('gallery-grid');
    let cachedItems = [];

    async function render() {
        if (!grid) return;
        
        try {
            if (cachedItems.length === 0) {
                grid.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Đang tải gallery...</p>';
            }

            // Sửa lại đúng tên bảng là ed_evidences
            const all = await window.db.getAll('ed_evidences');
            if (!Array.isArray(all)) {
                cachedItems = [];
            } else {
                // Lọc những mục có fileData (có thể không bắt buộc phải khớp đúng đuôi file nếu tải ảnh base64 trực tiếp)
                cachedItems = all.filter(item => item.fileData);
            }

            if (cachedItems.length === 0) {
                grid.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Chưa có hình ảnh hoặc video nào.</p>';
                return;
            }

            grid.innerHTML = cachedItems.map(item => {
                const isVideo = item.fileName && item.fileName.match(/\.(mp4|webm)$/i);
                return `
                    <div class="card gallery-item" style="padding: 12px; background: var(--bg-card, #fff); border-radius: 8px; border: 1px solid var(--border-color, #ddd);">
                        ${isVideo ? 
                            `<video controls src="${item.fileData}" style="width:100%; height:140px; object-fit:cover; border-radius:6px;"></video>` : 
                            `<img src="${item.fileData}" alt="${item.title || 'Gallery'}" style="width:100%; height:140px; object-fit:cover; border-radius:6px; cursor:pointer;" onclick="viewImage('${item.fileData}')" loading="lazy" />`
                        }
                        <div style="margin: 8px 0; font-weight: 500; color: var(--text-main, #333);">${item.title || 'Không có tiêu đề'}</div>
                        
                        <div style="display: flex; gap: 6px; margin-top: 8px;">
                            <button type="button" class="btn btn-sm btn-info" onclick="viewGallery('${item.id}')" style="background:#17a2b8; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;"><i class="fas fa-eye"></i> Xem</button>
                            <button type="button" class="btn btn-sm btn-warning" onclick="editGallery('${item.id}')" style="background:#ffc107; color:#000; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;"><i class="fas fa-edit"></i> Sửa</button>
                            <button type="button" class="btn btn-sm btn-danger" onclick="deleteGallery('${item.id}')" style="background:#d9534f; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;"><i class="fas fa-trash"></i> Xóa</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error("Lỗi khi tải gallery:", error);
            grid.innerHTML = '<p style="grid-column:1/-1; color: red;">Lỗi tải dữ liệu gallery.</p>';
        }
    }

    // Các hàm tương tác gắn vào window
    window.viewGallery = (id) => {
        const item = cachedItems.find(i => String(i.id) === String(id));
        if (item && item.fileData) {
            window.viewImage(item.fileData);
        } else if (item) {
            alert(`Tiêu đề: ${item.title || 'Không có'}\nMô tả: ${item.description || 'Không có'}`);
        } else {
            alert("Không tìm thấy mục gallery này!");
        }
    };

    window.editGallery = (id) => {
        // Tìm xem ảnh này thuộc minh chứng nào để thông báo hoặc hỗ trợ chuyển hướng
        const item = cachedItems.find(i => String(i.id) === String(id));
        if (!item) {
            alert("Không tìm thấy mục gallery cần sửa!");
            return;
        }

        // Chuyển hướng người dùng sang Mục 3 (Minh chứng) để sửa chi tiết, hoặc bạn có thể mở modal tùy ý
        if (confirm(`Chỉnh sửa thông tin cho "${item.title || 'Không có tiêu đề'}" sẽ chuyển bạn sang trang Minh chứng (Mục 3). Bạn có muốn tiếp tục không?`)) {
            // Chuyển tab sang trang #evidence (hoặc đường dẫn quản lý minh chứng của bạn)
            window.location.hash = '#evidence';
            
            // Lưu ID tạm vào sessionStorage để Mục 3 có thể tự động bật form sửa nếu cần
            sessionStorage.setItem('edit_evidence_id', id);
        }
    };

    window.deleteGallery = async (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa mục này không?")) {
            try {
                // Lọc bỏ phần tử cần xóa trên cache
                cachedItems = cachedItems.filter(item => String(item.id) !== String(id));
                
                // Lưu lại mảng mới vào database ed_evidences
                await window.db.save('ed_evidences', cachedItems);
                
                alert("Đã xóa thành công!");
                render();
            } catch (error) {
                console.error("Lỗi khi xóa gallery:", error);
                alert("Xóa thất bại!");
                render();
            }
        }
    };

    render();
}