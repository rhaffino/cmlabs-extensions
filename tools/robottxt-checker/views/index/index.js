// loading
const loadingElement = document.getElementById("loading");

// result
const resultElement = document.getElementById("result");

document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    var urlContainer = document.getElementById("url-input");
    urlContainer.value = currentUrl;
  });

  var logButton = document.getElementById("submit-btn");
  logButton.addEventListener("click", function () {
    launch();
  });
});

const launch = () => {
  showLoading(true);

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
      console.log("Unknown event");
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
    loadingElement.style.display = "block";
  } else {
    loadingElement.style.display = "none";
  }
};

const displayResultLinkAnalysis = (response) => {
  console.log(response);

  showLoading(false);
  resultElement.innerHTML = "";

  if (
    response &&
    response.data &&
    response.data[0] &&
    response.data[0].robots
  ) {
    const robots = response.data[0].robots;

    const robotsUrlParagraph = document.createElement("p");
    robotsUrlParagraph.textContent = "Robots URL:";

    const robotsUrlLink = document.createElement("a");
    robotsUrlLink.href = robots.url;
    robotsUrlLink.textContent = robots.url;

    robotsUrlParagraph.appendChild(robotsUrlLink);

    const allowOnNeutralParagraph = document.createElement("p");
    allowOnNeutralParagraph.textContent = "Allow on neutral:";

    const allowOnNeutralText = document.createElement("span");
    allowOnNeutralText.textContent = robots.allowOnNeutral ? "Yes" : "No";

    allowOnNeutralParagraph.appendChild(allowOnNeutralText);

    const rawRobotsParagraph = document.createElement("p");
    rawRobotsParagraph.textContent = "Raw robots.txt:";

    const rawRobotsTextArea = document.createElement("textarea");
    rawRobotsTextArea.textContent = robots.rawRobots;

    rawRobotsTextArea.style.minWidth = "300px";
    rawRobotsTextArea.style.minHeight = "200px";

    rawRobotsParagraph.appendChild(rawRobotsTextArea);

    document.body.appendChild(robotsUrlParagraph);
    document.body.appendChild(allowOnNeutralParagraph);
    document.body.appendChild(rawRobotsParagraph);
  }
};

const checkLocalStorage = () => {
  showLoading(true);
  resultElement.innerHTML = "";

  chrome.storage.local.get(["response"], (result) => {
    showLoading(false);

    if (result.response) {
      displayResultLinkAnalysis(result.response);
    } else {
      launch();
    }
  });
};

checkLocalStorage();
