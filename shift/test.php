<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<?php
    $wymd = strtotime("2020/8/01 -1 Day");
    while (date("w",$wymd) !== "6") {
        echo date("Y/m/d",$wymd)."<br>";
        $wymd = strtotime(date("Y/m/d",$wymd)." -1 Day");
    }

    // $api_key = 'AIzaSyDrGg3Nnx0lV0AuID6nLuMc1FGyl5TNoQM';
    // $holidays_id = 'japanese__ja@holiday.calendar.google.com';
	// $start_date = '2021-04-01T00%3A00%3A00.000Z';
	// $end_date = '2022-03-31T00%3A00%3A00.000Z';
    // $holidays_url = sprintf(
    //     'https://www.googleapis.com/calendar/v3/calendars/%s/events?'.
    //     'key=%s&timeMin=%s&timeMax=%s&maxResults=%d&orderBy=startTime&singleEvents=true',
    //     $holidays_id,
    //     $api_key,
    //     $start_date,
    //     $end_date,
    //     30  
    // );

    // if( $results = file_get_contents($holidays_url, true))
    // {
    //     $results = json_decode($results);
    //     $holidays = array();
    //     // var_dump($results->items);
    //     foreach($results->items as $item)
    //     {
    //         $date = strtotime((string) $item->start->date);
    //         $title = (string) $item->summary;
    //         $holidays[date('Y-m-d', $date)] = $title;   
    //     }
    //     ksort($holidays);
    //     var_dump($holidays);
    // }
?>
    </body>
</html>
