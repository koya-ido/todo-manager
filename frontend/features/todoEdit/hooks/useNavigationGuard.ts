import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useNavigationGuard = (
  isDirty: boolean,
  onConfirm?: () => void,
) => {
  const router = useRouter();
  const [showDiscardDialog, setShowDiscardDialog] = useState<boolean>(false);
  const [pendingUrl, setPendingUrl] = useState<string>("");

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      (e as unknown as { returnValue: string }).returnValue = "";
      return "";
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (
          href &&
          (href.startsWith("/") ||
            (!href.includes("://") &&
              !href.startsWith("mailto:") &&
              !href.startsWith("tel:")))
        ) {
          e.preventDefault();
          e.stopPropagation();
          setPendingUrl(href);
          setShowDiscardDialog(true);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isDirty]);

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    if (onConfirm) {
      onConfirm();
    }
    router.push(pendingUrl);
  };

  const handleCancelDiscard = () => {
    setShowDiscardDialog(false);
    setPendingUrl("");
  };

  return {
    showDiscardDialog,
    setShowDiscardDialog,
    handleConfirmDiscard,
    handleCancelDiscard,
  };
};
