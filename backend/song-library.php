<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in.']);
    exit;
}

$userQuery = $conn->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
$userQuery->bind_param('s', $_SESSION['username']);
$userQuery->execute();
if (!$userQuery->get_result()->fetch_assoc()) {
    http_response_code(401);
    echo json_encode(['error' => 'User account not found.']);
    exit;
}

try {
    $dateColumn = $conn->query("SHOW COLUMNS FROM lyrics LIKE 'date_added'");
    if ($dateColumn->num_rows === 0) {
        $conn->query(
            'ALTER TABLE lyrics
             ADD COLUMN date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        );
    }

    $songsQuery = $conn->query(
        'SELECT l.id, l.title, l.author, l.lyrics, l.date_added,
                COALESCE(usage_counts.active_list_count, 0) AS active_list_count
         FROM lyrics l
         LEFT JOIN (
             SELECT ls.song_id, COUNT(DISTINCT ls.setlist_id) AS active_list_count
             FROM setlist_songs ls
             JOIN setlists active_lists ON active_lists.id = ls.setlist_id
             GROUP BY ls.song_id
         ) usage_counts ON usage_counts.song_id = l.id
         ORDER BY l.title ASC, l.id ASC'
    );
    $songs = $songsQuery->fetch_all(MYSQLI_ASSOC);
    foreach ($songs as &$song) {
        $song['id'] = (int) $song['id'];
        $song['active_list_count'] = (int) $song['active_list_count'];
    }
    unset($song);

    $listQuery = $conn->query('SELECT COUNT(*) AS active_list_count FROM setlists');
    $activeListCount = (int) $listQuery->fetch_assoc()['active_list_count'];
    $rankedSongs = $songs;
    usort($rankedSongs, static function (array $left, array $right): int {
        $usageOrder = $right['active_list_count'] <=> $left['active_list_count'];
        return $usageOrder !== 0 ? $usageOrder : strcasecmp((string) $left['title'], (string) $right['title']);
    });

    echo json_encode([
        'songs' => $songs,
        'analytics' => [
            'total_songs' => count($songs),
            'active_setlists' => $activeListCount,
            'most_used' => $rankedSongs[0] ?? null,
            'usage' => array_slice($rankedSongs, 0, 6)
        ]
    ]);
} catch (Throwable $error) {
    error_log('Song library analytics failed: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Unable to load song library analytics.']);
}
