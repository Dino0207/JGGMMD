const songsTableBody = document.getElementById("songs-table-body");
const songsStatus = document.getElementById("songs-status");
const songsSearch = document.getElementById("songs-search");
const songsSortField = document.getElementById("songs-sort-field");
const songsSortDirection = document.getElementById("songs-sort-direction");
const songsPageSize = document.getElementById("songs-page-size");
const songsPagination = document.getElementById("songs-pagination");
const songsPaginationSummary = document.getElementById("songs-pagination-summary");
const songsPageIndicator = document.getElementById("songs-page-indicator");
const songsPagePrevious = document.getElementById("songs-page-previous");
const songsPageNext = document.getElementById("songs-page-next");
const songsTotalCount = document.getElementById("songs-total-count");
const songsActiveListCount = document.getElementById("songs-active-list-count");
const songsMostUsedTitle = document.getElementById("songs-most-used-title");
const songsMostUsedCount = document.getElementById("songs-most-used-count");
const songsUsageChart = document.getElementById("songs-usage-chart");
const songsAnalyticsStatus = document.getElementById("songs-analytics-status");
const songEditor = document.getElementById("song-editor");
const songEditorForm = document.getElementById("song-editor-form");
const songEditorTitle = document.getElementById("song-editor-title");
const songEditorSubmit = document.getElementById("song-editor-submit");
const songEditorDelete = document.getElementById("song-editor-delete");
const songEditorMessage = document.getElementById("song-editor-message");
const songTitleInput = document.getElementById("song-title");
const songAuthorInput = document.getElementById("song-author");
const songLyricsInput = document.getElementById("song-lyrics");
const songModal = document.getElementById("song-modal");
const songModalTitle = document.getElementById("song-modal-title");
const songModalAuthor = document.getElementById("song-modal-author");
const songModalEdit = document.getElementById("song-modal-edit");
const isSinger = document.body.dataset.role === "singer";
let allSongs = [];
let activeSong = null;
let editorMode = "add";
let sortDirection = 1;
let currentPage = 0;

function showSong(song) {
    activeSong = song;
    songModalTitle.textContent = song.title;
    songModalAuthor.textContent = song.author ? `By ${song.author}` : "";
    songModal.hidden = false;
    document.querySelectorAll("[data-song-view]").forEach(button => {
        const selected = button.dataset.songView === "lyrics";
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
    document.dispatchEvent(new CustomEvent("song-selected", { detail: song }));
}

function renderSongs() {
    const query = songsSearch.value.trim().toLocaleLowerCase();
    const sortField = songsSortField.value;
    const songs = allSongs
        .filter(song => `${song.title} ${song.author}`.toLocaleLowerCase().includes(query))
        .sort((first, second) => {
            const firstValue = sortField === "date_added"
                ? new Date(String(first.date_added).replace(" ", "T")).getTime()
                : String(first[sortField] || "").toLocaleLowerCase();
            const secondValue = sortField === "date_added"
                ? new Date(String(second.date_added).replace(" ", "T")).getTime()
                : String(second[sortField] || "").toLocaleLowerCase();
            const compared = typeof firstValue === "number"
                ? firstValue - secondValue
                : firstValue.localeCompare(secondValue);
            return compared * sortDirection || first.id - second.id;
        });
    const pageSize = Number(songsPageSize.value);
    const pageCount = Math.ceil(songs.length / pageSize);
    currentPage = Math.min(currentPage, Math.max(0, pageCount - 1));
    const pageStart = currentPage * pageSize;
    const visibleSongs = songs.slice(pageStart, pageStart + pageSize);

    songsTableBody.replaceChildren();
    songsStatus.textContent = songs.length ? `${songs.length} ${songs.length === 1 ? "song" : "songs"}` : "No matching songs found.";
    songsPagination.hidden = pageCount <= 1;
    songsPaginationSummary.textContent = songs.length
        ? `Showing ${pageStart + 1}–${Math.min(pageStart + pageSize, songs.length)} of ${songs.length}`
        : "";
    songsPageIndicator.textContent = pageCount ? `Page ${currentPage + 1} of ${pageCount}` : "";
    songsPagePrevious.disabled = currentPage === 0;
    songsPageNext.disabled = currentPage >= pageCount - 1;

    visibleSongs.forEach(song => {
        const row = document.createElement("tr");
        row.className = "songs-table-row";
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-label", `View ${song.title} by ${song.author || "Unknown author"}`);
        const title = document.createElement("td");
        title.textContent = song.title;
        const author = document.createElement("td");
        author.textContent = song.author || "Unknown author";
        row.append(title, author);
        row.addEventListener("click", () => showSong(song));
        row.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                showSong(song);
            }
        });
        songsTableBody.appendChild(row);
    });
}

function renderAnalytics(analytics) {
    const usage = Array.isArray(analytics.usage) ? analytics.usage : [];
    const maximum = Math.max(1, ...usage.map(song => Number(song.active_list_count) || 0));
    songsTotalCount.textContent = String(Number(analytics.total_songs) || 0);
    songsActiveListCount.textContent = String(Number(analytics.active_setlists) || 0);
    songsMostUsedTitle.textContent = analytics.most_used && Number(analytics.most_used.active_list_count) > 0
        ? analytics.most_used.title
        : "No usage yet";
    songsMostUsedCount.textContent = analytics.most_used && Number(analytics.most_used.active_list_count) > 0
        ? `Included in ${analytics.most_used.active_list_count} active ${Number(analytics.most_used.active_list_count) === 1 ? "setlist" : "setlists"}`
        : "";
    songsUsageChart.replaceChildren();
    songsUsageChart.setAttribute("aria-label", `Most used songs by number of active setlists: ${usage.map(song => `${song.title}: ${song.active_list_count}`).join(", ") || "No song usage yet"}`);
    if (!usage.length) {
        const empty = document.createElement("p");
        empty.className = "songs-chart-loading";
        empty.textContent = "No songs are available to chart yet.";
        songsUsageChart.appendChild(empty);
        return;
    }

    usage.forEach(song => {
        const count = Number(song.active_list_count) || 0;
        const row = document.createElement("div");
        row.className = "songs-usage-row";
        const label = document.createElement("span");
        label.className = "songs-usage-label";
        label.textContent = song.title;
        label.title = `${song.title} - ${song.author || "Unknown author"}`;
        const track = document.createElement("div");
        track.className = "songs-usage-track";
        const bar = document.createElement("span");
        bar.className = "songs-usage-bar";
        bar.style.width = `${count ? Math.max(5, count / maximum * 100) : 0}%`;
        track.appendChild(bar);
        const countLabel = document.createElement("strong");
        countLabel.className = "songs-usage-count";
        countLabel.textContent = String(count);
        countLabel.setAttribute("aria-label", `${count} active setlists`);
        row.append(label, track, countLabel);
        songsUsageChart.appendChild(row);
    });
}

async function loadSongs() {
    songsStatus.textContent = "Loading songs…";
    songsAnalyticsStatus.textContent = "";
    try {
        const response = await fetch("../backend/song-library.php");
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
            window.location.href = "index.php";
            return;
        }
        if (!response.ok) throw new Error(data.error || "Unable to load songs.");
        allSongs = data.songs;
        renderAnalytics(data.analytics);
        renderSongs();
    } catch (error) {
        songsTableBody.replaceChildren();
        songsStatus.textContent = error.message;
        songsAnalyticsStatus.textContent = error.message;
        songsUsageChart.replaceChildren();
        songsUsageChart.setAttribute("aria-label", "Song analytics are unavailable.");
    }
}

function openSongEditor(mode, song = null) {
    editorMode = mode;
    activeSong = song;
    songEditorTitle.textContent = mode === "add" ? "Add song" : mode === "edit" ? "Edit song" : "Add chords";
    songEditorSubmit.textContent = mode === "add" ? "Save song" : mode === "edit" ? "Update song" : "Save chords";
    songTitleInput.value = song?.title || "";
    songAuthorInput.value = song?.author || "";
    songLyricsInput.value = song?.lyrics || "";
    songTitleInput.disabled = mode === "chords";
    songAuthorInput.disabled = mode === "chords";
    songLyricsInput.disabled = false;
    if (songEditorDelete) songEditorDelete.hidden = !isSinger || mode !== "edit";
    songEditorMessage.textContent = "";
    songEditor.hidden = false;
    songEditor.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function saveSong(event) {
    event.preventDefault();
    const method = editorMode === "add" ? "POST" : "PUT";
    const payload = {
        id: activeSong ? Number(activeSong.id) : null,
        title: songTitleInput.value.trim(),
        author: songAuthorInput.value.trim(),
        lyrics: songLyricsInput.value.trim()
    };
    try {
        const response = await fetch("../backend/songs.php", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Song request failed.");
        songEditorMessage.textContent = editorMode === "add" ? "Song added." : "Song updated.";
        songEditor.hidden = true;
        songEditorForm.reset();
        await loadSongs();
        if (activeSong && editorMode !== "add") {
            const updatedSong = allSongs.find(song => Number(song.id) === Number(activeSong.id));
            if (updatedSong) showSong(updatedSong);
        }
    } catch (error) {
        songEditorMessage.textContent = error.message;
    }
}

async function deleteSong(song = activeSong) {
    if (!song) return;
    if (!window.confirm(`Delete “${song.title}”? This cannot be undone.`)) return;
    try {
        const response = await fetch("../backend/songs.php", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: Number(song.id) })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Unable to delete song.");
        songEditor.hidden = true;
        songModal.hidden = true;
        await loadSongs();
    } catch (error) {
        songEditorMessage.textContent = error.message;
    }
}

songsSearch.addEventListener("input", () => {
    currentPage = 0;
    renderSongs();
});
songsSortField.addEventListener("change", () => {
    currentPage = 0;
    renderSongs();
});
songsPageSize.addEventListener("change", () => {
    currentPage = 0;
    renderSongs();
});
songsPagePrevious.addEventListener("click", () => {
    if (currentPage === 0) return;
    currentPage--;
    renderSongs();
});
songsPageNext.addEventListener("click", () => {
    currentPage++;
    renderSongs();
});
songsSortDirection.addEventListener("click", () => {
    sortDirection *= -1;
    currentPage = 0;
    const ascending = sortDirection === 1;
    songsSortDirection.setAttribute("aria-label", ascending ? "Sort ascending" : "Sort descending");
    songsSortDirection.title = ascending ? "Sort ascending" : "Sort descending";
    songsSortDirection.classList.toggle("is-descending", !ascending);
    renderSongs();
});
songEditorForm.addEventListener("submit", saveSong);
document.getElementById("song-editor-cancel").addEventListener("click", () => {
    songEditor.hidden = true;
    songEditorForm.reset();
});
document.getElementById("songs-add-button")?.addEventListener("click", () => openSongEditor("add"));
songModalEdit.addEventListener("click", () => openSongEditor(isSinger ? "edit" : "chords", activeSong));
songEditorDelete?.addEventListener("click", () => deleteSong());
document.getElementById("song-modal-close").addEventListener("click", () => { songModal.hidden = true; });
songModal.addEventListener("click", event => {
    if (event.target === songModal) songModal.hidden = true;
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

loadSongs();
