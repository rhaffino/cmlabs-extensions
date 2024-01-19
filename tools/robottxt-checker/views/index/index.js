// loading
const loadingElement = document.getElementById("loading");

// result
const resultElement = document.getElementById("result");

document.getElementById("url-form").addEventListener("submit", (event) => {
  event.preventDefault();

  loadingElement.style.display = "block";
  resultElement.innerHTML = "";

  const url = document.getElementById("url-input").value;
  console.log(url);

  const message = {
    event: "OnStartLinkAnalysis",
    data: {
      url,
    },
  };

  chrome.runtime.sendMessage(message);
});

chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        displayResultLinkAnalysis(response);
      } else {
        loadingElement.style.display = "none";
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

const displayResultLinkAnalysis = (response) => {
  console.log(response);

  loadingElement.style.display = "none";
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
  loadingElement.style.display = "block";
  resultElement.innerHTML = "";

  chrome.storage.local.get(["response"], (result) => {
    loadingElement.style.display = "none";

    if (result.response) {
      displayResultLinkAnalysis(result.response);
    } else {
      const noHistoryParagraph = document.createElement("p");
      noHistoryParagraph.textContent = "No histories";
      resultElement.appendChild(noHistoryParagraph);
    }
  });
};

checkLocalStorage();
