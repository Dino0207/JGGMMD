<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if (empty($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in.']);
    exit;
}

function accountBody(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

try {
    $body = accountBody();
    if (($body['action'] ?? '') === 'logout') {
        $_SESSION = [];
        session_destroy();
        echo json_encode(['message' => 'Logged out successfully.']);
        exit;
    }

    $username = $_SESSION['username'];
    $userQuery = $conn->prepare('SELECT id, password FROM users WHERE username = ? LIMIT 1');
    $userQuery->bind_param('s', $username);
    $userQuery->execute();
    $user = $userQuery->get_result()->fetch_assoc();

    if (!$user || !password_verify((string) ($body['current_password'] ?? ''), $user['password'])) {
        throw new RuntimeException('Current password is incorrect.');
    }

    if (($body['action'] ?? '') === 'password') {
        $newPassword = (string) ($body['new_password'] ?? '');
        if (strlen($newPassword) < 8 || $newPassword !== (string) ($body['confirm_password'] ?? '')) {
            throw new RuntimeException('New passwords must match and contain at least 8 characters.');
        }
        $password = password_hash($newPassword, PASSWORD_DEFAULT);
        $update = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
        $update->bind_param('si', $password, $user['id']);
        $update->execute();
        echo json_encode(['message' => 'Password changed successfully.']);
        exit;
    }

    if (($body['action'] ?? '') === 'email') {
        $email = trim((string) ($body['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Enter a valid email address.');
        }
        $update = $conn->prepare('UPDATE users SET email = ? WHERE id = ?');
        $update->bind_param('si', $email, $user['id']);
        $update->execute();
        $_SESSION['email'] = $email;
        echo json_encode(['message' => 'Email changed successfully.']);
        exit;
    }

    throw new RuntimeException('Unsupported account action.');
} catch (Throwable $error) {
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()]);
}
