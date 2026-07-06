import { render, screen } from '@testing-library/angular';
import { ContactSectionComponent } from './contact-section.component';

const CONTACT = {
  phone: '+34 600 000 000',
  whatsapp: '+34600000000',
  email: 'info@boxingclub.es',
  address: 'Calle del Boxeo 1, Madrid',
  instagram: '@boxingclub',
};

describe('ContactSectionComponent', () => {
  it('renders the contact section', async () => {
    await render(ContactSectionComponent, {
      componentInputs: {
        contact: CONTACT,
        name: 'Boxing Club',
        copyright: '© 2025 Boxing Club',
      },
    });
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
  });

  it('renders the phone number', async () => {
    await render(ContactSectionComponent, {
      componentInputs: { contact: CONTACT, name: 'Boxing Club', copyright: '© 2025' },
    });
    expect(screen.getByText('+34 600 000 000')).toBeInTheDocument();
  });

  it('renders the email address', async () => {
    await render(ContactSectionComponent, {
      componentInputs: { contact: CONTACT, name: 'Boxing Club', copyright: '© 2025' },
    });
    expect(screen.getByText('info@boxingclub.es')).toBeInTheDocument();
  });

  it('renders the WhatsApp link', async () => {
    await render(ContactSectionComponent, {
      componentInputs: { contact: CONTACT, name: 'Boxing Club', copyright: '© 2025' },
    });
    expect(screen.getByTestId('contact-whatsapp')).toBeInTheDocument();
  });

  it('renders instagram when provided', async () => {
    await render(ContactSectionComponent, {
      componentInputs: { contact: CONTACT, name: 'Boxing Club', copyright: '© 2025' },
    });
    expect(screen.getByText('@boxingclub')).toBeInTheDocument();
  });

  it('renders copyright text', async () => {
    await render(ContactSectionComponent, {
      componentInputs: { contact: CONTACT, name: 'Boxing Club', copyright: '© 2025 Boxing Club' },
    });
    expect(screen.getByText('© 2025 Boxing Club')).toBeInTheDocument();
  });
});
