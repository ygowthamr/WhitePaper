let saveTimeout;

function getCSRFToken() {
    let cookie = document.cookie.match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)');
    return cookie ? cookie.pop() : '';
}

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

function autosave(noteId) {
    console.log("Auto-saving triggered...");

    const addTxt = document.getElementById('addTxt');
    const headingInput = document.getElementById('headingInput');
    const content = addTxt.value;
    const heading = headingInput.value;
    const noteTextArea = document.querySelector('.note-textarea');


    showSaveStatus('Saving...');

    fetch('/autosave/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: noteId,
            heading: heading,
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSaveStatus('Saved');
        } else {
            showSaveStatus('Error saving note');
        }
    })
    .catch(error => {
        showSaveStatus('Save failed');
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const maxChars = 500;
    const warningThreshold = 50;

    const addTxt = document.getElementById('addTxt');
    const headingInput = document.getElementById('headingInput');
    const charCountElement = document.getElementById('charCount');
    const warningElement = document.getElementById('charWarning');
    const noteId = document.getElementById('note-id')?.value;

    if (addTxt && headingInput && noteId) {
        addTxt.addEventListener('input', function () {
            // Enforce max character limit
            if (addTxt.value.length > maxChars) {
                addTxt.value = addTxt.value.slice(0, maxChars);
            }

            // Update character count
            if (charCountElement) {
                charCountElement.textContent = `Characters: ${addTxt.value.length}/${maxChars}`;
            }

            // Show warning
            if (warningElement) {
                const remaining = maxChars - addTxt.value.length;
                if (remaining <= warningThreshold && remaining > 0) {
                    warningElement.textContent = "You are approaching the character limit!";
                    warningElement.style.color = "orange";
                } else if (remaining === 0) {
                    warningElement.textContent = "You have reached the maximum character limit!";
                    warningElement.style.color = "red";
                } else {
                    warningElement.textContent = "";
                }
            }

            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => autosave(noteId), 800);
        });

        headingInput.addEventListener('input', function () {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => autosave(noteId), 800);
        });
    }
});
