const domainURL = "https://tools.cmlabs.co";
let inputUrl = "";
const logButton = document.getElementById("log-button");
const resultElement = document.getElementById("result");
const navbar = document.getElementById("navbar");
const btnCrawlingStatus = document.getElementById("crawling-status");
const readLatestBlog = document.getElementById("read__latest-blog");
const previewDetail = document.getElementById("preview-detail");
const btnLimit = document.getElementById("btn-limit");
const alertLimit = document.getElementById("alert-limit");
const loadingElement = document.getElementById("loading");
const loadingContainer = document.getElementById("loading__container");
const headerHero = document.getElementById("header");

// Add Box Shadow Navbar
const shadowHeader = () => {
  const navbar = document.getElementById("navbar");
  // When the scroll is greater than 50 viewport height, add the shadow-navbar class
  this.scrollY >= 50
    ? navbar.classList.add("shadow-navbar")
    : navbar.classList.remove("shadow-navbar");
};
window.addEventListener("scroll", shadowHeader);

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
    var urlContainer = document.getElementById("url-container");
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
    headerHero.classList.remove("d-none");
    headerHero.classList.add("d-flex");
    btnCrawlingStatus.classList.remove("d-none");
    btnCrawlingStatus.classList.add("d-block");
    logButton.classList.remove("d-block");
    logButton.classList.add("d-none");
    readLatestBlog.classList.remove("d-none");
    readLatestBlog.classList.add("d-block");
  } else {
    loadingElement.classList.remove("d-block");
    loadingElement.classList.add("d-none");
    headerHero.classList.remove("d-block");
    headerHero.classList.add("d-none");
    btnCrawlingStatus.classList.remove("d-block");
    btnCrawlingStatus.classList.add("d-none");
    logButton.classList.remove("d-none");
    logButton.classList.add("d-flex");
    readLatestBlog.classList.remove("d-block");
    readLatestBlog.classList.add("d-none");
  }
};

const displayResultLinkAnalysis = (response) => {
  showLoading(false);
  resultElement.innerHTML = "";

  if (response) {
    const data = response.data;
    const outputParts = data.output.split("\n---");
    const pingStatisticOutput = outputParts[1].split("\n")[1].trim();
    const resultPing = pingStatisticOutput !== null ? pingStatisticOutput : "-";

    const resultMatchTime = data.time;
    let dataTime;
    if (resultMatchTime !== null && resultMatchTime !== "unknown") {
      dataTime = resultMatchTime + " ms";
    } else {
      dataTime = "-";
    }
    const resultTime = dataTime;

    const packet = /\d+\sdata\sbytes/;

    const seq = /seq=(\d+)/;
    const resultMatchSeq = data.output.match(seq);
    let dataSeq;
    if (resultMatchSeq !== null) {
      dataSeq = resultMatchSeq[0].replace("seq=", "");
    } else {
      dataSeq = "-";
    }
    const resultSeq = dataSeq;

    const ttl = /ttl=(\d+)/;
    const resultMatchTTL = data.output.match(ttl);
    let dataTTL;
    if (resultMatchTTL !== null) {
      dataTTL = resultMatchTTL[0].replace("ttl=", "");
    } else {
      dataTTL = "-";
    }
    const resultTTL = dataTTL;

    const transmitted = /\d+\spackets\s\w+/;
    const dataTransmitted = resultPing
      .match(transmitted)[0]
      .replace(" transmitted", "");
    const resultTransmitted = dataTransmitted !== null ? dataTransmitted : "-";

    const received = /\d+\spackets\s\w+/g;
    const dataReceived = resultPing.match(received)[1].replace(" received", "");
    const resultReceived = dataReceived !== null ? dataReceived : "-";

    const approximate = /min\/avg\/max\s=\s(\d+\.\d+\/\d+\.\d+\/\d+\.\d+)/;
    const resultMatchApproximate = data.output.match(approximate);
    let dataApproximate;
    if (resultMatchApproximate !== null) {
      dataApproximate = resultMatchApproximate[0].replace("min/avg/max =", "");
    } else {
      dataApproximate = "-";
    }
    const resultApproximate = dataApproximate;

    resultElement.innerHTML = `
      <div class="result__container">
        <div class="d-flex mb-12">
          <h2 class="result__title">Result</h2>
          <span class="status__result ${
            data.alive ? "online__status" : "offline__status"
          }">${
      data.alive
        ? "Online <img src='../../assets/icon/icon-online.svg' alt='Icon Online' class='icon__status'>"
        : "Offline <img src='../../assets/icon/icon-offline.svg' alt='Icon Offline' class='icon__status'>"
    }</span>
        </div>
        
        <div class="row">
          <div class="col-6">
            <span class="title__result">Domain</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${data.inputHost}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">IP Address</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${data.numeric_host.replace(
              ")",
              ""
            )}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">Time</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${resultTime}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">Number of bytes in packet</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${data.output.match(packet)[0]}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">ICMP Seq</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${resultSeq}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">TTL</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${resultTTL}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">Transmitted</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${resultTransmitted}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">Received</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${resultReceived}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <span class="title__result">Packet Loss</span>
          </div>
          <div class="col-6">
            <span class="desc__result">${Math.round(data.packetLoss)} %</span>
          </div>
        </div>
        
        <div class="row">
          <div class="col-6">
            <p class="title__result">Approximate round trip times (in ms)<br><span class="title__result-small">min/avg/max</span></p>
          </div>
          <div class="col-6">
            <span class="desc__result">${resultApproximate}</span>
          </div>
        </div>
        
        <div class="details__container">
          <a href="`+ domainURL +"/en/ping-tool?url=" + inputUrl.replace(/\/$/, "") +"&auto=true"+`" target="_blank" class="see__details">Want to see more details? See details</a>
          <img src="../../assets/icon/external-link.svg" alt="icon arrow" class="detail__icon">
        </div>
      </div>
    `;
          
    btnCrawlingStatus.classList.remove("d-block");    
    btnCrawlingStatus.classList.add("d-none");
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
