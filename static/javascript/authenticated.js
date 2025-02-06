document.addEventListener('DOMContentLoaded', function () {
    const addBtn = document.getElementById('addBtn');
    const addTxt = document.getElementById('addTxt');
    const tagInput = document.getElementById('tagInput');
    const notesContainer = document.getElementById('notes');
    const charCount = document.getElementById('charCount');
    const charWarning = document.getElementById('charWarning');
    const tagFilter = document.getElementById('tagFilter');

    // Character count and limit
    addTxt.addEventListener('input', function() {
        const maxChars = 500;
        const currentLength = addTxt.value.length;
        
        charCount.textContent = `Characters: ${currentLength}/${maxChars}`;
        
        if (currentLength > maxChars) {
            charWarning.textContent = 'Exceeded maximum character limit!';
            addTxt.value = addTxt.value.slice(0, maxChars);
        } else {
            charWarning.textContent = '';
        }
    });

    // Tag Filter Functionality
    function updateTagFilter(tags) {
        tagFilter.innerHTML = '<option value="">All Notes</option>';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }

    // Fetch Notes with Optional Filtering
    function fetchNotes(filterTag = '') {
        let url = '/notes/getnotes/';
        if (filterTag) {
            url += `?tag=${encodeURIComponent(filterTag)}`;
        }

        fetch(url)
        .then(response => response.json())
        .then(data => {
            notesContainer.innerHTML = '';
            const allTags = new Set();

            if (data.notes && data.notes.length > 0) {
                data.notes.forEach((note, index) => {
                    // Collect all tags
                    note.tags.forEach(tag => allTags.add(tag));

                    const noteCard = document.createElement('div');
                    noteCard.className = 'note-card';
                    noteCard.dataset.noteId = note.id;

                    // Tags HTML
                    const tagsHtml = note.tags.map(tag => 
                        `<span class="note-tag">${tag}</span>`
                    ).join('');

                    noteCard.innerHTML = `
                       <div style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 10px 0; background: #fff; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);">
    
    <!-- Note Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 18px; font-weight: bold; color: #333; margin-bottom: 8px;">
        <div style="display: flex; align-items: center;">
            <i class="fas fa-sticky-note" style="margin-right: 8px; color: #007bff;"></i>
            Note ${index + 1}
        </div>
        <div style="font-size: 14px; color: #555;">${tagsHtml}</div>
    </div>

    <!-- Note Content -->
    <div style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 10px;">
        <p>${note.content}</p>
    </div>

    <!-- Note Actions -->
    <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button style="padding: 6px 12px; font-size: 14px; border: none; border-radius: 5px; background: #007bff; color: white; cursor: pointer;" data-note-id="${note.id}">
            Edit
        </button>
        <button style="padding: 6px 12px; font-size: 14px; border: none; border-radius: 5px; background: #d9534f; color: white; cursor: pointer;" data-note-id="${note.id}">
            Delete
        </button>
    </div>

</div>

                    `;

                    notesContainer.appendChild(noteCard);
                });

                // Update tag filter
                updateTagFilter(Array.from(allTags));
            } else {
                notesContainer.innerHTML = `
                    <div class="no-notes">
                        <p>No notes found. Start by adding a new note!</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching notes:', error);
            notesContainer.innerHTML = `
                <div class="error-notes">
                    <p>Failed to load notes. Please try again later.</p>
                </div>
            `;
        });
    }

    // Add Note Functionality
    addBtn.addEventListener('click', function() {
        const noteContent = addTxt.value.trim();
        const tags = tagInput.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        if (!noteContent) {
            charWarning.textContent = 'Note cannot be empty!';
            return;
        }

        fetch('/notes/newnote/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ 
                note: noteContent,
                tags: tags
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addTxt.value = '';
                tagInput.value = '';
                charCount.textContent = 'Characters: 0/500';
                fetchNotes(); // Refresh notes
            } else {
                charWarning.textContent = data.error || 'Failed to add note';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            charWarning.textContent = 'Network error. Please try again.';
        });
    });

    // Delete Note Functionality
    notesContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const noteId = e.target.dataset.noteId;
            
            fetch(`/notes/deletenote/${noteId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fetchNotes(); // Refresh notes
                } else {
                    console.error('Failed to delete note');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

    // Tag Filter Change Event
    tagFilter.addEventListener('change', function() {
        fetchNotes(this.value);
    });

    // CSRF Cookie retrieval
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Initial notes load
    fetchNotes();
});