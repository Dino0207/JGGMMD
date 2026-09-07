<?php
require_once 'config.php';

header('Content-Type: application/json');

$search = trim($_GET['q'] ?? '');
$term = "%$search%";

$query = $conn->prepare(
    'SELECT id, title, author, lyrics FROM lyrics
     WHERE title LIKE ? OR author LIKE ?
     ORDER BY title'
);
$query->bind_param('ss', $term, $term);
$query->execute();

$result = $query->get_result();
$songs = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($songs);