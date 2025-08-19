import React, { useState, useCallback } from 'react';
import { RedditEvent } from './types';
import { fetchRedditEvents } from './services/geminiService';
import { DownloadIcon, RedditIcon, SearchIcon } from './components/IconComponents';

const convertToCSV = (data: RedditEvent[]): string => {
    if (data.length === 0) return "";

    const headers = [
        "event_id", "event_title", "event_url", "subreddit", 
        "author_name", "timestamp_utc", "likes", "comments", 
        "clean_event_text", "event_content"
    ];
    
    const escapeCSV = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [headers.join(',')];

    for (const post of data) {
        const row = [
            escapeCSV(post.event_id),
            escapeCSV(post.event_title),
            escapeCSV(post.event_url),
            escapeCSV(post.subreddit),
            escapeCSV(post.author_name),
            escapeCSV(post.timestamp_utc),
            escapeCSV(post.engagement_metrics.likes),
            escapeCSV(post.engagement_metrics.comments),
            escapeCSV(post.clean_event_text),
            escapeCSV(post.event_content)
        ];
        csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
};


const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [posts, setPosts] = useState<RedditEvent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchedTopic, setSearchedTopic] = useState<string>('');
    const [downloadFormat, setDownloadFormat] = useState<'json' | 'csv'>('json');

    const handleScrape = useCallback(async () => {
        if (!topic.trim()) {
            setError("Please enter a topic to search.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setPosts([]);
        setSearchedTopic(topic);

        try {
            const fetchedPosts = await fetchRedditEvents(topic);
            if (fetchedPosts.length === 0) {
              setError("No posts found for this topic. Try being more specific or using different keywords.");
            }
            setPosts(fetchedPosts);
        } catch (e) {
            const err = e as Error;
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    const handleDownload = () => {
        if (posts.length === 0) return;

        const safeTopic = searchedTopic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        let blob: Blob;
        let filename: string;

        if (downloadFormat === 'csv') {
            const csvString = convertToCSV(posts);
            blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            filename = `reddit_events_${safeTopic}.csv`;
        } else { // 'json'
            const jsonString = JSON.stringify(posts, null, 2);
            blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
            filename = `reddit_events_${safeTopic}.json`;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 antialiased transition-colors duration-300">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <Header />
                <InputSection topic={topic} setTopic={setTopic} onScrape={handleScrape} isLoading={isLoading} />
                
                {error && <ErrorMessage message={error} />}

                {isLoading && <LoadingIndicator />}
                
                {!isLoading && posts.length > 0 && (
                    <ResultsSection 
                        posts={posts} 
                        onDownload={handleDownload} 
                        topic={searchedTopic}
                        downloadFormat={downloadFormat}
                        setDownloadFormat={setDownloadFormat}
                    />
                )}
            </main>
        </div>
    );
};

const Header: React.FC = () => (
    <header className="text-center mb-8 md:mb-12">
        <div className="flex justify-center items-center gap-4 mb-4">
            <RedditIcon className="w-16 h-16 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                Reddit Post Scraper
            </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Enter a topic to find popular Reddit posts. The AI will gather the data, which you can then view and download as a JSON file.
        </p>
    </header>
);

interface InputSectionProps {
    topic: string;
    setTopic: (topic: string) => void;
    onScrape: () => void;
    isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ topic, setTopic, onScrape, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onScrape();
    };

    return (
        <div className="max-w-2xl mx-auto mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'productivity hacks'"
                    className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-orange-500 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-orange-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
                    disabled={isLoading}
                >
                    <SearchIcon className="w-5 h-5" />
                    <span>{isLoading ? 'Searching...' : 'Search'}</span>
                </button>
            </form>
        </div>
    );
};

const LoadingIndicator: React.FC = () => (
    <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">AI is gathering data... this may take a moment.</p>
    </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="max-w-3xl mx-auto my-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-r-lg" role="alert">
        <p className="font-bold">Error</p>
        <p>{message}</p>
    </div>
);

interface ResultsSectionProps {
    posts: RedditEvent[];
    onDownload: () => void;
    topic: string;
    downloadFormat: 'json' | 'csv';
    setDownloadFormat: (format: 'json' | 'csv') => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ posts, onDownload, topic, downloadFormat, setDownloadFormat }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">
                    Found {posts.length} posts for "{topic}"
                </h2>
                 <div className="relative inline-block text-left mt-2 sm:mt-0">
                    <div className="flex rounded-lg shadow-sm">
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-2 px-5 py-2.5 font-medium text-white bg-green-600 rounded-l-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-green-600 transition-all duration-200"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            <span>Download .{downloadFormat.toUpperCase()}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                            className="px-2 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-r-lg border-l border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-green-600"
                            aria-haspopup="true"
                            aria-expanded={isDropdownOpen}
                        >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    {isDropdownOpen && (
                        <div 
                            className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                            role="menu"
                            aria-orientation="vertical"
                        >
                            <div className="py-1" role="none">
                                <a 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); setDownloadFormat('json'); setIsDropdownOpen(false); }}
                                    className="text-slate-700 font-medium dark:text-slate-200 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600"
                                    role="menuitem"
                                >
                                    as JSON (.json)
                                </a>
                                <a 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); setDownloadFormat('csv'); setIsDropdownOpen(false); }}
                                    className="text-slate-700 font-medium dark:text-slate-200 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600"
                                    role="menuitem"
                                >
                                    as CSV (.csv)
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 min-w-[300px]">Title & Summary</th>
                            <th scope="col" className="px-6 py-3">Subreddit</th>
                            <th scope="col" className="px-6 py-3">Author</th>
                            <th scope="col" className="px-6 py-3 text-center">Likes</th>
                            <th scope="col" className="px-6 py-3 text-center">Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post, index) => (
                            <tr key={index} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <a href={post.event_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                        {post.event_title}
                                    </a>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 italic">"{post.clean_event_text}"</p>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">r/{post.subreddit}</td>
                                <td className="px-6 py-4 font-mono text-xs">u/{post.author_name}</td>
                                <td className="px-6 py-4 text-center font-medium">{post.engagement_metrics.likes}</td>
                                <td className="px-6 py-4 text-center font-medium">{post.engagement_metrics.comments}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;
