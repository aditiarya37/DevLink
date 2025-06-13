const ogs = require('open-graph-scraper');

const URL_REGEX = /\b((?:https?|ftp):\/\/[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*)\b/gi;


const extractFirstUrl = (text) => {
  if (!text) return null;

  console.log("[extractFirstUrl] Text received for URL extraction:", JSON.stringify(text)); 

  const urls = text.match(URL_REGEX);
  console.log("[extractFirstUrl] URLs found by regex:", urls);

  if (urls && urls.length > 0) {
    let potentialUrl = urls[0];
    if (potentialUrl.startsWith('http://') || potentialUrl.startsWith('https://')) {
      return potentialUrl;
    }
    if (potentialUrl.startsWith('www.')) {
        return `https://${potentialUrl}`;
    }
    console.log(`[extractFirstUrl] Discarding potential URL "${potentialUrl}" due to missing scheme or not starting with www.`);
    return null;
  }
  return null;
};

const fetchLinkMetadata = async (url) => {
  if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
    console.log(`[fetchLinkMetadata] Invalid or missing scheme for URL: ${url}. Skipping metadata fetch.`);
    return null;
  }

  console.log(`[fetchLinkMetadata] Attempting to fetch metadata for: ${url}`);
  try {
    const options = { url, timeout: 5000, ogImageFallback: true };
    const { result } = await ogs(options);

    if (result && result.success) {
      if (!result.ogTitle && !result.twitterTitle && !result.dcTitle) { 
        console.log(`[fetchLinkMetadata] Skipping link preview for ${url}: Missing essential title data.`);
        return null;
      }
      const title = result.ogTitle || result.twitterTitle || result.dcTitle || "No Title";
      const description = result.ogDescription || result.twitterDescription || result.dcDescription;
      let image = null;
      if (result.ogImage && result.ogImage.url) {
        image = Array.isArray(result.ogImage) ? result.ogImage[0].url : result.ogImage.url;
      } else if (result.twitterImage && result.twitterImage.url) {
        image = Array.isArray(result.twitterImage) ? result.twitterImage[0].url : result.twitterImage.url;
      }

      return {
        url: result.ogUrl || result.requestUrl,
        title: title,
        description: description,
        image: image,
        siteName: result.ogSiteName || result.twitterSite || new URL(result.requestUrl).hostname, 
      };
    }
    console.log(`[fetchLinkMetadata] ogs reported not successful for ${url}`, result);
    return null;
  } catch (error) {
    console.error(`[fetchLinkMetadata] Error fetching metadata for URL (${url}):`, error);
    return null;
  }
};

module.exports = {
  extractFirstUrl,
  fetchLinkMetadata,
};