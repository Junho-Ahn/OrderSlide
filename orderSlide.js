/**
 * @author Junho Ahn <elliemion@gmail.com>
 * @version 1.1.0
 * @since 2021.3
 * @file written in es6+, pure JS
 */

class OrderSlide{
	#elem;
	#data;
	#isStop;
	#animate;
	#autoSlide;
	#maxOrder;
	
	/**
	 * @param {Object} selectorData
	 * @param slideOption
	 * @param dotOption
	 */
	constructor(selectorData, slideOption = null, dotOption = null){
		/**
		 * @constant
		 * @type {{ slideBox: Element, slider: Element, item: NodeListOf<Element>, left: Element|null, right: Element|null, dot: Object|null}}
		 * @description elem : 슬라이드에 사용하는 요소 정보
		 */
		this.#elem = {
			slideBox: document.querySelector(selectorData.box),
			slider: document.querySelector(selectorData.slider),
			item: document.querySelectorAll(selectorData.slider + ">*"),
			left: document.querySelector(selectorData.left),
			right: document.querySelector(selectorData.right),
			dot: null
		};
		
		/**
		 * @event onclick
		 * @description left & right 기능 부여
		 */
		this.#elem.left?.addEventListener("click", () => this.left());
		this.#elem.right?.addEventListener("click", () => this.right());
		
		/**
		 * @type {{index: (number), unit: number, duration: (number|string), timing: (string), autoSlide: (number), autoSlideDirection: (boolean)}}
		 * @description data : 슬라이드에 사용하는 변수 정보
		 */
		this.#data = {
			index: slideOption?.defaultIndex ?? 0,
			unit: this.#elem.slideBox.offsetWidth,
			duration: slideOption?.duration ?? 400,
			timing: slideOption?.timing ?? "ease",
			autoSlide: slideOption?.autoSlide ?? -1,
			autoSlideDirection: slideOption?.direction ?? false
		};
		
		/**
		 * @description timing이 Array인 경우 내용 개수에 따라 베지어 곡선(4~) / 기본값(~3)으로 적용
		 */
		if(typeof this.#data.timing === typeof []){
			if(this.#data.timing.length >= 4){
				this.#data.timing = `cubic-bezier(${this.#data.timing[0]}, ${this.#data.timing[1]}, ${this.#data.timing[2]}, ${this.#data.timing[3]})`;
			}else{
				this.#data.timing = "ease";
			}
		}
		
		/**
		 * @description autoSlide가 0 이상인 경우 자동 슬라이드 설정
		 */
		if(this.#data.autoSlide >= 0){
			this.autoSlide(this.#data.autoSlide, this.#data.autoSlideDirection);
		}
		
		/**
		 * @description dotOption이 null이 아닌 경우 dot 생성
		 */
		if(dotOption != null && Object.keys(dotOption).length > 0){
			this.#elem.dot = {
				box: document.querySelector(dotOption.selector),
				tag: dotOption.tag ?? "div",
				class: dotOption.className ?? "dot",
				flag: dotOption.flagName ?? "on"
			};
			
			/**
			 * @description dot 요소 추가
			 */
			for(let i = 0; i < this.#elem.item.length; i++){
				this.#elem.dot.box.innerHTML += `<${this.#elem.dot.tag} class="${this.#elem.dot.class}" data-index="${i}"></${this.#elem.dot.tag}>`;
			}
			
			/**
			 * @event onclick
			 * @description 클릭시 슬라이드 이동
			 */
			for(const dot of this.#elem.dot.box.querySelectorAll(`.${this.#elem.dot.class}`)){
				dot.addEventListener("click", e => {
					this.to(+e.currentTarget.dataset.index);
				});
			}
			
			/**
			 * @description 현재 슬라이드에 맞게 적용
			 */
			this.#colorizeDot();
		}
		
		/**
		 * @description isStop : 슬라이드 진행 중 여부
		 * @type {boolean}
		 */
		this.#isStop = true;
		
		/**
		 * @description animate : 애니메이션 여부
		 * @type {boolean}
		 */
		this.#animate = false;
		
		/**
		 * @description autoSlide : 자동 슬라이드 정보
		 * @type {null}
		 */
		this.#autoSlide = null;
		
		/**
		 * @description maxOrder : Order 속성 적용시 최댓값 설정
		 * @constant
		 * @type {number}
		 */
		this.#maxOrder = Math.floor(this.#elem.item.length / 2 + 1);
		
		/**
		 * @description slideBox에 [position: relative, overflow: hidden] 적용
		 * @type {string}
		 */
		this.#elem.slideBox.style.position = "relative";
		this.#elem.slideBox.style.overflowX = "hidden";
		/**
		 * @description slider에 [left: 0px, position: absolute, display: flex, transition: left {timing}, will-change: left] 적용
		 * @type {string}
		 */
		this.#elem.slider.style.left = "0px";
		this.#elem.slider.style.position = "absolute";
		this.#elem.slider.style.display = "flex";
		this.#elem.slider.style.transitionProperty = "left";
		this.#elem.slider.style.transitionTimingFunction = this.#data.timing;
		this.#elem.slider.style.willChange = "left";
		
		/**
		 * @description defaultIndex 적용
		 */
		this.#sortAsc().then();
		
		/**
		 * @description touchMove : 터치 슬라이드 left/right 판단용
		 * @type {null|number}
		 */
		this.touchMove = null;
		
		/**
		 * @event ontouchstart
		 * @description 터치 시작시 위치 저장
		 */
		this.#elem.slideBox.addEventListener("touchstart", e => {
			this.touchMove = e.changedTouches[0].clientX;
		});
		
		/**
		 * @event ontouchend
		 * @description 터치 종료시 위치와 시작시 위치 비교해 left/right 슬라이드
		 */
		this.#elem.slideBox.addEventListener("touchend", e => {
			this.touchMove -= e.changedTouches[0].clientX;
			if(this.touchMove > 0){
				this.right();
			}else if(this.touchMove < 0){
				this.left();
			}
		});
	}
	
	/**
	 * @description 현재 슬라이드에 해당하는 dot 색칠
	 */
	#colorizeDot(){
		if(this.#elem.dot != null){
			for(const dot of this.#elem.dot.box.querySelectorAll(`.${this.#elem.dot.class}`)){
				dot.classList.remove(this.#elem.dot.flag);
			}
			
			this.#elem.dot.box.querySelector(`.${this.#elem.dot.class}[data-index="${this.#data.index}"]`)
			    .classList
			    .add(this.#elem.dot.flag);
		}
	}
	
	/**
	 * @description [0 ~ item 개수] 사이로 value 조정, 범위 외인 경우 값 순환
	 * @param {number}value
	 * @returns {number}
	 */
	#rangeCycle(value){
		if(value >= this.#elem.item.length){
			value -= this.#elem.item.length;
		}
		
		if(value < 0){
			value += this.#elem.item.length;
		}
		
		return value;
	}
	
	/**
	 * @description [0 ~ 최대 index] 사이로 value 조정, 범위 외인 경우 가까운 값으로 변경
	 * @param {number}value
	 * @returns {number}
	 */
	#inRange(value){
		return Math.min(this.#elem.item.length - 1, Math.max(0, value));
	}
	
	/**
	 * @description count만큼 L->R로 오름차순 정렬, 나머지 오른쪽
	 * @param {number}count
	 * @returns {Promise<function>}
	 */
	#sortAsc(count = 0){
		return new Promise(resolve => {
			for(let i = 0; i < this.#elem.item.length; i++){
				this.#elem.item[this.#rangeCycle(this.#data.index + i)].style.order = `${i <= count ? i : this.#maxOrder}`;
			}
			
			this.#setAnimate(false);
			// 맨 왼쪽(현재 슬라이드)으로 이동
			this.#setView(0).then(() => resolve());
		});
	}
	
	/**
	 * @description count만큼 R->L로 내림차순 정렬, 나머지 오른쪽
	 * @param {number}count
	 * @returns {Promise<function>}
	 */
	#sortDesc(count = 0){
		return new Promise(resolve => {
			for(let i = 0; i < this.#elem.item.length; i++){
				this.#elem.item[this.#rangeCycle(this.#data.index - i)].style.order = `${i <= count ? count - i : this.#maxOrder}`;
			}
			
			this.#setAnimate(false);
			this.#setView(count).then(() => resolve());
		});
	}
	
	/**
	 * @description 슬라이드 이동
	 * @param {number}index
	 * @returns {Promise<function>}
	 */
	#setView(index){
		return new Promise(resolve => {
			this.#elem.slider.style.left = `-${this.#data.unit * index}px`;
			if(this.#animate){
				const transitionEnd = e => {
					if(e.propertyName !== "left") return;
					this.#elem.slider.removeEventListener("transitionend", transitionEnd);
					resolve();
				};
				
				this.#elem.slider.addEventListener("transitionend", transitionEnd);
			}else{
				setTimeout(() => resolve(), 25);
			}
		});
	}
	
	/**
	 * @description 애니메이션 여부 변경, true: 사용 / false: 미사용
	 * @param {boolean}yes
	 */
	#setAnimate(yes = true){
		this.#animate = yes;
		this.#elem.slider.style.transitionDuration = `${yes ? this.#data.duration : 0}ms`;
	}
	
	/**
	 * @description 슬라이드 잠금, 자동슬라이드 정지
	 */
	#startSlide(){
		this.#isStop = false;
		if(this.#autoSlide != null){
			clearInterval(this.#autoSlide.interval);
			this.#autoSlide.interval = setInterval(() => {
				this.#autoSlide.isLeft ? this.left() : this.right();
			}, this.#autoSlide.period + this.#data.duration);
		}
	}
	
	/**
	 * @description 자동 슬라이드 컨트롤
	 * @param {number|boolean}period number: [period]ms마다 자동 슬라이드, boolean: false인 경우 자동슬라이드 off 대응
	 * @param {boolean}goLeft true: 왼쪽, false: 오른쪽
	 */
	autoSlide(period, goLeft = false){
		if(!period && typeof period !== "number"){
			clearInterval(this.#autoSlide.interval);
		}else{
			this.#autoSlide = {
				period: period,
				isLeft: goLeft,
				interval: setInterval(() => {
					goLeft ? this.left() : this.right();
				}, period + this.#data.duration)
			};
		}
	}
	
	/**
	 * @description 왼쪽으로 이동
	 * @param {number}amount 이동하는 칸 수
	 */
	left(amount = 1){
		if(this.#isStop){
			amount = this.#inRange(amount);
			if(amount < 1){
				return;
			}
			
			this.#startSlide();
			this.#sortDesc(amount).then(() => {
				this.#data.index = this.#rangeCycle(this.#data.index - amount);
				this.#colorizeDot();
				this.#setAnimate();
				setTimeout(() => {
					this.#setView(0).then(() => {
						this.#isStop = true;
					});
				});
			});
		}
	}
	
	/**
	 * @description 오른쪽으로 이동
	 * @param {number}amount 이동하는 칸 수
	 */
	right(amount = 1){
		if(this.#isStop){
			amount = this.#inRange(amount);
			if(amount < 1){
				return;
			}
			
			this.#startSlide();
			this.#sortAsc(amount).then(() => {
				this.#data.index = this.#rangeCycle(this.#data.index + amount);
				this.#colorizeDot();
				this.#setAnimate();
				setTimeout(() => {
					this.#setView(amount).then(() => {
						this.#isStop = true;
					});
				});
			});
		}
	}
	
	/**
	 * @description 특정 칸으로 이동
	 * @param {number}index 이동할 index (0부터 시작)
	 */
	to(index){
		const difference = this.#inRange(index) - this.#data.index;
		if(difference === 0){
			return;
		}
		
		const straight = Math.abs(difference);
		const cross = this.#elem.item.length - straight;
		if(difference < 0){
			if(straight < cross){
				this.left(straight);
			}else{
				this.right(cross);
			}
		}else{
			if(straight < cross){
				this.right(straight);
			}else{
				this.left(cross);
			}
		}
	}
}
