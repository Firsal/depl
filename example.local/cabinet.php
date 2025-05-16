<?php
session_start();
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Требуется авторизация']);
    exit;
}

$user_id = $_SESSION['user_id'];

switch ($_GET['action'] ?? '') {
    case 'get_profile':
        $stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE id = ?');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'user' => $user]);
        break;
    case 'update_profile':
        $data = json_decode(file_get_contents('php://input'), true);
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        if (!$name || !$email) {
            echo json_encode(['success' => false, 'message' => 'Имя и email обязательны']);
            exit;
        }
        $stmt = $pdo->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
        $stmt->execute([$name, $email, $user_id]);
        echo json_encode(['success' => true, 'message' => 'Профиль обновлён']);
        break;
    case 'get_favorites':
        $stmt = $pdo->prepare('SELECT id, game_name FROM favorite_games WHERE user_id = ?');
        $stmt->execute([$user_id]);
        $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'games' => $games]);
        break;
    case 'add_favorite':
        $data = json_decode(file_get_contents('php://input'), true);
        $game = trim($data['game_name'] ?? '');
        if (!$game) {
            echo json_encode(['success' => false, 'message' => 'Название игры обязательно']);
            exit;
        }
        $stmt = $pdo->prepare('INSERT INTO favorite_games (user_id, game_name) VALUES (?, ?)');
        $stmt->execute([$user_id, $game]);
        echo json_encode(['success' => true, 'message' => 'Игра добавлена']);
        break;
    case 'delete_favorite':
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare('DELETE FROM favorite_games WHERE id = ? AND user_id = ?');
        $stmt->execute([$id, $user_id]);
        echo json_encode(['success' => true, 'message' => 'Игра удалена']);
        break;
    case 'get_bookings':
        $stmt = $pdo->prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC, time_from DESC');
        $stmt->execute([$user_id]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'bookings' => $bookings]);
        break;
    case 'get_notifications':
        // Получить последнее уведомление о статусе брони
        $stmt = $pdo->prepare('SELECT id, status FROM bookings WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 1');
        $stmt->execute([$user_id]);
        $last = $stmt->fetch(PDO::FETCH_ASSOC);
        $notified = $_SESSION['last_notified_booking'] ?? null;
        if ($last && $last['id'] != $notified && in_array($last['status'], ['confirmed','cancelled'])) {
            $_SESSION['last_notified_booking'] = $last['id'];
            $msg = $last['status'] === 'confirmed' ? 'Ваша бронь подтверждена!' : 'Ваша бронь отменена администратором.';
            echo json_encode(['success' => true, 'message' => $msg]);
        } else {
            echo json_encode(['success' => false]);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Неизвестное действие']);
} 