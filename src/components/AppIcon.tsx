import { View } from 'react-native';
import { BundledImage } from './BundledImage';
import type { AppId } from '../state/apps';

// Original App Store artwork, bundled for offline use. See assets/app-icons/sources.json.
const icons: Record<AppId, number> = {
  instagram: require('../../assets/app-icons/instagram.jpg'),
  tiktok: require('../../assets/app-icons/tiktok.jpg'),
  youtube: require('../../assets/app-icons/youtube.jpg'),
  reddit: require('../../assets/app-icons/reddit.jpg'),
  x: require('../../assets/app-icons/x.jpg'),
  facebook: require('../../assets/app-icons/facebook.jpg'),
  snapchat: require('../../assets/app-icons/snapchat.jpg'),
  threads: require('../../assets/app-icons/threads.jpg'),
  discord: require('../../assets/app-icons/discord.jpg'),
  twitch: require('../../assets/app-icons/twitch.jpg'),
  netflix: require('../../assets/app-icons/netflix.jpg'),
  pinterest: require('../../assets/app-icons/pinterest.jpg'),
};

export function AppIcon({ id, size = 48 }: { id: AppId; size?: number }) {
  // Crop the App Store artwork's baked-in outer highlight inside our rounded mask.
  const inset = size * 0.04;
  return <View style={{ width: size, height: size, borderRadius: size * 0.2237, borderCurve: 'continuous', overflow: 'hidden' }}>
    <BundledImage source={icons[id]} accessible={false} contentFit="cover"
      style={{ width: size + inset * 2, height: size + inset * 2, left: -inset, top: -inset }} />
  </View>;
}
