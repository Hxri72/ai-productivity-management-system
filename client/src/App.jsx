import { Toaster } from "react-hot-toast";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
          },
        }}
      />
    </>
  );
}

export default App;
