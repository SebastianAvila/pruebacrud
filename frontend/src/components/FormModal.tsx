"use client";

import Modal from "./Modal";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  saving?: boolean;
  size?: "md" | "lg" | "xl";
}

export default function FormModal({
  open,
  onClose,
  title,
  children,
  saving = false,
  size = "md",
}: FormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} disableClose={saving} size={size}>
      {children}
    </Modal>
  );
}
