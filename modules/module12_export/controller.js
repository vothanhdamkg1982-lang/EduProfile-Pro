// module12_export/controller.js
export async function init() {
    const profile = await window.db.get('profile', 1);
    if (profile) {
        document.getElementById('exp_name').textContent = profile.fullname || 'Chưa có';
        document.getElementById('exp_code').textContent = profile.vc_code || 'Chưa có';
        document.getElementById('exp_school').textContent = profile.school || 'Chưa có';
        document.getElementById('exp_subject').textContent = profile.subject || 'Chưa có';
    }

    document.getElementById('btn-export-full').addEventListener('click', () => {
        const element = document.getElementById('export-area');
        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('HoSoNangLucSo_GiaoVien.pdf');
        });
    });
}