const domainURL = "https://tools.cmlabs.co";
let inputUrl = "";
const loadingElement = document.getElementById("loading");
const btnCrawlingStatus = document.getElementById("crawling-status");
const headerHero = document.getElementById("header");
const alertLimit = document.getElementById("alert-limit");
const btnLimit = document.getElementById("btn-limit");
const logButton = document.getElementById("log-button");
const resultElement = document.getElementById("result");
const readLatestBlog = document.getElementById("read__latest-blog");
var analyzeChart = undefined;

// Add Box Shadow Navbar
const shadowHeader = () => {
  const navbar = document.getElementById("navbar");
  // When the scroll is greater than 50 viewport height, add the shadow-navbar class
  this.scrollY >= 50
    ? navbar.classList.add("shadow-navbar")
    : navbar.classList.remove("shadow-navbar");
};
window.addEventListener("scroll", shadowHeader);

// Function check Chrome tab URL
function tabChrome() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var currentUrl = currentTab.url;

      resolve(currentUrl);
    });
  });
}

// Load DOM Extension
document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    var urlContainer = document.getElementById("url-input");
    urlContainer.textContent = currentUrl;
    inputUrl = currentUrl;
  });

  logButton.addEventListener("click", function () {
    launch();
  });

  checkLocalStorage();
});

// Run Extension
const launch = async () => {
  showLoading(true);
  resultElement.innerHTML = "";

  const isDataFetched = await checkFetchStatus();

  setTimeout(() => {
    if (isDataFetched) {
      logButton.style.display = "none";
    } else {
      tabChrome().then((currentUrl) => {
        const message = {
          event: "OnStartLinkAnalysis",
          data: {
            url: currentUrl,
          },
        };

        chrome.runtime.sendMessage(message);
      });
    }
  }, 5000);
};

// Check Status Extension Service Worker
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

// Local Storage
const checkLocalStorage = () => {
  showLoading(true);
  resultElement.innerHTML = "";

  chrome.storage.local.get(["response"], (result) => {
    showLoading(false);

    if (result.response) {
      displayResultHttpHeader(result.response);
    } else {
      showLoading(true);
      launch();
    }
  });
};

// Show / Hide Section
const showLoading = (status) => {
  if (status) {
    btnCrawlingStatus.classList.remove("d-none");
    btnCrawlingStatus.classList.add("d-block");
    loadingElement.classList.remove("d-none");
    loadingElement.classList.add("d-block");
    headerHero.classList.remove("d-none");
    headerHero.classList.add("d-flex");
    readLatestBlog.classList.remove("d-none");
    readLatestBlog.classList.add("d-block");
    logButton.classList.remove("d-block");
    logButton.classList.add("d-none");
  } else {
    btnCrawlingStatus.classList.remove("d-block");
    btnCrawlingStatus.classList.add("d-none");
    loadingElement.classList.remove("d-block");
    loadingElement.classList.add("d-none");
    headerHero.classList.remove("d-block");
    headerHero.classList.add("d-none");
    readLatestBlog.classList.remove("d-block");
    readLatestBlog.classList.add("d-none");
  }
};

// Display Result HTTP Header
const displayResultHttpHeader = (response) => {
  showLoading(false);
  const headers = response.data;

  let resultHTML = `
  <div class="result__container">
    <div class="">
      <div class="row align-items-center">
        <div class="col-12 chart__info">
          <h6>Result</h6>
          <div class="list__result-link">
  `;

  let index = 0;
  for (const [key, value] of Object.entries(headers)) {
    if (key === "setCookie") {
      continue;
    }

    if (value.length > 100) {
      continue;
    }

    const bgColorClass = index % 2 === 0 ? "bg-light" : "bg-white";
    resultHTML += `
      <div class="result__link ${bgColorClass} px-2 py-1">
          <div class="fw-bold">${key}</div>
          <div class="text-break fw-normal">${value}</div>
      </div>
    `;
    index++;
  }

  resultHTML +=
    `
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="details__container">
          <a href="` +
    domainURL +
    "/en/http-header-checker?url=" +
    inputUrl.replace(/\/$/, "") +
    "&auto=true" +
    `" target="_blank" class="see__details">Want to see more details? See details</a>
          <img src="../../assets/icon/external-link.svg" alt="icon arrow" class="detail__icon">
        </div>
  `;

  resultElement.innerHTML = resultHTML;
  alertLimit.classList.remove("d-block");
  alertLimit.classList.add("d-none");
  logButton.classList.remove("d-none");
  logButton.classList.add("d-block");

  const message = {
    event: "onResetResponse",
    data: null,
  };
  chrome.runtime.sendMessage(message);
};

// After Run Service Worker
chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        displayResultHttpHeader(response);
      } else {
        showLoading(false);
        resultElement.innerHTML = "";

        btnCrawlingStatus.classList.remove("d-block");
        btnCrawlingStatus.classList.add("d-none");
        headerHero.classList.add("d-flex");
        headerHero.classList.remove("d-none");
        alertLimit.classList.add("d-block");
        alertLimit.classList.remove("d-none");
        btnLimit.classList.add("d-flex");
        btnLimit.classList.remove("d-none");
        logButton.classList.add("d-none");
        logButton.classList.remove("d-block");
        readLatestBlog.classList.add("d-block");
        readLatestBlog.classList.remove("d-none");
      }
      break;
    default:
  }
});
