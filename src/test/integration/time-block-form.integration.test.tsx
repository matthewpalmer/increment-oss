import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderComponent } from '../render';
import { TimeBlockForm } from '../../components/time-blocks/time-block-form';
import { CreateUUID } from '../../domain/types';

describe('Time block form component', () => {
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
});
