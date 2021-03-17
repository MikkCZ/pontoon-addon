import React from 'react';
import ReactDOM from 'react-dom';

import { SnakeGameRoot } from './roots/SnakeGameRoot';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

ReactDOM.render(<SnakeGameRoot />, document.getElementById('snake-root'));
