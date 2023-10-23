import { hideConfirmationBox, displayConfirmationBox } from './boxes.js';
import { _globals } from './globals.js'
import { _settings } from './settings.js'
import { _texts } from './texts.js'

let _dbox = null;
let _tbox = null;

export function initMenu() {
	let el;
	el = document.getElementById('dropdownButton');
	el.onclick = function(e) { onDropdownButtonClick(); }

	el = document.getElementById('menuHelp');
	el.onclick = function(e) { menuOptionChosen("h"); };
	el = document.getElementById('menuCloseProject');
	el.onclick = function(e) { menuOptionChosen('с'); };

	el = document.getElementById('dropdownContent');
	el.addEventListener('mouseover', 
		function(e) { 
				if( !_dbox ) { 
						_dbox = this.getBoundingClientRect();
				}
		}, true);
	el.addEventListener('mouseout', 
		function(e) { 
				if( _dbox ) {
						if( e.x < _dbox.x || e.x >= _dbox.x+_dbox.width-1 || e.y < _dbox.y || e.y >= _dbox.y+_dbox.height-1 ) {
								hideContent('dropdownContent'); 
								_dbox = null; 
						}
				} 
		}, false );

	el = document.getElementById('menuUserName');
  el.innerHTML = _globals.userName;
	
	document.getElementById('menuHelpTitle').innerText = _texts[_globals.lang].menuHelpTitle;
	document.getElementById('menuCloseProjectTitle').innerText = _texts[_globals.lang].menuCloseProjectTitle;
}

function onDropdownButtonClick() {
	let el = document.getElementById('dropdownContent'); 
	el.style.display=(el.style.display==='block')?'none':'block';
}

function menuOptionChosen( option ) {    
	document.getElementById('dropdownContent').style.display='none';
	if( option === 'h' ) {
		displayConfirmationBox( _texts[_globals.lang].helpText );
	} else {
		closeProject();
	}
}

function hideContent( id ) {
	let el = document.getElementById(id);
	if( !el ) {
			return;
	} 
	if( el.style.display !== 'none' ) {
			el.style.display = 'none';
	}
}


function closeProject() 
{
	if( document.location.host ) 
	{
		let xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			console.log(this.readyState);
			console.log(this);
			if (this.readyState === 4 ) {
				window.close();
			}
		};
		xmlhttp.open("GET", _settings.urlCloseProject + "?" + _globals.projectId, true);
		xmlhttp.setRequestHeader("Cache-Control", "no-cache");
		xmlhttp.send();
	} 
}
