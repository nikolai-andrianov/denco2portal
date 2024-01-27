// Create a menu pane subclass of Control for visualizing various layers, wells, and simulation results
L.Control.Group = L.Control.extend({
    options: {
        collapsed: false,
        position: 'topleft',
    },
	// The class constructor
    initialize: function (options) {
        L.Util.setOptions(this, options);
		this._group = [];
        this._wells = [];
        this._wellIDcounter = 0;
    },
	// Creating an empty control pane
    onAdd: function (map) {

		this._className = 'leaflet-control-layers';
		this._container = L.DomUtil.create('div', this._className);
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');        

        return this._container;
    },
	// Add layers
	addLayers: function (inputLayers, options) {
		
		this._layers = [];
        for (const i in inputLayers) {
			this._layers.push({
				layer: inputLayers[i][0],
				name: i,
                checked: inputLayers[i][1],
			});
		}
		
		// Make sure that the the container is created in onAdd()
        if (!this._container) {
            return this;
        }
		
		// If a group is added to existing group(s), insert a small space to separate them
		let smallSpace = '';
		if (this._overlaysList) {
			smallSpace = '<span style="display: block; margin: 6px 0;"></span>';					
		}		
		
		// Eventually display the group name
		if (options.name) {
			const groupName = document.createElement('label');
			groupName.innerHTML = smallSpace + '<b>' + options.name + '</b>';
			this._container.appendChild(groupName);
		}		
		
		// _container contains a set of grouls (a label and a form);_form contains _overlaysList, which contains labels of spans, 
		// where each of spans contains a checkbox and a label
		this._form = L.DomUtil.create('form', this._className + '-list');
		this._overlaysList = L.DomUtil.create('div', this._className + '-overlays', this._form);
		this._container.appendChild(this._form);	

		// Layers are controlled by checkbox inputs
        for (i = 0; i < this._layers.length; i++) {
			this._addItemCheckBox(i);
        }
		
	},
    // Add new or edit an existing well 
	modifyWell: function (options) {
		
		// Get well data
		let strId = '_' + options.id;
        let wellName = document.getElementById('idWellName' + strId);
		let wellLat = document.getElementById('idWellLat' + strId);
		let wellLng = document.getElementById('idWellLng' + strId);
        let topComp = document.getElementById('idTopComp' + strId);
		let bottomComp = document.getElementById('idBottomComp' + strId);
		let injRate = document.getElementById('idCO2injRate' + strId);
		
		// Check if the inputs make sense
		if (!wellName.value) {
            wellName.style.borderWidth = "0.5px";
            wellName.style.borderColor = "red";
            return;
		}
        else {
            wellName.style.borderWidth = '0.5px';
            wellName.style.borderColor = "black";
        }

        if (isNaN(wellLat.value)) {
            wellLat.style.borderWidth = "0.5px";
            wellLat.style.borderColor = "red";
            return;
		}
        else {
            wellLat.style.borderWidth = '0.5px'; 
            wellLat.style.borderColor = "black";
        }
		
        if (isNaN(wellLng.value)) {
            wellLng.style.borderWidth = "0.5px";
            wellLng.style.borderColor = "red";
            return;
		}
        else {
            wellLng.style.borderWidth = '0.5px'; 
            wellLng.style.borderColor = "black";
        }

        if (isNaN(topComp.value)) {
            topComp.style.borderWidth = "0.5px";
            topComp.style.borderColor = "red";
            return;
		}
        else {
            topComp.style.borderWidth = '0.5px'; 
            topComp.style.borderColor = "black";
        }
		
        if (isNaN(bottomComp.value)) {
            bottomComp.style.borderWidth = "0.5px";
            bottomComp.style.borderColor = "red";
            return;
		}
        else {
            bottomComp.style.borderWidth = '0.5px'; 
            bottomComp.style.borderColor = "black";
        }		
		
        if (isNaN(injRate.value)) {
            injRate.style.borderWidth = "0.5px";
            injRate.style.borderColor = "red";
            return;
		}
        else {
            injRate.style.borderWidth = '0.5px'; 
            injRate.style.borderColor = "black";
        }
		
        if (Number(injRate.value) <= 0) {
            injRate.style.borderWidth = "0.5px";
            injRate.style.borderColor = "red";
            return;
		}
        else {
            injRate.style.borderWidth = '0.5px'; 
            injRate.style.borderColor = "black";
        }
		
		// Get the values for the input parameters
		wellName = wellName.value;
		wellLat = Number(wellLat.value);
		wellLng = Number(wellLng.value);
        topComp = Number(topComp.value);
		bottomComp = Number(bottomComp.value);
		injRate = Number(injRate.value);
		
        // If there are no wells yet, add the label for the wells group
        if (this._wells.length == 0) {
            const wellsGroupLabel = document.createElement('label');
			let smallSpace = '<span style="display: block; margin: 6px 0;"></span>';						
            wellsGroupLabel.innerHTML = smallSpace + "<b>Wells</b>";
            this._container.appendChild(wellsGroupLabel);	
        }
		
		// Round latlng to 5 decimal places, which correspond to the accuracy of 1.11 m
		wellLat = Math.round(wellLat * 1e5) / 1e5;
		wellLng = Math.round(wellLng * 1e5) / 1e5;
		
        // If modifyWell is called via the New well dialog, ...
        if (options.newWell) {
			
            // Add the new well to the Wells control group
			const span_indent = document.createElement('span');
			span_indent.innerHTML = '&nbsp;&nbsp;';
			
			const span = document.createElement('span');
			span.appendChild(span_indent);

			const linkLabel = document.createElement('a');
			linkLabel.setAttribute('id', 'idWellNameCtrl_' + this._wellIDcounter);
			linkLabel.href = '#';
			linkLabel.innerText = wellName;
			
			linkLabel.addEventListener('click', (event) => {
				onWellCtrlClick(this, event);
			});
			
			span.appendChild(linkLabel);
			
			const wellLabel = document.createElement('label');
			wellLabel.appendChild(span);

            this._container.appendChild(wellLabel);	
            
            // Add a draggable well marker on the map
            let wellMarker = L.marker([wellLat, wellLng], {
                id: this._wellIDcounter,
                draggable:'true'});

            // Call the well edit dialog when clicked on the well marker
            wellMarker.bindPopup(wellDialogContents({
                    id: this._wellIDcounter,
                    title: 'Edit a vertical injection well',
                    wellName: wellName,
                    lat: wellLat,
                    lng: wellLng,
                    topComp: topComp,
                    bottomComp: bottomComp,
                    injRate: injRate,
                    marker: wellMarker}));

            // Update the well coordinates if the marker is dragged into a new position
            wellMarker.on('dragend', function(e) {
                onWellMove(this.options.id, e.target.getLatLng().lat, e.target.getLatLng().lng);
            });

            // wellMarker.on('mouseover', function(e) {
            //     onWellMouseOver(this, e);
            // });

            wellMarker.addTo(map);

            // Save well data in array of objects
            let wellData = {
                id: this._wellIDcounter,
                marker: wellMarker,
                name: wellName,
                lat: wellLat,
                lng: wellLng,
                topComp: topComp,
                bottomComp: bottomComp,
                injRate: injRate};
            this._wells.push(wellData);		

            // Now we can close the dialog
            newWellDialog.close();

            // Increment the well counter
            this._wellIDcounter++;
        }
        else {
            // ... if modifyWell is called via the Edit well dialog
            // Update the fields of an existing well
            let id = options.id;
            this._wells[id].name = wellName;
            this._wells[id].lat = wellLat,
            this._wells[id].lng = wellLng,
            this._wells[id].topComp = topComp,
            this._wells[id].bottomComp = bottomComp,
            this._wells[id].injRate = injRate;

            // Close the popup
            this._wells[id].marker._popup.close()

            // Update the eventually changed well name in the control panel
            document.getElementById('idWellNameCtrl_' + id).innerHTML = wellName;

            // Update the eventually changed location of the well marker
            this._wells[id].marker.setLatLng([wellLat, wellLng]); 

            // Update the contents of the Edit well dialog
            //onWellMove(id, wellLat, wellLng);
			
			let popupContents = wellDialogContents({
							id: id,
							title: 'Edit a vertical injection well',
							wellName: this._wells[id].name,
							lat: this._wells[id].lat,
							lng: this._wells[id].lng,
							topComp: this._wells[id].topComp,
							bottomComp: this._wells[id].bottomComp,
							injRate: this._wells[id].injRate,
							marker: this._wells[id].wellMarker});

			// Update the coordinates' values in the well edit dialog 
			this._wells[id].marker._popup._content = popupContents;			

        }

	},	
	// Create check box for the layer i
    _addItemCheckBox: function (i) {

		let obj = this._layers[i];
        const input = document.createElement('input');

		input.type = 'checkbox';
		input.className = 'leaflet-control-layers-selector';
		input.defaultChecked = obj.checked;
		input.layer_id = i;
				
		if (obj.checked) {
			this._map.addLayer(this._layers[i].layer);
		}
        
        input.addEventListener('input', (event) => {
            const val = event.target.value;
			const layer = this._layers[input.layer_id].layer;
			if (this._map.hasLayer(layer)) {
				this._map.removeLayer(layer);
			} else {
				this._map.addLayer(layer);
			}
        });
		
		const label = document.createElement('label');
        const span = document.createElement('span');
		const span_indent = document.createElement('span');
		span_indent.innerHTML = '&nbsp;&nbsp;';
		span.appendChild(span_indent);
		span.appendChild(input);
		const span_map = document.createElement('span');
		span_map.innerHTML = ' ' + obj.name;
        //name.innerHTML = name.innerHTML + ' ' + obj.name;
		label.appendChild(span);
		label.appendChild(span_map);
		this._overlaysList.appendChild(label);
    },		
});

L.control.group = function (options) {
    return new L.Control.Group(options);
};
	
	