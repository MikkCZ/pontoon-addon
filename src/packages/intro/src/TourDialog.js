import React from 'react';
import { CloseButton } from './CloseButton';
import { TourDialogContent } from './TourDialogContent';
import './TourDialog.css';

export class TourDialog extends React.Component {

  render() {
    return (
      <div id="tour-dialog">
        <CloseButton style={{ position:'absolute', top:'2em', right:'2em' }} />
        <header className="above">
          <h1>{this.props.title}</h1>
        </header>
        <TourDialogContent
          localeTeam={this.props.localeTeam}
          sections={this.props.sections}
        />
      </div>
    );
  }

}
