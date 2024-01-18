const getPagespeedData = async (url) => {
  const apiUrl =
    "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed";
  const apiKey = "AIzaSyDjg7PenszK_cEZfg4tzvOlKFmnufwxVLs";

  const categories = [
    "ACCESSIBILITY",
    "BEST_PRACTICES",
    "PERFORMANCE",
    "PWA",
    "SEO",
  ];

  const categoryParams = categories
    .map((category) => `category=${category}`)
    .join("&");
  const encodedUrl = encodeURIComponent(url);

  const fullUrl = `${apiUrl}?${categoryParams}&url=${encodedUrl}&key=${apiKey}`;

  try {
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching PageSpeed data:", error);
    return null;
  }
};

export default getPagespeedData;
