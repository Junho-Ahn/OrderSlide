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
const OrderSlide = class {
	// boxSelector : 최상위 부모 요소 셀렉터, 외부 슬라이드 요소
	// sliderSelector : 2순위 부모 셀렉터, 움직이는 내부 슬라이드 요소
	// duration : 한 번 슬라이드에 걸리는 시간, 단위 : ms
	// default_index : 기본으로 표시되는 요소의 순서, 0부터 시작
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
		// unit : elem.sliderBox의 width, slider의 index당 이동량, 단위 : px
		this.data = {
			index   : defaultIndex,
			unit    : this.elem.slideBox.offsetWidth,
			duration: duration
		}
		
		// 슬라이드 중 클릭 방지 플래그
		this.isStop = true;
		// 애니메이션 여부 플래그
		this.animate = false;
		
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
	}
	
	// value : 조정될 값
	// 범위 내에서 순환조정
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
	inRange(value) {
		return Math.min(this.elem.item.length - 1, Math.max(0, value));
	}
	
	// count : 정렬할 개수
	// 오름차순 정렬
	sortAsc(count = 0) {
		return new Promise(resolve => {
			for(let i = 0; i < this.elem.item.length; i++) {
				// 현재 슬라이드부터 count만큼 오름차순(L->R) 정렬, 나머지 오른쪽으로
				this.elem.item[this.rangeCycle(this.data.index + i)].style.order = `${i <= count ? i : this.elem.item.length}`;
			}
			this.setAnimate(false).then();
			// 맨 왼쪽(현재 슬라이드)으로 이동
			this.setView(0).then(() => resolve());
		});
	}
	
	// count : 정렬할 개수
	// 내림차순 정렬
	sortDesc(count = 0) {
		return new Promise(resolve => {
			for(let i = 0; i < this.elem.item.length; i++) {
				// 현재 슬라이드부터 count만큼 내림차순(R->L) 정렬, 나머지 오른쪽으로
				this.elem.item[this.rangeCycle(this.data.index - i)].style.order = `${i <= count ? this.elem.item.length - i - 1 : this.elem.item.length}`;
			}
			this.setAnimate(false).then();
			// 현재 슬라이드로 이동
			this.setView(count).then(() => resolve());
		});
	}
	
	// index : 목표 슬라이드의 index
	// 슬라이드 위치 이동
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
				setTimeout(() => resolve());
			}
		});
	}
	
	// yes : 애니메이션 여부
	// 애니메이션 On/Off 조정
	setAnimate(yes = true) {
		return new Promise(resolve => {
			this.animate = yes;
			this.elem.slider.style.transitionDuration = `${yes ? this.data.duration : 0}ms`;
			setTimeout(() => resolve());
		});
	}
	
	// amount : 이동하는 index 수
	// 왼쪽으로 슬라이드
	left(amount = 1) {
		if(this.isStop) {
			amount = this.inRange(amount);
			if(amount < 1)
				return;
			// 이동 잠금
			this.isStop = false;
			// 이동할 만큼 정렬
			this.sortDesc(amount).then(() => {
				this.data.index = this.rangeCycle(this.data.index - amount);
				// 이동 후 이동 잠금 해제
				this.setAnimate().then(() => {
					this.setView(0).then(() => {
						this.isStop = true;
					});
				});
			});
		}
	}
	
	// amount : 이동하는 index 수
	// 오른쪽으로 슬라이드
	right(amount = 1) {
		if(this.isStop) {
			amount = this.inRange(amount);
			if(amount < 1)
				return;
			// 이동 잠금
			this.isStop = false;
			// 이동할 만큼 정렬
			this.sortAsc(amount).then(() => {
				this.data.index = this.rangeCycle(this.data.index + amount);
				// 이동 후 이동 잠금 해제
				this.setAnimate().then(() => {
					this.setView(amount).then(() => {
						this.isStop = true;
					});
				});
			});
		}
	}
	
	// index : 이동할 슬라이드의 index
	// 특정 index로 슬라이드
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