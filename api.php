<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const MAX_FILE_SIZE = 10485760;
const UPLOAD_DIR = __DIR__ . '/uploads/';
const ALLOWED_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

function respond(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function ensureUploadDirectory(): void
{
    if (!is_dir(UPLOAD_DIR) && !mkdir(UPLOAD_DIR, 0755, true)) {
        respond(['error' => 'The upload folder could not be created.'], 500);
    }
}

function safeDisplayName(string $name): string
{
    $clean = preg_replace('/[^A-Za-z0-9._ -]/', '-', basename($name));
    return substr($clean ?: 'image', 0, 120);
}

ensureUploadDirectory();
$action = $_GET['action'] ?? 'list';

if ($action === 'list') {
    $images = [];
    foreach (glob(UPLOAD_DIR . '*.{jpg,jpeg,png,webp,gif}', GLOB_BRACE) ?: [] as $path) {
        if (!is_file($path)) continue;
        $file = basename($path);
        $separator = strpos($file, '__');
        $displayName = $separator === false ? $file : substr($file, $separator + 2);
        $images[] = [
            'file' => $file,
            'name' => $displayName,
            'size' => filesize($path),
            'uploaded' => filemtime($path),
            'url' => 'uploads/' . rawurlencode($file),
        ];
    }
    usort($images, fn(array $a, array $b): int => $b['uploaded'] <=> $a['uploaded']);
    respond(['images' => array_slice($images, 0, 100)]);
}

if ($action === 'upload') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(['error' => 'POST is required.'], 405);
    }
    if (!isset($_FILES['image'])) {
        respond(['error' => 'Please choose an image.'], 400);
    }

    $image = $_FILES['image'];
    if ($image['error'] !== UPLOAD_ERR_OK) {
        $message = $image['error'] === UPLOAD_ERR_INI_SIZE
            ? 'The server upload limit is smaller than this image.'
            : 'The upload did not finish.';
        respond(['error' => $message], 400);
    }
    if ($image['size'] > MAX_FILE_SIZE) {
        respond(['error' => 'The image must be 10 MB or smaller.'], 413);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($image['tmp_name']);
    if (!isset(ALLOWED_TYPES[$mime])) {
        respond(['error' => 'Only JPG, PNG, WebP, and GIF images are accepted.'], 415);
    }

    $original = safeDisplayName($image['name']);
    $base = pathinfo($original, PATHINFO_FILENAME);
    $extension = ALLOWED_TYPES[$mime];
    $storedName = time() . '-' . bin2hex(random_bytes(8)) . '__' . $base . '.' . $extension;
    if (!move_uploaded_file($image['tmp_name'], UPLOAD_DIR . $storedName)) {
        respond(['error' => 'The server could not save this image.'], 500);
    }
    respond(['uploaded' => true], 201);
}

if ($action === 'delete') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(['error' => 'POST is required.'], 405);
    }
    $file = basename($_POST['file'] ?? '');
    if ($file === '' || !preg_match('/^[A-Za-z0-9._-]+$/', $file)) {
        respond(['error' => 'Invalid image name.'], 400);
    }
    $path = UPLOAD_DIR . $file;
    if (!is_file($path)) {
        respond(['error' => 'This image no longer exists.'], 404);
    }
    if (!unlink($path)) {
        respond(['error' => 'The server could not delete this image.'], 500);
    }
    respond(['deleted' => true]);
}

respond(['error' => 'Unknown action.'], 404);
