const domainURL = "https://tools.cmlabs.co";
const headerHero = document.getElementById("header");
const alertLimit = document.getElementById("alert-limit");
const btnLimit = document.getElementById("btn-limit");
const logButton = document.getElementById("log-button");
const resultElement = document.getElementById("result");
const crawlingElement = document.getElementById("crawling-status");
const chartElement = document.getElementById("mobile-friendly-tab");
const readLatestBlog = document.getElementById("read__latest-blog");
const previewDetail = document.getElementById("preview-detail");
const consultationBox = document.getElementById("consultation-box");

const mobileScoreId = document.getElementById("mobile-score");
const mobileEmulation = document.getElementById("mobile-emulation");
const speedIndexValueId = document.getElementById("speedIndexValue");
const speedIndexDesc = document.getElementById("speedIndexDesc");
const mobile_indicator_1 = document.getElementById("mobileFriendlyIcon");
const mobile_indicator_2 = document.getElementById("notMobileFriendlyIcon");

// Add Box Shadow Navbar
const shadowHeader = () => {
  const navbar = document.getElementById("navbar");
  // When the scroll is greater than 50 viewport height, add the shadow-navbar class
  this.scrollY >= 50
    ? navbar.classList.add("shadow-navbar")
    : navbar.classList.remove("shadow-navbar");
};
window.addEventListener("scroll", shadowHeader);

// Function check Chrome tab URL
function tabChrome() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var currentUrl = currentTab.url;

      resolve(currentUrl);
    });
  });
}

// Load DOM Extension
document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    var urlContainer = document.getElementById("url-container");
    urlContainer.innerText = currentUrl;
  });

  logButton.addEventListener("click", function () {
    launch();
  });

  checkLocalStorage();
});

// Run Extension
const launch = async () => {
  showLoading(true);
  resultElement.innerHTML = "";

  const isDataFetched = await checkFetchStatus();
  setTimeout(() => {
    if (isDataFetched) {
      crawlingElement.classList.add("d-flex");
      crawlingElement.classList.remove("d-none");
    } else {
      tabChrome().then((currentUrl) => {
        const message = {
          event: "OnStartLinkAnalysis",
          data: {
            url: currentUrl,
          },
        };

        chrome.runtime.sendMessage(message);
      });
    }
  }, 5000);
};

// Check Status Extension Service Worker
const checkFetchStatus = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["isDataFetched"], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.isDataFetched);
      }
    });
  });
};

// Check Daily Use
const checkDailyUse = () => {
  chrome.storage.local.get(["thirdUseTime"], (result) => {
    let thirdUseTime = result.thirdUseTime
      ? JSON.parse(result.thirdUseTime)
      : null;

    if (thirdUseTime && thirdUseTime.countThirdTime === 3) {
      const timeDifference = new Date() - new Date(thirdUseTime.last);
      const timeDifferenceInHours = timeDifference / 1000 / 60 / 60;

      if (timeDifferenceInHours < 24) {
        consultationBox.classList.remove("d-none");
        consultationBox.classList.add("d-block");
      } else {
        consultationBox.classList.remove("d-block");
        consultationBox.classList.add("d-none");
      }
    }
  });
};

// Local Storage
const checkLocalStorage = () => {
  showLoading(true);
  resultElement.innerHTML = "";

  chrome.storage.local.get(["response"], (result) => {
    showLoading(false);

    if (result.response) {
      renderResult(result.response);
    } else {
      showLoading(true);
      launch();
    }
  });
};

// Show / Hide Section
const showLoading = (status) => {
  var loading = document.getElementById("loading");
  if (status) {
    consultationBox.classList.remove("d-block");
    consultationBox.classList.add("d-none");
    headerHero.classList.remove("d-none");
    headerHero.classList.add("d-flex");
    loading.classList.remove("d-none");
    loading.classList.add("d-flex");
    chartElement.classList.remove("d-flex");
    chartElement.classList.add("d-none");
    logButton.classList.remove("d-flex");
    logButton.classList.add("d-none");
    previewDetail.classList.remove("d-flex");
    previewDetail.classList.add("d-none");
    crawlingElement.classList.add("d-flex");
    crawlingElement.classList.remove("d-none");
    readLatestBlog.classList.remove("d-none");
    readLatestBlog.classList.add("d-block");
  } else {
    headerHero.classList.remove("d-block");
    headerHero.classList.add("d-none");
    loading.classList.remove("d-flex");
    loading.classList.add("d-none");
    chartElement.classList.remove("d-none");
    chartElement.classList.add("d-flex");
    logButton.classList.remove("d-none");
    logButton.classList.add("d-flex");
    previewDetail.classList.remove("d-none");
    previewDetail.classList.add("d-flex");
    crawlingElement.classList.add("d-none");
    crawlingElement.classList.remove("d-block");
    readLatestBlog.classList.remove("d-block");
    readLatestBlog.classList.add("d-none");
  }
};

// Display Result Pagespeed
function renderResult(data) {
  showLoading(false);
  checkDailyUse();
  resultElement.innerHTML = "";

  if (data) {
    // Show Current URL Check Pagespeed Detail
    var urlDetail = document.getElementById("link-preview-detail");
    urlDetail.setAttribute(
      "href",
      "" +
        domainURL +
        "/en/mobile-friendly-test?url=" +
        data.id.replace(/\/$/, "") +
        "&auto=true",
    );

    resultData(data);
    mobileIssues(data);

    logButton.classList.remove("d-none");
    logButton.classList.add("d-block");
    alertLimit.classList.remove("d-block");
    alertLimit.classList.add("d-none");
    previewDetail.classList.remove("d-none");
    previewDetail.classList.add("d-flex");
  }
}

function resultData(data) {
  let title, subtitle;
  let title_friendly = "Page is mobile friendly";
  let subtitle_friendly = "This page is easy to use on a mobile device";
  let title_not_friendly = "Page is not mobile friendly";
  let subtitle_not_friendly = "This page is difficult to use on a mobile device";
  let emulationInfoActive = "Mobile Emulation Actived";
  let emulationInfoNotActive = "Mobile Emulation Not Actived";
  let mob_speedIndex = "Speed Index shows how quickly the contents of a page are visibly populated.";

  const audits = data.lighthouseResult.audits;
  const AuditsViewport = audits["viewport"].score;
  const mobileScore = data.lighthouseResult.categories.performance.score * 100;
  const emulationInfo =
    data.lighthouseResult.configSettings.emulatedFormFactor === "mobile"
      ? emulationInfoActive
      : emulationInfoNotActive;
  const speedIndexValue = audits["speed-index"].displayValue;

  // Results Information
  mobileScoreId.textContent = Math.floor(mobileScore) + "%";
  mobileEmulation.textContent = emulationInfo;
  speedIndexValueId.textContent = speedIndexValue;
  speedIndexDesc.textContent = mob_speedIndex;

  mobile_indicator_1.classList.remove("d-none");

  mobile_indicator_2.classList.remove("d-none");

  if (AuditsViewport === 1) {
    title = title_friendly;
    subtitle = subtitle_friendly;
    mobile_indicator_2.classList.add("d-none");
    // If many problem issues you can have function openCta() but you can show after 100% progress bar {kalo bisa ini after 100% keluar cta nya klo tidak mobile friendly}
    // closeCta()
  } else {
    title = title_not_friendly;
    subtitle = subtitle_not_friendly;
    mobile_indicator_1.classList.add("d-none");
    // showCta()
  }

  // Results Header
  var result_date = document.getElementById("result-date");
  var result_title = document.getElementById("result-title");
  var result_subtitle = document.getElementById("result-subtitle");
  let date_now = formatDate(new Date());
  result_date.innerHTML = date_now;
  result_title.innerHTML = title;
  result_subtitle.innerHTML = subtitle;

  let indicatorMobileScore = document.getElementById("indicator-mobile-score");
  let textScore = document.getElementById("mobile-score");
  if (mobileScore >= 0 && mobileScore < 50) {
    indicatorMobileScore.classList.add("bg-red");
    indicatorMobileScore.classList.remove("bg-orange");
    indicatorMobileScore.classList.remove("bg-green");
    textScore.classList.add("text-red");
    textScore.classList.remove("text-yellow");
    textScore.classList.remove("text-green");
  } else if (mobileScore >= 50 && mobileScore < 90) {
    indicatorMobileScore.classList.remove("bg-red");
    indicatorMobileScore.classList.add("bg-orange");
    indicatorMobileScore.classList.remove("bg-green");
    textScore.classList.remove("text-red");
    textScore.classList.add("text-yellow");
    textScore.classList.remove("text-green");
  } else if (mobileScore >= 90) {
    indicatorMobileScore.classList.remove("bg-red");
    indicatorMobileScore.classList.remove("bg-orange");
    indicatorMobileScore.classList.add("bg-green");
    textScore.classList.remove("text-red");
    textScore.classList.remove("text-yellow");
    textScore.classList.add("text-green");
  }

  let emulatorMobile = data.lighthouseResult.configSettings.emulatedFormFactor;
  let indicatorEmulatorMobile = document.getElementById(
    "indicator-emulation-Mobile",
  );
  if (emulatorMobile === "mobile") {
    indicatorEmulatorMobile.classList.remove("bg-red");
    indicatorEmulatorMobile.classList.add("bg-green");
  } else {
    indicatorEmulatorMobile.classList.add("bg-red");
    indicatorEmulatorMobile.classList.remove("bg-green");
  }

  let speedIndexNumericValue = audits["speed-index"].numericValue;
  let indocatorSpeedIndex = document.getElementById("indicator-speed-index");
  let textSpeedIndexValue = document.getElementById("speedIndexValue");
  if (speedIndexNumericValue <= 3400) {
    indocatorSpeedIndex.classList.remove("bg-red");
    indocatorSpeedIndex.classList.remove("bg-orange");
    indocatorSpeedIndex.classList.add("bg-green");
    textSpeedIndexValue.classList.remove("text-red");
    textSpeedIndexValue.classList.remove("text-yellow");
    textSpeedIndexValue.classList.add("text-green");
  } else if (speedIndexNumericValue <= 5800) {
    indocatorSpeedIndex.classList.remove("bg-red");
    indocatorSpeedIndex.classList.add("bg-orange");
    indocatorSpeedIndex.classList.remove("bg-green");
    textSpeedIndexValue.classList.remove("text-red");
    textSpeedIndexValue.classList.add("text-yellow");
    textSpeedIndexValue.classList.remove("text-green");
  } else if (speedIndexNumericValue > 5800) {
    indocatorSpeedIndex.classList.add("bg-red");
    indocatorSpeedIndex.classList.remove("bg-orange");
    indocatorSpeedIndex.classList.remove("bg-green");
    textSpeedIndexValue.classList.add("text-red");
    textSpeedIndexValue.classList.remove("text-yellow");
    textSpeedIndexValue.classList.remove("text-green");
  }
}

function mobileIssues(rules) {
  let tit_viewport = 'Viewport is set correctly';
  let tit_noviewport = 'Missing or incorrect viewport settings';
  let tit_fontSize = 'The font size is correct';
  let tit_nofontSize = 'Font size is too small';
  let tit_tabtarget = 'The click target size is correct';
  let tit_notabtarget = 'Click target size is too small or too close';
  let tit_aspectRatio = 'The image aspect ratio is correct';
  let tit_noaspectRatio = 'Image aspect ratio is incorrect';
  let tit_imgResponsive = 'Server image with resolution';
  let tit_noimgResponsive = 'Image server does not support responsive images';
  let tit_imgOptimal = 'The image has been optimized';
  let tit_noimgOptimal = 'Image not optimized';
  let tit_textContrast = 'Text contrast is appropriate';
  let tit_notextContrast = 'Text contrast is too low';
  let tit_interactiveElements = 'Easy to use interactive elements';
  let tit_nointeractiveElements = 'Interactive elements are difficult to access';
  
  // Variable
  const auditRules = rules.lighthouseResult.audits;
  const audits = [
    {
      key: "viewport",
      score: auditRules["viewport"].score,
      titlePass: tit_viewport,
      titleFail: tit_noviewport,
    },
    {
      key: "font-legibility",
      score: auditRules["font-size"].score,
      titlePass: tit_fontSize,
      titleFail: tit_nofontSize,
    },
    {
      key: "tap-targets",
      score: auditRules["target-size"].score,
      titlePass: tit_tabtarget,
      titleFail: tit_notabtarget,
    },
    {
      key: "image-aspect-ratio",
      score: auditRules["image-aspect-ratio"].score,
      titlePass: tit_aspectRatio,
      titleFail: tit_noaspectRatio,
    },
    {
      key: "image-responsive",
      score: auditRules["image-size-responsive"].score,
      titlePass: tit_imgResponsive,
      titleFail: tit_noimgResponsive,
    },
    {
      key: "image-optimization",
      score: auditRules["uses-responsive-images"].score,
      titlePass: tit_imgOptimal,
      titleFail: tit_noimgOptimal,
    },
    {
      key: "text-contrast",
      score: auditRules["color-contrast"].score,
      titlePass: tit_textContrast,
      titleFail: tit_notextContrast,
    },
    {
      key: "interactive-elements",
      score: auditRules["interactive-element-affordance"].score,
      titlePass: tit_interactiveElements,
      titleFail: tit_nointeractiveElements,
    },
  ];

  // Separate Passed and Failed issues
  const passedIssues = [];
  const failedIssues = [];

  audits.forEach((audit) => {
    if (audit.score === 1) {
      passedIssues.push(audit);
    } else {
      failedIssues.push(audit);
    }
  });

  let passedChecksAccordion = document.getElementById("PassedChecksAccordion");
  if (passedChecksAccordion.children.length > 0) {
    passedChecksAccordion.innerHTML = "";
  }

  let issuesAccordion = document.getElementById("IssuesAccordion");
  if (issuesAccordion.children.length > 0) {
    issuesAccordion.innerHTML = "";
  }

  // Function to create item
  function createItem(audit, index, isIssue) {
    const bgColor = isIssue ? "bg-red" : "bg-green";
    const title = audit.score === 1 ? audit.titlePass : audit.titleFail;
    return `
          <div class="card">
              <div class="card-header" id="heading${index}">
                  <h2 class="mb-0">
                      <button class="btn btn-block text-left ${index === 0 ? "" : "collapsed"}" type="button" data-toggle="collapse" data-target="#collapse${index}MobileIssues" aria-expanded="${index === 0 ? "true" : "false"}" aria-controls="collapse${index}MobileIssues">
                          <div class="d-flex align-items-center">
                              <div class="btn btn-icon btn-circle mr-2 ${bgColor}" style="height:15px; width:15px"></div>
                              <span>${title}</span>
                          </div>
                      </button>
                  </h2>
              </div>
          </div>
      `;
  }

  passedIssues.forEach((audit, index) => {
    document.getElementById("PassedChecksAccordion").innerHTML += createItem(audit, index, false);
  });

  failedIssues.forEach((audit, index) => {
    document.getElementById("IssuesAccordion").innerHTML += createItem(audit, index + passedIssues.length, true);
  });

  // Condition CTA below to 60% error issues
}

function formatDate(date) {
  let test_date = "Tested on ";
  let test_time = " at ";

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    test_date +
    `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}` +
    test_time +
    `${date.getHours()}:${date.getMinutes()}`
  );
}

// After Run Service Worker
chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        renderResult(response);
      } else {
        showLoading(false);
        resultElement.innerHTML = "";

        headerHero.classList.add("d-flex");
        headerHero.classList.remove("d-none");
        alertLimit.classList.add("d-block");
        alertLimit.classList.remove("d-none");
        previewDetail.classList.add("d-none");
        previewDetail.classList.remove("d-flex");
        chartElement.classList.add("d-none");
        chartElement.classList.remove("d-flex");
        logButton.classList.add("d-none");
        logButton.classList.remove("d-block");
        btnLimit.classList.remove("d-none");
        btnLimit.classList.add("d-block");
      }
      break;
    default:
  }
});
