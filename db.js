// db.js - Quản lý cơ sở dữ liệu Supabase hoàn thiện
class DatabaseManager {
    constructor() {}

    getSupabase() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
        return null;
    }

    async init() {
        return true;
    }

    getTableName(storeName) {
        if (!storeName) return 'evidences';
        
        // Chuẩn hóa tên store truyền vào để ánh xạ đúng vào các bảng ed_* trên Supabase
        const mapping = {
            'profile': 'ed_profile',
            'job_assessment': 'ed_job',
            'job': 'ed_job',
            'evidences': 'ed_evidences',
            'digital_skills': 'ed_digital',
            'digital': 'ed_digital',
            'ai_prompts': 'ed_ai_prompts',
            'gallery': 'ed_gallery',
            'learning_materials': 'ed_learning_materials',
            'competitions': 'ed_competitions',
            'assessment_results': 'ed_assessment',
            'reports': 'ed_report',
            'sync_data': 'ed_sync'
        };

        const cleanKey = storeName.trim().toLowerCase();
        return mapping[cleanKey] || storeName;
    }

    async get(storeName, id = 1) {
        try {
            const supabase = this.getSupabase();
            if (!supabase) return null;

            const tableName = this.getTableName(storeName);
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', String(id))
                .maybeSingle();

            if (error) return null;

            if (data && data.content !== undefined) {
                return data.content;
            }
            return data;
        } catch (err) {
            return null;
        }
    }

    async save(storeName, dataObj, id = null) {
        try {
            const supabase = this.getSupabase();
            if (!supabase) {
                alert('Chưa kết nối được với Database!');
                return false;
            }

            const tableName = this.getTableName(storeName);
            
            // Nếu truyền vào là một mảng (xóa hoặc cập nhật hàng loạt)
            if (Array.isArray(dataObj)) {
                // Xóa hết dữ liệu cũ và ghi lại danh sách mới
                await supabase.from(tableName).delete().neq('id', '0');
                for (const item of dataObj) {
                    const itemId = String(item.id || Date.now() + Math.random());
                    await supabase.from(tableName).upsert({
                        id: itemId,
                        content: item,
                        created_at: new Date().toISOString()
                    });
                }
                return true;
            }

            // Lưu từng item riêng lẻ để không bao giờ bị ghi đè
            const recordId = String(id || dataObj.id || Date.now());
            const payload = {
                id: recordId,
                content: dataObj,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from(tableName)
                .upsert(payload);

            if (error) {
                console.error(`Lỗi lưu [${storeName}]:`, error);
                alert('Lỗi lưu dữ liệu: ' + error.message);
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async getAll(storeName) {
        try {
            const supabase = this.getSupabase();
            if (!supabase) return [];
            const tableName = this.getTableName(storeName);
            
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(50); // Giới hạn số lượng tải về giúp tăng tốc độ cực nhanh

            if (error) return [];
            if (data && data.length > 0) {
                if (data.length === 1 && data[0].content && Array.isArray(data[0].content)) {
                    return data[0].content;
                }
                return data.map(item => item.content || item);
            }
            return [];
        } catch (err) {
            return []; // Bỏ qua lỗi mạng ngầm giúp web chạy cực mượt
        }
    }
}

const db = new DatabaseManager();
window.db = db;
export { DatabaseManager as Database, db };