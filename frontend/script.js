
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
const setlistContainer = document.getElementById("setlist-container");
const newSetlistButton = document.getElementById("new-setlist");
const songsNavToggle = document.getElementById("songs-nav-toggle");
const songsNavMenu = document.getElementById("songs-nav-menu");
const songEditor = document.getElementById("song-editor");
const songEditorForm = document.getElementById("song-editor-form");
const songEditorTitle = document.getElementById("song-editor-title");
const songEditorSubmit = document.getElementById("song-editor-submit");
const songEditorCancel = document.getElementById("song-editor-cancel");
const songEditorMessage = document.getElementById("song-editor-message");
const songIdInput = document.getElementById("song-id");
const songTitleInput = document.getElementById("song-title");
const songAuthorInput = document.getElementById("song-author");
const songLyricsInput = document.getElementById("song-lyrics");
let loadedSetlists = [];
let activeSetlistId = null;
let songEditorMode = "add";

function showSong(song) {
    songModalTitle.textContent = song.title;
    songModalAuthor.textContent = song.author ? `By ${song.author}` : "";
    songModal.hidden = false;

    document.dispatchEvent(new CustomEvent("song-selected", { detail: song }));
}

function closeSong() {
    songModal.hidden = true;
}

async function updateSetlists(method = "GET", body = {}) {
    const response = await fetch("../backend/setlists.php", {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "GET" ? undefined : JSON.stringify(body)
    });
    if (response.status === 401) {
        window.location.href = "index.php";
        return;
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Setlist request failed");
    loadedSetlists = data;
    renderSetlists(data);
}

function renderSetlists(setlists) {
    if (!setlistContainer) return;
    setlistContainer.replaceChildren();
    if (!setlists.length) {
        setlistContainer.innerHTML = "<p class=\"empty-setlists\">No setlists yet. Create one to get started.</p>";
        return;
    }

    setlists.forEach(setlist => {
        const card = document.createElement("article");
        card.className = "setlist-items";
        card.innerHTML = `<div class="setlist-heading"><div><h3></h3><p class="setlist-owner"></p></div><div class="setlist-actions"><button type="button" data-action="add">Add song</button><button type="button" data-action="edit">Edit</button><button type="button" data-action="delete">Delete</button></div></div><div class="setlist-songs"></div><button type="button" class="open-setlist">Open setlist</button>`;
        card.querySelector("h3").textContent = setlist.name;
        card.querySelector(".setlist-owner").textContent = `Made by ${setlist.username}`;
        const songs = card.querySelector(".setlist-songs");
        setlist.songs.forEach(song => {
            const row = document.createElement("div");
            row.className = "setlist-song";
            row.innerHTML = "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" class=\"remove-song\" aria-label=\"Remove song\">&times;</button>";
            row.querySelector(".song-link").textContent = `${song.title} - ${song.author}`;
            row.querySelector(".song-link").addEventListener("click", () => showSong(song));
            row.querySelector(".remove-song").addEventListener("click", () => updateSetlists("DELETE", { setlist_id: setlist.id, song_id: song.id }).catch(showSetlistError));
            songs.appendChild(row);
        });
        card.querySelector(".open-setlist").addEventListener("click", () => card.classList.toggle("is-open"));
        card.querySelector('[data-action="add"]').addEventListener("click", () => {
            activeSetlistId = setlist.id;
            if (songSearch) {
                songSearch.focus();
                songSearch.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
        card.querySelector('[data-action="edit"]').addEventListener("click", async () => {
            const name = window.prompt("Setlist name", setlist.name);
            if (name) await updateSetlists("PUT", { setlist_id: setlist.id, name }).catch(showSetlistError);
        });
        card.querySelector('[data-action="delete"]').addEventListener("click", async () => {
            if (window.confirm(`Delete ${setlist.name}?`)) await updateSetlists("DELETE", { setlist_id: setlist.id }).catch(showSetlistError);
        });
        setlistContainer.appendChild(card);
    });
}

function showSetlistError(error) {
    setlistContainer.textContent = error.message;
}

if (setlistContainer) {
    updateSetlists().catch(showSetlistError);
}

if (newSetlistButton) {
    newSetlistButton.addEventListener("click", async () => {
        const name = window.prompt("Setlist name");
        if (name) await updateSetlists("POST", { name }).catch(showSetlistError);
    });
}

function openSongEditor(mode) {
    songEditorMode = mode;
    songEditor.hidden = false;
    songEditorTitle.textContent = mode === "add" ? "Add song" : `${mode[0].toUpperCase()}${mode.slice(1)} song`;
    songEditorSubmit.textContent = mode === "delete" ? "Delete song" : mode === "add" ? "Save song" : "Update song";
    songIdInput.required = mode !== "add";
    songTitleInput.required = mode !== "delete";
    songAuthorInput.required = mode !== "delete";
    songLyricsInput.required = mode !== "delete";
    songEditorMessage.textContent = "";
    if (mode === "add") {
        songEditorForm.reset();
        songIdInput.required = false;
    }
    songTitleInput.disabled = mode === "delete";
    songAuthorInput.disabled = mode === "delete";
    songLyricsInput.disabled = mode === "delete";
    songEditor.scrollIntoView({ behavior: "smooth", block: "center" });
}

if (songsNavToggle) {
    songsNavToggle.addEventListener("click", event => {
        event.stopPropagation();
        const open = songsNavMenu.classList.toggle("show");
        songsNavToggle.setAttribute("aria-expanded", String(open));
    });
}

document.querySelectorAll("[data-song-action]").forEach(button => {
    button.addEventListener("click", () => {
        openSongEditor(button.dataset.songAction);
        songsNavMenu.classList.remove("show");
        songsNavToggle.setAttribute("aria-expanded", "false");
    });
});

if (songEditorCancel) {
    songEditorCancel.addEventListener("click", () => {
        songEditor.hidden = true;
        songEditorForm.reset();
    });
}

if (songEditorForm) {
    songEditorForm.addEventListener("submit", async event => {
        event.preventDefault();
        const payload = {
            id: Number(songIdInput.value),
            title: songTitleInput.value.trim(),
            author: songAuthorInput.value.trim(),
            lyrics: songLyricsInput.value.trim()
        };
        const method = songEditorMode === "add" ? "POST" : songEditorMode === "edit" ? "PUT" : "DELETE";
        try {
            const response = await fetch("../backend/songs.php", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Song request failed");
            songEditorMessage.textContent = songEditorMode === "delete" ? "Song deleted." : "Song saved.";
            songEditorForm.reset();
            if (songSearch.value.trim()) songSearch.dispatchEvent(new Event("input"));
        } catch (error) {
            songEditorMessage.textContent = error.message;
        }
    });
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
                const result = document.createElement("div");
                result.className = "song-result";
                const open = document.createElement("button");
                open.type = "button";
                open.textContent = `${song.title} - ${song.author}`;
                open.addEventListener("click", () => showSong(song));
                result.appendChild(open);
                if (setlistContainer) {
                    const add = document.createElement("button");
                    add.type = "button";
                    add.textContent = "Add to setlist";
                    add.addEventListener("click", async event => {
                        event.stopPropagation();
                        if (!loadedSetlists.length) {
                            showSetlistError(new Error("Create a setlist before adding songs."));
                            return;
                        }
                        const options = loadedSetlists.map(setlist => `${setlist.id}: ${setlist.name}`).join("\n");
                        const selected = activeSetlistId || window.prompt(`Add to which setlist?\n${options}`, String(loadedSetlists[0].id));
                        const setlistId = Number(selected);
                        if (!setlistId) return;
                        try {
                            await updateSetlists("POST", { setlist_id: setlistId, song_id: Number(song.id) });
                        } catch (error) {
                            showSetlistError(error);
                        }
                    });
                    result.appendChild(add);
                }
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
    if (songsNavMenu && !event.target.closest('.nav-menu')) {
        songsNavMenu.classList.remove('show');
        songsNavToggle.setAttribute('aria-expanded', 'false');
    }
}
