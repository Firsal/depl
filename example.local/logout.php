<?php
session_start();
header('Content-Type: application/json');

// Очищаем все данные сессии
session_unset();
session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Выход выполнен успешно'
]);
?> 