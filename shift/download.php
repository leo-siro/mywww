<?php
setlocale(LC_ALL, 'ja_JP.UTF-8');
$file = realpath($_GET["file"]);
if(isset($file) && file_exists($file)){
	switch(pathinfo($file,PATHINFO_EXTENSION)){
		case 'zip':$file_type='zip';
		case 'pdf':$file_type='pdf';
		case 'csv':$file_type='octet-stream';
		case 'xlsx':$file_type='vnd.ms-excel';
		case 'xlsm':$file_type='vnd.ms-excel';
		case 'pptx':$file_type='vnd.openxmlformats-officedocument.presentationml.presentation';
	}
	header("Content-length: ".filesize($file));
	header('Content-Type: application/'.$file_type);
	// header('Content-Disposition: attachment; filename="' . mb_convert_encoding(basename($file),"SJIS-win","UTF-8") . '"');
	header("Content-Disposition: attachment; filename*=UTF-8''" . rawurlencode(basename($file)));

	readfile($file);
}
?>