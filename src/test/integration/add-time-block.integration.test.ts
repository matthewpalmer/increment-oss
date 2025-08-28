import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from '../render';
import { resetDb } from '../dbTestUtils';
import { makeGoal, makeGoalVersion, makeProject, makeWidget } from './factories';
import userEvent from '@testing-library/user-event';

async function addTime(hours: string, minutes: string) {
    const addEntry = await screen.findByRole('button', { name: 'Add Entry' })
    expect(addEntry).toBeInTheDocument();
    await userEvent.click(addEntry);

    expect(await screen.findByText(/type/i)).toBeInTheDocument();
    expect(await screen.findByText(/duration/i)).toBeInTheDocument();
    expect(await screen.findByText(/date/i)).toBeInTheDocument();

    if (hours) {
        const textInput = screen.getByRole('textbox', { name: 'hours' });
        await userEvent.type(textInput, hours);
        expect(textInput).toHaveValue(hours);
    }

    if (minutes) {
        const textInput = screen.getByRole('textbox', { name: 'mins' });
        await userEvent.type(textInput, minutes);
        expect(textInput).toHaveValue(minutes);
    }
    

    const form = screen.getByRole('form', { name: /Add time block form/i });
    const submit = within(form).getByRole('button', { name: /add entry/i });
    await userEvent.click(submit);
}

describe('Project dashboard widgets', () => {
    beforeEach(async () => {
        await resetDb();
    });

    afterEach(async () => {
        await resetDb();
    });

    it('adds time blocks to the project', async () => {
        const project = await makeProject({
            name: 'add time blocks testing',
            color: '#46a758'
        });

        const goal = await makeGoal(project.id, {
            name: 'testing goal'
        });

        await makeGoalVersion(goal.id, 3600, (new Date('2025-08-25')).getTime(), -1, {
            unit: 'seconds',
            cadence: 'daily',
            aggregation: 'sum'
        })

        await makeWidget(project.id, goal.id, 'progress-bar');

        const { cleanupApp } = renderApp({ route: `/app/projects/${project.id}` });

        expect(
            await screen.findByRole('heading', { name: /add time blocks testing/i })
        ).toBeInTheDocument();

        expect(await screen.findByText(/0m/i)).toBeInTheDocument();
        expect(await screen.findByText(/1h/i)).toBeInTheDocument();

        await addTime('', '21');

        expect(await screen.findByText(/21m/i)).toBeInTheDocument();
        expect(await screen.findByText(/1h/i)).toBeInTheDocument();

        await addTime('1', '13');
        expect(await screen.findByText(/1h 34m/i)).toBeInTheDocument();

        cleanupApp();
    });
});