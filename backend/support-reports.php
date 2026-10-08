<?php
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

try {
    $conn->query(
        'CREATE TABLE IF NOT EXISTS support_report_events (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_support_report_events_reported_at (reported_at)
        ) ENGINE=InnoDB'
    );

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $conn->query('INSERT INTO support_report_events () VALUES ()');
    } elseif ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
        exit;
    }

    $totalQuery = $conn->query('SELECT COUNT(*) AS total FROM support_report_events');
    $total = (int) $totalQuery->fetch_assoc()['total'];

    $dailyQuery = $conn->query(
        'SELECT DATE(reported_at) AS report_date, COUNT(*) AS report_count
         FROM support_report_events
         WHERE reported_at >= CURRENT_DATE - INTERVAL 6 DAY
         GROUP BY DATE(reported_at)
         ORDER BY report_date ASC'
    );
    $countsByDate = [];
    foreach ($dailyQuery->fetch_all(MYSQLI_ASSOC) as $row) {
        $countsByDate[$row['report_date']] = (int) $row['report_count'];
    }

    $todayQuery = $conn->query('SELECT CURRENT_DATE AS report_today');
    $today = new DateTimeImmutable($todayQuery->fetch_assoc()['report_today']);
    $days = [];
    for ($offset = 6; $offset >= 0; $offset--) {
        $date = $today->modify("-$offset days")->format('Y-m-d');
        $days[] = ['date' => $date, 'count' => $countsByDate[$date] ?? 0];
    }

    echo json_encode(['total' => $total, 'days' => $days]);
} catch (Throwable $error) {
    error_log('Support report analytics failed: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Report analytics are temporarily unavailable.']);
}
