
const form        = document.getElementById("form");
const tempInput   = document.getElementById("tempInput");
const unitSelect  = document.getElementById("unitSelect");
const resetBtn    = document.getElementById("resetBtn");
const errorEl     = document.getElementById("error");
const statusDot   = document.getElementById("status");

const gaugeValue  = document.getElementById("gaugeValue");
const gaugeUnit   = document.getElementById("gaugeUnit");
const progress    = document.getElementById("progress");
const dotGroup    = document.getElementById("dotGroup");

const outputs = {
  celsius:    document.getElementById("out-celsius"),
  fahrenheit: document.getElementById("out-fahrenheit"),
  kelvin:     document.getElementById("out-kelvin"),
};
const cards = {
  celsius:    document.getElementById("card-celsius"),
  fahrenheit: document.getElementById("card-fahrenheit"),
  kelvin:     document.getElementById("card-kelvin"),
};

const UNIT_NAMES   = { celsius: "Celsius", fahrenheit: "Fahrenheit", kelvin: "Kelvin" };
const UNIT_SYMBOLS = { celsius: "°C", fahrenheit: "°F", kelvin: "K" };

const ABSOLUTE_ZERO = { celsius: -273.15, fahrenheit: -459.67, kelvin: 0 };

const GAUGE_MIN_C = -50;
const GAUGE_MAX_C = 100;

const CIRCUMFERENCE = 2 * Math.PI * 120;
progress.style.strokeDasharray = CIRCUMFERENCE;

let displayedNumber = 25;


function toCelsius(value, unit) {
  if (unit === "celsius")    return value;
  if (unit === "fahrenheit") return (value - 32) * 5 / 9;
  return value - 273.15; // kelvin
}

function fromCelsius(c) {
  return {
    celsius:    c,
    fahrenheit: c * 9 / 5 + 32,
    kelvin:     c + 273.15,
  };
}

function format(num) {
  return String(Number(num.toFixed(2)));
}


function validate(rawText, unit) {
  const text = rawText.trim();

  if (text === "") {
    return { ok: false, message: "Please enter a temperature." };
  }

  const value = Number(text);

  if (!Number.isFinite(value)) {
    return { ok: false, message: "Please enter a valid number (e.g. 25 or -4.5)." };
  }

  // Compare in Celsius with a tiny tolerance for floating point errors
  if (toCelsius(value, unit) < -273.15 - 1e-9) {
    const limit = ABSOLUTE_ZERO[unit];
    return {
      ok: false,
      message: `That's below absolute zero! Minimum is ${limit}${UNIT_SYMBOLS[unit]}.`,
    };
  }

  return { ok: true, value };
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add("show");
  tempInput.classList.add("invalid");
  statusDot.classList.add("error-state");
  statusDot.title = "Status: error";
}

function clearError() {
  errorEl.classList.remove("show");
  tempInput.classList.remove("invalid");
  statusDot.classList.remove("error-state");
  statusDot.title = "Status: OK";
}


function updateGauge(celsius) {
 
  let fraction = (celsius - GAUGE_MIN_C) / (GAUGE_MAX_C - GAUGE_MIN_C);
  fraction = Math.min(1, Math.max(0, fraction)); 

  progress.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);

  dotGroup.style.transform = `rotate(${fraction * 360}deg)`;
}


function animateNumber(from, to) {
  const duration = 700; 
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);        
    const current = from + (to - from) * eased;
    gaugeValue.textContent = `${format(current)}°`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateUI(value, unit) {
  const celsius = toCelsius(value, unit);
  const all = fromCelsius(celsius);

  for (const key in outputs) {
    outputs[key].textContent = `${format(all[key])} ${UNIT_SYMBOLS[key]}`;
    cards[key].classList.toggle("active", key === unit);
  }

  gaugeUnit.textContent = UNIT_NAMES[unit];
  animateNumber(displayedNumber, value);
  displayedNumber = value;
  updateGauge(celsius);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const unit = unitSelect.value;
  const result = validate(tempInput.value, unit);

  if (!result.ok) {
    showError(result.message);
    return;
  }

  clearError();
  updateUI(result.value, unit);
});

tempInput.addEventListener("input", clearError);


resetBtn.addEventListener("click", () => {
  tempInput.value = "25";
  unitSelect.value = "celsius";
  clearError();
  updateUI(25, "celsius");
  tempInput.focus();
});


updateUI(25, "celsius");
