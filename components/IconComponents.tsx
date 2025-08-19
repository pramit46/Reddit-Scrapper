
import React from 'react';

export const RedditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,0C5.373,0,0,5.373,0,12c0,6.627,5.373,12,12,12s12-5.373,12-12C24,5.373,18.627,0,12,0z M12,21.818 c-5.41,0-9.818-4.408-9.818-9.818S6.59,2.182,12,2.182s9.818,4.408,9.818,9.818S17.41,21.818,12,21.818z M16.3,10.9 c-0.6,0-1.1,0.5-1.1,1.1s0.5,1.1,1.1,1.1s1.1-0.5,1.1-1.1S16.9,10.9,16.3,10.9z M7.7,10.9c-0.6,0-1.1,0.5-1.1,1.1s0.5,1.1,1.1,1.1 s1.1-0.5,1.1-1.1S8.3,10.9,7.7,10.9z M12,15.5c-2.8,0-5.1,1.3-5.1,2.9c0,0.2,0,0.4,0.1,0.6c0.1,0.2,0.3,0.3,0.5,0.2 c1.1-0.4,2.8-0.7,4.5-0.7s3.4,0.3,4.5,0.7c0.2,0.1,0.4,0,0.5-0.2c0.1-0.2,0.1-0.4,0.1-0.6C17.1,16.8,14.8,15.5,12,15.5z"/>
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22,12c0-5.523-4.477-10-10-10S2,6.477,2,12c0,4.99,3.657,9.128,8.438,9.878V15.89h-2.54V12.89h2.54V10.66 c0-2.522,1.503-3.908,3.774-3.908c1.09,0,2.235,0.198,2.235,0.198v2.58h-1.32c-1.25,0-1.65,0.77-1.65,1.58v1.87h2.9l-0.467,3 H14.938v5.988C18.343,21.128,22,16.99,22,12z"/>
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <rect x="4" y="4" width="16" height="16" rx="4"></rect>
    <circle cx="12" cy="12" r="3"></circle>
    <line x1="16.5" y1="7.5" x2="16.5" y2="7.501"></line>
  </svg>
);

export const NewsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"></path>
        <path d="M18 6H6v8h12V6zM6 18h12"></path>
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
