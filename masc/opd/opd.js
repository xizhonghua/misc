var PAD = 20; 
	var PS = 600;
	var WIDTH = 600 + 2*PAD, HEIGHT = 600 + 2*PAD;
	var OS = PS / 2;
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext ? canvas.getContext('2d') : NULL;
	var vertices = [];
	var creases = [];
	var config = {
		showGrid : true,
		grids : 6
	};
	
	var state = {
		drawing : false,
		mode : 'il',
		creaseType : 'm',
		selectedCreases : [],
		
		setMode : function(mode) {
			state.mode = mode;
			state.setDrawing(false);
			state.hlc = null;
			console.log("mode set to " + mode);
			if(state.mode == 'il') $("#ul-input-line").show(); else $("#ul-input-line").hide(); 
			if(state.mode == 'sl') $("#sl-update").show(); else $("#sl-update").hide();
		},
		
		setCreaseType : function(type) {
			state.creaseType = type;
			console.log("crease type set to " + type);
		},
		
		setDrawing: function(bDrawing) {
			state.drawing = bDrawing;
			if(!state.drawing) {
				state.pos1 = null;
				state.pos2 = null;
				state.hl1 = null;
				state.hl2 = null;
			}
		}
	}
	
	function Point(x, y) {
		this.x = x;
		this.y = y;
	}
	
	Point.prototype.clone = function() {
		return new Point(this.x, this.y);
	}
	
	Point.prototype.dist = function(pt) {
		return Math.sqrt((this.x - pt.x)*(this.x - pt.x) + (this.y - pt.y)*(this.y - pt.y));
	}
	
	Point.prototype.sub = function(pt) {
		this.x -= pt.x;
		this.y -= pt.y;
		return this;
	}
	
	Point.prototype.normalize = function() {
		var t = Math.sqrt(this.x * this.x + this.y * this.y);
		if(t == 0) return;
		this.x /= t;
		this.y /= t;
		return this;
	}
	
	Point.prototype.dot = function(pt) {
		return this.x * pt.x + this.y * pt.y;
	}
	
	/**
	 * 
 	* @param {Object} type
 	* @param {Point} v1
 	* @param {Point} v2
 	* @param {Number} angle
	 */
	function Crease(type, v1, v2, angle) {
		this.type = type;
		this.v1 = v1;
		this.v2 = v2;
		if(this.type == 'm')
			this.angle = 180;
		else if(this.type == 'v')
			this.angle = -180;
		else if(this.type == 'a')
			this.angle = 0;
		this.angle = angle || this.angle;
	}
	
	Crease.prototype.dist = function(pt) {
		var v1a = pt.clone().sub(this.v1).normalize();
		var v1b = this.v2.clone().sub(this.v1).normalize();
		var d1 = Math.acos(v1a.dot(v1b));
		
		var v2a = pt.clone().sub(this.v2).normalize();
		var v2b = this.v1.clone().sub(this.v2).normalize();
		var d2 = Math.acos(v2a.dot(v2b));
		
		return d1 > d2 ? d1 : d2;
	}
	
	function writeMessage(message) {
		$("#div-pos").html(message);
    }
	
	
	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return new Point(
			evt.clientX - rect.left - PAD - OS,
			evt.clientY - rect.top - PAD - OS);
    }
    
 	function cloestPoint(pt) {
 		var min = 10.0;
 		var cp = null;
  		for(var i=0;i<vertices.length;i++)
  		{
  			var v = vertices[i];
  			if(v.dist(pt) < min) {
  				min = v.dist(pt);
  				cp = v;
  			}
  		}
  		
  		var gridSize = PS / config.grids;
	  	for(var i=0;i<=PS;i+=gridSize)
	  	for(var j=0;j<=PS;j+=gridSize)
	  	{
	  		var v = new Point(j - OS, i - OS);
	  		if (v.dist(pt) < min) {
  				min = v.dist(pt);
  				cp = v;
  			}
	  	}
  		
  		return cp;
    }
    
    function cloestCrease(pt) {
    	var min = 0.1;
    	var cc = null;
    	for(var i=0;i<creases.length;i++) {
    		var c = creases[i];
    		if(c.dist(pt) < min) {
    			min = c.dist(pt);
    			cc = c;
    		}
    	}
    	
    	return cc;
    }
	
	
	canvas.addEventListener('mousemove', mouseMoveHandler, false);
    	
    	
    canvas.addEventListener('click', mouseClickHandler, false);
    
    
    function addCrease(type, pos1, pos2) {
    	var v1 = new Point(pos1.x, pos1.y);
    	var v2 = new Point(pos2.x, pos2.y);
    	vertices.push(v1);
    	vertices.push(v2);
    	var c = new Crease(type, v1, v2);
    	creases.push(c);
    	
    	saveCP();
    }
    
    function removeCrease(crease) {
    	var index = creases.indexOf(crease);
    	if(index < 0) return;
    	creases.splice(index, 1);
    	
    	
    	var c1 = 0;
    	var c2 = 0;
    	for(var i=0;i<creases.length;i++) {
    		var c = creases[i];
    		if(c.v1 == crease.v1 || c.v2 == crease.v1) c1++;
    		if(c.v1 == crease.v2 || c.v2 == crease.v2) c2++;
    	}
    	
    	if(c1 == 0) vertices.splice(vertices.indexOf(crease.v1), 1);
    	if(c2 == 0) vertices.splice(vertices.indexOf(crease.v2), 1);
    	
    	saveCP();
    }
    
    // =================================================================
    // I/O
    // =================================================================
    function loadCP() {
    	var json = localStorage.cp;
    	if(json == null) return null;
    	var obj = JSON.parse(json);
    	
    	for(var i=0;i<obj.vertices.length;i++) {
    			var v = obj.vertices[i];
    			vertices.push(new Point(v.x, v.y));
		}
		for(var i=0;i<obj.creases.length;i++) {
			var c = obj.creases[i];
			creases.push(new Crease(c.type, vertices[c.v1], vertices[c.v2], c.angle));
		}
		
		return true;
    }
    
    function saveCP() {
    	obj = {
    		vertices: vertices,
    		creases: []
    	};
    	
    	for(var i=0;i<creases.length;i++) {
    		var c = creases[i];
    		var v1 = vertices.indexOf(c.v1);
    		var v2 = vertices.indexOf(c.v2);
    		var c_obj = {
    			v1 : v1,
    			v2 : v2,
    			type : c.type,
    			angle : c.angle
    		};
    		obj.creases.push(c_obj);
    	}
    	
    	var json = JSON.stringify(obj);
    	
    	localStorage.cp = json;
    	
    	console.log(json);
    }
    
    // =================================================================
    // events
    // =================================================================
    
    document.addEventListener("keydown", keydownHandler, false);
    
    function keydownHandler(e) {
    	var key = e.keyCode || e.which;
		switch(key){
			// esc cancel
			case 27: state.setDrawing(false); break;
			// i 
			case 73: $("#rdo-input-line").click(); break;
			// m
			case 77: $("#rdo-il-mountain").click(); break;
			// v
			case 86: $("#rdo-il-valley").click(); break;
			// a
			case 65: $("#rdo-il-aux").click(); break;
			// s
			case 83: $("#rdo-select-line").click(); break;
			// d
			case 68: $("#rdo-delete-line").click(); break;
		}
		
		render();
    }
    
    function mouseMoveHandler(evt) {
    	var mousePos = getMousePos(canvas, evt);
		var mp = cloestPoint(mousePos) || mousePos;
		var message = 'Mouse position: ' + mp.x + ',' + mp.y;
		if(state.mode == 'il') {
			if(state.drawing) {
				state.hl2 = cloestPoint(mousePos);
				state.pos2 = state.hl2 ? state.hl2 : mousePos;
			}
			else {
				state.hl1 = cloestPoint(mousePos);
			}
		}else if(state.mode == 'sl' || state.mode == 'dl') {
			state.hlc = cloestCrease(mousePos);
			if(state.hlc)
			{
				var c = state.hlc
				message = "c.type = " + c.type + " angle = " + c.angle;  
			}
		}
		render();
		writeMessage(message);
    }
    
    function mouseClickHandler(evt) {
    	var mousePos = getMousePos(canvas, evt);
    	
    	if(state.mode == 'il')
    	{
			if (!state.drawing) {
				state.drawing = true;
				state.h1 = cloestPoint(mousePos);
				state.pos1 = state.pos2 = state.h1 || mousePos;
			} else {
				state.pos2 = state.hl2 ? state.hl2 : mousePos;
				addCrease(state.creaseType, state.pos1, state.pos2);
				state.setDrawing(false);		
			}
		}
		else if(state.mode == 'sl') {
			var c = cloestCrease(mousePos);
			if(c) {
				var index = state.selectedCreases.indexOf(c); 
				if( index < 0) {
					state.selectedCreases.push(c);
					$("#txt-crease-angle").val(c.angle);
				}else {
					state.selectedCreases.splice(index, 1);
					$("#txt-crease-angle").val("");
				}
			}
		}
		else if(state.mode == 'dl') {
			state.hlc = cloestCrease(mousePos);
			if(state.hlc) removeCrease(state.hlc);
		}
		
		render();
    }
    
    
    $("#chk-show-grid").change(function() {	
    	config.showGrid = $(this).is(':checked');
    	render();
    });
    
    $("#txt-grid-div").val(config.grids).change(function(){
    	var grids = parseInt($(this).val());
    	if(grids < 0 || grids > 100 || isNaN(grids)) grids = 4;
    	$(this).val(config.grids = grids);
    	
    	render();
    });
    
     $("#txt-crease-angle").change(function(){
    	var angle = parseInt($(this).val());
    	if(isNaN(angle)) angle = 0;
    	if(angle < -180) angle = -180;
    	if(angle > 180) angle = 180;
    	
    	$(this).val(angle);
    	
    	for(var i=0;i<state.selectedCreases.length;i++) {
    		var c = state.selectedCreases[i];
    		c.angle = angle;
    		if(angle == 0) c.type = 'a';
    		if(angle > 0) c.type = 'm';
    		if(angle < 0) c.type = 'v';
    	}
    	
    	// clear selected creases
    	state.selectedCreases = [];
    	
    	// save
    	saveCP();
    	
    	render();
    });
    
    $("input[name='fun']").change(function() {
    	var val = $(this).val();
    	state.setMode(val);
    	if(val != 'il')	// input line
    	{
    		var type = $("input[name='crease-type']").val();
    		state.setCreaseType(type);
    	}
    	
    	render();
    });
    
    $("input[name='crease-type']").change(function() {
    	var val = $(this).val();
    	
    	state.setCreaseType(val);
    	
    	render();
    });
    
    // =====================================================
    //  init
    // =====================================================
    
    
    function init_creases() {
		var v1 = new Point(-OS, OS);
		var v2 = new Point(OS, OS);
		var v3 = new Point(OS, -OS);
		var v4 = new Point(-OS, -OS);
	
		vertices.push(v1);
		vertices.push(v2);
		vertices.push(v3);
		vertices.push(v4);
	
		var c1 = new Crease('b', v1 , v2);
		var c2 = new Crease('b', v2 , v3);
		var c3 = new Crease('b', v3 , v4);
		var c4 = new Crease('b', v4 , v1);
	
		creases.push(c1);
		creases.push(c2);
		creases.push(c3);
		creases.push(c4);
    }
	
	// ===============================================================
	// draw stuff
	// ===============================================================
	function getColorByCreaseType(type) {
		if(type == 'm') return 'rgb(255,0,0)';
		if(type == 'v') return 'rgb(0,0,255)';
		if(type == 'a') return 'rgb(200,200,200)';
		if(type == 'hl') return 'rgb(0,255,0)';
		if(type == 'sl') return 'rgb(255,0,255)';
		return 'rgb(0,0,0)'; // default color
	}
	
	
	function drawLine(x0,y0,x1,y1){
		ctx.beginPath();
		ctx.moveTo(x0,y0);
		ctx.lineTo(x1,y1);
		ctx.closePath();
    	ctx.stroke();
	}
	
	function drawLineV2(v1, v2) {
		if(v1 == null || v2 == null) return;
		drawLine(v1.x + OS + PAD, v1.y + OS + PAD, v2.x + OS + PAD, v2.y + OS + PAD);
	}
	
	function drawBoard() {
		ctx.fillStyle = "rgba(250, 250, 170, 1)";
		  ctx.fillRect (PAD, PAD, PS, PS);
		  
	}
	
	function drawGrid() {
		ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
		var gridSize = PS / config.grids;
	  	for(var i=0;i<=PS;i+=gridSize)
	  	{
	  		drawLine(PAD, i+PAD, PS+PAD, i+PAD);
	  		drawLine(i+PAD, PAD, i+PAD, PS+PAD);
	  	}
	}
	
	
	function drawCrease(c) { 
		ctx.strokeStyle = getColorByCreaseType(c.type);
		//
		if(state.hlc == c) ctx.strokeStyle = getColorByCreaseType('hl');
		ctx.lineWidth = state.selectedCreases.indexOf(c) >=0 ? 6 : 3 
		drawLineV2(c.v1, c.v2);
	}
	
	function drawcreases() {
		for(var i=0;i<creases.length;i++)
			drawCrease(creases[i]);
	}
	
	function drawPoint(v, type) {
		ctx.beginPath();
		ctx.arc(v.x + OS + PAD, v.y + OS + PAD, type == 'hl' ? 5 : 3, 0, 2 * Math.PI, false);
		ctx.fillStyle = getColorByCreaseType(type);
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#003300';
		ctx.stroke();
	}
	
	function drawVertices() {
		for(var i=0;i<vertices.length;i++)
			drawPoint(vertices[i]);
	}
	
	function drawDrawing() {
		var c = new Crease(state.creaseType, state.pos1, state.pos2);
		drawCrease(c);
		var v = new Point(state.pos1.x, state.pos1.y);
		drawPoint(v, state.creaseType);
	}
	
	function render()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBoard();
		if(config.showGrid) drawGrid();	
		drawcreases();
		drawVertices();
		if(state.drawing) drawDrawing();
		if(state.hl1) drawPoint(state.hl1, 'hl');
		if(state.hl2) drawPoint(state.hl2, 'hl');
	}
	
	// ================================================================
	
	if(!loadCP()) {
		init_creases();
	}
	render();	