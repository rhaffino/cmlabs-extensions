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

  const internalLinks = response.data.internal_links.links;
  const externalLinks = response.data.external_links.links;
  const dofollowLinks = response.data.dofollow_links.value;
  const nofollowLinks = response.data.nofollow_links.value;
  const totalLinks = response.data.links.value;

  // total
  const totalLinksParagraph = document.createElement("p");
  totalLinksParagraph.textContent = `Total links: ${totalLinks}`;
  resultElement.appendChild(totalLinksParagraph);

  // dofollow
  const dofollowLinksParagraph = document.createElement("p");
  dofollowLinksParagraph.textContent = `Dofollow Links: ${dofollowLinks}`;
  resultElement.appendChild(dofollowLinksParagraph);

  // nofollow
  const nofollowLinksParagraph = document.createElement("p");
  nofollowLinksParagraph.textContent = `Nofollow Links: ${nofollowLinks}`;
  resultElement.appendChild(nofollowLinksParagraph);

  // internal
  const internalLinksParagraph = document.createElement("p");
  internalLinksParagraph.textContent = `Internal Links: ${internalLinks.length}`;
  resultElement.appendChild(internalLinksParagraph);

  // external
  const externalLinksParagraph = document.createElement("p");
  externalLinksParagraph.textContent = `External Links: ${externalLinks.length}`;
  resultElement.appendChild(externalLinksParagraph);

  const hr = document.createElement("hr");
  resultElement.appendChild(hr);

  // internal
  const internalLinksParagraph2 = document.createElement("p");
  internalLinksParagraph2.textContent = `Internal Link:`;
  resultElement.appendChild(internalLinksParagraph2);

  const internalList = document.createElement("ul");
  internalList.classList.add("internal-links");
  resultElement.appendChild(internalList);

  internalLinks.forEach((link) => {
    const listItem = document.createElement("li");
    listItem.textContent = `(${link.url})`;
    internalList.appendChild(listItem);
  });

  // external
  const externalLinksParagraph2 = document.createElement("p");
  externalLinksParagraph2.textContent = `External Links:`;
  resultElement.appendChild(externalLinksParagraph2);

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
