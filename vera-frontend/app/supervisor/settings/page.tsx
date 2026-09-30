"use client";

export default function SupervisorSettings() {
  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>

      <div className="max-w-md mx-auto space-y-6">

        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Camera Settings</h2>
          <p className="text-sm text-gray-400">
            (Future) Select front/rear camera
          </p>
        </div>

        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Theme</h2>
          <p className="text-sm text-gray-400">
            (Future) Light / Dark mode toggle
          </p>
        </div>

        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Supervisor Profile</h2>
          <p className="text-sm text-gray-400">
            (Future) Show supervisor name, role, permissions
          </p>
        </div>
      </div>
    </div>
  );
}
