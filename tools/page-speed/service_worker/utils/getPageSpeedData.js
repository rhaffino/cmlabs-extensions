const getPagespeedData = async (url) => {
  const startTime = Date.now();  // Save the start time
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
    
    const endTime = Date.now(); // Save end time
    const elapsedTime = endTime - startTime; // Calculating the time required
    // console.log(`Waktu yang dibutuhkan untuk memanggil API: ${elapsedTime} ms`); // Display in console log

   if (elapsedTime <= 30000){
      // Function to handle when API call is within acceptable time range
      handleQuickResponse(elapsedTime);
    } else {
      // Function to handle when API call takes longer than expected
      handleSlowResponse(elapsedTime);
    }

    return data;
  } catch (error) {
    console.error("Error fetching PageSpeed data:", error);
    return null;
  }
};

export default getPagespeedData;

// Define the functions to handle quick and slow responses outside of getPagespeedData
function handleQuickResponse(elapsedTime) {
  console.log("Response was quick, within 30 seconds:", elapsedTime);
}

function handleSlowResponse(elapsedTime) {
  console.log("Response took longer than 30 seconds:", elapsedTime);
}