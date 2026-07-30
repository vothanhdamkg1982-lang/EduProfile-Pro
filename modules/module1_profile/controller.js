// module1_profile/controller.js
export function init() {
    const form = document.getElementById('profile-form');

    // Load dữ liệu từ DB
    window.db.get('profile', 1).then(data => {
        if (data) {
            document.getElementById('fullname').value = data.fullname || '';
            document.getElementById('dob').value = data.dob || '';
            document.getElementById('cccd').value = data.cccd || '';
            document.getElementById('vc_code').value = data.vc_code || '';
            document.getElementById('school').value = data.school || '';
            document.getElementById('department').value = data.department || '';
            document.getElementById('position').value = data.position || '';
            document.getElementById('subject').value = data.subject || '';
            document.getElementById('degree').value = data.degree || 'Đại học';
            document.getElementById('major').value = data.major || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('avatar').value = data.avatar || '';
            document.getElementById('qr').value = data.qr || '';
            // Cập nhật avatar trên top nav
            if (data.avatar) {
                document.getElementById('nav-avatar').src = data.avatar;
            } else if (data.fullname) {
                const name = encodeURIComponent(data.fullname);
                document.getElementById('nav-avatar').src = `https://ui-avatars.com/api/?name=${name}&background=0078D4&color=fff`;
            }
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const profile = {
            id: 1,
            fullname: document.getElementById('fullname').value,
            dob: document.getElementById('dob').value,
            cccd: document.getElementById('cccd').value,
            vc_code: document.getElementById('vc_code').value,
            school: document.getElementById('school').value,
            department: document.getElementById('department').value,
            position: document.getElementById('position').value,
            subject: document.getElementById('subject').value,
            degree: document.getElementById('degree').value,
            major: document.getElementById('major').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            avatar: document.getElementById('avatar').value,
            qr: document.getElementById('qr').value,
            updatedAt: new Date().toISOString()
        };
        await window.db.save('profile', profile);
        alert('Đã lưu hồ sơ cá nhân!');
        // Cập nhật avatar
        if (profile.avatar) {
            document.getElementById('nav-avatar').src = profile.avatar;
        } else if (profile.fullname) {
            const name = encodeURIComponent(profile.fullname);
            document.getElementById('nav-avatar').src = `https://ui-avatars.com/api/?name=${name}&background=0078D4&color=fff`;
        }
    });
}