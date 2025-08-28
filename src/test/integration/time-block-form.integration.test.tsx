import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderComponent } from '../render';
import { TimeBlockForm } from '../../components/time-blocks/time-block-form';
import { CreateUUID } from '../../domain/types';
import userEvent from '@testing-library/user-event';

const mutateCreate = vi.fn();
const mutateUpdate = vi.fn();

vi.mock('../../data/hooks/useTimeBlocks', () => ({
    useCreateTimeBlock: () => ({ mutate: mutateCreate }),
    useUpdateTimeBlock: () => ({ mutate: mutateUpdate }),
}));

describe('Time block form component', () => {
    beforeEach(() => {
        mutateUpdate.mockReset()
        mutateCreate.mockReset()
    });

    it('renders a form for creating a time block', async () => {
        const { cleanupApp } = renderComponent((
            <TimeBlockForm
                mode="create"
                projectId={CreateUUID()}
                onFormSaved={() => { }}
            />
        ), { route: '/' });

        expect(
            await screen.findByRole('button', { name: /(add entry)/i })
        ).toBeInTheDocument();

        cleanupApp();
    });

    it('submits a valid time block for time', async () => {
        const onFormSaved = vi.fn();

        const { cleanupApp } = renderComponent((
            <TimeBlockForm
                mode="create"
                projectId={CreateUUID()}
                onFormSaved={onFormSaved}
            />
        ), { route: '/' });

        expect(
            await screen.findByRole('button', { name: /(add entry)/i })
        ).toBeInTheDocument();

        const textInput = screen.getByRole('textbox', { name: 'mins' });
        await userEvent.type(textInput, '43');
        expect(textInput).toHaveValue('43');

        await userEvent.click(screen.getByRole('button', { name: /add entry/i }));

        expect(mutateCreate).toHaveBeenCalledTimes(1);
        const data = mutateCreate.mock.calls[0][0];

        expect(data.id).toBeDefined();
        expect(data.type).toBe('seconds');
        expect(data.amount).toBe(2580);

        expect(onFormSaved).toHaveBeenCalledTimes(1);
        
        cleanupApp();
    })

    it('submits a valid block for words', async () => {
        const onFormSaved = vi.fn();

        const { cleanupApp } = renderComponent((
            <TimeBlockForm
                mode="create"
                projectId={CreateUUID()}
                onFormSaved={onFormSaved}
            />
        ), { route: '/' });

        expect(
            await screen.findByRole('button', { name: /(add entry)/i })
        ).toBeInTheDocument();
        
        await userEvent.click(
            screen.getByRole('combobox', { name: /entry type/i })
        );

        const option = await screen.findByRole('option', { name: /words/i });
        expect(option).toBeInTheDocument();
        await userEvent.click(option);


        const textInput = await screen.findByRole('textbox', { name: /amount/i });
        expect(textInput).toBeInTheDocument();
        await userEvent.type(textInput, '1500');
        expect(textInput).toHaveValue('1500');

        await userEvent.click(screen.getByRole('button', { name: /add entry/i }));

        expect(mutateCreate).toHaveBeenCalledTimes(1);
        const data = mutateCreate.mock.calls[0][0];

        expect(data.id).toBeDefined();
        expect(data.type).toBe('words');
        expect(data.amount).toBe(1500);

        expect(onFormSaved).toHaveBeenCalledTimes(1);
        
        cleanupApp();
    });

    it('shows a validation error for invalid entries', async () => {
        const onFormSaved = vi.fn();

        const { cleanupApp } = renderComponent((
            <TimeBlockForm
                mode="create"
                projectId={CreateUUID()}
                onFormSaved={onFormSaved}
            />
        ), { route: '/' });

        expect(
            await screen.findByRole('button', { name: /(add entry)/i })
        ).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /add entry/i }));

        expect(mutateCreate).toHaveBeenCalledTimes(0);
        expect(onFormSaved).toHaveBeenCalledTimes(0);
        expect(await screen.findByText(/an error occurred/i)).toBeInTheDocument();
        
        cleanupApp();
    })
});
