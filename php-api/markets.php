<?php
/**
 * GET /api/markets.php            -> all jodi/panel markets
 * GET /api/markets.php?slug=kalyan -> one market
 * GET /api/markets.php?limit=20
 */

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

if (providerName() === 'paid') {
    require_once __DIR__ . '/provider_paid.php';
}

$slug  = trim((string) ($_GET['slug'] ?? ''));
$limit = (int) ($_GET['limit'] ?? 0);

$all = getAllMarkets();

if ($slug !== '') {
    $one = getMarketBySlug($slug);
    if ($one === null) {
        fail('Unknown market slug: ' . $slug, 404);
    }
    respond(['ok' => true, 'provider' => providerName(), 'data' => $one]);
}

if ($limit > 0) {
    $all = array_slice($all, 0, $limit);
}

respond([
    'ok'       => true,
    'provider' => providerName(),
    'count'    => count($all),
    'data'     => $all,
]);
