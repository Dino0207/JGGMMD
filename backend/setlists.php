<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if (empty($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in.']);
    exit;
}

$conn->query(
    'CREATE TABLE IF NOT EXISTS setlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB'
);
$conn->query(
    'CREATE TABLE IF NOT EXISTS setlist_songs (
        setlist_id INT NOT NULL,
        song_id INT NOT NULL,
        position INT NOT NULL DEFAULT 0,
        PRIMARY KEY (setlist_id, song_id)
    ) ENGINE=InnoDB'
);

$userQuery = $conn->prepare('SELECT id, username FROM users WHERE username = ? LIMIT 1');
$userQuery->bind_param('s', $_SESSION['username']);
$userQuery->execute();
$user = $userQuery->get_result()->fetch_assoc();

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'User account not found.']);
    exit;
}
$userId = (int) $user['id'];

function requestBody(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function setlistBelongsToUser(mysqli $conn, int $setlistId, int $userId): bool
{
    $query = $conn->prepare('SELECT id FROM setlists WHERE id = ? AND user_id = ?');
    $query->bind_param('ii', $setlistId, $userId);
    $query->execute();
    return (bool) $query->get_result()->fetch_assoc();
}

function getSetlists(mysqli $conn, int $userId): array
{
    $query = $conn->prepare(
        'SELECT s.id, s.name, u.username AS username,
                ls.song_id, ls.position, l.title, l.author, l.lyrics
         FROM setlists s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN setlist_songs ls ON ls.setlist_id = s.id
         LEFT JOIN lyrics l ON l.id = ls.song_id
         WHERE s.user_id = ?
         ORDER BY s.updated_at DESC, ls.position ASC, l.title ASC'
    );
    $query->bind_param('i', $userId);
    $query->execute();

    $setlists = [];
    foreach ($query->get_result()->fetch_all(MYSQLI_ASSOC) as $row) {
        $id = (int) $row['id'];
        if (!isset($setlists[$id])) {
            $setlists[$id] = [
                'id' => $id,
                'name' => $row['name'],
                'username' => $row['username'],
                'songs' => []
            ];
        }
        if ($row['song_id'] !== null) {
            $setlists[$id]['songs'][] = [
                'id' => (int) $row['song_id'],
                'title' => $row['title'],
                'author' => $row['author'],
                'lyrics' => $row['lyrics']
            ];
        }
    }
    return array_values($setlists);
}

$method = $_SERVER['REQUEST_METHOD'];
$body = requestBody();

try {
    if ($method === 'GET') {
        echo json_encode(getSetlists($conn, (int) $user['id']));
        exit;
    }

    if ($method === 'POST') {
        $setlistId = (int) ($body['setlist_id'] ?? 0);
        $songId = (int) ($body['song_id'] ?? 0);

        if ($setlistId && $songId) {
            if (!setlistBelongsToUser($conn, $setlistId, (int) $user['id'])) {
                throw new RuntimeException('Setlist not found.');
            }
            $query = $conn->prepare(
                'INSERT IGNORE INTO setlist_songs (setlist_id, song_id, position)
                 SELECT ?, id, COALESCE((SELECT MAX(position) + 1 FROM setlist_songs WHERE setlist_id = ?), 0)
                 FROM lyrics WHERE id = ?'
            );
            $query->bind_param('iii', $setlistId, $setlistId, $songId);
            $query->execute();
        } else {
            $name = trim((string) ($body['name'] ?? ''));
            if ($name === '') {
                throw new RuntimeException('Setlist name is required.');
            }
            $query = $conn->prepare('INSERT INTO setlists (user_id, name) VALUES (?, ?)');
            $query->bind_param('is', $userId, $name);
            $query->execute();
        }
        echo json_encode(getSetlists($conn, (int) $user['id']));
        exit;
    }

    if ($method === 'PUT') {
        $setlistId = (int) ($body['setlist_id'] ?? 0);
        $name = trim((string) ($body['name'] ?? ''));
        if (!$setlistId || $name === '' || !setlistBelongsToUser($conn, $setlistId, (int) $user['id'])) {
            throw new RuntimeException('Setlist update is invalid.');
        }
        $query = $conn->prepare('UPDATE setlists SET name = ? WHERE id = ?');
        $query->bind_param('si', $name, $setlistId);
        $query->execute();
        echo json_encode(getSetlists($conn, (int) $user['id']));
        exit;
    }

    if ($method === 'DELETE') {
        $setlistId = (int) ($body['setlist_id'] ?? 0);
        $songId = (int) ($body['song_id'] ?? 0);
        if (!$setlistId || !setlistBelongsToUser($conn, $setlistId, (int) $user['id'])) {
            throw new RuntimeException('Setlist not found.');
        }
        if ($songId) {
            $query = $conn->prepare('DELETE FROM setlist_songs WHERE setlist_id = ? AND song_id = ?');
            $query->bind_param('ii', $setlistId, $songId);
        } else {
            $query = $conn->prepare('DELETE FROM setlists WHERE id = ?');
            $query->bind_param('i', $setlistId);
        }
        $query->execute();
        echo json_encode(getSetlists($conn, (int) $user['id']));
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
} catch (Throwable $error) {
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()]);
}