// Main
const checkerElement = document.getElementById("title-length-checker");

// Loading
const loadingElement = document.getElementById("loading");

// Result
const resultElement = document.getElementById("result-container");

// URL Value
let urlValue = "";

// Title and Desc
const titleElement = document.getElementById("title");
const descElement = document.getElementById("desc");

document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    urlValue = currentUrl;
  });

  launch();
});

const launch = () => {
  showResult(false);
  showLoading(true);

  tabChrome().then((currentUrl) => {
    const message = {
      event: "OnStartTitleLengthChecker",
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
    case "OnFinishTitleLengthChecker":
      if (status) {
        displayResultTitleLengthChecker(response);
      } else {
        const checkError = document.getElementById("error-paragraph");
        if (!checkError) {
          const errorParagraph = document.createElement("p");
          errorParagraph.id = "error-paragraph";
          errorParagraph.className = "text-center text-lg mt-error";
          errorParagraph.textContent = info;
          checkerElement.appendChild(errorParagraph);
        }
        showLoading(false);
        showResult(false);
      }
      break;
    default:
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
    loadingElement.classList.remove("d-none");
    loadingElement.classList.add("d-flex");
  } else {
    loadingElement.classList.remove("d-flex");
    loadingElement.classList.add("d-none");
  }
};

const showResult = (status) => {
  if (status) {
    resultElement.classList.remove("d-none");
    descElement.style.height = "auto";
    descElement.style.height = descElement.scrollHeight + "px";
  } else {
    resultElement.classList.add("d-none");
  }
};

const displayResultTitleLengthChecker = (response) => {
  if (
    titleElement &&
    descElement &&
    response &&
    response.data &&
    response.data.title &&
    response.data.description
  ) {
    titleElement.value = response.data.title;
    descElement.value = response.data.description;
  }
  showLoading(false);
  showResult(true);
};
