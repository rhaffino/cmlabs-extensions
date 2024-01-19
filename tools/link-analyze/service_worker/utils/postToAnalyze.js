const postToAnalyze = async (baseUrl) => {
  const url = "https://tools-v2.cmlabs.dev/api/link-analyzer/analyze";

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ url: baseUrl }),
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