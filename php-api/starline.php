<?php
/**
 * GET /api/starline.php[?slug=kalyan]
 * 15-minute interval rows used by the Starline result tables.
 */

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_once __DIR__ . '/data/mock.php';

$slug = trim((string) ($_GET['slug'] ?? ''));
$rows = mockStarline($slug);

respond([
    'ok'       => true,
    'provider' => providerName(),
    'slug'     => $slug,
    'count'    => count($rows),
    'data'     => $rows,
]);
