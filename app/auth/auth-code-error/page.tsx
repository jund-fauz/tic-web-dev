
export default function AuthCodeError() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-4 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p>There was an error authenticating your account. Please try again.</p>
      </div>
    </div>
  );
}
