
import React, { useState, useCallback, useEffect } from 'react';
import { SocialMediaPost } from './types';
import { fetchSocialMediaPosts } from './services/geminiService';
import { DownloadIcon, RedditIcon, SearchIcon, FacebookIcon, InstagramIcon, NewsIcon } from './components/IconComponents';

type Agent = 'reddit' | 'facebook' | 'instagram' | 'inshorts';
type Category = 'social' | 'news';

const AGENT_CONFIG: Record<Agent, {
    name: string;
    Icon: React.FC<{ className?: string }>;
    placeholder: string;
    theme: {
        '--color-primary': string;
        '--color-primary-hover': string;
        '--color-text': string;
        '--color-ring': string;
        '--color-border': string;
        '--gradient-bg'?: string;
    };
}> = {
    reddit: {
        name: 'Reddit',
        Icon: RedditIcon,
        placeholder: "e.g., 'productivity hacks'",
        theme: {
            '--color-primary': '#f97316',
            '--color-primary-hover': '#ea580c',
            '--color-text': '#f97316',
            '--color-ring': '#f97316',
            '--color-border': '#f97316',
        }
    },
    facebook: {
        name: 'Facebook',
        Icon: FacebookIcon,
        placeholder: "e.g., 'local community events'",
        theme: {
            '--color-primary': '#2563eb',
            '--color-primary-hover': '#1d4ed8',
            '--color-text': '#2563eb',
            '--color-ring': '#2563eb',
            '--color-border': '#2563eb',
        }
    },
    instagram: {
        name: 'Instagram',
        Icon: InstagramIcon,
        placeholder: "e.g., 'travel photography'",
        theme: {
            '--color-primary': '#ec4899',
            '--color-primary-hover': '#db2777',
            '--color-text': '#ec4899',
            '--color-ring': '#ec4899',
            '--color-border': '#ec4899',
            '--gradient-bg': 'linear-gradient(to right, #a855f7, #ec4899, #f97316)',
        }
    },
    inshorts: {
        name: 'Inshorts',
        Icon: NewsIcon,
        placeholder: "e.g., 'latest tech news'",
        theme: {
            '--color-primary': '#334155',
            '--color-primary-hover': '#1e2936',
            '--color-text': '#475569',
            '--color-ring': '#64748b',
            '--color-border': '#64748b',
        }
    }
};


const CATEGORIES: Record<Category, { name: string; agents: Agent[] }> = {
    social: {
        name: 'Social Media',
        agents: ['reddit', 'facebook', 'instagram']
    },
    news: {
        name: 'News',
        agents: ['inshorts']
    }
};

const convertToCSV = (data: SocialMediaPost[]): string => {
    if (data.length === 0) return "";
    const headers = ["platform", "event_id", "event_title", "event_url", "source_context", "author_name", "timestamp_utc", "likes", "comments", "clean_event_text", "event_content"];
    const escapeCSV = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csvRows = [headers.join(',')];
    for (const post of data) {
        const row = [
            escapeCSV(post.platform), escapeCSV(post.event_id), escapeCSV(post.event_title), escapeCSV(post.event_url),
            escapeCSV(post.source_context), escapeCSV(post.author_name), escapeCSV(post.timestamp_utc),
            escapeCSV(post.engagement_metrics.likes), escapeCSV(post.engagement_metrics.comments),
            escapeCSV(post.clean_event_text), escapeCSV(post.event_content)
        ];
        csvRows.push(row.join(','));
    }
    return csvRows.join('\n');
};

const App: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('social');
    const [activeAgent, setActiveAgent] = useState<Agent>('reddit');

    useEffect(() => {
        const theme = AGENT_CONFIG[activeAgent].theme;
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            if (value) {
                root.style.setProperty(key, value);
            }
        });
        // Special handling for gradient: remove bg color if gradient exists
        if (theme['--gradient-bg']) {
            root.style.removeProperty('--color-primary');
        }

    }, [activeAgent]);

    const handleCategoryChange = (category: Category) => {
        setActiveCategory(category);
        setActiveAgent(CATEGORIES[category].agents[0]);
    };

    return (
        <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 antialiased transition-colors duration-300">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <Header />
                <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
                <AgentTabs activeCategory={activeCategory} activeAgent={activeAgent} setActiveAgent={setActiveAgent} />
                <AgentInterface key={activeAgent} agent={activeAgent} />
            </main>
        </div>
    );
};

const Header: React.FC = () => (
    <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text)] transition-colors duration-300">
            AI Data Agent
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-4">
            Choose a category and an agent, then enter a topic to gather data from across the web.
        </p>
    </header>
);

interface CategoryTabsProps {
    activeCategory: Category;
    onCategoryChange: (category: Category) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onCategoryChange }) => (
    <div className="flex justify-center border-b border-slate-200 dark:border-slate-700">
        {(Object.keys(CATEGORIES) as Category[]).map(catKey => {
            const isActive = activeCategory === catKey;
            return (
                <button
                    key={catKey}
                    onClick={() => onCategoryChange(catKey)}
                    className={`px-6 py-2 text-lg font-bold transition-colors duration-200 ${
                        isActive 
                        ? 'text-[var(--color-text)]' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                    {CATEGORIES[catKey].name}
                </button>
            );
        })}
    </div>
);

interface AgentTabsProps {
    activeCategory: Category;
    activeAgent: Agent;
    setActiveAgent: (agent: Agent) => void;
}

const AgentTabs: React.FC<AgentTabsProps> = ({ activeCategory, activeAgent, setActiveAgent }) => {
    const agents = CATEGORIES[activeCategory].agents;
    return (
        <div className="max-w-3xl mx-auto mb-8 flex justify-center bg-slate-100 dark:bg-slate-800 p-1 rounded-b-lg">
            {agents.map((agent) => {
                const config = AGENT_CONFIG[agent];
                const isActive = activeAgent === agent;
                return (
                    <button
                        key={agent}
                        onClick={() => setActiveAgent(agent)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-all duration-200 ${
                            isActive
                                ? 'text-[var(--color-text)] border-[var(--color-border)]'
                                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        role="tab"
                        aria-selected={isActive}
                    >
                        <config.Icon className="w-5 h-5" />
                        <span>{config.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

const AgentInterface: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [topic, setTopic] = useState<string>('');
    const [posts, setPosts] = useState<SocialMediaPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchedTopic, setSearchedTopic] = useState<string>('');
    const [downloadFormat, setDownloadFormat] = useState<'json' | 'csv'>('csv');

    const handleScrape = useCallback(async () => {
        if (!topic.trim()) { setError("Please enter a topic to search."); return; }
        setIsLoading(true); setError(null); setPosts([]); setSearchedTopic(topic);
        try {
            const fetchedPosts = await fetchSocialMediaPosts(topic, agent);
            if (fetchedPosts.length === 0) setError("No posts found for this topic. Try being more specific or using different keywords.");
            setPosts(fetchedPosts);
        } catch (e) { setError((e as Error).message || "An unknown error occurred.");
        } finally { setIsLoading(false); }
    }, [topic, agent]);

    const handleDownload = () => {
        if (posts.length === 0) return;
        const safeTopic = searchedTopic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileContent = downloadFormat === 'csv' ? convertToCSV(posts) : JSON.stringify(posts, null, 2);
        const mimeType = downloadFormat === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
        const filename = `${agent}_posts_${safeTopic}.${downloadFormat}`;
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <InputSection agent={agent} topic={topic} setTopic={setTopic} onScrape={handleScrape} isLoading={isLoading} />
            {error && <ErrorMessage message={error} />}
            {isLoading && <LoadingIndicator agent={agent} />}
            {!isLoading && posts.length > 0 && (
                <ResultsSection posts={posts} onDownload={handleDownload} topic={searchedTopic} downloadFormat={downloadFormat} setDownloadFormat={setDownloadFormat} />
            )}
        </>
    );
};

const InputSection: React.FC<{ agent: Agent; topic: string; setTopic: (topic: string) => void; onScrape: () => void; isLoading: boolean; }> = ({ agent, topic, setTopic, onScrape, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onScrape(); };
    const config = AGENT_CONFIG[agent];
    const buttonStyle = config.theme['--gradient-bg'] ? { background: config.theme['--gradient-bg'] } : {};
    const buttonClasses = !config.theme['--gradient-bg'] ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]' : 'hover:opacity-90';

    return (
        <div className="max-w-2xl mx-auto mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                <input
                    type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={config.placeholder}
                    className={`w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent transition`}
                    disabled={isLoading} />
                <button
                    type="submit"
                    style={buttonStyle}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white rounded-lg shadow-md ${buttonClasses} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[var(--color-ring)] disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200`}
                    disabled={isLoading}>
                    <SearchIcon className="w-5 h-5" />
                    <span>{isLoading ? 'Searching...' : 'Search'}</span>
                </button>
            </form>
        </div>
    );
};

const LoadingIndicator: React.FC<{ agent: Agent }> = ({ agent }) => {
    const config = AGENT_CONFIG[agent];
    return (
        <div className="text-center py-10">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-border)] mx-auto`}></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">AI is gathering data from {config.name}... this may take a moment.</p>
        </div>
    );
}

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="max-w-3xl mx-auto my-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-r-lg" role="alert">
        <p className="font-bold">Error</p>
        <p>{message}</p>
    </div>
);

const ResultsSection: React.FC<{ posts: SocialMediaPost[]; onDownload: () => void; topic: string; downloadFormat: 'json' | 'csv'; setDownloadFormat: (format: 'json' | 'csv') => void; }> = ({ posts, onDownload, topic, downloadFormat, setDownloadFormat }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">Found {posts.length} results for "{topic}"</h2>
                <div className="relative inline-block text-left mt-2 sm:mt-0">
                    <div className="flex rounded-lg shadow-sm">
                        <button onClick={onDownload} className="flex items-center gap-2 px-5 py-2.5 font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-green-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-all duration-200">
                            <DownloadIcon className="w-5 h-5" />
                            <span>Download .{downloadFormat.toUpperCase()}</span>
                        </button>
                        <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)} className="px-2 py-2.5 text-white bg-green-600 hover:bg-green-700 focus:ring-green-600 rounded-r-lg border-l border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800" aria-haspopup="true" aria-expanded={isDropdownOpen}>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    {isDropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                                <a href="#" onClick={(e) => { e.preventDefault(); setDownloadFormat('json'); setIsDropdownOpen(false); }} className="text-slate-700 font-medium dark:text-slate-200 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">as JSON (.json)</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); setDownloadFormat('csv'); setIsDropdownOpen(false); }} className="text-slate-700 font-medium dark:text-slate-200 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">as CSV (.csv)</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 min-w-[300px]">Title & Summary</th><th scope="col" className="px-6 py-3">Source</th><th scope="col" className="px-6 py-3">Author</th><th scope="col" className="px-6 py-3 text-center">Likes</th><th scope="col" className="px-6 py-3 text-center">Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post, index) => {
                            const agent = post.platform.toLowerCase() as Agent;
                            return (
                                <tr key={index} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <a href={post.event_url} target="_blank" rel="noopener noreferrer" className={`font-semibold text-slate-900 dark:text-white hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors`}>{post.event_title}</a>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 italic">"{post.clean_event_text}"</p>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{agent === 'reddit' && post.source_context ? `r/${post.source_context}` : post.source_context}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{agent === 'reddit' ? `u/${post.author_name}` : post.author_name}</td>
                                    <td className="px-6 py-4 text-center font-medium">{post.engagement_metrics.likes}</td>
                                    <td className="px-6 py-4 text-center font-medium">{post.engagement_metrics.comments}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;
