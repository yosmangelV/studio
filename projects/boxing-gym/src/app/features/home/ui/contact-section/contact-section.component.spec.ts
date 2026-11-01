import { render, screen } from '@testing-library/angular';
import { ContactSectionComponent } from './contact-section.component';
import type { ContactView } from '../../../../core/gym-profile/gym-profile.model';

const CONTACT: ContactView = {
  phone: { display: '+34 600 000 000', href: 'tel:+34600000000' },
  whatsappHref: 'https://wa.me/34600000000',
  email: { display: 'info@boxingclub.es', href: 'mailto:info@boxingclub.es' },
  address: { display: 'Calle del Boxeo 1, Madrid', href: 'https://www.google.com/maps/search/?api=1&query=x' },
  instagram: { display: '@boxingclub', href: 'https://instagram.com/boxingclub' },
};

const EMPTY: ContactView = { phone: null, whatsappHref: null, email: null, address: null, instagram: null };

const renderContact = (contact: ContactView) =>
  render(ContactSectionComponent, {
    componentInputs: { contact, name: 'Boxing Club', copyright: '© 2025 Boxing Club' },
  });

describe('ContactSectionComponent', () => {
  it('renders every contact link with its href', async () => {
    await renderContact(CONTACT);
    expect(screen.getByTestId('contact-phone')).toHaveAttribute('href', 'tel:+34600000000');
    expect(screen.getByTestId('contact-email')).toHaveTextContent('info@boxingclub.es');
    expect(screen.getByTestId('contact-address')).toHaveAttribute('href', CONTACT.address!.href);
    expect(screen.getByTestId('contact-instagram')).toHaveTextContent('@boxingclub');
    expect(screen.getByTestId('contact-whatsapp')).toHaveAttribute('href', 'https://wa.me/34600000000');
  });

  it('hides every field that has no data', async () => {
    await renderContact(EMPTY);
    for (const id of ['contact-phone', 'contact-email', 'contact-address', 'contact-instagram', 'contact-whatsapp']) {
      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    }
  });

  it('renders copyright text', async () => {
    await renderContact(EMPTY);
    expect(screen.getByText('© 2025 Boxing Club')).toBeInTheDocument();
  });
});
