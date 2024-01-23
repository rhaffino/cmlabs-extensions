document.addEventListener("DOMContentLoaded", function () {
  tabChrome().then((currentUrl) => {
    var urlContainer = document.getElementById("url-container");
    urlContainer.textContent = currentUrl;
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

function tabChrome() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var currentUrl = currentTab.url;

      resolve(currentUrl);
    });
  });
}

const renderResult = (response) =>{
  showLoading(false);
  console.log(response);
  
  const expDate = new Date(response.data.valid_to);
  const difDate = expDate.getTime() - new Date().getTime();
  let displayText;
  let icon;
  let textExpired;
  const cta = false;

if (difDate < 0) {
    const ctaDanger = document.getElementById('cta-danger');
    if (cta) {
        ctaDanger.style.display = 'block';
    } else {
        ctaDanger.style.display = 'none';
    }
    displayText = `SSL Certificate expired on ${expDate.getDate()}th, ${parseMonth(
        expDate.getMonth() + 1
    )} ${expDate.getFullYear()} (${(
        Math.abs(difDate) /
        (1000 * 3600 * 24)
    ).toFixed(0)} days ago).`;
    icon = `<i class='bx bxs-x-circle bx-md' style="color:#D60404"></i>`;
    textExpired = `Your TSL Certificate is expired`;
} else {
    displayText = `SSL Certificate expired on ${expDate.getDate()}th, ${parseMonth(
        expDate.getMonth() + 1
    )} ${expDate.getFullYear()} (${(
        Math.abs(difDate) /
        (1000 * 3600 * 24)
    ).toFixed(0)} days from now).`;
    icon = `<i class='bx bxs-check-circle bx-md' style="color:#67B405"></i>`;
    textExpired = `TLS Certificate is installed well.`;
}

const display = document.createElement('div');
display.innerHTML = `<div class="d-flex align-items-center mx-5">
                        ${icon}
                        <span class="mx-3 technology-name h5 mb-0 text-darkgrey">TLS Certificate</span>
                    </div>
                    <hr>
                    <div class="mx-5 text-black font-weight-bold">
                        <p>Common Name = ${response.data.subject.CN}</p>
                        <p>Subject Alternative Names = ${response.data.subjectaltname}</p>
                        <p>Issuer = ${response.data.issuer.CN}</p>
                        <p>Serial Number = ${response.data.serialNumber}</p>
                        <p>SHA1 Thumbprint = ${response.data.fingerprint}</p>
                    </div>
                    <div class="d-flex align-items-center mx-5 mt-10">
                        ${icon}
                        <span class="mx-3 technology-name h5 mb-0 text-darkgrey">TLS Certificate Expiration Date</span>
                    </div>
                    <hr>
                    <div class="mx-5 text-black font-weight-bold">
                        <p>${displayText}</p>
                    </div>
                    <div class="d-flex align-items-center mx-5 mt-10">
                        ${icon}
                        <span class="mx-3 technology-name h5 mb-0 text-darkgrey">TLS Certificate Installation Status</span>
                    </div>
                    <hr>
                    <div class="mx-5 text-black font-weight-bold">
                        <p>${textExpired}</p>
                    </div>`;

const resultElement = document.getElementById('result');
resultElement.appendChild(display);

}

chrome.runtime.onMessage.addListener((message) => {
  const { event, response, status, info } = message;

  switch (event) {
    case "OnFinishLinkAnalysis":
      if (status) {
        renderResult(response);
      } else {
        console.log(info);
      }
      break;
    default:
      console.log("Unknown event");
  }
});

const showLoading = (status) => {
  var loading = document.getElementById("loading");

  if (status) {
    loading.classList.remove("d-none");
    loading.classList.add("d-flex");
  } else {
    loading.classList.remove("d-flex");
    loading.classList.add("d-none");
  }
};

const checkLocalStorage = () => {
  chrome.storage.local.get(["response"], (result) => {
    if (result.response) {
      renderResult(result.response);
    } else {
      launch();
    }
  });
};

checkLocalStorage();

function parseMonth(month) {
  switch (month) {
    case 1:
      return "January";
      break;
    case 2:
      return "February";
      break;
    case 3:
      return "March";
      break;
    case 4:
      return "April";
      break;
    case 5:
      return "May";
      break;
    case 6:
      return "June";
      break;
    case 7:
      return "July";
      break;
    case 8:
      return "August";
      break;
    case 9:
      return "September";
      break;
    case 10:
      return "October";
      break;
    case 11:
      return "November";
      break;
    case 12:
      return "December";
      break;
  }
}