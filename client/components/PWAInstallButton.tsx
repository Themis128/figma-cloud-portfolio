// Install button component
import { usePWA } from "../hooks/usePWA";
export default function PWAInstallButton() {
  const { installed, promptInstall } = usePWA();
  return installed ? null : (
    <button onClick={promptInstall}>Install App</button>
  );
}
