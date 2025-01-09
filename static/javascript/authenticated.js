document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for adding notes
    let addBtn = document.getElementById('addBtn');
    let addTxt = document.getElementById('addTxt');

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


    addBtn.addEventListener("click", function (e) {
        if (addTxt.value.trim() === "") {
            addTxt.style.color = "#6c757d"; // Dark grey color for the placeholder text
            return; // Do nothing if the input is empty
        }

        // Handle note addition for authenticated users
        let noteContent = addTxt.value;
        // Make an AJAX request to save the note to the server
        fetch('/notes/newnote/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ note: noteContent })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  // Clear the input field and refresh the notes
                  addTxt.value = "";
                  showNotes();
              }
          });
    });

    // Function to show notes for authenticated users
    function showNotes() {
        fetch('/notes/getnotes/')
            .then(response => response.json())
            .then(data => {
                let notesElm = document.getElementById("notes");
                let html = "";
                data.notes.forEach(function (note, index) {
                    html += `
                        <div class="cards">
                            <div class="title">Note ${index + 1}</div>
                            <div class="cardtxt">
                                <span>${note.content}</span>
                            </div>
                            <i class="fas fa-trash-alt" data-note-id="${note.id}"></i>
                        </div>`;
                });
                notesElm.innerHTML = html;
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