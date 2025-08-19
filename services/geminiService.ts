import { GoogleGenAI, Type } from "@google/genai";
import { RedditEvent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const eventSchema = {
    type: Type.OBJECT,
    properties: {
        author_id: { type: Type.STRING, description: "The author's Reddit user ID (e.g., 't2_...'). Can be null if not available." },
        author_name: { type: Type.STRING, description: "The username of the post's author." },
        clean_event_text: { type: Type.STRING, description: "A concise, one-sentence summary of the post's main content or question." },
        engagement_metrics: {
            type: Type.OBJECT,
            properties: {
                comments: { type: Type.INTEGER, description: "The total number of comments on the post as an integer." },
                likes: { type: Type.INTEGER, description: "The total number of upvotes (likes) on the post as an integer." },
                shares: { type: Type.INTEGER, description: "The number of shares. Default to null as it's not applicable to Reddit." },
            },
            required: ["comments", "likes"]
        },
        event_content: { type: Type.STRING, description: "The full text content of the post. Can be the same as the summary for short posts." },
        event_id: { type: Type.STRING, description: "The unique ID of the Reddit post (e.g., 't3_...')." },
        event_title: { type: Type.STRING, description: "The full title of the Reddit post." },
        event_url: { type: Type.STRING, description: "The full direct URL to the Reddit post." },
        parent_event_id: { type: Type.STRING, description: "Should be null for top-level posts." },
        platform: { type: Type.STRING, description: "The platform name, which should always be 'reddit'." },
        timestamp_utc: { type: Type.STRING, description: "The UTC timestamp of the post in ISO 8601 format." },
        subreddit: { type: Type.STRING, description: "The name of the subreddit, without the 'r/' prefix." },
    },
    required: ["author_name", "clean_event_text", "engagement_metrics", "event_content", "event_id", "event_title", "event_url", "platform", "timestamp_utc", "subreddit"]
};


export const fetchRedditEvents = async (topic: string): Promise<RedditEvent[]> => {
    try {
        const prompt = `
            You are an expert data analyst and researcher. Your task is to find recent and popular posts on www.reddit.com related to the topic: "${topic}".
            
            Return a list of at least 10 posts if available. For each post, extract the information according to the provided JSON schema.
            Specifically, provide:
            - author_id: The author's Reddit user ID (e.g., 't2_...'). Can be null.
            - author_name: The author's username.
            - clean_event_text: A one-sentence summary of the post.
            - engagement_metrics:
                - comments: The integer number of comments.
                - likes: The integer number of upvotes.
                - shares: Return null, as this is not applicable to Reddit posts.
            - event_content: The full text content of the post.
            - event_id: The unique ID of the post (e.g., 't3_...').
            - event_title: The title of the post.
            - event_url: The full URL to the post.
            - parent_event_id: This should be null for posts.
            - platform: This should always be 'reddit'.
            - timestamp_utc: The post creation time in UTC ISO 8601 format.
            - subreddit: The name of the subreddit where the post was made (without the 'r/' prefix).

            Ensure the data is accurate and directly from Reddit.
        `;

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
        return parsedData as RedditEvent[];

    } catch (error) {
        console.error("Error fetching or parsing Reddit events from Gemini API:", error);
        throw new Error("Failed to fetch data from the AI. Please check your API key or try again later.");
    }
};
