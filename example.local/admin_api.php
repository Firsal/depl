<?php
session_start();
require_once 'db_connect.php';
header('Content-Type: application/json');

if (
    ($_SERVER['REQUEST_METHOD'] !== 'GET') &&
    (!isset($_SESSION['user_id']) || ($_SESSION['user_role'] ?? 'user') !== 'admin')
) {
    echo json_encode(['success' => false, 'message' => 'Доступ запрещён']);
    exit;
}

switch ($_GET['entity'] ?? '') {
    case 'event':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $pdo->query('SELECT * FROM events ORDER BY event_date DESC, id DESC');
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'events' => $events]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $title = trim($data['title'] ?? '');
            $desc = $data['description'] ?? '';
            $date = $data['event_date'] ?? null;
            $img = $data['image'] ?? null;
            $stmt = $pdo->prepare('INSERT INTO events (title, description, event_date, image) VALUES (?, ?, ?, ?)');
            $stmt->execute([$title, $desc, $date, $img]);
            echo json_encode(['success' => true, 'message' => 'Мероприятие добавлено']);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = intval($data['id'] ?? 0);
            $title = trim($data['title'] ?? '');
            $desc = $data['description'] ?? '';
            $date = $data['event_date'] ?? null;
            $img = $data['image'] ?? null;
            $stmt = $pdo->prepare('UPDATE events SET title=?, description=?, event_date=?, image=? WHERE id=?');
            $stmt->execute([$title, $desc, $date, $img, $id]);
            echo json_encode(['success' => true, 'message' => 'Мероприятие обновлено']);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = intval($_GET['id'] ?? 0);
            $stmt = $pdo->prepare('DELETE FROM events WHERE id=?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Мероприятие удалено']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверный метод']);
        }
        break;
    case 'promo':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $pdo->query('SELECT * FROM promos ORDER BY valid_from DESC, id DESC');
            $promos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'promos' => $promos]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $title = trim($data['title'] ?? '');
            $desc = $data['description'] ?? '';
            $from = $data['valid_from'] ?? null;
            $to = $data['valid_to'] ?? null;
            $img = $data['image'] ?? null;
            $stmt = $pdo->prepare('INSERT INTO promos (title, description, valid_from, valid_to, image) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$title, $desc, $from, $to, $img]);
            echo json_encode(['success' => true, 'message' => 'Акция добавлена']);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = intval($data['id'] ?? 0);
            $title = trim($data['title'] ?? '');
            $desc = $data['description'] ?? '';
            $from = $data['valid_from'] ?? null;
            $to = $data['valid_to'] ?? null;
            $img = $data['image'] ?? null;
            $stmt = $pdo->prepare('UPDATE promos SET title=?, description=?, valid_from=?, valid_to=?, image=? WHERE id=?');
            $stmt->execute([$title, $desc, $from, $to, $img, $id]);
            echo json_encode(['success' => true, 'message' => 'Акция обновлена']);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = intval($_GET['id'] ?? 0);
            $stmt = $pdo->prepare('DELETE FROM promos WHERE id=?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Акция удалена']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверный метод']);
        }
        break;
    case 'booking':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            // Получить все бронирования с данными пользователя
            $stmt = $pdo->query('SELECT b.*, u.name, u.email FROM bookings b JOIN users u ON b.user_id = u.id ORDER BY b.booking_date DESC, b.time_from DESC');
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'bookings' => $bookings]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Подтвердить бронь
            $data = json_decode(file_get_contents('php://input'), true);
            $id = intval($data['id'] ?? 0);
            $stmt = $pdo->prepare('UPDATE bookings SET status = "confirmed" WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Бронь подтверждена']);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = intval($_GET['id'] ?? 0);
            $force = isset($_GET['force']) && $_GET['force'] == 1;
            if ($force) {
                // Полное удаление только если статус cancelled
                $stmt = $pdo->prepare('SELECT status FROM bookings WHERE id = ?');
                $stmt->execute([$id]);
                $status = $stmt->fetchColumn();
                if ($status === 'cancelled') {
                    $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = ?');
                    $stmt->execute([$id]);
                    echo json_encode(['success' => true, 'message' => 'Бронь полностью удалена']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Удалять навсегда можно только отменённые заявки']);
                }
            } else {
                // Обычная отмена
                $stmt = $pdo->prepare('UPDATE bookings SET status = "cancelled" WHERE id = ?');
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Бронь отменена']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверный метод запроса']);
        }
        break;
    case 'masterclass':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $pdo->query('SELECT * FROM masterclasses ORDER BY masterclass_date DESC, id DESC');
            $masterclasses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'masterclasses' => $masterclasses]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $title = trim($data['title'] ?? '');
            $desc = $data['description'] ?? '';
            $date = $data['masterclass_date'] ?? null;
            $img = $data['image'] ?? null;
            $stmt = $pdo->prepare('INSERT INTO masterclasses (title, description, masterclass_date, image) VALUES (?, ?, ?, ?)');
            $stmt->execute([$title, $desc, $date, $img]);
            echo json_encode(['success' => true, 'message' => 'Мастер-класс добавлен']);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = intval($data['id'] ?? 0);
            $title = trim($data['title'] ?? '');
            $desc = $data['description'] ?? '';
            $date = $data['masterclass_date'] ?? null;
            $img = $data['image'] ?? null;
            $stmt = $pdo->prepare('UPDATE masterclasses SET title=?, description=?, masterclass_date=?, image=? WHERE id=?');
            $stmt->execute([$title, $desc, $date, $img, $id]);
            echo json_encode(['success' => true, 'message' => 'Мастер-класс обновлён']);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = intval($_GET['id'] ?? 0);
            $stmt = $pdo->prepare('DELETE FROM masterclasses WHERE id=?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Мастер-класс удалён']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверный метод']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Неизвестная сущность']);
} 