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

  const finalUrl = response.lighthouseResult.finalUrl;
  const userAgent = response.lighthouseResult.userAgent;
  const fetchTime = response.lighthouseResult.fetchTime;

  resultElement.innerHTML = `
    <p>Final URL: ${finalUrl}</p>
    <p>User Agent: ${userAgent}</p>
    <p>Fetch Time: ${fetchTime}</p>
  `;
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
