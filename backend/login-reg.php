<?php
session_start();
require_once 'config.php';

if (isset($_POST['register'])) {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role = ($_POST['Role'] !== 'Singer') ? 'Musician' : 'Singer';


    $checkEmailQ = $conn->prepare("SELECT email FROM users WHERE email = ?");
    $checkEmailQ->bind_param('s', $email);
    $checkEmailQ->execute();
    $checkEmailQ->store_result();

    if ($checkEmailQ->num_rows > 0) {
        $_SESSION['reg_error'] = 'Email already exist.';
        $_SESSION['active_form'] = 'register';

        } else {
            if ($_POST['password'] !== $_POST['cpassword']) {
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

    $checkUserQ = $conn->query("SELECT * FROM users WHERE email = '$email'");
    if ($checkUserQ->num_rows > 0) {
        $user = $checkUserQ->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            if ($user['role'] === 'Singer') {
                header("Location: ../frontend/singer.php");
            } else if ($user['role'] === 'Musician') {
                header("Location: ../frontend/musician.php");
            }
            exit();
        }
    }

    $_SESSION['log_error'] = "Invalid email or password.";
    $_SESSION['active_form'] = 'login';
    header("Location: ../frontend/index.php");
    exit();
}
            
?>