<?php
session_start();
require_once 'config.php';

if (isset($_POST['register'])) {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role = ($_POST['Role'] !== 'Singer') ? 'Musician' : 'Singer';

    function validate($username) {
        return preg_match('/[^a-zA-Z0-9_]/', $username);
    }


    $checkEmailQ = $conn->prepare("SELECT email FROM users WHERE email = ?");
    $checkEmailQ->bind_param('s', $email);
    $checkEmailQ->execute();
    $checkEmailQ->store_result();

    if ($checkEmailQ->num_rows > 0) {
        $_SESSION['reg_error'] = 'Email already exist.';
        $_SESSION['active_form'] = 'register';

    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL, FILTER_SANITIZE_EMAIL)) {
        $_SESSION['reg_error'] = 'Invalid email format.';
        $_SESSION['active_form'] = 'register';

        } else {
            if (validate($username)) {
                $_SESSION['reg_error'] = "Username cannot contain any special characters.";
                $_SESSION['active_form'] = 'register';
            }
            elseif ($_POST['password'] !== $_POST['cpassword']) {
                $_SESSION['pass_error'] = 'Password do not match.';
                $_SESSION['active_form'] = 'register';
    
            } elseif (strlen($_POST['password']) < 8) {
                $_SESSION['pass_error'] = 'Password must be 8 or more characters.';
                $_SESSION['active_form'] = 'register';
            } else {
                $insertQ = $conn->prepare("INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)");
                $insertQ->bind_param('ssss',$username,$email,$password,$role);
                $insertQ->execute();

                if ($insertQ->affected_rows !== 1) {
                $_SESSION['reg_error'] = 'Registration failed. Please try again.';
                $_SESSION['active_form'] = 'register';
                }
            }
        }
    header('Location: ../frontend/index.php');
    exit();
}

if (isset($_POST['login'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $checkUserQ = $conn->prepare('SELECT username, email, password, role FROM users WHERE email = ? LIMIT 1');
    $checkUserQ->bind_param('s', $email);
    $checkUserQ->execute();
    $user = $checkUserQ->get_result()->fetch_assoc();
    if ($user) {
        if (password_verify($password, $user['password'])) {
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            header("Location: ../frontend/jggmmd.php");
            exit();
        }
    }

    $_SESSION['log_error'] = "Invalid email or password.";
    $_SESSION['active_form'] = 'login';
    header("Location: ../frontend/index.php");
    exit();
}
            
?>