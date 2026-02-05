'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js';
import { cognitoConfig } from '@/lib/cognito-config';
import Cookies from 'js-cookie';

const userPool = new CognitoUserPool({
    UserPoolId: cognitoConfig.UserPoolId,
    ClientId: cognitoConfig.ClientId,
});

// Cookie constants for secure token storage
const REFRESH_TOKEN_COOKIE = 'cognito_refresh_token';
const COOKIE_EXPIRY_DAYS = 30;

// Helper to get the refresh token localStorage key
const getRefreshTokenKey = (username: string) => {
    return `CognitoIdentityServiceProvider.${cognitoConfig.ClientId}.${username}.refreshToken`;
};

interface AuthContextType {
    user: CognitoUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<CognitoUserSession>;
    signUp: (email: string, password: string) => Promise<unknown>;
    confirmSignUp: (email: string, code: string) => Promise<unknown>;
    signOut: () => void;
    checkAuth: () => Promise<void>;
    forgotPassword: (email: string) => Promise<unknown>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<unknown>;
    getSession: () => Promise<CognitoUserSession | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<CognitoUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // Check if we have a refresh token in cookie but not in localStorage
        const refreshTokenCookie = Cookies.get(REFRESH_TOKEN_COOKIE);
        const currentUser = userPool.getCurrentUser();

        if (currentUser && refreshTokenCookie) {
            // Temporarily restore refresh token to localStorage for Cognito SDK
            const username = currentUser.getUsername();
            const refreshTokenKey = getRefreshTokenKey(username);
            const existingRefreshToken = localStorage.getItem(refreshTokenKey);

            if (!existingRefreshToken) {
                localStorage.setItem(refreshTokenKey, refreshTokenCookie);
                console.log('🔐 Restored refresh token from cookie to localStorage for session');
            }
        }

        const finishLoading = (userObj: CognitoUser | null, authenticated: boolean) => {
            if (isMounted) {
                setUser(userObj);
                setIsAuthenticated(authenticated);
                setIsLoading(false);
            }
        };

        if (currentUser) {
            currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
                if (err || !session || !session.isValid()) {
                    finishLoading(null, false);
                } else {
                    // Remove refresh token from localStorage again after session is established
                    const username = currentUser.getUsername();
                    const refreshTokenKey = getRefreshTokenKey(username);
                    localStorage.removeItem(refreshTokenKey);
                    console.log('🔐 Session restored, refresh token removed from localStorage');

                    finishLoading(currentUser, true);
                }
            });
        } else {
            finishLoading(null, false);
        }

        return () => { isMounted = false; };
    }, []);

    const checkAuth = async () => {
        // Exposed for manual refreshes if needed, but not called in body
    };

    const signIn = async (email: string, password: string): Promise<CognitoUserSession> => {
        return new Promise((resolve, reject) => {
            const authenticationDetails = new AuthenticationDetails({
                Username: email,
                Password: password,
            });

            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (session) => {
                    // Store refresh token in cookie for security
                    const refreshToken = session.getRefreshToken().getToken();
                    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
                        expires: COOKIE_EXPIRY_DAYS,
                        sameSite: 'strict',
                        secure: process.env.NODE_ENV === 'production'
                    });

                    // Remove refresh token from localStorage (Cognito SDK stores it there by default)
                    const username = cognitoUser.getUsername();
                    const refreshTokenKey = getRefreshTokenKey(username);
                    localStorage.removeItem(refreshTokenKey);

                    console.log('🔐 Refresh token moved to cookie (removed from localStorage)');

                    setUser(cognitoUser);
                    setIsAuthenticated(true);
                    resolve(session);
                },
                onFailure: (err) => {
                    reject(err);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    // Handle new password required logic if necessary
                    // For now, we'll reject or handle it as a specific case
                    reject(new Error("New Password Required - Not fully implemented in this demo"));
                },
            });
        });
    };

    const signUp = async (email: string, password: string): Promise<unknown> => {
        return new Promise((resolve, reject) => {
            const attributeList = [
                new CognitoUserAttribute({
                    Name: 'email',
                    Value: email,
                }),
            ];

            userPool.signUp(email, password, attributeList, [], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    };

    const confirmSignUp = async (email: string, code: string): Promise<unknown> => {
        return new Promise((resolve, reject) => {
            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            });

            cognitoUser.confirmRegistration(code, true, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    };

    const signOut = () => {
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
            currentUser.signOut();
        }

        // Clear refresh token cookie
        Cookies.remove(REFRESH_TOKEN_COOKIE);
        console.log('🔐 Refresh token cleared from cookie');

        setUser(null);
        setIsAuthenticated(false);
    };

    const forgotPassword = async (email: string): Promise<unknown> => {
        return new Promise((resolve, reject) => {
            console.log('🔐 Initiating forgot password for:', email);

            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            });

            // Set a timeout to prevent indefinite hanging
            const timeoutId = setTimeout(() => {
                reject(new Error('Request timed out. Please check your internet connection and try again.'));
            }, 30000); // 30 second timeout

            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    clearTimeout(timeoutId);
                    console.log('✅ Forgot password success:', data);
                    resolve(data);
                },
                onFailure: (err) => {
                    clearTimeout(timeoutId);
                    console.error('❌ Forgot password error:', err);
                    reject(err);
                },
                inputVerificationCode: (data) => {
                    clearTimeout(timeoutId);
                    console.log('📧 Verification code sent:', data);
                    resolve(data);
                }
            });
        });
    };

    const resetPassword = async (email: string, code: string, newPassword: string): Promise<unknown> => {
        return new Promise((resolve, reject) => {
            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            });

            cognitoUser.confirmPassword(code, newPassword, {
                onSuccess: () => resolve(true),
                onFailure: (err) => reject(err),
            });
        });
    };

    const getSession = async (): Promise<CognitoUserSession | null> => {
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) return null;

        return new Promise((resolve) => {
            currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
                if (err || !session || !session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session);
                }
            });
        });
    };

    const value = useMemo(() => ({
        user,
        isAuthenticated,
        isLoading,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        checkAuth,
        forgotPassword,
        resetPassword,
        getSession
    }), [user, isAuthenticated, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
