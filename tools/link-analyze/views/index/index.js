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

  const internalLinks = response.data.internal_links.links;
  const externalLinks = response.data.external_links.links;

  // internal
  const internalLinksParagraph = document.createElement("p");
  internalLinksParagraph.textContent = "Internal Links:";
  resultElement.appendChild(internalLinksParagraph);

  const internalList = document.createElement("ul");
  internalList.classList.add("internal-links");
  resultElement.appendChild(internalList);

  internalLinks.forEach((link) => {
    const listItem = document.createElement("li");
    listItem.textContent = `(${link.url})`;
    internalList.appendChild(listItem);
  });

  // external
  const externalLinksParagraph = document.createElement("p");
  externalLinksParagraph.textContent = "External Links:";
  resultElement.appendChild(externalLinksParagraph);

  const externalList = document.createElement("ul");
  externalList.classList.add("external-links");
  resultElement.appendChild(externalList);

  externalLinks.forEach((link) => {
    const listItem = document.createElement("li");
    listItem.textContent = `(${link.url})`;
    externalList.appendChild(listItem);
  });
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
