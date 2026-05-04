import { useAuth } from '../../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Dashboard</h1>

      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Credits: {user.credits}</p>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 mt-4"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;