"use client";

import React, { useState } from "react";
import { IconCircleCheck, IconCircleX, IconTags } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import FormLabel from "@/components/ui/FormLabel";
import { fieldClass } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export interface Group {
  name: string;
  isActive: boolean;
}

interface GroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** short explanation shown in the banner */
  description: string;
  groups: Group[];
  /** shown after the group name, e.g. "3 ruangan" */
  usage?: (groupName: string) => string;
  addLabel?: string;
  addPlaceholder?: string;
  listLabel?: string;
  /** return an error message to reject the new name, or nothing to accept it */
  onAdd: (name: string) => string | void;
  onToggle: (name: string) => void;
}

/**
 * Add and activate/deactivate groups (categories, locations, ...). Same layout as the group
 * dialogs on the Inventory and Assets pages. Inactive groups stay on existing records but can't be picked for new ones.
 */
export default function GroupManagerModal({
  isOpen,
  onClose,
  title,
  description,
  groups,
  usage,
  addLabel = "Tambah grup baru",
  addPlaceholder,
  listLabel = "Grup terdaftar",
  onAdd,
  onToggle,
}: GroupManagerModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const message = onAdd(trimmed);
    if (message) {
      setError(message);
      return;
    }
    setName("");
    setError("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
          <p className="text-sm font-medium leading-relaxed text-violet-800 dark:text-violet-300">{description}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <FormLabel htmlFor="group-name">{addLabel}</FormLabel>
          <div className="flex gap-2">
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder={addPlaceholder}
              className={`${fieldClass} flex-1`}
              aria-invalid={!!error}
            />
            <Button variant="modal-primary" type="submit" disabled={!name.trim()}>
              Tambah
            </Button>
          </div>
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        </form>

        <div className="space-y-3">
          <FormLabel>{listLabel}</FormLabel>
          <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-2">
            {groups.map((group) => (
              <div
                key={group.name}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${group.isActive ? "border-gray-100 bg-white dark:border-gray-100/10" : "border-gray-200 bg-gray-50/50 opacity-60"}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${group.isActive ? "bg-violet-100 text-violet-700" : "bg-gray-200 text-gray-500"}`}>
                    <IconTags size={16} />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm text-gray-700">{group.name}</span>
                    <span className="text-xs text-gray-500">
                      {group.isActive ? "Active" : "Inactive"}
                      {usage ? ` · ${usage(group.name)}` : ""}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(group.name)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${group.isActive ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-violet-50 text-violet-600 hover:bg-violet-100"}`}
                >
                  {group.isActive ? <IconCircleX size={14} /> : <IconCircleCheck size={14} />}
                  {group.isActive ? "Set inactive" : "Set active"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
