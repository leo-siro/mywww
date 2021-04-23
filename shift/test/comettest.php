<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<script src="/JS/jquery-3.5.1.min.js"></script>
    <script src="/JS/common.js"></script>
    <title>コメットテスト</title>
    <script>
        $(function () {
            Ajax('comet.php').done(function(ret) {
                console.log(ret.code);
                $('#sample').append(ret.code);
            }).fail(function (ret) {
                console.log('ERROR');
            });
        });
    </script>
</head>
<body>
    <ul id="sample"></ul>
</body>
</html>