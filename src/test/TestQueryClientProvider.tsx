import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function CreateTestQueryClient() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { 
                retry: false, 
                gcTime: Infinity
            },
            mutations: {
                retry: false
            }
        }
    });

    return queryClient
}

export function TestQueryClientProvider(queryClient: QueryClient = CreateTestQueryClient()) {
    return function(props: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {props.children}
            </QueryClientProvider>
        ); 
    }
}
