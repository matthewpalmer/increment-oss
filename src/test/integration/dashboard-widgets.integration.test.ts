import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from '../render';
import { resetDb } from '../dbTestUtils';
import { makeGoal, makeGoalVersion, makeProject, makeWidget } from './factories';
import { makeCalendar } from '../../data/calendar-context';
import userEvent from '@testing-library/user-event';

describe('Project dashboard widgets', () => {
    beforeEach(async () => {
        await resetDb();
    });

    afterEach(async () => {
        await resetDb();
    });

    it('loads dashboard with existing widgets', async () => {
        const project = await makeProject({
            name: 'existing widgets testing',
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
        await makeWidget(project.id, goal.id, 'calendar');

        const { cleanupApp } = renderApp({ route: `/app/projects/${project.id}` });

        expect(
            await screen.findByRole('heading', { name: /existing widgets testing/i })
        ).toBeInTheDocument();


        // Calendar
        const calendar = makeCalendar();
        const calendarTitle = calendar.startOfMonth(new Date).toLocaleString('default', { month: 'long', year: 'numeric' })
        expect(await screen.findByText(calendarTitle)).toBeInTheDocument();

        // Progress bar
        expect(await screen.findByText(/0m/i)).toBeInTheDocument();
        expect(await screen.findByText(/1h/i)).toBeInTheDocument();

        cleanupApp();
    });

    it('adds a widget to the dashboard', async () => {
        const project = await makeProject({
            name: 'add widget testing',
            color: '#46a758'
        });

        const goal = await makeGoal(project.id, {
            name: 'testing add widget goal'
        });

        await makeGoalVersion(goal.id, 3600, (new Date('2025-08-25')).getTime(), -1, {
            unit: 'count',
            cadence: 'monthly',
            aggregation: 'sum'
        })

        const { cleanupApp } = renderApp({ route: `/app/projects/${project.id}` });

        expect(
            await screen.findByRole('heading', { name: /add widget testing/i })
        ).toBeInTheDocument();

        const customizeMenu = await screen.findByRole('button', { name: 'Customize' })
        expect(customizeMenu).toBeInTheDocument();
        await userEvent.click(customizeMenu);

        const addWidgetItem = await screen.findByRole('menuitem', { name: /add widget/i });
        expect(addWidgetItem).toBeInTheDocument();
        await userEvent.click(addWidgetItem);

        expect(await screen.findByText(/type/i)).toBeInTheDocument();
        expect(await screen.findByText(/size/i)).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('combobox', { name: /widget type/i })
        );

        const option = await screen.findByRole('option', { name: /progress ring/i });
        expect(option).toBeInTheDocument();
        await userEvent.click(option);

        const saveButton = await screen.findByRole('button', { name: 'Add Widget' });
        expect(saveButton).toBeInTheDocument();
        await userEvent.click(saveButton);

        const ringTitle = await screen.findByText('0%');
        expect(ringTitle).toBeInTheDocument();

        cleanupApp();
    })
});