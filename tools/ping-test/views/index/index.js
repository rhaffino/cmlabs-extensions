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

// Add Box Shadow Navbar
const shadowHeader = () => {
    const navbar = document.getElementById('navbar')
    // When the scroll is greater than 50 viewport height, add the shadow-navbar class
    this.scrollY >= 50 ? navbar.classList.add('shadow-navbar')
                        : navbar.classList.remove('shadow-navbar')
}
window.addEventListener('scroll', shadowHeader)

function tabChrome() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var currentUrl = currentTab.url;

      resolve(currentUrl);
    });
  });
}

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
            type: "url",
          },
        };

        chrome.runtime.sendMessage(message);
      });
    }
 }, 5000);
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

const displayResultLinkAnalysis = (response) => {
  showLoading(false);
  resultElement.innerHTML = "";

  if(response){
    const data = response.data;
    const outputParts = data.output.split("\n---");
    const timeOutput = outputParts[0].trim();
    const pingStatisticOutput = outputParts[1].split("\n")[1].trim();
    const ping = /\d+\sdata\sbytes/;
    const transmitted = /\d+\spackets\s\w+/;
    const received = /\d+\spackets\s\w+/g;
    resultElement.innerHTML = `
      <div class="result__container">
        <div class="d-flex mb-12">
          <h2 class="result__title">Result</h2>
          <span class="status__result online__status">${data.alive ? "Online" : "Offline"}</span>
        </div>
        
        <div class="row">
          <div class="col-4">
            <span class="title__result">Domain</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${data.inputHost}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-4">
            <span class="title__result">IP Address</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${data.numeric_host.replace(")", "")}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-4">
            <span class="title__result">Time</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${data.time} ms</span>
          </div>
        </div>

        <div class="row">
          <div class="col-4">
            <span class="title__result">Host</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${data.host}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-4">
            <span class="title__result">Ping</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${data.output.match(ping)[0]}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-4">
            <span class="title__result">Transmitted</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${pingStatisticOutput.match(transmitted)[0].replace(" transmitted", "")}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-4">
            <span class="title__result">Received</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${pingStatisticOutput.match(received)[1].replace(" received", "")}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-4">
            <span class="title__result">Packet Loss</span>
          </div>
          <div class="col-8">
            <span class="desc__result">${Math.round(data.packetLoss)} %</span>
          </div>
        </div>
        
        <div class="details__container">
          <a href="#" target="_blank" class="see__details">Want to see more details? See details</a>
          <img src="../../assets/icon/external-link.svg" alt="icon arrow" class="detail__icon">
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