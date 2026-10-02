<?php
/**
 * GET /api/home.php
 * Single call that returns everything the homepage renders,
 * so the first paint needs only one round-trip.
 */

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

if (providerName() === 'paid') {
    require_once __DIR__ . '/provider_paid.php';
}

require_once __DIR__ . '/data/mock.php';

$markets = getAllMarkets();

// The board is built from the clock, not from a frozen fixture list, so the
// top of the page changes through the day exactly like the live site.
$live = mockLiveBoard();

$sec = sections();

respond([
    'ok'       => true,
    'provider' => providerName(),
    'updatedAt' => gmdate('c'),
    'data'     => [
        'todayLuckyNumber' => [
            'goldenAnk' => $sec['goldenAnk'],
            // Independent dataset - NOT derived from the jodi digit.
            'finalAnk'  => $sec['finalAnk'],
        ],
        'liveResults'    => $live,
        'markets'        => $markets,
        'starline'       => $sec['starlineTables']['mainStarline'],
        'starlineTables' => $sec['starlineTables'],
        'weeklyCharts'   => $sec['weeklyCharts'],
        'freeGame'       => $sec['freeGame'],
        'dayTables'      => $sec['dayTables'],
        'passList'       => $sec['passList'],
        'passListDate'   => $sec['passListDate'],
        'linkZones'      => $sec['linkZones'],
    ],
]);
