import React, { useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { SeedRefClass } from 'utils/native';

export type SeedRefsContext = [
	Map<string, SeedRefClass>,
	(seedRefs: Map<string, SeedRefClass>) => Map<string, SeedRefClass>
];

export const SeedRefsContext = React.createContext(
	([] as unknown) as SeedRefsContext
);
export const SeedRefsProvider = SeedRefsContext.Provider;

export function SeedRefStore(props: any): React.ReactElement {
	const [seedRefs, setSeedRefs] = useState(new Map());

	const [appState, setAppState] = React.useState<AppStateStatus>(
		AppState.currentState
	);

	React.useEffect(() => {
		const _handleAppStateChange = async (
			nextAppState: AppStateStatus
		): Promise<void> => {
			if (nextAppState.match(/inactive|background/) && appState === 'active') {
				const promises: Promise<SeedRefClass>[] = Array.from(
					seedRefs.entries()
				).map(([, seedRef]) => {
					if (seedRef.isValid()) {
						return seedRef.tryDestroy();
					}
					return Promise.resolve();
				});
				await Promise.all(promises);
				setSeedRefs(new Map());
			}
			setAppState(nextAppState);
		};
		AppState.addEventListener('change', _handleAppStateChange);

		return (): void => {
			AppState.removeEventListener('change', _handleAppStateChange);
		};
	}, [appState, seedRefs]);

	return <SeedRefsProvider value={[seedRefs, setSeedRefs]} {...props} />;
}
