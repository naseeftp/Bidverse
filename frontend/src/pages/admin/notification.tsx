import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationWorkSpace } from "../../components/layout/notifictionLayout";

interface NotificationPageProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminNotificationPage: React.FC<NotificationPageProps> = ({ 
  isOpen: propsIsOpen, 
  onClose: propsOnClose 
}) => {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = propsIsOpen ?? internalOpen;
  
  const handleClose = () => {
    if (propsOnClose) {
      propsOnClose();
    } else {
      setInternalOpen(false);
      navigate(-1); 
    }
  };

  return (
    <NotificationWorkSpace 
      roleTheme="admin" 
      isOpen={isOpen} 
      onClose={handleClose} 
    />
  );
};

export default AdminNotificationPage;