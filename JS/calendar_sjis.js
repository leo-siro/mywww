function createCalendar(varYear, varMonth ,varYotei){
	var today = new Date();
	var firstDay = new Date(varYear + '/' + varMonth + '/1');
	var maxDay = new Date(varYear + '/' + varMonth + '/1');
	var WriteMsg;
	var tmpDay;
	var i;
	var tmpMonth;

	if(varMonth==12){
		tmpMonth=0;
	}else{
		tmpMonth=varMonth;
	}
	maxDay.setMonth(tmpMonth);
	maxDay.setDate(-1);

	WriteMsg = '<table border=\"0\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n';
	tmpDay = firstDay.getDay();
	i=1;
	while(i<=maxDay.getDate()+1){
		WriteMsg = WriteMsg + '<tr><td colspan=\"2\" bgcolor=\"#0000cc\" height=\"1\"></td></tr>';
		if(today.getDate()==i){
			WriteMsg = WriteMsg + '<tr><td background=\"./Images/table_back_red_h02.gif\" align=\"right\"><font class=\"keiji_small\" color=\"white\">' + i + '</font><br></td>';
		}else{
			WriteMsg = WriteMsg + '<tr><td background=\"./Images/table_back_blue_h02.gif\" align=\"right\"><font class=\"keiji_small\" color=\"white\">' + i + '</font><br></td>';
		}
		if(today.getDate()==i){
			WriteMsg = WriteMsg + '<td class=\"today\"><font class=\"keiji_middle\">';
		}else if(tmpDay==0){
			WriteMsg = WriteMsg + '<td class=\"sun\"><font class=\"keiji_middle\">';
	    }else if(tmpDay==6){
			WriteMsg = WriteMsg + '<td class=\"sat\"><font class=\"keiji_middle\">';
	    }else{
			WriteMsg = WriteMsg + '<td class=\"weekday\"><font class=\"keiji_middle\">';
		}
		if(varYotei[i]){
			WriteMsg = WriteMsg + varYotei[i] ;
		}
		WriteMsg = WriteMsg + '<br></font></td></tr>';
		i++;
		tmpDay++;
		if(tmpDay==7){
			tmpDay=0;
		}
	}
	WriteMsg = WriteMsg + '</table>';
return WriteMsg;
}
