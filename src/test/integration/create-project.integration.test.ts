import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from '../render';
import { userEvent }from '@testing-library/user-event';

describe('Create project', () => {
    it('renders /app with the project list and creates a project', async () => {
        const user = userEvent.setup();
        const { cleanupApp } = renderApp({ route: '/app' });

        expect(
            await screen.findByRole('heading', { name: /my projects/i })
        ).toBeInTheDocument();

        expect(
            await screen.findByRole('button', { name: /new project/i })
        ).toBeInTheDocument();


        await user.click(screen.getByRole('button', { name: /new project/i}))

        expect(await screen.getByLabelText(/project name/i)).toBeInTheDocument();
        expect(await screen.getByRole('button', { name: /color blue/i}));

        const textInput = screen.getByRole('textbox', { name: 'Project Name' });
        await userEvent.type(textInput, 'My test project');
        expect(textInput).toHaveValue('My test project');

        const tomato = screen.getByRole('button', { name: /color tomato/i });
        expect(tomato).toBeInTheDocument();
        await userEvent.click(tomato);

        const submit = screen.getByRole('button', { name: 'Create Project' })
        await userEvent.click(submit);

        await screen.findByRole('link', { name: /my test project/i })

        cleanupApp();
    });
});