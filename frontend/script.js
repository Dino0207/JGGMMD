
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
const songLibrarySearch = document.getElementById("song-library-search");
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
const profileImageRemove = document.getElementById("profile-image-remove");
const profileImageMessage = document.getElementById("profile-image-message");
const profileCropModal = document.getElementById("profile-crop-modal");
const profileCropImage = document.getElementById("profile-crop-image");
const profileCropFrame = document.getElementById("profile-crop-frame");
const profileCropZoom = document.getElementById("profile-crop-zoom-input");
const profileCropClose = document.getElementById("profile-crop-close");
const profileCropCancel = document.getElementById("profile-crop-cancel");
const profileCropApply = document.getElementById("profile-crop-apply");
const songEditor = document.getElementById("song-editor");
const songEditorForm = document.getElementById("song-editor-form");
const songEditorTitle = document.getElementById("song-editor-title");
const songEditorSubmit = document.getElementById("song-editor-submit");
const songEditorCancel = document.getElementById("song-editor-cancel");
const songEditorMessage = document.getElementById("song-editor-message");
const songTitleInput = document.getElementById("song-title");
const songAuthorInput = document.getElementById("song-author");
const songLyricsInput = document.getElementById("song-lyrics");
let loadedSetlists = [];
let activeSetlistId = null;
let songEditorMode = "add";
let activeSetlist = null;
let activeSongId = null;
const isSinger = document.body.dataset.role === "singer";

function showSong(song) {
    songModalTitle.textContent = song.title;
    songModalAuthor.textContent = song.author ? `By ${song.author}` : "";
    songModal.hidden = false;

    document.querySelectorAll("[data-song-view]").forEach(button => {
        button.classList.toggle("active", button.dataset.songView === "lyrics");
        button.setAttribute("aria-pressed", String(button.dataset.songView === "lyrics"));
    });

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
        card.innerHTML = `<div class="setlist-heading"><div><h3></h3><p class="setlist-owner"></p></div><div class="setlist-heading-actions"><span class="setlist-hint">Click to ${isSinger ? "Manage" : "View"}</span>${isSinger ? '<button type="button" class="setlist-edit" aria-label="Edit setlist" title="Edit setlist">&#9998;</button>' : '<button type="button" class="setlist-view" aria-label="View setlist" title="View setlist">&#128065;</button>'}</div></div><div class="setlist-songs"></div>`;
        card.querySelector("h3").textContent = setlist.name;
        card.querySelector(".setlist-owner").textContent = `Made by ${setlist.username}`;
        const editSetlistButton = card.querySelector(".setlist-edit");
        if (editSetlistButton) editSetlistButton.addEventListener("click", event => {
            event.stopPropagation();
            openSetlistModal(setlist.id);
        });
        const viewSetlistButton = card.querySelector(".setlist-view");
        if (viewSetlistButton) viewSetlistButton.addEventListener("click", event => {
            event.stopPropagation();
            openSetlistModal(setlist.id);
        });
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

if (!isSinger) {
    newSetlistButton.hidden = true;
    if (setlistRenameForm) setlistRenameForm.hidden = true;
    if (deleteSetlistButton) deleteSetlistButton.hidden = true;
    const setlistSongLabel = setlistModal.querySelector('label[for="setlist-song-search"]');
    if (setlistSongLabel) setlistSongLabel.hidden = true;
    if (setlistSongSearch) setlistSongSearch.hidden = true;
    if (setlistSongResults) setlistSongResults.hidden = true;
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
    if (setlistNameInput) setlistNameInput.value = activeSetlist.name;
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
        row.innerHTML = isSinger
            ? "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" class=\"remove-song\" aria-label=\"Remove song from setlist\" title=\"Remove song from setlist\">x</button>"
            : "<button type=\"button\" class=\"song-link\"></button>";
        row.querySelector(".song-link").textContent = `${song.title} - ${song.author}`;
        row.querySelector(".song-link").addEventListener("click", () => {
            setlistModal.hidden = true;
            showSong(song);
        });
        const removeButton = row.querySelector(".remove-song");
        if (removeButton) removeButton.addEventListener("click", () => updateSetlists("DELETE", { setlist_id: activeSetlist.id, song_id: song.id }).catch(showSetlistError));
        setlistModalSongs.appendChild(row);
    });
}

function renderSongLibrary(songs) {
    songLibraryList.replaceChildren();
    if (!songs.length) {
        songLibraryList.innerHTML = "<p>No matching songs found.</p>";
        return;
    }

    songs.forEach(song => {
        const row = document.createElement("div");
        row.className = "song-library-row";
        row.innerHTML = isSinger
            ? "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" data-song-edit>Edit</button><button type=\"button\" data-song-delete>Delete</button>"
            : "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" data-song-edit>Add chords</button>";
        row.querySelector(".song-link").textContent = `${song.title} - ${song.author}`;
        row.querySelector(".song-link").addEventListener("click", () => {
            songLibraryModal.hidden = true;
            showSong(song);
        });
        const editButton = row.querySelector("[data-song-edit]");
        if (editButton) editButton.addEventListener("click", () => {
            songLibraryModal.hidden = true;
            openSongEditor("edit", song);
        });
        const deleteButton = row.querySelector("[data-song-delete]");
        if (deleteButton) deleteButton.addEventListener("click", () => {
            songLibraryModal.hidden = true;
            openSongEditor("delete", song);
        });
        songLibraryList.appendChild(row);
    });
}

async function loadSongLibrary() {
    const response = await fetch("../backend/search-songs.php?q=");
    if (!response.ok) throw new Error("Unable to load songs.");
    const songs = await response.json();
    renderSongLibrary(songs);
    if (songLibrarySearch) {
        songLibrarySearch.value = "";
        songLibrarySearch.dataset.songs = JSON.stringify(songs);
    }
}

function openSongEditor(mode, song = null) {
    songEditorMode = mode;
    activeSongId = song ? Number(song.id) : null;
    songEditor.hidden = false;
    songEditorTitle.textContent = mode === "add" ? "Add song" : `${mode[0].toUpperCase()}${mode.slice(1)} song`;
    songEditorSubmit.textContent = mode === "delete" ? "Delete song" : mode === "add" ? "Save song" : "Update song";
    songTitleInput.required = mode !== "delete";
    songAuthorInput.required = mode !== "delete";
    songLyricsInput.required = mode !== "delete";
    songEditorMessage.textContent = "";
    if (song) {
        songTitleInput.value = song.title;
        songAuthorInput.value = song.author;
        songLyricsInput.value = song.lyrics;
    }
    if (mode === "add") {
        songEditorForm.reset();
        activeSongId = null;
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
    if (document.activeElement instanceof HTMLElement && document.activeElement.closest(".nav-menu")) {
        document.activeElement.blur();
    }
}

function isHamburgerMenu() {
    return window.matchMedia("(max-width: 760px)").matches;
}

if (songsNavToggle) {
    songsNavToggle.addEventListener("click", event => {
        if (!isHamburgerMenu()) {
            closeNavigationMenus();
            return;
        }
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
        if (!isHamburgerMenu()) {
            closeNavigationMenus();
            return;
        }
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
    const defaultProfileImage = profileImage.src;
    const profileStorageKey = `jggm-profile-image:${encodeURIComponent(document.body.dataset.profileUser || "default")}`;
    const savedImage = localStorage.getItem(profileStorageKey);
    if (savedImage) {
        profileImage.src = savedImage;
    }

    let cropScale = 1;
    let cropX = 0;
    let cropY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let isDraggingCrop = false;

    function updateCropPreview() {
        profileCropImage.style.transform = `translate(calc(-50% + ${cropX}px), calc(-50% + ${cropY}px)) scale(${cropScale})`;
    }

    function closeProfileCrop() {
        profileCropModal.hidden = true;
        profileCropImage.removeAttribute("src");
        profileImageInput.value = "";
    }

    function applyProfileCrop() {
        const frameRect = profileCropFrame.getBoundingClientRect();
        const imageRect = profileCropImage.getBoundingClientRect();
        const canvas = document.createElement("canvas");
        const outputSize = 720;
        const context = canvas.getContext("2d");
        const sourceScale = profileCropImage.naturalWidth / imageRect.width;
        const cropLeft = (frameRect.left - imageRect.left) * sourceScale;
        const cropTop = (frameRect.top - imageRect.top) * sourceScale;
        const cropSize = frameRect.width * sourceScale;

        canvas.width = outputSize;
        canvas.height = outputSize;
        context.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue("--profile-image-background")
            .trim();
        context.fillRect(0, 0, outputSize, outputSize);
        context.drawImage(profileCropImage, cropLeft, cropTop, cropSize, cropSize, 0, 0, outputSize, outputSize);
        const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
        profileImage.src = croppedImage;
        localStorage.setItem(profileStorageKey, croppedImage);
        profileImageMessage.textContent = "Profile image updated.";
        closeProfileCrop();
    }

    profileImageInput.addEventListener("change", () => {
        const file = profileImageInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            cropScale = 1;
            cropX = 0;
            cropY = 0;
            profileCropZoom.value = "1";
            profileCropImage.src = reader.result;
            profileCropImage.onload = () => {
                const imageRatio = profileCropImage.naturalWidth / profileCropImage.naturalHeight;
                if (imageRatio >= 1) {
                    profileCropImage.style.width = "auto";
                    profileCropImage.style.height = "100%";
                } else {
                    profileCropImage.style.width = "100%";
                    profileCropImage.style.height = "auto";
                }
                profileCropModal.hidden = false;
                updateCropPreview();
            };
        });
        reader.readAsDataURL(file);
    });

    profileCropZoom.addEventListener("input", () => {
        cropScale = Number(profileCropZoom.value);
        updateCropPreview();
    });

    profileCropFrame.addEventListener("pointerdown", event => {
        isDraggingCrop = true;
        dragStartX = event.clientX - cropX;
        dragStartY = event.clientY - cropY;
        profileCropFrame.setPointerCapture(event.pointerId);
    });

    profileCropFrame.addEventListener("pointermove", event => {
        if (!isDraggingCrop) return;
        cropX = event.clientX - dragStartX;
        cropY = event.clientY - dragStartY;
        updateCropPreview();
    });

    profileCropFrame.addEventListener("pointerup", () => { isDraggingCrop = false; });
    profileCropFrame.addEventListener("pointercancel", () => { isDraggingCrop = false; });
    profileCropApply.addEventListener("click", applyProfileCrop);
    profileCropClose.addEventListener("click", closeProfileCrop);
    profileCropCancel.addEventListener("click", closeProfileCrop);
    profileCropModal.addEventListener("click", event => {
        if (event.target === profileCropModal) closeProfileCrop();
    });

    if (profileImageRemove) {
        profileImageRemove.addEventListener("click", () => {
            localStorage.removeItem(profileStorageKey);
            profileImage.src = defaultProfileImage;
            profileImageMessage.textContent = "Profile image removed.";
        });
    }
}

document.querySelectorAll("[data-song-action]").forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.songAction === "view") {
            loadSongLibrary().then(() => { songLibraryModal.hidden = false; }).catch(error => { songLibraryList.textContent = error.message; });
        } else if (button.dataset.songAction === "search") {
            songSearch.focus();
            songSearch.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (button.dataset.songAction === "chords") {
            loadSongLibrary().then(() => { songLibraryModal.hidden = false; }).catch(error => { songLibraryList.textContent = error.message; });
        } else {
            openSongEditor(button.dataset.songAction);
        }
        closeNavigationMenus();
    });
});

document.querySelectorAll("[data-song-view]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-song-view]").forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        document.dispatchEvent(new CustomEvent("song-view-changed", { detail: button.dataset.songView }));
    });
});

if (document.getElementById("support-nav")) {
    document.getElementById("support-nav").addEventListener("click", () => {
        window.location.href = "mailto:support@jggmmd.local?subject=JGGMMD%20support";
    });
}

if (songEditorCancel) {
    songEditorCancel.addEventListener("click", () => {
        songEditor.hidden = true;
        songEditorForm.reset();
    });
}

if (songLibraryClose) songLibraryClose.addEventListener("click", () => { songLibraryModal.hidden = true; });
if (setlistModalClose) setlistModalClose.addEventListener("click", () => { setlistModal.hidden = true; });

if (songLibrarySearch) {
    songLibrarySearch.addEventListener("input", () => {
        const query = songLibrarySearch.value.trim().toLowerCase();
        const songs = JSON.parse(songLibrarySearch.dataset.songs || "[]");
        renderSongLibrary(songs.filter(song => `${song.title} ${song.author}`.toLowerCase().includes(query)));
    });
}

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
            id: activeSongId,
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
