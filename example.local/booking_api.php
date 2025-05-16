<?php
session_start();
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Требуется авторизация']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $table_number = intval($data['table_number'] ?? 0);
    $booking_date = $data['booking_date'] ?? '';
    $time_from = $data['time_from'] ?? '';
    $duration = intval($data['duration'] ?? 0);
    $phone = $data['phone'] ?? '';
    $comments = $data['comments'] ?? '';

    if (!$table_number || !$booking_date || !$time_from || !$duration || !$phone) {
        echo json_encode(['success' => false, 'message' => 'Все поля обязательны']);
        exit;
    }

    // Универсальная серверная проверка телефона: минимум 10 цифр
    $digits = preg_replace('/\D/', '', $phone);
    if (strlen($digits) < 10) {
        echo json_encode(['success' => false, 'message' => 'Некорректный номер телефона (минимум 10 цифр)']);
        exit;
    }

    // Рассчитываем время окончания брони
    $time_from_obj = new DateTime($time_from);
    $time_to_obj = clone $time_from_obj;
    $time_to_obj->add(new DateInterval("PT{$duration}H"));
    $time_to = $time_to_obj->format('H:i:s');

    // Корректная проверка занятости столика по времени (учитываем confirmed и pending)
    $stmt = $pdo->prepare('SELECT * FROM bookings WHERE table_number = ? AND booking_date = ? AND status IN ("confirmed", "pending") AND NOT (time_to <= ? OR time_from >= ?)');
    $stmt->execute([$table_number, $booking_date, $time_from, $time_to]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Столик уже занят или ожидает подтверждения на это время']);
        exit;
    }

    // Создание брони со статусом pending
    $stmt = $pdo->prepare('INSERT INTO bookings (user_id, table_number, booking_date, time_from, time_to, phone, comments, status) VALUES (?, ?, ?, ?, ?, ?, ?, "pending")');
    $stmt->execute([$user_id, $table_number, $booking_date, $time_from, $time_to, $phone, $comments]);
    echo json_encode(['success' => true, 'message' => 'Бронирование успешно создано и ожидает подтверждения администратора']);
} else {
    echo json_encode(['success' => false, 'message' => 'Неверный метод запроса']);
} 