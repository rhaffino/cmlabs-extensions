import postToAnalyze from "./utils/postToAnalyze.js";
import validateAndExtractBaseUrl from "./utils/validateUrl.js";

let tempCount;
let tempLastFetchTime;

chrome.runtime.onInstalled.addListener((details) => {
  // ambil data sebelumnya
  chrome.storage.local.get(["count", "lastFetchTime"], (result) => {
    console.log("GET LAST DATA");
    if (result.count) {
      tempCount = result.count;
    }
    if (result.lastFetchTime) {
      tempLastFetchTime = new Date(result.lastFetchTime);
    }

    // clear storage setelah data sebelumnya diambil
    chrome.storage.local.clear(() => {
      console.log("Fresh like new!");

      // jika ga ada, set init
      if (!tempCount) {
        tempCount = 0;
      }
      if (!tempLastFetchTime) {
        tempLastFetchTime = null;
      }

      chrome.storage.local.set(
        {
          isDataFetched: false,
          count: tempCount,
          lastFetchTime: tempLastFetchTime.toString(),
        },
        () => {
          console.log("isDataFetched and fetch count data init");
        }
      );
    });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  const { event, data } = message;

  switch (event) {
    case "OnStartTitleLengthChecker":
      console.log("OnStartTitleLengthChecker");
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
  chrome.storage.local.get(["count", "lastFetchTime"]).then(async (result) => {
    let count = result.count || 0;
    let lastFetchTime = result.lastFetchTime
      ? new Date(result.lastFetchTime)
      : null;

    // Limit 5
    const currentTime = new Date();

    if (count >= 5) {
      const timeDifference = currentTime - lastFetchTime;
      const timeDifferenceInHours = timeDifference / 1000 / 60 / 60;
      if (timeDifferenceInHours < 1) {
        console.log("Reach Limit :3");
        const message = {
          event: "OnFinishTitleLengthChecker",
          status: false,
          info: "You have reached the usage limit of this tool",
          data: null,
        };
        chrome.runtime.sendMessage(message, () => {
          if (chrome.runtime.lastError) {
          }
        });
        return;
      } else {
        count = 0;
        lastFetchTime = currentTime.toString();

        chrome.storage.local.set({
          count: count,
          lastFetchTime: lastFetchTime,
        });

        console.log("Limit reset :3");
      }
    }

    const baseUrl = validateAndExtractBaseUrl(url);
  
    if (baseUrl) {
      console.log("Valid URL", baseUrl);

      chrome.storage.local.set({ isDataFetched: true }, () => {
        console.log("isDataFetched saved as true.");
      });
      
      const data = await postToAnalyze(baseUrl);
  
      if (data && data.statusCode && data.statusCode == 200) {
        const message = {
          event: "OnFinishTitleLengthChecker",
          status: true,
          response: data,
        };

        count++;
        lastFetchTime = currentTime.toString();

        chrome.storage.local.set({
          count: count,
          lastFetchTime: lastFetchTime,
        });

        chrome.runtime.sendMessage(message, () => {
          if (chrome.runtime.lastError) {
            chrome.storage.local.set({ response: data });
          }
        });
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
  })
};

const resetLocal = () => {
  chrome.storage.local.set({ response: null }, () => {
    console.log("response set to null.");
    chrome.storage.local.set({ isDataFetched: false }, () => {
      console.log("isDataFetched saved as false.");
    });
  });
};