// module8_competition/controller.js
export function init() {
    const formContainer = document.getElementById('competition-form-container');
    const btnAdd = document.getElementById('btn-add-competition');
    const form = document.getElementById('competition-form');
    const listEl = document.getElementById('competition-list');

    btnAdd.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        form.reset();
    });

    async function render() {
        const items = await window.db.getAll('competitions');
        if (items.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-secondary);">Chưa có thành tích nào.</p>';
            return;
        }
        listEl.innerHTML = items.map(item => `
            <div style="display:flex; justify-content:space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                <div>
                    <strong>${item.type}</strong> - ${item.year}
                    <p style="font-size:0.9rem; color: var(--text-secondary);">${item.description || ''}</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteCompetition(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
        window.deleteCompetition = async (id) => {
            if (confirm('Xóa thành tích này?')) {
                await window.db.delete('competitions', id);
                render();
            }
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            type: document.getElementById('c_type').value,
            year: document.getElementById('c_year').value,
            description: document.getElementById('c_desc').value,
            createdAt: new Date().toISOString()
        };
        await window.db.save('competitions', data);
        alert('Đã lưu thành tích!');
        form.reset();
        formContainer.style.display = 'none';
        render();
    });

    render();
}