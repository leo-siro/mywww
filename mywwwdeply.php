<?php

$payload = json_decode($_REQUEST['payload']);
$url = $payload->repository->clone_url;
$bare_path = parse_url($url, PHP_URL_PATH);

$b = preg_replace('|/git|', '/home/webadmin/.gitbucket/repositories', $bare_path);
$nb = preg_replace('|/git|', '/home/webadmin/.gitbucket/nonbare', $bare_path);
$nb = preg_replace('/\.git$/', '', $nb);
if (!file_exists($nb)) {
  `git clone $b $nb > "./tmp/test.txt" 2>&1`;
} else {
  `cd $nb && git pull > "./tmp/test.txt" 2>&1`;
}
// file_put_contents("./tmp/test.txt",$b." @@ ".$nb." @@ ".$bare_path );
// lftpで送信（FTPで配置する場合）
$host = 'localhost';
$user = 'webadmin';
$pass = 'leo';
$rdir = '/srv/www/htdocs_mywwwdev/test';
`lftp -u $user,$pass -e "mirror -Rv -X .git/ $nb/ $rdir; bye" $host 2>&1`;
?>