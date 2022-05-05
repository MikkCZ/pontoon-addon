import { createGlobalStyle } from 'styled-components';

export const GlobalPontoonStyle = createGlobalStyle`
  /** Global **/
  body {
    margin: 0;
    background: #272a2f;
    color: #ebebeb;
  }

  a,
  button.link {
    color: #7bc876;
    text-decoration: none;
    cursor: pointer;
  }

  button.link {
    appearance: none;
    display: inline-block;
    background: transparent;
    border: none;
    margin: 0;
    padding: 0;
    font-size: inherit;
  }

  a:hover,
  button.link:hover {
    color: inherit;
  }

  .hidden {
    display: none !important;
  }

  h2 {
    font-size: 2em;
    font-weight: normal;
  }

  h3 {
    font-size: 1.5em;
    font-style: italic;
    font-weight: normal;
    color: #7bc876;
  }

  /** Page content **/

  header {
    max-width: 960px;
    margin: 0 auto;
    padding: 0.5em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2em;
  }

  header .logo {
    height: 32px;
  }

  header * {
    margin: 0;
    padding: 0;
  }

  header a { /* stylelint-disable-line no-descending-specificity */
    color: inherit;
  }

  header a:hover {
    color: #7bc876;
  }

  #heading {
    padding: 2em;
    background-color: #333941;
    text-align: center;
  }

  /** Forms, inputs and buttons **/

  select,
  label,
  button.pontoon-style {
    cursor: pointer;
  }

  input[type="text"],
  input[type="url"],
  select,
  button.pontoon-style {
    appearance: none;
    box-sizing: border-box;
    height: 2em;
    padding: 0 0.5em;
    background-color: #333941;
    border: 1px solid #4d5967;
    border-radius: 0.2em;
    color: inherit;
  }

  button.pontoon-style {
    padding: 0 1em;
    background-color: #7bc876;
    border-color: #7bc876;
    color: #272a2f;
  }

  button.pontoon-style:hover {
    color: #ebebeb;
  }

  label {
    display: flex;
    align-items: center;
  }

  input[type="radio"],
  input[type="checkbox"] {
    appearance: none;
    height: 1em;
    width: 1em;
    vertical-align: sub;
    margin-top: 0;
    border: 2px solid #4d5967;
    border-radius: 1em;
    transition: 0.15s all linear;
  }

  input[type="radio"]:hover,
  input[type="checkbox"]:hover {
    background-color: #4d5967;
  }

  input[type="radio"]:checked,
  input[type="checkbox"]:checked {
    background-color: #7bc876;
    border-color: #7bc876;
  }
`;
