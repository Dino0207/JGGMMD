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
        <a href="#">Home</a>
        <a href="#">Songs</a>
        <a href="#">Setlist</a>
        <a href="#">Support</a>
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
                <h3>Search-bar</h3>
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
                <div class="setlist-container">
                    <div class="setlist-items">
                        <div class="song-display" id="song-display"></div>
                    </div>
                    <div class="setlist-items">
                    </div>
                    <div class="setlist-items">
                    </div>
                    <div class="setlist-items">
                    </div>
                </div>
            </div>
        </div>

        
                       
        
        
</div>
    <script src="../node_modules/chordsheetjs/lib/bundle.min.js"></script>
    <script type="module" src="chords.js"></script>
    <script src="script.js"></script>
</body>
</html>