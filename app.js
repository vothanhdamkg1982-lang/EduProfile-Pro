// app.js - Router, điều phối toàn cục và Quản lý xác thực Supabase Auth
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
    const stores = ['ed_evidences', 'ai_prompts', 'learning_materials', 'competitions', 'profile'];
    const results = [];
    for (const store of stores) {
        try {
            const items = await window.db.getAll(store);
            if (Array.isArray(items)) {
                const matched = items.filter(item => {
                    const str = JSON.stringify(item).toLowerCase();
                    return str.includes(query.toLowerCase());
                });
                results.push(...matched.map(item => ({ ...item, _store: store })));
            }
        } catch (e) {
            // Bỏ qua nếu store chưa khởi tạo
        }
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
        background: var(--card-bg, #fff); border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        padding: 20px; overflow-y: auto; z-index: 9999; border: 1px solid var(--border-color, #ddd);
    `;
    modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <h4><i class="fas fa-search"></i> Kết quả tìm kiếm (${results.length})</h4>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">✕</button>
        </div>
        ${results.map(r => `
            <div style="padding:8px 0; border-bottom:1px solid var(--border-color, #ddd);">
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

// --- TÍCH HỢP XÁC THỰC THỰC TẾ SUPABASE AUTH ---
function initAuth() {
    if (!supabase) {
        console.error("Supabase client chưa được khởi tạo!");
        return;
    }

    async function checkUserSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            updateAuthUI(session ? session.user : null);
        } catch (err) {
            console.error("Lỗi lấy session:", err);
        }
    }

    window.loginWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (error) {
            alert("Lỗi đăng nhập Google: " + error.message);
        }
    };

    window.logoutAccount = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            updateAuthUI(null);
            alert("Đã đăng xuất thành công!");
            location.reload();
        } catch (error) {
            console.error("Lỗi đăng xuất:", error.message);
        }
    };

    function updateAuthUI(user) {
        const userStatusEl = document.getElementById('user-auth-status');
        if (!userStatusEl) return;

        if (user) {
            userStatusEl.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-card, #fff); padding:16px; border-radius:8px; border:1px solid var(--border-color,#ddd);">
                    <div>
                        <h4 style="margin:0; color:var(--text-main, #333);">Đã đăng nhập Google</h4>
                        <p style="margin:4px 0 0 0; font-size:0.9rem; color:var(--text-secondary, #666);">${user.email}</p>
                    </div>
                    <button onclick="logoutAccount()" style="background:#d9534f; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:500;">Đăng xuất</button>
                </div>
            `;
        } else {
            userStatusEl.innerHTML = `
                <div style="background:var(--bg-card, #fff); padding:20px; border-radius:8px; border:1px solid var(--border-color,#ddd); text-align:center;">
                    <h3 style="margin-top:0; color:var(--text-main, #333);">Đồng bộ dữ liệu đám mây (Supabase)</h3>
                    <p style="color:var(--text-secondary, #666); font-size:0.9rem; margin-bottom:16px;">Đăng nhập bằng tài khoản Google để bảo mật và đồng bộ dữ liệu hồ sơ của bạn.</p>
                    <button onclick="loginWithGoogle()" style="background:#4285F4; color:#fff; border:none; padding:10px 20px; border-radius:6px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
                        <i class="fab fa-google"></i> Đăng nhập / Đăng ký với Google
                    </button>
                </div>
            `;
        }
    }

    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session ? session.user : null);
    });

    checkUserSession();
}

function initUI() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const currentTheme = localStorage.getItem('edTheme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeBtn.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

        themeBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('edTheme', newTheme);
            themeBtn.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }

    const btnSync = document.getElementById('btn-sync');
    if (btnSync) {
        btnSync.addEventListener('click', () => {
            alert('Dữ liệu đã được liên kết trực tiếp và đồng bộ tự động với Supabase Cloud!');
        });
    }

    const searchInput = document.getElementById('global-search');
    if (searchInput) {
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
    }

    // Khởi tạo xác thực Supabase Auth trên giao diện
    initAuth();

    window.db.get('profile', 1).then(profile => {
        const navAvatar = document.getElementById('nav-avatar');
        if (navAvatar && profile) {
            if (profile.avatar) {
                navAvatar.src = profile.avatar;
            } else if (profile.fullname) {
                const name = encodeURIComponent(profile.fullname);
                navAvatar.src = `https://ui-avatars.com/api/?name=${name}&background=0078D4&color=fff`;
            }
        }
    });
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    loadModule(hash);
});

// Khởi chạy ứng dụng ban đầu
initUI();
if (!window.location.hash) {
    window.location.hash = '#dashboard';
} else {
    loadModule(window.location.hash.substring(1));
}

// --- XỬ LÝ SỰ KIỆN TOÀN CỤC CHO CÁC MODULE ---
window.viewImage = (imgSrc) => {
    let modal = document.getElementById('image-viewer-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-viewer-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999; cursor:pointer;';
        modal.innerHTML = `<img id="modal-img" style="max-width:90%; max-height:90%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3);" />`;
        modal.onclick = () => modal.style.display = 'none';
        document.body.appendChild(modal);
    }
    document.getElementById('modal-img').src = imgSrc;
    modal.style.display = 'flex';
};

window.viewEvidence = (id) => { alert("Xem chi tiết minh chứng ID: " + id); };
window.editEvidence = (id) => { alert("Chỉnh sửa minh chứng ID: " + id); };
window.deleteEvidence = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa minh chứng này không?")) {
        if (window.db && typeof window.db.delete === 'function') {
            await window.db.delete('ed_evidences', id);
        }
        location.reload();
    }
};

window.viewGallery = (id) => { alert("Xem chi tiết gallery ID: " + id); };
window.editGallery = (id) => { alert("Chỉnh sửa gallery ID: " + id); };
window.deleteGallery = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa ảnh/video này không?")) {
        if (window.db && typeof window.db.delete === 'function') {
            await window.db.delete('ed_evidences', id);
        }
        location.reload();
    }
};

window.viewLearningItem = (id) => { alert("Xem học liệu ID: " + id); };
window.editLearningItem = (id) => { alert("Chỉnh sửa học liệu ID: " + id); };
window.deleteLearningItem = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa học liệu này không?")) {
        if (window.db && typeof window.db.delete === 'function') {
            await window.db.delete('learning_materials', id);
        }
        location.reload();
    }
};