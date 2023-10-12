// Message Response
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "pagespeedAPI") {
    console.log("Menunggu proses pengiriman API selesai..");
  }

  if (message.action === "doneCheck") {
    console.log("Proses Selesai");
  }
});
