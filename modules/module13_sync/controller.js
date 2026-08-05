// Thêm đoạn này vào bên trong hàm init() của module13_sync/controller.js

    // 1. Xử lý nút Xuất file JSON
    const btnExport = document.getElementById('btn-export-json');
    if (btnExport) {
        btnExport.onclick = async () => {
            try {
                const stores = ['profile', 'job_assessment', 'evidences', 'digital_skills', 'ai_prompts', 'gallery', 'learning_materials', 'competitions', 'assessment_results', 'reports', 'sync_data'];
                const exportData = {};
                
                for (const store of stores) {
                    if (window.db && typeof window.db.getAll === 'function') {
                        exportData[store] = await window.db.getAll(store);
                    }
                }

                // Chuyển thành chuỗi JSON và tạo file để tải xuống tự động
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `hoso_backup_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();

                // Hiển thị thêm vào ô text nếu có
                const jsonInput = document.getElementById('json-data-input');
                if (jsonInput) jsonInput.value = JSON.stringify(exportData, null, 2);

                alert("Xuất dữ liệu ra file JSON thành công!");
            } catch (err) {
                console.error("Lỗi xuất JSON:", err);
                alert("Có lỗi khi xuất file!");
            }
        };
    }

    // 2. Xử lý nút Nhập file JSON
    const btnImport = document.getElementById('btn-import-json');
    if (btnImport) {
        btnImport.onclick = async () => {
            try {
                const jsonInput = document.getElementById('json-data-input');
                const rawText = jsonInput ? jsonInput.value.trim() : '';
                if (!rawText) {
                    alert('Vui lòng dán nội dung JSON hoặc chọn file để nhập!');
                    return;
                }

                const importedData = JSON.parse(rawText);
                for (const [storeName, dataValue] of Object.entries(importedData)) {
                    if (window.db && typeof window.db.save === 'function') {
                        await window.db.save(storeName, dataValue);
                    }
                }

                alert('Nhập và đồng bộ dữ liệu thành công!');
                location.reload();
            } catch (err) {
                console.error("Lỗi nhập JSON:", err);
                alert('Dữ liệu JSON không hợp lệ!');
            }
        };
    }