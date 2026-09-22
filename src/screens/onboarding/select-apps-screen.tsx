import { Text, View } from 'react-native';
import { useSharedStyles } from '../../components/app-ui';
import { type SetupDraft } from '../../state/onboarding-model';
import { AppChoices } from './components/app-choices';
import { useTheme } from '../../theme';

export function SelectAppsScreen({ draft, onChange, disabled }: { draft: SetupDraft; onChange: (patch: Partial<SetupDraft>) => void; disabled: boolean }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  return <>
    <View style={{ gap: ui.space.xs }}><Text style={shared.caption}>Example apps · nothing is blocked</Text><Text accessibilityLiveRegion="polite" style={shared.rowTitle}>{draft.scheduled.length} selected{draft.scheduled.length ? '' : ' · choose later if you like'}</Text></View>
    <AppChoices list="bedtime" selected={draft.scheduled} always={draft.always} onChange={scheduled => onChange({ scheduled })} disabled={disabled} />
  </>;
}
