// modules/module3_evidence/controller.js
export function init() {
    const formContainer = document.getElementById('evidence-form-container');
    const btnAdd = document.getElementById('btn-add-evidence');
    const form = document.getElementById('evidence-form');
    const listEl = document.getElementById('evidence-list');

    // Kiểm tra an toàn nút bấm mở form
    if (btnAdd && formContainer && form) {
        btnAdd.addEventListener('click', () => {
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
            form.reset();
        });
    }

    // Render danh sách minh chứng
    async function render() {
        if (!listEl) return;
        
        try {
            let items = await window.db.getAll('evidences');
            
            // Đảm bảo items luôn là một mảng dữ liệu hợp lệ
            if (!Array.isArray(items)) {
                items = [];
            }

            if (items.length === 0) {
                listEl.innerHTML = '<p style="color: var(--text-secondary);">Chưa có minh chứng nào.</p>';
                return;
            }

            listEl.innerHTML = items.map(item => `
                <div class="card" style="padding: 16px; margin-bottom: 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4>${item.title || 'Không có tiêu đề'}</h4>
                        <span class="badge badge-blue">${item.category || 'Khác'}</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size:0.9rem;">${item.description || ''}</p>
                    ${item.fileName ? `<p><i class="fas fa-paperclip"></i> ${item.fileName}</p>` : ''}
                    <div style="margin-top:10px;">
                        <button class="btn btn-danger btn-sm" onclick="deleteEvidence(${item.id})"><i class="fas fa-trash"></i> Xóa</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Lỗi khi render minh chứng:", error);
            listEl.innerHTML = '<p style="color: red;">Lỗi tải dữ liệu minh chứng.</p>';
        }
    }

    // Gắn hàm xóa vào window để dùng trực tiếp trong sự kiện onclick của HTML render
    window.deleteEvidence = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa minh chứng này?')) {
            try {
                let items = await window.db.getAll('evidences') || [];
                if (!Array.isArray(items)) items = [];
                
                // Lọc bỏ phần tử cần xóa dựa vào id
                const updatedItems = items.filter(item => Number(item.id) !== Number(id));
                
                // Lưu lại mảng mới sau khi xóa vào database
                await window.db.save('evidences', updatedItems);
                
                alert('Đã xóa minh chứng thành công!');
                render();
            } catch (error) {
                console.error("Lỗi khi xóa minh chứng:", error);
                alert('Xóa thất bại!');
            }
        }
    };

    // Xử lý sự kiện Submit form thêm mới minh chứng
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
                // Đọc file thành base64 để lưu trữ cục bộ/database
                const reader = new FileReader();
                fileData = await new Promise((resolve) => {
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsDataURL(file);
                });
            }

            // Tạo đối tượng minh chứng mới với ID độc nhất dựa trên thời gian
            const newEvidence = {
                id: Date.now(),
                title,
                category,
                description,
                fileName,
                fileData,
                createdAt: new Date().toISOString()
            };

            try {
                // 1. Lấy toàn bộ danh sách cũ hiện tại
                let existingItems = await window.db.getAll('evidences');
                if (!Array.isArray(existingItems)) {
                    existingItems = [];
                }

                // 2. Đẩy minh chứng mới vào mảng cũ
                existingItems.push(newEvidence);

                // 3. Lưu toàn bộ mảng đã gộp xuống cơ sở dữ liệu
                await window.db.save('evidences', existingItems);

                alert('Đã lưu minh chứng thành công!');
                form.reset();
                if (formContainer) formContainer.style.display = 'none';
                render();
            } catch (error) {
                console.error("Lỗi khi lưu minh chứng mới:", error);
                alert('Có lỗi xảy ra khi lưu minh chứng!');
            }
        });
    }

    // Tải và hiển thị danh sách khi khởi chạy module
    render();
}