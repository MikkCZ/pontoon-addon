import React from 'react';
import { mount } from 'enzyme';

import { PrivacyPolicyRoot } from '.';

describe('PrivacyPolicyRoot', () => {
  it('renders content', () => {
    const wrapper = mount(<PrivacyPolicyRoot />);

    expect(wrapper.find('h1').text()).toBe('Privacy Policy');
  });
});
