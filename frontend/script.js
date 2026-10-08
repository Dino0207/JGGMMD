
function showForm(formId) {
    document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}

function accDrop() {
    document.getElementById("acc-set-items").classList.toggle("show");
}

document.querySelectorAll("[data-password-toggle]").forEach(button => {
    button.addEventListener("click", () => {
        const passwordInput = document.getElementById(button.dataset.passwordToggle);
        if (!passwordInput) return;

        const isVisible = passwordInput.type === "password";
        passwordInput.type = isVisible ? "text" : "password";
        button.setAttribute("aria-pressed", String(isVisible));
        button.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
        button.title = isVisible ? "Hide password" : "Show password";
    });
});

const songSearch = document.getElementById("song-search");
const songModal = document.getElementById("song-modal");
const songModalClose = document.getElementById("song-modal-close");
const songModalBackButton = document.getElementById("song-modal-back");
const songModalTitle = document.getElementById("song-modal-title");
const songModalAuthor = document.getElementById("song-modal-author");
const songLibraryModal = document.getElementById("song-library-modal");
const songLibraryClose = document.getElementById("song-library-close");
const songLibraryList = document.getElementById("song-library-list");
const songLibrarySearch = document.getElementById("song-library-search");
const songLibraryPager = document.getElementById("song-library-pager");
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
const statTotalSongs = document.getElementById("stat-total-songs");
const statActiveSetlists = document.getElementById("stat-active-setlists");
const statRotation = document.getElementById("stat-rotation");
const recentActivity = document.getElementById("recent-activity");
const deleteSetlistButton = document.getElementById("delete-setlist");
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
let songLibraryAddSetlistId = null;
let songLibraryPage = 0;
let returnToSongLibrary = false;
let setlistSearchQuery = "";
let setlistSongObserver = null;
const SONG_LIBRARY_PAGE_SIZE = 10;
const isSinger = document.body.dataset.role === "singer";

function showSong(song, fromSongLibrary = false) {
    songModalTitle.textContent = song.title;
    songModalAuthor.textContent = song.author ? `By ${song.author}` : "";
    songModal.hidden = false;
    returnToSongLibrary = fromSongLibrary;
    if (songModalBackButton) songModalBackButton.hidden = !fromSongLibrary;

    document.querySelectorAll("[data-song-view]").forEach(button => {
        button.classList.toggle("active", button.dataset.songView === "lyrics");
        button.setAttribute("aria-pressed", String(button.dataset.songView === "lyrics"));
    });

    document.dispatchEvent(new CustomEvent("song-selected", { detail: song }));
}

function closeSong() {
    songModal.hidden = true;
    returnToSongLibrary = false;
    if (songModalBackButton) songModalBackButton.hidden = true;
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
    updateDashboardWidgets(data);
    renderSetlists(filterSetlists(data));
    if (setlistModal && !setlistModal.hidden && activeSetlist) {
        activeSetlist = loadedSetlists.find(setlist => Number(setlist.id) === Number(activeSetlist.id)) || null;
        if (activeSetlist) {
            setlistModalTitle.textContent = activeSetlist.name;
            setlistNameInput.value = activeSetlist.name;
            renderSetlistModalSongs();
        }
    }
}

function updateDashboardWidgets(setlists) {
    const songs = setlists.flatMap(setlist => setlist.songs || []);
    const uniqueSongs = new Map(songs.map(song => [song.id || `${song.title}-${song.author}`, song]));
    if (statTotalSongs) statTotalSongs.textContent = uniqueSongs.size;
    if (statActiveSetlists) statActiveSetlists.textContent = setlists.length;
    if (statRotation) statRotation.textContent = songs.length;
    if (!recentActivity) return;
    recentActivity.replaceChildren();
    const activity = songs.slice(0, 5);
    if (!activity.length) {
        recentActivity.innerHTML = '<li class="activity-empty">Add songs to a setlist to build your rotation.</li>';
        return;
    }
    activity.forEach(song => {
        const item = document.createElement("li");
        item.innerHTML = "<span class=\"activity-dot\"></span><div><strong></strong><small></small></div>";
        item.querySelector("strong").textContent = song.title;
        item.querySelector("small").textContent = song.author || "Unknown author";
        recentActivity.appendChild(item);
    });
}

function renderSetlists(setlists) {
    if (!setlistContainer) return;
    if (setlistSongObserver) setlistSongObserver.disconnect();
    setlistSongObserver = "IntersectionObserver" in window
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const card = entry.target;
                setlistSongObserver.unobserve(card);
                card.renderSongs();
            });
        }, { rootMargin: "250px 0px" })
        : null;
    setlistContainer.replaceChildren();
    if (!setlists.length) {
        const empty = document.createElement("p");
        empty.className = "empty-setlists";
        empty.textContent = setlistSearchQuery
            ? "No setlists match your search."
            : "No setlists yet. Create one to get started.";
        setlistContainer.appendChild(empty);
        return;
    }

    setlists.forEach(setlist => {
        const card = document.createElement("article");
        card.className = "setlist-items";
        card.dataset.setlistId = setlist.id;
        card.innerHTML = `<div class="setlist-heading"><div><h3></h3><p class="setlist-owner"></p></div><div class="setlist-heading-actions">${isSinger ? '<button type="button" class="setlist-edit" aria-label="Edit setlist" title="Edit setlist">&#9998;</button>' : '<button type="button" class="setlist-view" aria-label="View setlist" title="View setlist">&#128065;</button>'}</div></div><div class="song-list-header" aria-hidden="true"><span>Title</span><span>Author</span></div><div class="setlist-songs"></div><footer class="setlist-card-footer"><span class="setlist-view-icon" aria-hidden="true">&#128065;</span><span class="setlist-view-count"></span></footer>`;
        card.querySelector("h3").textContent = setlist.name;
        card.querySelector(".setlist-owner").textContent = `Made by ${setlist.username}`;
        card.querySelector(".setlist-view-count").textContent = formatSetlistViewCount(setlist.view_count);
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
        card.renderSongs = () => {
            if (card.dataset.songsRendered) return;
            card.dataset.songsRendered = "true";
            if (!setlist.songs.length) {
                card.querySelector(".song-list-header").hidden = true;
                songs.innerHTML = isSinger
                    ? "<div class=\"empty-setlist-state\"><p class=\"empty-setlist-songs\">No songs in this setlist.</p><button type=\"button\" class=\"empty-setlist-add\" aria-label=\"Add songs\" title=\"Add songs\">+</button></div>"
                    : "<p class=\"empty-setlist-songs\">No songs in this setlist.</p>";
                const addSongsButton = songs.querySelector(".empty-setlist-add");
                if (addSongsButton) addSongsButton.addEventListener("click", event => {
                    event.stopPropagation();
                    songLibraryAddSetlistId = setlist.id;
                    loadSongLibrary().then(() => { songLibraryModal.hidden = false; }).catch(error => { songLibraryList.textContent = error.message; });
                });
                return;
            }
            setlist.songs.forEach(song => {
                const row = document.createElement("div");
                row.className = "setlist-song";
                row.innerHTML = "<button type=\"button\" class=\"song-link setlist-song-link\"><span class=\"setlist-song-title\"></span><span class=\"setlist-song-author\"></span></button>";
                row.querySelector(".setlist-song-title").textContent = song.title;
                row.querySelector(".setlist-song-author").textContent = song.author;
                row.querySelector(".setlist-song-link").addEventListener("click", event => {
                    event.stopPropagation();
                    if (!isSinger) recordSetlistView(setlist.id).catch(error => console.error("Unable to record setlist view:", error));
                    showSong(song);
                });
                songs.appendChild(row);
            });
        };
        if (setlistSongObserver) setlistSongObserver.observe(card);
        else card.renderSongs();
        card.addEventListener("click", () => openSetlistModal(setlist.id));
        setlistContainer.appendChild(card);
    });
}

function filterSetlists(setlists) {
    const query = setlistSearchQuery.trim().toLocaleLowerCase();
    if (!query) return setlists;
    return setlists.filter(setlist => {
        const searchableValues = [
            setlist.name,
            setlist.username,
            ...(setlist.songs || []).flatMap(song => [song.title, song.author])
        ];
        return searchableValues.some(value => String(value || "").toLocaleLowerCase().includes(query));
    });
}

if (songSearch) {
    songSearch.addEventListener("input", () => {
        setlistSearchQuery = songSearch.value;
        renderSetlists(filterSetlists(loadedSetlists));
    });
}

if (!isSinger) {
    if (newSetlistButton) newSetlistButton.hidden = true;
    if (setlistRenameForm) setlistRenameForm.hidden = true;
    if (deleteSetlistButton) deleteSetlistButton.hidden = true;
    if (setlistModal) {
        const setlistSongLabel = setlistModal.querySelector('label[for="setlist-song-search"]');
        if (setlistSongLabel) setlistSongLabel.hidden = true;
    }
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
    if (!isSinger) {
        recordSetlistView(setlistId).catch(error => console.error("Unable to record setlist view:", error));
    }
}

function formatSetlistViewCount(viewCount) {
    const count = Number(viewCount) || 0;
    return `${count} ${count === 1 ? "view" : "views"}`;
}

async function recordSetlistView(setlistId) {
    const response = await fetch("../backend/setlists.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view", setlist_id: setlistId })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Unable to record setlist view.");

    const card = Array.from(setlistContainer.children).find(item => Number(item.dataset.setlistId) === Number(setlistId));
    const viewCount = card?.querySelector(".setlist-view-count");
    if (viewCount) viewCount.textContent = formatSetlistViewCount(data.view_count);
}

function renderSetlistModalSongs() {
    setlistModalSongs.replaceChildren();
    const header = document.createElement("div");
    header.className = "song-list-header";
    header.setAttribute("aria-hidden", "true");
    header.innerHTML = "<span>Title</span><span>Author</span>";
    setlistModalSongs.appendChild(header);
    if (!activeSetlist.songs.length) {
        setlistModalSongs.innerHTML = "<p class=\"empty-setlist-songs\">No songs in this setlist.</p>";
        return;
    }
    activeSetlist.songs.forEach(song => {
        const row = document.createElement("div");
        row.className = "setlist-song";
        row.innerHTML = isSinger
            ? "<button type=\"button\" class=\"song-link setlist-song-link\"><span class=\"setlist-song-title\"></span><span class=\"setlist-song-author\"></span></button><button type=\"button\" class=\"remove-song\" aria-label=\"Remove song from setlist\" title=\"Remove song from setlist\">x</button>"
            : "<button type=\"button\" class=\"song-link setlist-song-link\"><span class=\"setlist-song-title\"></span><span class=\"setlist-song-author\"></span></button>";
        row.querySelector(".setlist-song-title").textContent = song.title;
        row.querySelector(".setlist-song-author").textContent = song.author;
        row.querySelector(".song-link").addEventListener("click", () => {
            setlistModal.hidden = true;
            showSong(song);
        });
        const removeButton = row.querySelector(".remove-song");
        if (removeButton) removeButton.addEventListener("click", () => updateSetlists("DELETE", { setlist_id: activeSetlist.id, song_id: song.id }).catch(showSetlistError));
        setlistModalSongs.appendChild(row);
    });
}

function renderSongLibraryPager(songs, pageCount) {
    if (!songLibraryPager) return;
    songLibraryPager.replaceChildren();
    songLibraryPager.hidden = pageCount <= 1;
    if (pageCount <= 1) return;

    const goTo = page => {
        songLibraryPage = page;
        renderSongLibrary(songs);
    };
    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Previous";
    previous.disabled = songLibraryPage === 0;
    previous.addEventListener("click", () => goTo(songLibraryPage - 1));
    const label = document.createElement("span");
    label.textContent = `Page ${songLibraryPage + 1} of ${pageCount}`;
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";
    next.disabled = songLibraryPage >= pageCount - 1;
    next.addEventListener("click", () => goTo(songLibraryPage + 1));
    songLibraryPager.append(previous, label, next);
}

function renderSongLibrary(songs) {
    songLibraryList.replaceChildren();
    const pageCount = Math.ceil(songs.length / SONG_LIBRARY_PAGE_SIZE);
    songLibraryPage = Math.min(songLibraryPage, Math.max(pageCount - 1, 0));
    renderSongLibraryPager(songs, pageCount);
    if (!songs.length) {
        songLibraryList.innerHTML = "<p>No matching songs found.</p>";
        return;
    }

    const pageStart = songLibraryPage * SONG_LIBRARY_PAGE_SIZE;
    songs.slice(pageStart, pageStart + SONG_LIBRARY_PAGE_SIZE).forEach(song => {
        const row = document.createElement("div");
        row.className = "song-library-row";
        const addTarget = songLibraryAddSetlistId === null ? null : loadedSetlists.find(setlist => Number(setlist.id) === Number(songLibraryAddSetlistId));
        row.innerHTML = addTarget
            ? "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" data-song-add>Add</button>"
            : isSinger
            ? "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" data-song-edit>Edit</button><button type=\"button\" data-song-delete>Delete</button>"
            : "<button type=\"button\" class=\"song-link\"></button><button type=\"button\" data-song-edit>Add chords</button>";
        row.querySelector(".song-link").textContent = `${song.title} - ${song.author}`;
        row.querySelector(".song-link").addEventListener("click", () => {
            songLibraryModal.hidden = true;
            showSong(song, true);
        });
        const addButton = row.querySelector("[data-song-add]");
        if (addButton) {
            if (addTarget.songs.some(item => Number(item.id) === Number(song.id))) {
                addButton.textContent = "Added";
                addButton.disabled = true;
            } else {
                addButton.addEventListener("click", () => {
                    addButton.disabled = true;
                    updateSetlists("POST", { setlist_id: addTarget.id, song_id: song.id })
                        .then(() => renderSongLibrary(songs))
                        .catch(error => {
                            addButton.disabled = false;
                            showSetlistError(error);
                        });
                });
            }
        }
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
    songLibraryPage = 0;
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
        songLibraryPage = 0;
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
            if (setlistContainer) await updateSetlists();
        } catch (error) {
            songEditorMessage.textContent = error.message;
        }
    });
}

if (songModalClose) {
    songModalClose.addEventListener("click", closeSong);
}

if (songModalBackButton) {
    songModalBackButton.addEventListener("click", () => {
        if (!returnToSongLibrary) return;
        closeSong();
        songLibraryModal.hidden = false;
    });
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
}
