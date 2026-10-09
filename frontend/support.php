<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support | JGGMMD</title>
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
<body class="support-page">
    <nav class="navbar" aria-label="Main navigation">
        <h2>JGGMMD</h2>
        <button type="button" class="hamburger" aria-label="Toggle navigation" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <div class="nav-menu">
            <a href="jggmmd.php">Home</a>
            <a href="songs.php">Songs</a>
            <a id="support-nav" href="support.php" aria-current="page">Support</a>
            <a href="account.php">Account</a>
            <button type="button" data-nav-logout>Log out</button>
        </div>
    </nav>

    <main class="support-main">
        <header class="support-intro">
            <p class="support-eyebrow">We're here to help</p>
            <h2>Report a problem</h2>
            <p>Tell us what went wrong. Your report helps us spot and resolve recurring issues.</p>
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

        <section class="support-layout" aria-label="Support and system reports">
            <div class="support-card">
                <h3>Send a report</h3>
                <form id="support-report-form" action="https://formsubmit.co/ajax/deanlouise556@gmail.com" method="POST">
                    <label for="report-name">Name</label>
                    <input id="report-name" name="name" type="text" maxlength="120" autocomplete="name" required>

                    <label for="report-email">Email</label>
                    <input id="report-email" name="email" type="email" maxlength="254" autocomplete="email" required>

                    <label for="report-message">What happened?</label>
                    <textarea id="report-message" name="message" rows="6" maxlength="5000" required></textarea>

                    <button id="support-report-submit" type="submit">Submit Report</button>
                    <p id="support-report-status" role="status" aria-live="polite"></p>
                </form>
            </div>

            <aside class="support-card support-analytics" aria-labelledby="support-analytics-title">
                <p class="support-eyebrow">Community health</p>
                <h3 id="support-analytics-title">Reported problems</h3>
                <p class="support-analytics-note">Daily reports over the last 7 days help highlight possible system trouble spots.</p>
                <div class="support-stat-grid">
                    <div class="support-stat">
                        <span>Total reports</span>
                        <strong id="support-report-total">—</strong>
                    </div>
                    <div class="support-stat">
                        <span>Peak day</span>
                        <strong id="support-report-peak">—</strong>
                    </div>
                </div>
                <div id="support-report-chart" class="support-report-chart" role="img" aria-label="Loading report activity for the last 7 days">
                    <p class="support-chart-loading">Loading report activity…</p>
                </div>
                <p id="support-analytics-status" class="support-analytics-status" role="status"></p>
                <p class="support-privacy-note">Only report totals and dates are shown here; report details and contact information are not stored in this chart.</p>
            </aside>
        </section>

        <section class="support-portfolio">
            <div>
                <p class="support-eyebrow">More from the developer</p>
                <h3>Explore my portfolio</h3>
                <p>See more of my projects and work.</p>
            </div>
            <a href="https://dino0207.github.io/Portfolio/" target="_blank" rel="noopener noreferrer">Visit my portfolio</a>
        </section>
    </main>

    <script src="page-motion.js"></script>
    <script src="nav.js"></script>
    <script src="support.js"></script>
</body>
</html>
