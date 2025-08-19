
import { GoogleGenAI, Type } from "@google/genai";
import { SocialMediaPost } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type Platform = 'reddit' | 'facebook' | 'instagram' | 'inshorts';


const eventSchema = {
    type: Type.OBJECT,
    properties: {
        author_id: { type: Type.STRING, description: "The author's user ID. Can be null if not available." },
        author_name: { type: Type.STRING, description: "The username of the post's author." },
        clean_event_text: { type: Type.STRING, description: "A concise, one-sentence summary of the post's main content or question." },
        engagement_metrics: {
            type: Type.OBJECT,
            properties: {
                comments: { type: Type.INTEGER, description: "The total number of comments on the post as an integer." },
                likes: { type: Type.INTEGER, description: "The total number of upvotes (Reddit), reactions (Facebook/Instagram), or views/reads (Inshorts) on the post as an integer." },
                shares: { type: Type.INTEGER, description: "The number of shares. Can be null." },
            },
            required: ["comments", "likes"]
        },
        event_content: { type: Type.STRING, description: "The full text content of the post. Can be the same as the summary for short posts." },
        event_id: { type: Type.STRING, description: "The unique ID of the post." },
        event_title: { type: Type.STRING, description: "The full title or first line of the post." },
        event_url: { type: Type.STRING, description: "The full direct URL to the post." },
        parent_event_id: { type: Type.STRING, description: "Should be null for top-level posts." },
        platform: { type: Type.STRING, description: "The platform name, e.g., 'reddit', 'facebook', 'instagram', or 'inshorts'." },
        timestamp_utc: { type: Type.STRING, description: "The UTC timestamp of the post in ISO 8601 format." },
        source_context: { type: Type.STRING, description: "The name of the source, e.g., subreddit for Reddit, group/page for Facebook, hashtag for Instagram, or news category for Inshorts. Can be null." },
    },
    required: ["author_name", "clean_event_text", "engagement_metrics", "event_content", "event_id", "event_title", "event_url", "platform", "timestamp_utc"]
};

const getPrompt = (platform: Platform, topic: string): string => {
    switch(platform) {
        case 'reddit':
            return `
                You are an expert data analyst and researcher. Your task is to find recent and popular posts on www.reddit.com related to the topic: "${topic}".
                Return a list of at least 100 posts if available. For each post, extract the information according to the provided JSON schema.
                - platform: "Reddit"
                - engagement_metrics.likes: The integer number of upvotes.
                - engagement_metrics.shares: Return null.
                - source_context: The name of the subreddit (without 'r/').
                Ensure the data is accurate and directly from Reddit.
            `;
        case 'facebook':
            return `
                You are an expert data analyst and researcher. Your task is to find recent and popular posts from public groups and pages on www.facebook.com related to the topic: "${topic}".
                Return a list of at least 100 posts if available. For each post, extract the information according to the provided JSON schema.
                - platform: "Facebook"
                - engagement_metrics.likes: The integer number of total reactions.
                - event_id: Use epoch timestamp of the current time if a real ID is not available.
                - source_context: The name of the public group or page.
                Ensure the data is accurate and from public sources on Facebook.
            `;
        case 'instagram':
            return `
                You are an expert data analyst and researcher. Your task is to find recent and popular public posts on www.instagram.com related to the topic: "${topic}".
                Return a list of at least 100 posts if available. For each post, extract the information according to the provided JSON schema.
                - platform: "Instagram"
                - event_title: Use the first few sentences of the caption as the title.
                - engagement_metrics.likes: The integer number of likes.
                - engagement_metrics.shares: Return null.
                - source_context: The primary hashtag used or the author's username.
                Ensure the data is accurate and from public Instagram accounts.
            `;
        case 'inshorts':
            return `
                You are an expert news analyst. Your task is to find recent and popular news articles on the news aggregator Inshorts related to the topic: "${topic}".
                Return a list of at least 100 news articles if available. For each article, extract the information according to the provided JSON schema.
                - platform: "inshort"
                - author_name: The source of the news article (e.g., 'Reuters', 'PTI').
                - event_title: The headline of the news article.
                - event_content: The short summary content of the article provided by Inshorts.
                - engagement_metrics.likes: Try to find the number of reads/views if available, otherwise return 0.
                - engagement_metrics.comments: Return 0.
                - engagement_metrics.shares: Return 0.
                - source_context: The news category (e.g., 'Technology', 'Sports', 'Politics').
                Ensure the data is accurate and reflects the content from Inshorts.
            `;
        default:
             throw new Error("Invalid platform specified");
    }
};


export const fetchSocialMediaPosts = async (topic: string, platform: Platform): Promise<SocialMediaPost[]> => {
    try {
        const prompt = getPrompt(platform, topic);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: eventSchema
                }
            }
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            console.warn("Gemini API returned an empty response text.");
            return [];
        }

        const parsedData = JSON.parse(jsonText);
        return parsedData as SocialMediaPost[];

    } catch (error) {
        console.error(`Error fetching or parsing ${platform} events from Gemini API:`, error);
        throw new Error(`Failed to fetch data for ${platform}. Please check your API key or try again later.`);
    }
};
