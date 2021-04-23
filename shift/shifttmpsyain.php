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
$con = new pdoConnect("schedule");
try {
    $con->pdo->beginTransaction();
    // 社員マスターに存在しているtemp_syainにdel_flg=1にして論理削除する
    $sql = "UPDATE schedule.temp_syain AS t
            INNER JOIN common.syain_t AS s ON s.syaincd = t.syaincd
            SET t.del_flg = 1";
    if ($con->pdo->exec($sql) === false) {
        echo "ERROR";
    } else {
        echo "OK";
    }        
    // 社員マスターには存在していなく、temp_syainにある社員データを登録する。
    $sql = "SELECT @seqno := IFNULL(MAX(syainseq),0) FROM common.syain_t WHERE syainseq < 700";
    $con->pdo->query($sql) or die($sql);
    $sql = "INSERT INTO common.syain_t (
                syainseq,
                syaincd,
                name,
                kana,
                rank,
                itemnm,
                syozokucd,
                syozokunm,
                bu_cd,
                ten_cd,
                ka_cd
            )
            SELECT 
                @seqno := @seqno + 1,
                t.syaincd,
                t.name,
                t.kana,
                0,
                t.itemnm,
                t.syozokucd,
                t.syozokunm,
                SUBSTRING(t.syozokucd,1,2),
                SUBSTRING(t.syozokucd,3,2),
                SUBSTRING(t.syozokucd,4,2)
            FROM schedule.temp_syain AS t
            LEFT JOIN common.syain_t AS s ON s.syaincd = t.syaincd 
            WHERE s.syaincd IS NULL AND t.del_flg = 0";
    if ($con->pdo->exec($sql) === false) {
        echo "ERROR";
    } else {
        echo "OK";
    }
    $con->pdo->commit();
} catch (Exception $e) {
    $con->pdo->rollBack();
    echo "ROLLBACK";
}
?>