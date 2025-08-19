export interface EngagementMetrics {
  comments: number;
  likes: number; // Mapped from Reddit upvotes
  shares: number | null;
}

export interface RedditEvent {
  author_id: string | null;
  author_name: string;
  clean_event_text: string;
  engagement_metrics: EngagementMetrics;
  event_content: string;
  event_id: string;
  event_title: string;
  event_url: string;
  parent_event_id: string | null;
  platform: string;
  timestamp_utc: string;
  subreddit: string; // Crucial for Reddit context
}
