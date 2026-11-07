import axios from "axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export function notifyError(error: unknown, fallback: string) {
  const isExpiredSession =
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    typeof window !== "undefined" &&
    !["/", "/login", "/register"].includes(window.location.pathname);

  if (!isExpiredSession) toast.error(getErrorMessage(error, fallback));
}

export function notifySuccess(message: string) {
  toast.success(message);
}