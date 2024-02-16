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
		this._layers = [];
        this._wellIDcounter = 0;
		this._activeSimVar = [];		// Array of simulation variables to be plotted 
		this._selectedTimeInstant = 0;	// Plot solution snapshots at this time instant
		this._snapshotImage = [];		// Storing all solution snapshots in a 2D array (nvar, ntimes)
		this._snapshotLayer = [];		// Array of Leaflet layers (nvar)
		this._time_play_toggled = true;
    },
	// Creating an empty control pane
    onAdd: function (map) {

		this._className = 'leaflet-control-layers';
		this._container = L.DomUtil.create('div', this._className);
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');     

		// Disable left-click callback for the map when on the control
		L.DomEvent.disableClickPropagation(this._container);	

		// Disable map zoom with th emouse wheel when on control
		L.DomEvent.disableScrollPropagation(this._container);		

        return this._container;
    },
	// Return the handle to a new control group
	newCtrlGroup: function (options) {
	
		// If a group is added to existing group(s), insert a small space to separate them
		let smallSpace = '';
		if (this._group.length > 0) {
			smallSpace = '<span style="display: block; margin: 6px 0;"></span>';					
		}	

		let groupName = document.createElement('label');
		groupName.innerHTML = smallSpace + '<b>' + options.name + '</b>';		

		// A control group is a form with _title and contents
		let _form = L.DomUtil.create('form', this._className + '-list');
		
		// The group title 
		let _title = L.DomUtil.create('label', 'collapsible-closed', _form);		
		_title.innerHTML = smallSpace + options.name;
		
		// Placeholder for the controls within the group 
		let contents = L.DomUtil.create('div', 'collapsible-content-closed', _form);
		contents.collapsed = true;
		
		// Eventually open the collapsible contents 
		if (!options.collapsed) {
			contents.collapsed = false;
			_title.classList.remove("collapsible-closed");	
			_title.classList.add("collapsible-open");	
			contents.classList.remove("collapsible-content-closed");	
			contents.classList.add("collapsible-content-open");	
		}		

		// Expand the control group on click
		_title.addEventListener("click", function() {
			//this.classList.toggle("collapsible-open");
			var content = this.nextElementSibling;
			if (content.collapsed){
				//this.classList.toggle("collapsible-open");
				this.classList.remove("collapsible-closed");	
				this.classList.add("collapsible-open");		
				content.classList.remove("collapsible-content-closed");	
				content.classList.add("collapsible-content-open");								
				content.style.maxHeight = content.scrollHeight + "px";				
			} 
			else {
				//this.classList.toggle("collapsible-close");
				this.classList.remove("collapsible-open");	
				this.classList.add("collapsible-closed");	
				content.classList.remove("collapsible-content-open");	
				content.classList.add("collapsible-content-closed");									
				content.style.maxHeight = '0px';
			} 	
			content.collapsed = !content.collapsed;		
		});
		
		// Add the group control to the control pane 
		this._container.appendChild(_form);	
		
		// Keep a reference to the group for eventual updating
		let newGroup = {
			name: options.name,
			contents: contents
		};		
		this._group.push(newGroup);
		
		return newGroup;
		
	},	
	// Add the input items to the group
	addToGroup: function (input, group) {
		
		if (input.type) {
			switch (input.type) {
				case 'checkbox':
					// A checkbox input toggles input.layer on the map
					this._addCheckboxControl(input, group);
					break;
				case 'well':
					// Add a new well to the Wells control group
					this.modifyWell(input);
					break;		
				case 'simulation':
					// Add elements to the Simulation control group
					this.addSimGroup();
					break;					
					

			default:
				// If no type is provided, interpret input as text 
				let groupName = document.createElement('label');
				groupName.innerHTML = '<i>' + input + '</i>';
				group.contents.appendChild(groupName);	
			}
		}
		else {
			// If no type is provided, interpret input as text 
			let groupName = document.createElement('label');
			groupName.innerHTML = '<i>' + input + '</i>';
			group.contents.appendChild(groupName);			
		}
			
			
	},
	// A checkbox input toggles obj.layer on the map
	_addCheckboxControl: function (obj, group) {
		
		this._layers.push(obj);
		let i = this._layers.length - 1;
		
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
		span_indent.innerHTML = '';//'&nbsp;&nbsp;';
		span.appendChild(span_indent);
		span.appendChild(input);
		const span_map = document.createElement('span');
		span_map.innerHTML = ' ' + obj.name;
        //name.innerHTML = name.innerHTML + ' ' + obj.name;
		label.appendChild(span);
		label.appendChild(span_map);
		group.contents.appendChild(label);		
		
	},
    // Add new or edit an existing well 
	modifyWell: function (obj) {
		
		let strId, wellName, wellLat, wellLng, topComp, bottomComp, injRate;
		
		// If modifyWell is called via a dialog, ...
        if (obj.fromDialog) {
			// Get well data from the dialog fields
			strId = '_' + obj.id;
			wellName = document.getElementById('idWellName' + strId);
			wellLat = document.getElementById('idWellLat' + strId);
			wellLng = document.getElementById('idWellLng' + strId);
			topComp = document.getElementById('idTopComp' + strId);
			bottomComp = document.getElementById('idBottomComp' + strId);
			injRate = document.getElementById('idCO2injRate' + strId);
			
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
			
		}
		else { // For hardcoded well data, ...
			// Get well data from the obj fields
			wellName = obj.wellName;
			wellLat = obj.wellLat;
			wellLng = obj.wellLng;
			topComp = obj.topComp;
			bottomComp = obj.bottomComp;
			injRate = obj.injRate;    			
		}
		
        // If there are no wells yet, add the label for the wells group
		/*
        if (this._wells.length == 0) {
            const wellsGroupLabel = document.createElement('label');
			let smallSpace = '<span style="display: block; margin: 6px 0;"></span>';						
            wellsGroupLabel.innerHTML = smallSpace + "<b>Wells</b>";
            this._container.appendChild(wellsGroupLabel);	
        }
		*/
		
		// Round latlng to 5 decimal places, which correspond to the accuracy of 1.11 m
		wellLat = Math.round(wellLat * 1e5) / 1e5;
		wellLng = Math.round(wellLng * 1e5) / 1e5;
		
        // If modifyWell is called via the New well dialog, ...
        if (obj.newWell) {
			
            // Add the new well to the Wells control group
			const span_indent = document.createElement('span');
			span_indent.innerHTML = ''; //&nbsp;&nbsp;';
			
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

            // Append the well to the Wells group
			wells.contents.appendChild(wellLabel);	

			// Adjust the size of the collapsible group contents
			if (!wells.contents.collapsed) {
				wells.contents.style.maxHeight = wells.contents.scrollHeight + "px";
			}
			
            // Add a draggable well marker on the map
            // Draggable if created from a dialog
            let wellMarker = L.marker([wellLat, wellLng], {
                id: this._wellIDcounter,
                draggable: obj.fromDialog});

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

            // If well input via a dialog, close the dialog
            if (obj.fromDialog) {
                newWellDialog.close();
            }

            // Increment the well counter
            this._wellIDcounter++;
        }
        else {
            // ... if modifyWell is called via the Edit well dialog
            // Update the fields of an existing well
            let id = obj.id;
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
	// Add the simulation control group
	addSimGroup: function (options) {
		
		/*
		// Input the injection period
		const injPeriod = document.createElement('div');
		const inputText1 = document.createElement('span');
		inputText1.innerHTML = '&nbsp;&nbsp;Injection period&nbsp;';
		const inputInjPeriod = document.createElement('span');
		inputInjPeriod.innerHTML = '<input id="idInjPeriod" type="text" value="0" maxlength="5" size="3"/>&nbsp;years';
		injPeriod.appendChild(inputText1);	
		injPeriod.appendChild(inputInjPeriod);
		this._container.appendChild(injPeriod);	
		
		// The run Button
		const runButton = document.createElement('div');
		runButton.innerHTML = smallSpace + '<center><button onclick="">Run</button></center>'; 
		this._container.appendChild(runButton);	
		*/

		// Horizontal line
		/*
		const horizLine = document.createElement('div');
		horizLine.innerHTML = smallSpace + '<hr>' + smallSpace; 		
		this._container.appendChild(horizLine);	
		*/
		
		// Initialize the 2D array for snapshots images
		// Set up the layers and the plotted (active) simulation variable 
		for (let i = 0; i < resultsNames.length; i++) {
			this._snapshotImage.push([]);
			this._activeSimVar.push(false);
			this._snapshotLayer.push(null);
		}
		
		// Preload all snapshots in a 2D array (nvar, ntimes) 
		var numLoadedImgs = 0;
		for (let i = 0; i < resultsNames.length; i++) {
			for (let j=0; j<snapshotsStenlilleHavnsoe.length; j++) {
				this._snapshotImage[i][j] = new Image();
				let fname = snapshotsStenlilleHavnsoe[j][resultsNames[i].folder];	
				this._snapshotImage[i][j].src = fname;				
				this._snapshotImage[i][j].onload = function() {
					numLoadedImgs++;	
				}
			}
		}

		// Add the checkboxes for the available variables
        for (let i = 0; i < resultsNames.length; i++) {
	
			const input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.simVarID = i;

			// Toggle the variable index to be plotted
			input.addEventListener('input', (event) => {
				this._activeSimVar[input.simVarID] = event.target.checked;
				this._drawSimSnapshot();
			});
			
			const label = document.createElement('label');
			const span = document.createElement('span');
			const span_indent = document.createElement('span');
			span_indent.innerHTML = '';
			span.appendChild(span_indent);
			span.appendChild(input);
			const span_map = document.createElement('span');
			span_map.innerHTML = ' ' + resultsNames[i].name;	
			label.appendChild(span);
			label.appendChild(span_map);
			sim.contents.appendChild(label);		
	
        }		
		
		// Horizontal line
		const horizLine = document.createElement('div');
		let smallSpace = '<span style="display: block; margin: 6px 0;"></span>';		
		horizLine.innerHTML = '<hr>'; 		
		sim.contents.appendChild(horizLine);			
		
		// Time controls 
		const spanTimeFirst = document.createElement('span');
		const spanTimeBackward = document.createElement('span');
		const spanTimePlayPause = document.createElement('span');
		const spanTimeForward = document.createElement('span');
		const spanTimeLast = document.createElement('span');
		
		spanTimeFirst.innerHTML = '<span id="time-first" class="fas fa-step-backward" style="font-size:20px"></span> &nbsp;';	
		spanTimeBackward.innerHTML = '<span id="time-backward" class="fas fa-backward" style="font-size:20px"></span>  &nbsp;';
		spanTimePlayPause.innerHTML = '<span id="time-play-pause" class="far fa-play-circle" style="font-size:20px"></span> &nbsp;';
		spanTimeForward.innerHTML = '<span id="time-forward" class="fas fa-forward" style="font-size:20px"></span> &nbsp;';
		spanTimeLast.innerHTML = '<span id="time-last" class="fas fa-step-forward" style="font-size:20px"></span>';
		
		const timeControl = document.createElement('div');
		timeControl.style.textAlign = "center";
		timeControl.appendChild(spanTimeFirst);
		timeControl.appendChild(spanTimeBackward);
		timeControl.appendChild(spanTimePlayPause);
		timeControl.appendChild(spanTimeForward);
		timeControl.appendChild(spanTimeLast);
		sim.contents.appendChild(timeControl);
		
		// Add small space		
		const smallDiv = document.createElement('div');
		smallDiv.innerHTML = smallSpace; 		
		sim.contents.appendChild(smallDiv);		
		
		//  Menu with available time instants 
		const menuTime = document.createElement('select');
		menuTime.id = "menu-time";

		for (i=0; i<snapshotsStenlilleHavnsoe.length; i++) {
			var option = document.createElement("option");
			option.value = i;
			
			// FF does not support innerText, have to handle that separately
			if (typeof option.innerText === "undefined")
			{
				option.textContent = snapshotsStenlilleHavnsoe[i].date;
			}
			else
			{
				option.innerText = snapshotsStenlilleHavnsoe[i].date;
			}

			//var select = document.getElementById("menu-time");
			//select.appendChild(option);
			menuTime.appendChild(option);
		}	

		const menuDiv = document.createElement('div');
		menuDiv.style.textAlign = "center";
		menuDiv.appendChild(menuTime);
		sim.contents.appendChild(menuDiv);
		
		// If another item is chosen on the menu-time
		$("#menu-time").change(function() {			
			// Apparently val() returns a string; convert it back to number to avoid that '4' + 1 == '41'
			ctrl._selectedTimeInstant = Number($(this).val());
			// Redraw the map 
			ctrl._drawSimSnapshot();
		});
		
		// If time first is pressed
		$("#time-first").on("click", function() {	
			// Set the index of the selected snapshot
			ctrl._selectedTimeInstant = 0;				
			// Change the menu item
			$("#menu-time").val(ctrl._selectedTimeInstant).change();
			// Redrawing the map is done via #menu-time change				
		});		

		// If time last is pressed
		$("#time-last").on("click", function() {
			// Set the index of the selected snapshot
			ctrl._selectedTimeInstant = snapshotsStenlilleHavnsoe.length - 1;			
			// Change the menu item
			$("#menu-time").val(ctrl._selectedTimeInstant).change();
			// Redrawing the map is done via #menu-time change				
		});	
			
			
		// If time forward is pressed
		$("#time-forward").on("click", function() {
			if (ctrl._selectedTimeInstant + 1 < snapshotsStenlilleHavnsoe.length) {	
				// Increment the index of the selected snapshot
				ctrl._selectedTimeInstant++;
				// Change the menu item
				$("#menu-time").val(ctrl._selectedTimeInstant).change();
				// Redrawing the map is done via #menu-time change			
			}			
		});	
			
		// If time backward is pressed
		$("#time-backward").on("click", function() {
			if (ctrl._selectedTimeInstant > 0) {
				// Decrement the index of the selected snapshot
				ctrl._selectedTimeInstant--;
				// Change the menu item
				$("#menu-time").val(ctrl._selectedTimeInstant).change();
				// Redrawing the map is done via #menu-time change				
			}			
		});	

		// If time play/pause is pressed
		$("#time-play-pause").on("click", function() {			
			if (ctrl._time_play_toggled) {			
				ctrl._time_play_toggled = false;		
				// Change icon to pause
				$("#time-play-pause").toggleClass("far fa-play-circle", false);
				$("#time-play-pause").toggleClass("far fa-pause-circle", true);				
				async function load() { 				
					let current = ctrl._selectedTimeInstant;
					for (let timeInstant=current; timeInstant < snapshotsStenlilleHavnsoe.length; timeInstant++) {		
						ctrl._selectedTimeInstant = timeInstant;
						// Redrawing the map is done via #menu-time change	
						$("#menu-time").val(ctrl._selectedTimeInstant).change();			
						// Exit if the pause button is clicked
						if (ctrl._time_play_toggled) {break;}						
						// Pause for 100 milliseconds
						await timer(100); 					
					}					
					// Change icon to back to play
					$("#time-play-pause").toggleClass("far fa-pause-circle", false);
					$("#time-play-pause").toggleClass("far fa-play-circle", true);
				}					
				load();		
			}
			else {			
				ctrl._time_play_toggled = true;				
				// Change icon to back to play
				$("#time-play-pause").toggleClass("far fa-pause-circle", false);
				$("#time-play-pause").toggleClass("far fa-play-circle", true);	
			}					
		});				
	
	
	},	
	// Draw the solution snapshot of all active variables at selected time instant
	_drawSimSnapshot: function (options) {
	
		for (let i = 0; i < this._activeSimVar.length; i++) {
	
			// Eventually remove the existing snapshot
			if (this._snapshotLayer[i] != null) {
				if (this._map.hasLayer(this._snapshotLayer[i])) {
					this._map.removeLayer(this._snapshotLayer[i]);
				}
			}
			
			// Plot the solution snapshot if the i-th variable is active
			if (this._activeSimVar[i]) {
				let image = this._snapshotImage[i][this._selectedTimeInstant].src;		

				this._snapshotLayer[i] = L.imageOverlay(image, latlngSnapshots, {
					opacity: 0.7,
					interactive: true
				});
				
				// Draw the snapshot, corresponding to selectedSnapshot
				map.addLayer(this._snapshotLayer[i]);
			}
		}
	}
});

L.control.group = function (options) {
    return new L.Control.Group(options);
};
	
	