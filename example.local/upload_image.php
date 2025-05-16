<?php
session_start();
header('Content-Type: application/json');

// Только для админа
if (!isset($_SESSION['user_id']) || ($_SESSION['user_role'] ?? 'user') !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Доступ запрещён']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['image'])) {
    echo json_encode(['success' => false, 'message' => 'Неверный запрос']);
    exit;
}

$file = $_FILES['image'];
$allowed = ['image/jpeg', 'image/png', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5 МБ

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Ошибка загрузки файла']);
    exit;
}
if (!in_array($file['type'], $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Разрешены только JPG, PNG, WEBP']);
    exit;
}
if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'Файл слишком большой (макс. 5 МБ)']);
    exit;
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'promo_' . uniqid() . '.' . $ext;
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
$target = $uploadDir . $filename;
if (!move_uploaded_file($file['tmp_name'], $target)) {
    echo json_encode(['success' => false, 'message' => 'Не удалось сохранить файл']);
    exit;
}
$url = 'uploads/' . $filename;
echo json_encode(['success' => true, 'url' => $url]); 