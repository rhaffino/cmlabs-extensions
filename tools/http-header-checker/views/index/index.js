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

// function createChart(
//   internal_link_value,
//   external_link_value,
//   nofollow_link_value,
//   dofollow_link_value
// ) {
//   var ctx = document.getElementById("analyzer-chart").getContext("2d");
//   analyzeChart = new Chart(ctx, {
//     type: "doughnut",
//     data: {
//       labels: ["Internal Links", "External Links", "No-Follow", "Do-Follow"],
//       datasets: [
//         {
//           label: "# of Votes",
//           data: [
//             internal_link_value,
//             external_link_value,
//             nofollow_link_value,
//             dofollow_link_value,
//           ],
//           backgroundColor: ["#4CAAF7", "#FFCB66", "#B47AF1", "#F98181"],
//           borderColor: ["#4CAAF7", "#FFCB66", "#B47AF1", "#F98181"],
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       legend: {
//         display: false,
//         align: "start",
//         padding: 20,
//       },
//       scales: {
//         xAxes: [
//           {
//             display: false,
//           },
//         ],
//         yAxes: [
//           {
//             display: false,
//           },
//         ],
//       },
//       tooltips: {
//         backgroundColor: "#fff",
//         cornerRadius: 0,
//         displayColors: false,
//         titleFontFamily: "'Roboto', sans-serif",
//         titleFontColor: "#2A2F33",
//         bodyAlign: "center",
//         bodyFontFamily: "'Roboto', sans-serif",
//         bodyFontColor: "#2A2F33",
//         bodyFontStyle: "normal",
//       },
//     },
//   });
// }

// Display Result Link Analyzer
const displayResultLinkAnalysis = (response) => {
  showLoading(false);
  const headers = response.data;

  let resultHTML = `
    <div class="result__container">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-12 chart__info">
            <p class='fs-6'>HTTP Header Response</p>
            <div class="list__result-link">
  `;

  for (const [key, value] of Object.entries(headers)) {
    resultHTML += `
      <div class="result__link">
        <p><span class='fw-bold'>${key}:</span> <span class='text-break fw-normal'>${value}</span></p>
      </div>
    `;
  }

  resultHTML += `
            </div>
          </div>
        </div>
      </div>
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
