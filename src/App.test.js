import { render, screen } from '@testing-library/react';
import App from './App';

test('renders poker heading', () => {
  render(<App />);
  const heading = screen.getByText(/PokeReact/i);
  expect(heading).toBeInTheDocument();
});
