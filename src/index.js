import './index.css';
import mainHTML from './main.html';
import { _texts, _icons } from './texts.js';
import { _settings } from './settings.js';
import { _globals, _data, initGlobals, initGlobalsWithLayoutParameters, initGlobalsWithDataParameters, setData } from './globals.js';
import { displayMessageBox, hideMessageBox, createEditBoxInputs } from './boxes.js';
import { decColorToString, dateIntoSpiderDateString, digitsOnly, makeActivityCache } from './utils.js';
import { drawTableHeader, drawTableContent } from './drawtable.js';
import { initMenu } from './menu.js';

// Attaching to the html container element
let script = document.getElementById('bundle');
let appContainer = null;
let userName = null;
if( script ) {	
	let appContainerName = script.getAttribute('data-appcontainer');
	if(appContainerName) { 
		appContainer = document.getElementById(appContainerName);
    }
    userName = script.getAttribute('data-username');
}
if( appContainer ) {
	appContainer.innerHTML = mainHTML;
} else { 
	document.body.innerHTML = mainHTML;
}
initGlobals(appContainer, userName);
	
window.addEventListener( "load", onWindowLoad );
window.addEventListener( 'resize', function() { location.reload(); } );

function onWindowLoad() {
	initGlobalsWithLayoutParameters();
	loadData();
}

function loadData() {
	if( document.location.host ) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
		    if (this.readyState == 4 ) {
		    	if( this.status == 200) {
			    	let errorParsingData = false;
			    	try{
				        setData( JSON.parse(this.responseText) );
			    	} catch(e) {
			    		errorParsingData = true;
			    	}
			    	if( errorParsingData ) { // To ensure data are parsed ok...
							displayMessageBox( _texts[_globals.lang].errorParsingData ); 
							return;
			    	}
			    	if( !('activities' in _data) || _data.activities.length == 0 ) {
							displayMessageBox( _texts[_globals.lang].errorParsingData ); 
							return;
			    	}
						hideMessageBox();
						if( initData() == 0 ) {
							if( _data.editables.length == 0 ) {
								_data.noEditables = true;
							} else {
								_data.noEditables = false;
								createEditBoxInputs();
							}
							displayData();
						} else {
							displayMessageBox( _texts[_globals.lang].errorLoadingData ); 
						}
					} else {
						displayMessageBox( _texts[_globals.lang].errorLoadingData ); 
					}
		    }
		};
		if( _globals.dataRequest !== '' ) {
			//xmlhttp.open("GET", _settings.urlData + '?' + decodeURIComponent(_globals.dataRequest), true);
			xmlhttp.open("GET", _settings.urlData + window.location.search, true);
			xmlhttp.setRequestHeader("Cache-Control", "no-cache");
			xmlhttp.send();
			displayMessageBox( _texts[_globals.lang].waitDataText ); 
		}
	} 
}


function displayData() {	
	displayHeaderAndFooterInfo();	
	drawTableHeader(true);
	drawTableContent(true);
}


function initData() {
	initGlobalsWithDataParameters();

	_data.project.curTimeInSeconds = _data.project.CurTime;
	_data.project.CurTime = dateIntoSpiderDateString( _data.project.CurTime );

	if( _data.activities.length == 0 ) {
		displayMessageBox( _texts[_globals.lang].errorParsingData );						
		return(-1);				
	}
	if( !('Code' in _data.activities[0]) || !('Level' in _data.activities[0]) ) { 	// 'Code' and 'Level' is a must!!!!
		displayMessageBox( _texts[_globals.lang].errorParsingData );						// Exiting otherwise...
		return(-1);		
  }

	// Creating "editables" array for better data handling and attaching it to "_data"
	_data.editables = [];     
	for( let col = 0 ; col < _data.fields.length ; col++ ) {
		if( 'editable' in _data.fields[col] && _data.fields[col].editable == true ) {
			_data.editables.push({ 
					ref: _data.fields[col].Code, name:_data.fields[col].Name, 
					type: _data.fields[col].Type, format: _data.fields[col].format 
			});
		}
	}

	// Creating ref-type array and attaching it to "_data"
	_data.refSettings = {};
	for( let col = 0 ; col < _data.fields.length ; col++ ) {
		let o = { column: col, type: _data.fields[col].Type, format: _data.fields[col].format, 
			name: _data.fields[col].Name, editableType: null };
		for( let ie = 0 ; ie < _data.editables.length ; ie++ ) { 	// Is editable?
			if( _data.editables[ie].ref === _data.fields[col].Code ) {
				o.editableType = _data.editables[ie].type;
			}
		}
		_data.refSettings[ _data.fields[col].Code ] = o;
	}
	//console.log(_data);
	_data.activityCache = makeActivityCache(_data);
	
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		let d = _data.activities[i];
		d.color = decColorToString( d.f_ColorCom, _settings.ganttOperation0Color );
		d.colorBack = decColorToString( d.f_ColorBack, "#ffffff" );
		d.colorFont = decColorToString( d.f_FontColor, _settings.tableContentStrokeColor );
		if( typeof( d.Level ) === 'string' ) {
			if( digitsOnly(d.Level) ) {
				d.Level = parseInt(d.Level);
			}
		}
		for( let col = 0 ; col < _data.fields.length ; col++ ) {
			if( !(_data.fields[col].Code in d) ) {
				d[_data.fields[col].Code] = null;
			}
		}
	}

	// Initializing the parent-children structure and the link structure
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		_data.activities[i].id = 'ganttRect' + i; // Id
		initParents(i);
		_data.activities[i]._isPhase = (typeof(_data.activities[i].Level) === 'number') ? true : false;
	}

	// Marking 'expandables'
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		let hasChild = false;
		for( let j = i+1 ; j < _data.activities.length ; j++ ) {
			for( let k = 0 ; k < _data.activities[j].parents.length ; k++ ) {
				if( _data.activities[j].parents[k] == i ) { // If i is a parent of j
					hasChild = true;
					break;
				}
			}
			if( hasChild ) {
				break;
			}
		}
		if( hasChild ) {
			_data.activities[i].expanded = true;
			_data.activities[i].expandable = true;
		} else {
			_data.activities[i].expanded = true;			
			_data.activities[i].expandable = false;
		}
		_data.activities[i].visible = true;
	}
	return(0);
}


function initParents( iOperation ) {
	_data.activities[iOperation].parents = []; // Initializing "parents"
	for( let i = iOperation-1 ; i >= 0 ; i-- ) {
		let l = _data.activities[iOperation].parents.length;
		let currentLevel;
		if( l == 0 ) {
			currentLevel = _data.activities[iOperation].Level;
		} else {
			let lastPushedIndex = _data.activities[iOperation].parents[l-1];
			currentLevel = _data.activities[lastPushedIndex].Level;
		}
		if( currentLevel === null ) { // Current level is an operation
			if( typeof(_data.activities[i].Level) === 'number' ) {
				_data.activities[iOperation].parents.push(i);
			}
		} else if( typeof(currentLevel) === 'number' ) { // Current level is a phase
			if( typeof(_data.activities[i].Level) === 'number' ) {
				if( _data.activities[i].Level < currentLevel ) {
					_data.activities[iOperation].parents.push(i);
				}
			}
		} else if( typeof(currentLevel) === 'string' ) { // Current level is a team or resourse
			if( _data.activities[i].Level === null ) { // The upper level element is an operation
				_data.activities[iOperation].parents.push(i);
			} else if( currentLevel == 'A' ) {
				if( _data.activities[i].Level === 'T' ) { // The upper level element is a team
					_data.activities[iOperation].parents.push(i);
				}
			}
		}
	}	
}


function displayHeaderAndFooterInfo() {
	let projectName = document.getElementById('projectName');
	projectName.innerText = _data.project.Name;
	document.title = "SP | " + _data.project.Name;

	let timeAndVersionAndUser = _texts[_globals.lang].version + ": " + _data.project.Version + 
		'&nbsp;|&nbsp;' + [ _globals.startDateStr + " - " + _globals.endDateStr ] + 
		(('Notes' in _data.project && _data.project.Notes.length > 0) ? ('&nbsp;|&nbsp;' + _data.project.Notes) : '');
	document.getElementById('projectTimeAndVersion').innerHTML = timeAndVersionAndUser;
	/*
	if( _globals.userName !== null ) {
		let el = document.getElementById('projectUser');
		el.innerHTML = _globals.userName; // + "<br/><span style='cursor:pointer;'>[&rarr;]</span>"; // ➜ ➡ ➝ ➲ ➠ ➞ ➩ ➯ →
		el.onclick = function(e) { logout(); };
	}
	*/
	initMenu();
}
