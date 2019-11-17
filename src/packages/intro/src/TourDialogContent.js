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

  activate(section) {
    this.setState({ active: section.id });
  }

  isActive(section) {
    return this.state.active === section.id;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.active !== this.state.active;
  }

  render() {
    return (
      <React.Fragment>
        <nav>
          <ul>
            {
              this.props.sections.map((section) =>
                <li key={`nav-${section.id}`}
                  className={section.id + (this.isActive(section) ? ' active' : '')}
                  onClick={() => this.activate(section)}
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
              .filter((section) => this.isActive(section))
              .map((section) =>
                <section key={`section-${section.id}`} className={section.id}>
                  { section.image && section.imageClass === 'right' &&
                    <div className={`image ${section.imageClass}`}>
                      <img src={section.image} alt='' />
                    </div>
                  }
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                  { section.image && section.imageClass === 'bottom' &&
                    <div className={`image ${section.imageClass}`}>
                      <img src={section.image} alt='' />
                    </div>
                  }
                </section>
              )
          }
        </main>
        <aside className="below">
          {
            this.props.sections
              .filter((section) => this.isActive(section))
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

}
