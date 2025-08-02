// "use client";
// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// // import { createClient } from '@supabase/supabase-js';
// import { MapPin, AlertTriangle, Droplets, Trash2, Construction, Eye, Clock, Users, Search, Zap, Shield, Blocks } from 'lucide-react';
// import { supabase } from './auth';

// interface Issue {
//   id: string;
//   user_id: string;
//   user_name: string;
//   category: 'road_damage' | 'lightning' | 'water_supply' | 'cleanliness' | 'public_safety' | 'Obstructions';
//   description: string;
//   latitude: number;
//   longitude: number;
//   evidence_files?: string;
//   created_at: Date | string;
//   views: number;
//   votes: number;
// }

// const issueTypeConfig = {
//   road_damage: { icon: Construction, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Road Damage' },
//   lightning: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Lightning/Electrical' },
//   water_supply: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Water Supply' },
//   cleanliness: { icon: Trash2, color: 'text-green-600', bg: 'bg-green-100', label: 'Cleanliness'},
//   public_safety: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100', label: 'Public Safety'},
//   Obstructions: { icon: Blocks, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Obstructions'}
// };

// const statusConfig = {
//   reported: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Reported' },
//   investigating: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Investigating' },
//   in_progress: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'In Progress' },
//   resolved: { color: 'text-green-600', bg: 'bg-green-100', label: 'Resolved' }
// };

// export default function CivicIssueTracker() {
//   const [issues, setIssues] = useState<Issue[]>([]);
//   const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
//   const [selectedType, setSelectedType] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
//   const [radiusKm, setRadiusKm] = useState<number>(5);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');

//   // Haversine formula to calculate distance between two points
//   function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//     const R = 6371; // Earth's radius in kilometers
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2;
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   }

//   // Fetch user location using browser's geolocation API
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation([position.coords.latitude, position.coords.longitude]);
//         },
//         (err) => {
//           console.error("Error fetching user location:", err);
//           // Fallback to Kota, Rajasthan coordinates
//           setUserLocation([25.2138, 75.8648]);
//         }
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//       // Fallback to Kota, Rajasthan coordinates
//       setUserLocation([25.2138, 75.8648]);
//     }
//   }, []);

//   // Fetch issues from Supabase within 5km radius
//   useEffect(() => {
//     async function fetchIssues() {
//       if (!userLocation) return;

//       try {
//         setLoading(true);
//         const { data, error } = await supabase
//           .from('reports')
//           .select('*');
//         // Filtering by radius is not natively supported in Supabase JS client for lat/lng, so filter in JS:
//         const filteredData = data
//           ? data.filter((issue: any) => {
//               const lat = parseFloat(issue.latitude || 0);
//               const lng = parseFloat(issue.longitude || 0);
//               const dist = getDistance(userLocation[0], userLocation[1], lat, lng);
//               return dist <= radiusKm;
//             })
//           : [];

//         const processedIssues = filteredData.map((issue: any) => ({
//           ...issue,
//           created_at: new Date(issue.created_at),
//           latitude: parseFloat(issue.latitude || 0),
//           longitude: parseFloat(issue.longitude || 0),
//           views: parseInt(issue.views || 0),
//           votes: parseInt(issue.votes || 0)
//         }));

//         setIssues(processedIssues);
//         setError('');
//       } catch (err) {
//         console.error("Error fetching issues:", err);
//         setError("Failed to fetch issues. Please try again later.");
//         setIssues([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchIssues();
//   }, [userLocation, radiusKm]);

//   // Filter issues based on type and search term
//   useEffect(() => {
//     let filtered = [...issues];

//     // Filter by type
//     if (selectedType !== 'all') {
//       filtered = filtered.filter(issue => issue.category === selectedType);
//     }

//     // Filter by search term
//     if (searchTerm.trim()) {
//       const searchLower = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(issue =>
//         issue.user_name.toLowerCase().includes(searchLower) ||
//         issue.description.toLowerCase().includes(searchLower)
//       );
//     }

//     setFilteredIssues(filtered);
//   }, [selectedType, searchTerm, issues]);

//   const formatTimeAgo = (date: Date | string) => {
//     const issueDate = date instanceof Date ? date : new Date(date);
//     const now = new Date();
//     const diffInHours = Math.floor((now.getTime() - issueDate.getTime()) / (1000 * 60 * 60));

//     if (diffInHours < 1) return 'Just now';
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     return `${Math.floor(diffInHours / 24)}d ago`;
//   };

//   const IssueCard = ({ issue }: { issue: Issue }) => {
//     const typeConfig = issueTypeConfig[issue.category];
    
//     const config = typeConfig || {
//       icon: AlertTriangle,
//       color: 'text-gray-600',
//       bg: 'bg-gray-100',
//       label: issue.category
//     };
    
//     const TypeIcon = config.icon;

//     let distanceText = "";
//     if (userLocation && issue.latitude && issue.longitude) {
//       const dist = getDistance(
//         userLocation[0],
//         userLocation[1],
//         issue.latitude,
//         issue.longitude
//       );
//       distanceText = `${dist.toFixed(1)} km away`;
//     }

//     return (
//       <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
//         <div className="p-6">
//           <div className="flex items-start justify-between mb-4">
//             <div className={`${config.bg} ${config.color} p-2 rounded-lg`}>
//               <TypeIcon size={24} />
//             </div>
//             <div className="flex gap-2">
//               <span
//                 className="px-2 py-1 rounded-full text-xs font-medium"
//               >
//                 Reported
//               </span>
//             </div>
//           </div>

//           <h3 className="font-bold text-lg text-gray-800 mb-2">{issue.user_name}'s Report</h3>
//           <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>

//           {distanceText && (
//             <div className="text-sm text-blue-600 mb-4 font-medium">
//               {distanceText}
//             </div>
//           )}

//           <div className="flex items-center justify-between text-sm text-gray-500">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-1">
//                 <Eye size={16} />
//                 <span>{issue.views}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Users size={16} />
//                 <span>{issue.votes}</span>
//               </div>
//             </div>
//             <div className="flex items-center gap-1">
//               <Clock size={16} />
//               <span>{formatTimeAgo(issue.created_at)}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const stats = {
//     total: issues.length,
//     resolved: 0,
//     inProgress: 0,
//     reported: issues.length
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-xl text-gray-600">Loading issues...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center gap-3">
//               <div className="text-3xl">🏙</div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">CivicWatch</h1>
//                 <p className="text-xs text-gray-500">Kota Community Issues</p>
//               </div>
//             </div>

//             <div className='flex gap-4'>
//               <div className="flex items-center gap-4">
//                 <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
//                   <Link href="/login">Login</Link>
//                 </button>
//               </div>
//               <div className="flex items-center gap-4">
//                 <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
//                   <Link href="/admin-login">Admin Login</Link>
//                 </button>
//               </div>
//               <div className="flex items-center gap-4">
//                 <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
//                   <Link href="/report-issue">Report Issue</Link>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {error && (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//             {error}
//           </div>
//         </div>
//       )}

//       <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-4xl md:text-5xl font-bold mb-6">
//             Track Local Issues in Your Community
//           </h2>
//           <p className="text-xl md:text-2xl mb-8 text-blue-100">
//             View reported issues within {radiusKm} km radius of your location
//           </p>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
//               <div className="text-2xl font-bold">{stats.total}</div>
//               <div className="text-blue-100">Total Issues</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
//               <div className="text-2xl font-bold text-green-300">{stats.resolved}</div>
//               <div className="text-blue-100">Resolved</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
//               <div className="text-2xl font-bold text-yellow-300">{stats.inProgress}</div>
//               <div className="text-blue-100">In Progress</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
//               <div className="text-2xl font-bold text-red-300">{stats.reported}</div>
//               <div className="text-blue-100">Reported</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//           <div className="flex flex-col md:flex-row gap-4 items-center">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search issues by user name or description..."
//                   className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <select
//                 className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//               >
//                 <option value="all">All Types</option>
//                 <option value="road_damage">Road Damage</option>
//                 <option value="lightning">Lightning/Electrical</option>
//                 <option value="water_supply">Water Supply</option>
//                 <option value="cleanliness">Cleanliness</option>
//                 <option value="public_safety">Public Safety</option>
//                 <option value="Obstructions">Obstructions</option>
//               </select>

//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">Radius:</label>
//                 <input
//                   type="range"
//                   min="1"
//                   max="25"
//                   value={radiusKm}
//                   onChange={(e) => setRadiusKm(Number(e.target.value))}
//                   className="w-20"
//                 />
//                 <span className="text-sm text-gray-600">{radiusKm}km</span>
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-4 text-sm text-gray-600">
//             Showing {filteredIssues.length} of {issues.length} issues
//             {userLocation && ` within ${radiusKm}km radius`}
//             {selectedType !== 'all' && ` • Filtered by: ${issueTypeConfig[selectedType as keyof typeof issueTypeConfig]?.label || selectedType}`}
//             {searchTerm && ` • Search: "${searchTerm}"`}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredIssues.map((issue) => (
//             <IssueCard key={issue.id} issue={issue} />
//           ))}
//         </div>

//         {filteredIssues.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <div className="text-6xl mb-4">🔍</div>
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">No issues found</h3>
//             <p className="text-gray-500">
//               {issues.length === 0 
//                 ? "No issues have been reported yet." 
//                 : "Try adjusting your filters, search terms, or increase the radius range."
//               }
//             </p>
//           </div>
//         )}
//       </section>

//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-white">
//             <h3 className="text-2xl font-bold mb-2">Interactive Map View</h3>
//             <p>Visualize all reported issues on an interactive map</p>
//           </div>
//           <div className="h-96 bg-gray-100 flex items-center justify-center">
//             <div className="text-center">
//               <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600 text-lg">Interactive map integration coming soon</p>
//               <p className="text-gray-500">Will show all issues within {radiusKm}km radius</p>
//               {userLocation && (
//                 <p className="text-gray-500 mt-2">
//                   Current location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       <footer className="bg-gray-800 text-white py-12 mt-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="text-4xl mb-4">🏙</div>
//             <h4 className="text-2xl font-bold mb-2">CivicWatch</h4>
//             <p className="text-gray-400 mb-6">Making Kota a better place, one report at a time</p>
//             <div className="flex justify-center gap-8 text-sm">
//               <a href="#" className="hover:text-blue-400 transition-colors">About</a>
//               <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
//               <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
//               <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }


"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, AlertTriangle, Droplets, Trash2, Construction, Eye, Clock, Users, Search, Zap, Shield, Blocks } from 'lucide-react';
import { supabase } from './auth';

interface Issue {
  id: string;
  user_id: string;
  user_name: string;
  category: 'road_damage' | 'lightning' | 'water_supply' | 'cleanliness' | 'public_safety' | 'obstructions';
  description: string;
  latitude: number;
  longitude: number;
  evidence_files?: string;
  created_at: Date | string;
  views: number;
  votes: number;
  status?: 'reported' | 'investigating' | 'in_progress' | 'resolved';
}

const issueTypeConfig = {
  road_damage: { icon: Construction, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Road Damage' },
  lightning: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Lightning/Electrical' },
  water_supply: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Water Supply' },
  cleanliness: { icon: Trash2, color: 'text-green-600', bg: 'bg-green-100', label: 'Cleanliness'},
  public_safety: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100', label: 'Public Safety'},
  obstructions: { icon: Blocks, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Obstructions'}
};

const statusConfig = {
  reported: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Reported' },
  investigating: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Investigating' },
  in_progress: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'In Progress' },
  resolved: { color: 'text-green-600', bg: 'bg-green-100', label: 'Resolved' }
};

export default function CivicIssueTracker() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Haversine formula to calculate distance between two points
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Fetch user location using browser's geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.error("Error fetching user location:", err);
          // Fallback to Kota, Rajasthan coordinates
          setUserLocation([25.2138, 75.8648]);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback to Kota, Rajasthan coordinates
      setUserLocation([25.2138, 75.8648]);
    }
  }, []);

  // Fetch issues from Supabase within radius
  useEffect(() => {
    async function fetchIssues() {
      if (!userLocation) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          setError("Failed to fetch issues from database.");
          return;
        }

        // Filter by radius in JavaScript since PostGIS might not be available
        const filteredData = data
          ? data.filter((issue: any) => {
              const lat = parseFloat(issue.latitude || 0);
              const lng = parseFloat(issue.longitude || 0);
              
              // Skip issues with invalid coordinates
              if (lat === 0 && lng === 0) return false;
              
              const dist = getDistance(userLocation[0], userLocation[1], lat, lng);
              return dist <= radiusKm;
            })
          : [];

        const processedIssues: Issue[] = filteredData.map((issue: any) => ({
          ...issue,
          created_at: new Date(issue.created_at),
          latitude: parseFloat(issue.latitude || 0),
          longitude: parseFloat(issue.longitude || 0),
          views: parseInt(issue.views || 0, 10),
          votes: parseInt(issue.votes || 0, 10),
          status: issue.status || 'reported'
        }));

        setIssues(processedIssues);
        setError('');
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to fetch issues. Please check your connection and try again.");
        setIssues([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchIssues();
  }, [userLocation, radiusKm]);

  // Filter issues based on type and search term
  useEffect(() => {
    let filtered = [...issues];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(issue => issue.category === selectedType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(issue =>
        issue.user_name?.toLowerCase().includes(searchLower) ||
        issue.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredIssues(filtered);
  }, [selectedType, searchTerm, issues]);

  const formatTimeAgo = (date: Date | string) => {
    const issueDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - issueDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const IssueCard = ({ issue }: { issue: Issue }) => {
    const typeConfig = issueTypeConfig[issue.category];
    
    const config = typeConfig || {
      icon: AlertTriangle,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      label: issue.category
    };
    
    const TypeIcon = config.icon;
    const status = issue.status || 'reported';
    const statusStyle = statusConfig[status];

    let distanceText = "";
    if (userLocation && issue.latitude && issue.longitude) {
      const dist = getDistance(
        userLocation[0],
        userLocation[1],
        issue.latitude,
        issue.longitude
      );
      distanceText = `${dist.toFixed(1)} km away`;
    }

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`${config.bg} ${config.color} p-2 rounded-lg`}>
              <TypeIcon size={24} />
            </div>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}
              >
                {statusStyle.label}
              </span>
            </div>
          </div>

          <h3 className="font-bold text-lg text-gray-800 mb-2">
            {issue.user_name ? `${issue.user_name}'s Report` : 'Anonymous Report'}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2">{issue.description || 'No description provided'}</p>

          {distanceText && (
            <div className="text-sm text-blue-600 mb-4 font-medium">
              📍 {distanceText}
            </div>
          )}

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
              <span>{formatTimeAgo(issue.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate stats with proper status handling
  const stats = {
    total: issues.length,
    resolved: issues.filter(issue => issue.status === 'resolved').length,
    inProgress: issues.filter(issue => issue.status === 'in_progress' || issue.status === 'investigating').length,
    reported: issues.filter(issue => issue.status === 'reported' || !issue.status).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏙</div>
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

              <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Login
              </Link>
              <Link href="/admin-login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Admin Login
              </Link>
              <Link href="/report-issue" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Report Issue
              </Link>

            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Track Local Issues in Your Community
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            View reported issues within {radiusKm} km radius of your location
          </p>

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search issues by user name or description..."
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
                <option value="lightning">Lightning/Electrical</option>
                <option value="water_supply">Water Supply</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="public_safety">Public Safety</option>
                <option value="obstructions">Obstructions</option>
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
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredIssues.length} of {issues.length} issues
            {userLocation && ` within ${radiusKm}km radius`}
            {selectedType !== 'all' && ` • Filtered by: ${issueTypeConfig[selectedType as keyof typeof issueTypeConfig]?.label || selectedType}`}
            {searchTerm && ` • Search: "${searchTerm}"`}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>

        {filteredIssues.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No issues found</h3>
            <p className="text-gray-500">
              {issues.length === 0 
                ? "No issues have been reported in your area yet." 
                : "Try adjusting your filters, search terms, or increase the radius range."
              }
            </p>
          </div>
        )}
      </section>

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
              <p className="text-gray-500">Will show all issues within {radiusKm}km radius</p>
              {userLocation && (
                <p className="text-gray-500 mt-2">
                  Current location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🏙</div>
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