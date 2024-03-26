const domainURL = "https://tools.cmlabs.co";
let inputUrl = "";
const loadingElement = document.getElementById("loading");
const loadingContainer = document.getElementById("loading__container");
const headerHero = document.getElementById("header");
const alertLimit = document.getElementById("alert-limit");
const btnCheck = document.getElementById("btn-check");
const btnLimit = document.getElementById("btn-limit");
const logButton = document.getElementById("submit-btn");
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

// Function Create Chart
function createChart(
    internal_link_value,
    external_link_value,
    nofollow_link_value,
    dofollow_link_value
) {
  var ctx = document.getElementById("analyzer-chart").getContext("2d");
  analyzeChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Internal Links", "External Links", "No-Follow", "Do-Follow"],
      datasets: [
        {
          label: "# of Votes",
          data: [
            internal_link_value,
            external_link_value,
            nofollow_link_value,
            dofollow_link_value,
          ],
          backgroundColor: ["#4CAAF7", "#FFCB66", "#B47AF1", "#F98181"],
          borderColor: ["#4CAAF7", "#FFCB66", "#B47AF1", "#F98181"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false,
        align: "start",
        padding: 20,
      },
      scales: {
        xAxes: [
          {
            display: false,
          },
        ],
        yAxes: [
          {
            display: false,
          },
        ],
      },
      tooltips: {
        backgroundColor: "#fff",
        cornerRadius: 0,
        displayColors: false,
        titleFontFamily: "'Roboto', sans-serif",
        titleFontColor: "#2A2F33",
        bodyAlign: "center",
        bodyFontFamily: "'Roboto', sans-serif",
        bodyFontColor: "#2A2F33",
        bodyFontStyle: "normal",
      },
    },
  });
}

// Display Result Link Analyzer
const displayResultLinkAnalysis = (response) => {
  const totalInternalLinks = response.data.internal_links.value;
  const totalExternalLinks = response.data.external_links.value;
  const totalNofollowLinks = response.data.nofollow_links.value;
  const totalDofollowLinks = response.data.dofollow_links.value;
  const totalLinks = response.data.links.value;
  const internalLinks = response.data.internal_links.links;
  const externalLinks = response.data.external_links.links;
  const allLinks = internalLinks.concat(externalLinks);
  const linksNofollow = allLinks.filter((link) =>
      link.rels.includes("nofollow")
  );
  const linksDofollow = allLinks.filter(
      (link) => !link.rels.includes("nofollow")
  );

  showLoading(false);
  resultElement.innerHTML =
      `
      <div class="result__container">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-6">
              <canvas id="analyzer-chart" width="408" height="187" class="chartjs-render-monitor"></canvas>
            </div>
            <div class="col-6 chart__info">
              <p>Total Links: <span id="total-links">` +
      totalLinks +
      `</span></p>

              <div class="list__result-link">
                <div class="result__link">
                  <span class="badge__link internal__link"></span>
                  <p>Internal Link (<span id="internal-link">` +
      totalInternalLinks +
      `</span>)</p>
                </div>

                <div class="result__link">
                  <span class="badge__link external__link"></span>
                  <p>External Link (<span id="external-link">` +
      totalExternalLinks +
      `</span>)</p>
                </div>

                <div class="result__link">
                  <span class="badge__link no__follow"></span>
                  <p>No Follow (<span id="no-follow">` +
      totalNofollowLinks +
      `</span>)</p>
                </div>

                <div class="result__link">
                  <span class="badge__link do__follow"></span>
                  <p>Do Follow (<span id="do-follow">` +
      totalDofollowLinks +
      `</span>)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tab__container-nav">
          <ul class="nav nav-pills detail__tabs" id="pills-tab" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-internal-link" data-bs-toggle="pill" data-bs-target="#content-tab-internal-link" type="button" role="tab" aria-controls="content-tab-internal-link" aria-selected="true">
                Internal Links
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-external-link" data-bs-toggle="pill" data-bs-target="#content-tab-external-link" type="button" role="tab" aria-controls="content-tab-external-link" aria-selected="false">
                External Links
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-no-follow" data-bs-toggle="pill" data-bs-target="#content-tab-no-follow" type="button" role="tab" aria-controls="content-tab-no-follow" aria-selected="false">
                No-Follow
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-do-follow" data-bs-toggle="pill" data-bs-target="#content-tab-do-follow" type="button" role="tab" aria-controls="content-tab-do-follow" aria-selected="false">
                Do-Follow
              </button>
            </li>
          </ul>
        </div>

        <div class="tab-content" id="pills-tabContent">
          <div class="tab-pane fade show active" id="content-tab-internal-link" role="tabpanel" aria-labelledby="tab-internal-link">
            <div class="list__links">
              ${
          internalLinks.length === 0
              ? `
                <div class="without__result">
                    <img src="../../assets/icon/time.svg" class="img__no-result">
                    <p class="description__no-result">
                      After our analysis, there is no link here!
                    </p>
                </div>
              `
              : internalLinks
                  .map(
                      (link, index) => `
                  ${
                          index < 5 || (index >= 7 && index < 8)
                              ? `
                      <div class="list__link">
                          <span>${index + 1} .</span>
                          <span>${link.url}</span>
                      </div>
                      ${
                                  index % 5 === 4
                                      ? '<div class="list__link list__link-space"><span>---</span></div>'
                                      : ""
                              }
                  `
                              : ""
                      }
              `
                  )
                  .join("")
      }
            </div>
          </div>
          <div class="tab-pane fade" id="content-tab-external-link" role="tabpanel" aria-labelledby="tab-external-link">
            <div class="list__links">
               ${
          externalLinks.length === 0
              ? `
                <div class="without__result">
                    <img src="../../assets/icon/time.svg" class="img__no-result">
                    <p class="description__no-result">
                      After our analysis, there is no link here!
                    </p>
                </div>
              `
              : externalLinks
                  .map(
                      (link, index) => `
                  ${
                          index < 5 || (index >= 7 && index < 8)
                              ? `
                      <div class="list__link">
                          <span>${index + 1} .</span>
                          <span class="list__link-url">${link.url}</span>
                      </div>
                      ${
                                  index % 5 === 4
                                      ? '<div class="list__link list__link-space"><span>---</span></div>'
                                      : ""
                              }
                  `
                              : ""
                      }
              `
                  )
                  .join("")
      }
            </div>
          </div>
          <div class="tab-pane fade" id="content-tab-no-follow" role="tabpanel" aria-labelledby="tab-no-follow">
            ${
          linksNofollow.length === 0
              ? `
                <div class="without__result">
                    <img src="../../assets/icon/time.svg" class="img__no-result">
                    <p class="description__no-result">
                      After our analysis, there is no link here!
                    </p>
                </div>
              `
              : linksNofollow
                  .map(
                      (link, index) => `
                  ${
                          index < 5 || (index >= 7 && index < 8)
                              ? `
                      <div class="list__link">
                          <span>${index + 1} .</span>
                          <span>${link.url}</span>
                      </div>
                      ${
                                  index % 5 === 4
                                      ? '<div class="list__link list__link-space"><span>---</span></div>'
                                      : ""
                              }
                  `
                              : ""
                      }
              `
                  )
                  .join("")
      }
          </div>
          <div class="tab-pane fade" id="content-tab-do-follow" role="tabpanel" aria-labelledby="tab-do-follow">
            ${
          linksDofollow.length === 0
              ? `
                <div class="without__result">
                    <img src="../../assets/icon/time.svg" class="img__no-result">
                    <p class="description__no-result">
                      After our analysis, there is no link here!
                    </p>
                </div>
              `
              : linksDofollow
                  .map(
                      (link, index) => `
                  ${
                          index < 5 || (index >= 7 && index < 8)
                              ? `
                      <div class="list__link">
                          <span>${index + 1} .</span>
                          <span>${link.url}</span>
                      </div>
                      ${
                                  index % 5 === 4
                                      ? '<div class="list__link list__link-space"><span>---</span></div>'
                                      : ""
                              }
                  `
                              : ""
                      }
              `
                  )
                  .join("")
      }
          </div>
        </div>

        <div class="details__container">
          <a href="` +
      domainURL +
      "/en/link-analyzer?url=" +
      inputUrl.replace(/\/$/, "") +
      "&auto=true" +
      `" target="_blank" class="see__details">Want to see more details? See details</a>
          <img src="../../assets/icon/external-link.svg" alt="icon arrow" class="detail__icon">
        </div>
      </div>
  `;

  alertLimit.classList.remove("d-block");
  alertLimit.classList.add("d-none");
  logButton.classList.remove("d-none");
  logButton.classList.add("d-block");

  createChart(
      totalInternalLinks,
      totalExternalLinks,
      totalNofollowLinks,
      totalDofollowLinks
  );

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