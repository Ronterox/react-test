import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from 'react-service-worker';
import './css/custom.scss';

ReactDOM.render(<App/>, document.getElementById('root'));

registerServiceWorker();
