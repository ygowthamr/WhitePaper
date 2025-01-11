let saveTimeout;

function showSaveStatus(message) {
    const statusElement = document.getElementById('save-status');
    if (statusElement) {
        statusElement.textContent = message;
        if (message === 'Saved') {
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
    }
}

function saveNote() {
    const noteContent = document.getElementById('addTxt');
    if (!noteContent) return;
    const content = noteContent.value;
    
    localStorage.setItem('autosaved_note', content);
    showSaveStatus('Saved');
}

document.addEventListener('DOMContentLoaded', function() {
    const noteContent = document.getElementById('addTxt');
    if (noteContent) {
        const savedContent = localStorage.getItem('autosaved_note');
        if (savedContent) {
            noteContent.value = savedContent;
        }

        noteContent.addEventListener('input', function() {
            showSaveStatus('Typing...');
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveNote, 800);
        });
    }
});