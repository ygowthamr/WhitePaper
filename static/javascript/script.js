showNotes();
let addBtn = document.getElementById('addBtn');
let addTxt = document.getElementById('addTxt');
// Restict user to add empty note
addBtn.addEventListener("click", function (e) {
    if (addTxt.value.trim() === "") {
        addTxt.style.color = "#6c757d"; // Dark grey color for the placeholder text
        return; // Do nothing if the input is empty
    }

    let notes = localStorage.getItem("notes");
    let notesObj;
    if (notes == null) {
        notesObj = [];
    } else {
        notesObj = JSON.parse(notes);
    }

    notesObj.push(addTxt.value);
    localStorage.setItem("notes", JSON.stringify(notesObj));
    addTxt.value = "";
    console.log(notesObj);
    showNotes();
});
// To show notes
function showNotes() {
    let notes = localStorage.getItem("notes");
    let notesObj;
    if (notes == null) {
        notesObj = [];
    } else {
        notesObj = JSON.parse(notes);
    }
    let html = "";
    notesObj.forEach(function (element, index) {
        html +=
            `<div class="cards">
                <div class="title">Note ${index + 1}</div>
                <div class="cardtxt">
                    <span>${element}</span>
                </div>
                <i class="fas fa-trash-alt"  id="${index}" onclick="deleteNote(this.id)"></i>
            </div>`;
    });
    let notesElm = document.getElementById("notes");
    if (notesObj.length != 0) {
        notesElm.innerHTML = html;
    } else {
        notesElm.innerHTML = `Nothing to show! Use "Add a Note"
        section above to add notes`;
    }
}
// To delete a note
function deleteNote(index) {
    let notes = localStorage.getItem("notes");
    let notesObj;
    if (notes == null) {
        notesObj = [];
    } else {
        notesObj = JSON.parse(notes);
    }

    notesObj.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notesObj));
    showNotes();
}
// To search notes
let search = document.getElementById('searchTxt');
search.addEventListener('input', function () {
    let inputVal = search.value.toLowerCase();
    console.log('Input event fired!', inputVal);
    let noteCards = document.getElementsByClassName('cards');
    let noResult = true;
    Array.from(noteCards).forEach(function (element) {
        let cardTxt = element.getElementsByTagName("span")[0].innerText;
        if (cardTxt.toLowerCase().includes(inputVal)) {
            element.style.display = "inline-block";
            noResult = false;
        }
        else {
            element.style.display = "none";
        }
    });

    // Show "No results found" message dynamically
    let noResultMessage = document.getElementById("noResultMessage");
    if (!noResultMessage) {
        // Create the "No results found" element if it doesn't exist
        noResultMessage = document.createElement("p");
        noResultMessage.id = "noResultMessage";
        noResultMessage.style.textAlign = "center";
        noResultMessage.style.color = "red";
        noResultMessage.innerText = "No results found!";
        document.getElementById("notes").appendChild(noResultMessage);
    }

    if (noResult) {
        noResultMessage.style.display = "block";
    } else {
        noResultMessage.style.display = "none";
    }
});

// // Content box to show full content

// function checkIndex(element, index) {
//     let contentBox = document.getElementById("content-box");
//     let contentHtml = "";
//     contentHtml += `<div class="content-box" id="content-box">
//     <div class="title-cross">
//         <div class="content-title">Note ${index}</div>
//         <i class="fas fa-times" id="hide"></i>
//     </div>
//         <div class="content-txt">${element}</div>
//     </div>`
//     contentBox.style.visibility = "visible";
//     console.log(index);

//     // hide content box
//     let hide = document.getElementById("hide");
//     hide.addEventListener("click", () => {
//         let contentBox = document.getElementById("content-box");
//         contentBox.style.visibility = "hidden";
//     })
// }

// console.log("hello world...");

document.querySelector('form').addEventListener('submit', function (event) {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm_password')?.value.trim(); 

    if (!email || !password || (confirmPassword !== undefined && !confirmPassword)) {
        alert('All fields are required.');
        event.preventDefault();
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
        alert('Passwords do not match.');
        event.preventDefault();
    }
});
