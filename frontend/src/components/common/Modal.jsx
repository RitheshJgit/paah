function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;