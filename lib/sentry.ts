// No-op initializer for now to avoid bundling a missing dependency in Expo Go/dev.
// When ready to enable Sentry, we will switch to the official integration and
// add the plugin in app.json (and install the package).
export async function initSentry() {
  return;
}
