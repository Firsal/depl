<?php
require_once 'db_connect.php';

// Включаем отображение ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        echo json_encode([
            'success' => false, 
            'message' => 'Неверный формат данных',
            'debug' => ['raw_input' => file_get_contents('php://input')]
        ]);
        exit;
    }

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = 'user';
    if (isset($data['role']) && $data['role'] === 'admin' && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin') {
        $role = 'admin';
    }

    // Валидация данных
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Все поля обязательны для заполнения',
            'debug' => ['name' => $name, 'email' => $email, 'password_length' => strlen($password)]
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Неверный формат email',
            'debug' => ['email' => $email]
        ]);
        exit;
    }

    if (strlen($password) < 6) {
        echo json_encode([
            'success' => false, 
            'message' => 'Пароль должен содержать минимум 6 символов'
        ]);
        exit;
    }

    try {
        // Проверка существования пользователя
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => false, 
                'message' => 'Пользователь с таким email уже существует'
            ]);
            exit;
        }

        // Хеширование пароля
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Добавление пользователя
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, created_at, role) VALUES (?, ?, ?, NOW(), ?)");
        $result = $stmt->execute([$name, $email, $hashedPassword, $role]);

        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Регистрация успешно завершена',
                'debug' => ['user_id' => $pdo->lastInsertId()]
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Ошибка при создании пользователя',
                'debug' => ['error_info' => $stmt->errorInfo()]
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Ошибка при регистрации: ' . $e->getMessage(),
            'debug' => [
                'error_code' => $e->getCode(),
                'error_info' => $e->errorInfo ?? null
            ]
        ]);
    }
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Неверный метод запроса',
        'debug' => ['method' => $_SERVER['REQUEST_METHOD']]
    ]);
}
?> 