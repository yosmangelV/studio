import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterOutlet } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { routes } from './app.routes';

describe('routes without a message code', () => {
  for (const url of ['/', '/some/unknown/path']) {
    it(`shows the private landing on ${url} without calling the API`, async () => {
      const { navigate } = await render('<router-outlet />', {
        imports: [RouterOutlet],
        routes,
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });

      await navigate(url);

      expect((await screen.findByTestId('announcement-private-title')).textContent).toContain(
        'Este anuncio es privado',
      );
      TestBed.inject(HttpTestingController).verify();
    });
  }
});

describe('route with a message code', () => {
  it('loads that message instead of the private landing', async () => {
    const { navigate } = await render('<router-outlet />', {
      imports: [RouterOutlet],
      routes,
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    await navigate('/announcement/SOME-CODE');

    TestBed.inject(HttpTestingController).expectOne((req) =>
      req.url.endsWith('/messages/SOME-CODE'),
    );
    expect(screen.queryByTestId('announcement-private-title')).toBeNull();
  });
});
