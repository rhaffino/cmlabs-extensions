const loadingElement = document.getElementById("loading");
const resultElement = document.getElementById("result");
const logButton = document.getElementById("submit-btn");
const domainURL = "https://tools.cmlabs.dev";
let inputUrl = "";

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

const launch = async () => {
  const isDataFetched = await checkFetchStatus();

  if (isDataFetched) {
    logButton.style.display = "none";
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

chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        displayResultLinkAnalysis(response);
      } else {
        showLoading(false);
        resultElement.innerHTML = "";

        const noValidUrlParagraph = document.createElement("p");
        noValidUrlParagraph.textContent = info;
        resultElement.appendChild(noValidUrlParagraph);
      }
      break;
    default:
      console.log("Unknown event", event);
  }
});

function tabChrome() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var currentUrl = currentTab.url;

      resolve(currentUrl);
    });
  });
}

const showLoading = (status) => {
  if (status) {
    loadingElement.classList.remove("d-none");
    loadingElement.classList.add("d-block");
  } else {
    loadingElement.classList.remove("d-block");
    loadingElement.classList.add("d-none");
  }
};

const displayResultLinkAnalysis = (response) => {
  console.log(response);

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
          <input type="text" id="url-website" placeholder="`+ robots.url +`" value="`+ robots.url +`" class="result__input" readonly>          
          <img src="../../assets/icon/success.svg" alt="icon result" class="result__icon">
        </div>

        <div class="group__result">
          <label for="url-website" class="result__label">Host</label>
          <input type="text" id="url-website" placeholder="`+ robots.parser.host +`" value="`+ robots.parser.host +`" class="result__input error__result" readonly>
          <img src="../../assets/icon/danger.svg" alt="icon result" class="result__icon">
        </div>

        <div class="group__result">
          <label for="url-website" class="result__label">Sitemap</label>
          <input type="text" id="url-website" placeholder="`+ robots.parser.sitemaps +`" value="`+ robots.parser.sitemaps +`" class="result__input" readonly>
          <img src="../../assets/icon/success.svg" alt="icon result" class="result__icon">
        </div>

        <div class="group__result">
          <label for="url-website" class="result__label">Robots.txt</label>
          <input type="text" id="url-website" placeholder="Available" value="Available" class="result__input" readonly>
          <img src="../../assets/icon/success.svg" alt="icon result" class="result__icon">
        </div>

        <div class="details__container">
          <a href="`+ domainURL + `/en/robotstxt-checker=` + inputUrl+`" target="_blank" class="see__details">Want to see more details? See details</a>
          <img src="../../assets/icon/arrow-right.svg" alt="icon arrow" class="detail__icon">
        </div>
      </div>
    `;

    logButton.classList.remove("d-none");
    logButton.classList.add("d-block");

    const message = {
      event: "onResetResponse",
      data: null,
    };
    chrome.runtime.sendMessage(message);
  }
};

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
