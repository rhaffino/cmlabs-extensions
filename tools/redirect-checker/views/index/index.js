const domainURL = "https://tools.cmlabs.co";
let inputUrl = "";
const logButton = document.getElementById("log-button");
const resultElement = document.getElementById("result");
const navbar = document.getElementById("navbar");
const header = document.getElementById("header");
const btnCrawlingStatus = document.getElementById("crawling-status");
const readLatestBlog = document.getElementById("read__latest-blog");
const previewDetail = document.getElementById("preview-detail");
const btnLimit = document.getElementById("btn-limit");
const alertLimit = document.getElementById("alert-limit");
const consultationBox = document.getElementById("consultation-box");

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

  logButton.classList.remove("d-block");
  logButton.classList.add("d-none");
  header.classList.remove("d-none");
  header.classList.add("d-flex");
  btnCrawlingStatus.classList.remove("d-none");
  btnCrawlingStatus.classList.add("d-block");
  readLatestBlog.classList.remove("d-none");
  readLatestBlog.classList.add("d-block");
  previewDetail.classList.remove("d-block");
  previewDetail.classList.add("d-none");

  const isDataFetched = await checkFetchStatus();

  setTimeout(() => {
    if (isDataFetched) {
    } else {
      tabChrome().then((currentUrl) => {
        // const user_agent = document.getElementById("agent-type").value;

        const message = {
          event: "OnStartLinkAnalysis",
          data: {
            url: currentUrl,
            user_agent: "",
          },
        };

        console.log(JSON.stringify(message));
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

// Check Daily Use
const checkDailyUse = () => {
  chrome.storage.local.get(["thirdUseTime"], (result) => {
    let thirdUseTime = result.thirdUseTime
      ? JSON.parse(result.thirdUseTime)
      : null;

    if (thirdUseTime && thirdUseTime.countThirdTime === 3) {
      const timeDifference = new Date() - new Date(thirdUseTime.last);
      const timeDifferenceInHours = timeDifference / 1000 / 60 / 60;

      if (timeDifferenceInHours < 24) {
        consultationBox.classList.remove("d-none");
        consultationBox.classList.add("d-block");
      } else {
        consultationBox.classList.remove("d-block");
        consultationBox.classList.add("d-none");
      }
    }
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
  const loadingElement = document.getElementById("loading");

  if (status) {
    consultationBox.classList.remove("d-block");
    consultationBox.classList.add("d-none");
    loadingElement.classList.remove("d-none");
    loadingElement.classList.add("d-block");
  } else {
    loadingElement.classList.remove("d-block");
    loadingElement.classList.add("d-none");
  }
};

const displayResultLinkAnalysis = (response) => {
  const data = response.data;

  showLoading(false);
  checkDailyUse();

  header.classList.remove("d-flex");
  header.classList.add("d-none");
  btnCrawlingStatus.classList.remove("d-block");
  btnCrawlingStatus.classList.add("d-none");
  readLatestBlog.classList.remove("d-block");
  readLatestBlog.classList.add("d-none");
  previewDetail.classList.remove("d-none");
  previewDetail.classList.add("d-block");

  if (data.length === 0) {
    // Hide Link Preview Details
    previewDetail.classList.add("d-none");
    previewDetail.classList.remove("d-block");
  }else{
    const linkDetails = document.getElementById('link-preview-detail')
    // Update Link Url Details
    linkDetails.href = domainURL +"/en/redirect-checker?url=" + inputUrl.replace(/\/$/, "") +"&auto=true";

    const table = document.createElement("table");
    table.className = "table table__result mt-3";
    table.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    thead.style.backgroundColor = "#F9F9F9";
    const tr = document.createElement("tr");

    const headers = ["URL", "Date", "Status"];
    const alignments = ["left", "left", "right"];

    headers.forEach((headerText, index) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      th.style.textAlign = alignments[index];
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    data.redirects.forEach((redirect) => {
      const tr = document.createElement("tr");

      const tdUrl = document.createElement("td");
      const a = document.createElement("a");

      a.href = redirect.url;
      a.textContent = redirect.url;

      tdUrl.style.textAlign = "left";
      tdUrl.appendChild(a);
      tr.appendChild(tdUrl);

      const tdDate = document.createElement("td");
      tdDate.textContent = redirect.date;
      tdDate.style.textAlign = "left";
      tr.appendChild(tdDate);

      const tdStatus = document.createElement("td");
      tdStatus.style.textAlign = "right";
      const span = document.createElement("span");
      span.textContent = redirect.status;

      if (redirect.status >= 200 && redirect.status < 300) {
        span.className = "badge badge__status badge__success";
      } else if (redirect.status >= 300 && redirect.status < 400) {
        span.className = "badge badge__status badge__warning";
      } else if (redirect.status >= 400 && redirect.status <= 500) {
        span.className = "badge badge__status badge__danger";
      } else {
        span.className = "badge badge__status badge__none";
        span.textContent = "n/a";
      }

      tdStatus.appendChild(span);
      tr.appendChild(tdStatus);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    resultElement.appendChild(table);
  }


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

chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        displayResultLinkAnalysis(response);
      } else {
        showLoading(false);
        resultElement.innerHTML = "";

        alertLimit.classList.add("d-block");
        alertLimit.classList.remove("d-none");
        btnLimit.classList.add("d-flex");
        btnLimit.classList.remove("d-none");
        logButton.classList.add("d-none");
        logButton.classList.remove("d-block");
        btnCrawlingStatus.classList.remove("d-block");
        btnCrawlingStatus.classList.add("d-none");
      }
      break;
    default:
  }
});
