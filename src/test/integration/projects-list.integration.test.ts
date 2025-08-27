import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from '../render';

describe('App route', () => {
    it('renders /app with the My Projects page', async () => {
        const { cleanupApp } = renderApp({ route: '/app' });

        expect(
            await screen.findByRole('heading', { name: /my projects/i })
        ).toBeInTheDocument();

        expect(
            await screen.findByRole('button', { name: /new project/i })
        ).toBeInTheDocument();


        cleanupApp();
    });
});