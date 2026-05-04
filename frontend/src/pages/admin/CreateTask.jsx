import { useState } from 'react';
import { createTask } from '../../features/task/taskAPI';

const TASK_TYPES = [
  { value: 'common',  label: 'Common',  desc: 'Available to all teams' },
  { value: 'special', label: 'Special', desc: 'Limited team slots' },
  { value: 'collab',  label: 'Collab',  desc: 'Collaborative task' },
];

/* ── Small reusable field wrapper ── */
function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function CreateTask() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    creditPoints: '',
    maxTeams: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setSuccess(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.type || !form.creditPoints || !form.deadline)
      return alert('Fill all required fields');

    if (form.creditPoints <= 0)
      return alert('Credits must be greater than 0');

    if (form.type !== 'common' && !form.maxTeams)
      return alert('Max teams required for this task type');

    if (new Date(form.deadline) <= new Date())
      return alert('Deadline must be in the future');

    try {
      setLoading(true);
      await createTask({
        ...form,
        creditPoints: Number(form.creditPoints),
        maxTeams: form.type === 'common' ? null : Number(form.maxTeams),
      });

      setSuccess(true);
      setForm({ title: '', description: '', type: '', creditPoints: '', maxTeams: '', deadline: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  /* min datetime for the deadline picker (now) */
  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  const inputBase =
    'w-full px-3.5 py-2.5 text-sm text-gray-800 bg-[#fafbff] border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300';

  return (
    <div className="min-h-screen bg-[#f0f4ff] py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Admin Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Create New Task
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details below to publish a task to the platform.
          </p>
        </div>

        {/* ── Success banner ── */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded-lg px-4 py-3 mb-5 text-sm text-green-700 font-medium">
            <svg className="w-4 h-4 shrink-0 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Task created successfully and is now live on the platform.
          </div>
        )}

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-blue-50 overflow-hidden">

          {/* Card top accent */}
          <div className="h-1 bg-gradient-to-r from-blue-800 to-blue-400" />

          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">

            {/* TITLE */}
            <Field label="Task Title" required>
              <input
                name="title"
                placeholder="e.g. Community Clean-up Drive"
                value={form.title}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>

            {/* DESCRIPTION */}
            <Field label="Description" hint="Briefly explain what volunteers need to do.">
              <textarea
                name="description"
                placeholder="Describe the task objectives, steps, and any requirements…"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className={`${inputBase} resize-none`}
              />
            </Field>

            {/* TYPE */}
            <Field label="Task Type" required>
              <div className="grid grid-cols-3 gap-2.5">
                {TASK_TYPES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, type: value, maxTeams: '' })); }}
                    className={`flex flex-col items-start gap-0.5 px-3 py-3 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer
                      ${form.type === value
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                  >
                    <span className={`text-sm font-700 font-semibold ${form.type === value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {label}
                    </span>
                    <span className="text-[10.5px] text-gray-400 leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* MAX TEAMS — only for non-common */}
            {form.type && form.type !== 'common' && (
              <Field
                label="Max Teams"
                required
                hint={`Maximum number of teams that can take this ${form.type} task.`}
              >
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                  <input
                    type="number"
                    name="maxTeams"
                    min="1"
                    placeholder="e.g. 5"
                    value={form.maxTeams}
                    onChange={handleChange}
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </Field>
            )}

            {/* CREDIT + DEADLINE — side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="Credit Points" required hint="Points awarded on approval.">
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <input
                    type="number"
                    name="creditPoints"
                    min="1"
                    placeholder="e.g. 50"
                    value={form.creditPoints}
                    onChange={handleChange}
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </Field>

              <Field label="Deadline" required hint="Must be a future date and time.">
                <input
                  type="datetime-local"
                  name="deadline"
                  min={minDate}
                  value={form.deadline}
                  onChange={handleChange}
                  className={inputBase}
                />
              </Field>

            </div>

            {/* ── Divider ── */}
            <div className="border-t border-gray-100 pt-2" />

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 rounded-xl text-white text-sm font-semibold tracking-wide
                bg-gradient-to-r from-blue-800 to-blue-600
                hover:from-blue-700 hover:to-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 hover:shadow-lg hover:shadow-blue-200
                active:scale-[0.99] overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Creating Task…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create Task
                </span>
              )}
            </button>

          </form>
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-gray-400 mt-5">
          Tasks are immediately visible to volunteers after creation.
        </p>

      </div>
    </div>
  );
}

export default CreateTask;