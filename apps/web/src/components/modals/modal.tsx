"use client";
import { Button } from "../ui/button";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (values?: unknown) => void;
  title?: string;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  header?: React.ReactElement;
  actionLabel?: string | undefined;
  disabled?: boolean;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  actionLabel,
  disabled,
  onSubmit,
  body,
  footer,
  header,
  secondaryAction,
  secondaryActionLabel,
  title,
}) => {
  const [showModal, setShowModal] = useState(isOpen);
  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }
    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) {
      return;
    }
    onSubmit!();
  }, [disabled, onSubmit]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) {
      return;
    }

    secondaryAction();
  }, [disabled, secondaryAction]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="justify-center items-center flex 
         fixed 
        inset-0 z-50 
        outline-none focus:outline-none bg-black/80 backdrop-blur-sm
        "
      >
        <div
          className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5
          my-6 mx-auto  flex flex-col justify-center p-4 sm:p-0
          "
        >
          {/*content*/}
          <div
            className={`translate duration-300 h-full
          ${showModal ? "translate-y-0" : "translate-y-full"}
          ${showModal ? "opacity-100" : "opacity-0"}
        `}
          >
            <div
              className="relative flex flex-col translate w-full max-h-screen min-h-screen sm:min-h-0 sm:h-auto overflow-y-auto
              border border-white/10 rounded-3xl shadow-2xl
            bg-slate-950 outline-none focus:outline-none
            "
            >
              {/*header*/}
              <div
                className="relative flex flex-col items-center justify-center
                p-6 rounded-t border-b border-white/10
                "
              >
                <div className="flex justify-between items-center w-full">
                  <div className="text-xl font-bold text-white">{title}</div>
                  <button
                    className="
                    p-1
                    border-0 
                    hover:bg-white/10
                    rounded-full
                    transition
                    text-white/70
                    hover:text-white
                  "
                    onClick={handleClose}
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="w-full">{header}</div>
              </div>
              {/*body*/}
              <div className="relative p-6 flex-auto text-white">{body}</div>

              {/*footer*/}
              <div className="flex flex-col gap-2 p-6 border-t border-white/10 bg-white/5">
                <div
                  className="flex items-center w-full
                  gap-4 
                  "
                >
                  {secondaryAction && secondaryActionLabel && (
                    <Button
                      variant={"outline"}
                      disabled={disabled}
                      onClick={handleSecondaryAction}
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      {secondaryActionLabel}
                    </Button>
                  )}
                  {actionLabel && (
                    <Button
                      disabled={disabled}
                      onClick={handleSubmit}
                      className="w-full bg-Primary hover:bg-Primary-dark text-white"
                    >
                      {actionLabel}
                    </Button>
                  )}
                </div>
                {footer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
