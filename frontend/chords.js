import ChordSheetJS from "https://cdn.jsdelivr.net/npm/chordsheetjs@16.2.2/+esm";
import { removeTooltip, showChordMap } from "./chordmap.js";

const songDisplay = document.getElementById("song-display");
let selectedSong = null;

document.addEventListener("song-selected", event => {
	selectedSong = event.detail;
	renderSong("lyrics");
});

function renderSong(view = "lyrics") {
	if (!selectedSong) return;
	songDisplay.replaceChildren();
	if (view === "lyrics") {
		songDisplay.classList.add("lyrics-view");
		songDisplay.textContent = (selectedSong.lyrics || "No lyrics available.")
			.replace(/\{[^}]+\}/g, "")
			.replace(/\[[^\]]+\]/g, "");
		return;
	}

	songDisplay.classList.remove("lyrics-view");
	const song = new ChordSheetJS.ChordProParser().parse(selectedSong.lyrics || "{C}");
	const formatter = new ChordSheetJS.HtmlTableFormatter();
	songDisplay.innerHTML = formatter.format(song);
	songDisplay.querySelectorAll(".chord").forEach(chord => {
		chord.addEventListener("mouseenter", () => showChordMap(chord).catch(() => {}));
		chord.addEventListener("mouseleave", removeTooltip);
	});
}

document.addEventListener("song-view-changed", event => renderSong(event.detail));
window.addEventListener("scroll", removeTooltip, { passive: true });
