<?php
    session_start();

    $error = [
        'login' => $_SESSION['log_error'] ?? '',
        'register' => $_SESSION['reg_error'] ?? '',
        'password' => $_SESSION['pass_error'] ?? '',
        'email' => $_SESSION['email_error'] ?? ''
    ];
    $activeForm = $_SESSION['active_form'] ?? 'login';

    session_unset();

    function showError($error) {
        return !empty($error) ? "<p class='error'>$error</p>" : '';
    }

    function showForm($formID, $activeForm) {
        return $formID === $activeForm ? 'active' : '';
    }
    
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Form</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <h1>JGGMMD</h1>
    </nav>
    <div class="login-shell">
        <aside class="login-showcase">
            <div class="login-brand-mark" aria-hidden="true">♫</div>
            <p class="login-eyebrow">Your music, in motion</p>
            <h2>Make every set feel ready.</h2>
            <p class="login-tagline">Manage your setlists effortlessly and keep every song close at hand.</p>
            <div class="equalizer" aria-label="Animated equalizer illustration">
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <svg class="login-music-overlay" viewBox="0 0 700 500" aria-hidden="true" focusable="false">
                <g fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M-20 120 C120 30 190 220 330 120 S550 30 740 130" />
                    <path d="M-20 145 C120 55 190 245 330 145 S550 55 740 155" />
                    <path d="M-20 170 C120 80 190 270 330 170 S550 80 740 180" />
                    <path d="M-20 195 C120 105 190 295 330 195 S550 105 740 205" />
                    <path d="M-20 220 C120 130 190 320 330 220 S550 130 740 230" />
                    <path d="M185 44v178m0-34c30-18 52-10 68 4" />
                    <path d="M510 80v158m0-34c28-18 48-10 65 4" />
                </g>
            </svg>
        </aside>
        <main class="login-panel">
            <div class="container">
        <div class="form-box <?=showForm('login', $activeForm);?>" id="login-form" >
            <form action="../backend/login-reg.php" method="post">
                <h2>Login</h2>
                <?= showError($error['login']); ?>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit" name="login">Login</button>
                <p>Don't have an account? <a href="#" onclick="showForm('register-form')">Register</a></p>
            </form>
        </div>

        <div class="form-box <?= showForm('register', $activeForm); ?>" id="register-form">
            <form action="../backend/login-reg.php" method="post">
                <h2>Register</h2>
                <?= showError($error['register']);?> <?=showError($error['password']);?><?=showError($error['email']);?>
                <input type="text" name="username" placeholder="Username" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="password" name="cpassword" placeholder="Confirm Password" required>
                <select name="Role" required>
                    <option value="">--Select Role--</option>
                    <option value="Singer">Singer</option>
                    <option value="Musician">Musician</option>
                </select>
                <button type="submit" name="register">Register</button>
                <p>Already have an account? <a href="#" onclick="showForm('login-form')">Login</a></p>
            </form>
        </div>
            </div>
        </main>
    </div>

        <script src="script.js"></script>
</body>
</html>