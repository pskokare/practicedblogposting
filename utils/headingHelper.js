/**
 * Content Helper for processing blog content
 */

/**
 * Process blog content to ensure proper heading hierarchy
 * Only first h1 should remain, others become h2, and h4/h5/h6 become h3
 */
function processHeadingHierarchy(content) {
    if (!content) return content;
    
    // Create a temporary DOM element to parse the content
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Find all heading elements
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let firstH1Processed = false;
    
    headings.forEach((heading) => {
        const tagName = heading.tagName.toLowerCase();
        
        if (tagName === 'h1') {
            if (!firstH1Processed) {
                // Keep the first h1 as is
                firstH1Processed = true;
            } else {
                // Convert subsequent h1s to h2
                const newHeading = document.createElement('h2');
                newHeading.innerHTML = heading.innerHTML;
                newHeading.className = heading.className;
                heading.parentNode.replaceChild(newHeading, heading);
            }
        } else if (tagName === 'h2') {
            // Keep h2 as is (they're already proper)
        } else if (tagName === 'h3') {
            // Keep h3 as is (they're already proper)
        } else if (['h4', 'h5', 'h6'].includes(tagName)) {
            // Convert h4, h5, h6 to h3 for better hierarchy
            const newHeading = document.createElement('h3');
            newHeading.innerHTML = heading.innerHTML;
            newHeading.className = heading.className;
            heading.parentNode.replaceChild(newHeading, heading);
        }
    });
    
    return document.body.innerHTML;
}

/**
 * Alternative simple regex-based approach for environments without JSDOM
 */
function processHeadingHierarchySimple(content) {
    if (!content) return content;
    
    let processedContent = content;
    let h1Count = 0;
    
    // Replace h1 tags while preserving content
    processedContent = processedContent.replace(/<h1([^>]*)>/gi, (match, attributes) => {
        h1Count++;
        if (h1Count === 1) {
            return '<h1' + attributes + '>'; // Keep first h1
        } else {
            return '<h2' + attributes + '>'; // Convert rest to h2
        }
    });
    
    // Convert h4, h5, h6 to h3
    processedContent = processedContent.replace(/<h4([^>]*)>/gi, '<h3$1>');
    processedContent = processedContent.replace(/<\/h4>/gi, '</h3>');
    
    processedContent = processedContent.replace(/<h5([^>]*)>/gi, '<h3$1>');
    processedContent = processedContent.replace(/<\/h5>/gi, '</h3>');
    
    processedContent = processedContent.replace(/<h6([^>]*)>/gi, '<h3$1>');
    processedContent = processedContent.replace(/<\/h6>/gi, '</h3>');
    
    return processedContent;
}

module.exports = {
    processHeadingHierarchy,
    processHeadingHierarchySimple
};
