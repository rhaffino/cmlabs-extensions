const postSSLChecker = async (url) => {

  const apiUrl =
    "https://tools-api-w3m734lsga-as.a.run.app/api/ssl-checker/check";

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ url: url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching SSL url data:", error);
    return null;
  }
};

export default postSSLChecker;
