import React from 'react';
import { CloseButton } from './CloseButton';
import { TourPageTile } from './TourPageTile';
import './TourPage.css';

/**
 * React component of the tour page.
 */
export class TourPage extends React.Component {
  static defaultProps = {
    title: "",
    tiles: [],
  };

  render() {
    return (
      <div className="TourPage">
        <CloseButton title="Close the tour" />
        <h2>{this.props.title}</h2>
        <div className="TourPageTiles">
          {
            this.props.tiles.map((tile, index) =>
              <TourPageTile
                key={`tile-${index}`}
                {...tile}
              />
            )
          }
        </div>
        <div className="privacy-policy"><a href="https://github.com/MikkCZ/pontoon-addon/wiki/Privacy-Policy">Privacy policy for Pontoon Add-on</a></div>
      </div>
    );
  }

}
