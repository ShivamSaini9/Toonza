const SplashScreen = () => {
  console.log("Rendering SplashScreen");
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
};
export default SplashScreen;
