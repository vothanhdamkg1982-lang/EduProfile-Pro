// modules/module13_sync/controller.js
import { auth, googleProvider, signInWithPopup, signOut } from '../../firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function init() {
    const loginBtn = document.getElementById('btn-firebase-login');
    const logoutBtn = document.getElementById('btn-firebase-logout');
    const userNameEl = document.getElementById('sync-user-name');
    const userStatusEl = document.getElementById('sync-user-status');
    const userAvatarEl = document.getElementById('sync-user-avatar');

    // Xử lý sự kiện Đăng nhập
    loginBtn?.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            alert("Đăng nhập thành công!");
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            alert("Đăng nhập thất bại: " + error.message);
        }
    });

    // Xử lý sự kiện Đăng xuất
    logoutBtn?.addEventListener('click', async () => {
        try {
            await signOut(auth);
            alert("Đã đăng xuất!");
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    });

    // Lắng nghe trạng thái tài khoản Firebase Auth
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userNameEl.textContent = user.displayName || user.email;
            userStatusEl.textContent = `Đã kết nối Firestore (UID: ${user.uid.substring(0, 6)}...)`;
            if (user.photoURL) {
                userAvatarEl.src = user.photoURL;
            }
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-flex';
        } else {
            userNameEl.textContent = "Chưa đăng nhập";
            userStatusEl.textContent = "Đăng nhập để lưu và đồng bộ dữ liệu lên Firebase.";
            userAvatarEl.src = "https://ui-avatars.com/api/?name=Guest&background=0078D4&color=fff";
            loginBtn.style.display = 'inline-flex';
            logoutBtn.style.display = 'none';
        }
    });

    // Xử lý nút Xuất JSON dự phòng cục bộ
    document.getElementById('btn-export-json')?.addEventListener('click', async () => {
        const stores = ['profile', 'job_assessment', 'evidences', 'digital_skills', 'ai_prompts', 'gallery', 'learning_materials', 'competitions', 'assessment_results', 'reports', 'sync_data'];
        const exportData = {};
        for (const store of stores) {
            exportData[store] = await window.db.getAll(store);
        }
        document.getElementById('json-data-input').value = JSON.stringify(exportData, null, 2);
        alert("Đã xuất toàn bộ dữ liệu ra ô bên dưới!");
    });
}