/**
 * Utility functions for cleaning and formatting HTML content
 */

/**
 * Cleans HTML content by removing extra whitespace, normalizing HTML entities,
 * and ensuring proper paragraph formatting
 * @param content - The HTML content to clean
 * @returns Cleaned HTML content
 */
export const cleanHtmlContent = (content: string): string => {
  if (!content) return '';
  
  // First, decode any HTML entities
  let cleaned = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove extra whitespace and normalize HTML
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/>\s+</g, '><') // Remove spaces between tags
    .trim();
  
  // Handle cases where literal <p> tags appear as text (not proper HTML)
  // This is the main issue: when content contains literal "<p>" text
  if (cleaned.includes('<p>') && cleaned.includes('</p>')) {
    // Check if it's properly formatted HTML (starts and ends with <p> tags)
    if (cleaned.startsWith('<p>') && cleaned.endsWith('</p>')) {
      // Additional check: make sure there are no literal <p> tags in the middle
      const middleContent = cleaned.slice(3, -4); // Remove <p> and </p>
      if (!middleContent.includes('<p>') && !middleContent.includes('</p>')) {
        return cleaned;
      }
    }
    
    // If it contains literal <p> tags anywhere, extract the text content
    const textContent = cleaned.replace(/<p>/g, '').replace(/<\/p>/g, '');
    return `<p>${textContent}</p>`;
  }
  
  // Handle cases where content starts with literal <p> text
  if (cleaned.startsWith('<p>') && !cleaned.includes('</p>')) {
    // This is likely literal text, not HTML
    const textContent = cleaned.replace(/^<p>/, '');
    return `<p>${textContent}</p>`;
  }
  
  // If no paragraph tags, wrap in paragraph
  if (!cleaned.includes('<p>')) {
    return `<p>${cleaned}</p>`;
  }
  
  return cleaned;
};

/**
 * Strips HTML tags from content and returns plain text
 * @param content - The HTML content to strip
 * @returns Plain text content
 */
export const stripHtmlTags = (content: string): string => {
  if (!content) return '';
  
  // Remove HTML tags
  return content.replace(/<[^>]*>/g, '');
};

/**
 * Truncates HTML content to a specified length while preserving HTML structure
 * @param content - The HTML content to truncate
 * @param maxLength - Maximum length of the content
 * @returns Truncated HTML content
 */
export const truncateHtmlContent = (content: string, maxLength: number): string => {
  if (!content) return '';
  
  const plainText = stripHtmlTags(content);
  if (plainText.length <= maxLength) {
    return content;
  }
  
  const truncatedText = plainText.substring(0, maxLength) + '...';
  return `<p>${truncatedText}</p>`;
};
