<?php

$payload = json_decode($_REQUEST['payload']);
$url = $payload->repository->clone_url;
$bare_path = parse_url($url, PHP_URL_PATH);

$b = preg_replace('|/git|', '/home/webadmin/.gitbucket/repositories', $bare_path);
$nb = preg_replace('|/git|', '/home/webadmin/.gitbucket/nonbare', $bare_path);
$nb = preg_replace('/\.git$/', '', $nb);
// `rm -rf $nb`;
if (!file_exists($nb)) {
  `git clone $b $nb 2>&1`;
} else {
  `cd $nb && git pull`;
//   `git pull > ./tmp/test.txt 2>&1`;
}
// lftpで送信（FTPで配置する場合）
// $host = 'localhost';
// $user = 'webadmin';
// $pass = 'leo';
// $rdir = '/srv/www/htdocs_mywwwdev/test';
// `lftp -u $user,$pass -e "mirror -Rn -X .git/ $nb/ $rdir; bye" $host 2>&1`;
// file_put_contents("./tmp/test.txt","lftp -u {$user},{$pass} -e \"mirror -Rev -X .git/ {$nb}/ {$rdir}; bye\" {$host} 2>&1" );
?>