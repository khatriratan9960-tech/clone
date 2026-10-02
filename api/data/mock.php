<?php
/**
 * MOCK DATA PROVIDER - seeded from the live dpboss.tax homepage on 2026-01-10.
 * 168 jodi/panel markets (with open/close times) + 14 live-result markets.
 *
 * Replace by switching provider to "paid" - see api/config.php
 * No React component needs to change.
 */

declare(strict_types=1);

/** All jodi + panel markets with open/close/jodi and draw times. */
function mockMarkets(): array
{
    return [
    ['market' => 'KALYAN MORNING', 'open' => '257', 'close' => '48', 'jodi' => '369', 'openTime' => '11:40 AM', 'closeTime' => '12:40 PM', 'slug' => 'kalyan-morning'],
    ['market' => 'MILAN MORNING', 'open' => '280', 'close' => '03', 'jodi' => '355', 'openTime' => '10:30 AM', 'closeTime' => '11:30 AM', 'slug' => 'milan-morning'],
    ['market' => 'SRIDEVI', 'open' => '390', 'close' => '29', 'jodi' => '289', 'openTime' => '11:35 AM', 'closeTime' => '12:35 PM', 'slug' => 'sridevi'],
    ['market' => 'MAIN BAZAR MORNING', 'open' => '589', 'close' => '28', 'jodi' => '189', 'openTime' => '11:15 AM', 'closeTime' => '12:15 PM', 'slug' => 'main-bazar-morning'],
    ['market' => 'MADHURI', 'open' => '115', 'close' => '73', 'jodi' => '670', 'openTime' => '11:45 AM', 'closeTime' => '12:45 PM', 'slug' => 'madhuri'],
    ['market' => 'SRIDEVI MORNING', 'open' => '189', 'close' => '82', 'jodi' => '570', 'openTime' => '10:10 AM', 'closeTime' => '11:10 AM', 'slug' => 'sridevi-morning'],
    ['market' => 'MAHARANI', 'open' => '126', 'close' => '91', 'jodi' => '344', 'openTime' => '12:15 PM', 'closeTime' => '02:15 PM', 'slug' => 'maharani'],
    ['market' => 'KARNATAKA DAY', 'open' => '336', 'close' => '29', 'jodi' => '667', 'openTime' => '10:00 AM', 'closeTime' => '11:00 AM', 'slug' => 'karnataka-day'],
    ['market' => 'TIME BAZAR MORNING', 'open' => '149', 'close' => '40', 'jodi' => '460', 'openTime' => '11:10 AM', 'closeTime' => '12:10 PM', 'slug' => 'time-bazar-morning'],
    ['market' => 'MAIN SRIDEVI DAY', 'open' => '150', 'close' => '66', 'jodi' => '150', 'openTime' => '01:05 PM', 'closeTime' => '02:05 PM', 'slug' => 'main-sridevi-day'],
    ['market' => 'TIME BAZAR', 'open' => '699', 'close' => '48', 'jodi' => '260', 'openTime' => '01:00 PM', 'closeTime' => '02:00 PM', 'slug' => 'time-bazar'],
    ['market' => 'TARA MUMBAI DAY', 'open' => '367', 'close' => '64', 'jodi' => '680', 'openTime' => '01:35 PM', 'closeTime' => '03:00 PM', 'slug' => 'tara-mumbai-day'],
    ['market' => 'PRABHAT', 'open' => '688', 'close' => '24', 'jodi' => '789', 'openTime' => '01:25 PM', 'closeTime' => '03:05 PM', 'slug' => 'prabhat'],
    ['market' => 'DIAMOND', 'open' => '556', 'close' => '61', 'jodi' => '560', 'openTime' => '01:30 PM', 'closeTime' => '03:00 PM', 'slug' => 'diamond'],
    ['market' => 'TIME BAZAR DAY', 'open' => '247', 'close' => '36', 'jodi' => '150', 'openTime' => '02:45 PM', 'closeTime' => '04:45 PM', 'slug' => 'time-bazar-day'],
    ['market' => 'MILAN DAY', 'open' => '113', 'close' => '52', 'jodi' => '129', 'openTime' => '03:00 PM', 'closeTime' => '05:00 PM', 'slug' => 'milan-day'],
    ['market' => 'MAIN BAZAR DAY', 'open' => '390', 'close' => '26', 'jodi' => '178', 'openTime' => '03:35 PM', 'closeTime' => '05:35 PM', 'slug' => 'main-bazar-day'],
    ['market' => 'PUNA BAZAR', 'open' => '678', 'close' => '10', 'jodi' => '578', 'openTime' => '01:30 PM', 'closeTime' => '03:30 PM', 'slug' => 'puna-bazar'],
    ['market' => 'MUMBAI MORNING', 'open' => '366', 'close' => '59', 'jodi' => '360', 'openTime' => '01:40 PM', 'closeTime' => '02:40 PM', 'slug' => 'mumbai-morning'],
    ['market' => 'NEW TIME BAZAR', 'open' => '179', 'close' => '78', 'jodi' => '134', 'openTime' => '01:00 PM', 'closeTime' => '02:00 PM', 'slug' => 'new-time-bazar'],
    ['market' => 'KALYAN', 'open' => '399', 'close' => '18', 'jodi' => '567', 'openTime' => '04:35 PM', 'closeTime' => '06:35 PM', 'slug' => 'kalyan'],
    ['market' => 'SRIDEVI NIGHT', 'open' => '357', 'close' => '5', 'jodi' => null, 'openTime' => '07:15 PM', 'closeTime' => '08:15 PM', 'slug' => 'sridevi-night'],
    ['market' => 'MADHURI NIGHT', 'open' => '890', 'close' => '7', 'jodi' => null, 'openTime' => '06:45 PM', 'closeTime' => '07:45 PM', 'slug' => 'madhuri-night'],
    ['market' => 'NIGHT TIME BAZAR', 'open' => '189', 'close' => '82', 'jodi' => '228', 'openTime' => '08:57 PM', 'closeTime' => '10:57 PM', 'slug' => 'night-time-bazar'],
    ['market' => 'TARA MUMBAI NIGHT', 'open' => '349', 'close' => '63', 'jodi' => '599', 'openTime' => '08:30 PM', 'closeTime' => '10:30 PM', 'slug' => 'tara-mumbai-night'],
    ['market' => 'MILAN NIGHT', 'open' => '246', 'close' => '21', 'jodi' => '579', 'openTime' => '09:10 PM', 'closeTime' => '11:10 PM', 'slug' => 'milan-night'],
    ['market' => 'RAJDHANI NIGHT', 'open' => '260', 'close' => '84', 'jodi' => '257', 'openTime' => '09:35 PM', 'closeTime' => '11:45 PM', 'slug' => 'rajdhani-night'],
    ['market' => 'MAIN BAZAR', 'open' => '359', 'close' => '72', 'jodi' => '589', 'openTime' => '10:00 PM', 'closeTime' => '12:10 AM', 'slug' => 'main-bazar'],
    ['market' => 'RAJSHREE', 'open' => '224', 'close' => '87', 'jodi' => '278', 'openTime' => '11:15 AM', 'closeTime' => '12:15 PM', 'slug' => 'rajshree'],
    ['market' => 'MAIN SRIDEVI', 'open' => '679', 'close' => '26', 'jodi' => '150', 'openTime' => '11:45 AM', 'closeTime' => '12:45 PM', 'slug' => 'main-sridevi'],
    ['market' => 'MAHARANI DAY', 'open' => '357', 'close' => '53', 'jodi' => '148', 'openTime' => '05:15 PM', 'closeTime' => '07:15 PM', 'slug' => 'maharani-day'],
    ['market' => 'PAREL DAY', 'open' => '160', 'close' => '79', 'jodi' => '135', 'openTime' => '02:00 PM', 'closeTime' => '04:00 PM', 'slug' => 'parel-day'],
    ['market' => 'BOMBAY DAY', 'open' => '389', 'close' => '08', 'jodi' => '567', 'openTime' => '01:50 PM', 'closeTime' => '02:50 PM', 'slug' => 'bombay-day'],
    ['market' => 'KALYAN NIGHT', 'open' => '670', 'close' => '32', 'jodi' => '200', 'openTime' => '09:40 PM', 'closeTime' => '11:40 PM', 'slug' => 'kalyan-night'],
    ['market' => 'MUMBAI NIGHT', 'open' => '569', 'close' => '03', 'jodi' => '346', 'openTime' => '08:45 PM', 'closeTime' => '10:45 PM', 'slug' => 'mumbai-night'],
    ['market' => 'SUPREME MORNING', 'open' => '190', 'close' => '06', 'jodi' => '240', 'openTime' => '01:35 PM', 'closeTime' => '02:35 PM', 'slug' => 'supreme-morning'],
    ['market' => 'SRIDEVI DAY', 'open' => '245', 'close' => '13', 'jodi' => '689', 'openTime' => '01:35 PM', 'closeTime' => '02:35 PM', 'slug' => 'sridevi-day'],
    ['market' => 'PRABHAT NIGHT', 'open' => '248', 'close' => '49', 'jodi' => '568', 'openTime' => '08:20 PM', 'closeTime' => '10:20 PM', 'slug' => 'prabhat-night'],
    ['market' => 'SUPER DAY', 'open' => '330', 'close' => '60', 'jodi' => '226', 'openTime' => '01:10 PM', 'closeTime' => '02:15 PM', 'slug' => 'super-day'],
    ['market' => 'OLD MUMBAI', 'open' => '580', 'close' => '30', 'jodi' => '235', 'openTime' => '09:45 PM', 'closeTime' => '11:30 PM', 'slug' => 'old-mumbai'],
    ['market' => 'OLD MAIN MUMBAI', 'open' => '689', 'close' => '34', 'jodi' => '149', 'openTime' => '09:35 PM', 'closeTime' => '11:35 PM', 'slug' => 'old-main-mumbai'],
    ['market' => 'MADHUR MORNING', 'open' => '170', 'close' => '82', 'jodi' => '660', 'openTime' => '11:30 AM', 'closeTime' => '12:30 PM', 'slug' => 'madhur-morning'],
    ['market' => 'MADHUR DAY', 'open' => '245', 'close' => '14', 'jodi' => '239', 'openTime' => '01:30 PM', 'closeTime' => '02:30 PM', 'slug' => 'madhur-day'],
    ['market' => 'MADHUR NIGHT', 'open' => '668', 'close' => '03', 'jodi' => '670', 'openTime' => '08:30 PM', 'closeTime' => '10:30 PM', 'slug' => 'madhur-night'],
    ['market' => 'SHRI DAY', 'open' => '149', 'close' => '40', 'jodi' => '370', 'openTime' => '11:15 AM', 'closeTime' => '12:15 PM', 'slug' => 'shri-day'],
    ['market' => 'SHRI NIGHT', 'open' => '138', 'close' => '22', 'jodi' => '110', 'openTime' => '08:25 PM', 'closeTime' => '10:25 PM', 'slug' => 'shri-night'],
    ['market' => 'RATAN KHATRI', 'open' => '390', 'close' => '24', 'jodi' => '257', 'openTime' => '09:40 PM', 'closeTime' => '11:40 PM', 'slug' => 'ratan-khatri'],
    ['market' => 'WORLI MORNING', 'open' => '190', 'close' => '03', 'jodi' => '670', 'openTime' => '12:05 PM', 'closeTime' => '01:05 PM', 'slug' => 'worli-morning'],
    ['market' => 'WORLI NIGHT', 'open' => '128', 'close' => '18', 'jodi' => '260', 'openTime' => '08:05 PM', 'closeTime' => '09:05 PM', 'slug' => 'worli-night'],
    ['market' => 'MAHARANI NIGHT', 'open' => '469', 'close' => '93', 'jodi' => '238', 'openTime' => '10:15 PM', 'closeTime' => '12:15 AM', 'slug' => 'maharani-night'],
    ['market' => 'JAY SHREE DAY', 'open' => '250', 'close' => '72', 'jodi' => '589', 'openTime' => '11:21 AM', 'closeTime' => '12:21 PM', 'slug' => 'jay-shree-day'],
    ['market' => 'SRI DHANALAXMI', 'open' => '788', 'close' => '39', 'jodi' => '900', 'openTime' => '12:00 PM', 'closeTime' => '01:00 PM', 'slug' => 'sri-dhanalaxmi'],
    ['market' => 'BOMBAY NIGHT', 'open' => '137', 'close' => '11', 'jodi' => '146', 'openTime' => '09:35 PM', 'closeTime' => '12:05 AM', 'slug' => 'bombay-night'],
    ['market' => 'SUNDAY BAZAR', 'open' => '167', 'close' => '47', 'jodi' => '458', 'openTime' => '12:30 PM', 'closeTime' => '02:45 PM', 'slug' => 'sunday-bazar'],
    ['market' => 'PADMAVATHI', 'open' => '345', 'close' => '26', 'jodi' => '150', 'openTime' => '11:40 AM', 'closeTime' => '12:40 PM', 'slug' => 'padmavathi'],
    ['market' => 'PADMAVATHI NIGHT', 'open' => '369', 'close' => '8', 'jodi' => null, 'openTime' => '07:45 PM', 'closeTime' => '08:45 PM', 'slug' => 'padmavathi-night'],
    ['market' => 'MAIN RATAN', 'open' => '600', 'close' => '65', 'jodi' => '357', 'openTime' => '09:30 PM', 'closeTime' => '11:30 PM', 'slug' => 'main-ratan'],
    ['market' => 'RATAN GOLD DAY', 'open' => '130', 'close' => '45', 'jodi' => '159', 'openTime' => '12:20 PM', 'closeTime' => '02:00 PM', 'slug' => 'ratan-gold-day'],
    ['market' => 'RATAN GOLD NIGHT', 'open' => '190', 'close' => '07', 'jodi' => '557', 'openTime' => '09:40 PM', 'closeTime' => '11:40 PM', 'slug' => 'ratan-gold-night'],
    ['market' => 'BALAJI', 'open' => '124', 'close' => '75', 'jodi' => '177', 'openTime' => '11:20 AM', 'closeTime' => '12:20 PM', 'slug' => 'balaji'],
    ['market' => 'KAMDHENU', 'open' => '330', 'close' => '64', 'jodi' => '590', 'openTime' => '03:40 PM', 'closeTime' => '05:40 PM', 'slug' => 'kamdhenu'],
    ['market' => 'KAMDHENU NIGHT', 'open' => '256', 'close' => '3', 'jodi' => null, 'openTime' => '07:45 PM', 'closeTime' => '08:45 PM', 'slug' => 'kamdhenu-night'],
    ['market' => 'SUPER NIGHT', 'open' => '266', 'close' => '47', 'jodi' => '359', 'openTime' => '09:35 PM', 'closeTime' => '11:35 PM', 'slug' => 'super-night'],
    ['market' => 'NEW KALYAN DAY', 'open' => '220', 'close' => '44', 'jodi' => '239', 'openTime' => '02:15 PM', 'closeTime' => '04:15 PM', 'slug' => 'new-kalyan-day'],
    ['market' => 'LUCKY DAY', 'open' => '790', 'close' => '63', 'jodi' => '148', 'openTime' => '12:45 PM', 'closeTime' => '02:05 PM', 'slug' => 'lucky-day'],
    ['market' => 'KALYAN SRIDEVI', 'open' => '190', 'close' => '02', 'jodi' => '129', 'openTime' => '11:30 AM', 'closeTime' => '12:30 PM', 'slug' => 'kalyan-sridevi'],
    ['market' => 'KALYAN SRIDEVI NIGHT', 'open' => '457', 'close' => '6', 'jodi' => null, 'openTime' => '07:30 PM', 'closeTime' => '08:30 PM', 'slug' => 'kalyan-sridevi-night'],
    ['market' => 'CENTRAL MUMBAI', 'open' => '345', 'close' => '29', 'jodi' => '126', 'openTime' => '02:00 PM', 'closeTime' => '03:00 PM', 'slug' => 'central-mumbai'],
    ['market' => 'MUMBAI DAY', 'open' => '100', 'close' => '14', 'jodi' => '338', 'openTime' => '02:05 PM', 'closeTime' => '03:05 PM', 'slug' => 'mumbai-day'],
    ['market' => 'KOHINOOR DAY', 'open' => '157', 'close' => '34', 'jodi' => '257', 'openTime' => '02:35 PM', 'closeTime' => '04:35 PM', 'slug' => 'kohinoor-day'],
    ['market' => 'KOHINOOR NIGHT', 'open' => '568', 'close' => '95', 'jodi' => '889', 'openTime' => '08:35 PM', 'closeTime' => '10:35 PM', 'slug' => 'kohinoor-night'],
    ['market' => 'NEW TARA MUMBAI DAY', 'open' => '233', 'close' => '83', 'jodi' => '337', 'openTime' => '01:45 PM', 'closeTime' => '03:10 PM', 'slug' => 'new-tara-mumbai-day'],
    ['market' => 'STAR TARA MORNING', 'open' => '237', 'close' => '29', 'jodi' => '900', 'openTime' => '10:10 AM', 'closeTime' => '11:10 AM', 'slug' => 'star-tara-morning'],
    ['market' => 'STAR TARA DAY', 'open' => '457', 'close' => '60', 'jodi' => '578', 'openTime' => '02:20 PM', 'closeTime' => '03:20 PM', 'slug' => 'star-tara-day'],
    ['market' => 'STAR TARA NIGHT', 'open' => '357', 'close' => '5', 'jodi' => null, 'openTime' => '07:20 PM', 'closeTime' => '08:20 PM', 'slug' => 'star-tara-night'],
    ['market' => 'PUNA NIGHT  [ main ]', 'open' => '114', 'close' => '60', 'jodi' => '127', 'openTime' => '11:00 PM', 'closeTime' => '01:50 AM', 'slug' => 'puna-night-main'],
    ['market' => 'SUPREME DAY', 'open' => '267', 'close' => '50', 'jodi' => '136', 'openTime' => '03:35 PM', 'closeTime' => '05:35 PM', 'slug' => 'supreme-day'],
    ['market' => 'SUPREME NIGHT', 'open' => '245', 'close' => '15', 'jodi' => '500', 'openTime' => '08:45 PM', 'closeTime' => '10:45 PM', 'slug' => 'supreme-night'],
    ['market' => 'RADHA MUMBAI DAY', 'open' => '247', 'close' => '33', 'jodi' => '120', 'openTime' => '01:35 PM', 'closeTime' => '03:05 PM', 'slug' => 'radha-mumbai-day'],
    ['market' => 'RADHA MUMBAI NIGHT', 'open' => '450', 'close' => '97', 'jodi' => '700', 'openTime' => '08:35 PM', 'closeTime' => '10:35 PM', 'slug' => 'radha-mumbai-night'],
    ['market' => 'PARAS DAY', 'open' => '379', 'close' => '94', 'jodi' => '130', 'openTime' => '11:15 AM', 'closeTime' => '12:15 PM', 'slug' => 'paras-day'],
    ['market' => 'PARAS NIGHT', 'open' => '170', 'close' => '87', 'jodi' => '124', 'openTime' => '07:50 PM', 'closeTime' => '10:10 PM', 'slug' => 'paras-night'],
    ['market' => 'SRILAKSHMI', 'open' => '569', 'close' => '07', 'jodi' => '179', 'openTime' => '11:20 AM', 'closeTime' => '12:20 PM', 'slug' => 'srilakshmi'],
    ['market' => 'BHAGYA DAY', 'open' => '578', 'close' => '08', 'jodi' => '170', 'openTime' => '12:20 PM', 'closeTime' => '01:20 PM', 'slug' => 'bhagya-day'],
    ['market' => 'BHAGYA NIGHT', 'open' => '238', 'close' => '30', 'jodi' => '145', 'openTime' => '08:20 PM', 'closeTime' => '09:20 PM', 'slug' => 'bhagya-night'],
    ['market' => 'WORLI MUMBAI DAY', 'open' => '568', 'close' => '98', 'jodi' => '369', 'openTime' => '01:30 PM', 'closeTime' => '02:30 PM', 'slug' => 'worli-mumbai-day'],
    ['market' => 'MAIN MUMBAI RK', 'open' => '345', 'close' => '24', 'jodi' => '167', 'openTime' => '09:30 PM', 'closeTime' => '11:50 PM', 'slug' => 'main-mumbai-rk'],
    ['market' => 'WORLI MUMBAI', 'open' => '346', 'close' => '30', 'jodi' => '569', 'openTime' => '09:15 PM', 'closeTime' => '11:10 PM', 'slug' => 'worli-mumbai'],
    ['market' => 'SITA DAY', 'open' => '390', 'close' => '20', 'jodi' => '460', 'openTime' => '01:45 PM', 'closeTime' => '02:45 PM', 'slug' => 'sita-day'],
    ['market' => 'COUNTRY BAZAR', 'open' => '678', 'close' => '14', 'jodi' => '356', 'openTime' => '01:20 PM', 'closeTime' => '02:20 PM', 'slug' => 'country-bazar'],
    ['market' => 'AMAR BAZAR', 'open' => '248', 'close' => '45', 'jodi' => '780', 'openTime' => '11:15 AM', 'closeTime' => '12:15 PM', 'slug' => 'amar-bazar'],
    ['market' => 'ROSE BAZAR DAY', 'open' => '158', 'close' => '45', 'jodi' => '690', 'openTime' => '02:30 PM', 'closeTime' => '03:50 PM', 'slug' => 'rose-bazar-day'],
    ['market' => 'ROSE BAZAR NIGHT', 'open' => '249', 'close' => '51', 'jodi' => '155', 'openTime' => '10:00 PM', 'closeTime' => '12:02 AM', 'slug' => 'rose-bazar-night'],
    ['market' => 'JANTA MORNING', 'open' => '770', 'close' => '40', 'jodi' => '370', 'openTime' => '01:00 PM', 'closeTime' => '02:00 PM', 'slug' => 'janta-morning'],
    ['market' => 'CENTRAL BOMBAY', 'open' => '158', 'close' => '42', 'jodi' => '255', 'openTime' => '03:15 PM', 'closeTime' => '04:15 PM', 'slug' => 'central-bombay'],
    ['market' => 'TEEN PATTI', 'open' => '160', 'close' => '76', 'jodi' => '448', 'openTime' => '07:55 PM', 'closeTime' => '08:55 PM', 'slug' => 'teen-patti'],
    ['market' => 'DURGA NIGHT', 'open' => '127', 'close' => '00', 'jodi' => '550', 'openTime' => '10:30 PM', 'closeTime' => '12:30 AM', 'slug' => 'durga-night'],
    ['market' => 'MAHADEVI', 'open' => '578', 'close' => '07', 'jodi' => '359', 'openTime' => '04:30 PM', 'closeTime' => '06:30 PM', 'slug' => 'mahadevi'],
    ['market' => 'SUPER TIME', 'open' => '223', 'close' => '74', 'jodi' => '158', 'openTime' => '12:55 PM', 'closeTime' => '01:55 PM', 'slug' => 'super-time'],
    ['market' => 'KAALI', 'open' => '490', 'close' => '32', 'jodi' => '570', 'openTime' => '11:20 PM', 'closeTime' => '01:35 AM', 'slug' => 'kaali'],
    ['market' => 'MAIN MUMBAI NIGHT', 'open' => '138', 'close' => '24', 'jodi' => '347', 'openTime' => '09:00 PM', 'closeTime' => '11:00 PM', 'slug' => 'main-mumbai-night'],
    ['market' => 'SITA NIGHT', 'open' => '190', 'close' => '08', 'jodi' => '369', 'openTime' => '06:45 PM', 'closeTime' => '07:45 PM', 'slug' => 'sita-night'],
    ['market' => 'KAMAL MORNING', 'open' => '260', 'close' => '86', 'jodi' => '123', 'openTime' => '12:10 PM', 'closeTime' => '01:10 PM', 'slug' => 'kamal-morning'],
    ['market' => 'KAMAL DAY', 'open' => '368', 'close' => '70', 'jodi' => '299', 'openTime' => '03:40 PM', 'closeTime' => '05:40 PM', 'slug' => 'kamal-day'],
    ['market' => 'KAMAL NIGHT', 'open' => '189', 'close' => '88', 'jodi' => '378', 'openTime' => '08:45 PM', 'closeTime' => '10:45 PM', 'slug' => 'kamal-night'],
    ['market' => 'KHATRI MORNING', 'open' => '127', 'close' => '0', 'jodi' => null, 'openTime' => '11:00 AM', 'closeTime' => '12:00 PM', 'slug' => 'khatri-morning'],
    ['market' => 'ANDHRA MORNING', 'open' => '889', 'close' => '54', 'jodi' => '770', 'openTime' => '10:40 AM', 'closeTime' => '11:40 AM', 'slug' => 'andhra-morning'],
    ['market' => 'ANDHRA DAY', 'open' => '159', 'close' => '57', 'jodi' => '124', 'openTime' => '03:35 PM', 'closeTime' => '05:35 PM', 'slug' => 'andhra-day'],
    ['market' => 'ANDHRA NIGHT', 'open' => '369', 'close' => '82', 'jodi' => '237', 'openTime' => '08:45 PM', 'closeTime' => '10:45 PM', 'slug' => 'andhra-night'],
    ['market' => 'MAHADEVI MORNING', 'open' => '345', 'close' => '24', 'jodi' => '220', 'openTime' => '11:45 AM', 'closeTime' => '12:45 PM', 'slug' => 'mahadevi-morning'],
    ['market' => 'MAHADEVI NIGHT', 'open' => '340', 'close' => '7', 'jodi' => null, 'openTime' => '07:50 PM', 'closeTime' => '08:50 PM', 'slug' => 'mahadevi-night'],
    ['market' => 'DELHI BAZAR', 'open' => '570', 'close' => '26', 'jodi' => '358', 'openTime' => '08:10 PM', 'closeTime' => '09:10 PM', 'slug' => 'delhi-bazar'],
    ['market' => 'RATAN DAY', 'open' => '129', 'close' => '21', 'jodi' => '100', 'openTime' => '03:55 PM', 'closeTime' => '05:55 PM', 'slug' => 'ratan-day'],
    ['market' => 'MAHALAXMI MORNING', 'open' => '115', 'close' => '79', 'jodi' => '180', 'openTime' => '11:30 AM', 'closeTime' => '01:00 PM', 'slug' => 'mahalaxmi-morning'],
    ['market' => 'WORLI MUMBAI NIGHT', 'open' => '246', 'close' => '27', 'jodi' => '340', 'openTime' => '09:45 PM', 'closeTime' => '11:45 PM', 'slug' => 'worli-mumbai-night'],
    ['market' => 'RAJDHANI DAY', 'open' => '278', 'close' => '75', 'jodi' => '357', 'openTime' => '03:15 PM', 'closeTime' => '05:15 PM', 'slug' => 'rajdhani-day'],
    ['market' => 'TIME NIGHT', 'open' => '489', 'close' => '13', 'jodi' => '120', 'openTime' => '08:15 PM', 'closeTime' => '10:15 PM', 'slug' => 'time-night'],
    ['market' => 'SUPER MATKA', 'open' => '340', 'close' => '70', 'jodi' => '280', 'openTime' => '05:00 PM', 'closeTime' => '07:00 PM', 'slug' => 'super-matka'],
    ['market' => 'BOMBAY RAJSHREE DAY', 'open' => '349', 'close' => '65', 'jodi' => '177', 'openTime' => '01:15 PM', 'closeTime' => '03:15 PM', 'slug' => 'bombay-rajshree-day'],
    ['market' => 'BOMBAY RAJSHREE NIGHT', 'open' => '245', 'close' => '18', 'jodi' => '134', 'openTime' => '09:00 PM', 'closeTime' => '11:00 PM', 'slug' => 'bombay-rajshree-night'],
    ['market' => 'CB', 'open' => '123', 'close' => '69', 'jodi' => '225', 'openTime' => '02:15 PM', 'closeTime' => '03:15 PM', 'slug' => 'cb'],
    ['market' => 'CHANDNI MORNING', 'open' => '136', 'close' => '01', 'jodi' => '678', 'openTime' => '11:05 AM', 'closeTime' => '12:05 PM', 'slug' => 'chandni-morning'],
    ['market' => 'GUJRAT MORNING', 'open' => '124', 'close' => '74', 'jodi' => '248', 'openTime' => '11:20 AM', 'closeTime' => '12:20 PM', 'slug' => 'gujrat-morning'],
    ['market' => 'GUJRAT NIGHT', 'open' => '330', 'close' => '6', 'jodi' => null, 'openTime' => '07:45 PM', 'closeTime' => '08:45 PM', 'slug' => 'gujrat-night'],
    ['market' => 'GOWA', 'open' => '169', 'close' => '64', 'jodi' => '347', 'openTime' => '12:30 PM', 'closeTime' => '02:20 PM', 'slug' => 'gowa'],
    ['market' => 'RAKHI MORNING', 'open' => '289', 'close' => '93', 'jodi' => '157', 'openTime' => '11:10 AM', 'closeTime' => '12:10 PM', 'slug' => 'rakhi-morning'],
    ['market' => 'RATNA MORNING', 'open' => '239', 'close' => '47', 'jodi' => '458', 'openTime' => '09:35 AM', 'closeTime' => '10:30 AM', 'slug' => 'ratna-morning'],
    ['market' => 'GEETA MORNING', 'open' => '489', 'close' => '19', 'jodi' => '126', 'openTime' => '09:55 AM', 'closeTime' => '10:55 AM', 'slug' => 'geeta-morning'],
    ['market' => 'RATNA DAY', 'open' => '289', 'close' => '90', 'jodi' => '370', 'openTime' => '01:35 PM', 'closeTime' => '02:35 PM', 'slug' => 'ratna-day'],
    ['market' => 'RATNA NIGHT', 'open' => '226', 'close' => '0', 'jodi' => null, 'openTime' => '07:05 PM', 'closeTime' => '08:05 PM', 'slug' => 'ratna-night'],
    ['market' => 'TULSI MORNING', 'open' => '899', 'close' => '68', 'jodi' => '567', 'openTime' => '10:20 AM', 'closeTime' => '11:20 AM', 'slug' => 'tulsi-morning'],
    ['market' => 'SRILAXMI DAY', 'open' => '479', 'close' => '04', 'jodi' => '590', 'openTime' => '01:45 PM', 'closeTime' => '02:45 PM', 'slug' => 'srilaxmi-day'],
    ['market' => 'NTR MORNING', 'open' => '450', 'close' => '90', 'jodi' => '578', 'openTime' => '09:10 AM', 'closeTime' => '10:10 AM', 'slug' => 'ntr-morning'],
    ['market' => 'NTR DAY', 'open' => '357', 'close' => '51', 'jodi' => '470', 'openTime' => '05:00 PM', 'closeTime' => '07:00 PM', 'slug' => 'ntr-day'],
    ['market' => 'NTR NIGHT', 'open' => '335', 'close' => '15', 'jodi' => '249', 'openTime' => '09:00 PM', 'closeTime' => '11:00 PM', 'slug' => 'ntr-night'],
    ['market' => 'MAYA BAZAR', 'open' => '239', 'close' => '49', 'jodi' => '126', 'openTime' => '10:20 AM', 'closeTime' => '11:20 AM', 'slug' => 'maya-bazar'],
    ['market' => 'SUPER KING', 'open' => '700', 'close' => '76', 'jodi' => '358', 'openTime' => '03:35 PM', 'closeTime' => '05:35 PM', 'slug' => 'super-king'],
    ['market' => 'SUPER KING NIGHT', 'open' => '400', 'close' => '43', 'jodi' => '346', 'openTime' => '08:45 PM', 'closeTime' => '10:45 PM', 'slug' => 'super-king-night'],
    ['market' => 'MEENA BAZAR', 'open' => '256', 'close' => '37', 'jodi' => '124', 'openTime' => '09:00 PM', 'closeTime' => '11:00 PM', 'slug' => 'meena-bazar'],
    ['market' => 'SITARA BAZAR', 'open' => '590', 'close' => '46', 'jodi' => '178', 'openTime' => '10:10 PM', 'closeTime' => '11:45 PM', 'slug' => 'sitara-bazar'],
    ['market' => 'MANGAL BAZAR', 'open' => '000', 'close' => '03', 'jodi' => '157', 'openTime' => '10:10 PM', 'closeTime' => '11:10 PM', 'slug' => 'mangal-bazar'],
    ['market' => 'MANGAL MORNING', 'open' => '148', 'close' => '31', 'jodi' => '560', 'openTime' => '09:35 AM', 'closeTime' => '10:35 AM', 'slug' => 'mangal-morning'],
    ['market' => 'MANGAL DAY', 'open' => '146', 'close' => '17', 'jodi' => '467', 'openTime' => '04:05 PM', 'closeTime' => '05:05 PM', 'slug' => 'mangal-day'],
    ['market' => 'MANGAL NIGHT', 'open' => '235', 'close' => '08', 'jodi' => '468', 'openTime' => '08:25 PM', 'closeTime' => '09:25 PM', 'slug' => 'mangal-night'],
    ['market' => 'GAMA MORNING', 'open' => '238', 'close' => '35', 'jodi' => '140', 'openTime' => '10:10 AM', 'closeTime' => '11:10 AM', 'slug' => 'gama-morning'],
    ['market' => 'GAMA DAY', 'open' => '129', 'close' => '28', 'jodi' => '350', 'openTime' => '02:20 PM', 'closeTime' => '03:20 PM', 'slug' => 'gama-day'],
    ['market' => 'GAMA NIGHT', 'open' => '466', 'close' => '6', 'jodi' => null, 'openTime' => '07:20 PM', 'closeTime' => '08:20 PM', 'slug' => 'gama-night'],
    ['market' => 'MILAN BAZAR MORNING', 'open' => '670', 'close' => '35', 'jodi' => '456', 'openTime' => '10:40 AM', 'closeTime' => '12:40 PM', 'slug' => 'milan-bazar-morning'],
    ['market' => 'MILAN BAZAR DAY', 'open' => '479', 'close' => '04', 'jodi' => '356', 'openTime' => '01:30 PM', 'closeTime' => '03:30 PM', 'slug' => 'milan-bazar-day'],
    ['market' => 'MILAN BAZAR NIGHT', 'open' => '800', 'close' => '86', 'jodi' => '178', 'openTime' => '08:30 PM', 'closeTime' => '10:30 PM', 'slug' => 'milan-bazar-night'],
    ['market' => 'MAIN MILAN MORNING', 'open' => '345', 'close' => '22', 'jodi' => '228', 'openTime' => '11:25 AM', 'closeTime' => '12:25 PM', 'slug' => 'main-milan-morning'],
    ['market' => 'MEENA MORNING', 'open' => '224', 'close' => '81', 'jodi' => '380', 'openTime' => '11:30 AM', 'closeTime' => '12:30 PM', 'slug' => 'meena-morning'],
    ['market' => 'MAIN STAR', 'open' => '170', 'close' => '88', 'jodi' => '260', 'openTime' => '09:35 PM', 'closeTime' => '11:35 PM', 'slug' => 'main-star'],
    ['market' => 'SUPREME BAZAR DAY', 'open' => '560', 'close' => '17', 'jodi' => '250', 'openTime' => '01:35 PM', 'closeTime' => '02:35 PM', 'slug' => 'supreme-bazar-day'],
    ['market' => 'SUPREME BAZAR NIGHT', 'open' => '117', 'close' => '90', 'jodi' => '190', 'openTime' => '06:50 PM', 'closeTime' => '08:50 PM', 'slug' => 'supreme-bazar-night'],
    ['market' => 'ANMOL', 'open' => '168', 'close' => '55', 'jodi' => '780', 'openTime' => '11:25 AM', 'closeTime' => '12:25 PM', 'slug' => 'anmol'],
    ['market' => 'STANDARD BAZAR', 'open' => '189', 'close' => '87', 'jodi' => '278', 'openTime' => '11:00 AM', 'closeTime' => '12:00 PM', 'slug' => 'standard-bazar'],
    ['market' => 'CITY BAZAR DAY', 'open' => '120', 'close' => '37', 'jodi' => '179', 'openTime' => '02:30 PM', 'closeTime' => '04:30 PM', 'slug' => 'city-bazar-day'],
    ['market' => 'CITY BAZAR NIGHT', 'open' => '290', 'close' => '14', 'jodi' => '266', 'openTime' => '08:30 PM', 'closeTime' => '10:30 PM', 'slug' => 'city-bazar-night'],
    ['market' => 'MAIN BAZAR NIGHT', 'open' => '300', 'close' => '3', 'jodi' => null, 'openTime' => '07:00 PM', 'closeTime' => '08:00 PM', 'slug' => 'main-bazar-night'],
    ['market' => 'SITA MORNING', 'open' => '140', 'close' => '56', 'jodi' => '556', 'openTime' => '09:45 AM', 'closeTime' => '10:45 AM', 'slug' => 'sita-morning'],
    ['market' => 'VAISHNAVI DAY', 'open' => '369', 'close' => '88', 'jodi' => '378', 'openTime' => '01:40 PM', 'closeTime' => '02:40 PM', 'slug' => 'vaishnavi-day'],
    ['market' => 'ASHA BAZAR', 'open' => '447', 'close' => '51', 'jodi' => '678', 'openTime' => '11:15 AM', 'closeTime' => '12:15 PM', 'slug' => 'asha-bazar'],
    ['market' => 'DAY JANTA', 'open' => '126', 'close' => '93', 'jodi' => '238', 'openTime' => '03:40 PM', 'closeTime' => '05:40 PM', 'slug' => 'day-janta'],
    ['market' => 'NIGHT JANTA', 'open' => '360', 'close' => '93', 'jodi' => '490', 'openTime' => '08:35 PM', 'closeTime' => '10:35 PM', 'slug' => 'night-janta'],
    ['market' => 'MATKA KING', 'open' => '257', 'close' => '49', 'jodi' => '360', 'openTime' => '01:00 PM', 'closeTime' => '02:30 PM', 'slug' => 'matka-king'],
    ['market' => 'MATKA KING NIGHT', 'open' => '480', 'close' => '25', 'jodi' => '267', 'openTime' => '08:00 PM', 'closeTime' => '10:00 PM', 'slug' => 'matka-king-night'],
    ['market' => 'KIRTI', 'open' => '789', 'close' => '48', 'jodi' => '800', 'openTime' => '03:00 PM', 'closeTime' => '06:00 PM', 'slug' => 'kirti'],
    ];
}
function mockLiveResults(): array
{
    return [    ['market' => 'PADMAVATHI NIGHT', 'result' => '369-8', 'slug' => 'padmavathi-night'],
    ['market' => 'DIAMOND NIGHT', 'result' => 'Loading...', 'slug' => 'diamond-night'],
    ['market' => 'GUJRAT NIGHT', 'result' => '330-6', 'slug' => 'gujrat-night'],
    ['market' => 'KAMDHENU NIGHT', 'result' => '256-3', 'slug' => 'kamdhenu-night'],
    ['market' => 'MADHURI NIGHT', 'result' => '890-7', 'slug' => 'madhuri-night'],
    ['market' => 'MAHADEVI NIGHT', 'result' => '340-7', 'slug' => 'mahadevi-night'],
    ['market' => 'MAIN BAZAR NIGHT', 'result' => '300-3', 'slug' => 'main-bazar-night'],
    ['market' => 'MATKA KING NIGHT', 'result' => 'Loading...', 'slug' => 'matka-king-night'],
    ['market' => 'PARAS NIGHT', 'result' => 'Loading...', 'slug' => 'paras-night'],
    ['market' => 'RATNA NIGHT', 'result' => '226-0', 'slug' => 'ratna-night'],
    ['market' => 'SITA NIGHT', 'result' => '190-08-369', 'slug' => 'sita-night'],
    ['market' => 'TEEN PATTI', 'result' => 'Loading...', 'slug' => 'teen-patti'],
    ['market' => 'THALAIVA NIGHT', 'result' => '560-1', 'slug' => 'thalaiva-night'],
    ['market' => 'WORLI NIGHT', 'result' => 'Loading...', 'slug' => 'worli-night'],    ];
}

/**
 * THE LIVE BOARD, derived from the clock.
 *
 * mockLiveResults() is the snapshot scraped off the homepage. It is kept
 * for reference only - what actually renders is mockLiveBoard(), because a
 * frozen list cannot behave like the live site: night markets would sit on
 * the board at 9am and the morning markets would be missing at night.
 *
 * This mirrors server/services/liveBoard.js exactly, so the PHP API and the
 * Node server return the same payload.
 */
function mockLiveBoard(?int $now = null, int $limit = 14): array
{
    $now   = $now ?? mockNowMinutes();
    $cards = [];

    foreach (mockMarkets() as $m) {
        $openMin  = mockToMinutes($m['openTime'] ?? null);
        $closeMin = mockToMinutes($m['closeTime'] ?? null);
        $status   = mockWindowStatus($openMin, $closeMin, $now);

        // A market we cannot schedule is not something to show.
        if ($status === 'unknown') {
            continue;
        }

        $open  = $m['open'] ?? null;
        $close = $m['close'] ?? null;
        $jodi  = $m['jodi'] ?? null;

        $result = null;
        if ($status === 'live' && $open !== null && $open !== '') {
            // Window open: only the open half has been drawn.
            // Show it the way the original site does: open pana + its ank
            // (digit-sum mod 10), e.g. "578-0", "369-8" - never bare "578".
            $ankDigit = null;
            $digits = preg_replace('/\D+/', '', (string) $open);
            if ($digits !== '') {
                $ankDigit = array_sum(str_split($digits)) % 10;
            }
            $result = $ankDigit === null ? (string) $open : $open . '-' . $ankDigit;
        } elseif ($status === 'closed') {
            if ($open !== null && $close !== null && $jodi !== null && $jodi !== '') {
                $result = $open . '-' . $close . '-' . $jodi;
            } elseif ($open !== null && $close !== null) {
                $result = $open . '-' . $close;
            } elseif ($jodi !== null && $jodi !== '') {
                $result = (string) $jodi;
            }
        }

        $cards[] = [
            'market'    => $m['market'],
            'slug'      => $m['slug'],
            'result'    => $result,
            'ank'       => $result === null ? null : deriveAnk($result),
            'isPending' => $result === null,
            'status'    => $status,
            'openTime'  => mockTo12Hour($openMin),
            'closeTime' => mockTo12Hour($closeMin),
            '_open'     => $openMin,
            '_close'    => $closeMin,
        ];
    }

    return array_slice(mockRankLiveCards($cards), 0, $limit);
}

/**
 * Live first (soonest to close), then most recently closed, then whatever
 * is still to open. Stable on market name so it never flickers between polls.
 */
function mockRankLiveCards(array $cards): array
{
    $rank = ['live' => 0, 'closed' => 1, 'upcoming' => 2];

    usort($cards, static function (array $a, array $b) use ($rank): int {
        $ra = $rank[$a['status']] ?? 3;
        $rb = $rank[$b['status']] ?? 3;
        if ($ra !== $rb) {
            return $ra <=> $rb;
        }

        if ($a['status'] === 'live') {
            // Drawing now: the one closing soonest is most urgent.
            $av = $a['_close'] ?? PHP_INT_MAX;
            $bv = $b['_close'] ?? PHP_INT_MAX;
            if ($av !== $bv) {
                return $av <=> $bv;
            }
        } elseif ($a['status'] === 'closed') {
            // Just finished: newest close wins.
            $av = $a['_close'] ?? PHP_INT_MAX;
            $bv = $b['_close'] ?? PHP_INT_MAX;
            if ($av !== $bv) {
                return $bv <=> $av;
            }
        } else {
            // Still to come: soonest first.
            $av = $a['_open'] ?? PHP_INT_MAX;
            $bv = $b['_open'] ?? PHP_INT_MAX;
            if ($av !== $bv) {
                return $av <=> $bv;
            }
        }

        return strcmp((string) $a['market'], (string) $b['market']);
    });

    // Drop the internal sort keys before the payload leaves the server.
    return array_map(static function (array $c): array {
        unset($c['_open'], $c['_close']);
        return $c;
    }, $cards);
}
/**
 * MARKET CLOCK helpers - PHP mirror of server/services/marketClock.js.
 *
 * Kept here so the PHP endpoints schedule markets against real time too,
 * instead of returning a frozen snapshot that never changes.
 */

/** "11:40 AM" / "11:40" / "11:40am" -> minutes since midnight. */
function mockToMinutes(?string $value): ?int
{
    if ($value === null) {
        return null;
    }

    $s = trim($value);

    if (preg_match('/^(\\d{1,2}):([0-5]\\d)\\s*([APap])\\.?[Mm]?\\.?$/', $s, $m)) {
        $h = ((int) $m[1]) % 12;
        if (strtolower($m[3]) === 'p') {
            $h += 12;
        }
        return $h * 60 + (int) $m[2];
    }

    if (preg_match('/^([01]?\\d|2[0-3]):([0-5]\\d)$/', $s, $m)) {
        return ((int) $m[1]) * 60 + (int) $m[2];
    }

    return null;
}

/** Minutes since midnight -> "11:40 AM" (the format the site displays). */
function mockTo12Hour(?int $minutes): string
{
    if ($minutes === null) {
        return '';
    }
    $h24 = intdiv($minutes, 60) % 24;
    $m   = $minutes % 60;
    $h12 = $h24 % 12 === 0 ? 12 : $h24 % 12;
    return sprintf('%02d:%02d %s', $h12, $m, $h24 < 12 ? 'AM' : 'PM');
}

/**
 * Minutes since midnight right now, in the market timezone.
 *
 * Matka runs on IST but the server may be UTC, so the timezone is pinned
 * rather than inherited from the host. Override with the MARKET_TZ env var.
 */
function mockNowMinutes(): int
{
    $tz  = getenv('MARKET_TZ');
    $tz  = ($tz !== false && $tz !== '') ? $tz : 'Asia/Kolkata';
    $now = new DateTimeImmutable('now', new DateTimeZone($tz));

    return ((int) $now->format('G')) * 60 + (int) $now->format('i');
}

/**
 * Where `$now` sits inside one market's draw window:
 * upcoming | live | closed | unknown.
 *
 * Midnight-wrapping markets (closeMin <= openMin, e.g. 10:15 PM - 12:15 AM)
 * map one clock reading to two different points in the cycle:
 *
 *   22:30 -> live      00:05 -> live      00:20 -> closed    09:00 -> upcoming
 *
 * The tail before closeMin belongs to the PREVIOUS draw, so it reports
 * closed - otherwise every night market would sit on the board as
 * "drawing" at 9 in the morning.
 */
function mockWindowStatus(?int $openMin, ?int $closeMin, int $now): string
{
    if ($openMin === null || $closeMin === null) {
        return 'unknown';
    }

    $n = (($now % 1440) + 1440) % 1440;

    if ($closeMin <= $openMin) {
        if ($n >= $openMin) {
            return 'live';    // tonight's window, running to midnight
        }
        if ($n < $closeMin) {
            return 'closed';  // previous draw, just finished
        }
        return 'upcoming';   // waiting for tonight
    }

    if ($n < $openMin) {
        return 'upcoming';
    }
    if ($n < $closeMin) {
        return 'live';
    }

    return 'closed';
}

/** Starline rows (15-minute intervals). */
function mockStarline(string $slug): array
{
    return [
        ['time' => '11:00 AM', 'open' => '237', 'close' => '2', 'nextTime' => '11:15 AM', 'nextOpen' => '780', 'nextClose' => '5'],
        ['time' => '11:30 AM', 'open' => '268', 'close' => '6', 'nextTime' => '11:45 AM', 'nextOpen' => '145', 'nextClose' => '0'],
        ['time' => '12:00 PM', 'open' => '360', 'close' => '9', 'nextTime' => '12:15 PM', 'nextOpen' => '267', 'nextClose' => '5'],
        ['time' => '12:30 PM', 'open' => '238', 'close' => '3', 'nextTime' => '12:45 PM', 'nextOpen' => '578', 'nextClose' => '0'],
        ['time' => '01:00 PM', 'open' => '459', 'close' => '8', 'nextTime' => '01:15 PM', 'nextOpen' => '129', 'nextClose' => '2'],
        ['time' => '01:30 PM', 'open' => '156', 'close' => '2', 'nextTime' => '01:45 PM', 'nextOpen' => '250', 'nextClose' => '7'],
        ['time' => '02:00 PM', 'open' => '169', 'close' => '6', 'nextTime' => '02:15 PM', 'nextOpen' => '670', 'nextClose' => '3'],
        ['time' => '02:30 PM', 'open' => '469', 'close' => '9', 'nextTime' => '02:45 PM', 'nextOpen' => '256', 'nextClose' => '3'],
        ['time' => '03:00 PM', 'open' => '278', 'close' => '7', 'nextTime' => '03:15 PM', 'nextOpen' => '357', 'nextClose' => '5'],
        ['time' => '03:30 PM', 'open' => '259', 'close' => '6', 'nextTime' => '03:45 PM', 'nextOpen' => '230', 'nextClose' => '5'],
        ['time' => '04:00 PM', 'open' => '600', 'close' => '6', 'nextTime' => '04:15 PM', 'nextOpen' => '467', 'nextClose' => '7'],
        ['time' => '04:30 PM', 'open' => '158', 'close' => '4', 'nextTime' => '04:45 PM', 'nextOpen' => '389', 'nextClose' => '0'],
        ['time' => '05:00 PM', 'open' => '236', 'close' => '1', 'nextTime' => '05:15 PM', 'nextOpen' => '455', 'nextClose' => '4'],
        ['time' => '05:30 PM', 'open' => '790', 'close' => '6', 'nextTime' => '05:45 PM', 'nextOpen' => '127', 'nextClose' => '0'],
        ['time' => '06:00 PM', 'open' => '568', 'close' => '9', 'nextTime' => '06:15 PM', 'nextOpen' => '245', 'nextClose' => '1'],
        ['time' => '06:30 PM', 'open' => '337', 'close' => '3', 'nextTime' => '06:45 PM', 'nextOpen' => '479', 'nextClose' => '0'],
        ['time' => '07:00 PM', 'open' => '239', 'close' => '4', 'nextTime' => '07:15 PM', 'nextOpen' => '460', 'nextClose' => '0'],
        ['time' => '07:30 PM', 'open' => '168', 'close' => '5', 'nextTime' => '07:45 PM', 'nextOpen' => '490', 'nextClose' => '3'],
    ];
}



/**
 * Final Ank - published by the site as its OWN dataset.
 * Deliberately NOT derived from the jodi digit: the two disagree
 * (e.g. KALYAN MORNING shows 4 here while jodi 369 derives to 9).
 */

