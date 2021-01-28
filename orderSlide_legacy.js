"use strict";

/*
 * Class OrderSlide
 *
 * [Arguments]
 * String boxSelector
 * String sliderSelector
 * Integer duration
 * Integer defaultIndex
 *
 * [Variables]
 * JSon elem
 *   Element slideBox
 *   Element slider
 *   Array<Element> item
 * JSon data
 *   Integer index
 *   Integer unit
 *   Integer duration
 * Boolean isStop
 * Boolean animate
 *
 * [Functions]
 * Integer rangeCycle(Integer value)
 * Integer inRange(Integer value)
 * Promise sortAsc(Integer count)
 * Promise sortDesc(Integer count)
 * Promise setView(Integer index)
 * Promise setAnimate(Boolean yes)
 * Void left(Integer amount)
 * Void right(Integer amount)
 * Void to(Integer index)
 *
 */
var OrderSlide = class {
	
	
	constructor(boxSelector, sliderSelector = "*", duration = 400, defaultIndex = 0) {
		
		
		this.elem = {
			slideBox: document.querySelector(boxSelector),
			slider  : document.querySelector(boxSelector + ">" + sliderSelector),
			item    : document.querySelectorAll(boxSelector + ">" + sliderSelector + ">*")
		};
		
		
		this.data = {
			index   : defaultIndex,
			unit    : this.elem.slideBox.offsetWidth,
			duration: duration
		};
		
		this.isStop = true;
		
		this.animate = false;
		
		this.elem.slideBox.style.position = "relative";
		this.elem.slideBox.style.overflowX = "hidden";
		this.elem.slider.style.left = "0px";
		this.elem.slider.style.position = "absolute";
		this.elem.slider.style.display = "flex";
		this.elem.slider.style.transitionProperty = "left";
		
		this.sortAsc().then();
	}
	
	
	rangeCycle(value) {
		if(value >= this.elem.item.length) {
			value -= this.elem.item.length;
		}
		
		if(value < 0) {
			value += this.elem.item.length;
		}
		
		return value;
	}
	
	
	inRange(value) {
		return Math.min(this.elem.item.length - 1, Math.max(0, value));
	}
	
	
	sortAsc(count = 0) {
		var _this = this;
		
		return new Promise(function(resolve) {
			for(var i = 0; i < _this.elem.item.length; i++) {
				
				_this.elem.item[_this.rangeCycle(_this.data.index + i)].style.order = `${i <= count ? i : _this.elem.item.length}`;
			}
			
			_this.setAnimate(false).then();
			
			
			_this.setView(0).then(function() {
				return resolve();
			});
		});
	}
	
	
	sortDesc(count = 0) {
		var _this2 = this;
		
		return new Promise(function(resolve) {
			for(var i = 0; i < _this2.elem.item.length; i++) {
				
				_this2.elem.item[_this2.rangeCycle(_this2.data.index - i)].style.order = `${i <= count ? _this2.elem.item.length - i - 1 : _this2.elem.item.length}`;
			}
			
			_this2.setAnimate(false).then();
			
			
			_this2.setView(count).then(function() {
				return resolve();
			});
		});
	}
	
	
	setView(index) {
		var _this3 = this;
		
		return new Promise(function(resolve) {
			_this3.elem.slider.style.left = `-${_this3.data.unit * index}px`;
			
			if(_this3.animate) {
				
				
				var transitionEnd = function(e) {
					if(e.propertyName !== "left") return;
					
					_this3.elem.slider.removeEventListener('transitionend', transitionEnd);
					
					resolve();
				};
				
				_this3.elem.slider.addEventListener("transitionend", transitionEnd);
			}else {
				
				setTimeout(function() {
					return resolve();
				});
			}
		});
	}
	
	
	setAnimate(yes = true) {
		var _this4 = this;
		
		return new Promise(function(resolve) {
			_this4.animate = yes;
			_this4.elem.slider.style.transitionDuration = `${yes ? _this4.data.duration : 0}ms`;
			setTimeout(function() {
				return resolve();
			});
		});
	}
	
	
	left(amount) {
		var _this5 = this;
		
		if(this.isStop) {
			amount = this.inRange(amount);
			
			this.isStop = false;
			
			this.sortDesc(amount).then(function() {
				_this5.data.index = _this5.rangeCycle(_this5.data.index - amount);
				
				_this5.setAnimate().then(function() {
					_this5.setView(0).then(function() {
						_this5.isStop = true;
					});
				});
			});
		}
	}
	
	
	right(amount) {
		var _this6 = this;
		
		if(this.isStop) {
			amount = this.inRange(amount);
			
			this.isStop = false;
			
			this.sortAsc(amount).then(function() {
				_this6.data.index = _this6.rangeCycle(_this6.data.index + amount);
				
				_this6.setAnimate().then(function() {
					_this6.setView(amount).then(function() {
						_this6.isStop = true;
					});
				});
			});
		}
	}
	
	
	to(index) {
		var difference = this.inRange(index) - this.data.index;
		
		if(difference === 0) {
			return;
		}
		
		
		var straight = Math.abs(difference);
		
		var cross = this.elem.item.length - straight;
		
		if(difference < 0) {
			if(straight < cross) {
				this.left(straight);
			}else {
				this.right(cross);
			}
		}else {
			if(straight < cross) {
				this.right(straight);
			}else {
				this.left(cross);
			}
		}
	}
	
};