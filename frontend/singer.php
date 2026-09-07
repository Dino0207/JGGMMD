<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Singer</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
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
        </div>
    
        <div class="sbody">
        
            <div class="s-bar">
                <label for="song-search">Search songs</label>
                <input type="search" id="song-search" placeholder="Title or author">
            </div>

            <div id="song-results" aria-live="polite"></div>

            <div class="hero">
                <div class="setlist-container">
                    <div class="setlist-items">
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
</body>
</html>