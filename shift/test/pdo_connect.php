<?php
class pdoConnect
{
    public $pdo;

    public function __construct($db)
    {
        $user = 'user_project';
        $password = 'user_projectx';
    
        // if (($db === "schedule")
        // && substr($_SERVER["SERVER_NAME"],0,8) === "mywwwdev") {
        //     $db = $db."_dev";
        // }
        $dsn = "sqlsrv:Server=LEOSQL04\\JSYSTEM;Database=Jsystem";
        try {
            $this->pdo = new PDO( $dsn, $user, $password );
        } catch (PDOException $e) {
            $this->pdo = false;
        }
    }
}
?>