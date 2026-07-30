// module6_gallery/controller.js
export function init() {
    const grid = document.getElementById('gallery-grid');

    async function render() {
        // Lấy tất cả minh chứng có fileData (hình ảnh/video)
        const all = await window.db.getAll('evidences');
        const items = all.filter(item => item.fileData && (item.fileName?.match(/\.(png|jpg|jpeg|gif|mp4|webm)$/i)));
        if (items.length === 0) {
            grid.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Chưa có hình ảnh hoặc video nào.</p>';
            return;
        }
        grid.innerHTML = items.map(item => {
            const isVideo = item.fileName?.match(/\.(mp4|webm)$/i);
            return `
                <div class="gallery-item">
                    ${isVideo ? `<video controls><source src="${item.fileData}" type="video/${item.fileName.split('.').pop()}"></video>` :
                                `<img src="${item.fileData}" alt="${item.title}" />`}
                    <div class="info">${item.title}</div>
                </div>
            `;
        }).join('');
    }

    render();
}