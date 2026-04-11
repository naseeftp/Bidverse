import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import auctionHouseService from "../../services/auctionHouse.service";
import type { AuctionHouseSubmissionDTO, AuctionHouseResponseDTO,TVerificationStatus } from "../../types/auctionHouse.type";

interface AuctionHouseState {
    profile: AuctionHouseResponseDTO | null;
    status: TVerificationStatus | null;
    loading: boolean;
    error: string | null
}
const initialState: AuctionHouseState = {
    profile: null,
    status: null,
    loading: false,
    error: null
}
export const fetchAuctionProfile = createAsyncThunk(
    "auctionHouse/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const result = await auctionHouseService.getProfile()
            if (!result.success) {
                return rejectWithValue(result.message)
            }
            return result
        } catch (error: any) {
            return rejectWithValue('Unexpected error happend')
        }
    }
)

export const submitVerification = createAsyncThunk(
    'auctionHouse/submitVerification',
    async (formData: AuctionHouseSubmissionDTO, { rejectWithValue }) => {
        try {
            const result = await auctionHouseService.submitVerification(formData)
            if (!result.success) {
                return rejectWithValue(result.message)
            }
            return result
        } catch (error) {
            return rejectWithValue('Failed to submit verification');
        }
    }
)

const auctionHouseSlice = createSlice({
    name: 'auctionHouse',
    initialState,
    reducers: {
        clearAuctionHouseError: (state) => {
            state.error = null;
        },
        resetAuctionHouseState: (state) => {
            return initialState
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAuctionProfile.pending, (state) => {
            state.loading = true;
            state.error = null
        });
        builder.addCase(fetchAuctionProfile.fulfilled, (state, action: PayloadAction<AuctionHouseResponseDTO>) => {
            state.loading = false;
            if (action.payload.id) {
                state.profile = action.payload;
                state.status = action.payload.status
            }
            else {
                state.profile = null;
                state.status = null
            }
        });
        builder.addCase(fetchAuctionProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string
        })
        builder.addCase(submitVerification.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(submitVerification.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.profile = action.payload;
            state.status = action.payload.status;
        });
        builder.addCase(submitVerification.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
})

export const {clearAuctionHouseError,resetAuctionHouseState}=auctionHouseSlice.actions;
export default auctionHouseSlice.reducer;