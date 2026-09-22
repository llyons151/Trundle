import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Row, Surface, useSharedStyles } from './app-ui';
import { DetailSheet } from './detail-sheet';
import { TimePicker } from './time-picker';
import { formatTime, savePreferences, usePreferences } from '../state/preferences';
import { napFits, type Nap } from '../state/routine';
import { useTheme } from '../theme';

export function NapEditor() {
  const ui = useTheme();
  const shared = useSharedStyles();
  const { values, saving, error } = usePreferences();
  const [draft, setDraft] = useState<Nap | null>(null);
  const [field, setField] = useState<'start' | 'end'>('start');
  const existing = values.naps.some(nap => nap.id === draft?.id);
  const valid = draft && napFits(draft, values);
  return <>
    <Surface>
      {values.naps.map(nap => <Row key={nap.id} icon="moon" title={`${formatTime(nap.start)} – ${formatTime(nap.end)}`} detail="Every day · wakes automatically" onPress={() => { setDraft(nap); setField('start'); }} />)}
      <Row icon="moon" title="Schedule a nap" detail="A little rest while you do your thing" last onPress={() => { setDraft({ id: `nap-${Date.now()}`, start: 14 * 60, end: 14 * 60 + 30 }); setField('start'); }} />
    </Surface>
    <DetailSheet visible={draft !== null} title={existing ? 'His daily nap' : 'Make time for a nap'} closeLabel="Cancel nap editing" onClose={() => { if (!saving) setDraft(null); }}>
      {draft && <View style={{ gap: ui.space.md }}>
        <Text style={shared.body}>Put your phone down. Let Trundle rest. Naps repeat daily and end automatically, without a walk.</Text>
        <Surface>
          <Row icon="moon" title={`Falls asleep · ${formatTime(draft.start)}`} detail={field === 'start' ? 'Editing start time below' : 'Tap to edit'} onPress={() => setField('start')} />
          <Row icon="sun" title={`Wakes up · ${formatTime(draft.end)}`} detail={field === 'end' ? 'Editing end time below' : 'Tap to edit'} onPress={() => setField('end')} last />
        </Surface>
        <TimePicker minutes={draft[field]} disabled={saving} onChange={time => setDraft({ ...draft, [field]: time })} />
        {!valid && <Text accessibilityRole="alert" style={shared.caption}>Choose different start and end times, outside bedtime and other naps.</Text>}
        {!!error && <Text accessibilityRole="alert" style={shared.caption}>{error}</Text>}
        <Button title={saving ? 'Saving…' : 'Save nap'} disabled={saving || !valid} onPress={async () => {
          if (await savePreferences({ naps: [...values.naps.filter(nap => nap.id !== draft.id), draft].sort((a, b) => a.start - b.start) })) setDraft(null);
        }} />
        {existing && <Button secondary title="Remove nap" disabled={saving} onPress={async () => { if (await savePreferences({ naps: values.naps.filter(nap => nap.id !== draft.id) })) setDraft(null); }} />}
      </View>}
    </DetailSheet>
  </>;
}
