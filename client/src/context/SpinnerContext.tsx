import React, { createContext, ReactNode, useContext, useState } from 'react';

export type SpinnerProviderProps = {
    children: ReactNode;
};

// Define the shape of the context value
interface SpinnerContextValue {
    spinnerState: boolean;
    setSpinnerState: React.Dispatch<React.SetStateAction<boolean>>;
    taskCompleted: boolean;
    setTaskCompleted: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context
export const SpinnerContext = createContext<SpinnerContextValue | undefined>(undefined);

export const SpinnerProvider = ({ children }: SpinnerProviderProps) => {
    const [spinnerState, setSpinnerState] = useState<boolean>(false);
    const [taskCompleted, setTaskCompleted] = useState<boolean>(false)

    const contextValue: SpinnerContextValue = {
        spinnerState,
        setSpinnerState,
        taskCompleted,
        setTaskCompleted
    };

    return (
        <SpinnerContext.Provider value={contextValue}>
            {children}
        </SpinnerContext.Provider>
    );
};

export const useSpinner = () => {
    const spinnerConsumer = useContext(SpinnerContext);

    if (!spinnerConsumer) {
        throw new Error('useSpinner must be used within a SpinnerProvider');
    }

    return spinnerConsumer;
};
