
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Spinner } from '../components/Spinner';

export const LoginPage: React.FC = () => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, user, isLoading: isAuthLoading } = useContext(AuthContext);

    // Redirect if user is already logged in or after successful login/registration
    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Apply special body class for styling the auth page
    useEffect(() => {
        document.body.classList.add('auth-page-wrapper');
        return () => {
            document.body.classList.remove('auth-page-wrapper');
        }
    }, []);

    // Synchronize the component's view (sign-in vs sign-up) with the current URL
    useEffect(() => {
        setIsSignUpActive(location.pathname === '/register');
    }, [location.pathname]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            if (login) {
                await login({ email, password });
                // Redirect is handled by the useEffect watching `user` state
            } else {
                throw new Error("Login function not available.");
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            if (register) {
                await register({ name, email, password });
                // Redirect is handled by the useEffect watching `user` state
            } else {
                throw new Error("Register function not available.");
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Simplified toggle function now only handles navigation. The component state
    // will reactively update based on the URL change via the useEffect hook.
    const togglePanel = (isSignUp: boolean) => {
        setError(null);
        const path = isSignUp ? '/register' : '/login';
        navigate(path, { replace: true });
    };

    // Show a loading screen while checking for an existing session or if a user is found (which triggers a redirect).
    if (isAuthLoading || user) {
      return (
        <div className="auth-page-wrapper">
            <Spinner size="lg" />
        </div>
      );
    }

    return (
        <div className={`auth-container ${isSignUpActive ? 'right-panel-active' : ''}`} id="container">
            <div className="form-container sign-up-container">
                <form onSubmit={handleRegister}>
                    <h1>Create Account</h1>
                    <div className="social-container">
                        <a href="#" className="social" aria-label="Sign up with Google"><i className="fab fa-google-plus-g"></i></a>
                        <a href="#" className="social" aria-label="Sign up with Facebook"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="social" aria-label="Sign up with Github"><i className="fab fa-github"></i></a>
                        <a href="#" className="social" aria-label="Sign up with LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                    <span>or use your email for registration</span>
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {isSignUpActive && error && <p className="text-sm text-red-600 my-2">{error}</p>}
                    <button type="submit" disabled={isSubmitting} className="mt-2">
                        {isSubmitting && isSignUpActive ? <Spinner size="sm"/> : 'Sign Up'}
                    </button>
                </form>
            </div>
            <div className="form-container sign-in-container">
                <form onSubmit={handleLogin}>
                    <h1>Sign In</h1>
                    <div className="social-container">
                        <a href="#" className="social" aria-label="Sign in with Google"><i className="fab fa-google-plus-g"></i></a>
                        <a href="#" className="social" aria-label="Sign in with Facebook"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="social" aria-label="Sign in with Github"><i className="fab fa-github"></i></a>
                        <a href="#" className="social" aria-label="Sign in with LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                    <span>or use your account</span>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {!isSignUpActive && error && <p className="text-sm text-red-600 my-2">{error}</p>}
                    <a href="#">Forgot your password?</a>
                    <button type="submit" disabled={isSubmitting}>
                         {isSubmitting && !isSignUpActive ? <Spinner size="sm"/> : 'Sign In'}
                    </button>
                </form>
            </div>
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <button className="ghost" onClick={() => togglePanel(false)}>Sign In</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Hello, Friend!</h1>
                        <p>Enter your personal details and start your journey with us</p>
                        <button className="ghost" onClick={() => togglePanel(true)}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
