const domainURL = "https://tools.cmlabs.co";
let inputUrl = "";
const loading = document.getElementById("loading");
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
    var urlContainer = document.getElementById("url-container");
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

// Local Storage
const checkLocalStorage = () => {
  showLoading(true);
  resultElement.innerHTML = "";

  chrome.storage.local.get(["response"], (result) => {
    showLoading(false);

    if (result.response) {
      renderResult(result.response);
    } else {
      showLoading(true);
      launch();
    }
  });
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

// Show / Hide Section
const showLoading = (status) => {
  if (status) {
    loading.classList.remove("d-none");
    loading.classList.add("d-flex");
    loadingContainer.classList.remove("d-none");
    loadingContainer.classList.add("d-flex");
    headerHero.classList.remove("d-none");
    headerHero.classList.add("d-flex");
    btnCheck.classList.remove("d-block");
    btnCheck.classList.add("d-none");
    readLatestBlog.classList.remove("d-none");
    readLatestBlog.classList.add("d-block");
  } else {
    loading.classList.remove("d-flex");
    loading.classList.add("d-none");
    loadingContainer.classList.remove("d-flex");
    loadingContainer.classList.add("d-none");
    headerHero.classList.remove("d-block");
    headerHero.classList.add("d-none");
    btnCheck.classList.remove("d-none");
    btnCheck.classList.add("d-flex");
    readLatestBlog.classList.remove("d-block");
    readLatestBlog.classList.add("d-none");
  }
};

// Function parse Mothh
function parseMonth(month) {
  switch (month) {
    case 1:
      return "January";
      break;
    case 2:
      return "February";
      break;
    case 3:
      return "March";
      break;
    case 4:
      return "April";
      break;
    case 5:
      return "May";
      break;
    case 6:
      return "June";
      break;
    case 7:
      return "July";
      break;
    case 8:
      return "August";
      break;
    case 9:
      return "September";
      break;
    case 10:
      return "October";
      break;
    case 11:
      return "November";
      break;
    case 12:
      return "December";
      break;
  }
}

// Display Result SSL Checker
function renderResult(response) {
  showLoading(false);

  const expDate = new Date(response.data.valid_to);
  const difDate = expDate.getTime() - new Date().getTime();
  let displayText;
  let icon;
  let textExpired;
  const cta = false;

  if (difDate < 0) {
    const ctaDanger = document.getElementById("cta-danger");
    if (cta) {
      ctaDanger.style.display = "block";
    } else {
      ctaDanger.style.display = "none";
    }
    displayText = `SSL Certificate expired on ${expDate.getDate()}th, ${parseMonth(
      expDate.getMonth() + 1
    )} ${expDate.getFullYear()} (${(
      Math.abs(difDate) /
      (1000 * 3600 * 24)
    ).toFixed(0)} days ago).`;
    icon = `<i class='bx bxs-x-circle bx-md' style="color:#D60404"></i>`;
    textExpired = `Your TSL Certificate is expired`;
  } else {
    displayText = `SSL Certificate expired on ${expDate.getDate()}th, ${parseMonth(
      expDate.getMonth() + 1
    )} ${expDate.getFullYear()} (${(
      Math.abs(difDate) /
      (1000 * 3600 * 24)
    ).toFixed(0)} days from now).`;
    icon = `<i class='bx bxs-check-circle bx-md' style="color:#67B405"></i>`;
    textExpired = `TLS Certificate is installed well.`;
  }

  const display = document.createElement("div");
  display.innerHTML = `
                      <div class="accordion" id="accordion-tsl">
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="headingOne">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                              TSL Certificate
                            </button>
                          </h2>
                          <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#collapseOne">
                            <div class="accordion-body">
                              <p>Common Name = ${response.data.subject.CN}</p>
                              <p>Subject Alternative Names = ${response.data.subjectaltname}</p>
                              <p>Issuer = ${response.data.issuer.CN}</p>
                              <p>Serial Number = ${response.data.serialNumber}</p>
                              <p>SHA1 Thumbprint = ${response.data.fingerprint}</p>
                            </div>
                          </div>
                        </div>
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="headingTwo">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                              TSL Certificate Expiration Date
                            </button>
                          </h2>
                          <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#collapseTwo">
                            <div class="accordion-body">
                              <p>${displayText}</p>
                            </div>
                          </div>
                        </div>
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="headingThree">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                              TSL Certificate Installation Status
                            </button>
                          </h2>
                          <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#collapseThree">
                            <div class="accordion-body">
                              <p>${textExpired}</p>
                            </div>
                          </div>
                        </div>

                        <div class="details__container">
                          <a href="` +
                          domainURL +
                          "/en/ssl-checker?url=" +
                          inputUrl.replace(/\/$/, '') + "&auto=true"+
                          `" target="_blank" class="see__details">Want to see more details? See details</a>
                                <img src="../../assets/icon/external-link.svg" alt="icon arrow" class="detail__icon">
                        </div>
                      </div>`;

  const resultElement = document.getElementById("result");
  resultElement.appendChild(display);
  alertLimit.classList.remove("d-block");
  alertLimit.classList.add("d-none");

  const message = {
    event: "onResetResponse",
    data: null,
  };
  chrome.runtime.sendMessage(message);
}

// After Run Service Worker
chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        renderResult(response);
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