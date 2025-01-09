document.addEventListener('DOMContentLoaded', function () {
    let addBtn = document.getElementById('addBtn');
    let addTxt = document.getElementById('addTxt');
    let tagInput = document.getElementById('tagInput');
    let tagFilter = document.getElementById('tagFilter');
    let allTags = new Set();

    document.getElementById('notes').addEventListener('click', function(e) {
        if (e.target.classList.contains('fa-trash-alt')) {
            const noteId = e.target.dataset.noteId;
            if (noteId) {
                // Make an AJAX request to delete the note
                fetch(`/notes/deletenote/${noteId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotes();
                    } else {
                        console.error(data.error);
                    }
                });
            }
        }
    });

    // Update tag filter dropdown
    function updateTagFilter() {
        let currentFilter = tagFilter.value;
        tagFilter.innerHTML = '<option value="">All Notes</option>';
        allTags.forEach(tag => {
            let option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            if (tag === currentFilter) {
                option.selected = true;
            }
            tagFilter.appendChild(option);
        });
    }

    // Filter notes by tag
    tagFilter.addEventListener('change', function() {
        showNotes(this.value);
    });

    addBtn.addEventListener("click", function (e) {
        if (addTxt.value.trim() === "") {
            return;
        }

        let tags = tagInput.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        fetch('/notes/newnote/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ 
                note: addTxt.value,
                tags: tags
            })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  addTxt.value = "";
                  tagInput.value = "";
                  showNotes();
              }
          });
    });

    function showNotes(tagFilter = '') {
        let url = '/notes/getnotes/';
        if (tagFilter) {
            url += `?tag=${encodeURIComponent(tagFilter)}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                let notesElm = document.getElementById("notes");
                let html = "";
                allTags.clear();

                data.notes.forEach(function (note, index) {
                    note.tags.forEach(tag => allTags.add(tag));
                    
                    let tagsHtml = note.tags.map(tag => 
                        `<span class="note-tag">${tag}</span>`
                    ).join('');

                    html += `
                        <div class="cards">
                            <div class="title">
                                Note ${index + 1}
                                <div class="tags-container">${tagsHtml}</div>
                            </div>
                            <div class="cardtxt">
                                <span>${note.content}</span>
                            </div>
                            <i class="fas fa-trash-alt" data-note-id="${note.id}"></i>
                        </div>`;
                });
                notesElm.innerHTML = html;
                updateTagFilter();
            });
    }

    // Function to delete a note for authenticated users
    function deleteNoteHandler(noteId) {
        // Make an AJAX request to delete the note from the server
        fetch(`/notes/deletenote/${noteId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  showNotes();
              } else {
                  console.error(data.error);
              }
          });
    }

    // Helper function to get CSRF token
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

    // Initial call to show notes
    showNotes();
});