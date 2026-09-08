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
                <button type="button" data-song-action="edit">Edit song</button>
                <button type="button" data-song-action="delete">Delete song</button>
                <button type="button" data-song-action="view">View song</button>
            </div>
            <button type="button" id="setlist-nav" aria-expanded="false">Setlist</button>
            <button type="button" id="support-nav" aria-expanded="false">Support</button>
        </div>
       
    </nav>

    
    <div class="mbody">
        <div class="profile-cont">
            <h1>Profile</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde, vitae nesciunt perferendis illo eaque 
                explicabo nemo numquam earum minus reiciendis magnam iste cupiditate hic obcaecati nulla ipsa eos 
                voluptatibus eum!</p>
            <div class="acc-set" id="acc-set">
                <button onclick="accDrop()" class="accbtn">Account Settings</button>
                <div class="acc-set-items" id="acc-set-items">
                    <a href="#">Change Password</a>
                    <a href="#">Change Email</a>
                </div>
            </div>
        </div>
    
        <div class="sbody">
        
            <div class="s-bar">
                <input type="search" id="song-search" placeholder="Search for Title / Author">
            </div>

            <div id="song-results" aria-live="polite"></div>

            <div class="song-editor" id="song-editor" hidden>
                <form id="song-editor-form">
                    <h2 id="song-editor-title">Add song</h2>
                    <label for="song-id">Song id <span id="song-id-note">(only needed for editing or deleting)</span></label>
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

            
 

            <section class="account-settings">
                <div class="form-box" id="change-password-form">
                    <h2>Change Password</h2>
                    <form>
                        <label for="current-password">Current Password:</label>
                        <input type="password" id="current-password" name="current-password" required>
                        
                        <label for="new-password">New Password:</label>
                        <input type="password" id="new-password" name="new-password" required>
                        
                        <label for="confirm-password">Confirm New Password:</label>
                        <input type="password" id="confirm-password" name="confirm-password" required>
                        
                        <button type="submit">Change Password</button>
                    </form>
                </div>

                <div class="form-box" id="change-email-form">
                    <h2>Change Email</h2>
                    <form>
                        <label for="new-email">New Email:</label>
                        <input type="email" id="new-email" name="new-email" required>
                        
                        <button type="submit">Change Email</button>
                    </form>
                </div>

            <div class="hero">
                <div class="setlist-toolbar">
                    <div>
                        <h2>My setlists</h2>
                        <p>Open a setlist to view its songs and lyrics.</p>
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