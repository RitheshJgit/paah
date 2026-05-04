import { useEffect, useState } from 'react';
import { getTeams } from '../../features/team/teamAPI';

function TeamSearch() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const data = await getTeams();
    setTeams(data);
  };

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Search Teams</h1>

      <input
        placeholder="Search team..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      <div className="space-y-3">
        {filtered.map((team) => (
          <div key={team._id} className="border p-4">
            <h2 className="font-bold">{team.name}</h2>
            <p>Members: {team.members.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamSearch;