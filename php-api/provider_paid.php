<?php
/**
 * Paid provider adapter — INCOMPLETE BY DESIGN.
 *
 * Fill this in once the vendor sends you credentials + docs.
 * Everything else in the app already speaks our normalized schema,
 * so you only touch this file.
 *
 * MUST CONFIRM WITH THE VENDOR BEFORE GOING LIVE:
 *   [ ] Base URL + endpoint paths
 *   [ ] Auth style (header X-API-Key vs ?api_key= query)
 *   [ ] Rate limit (we poll live results every 15s = 240 req/hour)
 *   [ ] How a not-yet-drawn market is signalled (null / absent / "0")
 *   [ ] Field names for open, close, jodi, times, ank
 *   [ ] Historical depth (we need 100 days jodi+panel, 240 starline rows)
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function paidProviderFetchAll(): array
{
    if (!defined('MATKA_API_BASE') || MATKA_API_BASE === '') {
        // Fail loudly rather than silently serving empty pages in production.
        http_response_code(503);
        echo json_encode([
            'ok' => false,
            'error' => 'Paid provider not configured. Set MATKA_API_BASE / MATKA_API_KEY in api/config.php',
        ]);
        exit;
    }

    $url = MATKA_API_BASE . '/live-result';
    $ch  = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => [
            'X-API-Key: ' . MATKA_API_KEY,
            'Accept: application/json',
        ],
    ]);

    $body = curl_exec($ch);

    if ($body === false) {
        $err = curl_error($ch);
        curl_close($ch);
        http_response_code(502);
        echo json_encode(['ok' => false, 'error' => 'Upstream API error: ' . $err]);
        exit;
    }

    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status !== 200) {
        http_response_code(502);
        echo json_encode(['ok' => false, 'error' => 'Upstream returned HTTP ' . $status]);
        exit;
    }

    $decoded = json_decode($body, true);
    if (!is_array($decoded)) {
        http_response_code(502);
        echo json_encode(['ok' => false, 'error' => 'Upstream returned invalid JSON']);
        exit;
    }

    // TODO: map the vendor's field names onto our schema.
    // Vendor shape is unknown until docs arrive. Expected ours:
    //   [ ['market'=>..,'open'=>..,'close'=>..,'jodi'=>..,
    //      'openTime'=>..,'closeTime'=>..,'slug'=>..], ... ]
    return is_array($decoded['data'] ?? null) ? $decoded['data'] : [];
}
