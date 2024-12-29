showNotes();
let addBtn = document.getElementById('addBtn');
console.log("hello world...");
addBtn.addEventListener("click", function (e) {
    console.log("hello world...");
    let addTxt = document.getElementById("addTxt");
    let notes = localStorage.getItem("notes");
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
})

function showNotes() {
    let notes = localStorage.getItem("notes");
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
            // <span onclick="checkIndex()">Read More</span> 
    });
    let notesElm = document.getElementById("notes");
    if (notesObj.length != 0) {
        notesElm.innerHTML = html;
    } else {
        notesElm.innerHTML = `Nothing to show! Use "Add a Note"
        section above to add notes`;
    }
}

// To delete note

function deleteNote(index) {
    let notes = localStorage.getItem("notes");
    if (notes == null) {
        notesObj = [];
    } else {
        notesObj = JSON.parse(notes);
    }

    notesObj.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notesObj));
    showNotes();
}

// To search function

let search = document.getElementById('searchTxt');
search.addEventListener('input', function () {
    let inputVal = search.value.toLowerCase();
    console.log('Input event fired!', inputVal);
    let noteCards = document.getElementsByClassName('cards');
    Array.from(noteCards).forEach(function (element) {
        let cardTxt = element.getElementsByTagName("p")[0].innerText;
        if (cardTxt.includes(inputVal)) {
            element.style.display = "inline-block";
        }
        else {
            element.style.display = "none";
        }
        // console.log(cardTxt);
    });
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

console.log("hello world...");