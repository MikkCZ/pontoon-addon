import React from 'react';
import './TourDialogContent.css';

export class TourDialogContent extends React.Component {

  constructor(props) {
    super(props);
    let sectionId = props.sections[0].id;
    if (props.localeTeam === 'en-US' || props.localeTeam === 'en') {
      sectionId = 'addonSettings';
    }
    this.state = { active: sectionId };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.active !== this.state.active;
  }

  _activate(section) {
    this.setState({
      ...this.state,
      active: section.id,
    });
  }

  _isActive(section) {
    return this.state.active === section.id;
  }

  render() {
    return (
      <React.Fragment>
        <nav>
          <ul>
            {
              this.props.sections.map((section) =>
                <li key={`nav-${section.id}`}
                  className={section.id + (this._isActive(section) ? ' active' : '')}
                  onClick={() => this._activate(section)}
                >
                  {section.title}
                </li>
              )
            }
          </ul>
        </nav>
        <main>
          {
            this.props.sections
              .filter((section) => this._isActive(section))
              .map((section) =>
                <section key={`section-${section.id}`} className={section.id}>
                  { TourDialogContent._imageWithClassIfPresent(section, 'right') }
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                  { TourDialogContent._imageWithClassIfPresent(section, 'bottom') }
                </section>
              )
          }
        </main>
        <aside className="below">
          {
            this.props.sections
              .filter((section) => this._isActive(section))
              .filter((section) => section.buttonText !== undefined)
              .map((section) =>
                <button key={`button-${section.id}`} className={section.id} onClick={section.buttonOnClick}>
                  {section.buttonText}
                </button>
              )
          }
        </aside>
      </React.Fragment>
    );
  }

  static _imageWithClassIfPresent(section, imageClass) {
    return (
      <React.Fragment>
        { section.image && section.imageClass === imageClass &&
          <div className={`image ${imageClass}`}>
            <img src={section.image} alt='' />
          </div>
        }
      </React.Fragment>
    );
  }

}
