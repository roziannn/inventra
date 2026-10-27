"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  /** what will happen; say what is lost when the action is destructive */
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  icon?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

/** Yes/no confirmation built on Modal. Use it for every destructive or irreversible action. */
export default function ConfirmDialog({ isOpen, title, message, confirmLabel = "Hapus", cancelLabel = "Batal", tone = "danger", icon, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="modal-secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "modal-danger" : "modal-primary"} onClick={onConfirm}>
            {icon} {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
