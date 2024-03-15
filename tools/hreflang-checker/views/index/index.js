const logButton = document.getElementById("submit-btn");
const resultElement = document.getElementById("result");

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
      logButton.classList.remove("d-block");
      logButton.classList.add("d-none");
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

  const resultDiv = document.createElement("div");

  if (data.length === 0) {
    const p = document.createElement("p");
    p.textContent = "There is no hreflang found";
    resultDiv.appendChild(p);
  } else {
    const table = document.createElement("table");
    table.className = "table";
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
      tdNo.textContent = index + 1;
      const tdUrl = document.createElement("td");
      tdUrl.textContent = item.url;
      const tdHreflang = document.createElement("td");
      tdHreflang.textContent = item.hreflang;
      const tdLanguage = document.createElement("td");
      tdLanguage.textContent = item.language.name;
      const tdRegion = document.createElement("td");
      tdRegion.textContent = item.location ? item.location.name : "-";
      [tdNo, tdUrl, tdHreflang, tdLanguage, tdRegion].forEach((td) =>
        tr.appendChild(td)
      );
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultDiv.appendChild(table);
  }

  resultElement.appendChild(resultDiv);

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
      }
      break;
    default:
  }
});
