<?php
    $payload = json_decode($_REQUEST['payload']);
    $url = $payload->repository->clone_url;
    $bare_path = parse_url($url, PHP_URL_PATH);

    $b = preg_replace('|/git|', '/home/webadmin/.gitbucket/repositories', $bare_path);
    $nb = preg_replace('|/git|', '/home/webadmin/.gitbucket/nonbare', $bare_path);
    $nb = preg_replace('/\.git$/', '', $nb);

    if (!file_exists($nb)) {
        exec("git clone {$b} {$nb}");
    } else {
        exec("cd {$nb} && git pull");
    }
    // lftpで送信（FTPで配置する場合）
    $host = 'localhost';
    $user = 'webadmin';
    $pass = 'leo';
    $rdir = '/srv/www/htdocs_mywwwdev/test';
    exec("lftp -u {$user},{$pass} -e \"mirror -Rvn -X .git/ {$nb}/ {$rdir}; bye\" {$host}");
?>