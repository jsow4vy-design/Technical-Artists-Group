
import React, { useEffect } from 'react';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    article?: boolean;
}

/**
 * SEO Component to dynamically update document metadata.
 */
const SEO: React.FC<SEOProps> = ({ title, description, image, article }) => {
    useEffect(() => {
        const fullTitle = `${title} | UNDR:LA Studios`;
        document.title = fullTitle;

        // Update Description
        if (description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', description);
            }
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) {
                ogDesc.setAttribute('content', description);
            }
        }

        // Update OG Tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', fullTitle);

        if (image) {
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) ogImage.setAttribute('content', image);
        }

        // Add canonical link
        let link = document.querySelector("link[rel='canonical']");
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', window.location.href);

    }, [title, description, image, article]);

    return null; // This component doesn't render anything
};

export default SEO;
