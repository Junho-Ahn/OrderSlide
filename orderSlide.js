"use strict";

const OrderSlide = class {
	constructor(boxSelector, sliderSelector = "*", duration = 400, defaultIndex = 0) {
		// slideBox : 최상위 부모
		// slider : 2순위 부모
		// item : 자식(최소 3개 필요)
		this.elem = {
			slideBox: document.querySelector(boxSelector),
			slider  : document.querySelector(boxSelector + ">" + sliderSelector),
			item    : document.querySelectorAll(boxSelector + ">" + sliderSelector + ">*")
		};
		
		// duration : Argument
		// index : Argument
		// unit : elem.sliderBox의 width, slider가 이동할 수치, 단위 픽셀
		this.data = {
			index   : defaultIndex,
			unit    : this.elem.slideBox.offsetWidth,
			duration: duration
		}
		
		// 슬라이드 중 클릭 방지 플래그
		this.isStop = true;
		// 트랜지션 인식용 플래그
		this.animate = false;
		
		// 필수 스타일 적용
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
		return new Promise(resolve => {
			console.log("sort Ascending");
			for(let i = 0; i < this.elem.item.length; i++) {
				this.elem.item[this.rangeCycle(this.data.index + i)].style.order = `${i <= count ? i : this.elem.item.length}`;
			}
			this.setAnimate(false).then();
			this.setView(0).then(() => resolve());
		});
	}
	
	sortDesc(count) {
		return new Promise(resolve => {
			console.log("sort Descending");
			for(let i = 0; i < this.elem.item.length; i++) {
				this.elem.item[this.rangeCycle(this.data.index - i)].style.order = `${i <= count ? this.elem.item.length - i - 1 : this.elem.item.length}`;
			}
			this.setAnimate(false).then();
			this.setView(count).then(() => resolve());
		});
	}
	
	setView(index) {
		return new Promise(resolve => {
			console.log(`set view to ${index}`);
			this.elem.slider.style.left = `-${this.data.unit * index}px`;
			if(this.animate) {
				const transitionEnd = e => {
					if(e.propertyName !== "left") return;
					this.elem.slider.removeEventListener('transitionend', transitionEnd);
					resolve();
				}
				this.elem.slider.addEventListener("transitionend", transitionEnd);
			}else {
				setTimeout(() => resolve(), 0);
			}
		});
	}
	
	setAnimate(yes = true) {
		return new Promise(resolve => {
			console.log("animate : " + yes);
			this.animate = yes;
			this.elem.slider.style.transitionDuration = `${yes ? this.data.duration : 0}ms`;
			setTimeout(() => resolve(), 0);
		});
	}
	
	left(amount) {
		if(this.isStop) {
			amount = this.inRange(amount);
			this.isStop = false;
			console.log("");
			this.sortDesc(amount).then(() => {
				this.data.index = this.rangeCycle(this.data.index - amount);
				this.setAnimate().then(() => {
					this.setView(0).then(() => {
						this.isStop = true;
						console.log("");
					});
				});
			});
		}
	}
	
	right(amount) {
		if(this.isStop) {
			amount = this.inRange(amount);
			this.isStop = false;
			console.log("");
			this.sortAsc(amount).then(() => {
				this.data.index = this.rangeCycle(this.data.index + amount);
				this.setAnimate().then(() => {
					this.setView(amount).then(() => {
						this.isStop = true;
						console.log("");
					});
				});
			});
		}
	}
	
	to(index) {
		const difference = index - this.data.index;
		if(difference === 0) {
			return;
		}
		const straight = Math.abs(difference);
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