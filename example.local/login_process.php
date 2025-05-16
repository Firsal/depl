<?php
session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Неверный формат данных']);
        exit;
    }

    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // Валидация данных
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Все поля обязательны для заполнения']);
        exit;
    }

    try {
        // Получаем пользователя
        $stmt = $pdo->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Неверный email или пароль']);
            exit;
        }

        // Генерируем уникальный токен сессии
        $sessionToken = bin2hex(random_bytes(32));
        
        // Сохраняем данные в сессии
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['session_token'] = $sessionToken;
        
        // Обновляем время последнего входа
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);

        echo json_encode([
            'success' => true, 
            'message' => 'Вход выполнен успешно',
            'user' => [
                'name' => $user['name'],
                'email' => $user['email']
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка при входе: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Неверный метод запроса']);
}
?> 