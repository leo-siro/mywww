<?php
class pdoConnect
{
    public $pdo;

    public function __construct($db,$server="localhost")
    {
        $user = array("localhost"=>"jyosys","leockdb01.leopalace21.com"=>"chintaikanri");
        $password =  array("localhost"=>"Jy0Sys8848","leockdb01.leopalace21.com"=>"Ch1nta1Kanr1");
    
        if (($db === "schedule" || $db === "taskman" || $db === "devassets")
        && substr($_SERVER["SERVER_NAME"],0,8) === "mywwwdev") {
            $db = $db."_dev";
        }
        $dsn = "mysql:dbname={$db};host={$server}";
        try {
            $this->pdo = new PDO( $dsn, $user[$server], $password[$server] );
        } catch (PDOException $e) {
            $this->pdo = false;
        }
    }
}
?>