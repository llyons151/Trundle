import { Text } from 'react-native';
import { useSharedStyles } from '../../components/app-ui';
import type { SetupDraft } from '../../state/onboarding-model';
import { AppChoices } from './components/app-choices';

export function AlwaysScreen({ draft, disabled, onChange }: { draft: SetupDraft; disabled: boolean; onChange: (patch: Partial<SetupDraft>) => void }) {
  const shared = useSharedStyles();
  return <>
    <Text accessibilityLiveRegion="polite" style={shared.caption}>Example apps · {draft.always.length} selected</Text>
    <AppChoices list="always blocked" selected={draft.always} onChange={always => onChange({ always })} disabled={disabled} />
    <Text style={shared.caption}>The morning walk won’t unlock these apps. Edit this list anytime.</Text>
  </>;
}
