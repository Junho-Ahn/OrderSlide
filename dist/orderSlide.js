"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var OrderSlide = function () {
  function OrderSlide(boxSelector, sliderSelector) {
    var _this = this;

    var dotOption = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var duration = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 400;
    var defaultIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    _classCallCheck(this, OrderSlide);

    this.elem = {
      slideBox: document.querySelector(boxSelector),
      slider: document.querySelector(sliderSelector),
      dot: null,
      item: document.querySelectorAll(boxSelector + ">" + sliderSelector + ">*")
    };
    this.data = {
      index: defaultIndex,
      unit: this.elem.slideBox.offsetWidth,
      duration: duration
    };

    if (dotOption != null) {
      this.elem.dot = {
        box: document.querySelector(dotOption.selector),
        tag: dotOption.tag === undefined ? "div" : dotOption.tag,
        "class": dotOption.className === undefined ? "dot" : dotOption.className,
        flag: dotOption.flagName === undefined ? "on" : dotOption.flagName
      };

      for (var i = 0; i < this.elem.item.length; i++) {
        this.elem.dot.box.innerHTML += "<".concat(this.elem.dot.tag, " class=\"").concat(this.elem.dot["class"], "\" data-index=\"").concat(i, "\"></").concat(this.elem.dot.tag, ">");
      }

      var _iterator = _createForOfIteratorHelper(this.elem.dot.box.querySelectorAll(".".concat(this.elem.dot["class"]))),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var dot = _step.value;
          dot.addEventListener("click", function (e) {
            _this.to(e.target.dataset.index);
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.colorizeDot();
    }

    this.isStop = true;
    this.animate = false;
    this.elem.slideBox.style.position = "relative";
    this.elem.slideBox.style.overflowX = "hidden";
    this.elem.slider.style.left = "0px";
    this.elem.slider.style.position = "absolute";
    this.elem.slider.style.display = "flex";
    this.elem.slider.style.transitionProperty = "left";
    this.elem.slider.style.willChange = "left";
    this.sortAsc().then();
  }

  _createClass(OrderSlide, [{
    key: "colorizeDot",
    value: function colorizeDot() {
      if (this.elem.dot != null) {
        var _iterator2 = _createForOfIteratorHelper(this.elem.dot.box.querySelectorAll(".".concat(this.elem.dot["class"]))),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var dot = _step2.value;
            dot.classList.remove(this.elem.dot.flag);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        this.elem.dot.box.querySelector(".".concat(this.elem.dot["class"], "[data-index=\"").concat(this.data.index, "\"]")).classList.add(this.elem.dot.flag);
      }
    }
  }, {
    key: "rangeCycle",
    value: function rangeCycle(value) {
      if (value >= this.elem.item.length) {
        value -= this.elem.item.length;
      }

      if (value < 0) {
        value += this.elem.item.length;
      }

      return value;
    }
  }, {
    key: "inRange",
    value: function inRange(value) {
      return Math.min(this.elem.item.length - 1, Math.max(0, value));
    }
  }, {
    key: "sortAsc",
    value: function sortAsc() {
      var _this2 = this;

      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return new Promise(function (resolve) {
        for (var i = 0; i < _this2.elem.item.length; i++) {
          _this2.elem.item[_this2.rangeCycle(_this2.data.index + i)].style.order = "".concat(i <= count ? i : _this2.elem.item.length);
        }

        _this2.setAnimate(false);

        _this2.setView(0).then(function () {
          return resolve();
        });
      });
    }
  }, {
    key: "sortDesc",
    value: function sortDesc() {
      var _this3 = this;

      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return new Promise(function (resolve) {
        for (var i = 0; i < _this3.elem.item.length; i++) {
          _this3.elem.item[_this3.rangeCycle(_this3.data.index - i)].style.order = "".concat(i <= count ? _this3.elem.item.length - i - 1 : _this3.elem.item.length);
        }

        _this3.setAnimate(false);

        _this3.setView(count).then(function () {
          return resolve();
        });
      });
    }
  }, {
    key: "setView",
    value: function setView(index) {
      var _this4 = this;

      return new Promise(function (resolve) {
        _this4.elem.slider.style.left = "-".concat(_this4.data.unit * index, "px");

        if (_this4.animate) {
          var transitionEnd = function transitionEnd(e) {
            if (e.propertyName !== "left") return;

            _this4.elem.slider.removeEventListener('transitionend', transitionEnd);

            resolve();
          };

          _this4.elem.slider.addEventListener("transitionend", transitionEnd);
        } else {
          setTimeout(function () {
            return resolve();
          });
        }
      });
    }
  }, {
    key: "setAnimate",
    value: function setAnimate() {
      var yes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.animate = yes;
      this.elem.slider.style.transitionDuration = "".concat(yes ? this.data.duration : 0, "ms");
    }
  }, {
    key: "left",
    value: function left() {
      var _this5 = this;

      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (this.isStop) {
        amount = this.inRange(amount);

        if (amount < 1) {
          return;
        }

        this.isStop = false;
        this.sortDesc(amount).then(function () {
          _this5.data.index = _this5.rangeCycle(_this5.data.index - amount);

          _this5.colorizeDot();

          _this5.setAnimate();

          setTimeout(function () {
            _this5.setView(0).then(function () {
              _this5.isStop = true;
            });
          });
        });
      }
    }
  }, {
    key: "right",
    value: function right() {
      var _this6 = this;

      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (this.isStop) {
        amount = this.inRange(amount);

        if (amount < 1) {
          return;
        }

        this.isStop = false;
        this.sortAsc(amount).then(function () {
          _this6.data.index = _this6.rangeCycle(_this6.data.index + amount);

          _this6.colorizeDot();

          _this6.setAnimate();

          setTimeout(function () {
            _this6.setView(amount).then(function () {
              _this6.isStop = true;
            });
          });
        });
      }
    }
  }, {
    key: "to",
    value: function to(index) {
      var difference = this.inRange(index) - this.data.index;

      if (difference === 0) {
        return;
      }

      var straight = Math.abs(difference);
      var cross = this.elem.item.length - straight;

      if (difference < 0) {
        if (straight < cross) {
          this.left(straight);
        } else {
          this.right(cross);
        }
      } else {
        if (straight < cross) {
          this.right(straight);
        } else {
          this.left(cross);
        }
      }
    }
  }]);

  return OrderSlide;
}();
//# sourceMappingURL=orderSlide.js.map