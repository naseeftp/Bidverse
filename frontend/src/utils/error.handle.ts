import { isAxiosError } from "axios";

export const apiErrorHandler = (error: unknown, defaultMessage: string) => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      return {
        success: false,
        message: responseData.errors[0].message,
      };
    }
    return {
      success: false,
      message: responseData?.message || defaultMessage,
    };
  }
  return {
    success: false,
    message: error instanceof Error ? error.message : defaultMessage,
  };
};