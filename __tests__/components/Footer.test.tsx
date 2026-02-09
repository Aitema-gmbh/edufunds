import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Footer } from '@/components/Footer';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Footer Komponente', () => {
  it('sollte das Logo rendern', () => {
    render(<Footer />);
    expect(screen.getByText('EduFunds')).toBeInTheDocument();
    expect(screen.getByText('Schulförderung')).toBeInTheDocument();
  });

  it('sollte die Statistiken rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText('40+')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('24h')).toBeInTheDocument();
    
    expect(screen.getByText('Förderprogramme')).toBeInTheDocument();
    expect(screen.getByText('Schulen')).toBeInTheDocument();
    expect(screen.getByText('Erfolgsquote')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('sollte die Produkt-Links rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText('Produkt')).toBeInTheDocument();
    expect(screen.getByText('Förderprogramme')).toBeInTheDocument();
    expect(screen.getByText('KI-Antragsassistent')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Preise')).toBeInTheDocument();
  });

  it('sollte die Ressourcen-Links rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText('Ressourcen')).toBeInTheDocument();
    expect(screen.getByText('So funktioniert\'s')).toBeInTheDocument();
    expect(screen.getByText('Hilfe-Center')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Erfolgsgeschichten')).toBeInTheDocument();
  });

  it('sollte die Unternehmen-Links rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText('Unternehmen')).toBeInTheDocument();
    expect(screen.getByText('Über uns')).toBeInTheDocument();
    expect(screen.getByText('Karriere')).toBeInTheDocument();
    expect(screen.getByText('Presse')).toBeInTheDocument();
    expect(screen.getByText('Kontakt')).toBeInTheDocument();
  });

  it('sollte die Rechts-Links rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText('Rechtliches')).toBeInTheDocument();
    expect(screen.getByText('Impressum')).toBeInTheDocument();
    expect(screen.getByText('Datenschutz')).toBeInTheDocument();
    expect(screen.getByText('AGB')).toBeInTheDocument();
  });

  it('sollte die Beschreibung rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Die intelligente Plattform für Schulförderung/)).toBeInTheDocument();
  });

  it('sollte die Kontakt-E-Mail rendern', () => {
    render(<Footer />);
    
    const emailLink = screen.getByText('info@edu-funds.org');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:info@edu-funds.org');
  });

  it('sollte den Standort rendern', () => {
    render(<Footer />);
    expect(screen.getByText('Berlin, Deutschland')).toBeInTheDocument();
  });

  it('sollte Social-Media-Links rendern', () => {
    render(<Footer />);
    
    // Social Media Icons sind durch ihre ersten Buchstaben dargestellt
    expect(screen.getByLabelText('twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('linkedin')).toBeInTheDocument();
    expect(screen.getByLabelText('github')).toBeInTheDocument();
  });

  it('sollte den Newsletter-Bereich rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText('Newsletter abonnieren')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ihre@email.de')).toBeInTheDocument();
    expect(screen.getByText('Abonnieren')).toBeInTheDocument();
  });

  it('sollte Newsletter-Abonnement ermöglichen', async () => {
    render(<Footer />);
    
    const emailInput = screen.getByPlaceholderText('ihre@email.de');
    const submitButton = screen.getByText('Abonnieren');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Abonniert!')).toBeInTheDocument();
    });
  });

  it('sollte E-Mail-Validierung haben', () => {
    render(<Footer />);
    
    const emailInput = screen.getByPlaceholderText('ihre@email.de');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('sollte den Footer-Text mit Jahr rendern', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('sollte den AITEMA GmbH Link haben', () => {
    render(<Footer />);
    
    const aitemaLink = screen.getByText('AITEMA GmbH');
    expect(aitemaLink).toHaveAttribute('href', 'https://aitema.de');
    expect(aitemaLink).toHaveAttribute('target', '_blank');
  });

  it('sollte "Made with love in Berlin" rendern', () => {
    render(<Footer />);
    
    expect(screen.getByText('Made with')).toBeInTheDocument();
    expect(screen.getByText('in Berlin')).toBeInTheDocument();
  });

  it('sollte den Footer als semantisches Element rendern', () => {
    render(<Footer />);
    
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('sollte alle Links korrekte href-Attribute haben', () => {
    render(<Footer />);
    
    // Produkt-Links
    expect(screen.getByText('Förderprogramme').closest('a')).toHaveAttribute('href', '/foerderprogramme');
    expect(screen.getByText('KI-Antragsassistent').closest('a')).toHaveAttribute('href', '/ki-antragsassistent');
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Preise').closest('a')).toHaveAttribute('href', '/preise');
    
    // Rechts-Links
    expect(screen.getByText('Impressum').closest('a')).toHaveAttribute('href', '/impressum');
    expect(screen.getByText('Datenschutz').closest('a')).toHaveAttribute('href', '/datenschutz');
    expect(screen.getByText('AGB').closest('href', '/agb');
  });

  it('sollte den Hinweis zum Newsletter zeigen', () => {
    render(<Footer />);
    
    expect(screen.getByText('Kein Spam, jederzeit abmeldbar. Wir respektieren Ihre Privatsphäre.')).toBeInTheDocument();
  });
});
