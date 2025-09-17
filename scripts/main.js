// Main Application Logic
class NovelWriterApp {
    constructor() {
        this.currentProject = null;
        this.currentChapter = null;
        this.isSaving = false;
        this.saveTimeout = null;
        
        this.initializeApp();
    }

    // Initialize the application
    async initializeApp() {
        try {
            // Initialize database
            await novelDB.init();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load projects
            await this.loadProjects();
            
            // Check for auto-save
            this.startAutoSave();
            
            // Show welcome message if no projects
            this.checkEmptyState();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showToast('Gagal memuat aplikasi', 'error');
        }
    }

    // Set up all event listeners
    setupEventListeners() {
        // Project buttons
        document.getElementById('new-project-btn').addEventListener('click', () => this.showProjectModal());
        document.getElementById('export-all-btn').addEventListener('click', () => this.exportAllData());
        document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
        
        // Editor buttons
        document.getElementById('save-btn').addEventListener('click', () => this.saveChapter());
        document.getElementById('export-btn').addEventListener('click', () => this.showExportModal());
        document.getElementById('add-chapter-btn').addEventListener('click', () => this.showChapterModal());
        
        // Modal buttons
        document.getElementById('cancel-project-btn').addEventListener('click', () => this.hideModal('project-modal'));
        document.getElementById('cancel-chapter-btn').addEventListener('click', () => this.hideModal('chapter-modal'));
        document.getElementById('cancel-export-btn').addEventListener('click', () => this.hideModal('export-modal'));
        
        // Form submissions
        document.getElementById('project-form').addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('chapter-form').addEventListener('submit', (e) => this.handleChapterSubmit(e));
        document.getElementById('export-form').addEventListener('submit', (e) => this.handleExportSubmit(e));
        
        // Editor content changes
        document.getElementById('editor').addEventListener('input', () => {
            this.updateWordCount();
            this.scheduleSave();
        });
        
        // Toggle chapters sidebar on mobile
        document.getElementById('toggle-chapters').addEventListener('click', () => {
            document.querySelector('.chapters-sidebar').classList.toggle('hidden');
        });
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    // Load all projects from database
    async loadProjects() {
        try {
            const projects = await novelDB.getAllProjects();
            const projectsContainer = document.getElementById('projects-container');
            
            projectsContainer.innerHTML = '';
            
            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p class="empty-state">Belum ada project</p>';
                return;
            }
            
            projects.forEach(project => {
                const projectElement = document.createElement('div');
                projectElement.className = 'project-item';
                projectElement.innerHTML = `
                    <div class="text-truncate">${project.title}</div>
                    <div class="project-actions">
                        <button class="btn-icon edit-project" data-id="${project.id}"><i class="fas fa-pen"></i></button>
                        <button class="btn-icon delete-project" data-id="${project.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                projectElement.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('edit-project') && 
                        !e.target.classList.contains('delete-project')) {
                        this.loadProject(project.id);
                    }
                });
                
                projectElement.querySelector('.edit-project').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showProjectModal(project);
                });
                
                projectElement.querySelector('.delete-project').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteProject(project.id);
                });
                
                projectsContainer.appendChild(projectElement);
            });
            
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.showToast('Gagal memuat project', 'error');
        }
    }

    // Load a specific project
    async loadProject(projectId) {
        try {
            this.currentProject = await novelDB.getProject(projectId);
            this.currentChapter = null;
            
            // Update UI
            document.querySelectorAll('.project-item').forEach(item => {
                item.classList.remove('active');
            });
            
            document.querySelector(`.project-item [data-id="${projectId}"]`).closest('.project-item').classList.add('active');
            
            document.getElementById('breadcrumb').textContent = this.currentProject.title;
            document.getElementById('editor').innerHTML = '';
            
            // Load chapters
            await this.loadChapters();
            
            // Show editor actions
            document.getElementById('add-chapter-btn').classList.remove('hidden');
            
        } catch (error) {
            console.error('Failed to load project:', error);
            this.showToast('Gagal memuat project', 'error');
        }
    }

    // Load chapters for current project
    async loadChapters() {
        if (!this.currentProject) return;
        
        try {
            const chapters = await novelDB.getChaptersByProject(this.currentProject.id);
            const chaptersList = document.getElementById('chapters-list');
            
            chaptersList.innerHTML = '';
            
            if (chapters.length === 0) {
                chaptersList.innerHTML = '<p class="empty-state">Belum ada bab</p>';
                return;
            }
            
chapters.forEach(chapter => {
    const chapterElement = document.createElement('div');
    chapterElement.className = 'chapter-item';
    chapterElement.innerHTML = `
        <div class="text-truncate">${chapter.title}</div>
        <button class="btn-icon delete-chapter" title="Hapus" data-id="${chapter.id}"><i class="fas fa-trash"></i></button>
    `;
    chapterElement.addEventListener('click', () => {
        this.loadChapter(chapter.id);
    });
    // Tambahkan listener hapus
    chapterElement.querySelector('.delete-chapter').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteChapter(chapter.id);
    });
    chaptersList.appendChild(chapterElement);
});
            
        } catch (error) {
            console.error('Failed to load chapters:', error);
            this.showToast('Gagal memuat bab', 'error');
        }
    }

    // Load a specific chapter
    async loadChapter(chapterId) {
        try {
            this.currentChapter = await novelDB.getChapter(chapterId);
            
            // Update UI
            document.querySelectorAll('.chapter-item').forEach(item => {
                item.classList.remove('active');
            });
            
   document.querySelectorAll('.chapter-item').forEach(item => {
    item.classList.remove('active');
});
const activeChapter = document.querySelector(`.chapter-item[data-id="${chapterId}"]`);
if (activeChapter) activeChapter.classList.add('active');
            
            document.getElementById('editor').innerHTML = this.currentChapter.content || '';
            this.updateWordCount();
            
        } catch (error) {
            console.error('Failed to load chapter:', error);
            this.showToast('Gagal memuat bab', 'error');
        }
    }

async deleteChapter(chapterId) {
    if (!confirm('Hapus bab ini?')) return;
    try {
        await novelDB.deleteChapter(chapterId);
        // Jika bab yang dihapus adalah yang sedang aktif, kosongkan editor
        if (this.currentChapter && this.currentChapter.id === chapterId) {
            this.currentChapter = null;
            document.getElementById('editor').innerHTML = '';
        }
        await this.loadChapters();
        this.showToast('Bab dihapus', 'success');
    } catch (error) {
        console.error('Failed to delete chapter:', error);
        this.showToast('Gagal menghapus bab', 'error');
    }
}

    // Save current chapter
    async saveChapter() {
        if (!this.currentChapter || this.isSaving) return;
        
        this.isSaving = true;
        
        try {
            this.currentChapter.content = document.getElementById('editor').innerHTML;
            this.currentChapter.wordCount = this.countWords(this.currentChapter.content);
            
            await novelDB.saveChapter(this.currentChapter);
            
            this.showToast('Bab disimpan', 'success');
            this.updateLastSaved();
            
        } catch (error) {
            console.error('Failed to save chapter:', error);
            this.showToast('Gagal menyimpan bab', 'error');
        } finally {
            this.isSaving = false;
        }
    }

    // Schedule auto-save
    scheduleSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
            this.saveChapter();
        }, 2000);
    }

    // Start auto-save interval
    startAutoSave() {
        setInterval(() => {
            if (this.currentChapter && document.getElementById('editor').innerHTML !== this.currentChapter.content) {
                this.saveChapter();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    // Show project modal
    showProjectModal(project = null) {
        const modal = document.getElementById('project-modal');
        const title = document.getElementById('project-modal-title');
        const form = document.getElementById('project-form');
        
        if (project) {
            title.textContent = 'Edit Project';
            document.getElementById('project-title').value = project.title;
            document.getElementById('project-author').value = project.author || '';
            document.getElementById('project-genre').value = project.genre || '';
            form.dataset.id = project.id;
        } else {
            title.textContent = 'Project Baru';
            form.reset();
            delete form.dataset.id;
        }
        
        modal.classList.add('active');
    }

    // Show chapter modal
    showChapterModal(chapter = null) {
        if (!this.currentProject) {
            this.showToast('Pilih project terlebih dahulu', 'warning');
            return;
        }
        
        const modal = document.getElementById('chapter-modal');
        const title = document.getElementById('chapter-modal-title');
        const form = document.getElementById('chapter-form');
        
        if (chapter) {
            title.textContent = 'Edit Bab';
            document.getElementById('chapter-title').value = chapter.title;
            document.getElementById('chapter-summary').value = chapter.summary || '';
            form.dataset.id = chapter.id;
        } else {
            title.textContent = 'Bab Baru';
            form.reset();
            delete form.dataset.id;
        }
        
        modal.classList.add('active');
    }

    // Show export modal
    showExportModal() {
        if (!this.currentProject) {
            this.showToast('Pilih project terlebih dahulu', 'warning');
            return;
        }
        
        const modal = document.getElementById('export-modal');
        document.getElementById('export-title').value = this.currentProject.title;
        document.getElementById('export-author').value = this.currentProject.author || '';
        
        modal.classList.add('active');
    }

    // Hide modal
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Handle project form submission
    async handleProjectSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const project = {
                title: formData.get('title'),
                author: formData.get('author'),
                genre: formData.get('genre')
            };
            
            if (e.target.dataset.id) {
                project.id = e.target.dataset.id;
            } else {
                project.id = Date.now().toString();
            }
            
            await novelDB.saveProject(project);
            await this.loadProjects();
            
            this.hideModal('project-modal');
            this.showToast('Project disimpan', 'success');
            
        } catch (error) {
            console.error('Failed to save project:', error);
            this.showToast('Gagal menyimpan project', 'error');
        }
    }

    // Handle chapter form submission
    async handleChapterSubmit(e) {
        e.preventDefault();
        
        if (!this.currentProject) return;
        
        try {
            const formData = new FormData(e.target);
            const chapter = {
                title: formData.get('title'),
                summary: formData.get('summary'),
                projectId: this.currentProject.id
            };
            
            if (e.target.dataset.id) {
                chapter.id = e.target.dataset.id;
            } else {
                chapter.id = Date.now().toString();
            }
            
            await novelDB.saveChapter(chapter);
            await this.loadChapters();
            
            this.hideModal('chapter-modal');
            this.showToast('Bab disimpan', 'success');
            
        } catch (error) {
            console.error('Failed to save chapter:', error);
            this.showToast('Gagal menyimpan bab', 'error');
        }
    }

    // Handle export form submission
    async handleExportSubmit(e) {
        e.preventDefault();
        
        if (!this.currentProject) return;
        
        try {
            const formData = new FormData(e.target);
            const options = {
                title: formData.get('title'),
                author: formData.get('author'),
                fontSize: formData.get('font-size'),
                fontFamily: formData.get('font-family')
            };
            
            await this.exportToPDF(options);
            this.hideModal('export-modal');
            
        } catch (error) {
            console.error('Failed to export PDF:', error);
            this.showToast('Gagal mengekspor PDF', 'error');
        }
    }

    // Delete project
    async deleteProject(projectId) {
        if (!confirm('Hapus project ini? Semua bab akan dihapus.')) return;
        
        try {
            await novelDB.deleteProject(projectId);
            
            if (this.currentProject && this.currentProject.id === projectId) {
                this.currentProject = null;
                this.currentChapter = null;
                document.getElementById('editor').innerHTML = '';
                document.getElementById('breadcrumb').textContent = '';
                document.getElementById('add-chapter-btn').classList.add('hidden');
            }
            
            await this.loadProjects();
            this.showToast('Project dihapus', 'success');
            
        } catch (error) {
            console.error('Failed to delete project:', error);
            this.showToast('Gagal menghapus project', 'error');
        }
    }

    // Export to PDF
    async exportToPDF(options) {
        if (!this.currentProject) return;
        
        try {
            const chapters = await novelDB.getChaptersByProject(this.currentProject.id);
            
            // Create PDF document
            const pdf = new jsPDF();
            
            // Set metadata
            pdf.setProperties({
                title: options.title,
                author: options.author,
                creator: 'NovelWriter'
            });
            
            // Add title page
            pdf.setFontSize(24);
            pdf.text(options.title, 105, 100, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.text(`Oleh: ${options.author}`, 105, 120, { align: 'center' });
            
            pdf.addPage();
            
            // Add table of contents
            pdf.setFontSize(18);
            pdf.text('Daftar Isi', 20, 30);
            
            pdf.setFontSize(12);
            let yPosition = 50;
            
            chapters.forEach((chapter, index) => {
                if (yPosition > 250) {
                    pdf.addPage();
                    yPosition = 30;
                }
                
                pdf.text(`${index + 1}. ${chapter.title}`, 20, yPosition);
                pdf.text(`${pdf.getNumberOfPages()}`, 180, yPosition, { align: 'right' });
                
                yPosition += 10;
            });
            
            // Add chapters
            for (const chapter of chapters) {
                pdf.addPage();
                
                pdf.setFontSize(16);
                pdf.text(chapter.title, 20, 30);
                
                pdf.setFontSize(12);
                
                // Convert HTML to plain text for PDF
                const content = this.stripHtml(chapter.content || '');
                const lines = pdf.splitTextToSize(content, 170);
                
                pdf.text(lines, 20, 50);
            }
            
            // Save PDF
            pdf.save(`${options.title}.pdf`);
            this.showToast('PDF berhasil diekspor', 'success');
            
        } catch (error) {
            console.error('Failed to export PDF:', error);
            throw error;
        }
    }

    // Export all data
    async exportAllData() {
        try {
            const data = await novelDB.exportData();
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `novel-writer-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showToast('Data berhasil diekspor', 'success');
            
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showToast('Gagal mengekspor data', 'error');
        }
    }

    // Import data
    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    await novelDB.importData(data);
                    
                    await this.loadProjects();
                    this.showToast('Data berhasil diimpor', 'success');
                    
                } catch (error) {
                    console.error('Failed to parse imported data:', error);
                    this.showToast('Format file tidak valid', 'error');
                }
            };
            reader.readAsText(file);
            
            // Reset file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Failed to import data:', error);
            this.showToast('Gagal mengimpor data', 'error');
        }
    }

    // Utility functions
    countWords(text) {
        const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return cleanText === '' ? 0 : cleanText.split(' ').length;
    }

    stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }

    updateWordCount() {
        const content = document.getElementById('editor').innerHTML;
        const wordCount = this.countWords(content);
        document.getElementById('word-count').textContent = `${wordCount} kata`;
    }

    updateLastSaved() {
        const now = new Date();
        document.getElementById('last-saved').textContent = `Disimpan: ${now.toLocaleTimeString()}`;
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide toast after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    checkEmptyState() {
        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer.children.length === 0) {
            projectsContainer.innerHTML = '<p class="empty-state">Belum ada project. Klik "Project Baru" untuk memulai.</p>';
        }
    }
}

const chaptersSidebar = document.querySelector('.chapters-sidebar');
const toggleBtn = document.getElementById('toggle-chapters');
const icon = document.getElementById('toggle-chapters-icon');

toggleBtn.addEventListener('click', () => {
    chaptersSidebar.classList.toggle('collapsed');
    // Ganti icon
    if (chaptersSidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NovelWriterApp();
});
