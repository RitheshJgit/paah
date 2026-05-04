import { useEffect, useState } from 'react';
import { getMyTasks } from '../../features/task/taskAPI';

function TaskHistory() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getMyTasks();
    const filtered = data.filter(
      (t) => t.status === 'approved' || t.status === 'rejected'
    );
    setTasks(filtered);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-6 font-bold">Task History</h1>

      {tasks.length === 0 && (
        <p className="text-gray-500">No completed tasks</p>
      )}

      <div className="space-y-4">
        {tasks.map((t) => (
          <div key={t._id} className="border p-4 rounded shadow-sm">

            <p className="font-semibold">{t.taskId.title}</p>

            <p className="text-sm">
              Status:
              <span
                className={`ml-2 font-semibold ${
                  t.status === 'approved'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {t.status}
              </span>
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskHistory;