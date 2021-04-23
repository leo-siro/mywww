<?php
class pdoConnect
{
    public $pdo;

    public function __construct($db)
    {
        $user = 'jyosys';
        $password = 'Jy0Sys8848';
    
        if (($db === "schedule")
        && substr($_SERVER["SERVER_NAME"],0,8) === "mywwwdev") {
            $db = $db."_dev";
        }
        $dsn = "mysql:dbname={$db};host=localhost";
        try {
            $this->pdo = new PDO( $dsn, $user, $password );
        } catch (PDOException $e) {
            $this->pdo = false;
        }
    }
}
?>