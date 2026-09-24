# Family Controls entitlement setup

September 24, 2026. This is a walkthrough for registering Trundle's bundle IDs and
requesting the Family Controls (Distribution) entitlement. Apple renames portal
labels from time to time, so match by meaning if a label differs slightly.

Replace `com.yourname` with the prefix you choose. Bundle IDs are permanent. Put the
same app ID in `app.json` under `expo.ios.bundleIdentifier`.

| Bundle ID | Purpose |
|---|---|
| `com.yourname.trundle` | App |
| `com.yourname.trundle.DeviceActivityMonitor` | Applies and removes blocks on schedule |
| `com.yourname.trundle.ShieldConfiguration` | Look of the block screen |
| `com.yourname.trundle.ShieldAction` | Block-screen buttons (morning step check) |
| `group.com.yourname.trundle` | App Group: shared storage between the app and the extensions |

## 1. Register the App Group

1. Open https://developer.apple.com/account/resources/identifiers/list/applicationGroup
2. Click **+**, choose **App Groups**, and click **Continue**.
3. Description: `Trundle shared`. Identifier: `group.com.yourname.trundle`.
4. Click **Continue**, then **Register**.

## 2. Register the four App IDs

Repeat for each bundle ID in the table.

1. Open https://developer.apple.com/account/resources/identifiers/list
2. Click **+**, choose **App IDs**, click **Continue**, choose **App**, and click
   **Continue**.
3. Description: for example, `Trundle` or `Trundle Shield Action`.
4. Bundle ID: **Explicit**, then enter the ID.
5. Under Capabilities, check **Family Controls (Development)** and **App Groups**.
6. Click **Continue**, then **Register**.
7. Open the new ID, click **Edit** or **Configure** next to App Groups, select
   `group.com.yourname.trundle`, and save.

## 3. Request distribution (four times)

1. Sign in as the **Account Holder** and open
   https://developer.apple.com/contact/request/family-controls-distribution
2. Submit one request for each of the four bundle IDs, using the description below.
3. Wait. Approval takes a few business days to a few weeks. Development builds work
   in the meantime.

**Use-case text (edit freely):**

> Trundle is a self-control app for adults who lose sleep to late-night phone use.
> The user chooses which of their own apps to restrict with FamilyActivityPicker and
> sets a bedtime and a morning start time. At bedtime, a DeviceActivityMonitor
> extension applies ManagedSettings shields to the selected apps. The apps stay
> shielded in the morning until the user walks 200 steps, measured on-device with
> CoreMotion, and then the shields are removed until the next bedtime. The
> ShieldConfiguration extension customizes the shield text, and the ShieldAction
> extension lets the user check their morning step progress from the shield. The
> user can edit their schedule, their app list, and an emergency unlock at any time.
> Authorization is requested for the individual user (.individual); the app does
> not control other people's devices. No usage data leaves the device.

For the extension requests, keep the same text and add one line naming the
extension's role.

## 4. After approval

1. Open each App ID. Under **Additional Capabilities**, enable **Family Controls
   (Distribution)**.
2. Regenerate provisioning profiles. EAS Build can do this.
3. Add the Family Controls and App Group entitlements to the app and to each
   extension target in the Expo config or config plugin.
