<?php 
// 
// 公休予定表の入力をチェックしアラートメールを送信します。
// このプログラムはcrontabで自動実行されます。
// 保存場所:/home/webadmin/bin
// 
class pdoConnect
{
    public $pdo;

    public function __construct($db)
    {
        $user = 'jyosys';
        $password = 'Jy0Sys8848';
    
        $dsn = "mysql:dbname={$db};host=localhost";
        try {
            $this->pdo = new PDO( $dsn, $user, $password );
        } catch (PDOException $e) {
            $this->pdo = false;
        }
    }
}
$day = date("d");
if ($day !== "25" && $day !== "26" && $day !== "27") {
    // 25,26,27以外は対象外
    exit;
}
$syori = date("Y-m-01",strtotime("+1 Month"));
$syorie = date("Y-m-t",strtotime($syori));
$kokyu = 0;

$wdate = $syori;
while ($wdate <= $syorie) {
    $w = date("w",strtotime($wdate));
    if ($w === "0" || $w === "6") {
        $kokyu++;
    }
    $wdate = date("Y-m-d",strtotime("{$wdate} +1 Day"));
}
$con = new pdoConnect("schedule");
$sql = "SELECT holiday FROM holiday 
        WHERE holiday between '{$syori}' AND '{$syorie}'";
$ds = $con->pdo->query($sql);
while ($row = $ds->fetch()) {
    $w = date("w",strtotime($row["holiday"]));
    if ($w > "0" && $w < "6") {
        $kokyu++;
    }
}

$stamp = array();
$sql = "SELECT id,tx FROM stamps";
$ds = $con->pdo->query($sql);
while ($row = $ds->fetch()) {
    $stamp[$row["id"]] = $row["tx"];
}    
$sql = "SELECT l.syaincd, l.msort, s.yotei_var
        FROM v_member AS l
            LEFT JOIN schedule AS s ON s.syaincd = l.syaincd AND s.schdule_ym = '{$syori}'";

$ds = $con->pdo->query($sql);
$tolist = array();
while ($row = $ds->fetch()) {
    if ($row["msort"] === "0") {
        if ($row["yotei_var"] === null) {
            $tolist[] = $row["syaincd"]."@leopalace21.com";
        } else {
            $wkokyu = 0;
            $var = explode(",",$row["yotei_var"]);
            foreach ($var as $key => $val) {
                if ($stamp[$val] === "公" || $stamp[$val] === "計") {
                    $wkokyu++;
                }
            }
            if ($wkokyu > 0 && $wkokyu !== $kokyu) {
                $tolist[] = $row["syaincd"]."@leopalace21.com";
            }
        }
    }
}
if (count($tolist) > 0) {
    $sql = "SELECT admin_user FROM setting WHERE id = 1";
    $ds = $con->pdo->query($sql);
    if ($row = $ds->fetch()) {
        $admin = explode(",",$row["admin_user"]);
        $cc = array();
        foreach ($admin as $key => $val) {
            $cc[] = $val."@leopalace21.com";
        }
        // echo implode(";",$tolist)."\n";
        $message = "お疲れ様です。\n".
                    "このメールは公休予定表未入力、又は公休数に相違がある方へ送信しています。\n".
                    "下記アドレスより確認し予定の入力をお願い致します。\n".
                    "https://leoportal.leopalace21.com/leo-mywww/shift/\n\n".
                    // "※期間厳守(毎月20日)。期限内に入力がない場合でも当番割振りを行います。\n".
                    // "公休未報告者における当番可否については、一切受け付けできませんのでご了承下さい。\n\n".
                    "このメールは公休予定システムから自動で送信されています。\n".
                    "また、このアドレスは送信専用のため、返信いただいても対応ができません。";
        mailsender(implode(";",$tolist),"公休予定表入力のお願い",$message,"noreply@leopalace21.com",implode(";",$cc));
    }
}

function mailsender($to, $subject, $message, $fromadrs, $cc = "") {
	mb_language("Japanese");
	mb_internal_encoding("UTF-8");

    $headers = "From: {$fromadrs}\nReply-To: {$fromadrs}\nCc: {$cc}";
    // $headers = "From: {$fromadrs}\nReply-To: {$fromadrs}\nCc: {$fromadrs}";
	//メール送信
	return mb_send_mail($to, $subject, $message, $headers);
}
?>