var apiKey = "AIzaSyDjg7PenszK_cEZfg4tzvOlKFmnufwxVLs"; // API Google PageSpeed Insights
var domainURL = "https://tools.cmlabs.dev"; // Tools website cmlabs

document.addEventListener("DOMContentLoaded", function () {
  // Load tab Chrome
  // tabChrome();

  // Re-test load Pagespeed
  var logButton = document.getElementById("log-button");
  logButton.addEventListener("click", function () {
    // Send Request Pagespeed Metrics
    chrome.runtime.sendMessage({ action: "pagespeedAPI" });
    tabChrome();
  });
});

// All Function
function tabChrome() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var currentUrl = currentTab.url;

    // Show Current URL
    var urlContainer = document.getElementById("url-container");
    urlContainer.textContent = currentUrl;

    // Show Current URL Check Pagespeed Detail
    var urlDetail = document.getElementById("preview-detail");
    urlDetail.textContent = "Lihat Detail";
    urlDetail.setAttribute(
      "href",
      "" + domainURL + "/en/pagespeed-test?url=" + currentUrl
    );

    // Show Loading
    var loading = document.getElementById("loading");
    loading.classList.remove("d-none");
    loading.classList.add("d-flex");

    // Check Pagespeed with API
    var urlInput = currentUrl;
    let match = /^(http(s)?|ftp):\/\//;
    let urlWeb = urlInput.replace(match, "");

    var apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO&url=https://${urlWeb}&key=${apiKey}`;

    fetch(apiUrl)
      .then((response) => {
        if (response.status !== 200) {
          console.log("Permintaan API gagal: " + response.status);
          return;
        }
        response.json().then((data) => {
          // Render data Pagespeed
          renderResult(data);
          chrome.runtime.sendMessage({ action: "doneCheck" });
          loading.classList.add("d-none");
          loading.classList.remove("d-flex");
        });
      })
      .catch((error) => {
        console.log("Terjadi kesalahan saat mengakses API: " + error);
      });
  });
}

function renderResult(data) {
  const categories = [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
    "pwa",
  ];

  for (let j = 0; j < 5; j++) {
    let score;
    if (data.lighthouseResult.categories[categories[j]].score == null) {
      score = 0;
    } else {
      score = (
        data.lighthouseResult.categories[categories[j]].score * 100
      ).toFixed(0);
    }

    strokeValue(score, j + 1, categories[j]);
  }
}

function strokeValue(score, number, category) {
  let card = document.querySelector("." + category);
  let value = document.querySelector(".value-" + category);
  value.classList.remove("value-green");
  value.classList.remove("value-orange");
  value.classList.remove("value-red");
  card.classList.remove("progress-green");
  card.classList.remove("progress-red");
  card.classList.remove("progress-orange");

  if (score >= 90) {
    card.classList.add("progress-green");
    value.classList.add("value-green");
  } else if (score >= 50) {
    card.classList.add("progress-orange");
    value.classList.add("value-orange");
  } else {
    card.classList.add("progress-red");
    value.classList.add("value-red");
  }

  card.setAttribute("data-percentage", score);
  animateValue("value-" + category, 0, score, 3000);
}

function animateValue(id, start, end, duration) {
  var obj = document.querySelector("." + id);
  var range, current, increment, stepTime, timer;

  if (start == end) {
    range = 0;
    current = start;
    increment = 0;
    stepTime = 0;
    timer = 0;
    obj.innerHTML = current + "%";
  } else {
    range = end - start;
    current = start;
    increment = end > start ? 1 : -1;
    stepTime = Math.abs(Math.floor(duration / range));
    timer = setInterval(function () {
      current += increment;
      obj.innerHTML = current + "%";
      if (current == end) {
        clearInterval(timer);
      }
    }, stepTime);
  }
}
