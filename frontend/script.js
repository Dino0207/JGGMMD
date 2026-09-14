
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
const songLibraryModal = document.getElementById("song-library-modal");
const songLibraryClose = document.getElementById("song-library-close");
const songLibraryList = document.getElementById("song-library-list");
const setlistContainer = document.getElementById("setlist-container");
const newSetlistButton = document.getElementById("new-setlist");
const newSetlistModal = document.getElementById("new-setlist-modal");
const newSetlistModalClose = document.getElementById("new-setlist-modal-close");
const newSetlistForm = document.getElementById("new-setlist-form");
const newSetlistNameInput = document.getElementById("new-setlist-name");
const newSetlistMessage = document.getElementById("new-setlist-message");
const setlistModal = document.getElementById("setlist-modal");
const setlistModalClose = document.getElementById("setlist-modal-close");
const setlistModalTitle = document.getElementById("setlist-modal-title");
const setlistRenameForm = document.getElementById("setlist-rename-form");
const setlistNameInput = document.getElementById("setlist-name");
const setlistModalSongs = document.getElementById("setlist-modal-songs");
const setlistSongSearch = document.getElementById("setlist-song-search");
const setlistSongResults = document.getElementById("setlist-song-results");
const deleteSetlistButton = document.getElementById("delete-setlist");
const songsNavToggle = document.getElementById("songs-nav-toggle");
const songsNavMenu = document.getElementById("songs-nav-menu");
const accountNavToggle = document.getElementById("account-nav");
const accountNavMenu = document.getElementById("account-nav-menu");
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const accountModal = document.getElementById("account-modal");
const accountModalClose = document.getElementById("account-modal-close");
const accountModalTitle = document.getElementById("account-modal-title");
const accountMessage = document.getElementById("account-message");
const profileImage = document.getElementById("profile-image");
const profileImageInput = document.getElementById("profile-image-input");
const profileImageMessage = document.getElementById("profile-image-message");
const songEditor = document.getElementById("song-editor");
const songEditorForm = document.getElementById("song-editor-form");
const songEditorTitle = document.getElementById("song-editor-title");
const songEditorSubmit = document.getElementById("song-editor-submit");
const songEditorCancel = document.getElementById("song-editor-cancel");
const songEditorMessage = document.getElementById("song-editor-message");
const songIdInput = document.getElementById("song-id");
const songIdLabel = document.getElementById("song-id-label");
const songTitleInput = document.getElementById("song-title");
const songAuthorInput = document.getElementById("song-author");
const songLyricsInput = document.getElementById("song-lyrics");
let loadedSetlists = [];
let activeSetlistId = null;
let songEditorMode = "add";
let activeSetlist = null;

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
    if (setlistModal && !setlistModal.hidden && activeSetlist) {
        activeSetlist = loadedSetlists.find(setlist => Number(setlist.id) === Number(activeSetlist.id)) || null;
        if (activeSetlist) {
            setlistModalTitle.textContent = activeSetlist.name;
            setlistNameInput.value = activeSetlist.name;
            renderSetlistModalSongs();
        }
    }
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
        card.innerHTML = `<div class="setlist-heading"><div><h3></h3><p class="setlist-owner"></p></div><span class="setlist-hint">Click to Manage</span></div><div class="setlist-songs"></div>`;
        card.querySelector("h3").textContent = setlist.name;
        card.querySelector(".setlist-owner").textContent = `Made by ${setlist.username}`;
        const songs = card.querySelector(".setlist-songs");
        if (!setlist.songs.length) {
            songs.innerHTML = "<p class=\"empty-setlist-songs\">No songs in this setlist.</p>";
        }
        setlist.songs.forEach(song => {
            const row = document.createElement("div");
            row.className = "setlist-song";
            row.innerHTML = "<button type=\"button\" class=\"song-link setlist-song-link\"><span class=\"setlist-song-title\"></span><span class=\"setlist-song-author\"></span></button>";
            row.querySelector(".setlist-song-title").textContent = song.title;
            row.querySelector(".setlist-song-author").textContent = song.author;
            row.querySelector(".setlist-song-link").addEventListener("click", event => {
                event.stopPropagation();
                showSong(song);
            });
            songs.appendChild(row);
        });
        card.addEventListener("click", () => openSetlistModal(setlist.id));
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
    newSetlistButton.addEventListener("click", () => {
        newSetlistForm.reset();
        newSetlistMessage.textContent = "";
        newSetlistModal.hidden = false;
        newSetlistNameInput.focus();
    });
}

if (newSetlistModalClose) newSetlistModalClose.addEventListener("click", () => { newSetlistModal.hidden = true; });

if (newSetlistForm) {
    newSetlistForm.addEventListener("submit", async event => {
        event.preventDefault();
        try {
            await updateSetlists("POST", { name: newSetlistNameInput.value.trim() });
            newSetlistModal.hidden = true;
        } catch (error) {
            newSetlistMessage.textContent = error.message;
        }
    });
}

function openSetlistModal(setlistId) {
    activeSetlist = loadedSetlists.find(setlist => Number(setlist.id) === Number(setlistId));
    if (!activeSetlist || !setlistModal) return;
    activeSetlistId = activeSetlist.id;
    setlistModalTitle.textContent = activeSetlist.name;
    setlistNameInput.value = activeSetlist.name;
    renderSetlistModalSongs();
    setlistSongSearch.value = "";
    setlistSongResults.replaceChildren();
    setlistModal.hidden = false;
}

function renderSetlistModalSongs() {
    setlistModalSongs.replaceChildren();
    if (!activeSetlist.songs.length) {
        setlistModalSongs.innerHTML = "<p class=\"empty-setlist-songs\">No songs in this setlist.</p>";
        return;
    }
    activeSetlist.songs.forEach(song => {
        const row = document.createElement("div");
        row.className = "setlist-song";
        row.innerHTML = "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" class=\"remove-song\">Remove</button>";
        row.querySelector(".song-link").textContent = `${song.title} - ${song.author}`;
        row.querySelector(".song-link").addEventListener("click", () => {
            setlistModal.hidden = true;
            showSong(song);
        });
        row.querySelector(".remove-song").addEventListener("click", () => updateSetlists("DELETE", { setlist_id: activeSetlist.id, song_id: song.id }).catch(showSetlistError));
        setlistModalSongs.appendChild(row);
    });
}

async function loadSongLibrary() {
    const response = await fetch("../backend/search-songs.php?q=");
    if (!response.ok) throw new Error("Unable to load songs.");
    const songs = await response.json();
    songLibraryList.replaceChildren();
    if (!songs.length) {
        songLibraryList.innerHTML = "<p>No songs available.</p>";
        return;
    }
    songs.forEach(song => {
        const row = document.createElement("div");
        row.className = "song-library-row";
        row.innerHTML = "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" data-song-edit>Edit</button><button type=\"button\" data-song-delete>Delete</button>";
        row.querySelector(".song-link").textContent = `${song.title} - ${song.author}`;
        row.querySelector(".song-link").addEventListener("click", () => {
            songLibraryModal.hidden = true;
            showSong(song);
        });
        row.querySelector("[data-song-edit]").addEventListener("click", () => {
            songLibraryModal.hidden = true;
            openSongEditor("edit", song);
        });
        row.querySelector("[data-song-delete]").addEventListener("click", () => {
            songLibraryModal.hidden = true;
            openSongEditor("delete", song);
        });
        songLibraryList.appendChild(row);
    });
}

function openSongEditor(mode, song = null) {
    songEditorMode = mode;
    songEditor.hidden = false;
    songEditorTitle.textContent = mode === "add" ? "Add song" : `${mode[0].toUpperCase()}${mode.slice(1)} song`;
    songEditorSubmit.textContent = mode === "delete" ? "Delete song" : mode === "add" ? "Save song" : "Update song";
    songIdInput.required = mode !== "add";
    songTitleInput.required = mode !== "delete";
    songAuthorInput.required = mode !== "delete";
    songLyricsInput.required = mode !== "delete";
    songEditorMessage.textContent = "";
    songIdLabel.hidden = mode === "add";
    songIdInput.hidden = mode === "add";
    if (song) {
        songIdInput.value = song.id;
        songTitleInput.value = song.title;
        songAuthorInput.value = song.author;
        songLyricsInput.value = song.lyrics;
    }
    if (mode === "add") {
        songEditorForm.reset();
        songIdInput.required = false;
    }
    songTitleInput.disabled = mode === "delete";
    songAuthorInput.disabled = mode === "delete";
    songLyricsInput.disabled = mode === "delete";
    songEditor.scrollIntoView({ behavior: "smooth", block: "center" });
}

function closeNavigationMenus() {
    songsNavMenu.classList.remove("show");
    accountNavMenu.classList.remove("show");
    songsNavToggle.setAttribute("aria-expanded", "false");
    accountNavToggle.setAttribute("aria-expanded", "false");
}

if (songsNavToggle) {
    songsNavToggle.addEventListener("click", event => {
        event.stopPropagation();
        const open = !songsNavMenu.classList.contains("show");
        closeNavigationMenus();
        songsNavMenu.classList.toggle("show", open);
        songsNavToggle.setAttribute("aria-expanded", String(open));
    });
}

function openAccountModal(action) {
    accountModalTitle.textContent = action === "password" ? "Change password" : "Change email";
    accountMessage.textContent = "";
    document.querySelectorAll("[data-account-form]").forEach(form => {
        form.hidden = form.dataset.accountForm !== action;
        if (!form.hidden) form.reset();
    });
    accountModal.hidden = false;
}

if (accountNavToggle) {
    accountNavToggle.addEventListener("click", event => {
        event.stopPropagation();
        const open = !accountNavMenu.classList.contains("show");
        closeNavigationMenus();
        accountNavMenu.classList.toggle("show", open);
        accountNavToggle.setAttribute("aria-expanded", String(open));
    });
}

if (hamburger) {
    hamburger.addEventListener("click", () => {
        const open = navMenu.classList.toggle("show");
        closeNavigationMenus();
        hamburger.classList.toggle("active", open);
        hamburger.setAttribute("aria-expanded", String(open));
    });
}

document.querySelectorAll("[data-account-action]").forEach(button => {
    button.addEventListener("click", async () => {
        if (button.dataset.accountAction === "logout") {
            closeNavigationMenus();
            try {
                const response = await fetch("../backend/account.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "logout" })
                });
                if (!response.ok) throw new Error("Logout failed.");
                window.location.href = "index.php";
            } catch (error) {
                accountMessage.textContent = error.message;
            }
            return;
        }
        openAccountModal(button.dataset.accountAction);
        closeNavigationMenus();
    });
});

document.querySelectorAll("[data-account-form]").forEach(form => {
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const action = form.dataset.accountForm;
        const payload = action === "password"
            ? { action, current_password: document.getElementById("current-password").value, new_password: document.getElementById("new-password").value, confirm_password: document.getElementById("confirm-password").value }
            : { action, current_password: document.getElementById("email-password").value, email: document.getElementById("new-email").value.trim() };
        try {
            const response = await fetch("../backend/account.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Account update failed.");
            accountMessage.textContent = data.message;
            form.reset();
        } catch (error) {
            accountMessage.textContent = error.message;
        }
    });
});

if (accountModalClose) accountModalClose.addEventListener("click", () => { accountModal.hidden = true; });

if (profileImageInput) {
    const savedImage = localStorage.getItem("jggm-profile-image");
    if (savedImage) {
        profileImage.src = savedImage;
    }
    profileImageInput.addEventListener("change", () => {
        const file = profileImageInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            profileImage.src = reader.result;
            localStorage.setItem("jggm-profile-image", reader.result);
            profileImageMessage.textContent = "Profile image updated.";
        });
        reader.readAsDataURL(file);
    });
}

document.querySelectorAll("[data-song-action]").forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.songAction === "view") {
            loadSongLibrary().then(() => { songLibraryModal.hidden = false; }).catch(error => { songLibraryList.textContent = error.message; });
        } else {
            openSongEditor(button.dataset.songAction);
        }
        closeNavigationMenus();
    });
});

if (songEditorCancel) {
    songEditorCancel.addEventListener("click", () => {
        songEditor.hidden = true;
        songEditorForm.reset();
    });
}

if (songLibraryClose) songLibraryClose.addEventListener("click", () => { songLibraryModal.hidden = true; });
if (setlistModalClose) setlistModalClose.addEventListener("click", () => { setlistModal.hidden = true; });

if (setlistRenameForm) {
    setlistRenameForm.addEventListener("submit", async event => {
        event.preventDefault();
        await updateSetlists("PUT", { setlist_id: activeSetlist.id, name: setlistNameInput.value.trim() }).catch(showSetlistError);
        if (activeSetlist) openSetlistModal(activeSetlist.id);
    });
}

if (deleteSetlistButton) {
    deleteSetlistButton.addEventListener("click", async () => {
        if (!activeSetlist || !window.confirm(`Delete ${activeSetlist.name}?`)) return;
        await updateSetlists("DELETE", { setlist_id: activeSetlist.id }).catch(showSetlistError);
        setlistModal.hidden = true;
    });
}

if (setlistSongSearch) {
    setlistSongSearch.addEventListener("input", async () => {
        const query = setlistSongSearch.value.trim();
        setlistSongResults.replaceChildren();
        if (!query || !activeSetlist) return;
        const response = await fetch(`../backend/search-songs.php?q=${encodeURIComponent(query)}`);
        const songs = await response.json();
        songs.forEach(song => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = `Add ${song.title} - ${song.author}`;
            button.addEventListener("click", () => updateSetlists("POST", { setlist_id: activeSetlist.id, song_id: song.id }).catch(showSetlistError));
            setlistSongResults.appendChild(button);
        });
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

[songLibraryModal, setlistModal, newSetlistModal].forEach(modal => {
    if (modal) modal.addEventListener("click", event => {
        if (event.target === modal) modal.hidden = true;
    });
});

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
        closeNavigationMenus();
    }
    if (navMenu && !event.target.closest('.navbar')) {
        navMenu.classList.remove('show');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
}
