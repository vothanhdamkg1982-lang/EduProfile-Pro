// db.js - IndexedDB wrapper
export class Database {
    constructor() {
        this.db = null;
        this.DB_NAME = 'HoSoNangLucDB';
        this.DB_VERSION = 1;
    }

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Tạo các object store cho từng module
                const stores = [
                    'profile',          // module1
                    'job_assessment',   // module2
                    'evidences',        // module3
                    'digital_skills',   // module4
                    'ai_prompts',       // module5
                    'gallery',          // module6
                    'learning_materials', // module7
                    'competitions',     // module8
                    'assessment_results', // module9
                    'reports',          // module11
                    'sync_data'         // module13
                ];
                stores.forEach(name => {
                    if (!db.objectStoreNames.contains(name)) {
                        const store = db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
                        // Tạo index cho tìm kiếm
                        if (name === 'evidences' || name === 'gallery' || name === 'learning_materials') {
                            store.createIndex('title', 'title', { unique: false });
                            store.createIndex('category', 'category', { unique: false });
                        }
                        if (name === 'ai_prompts') {
                            store.createIndex('category', 'category', { unique: false });
                            store.createIndex('title', 'title', { unique: false });
                        }
                        if (name === 'competitions') {
                            store.createIndex('year', 'year', { unique: false });
                        }
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    // Generic CRUD
    save(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.put(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    get(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    // Tìm kiếm theo index (ví dụ: tìm theo title)
    search(storeName, indexName, query) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const range = IDBKeyRange.bound(query, query + '\uffff');
            const req = index.getAll(range);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
}