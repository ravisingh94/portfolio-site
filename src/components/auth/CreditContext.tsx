'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface CreditContextType {
    tokensUsed: number;
    maxTokens: number;
    creditsAvailable: number;
    maxTestCasesAllowed: number;
    isLoading: boolean;
    refreshCredits: () => Promise<void>;
    updateCredits: (tokens: number) => Promise<void>;
    isExhausted: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, getSession } = useAuth();
    const [tokensUsed, setTokensUsed] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const maxTokens = 15000;

    const fetchCredits = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const session = await getSession();
            if (!session) return;

            const token = session.getIdToken().getJwtToken();
            const response = await fetch('https://93k7p109v9.execute-api.ap-south-1.amazonaws.com/dev/data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTokensUsed(data.tokens_used || 0);
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, getSession]);

    const updateCredits = async (tokens: number) => {
        if (!isAuthenticated) return;

        try {
            const session = await getSession();
            if (!session) return;

            const token = session.getIdToken().getJwtToken();
            const response = await fetch('https://93k7p109v9.execute-api.ap-south-1.amazonaws.com/dev/data', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tokens })
            });

            if (response.ok) {
                const data = await response.json();
                setTokensUsed(data.tokens_used || 0);
            }
        } catch (error) {
            console.error('Failed to update credits:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCredits();
        } else {
            setTokensUsed(0);
        }
    }, [isAuthenticated, fetchCredits]);

    const isExhausted = tokensUsed >= maxTokens;
    const tokensPerCredit = 150;
    const creditsAvailable = Math.max(0, Math.floor((maxTokens - tokensUsed) / tokensPerCredit));
    const maxTestCasesAllowed = Math.floor(creditsAvailable / 8);

    return (
        <CreditContext.Provider value={{
            tokensUsed,
            maxTokens,
            creditsAvailable,
            maxTestCasesAllowed,
            isLoading,
            refreshCredits: fetchCredits,
            updateCredits,
            isExhausted
        }}>
            {children}
        </CreditContext.Provider>
    );
};

export const useCredits = () => {
    const context = useContext(CreditContext);
    if (context === undefined) {
        throw new Error('useCredits must be used within a CreditProvider');
    }
    return context;
};
