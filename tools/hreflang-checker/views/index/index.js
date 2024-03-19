const logButton = document.getElementById("log-button");
const resultElement = document.getElementById("result");
const navbar = document.getElementById("navbar");
const header = document.getElementById("header");
const btnCrawlingStatus = document.getElementById("crawling-status");
const readLatestBlog = document.getElementById("read__latest-blog");
const previewDetail = document.getElementById("preview-detail");
const popupContainer = document.getElementById("popup_container");
const btnLimit = document.getElementById("btn-limit");
const alertLimit = document.getElementById("alert-limit");

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

  popupContainer.style.width = "500px";
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
        const message = {
          event: "OnStartLinkAnalysis",
          data: {
            url: currentUrl,
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

  header.classList.remove("d-flex");
  header.classList.add("d-none");
  btnCrawlingStatus.classList.remove("d-block");
  btnCrawlingStatus.classList.add("d-none");
  readLatestBlog.classList.remove("d-block");
  readLatestBlog.classList.add("d-none");
  previewDetail.classList.remove("d-none");
  previewDetail.classList.add("d-block");

  const resultDiv = document.createElement("div");

  navbar.style.width = "auto";

  if (data.length === 0) {
    const p = document.createElement("p");
    p.className = "mt-3";
    p.textContent = "There is no hreflang found";
    resultDiv.appendChild(p);
  } else {
    popupContainer.style.width = "auto";

    const table = document.createElement("table");
    table.className = "table table__result mt-3";

    const thead = document.createElement("thead");

    const tr = document.createElement("tr");

    ["No", "URL", "Hreflang", "Language", "Region"].forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    data.forEach((item, index) => {
      const tr = document.createElement("tr");
      const tdNo = document.createElement("td");
      const span = document.createElement("span");

      span.className = "badge__number";
      span.textContent = index + 1;

      tdNo.appendChild(span);

      const tdUrl = document.createElement("td");
      tdUrl.style.whiteSpace = "nowrap";
      const a = document.createElement("a");

      a.href = item.url;
      a.textContent = item.url;

      tdUrl.appendChild(a);

      const tdHreflang = document.createElement("td");
      tdHreflang.textContent = item.hreflang;

      const tdLanguage = document.createElement("td");
      tdLanguage.textContent = item.language.name;

      const tdRegion = document.createElement("td");
      tdRegion.style.whiteSpace = "nowrap";
      tdRegion.innerHTML = item.location ? item.location.name : "<span class='text-center d-block'>-</span>";

      [tdNo, tdUrl, tdHreflang, tdLanguage, tdRegion].forEach((td) => {
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    resultDiv.appendChild(table);
  }

  resultElement.appendChild(resultDiv);

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
