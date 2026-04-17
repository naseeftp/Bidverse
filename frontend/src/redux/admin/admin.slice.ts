import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "../../services/admin.service";
import type { AuctionHouseResponseDTO } from "../../types/auctionHouse.type";

// 1. Define the specific interface for the API payload
interface FetchHousesResponse {
    houses: AuctionHouseResponseDTO[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
}

interface AdminState {
    houses: AuctionHouseResponseDTO[]; // Fixed 'any' error
    loading: boolean;
    error: string | null;
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
}

const initialState: AdminState = {
    houses: [],
    loading: false,
    error: null,
    pagination: { totalItems: 0, totalPages: 0, currentPage: 1 }
};

export const fetchAllAuctionHouses = createAsyncThunk(
    'admin/fetchAllAuctionHouses',
    async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
        const result = await adminService.listAllAuctionHouses(page, limit);
        if (!result.success) return rejectWithValue(result.message);
        return result as unknown as FetchHousesResponse;
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllAuctionHouses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllAuctionHouses.fulfilled, (state, action) => {
                state.loading = false;
                state.houses = action.payload.houses;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAllAuctionHouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default adminSlice.reducer;