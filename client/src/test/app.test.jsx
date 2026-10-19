import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Login } from '../pages/Login';
import { OfflineBanner } from '../components/OfflineBanner';
import { AuthProvider } from '../context/AuthContext';
import { Stepper } from '../ui/Stepper';
import { Badge } from '../ui/Badge';

describe('Frontend Component & UI Unit Tests', () => {
  it('renders Login screen with headline, wordmark, and demo credentials', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Assert wordmark and login title
    expect(screen.getAllByText(/Shiksha Setu/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    // Assert demo quick-fill buttons exist
    expect(screen.getByText(/Birsa Munda/i)).toBeInTheDocument();
    expect(screen.getByText(/Shanti Oraon/i)).toBeInTheDocument();
  });

  it('renders OfflineBanner when offline', () => {
    // Mock navigator.onLine as false
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    render(<OfflineBanner />);
    expect(
      screen.getByText(/You are currently offline. Viewing cached dashboard data/i)
    ).toBeInTheDocument();
  });

  it('renders Stepper with five distinct stages and correct square markers', () => {
    const { container } = render(<Stepper status="AUTO_VERIFYING" />);

    expect(screen.getAllByText('Submitted')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Verification')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Review')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sanction')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Payment (demo)')[0]).toBeInTheDocument();

    // Verify square markers have no rounded-full class
    const markers = container.querySelectorAll('.w-6.h-6');
    expect(markers.length).toBeGreaterThan(0);
    markers.forEach((m) => {
      expect(m.className).not.toContain('rounded-full');
    });
  });

  it('renders Badge status chip as text only without dots', () => {
    const { container } = render(<Badge status="FLAGGED" />);
    expect(screen.getByText('Needs your action')).toBeInTheDocument();

    // Ensure no circular status dots exist inside badge
    const dots = container.querySelectorAll('.rounded-full, .w-2.h-2');
    expect(dots.length).toBe(0);
  });
});
