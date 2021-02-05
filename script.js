const dot_option = {
	selector: "#dots_box",
	tag: "div",
	className: "moveTo",
	flagName: "now"
};
const slide = new OrderSlide("#slider_box", "#slider", dot_option, 1500);
// slide.autoSlide(2000);
document.querySelector("#left").addEventListener("click", () => slide.left());
document.querySelector("#right").addEventListener("click", () => slide.right());
document.querySelector("#set").addEventListener("click", () => slide.to(document.querySelector("#index").value));