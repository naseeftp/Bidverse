import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux.hooks';
import { setAuthSuccess } from '../../redux/user/auth.slice';

const AuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // 1. Save the token to local storage
            localStorage.setItem("accessToken", token);

            // 2. Decode the token to get user info (name, email, etc.)
            const decoded = JSON.parse(atob(token.split('.')[1]));

            // 3. Update your Redux State (so the UI knows you are logged in)
            dispatch(setAuthSuccess(decoded));

            // 4. THE FINAL STEP: Go to Home!
            navigate('/home'); 
        } else {
            navigate('/login');
        }
    }, [searchParams, dispatch, navigate]);

    // The user sees this for only a split second
    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-black">
            <p className="uppercase tracking-widest text-[10px] font-bold animate-pulse">
                Entering BidVerse...
            </p>
        </div>
    );
};

export default AuthSuccessPage;