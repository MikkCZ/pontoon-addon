import React from 'react';
import { shallow } from 'enzyme';
import { TourDialog } from './TourDialog';
import { CloseButton } from './CloseButton';
import { TourDialogContent } from './TourDialogContent';

describe('<TourDialog>', () => {

  it('renders title', () => {
    const wrapper = shallow(
      <TourDialog title='TITLE' />
    );

    expect(wrapper.find('h1').text()).toBe('TITLE');
  });

  it('incudes close button', () => {
    const wrapper = shallow(
      <TourDialog title='TITLE' />
    );

    expect(wrapper.find(CloseButton)).toHaveLength(1);
  });

  it('incudes content', () => {
    const wrapper = shallow(
      <TourDialog sections={[]} />
    );

    expect(wrapper.find(TourDialogContent)).toHaveLength(1);
    expect(wrapper.find(TourDialogContent).props().sections).toStrictEqual([]);
  });

});
