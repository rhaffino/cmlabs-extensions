import postToAnalyze from "./utils/postToAnalyze.js";
import validateAndExtractBaseUrl from "./utils/validateUrl.js";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.clear(() => {
    console.log("Fresh like new!");
    chrome.storage.local.set(
      {
        isDataFetched: false,
      },
      () => {
        console.log("isDataFetched init");
      }
    );
  });
});

chrome.runtime.onMessage.addListener((message) => {
  const { event, data } = message;

  switch (event) {
    case "OnStartLinkAnalysis":
      console.log("OnStartLinkAnalysis");
      chrome.storage.local.set({
        response: null,
      });
      processAnalyze(data.url);
      break;
    case "onResetResponse":
      resetLocal();
      break;
    default:
      console.log("Unknown event", event);
  }
});

const processAnalyze = async (url) => {
  const baseUrl = validateAndExtractBaseUrl(url);

  if (baseUrl) {
    console.log("Valid URL", baseUrl);

    chrome.storage.local.set({ isDataFetched: true }, () => {
      console.log("isDataFetched saved as true.");
    });

    const data = await postToAnalyze(baseUrl);

    if (data) {
      console.log("Success to post to analyze", JSON.stringify(data));

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
      console.log("Failed to post to analyze");

      const message = {
        event: "OnFinishLinkAnalysis",
        status: false,
        info: "Something went wrong, please try again!",
        data: null,
      };
      chrome.runtime.sendMessage(message);
    }
  } else {
    console.log("Invalid URL");

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
