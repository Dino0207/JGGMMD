import ChordSheetJS from "https://cdn.jsdelivr.net/npm/chordsheetjs@16.2.2/+esm";



const chordSheetText = `
{title: My Song}
{key: C}
{chord_style: symbol}
This is [C]the first line
This is [G]the second line~
Third line with a [F]chord
`.substring(1);
const song = new ChordSheetJS.ChordProParser().parse(chordSheetText);
const formatter = new ChordSheetJS.HtmlTableFormatter();
const display = formatter.format(song);

document.getElementById("song-display").innerHTML = display;