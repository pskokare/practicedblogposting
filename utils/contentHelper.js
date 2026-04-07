/**
 * Content Helper for Blog Posts
 * Allows placing images at specific points in content using placeholders
 */

class ContentHelper {
  /**
   * Process blog content and replace image placeholders with actual image URLs
   * @param {string} content - Blog content with placeholders
   * @param {Array} contentImages - Array of image URLs
   * @returns {string} Processed content with actual image URLs
   */
  static processContentImages(content, contentImages = []) {
    if (!contentImages || contentImages.length === 0) {
      return content;
    }

    let processedContent = content;
    
    // Replace image placeholders with actual images
    // Format: {{IMAGE_1}}, {{IMAGE_2}}, etc.
    contentImages.forEach((imageUrl, index) => {
      const placeholder = `{{IMAGE_${index + 1}}}`;
      const imageHtml = `<img src="${imageUrl}" alt="Content Image ${index + 1}" class="content-image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px;">`;
      
      processedContent = processedContent.replace(
        new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
        imageHtml
      );
    });

    return processedContent;
  }

  /**
   * Generate content with image placeholders for easier editing
   * @param {string} baseContent - Base content without images
   * @param {number} imageCount - Number of images to add placeholders for
   * @returns {string} Content with image placeholders
   */
  static generateContentWithPlaceholders(baseContent, imageCount = 0) {
    let content = baseContent;
    
    for (let i = 1; i <= imageCount; i++) {
      content += `\n\n{{IMAGE_${i}}}\n\n`;
    }
    
    return content;
  }

  /**
   * Extract image placeholders from content
   * @param {string} content - Blog content
   * @returns {Array} Array of placeholder positions
   */
  static extractImagePlaceholders(content) {
    const placeholders = content.match(/{{IMAGE_\d+}}/g) || [];
    return placeholders.map(placeholder => {
      const index = parseInt(placeholder.match(/\d+/)[0]);
      return { placeholder, index };
    });
  }

  /**
   * Validate that content has enough images for its placeholders
   * @param {string} content - Blog content
   * @param {Array} contentImages - Array of image URLs
   * @returns {Object} Validation result
   */
  static validateContentImages(content, contentImages = []) {
    const placeholders = this.extractImagePlaceholders(content);
    const requiredImages = Math.max(...placeholders.map(p => p.index), 0);
    const hasEnoughImages = contentImages.length >= requiredImages;

    return {
      isValid: hasEnoughImages,
      requiredImages,
      providedImages: contentImages.length,
      placeholders: placeholders.length,
      message: hasEnoughImages 
        ? 'Content has enough images for all placeholders'
        : `Content requires ${requiredImages} images but only ${contentImages.length} provided`
    };
  }
}

module.exports = ContentHelper;
