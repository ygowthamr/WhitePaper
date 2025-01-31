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

document.addEventListener('DOMContentLoaded', function () {
    const maxChars = 500; // Set the maximum character limit
    const warningThreshold = 50; // Set the threshold for the warning
    const addTxt = document.getElementById('addTxt');
    const charCountElement = document.getElementById('charCount');
    const warningElement = document.getElementById('charWarning'); // Element for warning message
    let saveTimeout;

    if (addTxt) {
        const savedContent = localStorage.getItem('autosaved_note');
        if (savedContent) addTxt.value = savedContent;

        addTxt.addEventListener('input', function () {
            const contentLength = addTxt.value.length;

            // Enforce max character limit
            if (contentLength > maxChars) {
                addTxt.value = addTxt.value.slice(0, maxChars); // Trim excess characters
            }

            const remaining = maxChars - addTxt.value.length;

            // Update character count
            if (charCountElement) {
                charCountElement.textContent = `Characters: ${addTxt.value.length}/${maxChars}`;
            }

            // Show warning if the character limit is close
            if (warningElement) {
                if (remaining <= warningThreshold && remaining > 0) {
                    warningElement.textContent = "You are approaching the character limit!";
                    warningElement.style.color = "orange";
                } else if (remaining === 0) {
                    warningElement.textContent = "You have reached the maximum character limit!";
                    warningElement.style.color = "red";
                } else {
                    warningElement.textContent = ""; // Clear the warning if under the threshold
                }
            }

            // Autosave logic
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                localStorage.setItem('autosaved_note', addTxt.value);
                showSaveStatus('Saved');
            }, 800);
        });
    }
});