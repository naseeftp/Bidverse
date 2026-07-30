import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from '../hooks/redux.hooks';
import { setUnreadConversationCount } from "../redux/user/auth.slice";
import chatService from "../services/chat.service";

export const useUnreadCount = () => {
     const dispatch = useAppDispatch();
    const { isAuthenticated, consversationUnreadCount } = useAppSelector((state) => state.auth);

    const refreshCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await chatService.getUnreadCountForUser();
            if (response.success && typeof response.data === "number") {
                dispatch(setUnreadConversationCount(response.data));
            }
        } catch {

        }
    }, [isAuthenticated, dispatch]);

    useEffect(() => {
        refreshCount();
    }, [refreshCount]);

    return { unreadCount: consversationUnreadCount, refreshCount };
};