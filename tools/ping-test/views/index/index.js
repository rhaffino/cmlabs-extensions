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
        const urlType = document.getElementById("url-type").value;

        const message = {
          event: "OnStartLinkAnalysis",
          data: {
            url: currentUrl,
            type: urlType,
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
  resultDiv.style.backgroundColor = "#f8f9fa";
  resultDiv.style.padding = "10px";
  resultDiv.style.marginBottom = "10px";

  // Memisahkan output "\n---"
  const outputParts = data.output.split("\n---");
  const timeOutput = outputParts[0].trim();
  const pingStatisticOutput = outputParts[1].split("\n")[1].trim();

  resultDiv.innerHTML = `
    <p><strong>Result:</strong> ${data.alive ? "Online" : "Offline"}</p>
    <p><strong>Response Time:</strong> ${data.time} ms</p>
    <p><strong>Domain:</strong> ${data.host}</p>
    <p><strong>IP Address:</strong> ${data.numeric_host}</p>
    <p><strong>Time:</strong> ${timeOutput}</p>
    <p><strong>Ping Statistic:</strong> ${pingStatisticOutput}</p>
  `;

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
