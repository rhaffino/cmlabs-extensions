var domainURL = "https://tools.cmlabs.dev";

document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    var urlContainer = document.getElementById("url-container");
    urlContainer.textContent = currentUrl;
  });

  var logButton = document.getElementById("log-button");
  logButton.addEventListener("click", function () {
    launch();
  });
});

const launch = () => {
  showLoading(true);

  tabChrome().then((currentUrl) => {
    console.log(currentUrl);

    const message = {
      event: "OnStartLinkAnalysis",
      data: {
        url: currentUrl,
      },
    };

    chrome.runtime.sendMessage(message);
  });
};

function tabChrome() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var currentUrl = currentTab.url;

      resolve(currentUrl);
    });
  });
}

const historyParagraph = document.getElementById("history");

function renderResult(data) {
  showLoading(false);

  const categories = [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
    "pwa",
  ];

  historyParagraph.innerText = `Your history: ${data.id}`;
  historyParagraph.classList.remove("d-none");
  historyParagraph.classList.add("d-flex");

  // Show Current URL Check Pagespeed Detail
  var urlDetail = document.getElementById("preview-detail");
  urlDetail.textContent = "Lihat Detail";
  urlDetail.setAttribute(
    "href",
    "" + domainURL + "/en/pagespeed-test?url=" + data.id
  );

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

chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        renderResult(response);
      } else {
        console.log(info);
      }
      break;
    default:
      console.log("Unknown event");
  }
});

const showLoading = (status) => {
  var loading = document.getElementById("loading");

  if (status) {
    loading.classList.remove("d-none");
    loading.classList.add("d-flex");
  } else {
    loading.classList.remove("d-flex");
    loading.classList.add("d-none");
  }
};

const checkLocalStorage = () => {
  chrome.storage.local.get(["response"], (result) => {
    if (result.response) {
      renderResult(result.response);
    } else {
      historyParagraph.classList.remove("d-flex");
      historyParagraph.classList.add("d-none");
      launch();
    }
  });
};

checkLocalStorage();
