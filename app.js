// app.js - Router, điều phối toàn cục
import { Database } from './db.js';
import { supabase } from './supabase-init.js';

window.db = new Database();
await window.db.init();

const MODULES = {
    'dashboard': { num: 10, name: 'dashboard' },
    'profile': { num: 1, name: 'profile' },
    'job': { num: 2, name: 'job' },
    'evidence': { num: 3, name: 'evidence' },
    'digital': { num: 4, name: 'digital' },
    'ai': { num: 5, name: 'ai' },
    'gallery': { num: 6, name: 'gallery' },
    'learning': { num: 7, name: 'learning' },
    'competition': { num: 8, name: 'competition' },
    'assessment': { num: 9, name: 'assessment' },
    'report': { num: 11, name: 'report' },
    'export': { num: 12, name: 'export' },
    'sync': { num: 13, name: 'sync' }
};

async function loadModule(hash) {
    const moduleName = hash || 'dashboard';
    const container = document.getElementById('module-container');

    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-links a[href="#${moduleName}"]`);
    if (activeLink) activeLink.classList.add('active');

    try {
        const mod = MODULES[moduleName];
        if (!mod) throw new Error('Module không tồn tại');
        const folder = `module${mod.num}_${mod.name}`;
        const viewResp = await fetch(`modules/${folder}/view.html`);
        if (!viewResp.ok) throw new Error(`Không tìm thấy view.html cho ${folder}`);
        const html = await viewResp.text();
        container.innerHTML = `<div class="fade-in">${html}</div>`;

        const controller = await import(`./modules/${folder}/controller.js`);
        if (controller && controller.init) {
            controller.init();
        }
    } catch (error) {
        console.error('Lỗi load module:', error);
        container.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-exclamation-triangle"></i> Lỗi tải module</h2>
                <p>${error.message}</p>
                <p>Vui lòng kiểm tra lại cấu trúc thư mục.</p>
            </div>
        `;
    }
}

async function globalSearch(query) {
    if (!query || query.length < 2) return [];
    const stores = ['evidences', 'ai_prompts', 'learning_materials', 'competitions', 'profile'];
    const results = [];
    for (const store of stores) {
        const items = await window.db.getAll(store);
        const matched = items.filter(item => {
            const str = JSON.stringify(item).toLowerCase();
            return str.includes(query.toLowerCase());
        });
        results.push(...matched.map(item => ({ ...item, _store: store })));
    }
    return results;
}

function showSearchResults(results) {
    if (results.length === 0) {
        alert('Không tìm thấy kết quả nào.');
        return;
    }
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 80px; right: 20px; max-width: 500px; max-height: 70vh;
        background: var(--card-bg); border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        padding: 20px; overflow-y: auto; z-index: 9999; border: 1px solid var(--border-color);
    `;
    modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <h4><i class="fas fa-search"></i> Kết quả tìm kiếm (${results.length})</h4>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">✕</button>
        </div>
        ${results.map(r => `
            <div style="padding:8px 0; border-bottom:1px solid var(--border-color);">
                <strong>${r.title || r.fullname || r.name || 'Không có tiêu đề'}</strong>
                <span style="color:var(--text-secondary); font-size:0.8rem; margin-left:8px;">[${r._store}]</span>
                <p style="font-size:0.85rem; color:var(--text-secondary);">${r.description || r.content || r.job_title || ''}</p>
            </div>
        `).join('')}
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        document.addEventListener('click', function handler(e) {
            if (!modal.contains(e.target) && e.target.id !== 'global-search') {
                modal.remove();
                document.removeEventListener('click', handler);
            }
        });
    }, 100);
}

function initUI() {
    const themeBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('edTheme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeBtn.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

    themeBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('edTheme', newTheme);
        themeBtn.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });

    document.getElementById('btn-sync').addEventListener('click', () => {
        alert('Dữ liệu đã được liên kết trực tiếp và đồng bộ tự động với Supabase Cloud!');
    });

    const searchInput = document.getElementById('global-search');
    let timeoutId = null;
    searchInput.addEventListener('input', async (e) => {
        clearTimeout(timeoutId);
        const query = e.target.value.trim();
        if (query.length < 2) return;
        timeoutId = setTimeout(async () => {
            const results = await globalSearch(query);
            showSearchResults(results);
        }, 400);
    });

    // Ẩn nút đăng nhập Google cũ nếu không dùng Firebase Auth nữa
    const loginBtn = document.getElementById('btn-google-login');
    const logoutBtn = document.getElementById('btn-google-logout');
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';

    window.db.get('profile', 1).then(profile => {
        if (profile && profile.avatar) {
            document.getElementById('nav-avatar').src = profile.avatar;
        } else if (profile && profile.fullname) {
            const name = encodeURIComponent(profile.fullname);
            document.getElementById('nav-avatar').src = `https://ui-avatars.com/api/?name=${name}&background=0078D4&color=fff`;
        }
    });
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    loadModule(hash);
});

initUI();
if (!window.location.hash) {
    window.location.hash = '#dashboard';
} else {
    loadModule(window.location.hash.substring(1));
}