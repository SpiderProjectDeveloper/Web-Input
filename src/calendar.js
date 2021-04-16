var _calendar = null
var _calendarDayChosen = null;
var _calendarContainer = null
var _calendarCallBack = null

var _calendarFormat = { 'dateOnly':false };

var _calendarMonthArray = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ];

var _calendarMonthArrays = {
	'en': _calendarMonthArray,
	'ru': [ 'ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕП','ОКТ','НОЯ','ДЕК' ]
};

var _calendarInputCurrentlyEdited = null;

export function calendarGetFormat() {
	return _calendarFormat;
}

export function calendarSetFormat( format ) {
	if( typeof(format) === 'undefined' ) {
		return;
	}
	if( format === null ) {
		return;
	}
	if( 'dateOnly' in format ) {
		_calendarFormat.dateOnly = format.dateOnly;			
	}
}

var _calendarCellWidth, _calendarCellHeight;

export function calendar( container, forInput, callBack, cellWidth, cellHeight, date, monthArray=null ) {
	if( calendarIsActive() ) {
		let isReturn = (forInput === _calendarInputCurrentlyEdited ) ? true : false;
		calendarCancel();
		if( isReturn ) {
			return;
		}
	}
	_calendarInputCurrentlyEdited = forInput;

	forInput.disabled = true;

	if( typeof(monthArray) === 'string' ) { 	// A language specified
		_calendarMonthArray = _calendarMonthArrays[monthArray];
	} else if( monthArray !== null ) {
		_calendarMonthArray = monthArray;
	} 

	_calendarCellWidth = cellWidth;
	_calendarCellHeight = cellHeight;
	calendarInit( container, callBack, cellWidth, cellHeight );
	calendarSetDate( date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes() );
}

export function calendarCancel( date=null ) {
	if( _calendar !== null ) {
		if( _calendarCallBack ) {
			_calendarCallBack( date );			
		}
		_calendarInputCurrentlyEdited.disabled = false;
		_calendarInputCurrentlyEdited = null;

		_calendarContainer.removeChild(_calendar);
		_calendar = null;
		_calendarCallBack = null; // !!!! added
		_calendarContainer.style.display = 'none';					
	}
}


export function calendarIsActive() {
	if( _calendar !== null ) {
		return true;
	}
	return false;
}


function calendarInit( container, callBack, cellWidth, cellHeight ) {
	if( _calendar !== null ) {
		return;
	}
	let overallHeight = (_calendarFormat.dateOnly) ? 8 : 9.75;
	container.style.display = 'inline-block';
	_calendar = document.createElement("div");
	_calendar.style.width = (cellWidth*7+4) + 'px';
	_calendar.style.height = (cellHeight*overallHeight) + 'px';
	_calendar.style.border = '2px solid #d0d0d0';
	_calendar.style.borderRadius = '4px';
	_calendar.style.boxSizing = 'content-box';
	_calendar.style.backgroundColor = '#ffffff';
	_calendar.style.position = 'relative';
	_calendar.addEventListener( 'mousedown', function(e) { e.stopPropagation(); } );

	let yearInput = createInputNumberElement('calendar-year', 4, 0.1, 2, 1, { type: 'year'} );
	_calendar.appendChild(yearInput);

	let yearDec = createArrowControlElement( 'calendar-year-dec', 3, 0.1, 1, 1, '&minus;', 'center' );
	yearDec.onclick = function(e) { changeIntegerInInput( yearInput, -1); }
	_calendar.appendChild(yearDec);
	let yearInc = createArrowControlElement( 'calendar-year-inc', 6, 0.1, 1, 1, '&plus;', 'center' );
	yearInc.onclick = function(e) { changeIntegerInInput( yearInput, +1); }
	_calendar.appendChild(yearInc);

	let monthInput = document.createElement("select");
	monthInput.setAttribute( 'id', `calendar-month` );
	monthInput.style.position = 'absolute';
	monthInput.style.top = '2px';
	monthInput.style.left = '2px';
	monthInput.style.width = (cellWidth*3-4) + 'px';
	monthInput.style.height = cellHeight + 'px';
	monthInput.style.fontSize = parseInt(4*cellHeight/7) + 'px';
	monthInput.style.border = '0px';
	monthInput.style.margin = '0px';
	monthInput.style.padding = '0px';
	for( let m = 0 ; m < _calendarMonthArray.length ; m++ ) {
	    let option = document.createElement("option");
	    option.value = m;
	    option.text = _calendarMonthArray[m];
	    monthInput.appendChild(option);
	}		
	monthInput.value = 0;
	monthInput.setAttribute('class','noArrow');		
	monthInput.onchange = function() {
		calendarDisplay( document.getElementById('calendar-year').value, this.value );
	};
	_calendar.appendChild(monthInput);

	for( let w = 0 ; w < 6 ; w++ ) {
		for( let d = 0 ; d < 7 ; d++ ) {
			let day = createClickableElement( `calendar-w${w}-d${d}`, d, w+1, 1, 1 ); 

			day.addEventListener( 'mousedown', function(e) {
				e.stopPropagation();
				//calendarSetDate(null, null, parseInt(this.childNodes[0].textContent));
				let y = document.getElementById('calendar-year').value;
				let m = parseInt(document.getElementById('calendar-month').value);
				let d = parseInt(this.childNodes[0].textContent);
				if( isNaN(d) ) {
					return;
				}
				_calendarDayChosen = d;
				let hr;
				let mn;
				if( !_calendarFormat.dateOnly ) {
					hr = document.getElementById('calendar-hour').value;
					mn = document.getElementById('calendar-minute').value;						
				} else {
					hr = 0;
					mn = 0;
				}
				let date = new Date( Date.UTC(y,m,d,hr,mn,0,0) );
				calendarCancel(date);
			});
			day.appendChild( document.createTextNode(d) );
			_calendar.appendChild(day);
		}
	}

	let cancelTop = (_calendarFormat.dateOnly) ? 7 : 8.75;
	let cancel = createClickableElement( 'calendar-cancel', 0.25, cancelTop, 1, 1, { color:'#aa4444', textAlign:'left', border:null } );
	cancel.appendChild( document.createTextNode('X') );
	cancel.onclick = function(e) {
		calendarCancel();
	}
	_calendar.appendChild(cancel);

	if( !_calendarFormat.dateOnly ) {
		let hourInput = createInputNumberElement('calendar-hour', 4.5, 7.9, 1, 1, { type: 'hour', align: 'center' } );
		_calendar.appendChild(hourInput);
		let hourInc = createArrowControlElement( 'calendar-hour-inc', 4.5, 7, 1, 0.75, '&plus;', 'center' );
		hourInc.onclick = function(e) { changeIntegerInInput( hourInput, +1); }
		_calendar.appendChild(hourInc);
		let hourDec = createArrowControlElement( 'hour-hour-dec', 4.5, 8.8, 1, 0.75, '&minus;', 'center' );
		hourDec.onclick = function(e) { changeIntegerInInput( hourInput, -1); }
		_calendar.appendChild(hourDec);
			
		let minuteInput = createInputNumberElement('calendar-minute', 5.5, 7.9, 1, 1, { type: 'minute', align: 'center' } );
		_calendar.appendChild(minuteInput);
		let minuteInc = createArrowControlElement( 'calendar-minute-inc', 5.5, 7, 1, 0.75, '&plus;', 'center' );
		minuteInc.onclick = function(e) { changeIntegerInInput( minuteInput, +1); }
		_calendar.appendChild(minuteInc);
		let minuteDec = createArrowControlElement( 'hour-minute-dec', 5.5, 8.8, 1, 0.75, '&minus;', 'center' );
		minuteDec.onclick = function(e) { changeIntegerInInput( minuteInput, -1); }
		_calendar.appendChild(minuteDec);

	}

	_calendarContainer = container;
	_calendarCallBack = callBack;
	_calendarContainer.appendChild(_calendar);
}


function calendarSetDate( year=null, month=null, day=null, hour=null, minute=null ) {
	if( year !== null ) {
		document.getElementById('calendar-year').value = year;
	} else {
		year = parseInt(document.getElementById('calendar-year').value);
	}
	if( month !== null ) {
		document.getElementById('calendar-month').value = month;	
	} else {
		month = parseInt(document.getElementById('calendar-month').value);
	}
	calendarDisplay( year, month, day, hour, minute );

	_calendarDayChosen = day;
}

function calendarDisplay( year, month, day=null, hour=null, minute=null ) {
	let lastDayOfMonthDate = new Date( Date.UTC(parseInt(year), parseInt(month)+1, 0) );
	let numDaysInMonth = lastDayOfMonthDate.getUTCDate();

	let firstDayInMonthDate = new Date( Date.UTC(year, month, 1) );
	let firstWeekDayOfMonth = firstDayInMonthDate.getUTCDay();
	firstWeekDayOfMonth = (firstWeekDayOfMonth==0) ? 6 : firstWeekDayOfMonth-1;
	let lastWeekDayOfMonth = lastDayOfMonthDate.getUTCDay();
	lastWeekDayOfMonth = (lastWeekDayOfMonth==0) ? 6 : lastWeekDayOfMonth-1;

	for( let w = 0 ; w < 6 ; w++ ) {
		for( let d = 0 ; d < 7 ; d++ ) {
			let dayElem = document.getElementById( `calendar-w${w}-d${d}` );
			let dayNum = w*7 + d - firstWeekDayOfMonth;   

			if( dayNum + 1 != day ) {
				dayElem.style.backgroundColor = '#ffffff';
			} else {
				dayElem.style.backgroundColor = '#dfdfdf';					
			}

			if( dayNum < 0 ) {
				dayElem.childNodes[0].textContent = '';
				continue;
			}
			if( dayNum >= numDaysInMonth ) {
				dayElem.childNodes[0].textContent = '';
				continue;
			}
			dayElem.childNodes[0].textContent = dayNum+1;
		}
	}

	if( !_calendarFormat.dateOnly ) {			
		if( hour !== null ) {
			let elem = document.getElementById('calendar-hour');
			elem.value = hour;
			onNumberChange(elem);
		}
		if( minute !== null ) {	
			let elem = document.getElementById('calendar-minute');
			elem.value = minute;
			onNumberChange(elem);
		}
	}
}


function changeIntegerInInput( elem, change ) {
	let value;
	try {
		value = parseInt(elem.value);
	} catch(e) {
		return;
	}
	let minValue = parseInt( elem.dataset.minValue );
	let maxValue = parseInt( elem.dataset.maxValue );
	value = value + change;
	if( value < minValue ) {
		value = minValue;
	} else if( value > maxValue ) {
		value = maxValue;
	}
	if( elem.dataset.paddingTo2Digits === 'y' && value < 10 ) {
		elem.value = '0' + String(value);
	} else {
		elem.value = String(value);
	}
}

function createArrowControlElement( id, left, top, width, height, html, align='left' ) {
	let elem = document.createElement("div");
	elem.setAttribute( 'id', id );
	elem.style.position = 'absolute';
	elem.style.top = _calendarCellHeight * top + 'px';
	elem.style.height = _calendarCellHeight * height + 'px';
	elem.style.minHeight = elem.style.height;
	elem.style.maxHeight = elem.style.height;
	elem.style.left = (_calendarCellWidth * left) + 'px';
	elem.style.width = (_calendarCellWidth * width) + 'px';
	elem.style.minWidth = elem.style.width;
	elem.style.maxWidth = elem.style.width;
	elem.style.fontSize = parseInt(4.5 * _calendarCellHeight / 7) + 'px';
	elem.style.textAlign = align;
	elem.style.fontWeight = 'bold';
	elem.style.backgroundColor = '#dfdfdf';
	elem.style.color = '#2f2f2f';
	elem.style.margin = '0px';
	elem.style.padding = '-2px 0px 0px 0px';
	elem.style.cursor = 'pointer';
	elem.innerHTML = html;
	return elem;
}


function createInputNumberElement( id, left, top, width, height, props={} ) {
	let elem = document.createElement("input");
	elem.setAttribute( 'id', id );
	elem.style.position = 'absolute';
	elem.style.top = (_calendarCellHeight * top) + 'px';
	elem.style.height = (_calendarCellHeight * height) + 'px';
	elem.style.height = elem.style.minHeight;
	elem.style.height = elem.style.maxHeight;
	elem.style.left = (_calendarCellWidth * left) + 'px';
	elem.style.width = (_calendarCellWidth * width) + 'px';
	elem.style.minWidth = elem.style.width;
	elem.style.maxWidth = elem.style.width;
	elem.style.fontSize = parseInt(4 * _calendarCellHeight / 7) + 'px';
	elem.style.fontWeight = 'bold';
	elem.style.textAlign = ( 'align' in props ) ? props.align : 'center';
	elem.style.border = '1px';
	elem.style.margin = '0px';
	elem.style.padding = '2px';
	elem.dataset.previousvalue = '';

	let min, max;
	let paddingTo2Digits;
	if( 'type' in props ) {
		if( props.type === 'year') {
			min=1970; max=2020;
			paddingTo2Digits=false;
		} else if( props.type === 'hour' ) {
			min=0; max=23; 
			paddingTo2Digits=true;
		} else if( props.type === 'minute') {
			min=0; max=59;
			paddingTo2Digits=true;
		}
	}
	elem.dataset.minValue = String(min);
	elem.dataset.maxValue = String(max);
	elem.dataset.paddingTo2Digits = (paddingTo2Digits) ? 'y' : 'n'; 
	elem.onchange = function(e) {
		onNumberChange(elem, min, max );
	}
	elem.oninput = function(e) {
		onNumberInput( elem );
	}
	elem.setAttribute('type','text');
	//elem.setAttribute('min', min);
	//elem.setAttribute('max', max);
	//elem.setAttribute('class','noArrow');
	return elem;
}


function onNumberInput( elem ) {
	const re = RegExp('^[0-9]*$');
	let reExec = re.exec(elem.value);
    if( reExec === null ) {
    	elem.value = elem.dataset.previousvalue;
	} else {
    	elem.dataset.previousvalue = elem.value;
	}
}

function onNumberChange( elem ) {
	if( elem === document.activeElement ) {
		return;
	}	
	let minValue = parseInt( elem.dataset.minValue );
	let maxValue = parseInt( elem.dataset.maxValue );
	let value;
	try { 
		value = parseInt(elem.value);
	} catch(e) {
		elem.value = elem.dataset.originalvalue;
		return;
	}
	if( value < minValue || isNaN(value) ) {
		value = minValue;
	} 	
	if( value > maxValue ) {
		value = maxValue;
	}
	if( elem.dataset.paddingTo2Digits === 'y' && value < 10 && elem.value.length == 1) {
		elem.value = '0' + value;
	} else {
		elem.value = value;
	}
	elem.dataset.previousvalue = elem.value;
}


function createClickableElement( id, left, top, width, height, props={} ) {
	let elem = document.createElement("div");
	elem.setAttribute( 'id', id );
	elem.style.position = 'absolute';
	elem.style.left = (left*_calendarCellWidth + 0) + 'px';
	elem.style.top = (top*_calendarCellHeight + 0) + 'px';
	elem.style.width = (_calendarCellWidth * width) + 'px';
	elem.style.height = (_calendarCellHeight * height) + 'px';
	elem.style.border = ('border' in props) ? props.border : '1px dotted #dfdfdf';
	elem.style.margin = '0px';
	elem.style.padding = '0px';
	elem.style.textAlign = ('textAlign' in props) ? props.textAlign : 'center';
	elem.style.fontSize = parseInt(_calendarCellHeight * 4 / 7) + 'px';
	elem.style.color = ('color' in props) ? props.color : '#4f4f4f';
	elem.style.backgroundColor = ('backgroundColor' in props) ? props.backgroundColor : '#ffffff';
	elem.style.cursor = 'pointer';
	return elem;
}