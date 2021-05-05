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
    $host = 'chintaikanri.leopalace21.com';
    $user = 'chintaikanri';
    $pass = 'leo';
    $rdir = '/htdocs';
    exec("lftp -u {$user},{$pass} -e \"mirror -R -X .git/ {$nb}/htdocs_dev/ {$rdir}; bye\" {$host}");
?>