const domainURL = "https://tools.cmlabs.co";
let inputUrl = "";
const loadingElement = document.getElementById("loading");
const loadingContainer = document.getElementById("loading__container");
const headerHero = document.getElementById("header");
const alertLimit = document.getElementById("alert-limit");
const btnCheck = document.getElementById("btn-check");
const logButton = document.getElementById("submit-btn");
const btnLimit = document.getElementById("btn-limit");
const resultElement = document.getElementById("result");
const readLatestBlog = document.getElementById("read__latest-blog");

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
      displayResultLinkAnalysis(result.response);
    } else {
      showLoading(true);
      launch();
    }
  });
};

// Show / Hide Section
const showLoading = (status) => {
  if (status) {
    loadingElement.classList.remove("d-none");
    loadingElement.classList.add("d-block");
    loadingContainer.classList.remove("d-none");
    loadingContainer.classList.add("d-block");
    headerHero.classList.remove("d-none");
    headerHero.classList.add("d-flex");
    btnCheck.classList.remove("d-block");
    btnCheck.classList.add("d-none");
    readLatestBlog.classList.remove("d-none");
    readLatestBlog.classList.add("d-block");
  } else {
    loadingElement.classList.remove("d-block");
    loadingElement.classList.add("d-none");
    loadingContainer.classList.remove("d-block");
    loadingContainer.classList.add("d-none");
    headerHero.classList.remove("d-block");
    headerHero.classList.add("d-none");
    btnCheck.classList.remove("d-none");
    btnCheck.classList.add("d-flex");
    readLatestBlog.classList.remove("d-block");
    readLatestBlog.classList.add("d-none");
  }
};

// Display Result Robots.txt Checker
const displayResultLinkAnalysis = (response) => {
  showLoading(false);
  resultElement.innerHTML = "";

  if (
    response &&
    response.data &&
    response.data[0] &&
    response.data[0].robots
  ) {

    const robots = response.data[0].robots;

    resultElement.innerHTML = `
      <div class="result__container result__container-active">
        <div class="group__result">
          <label for="url-website" class="result__label">URL Website</label>
          <input type="text" id="url-website" placeholder="${robots.url ? robots.url : '-'}" value="${robots.url ? robots.url : '-'}" class="result__input ${robots.url ? '' : 'error__result'}" readonly>          
          ${robots.url ? '<img src="../../assets/icon/success.svg" alt="icon result" class="result__icon">' : '<img src="../../assets/icon/danger.svg" alt="icon result" class="result__icon">'}
        </div>

        <div class="group__result">
          <label for="url-host" class="result__label">Host</label>
          <input type="text" id="url-host" placeholder="${robots.parser.host ? robots.parser.host : '-'}" value="${robots.parser.host ? robots.parser.host : '-'}" class="result__input ${robots.parser.host ? '' : 'error__result'}" readonly>
          ${robots.parser.host ? '<img src="../../assets/icon/success.svg" alt="icon result" class="result__icon">' : '<img src="../../assets/icon/danger.svg" alt="icon result" class="result__icon">'}
        </div>

        <div class="group__result">
          <label for="url-sitemaps" class="result__label">Sitemap</label>
          <input type="text" id="url-sitemaps" placeholder="${robots.parser.sitemaps ? robots.parser.sitemaps : '-'}" value="${robots.parser.sitemaps ? robots.parser.sitemaps : '-'}" class="result__input ${robots.parser.sitemaps ? '' : 'error__result'}" readonly>
          ${robots.parser.sitemaps ? '<img src="../../assets/icon/success.svg" alt="icon result" class="result__icon">' : '<img src="../../assets/icon/danger.svg" alt="icon result" class="result__icon">'}
        </div>

        <div class="group__result">
          <label for="available" class="result__label">Robots.txt</label>
          <input type="text" id="available" placeholder="${robots.url ? 'Available' : 'No Available'}" value="${robots.url ? 'Available' : 'No Available'}" class="result__input ${robots.url ? '' : 'error__result'}" readonly>
          ${robots.url ? '<img src="../../assets/icon/success.svg" alt="icon result" class="result__icon">' : '<img src="../../assets/icon/danger.svg" alt="icon result" class="result__icon">'}
        </div>

        <div class="details__container">
          <a href="`+ domainURL + `/en/robotstxt-checker?url=` + inputUrl.replace(/\/$/, '') + "&auto=true" +`" target="_blank" class="see__details">Want to see more details? See details</a>
          <img src="../../assets/icon/arrow-right.svg" alt="icon arrow" class="detail__icon">
        </div>
      </div>
    `;

    
    alertLimit.classList.remove("d-block");
    alertLimit.classList.add("d-none");
    logButton.classList.remove("d-none");
    logButton.classList.add("d-block");

    const message = {
      event: "onResetResponse",
      data: null,
    };
    chrome.runtime.sendMessage(message);
  }
};

// After Run Service Worker
chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        displayResultLinkAnalysis(response);
      } else {
        showLoading(false);
        resultElement.innerHTML = "";
        
        headerHero.classList.add("d-flex");
        headerHero.classList.remove("d-none");
        alertLimit.classList.add("d-block");
        alertLimit.classList.remove("d-none");
        btnLimit.classList.add("d-flex");
        btnLimit.classList.remove("d-none");
        logButton.classList.add("d-none");
        logButton.classList.remove("d-block");
        readLatestBlog.classList.remove("d-block");
        readLatestBlog.classList.add("d-none");
      }
      break;
    default:
  }
});