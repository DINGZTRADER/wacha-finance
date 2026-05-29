import { useEffect } from "react";

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
}

export default function SEO({ title, description, keywords, ogTitle, ogDescription }: SEOProps) {
    useEffect(() => {
        document.title = title;

        // Meta title
        const metaTitle = document.querySelector('meta[name="title"]');
        if (metaTitle) {
            metaTitle.setAttribute("content", title);
        }

        // Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", description);
        } else {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            metaDesc.setAttribute("content", description);
            document.head.appendChild(metaDesc);
        }

        // Keywords
        if (keywords) {
            let metaKey = document.querySelector('meta[name="keywords"]');
            if (metaKey) {
                metaKey.setAttribute("content", keywords);
            } else {
                metaKey = document.createElement("meta");
                metaKey.setAttribute("name", "keywords");
                metaKey.setAttribute("content", keywords);
                document.head.appendChild(metaKey);
            }
        }

        // Open Graph title
        const ogT = document.querySelector('meta[property="og:title"]');
        if (ogT) {
            ogT.setAttribute("content", ogTitle || title);
        }

        // Open Graph description
        const ogD = document.querySelector('meta[property="og:description"]');
        if (ogD) {
            ogD.setAttribute("content", ogDescription || description);
        }

        // Twitter title
        const twitterT = document.querySelector('meta[name="twitter:title"]');
        if (twitterT) {
            twitterT.setAttribute("content", ogTitle || title);
        }

        // Twitter description
        const twitterD = document.querySelector('meta[name="twitter:description"]');
        if (twitterD) {
            twitterD.setAttribute("content", ogDescription || description);
        }
    }, [title, description, keywords, ogTitle, ogDescription]);

    return null;
}
