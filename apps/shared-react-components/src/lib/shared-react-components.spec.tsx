import { render } from '@testing-library/react';

import SharedReactComponents from './shared-react-components';

describe('SharedReactComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedReactComponents />);
    expect(baseElement).toBeTruthy();
  });
});
