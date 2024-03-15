import postToAnalyze from "./utils/postToAnalyze.js";
import validateAndExtractBaseUrl from "./utils/validateUrl.js";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set(
    {
      isDataFetched: false,
    },
    () => {
      console.log("isDataFetched init");
    }
  );
});

// Event Analyze
chrome.runtime.onMessage.addListener((message) => {
  const { event, data } = message;

  switch (event) {
    case "OnStartLinkAnalysis":
      chrome.storage.local.set({
        response: null,
      });
      processAnalyze(data.url);
      break;
    case "onResetResponse":
      resetLocal();
      break;
    default:
  }
});

const processAnalyze = async (url) => {
  const baseUrl = validateAndExtractBaseUrl(url);

  if (baseUrl) {
    chrome.storage.local.set({ isDataFetched: true }, () => {
      console.log("isDataFetched saved as true.");
    });

    console.log(baseUrl);

    const data = await postToAnalyze(baseUrl);

    if (data) {
      console.log(JSON.stringify(data));
      const message = {
        event: "OnFinishLinkAnalysis",
        status: true,
        response: data,
      };
      chrome.runtime.sendMessage(message, () => {
        if (chrome.runtime.lastError) {
          chrome.storage.local.set({ response: data });
        }
      });
    } else {
      const message = {
        event: "OnFinishLinkAnalysis",
        status: false,
        info: "Something went wrong, please try again!",
        data: null,
      };
      chrome.runtime.sendMessage(message);
    }
  } else {
    const message = {
      event: "OnFinishLinkAnalysis",
      status: false,
      info: "The url is invalid! please provide with the correct URL.",
      data: null,
    };
    chrome.runtime.sendMessage(message);
  }
};

const resetLocal = () => {
  chrome.storage.local.set({ response: null }, () => {
    console.log("response set to null.");
    chrome.storage.local.set({ isDataFetched: false }, () => {
      console.log("isDataFetched saved as false.");
    });
  });
};
