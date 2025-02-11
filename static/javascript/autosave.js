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

document.addEventListener('DOMContentLoaded', function () {
    const maxChars = 500; // Maximum character limit for note content
    const warningThreshold = 50; // Threshold to show warning
    const addTxt = document.getElementById('addTxt');
    const headingInput = document.getElementById('headingInput'); 
    const charCountElement = document.getElementById('charCount');
    const warningElement = document.getElementById('charWarning');
    let saveTimeout;

    if (addTxt && headingInput) {
        // Restore autosaved content if available
        const savedHeading = localStorage.getItem('autosaved_heading');
        const savedContent = localStorage.getItem('autosaved_note');
        if (savedHeading) headingInput.value = savedHeading;
        if (savedContent) addTxt.value = savedContent;

        // Autosave on input for note content and heading
        function autosave() {
            localStorage.setItem('autosaved_heading', headingInput.value);
            localStorage.setItem('autosaved_note', addTxt.value);
            showSaveStatus('Saved');
        }

        addTxt.addEventListener('input', function () {
            // Enforce max character limit for note content
            if (addTxt.value.length > maxChars) {
                addTxt.value = addTxt.value.slice(0, maxChars);
            }
            // Update character count display
            if (charCountElement) {
                charCountElement.textContent = `Characters: ${addTxt.value.length}/${maxChars}`;
            }
            // Show warning if close to limit
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
            saveTimeout = setTimeout(autosave, 800);
        });

        headingInput.addEventListener('input', function () {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(autosave, 800);
        });
    }
});