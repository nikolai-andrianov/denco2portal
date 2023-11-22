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
