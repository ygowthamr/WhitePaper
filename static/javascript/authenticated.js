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
                        <div class="note-header">
                            <i class="fas fa-sticky-note"></i>
                            Note ${index + 1}
                            <div class="tags-container">${tagsHtml}</div>
                        </div>
                        <div class="note-content">
                            <p>${note.content}</p>
                        </div>
                        <div class="note-actions">
                            <button class="edit-btn" data-note-id="${note.id}">Edit</button>
                            <button class="delete-btn" data-note-id="${note.id}">Delete</button>
                            <button class="share-btn" data-note-id="${note.id}">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <div class="share-popup" id="share-popup-${note.id}">
                                <div class="share-popup-content">
                                    <button class="share-option twitter-share" style="background-color: #1DA1F2;" onclick="shareOnSocialMedia('twitter', '${note.content}', ${note.id})">
                                        <i class="fab fa-twitter"></i>
                                    </button>
                                    <button class="share-option linkedin-share" style="background-color: #0A66C2;" onclick="shareOnSocialMedia('linkedin', '${note.content}', ${note.id})">
                                        <i class="fab fa-linkedin-in"></i>
                                    </button>
                                    <button class="share-option whatsapp-share" style="background-color: #25D366;" onclick="shareOnSocialMedia('whatsapp', '${note.content}', ${note.id})">
                                        <i class="fab fa-whatsapp"></i>
                                    </button>
                                    <button class="share-option email-share" style="background-color: #EA4335;" onclick="shareOnSocialMedia('email', '${note.content}', ${note.id})">
                                        <i class="fas fa-envelope"></i>
                                    </button>
                                </div>
                                <div class="share-link-wrapper">
                                    <input type="text" class="share-link" id="share-link-${note.id}" readonly>
                                    <button class="copy-link" onclick="copyShareLink(${note.id})">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
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

    // Share functionality
    notesContainer.addEventListener('click', function(e) {
        if (e.target.closest('.share-btn')) {
            e.preventDefault();
            e.stopPropagation();
            
            const noteId = e.target.closest('.share-btn').dataset.noteId;
            const sharePopup = document.getElementById(`share-popup-${noteId}`);
            const shareLink = document.getElementById(`share-link-${noteId}`);
            
            // Close all other open share popups
            document.querySelectorAll('.share-popup').forEach(popup => {
                if (popup !== sharePopup) {
                    popup.classList.remove('active');
                }
            });

            // Toggle current popup
            sharePopup.classList.toggle('active');
            
            if (sharePopup.classList.contains('active')) {
                const shareUrl = `${window.location.origin}/notes/share/${noteId}/`;
                shareLink.value = shareUrl;
                shareLink.select();
            }
        }
    });

    // Handle clicks inside share popup
    notesContainer.addEventListener('click', function(e) {
        if (e.target.closest('.share-popup')) {
            e.stopPropagation(); // Prevent popup from closing when clicking inside
        }
    });

    // Close share popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.share-popup') && !e.target.closest('.share-btn')) {
            document.querySelectorAll('.share-popup').forEach(popup => {
                popup.classList.remove('active');
                popup.style.display = 'none';
            });
        }
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

// Toast notification function
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

// Add these new functions for social media sharing
function shareOnSocialMedia(platform, content, noteId) {
    const shareUrl = `${window.location.origin}/notes/share/${noteId}/`;
    const encodedContent = encodeURIComponent(content.substring(0, 100) + (content.length > 100 ? '...' : ''));
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    
    switch (platform) {
        case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?text=${encodedContent}&url=${encodedUrl}`;
            break;
        case 'linkedin':
            shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'whatsapp':
            shareLink = `https://wa.me/?text=${encodedContent}%20${encodedUrl}`;
            break;
        case 'email':
            shareLink = `mailto:?subject=Check out this note&body=${encodedContent}%0A%0A${encodedUrl}`;
            break;
    }
    
    // Open in new window/tab
    window.open(shareLink, '_blank', 'width=600,height=400');
}

// Add copy link functionality
function copyShareLink(noteId) {
    const shareLink = document.getElementById(`share-link-${noteId}`);
    shareLink.select();
    document.execCommand('copy');
    
    // Show toast notification
    showToast('Link copied to clipboard!');
}