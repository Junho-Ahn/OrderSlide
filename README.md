# OrderSlide
Flex박스의 Order 속성을 활용한 슬라이드 라이브러리입니다

A slide library using Order property of Flexbox

usage example:
```
const selectors = {
    box: "#slider_box",
    slider: "#slider",
    left: "#left",
    right: "#right"
}

const slide_option = {
    duration: 1500,
    defaultIndex: 0,
    autoSlide: 2000
};

const dot_option = {
    selector: "#dots_box",
    tag: "div",
    className: "moveTo",
    flagName: "now"
};

const slide = new OrderSlide(selectors, slide_option, dot_option);
```
