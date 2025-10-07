class NotesManager {
    constructor() {
        this.notes = [];
        this.categories = [];
        this.currentEditingNote = null;
        this.init();
    }

    async init() {
        await this.createTables();
        await this.loadCategories();
        await this.loadNotes();
        this.setupEventListeners();
        this.updateStats();
    }

    async createTables() {
        // Las tablas se crean automáticamente al inicio
        console.log("✅ Base de datos inicializada");
    }

    async loadNotes() {
        try {
            const response = await fetch('/notes');
            if (!response.ok) throw new Error('Error al cargar notas');
            this.notes = await response.json();
            this.renderNotes();
        } catch (error) {
            this.showToast('Error al cargar notas', 'error');
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/notes/categories');
            if (!response.ok) throw new Error('Error al cargar categorías');
            this.categories = await response.json();
            this.renderCategoryFilter();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async createNote(noteData) {
        try {
            const response = await fetch('/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) throw new Error('Error al crear nota');
            
            const result = await response.json();
            this.showToast(result.message, 'success');
            await this.loadNotes();
            this.hideNoteForm();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async updateNote(noteId, noteData) {
        try {
            const response = await fetch(`/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) throw new Error('Error al actualizar nota');
            
            const result = await response.json();
            this.showToast(result.message, 'success');
            await this.loadNotes();
            this.hideNoteForm();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async deleteNote(noteId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

        try {
            const response = await fetch(`/notes/${noteId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar nota');
            
            const result = await response.json();
            this.showToast(result.message, 'success');
            await this.loadNotes();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async searchNotes() {
        const searchQuery = document.getElementById('search-input').value;
        const categoryFilter = document.getElementById('category-filter').value;
        
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (categoryFilter && categoryFilter !== 'Todos') params.append('category', categoryFilter);

        try {
            const response = await fetch(`/notes?${params}`);
            if (!response.ok) throw new Error('Error en búsqueda');
            this.notes = await response.json();
            this.renderNotes();
        } catch (error) {
            this.showToast('Error en búsqueda', 'error');
        }
    }

    renderNotes() {
        const grid = document.getElementById('notes-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.notes.length === 0) {
            grid.innerHTML = '';
            grid.appendChild(emptyState);
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        
        grid.innerHTML = this.notes.map(note => `
            <div class="note-card ${note.is_pinned ? 'pinned' : ''}" style="border-left-color: ${note.color}">
                <div class="note-header">
                    <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        <button class="action-btn edit-btn" onclick="notesManager.editNote(${note.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="notesManager.deleteNote(${note.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
                ${note.tags && note.tags.length > 0 ? `
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="note-meta">
                    <span class="note-category">${this.escapeHtml(note.category)}</span>
                    <span class="note-date">${note.created_at}</span>
                </div>
            </div>
        `).join('');
    }

    renderCategoryFilter() {
        const filter = document.getElementById('category-filter');
        const categorySelect = document.getElementById('category');
        
        const categoriesHtml = this.categories.map(cat => 
            `<option value="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</option>`
        ).join('');
        
        filter.innerHTML = '<option value="Todos">📁 Todas las categorías</option>' + categoriesHtml;
        categorySelect.innerHTML = '<option value="General">📁 General</option>' + categoriesHtml;
    }

    showNoteForm(note = null) {
        this.currentEditingNote = note;
        const form = document.getElementById('note-form-container');
        const formTitle = document.getElementById('form-title');
        
        formTitle.textContent = note ? '✏️ Editar Nota' : '📝 Nueva Nota';
        
        if (note) {
            document.getElementById('title').value = note.title;
            document.getElementById('content').value = note.content;
            document.getElementById('category').value = note.category;
            document.getElementById('color').value = note.color;
            document.getElementById('tags').value = note.tags ? note.tags.join(', ') : '';
            document.getElementById('is-pinned').checked = note.is_pinned;
        } else {
            document.getElementById('note-form').reset();
            document.getElementById('color').value = '#3498db';
        }
        
        this.updateColorPreview();
        form.classList.remove('hidden');
    }

    hideNoteForm() {
        document.getElementById('note-form-container').classList.add('hidden');
        this.currentEditingNote = null;
        document.getElementById('note-form').reset();
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.showNoteForm(note);
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            content: document.getElementById('content').value,
            category: document.getElementById('category').value,
            color: document.getElementById('color').value,
            tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            is_pinned: document.getElementById('is-pinned').checked
        };

        if (this.currentEditingNote) {
            this.updateNote(this.currentEditingNote.id, formData);
        } else {
            this.createNote(formData);
        }
    }

    updateColorPreview() {
        const color = document.getElementById('color').value;
        document.getElementById('color-preview').style.backgroundColor = color;
    }

    async updateStats() {
        try {
            const response = await fetch('/stats');
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('notes-count').textContent = 
                    `${stats.total_notes} notas • ${stats.pinned_notes} fijadas`;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    setupEventListeners() {
        // Formulario
        document.getElementById('note-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('new-note-btn').addEventListener('click', () => this.showNoteForm());
        document.getElementById('close-form').addEventListener('click', () => this.hideNoteForm());
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideNoteForm());
        
        // Búsqueda y Filtros
        document.getElementById('search-input').addEventListener('input', () => this.searchNotes());
        document.getElementById('category-filter').addEventListener('change', () => this.searchNotes());
        document.getElementById('clear-filters').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('category-filter').value = 'Todos';
            this.searchNotes();
        });
        
        // Categorías rápidas
        document.querySelectorAll('.category-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('category-filter').value = btn.dataset.category;
                this.searchNotes();
            });
        });
        
        // Color picker
        document.getElementById('color').addEventListener('input', () => this.updateColorPreview());
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.notesManager = new NotesManager();
});