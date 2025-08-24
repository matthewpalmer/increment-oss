import { useState } from "react"
import { fakeSyncEngine } from "../../data/sync/fake-sync-engine"
import type { SyncEnginePatch } from "../../data/sync/sync-engine";
import type { Table } from "../../domain/types";

function SyncResultBuilderForm(props: { onSaveResult: (action: string, table: string, data: string, throwError: boolean) => void}) {
    const [action, setAction] = useState('upsert');
    const [table, setTable] = useState('projects');
    const [data, setData] = useState('');
    const [throwError, setThrowError] = useState(false);

    const actions = [
        'upsert',
        'delete'
    ];

    const allTables: Table[] = [
        'projects',
        'goals',
        'timeBlocks',
        'goalVersions',
    ];

    return (
        <div className="flex flex-col">
            Action:
            <select className="bg-white p-1 border-1" onChange={(e) => {
                setAction(e.target.value)
            }}>
                { actions.map(t => <option key={t} value={t}>{ t }</option>)}
            </select>

            Table:
            <select className="bg-white p-1 border-1" onChange={(e) => {
                setTable(e.target.value)
            }}>
                { allTables.map(t => <option key={t} value={t}>{ t }</option>)}
            </select>

            Data:
            <input type="text" className="bg-white border-1 p-1" value={data} onChange={(e) => {
                setData(e.target.value)
            }} />

            <label className="mt-2">
                Throw as error:
                <input className="ml-4" type="checkbox" checked={throwError} onChange={(e) => setThrowError(e.target.checked)} />
            </label>

            <button className="bg-blue-200 text-blue-800 p-2 rounded-sm text-sm hover:bg-blue-300 hover:cursor-pointer m-2" onClick={() => {
                props.onSaveResult(action, table, data, throwError);
            }}>
                Stage Result
            </button>
        </div>
    )
}

export function FakeSyncEngineControlPanel() {
    // A bit of a hack to force the control panel to re-render.
    // Note that this panel doesn't re-render on state changes caused by 
    // the sync engine / sync job, so you have to click Refresh
    // in that case.
    const [tick, setTick] = useState(0);
    const [startedTrap, setStartedTrap] = useState(false);

    const createSyncEngineHandlerResult = (type: string, table: string, data: any[]) => {
        if (type === 'delete') {
            return {
                patches: [
                    { type: type, table: table, ids: data } as SyncEnginePatch
                ],
                followUps: []
            }
        }

        debugger;
        alert('Not implemented!');
        throw new Error('Not implemented!');
    };

    const hasStartedTrap = () => {
        return !!fakeSyncEngine.trapNextEvent && startedTrap
    };

    const hasWaitingPromises = () => {
        return !!fakeSyncEngine.pendingTrapPromise
    };

    const hasAddedTrapDataOrError = () => {
        return (fakeSyncEngine.trapData || fakeSyncEngine.throwErrorNext)
    };

    const isReadyToResolve = () => {
        return hasAddedTrapDataOrError() && hasWaitingPromises()
    };

    const showAddResultForm = () => {
        return hasStartedTrap() && hasWaitingPromises() && !isReadyToResolve()
    };

    return (
        <div className="border-solid border-4 border-pink-400 bg-pink-50 rounded-2xl py-8 px-4 m-4 fixed bottom-0 right-0">
            <h1 className="font-bold text-lg text-pink-950">Fake Sync Engine Control Panel</h1>

            {
                !hasStartedTrap() && !showAddResultForm()
                ? (
                    <button 
                        className="bg-pink-700 text-white font-semibold rounded-sm px-4 py-2 my-2 text-sm hover:cursor-pointer hover:bg-pink-800" onClick={() => {
                        fakeSyncEngine.addTrap({ type: 'test trap ' + new Date })
                        setStartedTrap(true);
                        setTick(tick + 1);
                    }}>
                        Start Trap
                    </button>
                )
                : (
                    showAddResultForm()
                    ? null
                    : <p>Click Refresh after triggering events…</p>
                )
            }
            

            {
                showAddResultForm() 
                ? <SyncResultBuilderForm onSaveResult={(action, table, data, throwError) => {
                    if (throwError) {
                        fakeSyncEngine.setThrowError(new Error('Throwing...'))
                    } else {
                        const result = createSyncEngineHandlerResult(action, table, [data]);
                        fakeSyncEngine.setResultForTrap(result);
                    }
                    
                    setTick(tick + 1);
                }} />
                : null
            }

            { 
                isReadyToResolve()
                ? (
                    <button className="bg-pink-700 text-white font-semibold rounded-sm px-4 py-2 my-2 text-sm hover:cursor-pointer hover:bg-pink-800" onClick={() => {
                        fakeSyncEngine.resolveTrap()
                        setTick(tick + 1);
                    }}>Resolve Trap</button>
                )
                : null
            }

            <button className="text-xs text-pink-500 p-2 rounded-lg m-2 bg-pink-100 hover:cursor-pointer hover:bg-pink-200" onClick={() => setTick(tick + 1)}>Refresh Panel</button>
            <br/>
            <button 
                className={`text-xs ${fakeSyncEngine.isOffline ? 'bg-pink-800 text-pink-200 hover:bg-pink-700' : 'text-pink-500 bg-pink-100 hover:bg-pink-200'}  p-2 rounded-lg m-2 hover:cursor-pointer`} 
                onClick={() => {
                    fakeSyncEngine.isOffline = !fakeSyncEngine.isOffline
                    setTick(tick + 1)
                }}>
                    { fakeSyncEngine.isOffline ? 'Simulating Offline…' : 'Simulate Offline' }
            </button>
        </div>
    )
}