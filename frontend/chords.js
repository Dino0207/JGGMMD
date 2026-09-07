import ChordSheetJS from "https://cdn.jsdelivr.net/npm/chordsheetjs@16.2.2/+esm";

const songDisplay = document.getElementById("song-display");

document.addEventListener("song-selected", event => {
	const selectedSong = event.detail;
	const chordSheetText = selectedSong.lyrics || "";
	const song = new ChordSheetJS.ChordProParser().parse(chordSheetText);
	const formatter = new ChordSheetJS.HtmlTableFormatter();

	songDisplay.replaceChildren();
	songDisplay.innerHTML = formatter.format(song);
});