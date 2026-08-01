// db.js - Firestore wrapper thay thế IndexedDB
import { db, auth } from './firebase-init.js';
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class Database {
    constructor() {
        this.db = db;
    }

    async init() {
        return true;
    }

    _getUserId() {
        return auth.currentUser ? auth.currentUser.uid : 'default_user';
    }

    async save(storeName, data) {
        try {
            const userId = this._getUserId();
            const docId = data.id ? data.id.toString() : Date.now().toString();
            const docRef = doc(this.db, 'users', userId, storeName, docId);
            await setDoc(docRef, { ...data, id: docId, updatedAt: new Date().toISOString() });
            return docId;
        } catch (error) {
            console.error("Lỗi khi lưu Firestore:", error);
            throw error;
        }
    }

    async get(storeName, id) {
        try {
            const userId = this._getUserId();
            const docRef = doc(this.db, 'users', userId, storeName, id.toString());
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error("Lỗi khi đọc Firestore:", error);
            return null;
        }
    }

    async getAll(storeName) {
        try {
            const userId = this._getUserId();
            const querySnapshot = await getDocs(collection(this.db, 'users', userId, storeName));
            const results = [];
            querySnapshot.forEach((doc) => {
                results.push(doc.data());
            });
            return results;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách từ Firestore:", error);
            return [];
        }
    }

    async delete(storeName, id) {
        try {
            const userId = this._getUserId();
            const docRef = doc(this.db, 'users', userId, storeName, id.toString());
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Lỗi khi xóa trên Firestore:", error);
            throw error;
        }
    }
}