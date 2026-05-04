import Button from "../common/Button";

function TeamCard({ team, onJoin }) {
  return (
    <div className="border p-4 rounded flex justify-between items-center">
      <div>
        <h2 className="font-bold">{team.name}</h2>
        <p className="text-sm text-gray-500">
          Members: {team.members?.length}
        </p>
      </div>

      <Button onClick={() => onJoin(team._id)}>Join</Button>
    </div>
  );
}

export default TeamCard;