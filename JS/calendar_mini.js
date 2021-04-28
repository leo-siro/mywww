function createCalendar(varYear, varMonth ,varYotei ,varYoteiMode){
	var today = new Date();
	var firstDay = new Date(varYear + '/' + varMonth + '/1');
	var maxDay = new Date(varYear + '/' + varMonth + '/1');
	var WriteMsg = '';
	var tmpDay;
	var i;
	var tmpMonth;
	var calendar_date;

	if(varMonth==12){
		tmpMonth=0;
	}else{
		tmpMonth=varMonth;
	}

	maxDay.setMonth(tmpMonth);
	maxDay.setDate(-1);

	WriteMsg = '<table border=\"0\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" bgcolor=\"#ffffff\">\n';
	tmpDay = firstDay.getDay();
	i=1;
	while(i<=maxDay.getDate()+1){

		if(varYotei[i]){
			WriteMsg = WriteMsg + '<tr><td colspan=\"2\" bgcolor=\"#0000cc\" height=\"1\"></td></tr>';
			if(today.getDate()==i && today.getMonth()+1==varMonth && today.getFullYear()==varYear){
				WriteMsg = WriteMsg + '<tr><td background=\"./Images/table_back_green_h02.gif\" align=\"right\" width=\"20\"><font class=\"keiji_small\" color=\"white\">' + i + '</font><br></td>';
			}else{
				WriteMsg = WriteMsg + '<tr><td background=\"./Images/table_back_blue_h02.gif\" align=\"right\" width=\"20\"><font class=\"keiji_small\" color=\"white\">' + i + '</font><br></td>';
			}
			if(today.getDate()==i && today.getMonth()+1==varMonth && today.getFullYear()==varYear){
				WriteMsg = WriteMsg + '<td class=\"today\"><font class=\"calendar_middle\">';
			}else if(tmpDay==0){
				WriteMsg = WriteMsg + '<td class=\"sun\"><font class=\"calendar_middle\">';
		    }else if(tmpDay==6){
				WriteMsg = WriteMsg + '<td class=\"sat\"><font class=\"calendar_middle\">';
		    }else{
				WriteMsg = WriteMsg + '<td class=\"weekday\"><font class=\"calendar_middle\">';
			}
			calendar_date = varYear*10000 + varMonth*100 + i;
			WriteMsg = WriteMsg + '<a href=\"./php/calendar/main/scheduler.php?calendar_date=' + calendar_date + '&mode=' + varYoteiMode + '\">' ;
			WriteMsg = WriteMsg + varYotei[i] + '</a>';
			WriteMsg = WriteMsg + '<br></font></td></tr>';
		}
		i++;
		tmpDay++;
		if(tmpDay==7){
			tmpDay=0;
		}
	}
	WriteMsg = WriteMsg + '</table>';

return WriteMsg;
}
