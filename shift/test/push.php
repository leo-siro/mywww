<?php
header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-store');
header('X-Accel-Buffering: no');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers:Content-Type");

// header('Content-Type: text/event-stream');
// header('Cache-Control: no-store');
while(true) {
    printf("data: %s\n\n", json_encode(array(
        'time' => date('H:i:s'),
        'word' => 'abcãããððð',
    )));
    ob_end_flush();
    flush();
    sleep(1);
}
?>