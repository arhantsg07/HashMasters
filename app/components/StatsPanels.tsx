"use client";
import React from "react";
import { TrendingUp, Activity, CheckCircle, AlertCircle } from "lucide-react";

interface Issue {
  status: string;
}

const StatsPanel = ({ issues }: { issues: Issue[] }) => {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const reported = issues.filter((i) => i.status === "Reported").length;

  const stats = [
    {
      label: "Total Issues",
      value: total,
      icon: TrendingUp,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Activity,
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      label: "Reported",
      value: reported,
      icon: AlertCircle,
      color: "bg-gray-500",
      textColor: "text-gray-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <Icon size={20} className={stat.textColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsPanel;
