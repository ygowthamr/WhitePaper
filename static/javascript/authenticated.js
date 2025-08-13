document.addEventListener("DOMContentLoaded", function () {
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
      console.log("Permission result:", permission);
      });
  }
  // Quill Editor Initialization
    // Get references to key elements
    const quill = new Quill("#addTxt", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ font: [] }, { size: [] }], // Font & Size
        ["bold", "italic", "underline", "strike"], // Formatting
        [{ color: [] }, { background: [] }], // Text Color & Background
        [{ script: "sub" }, { script: "super" }], // Subscript/Superscript
        [{ header: "1" }, { header: "2" }, "blockquote", "code-block"], // Headers, Quote, Code Block
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ], // Lists & Indentation
        [{ align: [] }], // Alignment
        ["link", "image", "video"], // Media (Links, Images, Videos)
        ["clean"], // Remove Formatting
      ],
    },
    placeholder: "Type your note here...",
    maxLength: 500,
  });
  // Voice recognition functionality
  const voiceBtn = document.getElementById('voice-btn');
  const statusSpan = document.getElementById('status');
  let recognition;
  let isListening = false;
  
  // Check if browser supports SpeechRecognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    // Initialize speech recognition
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Configure recognition
    recognition.lang = 'en-US'; // Change this to your preferred language
    
    // Handle results
    recognition.onresult = function(event) {
      const results = event.results;
      const transcript = results[results.length - 1][0].transcript;
      
      // Get current selection to determine where to insert text
      const range = quill.getSelection() || { index: quill.getLength(), length: 0 };
      
      if (results[results.length - 1].isFinal) {
        // Insert the final transcript at the current position
        quill.deleteText(range.index, range.length);
        quill.insertText(range.index, transcript + ' ', 'api');
        quill.setSelection(range.index + transcript.length + 1, 0);
      }
    };
    
    // Event handlers
    recognition.onstart = function() {
      statusSpan.textContent = 'Listening...';
      // Find the icon and change its class
      const voiceIcon = voiceBtn.querySelector('i');
      if (voiceIcon) {
          voiceIcon.className = 'fas fa-stop-circle'; 
      }
      isListening = true;
    };
    
    recognition.onend = function() {
      statusSpan.textContent = '';
      // Find the icon and change its class back
      const voiceIcon = voiceBtn.querySelector('i');
      if (voiceIcon) {
          voiceIcon.className = 'fas fa-microphone';
      }
      isListening = false;
    };
    
    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      statusSpan.textContent = 'Error: ' + event.error;
      // Find the icon and change its class back on error
      const voiceIcon = voiceBtn.querySelector('i');
      if (voiceIcon) {
          voiceIcon.className = 'fas fa-microphone'; 
      }
      isListening = false;
    };
    
    // Toggle voice recognition
    voiceBtn.addEventListener('click', function() {
      if (isListening) {
        recognition.stop();
      } else {
        // Focus the editor before starting recognition
        quill.focus();
        recognition.start();
      }
    });
  } else {
    // Browser doesn't support speech recognition
    voiceBtn.disabled = true;
    statusSpan.textContent = 'Speech recognition not supported in this browser.';
  }
  // Remove any existing click listeners first
  document
    .getElementById("addBtn")
    .replaceWith(document.getElementById("addBtn").cloneNode(true));
  const addBtn = document.getElementById("addBtn");

  const addTxt = document.getElementById("addTxt");
  const tagInput = document.getElementById("tagInput");
  const headingInput = document.getElementById("headingInput");
  const notesContainer = document.getElementById("notes");
  const charCount = document.getElementById("charCount");
  const charWarning = document.getElementById("charWarning");
  const tagFilter = document.getElementById("tagFilter");

  // Character Count and Limit
  quill.on("text-change", function () {
    const maxChars = 500;
    const currentLength = quill.getLength() - 1; // Subtract 1 to account for default newline

    charCount.textContent = `Characters: ${currentLength}/${maxChars}`;

    if (currentLength > maxChars) {
      quill.deleteText(maxChars, currentLength);
      charWarning.textContent = "Exceeded maximum character limit!";
      charWarning.style.color = "red";
    } else if (currentLength >= maxChars - 50) {
      charWarning.textContent = "Approaching character limit!";
      charWarning.style.color = "orange";
    } else {
      charWarning.textContent = "";
    }
  });
  // Character count and limit
  addTxt.addEventListener("input", function () {
    const maxChars = 500;
    const currentLength = addTxt.value.length;

    charCount.textContent = `Characters: ${currentLength}/${maxChars}`;

    if (currentLength > maxChars) {
      charWarning.textContent = "Exceeded maximum character limit!";
      addTxt.value = addTxt.value.slice(0, maxChars);
    } else {
      charWarning.textContent = "";
    }
  });

  // Tag Filter Functionality
  function updateTagFilter(tags) {
    tagFilter.innerHTML = '<option value="">All Notes</option>';
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });
  }

  // Fetch Notes with Optional Filtering
  function fetchNotes(filterTag = "") {
    let url = "/notes/getnotes/";
    if (filterTag) {
      url += `?tag=${encodeURIComponent(filterTag)}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        notesContainer.innerHTML = "";
        const allTags = new Set();

        if (data.notes && data.notes.length > 0) {
          data.notes.forEach((note, index) => {
            heading = note.heading;
            content = note.content;
            // Collect all tags
            note.tags.forEach((tag) => allTags.add(tag));

            const noteCard = document.createElement("div");
            noteCard.className = "note-card";
            noteCard.dataset.noteId = note.id;

            // Tags HTML
            const tagsHtml = note.tags
              .map((tag) => `<span class="note-tag">${tag}</span>`)
              .join("");

            noteCard.innerHTML = `
                        <div class="note-header" style="overflow: hidden;">
                            <i class="fas fa-sticky-note"></i>
                            <strong>${heading.trim()}</strong>
                            <div class="tags-container">${tagsHtml}</div>
                        </div>
                        <div class="note-content">
                            <p>${content.trim()}</p>
                        </div>
                        <div class="note-actions">

                        <button class="btn btn-outline print-btn" data-id="${
                          note.id
                        }"><i class="fas fa-print"></i> Print</button>

                        
                            <button class="copy-btn" data-note-id="${note.id}">
                                <i class="fas fa-copy"></i>
                            </button>

                            <button class="edit-btn" data-note-id="${
                              note.id
                            }">Edit</button>
                            <button class="delete-btn" data-note-id="${
                              note.id
                            }">Delete</button>
                            <button class="share-btn" data-note-id="${note.id}">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <div class="share-popup" id="share-popup-${
                              note.id
                            }">
                                <div class="share-popup-content">
                                    <button class="share-option twitter-share" style="background-color: #1DA1F2;" onclick="shareOnSocialMedia('twitter', '${
                                      note.content
                                    }', ${note.id})">
                                        <i class="fab fa-twitter"></i>
                                    </button>
                                    <button class="share-option linkedin-share" style="background-color: #0A66C2;" onclick="shareOnSocialMedia('linkedin', '${
                                      note.content
                                    }', ${note.id})">
                                        <i class="fab fa-linkedin-in"></i>
                                    </button>
                                    <button class="share-option whatsapp-share" style="background-color: #25D366;" onclick="shareOnSocialMedia('whatsapp', '${
                                      note.content
                                    }', ${note.id})">
                                        <i class="fab fa-whatsapp"></i>
                                    </button>
                                    <button class="share-option email-share" style="background-color: #EA4335;" onclick="shareOnSocialMedia('email', '${
                                      note.content
                                    }', ${note.id})">
                                        <i class="fas fa-envelope"></i>
                                    </button>
                                </div>
                                <div class="share-url-section">
            <h4>Long URL</h4>
            <div class="share-link-wrapper">
                <input type="text" class="share-link" id="long-url-${
                  note.id
                }" readonly>
                <button class="copy-link" onclick="copyShareLink(${
                  note.id
                }, 'long-url')">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            
            <h4>Short URL</h4>
            <div class="share-link-wrapper">
                <input type="text" class="share-link" id="short-url-${
                  note.id
                }" readonly>
                <button class="copy-link" onclick="copyShareLink(${
                  note.id
                }, 'short-url')">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
        
        <div class="qr-code-section">
            <img id="qr-code-${note.id}" alt="QR Code" width="150" height="150">
            <button class="download-qr" onclick="downloadQRCode(${note.id})">
                <i class="fas fa-download"></i> Download QR Code
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
      .catch((error) => {
        console.error("Error fetching notes:", error);
        notesContainer.innerHTML = `
                <div class="error-notes">
                    <p>Failed to load notes. Please try again later.</p>
                </div>
            `;
      });
  }

  // Add Note Functionality
  // Single event listener with conditional logic
  addBtn.addEventListener("click", function handleNoteAction() {
    if (this.dataset.editingNoteId) {
      // Update existing note logic
      const noteId = this.dataset.editingNoteId;
      const noteData = {
        heading: document.getElementById("headingInput").value.trim(),
        note: quill.root.innerHTML,
        tags: document
          .getElementById("tagInput")
          .value.split(",")
          .map((t) => t.trim()),
        reminder_at: document.getElementById("reminder_at").value
      };

      fetch(`/notes/updatenote/${noteId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(noteData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            resetForm();
            fetchNotes();
            console.log("Note saved with reminder:", noteData.reminder_at);
            if (noteData.reminder_at) {
              scheduleNotification(data.note?.id || noteId, noteData.heading, noteData.reminder_at);
            }
          }
        });
    } else {
      // Original add note logic
      const noteData = {
        heading: document.getElementById("headingInput").value.trim(),
        note: quill.root.innerHTML,
        tags: document
          .getElementById("tagInput")
          .value.split(",")
          .map((t) => t.trim()),
        reminder_at: document.getElementById("reminder_at").value
      };

      fetch("/notes/newnote/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(noteData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            resetForm();
            fetchNotes();
            console.log("Note saved with reminder:", noteData.reminder_at);
            // ✅ Schedule notification for this newly added note
            if (noteData.reminder_at) {
              scheduleNotification(data.note.id, noteData.heading, noteData.reminder_at);
            }
          }
        });
    }
  });
  // Add these utility functions
  async function generateShortUrl(longUrl) {
    try {
      const myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        "Bearer 3f61b16e159da58b7c6cece1b27133ab976aa781"
      );
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ long_url: longUrl }),
        redirect: "follow",
      };

      const response = await fetch(
        "https://api-ssl.bitly.com/v4/shorten",
        requestOptions
      );
      const result = await response.json();
      return result.link;
    } catch (error) {
      console.error("Error generating short URL:", error);
      return null;
    }
  }

    // Update the QR code generation function to include redirection and download
    function generateQRCode(url) {
        // Add parameters for error correction, format, and redirection
        const qrData = {
          url: url,
          downloadUrl: `${window.location.origin}/notes/download/${url.split('/').pop()}`,
          format: 'png'
        };
        
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}&ecc=H&format=png`;
      }

       // Function to handle QR code redirection
  function handleQRRedirect(noteId) {
    const noteUrl = `${window.location.origin}/notes/share/${noteId}/`;
    
    // First trigger the download
    fetch(`${window.location.origin}/notes/download/${noteId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then(response => {
      if (response.headers.get('Content-Type').includes('image/png')) {
        return response.blob();
      }
      throw new Error('Download failed');
    })
    .then(blob => {
      // Create download link for the image
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `note-${noteId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // After download, redirect to the note
      window.location.href = noteUrl;
    })
    .catch(error => {
      console.error('Error handling QR redirect:', error);
      // If download fails, still redirect to the note
      window.location.href = noteUrl;
    });
  }

  function resetForm() {
    document.getElementById("headingInput").value = "";
    quill.root.innerHTML = ""; // Reset Quill editor properly
    document.getElementById("tagInput").value = "";
    delete addBtn.dataset.editingNoteId;
    addBtn.innerHTML = `<i class="fas fa-plus"></i> Add Note`;
  }
  // Copy Note to Clipboard
  notesContainer.addEventListener("click", function (e) {
    if (e.target.closest(".copy-btn")) {
      const noteCard = e.target.closest(".note-card");
      //const heading = noteCard.querySelector('.note-header strong').textContent;
      const content = noteCard.querySelector(".note-content p").textContent;
      //const textToCopy = `${heading}\n\n${content}`;

      navigator.clipboard
        .writeText(content)
        .then(() => showToast("Note copied to clipboard!"))
        .catch((err) => showToast("Failed to copy note!", 3000));
    }
  });
  // Share functionality

 // Update the share popup content when displaying
notesContainer.addEventListener('click', async function(e) {
    if (e.target.closest('.share-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        const noteId = e.target.closest('.share-btn').dataset.noteId;
        const sharePopup = document.getElementById(`share-popup-${noteId}`);
        
        // Close all other open share popups
        document.querySelectorAll('.share-popup').forEach(popup => {
            if (popup !== sharePopup) {
                popup.classList.remove('active');
                popup.style.display = 'none';
            }
        });

        // Toggle current popup
        sharePopup.classList.toggle('active');
        sharePopup.style.display = sharePopup.classList.contains('active') ? 'block' : 'none';
        
        if (sharePopup.classList.contains('active')) {
            // Get the long URL for the note
            const longUrl = `${window.location.origin}/notes/share/${noteId}/`;
            const longUrlInput = document.getElementById(`long-url-${noteId}`);
            const shortUrlInput = document.getElementById(`short-url-${noteId}`);
            
            // Set the long URL
            if (longUrlInput) {
                longUrlInput.value = longUrl;
            }
            
            // Generate and set short URL
            try {
                const shortUrl = await generateShortUrl(longUrl);
                if (shortUrlInput && shortUrl) {
                    shortUrlInput.value = shortUrl;
                } else {
                    shortUrlInput.value = 'Could not generate short URL';
                }
            } catch (error) {
                console.error('Error generating short URL:', error);
                if (shortUrlInput) {
                    shortUrlInput.value = 'Error generating short URL';
                }
            }
            
            // Generate and set QR Code
            const qrCodeImg = document.getElementById(`qr-code-${noteId}`);
            if (qrCodeImg) {
                qrCodeImg.src = generateQRCode(longUrl);
                qrCodeImg.dataset.noteId = noteId;
                
                // Add click handler for QR code
                qrCodeImg.onclick = () => handleQRRedirect(noteId);
              }
        }
    }
});

  // Handle clicks inside share popup
  notesContainer.addEventListener("click", function (e) {
    if (e.target.closest(".share-popup")) {
      e.stopPropagation(); // Prevent popup from closing when clicking inside
    }
  });
  // Separate event listener for print functionality
  notesContainer.addEventListener("click", function (e) {
    if (e.target.closest(".print-btn")) {
      const printBtn = e.target.closest(".print-btn");
      const noteId = printBtn.dataset.id;

      // Fetch the specific note content before printing
      fetch(`/notes/printnote/${noteId}/`, {
        method: "GET",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((response) => {
          // if (!response.ok) {
          //     throw new Error('Network response was not ok');
          // }
          return response.json();
        })
        .then((data) => {
          if (data.success && data.note) {
            const note = data.note;
            // Open a new print window
            const printWindow = window.open("", "", "width=800,height=600");

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
                                        Created by: ${
                                          note.author || "Anonymous"
                                        }<br>
                                        Printed on: ${new Date().toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div class="note-content">${note.content}</div>
                                
                                ${
                                  note.tags && note.tags.length
                                    ? `
                                    <div class="tags-container">
                                        <div>Tags:</div>
                                        ${note.tags
                                          .map(
                                            (tag) =>
                                              `<span class="tag">${tag}</span>`
                                          )
                                          .join("")}
                                    </div>
                                `
                                    : ""
                                }
                            </body>
                        </html>
                    `);

            // Close document stream
            printWindow.document.close();

            // Print after content is loaded
            printWindow.onload = function () {
              printWindow.print();
              // Close the print window after a short delay
              setTimeout(() => printWindow.close(), 500);
            };
          } else {
            throw new Error("Note data not found in response");
          }
        })
        .catch((error) => {
          console.error("Error printing note:", error);
          showToast("Error: Failed to print note. Please try again.");
        });
    }
  });

  // Close share popup when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".share-popup") && !e.target.closest(".share-btn")) {
      document.querySelectorAll(".share-popup").forEach((popup) => {
        popup.classList.remove("active");
        popup.style.display = "none";
      });
    }
  });

  // Delete Note Functionality
  notesContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {
      const noteId = e.target.dataset.noteId;

      fetch(`/notes/deletenote/${noteId}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            fetchNotes(); // Refresh notes
          } else {
            console.error("Failed to delete note");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });

  // Edit Note Functionality
  notesContainer.addEventListener("click", function (e) {
    if (e.target.closest(".edit-btn")) {
      const noteId = e.target.closest(".edit-btn").dataset.noteId;
      const noteCard = e.target.closest(".note-card");
      let paragraphs;
      // Retrieve content
      const heading = noteCard.querySelector(".note-header strong").textContent;
      const contentElement = noteCard.querySelector(".note-content");
      if (contentElement) {
        // Select all <p> elements, remove empty ones, and join their innerHTML
        paragraphs = Array.from(contentElement.querySelectorAll("p"))
          .map((p) => p.innerHTML.trim()) // Get innerHTML and trim whitespace
          .filter((text) => text.length > 0) // Remove empty paragraphs
          .join("<br>"); // Keep paragraph spacing
      }
      const tags = Array.from(noteCard.querySelectorAll(".note-tag")).map(
        (tag) => tag.textContent
      );

      // Populate editor fields
      headingInput.value = heading;
      tagInput.value = tags.join(", ");
      quill.clipboard.dangerouslyPasteHTML(`<p>${paragraphs}</p>`);

      // Change button to update mode
      addBtn.innerHTML = `<i class="fas fa-save"></i> Update Note`;
      addBtn.dataset.editingNoteId = noteId;
    }
  });

  // Tag Filter Change Event
  tagFilter.addEventListener("change", function () {
    fetchNotes(this.value);
  });

  // CSRF Cookie retrieval
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
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
function scheduleNotification(noteId, heading, reminderAt) {
  const reminderTime = new Date(reminderAt).getTime();
  const now = Date.now();
  const delay = reminderTime - now;

  console.log("Scheduling notification in", delay / 1000, "seconds");

  if (delay > 0) {
    setTimeout(() => {
      console.log("Triggering notification for", heading);
      if (Notification.permission === "granted") {
        new Notification("Note Reminder", {
          body: heading || "You have a reminder!",
          icon: "/static/images/reminder-icon.png"
        });
      }
    }, delay);
  } else {
    console.log("Reminder time is in the past, skipping notification");
  }
}


// Toast notification function
function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Update the shareOnSocialMedia function to use selected URL type
async function shareOnSocialMedia(
  platform,
  content,
  noteId,
  urlType = "long-url"
) {
  const urlInput = document.getElementById(`${urlType}-${noteId}`);
  const shareUrl = urlInput.value;
  const encodedContent = encodeURIComponent(
    content.substring(0, 100) + (content.length > 100 ? "..." : "")
  );
  const encodedUrl = encodeURIComponent(shareUrl);

  let shareLink = "";

  switch (platform) {
    case "twitter":
      shareLink = `https://twitter.com/intent/tweet?text=${encodedContent}&url=${encodedUrl}`;
      break;
    case "linkedin":
      shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case "whatsapp":
      shareLink = `https://wa.me/?text=${encodedContent}%20${encodedUrl}`;
      break;
    case "email":
      shareLink = `mailto:?subject=Check out this note&body=${encodedContent}%0A%0A${encodedUrl}`;
      break;
  }

  window.open(shareLink, "_blank", "width=600,height=400");
}
function copyShareLink(noteId, urlType) {
  const input = document.getElementById(`${urlType}-${noteId}`);
  input.select();
  document.execCommand("copy");
  showToast(`${urlType.replace("-", " ").toUpperCase()} copied to clipboard!`);
}
 // Update the download QR code function with enhanced error handling
 function downloadQRCode(noteId) {
    const qrCodeImg = document.getElementById(`qr-code-${noteId}`);
    
    if (!qrCodeImg || !qrCodeImg.src) {
      showToast('Error: QR code not found!');
      return;
    }

    fetch(qrCodeImg.src)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `note-${noteId}-qr.png`;
        
        // Add download attributes and trigger download
        link.setAttribute('download', `note-${noteId}-qr.png`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        }, 100);
        
        showToast('QR Code downloaded successfully!');
      })
      .catch(error => {
        console.error('Error downloading QR code:', error);
        showToast('Failed to download QR code. Please try again.');
      });
  }

  // Add event listener for QR code scanning result
  window.addEventListener('message', function(event) {
    // Check if the message is from QR code scanning
    if (event.data && event.data.type === 'qr-scan') {
      try {
        const data = JSON.parse(event.data.content);
        if (data.url && data.downloadUrl) {
          const noteId = data.url.split('/').pop();
          handleQRRedirect(noteId);
        }
      } catch (error) {
        console.error('Error processing QR scan:', error);
      }
    }
  });