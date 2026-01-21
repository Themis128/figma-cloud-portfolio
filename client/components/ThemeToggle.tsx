import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme, actualTheme } = useTheme()

  console.log('ThemeToggle render:', { theme, actualTheme })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          data-testid="theme-toggle"
          aria-label="Toggle theme"
          onClick={() => console.log('Theme toggle button clicked')}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform transition-opacity duration-200 ease-in-out dark:-rotate-90 dark:scale-0 lucide lucide-sun" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform transition-opacity duration-200 ease-in-out dark:rotate-0 dark:scale-100 lucide lucide-moon" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[9999] bg-popover border border-border shadow-lg"
        onPointerDownOutside={() => console.log('Dropdown closed - outside click')}
        onEscapeKeyDown={() => console.log('Dropdown closed - escape key')}
      >
        <DropdownMenuItem
          onClick={() => {
            console.log('Setting theme to light')
            setTheme('light')
          }}
        >
          <Sun className="mr-2 h-4 w-4 lucide lucide-sun" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            console.log('Setting theme to dark')
            setTheme('dark')
          }}
        >
          <Moon className="mr-2 h-4 w-4 lucide lucide-moon" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            console.log('Setting theme to system')
            setTheme('system')
          }}
        >
          <Monitor className="mr-2 h-4 w-4 lucide lucide-monitor" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}