# OrderSlide
Flex박스의 Order 속성을 활용한 슬라이드 라이브러리입니다

A slide library using Order property of Flexbox

사용 예제 / usage example:
```
// 단일 / Single slide

const selectors = {
    box: "#slider_box",     // required
    slider: "#slider",      // required
    left: "#left",          // optional
    right: "#right"         // optional
}

// optional
const slide_option = {
    duration: 1500,     // optional
    defaultIndex: 0,    // optional
    autoSlide: 2000     // optional
};
// optional
// 개발자가 dot box 요소를 만들고 dot의 스타일을 설정해야 합니다
// developer need to create dot box element and set style of the dots
const dot_option = {
    selector: "#dots_box",  // required
    tag: "div",             // optional, default: div
    className: "moveTo",    // optional, default: dot
    flagName: "now"         // optional, default: on
};

const slide = new OrderSlide(selectors, slide_option, dot_option);

// 자동 슬라이드를 끕니다
// turn off auto slide
slide.autoSlide(false);

// 자동 슬라이드를 켭니다 ({n}ms 주기, true: 왼쪽 / false: 오른쪽)
// turn on auto slide (slide every {n}ms, true: left / false: right)
slide.autoSlide(1000, true);

// 왼쪽으로 {n}칸(없으면 1칸) 이동합니다
// slide {n} cells to left (1 cell if empty)
slide.left(2);
slide.left();

// 오른쪽으로 {n}칸(없으면 1칸) 이동합니다
// slide {n} cells to right (1 cell if empty)
slide.right(2);
slide.right();

// {n}번째 index의 칸으로 이동합니다 (0부터 시작)
// slide to cell which has {n}th index (count from 0)
slide.to(1);

// 다중 / Multiple slides

const slides =
[
    [
        { /* selector obj */ },
        { /* slide option obj */ },
        { /* dot option obj */ }
    ],
    [
        { /* selector obj */ },
        { /* slide option obj */ },
        { /* dot option obj */ }
    ],
    ... 
];

for(const index in slides) {
    slides[index] = new OrderSlide(...slides[index]);
}
```
