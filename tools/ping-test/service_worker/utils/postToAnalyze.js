const postToAnalyze = async (baseUrl, type) => {
  const url = "https://tools-api-w3m734lsga-as.a.run.app/api/ping-tool/check";

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        url: baseUrl,
        type: type,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in postToAnalyze:", error);
    return null;
  }
};

export default postToAnalyze;