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
        const user_agent = document.getElementById("agent-type").value;

        const message = {
          event: "OnStartLinkAnalysis",
          data: {
            url: currentUrl,
            user_agent: user_agent,
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

  data.redirects.forEach((redirect) => {
    const p = document.createElement("p");
    const url = document.createTextNode(`URL: ${redirect.url}`);
    const status = document.createElement("span");
    status.textContent = `${redirect.status}`;
    const date = document.createTextNode(`Date: ${redirect.date}`);

    let statusClass = "";
    if (redirect.status >= 200 && redirect.status < 300) {
      statusClass = "badge bg-primary";
    } else if (redirect.status >= 400 && redirect.status < 500) {
      statusClass = "badge bg-danger";
    }

    status.className = statusClass;
    status.style.color = "white";

    p.appendChild(url);
    p.appendChild(document.createElement("br"));
    p.appendChild(document.createTextNode("Status: "));
    p.appendChild(status);
    p.appendChild(document.createElement("br"));
    p.appendChild(date);

    resultDiv.appendChild(p);
  });

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
