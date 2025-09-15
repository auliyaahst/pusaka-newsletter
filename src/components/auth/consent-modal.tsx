interface ConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  email: string;
}

export default function ConsentModal({ isOpen, onConfirm, onCancel, email }: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Account</h2>
        <p className="text-gray-600 mb-6">
          Would you like to create a new account with <span className="font-semibold">{email}</span>? 
          This will allow you to access The Pusaka Newsletter.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
