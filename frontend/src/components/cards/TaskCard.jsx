function TaskCard({ task, onAccept, disabled, reason }) {
  return (
    <div className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition">

      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">{task.title}</h2>

        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
          {task.type}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-2">
        {task.description}
      </p>

<p className="text-sm mt-1">
  Credits : {task.creditPoints} pts
</p>

      

      {task.maxTeams && (
        <p className="text-xs text-gray-500">
          Teams: {task.teamsJoined.length}/{task.maxTeams}
        </p>
      )}

      {/* BUTTON */}
      {disabled ? (
        <div className="mt-3">
          <button
            disabled
            className="bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed"
          >
            Not Available
          </button>

          {reason && (
            <p className="text-xs text-red-500 mt-1">
              {reason}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => onAccept(task._id)}
          className="bg-green-500 text-white px-3 py-1 mt-3 rounded"
        >
          Accept Task
        </button>
      )}
    </div>
  );
}

export default TaskCard;