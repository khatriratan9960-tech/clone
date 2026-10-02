<?php
/**
 * GET /api/live-result.php
 * Polled every 15s by the React app (no full page reload, unlike the original).
 */

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

if (providerName() === 'paid') {
    require_once __DIR__ . '/provider_paid.php';
}

require_once __DIR__ . '/data/mock.php';

// Rebuilt on every poll from the current time, so a market moves through
// "Loading..." -> open pana -> full result as its window passes.
respond([
    'ok'        => true,
    'provider'  => providerName(),
    'updatedAt' => gmdate('c'),
    'data'      => mockLiveBoard(),
]);
