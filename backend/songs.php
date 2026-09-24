<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if (empty($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in.']);
    exit;
}

$userQuery = $conn->prepare('SELECT role FROM users WHERE username = ? LIMIT 1');
$userQuery->bind_param('s', $_SESSION['username']);
$userQuery->execute();
$user = $userQuery->get_result()->fetch_assoc();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'User account not found.']);
    exit;
}

function body(): array
{
    $value = json_decode(file_get_contents('php://input'), true);
    return is_array($value) ? $value : [];
}

function validateSong(array $data): array
{
    $title = trim((string) ($data['title'] ?? ''));
    $author = trim((string) ($data['author'] ?? ''));
    $lyrics = trim((string) ($data['lyrics'] ?? ''));
    if ($title === '' || $author === '' || $lyrics === '') {
        throw new RuntimeException('Title, author, and lyrics are required.');
    }
    return [$title, $author, $lyrics];
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        if ($user['role'] !== 'Singer') {
            throw new RuntimeException('Only singers can add songs.');
        }
        [$title, $author, $lyrics] = validateSong(body());
        $query = $conn->prepare('INSERT INTO lyrics (title, author, lyrics) VALUES (?, ?, ?)');
        $query->bind_param('sss', $title, $author, $lyrics);
        $query->execute();
        echo json_encode(['id' => $query->insert_id, 'title' => $title, 'author' => $author, 'lyrics' => $lyrics]);
        exit;
    }

    if ($method === 'PUT') {
        $data = body();
        $songId = (int) ($data['id'] ?? 0);
        if (!$songId) {
            throw new RuntimeException('Song id is required.');
        }
        [$title, $author, $lyrics] = validateSong($data);
        $query = $conn->prepare('UPDATE lyrics SET title = ?, author = ?, lyrics = ? WHERE id = ?');
        $query->bind_param('sssi', $title, $author, $lyrics, $songId);
        $query->execute();
        if ($query->affected_rows === 0) {
            throw new RuntimeException('Song not found or unchanged.');
        }
        echo json_encode(['id' => $songId, 'title' => $title, 'author' => $author, 'lyrics' => $lyrics]);
        exit;
    }

    if ($method === 'DELETE') {
        if ($user['role'] !== 'Singer') {
            throw new RuntimeException('Only singers can delete songs.');
        }
        $songId = (int) (body()['id'] ?? 0);
        if (!$songId) {
            throw new RuntimeException('Song id is required.');
        }
        $query = $conn->prepare('DELETE FROM lyrics WHERE id = ?');
        $query->bind_param('i', $songId);
        $query->execute();
        if ($query->affected_rows === 0) {
            throw new RuntimeException('Song not found.');
        }
        echo json_encode(['deleted' => $songId]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
} catch (Throwable $error) {
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()]);
}