function LeaderboardCard({ user, rank }) {
  return (
    <div className="border p-4 rounded flex justify-between">
      <span>{rank}. {user.name}</span>
      <span>{user.credits} pts</span>
    </div>
  );
}

export default LeaderboardCard;