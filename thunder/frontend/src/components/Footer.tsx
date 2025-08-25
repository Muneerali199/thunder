// React import not required with the new JSX transform

export function Footer() {
  const links = [
  { name: 'Twitter', href: 'https://twitter.com/muneerali199', title: 'Muneer Ali on Twitter' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/muneer-ali/', title: 'Muneer Ali on LinkedIn' },
  { name: 'GitHub', href: 'https://github.com/Muneerali199', title: 'Muneer Ali on GitHub' },
  { name: 'Email', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=alimuneerali245@gmail.com', title: 'Email Muneer Ali' }
  ];

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Twitter':
        return (
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 5.92c-.66.3-1.37.5-2.12.58.76-.46 1.34-1.19 1.61-2.06-.71.42-1.5.73-2.34.9A3.62 3.62 0 0016.5 4c-2 0-3.62 1.6-3.62 3.58 0 .28.03.56.09.83-3-.15-5.66-1.62-7.44-3.85-.31.54-.48 1.17-.48 1.84 0 1.27.64 2.39 1.62 3.05-.6-.02-1.17-.18-1.66-.46v.05c0 1.78 1.25 3.27 2.9 3.61-.3.08-.62.12-.95.12-.23 0-.46-.02-.68-.06.46 1.44 1.8 2.49 3.39 2.52A7.26 7.26 0 013 19.54a10.26 10.26 0 005.56 1.63c6.67 0 10.32-5.45 10.32-10.18v-.46A7.2 7.2 0 0022 5.92z" />
          </svg>
        );
      case 'LinkedIn':
        return (
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.12 20.45H4.56V9h2.56v11.45zM5.84 7.5c-.82 0-1.49-.67-1.49-1.5s.67-1.5 1.49-1.5 1.49.67 1.49 1.5-.67 1.5-1.49 1.5zM20.45 20.45h-2.56v-5.6c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.69h-2.56V9h2.46v1.56h.03c.34-.64 1.17-1.32 2.42-1.32 2.59 0 3.07 1.7 3.07 3.91v7.3z" />
          </svg>
        );
      case 'GitHub':
        return (
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.96 3.22 9.16 7.69 10.64.56.1.77-.24.77-.54 0-.27-.01-1-.02-1.95-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .72 2.62.51 3.26.39.1-.3.39-.51.71-.63-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.4.11-2.92 0 0 .95-.31 3.12 1.16.91-.25 1.88-.38 2.85-.38.97 0 1.94.13 2.85.38 2.17-1.48 3.12-1.16 3.12-1.16.61 1.52.23 2.64.11 2.92.73.79 1.16 1.8 1.16 3.03 0 4.31-2.64 5.28-5.15 5.56.4.35.76 1.05.76 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.65.78.54C19.03 20.9 22.25 16.7 22.25 11.75 22.25 5.48 17.27.5 12 .5z" />
          </svg>
        );
      case 'Email':
        return (
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
            <path d="M3 8.5v7A2.5 2.5 0 005.5 18h13a2.5 2.5 0 002.5-2.5v-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 6.5a2.5 2.5 0 00-2.5-2.5h-13A2.5 2.5 0 003 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 6.5l-9 6-9-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      // keep default for any future icons
      default:
        return null;
    }
  };

  return (
    <footer className="w-full bg-gray-900/80 border-t border-blue-500/30 text-blue-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-blue-300">
          <span className="font-semibold">Thunder</span>
          <span className="hidden sm:inline">— Crafted with ⚡</span>
        </div>

        <div className="flex items-center gap-4">
            {links.map((l) => {
              const isGmail = l.name === 'Email' && l.href?.startsWith?.('https://mail.google.com');
              const handleClick = (e: React.MouseEvent) => {
                if (isGmail) {
                  e.preventDefault();
                  try {
                    const win = window.open(l.href, '_blank', 'noopener,noreferrer');
                    if (!win) {
                      // popup blocked, fallback to mailto
                      window.location.href = 'mailto:alimuneerali245@gmail.com';
                    }
                  } catch (err) {
                    // fallback
                    window.location.href = 'mailto:alimuneerali245@gmail.com';
                  }
                }
              };

              return (
                <a
                  key={l.name}
                  href={l.href}
                  onClick={isGmail ? handleClick : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white hover:scale-110 transition-transform duration-150 p-2 rounded-md"
                  aria-label={l.title}
                  title={l.title}
                >
                  <span className="sr-only">{l.title}</span>
                  {renderIcon(l.name)}
                </a>
              );
            })}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
