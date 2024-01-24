// Create a menu pane subclass of Control for visualizing various layers, wells, and simulation results
L.Control.Pane = L.Control.extend({
    options: {
        collapsed: false,
        position: 'topleft',
        label: null,
    },
	// The class constructor
    initialize: function (inputLayers, options) {
        L.Util.setOptions(this, options);
		
        this._layers = [];
        for (const i in inputLayers) {
			this._layers.push({
				layer: inputLayers[i][0],
				name: i,
                checked: inputLayers[i][1],
			});
		}

        this._wells = [];
    },
	// Extending from the parent class
    onAdd: function (map) {
        this._initLayout();
        this._update();
        return this._container;
    },
	// Called from _initLayout, or when the initially collapsed control is hovered over with the mouse
    expand: function () {
		//console.log("here");
        L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
        this._form.style.height = null;
        const acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
        if (acceptableHeight < this._form.clientHeight) {
            L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
            this._form.style.height = acceptableHeight + 'px';
        } else { // jumps here
            L.DomUtil.removeClass(this._form, 'leaflet-control-layers-scrollbar');
        }
        return this;
    },	
	addGroup: function () {
		// Check if the inputs make sense
		if (!document.getElementById('idWellName').value) {
            document.getElementById('idWellName').style.borderWidth = "1px";
            document.getElementById('idWellName').style.borderColor = "red";
            return;
		}
        else {
            document.getElementById('idWellName').style.borderWidth = '0.5px';
            document.getElementById('idWellName').style.borderColor = "black";
        }

        if (document.getElementById('idCO2injRate').value <= 0) {
            document.getElementById('idCO2injRate').style.borderWidth = "1px";
            document.getElementById('idCO2injRate').style.borderColor = "red";
            return;
		}
        else {
            document.getElementById('idCO2injRate').style.borderWidth = '0.5px'; 
            document.getElementById('idCO2injRate').style.borderColor = "black";
        }

        let wellName = document.getElementById('idWellName').value;
		
        // If there are no wells yet, add the label for the wells group
        if (this._wells.length == 0) {
            const wellsGroupLabel = document.createElement('label');
            wellsGroupLabel.innerHTML = "<hr><b>Wells</b>";
            this._container.appendChild(wellsGroupLabel);	
        }

        // Add the new well to the wells group
        const wellLabel = document.createElement('label');
        wellLabel.innerHTML = '&nbsp;&nbsp;' + wellName;
        this._container.appendChild(wellLabel);	
        this._wells.push(wellName)

        // Now we can close the dialog
        newWellDialog.close()

	},	
	_initLayout: function () {
	const className = 'leaflet-control-layers',
		container = (this._container = L.DomUtil.create('div', className)),
		collapsed = this.options.collapsed;
		
		container.setAttribute('aria-haspopup', true);
		L.DomEvent.disableClickPropagation(container);
		L.DomEvent.disableScrollPropagation(container);
		if (this.options.label) {
			const labelP = document.createElement('label');
			labelP.innerHTML = "<b>" + this.options.label + "</b>";
			container.appendChild(labelP);
		}
        const form = (this._form = L.DomUtil.create('form', className + '-list'));
        if (collapsed) {
            this._map.on('click zoom move', this.collapse, this);
            if (!L.Browser.android) {
                L.DomEvent.on(
                    container,
                    {
                        mouseenter: this.expand,
                        mouseleave: this.collapse,
                    },
                    this
                );
            }
        }
        const link = (this._layersLink = L.DomUtil.create('a', className + '-toggle', container));
        link.href = '#';
        link.title = 'Layers';
        if (L.Browser.touch) {  // true
            L.DomEvent.on(link, 'click', L.DomEvent.stop);
            L.DomEvent.on(link, 'click', this.expand, this);
        } else {
            L.DomEvent.on(link, 'focus', this.expand, this);
        }
        if (!collapsed) {
            this.expand();
        }

        this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
        container.appendChild(form);			
	},	
	// Called from the redefined onAdd() method
    _update: function () {
        if (!this._container) {
            return this;
        }

        for (i = 0; i < this._layers.length; i++) {
			this._addItemCheckBox(i);
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

L.control.pane = function (inputLayers, options) {
    return new L.Control.Pane(inputLayers, options);
};
	
	