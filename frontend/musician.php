<?php
session_start();
require_once '../backend/config.php';

$profile = ['username' => $_SESSION['username'] ?? 'User', 'email' => $_SESSION['email'] ?? '', 'role' => 'Musician'];
if (!empty($_SESSION['username'])) {
    $profileQuery = $conn->prepare('SELECT username, email, role FROM users WHERE username = ? LIMIT 1');
    $profileQuery->bind_param('s', $_SESSION['username']);
    $profileQuery->execute();
    $profile = $profileQuery->get_result()->fetch_assoc() ?: $profile;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Musician</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="hamburger">
        <span></span>
        <span></span>
        <span></span>
    </div>
    <nav class="navbar">
        <h2>JGGMMD</h2>
        
        <div class="nav-menu">
            <button type="button" id="home-nav">Home</button>
            <button type="button" id="songs-nav-toggle" aria-expanded="false">Songs</button>
            <div class="nav-dropdown" id="songs-nav-menu">
                <button type="button" data-song-action="add">Add song</button>
                <button type="button" data-song-action="view">View song</button>
            </div>
            <button type="button" id="support-nav" aria-expanded="false">Support</button>
            <button type="button" id="account-nav" aria-expanded="false">Account</button>
            <div class="nav-dropdown account-dropdown" id="account-nav-menu">
                <button type="button" data-account-action="password">Change password</button>
                <button type="button" data-account-action="email">Change email</button>
            </div>
        </div>
       
    </nav>

    
    <div class="mbody">
        <div class="profile-cont">
            <h1>Profile</h1>
            <div class="profile-image-wrap">
                <img id="profile-image" src="https://static.vecteezy.com/system/resources/previews/026/630/551/non_2x/profile-icon-symbol-design-illustration-vector.jpg" alt="Profile image for <?= htmlspecialchars($profile['username'], ENT_QUOTES) ?>">
                <label for="profile-image-input" class="profile-image-button">Change image</label>
                <input type="file" id="profile-image-input" accept="image/*" hidden>
            </div>
            <div class="profile-details">
                <p><strong>Username</strong><span><?= htmlspecialchars($profile['username'], ENT_QUOTES) ?></span></p>
                <p><strong>Role</strong><span><?= htmlspecialchars($profile['role'], ENT_QUOTES) ?></span></p>
            </div>
            <div class="profile-image-message" id="profile-image-message" role="status"></div>
        </div>

        <div class="account-modal" id="account-modal" hidden>
            <div class="account-modal-content" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
                <button type="button" class="song-modal-close" id="account-modal-close" aria-label="Close account settings">&times;</button>
                <h2 id="account-modal-title"></h2>
                <form id="change-password-form" data-account-form="password" hidden>
                    <label for="current-password">Current password</label>
                    <input type="password" id="current-password" required>
                    <label for="new-password">New password</label>
                    <input type="password" id="new-password" minlength="8" required>
                    <label for="confirm-password">Confirm new password</label>
                    <input type="password" id="confirm-password" minlength="8" required>
                    <button type="submit">Change password</button>
                </form>
                <form id="change-email-form" data-account-form="email" hidden>
                    <label for="new-email">New email</label>
                    <input type="email" id="new-email" required>
                    <label for="email-password">Current password</label>
                    <input type="password" id="email-password" required>
                    <button type="submit">Change email</button>
                </form>
                <p id="account-message" role="status"></p>
            </div>
        </div>
    
        <div class="sbody">
        
            <div class="s-bar">
                <label class="search-field">
                    <input type="search" id="song-search" placeholder="Search for Title / Author" aria-label="Search songs">
                    <img class="search-icon" src="https://img.icons8.com/fluent-systems-regular/1200/search.jpg" alt="" aria-hidden="true">
                </label>
            </div>

            <div id="song-results" aria-live="polite"></div>

            <div class="song-editor" id="song-editor" hidden>
                <form id="song-editor-form">
                    <h2 id="song-editor-title">Add song</h2>
                    <label for="song-id" id="song-id-label">Song id</label>
                    <input type="number" id="song-id" min="1">
                    <label for="song-title">Title</label>
                    <input type="text" id="song-title" maxlength="100" required>
                    <label for="song-author">Author</label>
                    <input type="text" id="song-author" maxlength="100" required>
                    <label for="song-lyrics">Lyrics</label>
                    <textarea id="song-lyrics" rows="9" required></textarea>
                    <div class="song-editor-actions">
                        <button type="submit" id="song-editor-submit">Save song</button>
                        <button type="button" id="song-editor-cancel">Cancel</button>
                    </div>
                    <p id="song-editor-message" role="status"></p>
                </form>
            </div>

            <div class="song-modal" id="song-modal" hidden>
                <div class="song-modal-content" role="dialog" aria-modal="true" aria-labelledby="song-modal-title">
                    <button type="button" class="song-modal-close" id="song-modal-close" aria-label="Close song">&times;</button>
                    <h2 id="song-modal-title"></h2>
                    <p id="song-modal-author"></p>
                    <div class="song-display" id="song-display"></div>
                </div>
            </div>

            <div class="song-library-modal" id="song-library-modal" hidden>
                <div class="song-library-content" role="dialog" aria-modal="true" aria-labelledby="song-library-title">
                    <button type="button" class="song-modal-close" id="song-library-close" aria-label="Close song library">&times;</button>
                    <h2 id="song-library-title">Available songs</h2>
                    <div id="song-library-list" class="song-library-list"></div>
                </div>
            </div>

            <div class="setlist-modal" id="setlist-modal" hidden>
                <div class="setlist-modal-content" role="dialog" aria-modal="true" aria-labelledby="setlist-modal-title">
                    <button type="button" class="song-modal-close" id="setlist-modal-close" aria-label="Close setlist">&times;</button>
                    <h2 id="setlist-modal-title"></h2>
                    <form id="setlist-rename-form" class="setlist-rename-form">
                        <label for="setlist-name">Setlist name</label>
                        <div>
                            <input type="text" id="setlist-name" maxlength="150" required>
                            <button type="submit">Rename</button>
                        </div>
                    </form>
                    <h3>Songs in this setlist</h3>
                    <div id="setlist-modal-songs" class="setlist-modal-songs"></div>
                    <label for="setlist-song-search">Add a song</label>
                    <input type="search" id="setlist-song-search" placeholder="Search title or author">
                    <div id="setlist-song-results" class="setlist-song-results"></div>
                    <button type="button" class="delete-setlist" id="delete-setlist">Delete setlist</button>
                </div>
            </div>

            <div class="setlist-modal" id="new-setlist-modal" hidden>
                <div class="setlist-modal-content new-setlist-content" role="dialog" aria-modal="true" aria-labelledby="new-setlist-title">
                    <button type="button" class="song-modal-close" id="new-setlist-modal-close" aria-label="Close new setlist">&times;</button>
                    <h2 id="new-setlist-title">Create setlist</h2>
                    <form id="new-setlist-form" class="setlist-rename-form">
                        <label for="new-setlist-name">Setlist name</label>
                        <div>
                            <input type="text" id="new-setlist-name" maxlength="150" required>
                            <button type="submit">Create</button>
                        </div>
                    </form>
                    <p id="new-setlist-message" role="status"></p>
                </div>
            </div>

            
 

            <div class="hero">
                <div class="setlist-toolbar">
                    <div>
                        <h2>My setlists</h2>
                        <p>Select a setlist to manage its songs.</p>
                    </div>
                    <button type="button" id="new-setlist">+ New setlist</button>
                </div>
                <div class="setlist-container" id="setlist-container" aria-live="polite"></div>
            </div>
        </div>

        
                       
        
        
</div>
    <script src="../node_modules/chordsheetjs/lib/bundle.min.js"></script>
    <script type="module" src="chords.js"></script>
    <script src="script.js"></script>
</body>
</html>