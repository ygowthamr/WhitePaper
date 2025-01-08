// Get elements
const editButtons = document.querySelectorAll('.edit-button');
const deleteButtons = document.querySelectorAll('.delete-button');
const modal = document.getElementById('editModal');
const editText = document.getElementById('editText');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');

let currentNote = null;

// Show modal for editing
editButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const noteElement = event.target.parentElement;
    const content = noteElement.querySelector('.note-content').textContent;

    currentNote = noteElement; // Keep track of which note is being edited
    editText.value = content; // Pre-fill the textarea with the current note content
    modal.classList.remove('hidden'); // Show the modal
  });
});

// Save changes
saveButton.addEventListener('click', () => {
  if (currentNote) {
    const newContent = editText.value.trim();

    // Validation
    if (newContent === '') {
      alert('Note content cannot be empty!');
      return;
    }

    // Update the note content
    currentNote.querySelector('.note-content').textContent = newContent;

    // Close the modal
    modal.classList.add('hidden');
    currentNote = null;
  }
});

// Cancel editing
cancelButton.addEventListener('click', () => {
  modal.classList.add('hidden');
  currentNote = null;
});

// Delete note
deleteButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const noteElement = event.target.parentElement;

    // Confirm deletion
    if (confirm('Are you sure you want to delete this note?')) {
      noteElement.remove();
    }
  });
});
