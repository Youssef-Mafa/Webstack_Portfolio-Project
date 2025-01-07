import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

const initialState = {
    items: [],
    isLoading: false,
    isError: false,
    message: ''
};

// Get cart
export const getCart = createAsyncThunk(
    'cart/getCart',
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get('/cart');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Add to cart
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (cartItem, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/cart/add', cartItem);
            await thunkAPI.dispatch(getCart()); // Fetch updated cart after adding
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update cart item
export const updateCartItem = createAsyncThunk(
    'cart/updateItem',
    async (cartItem, thunkAPI) => {
        try {
            const response = await axiosInstance.put('/cart/update', cartItem);
            await thunkAPI.dispatch(getCart()); // Fetch updated cart after updating
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
    'cart/removeItem',
    async ({ product_id, variant_id }, thunkAPI) => {
        try {
            const response = await axiosInstance.delete(`/cart/remove/${product_id}/${variant_id}`);
            await thunkAPI.dispatch(getCart()); // Fetch updated cart after removing
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Clear cart
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.delete('/cart/clear');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get cart cases
            .addCase(getCart.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(getCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items || [];
                state.isError = false;
            })
            .addCase(getCart.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Add to cart cases
            .addCase(addToCart.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(addToCart.fulfilled, (state) => {
                state.isLoading = false;
                state.isError = false;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Update cart item cases
            .addCase(updateCartItem.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(updateCartItem.fulfilled, (state) => {
                state.isLoading = false;
                state.isError = false;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Remove from cart cases
            .addCase(removeFromCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(removeFromCart.fulfilled, (state) => {
                state.isLoading = false;
            })
            // Clear cart cases
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
                state.isLoading = false;
            });
    }
});

export default cartSlice.reducer;