const getBaseUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.origin + "/";
  } catch (_) {
    return null;
  }
};

const validateAndExtractBaseUrl = (url) => {
  const baseUrl = getBaseUrl(url);
  if (baseUrl) {
    return baseUrl;
  } else {
    return null;
  }
};

export default validateAndExtractBaseUrl;
