
document.addEventListener('DOMContentLoaded', function() {
    const MAX_CHARS = 500;
    const AUTO_SAVE_DELAY = 1000;

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
                [{ 'header': ['1', '2', false] }],
                [{ 'size': ['small', false, 'large', 'huge'] }, 'blockquote', 'code-block'],

                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ]
        },
        placeholder: 'Type your note here...',
    });

// Remove Quill's default block header format
delete Quill.imports['formats/header'];




   // Create custom Inline Heading format
const Inline = Quill.import('blots/inline');

class InlineHeader extends Inline {
    static create(level) {
        let node = super.create();
        node.setAttribute('data-header', level);
        node.style.fontSize = level === '1' ? '1.8em' : '1.4em';
        node.style.fontWeight = 'bold';
        return node;
    }
    static formats(node) {
        return node.getAttribute('data-header');
    }
}

InlineHeader.blotName = 'inlineHeader';
InlineHeader.tagName = 'SPAN';

Quill.register(InlineHeader, true);

// Apply inline header when dropdown changes
const headerSelect = document.querySelector('.ql-header');
if (headerSelect) {
    headerSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === '1' || value === '2') {
            quill.format('inlineHeader', value);
        } else {
            quill.format('inlineHeader', false);
        }
    });
}



// 🔹 Add tooltips to Quill toolbar buttons
const tooltips = {
    'ql-bold': 'Bold',
    'ql-italic': 'Italic',
    'ql-underline': 'Underline',
    'ql-strike': 'Strikethrough',
    'ql-color': 'Text Color',
    'ql-background': 'Highlight',
    'ql-script': 'Subscript/Superscript',
    'ql-size': 'Font Size (applies to selected text only)',
    'ql-blockquote': 'Quote',
    'ql-code-block': 'Code Block',
    'ql-list': 'List',
    'ql-indent': 'Indent',
    'ql-align': 'Align',
    'ql-link': 'Insert Link',
    'ql-image': 'Insert Image',
    'ql-video': 'Insert Video',
    'ql-clean': 'Clear Formatting',
    'ql-font': 'Font',
};

// Apply tooltips
document.querySelectorAll('.ql-toolbar button, .ql-toolbar select').forEach(btn => {
    const classes = Array.from(btn.classList);
    const tooltipKey = classes.find(cls => tooltips[cls]);
    if (tooltipKey) {
        btn.setAttribute('title', tooltips[tooltipKey]);
    }
});


    
    // Initialize elements
    const elements = {
        saveNoteBtn: document.getElementById('saveNoteBtn'),
        tagInput: document.getElementById('tagInput'),
        searchInput: document.getElementById('searchTxt'),
        sortSelect: document.getElementById('sortNotes'),
        notesContainer: document.getElementById('notes'),
        toast: document.getElementById('toast'),
        charCount: document.querySelector('.char-count')
    };

    // Verify critical elements exist
    if (!elements.saveNoteBtn || !elements.tagInput || !elements.notesContainer || !elements.charCount || !elements.toast) {
        console.error('One or more critical application elements not found. Stopping initialization.');
        return;
    }

    // Initialize notes array
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');

    // Show toast message
    function showToast(message, type = 'success', duration = 3000) {
        const toast = elements.toast;
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
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
        let newNote;

        if (editId) {
            notes = notes.map(note => {
                if (note.id === Number(editId)) {
                    return {
                        ...note,
                        content: content,
                        plainText: plainText,
                        title: plainText.split('\n')[0].slice(0, 50) || 'Untitled Note',
                        tags: tags,
                    };
                }
                return note;
            });
            showToast('Note updated successfully!', 'success');
            elements.saveNoteBtn.textContent = 'Save Note';
            delete elements.saveNoteBtn.dataset.editId;
        } else {
            newNote = {
                id: Date.now(),
                content: content,
                plainText: plainText,
                title: plainText.split('\n')[0].slice(0, 50) || 'Untitled Note',
                tags: tags,
                createdAt: new Date().toISOString()
            };
            notes.unshift(newNote);
            showToast('Note saved successfully!', 'success');
        }

        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        
        quill.setText('');
        elements.tagInput.value = '';
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
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-outline delete-btn" data-id="${note.id}">
                    <i class="fas fa-trash"></i> Delete
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
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
        renderNotes(sortedNotes);
    }

    // Update character count
    function updateCharCount() {
        const count = quill.getText().length - 1;
        elements.charCount.textContent = `Characters: ${count}/${MAX_CHARS}`;
        elements.charCount.style.color = count > MAX_CHARS ? '#ef4444' : 'var(--secondary)';
    }

    // Clear autosave
    function clearAutosave() {
        localStorage.removeItem('autosave');
    }

    // Event listeners
    elements.saveNoteBtn.addEventListener('click', saveNote);
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', e => searchNotes(e.target.value));
    }
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', sortNotes);
    }

    quill.on('text-change', updateCharCount);

    elements.notesContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const printBtn = e.target.closest('.print-btn');
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
            }
        } else if (printBtn) {
            const id = Number(printBtn.dataset.id);
            const note = notes.find(note => note.id === id);
            if (note) {
                const printWindow = window.open('', '', 'width=800,height=600');
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
                                    padding: 20px;
                                    margin: 20px 0;
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
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            } else {
                showToast('Note not found for printing.', 'error');
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
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
                showToast('Autosaved!', 'info', 1500);
            }
        }, AUTO_SAVE_DELAY);
    });

    // Restore auto-saved content if exists
    const autosaved = localStorage.getItem('autosave');
    if (autosaved) {
        try {
            const { content, tags } = JSON.parse(autosaved);
            quill.root.innerHTML = content;
            elements.tagInput.value = tags;
            updateCharCount();
            showToast('Restored autosaved content.', 'info', 2000);
        } catch (e) {
            console.error("Error parsing autosaved content:", e);
            localStorage.removeItem('autosave');
        }
    }

    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Initialize
    renderNotes();
    updateCharCount();
});