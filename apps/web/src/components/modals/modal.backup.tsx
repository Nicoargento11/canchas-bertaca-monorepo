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
        outline-none focus:outline-none bg-neutral-800/70
        overflow-y-auto
        "
      >
        <div
          className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5
          h-full md:h-auto md:my-auto mx-auto p-0 md:p-6 flex flex-col justify-center
          "
        >
          {/*content*/}
          <div
            className={`translate duration-300
          ${showModal ? "translate-y-0" : "translate-y-full"}
          ${showModal ? "opacity-100" : "opacity-0"}
        `}
          >
            <div
              className="relative flex flex-col translate w-full h-full md:h-auto md:max-h-[85vh]
              border-0 md:rounded-lg shadow-lg
            bg-white outline-none focus:outline-none
            "
            >
              {/*header*/}
              <div
                className="sticky top-0 z-10 flex flex-col items-center justify-center
                p-3 sm:p-4 md:rounded-t border-b-[1px] bg-white
                "
              >
                <div className="flex justify-between items-center w-full">
                  <button
                    className=" transition left-2 top-2
                  border-0 p-1 
                  hover:opacity-70
                  "
                    onClick={handleClose}
                  >
                    <X size={25} />
                  </button>
                  <div className="text-lg font-semibold">{title}</div>
                  <div></div>
                </div>
                <div className="w-full">{header}</div>
              </div>
              {/*body*/}
              <div className="relative py-2 px-3 sm:px-4 overflow-y-auto flex-1">{body}</div>
              <hr />
              {/*footer*/}
              <div className="sticky bottom-0 flex flex-col gap-2 p-3 sm:p-4 md:p-6 bg-white border-t">
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
                      className="w-full"
                    >
                      {secondaryActionLabel}
                    </Button>
                  )}
                  {actionLabel && (
                    <Button
                      disabled={disabled}
                      onClick={handleSubmit}
                      className="w-full bg-Primary/80"
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
