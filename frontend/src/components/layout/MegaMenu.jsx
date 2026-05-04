import { useNavigate } from 'react-router-dom';
function MegaMenu({ type }) {
  const navigate = useNavigate();

  const data = {
    tasks: [
      {
        title: "Tasks",
        items: [["Available Tasks", "/tasks"]],
      },
      {
        title: "Your Work",
        items: [["My Tasks", "/my-tasks"], ["Task History", "/task-history"]],
      },
    ],
    donate: [
      {
        title: "Donate",
        items: [["Make Donation", "/donate"]],
      },
      {
        title: "Your Activity",
        items: [["My Donations", "/my-donations"], ["My Impact", "/my-impact"]],
      },
    ],
  };

  const sections = data[type] || [];

  return (
    <div className="absolute left-0 top-full w-full z-50">

      {/* FULL WIDTH BAR */}
      <div className="bg-[#7a6a55] text-white py-10 shadow-xl">

        {/* CENTERED CONTENT */}
        <div className="max-w-6xl mx-auto px-10">

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">

            {sections.map((sec, i) => (
              <div key={i}>
                <h3 className="font-semibold text-lg mb-4">
                  {sec.title}
                </h3>

                <div className="space-y-2">
                  {sec.items.map(([label, path], idx) => (
                    <p
                      key={idx}
                      onClick={() => navigate(path)}
                      className="cursor-pointer text-sm opacity-90 hover:opacity-100 hover:translate-x-1 transition"
                    >
                      {label}
                    </p>
                  ))}
                </div>
              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}

export default MegaMenu;