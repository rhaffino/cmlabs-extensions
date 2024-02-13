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
// Akbar
const urlElement = document.getElementById("url-here");
const urlCheck = document.getElementById("url-check");
const logButton = document.getElementById("submit-btn");
const checkButton = document.getElementById("check-btn");
// Alert
const alertLimit = document.getElementById("alert-limit");
const latestBlog = document.getElementById("latest-blog");
const limitBtn = document.getElementById("btn-limit");

// Constraints
const constrain = {
  minTitleChar: 50,
  minTitlePixel: 250,
  maxTitleChar: 60,
  maxTitlePixel: 600,
  minDescChar: 50,
  minDescPixel: 400,
  maxDescChar: 160,
  maxDescPixel: 920,
};

document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    urlValue = currentUrl;
    // Akbar
    updateUrlElement();
  });

  logButton.addEventListener("click", function () {
    showResult(false);
    launch();
  });

  checkLocalStorage();
});

const launch = async () => {
  showLoading(true);
  // resultElement.innerHTML = "";
  
  const isDataFetched = await checkFetchStatus();
  setTimeout(() => {
    if (isDataFetched) {
      tabChrome().then((currentUrl) => {
        const message = {
          event: "OnStartTitleLengthChecker",
          data: {
            url: currentUrl,
          },
        };

        chrome.runtime.sendMessage(message);
      });
    } else {
      tabChrome().then((currentUrl) => {
        const message = {
          event: "OnStartTitleLengthChecker",
          data: {
            url: currentUrl,
          },
        };

        chrome.runtime.sendMessage(message);
      });
    }
  }, 5000);
};

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

// Akbar
const updateUrlElement = () => {
  urlElement.textContent = urlValue;
  urlCheck.textContent = urlValue;
};


chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishTitleLengthChecker":
      if (status) {
        displayResultTitleLengthChecker(response);
      } else {
        // const checkError = document.getElementById("error-paragraph");
        // if (!checkError) {
        //   const errorParagraph = document.createElement("p");
        //   errorParagraph.id = "error-paragraph";
        //   errorParagraph.className = "text-center text-lg mt-error";
        //   errorParagraph.textContent = info;
        //   checkerElement.appendChild(errorParagraph);
        // }
        showLoading(true);
        showResult(false);
        
        alertLimit.classList.add("d-block");
        alertLimit.classList.remove("d-none");
        checkButton.classList.add("d-none");
        checkButton.classList.remove("d-block");
        latestBlog.classList.add("d-none");
        latestBlog.classList.remove("d-block");
        limitBtn.classList.add("d-flex");
        limitBtn.classList.remove("d-none");
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

const titleChecker = function (title) {
  var titlesizer = document.getElementById("titlesizer");
  var rate = 0;
  var badChar = 0;
  var badPixel = 0;
  var l = title.length;
  if (l >= constrain.minTitleChar && l <= constrain.maxTitleChar) {
    rate++;
  } else if (l > constrain.minTitleChar) {
    badChar = l - constrain.maxTitleChar;
  } else {
    badChar = l - constrain.minTitleChar;
  }

  // titlesizer.setAttribute(
  //   "style",
  //   "font-family: arial, sans-serif !important;font-size: 18px!important;position:absolute!important;white-space:nowrap!important;visibility:hidden!important"
  // );
  titlesizer.innerHTML = title;
  var pixel = Math.floor(titlesizer.offsetWidth);
  if (pixel >= constrain.minTitlePixel && pixel <= constrain.maxTitlePixel) {
    rate += 2;
  } else if (pixel > constrain.maxTitlePixel) {
    badPixel = pixel - constrain.maxTitlePixel;
  } else {
    badPixel = pixel - constrain.minTitlePixel;
  }
  titlesizer.innerHTML = "";

  let word = 0;
  if (title.length > 0) word = title.split(" ").length;

  return {
    rate: rate,
    word: word,
    pixel: pixel,
    char: l,
    badChar: badChar,
    badPixel: badPixel,
  };
};

const descChecker = function (desc) {
  var descsizer = document.getElementById("descsizer");
  var rate = 0;
  var badChar = 0;
  var badPixel = 0;
  var l = desc.length;
  if (l >= constrain.minDescChar && l <= constrain.maxDescChar) {
    rate++;
  } else if (l > constrain.maxDescChar) {
    badChar = l - constrain.maxDescChar;
  } else {
    badChar = l - constrain.minDescChar;
  }

  // descsizer.setAttribute(
  //   "style",
  //   "font-family: arial, sans-serif !important;font-size:13px !important;position:absolute !important;visibility:hidden !important;white-space:nowrap !important;"
  // );
  descsizer.innerHTML = desc;
  var pixel = Math.floor(descsizer.offsetWidth);
  if (pixel >= constrain.minDescPixel && pixel <= constrain.maxDescPixel) {
    rate += 2;
  } else if (pixel > constrain.maxDescPixel) {
    badPixel = pixel - constrain.maxDescPixel;
  } else {
    badPixel = pixel - constrain.minDescPixel;
  }
  descsizer.innerHTML = "";

  let word = 0;
  if (desc.length > 0) word = desc.split(" ").length;

  return {
    rate: rate,
    word: word,
    pixel: pixel,
    char: l,
    badChar: badChar,
    badPixel: badPixel,
  };
};

const fillTitleBar = function (param, cta = false) {
  for (let i = 1; i < param.rate + 1; i++) {
    document.getElementById("titlebar" + i).classList.remove("blank");
    document.getElementById("titlebar" + i).classList.add("active");
  }
  for (let i = param.rate + 1; i < 4; i++) {
    document.getElementById("titlebar" + i).classList.remove("active");
    document.getElementById("titlebar" + i).classList.add("blank");
  }

  // cta
  // if (cta) {
  //   if (param.rate >= 3) {
  //     document.getElementById("cta-warning").style.display = "none";
  //   } else {
  //     document.getElementById("cta-warning").style.display = "block";
  //   }
  // } else {
  //   document.getElementById("cta-warning").style.display = "none";
  // }

  document.getElementById("title-char").textContent = param.char;
  document.getElementById("title-pixel").textContent = param.pixel;
  document.getElementById("title-word").textContent = param.word;
  if (param.char > 0) {
    if (param.badChar !== 0) {
      if (param.badChar < 0) {
        document.getElementById("title-bad-char-point").textContent =
          "Your character less than " + constrain.minTitleChar;
      } else {
        document.getElementById("title-bad-char-point").textContent =
          "Your character more than " + constrain.maxTitleChar;
      }
      document.getElementById("title-bad-char").classList.remove("d-none");
      document.getElementById("title-bad-char").classList.add("d-flex");
    } else {
      document.getElementById("title-bad-char").classList.remove("d-flex");
      document.getElementById("title-bad-char").classList.add("d-none");
    }
    if (param.badPixel !== 0) {
      if (param.badPixel < 0) {
        document.getElementById("title-bad-pixel-point").textContent =
          "Your pixel less than " + constrain.minTitlePixel;
      } else {
        document.getElementById("title-bad-pixel-point").textContent =
          "Your pixel more than " + constrain.maxTitlePixel;
      }
      document.getElementById("title-bad-pixel").classList.remove("d-none");
      document.getElementById("title-bad-pixel").classList.add("d-flex");
    } else {
      document.getElementById("title-bad-pixel").classList.remove("d-flex");
      document.getElementById("title-bad-pixel").classList.add("d-none");
    }
  } else {
    // document.getElementById("cta-warning").style.display = "none";
    document.getElementById("title-bad-char").classList.remove("d-flex");
    document.getElementById("title-bad-char").classList.add("d-none");
    document.getElementById("title-bad-pixel").classList.remove("d-flex");
    document.getElementById("title-bad-pixel").classList.add("d-none");
  }
};

const fillDescBar = function (param, cta = false) {
  for (let i = 1; i < param.rate + 1; i++) {
    document.getElementById("descbar" + i).classList.remove("blank");
    document.getElementById("descbar" + i).classList.add("active");
  }
  for (let i = param.rate + 1; i < 4; i++) {
    document.getElementById("descbar" + i).classList.remove("active");
    document.getElementById("descbar" + i).classList.add("blank");
  }

  // cta
  // if (cta) {
  //   if (param.rate >= 3) {
  //     document.getElementById("cta-warning").style.display = "none";
  //   } else {
  //     document.getElementById("cta-warning").style.display = "block";
  //   }
  // } else {
  //   document.getElementById("cta-warning").style.display = "none";
  // }

  document.getElementById("desc-char").textContent = param.char;
  document.getElementById("desc-pixel").textContent = param.pixel;
  document.getElementById("desc-word").textContent = param.word;
  if (param.char > 0) {
    if (param.badChar !== 0) {
      if (param.badChar < 0) {
        document.getElementById("desc-bad-char-point").textContent =
          "Your character less than " + constrain.minDescChar;
      } else {
        document.getElementById("desc-bad-char-point").textContent =
          "Your character more than " + constrain.maxDescChar;
      }
      document.getElementById("desc-bad-char").classList.remove("d-none");
      document.getElementById("desc-bad-char").classList.add("d-flex");
    } else {
      document.getElementById("desc-bad-char").classList.remove("d-flex");
      document.getElementById("desc-bad-char").classList.add("d-none");
    }
    if (param.badPixel !== 0) {
      if (param.badPixel < 0) {
        document.getElementById("desc-bad-pixel-point").textContent =
          "Your pixel less than " + constrain.minDescPixel;
      } else {
        document.getElementById("desc-bad-pixel-point").textContent =
          "Your pixel more than " + constrain.maxDescPixel;
      }
      document.getElementById("desc-bad-pixel").classList.remove("d-none");
      document.getElementById("desc-bad-pixel").classList.add("d-flex");
    } else {
      document.getElementById("desc-bad-pixel").classList.remove("d-flex");
      document.getElementById("desc-bad-pixel").classList.add("d-none");
    }
  } else {
    // document.getElementById("cta-warning").style.display = "none";
    document.getElementById("desc-bad-char").classList.remove("d-flex");
    document.getElementById("desc-bad-char").classList.add("d-none");
    document.getElementById("desc-bad-pixel").classList.remove("d-flex");
    document.getElementById("desc-bad-pixel").classList.add("d-none");
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

    var rateTitle = titleChecker(response.data.title);
    fillTitleBar(rateTitle);

    var rateDesc = descChecker(response.data.description);
    fillDescBar(rateDesc);
  } else if (titleElement && descElement && response && response.data) {
    titleElement.value = response.data.title || "-";
    descElement.value = response.data.description || "-";

    if (response.data.title) {
      var rateTitle = titleChecker(response.data.title);
      fillTitleBar(rateTitle);
    }

    if (response.data.description) {
      var rateDesc = descChecker(response.data.description);
      fillDescBar(rateDesc);
    }
  } else {
    const errorParagraph = document.createElement("p");
    errorParagraph.id = "error-paragraph";
    errorParagraph.className = "text-center text-lg mt-error";
    errorParagraph.textContent = "Error occured.";
    checkerElement.appendChild(errorParagraph);
    
    showLoading(false);
    return;
  }

  alertLimit.classList.remove("d-block");
  alertLimit.classList.add("d-none");
  showLoading(false);
  showResult(true);
};

const checkLocalStorage = () => {
  showLoading(true);

  chrome.storage.local.get(["response"], (result) => {
    showLoading(false);

    if (result.response) {
      displayResultTitleLengthChecker(result.response);
    } else {
      showLoading(true);
      launch();
    }
  });
};