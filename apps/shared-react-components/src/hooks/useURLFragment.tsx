import { useEffect, useState } from 'react';

export const useURLFragment = (): [string, (newFragment: string) => void] => {
  const [fragment, setFragment] = useState<string>('');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentHash = document.location.hash.replace('#', '');
      setFragment(currentHash);
      const handleHashChange = (): void => {
        const newHash = document.location.hash.replace('#', '');
        setFragment(newHash);
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
    return () => {
      // TODO
    };
  }, []);

  const updateFragment = (newFragment: string): void => {
    if (typeof document !== 'undefined') {
      if (fragment !== newFragment) {
        window.history.pushState({}, '', `#${newFragment}`);
        setFragment(newFragment);
      }
    }
  };

  return [fragment, updateFragment];
};
