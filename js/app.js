const micro = document.querySelector("#micro");
const output = document.querySelector("#output");
const showVoice = document.querySelector("#showVoice");

micro.addEventListener("click", listeningFunction);
showVoice.addEventListener("click", deleteVoice);

let open = new Audio("sounds/open.wav");
let closed = new Audio("sounds/closed.wav");

let voice = {};
let recordings = [];

document.addEventListener("DOMContentLoaded", () => {
    recordings = JSON.parse(localStorage.getItem("notes")) || [];
    printVoice(recordings);
})

function listeningFunction() {
    const SpeechRecognition = webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.start();

    recognition.onstart = function() {
        output.textContent = "Your voice is being recorded";
        output.className = "py-2 px-3 text-white font-bold rounded my-2 text-xl bg-green-500 text-center";
        open.play();
    };

    recognition.onspeechend = function() {
        closed.play();
        output.textContent = "The recording has stopped";
        recognition.stop();
    }

    recognition.onresult = function(e) {
        const { confidence, transcript } = e.results[0][0];
        voice = {
            confidence: confidence,
            transcript: transcript,
            id: Date.now(),
            date: moment().format('LLL')
        }

        recordings.unshift(voice);
        printVoice(recordings);

        setTimeout(() => {
            output.classList.add("hidden")
        }, 4000);
    }
}

function printVoice(recordings) {
    cleanHTML();
    recordings.map( recorded => {
        const { confidence, transcript, id, date } = recorded;
        const idea = document.createElement("div")
        idea.className = "bg-green-500 rounded py-2 px-3 text-white mt-2 shadow-xl"
        idea.innerHTML = `
            <p class="text-sm text-right mb-2 font-bold">${date}</p>
            <div class="bg-gray-200 rounded text-green-600 p-2 mb-2 text-lg font-bold flex justify-between">
                <p>${transcript}</p>
                <a href="#" data-voice="${id}" class="text-red-500 cursor-pointer font-bol text-xl delete">X</a>
            </div>
            <p class="text-center uppercase text-sm">Confidence: ${confidence}</p>
        `
        showVoice.appendChild(idea);
    })
    addLocalStorage();
}

function deleteVoice(e) {
    if(e.target.classList.contains("delete")){
        const idDelete = Number(e.target.dataset.voice);
        swal.fire({
            title: "Do you want delete this voice note?",
            color: "rgb(6 182 212)",
            icon: "question",
            iconColor: "rgb(6 182 212)",
            showDenyButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "rgb(239 68 68)",
            denyButtonText: "Don't delete",
            denyButtonColor: "rgb(34 197 94)"
        }).then((result) => {
            if(result.isConfirmed) {
                deleteVoiceHTML(idDelete);
                Swal.fire({
                    title: "You just deleted voice note",
                    color: "rgb(6 182 212)",
                    icon: "info",
                    iconColor: "rgb(6 182 212)",
                    showConfirmButton: false,
                    timer: 2000,
                })
            }else {
                Swal.fire({
                    title: "Voice note saved!",
                    color: "rgb(6 182 212)",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                })
            }
        })
    };
}

function addLocalStorage() {
    localStorage.setItem("notes", JSON.stringify(recordings));
}

function deleteVoiceHTML (id) {
    recordings = recordings.filter( voice => voice.id !== id);
    printVoice(recordings);
}

function cleanHTML () {
    while( showVoice.firstChild ) {
        showVoice.removeChild( showVoice.firstChild );
    }
}