// modules/module13_sync/controller.js
export function init() {
    // 1. Render giao diện xác thực Supabase Auth vào đúng vị trí view
    const authStatusEl = document.getElementById('user-auth-status');
    if (authStatusEl) {
        const supabase = window.supabaseClient || window.supabase;
        
        if (!supabase) {
            authStatusEl.innerHTML = `<p style="color:red;">Lỗi: Supabase client chưa được khởi tạo.</p>`;
        } else {
            // Kiểm tra session hiện tại
            supabase.auth.getSession().then(({ data: { session } }) => {
                renderAuthUI(session ? session.user : null);
            });

            // Lắng nghe thay đổi đăng nhập
            supabase.auth.onAuthStateChange((event, session) => {
                renderAuthUI(session ? session.user : null);
            });
        }
    }

    function renderAuthUI(user) {
        if (!authStatusEl) return;
        if (user) {
            authStatusEl.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-card, #fff); padding:16px; border-radius:8px; border:1px solid var(--border-color,#ddd);">
                    <div>
                        <h4 style="margin:0; color:var(--text-main, #333);">Đã đăng nhập Google</h4>
                        <p style="margin:4px 0 0 0; font-size:0.9rem; color:var(--text-secondary, #666);">${user.email}</p>
                    </div>
                    <button onclick="window.logoutAccount()" style="background:#d9534f; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:500;">Đăng xuất</button>
                </div>
            `;
        } else {
            authStatusEl.innerHTML = `
                <div style="background:var(--bg-card, #fff); padding:20px; border-radius:8px; border:1px solid var(--border-color,#ddd); text-align:center;">
                    <h3 style="margin-top:0; color:var(--text-main, #333);">Đồng bộ dữ liệu đám mây (Supabase)</h3>
                    <p style="color:var(--text-secondary, #666); font-size:0.9rem; margin-bottom:16px;">Đăng nhập bằng tài khoản Google để bảo mật và đồng bộ dữ liệu hồ sơ của bạn.</p>
                    <button onclick="window.loginWithGoogle()" style="background:#4285F4; color:#fff; border:none; padding:10px 20px; border-radius:6px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
                        <i class="fab fa-google"></i> Đăng nhập / Đăng ký với Google
                    </button>
                </div>
            `;
        }
    }

    // Khai báo các hàm toàn cục để nút bấm gọi được
    window.loginWithGoogle = async () => {
        const supabase = window.supabaseClient || window.supabase;
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
        const supabase = window.supabaseClient || window.supabase;
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            alert("Đã đăng xuất thành công!");
            location.reload();
        } catch (error) {
            console.error("Lỗi đăng xuất:", error.message);
        }
    };

    // 2. Xử lý nút Xuất / Nhập JSON
    const btnExport = document.getElementById('btn-export-json');
    if (btnExport) {
        btnExport.addEventListener('click', async () => {
            try {
                const allData = {};
                const stores = ['ed_evidences', 'ai_prompts', 'learning_materials', 'competitions', 'profile'];
                for (const store of stores) {
                    try {
                        allData[store] = await window.db.getAll(store);
                    } catch (e) {
                        allData[store] = [];
                    }
                }
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `eduprofile_backup_${new Date().toISOString().slice(0,10)}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            } catch (err) {
                alert("Lỗi xuất JSON: " + err.message);
            }
        });
    }

    const btnImport = document.getElementById('btn-import-json');
    if (btnImport) {
        btnImport.addEventListener('click', async () => {
            const textarea = document.getElementById('json-input-area');
            if (!textarea || !textarea.value.trim()) {
                alert("Vui lòng dán dữ liệu JSON vào ô trống trước khi nhập!");
                return;
            }
            try {
                const importedData = JSON.parse(textarea.value);
                for (const store in importedData) {
                    if (Array.isArray(importedData[store])) {
                        for (const item of importedData[store]) {
                            try {
                                await window.db.put(store, item);
                            } catch (e) {}
                        }
                    }
                }
                alert("Khôi phục dữ liệu JSON thành công!");
                location.reload();
            } catch (err) {
                alert("Dữ liệu JSON không hợp lệ: " + err.message);
            }
        });
    }
}