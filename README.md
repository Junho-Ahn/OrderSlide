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
