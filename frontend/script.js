
function showForm(formId) {
    document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}

function accDrop() {
    document.getElementById("acc-set-items").classList.toggle("show");
}

const songSearch = document.getElementById("song-search");
const songResults = document.getElementById("song-results");
const songModal = document.getElementById("song-modal");
const songModalClose = document.getElementById("song-modal-close");
const songModalTitle = document.getElementById("song-modal-title");
const songModalAuthor = document.getElementById("song-modal-author");

function showSong(song) {
    songModalTitle.textContent = song.title;
    songModalAuthor.textContent = song.author ? `By ${song.author}` : "";
    songModal.hidden = false;

    document.dispatchEvent(new CustomEvent("song-selected", { detail: song }));
}

function closeSong() {
    songModal.hidden = true;
}

if (songSearch && songResults) {
    songSearch.addEventListener("input", async () => {
        const query = songSearch.value.trim();

        if (!query) {
            songResults.innerHTML = "";
            return;
        }

        try {
            const response = await fetch(`../backend/search-songs.php?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error("Song search failed");
            }

            const songs = await response.json();
            songResults.replaceChildren();

            if (songs.length === 0) {
                songResults.textContent = "No songs found.";
                return;
            }

            songs.forEach(song => {
                const result = document.createElement("button");
                result.type = "button";
                result.textContent = `${song.title} - ${song.author}`;
                result.addEventListener("click", () => showSong(song));
                songResults.appendChild(result);
            });
        } catch (error) {
            songResults.textContent = "Unable to search songs.";
        }
    });
}

if (songModalClose) {
    songModalClose.addEventListener("click", closeSong);
}

if (songModal) {
    songModal.addEventListener("click", event => {
        if (event.target === songModal) {
            closeSong();
        }
    });
}

window.onclick = function(event) {
    if (!event.target.matches('.accbtn')) {
        var dropdowns = document.getElementsByClassName("acc-set-items");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
