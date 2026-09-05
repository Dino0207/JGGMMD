<?php
    session_start();

    $error = [
        'login' => $_SESSION['log_error'] ?? '',
        'register' => $_SESSION['reg_error'] ?? '',
        'password' => $_SESSION['pass_error'] ?? ''
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
                <?= showError($error['register']);?> <?=showError($error['password']);?>
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

        <script src="script.js"></script>
</body>
</html>