import React from 'react';
import './TourPageTile.css';

/**
 * React component of one tile on the introduction tour page.
 */
export class TourPageTile extends React.Component {

  render() {
    return (
      <section className="TourPageTile">
        <div className="TourPageTile-row-1">
          <h3>{this.props.title}</h3>
        </div>
        <div className="TourPageTile-row-2">
          {
            this.props.image !== undefined &&
              <img src={this.props.image} alt='' />
          }
        </div>
        <div className="TourPageTile-row-3">
          <p>{this.props.text}</p>
        </div>
        <div className="TourPageTile-row-4">
          {
            this.props.button !== undefined &&
              <button className="pontoon-style" onClick={this.props.button.onClick}>
                {this.props.button.text}
              </button>
          }
        </div>
      </section>
    );
  }

}
