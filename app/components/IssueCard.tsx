"use client";
import React from "react";

interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  image_url?: string;
  location?: string;
  category?: string;
  user_id?: string;
}

interface Props {
  issue: Issue;
  onStatusChange: (id: number, status: string) => void;
  onFlagSpam?: (id: number) => void;
}

const statusOptions = ["Reported", "In Progress", "Resolved"];

const IssueCard = ({ issue, onStatusChange, onFlagSpam }: Props) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md mb-4">
      <h3 className="text-lg font-semibold">{issue.title}</h3>
      <p className="text-sm text-gray-700">{issue.description}</p>
      <div className="text-xs text-gray-500 my-2">
        <span>{issue.category}</span> · <span>{issue.location}</span>
      </div>
      {issue.image_url && (
        <img src={issue.image_url} alt="issue" className="rounded mt-2 max-h-48" />
      )}
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              issue.status === "Resolved"
                ? "bg-green-200 text-green-800"
                : issue.status === "In Progress"
                ? "bg-yellow-200 text-yellow-800"
                : issue.status === "Reported"
                ? "bg-red-200 text-red-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {issue.status}
          </span>
          {/* Status change buttons */}
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(issue.id, status)}
              className={`text-xs px-2 py-1 rounded border ${
                issue.status === status
                  ? "bg-indigo-100 border-indigo-400 text-indigo-700 font-bold"
                  : "bg-gray-50 border-gray-300 text-gray-600"
              } hover:bg-indigo-200 hover:text-indigo-900 transition`}
              disabled={issue.status === status}
            >
              {status}
            </button>
          ))}
        </div>
        {/* Flag as spam button */}
        <button
          onClick={() => onFlagSpam?.(issue.id)}
          className="text-xs text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-50 mt-2 self-end"
        >
          Flag as Spam
        </button>
      </div>
    </div>
  );
};

export default IssueCard;
