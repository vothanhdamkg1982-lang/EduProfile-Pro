// module11_report/controller.js
export async function init() {
    const evidences = await window.db.getAll('evidences');
    const prompts = await window.db.getAll('ai_prompts');
    const competitions = await window.db.getAll('competitions');

    document.getElementById('r-evidence').textContent = evidences.length;
    document.getElementById('r-ai').textContent = prompts.length;
    document.getElementById('r-competition').textContent = competitions.length;

    // Xuất PDF
    document.getElementById('export-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Báo cáo tổng hợp hồ sơ năng lực', 20, 20);
        doc.setFontSize(12);
        doc.text(`Số minh chứng: ${evidences.length}`, 20, 40);
        doc.text(`Số Prompt AI: ${prompts.length}`, 20, 50);
        doc.text(`Số thành tích: ${competitions.length}`, 20, 60);
        doc.save('BaoCao_TongHop.pdf');
    });

    // Xuất Excel (sử dụng SheetJS)
    document.getElementById('export-excel').addEventListener('click', () => {
        const wb = XLSX.utils.book_new();
        const data = [
            ['Module', 'Số lượng'],
            ['Minh chứng', evidences.length],
            ['Prompt AI', prompts.length],
            ['Thành tích', competitions.length]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Thống kê');
        XLSX.writeFile(wb, 'BaoCao_TongHop.xlsx');
    });
}