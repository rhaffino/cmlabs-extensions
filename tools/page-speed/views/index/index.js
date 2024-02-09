var domainURL = "https://tools.cmlabs.dev";
const logButton = document.getElementById("log-button");
const resultElement = document.getElementById("result");
const headerHero = document.getElementById("header");
const crawlingElement = document.getElementById("crawling-status");
const chartElement = document.getElementById("pagespeed-tab");
const readLatestBlog = document.getElementById("read__latest-blog");
const previewDetail = document.getElementById("preview-detail");

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
  previewDetail.classList.remove("d-none");
  previewDetail.classList.add("d-flex");

  const categories = [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
    "pwa",
  ];

  // Show Current URL Check Pagespeed Detail
  var urlDetail = document.getElementById("preview-detail");
  // const node = document.createElement("span");
  // const textNode = document.createTextNode("Want to see more details? See details");
  // node.appendChild(textNode);
  // urlDetail.appendChild(node);
  // urlDetail.textContent = "Want to see more details? See details ";
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
  let label = document.querySelector("#label-" + category);
  // let label = document.querySelector(`.label-${category}`);
  value.classList.remove("value-green");
  value.classList.remove("value-orange");
  value.classList.remove("value-red");
  card.classList.remove("progress-green");
  card.classList.remove("progress-red");
  card.classList.remove("progress-orange");
  label.classList.remove("label-green");
  label.classList.remove("label-red");
  label.classList.remove("label-orange");

  if (score >= 90) {
    card.classList.add("progress-green");
    value.classList.add("value-green");
    label.classList.add("label-green");
  } else if (score >= 50) {
    card.classList.add("progress-orange");
    value.classList.add("value-orange");
    label.classList.add("label-orange");
  } else {
    card.classList.add("progress-red");
    value.classList.add("value-red");
    label.classList.add("label-red");
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
    headerHero.classList.remove("d-none");
    headerHero.classList.add("d-flex");
    loading.classList.remove("d-none");
    loading.classList.add("d-flex");
    chartElement.classList.remove("d-flex");
    chartElement.classList.add("d-none");
    logButton.classList.remove("d-flex");
    logButton.classList.add("d-none");
    previewDetail.classList.remove("d-flex");
    previewDetail.classList.add("d-none");
    crawlingElement.classList.add("d-flex");
    crawlingElement.classList.remove("d-none");
    readLatestBlog.classList.remove("d-none");
    readLatestBlog.classList.add("d-block");
  } else {
    headerHero.classList.remove("d-block");
    headerHero.classList.add("d-none");
    loading.classList.remove("d-flex");
    loading.classList.add("d-none");
    chartElement.classList.remove("d-none");
    chartElement.classList.add("d-flex");
    logButton.classList.remove("d-none");
    logButton.classList.add("d-flex");
    previewDetail.classList.remove("d-none");
    previewDetail.classList.add("d-flex");
    crawlingElement.classList.add("d-none");
    crawlingElement.classList.remove("d-block");
    readLatestBlog.classList.remove("d-block");
    readLatestBlog.classList.add("d-none");
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
