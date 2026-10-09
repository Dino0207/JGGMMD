<?php
session_start();
require_once '../backend/config.php';

if (empty($_SESSION['username'])) {
    header('Location: index.php');
    exit;
}

$profileQuery = $conn->prepare('SELECT username, email, role FROM users WHERE username = ? LIMIT 1');
$profileQuery->bind_param('s', $_SESSION['username']);
$profileQuery->execute();
$profile = $profileQuery->get_result()->fetch_assoc();
if (!$profile || !in_array($profile['role'], ['Singer', 'Musician'], true)) {
    session_destroy();
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account | JGGMMD</title>
    <style>
        html {
            background: #f8f4f0;
        }

        body {
            opacity: 0;
            transition: opacity 0.12s ease-in-out;
        }

        body.page-ready {
            opacity: 1;
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            document.body.classList.add('page-ready');
        });
    </script>
    <link rel="stylesheet" href="styles.css">
</head>
<body data-role="<?= htmlspecialchars(strtolower($profile['role']), ENT_QUOTES) ?>" data-profile-user="<?= htmlspecialchars($profile['username'], ENT_QUOTES) ?>">
    <nav class="navbar" aria-label="Main navigation">
        <h2>JGGMMD</h2>
        <button type="button" class="hamburger" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        <div class="nav-menu">
            <a href="jggmmd.php">Home</a>
            <a href="songs.php">Songs</a>
            <a href="support.php">Support</a>
            <a href="account.php" aria-current="page">Account</a>
            <button type="button" data-nav-logout>Log out</button>
        </div>
    </nav>

    <main class="support-main account-page">
        <header class="support-intro">
            <p class="support-eyebrow">Your space</p>
            <h2>Account</h2>
            <p>Manage your profile and account security, and review your music activity.</p>
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

        <section class="account-page-grid">
            <div class="support-card account-profile-card">
                <h3>Profile details</h3>
                <div class="account-profile-image">
                    <img id="profile-image" src="https://static.vecteezy.com/system/resources/previews/026/630/551/non_2x/profile-icon-symbol-design-illustration-vector.jpg" alt="Profile image for <?= htmlspecialchars($profile['username'], ENT_QUOTES) ?>">
                    <div class="profile-image-actions">
                        <label for="profile-image-input" class="profile-image-button">Change image</label>
                        <button type="button" class="profile-image-remove" id="profile-image-remove">Remove image</button>
                    </div>
                    <input type="file" id="profile-image-input" accept="image/*" hidden>
                </div>
                <div class="profile-details">
                    <p><strong>Username</strong><span><?= htmlspecialchars($profile['username'], ENT_QUOTES) ?></span></p>
                    <p><strong>Email</strong><span id="account-email"><?= htmlspecialchars($profile['email'], ENT_QUOTES) ?></span></p>
                    <p><strong>Role</strong><span><?= htmlspecialchars($profile['role'], ENT_QUOTES) ?></span></p>
                </div>
                <p id="profile-image-message" class="profile-image-message" role="status"></p>
                <button type="button" class="account-logout-button" id="account-logout">Log out</button>
                <p id="account-message" class="account-message" role="status" aria-live="polite"></p>
            </div>

            <div class="account-settings-column">
                <section class="support-card account-settings-card">
                    <h3>Change password</h3>
                    <form id="change-password-form" data-account-form="password">
                        <label for="current-password">Current password</label>
                        <input type="password" id="current-password" autocomplete="current-password" required>
                        <label for="new-password">New password</label>
                        <input type="password" id="new-password" minlength="8" autocomplete="new-password" required>
                        <label for="confirm-password">Confirm new password</label>
                        <input type="password" id="confirm-password" minlength="8" autocomplete="new-password" required>
                        <button type="submit">Change password</button>
                    </form>
                </section>

                <section class="support-card account-settings-card">
                    <h3>Change email</h3>
                    <form id="change-email-form" data-account-form="email">
                        <label for="new-email">New email</label>
                        <input type="email" id="new-email" autocomplete="email" required>
                        <label for="email-password">Current password</label>
                        <input type="password" id="email-password" autocomplete="current-password" required>
                        <button type="submit">Change email</button>
                    </form>
                </section>
            </div>
        </section>

        <section class="account-analytics" aria-labelledby="account-analytics-title">
            <div class="account-section-heading">
                <p class="support-eyebrow">Your music</p>
                <h3 id="account-analytics-title">Setlist analytics</h3>
            </div>
            <div class="dashboard-stats account-stats" aria-label="Setlist statistics">
                <div class="stat-card"><span>Total songs</span><strong id="stat-total-songs">—</strong></div>
                <div class="stat-card"><span>Active setlists</span><strong id="stat-active-setlists">—</strong></div>
                <div class="stat-card"><span>Songs in rotation</span><strong id="stat-rotation">—</strong></div>
            </div>
            <section class="activity-widget account-activity" aria-labelledby="activity-title">
                <div class="activity-heading">
                    <span class="activity-icon" aria-hidden="true">♫</span>
                    <div><p class="widget-eyebrow">Keep the rhythm</p><h3 id="activity-title">Recent activity</h3></div>
                </div>
                <ul id="recent-activity"><li class="activity-empty">Loading your song activity…</li></ul>
                <p id="account-analytics-status" role="status" aria-live="polite"></p>
            </section>
        </section>
    </main>

    <div class="profile-crop-modal" id="profile-crop-modal" hidden>
        <div class="profile-crop-content" role="dialog" aria-modal="true" aria-labelledby="profile-crop-title">
            <button type="button" class="song-modal-close" id="profile-crop-close" aria-label="Close image editor">&times;</button>
            <h2 id="profile-crop-title">Fit profile image</h2>
            <p class="profile-crop-help">Drag the image to position it, then adjust the zoom.</p>
            <div class="profile-crop-frame" id="profile-crop-frame"><img id="profile-crop-image" alt="Profile image preview"></div>
            <label class="profile-crop-zoom" for="profile-crop-zoom-input">
                <span>Zoom</span>
                <input type="range" id="profile-crop-zoom-input" min="1" max="3" step="0.01" value="1">
            </label>
            <div class="profile-crop-actions">
                <button type="button" id="profile-crop-cancel">Cancel</button>
                <button type="button" id="profile-crop-apply">Apply image</button>
            </div>
        </div>
    </div>

    <script src="page-motion.js"></script>
    <script src="nav.js"></script>
    <script src="account.js"></script>
</body>
</html>
