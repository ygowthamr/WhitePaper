 // Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if editor element exists
    const editorElement = document.getElementById('editor');
    if (!editorElement) {
        console.error('Editor element not found');
        return;
    }

    // Initialize Quill editor
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'font': [] }, { 'size': [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ]
        },
        placeholder: 'Type your note here...',
    });

    // Initialize elements
    const elements = {
        saveNoteBtn: document.getElementById('saveNoteBtn'),
        tagInput: document.getElementById('tagInput'),
        searchInput: document.getElementById('searchTxt'),
        sortSelect: document.getElementById('sortNotes'),
        notesContainer: document.getElementById('notes'),
        toast: document.getElementById('toast'),
        charCount: document.querySelector('.char-count'),
        themeToggle: document.querySelector('.theme-toggle'),
        scrollToTopBtn: document.getElementById('scrollToTopBtn')
    };

    // Verify all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`${key} element not found`);
            return;
        }
    }

    // Initialize notes array
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');

    // Theme handling
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    function updateTheme() {
        const root = document.documentElement;
        if (isDarkMode) {
            root.style.setProperty('--background', '#1a1a1a');
            root.style.setProperty('--surface', '#2d2d2d');
            root.style.setProperty('--text', '#ffffff');
            root.style.setProperty('--secondary', '#a1a1aa');
            elements.themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            root.style.setProperty('--background', '#f8fafc');
            root.style.setProperty('--surface', '#ffffff');
            root.style.setProperty('--text', '#0f172a');
            root.style.setProperty('--secondary', '#64748b');
            elements.themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
        localStorage.setItem('darkMode', isDarkMode.toString());
    }

    // Save note function
    function saveNote() {
        const content = quill.root.innerHTML.trim();
        const plainText = quill.getText().trim();
        const tags = elements.tagInput.value.split(',').map(tag => tag.trim()).filter(Boolean);

        if (!plainText) {
            showToast('Please enter some content', 'error');
            return;
        }

        const editId = elements.saveNoteBtn.dataset.editId;
        const newNote = {
            id: editId ? Number(editId) : Date.now(),
            content: content,
            plainText: plainText,
            title: plainText.split('\n')[0].slice(0, 50),
            tags: tags,
            createdAt: new Date().toISOString()
        };

        if (editId) {
            elements.saveNoteBtn.textContent = 'Save Note';
            delete elements.saveNoteBtn.dataset.editId;
        }

        notes.unshift(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        
        quill.setText('');
        elements.tagInput.value = '';
        showToast('Note saved successfully!', 'success');
        updateCharCount();
        clearAutosave();
    }
    

    // Create note card
    function createNoteCard(note) {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = `
            <h3 class="note-title">${note.title || 'Untitled Note'}</h3>
            <div class="note-content">${note.content}</div>
            ${note.tags?.length ? `
            <div class="tags">
                ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ` : ''}
            <div class="note-actions" style="margin-top: 1rem;">
                <button class="btn btn-outline print-btn" data-id="${note.id}">
                <i class="fas fa-print"></i> Print
            </button>
                <button class="btn btn-outline edit-btn" data-id="${note.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline delete-btn" data-id="${note.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return div;
    }

    // Render notes
    function renderNotes(notesToRender = notes) {
        elements.notesContainer.innerHTML = '';
        if (notesToRender.length === 0) {
            elements.notesContainer.innerHTML = '<p style="text-align: center; color: var(--secondary);">No notes found. Create your first note above!</p>';
            return;
        }
        notesToRender.forEach(note => {
            elements.notesContainer.appendChild(createNoteCard(note));
        });
    }

    // Search notes
    function searchNotes(query) {
        const filteredNotes = notes.filter(note => 
            note.plainText.toLowerCase().includes(query.toLowerCase()) ||
            note.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        renderNotes(filteredNotes);
    }

    // Sort notes
    function sortNotes() {
        const sortBy = elements.sortSelect.value;
        const sortedNotes = [...notes].sort((a, b) => {
            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        renderNotes(sortedNotes);
    }

    // Update character count
    function updateCharCount() {
        const count = quill.getText().length - 1; // -1 to account for trailing newline
        elements.charCount.textContent = `Characters: ${count}/500`;
        elements.charCount.style.color = count > 500 ? '#ef4444' : 'var(--secondary)';
    }

    // Show toast message
    function showToast(message, type = 'success') {
        elements.toast.textContent = message;
        elements.toast.style.display = 'block';
        elements.toast.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
        setTimeout(() => {
            elements.toast.style.display = 'none';
        }, 3000);
    }

    // Clear autosave
    function clearAutosave() {
        localStorage.removeItem('autosave');
    }

    // Event listeners
    elements.saveNoteBtn.addEventListener('click', saveNote);
    elements.searchInput.addEventListener('input', e => searchNotes(e.target.value));
    elements.sortSelect.addEventListener('change', sortNotes);
    elements.themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        updateTheme();
    });

    quill.on('text-change', updateCharCount);

    elements.notesContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const printBtn = e.target.closest('.print-btn'); // New print button
        const editBtn = e.target.closest('.edit-btn');
        
        if (deleteBtn) {
            const id = Number(deleteBtn.dataset.id);
            if (confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(note => note.id !== id);
                localStorage.setItem('notes', JSON.stringify(notes));
                renderNotes();
                showToast('Note deleted successfully!', 'success');
            }
        } else if (editBtn) {
            const id = Number(editBtn.dataset.id);
            const note = notes.find(note => note.id === id);
            if (note) {
                quill.root.innerHTML = note.content;
                elements.tagInput.value = note.tags.join(', ');
                elements.saveNoteBtn.textContent = 'Update Note';
                elements.saveNoteBtn.dataset.editId = id;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                notes = notes.filter(n => n.id !== id);
                localStorage.setItem('notes', JSON.stringify(notes));
                renderNotes();
            }
        }else if (printBtn) {
        const id = Number(printBtn.dataset.id);
        const note = notes.find(note => note.id === id);
        if (note) {
                // Open a new print window
                const printWindow = window.open('', '', 'width=800,height=600');

// Write the note content into the new window
printWindow.document.write(`
    <html>
        <head>
            <title>Print Note</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 30px;
                    max-width: 800px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                
                .note-header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #eaeaea;
                }
                
                h2 { 
                    margin: 0;
                    color: #2c3e50;
                    font-size: 24px;
                }
                
                .timestamp {
                    color: #7f8c8d;
                    font-size: 14px;
                    margin-top: 5px;
                }
                
                .note-content { 
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .tags-container {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #eaeaea;
                }
                
                .tags-title {
                    font-weight: bold;
                    color: #34495e;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .tag {
                    background: #f0f2f5;
                    padding: 5px 12px;
                    border-radius: 15px;
                    font-size: 13px;
                    color: #516175;
                }
                
                @media print {
                    body {
                        padding: 20px;
                    }
                    
                    .note-content {
                        border: none;
                        box-shadow: none;
                        padding: 0;
                    }
                    
                    .tags-container {
                        break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="note-header">
                <h2>${note.title || 'Untitled Note'}</h2>
                <div class="timestamp">Printed on ${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</div>
            </div>
            
            <div class="note-content">${note.content}</div>
            
            ${note.tags && note.tags.length ? `
                <div class="tags-container">
                    <div class="tags-title">Tags</div>
                    <div class="tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                };
            <\/script>
        </body>
    </html>
`);
// Close document stream
printWindow.document.close();
        }
    }
    });

    // Scroll to top button functionality
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            elements.scrollToTopBtn.style.display = 'block';
            elements.scrollToTopBtn.classList.add('fade-in');
            elements.scrollToTopBtn.classList.remove('fade-out');
        } else {
            elements.scrollToTopBtn.classList.add('fade-out');
            elements.scrollToTopBtn.classList.remove('fade-in');
            setTimeout(() => {
                elements.scrollToTopBtn.style.display = 'none';
            }, 300);
        }
    });

    elements.scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            saveNote();
        }
    });

    // Auto-save functionality
    let autoSaveTimeout;
    quill.on('text-change', () => {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            const content = quill.getText().trim();
            if (content) {
                localStorage.setItem('autosave', JSON.stringify({
                    content: quill.root.innerHTML,
                    tags: elements.tagInput.value
                }));
            }
        }, 1000);
    });

    // Restore auto-saved content if exists
    const autosaved = localStorage.getItem('autosave');
    if (autosaved) {
        const { content, tags } = JSON.parse(autosaved);
        quill.root.innerHTML = content;
        elements.tagInput.value = tags;
        updateCharCount();
    }

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Initialize
    updateTheme();
    renderNotes();
    updateCharCount();
});
