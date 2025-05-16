<?php
require_once 'db_connect.php';
header('Content-Type: application/json');
$date = $_GET['date'] ?? '';
$time = $_GET['time'] ?? '';
$duration = intval($_GET['duration'] ?? 0);
if (!$date || !$time || !$duration) {
    echo json_encode([]);
    exit;
}
$time_from_obj = new DateTime($time);
$time_to_obj = clone $time_from_obj;
$time_to_obj->add(new DateInterval("PT{$duration}H"));
$time_to = $time_to_obj->format('H:i:s');

// Получаем все брони на эту дату с пересечением по времени
$stmt = $pdo->prepare('SELECT table_number, status FROM bookings WHERE booking_date = ? AND status IN ("confirmed", "pending") AND NOT (time_to <= ? OR time_from >= ?)');
$stmt->execute([$date, $time, $time_to]);
$statuses = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $table = $row['table_number'];
    // confirmed важнее pending
    if (!isset($statuses[$table]) || $row['status'] === 'confirmed') {
        $statuses[$table] = $row['status'];
    }
}
// Для остальных столов — available
for ($i = 1; $i <= 5; $i++) {
    if (!isset($statuses[$i])) $statuses[$i] = 'available';
}
echo json_encode($statuses); 