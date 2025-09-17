// Database Manager for Novel Writer
class Database {
    constructor() {
        this.dbName = 'NovelWriterDB';
        this.version = 2;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create projects store if it doesn't exist
                if (!db.objectStoreNames.contains('projects')) {
                    const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectsStore.createIndex('title', 'title', { unique: false });
                    projectsStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
                
                // Create chapters store if it doesn't exist
                if (!db.objectStoreNames.contains('chapters')) {
                    const chaptersStore = db.createObjectStore('chapters', { keyPath: 'id' });
                    chaptersStore.createIndex('projectId', 'projectId', { unique: false });
                    chaptersStore.createIndex('order', 'order', { unique: false });
                }
            };
        });
    }

    // Projects operations
    async getAllProjects() {
        const transaction = this.db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getProject(id) {
        const transaction = this.db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async saveProject(project) {
        // Add timestamp if new project
        if (!project.createdAt) {
            project.createdAt = new Date().toISOString();
        }
        project.updatedAt = new Date().toISOString();

        const transaction = this.db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        return new Promise((resolve, reject) => {
            const request = store.put(project);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async deleteProject(id) {
        // First delete all chapters of this project
        const chapters = await this.getChaptersByProject(id);
        for (const chapter of chapters) {
            await this.deleteChapter(chapter.id);
        }

        // Then delete the project
        const transaction = this.db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // Chapters operations
    async getChaptersByProject(projectId) {
        const transaction = this.db.transaction(['chapters'], 'readonly');
        const store = transaction.objectStore('chapters');
        const index = store.index('projectId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(projectId);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                // Sort chapters by order
                const chapters = request.result.sort((a, b) => a.order - b.order);
                resolve(chapters);
            };
        });
    }

    async getChapter(id) {
        const transaction = this.db.transaction(['chapters'], 'readonly');
        const store = transaction.objectStore('chapters');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async saveChapter(chapter) {
        // Set order if not set
        if (chapter.order === undefined) {
            const chapters = await this.getChaptersByProject(chapter.projectId);
            chapter.order = chapters.length;
        }

        chapter.updatedAt = new Date().toISOString();

        const transaction = this.db.transaction(['chapters'], 'readwrite');
        const store = transaction.objectStore('chapters');
        return new Promise((resolve, reject) => {
            const request = store.put(chapter);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async deleteChapter(id) {
        const transaction = this.db.transaction(['chapters'], 'readwrite');
        const store = transaction.objectStore('chapters');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // Reorder chapters
    async reorderChapters(projectId, chapterIds) {
        const transaction = this.db.transaction(['chapters'], 'readwrite');
        const store = transaction.objectStore('chapters');
        
        for (let i = 0; i < chapterIds.length; i++) {
            const chapterId = chapterIds[i];
            const chapter = await this.getChapter(chapterId);
            chapter.order = i;
            store.put(chapter);
        }
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Export and import data
    async exportData() {
        const projects = await this.getAllProjects();
        const chapters = [];
        
        for (const project of projects) {
            const projectChapters = await this.getChaptersByProject(project.id);
            chapters.push(...projectChapters);
        }
        
        return {
            version: this.version,
            exportedAt: new Date().toISOString(),
            projects,
            chapters
        };
    }

    async importData(data) {
        // Validate data
        if (!data.projects || !data.chapters) {
            throw new Error('Invalid data format');
        }
        
        const transaction = this.db.transaction(['projects', 'chapters'], 'readwrite');
        
        // Clear existing data
        transaction.objectStore('projects').clear();
        transaction.objectStore('chapters').clear();
        
        // Import projects
        for (const project of data.projects) {
            transaction.objectStore('projects').put(project);
        }
        
        // Import chapters
        for (const chapter of data.chapters) {
            transaction.objectStore('chapters').put(chapter);
        }
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Create global database instance
const novelDB = new Database();
