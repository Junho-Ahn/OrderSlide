# OrderSlide

Flex박스의 Order 속성을 활용한 슬라이드 라이브러리입니다

A slide library using Order property of Flexbox

---

### 사용 예제 / usage example

- 스크립트 적용 / applying script

```html
<script src="orderSlide.js"></script>
```

- 슬라이드 생성 / Create slide

```js
const selectors = {
	box: "#slider_box",
	slider: "#slider",
	left: "#left",    // optional
	right: "#right"   // optional
}

// optional
const slide_option = {
	duration: 1500,             // optional
	defaultIndex: 0,            // optional
	autoSlide: 2000,            // optional
	autoSlideIsLeft: false      // optional
};

// optional
const dot_option = {
	box: "#dots_box",
	tag: "div",             // optional, default: div
	className: "moveTo",    // optional, default: dot
	flagName: "now"         // optional, default: on
};

const slide = new OrderSlide(selectors, slide_option, dot_option);
```

- 자동 슬라이드 / Auto slide On   
  (주기 / period, 왼쪽여부 / is left)
  (기본값 초기값 / default initial value)   
  지정시 값 저장 / keep the value(s) if set custom value(s) in args.
```js
slide.autoSlideOn(1000, true);
slide.autoSlideOn();
```

- 자동 슬라이드 / Auto slide Off

```js
slide.autoSlideOff();
```

- 왼쪽/오른쪽으로 이동(기본 1칸) / move to left/right (default 1)

```js
slide.left(2);
slide.left(); // 1

slide.right(2);
slide.right(); // 1
```

- 특정 index로 이동 / move to specific index

```js
slide.to(3);
```
