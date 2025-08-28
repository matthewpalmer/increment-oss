import { describe, it, expect } from 'vitest';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { renderApp } from '../render';
import { userEvent } from '@testing-library/user-event';

describe('Create and view project', () => {
    it('renders /app with the project list, creates a project, opens project dashboard', async () => {
        const user = userEvent.setup();
        const { cleanupApp } = renderApp({ route: '/app' });

        expect(
            await screen.findByRole('heading', { name: /my projects/i })
        ).toBeInTheDocument();

        expect(
            await screen.findByRole('button', { name: /new project/i })
        ).toBeInTheDocument();


        await user.click(screen.getByRole('button', { name: /new project/i }))

        expect(await screen.getByLabelText(/project name/i)).toBeInTheDocument();
        expect(await screen.getByRole('button', { name: /color blue/i }));

        const textInput = screen.getByRole('textbox', { name: 'Project Name' });
        await userEvent.type(textInput, 'My test project');
        expect(textInput).toHaveValue('My test project');

        const tomato = screen.getByRole('button', { name: /color tomato/i });
        expect(tomato).toBeInTheDocument();
        await userEvent.click(tomato);

        const submit = screen.getByRole('button', { name: /create project/i });
        await userEvent.click(submit);

        const projectLink = await screen.findByRole('link', { name: /my test project/i })
        expect(projectLink).toBeInTheDocument();

        await userEvent.click(projectLink);

        expect(await screen.findByRole('heading', { name: /my goals/i })).toBeInTheDocument();
        expect(await screen.getByRole('heading', { name: /my test project/i })).toBeInTheDocument();
        expect(await screen.findByText(/lifetime total/i)).toBeInTheDocument();
        expect(await screen.getByText(/0m/i)).toBeInTheDocument();

        expect(await screen.getByRole('button', { name: /customize/i })).toBeInTheDocument();
        expect(await screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument();
        expect(await screen.getByRole('button', { name: /add goal/i })).toBeInTheDocument();

        cleanupApp();
    });
});