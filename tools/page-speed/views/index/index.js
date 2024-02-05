var domainURL = "https://tools.cmlabs.dev";
const logButton = document.getElementById("log-button");
const resultElement = document.getElementById("result");
const crawlingElement = document.getElementById("crawling-status");
const chartElement = document.getElementById("pagespeed-tab");


document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    var urlContainer = document.getElementById("url-container");
    urlContainer.innerText = currentUrl;
  });

  logButton.addEventListener("click", function () {
    launch();
  });

  checkLocalStorage();
});

const launch = async () => {
  showLoading(true);

  const isDataFetched = await checkFetchStatus();

  if (isDataFetched) {
    
    crawlingElement.classList.add("d-flex");
    crawlingElement.classList.remove("d-none");
  } else {
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
  }
};

const checkFetchStatus = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["isDataFetched"], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.isDataFetched);
      }
    });
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

function renderResult(data) {
  showLoading(false);

  logButton.classList.remove("d-none");
  logButton.classList.add("d-block");

  const categories = [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
    "pwa",
  ];

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

    const message = {
      event: "onResetResponse",
      data: null,
    };
    chrome.runtime.sendMessage(message);
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
        showLoading(false);

        resultElement.innerHTML = "";

        const noValidUrlParagraph = document.createElement("p");
        noValidUrlParagraph.textContent = info;
        resultElement.appendChild(noValidUrlParagraph);
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
    chartElement.classList.remove("d-flex");
    chartElement.classList.add("d-none");
    crawlingElement.classList.add("d-flex");
    crawlingElement.classList.remove("d-none");
  } else {
    loading.classList.remove("d-flex");
    loading.classList.add("d-none");
    chartElement.classList.remove("d-none");
    chartElement.classList.add("d-flex");
    crawlingElement.classList.add("d-none");
    crawlingElement.classList.remove("d-flex");
  }
};

const checkLocalStorage = () => {
  showLoading(true);
  resultElement.innerHTML = "";

  chrome.storage.local.get(["response"], (result) => {
    showLoading(false);

    if (result.response) {
      renderResult(result.response);
    } else {
      launch();
    }
  });
};
