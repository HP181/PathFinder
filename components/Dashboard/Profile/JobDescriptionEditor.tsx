'use client';

import React, { useState, useEffect } from 'react';
import { useRecruiterStore } from '@/lib/Store/RecruiterStore';
import ReactMarkdown from 'react-markdown';

export function JobDescriptionEditor() {
  const { profile, updateProfile } = useRecruiterStore();
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    if (profile?.jobDescription) {
      setMarkdown(profile.jobDescription);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setMarkdown(newText);
    updateProfile({ jobDescription: newText });
  };

  return (
    <div className="space-y-4">
      <label className="block font-medium text-lg">Job Description (Markdown Supported)</label>
      
      <textarea
        value={markdown}
        onChange={handleChange}
        rows={8}
        className="w-full p-3 border rounded-md font-mono"
        placeholder="Write the job description here using **markdown**..."
      />

      <div>
        <p className="font-semibold mb-2">Preview:</p>
        <div className="prose prose-sm max-w-none border rounded-md p-4 bg-white">
          <ReactMarkdown>{markdown || '*Nothing to preview yet...*'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
