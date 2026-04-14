import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1F1F1F', // Deep Charcoal
          color: '#FFFFFF',
          borderRadius: '0px',   // Sharp minimalist corners
          fontSize: '14px',
          padding: '12px 24px',
        },
        success: {
          iconTheme: {
            primary: '#C9653B',   // Burnt Sienna
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#E74C3C',   // Standard Red for errors
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
};

export default ToastProvider;