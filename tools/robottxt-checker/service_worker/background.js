import postToAnalyze from "./utils/postToAnalyze.js";
import validateAndExtractBaseUrl from "./utils/validateUrl.js";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.clear(() => {
    console.log("Fresh like new!");
  });
});

chrome.runtime.onMessage.addListener((message) => {
  const { event, data } = message;

  switch (event) {
    case "OnStartLinkAnalysis":
      chrome.storage.local.set({
        response: null,
      });
      processAnalyze(data.url);
      console.log("OnStartLinkAnalysis");
      break;
    default:
      console.log("Unknown event");
  }
});

const processAnalyze = async (url) => {
  const baseUrl = validateAndExtractBaseUrl(url);

  if (baseUrl) {
    console.log("Valid URL", baseUrl);

    const data = await postToAnalyze(baseUrl);

    if (data) {
      console.log("Success to post to analyze", JSON.stringify(data));

      chrome.storage.local.set({
        response: data,
      });

      const message = {
        event: "OnFinishLinkAnalysis",
        status: true,
        response: data,
      };
      chrome.runtime.sendMessage(message);
    } else {
      console.log("Failed to post to analyze");

      const message = {
        event: "OnFinishLinkAnalysis",
        status: false,
        info: "Gosh, its failed, please try again!",
        data: null,
      };
      chrome.runtime.sendMessage(message);
    }
  } else {
    console.log("Invalid URL");

    const message = {
      event: "OnFinishLinkAnalysis",
      status: false,
      info: "Oops, sorry not valid url mate!",
      data: null,
    };
    chrome.runtime.sendMessage(message);
  }
};
