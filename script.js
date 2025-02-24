class Calculator {
  constructor() {
    this.currentOperand = "0";
    this.previousOperand = "";
    this.operation = undefined;
    this.memory = 0;
    this.history = [];
    this.isScientific = false;
    this.precision = 10; // Decimal precision for scientific calculations
    this.degreeMode = true; // true for degrees, false for radians

    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.displayResult = document.querySelector(".result");
    this.displayExpression = document.querySelector(".expression");
    this.memoryIndicator = document.querySelector(".memory-indicator");
    this.buttons = document.querySelector(".buttons");
    this.historyList = document.querySelector(".history-list");
    this.scientificButtons = document.querySelector(".scientific-buttons");
  }

  setupEventListeners() {
    document.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => this.handleButton(button));
    });

    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    document.querySelector(".toggle-sci").addEventListener("click", () => {
      this.isScientific = !this.isScientific;
      this.scientificButtons.classList.toggle("hidden");
    });

    document.querySelector(".toggle-history").addEventListener("click", () => {
      document.querySelector(".history-panel").classList.toggle("hidden");
    });

    document.querySelector(".toggle-angle").addEventListener("click", () => {
      this.toggleAngleMode();
    });
  }

  handleButton(button) {
    const text = button.textContent;

    if (button.classList.contains("digit")) {
      this.appendNumber(text);
    } else if (button.classList.contains("operator")) {
      this.handleOperator(text);
    } else if (button.classList.contains("equals")) {
      this.calculate();
    } else if (button.classList.contains("clear")) {
      this.clear();
    } else if (button.classList.contains("memory")) {
      this.handleMemory(text);
    } else if (button.classList.contains("sci-op")) {
      this.handleScientific(text);
    }

    this.updateDisplay();
  }

  appendNumber(number) {
    if (number === "." && this.currentOperand.includes(".")) return;
    this.currentOperand =
      this.currentOperand === "0" ? number : this.currentOperand + number;
  }

  handleOperator(operator) {
    if (this.currentOperand === "") return;
    if (this.previousOperand !== "") {
      this.calculate();
    }
    this.operation = operator;
    this.previousOperand = this.currentOperand;
    this.currentOperand = "";
  }

  calculate() {
    try {
      if (this.operation === "^") {
        const base = parseFloat(this.previousOperand);
        const exponent = parseFloat(this.currentOperand);
        const result = Math.pow(base, exponent);
        this.currentOperand = this.formatResult(result);
        this.previousOperand = "";
        this.operation = undefined;
        return;
      }

      let computation;
      const prev = parseFloat(this.previousOperand);
      const current = parseFloat(this.currentOperand);

      if (isNaN(prev) || isNaN(current)) return;

      switch (this.operation) {
        case "+":
          computation = prev + current;
          break;
        case "-":
          computation = prev - current;
          break;
        case "×":
          computation = prev * current;
          break;
        case "÷":
          computation = prev / current;
          break;
        case "%":
          computation = prev * (current / 100);
          break;
        default:
          return;
      }

      const expression = `${prev} ${this.operation} ${current} = ${computation}`;
      this.addToHistory(expression);

      this.currentOperand = computation.toString();
      this.operation = undefined;
      this.previousOperand = "";
    } catch (error) {
      this.displayError(error.message);
    }
  }

  handleScientific(operation) {
    try {
      const num = parseFloat(this.currentOperand);
      let result;

      switch (operation) {
        case "sin":
          result = this.degreeMode
            ? Math.sin(this.toRadians(num))
            : Math.sin(num);
          break;
        case "cos":
          result = this.degreeMode
            ? Math.cos(this.toRadians(num))
            : Math.cos(num);
          break;
        case "tan":
          result = this.degreeMode
            ? Math.tan(this.toRadians(num))
            : Math.tan(num);
          break;
        case "x²":
          result = Math.pow(num, 2);
          break;
        case "xʸ":
          this.handleOperator("^");
          return;
        case "√":
          if (num < 0) throw new Error("Invalid input for square root");
          result = Math.sqrt(num);
          break;
        case "π":
          result = Math.PI;
          break;
        case "e":
          result = Math.E;
          break;
        case "ln":
          if (num <= 0) throw new Error("Invalid input for natural log");
          result = Math.log(num);
          break;
        case "log":
          if (num <= 0) throw new Error("Invalid input for log");
          result = Math.log10(num);
          break;
        case "(":
        case ")":
          this.handleParenthesis(operation);
          return;
        case "sin⁻¹":
          if (num < -1 || num > 1) throw new Error("Invalid input for arcsin");
          result = this.degreeMode
            ? this.toDegrees(Math.asin(num))
            : Math.asin(num);
          break;
        case "cos⁻¹":
          if (num < -1 || num > 1) throw new Error("Invalid input for arccos");
          result = this.degreeMode
            ? this.toDegrees(Math.acos(num))
            : Math.acos(num);
          break;
        case "tan⁻¹":
          result = this.degreeMode
            ? this.toDegrees(Math.atan(num))
            : Math.atan(num);
          break;
        case "sinh":
          result = Math.sinh(num);
          break;
        case "cosh":
          result = Math.cosh(num);
          break;
        case "tanh":
          result = Math.tanh(num);
          break;
        case "x³":
          result = Math.pow(num, 3);
          break;
        case "x!":
          if (num < 0 || !Number.isInteger(num))
            throw new Error("Invalid input for factorial");
          result = this.factorial(num);
          break;
        case "|x|":
          result = Math.abs(num);
          break;
        case "rand":
          result = Math.random();
          break;
      }

      if (result !== undefined) {
        result = this.formatResult(result);
        const expression = `${operation}(${this.currentOperand})`;
        this.addToHistory(`${expression} = ${result}`);
        this.currentOperand = result.toString();
        this.updateDisplay();
      }
    } catch (error) {
      this.displayError(error.message);
    }
  }

  handleMemory(operation) {
    const current = parseFloat(this.currentOperand);

    switch (operation) {
      case "MC":
        this.memory = 0;
        break;
      case "MR":
        this.currentOperand = this.memory.toString();
        break;
      case "M+":
        this.memory += current;
        break;
      case "M-":
        this.memory -= current;
        break;
    }

    this.memoryIndicator.classList.toggle("memory-active", this.memory !== 0);
  }

  addToHistory(expression) {
    this.history.unshift(expression);
    if (this.history.length > 10) this.history.pop();
    this.updateHistory();
  }

  updateHistory() {
    this.historyList.innerHTML = this.history
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  clear() {
    this.currentOperand = "0";
    this.previousOperand = "";
    this.operation = undefined;
  }

  updateDisplay() {
    this.displayResult.textContent = this.currentOperand;
    this.displayExpression.textContent =
      this.previousOperand + (this.operation ? " " + this.operation : "");
  }

  handleKeyboard(e) {
    if (/[0-9]/.test(e.key)) {
      this.appendNumber(e.key);
    } else if (["+", "-", "*", "/"].includes(e.key)) {
      const opMap = { "*": "×", "/": "÷" };
      this.handleOperator(opMap[e.key] || e.key);
    } else if (e.key === "Enter") {
      this.calculate();
    } else if (e.key === "Escape") {
      this.clear();
    }
    this.updateDisplay();
  }

  formatResult(number) {
    if (isNaN(number)) throw new Error("Invalid calculation");
    if (!isFinite(number)) throw new Error("Result is infinity");

    // Handle very large and very small numbers
    if (Math.abs(number) > 1e12 || (Math.abs(number) < 1e-7 && number !== 0)) {
      return number.toExponential(this.precision);
    }

    // Convert to fixed precision and remove trailing zeros
    return parseFloat(number.toFixed(this.precision))
      .toString()
      .replace(/\.?0+$/, "");
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  displayError(message) {
    this.currentOperand = "Error";
    this.displayExpression.textContent = message;
    setTimeout(() => {
      this.clear();
    }, 2000);
  }

  handleParenthesis(parenthesis) {
    // Implementation for parentheses handling can be added here
    // This would require expression parsing which is beyond the scope
    // of this basic calculator
    this.displayError("Parentheses not supported in this version");
  }

  toggleAngleMode() {
    this.degreeMode = !this.degreeMode;
    // Update UI to show current mode
    document.querySelector(".angle-mode").textContent = this.degreeMode
      ? "DEG"
      : "RAD";
  }

  factorial(n) {
    if (n > 170) throw new Error("Number too large for factorial");
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
      if (!isFinite(result)) throw new Error("Factorial result too large");
    }
    return result;
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const calc = new Calculator();

  // Add angle mode toggle button listener
  document.querySelector(".toggle-angle").addEventListener("click", () => {
    calc.toggleAngleMode();
  });
});
