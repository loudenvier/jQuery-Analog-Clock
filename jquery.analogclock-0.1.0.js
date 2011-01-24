$.fn.AnalogClock = function(options) {
  // these are the defaults for clocks... Maybe we should make them public... 
  defaults = {
  	skin      : "crystaldigits",  // the skin to use
  	skinsPath : "skins",          // the path in the server where clock skins are stored
  	timeShift : 0,                // time shift (msec) to apply to the current time (can be used for timezones)
  	tickInterval: 200             // interval between clock ticks (screen updates)
  };	
  // merge the provided options with the default options to get options to use
	options = $.extend({}, defaults, options);

  // let's make "this" more meaningful...  
  var clock = this;
  
	// setting up required styling for the clock's parent element: text-ident is
	// used to resolve IE zero (0) width/height when img is display:none...
  // and we need to initially hide the clock face because we don't know its size yet!  
	clock.css({"position": "relative", "text-indent":"-9999px", "overflow":"hidden"});
	
	// creating the clock markup elements
	var elementBasePath = (options.skinsPath + "/" + options.skin + "-").replace("//","/");
	var elementsMarkup = 
    '<img class="clockFace" src="' + elementBasePath + 'face.png" style="position: absolute; left:0; top:0; margin: 0; padding: 0;" />' +
    // we hide the hands because they're initially unpositioned!
    '<div class="clockElements" style="position:absolute; top:0; left:0; display:none;">' +
      '<img class="clockHourHand" src="' + elementBasePath + 'hour.png" />' +
      '<img class="clockMinHand" src="' + elementBasePath + 'min.png"  />' +
      '<img class="clockSecHand" src="' + elementBasePath + 'sec.png" />' +
    '</div>';
  clock.append(elementsMarkup);
  clock.addClass("jquery-analog-clock")
	
  // helper (clock instance) variables
	options.lastHour = -1;
	options.lastMin = -1;
	options.lastSec = -1;
	options.clock = clock;
	options.elementId = clock.attr("id");
	var selector = "#" + options.elementId + " ";
	options.clockElements = $(selector + ".clockElements");
  options.clockFace = $(selector + ".clockFace");
	options.secHandSelector = selector + ".clockSecHand";
	options.minHandSelector = selector + ".clockMinHand";
	options.hourHandSelector = selector + ".clockHourHand";

 	// clock tick will display/animate the clock hands according to the current time
 	// options.ClockInterval = setInterval(function() { clockTick(options); }, options.tickInterval);

	// it's only possible to get the image dimensions after its loaded
	options.clockFace.load(function() {      // jQuery comes to the rescue
      options.clockSize = this.width;
    	// clock tick will animate the clock hands according to the time
    	options.clockInterval = setInterval(function(){ clockTick(options); }, options.tickInterval);
      //clock.fadeIn();
    }); 	
 
  //options.clock.fadeIn();
	
	function clockTick(options){
	  // the image size is only available after it is loaded
    if (!options.clockSize) 
      options.clockSize = options.clockFace.width();
    // if it is not loaded we'll just return for now...
    if (options.clockSize <= 0)
      return;
    // if we've an image size and we didn't ticked, let's show the clock
    // and update our "parent" width and height to be web-designer friendly...
    if (options.lastSec == -1) {
      options.clock.width(options.clockSize);
      options.clock.height(options.clockSize);
	    clock.css({"text-indent":"0"});
      options.clockElements.fadeIn();
    }
	  // get the time and apply the time shift(possibly a GMT/DST/server shift)
		var time = new Date(new Date().getTime() + options.timeShift);
		var seconds = time.getSeconds();
		var minutes = time.getMinutes();
		var hours = time.getHours() % 12; // guarantees a 12-hour clock
		var secAngle = seconds * 360/60;
		var minAngle = minutes * 360/60;
		var hourAngle = (hours + minutes/60)*360/12;

    // animation 101 - only update if its moved!
    if (options.lastSec != seconds) {
      rotate(options.secHandSelector, secAngle);
      if (options.lastMin != minutes) {
        rotate(options.minHandSelector, minAngle);
        if (options.lastHour != hours) {
          rotate(options.hourHandSelector, hourAngle);
        }
      }
    }
    options.lastSec = seconds; 
    options.lastMin = minutes; 
    options.lastHour = hours;
  
    function rotate(el, angle) {
      // hopefully we'll find a more precise rotation so that we don't shift
      // the clock hands center of rotation by a pixel or so now and then...
      $(el).rotate(angle, "abs");
      var x = Math.round((options.clockSize - $(el).width())/2);
      var y = Math.round((options.clockSize - $(el).height())/2);
  		$(el).css( 
      { 
        "position" : "absolute",
        "left" : x + "px", 
        "top"  : y + "px" 
      }); 
    }
	}
}
