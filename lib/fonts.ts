// lib/fonts.ts

// Load a single Google Font
export function loadGoogleFont(fontFamily: string) {
  const googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
  
  if (!googleFonts.includes(fontFamily)) {
    return;
  }

  // Check if already loaded
  const linkId = `google-font-${fontFamily.replace(/\s/g, '-')}`;
  if (document.getElementById(linkId)) {
    return;
  }

  // Create link element
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, '+')}:wght@300;400;700&display=swap`;
  document.head.appendChild(link);
}

// Load multiple Google Fonts at once
export function loadGoogleFonts(fontFamilies: string[]) {
  fontFamilies.forEach(loadGoogleFont);
}
