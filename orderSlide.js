"use strict";

/*
 * Class OrderSlide
 *
 * [Arguments]
 * String boxSelector
 * String sliderSelector
 * Integer duration
 * Integer default_index
 *
 * [Variables]
 * JSon elem
 *   Element slideBox
 *   Element slider
 *   Array<Element> item
 * JSon data
 *   Integer duration
 *   Integer index
 *   Integer count
 *   Integer max
 *   Integer unit
 * Boolean isStop
 * Integer additionalDelay
 *
 * [Functions]
 * void set(Integer index, Boolean isDec, Integer duration)
 * void sortDec()
 * void sortInc()
 * void calcIndex()
 * void slide(String|Boolean direction, Integer duration)
 */
const OrderSlide = class {
	// boxSelector : 최상위 부모 요소 셀렉터, 외부 슬라이드 요소
	// sliderSelector : 2순위 부모 셀렉터, 움직이는 내부 슬라이드 요소
	// duration : 한 번 슬라이드에 걸리는 시간, 단위 ms
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
		// count : elem.item 개수
		// max : index의 최댓값
		// unit : elem.sliderBox의 width, slider가 이동할 수치, 단위 픽셀
		this.data = {
			duration: duration,
			index   : defaultIndex,
			count   : this.elem.item.length,
			// 순서로 인해 분리 #1
			max : null,
			unit: this.elem.slideBox.offsetWidth
		}
		// #1
		this.data.max = this.data.count - 1;
		
		// 슬라이드 중 클릭 방지 플래그
		this.isStop = true;
		// 슬라이드 간 추가 딜레이
		this.additionalDelay = 100;
		
		// 필수 스타일 적용
		for(let i = 0; i < this.data.count; i++) {
			this.elem.item[i].dataset.order = `${i}`;
		}
		this.elem.slideBox.style.position = "relative";
		this.elem.slideBox.style.overflowX = "hidden";
		this.elem.slider.style.position = "absolute";
		this.elem.slider.style.left = `${-this.data.unit}px`;
		this.elem.slider.style.transitionProperty = "left";
		
		this.elem.slider.addEventListener("transitionend", () => {
			this.isStop = true;
		});
		
		// defaultIndex에 따른 기본 위치 조정
		this.data.index++;
		this.calcIndex();
		this.sortDec();
		this.data.index--;
		this.calcIndex();
		this.elem.item[this.data.index].style.order = "2";
	}
	
	// index : 목적지의 index
	// isDec : 최소거리로 가기 위한 방향 지시자
	// duration : 이동 시간, 단위 ms
	// 특정 index로 이동하는 함수
	set(index, isDec = null, duration = null) {
		// 최소, 최댓값 조정
		index = (index < 0 ? 0 : index > this.data.max ? this.data.max : index) * 1;
		
		// straight / cross : 4 <-> 0 구간 경유시 cross, 아닐시 straight
		let distance = {
			straight: Math.abs(index - this.data.index),
			//	거리 0일때 동작하지 않도록 분리 #2
			cross: null
		}
		
		// 거리가 0 이상이면 실행
		if(distance.straight !== 0) {
			// 재귀 시작 전 변수 설정
			if(isDec == null || duration == null) {
				// #2
				// [dec]rement, [inc]rement
				distance.cross = {
					dec: this.data.count - index + this.data.index,
					inc: this.data.count + index - this.data.index
				};
				
				// 목적지 index가 현재 index보다 작은 경우
				if(index < this.data.index) {
					isDec = distance.straight < distance.cross.inc;
					duration = isDec ? distance.straight : distance.cross.inc;
				}else {
					isDec = distance.cross.dec < distance.straight;
					duration = isDec ? distance.cross.dec : distance.straight;
				}
				duration = this.data.duration / Math.min(3, Math.max(1, Math.log(duration) * 2));
			}
			
			// 슬라이드 후 재귀
			this.slide(isDec, duration);
			// setTimeout(() => {
			this.elem.slider.removeEventListener("transitionend", ()=>{});
			this.elem.slider.addEventListener("transitionend", () => {
				this.isStop = true;
				this.set(index, isDec, duration);
			});
			// }, duration);
		}
	}
	
	// 감소방향 슬라이드 전 정렬
	sortDec() {
		let flag = true;
		for(let i = 0; i < this.data.count; i++) {
			if(i === this.data.index) {
				this.elem.item[i].style.order = "3";
			}else if(i !== this.data.index - 1) {
				this.elem.item[i].style.order = flag ? "1" : "4";
				if(flag) flag = false;
			}
		}
	}
	
	// 증가방향 슬라이드 전 정렬
	sortInc() {
		this.elem.item.forEach(x => x.style.order = "3");
		this.elem.item[this.data.index].style.order = "1";
	}
	
	// index값을 범위에 맞게 순환(-1 -> [max], [max+1] -> 0) 조정
	calcIndex() {
		this.data.index = this.data.index < 0 ? this.data.max : this.data.index > this.data.max ? 0 : this.data.index;
	}
	
	// direction : 이동 방향 지시자
	// duration : 이동 시간
	// 슬라이드 1칸씩 이동
	slide(direction = false, duration = null) {
		if(this.isStop) {
			this.isStop = false;
			if(duration == null) {
				duration = this.data.duration;
			}
			
			// 정렬 후 방향에 맞게 index 이동
			switch(direction) {
				case "dec":
				case "decrease":
				case "decrement":
				case "minus":
				case "-":
				case "left":
				case "l":
				case "prev":
				case "previous":
				case true:
					direction = true;
					this.sortDec();
					this.data.index--;
					break;
				case "inc":
				case "increase":
				case "increment":
				case "plus":
				case "+":
				case "right":
				case "r":
				case "next":
				case false:
				default:
					direction = false;
					this.sortInc();
					this.data.index++;
					break;
			}
			
			// 목표 index에 해당하는 item 보여주기
			this.calcIndex();
			this.elem.item[this.data.index].style.order = "2";
			
			// 슬라이드 전 애니메이션 없이 이동
			this.elem.slider.style.transitionDuration = "0ms";
			this.elem.slider.style.left = direction ? `${-this.data.unit * 2}px` : "0px";
			setTimeout(() => {
				this.elem.slider.style.transitionDuration = `${duration}ms`;
				this.elem.slider.style.left = `${-this.data.unit}px`;
			});
			
			// 연속 입력 방지 변수 컨트롤
		}
	}
}