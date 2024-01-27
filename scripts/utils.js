/* 
 Returns the point (latitude, longitude) that is a distance (m) away from the given origin point (latitude, longitude) 
 in the direction heading (degrees, clockwise from 0 degrees north).
 
 Adopted from https://github.com/makinacorpus/Leaflet.GeometryUtil/blob/master/src/leaflet.geometryutil.js

*/

function destination(latlng, heading, distance) {
	heading = (heading + 360) % 360;
	var rad = Math.PI / 180,
		radInv = 180 / Math.PI,
		R = L.CRS.Earth.R, // approximation of Earth's radius
		//lon1 = latlng.lng * rad,
		//lat1 = latlng.lat * rad,
		lat1 = latlng[0] * rad,
		lon1 = latlng[1] * rad,
		rheading = heading * rad,
		sinLat1 = Math.sin(lat1),
		cosLat1 = Math.cos(lat1),
		cosDistR = Math.cos(distance / R),
		sinDistR = Math.sin(distance / R),
		lat2 = Math.asin(sinLat1 * cosDistR + cosLat1 *
			sinDistR * Math.cos(rheading)),
		lon2 = lon1 + Math.atan2(Math.sin(rheading) * sinDistR *
			cosLat1, cosDistR - sinLat1 * Math.sin(lat2));
	lon2 = lon2 * radInv;
	lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
	// return L.latLng([lat2 * radInv, lon2]);
	return [lat2 * radInv, lon2];
}

/*
Pauses execution for ms milliseconds (to be used in an async function)
*/
const timer = ms => new Promise(res => setTimeout(res, ms))

/*
Returns the HTML contents for a well creation/editing dialog.
*/
function wellDialogContents(param) {

	let id, title, wellName, lat, lng, topComp, bottomComp, injRate, okFunc, closeFunc;
	if (param) {
		// Non-empty param means that we are editing an existing well
		id = param.id;
		title = param.title;
		wellName = param.wellName;
		lat = param.lat;
		lng = param.lng;
		topComp = param.topComp;
		bottomComp = param.bottomComp;
		injRate = param.injRate;
		okFunc = 'ctrl.modifyWell({id: ' + id + ', newWell: false})';
		closeFunc = 'ctrl._wells[' + id + '].marker._popup.close()';
	}
	else {
		// Empty param means that we are creating a new well
		id = ctrl._wellIDcounter;
		title = 'Create a vertical injection well';
		wellName = '';
		lat = 0;
		lng = 0;
		topComp = 0;
		bottomComp = 0;
		injRate = 0;
		okFunc = 'ctrl.modifyWell({id: ' + id + ', newWell: true})';
		closeFunc = 'newWellDialog.close()';
	}

	// Input box maxlength does not work for type=="number"	
	return '<b>' + title + '</b> \
			<hr>  \
			<div class="create-well-dialog"> \
			<div class="well-item">Well name</div><div class="well-item"><input id="idWellName_' + id + '" type="text" value="' + wellName + '" maxlength="15" size="5"/></div><div class="well-item"></div> \
			<div class="well-item">Latitude</div><div class="well-item"><input id="idWellLat_' + id + '" type="text" value="' + lat + '" maxlength="8" size="5"/></div><div class="well-item">deg</div> \
			<div class="well-item">Longitude</div><div class="well-item"><input id="idWellLng_' + id + '" type="text" value="' + lng + '" maxlength="8" size="5"/></div><div class="well-item">deg</div> \
			<div class="well-item">Top completion</div><div class="well-item"><input id="idTopComp_' + id + '" type="text" value="' + topComp + '" maxlength="5" size="5"/></div><div class="well-item">m</div> \
			<div class="well-item">Bottom completion</div><div class="well-item"><input id="idBottomComp_' + id + '" type="text" value="' + bottomComp + '" maxlength="5" size="5"/></div><div class="well-item">m</div> \
			<div class="well-item">CO<sub>2</sub> injection rate</div><div class="well-item"><input id="idCO2injRate_' + id + '" type="text" value="' + injRate + '" maxlength="5" size="5"/></div><div class="well-item">Mta</div> \
			<div class="well-item"></div><div class="well-item"></div><div class="well-item"></div> \
			<div class="well-item"><button onclick="' + okFunc + '">Ok</button></div> \
			<div class="well-item"></div> \
			<div class="well-item"><button onclick="' + closeFunc + '">Cancel</button></div> \
			</div> <br> \
			'		
}

// Update the well's coordinates if the marker is moved (dragged or a new latlng is entered via the Edit well dialog)
function onWellMove(id, lat, lng) {

	// Debugging
	//console.log(this.options.id);
	//console.log(e.target.getLatLng());
	//console.log(lat, lng);

	// Round latlng to 5 decimal places, which correspond to the accuracy of 1.11 m
	lat = Math.round(lat * 1e5) / 1e5;
	lng = Math.round(lng * 1e5) / 1e5;

	// Update the well coordinates if the marker is dragged into a new position
	ctrl._wells[id].lat = lat;
	ctrl._wells[id].lng = lng;

	// Replace the old latlng in the dialog contents with the new values 
	/*
	let popupContents = ctrl._wells[id].marker._popup._content;
	let token = popupContents.split('"');
	let iLat = token.indexOf('idWellLat');
	token[iLat + 4] = lat.toString();
	let iLng = token.indexOf('idWellLng');
	token[iLng + 4] = lng.toString();
	popupContents = token.join('"');
	*/	
	
	let popupContents = wellDialogContents({
                    id: id,
                    title: 'Edit a vertical injection well',
                    wellName: ctrl._wells[id].name,
                    lat: ctrl._wells[id].lat,
                    lng: ctrl._wells[id].lng,
                    topComp: ctrl._wells[id].topComp,
                    bottomComp: ctrl._wells[id].bottomComp,
                    injRate: ctrl._wells[id].injRate});

	// Update the coordinates' values in the well edit dialog 
	ctrl._wells[id].marker._popup._content = popupContents;
}

// function onWellMouseOver(t, e) {
// 	//t.openPopup('ss');
// 	a = 1;
// }

// Open a Well edit dialog if the well control is clicked
function onWellCtrlClick(t, e) {

	// Get the well ID
	let token = e.currentTarget.id.split('_');
	let id = Number(token[1]);
	
	// Open the popup and pan the map to the well location
	ctrl._wells[id].marker.openPopup();
	map.panTo(ctrl._wells[id].marker.getLatLng());
	
	// Needed to keep the popup open, see https://stackoverflow.com/questions/24067946/cant-open-popup-programmatically
	e.stopPropagation();
	e.preventDefault();
	
}