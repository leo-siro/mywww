function createCalendar(varYear, varMonth ,varYotei ,varYoteiMode){
	var today = new Date();
	var firstDay = new Date(varYear + '/' + varMonth + '/1');
	var maxDay = new Date(varYear + '/' + varMonth + '/1');
	var WriteMsg = '';
	var tmpDay;
	var i;
	var ii;
	var tmpMonth;
	var calendardate;
	var varCode;

	if(varMonth==12){
		tmpMonth=0;
	}else{
		tmpMonth=varMonth;
	}
	maxDay.setMonth(tmpMonth);
	maxDay.setDate(-1);
	tmpDay = firstDay.getDay();
	i=1;
	while(i<=maxDay.getDate()+1){
		ii=1;
		WriteMsg = WriteMsg + '<tr>';
		if(today.getDate()==i && today.getMonth()+1==varMonth && today.getFullYear()==varYear){
			WriteMsg = WriteMsg + '<td style=\"width:30\" background=\"../../../Images/table_back_green_h02.gif\" align=\"right\"><font class=\"keiji_small\" color=\"white\">' + i + '</font><br></td>';
		}else{
			WriteMsg = WriteMsg + '<td style=\"width:30\" background=\"../../../Images/table_back_blue_h02.gif\" align=\"right\"><font class=\"keiji_small\" color=\"white\">' + i + '</font><br></td>';
		}
		// 日付の欄の処理
		for(ii in varYoteiMode){
			varCode=varYoteiMode[ii];
			if(today.getDate()==i && today.getMonth()+1==varMonth && today.getFullYear()==varYear){
				WriteMsg = WriteMsg + '<td style=\"width:100\" class=\"today\"><font class=\"calendar_middle\">';
			}else if(tmpDay==0){
				WriteMsg = WriteMsg + '<td style=\"width:100\" class=\"sun\"><font class=\"calendar_middle\">';
		    }else if(tmpDay==6){
				WriteMsg = WriteMsg + '<td style=\"width:100\" class=\"sat\"><font class=\"calendar_middle\">';
		    }else{
				WriteMsg = WriteMsg + '<td style=\"width:100\" class=\"weekday\"><font class=\"calendar_middle\">';
			}
			// ここからだ！
			 if(varYotei[varCode][i]){
				calendardate = varYear*10000 + varMonth*100 + i;
				WriteMsg = WriteMsg + '<a href=\"./scheduler.php?calendar_date=' + calendardate + '&mode=' + varCode + '\">' ;
				WriteMsg = WriteMsg + varYotei[varCode][i] + '</a>';
			 }
			WriteMsg = WriteMsg + '<br></font></td>';
		}
		WriteMsg = WriteMsg + '</tr>';
		i++;
		tmpDay++;
		if(tmpDay==7){
			tmpDay=0;
		}
	}
return WriteMsg;
}
