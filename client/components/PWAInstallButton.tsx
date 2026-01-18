import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { Download } from "lucide-react";

export function PWAInstallButton() {
	const { isInstallable, isInstalled, installPWA } = usePWA();

	if (isInstalled) {
		return null; // Don't show button if already installed
	}

	if (!isInstallable) {
		return null; // Don't show button if installation is not available
	}

	return (
		<Button onClick={installPWA} variant="outline" size="sm" className="gap-2">
			<Download className="h-4 w-4" />
			Install App
		</Button>
	);
}
