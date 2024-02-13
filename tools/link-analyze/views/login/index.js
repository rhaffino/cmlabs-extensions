document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("isLogin", function (data) {
    if (!data.isLogin) {
      document
        .getElementById("inputUsername")
        .form.addEventListener("submit", function (event) {
          event.preventDefault();

          document.getElementById("loginAlert").classList.add("d-none");

          const username = document.getElementById("inputUsername").value;

          const message = {
            event: "OnLogin",
            data: {
              password: username,
            },
          };

          chrome.runtime.sendMessage(message);
        });
    } else {
      window.location.href = "../index/index.html";
    }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  const { event, status } = message;

  switch (event) {
    case "OnLoginResult":
      if (status) {
        window.location.href = "../index/index.html";
      } else {
        document.getElementById("loginAlert").classList.remove("d-none");
      }
      break;
    default:
      console.log("Unknown event", event);
  }
});
