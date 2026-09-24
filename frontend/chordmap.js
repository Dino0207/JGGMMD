let chordTooltip = null;

function noteId(note) {
    const match = note.match(/^([A-G])([#b])?$/i);
    if (!match) return "";
    return `${match[1].toLowerCase()}${match[2] === "#" ? "_sharp" : match[2] === "b" ? "_flat" : ""}`;
}

function chordIds(value) {
    const normalized = value.trim().replace(/[♯]/g, "#").replace(/[♭]/g, "b");
    const match = normalized.match(/^([A-G](?:#|b)?)([^/]*)(?:\/([A-G](?:#|b)?))?$/i);
    if (!match) return [];

    const root = noteId(match[1]);
    const quality = match[2].toLowerCase().replace(/[()\s]/g, "");
    const bass = match[3] ? noteId(match[3]) : "";
    const aliases = {
        "": ["major"], "m": ["minor"], "min": ["minor"], "minor": ["minor"],
        "maj": ["major"], "major": ["major"], "7": ["7", "dominant_7"],
        "maj7": ["major_7", "maj_7"], "m7": ["minor_7", "m_7"],
        "min7": ["minor_7", "m_7"], "dim": ["diminished", "dim"],
        "aug": ["augmented", "aug"], "+": ["augmented", "aug"],
        "sus2": ["suspended_2", "sus_2"], "sus4": ["suspended_4", "sus_4"],
        "6": ["6", "major_6"], "m6": ["minor_6", "m_6"],
        "add9": ["add_9", "added_9"], "9": ["9", "dominant_9"]
    };
    const types = aliases[quality] || [quality.replace(/[^a-z0-9]/g, "_")];
    const ids = [];

    types.forEach(type => {
        ids.push(`${root}_${type}`);
        if (bass) ids.push(`${root}_${type}_slash_${bass}`);
    });
    return [...new Set(ids)];
}

async function fetchChordMap(name) {
    for (const id of chordIds(name)) {
        const response = await fetch(`https://chords.alday.dev/v1/chords/${encodeURIComponent(id)}`);
        if (response.ok) return response.json();
    }
    return null;
}

export function removeTooltip() {
    if (chordTooltip) {
        chordTooltip.remove();
        chordTooltip = null;
    }
}

export async function showChordMap(element) {
    removeTooltip();
    const name = element.textContent.trim();
    if (!/^[A-G](?:#|b|♯|♭)?[^\s]*$/i.test(name)) return;

    const chord = await fetchChordMap(name);
    if (!chord) return;
    const image = chord.images && Object.values(chord.images)[0];
    if (!image) return;

    chordTooltip = document.createElement("div");
    chordTooltip.className = "chord-map-tooltip";
    chordTooltip.innerHTML = `<strong>${name}</strong><img src="${image}" alt="${name} chord map">`;
    document.body.appendChild(chordTooltip);
    const bounds = element.getBoundingClientRect();
    chordTooltip.style.left = `${Math.max(8, bounds.left + window.scrollX)}px`;
    chordTooltip.style.top = `${bounds.bottom + window.scrollY + 8}px`;
}
