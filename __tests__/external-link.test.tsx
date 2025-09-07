import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExternalLink } from '../components/ExternalLink';
import { Linking } from 'react-native';

describe('ExternalLink', () => {
  it('opens the provided URL on press', async () => {
    const href = 'https://example.com/docs';
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined as any);
    const { getByText } = render(
      <ExternalLink href={href}>Open Docs</ExternalLink>
    );
    fireEvent.press(getByText('Open Docs'));
    expect(spy).toHaveBeenCalledWith(href);
  });
});
