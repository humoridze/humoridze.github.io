<?php
$env = parse_ini_file(__DIR__ . '/../.env');

define('BOT_TOKEN', $env['BOT_TOKEN']);
define('CHAT_ID', $env['CHAT_ID']);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

function clean(string $str): string {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

$name    = clean($_POST['name']    ?? '');
$phone   = clean($_POST['phone']   ?? '');
$service = clean($_POST['service'] ?? '');
$date    = clean($_POST['date']    ?? '');
$message = clean($_POST['message'] ?? '');

if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Заполните обязательные поля']);
    exit;
}

if (mb_strlen($name) > 100 || mb_strlen($phone) > 30) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Слишком длинные данные']);
    exit;
}

$dateStr = $date ? date('d.m.Y', strtotime($date)) : 'не указана';

$text  = "📸 *Новая заявка на съёмку!*\n\n";
$text .= "👤 *Имя:* {$name}\n";
$text .= "📞 *Телефон:* {$phone}\n";

if (!empty($service)) {
    $text .= "🎯 *Вид съёмки:* {$service}\n";
}

$text .= "📅 *Дата съёмки:* {$dateStr}\n";

if (!empty($message)) {
    $text .= "\n💬 *Сообщение:*\n{$message}\n";
}

$text .= "\n⏰ " . date('d.m.Y H:i', time() + 3 * 3600) . " (МСК)"; // UTC+3

$url  = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";
$body = json_encode([
    'chat_id'    => CHAT_ID,
    'text'       => $text,
    'parse_mode' => 'Markdown',
]);

$options = [
    'http' => [
        'method'        => 'POST',
        'header'        => "Content-Type: application/json\r\nContent-Length: " . strlen($body) . "\r\n",
        'content'       => $body,
        'timeout'       => 10,
        'ignore_errors' => true,
    ],
];

$context  = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === false) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
    }
}

$tgResult = $response ? json_decode($response, true) : null;

if ($tgResult && isset($tgResult['ok']) && $tgResult['ok'] === true) {
    echo json_encode(['ok' => true]);
} else {
    error_log('Telegram API error: ' . ($response ?: 'No response'));
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Ошибка отправки в Telegram']);
}
