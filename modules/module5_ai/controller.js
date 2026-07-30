// module5_ai/controller.js
export function init() {
    const formContainer = document.getElementById('ai-form-container');
    const btnAdd = document.getElementById('btn-add-prompt');
    const form = document.getElementById('ai-form');
    const listEl = document.getElementById('ai-list');

    btnAdd.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        form.reset();
    });

    async function render() {
        const prompts = await window.db.getAll('ai_prompts');
        if (prompts.length === 0) {
            listEl.innerHTML = '<p style="grid-column:1/-1; color: var(--text-secondary);">Chưa có prompt nào.</p>';
            return;
        }
        listEl.innerHTML = prompts.map(p => `
            <div class="card" style="margin-bottom:0;">
                <div style="display:flex; justify-content:space-between;">
                    <span class="badge badge-purple">${p.category}</span>
                    <button class="btn btn-danger btn-sm" onclick="deletePrompt(${p.id})" style="padding:2px 8px;"><i class="fas fa-trash"></i></button>
                </div>
                <h4 style="margin: 10px 0; color: var(--m365-blue);">${p.title}</h4>
                <div style="background: var(--bg-color); padding: 10px; border-radius: 4px; font-family: monospace; font-size:0.85rem; max-height:100px; overflow-y:auto;">
                    ${p.content}
                </div>
                <button class="btn btn-outline" style="margin-top:10px; width:100%;" onclick="copyPrompt('${p.content.replace(/'/g, "\\'")}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        `).join('');
        window.deletePrompt = async (id) => {
            if (confirm('Xóa prompt này?')) {
                await window.db.delete('ai_prompts', id);
                render();
            }
        };
        window.copyPrompt = (text) => {
            navigator.clipboard.writeText(text).then(() => alert('Đã copy Prompt!'));
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('ai_title').value,
            category: document.getElementById('ai_category').value,
            content: document.getElementById('ai_content').value,
            createdAt: new Date().toISOString()
        };
        await window.db.save('ai_prompts', data);
        alert('Đã lưu Prompt!');
        form.reset();
        formContainer.style.display = 'none';
        render();
    });

    render();
}