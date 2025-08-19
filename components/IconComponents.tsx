
import React from 'react';

export const RedditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,0C5.373,0,0,5.373,0,12c0,6.627,5.373,12,12,12s12-5.373,12-12C24,5.373,18.627,0,12,0z M12,21.818 c-5.41,0-9.818-4.408-9.818-9.818S6.59,2.182,12,2.182s9.818,4.408,9.818,9.818S17.41,21.818,12,21.818z" />
    <path d="M12,6.409c-0.545,0-0.99,0.445-0.99,0.99s0.445,0.99,0.99,0.99s0.99-0.445,0.99-0.99S12.545,6.409,12,6.409z" />
    <path d="M16.95,12.288c0-1.545-1.255-2.8-2.8-2.8s-2.8,1.255-2.8,2.8s1.255,2.8,2.8,2.8c0.015,0,0.03-0.002,0.045-0.002 c-0.895,0.885-2.2,1.432-3.645,1.432c-2.76,0-5-1.12-5-2.5s2.24-2.5,5-2.5c0.885,0,1.71,0.22,2.43,0.6 c0.37-0.9,1.26-1.53,2.27-1.53c1.385,0,2.5,1.115,2.5,2.5c0,0.855-0.425,1.61-1.09,2.055C16.97,12.308,16.95,12.298,16.95,12.288z" />
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);
