/*
 * Class OrderSlide
 *
 * [Arguments]
 * String boxSelector
 * String sliderSelector
 * JSon dotOption
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
 * Void colorizeDot()
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

/**
 * @author Junho Ahn <elliemion@gmail.com>
 * @version 1.0.0
 * @file es6+
 */

/**
 * @class OrderSlide
 * @type {OrderSlide}
 * @param {string} boxSelector
 * @param {string} sliderSelector
 * @param {{flag: string, box: Element, tag: string, class: string}} dotOption - optional
 * @param {number} duration - optional
 * @param {number} defaultIndex - optional
 */
const OrderSlide = class {
	// boxSelector : 최상위 부모 요소 셀렉터, 외부 슬라이드 요소
	// sliderSelector : 2순위 부모 셀렉터, 움직이는 내부 슬라이드 요소
	// dotOption : 도트 생성 옵션
	// duration : 한 번 슬라이드에 걸리는 시간, 단위 : ms
	// default_index : 기본으로 표시되는 요소의 순서, 0부터 시작
	constructor(boxSelector, sliderSelector, dotOption = null, duration = 400, defaultIndex = 0) {
		// slideBox : 최상위 부모
		// slider : 2순위 부모
		// item : 자식
		/**
		 *
		 * @type {{slider: Element, item: NodeListOf<Element>, dot: Object, slideBox: Element}}
		 */
		this.elem = {
			slideBox: document.querySelector(boxSelector),
			slider  : document.querySelector(sliderSelector),
			dot     : null,
			item    : document.querySelectorAll(boxSelector + ">" + sliderSelector + ">*")
		};
		
		// duration : Argument
		// index : Argument
		// unit : elem.sliderBox의 width, slider의 index당 이동량, 단위 : px
		/**
		 *
		 * @type {{duration: number, unit: number, index: number}}
		 */
		this.data = {
			index   : defaultIndex,
			unit    : this.elem.slideBox.offsetWidth,
			duration: duration
		};
		
		// 도트 생성
		if(dotOption != null) {
			/**
			 *
			 * @type {{flag: string, box: Element, tag: string, class: string}}
			 */
			this.elem.dot = {
				box  : document.querySelector(dotOption.selector),
				tag  : dotOption.tag ?? "div",
				class: dotOption.className ?? "dot",
				flag : dotOption.flagName ?? "on"
			};
			for(let i = 0; i < this.elem.item.length; i++) {
				this.elem.dot.box.innerHTML += `<${this.elem.dot.tag} class="${this.elem.dot.class}" data-index="${i}"></${this.elem.dot.tag}>`;
			}
			for(const dot of this.elem.dot.box.querySelectorAll(`.${this.elem.dot.class}`)) {
				dot.addEventListener("click", e => {
					this.to(e.target.dataset.index);
				});
			}
			this.colorizeDot();
		}
		
		// 슬라이드 중 클릭 방지 플래그
		/**
		 * @description block another slide while sliding
		 * @type {boolean}
		 */
		this.isStop = true;
		
		// 애니메이션 여부 플래그
		/**
		 * @description true:do or false:do not animate
		 * @type {boolean}
		 */
		this.animate = false;
		
		/**
		 *
		 * @type null|{{period: number, isLeft: boolean, interval: number}}
		 */
		this.autoSlideInterval = null;
		
		// 필수 스타일 적용
		this.elem.slideBox.style.position = "relative";
		this.elem.slideBox.style.overflowX = "hidden";
		this.elem.slider.style.left = "0px";
		this.elem.slider.style.position = "absolute";
		this.elem.slider.style.display = "flex";
		this.elem.slider.style.transitionProperty = "left";
		this.elem.slider.style.willChange = "left";
		
		// defaultIndex 적용
		this.sortAsc().then();
		
		this.touchMove = null;
		
		this.elem.slideBox.addEventListener("touchstart", e => {
			this.touchMove = e.changedTouches[0].clientX;
		});
		
		this.elem.slideBox.addEventListener("touchend", e => {
			this.touchMove -= e.changedTouches[0].clientX;
			if(this.touchMove > 0) {
				this.right();
			}else if(this.touchMove < 0) {
				this.left();
			}
		});
	}
	
	/**
	 * @this OrderSlide
	 * @param {number|boolean} period - slider every [period] seconds. or turn off auto slide(when period = false)
	 * @param {boolean} goLeft - true: left, false: right
	 * @description set auto slide
	 */
	autoSlide(period, goLeft = false) {
		if(!period) {
			clearInterval(this.autoSlideInterval.interval);
		}else {
			this.autoSlideInterval = {
				period: period,
				isLeft: goLeft
			}
			this.autoSlideInterval.interval = setInterval(() => {
				this.autoSlideInterval.isLeft ? this.left() : this.right();
			}, this.autoSlideInterval.period + this.data.duration);
		}
	}
	
	// 현재 index에 해당하는 도트에 클래스 부여
	/**
	 * @this OrderSlide
	 * @description set activate as class on dot of current index
	 */
	colorizeDot() {
		if(this.elem.dot != null) {
			for(const dot of this.elem.dot.box.querySelectorAll(`.${this.elem.dot.class}`)) {
				dot.classList.remove(this.elem.dot.flag);
			}
			this.elem.dot.box.querySelector(`.${this.elem.dot.class}[data-index="${this.data.index}"]`)
			    .classList
			    .add(this.elem.dot.flag);
		}
	}
	
	// value : 조정될 값
	// 범위 내에서 순환조정
	/**
	 * @this OrderSlide
	 * @description change value to be in range. if the value is the end of range, set as another end
	 * @param {number} value
	 * @returns {number} value
	 */
	rangeCycle(value) {
		if(value >= this.elem.item.length) {
			value -= this.elem.item.length;
		}
		if(value < 0) {
			value += this.elem.item.length;
		}
		return value;
	}
	
	// value : 조정될 값
	// 범위 내로 들어오도록 조정
	/**
	 * @this OrderSlide
	 * @description change value to be in range. if the value is the end of range, set as max or min of the range
	 * @param {number} value
	 * @returns {number}
	 */
	inRange(value) {
		return Math.min(this.elem.item.length - 1, Math.max(0, value));
	}
	
	// count : 정렬할 개수
	// 오름차순 정렬
	/**
	 * @this OrderSlide
	 * @description sort items by count in ascending order
	 * @param {number} count
	 * @returns {Promise<*>}
	 */
	sortAsc(count = 0) {
		return new Promise(resolve => {
			for(let i = 0; i < this.elem.item.length; i++) {
				// 현재 슬라이드부터 count만큼 오름차순(L->R) 정렬, 나머지 오른쪽으로
				this.elem.item[this.rangeCycle(this.data.index + i)].style.order = `${i <= count ? i : this.elem.item.length}`;
			}
			this.setAnimate(false);
			// 맨 왼쪽(현재 슬라이드)으로 이동
			this.setView(0).then(() => resolve());
		});
	}
	
	// count : 정렬할 개수
	// 내림차순 정렬
	/**
	 * @this OrderSlide
	 * @description sort items by count in descending order
	 * @param {number} count
	 * @returns {Promise<VoidFunction>}
	 */
	sortDesc(count = 0) {
		return new Promise(resolve => {
			for(let i = 0; i < this.elem.item.length; i++) {
				// 현재 슬라이드부터 count만큼 내림차순(R->L) 정렬, 나머지 오른쪽으로
				this.elem.item[this.rangeCycle(this.data.index - i)].style.order = `${i <= count ? count - i : this.elem.item.length}`;
			}
			this.setAnimate(false);
			// 현재 슬라이드로 이동
			this.setView(count).then(() => resolve());
		});
	}
	
	// index : 목표 슬라이드의 index
	// 슬라이드 위치 이동
	/**
	 * @this OrderSlide
	 * @description move slide position to [index]
	 * @param {number} index
	 * @returns {Promise<*>}
	 */
	setView(index) {
		return new Promise(resolve => {
			this.elem.slider.style.left = `-${this.data.unit * index}px`;
			if(this.animate) {
				// 애니메이션 이동
				// 애니메이션 종료 감지
				const transitionEnd = e => {
					if(e.propertyName !== "left") return;
					this.elem.slider.removeEventListener('transitionend', transitionEnd);
					resolve();
				}
				this.elem.slider.addEventListener("transitionend", transitionEnd);
			}else {
				// 즉시 이동
				setTimeout(() => resolve(), 25);
			}
		});
	}
	
	// yes : 애니메이션 여부
	// 애니메이션 On/Off 조정
	/**
	 * @this OrderSlide
	 * @description turn on or off animate
	 * @param {boolean} yes - true: turn on animate when move index false: turn off animate
	 */
	setAnimate(yes = true) {
		this.animate = yes;
		this.elem.slider.style.transitionDuration = `${yes ? this.data.duration : 0}ms`;
	}
	
	startSlide() {
		// 이동 잠금
		this.isStop = false;
		if(this.autoSlideInterval != null) {
			clearInterval(this.autoSlideInterval.interval);
			this.autoSlideInterval.interval = setInterval(() => {
				this.autoSlideInterval.isLeft ? this.left() : this.right();
			}, this.autoSlideInterval.period + this.data.duration);
		}
	}
	
	// amount : 이동하는 index 수
	// 왼쪽으로 슬라이드
	/**
	 * @this OrderSlide
	 * @description slide left [amount] indexes
	 * @param {number} amount
	 */
	left(amount = 1) {
		if(this.isStop) {
			amount = this.inRange(amount);
			if(amount < 1) {
				return;
			}
			this.startSlide();
			// 이동할 만큼 정렬
			this.sortDesc(amount).then(() => {
				this.data.index = this.rangeCycle(this.data.index - amount);
				this.colorizeDot();
				// 이동 후 이동 잠금 해제
				this.setAnimate();
				setTimeout(() => {
					this.setView(0).then(() => {
						this.isStop = true;
					});
				});
			});
		}
	}
	
	// amount : 이동하는 index 수
	// 오른쪽으로 슬라이드
	/**
	 * @this OrderSlide
	 * @description slide right [amount] indexes
	 * @param {number} amount
	 */
	right(amount = 1) {
		if(this.isStop) {
			amount = this.inRange(amount);
			if(amount < 1) {
				return;
			}
			this.startSlide();
			// 이동할 만큼 정렬
			this.sortAsc(amount).then(() => {
				this.data.index = this.rangeCycle(this.data.index + amount);
				this.colorizeDot();
				// 이동 후 이동 잠금 해제
				this.setAnimate();
				setTimeout(() => {
					this.setView(amount).then(() => {
						this.isStop = true;
					});
				});
			});
		}
	}
	
	// index : 이동할 슬라이드의 index
	// 특정 index로 슬라이드
	/**
	 * @this OrderSlide
	 * @description slide to [index]
	 * @param {string} index
	 */
	to(index) {
		const difference = this.inRange(index) - this.data.index;
		if(difference === 0) {
			return;
		}
		
		// 현재 -> 목표 거리
		const straight = Math.abs(difference);
		// 4 <-> 0 경유하는 거리
		const cross = this.elem.item.length - straight;
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
}
