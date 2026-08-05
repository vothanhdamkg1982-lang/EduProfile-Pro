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
        const mapping = {
            'assessment_results': 'ed_assessment',
            'job_assessment': 'ed_job',
            'profile': 'ed_profile',
            'evidences': 'ed_evidences',
            'competitions': 'ed_competitions',
            'ai_prompts': 'ed_ai_prompts'
        };
        return mapping[storeName] || ('ed_' + storeName);
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
                .select('*');

            if (error) {
                console.error(`Lỗi tải [${storeName}]:`, error);
                return [];
            }

            // Nếu dữ liệu lưu theo dạng các dòng riêng biệt (mỗi dòng 1 minh chứng)
            if (data && data.length > 0) {
                // Kiểm tra xem dữ liệu có lưu gộp kiểu cột content hay không
                if (data.length === 1 && data[0].content && Array.isArray(data[0].content)) {
                    return data[0].content;
                }
                return data.map(item => item.content || item);
            }
            return [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

const db = new DatabaseManager();
window.db = db;
export { DatabaseManager as Database, db };