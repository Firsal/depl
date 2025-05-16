<?php
session_start();
header('Content-Type: application/json');

function isAuthenticated() {
    return isset($_SESSION['user_id']) && isset($_SESSION['session_token']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isAuthenticated()) {
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'user' => [
                'name' => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'role' => $_SESSION['user_role'] ?? 'user'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'authenticated' => false
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Неверный метод запроса']);
}
?> 