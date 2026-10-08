<?php
session_start();
require_once '../backend/config.php';

if (empty($_SESSION['username'])) {
    header('Location: index.php');
    exit;
}

$profileQuery = $conn->prepare('SELECT username, role FROM users WHERE username = ? LIMIT 1');
$profileQuery->bind_param('s', $_SESSION['username']);
$profileQuery->execute();
$profile = $profileQuery->get_result()->fetch_assoc();
if (!$profile || !in_array($profile['role'], ['Singer', 'Musician'], true)) {
    session_destroy();
    header('Location: index.php');
    exit;
}
$isSinger = $profile['role'] === 'Singer';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Songs | JGGMMD</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body data-role="<?= htmlspecialchars(strtolower($profile['role']), ENT_QUOTES) ?>">
    <nav class="navbar" aria-label="Main navigation">
        <h2>JGGMMD</h2>
        <button type="button" class="hamburger" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        <div class="nav-menu">
            <a href="jggmmd.php">Home</a>
            <a href="songs.php" aria-current="page">Songs</a>
            <a href="support.php">Support</a>
            <a href="account.php">Account</a>
            <button type="button" data-nav-logout>Log out</button>
        </div>
    </nav>

    <main class="support-main songs-page">
        <header class="support-intro">
            <p class="support-eyebrow">Song library</p>
            <h2>Available songs</h2>
            <p>Search, view, and manage songs from the shared library.</p>
            <svg class="music-header-art" viewBox="0 0 280 150" aria-hidden="true" focusable="false">
                <path class="music-art-wave" d="M8 112c28-20 42-20 70 0s42 20 70 0 42-20 70 0 36 17 54 4" />
                <g class="music-art-note music-art-note-one">
                    <path d="M98 74V32l38-8v42" />
                    <ellipse cx="89" cy="76" rx="10" ry="7" transform="rotate(-22 89 76)" />
                    <ellipse cx="129" cy="66" rx="10" ry="7" transform="rotate(-22 129 66)" />
                </g>
                <g class="music-art-note music-art-note-two">
                    <path d="M190 91V53l30-7v36" />
                    <ellipse cx="182" cy="93" rx="9" ry="6" transform="rotate(-22 182 93)" />
                    <ellipse cx="212" cy="84" rx="9" ry="6" transform="rotate(-22 212 84)" />
                </g>
                <circle class="music-art-spark" cx="58" cy="45" r="3" />
                <circle class="music-art-spark" cx="245" cy="35" r="4" />
            </svg>
        </header>

        <section class="songs-library-toolbar songs-page-controls" aria-label="Find and sort songs">
            <label class="songs-search">
                <span class="visually-hidden">Search songs by title or author</span>
                <input type="search" id="songs-search" placeholder="Search title or author">
            </label>
            <div class="songs-sort">
                <label for="songs-sort-field">Sort by</label>
                <select id="songs-sort-field" aria-label="Sort songs by">
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="date_added">Date added</option>
                </select>
                <button type="button" id="songs-sort-direction" class="songs-sort-direction" aria-label="Sort ascending" title="Sort ascending">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M8 5v14m0 0-4-4m4 4 4-4M16 7h4M16 12h4M16 17h4" />
                    </svg>
                </button>
            </div>
            <div class="songs-page-size">
                <label for="songs-page-size">Show</label>
                <select id="songs-page-size" aria-label="Songs per page">
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                </select>
                <span>per page</span>
            </div>
            <?php if ($isSinger): ?>
                <button type="button" class="songs-primary-button" id="songs-add-button">Add song</button>
            <?php endif; ?>
        </section>

        <section class="songs-analytics" aria-labelledby="songs-analytics-title">
            <div class="songs-analytics-heading">
                <p class="support-eyebrow">Library insights</p>
                <h3 id="songs-analytics-title">Song analytics</h3>
            </div>
            <div class="songs-analytics-stats">
                <article class="songs-analytics-stat"><span>Available songs</span><strong id="songs-total-count">—</strong></article>
                <article class="songs-analytics-stat"><span>Active setlists</span><strong id="songs-active-list-count">—</strong></article>
                <article class="songs-analytics-stat"><span>Most used</span><strong id="songs-most-used-title">—</strong><small id="songs-most-used-count"></small></article>
            </div>
            <div class="songs-usage-chart" id="songs-usage-chart" role="img" aria-label="Loading songs included in active setlists">
                <p class="songs-chart-loading">Loading song usage…</p>
            </div>
            <p id="songs-analytics-status" class="songs-analytics-status" role="status"></p>
        </section>

        <section class="songs-library-card" aria-label="Available songs">
            <p id="songs-status" class="songs-status" role="status" aria-live="polite">Loading songs…</p>
            <div class="songs-table-wrap">
                <table class="songs-table">
                    <tbody id="songs-table-body"></tbody>
                </table>
            </div>
            <nav class="songs-pagination" id="songs-pagination" aria-label="Song list pages" hidden>
                <span id="songs-pagination-summary" class="songs-pagination-summary"></span>
                <div class="songs-pagination-controls">
                    <button type="button" id="songs-page-previous" aria-label="Previous page">Previous</button>
                    <span id="songs-page-indicator" aria-live="polite"></span>
                    <button type="button" id="songs-page-next" aria-label="Next page">Next</button>
                </div>
            </nav>
        </section>

        <section class="song-editor songs-editor" id="song-editor" hidden>
            <form id="song-editor-form">
                <h2 id="song-editor-title">Add song</h2>
                <label for="song-title">Title</label>
                <input type="text" id="song-title" maxlength="100" required>
                <label for="song-author">Author</label>
                <input type="text" id="song-author" maxlength="100" required>
                <label for="song-lyrics">Lyrics and chords</label>
                <textarea id="song-lyrics" rows="9" required></textarea>
                <div class="song-editor-actions">
                    <button type="submit" id="song-editor-submit">Save song</button>
                    <?php if ($isSinger): ?>
                        <button type="button" id="song-editor-delete" class="song-editor-delete" hidden>Delete song</button>
                    <?php endif; ?>
                    <button type="button" id="song-editor-cancel">Cancel</button>
                </div>
                <p id="song-editor-message" role="status"></p>
            </form>
        </section>

        <div class="song-modal" id="song-modal" hidden>
            <div class="song-modal-content" role="dialog" aria-modal="true" aria-labelledby="song-modal-title">
                <button type="button" class="song-modal-close" id="song-modal-close" aria-label="Close song">&times;</button>
                <div class="song-view-toolbar">
                    <h2 id="song-modal-title"></h2>
                    <div class="song-view-toggle" role="group" aria-label="Song view">
                        <button type="button" class="active" data-song-view="lyrics" aria-pressed="true">Lyrics</button>
                        <button type="button" data-song-view="chords" aria-pressed="false">Chords</button>
                    </div>
                </div>
                <p id="song-modal-author"></p>
                <div class="song-display" id="song-display"></div>
                <?php if ($isSinger): ?>
                    <button type="button" class="song-modal-edit" id="song-modal-edit" aria-label="Edit this song" title="Edit song">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
                    </button>
                <?php else: ?>
                    <button type="button" class="song-modal-edit" id="song-modal-edit" aria-label="Add chords to this song" title="Add chords">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
                </button>
                <?php endif; ?>
            </div>
        </div>
    </main>

    <script src="../node_modules/chordsheetjs/lib/bundle.min.js"></script>
    <script type="module" src="chords.js"></script>
    <script src="page-motion.js"></script>
    <script src="nav.js"></script>
    <script src="songs.js"></script>
</body>
</html>
