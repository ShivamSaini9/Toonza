import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

const creations = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b",
    prompt: "A futuristic city floating above the clouds at sunset",
    user: "Alex",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    prompt: "Cyberpunk street with neon lights and rain",
    user: "Maya",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    prompt: "AI-generated portrait of a medieval warrior queen",
    user: "John",
  },
];

const CommunityGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {creations.map((item) => (
      <motion.div
        key={item.id}
        whileHover={{ scale: 1.02 }}
        className="relative rounded-2xl overflow-hidden border border-slate-800 group"
      >
        <img
          src={item.image}
          alt={item.prompt}
          className="h-72 w-full object-cover"
        />

        {/* Top user info */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full text-sm">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
            {item.user[0]}
          </div>
          <span>{item.user}</span>
        </div>

        {/* Prompt overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-sm text-slate-200 translate-y-full group-hover:translate-y-0 transition">
          {item.prompt}
        </div>
      </motion.div>
    ))}
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // const handleLogout = async () => {
  //   try {
  //     await logout(); // handled in AuthContext
  //     navigate("/");
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  if (!user) {
    console.log("No user data available. in dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex gap-6 p-4">
      <Sidebar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Imagine. Generate. <span className="text-indigo-400">Create.</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Explore AI-powered tools and discover creations shared by the
            community. Turn ideas into visuals, words, and experiences.
          </p>
        </section>

        {/* Community Creations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Community Creations</h2>
          <CommunityGrid />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

//  return (
//     <>
//       {/* Header */}
//       <header className="dashboard-header">
//         <strong>Dashboard</strong>

//         <div className="header-right">
//           <img
//             src={user.avatar}
//             alt="avatar"
//             className="header-avatar"
//           />
//           <button onClick={handleLogout} className="logout-btn">
//             Logout
//           </button>
//         </div>
//       </header>

//       <div className="container">
//         {/* Profile Section */}
//         <section className="profile">
//           <img src={user.avatar} alt="Avatar" className="profile-avatar" />

//           <div className="profile-info">
//             <h2>{user.fullName}</h2>
//             <p>
//               <strong>Email:</strong> {user.email}
//             </p>
//             <p>
//               <strong>Username:</strong> {user.username}
//             </p>
//           </div>
//         </section>

//         {/* Users Table */}

//       </div>
//     </>
//   );
