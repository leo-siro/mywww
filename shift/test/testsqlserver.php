<?php
phpinfo();
exit;
    require_once "pdo_connect.php";
    $con = new pdoConnect("");
    
    if ($con === false) {
        echo "connect errro";
    } else {
        var_dump($con);
    }
    $sql = "SELECT * FROM T_KADAI";
    // $ds = $con->pdo->query($sql);
    // if ($row = $ds->fetch()) {
    //     echo $row["KA_KEYNUM"];
    // }

?>