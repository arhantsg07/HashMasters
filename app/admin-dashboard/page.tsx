"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../auth";
import Sidebar from "../components/Sidebar";
import StatsPanel from "../components/StatsPanels";
import { MapPin, Clock, AlertCircle, CheckCircle, Activity, RefreshCw, Eye, BarChart3 } from "lucide-react";

interface Issue {
  id: string;
  user_id?: string;
  user_name?: string;
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  evidence_files?: string[];
  created_at?: string;
  is_spam?: boolean;
  status: string;
}

const statusConfig = {
  Reported: { 
    label: "Reported", 
    color: "bg-gray-100 text-gray-700",
    icon: AlertCircle,
    bgColor: "bg-gray-50"
  },
  "In Progress": { 
    label: "In Progress", 
    color: "bg-yellow-100 text-yellow-700",
    icon: Activity,
    bgColor: "bg-yellow-50"
  },
  Resolved: { 
    label: "Resolved", 
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    bgColor: "bg-green-50"
  }
};

const getEvidenceUrl = (file: string) =>
  file.startsWith("https://")
    ? file
    : `https://jzufaedxpawkaggwonkr.supabase.co/storage/v1/object/public/evidence/${file.replace(/^evidence\//, "")}`;

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Interactive Graph Component
const IssueGraph = ({ issues }: { issues: Issue[] }) => {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getCategoryData = () => {
    const categories = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getStatusData = () => {
    return [
      { status: 'Reported', count: issues.filter(i => i.status === 'Reported').length, color: '#6B7280' },
      { status: 'In Progress', count: issues.filter(i => i.status === 'In Progress').length, color: '#F59E0B' },
      { status: 'Resolved', count: issues.filter(i => i.status === 'Resolved').length, color: '#10B981' }
    ];
  };

  const days = getLast7Days();
  const categoryData = getCategoryData();
  const statusData = getStatusData();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Issue Analytics</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Status Distribution</h4>
          <div className="space-y-3">
            {statusData.map(({ status, count, color }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-sm text-gray-600">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${issues.length > 0 ? (count / issues.length) * 100 : 0}%`,
                        backgroundColor: color 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Categories</h4>
          <div className="space-y-2">
            {categoryData.map(([category, count], index) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${(count / issues.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const IssueCard = ({ issue, onStatusChange, onFlagSpam }: { 
  issue: Issue, 
  onStatusChange: (id: number, status: string) => void, 
  onFlagSpam: (id: number) => void 
}) => {
  const StatusIcon = statusConfig[issue.status as keyof typeof statusConfig]?.icon || AlertCircle;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon size={16} className="text-indigo-600" />
            <span className="font-semibold text-gray-900">{issue.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{issue.user_name}</span>
            {issue.is_spam && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Spam</span>
            )}
          </div>
        </div>
        
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[issue.status as keyof typeof statusConfig]?.color || statusConfig.Reported.color}`}>
            {statusConfig[issue.status as keyof typeof statusConfig]?.label || issue.status}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{issue.description}</p>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Clock size={12} />
          <span>{formatTimeAgo(issue.created_at || '')}</span>
        </div>
        
        {issue.evidence_files && issue.evidence_files.length > 0 && (
          <div className="flex gap-1 mb-3">
            {issue.evidence_files.slice(0, 3).map((file, idx) => (
              <img
                key={idx}
                src={getEvidenceUrl(file)}
                alt={`Evidence ${idx + 1}`}
                className="w-16 h-16 object-cover rounded border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ))}
            {issue.evidence_files.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                +{issue.evidence_files.length - 3}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            onClick={() => window.open(`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`, "_blank")}
          >
            <MapPin size={12} />
            View Location
          </button>
          
          <div className="flex gap-2">
            <select
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={issue.status}
              onChange={(e) => onStatusChange(parseInt(issue.id), e.target.value)}
            >
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <button
              onClick={() => onFlagSpam(parseInt(issue.id))}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Flag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reported' | 'in-progress' | 'resolved' | 'spam'>('all');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("reports").select("*").order('created_at', { ascending: false });
    if (data) setIssues(data as Issue[]);
    setLoading(false);
  };

  const handleStatusChange = async (id: number, status: string) => {
    await supabase.from("reports").update({ status }).eq("id", id);
    fetchIssues();
  };

  const handleFlagSpam = async (id: number) => {
    await supabase.from("reports").update({ is_spam: true }).eq("id", id);
    fetchIssues();
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = issues.filter(issue => {
    if (filter === 'spam') return issue.is_spam;
    if (filter === 'reported') return issue.status === 'Reported';
    if (filter === 'in-progress') return issue.status === 'In Progress';
    if (filter === 'resolved') return issue.status === 'Resolved';
    return true;
  });

  const statusCounts = {
    all: issues.length,
    reported: issues.filter(i => i.status === 'Reported').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
    spam: issues.filter(i => i.is_spam).length
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={fetchIssues}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <StatsPanel issues={issues} />
        
        <IssueGraph issues={issues} />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Issues</h2>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'reported', label: 'Reported', count: statusCounts.reported },
                { key: 'in-progress', label: 'In Progress', count: statusCounts.inProgress },
                { key: 'resolved', label: 'Resolved', count: statusCounts.resolved },
                { key: 'spam', label: 'Spam', count: statusCounts.spam }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-8">
              <Eye size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No issues found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
              {filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onStatusChange={handleStatusChange}
                  onFlagSpam={handleFlagSpam}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
