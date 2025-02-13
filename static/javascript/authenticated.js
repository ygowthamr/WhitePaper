document.addEventListener('DOMContentLoaded', function () {
    // Quill Editor Initialization
    const quill = new Quill('#addTxt', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'font': [] }, { 'size': [] }], // Font & Size
                ['bold', 'italic', 'underline', 'strike'], // Formatting
                [{ 'color': [] }, { 'background': [] }], // Text Color & Background
                [{ 'script': 'sub' }, { 'script': 'super' }], // Subscript/Superscript
                [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'], // Headers, Quote, Code Block
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], // Lists & Indentation
                [{ 'align': [] }], // Alignment
                ['link', 'image', 'video'], // Media (Links, Images, Videos)
                ['clean'] // Remove Formatting
            ]
        },
        placeholder: 'Type your note here...',
        maxLength: 500
    });
    // Remove any existing click listeners first
    document.getElementById('addBtn').replaceWith(document.getElementById('addBtn').cloneNode(true));
    const addBtn = document.getElementById('addBtn');

    const addTxt = document.getElementById('addTxt');
    const tagInput = document.getElementById('tagInput');
    const headingInput = document.getElementById('headingInput'); 
    const notesContainer = document.getElementById('notes');
    const charCount = document.getElementById('charCount');
    const charWarning = document.getElementById('charWarning');
    const tagFilter = document.getElementById('tagFilter');


    // Character Count and Limit
    quill.on('text-change', function() {
        const maxChars = 500;
        const currentLength = quill.getLength() - 1; // Subtract 1 to account for default newline
        
        charCount.textContent = `Characters: ${currentLength}/${maxChars}`;
        
        if (currentLength > maxChars) {
            quill.deleteText(maxChars, currentLength);
            charWarning.textContent = 'Exceeded maximum character limit!';
            charWarning.style.color = 'red';
        } else if (currentLength >= maxChars - 50) {
            charWarning.textContent = 'Approaching character limit!';
            charWarning.style.color = 'orange';
        } else {
            charWarning.textContent = '';
        }
    });
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

                    heading = note.heading;
                    content = note.content;
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
                            <strong>${heading.trim()}</strong>
                            <div class="tags-container">${tagsHtml}</div>
                        </div>
                        <div class="note-content">
                            <p>${content.trim()}</p>
                        </div>
                        <div class="note-actions">

                        <button class="btn btn-outline print-btn" data-id="${note.id}"><i class="fas fa-print"></i> Print</button>

                        
                            <button class="copy-btn" data-note-id="${note.id}">
                                <i class="fas fa-copy"></i>
                            </button>

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
    // Single event listener with conditional logic
    addBtn.addEventListener('click', function handleNoteAction() {
        if (this.dataset.editingNoteId) {
            // Update existing note logic
            const noteId = this.dataset.editingNoteId;
            const noteData = {
                heading: document.getElementById('headingInput').value.trim(),
                note: quill.root.innerHTML,
                tags: document.getElementById('tagInput').value.split(',').map(t => t.trim())
            };

            fetch(`/notes/updatenote/${noteId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(noteData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resetForm();
                    fetchNotes();
                }
            });
        } else {
            // Original add note logic
            const noteData = {
                heading: document.getElementById('headingInput').value.trim(),
                note: quill.root.innerHTML,
                tags: document.getElementById('tagInput').value.split(',').map(t => t.trim())
            };

            fetch('/notes/newnote/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(noteData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resetForm();
                    fetchNotes();
                }
            });
        }
    });

    function resetForm() {
        document.getElementById('headingInput').value = '';
        quill.root.innerHTML = ''; // Reset Quill editor properly
        document.getElementById('tagInput').value = '';
        delete addBtn.dataset.editingNoteId;
        addBtn.innerHTML = `<i class="fas fa-plus"></i> Add Note`;
    }
    // Copy Note to Clipboard
    notesContainer.addEventListener('click', function(e) {
        if (e.target.closest('.copy-btn')) {
            const noteCard = e.target.closest('.note-card');
            //const heading = noteCard.querySelector('.note-header strong').textContent;
            const content = noteCard.querySelector('.note-content p').textContent;
            //const textToCopy = `${heading}\n\n${content}`;

            navigator.clipboard.writeText(content)
                .then(() => showToast('Note copied to clipboard!'))
                .catch(err => showToast('Failed to copy note!', 3000));
        }
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
     // Separate event listener for print functionality
     notesContainer.addEventListener('click', function(e) {
        if (e.target.closest('.print-btn')) {
            const printBtn = e.target.closest('.print-btn');
            const noteId = printBtn.dataset.id;
            
            // Fetch the specific note content before printing
            fetch(`/notes/printnote/${noteId}/`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => {
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                return response.json();
            })
            .then(data => {
                if (data.success && data.note) {
                    const note = data.note;
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
                                        padding: 20px;
                                        margin: 20px 0;
                                    }
                                    
                                    .tags-container {
                                        margin-top: 20px;
                                        padding-top: 15px;
                                        border-top: 1px solid #eaeaea;
                                    }
                                    
                                    .tag {
                                        background: #f0f2f5;
                                        padding: 5px 12px;
                                        border-radius: 15px;
                                        font-size: 13px;
                                        color: #516175;
                                        display: inline-block;
                                        margin: 0 5px 5px 0;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="note-header">
                                    <h2>Note</h2>
                                    <div class="timestamp">
                                        Created by: ${note.author || 'Anonymous'}<br>
                                        Printed on: ${new Date().toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div class="note-content">${note.content}</div>
                                
                                ${note.tags && note.tags.length ? `
                                    <div class="tags-container">
                                        <div>Tags:</div>
                                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </body>
                        </html>
                    `);

                    // Close document stream
                    printWindow.document.close();
                    
                    // Print after content is loaded
                    printWindow.onload = function() {
                        printWindow.print();
                        // Close the print window after a short delay
                        setTimeout(() => printWindow.close(), 500);
                    };
                } else {
                    throw new Error('Note data not found in response');
                }
            })
            .catch(error => {
                console.error('Error printing note:', error);
                showToast('Error: Failed to print note. Please try again.');
            });
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

   // Edit Note Functionality
   notesContainer.addEventListener('click', function (e) {
    if (e.target.closest('.edit-btn')) {
        const noteId = e.target.closest('.edit-btn').dataset.noteId;
        const noteCard = e.target.closest('.note-card');
        let paragraphs;
        // Retrieve content
        const heading = noteCard.querySelector('.note-header strong').textContent;
        const contentElement = noteCard.querySelector('.note-content');
        if (contentElement) {
            // Select all <p> elements, remove empty ones, and join their innerHTML
            paragraphs = Array.from(contentElement.querySelectorAll('p'))
                .map(p => p.innerHTML.trim()) // Get innerHTML and trim whitespace
                .filter(text => text.length > 0) // Remove empty paragraphs
                .join('<br>'); // Keep paragraph spacing
        }
        const tags = Array.from(noteCard.querySelectorAll('.note-tag')).map(tag => tag.textContent);

        // Populate editor fields
        headingInput.value = heading;
        tagInput.value = tags.join(', ');
        quill.clipboard.dangerouslyPasteHTML(`<p>${paragraphs}</p>`);

        // Change button to update mode
        addBtn.innerHTML = `<i class="fas fa-save"></i> Update Note`;
        addBtn.dataset.editingNoteId = noteId;
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