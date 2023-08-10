/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/rythm.js/rythm.js":
/*!****************************************!*\
  !*** ./node_modules/rythm.js/rythm.js ***!
  \****************************************/
/***/ (function(module) {

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Analyser = function Analyser() {
  var _this = this;

  classCallCheck(this, Analyser);

  this.initialise = function (analyser) {
    _this.analyser = analyser;
    _this.analyser.fftSize = 2048;
  };

  this.reset = function () {
    _this.hzHistory = [];
    _this.frequences = new Uint8Array(_this.analyser.frequencyBinCount);
  };

  this.analyse = function () {
    _this.analyser.getByteFrequencyData(_this.frequences);
    for (var i = 0; i < _this.frequences.length; i++) {
      if (!_this.hzHistory[i]) {
        _this.hzHistory[i] = [];
      }
      if (_this.hzHistory[i].length > _this.maxValueHistory) {
        _this.hzHistory[i].shift();
      }
      _this.hzHistory[i].push(_this.frequences[i]);
    }
  };

  this.getRangeAverageRatio = function (startingValue, nbValue) {
    var total = 0;
    for (var i = startingValue; i < nbValue + startingValue; i++) {
      total += _this.getFrequenceRatio(i);
    }
    return total / nbValue;
  };

  this.getFrequenceRatio = function (index) {
    var min = 255;
    var max = 0;
    _this.hzHistory[index].forEach(function (value) {
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    });
    var scale = max - min;
    var actualValue = _this.frequences[index] - min;
    var percentage = scale === 0 ? 0 : actualValue / scale;
    return _this.startingScale + _this.pulseRatio * percentage;
  };

  this.startingScale = 0;
  this.pulseRatio = 1;
  this.maxValueHistory = 100;
  this.hzHistory = [];
};

var Analyser$1 = new Analyser();

var Player = function Player(forceAudioContext) {
  var _this = this;

  classCallCheck(this, Player);

  this.createSourceFromAudioElement = function (audioElement) {
    audioElement.setAttribute('rythm-connected', _this.connectedSources.length);
    var source = _this.audioCtx.createMediaElementSource(audioElement);
    _this.connectedSources.push(source);
    return source;
  };

  this.connectExternalAudioElement = function (audioElement) {
    _this.audio = audioElement;
    _this.currentInputType = _this.inputTypeList['EXTERNAL'];
    var connectedIndex = audioElement.getAttribute('rythm-connected');
    if (!connectedIndex) {
      _this.source = _this.createSourceFromAudioElement(_this.audio);
    } else {
      _this.source = _this.connectedSources[connectedIndex];
    }
    _this.connectSource(_this.source);
  };

  this.connectSource = function (source) {
    source.connect(_this.gain);
    _this.gain.connect(Analyser$1.analyser);
    if (_this.currentInputType !== _this.inputTypeList['STREAM']) {
      Analyser$1.analyser.connect(_this.audioCtx.destination);
      _this.audio.addEventListener('ended', _this.stop);
    } else {
      Analyser$1.analyser.disconnect();
    }
  };

  this.setMusic = function (trackUrl) {
    _this.audio = new Audio(trackUrl);
    _this.currentInputType = _this.inputTypeList['TRACK'];
    _this.source = _this.createSourceFromAudioElement(_this.audio);
    _this.connectSource(_this.source);
  };

  this.setGain = function (value) {
    _this.gain.gain.value = value;
  };

  this.plugMicrophone = function () {
    return _this.getMicrophoneStream().then(function (stream) {
      _this.audio = stream;
      _this.currentInputType = _this.inputTypeList['STREAM'];
      _this.source = _this.audioCtx.createMediaStreamSource(stream);
      _this.connectSource(_this.source);
    });
  };

  this.getMicrophoneStream = function () {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    return new Promise(function (resolve, reject) {
      navigator.getUserMedia({ audio: true }, function (medias) {
        return resolve(medias);
      }, function (error) {
        return reject(error);
      });
    });
  };

  this.start = function () {
    if (_this.currentInputType === _this.inputTypeList['TRACK']) {
      if (_this.audioCtx.state === 'suspended') {
        _this.audioCtx.resume().then(function () {
          return _this.audio.play();
        });
      } else {
        _this.audio.play();
      }
    }
  };

  this.stop = function () {
    if (_this.currentInputType === _this.inputTypeList['TRACK']) {
      _this.audio.pause();
    } else if (_this.currentInputType === _this.inputTypeList['STREAM']) {
      _this.audio.getAudioTracks()[0].enabled = false;
    }
  };

  this.browserAudioCtx = window.AudioContext || window.webkitAudioContext;
  this.audioCtx = forceAudioContext || new this.browserAudioCtx();
  this.connectedSources = [];
  Analyser$1.initialise(this.audioCtx.createAnalyser());
  this.gain = this.audioCtx.createGain();
  this.source = {};
  this.audio = {};
  this.hzHistory = [];
  this.inputTypeList = {
    TRACK: 0,
    STREAM: 1,
    EXTERNAL: 2
  };
};

var pulse = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 1.25;
  var min = !isNaN(options.min) ? options.min : 0.75;
  var scale = (max - min) * value;
  elem.style.transform = 'scale(' + (min + scale) + ') translateZ(0)';
});

var reset = function reset(elem) {
  elem.style.transform = '';
};

var shake = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 15;
  var min = !isNaN(options.min) ? options.min : -15;
  if (options.direction === 'left') {
    max = -max;
    min = -min;
  }
  var twist = (max - min) * value;
  elem.style.transform = 'translate3d(' + (min + twist) + 'px, 0, 0)';
});

var reset$1 = function reset(elem) {
  elem.style.transform = '';
};

var jump = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 30;
  var min = !isNaN(options.min) ? options.min : 0;
  var jump = (max - min) * value;
  elem.style.transform = 'translate3d(0, ' + -jump + 'px, 0)';
});

var reset$2 = function reset(elem) {
  elem.style.transform = '';
};

var twist = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 20;
  var min = !isNaN(options.min) ? options.min : -20;
  if (options.direction === 'left') {
    max = -max;
    min = -min;
  }
  var twist = (max - min) * value;
  elem.style.transform = 'rotate(' + (min + twist) + 'deg) translateZ(0)';
});

var reset$3 = function reset(elem) {
  elem.style.transform = '';
};

var vanish = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 1;
  var min = !isNaN(options.max) ? options.max : 0;
  var vanish = (max - min) * value;
  if (options.reverse) {
    elem.style.opacity = max - vanish;
  } else {
    elem.style.opacity = min + vanish;
  }
});

var reset$4 = function reset(elem) {
  elem.style.opacity = '';
};

var borderColor = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var from = options.from || [0, 0, 0];
  var to = options.to || [255, 255, 255];
  var scaleR = (to[0] - from[0]) * value;
  var scaleG = (to[1] - from[1]) * value;
  var scaleB = (to[2] - from[2]) * value;
  elem.style.borderColor = 'rgb(' + Math.floor(to[0] - scaleR) + ', ' + Math.floor(to[1] - scaleG) + ', ' + Math.floor(to[2] - scaleB) + ')';
});

var reset$5 = function reset(elem) {
  elem.style.borderColor = '';
};

var color = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var from = options.from || [0, 0, 0];
  var to = options.to || [255, 255, 255];
  var scaleR = (to[0] - from[0]) * value;
  var scaleG = (to[1] - from[1]) * value;
  var scaleB = (to[2] - from[2]) * value;
  elem.style.backgroundColor = 'rgb(' + Math.floor(to[0] - scaleR) + ', ' + Math.floor(to[1] - scaleG) + ', ' + Math.floor(to[2] - scaleB) + ')';
});

var reset$6 = function reset(elem) {
  elem.style.backgroundColor = '';
};

var radius = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 25;
  var min = !isNaN(options.min) ? options.min : 0;
  var borderRadius = (max - min) * value;
  if (options.reverse) {
    borderRadius = max - borderRadius;
  } else {
    borderRadius = min + borderRadius;
  }
  elem.style.borderRadius = borderRadius + 'px';
});

var reset$7 = function reset(elem) {
  elem.style.borderRadius = '';
};

var blur = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 8;
  var min = !isNaN(options.min) ? options.min : 0;
  var blur = (max - min) * value;
  if (options.reverse) {
    blur = max - blur;
  } else {
    blur = min + blur;
  }
  elem.style.filter = 'blur(' + blur + 'px)';
});

var reset$8 = function reset(elem) {
  elem.style.filter = '';
};

var coefficientMap = {
  up: -1,
  down: 1,
  left: 1,
  right: -1
};

var swing = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var radius = !isNaN(options.radius) ? options.radius : 20;
  var direction = Object.keys(coefficientMap).includes(options.direction) ? options.direction : 'right';
  var curve = Object.keys(coefficientMap).includes(options.curve) ? options.curve : 'down';
  var _ref = [coefficientMap[direction], coefficientMap[curve]],
      xCoefficient = _ref[0],
      yCoefficient = _ref[1];

  elem.style.transform = 'translate3d(' + xCoefficient * radius * Math.cos(value * Math.PI) + 'px, ' + yCoefficient * radius * Math.sin(value * Math.PI) + 'px, 0)';
});

var reset$9 = function reset(elem) {
  elem.style.transform = '';
};

var neon = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var from = options.from || [0, 0, 0];
  var to = options.to || [255, 255, 255];
  var scaleR = (to[0] - from[0]) * value;
  var scaleG = (to[1] - from[1]) * value;
  var scaleB = (to[2] - from[2]) * value;
  elem.style.boxShadow = '0 0 1em rgb(' + Math.floor(to[0] - scaleR) + ', ' + Math.floor(to[1] - scaleG) + ', ' + Math.floor(to[2] - scaleB) + ')';
});

var reset$10 = function reset(elem) {
  elem.style.boxShadow = '';
};

var kern = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 25;
  var min = !isNaN(options.min) ? options.min : 0;
  var kern = (max - min) * value;
  if (options.reverse) {
    kern = max - kern;
  } else {
    kern = min + kern;
  }
  elem.style.letterSpacing = kern + 'px';
});

var reset$11 = function reset(elem) {
  elem.style.letterSpacing = '';
};

var fontSize = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 0.8;
  var min = !isNaN(options.min) ? options.min : 1.2;
  var fontSize = (max - min) * value + min;
  elem.style.fontSize = fontSize + 'em';
});

var reset$12 = function reset(elem) {
  elem.style.fontSize = '1em';
};

var borderWidth = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 5;
  var min = !isNaN(options.min) ? options.min : 0;
  var borderWidth = (max - min) * value + min;
  elem.style.borderWidth = borderWidth + 'px';
});

var reset$13 = function reset(elem) {
  elem.style.borderWidth = '';
};

var tilt = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var max = !isNaN(options.max) ? options.max : 25;
  var min = !isNaN(options.min) ? options.min : 20;
  var rotate3d = (max - min) * value;
  if (options.reverse) {
    rotate3d = max - rotate3d;
  }
  elem.style.transform = 'matrix(1, ' + Math.sin(rotate3d) + ', 0, 1 , 0 ,0)';
});

var reset$14 = function reset(elem) {
  elem.style.transform = '';
};

var fontColor = (function (elem, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var from = options.from || [0, 0, 0];
  var to = options.to || [255, 255, 255];
  var scaleR = (to[0] - from[0]) * value;
  var scaleG = (to[1] - from[1]) * value;
  var scaleB = (to[2] - from[2]) * value;
  elem.style.color = 'rgb(' + Math.floor(to[0] - scaleR) + ', ' + Math.floor(to[1] - scaleG) + ', ' + Math.floor(to[2] - scaleB) + ')';
});

var reset$15 = function reset(elem) {
  elem.style.color = '';
};

var Dancer = function () {
  function Dancer() {
    classCallCheck(this, Dancer);

    this.resets = {};
    this.dances = {};
    this.registerDance('size', pulse, reset);
    this.registerDance('pulse', pulse, reset);
    this.registerDance('shake', shake, reset$1);
    this.registerDance('jump', jump, reset$2);
    this.registerDance('twist', twist, reset$3);
    this.registerDance('vanish', vanish, reset$4);
    this.registerDance('color', color, reset$6);
    this.registerDance('borderColor', borderColor, reset$5);
    this.registerDance('radius', radius, reset$7);
    this.registerDance('blur', blur, reset$8);
    this.registerDance('swing', swing, reset$9);
    this.registerDance('neon', neon, reset$10);
    this.registerDance('kern', kern, reset$11);
    this.registerDance('borderWidth', borderWidth, reset$13);
    this.registerDance('fontSize', fontSize, reset$12);
    this.registerDance('tilt', tilt, reset$14);
    this.registerDance('fontColor', fontColor, reset$15);
  }

  createClass(Dancer, [{
    key: 'registerDance',
    value: function registerDance(type, dance) {
      var reset$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

      this.dances[type] = dance;
      this.resets[type] = reset$$1;
    }
  }, {
    key: 'dance',
    value: function dance(type, className, ratio, options) {
      var dance = type;
      if (typeof type === 'string') {
        //In case of a built in dance
        dance = this.dances[type] || this.dances['pulse'];
      } else {
        //In case of a custom dance
        dance = type.dance;
      }
      var elements = document.getElementsByClassName(className);
      Array.from(elements).forEach(function (elem) {
        return dance(elem, ratio, options);
      });
    }
  }, {
    key: 'reset',
    value: function reset$$1(type, className) {
      var reset$$1 = type;
      if (typeof type === 'string') {
        //In case of a built in dance
        reset$$1 = this.resets[type] || this.resets['pulse'];
      } else {
        //In case of a custom dance
        reset$$1 = type.reset;
      }
      var elements = document.getElementsByClassName(className);
      Array.from(elements).forEach(function (elem) {
        return reset$$1(elem);
      });
    }
  }]);
  return Dancer;
}();

var dancer = new Dancer();

var Rythm$1 = function Rythm(forceAudioContext) {
  var _this = this;

  classCallCheck(this, Rythm);

  this.connectExternalAudioElement = function (audioElement) {
    return _this.player.connectExternalAudioElement(audioElement);
  };

  this.setMusic = function (url) {
    return _this.player.setMusic(url);
  };

  this.plugMicrophone = function () {
    return _this.player.plugMicrophone();
  };

  this.setGain = function (value) {
    return _this.player.setGain(value);
  };

  this.connectSource = function (source) {
    return _this.player.connectSource(source);
  };

  this.addRythm = function (elementClass, type, startValue, nbValue, options) {
    _this.rythms.push({
      elementClass: elementClass,
      type: type,
      startValue: startValue,
      nbValue: nbValue,
      options: options
    });
  };

  this.start = function () {
    _this.stopped = false;
    _this.player.start();
    _this.analyser.reset();
    _this.renderRythm();
  };

  this.renderRythm = function () {
    if (_this.stopped) return;
    _this.analyser.analyse();
    _this.rythms.forEach(function (mappingItem) {
      var type = mappingItem.type,
          elementClass = mappingItem.elementClass,
          nbValue = mappingItem.nbValue,
          startValue = mappingItem.startValue,
          options = mappingItem.options;

      _this.dancer.dance(type, elementClass, _this.analyser.getRangeAverageRatio(startValue, nbValue), options);
    });
    _this.animationFrameRequest = requestAnimationFrame(_this.renderRythm);
  };

  this.resetRythm = function () {
    _this.rythms.forEach(function (mappingItem) {
      var type = mappingItem.type,
          elementClass = mappingItem.elementClass,
          nbValue = mappingItem.nbValue,
          startValue = mappingItem.startValue,
          options = mappingItem.options;

      _this.dancer.reset(type, elementClass);
    });
  };

  this.stop = function (freeze) {
    _this.stopped = true;
    _this.player.stop();
    if (_this.animationFrameRequest) cancelAnimationFrame(_this.animationFrameRequest);
    if (!freeze) _this.resetRythm();
  };

  this.player = new Player(forceAudioContext);
  this.analyser = Analyser$1;
  this.maxValueHistory = Analyser$1.maxValueHistory;
  this.dancer = dancer;
  this.rythms = [];
  this.addRythm('rythm-bass', 'pulse', 0, 10);
  this.addRythm('rythm-medium', 'pulse', 150, 40);
  this.addRythm('rythm-high', 'pulse', 400, 200);
  this.animationFrameRequest = void 0;
};

return Rythm$1;

})));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var rythm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rythm.js */ "./node_modules/rythm.js/rythm.js");
/* harmony import */ var rythm_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rythm_js__WEBPACK_IMPORTED_MODULE_0__);


let button = document.getElementById("play-button");
button.addEventListener("click", play);

function play() {
  var rythm = new (rythm_js__WEBPACK_IMPORTED_MODULE_0___default())();
  rythm.setMusic("samples/rythmC.mp3");
  rythm.start();
  console.log("play");
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0EsQ0FBQyxLQUE0RDtBQUM3RCxDQUFDLENBQzBCO0FBQzNCLENBQUMsc0JBQXNCOztBQUV2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQiw2QkFBNkI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQ0FBZ0MsNkJBQTZCO0FBQzdEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsYUFBYTtBQUM1QztBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxHQUFHO0FBQ0g7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLENBQUM7Ozs7Ozs7VUNqbUJEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7OztBQ042Qjs7QUFFN0I7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQixpREFBSztBQUN2QjtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2hvbWVoYWdlLy4vbm9kZV9tb2R1bGVzL3J5dGhtLmpzL3J5dGhtLmpzIiwid2VicGFjazovL2hvbWVoYWdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2hvbWVoYWdlL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2hvbWVoYWdlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9ob21laGFnZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2hvbWVoYWdlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vaG9tZWhhZ2UvLi9zcmMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC5SeXRobSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbnZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxudmFyIEFuYWx5c2VyID0gZnVuY3Rpb24gQW5hbHlzZXIoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgY2xhc3NDYWxsQ2hlY2sodGhpcywgQW5hbHlzZXIpO1xuXG4gIHRoaXMuaW5pdGlhbGlzZSA9IGZ1bmN0aW9uIChhbmFseXNlcikge1xuICAgIF90aGlzLmFuYWx5c2VyID0gYW5hbHlzZXI7XG4gICAgX3RoaXMuYW5hbHlzZXIuZmZ0U2l6ZSA9IDIwNDg7XG4gIH07XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBfdGhpcy5oekhpc3RvcnkgPSBbXTtcbiAgICBfdGhpcy5mcmVxdWVuY2VzID0gbmV3IFVpbnQ4QXJyYXkoX3RoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQpO1xuICB9O1xuXG4gIHRoaXMuYW5hbHlzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBfdGhpcy5hbmFseXNlci5nZXRCeXRlRnJlcXVlbmN5RGF0YShfdGhpcy5mcmVxdWVuY2VzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90aGlzLmZyZXF1ZW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghX3RoaXMuaHpIaXN0b3J5W2ldKSB7XG4gICAgICAgIF90aGlzLmh6SGlzdG9yeVtpXSA9IFtdO1xuICAgICAgfVxuICAgICAgaWYgKF90aGlzLmh6SGlzdG9yeVtpXS5sZW5ndGggPiBfdGhpcy5tYXhWYWx1ZUhpc3RvcnkpIHtcbiAgICAgICAgX3RoaXMuaHpIaXN0b3J5W2ldLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgICBfdGhpcy5oekhpc3RvcnlbaV0ucHVzaChfdGhpcy5mcmVxdWVuY2VzW2ldKTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5nZXRSYW5nZUF2ZXJhZ2VSYXRpbyA9IGZ1bmN0aW9uIChzdGFydGluZ1ZhbHVlLCBuYlZhbHVlKSB7XG4gICAgdmFyIHRvdGFsID0gMDtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRpbmdWYWx1ZTsgaSA8IG5iVmFsdWUgKyBzdGFydGluZ1ZhbHVlOyBpKyspIHtcbiAgICAgIHRvdGFsICs9IF90aGlzLmdldEZyZXF1ZW5jZVJhdGlvKGkpO1xuICAgIH1cbiAgICByZXR1cm4gdG90YWwgLyBuYlZhbHVlO1xuICB9O1xuXG4gIHRoaXMuZ2V0RnJlcXVlbmNlUmF0aW8gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICB2YXIgbWluID0gMjU1O1xuICAgIHZhciBtYXggPSAwO1xuICAgIF90aGlzLmh6SGlzdG9yeVtpbmRleF0uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA8IG1pbikge1xuICAgICAgICBtaW4gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSA+IG1heCkge1xuICAgICAgICBtYXggPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgc2NhbGUgPSBtYXggLSBtaW47XG4gICAgdmFyIGFjdHVhbFZhbHVlID0gX3RoaXMuZnJlcXVlbmNlc1tpbmRleF0gLSBtaW47XG4gICAgdmFyIHBlcmNlbnRhZ2UgPSBzY2FsZSA9PT0gMCA/IDAgOiBhY3R1YWxWYWx1ZSAvIHNjYWxlO1xuICAgIHJldHVybiBfdGhpcy5zdGFydGluZ1NjYWxlICsgX3RoaXMucHVsc2VSYXRpbyAqIHBlcmNlbnRhZ2U7XG4gIH07XG5cbiAgdGhpcy5zdGFydGluZ1NjYWxlID0gMDtcbiAgdGhpcy5wdWxzZVJhdGlvID0gMTtcbiAgdGhpcy5tYXhWYWx1ZUhpc3RvcnkgPSAxMDA7XG4gIHRoaXMuaHpIaXN0b3J5ID0gW107XG59O1xuXG52YXIgQW5hbHlzZXIkMSA9IG5ldyBBbmFseXNlcigpO1xuXG52YXIgUGxheWVyID0gZnVuY3Rpb24gUGxheWVyKGZvcmNlQXVkaW9Db250ZXh0KSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGxheWVyKTtcblxuICB0aGlzLmNyZWF0ZVNvdXJjZUZyb21BdWRpb0VsZW1lbnQgPSBmdW5jdGlvbiAoYXVkaW9FbGVtZW50KSB7XG4gICAgYXVkaW9FbGVtZW50LnNldEF0dHJpYnV0ZSgncnl0aG0tY29ubmVjdGVkJywgX3RoaXMuY29ubmVjdGVkU291cmNlcy5sZW5ndGgpO1xuICAgIHZhciBzb3VyY2UgPSBfdGhpcy5hdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UoYXVkaW9FbGVtZW50KTtcbiAgICBfdGhpcy5jb25uZWN0ZWRTb3VyY2VzLnB1c2goc291cmNlKTtcbiAgICByZXR1cm4gc291cmNlO1xuICB9O1xuXG4gIHRoaXMuY29ubmVjdEV4dGVybmFsQXVkaW9FbGVtZW50ID0gZnVuY3Rpb24gKGF1ZGlvRWxlbWVudCkge1xuICAgIF90aGlzLmF1ZGlvID0gYXVkaW9FbGVtZW50O1xuICAgIF90aGlzLmN1cnJlbnRJbnB1dFR5cGUgPSBfdGhpcy5pbnB1dFR5cGVMaXN0WydFWFRFUk5BTCddO1xuICAgIHZhciBjb25uZWN0ZWRJbmRleCA9IGF1ZGlvRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3J5dGhtLWNvbm5lY3RlZCcpO1xuICAgIGlmICghY29ubmVjdGVkSW5kZXgpIHtcbiAgICAgIF90aGlzLnNvdXJjZSA9IF90aGlzLmNyZWF0ZVNvdXJjZUZyb21BdWRpb0VsZW1lbnQoX3RoaXMuYXVkaW8pO1xuICAgIH0gZWxzZSB7XG4gICAgICBfdGhpcy5zb3VyY2UgPSBfdGhpcy5jb25uZWN0ZWRTb3VyY2VzW2Nvbm5lY3RlZEluZGV4XTtcbiAgICB9XG4gICAgX3RoaXMuY29ubmVjdFNvdXJjZShfdGhpcy5zb3VyY2UpO1xuICB9O1xuXG4gIHRoaXMuY29ubmVjdFNvdXJjZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBzb3VyY2UuY29ubmVjdChfdGhpcy5nYWluKTtcbiAgICBfdGhpcy5nYWluLmNvbm5lY3QoQW5hbHlzZXIkMS5hbmFseXNlcik7XG4gICAgaWYgKF90aGlzLmN1cnJlbnRJbnB1dFR5cGUgIT09IF90aGlzLmlucHV0VHlwZUxpc3RbJ1NUUkVBTSddKSB7XG4gICAgICBBbmFseXNlciQxLmFuYWx5c2VyLmNvbm5lY3QoX3RoaXMuYXVkaW9DdHguZGVzdGluYXRpb24pO1xuICAgICAgX3RoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBfdGhpcy5zdG9wKTtcbiAgICB9IGVsc2Uge1xuICAgICAgQW5hbHlzZXIkMS5hbmFseXNlci5kaXNjb25uZWN0KCk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuc2V0TXVzaWMgPSBmdW5jdGlvbiAodHJhY2tVcmwpIHtcbiAgICBfdGhpcy5hdWRpbyA9IG5ldyBBdWRpbyh0cmFja1VybCk7XG4gICAgX3RoaXMuY3VycmVudElucHV0VHlwZSA9IF90aGlzLmlucHV0VHlwZUxpc3RbJ1RSQUNLJ107XG4gICAgX3RoaXMuc291cmNlID0gX3RoaXMuY3JlYXRlU291cmNlRnJvbUF1ZGlvRWxlbWVudChfdGhpcy5hdWRpbyk7XG4gICAgX3RoaXMuY29ubmVjdFNvdXJjZShfdGhpcy5zb3VyY2UpO1xuICB9O1xuXG4gIHRoaXMuc2V0R2FpbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIF90aGlzLmdhaW4uZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICB9O1xuXG4gIHRoaXMucGx1Z01pY3JvcGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF90aGlzLmdldE1pY3JvcGhvbmVTdHJlYW0oKS50aGVuKGZ1bmN0aW9uIChzdHJlYW0pIHtcbiAgICAgIF90aGlzLmF1ZGlvID0gc3RyZWFtO1xuICAgICAgX3RoaXMuY3VycmVudElucHV0VHlwZSA9IF90aGlzLmlucHV0VHlwZUxpc3RbJ1NUUkVBTSddO1xuICAgICAgX3RoaXMuc291cmNlID0gX3RoaXMuYXVkaW9DdHguY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2Uoc3RyZWFtKTtcbiAgICAgIF90aGlzLmNvbm5lY3RTb3VyY2UoX3RoaXMuc291cmNlKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmdldE1pY3JvcGhvbmVTdHJlYW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0sIGZ1bmN0aW9uIChtZWRpYXMpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobWVkaWFzKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKF90aGlzLmN1cnJlbnRJbnB1dFR5cGUgPT09IF90aGlzLmlucHV0VHlwZUxpc3RbJ1RSQUNLJ10pIHtcbiAgICAgIGlmIChfdGhpcy5hdWRpb0N0eC5zdGF0ZSA9PT0gJ3N1c3BlbmRlZCcpIHtcbiAgICAgICAgX3RoaXMuYXVkaW9DdHgucmVzdW1lKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmF1ZGlvLnBsYXkoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5hdWRpby5wbGF5KCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoX3RoaXMuY3VycmVudElucHV0VHlwZSA9PT0gX3RoaXMuaW5wdXRUeXBlTGlzdFsnVFJBQ0snXSkge1xuICAgICAgX3RoaXMuYXVkaW8ucGF1c2UoKTtcbiAgICB9IGVsc2UgaWYgKF90aGlzLmN1cnJlbnRJbnB1dFR5cGUgPT09IF90aGlzLmlucHV0VHlwZUxpc3RbJ1NUUkVBTSddKSB7XG4gICAgICBfdGhpcy5hdWRpby5nZXRBdWRpb1RyYWNrcygpWzBdLmVuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5icm93c2VyQXVkaW9DdHggPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG4gIHRoaXMuYXVkaW9DdHggPSBmb3JjZUF1ZGlvQ29udGV4dCB8fCBuZXcgdGhpcy5icm93c2VyQXVkaW9DdHgoKTtcbiAgdGhpcy5jb25uZWN0ZWRTb3VyY2VzID0gW107XG4gIEFuYWx5c2VyJDEuaW5pdGlhbGlzZSh0aGlzLmF1ZGlvQ3R4LmNyZWF0ZUFuYWx5c2VyKCkpO1xuICB0aGlzLmdhaW4gPSB0aGlzLmF1ZGlvQ3R4LmNyZWF0ZUdhaW4oKTtcbiAgdGhpcy5zb3VyY2UgPSB7fTtcbiAgdGhpcy5hdWRpbyA9IHt9O1xuICB0aGlzLmh6SGlzdG9yeSA9IFtdO1xuICB0aGlzLmlucHV0VHlwZUxpc3QgPSB7XG4gICAgVFJBQ0s6IDAsXG4gICAgU1RSRUFNOiAxLFxuICAgIEVYVEVSTkFMOiAyXG4gIH07XG59O1xuXG52YXIgcHVsc2UgPSAoZnVuY3Rpb24gKGVsZW0sIHZhbHVlKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICB2YXIgbWF4ID0gIWlzTmFOKG9wdGlvbnMubWF4KSA/IG9wdGlvbnMubWF4IDogMS4yNTtcbiAgdmFyIG1pbiA9ICFpc05hTihvcHRpb25zLm1pbikgPyBvcHRpb25zLm1pbiA6IDAuNzU7XG4gIHZhciBzY2FsZSA9IChtYXggLSBtaW4pICogdmFsdWU7XG4gIGVsZW0uc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlKCcgKyAobWluICsgc2NhbGUpICsgJykgdHJhbnNsYXRlWigwKSc7XG59KTtcblxudmFyIHJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xufTtcblxudmFyIHNoYWtlID0gKGZ1bmN0aW9uIChlbGVtLCB2YWx1ZSkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgdmFyIG1heCA9ICFpc05hTihvcHRpb25zLm1heCkgPyBvcHRpb25zLm1heCA6IDE1O1xuICB2YXIgbWluID0gIWlzTmFOKG9wdGlvbnMubWluKSA/IG9wdGlvbnMubWluIDogLTE1O1xuICBpZiAob3B0aW9ucy5kaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgIG1heCA9IC1tYXg7XG4gICAgbWluID0gLW1pbjtcbiAgfVxuICB2YXIgdHdpc3QgPSAobWF4IC0gbWluKSAqIHZhbHVlO1xuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKG1pbiArIHR3aXN0KSArICdweCwgMCwgMCknO1xufSk7XG5cbnZhciByZXNldCQxID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xufTtcblxudmFyIGp1bXAgPSAoZnVuY3Rpb24gKGVsZW0sIHZhbHVlKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICB2YXIgbWF4ID0gIWlzTmFOKG9wdGlvbnMubWF4KSA/IG9wdGlvbnMubWF4IDogMzA7XG4gIHZhciBtaW4gPSAhaXNOYU4ob3B0aW9ucy5taW4pID8gb3B0aW9ucy5taW4gOiAwO1xuICB2YXIganVtcCA9IChtYXggLSBtaW4pICogdmFsdWU7XG4gIGVsZW0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKDAsICcgKyAtanVtcCArICdweCwgMCknO1xufSk7XG5cbnZhciByZXNldCQyID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xufTtcblxudmFyIHR3aXN0ID0gKGZ1bmN0aW9uIChlbGVtLCB2YWx1ZSkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgdmFyIG1heCA9ICFpc05hTihvcHRpb25zLm1heCkgPyBvcHRpb25zLm1heCA6IDIwO1xuICB2YXIgbWluID0gIWlzTmFOKG9wdGlvbnMubWluKSA/IG9wdGlvbnMubWluIDogLTIwO1xuICBpZiAob3B0aW9ucy5kaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgIG1heCA9IC1tYXg7XG4gICAgbWluID0gLW1pbjtcbiAgfVxuICB2YXIgdHdpc3QgPSAobWF4IC0gbWluKSAqIHZhbHVlO1xuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGUoJyArIChtaW4gKyB0d2lzdCkgKyAnZGVnKSB0cmFuc2xhdGVaKDApJztcbn0pO1xuXG52YXIgcmVzZXQkMyA9IGZ1bmN0aW9uIHJlc2V0KGVsZW0pIHtcbiAgZWxlbS5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbn07XG5cbnZhciB2YW5pc2ggPSAoZnVuY3Rpb24gKGVsZW0sIHZhbHVlKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICB2YXIgbWF4ID0gIWlzTmFOKG9wdGlvbnMubWF4KSA/IG9wdGlvbnMubWF4IDogMTtcbiAgdmFyIG1pbiA9ICFpc05hTihvcHRpb25zLm1heCkgPyBvcHRpb25zLm1heCA6IDA7XG4gIHZhciB2YW5pc2ggPSAobWF4IC0gbWluKSAqIHZhbHVlO1xuICBpZiAob3B0aW9ucy5yZXZlcnNlKSB7XG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gbWF4IC0gdmFuaXNoO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG1pbiArIHZhbmlzaDtcbiAgfVxufSk7XG5cbnZhciByZXNldCQ0ID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAnJztcbn07XG5cbnZhciBib3JkZXJDb2xvciA9IChmdW5jdGlvbiAoZWxlbSwgdmFsdWUpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gIHZhciBmcm9tID0gb3B0aW9ucy5mcm9tIHx8IFswLCAwLCAwXTtcbiAgdmFyIHRvID0gb3B0aW9ucy50byB8fCBbMjU1LCAyNTUsIDI1NV07XG4gIHZhciBzY2FsZVIgPSAodG9bMF0gLSBmcm9tWzBdKSAqIHZhbHVlO1xuICB2YXIgc2NhbGVHID0gKHRvWzFdIC0gZnJvbVsxXSkgKiB2YWx1ZTtcbiAgdmFyIHNjYWxlQiA9ICh0b1syXSAtIGZyb21bMl0pICogdmFsdWU7XG4gIGVsZW0uc3R5bGUuYm9yZGVyQ29sb3IgPSAncmdiKCcgKyBNYXRoLmZsb29yKHRvWzBdIC0gc2NhbGVSKSArICcsICcgKyBNYXRoLmZsb29yKHRvWzFdIC0gc2NhbGVHKSArICcsICcgKyBNYXRoLmZsb29yKHRvWzJdIC0gc2NhbGVCKSArICcpJztcbn0pO1xuXG52YXIgcmVzZXQkNSA9IGZ1bmN0aW9uIHJlc2V0KGVsZW0pIHtcbiAgZWxlbS5zdHlsZS5ib3JkZXJDb2xvciA9ICcnO1xufTtcblxudmFyIGNvbG9yID0gKGZ1bmN0aW9uIChlbGVtLCB2YWx1ZSkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgdmFyIGZyb20gPSBvcHRpb25zLmZyb20gfHwgWzAsIDAsIDBdO1xuICB2YXIgdG8gPSBvcHRpb25zLnRvIHx8IFsyNTUsIDI1NSwgMjU1XTtcbiAgdmFyIHNjYWxlUiA9ICh0b1swXSAtIGZyb21bMF0pICogdmFsdWU7XG4gIHZhciBzY2FsZUcgPSAodG9bMV0gLSBmcm9tWzFdKSAqIHZhbHVlO1xuICB2YXIgc2NhbGVCID0gKHRvWzJdIC0gZnJvbVsyXSkgKiB2YWx1ZTtcbiAgZWxlbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiKCcgKyBNYXRoLmZsb29yKHRvWzBdIC0gc2NhbGVSKSArICcsICcgKyBNYXRoLmZsb29yKHRvWzFdIC0gc2NhbGVHKSArICcsICcgKyBNYXRoLmZsb29yKHRvWzJdIC0gc2NhbGVCKSArICcpJztcbn0pO1xuXG52YXIgcmVzZXQkNiA9IGZ1bmN0aW9uIHJlc2V0KGVsZW0pIHtcbiAgZWxlbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnJztcbn07XG5cbnZhciByYWRpdXMgPSAoZnVuY3Rpb24gKGVsZW0sIHZhbHVlKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICB2YXIgbWF4ID0gIWlzTmFOKG9wdGlvbnMubWF4KSA/IG9wdGlvbnMubWF4IDogMjU7XG4gIHZhciBtaW4gPSAhaXNOYU4ob3B0aW9ucy5taW4pID8gb3B0aW9ucy5taW4gOiAwO1xuICB2YXIgYm9yZGVyUmFkaXVzID0gKG1heCAtIG1pbikgKiB2YWx1ZTtcbiAgaWYgKG9wdGlvbnMucmV2ZXJzZSkge1xuICAgIGJvcmRlclJhZGl1cyA9IG1heCAtIGJvcmRlclJhZGl1cztcbiAgfSBlbHNlIHtcbiAgICBib3JkZXJSYWRpdXMgPSBtaW4gKyBib3JkZXJSYWRpdXM7XG4gIH1cbiAgZWxlbS5zdHlsZS5ib3JkZXJSYWRpdXMgPSBib3JkZXJSYWRpdXMgKyAncHgnO1xufSk7XG5cbnZhciByZXNldCQ3ID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLmJvcmRlclJhZGl1cyA9ICcnO1xufTtcblxudmFyIGJsdXIgPSAoZnVuY3Rpb24gKGVsZW0sIHZhbHVlKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICB2YXIgbWF4ID0gIWlzTmFOKG9wdGlvbnMubWF4KSA/IG9wdGlvbnMubWF4IDogODtcbiAgdmFyIG1pbiA9ICFpc05hTihvcHRpb25zLm1pbikgPyBvcHRpb25zLm1pbiA6IDA7XG4gIHZhciBibHVyID0gKG1heCAtIG1pbikgKiB2YWx1ZTtcbiAgaWYgKG9wdGlvbnMucmV2ZXJzZSkge1xuICAgIGJsdXIgPSBtYXggLSBibHVyO1xuICB9IGVsc2Uge1xuICAgIGJsdXIgPSBtaW4gKyBibHVyO1xuICB9XG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gJ2JsdXIoJyArIGJsdXIgKyAncHgpJztcbn0pO1xuXG52YXIgcmVzZXQkOCA9IGZ1bmN0aW9uIHJlc2V0KGVsZW0pIHtcbiAgZWxlbS5zdHlsZS5maWx0ZXIgPSAnJztcbn07XG5cbnZhciBjb2VmZmljaWVudE1hcCA9IHtcbiAgdXA6IC0xLFxuICBkb3duOiAxLFxuICBsZWZ0OiAxLFxuICByaWdodDogLTFcbn07XG5cbnZhciBzd2luZyA9IChmdW5jdGlvbiAoZWxlbSwgdmFsdWUpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gIHZhciByYWRpdXMgPSAhaXNOYU4ob3B0aW9ucy5yYWRpdXMpID8gb3B0aW9ucy5yYWRpdXMgOiAyMDtcbiAgdmFyIGRpcmVjdGlvbiA9IE9iamVjdC5rZXlzKGNvZWZmaWNpZW50TWFwKS5pbmNsdWRlcyhvcHRpb25zLmRpcmVjdGlvbikgPyBvcHRpb25zLmRpcmVjdGlvbiA6ICdyaWdodCc7XG4gIHZhciBjdXJ2ZSA9IE9iamVjdC5rZXlzKGNvZWZmaWNpZW50TWFwKS5pbmNsdWRlcyhvcHRpb25zLmN1cnZlKSA/IG9wdGlvbnMuY3VydmUgOiAnZG93bic7XG4gIHZhciBfcmVmID0gW2NvZWZmaWNpZW50TWFwW2RpcmVjdGlvbl0sIGNvZWZmaWNpZW50TWFwW2N1cnZlXV0sXG4gICAgICB4Q29lZmZpY2llbnQgPSBfcmVmWzBdLFxuICAgICAgeUNvZWZmaWNpZW50ID0gX3JlZlsxXTtcblxuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgeENvZWZmaWNpZW50ICogcmFkaXVzICogTWF0aC5jb3ModmFsdWUgKiBNYXRoLlBJKSArICdweCwgJyArIHlDb2VmZmljaWVudCAqIHJhZGl1cyAqIE1hdGguc2luKHZhbHVlICogTWF0aC5QSSkgKyAncHgsIDApJztcbn0pO1xuXG52YXIgcmVzZXQkOSA9IGZ1bmN0aW9uIHJlc2V0KGVsZW0pIHtcbiAgZWxlbS5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbn07XG5cbnZhciBuZW9uID0gKGZ1bmN0aW9uIChlbGVtLCB2YWx1ZSkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgdmFyIGZyb20gPSBvcHRpb25zLmZyb20gfHwgWzAsIDAsIDBdO1xuICB2YXIgdG8gPSBvcHRpb25zLnRvIHx8IFsyNTUsIDI1NSwgMjU1XTtcbiAgdmFyIHNjYWxlUiA9ICh0b1swXSAtIGZyb21bMF0pICogdmFsdWU7XG4gIHZhciBzY2FsZUcgPSAodG9bMV0gLSBmcm9tWzFdKSAqIHZhbHVlO1xuICB2YXIgc2NhbGVCID0gKHRvWzJdIC0gZnJvbVsyXSkgKiB2YWx1ZTtcbiAgZWxlbS5zdHlsZS5ib3hTaGFkb3cgPSAnMCAwIDFlbSByZ2IoJyArIE1hdGguZmxvb3IodG9bMF0gLSBzY2FsZVIpICsgJywgJyArIE1hdGguZmxvb3IodG9bMV0gLSBzY2FsZUcpICsgJywgJyArIE1hdGguZmxvb3IodG9bMl0gLSBzY2FsZUIpICsgJyknO1xufSk7XG5cbnZhciByZXNldCQxMCA9IGZ1bmN0aW9uIHJlc2V0KGVsZW0pIHtcbiAgZWxlbS5zdHlsZS5ib3hTaGFkb3cgPSAnJztcbn07XG5cbnZhciBrZXJuID0gKGZ1bmN0aW9uIChlbGVtLCB2YWx1ZSkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgdmFyIG1heCA9ICFpc05hTihvcHRpb25zLm1heCkgPyBvcHRpb25zLm1heCA6IDI1O1xuICB2YXIgbWluID0gIWlzTmFOKG9wdGlvbnMubWluKSA/IG9wdGlvbnMubWluIDogMDtcbiAgdmFyIGtlcm4gPSAobWF4IC0gbWluKSAqIHZhbHVlO1xuICBpZiAob3B0aW9ucy5yZXZlcnNlKSB7XG4gICAga2VybiA9IG1heCAtIGtlcm47XG4gIH0gZWxzZSB7XG4gICAga2VybiA9IG1pbiArIGtlcm47XG4gIH1cbiAgZWxlbS5zdHlsZS5sZXR0ZXJTcGFjaW5nID0ga2VybiArICdweCc7XG59KTtcblxudmFyIHJlc2V0JDExID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLmxldHRlclNwYWNpbmcgPSAnJztcbn07XG5cbnZhciBmb250U2l6ZSA9IChmdW5jdGlvbiAoZWxlbSwgdmFsdWUpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gIHZhciBtYXggPSAhaXNOYU4ob3B0aW9ucy5tYXgpID8gb3B0aW9ucy5tYXggOiAwLjg7XG4gIHZhciBtaW4gPSAhaXNOYU4ob3B0aW9ucy5taW4pID8gb3B0aW9ucy5taW4gOiAxLjI7XG4gIHZhciBmb250U2l6ZSA9IChtYXggLSBtaW4pICogdmFsdWUgKyBtaW47XG4gIGVsZW0uc3R5bGUuZm9udFNpemUgPSBmb250U2l6ZSArICdlbSc7XG59KTtcblxudmFyIHJlc2V0JDEyID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLmZvbnRTaXplID0gJzFlbSc7XG59O1xuXG52YXIgYm9yZGVyV2lkdGggPSAoZnVuY3Rpb24gKGVsZW0sIHZhbHVlKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICB2YXIgbWF4ID0gIWlzTmFOKG9wdGlvbnMubWF4KSA/IG9wdGlvbnMubWF4IDogNTtcbiAgdmFyIG1pbiA9ICFpc05hTihvcHRpb25zLm1pbikgPyBvcHRpb25zLm1pbiA6IDA7XG4gIHZhciBib3JkZXJXaWR0aCA9IChtYXggLSBtaW4pICogdmFsdWUgKyBtaW47XG4gIGVsZW0uc3R5bGUuYm9yZGVyV2lkdGggPSBib3JkZXJXaWR0aCArICdweCc7XG59KTtcblxudmFyIHJlc2V0JDEzID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLmJvcmRlcldpZHRoID0gJyc7XG59O1xuXG52YXIgdGlsdCA9IChmdW5jdGlvbiAoZWxlbSwgdmFsdWUpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gIHZhciBtYXggPSAhaXNOYU4ob3B0aW9ucy5tYXgpID8gb3B0aW9ucy5tYXggOiAyNTtcbiAgdmFyIG1pbiA9ICFpc05hTihvcHRpb25zLm1pbikgPyBvcHRpb25zLm1pbiA6IDIwO1xuICB2YXIgcm90YXRlM2QgPSAobWF4IC0gbWluKSAqIHZhbHVlO1xuICBpZiAob3B0aW9ucy5yZXZlcnNlKSB7XG4gICAgcm90YXRlM2QgPSBtYXggLSByb3RhdGUzZDtcbiAgfVxuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICdtYXRyaXgoMSwgJyArIE1hdGguc2luKHJvdGF0ZTNkKSArICcsIDAsIDEgLCAwICwwKSc7XG59KTtcblxudmFyIHJlc2V0JDE0ID0gZnVuY3Rpb24gcmVzZXQoZWxlbSkge1xuICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xufTtcblxudmFyIGZvbnRDb2xvciA9IChmdW5jdGlvbiAoZWxlbSwgdmFsdWUpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gIHZhciBmcm9tID0gb3B0aW9ucy5mcm9tIHx8IFswLCAwLCAwXTtcbiAgdmFyIHRvID0gb3B0aW9ucy50byB8fCBbMjU1LCAyNTUsIDI1NV07XG4gIHZhciBzY2FsZVIgPSAodG9bMF0gLSBmcm9tWzBdKSAqIHZhbHVlO1xuICB2YXIgc2NhbGVHID0gKHRvWzFdIC0gZnJvbVsxXSkgKiB2YWx1ZTtcbiAgdmFyIHNjYWxlQiA9ICh0b1syXSAtIGZyb21bMl0pICogdmFsdWU7XG4gIGVsZW0uc3R5bGUuY29sb3IgPSAncmdiKCcgKyBNYXRoLmZsb29yKHRvWzBdIC0gc2NhbGVSKSArICcsICcgKyBNYXRoLmZsb29yKHRvWzFdIC0gc2NhbGVHKSArICcsICcgKyBNYXRoLmZsb29yKHRvWzJdIC0gc2NhbGVCKSArICcpJztcbn0pO1xuXG52YXIgcmVzZXQkMTUgPSBmdW5jdGlvbiByZXNldChlbGVtKSB7XG4gIGVsZW0uc3R5bGUuY29sb3IgPSAnJztcbn07XG5cbnZhciBEYW5jZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIERhbmNlcigpIHtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBEYW5jZXIpO1xuXG4gICAgdGhpcy5yZXNldHMgPSB7fTtcbiAgICB0aGlzLmRhbmNlcyA9IHt9O1xuICAgIHRoaXMucmVnaXN0ZXJEYW5jZSgnc2l6ZScsIHB1bHNlLCByZXNldCk7XG4gICAgdGhpcy5yZWdpc3RlckRhbmNlKCdwdWxzZScsIHB1bHNlLCByZXNldCk7XG4gICAgdGhpcy5yZWdpc3RlckRhbmNlKCdzaGFrZScsIHNoYWtlLCByZXNldCQxKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGFuY2UoJ2p1bXAnLCBqdW1wLCByZXNldCQyKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGFuY2UoJ3R3aXN0JywgdHdpc3QsIHJlc2V0JDMpO1xuICAgIHRoaXMucmVnaXN0ZXJEYW5jZSgndmFuaXNoJywgdmFuaXNoLCByZXNldCQ0KTtcbiAgICB0aGlzLnJlZ2lzdGVyRGFuY2UoJ2NvbG9yJywgY29sb3IsIHJlc2V0JDYpO1xuICAgIHRoaXMucmVnaXN0ZXJEYW5jZSgnYm9yZGVyQ29sb3InLCBib3JkZXJDb2xvciwgcmVzZXQkNSk7XG4gICAgdGhpcy5yZWdpc3RlckRhbmNlKCdyYWRpdXMnLCByYWRpdXMsIHJlc2V0JDcpO1xuICAgIHRoaXMucmVnaXN0ZXJEYW5jZSgnYmx1cicsIGJsdXIsIHJlc2V0JDgpO1xuICAgIHRoaXMucmVnaXN0ZXJEYW5jZSgnc3dpbmcnLCBzd2luZywgcmVzZXQkOSk7XG4gICAgdGhpcy5yZWdpc3RlckRhbmNlKCduZW9uJywgbmVvbiwgcmVzZXQkMTApO1xuICAgIHRoaXMucmVnaXN0ZXJEYW5jZSgna2VybicsIGtlcm4sIHJlc2V0JDExKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGFuY2UoJ2JvcmRlcldpZHRoJywgYm9yZGVyV2lkdGgsIHJlc2V0JDEzKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGFuY2UoJ2ZvbnRTaXplJywgZm9udFNpemUsIHJlc2V0JDEyKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGFuY2UoJ3RpbHQnLCB0aWx0LCByZXNldCQxNCk7XG4gICAgdGhpcy5yZWdpc3RlckRhbmNlKCdmb250Q29sb3InLCBmb250Q29sb3IsIHJlc2V0JDE1KTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKERhbmNlciwgW3tcbiAgICBrZXk6ICdyZWdpc3RlckRhbmNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVnaXN0ZXJEYW5jZSh0eXBlLCBkYW5jZSkge1xuICAgICAgdmFyIHJlc2V0JCQxID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgdGhpcy5kYW5jZXNbdHlwZV0gPSBkYW5jZTtcbiAgICAgIHRoaXMucmVzZXRzW3R5cGVdID0gcmVzZXQkJDE7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGFuY2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkYW5jZSh0eXBlLCBjbGFzc05hbWUsIHJhdGlvLCBvcHRpb25zKSB7XG4gICAgICB2YXIgZGFuY2UgPSB0eXBlO1xuICAgICAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAvL0luIGNhc2Ugb2YgYSBidWlsdCBpbiBkYW5jZVxuICAgICAgICBkYW5jZSA9IHRoaXMuZGFuY2VzW3R5cGVdIHx8IHRoaXMuZGFuY2VzWydwdWxzZSddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9JbiBjYXNlIG9mIGEgY3VzdG9tIGRhbmNlXG4gICAgICAgIGRhbmNlID0gdHlwZS5kYW5jZTtcbiAgICAgIH1cbiAgICAgIHZhciBlbGVtZW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lKTtcbiAgICAgIEFycmF5LmZyb20oZWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIGRhbmNlKGVsZW0sIHJhdGlvLCBvcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Jlc2V0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXQkJDEodHlwZSwgY2xhc3NOYW1lKSB7XG4gICAgICB2YXIgcmVzZXQkJDEgPSB0eXBlO1xuICAgICAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAvL0luIGNhc2Ugb2YgYSBidWlsdCBpbiBkYW5jZVxuICAgICAgICByZXNldCQkMSA9IHRoaXMucmVzZXRzW3R5cGVdIHx8IHRoaXMucmVzZXRzWydwdWxzZSddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9JbiBjYXNlIG9mIGEgY3VzdG9tIGRhbmNlXG4gICAgICAgIHJlc2V0JCQxID0gdHlwZS5yZXNldDtcbiAgICAgIH1cbiAgICAgIHZhciBlbGVtZW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lKTtcbiAgICAgIEFycmF5LmZyb20oZWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIHJlc2V0JCQxKGVsZW0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XSk7XG4gIHJldHVybiBEYW5jZXI7XG59KCk7XG5cbnZhciBkYW5jZXIgPSBuZXcgRGFuY2VyKCk7XG5cbnZhciBSeXRobSQxID0gZnVuY3Rpb24gUnl0aG0oZm9yY2VBdWRpb0NvbnRleHQpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBjbGFzc0NhbGxDaGVjayh0aGlzLCBSeXRobSk7XG5cbiAgdGhpcy5jb25uZWN0RXh0ZXJuYWxBdWRpb0VsZW1lbnQgPSBmdW5jdGlvbiAoYXVkaW9FbGVtZW50KSB7XG4gICAgcmV0dXJuIF90aGlzLnBsYXllci5jb25uZWN0RXh0ZXJuYWxBdWRpb0VsZW1lbnQoYXVkaW9FbGVtZW50KTtcbiAgfTtcblxuICB0aGlzLnNldE11c2ljID0gZnVuY3Rpb24gKHVybCkge1xuICAgIHJldHVybiBfdGhpcy5wbGF5ZXIuc2V0TXVzaWModXJsKTtcbiAgfTtcblxuICB0aGlzLnBsdWdNaWNyb3Bob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfdGhpcy5wbGF5ZXIucGx1Z01pY3JvcGhvbmUoKTtcbiAgfTtcblxuICB0aGlzLnNldEdhaW4gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gX3RoaXMucGxheWVyLnNldEdhaW4odmFsdWUpO1xuICB9O1xuXG4gIHRoaXMuY29ubmVjdFNvdXJjZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICByZXR1cm4gX3RoaXMucGxheWVyLmNvbm5lY3RTb3VyY2Uoc291cmNlKTtcbiAgfTtcblxuICB0aGlzLmFkZFJ5dGhtID0gZnVuY3Rpb24gKGVsZW1lbnRDbGFzcywgdHlwZSwgc3RhcnRWYWx1ZSwgbmJWYWx1ZSwgb3B0aW9ucykge1xuICAgIF90aGlzLnJ5dGhtcy5wdXNoKHtcbiAgICAgIGVsZW1lbnRDbGFzczogZWxlbWVudENsYXNzLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIHN0YXJ0VmFsdWU6IHN0YXJ0VmFsdWUsXG4gICAgICBuYlZhbHVlOiBuYlZhbHVlLFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgX3RoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgIF90aGlzLnBsYXllci5zdGFydCgpO1xuICAgIF90aGlzLmFuYWx5c2VyLnJlc2V0KCk7XG4gICAgX3RoaXMucmVuZGVyUnl0aG0oKTtcbiAgfTtcblxuICB0aGlzLnJlbmRlclJ5dGhtID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChfdGhpcy5zdG9wcGVkKSByZXR1cm47XG4gICAgX3RoaXMuYW5hbHlzZXIuYW5hbHlzZSgpO1xuICAgIF90aGlzLnJ5dGhtcy5mb3JFYWNoKGZ1bmN0aW9uIChtYXBwaW5nSXRlbSkge1xuICAgICAgdmFyIHR5cGUgPSBtYXBwaW5nSXRlbS50eXBlLFxuICAgICAgICAgIGVsZW1lbnRDbGFzcyA9IG1hcHBpbmdJdGVtLmVsZW1lbnRDbGFzcyxcbiAgICAgICAgICBuYlZhbHVlID0gbWFwcGluZ0l0ZW0ubmJWYWx1ZSxcbiAgICAgICAgICBzdGFydFZhbHVlID0gbWFwcGluZ0l0ZW0uc3RhcnRWYWx1ZSxcbiAgICAgICAgICBvcHRpb25zID0gbWFwcGluZ0l0ZW0ub3B0aW9ucztcblxuICAgICAgX3RoaXMuZGFuY2VyLmRhbmNlKHR5cGUsIGVsZW1lbnRDbGFzcywgX3RoaXMuYW5hbHlzZXIuZ2V0UmFuZ2VBdmVyYWdlUmF0aW8oc3RhcnRWYWx1ZSwgbmJWYWx1ZSksIG9wdGlvbnMpO1xuICAgIH0pO1xuICAgIF90aGlzLmFuaW1hdGlvbkZyYW1lUmVxdWVzdCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShfdGhpcy5yZW5kZXJSeXRobSk7XG4gIH07XG5cbiAgdGhpcy5yZXNldFJ5dGhtID0gZnVuY3Rpb24gKCkge1xuICAgIF90aGlzLnJ5dGhtcy5mb3JFYWNoKGZ1bmN0aW9uIChtYXBwaW5nSXRlbSkge1xuICAgICAgdmFyIHR5cGUgPSBtYXBwaW5nSXRlbS50eXBlLFxuICAgICAgICAgIGVsZW1lbnRDbGFzcyA9IG1hcHBpbmdJdGVtLmVsZW1lbnRDbGFzcyxcbiAgICAgICAgICBuYlZhbHVlID0gbWFwcGluZ0l0ZW0ubmJWYWx1ZSxcbiAgICAgICAgICBzdGFydFZhbHVlID0gbWFwcGluZ0l0ZW0uc3RhcnRWYWx1ZSxcbiAgICAgICAgICBvcHRpb25zID0gbWFwcGluZ0l0ZW0ub3B0aW9ucztcblxuICAgICAgX3RoaXMuZGFuY2VyLnJlc2V0KHR5cGUsIGVsZW1lbnRDbGFzcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5zdG9wID0gZnVuY3Rpb24gKGZyZWV6ZSkge1xuICAgIF90aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgIF90aGlzLnBsYXllci5zdG9wKCk7XG4gICAgaWYgKF90aGlzLmFuaW1hdGlvbkZyYW1lUmVxdWVzdCkgY2FuY2VsQW5pbWF0aW9uRnJhbWUoX3RoaXMuYW5pbWF0aW9uRnJhbWVSZXF1ZXN0KTtcbiAgICBpZiAoIWZyZWV6ZSkgX3RoaXMucmVzZXRSeXRobSgpO1xuICB9O1xuXG4gIHRoaXMucGxheWVyID0gbmV3IFBsYXllcihmb3JjZUF1ZGlvQ29udGV4dCk7XG4gIHRoaXMuYW5hbHlzZXIgPSBBbmFseXNlciQxO1xuICB0aGlzLm1heFZhbHVlSGlzdG9yeSA9IEFuYWx5c2VyJDEubWF4VmFsdWVIaXN0b3J5O1xuICB0aGlzLmRhbmNlciA9IGRhbmNlcjtcbiAgdGhpcy5yeXRobXMgPSBbXTtcbiAgdGhpcy5hZGRSeXRobSgncnl0aG0tYmFzcycsICdwdWxzZScsIDAsIDEwKTtcbiAgdGhpcy5hZGRSeXRobSgncnl0aG0tbWVkaXVtJywgJ3B1bHNlJywgMTUwLCA0MCk7XG4gIHRoaXMuYWRkUnl0aG0oJ3J5dGhtLWhpZ2gnLCAncHVsc2UnLCA0MDAsIDIwMCk7XG4gIHRoaXMuYW5pbWF0aW9uRnJhbWVSZXF1ZXN0ID0gdm9pZCAwO1xufTtcblxucmV0dXJuIFJ5dGhtJDE7XG5cbn0pKSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFJ5dGhtIGZyb20gJ3J5dGhtLmpzJztcblxubGV0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheS1idXR0b25cIik7XG5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHBsYXkpO1xuXG5mdW5jdGlvbiBwbGF5KCkge1xuICB2YXIgcnl0aG0gPSBuZXcgUnl0aG0oKTtcbiAgcnl0aG0uc2V0TXVzaWMoXCJzYW1wbGVzL3J5dGhtQy5tcDNcIik7XG4gIHJ5dGhtLnN0YXJ0KCk7XG4gIGNvbnNvbGUubG9nKFwicGxheVwiKTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==