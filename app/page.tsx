"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, AlertTriangle, Droplets, Trash2, Construction, Eye, Clock, Users, Filter, Search } from 'lucide-react';

interface Issue {
  id: string;
  type: 'road_damage' | 'garbage' | 'water_leak';
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'investigating' | 'in_progress' | 'resolved';
  reportedAt: Date;
  views: number;
  votes: number;
  image?: string;
}

const mockIssues: Issue[] = [
  {
    id: '1',
    type: 'road_damage',
    title: 'Large Pothole on Main Street',
    description: 'Deep pothole causing vehicle damage near the intersection',
    location: 'Main Street & 5th Avenue',
    coordinates: { lat: 25.2138, lng: 75.8648 },
    priority: 'high',
    status: 'investigating',
    reportedAt: new Date('2024-08-01T10:30:00'),
    views: 127,
    votes: 23
  },
  {
    id: '2',
    type: 'water_leak',
    title: 'Water Main Break',
    description: 'Continuous water flow from underground pipe',
    location: 'Park Avenue near Community Center',
    coordinates: { lat: 25.2145, lng: 75.8655 },
    priority: 'high',
    status: 'in_progress',
    reportedAt: new Date('2024-08-01T14:15:00'),
    views: 89,
    votes: 34
  },
  {
    id: '3',
    type: 'garbage',
    title: 'Overflowing Waste Bins',
    description: 'Multiple garbage bins overflowing, attracting pests',
    location: 'Central Market Area',
    coordinates: { lat: 25.2132, lng: 75.8642 },
    priority: 'medium',
    status: 'reported',
    reportedAt: new Date('2024-08-02T08:45:00'),
    views: 56,
    votes: 12
  },
  {
    id: '4',
    type: 'road_damage',
    title: 'Broken Street Light',
    description: 'Street light pole damaged, creating safety hazard',
    location: 'Residential Colony Gate 2',
    coordinates: { lat: 25.2128, lng: 75.8660 },
    priority: 'medium',
    status: 'reported',
    reportedAt: new Date('2024-08-02T16:20:00'),
    views: 34,
    votes: 8
  },
  {
    id: '5',
    type: 'water_leak',
    title: 'Leaking Fire Hydrant',
    description: 'Fire hydrant continuously leaking water onto street',
    location: 'Industrial Area Block C',
    coordinates: { lat: 25.2152, lng: 75.8635 },
    priority: 'low',
    status: 'resolved',
    reportedAt: new Date('2024-07-30T12:00:00'),
    views: 45,
    votes: 15
  }
];

const issueTypeConfig = {
  road_damage: { icon: Construction, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Road Damage' },
  garbage: { icon: Trash2, color: 'text-green-600', bg: 'bg-green-100', label: 'Garbage' },
  water_leak: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Water Leak' }
};

const priorityConfig = {
  high: { color: 'text-red-600', bg: 'bg-red-100', label: 'High' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
  low: { color: 'text-green-600', bg: 'bg-green-100', label: 'Low' }
};

const statusConfig = {
  reported: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Reported' },
  investigating: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Investigating' },
  in_progress: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'In Progress' },
  resolved: { color: 'text-green-600', bg: 'bg-green-100', label: 'Resolved' }
};

export default function CivicIssueTracker() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>(mockIssues);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // User login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check localStorage for user info
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj.isLoggedIn && userObj.username) {
        setIsLoggedIn(true);
        setUsername(userObj.username);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    setUsername('');
  };

  useEffect(() => {
    let filtered = issues;

    if (selectedType !== 'all') {
      filtered = filtered.filter(issue => issue.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === selectedPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  }, [selectedType, selectedPriority, searchTerm, issues]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const IssueCard = ({ issue }: { issue: Issue }) => {
    const typeConfig = issueTypeConfig[issue.type];
    const TypeIcon = typeConfig.icon;

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`${typeConfig.bg} ${typeConfig.color} p-2 rounded-lg`}>
              <TypeIcon size={24} />
            </div>
            <div className="flex gap-2">
              <span className={`${priorityConfig[issue.priority].bg} ${priorityConfig[issue.priority].color} px-2 py-1 rounded-full text-xs font-medium`}>
                {priorityConfig[issue.priority].label}
              </span>
              <span className={`${statusConfig[issue.status].bg} ${statusConfig[issue.status].color} px-2 py-1 rounded-full text-xs font-medium`}>
                {statusConfig[issue.status].label}
              </span>
            </div>
          </div>

          <h3 className="font-bold text-lg text-gray-800 mb-2">{issue.title}</h3>
          <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>

          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin size={16} className="mr-1" />
            <span>{issue.location}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{issue.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{issue.votes}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{formatTimeAgo(issue.reportedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stats = {
    total: issues.length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    reported: issues.filter(i => i.status === 'reported').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏙️</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CivicWatch</h1>
                <p className="text-xs text-gray-500">Kota Community Issues</p>
              </div>
            </div>

            <div className='flex gap-4'>
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-semibold">Welcome, {username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full font-medium hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Logout
                  </button>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                      <Link href="/my-issues">My Issues </Link>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                      <Link href="/login">Login </Link>
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                      <Link href="/AdminLogin">Admin Login</Link>
                    </button>
                  </div>
                </>
              )}
              <div className="flex items-center gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  <Link href="/report-issue">Report Issue</Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Track Local Issues in Your Community
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            View reported road damages, garbage issues, and water leaks within {radiusKm} km radius
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-blue-100">Total Issues</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold text-green-300">{stats.resolved}</div>
              <div className="text-blue-100">Resolved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-300">{stats.inProgress}</div>
              <div className="text-blue-100">In Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold text-red-300">{stats.reported}</div>
              <div className="text-blue-100">Reported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search issues by title or location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="road_damage">Road Damage</option>
                <option value="garbage">Garbage</option>
                <option value="water_leak">Water Leak</option>
              </select>

              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Radius:</label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">{radiusKm}km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No issues found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </section>

      {/* Map Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">Interactive Map View</h3>
            <p>Visualize all reported issues on an interactive map</p>
          </div>
          <div className="h-96 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Interactive map integration coming soon</p>
              <p className="text-gray-500">Will show all issues within {radiusKm}km radius of Kota, Rajasthan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🏙️</div>
            <h4 className="text-2xl font-bold mb-2">CivicWatch</h4>
            <p className="text-gray-400 mb-6">Making Kota a better place, one report at a time</p>
            <div className="flex justify-center gap-8 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">About</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}