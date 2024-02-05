const domainURL = "https://tools.cmlabs.dev";
let inputUrl = "";
const loadingElement = document.getElementById("loading");
const resultElement = document.getElementById("result");
const logButton = document.getElementById("submit-btn");
var analyzeChart = undefined;

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

function createChart(
  internal_link_value,
  external_link_value,
  nofollow_link_value,
  dofollow_link_value
) {
  var ctx = document.getElementById("analyzer-chart").getContext("2d");
  if (analyzeChart != null) {
    analyzeChart.data.datasets[0].data = [
      internal_link_value,
      external_link_value,
      nofollow_link_value,
      dofollow_link_value,
    ];
    analyzeChart.update();
  } else {
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
}

const displayResultLinkAnalysis = (response) => {
  // console.log(response);
  const totalInternalLinks = response.data.internal_links.links.length;
  const totalExternalLinks = response.data.external_links.links.length;
  const totalNofollowLinks = response.data.nofollow_links.value;
  const totalDofollowLinks = response.data.dofollow_links.value;
  const totalLinks = response.data.links.value;
  const internalLinks = response.data.internal_links.links;
  const externalLinks = response.data.external_links.links;

  showLoading(false);
  resultElement.innerHTML = `
      <div class="result__container">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-6">
              <canvas id="analyzer-chart" width="408" height="187" class="chartjs-render-monitor"></canvas>
            </div>
            <div class="col-6 chart__info">
              <p>Total Links: <span id="total-links">`+ totalLinks +`</span></p>

              <div class="list__result-link">
                <div class="result__link">
                  <span class="badge__link internal__link"></span>
                  <p>Internal Link (<span id="internal-link">`+ totalInternalLinks +`</span>)</p>
                </div>

                <div class="result__link">
                  <span class="badge__link external__link"></span>
                  <p>External Link (<span id="external-link">`+ totalExternalLinks +`</span>)</p>
                </div>

                <div class="result__link">
                  <span class="badge__link no__follow"></span>
                  <p>No Follow (<span id="no-follow">`+ totalNofollowLinks +`</span>)</p>
                </div>

                <div class="result__link">
                  <span class="badge__link do__follow"></span>
                  <p>Do Follow (<span id="do-follow">`+ totalDofollowLinks +`</span>)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ul class="nav nav-pills detail__tabs" id="pills-tab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tab-internal-link" data-bs-toggle="pill" data-bs-target="#content-tab-internal-link" type="button" role="tab" aria-controls="content-tab-internal-link" aria-selected="true">
              Internal Links(`+ totalInternalLinks +`)
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-external-link" data-bs-toggle="pill" data-bs-target="#content-tab-external-link" type="button" role="tab" aria-controls="content-tab-external-link" aria-selected="false">
              External Links(`+ totalExternalLinks +`)
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-no-follow" data-bs-toggle="pill" data-bs-target="#content-tab-no-follow" type="button" role="tab" aria-controls="content-tab-no-follow" aria-selected="false">
              No-Follow(`+ totalNofollowLinks +`)
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-do-follow" data-bs-toggle="pill" data-bs-target="#content-tab-do-follow" type="button" role="tab" aria-controls="content-tab-do-follow" aria-selected="false">
              Do-Follow(`+ totalDofollowLinks +`)
            </button>
          </li>
        </ul>

        <div class="tab-content" id="pills-tabContent">
          <div class="tab-pane fade show active" id="content-tab-internal-link" role="tabpanel" aria-labelledby="tab-internal-link">
            <div class="list__links">
              ${internalLinks.map((link, index) => `
                  <div class="list__link">
                      <span>${index + 1} .</span>
                      <span>${link.url}</span>
                  </div>
                  ${index % 5 === 4 ? '<div class="list__link"><span class="list__link-space">---</span></div>' : ''}
              `).join('')}
              <div class="list__link">
                <span>1 .</span>
                <span>https://cmlabs.co/#content</span>
              </div>
              <div class="list__link">
                <span class="list__link-space">---</span>
              </div>
              <div class="list__link">
                <span>8 .</span>
                <span>https://cmlabs.co/karir</span>
              </div>
            </div>
          </div>
          <div class="tab-pane fade" id="content-tab-external-link" role="tabpanel" aria-labelledby="tab-external-link">
            tab 2
          </div>
          <div class="tab-pane fade" id="content-tab-no-follow" role="tabpanel" aria-labelledby="tab-no-follow">
            tab 3
          </div>
          <div class="tab-pane fade" id="content-tab-do-follow" role="tabpanel" aria-labelledby="tab-do-follow">
            do follow
          </div>
        </div>

        <div class="details__container">
          <a href="`+ domainURL + "/en/link-analyzer?url=" + inputUrl +`" target="_blank" class="see__details">Want to see more details? See details</a>
          <img src="../../assets/icon/external-link.svg" alt="icon arrow" class="detail__icon">
        </div>
      </div>
  `;
  
  createChart(
    totalInternalLinks,
    totalExternalLinks,
    totalNofollowLinks,
    totalDofollowLinks
  );

  // List Internal Link
  // const internalList = document.createElement("ul");
  // internalList.classList.add("internal-links");
  // resultElement.appendChild(internalList);

  // internalLinks.forEach((link) => {
  //   const listItem = document.createElement("li");
  //   listItem.textContent = `(${link.url})`;
  //   internalList.appendChild(listItem);
  // });

  // List External Link
  // const externalList = document.createElement("ul");
  // externalList.classList.add("external-links");
  // resultElement.appendChild(externalList);

  // externalLinks.forEach((link) => {
  //   const listItem = document.createElement("li");
  //   listItem.textContent = `(${link.url})`;
  //   externalList.appendChild(listItem);
  // });

  logButton.classList.remove("d-none");
  logButton.classList.add("d-block");

  const message = {
    event: "onResetResponse",
    data: null,
  };
  chrome.runtime.sendMessage(message);
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