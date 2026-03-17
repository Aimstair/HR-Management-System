import React, { useMemo } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../../components/ui/button';

type ThemeMode = 'light' | 'dark' | 'system';

const getNextTheme = (currentTheme: string | undefined): ThemeMode => {
  if (currentTheme === 'light') {
    return 'dark';
  }

  if (currentTheme === 'dark') {
    return 'system';
  }

  return 'light';
};

const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const nextTheme = useMemo(() => getNextTheme(theme), [theme]);
  const currentResolvedTheme = mounted ? resolvedTheme : 'light';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full cursor-pointer"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch theme. Current: ${theme ?? 'system'}. Next: ${nextTheme}.`}
      title={`Theme: ${theme ?? 'system'} (next: ${nextTheme})`}
    >
      {currentResolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
