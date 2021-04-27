<?php

$payload = json_decode($_REQUEST['payload']);
$url = $payload->repository->url;
$bare_path = parse_url($url, PHP_URL_PATH);

$b = preg_replace('|/git|', '/gitbucket/repositories', $bare_path);
$nb = preg_replace('|/git|', '/gitbucket/nonbare', $bare_path);
$nb = preg_replace('/\.git$/', '', $nb);
if (!file_exists($nb)) {
  `git clone $b $nb > "./tmp/test.txt" 2>&1`;
} else {
  `cd $nb && git pull > "./tmp/test.txt" 2>&1`;
}
// file_put_contents("./tmp/test.txt",$bare_path);

?>