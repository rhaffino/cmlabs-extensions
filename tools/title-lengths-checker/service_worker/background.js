import postToAnalyze from "./utils/postToAnalyze.js";
import validateAndExtractBaseUrl from "./utils/validateUrl.js";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.clear(() => {});
});

chrome.runtime.onMessage.addListener((message) => {
  const { event, data } = message;

  switch (event) {
    case "OnStartTitleLengthChecker":
      chrome.storage.local.set({
        response: null,
      });
      processAnalyze(data.url);
      break;
    default:
  }
});

const processAnalyze = async (url) => {
  const baseUrl = validateAndExtractBaseUrl(url);

  if (baseUrl) {
    const data = await postToAnalyze(baseUrl);

    if (data && data.statusCode && data.statusCode == 200) {
      chrome.storage.local.set({
        response: data,
      });

      const message = {
        event: "OnFinishTitleLengthChecker",
        status: true,
        response: data,
      };
      chrome.runtime.sendMessage(message);
    } else if (
      data &&
      data.statusCode &&
      data.statusCode == 400 &&
      data.message == "URL is Invalid"
    ) {
      const message = {
        event: "OnFinishTitleLengthChecker",
        status: false,
        info: data.message,
        data: null,
      };
      chrome.runtime.sendMessage(message);
    } else {
      const message = {
        event: "OnFinishTitleLengthChecker",
        status: false,
        info: "Gosh, its failed, please try again!",
        data: null,
      };
      chrome.runtime.sendMessage(message);
    }
  } else {
    const message = {
      event: "OnFinishTitleLengthChecker",
      status: false,
      info: "Oops, sorry not valid url!",
      data: null,
    };
    chrome.runtime.sendMessage(message);
  }
};
