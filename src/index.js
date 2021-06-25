import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from 'react-service-worker';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(<App/>, document.getElementById('root'));

registerServiceWorker().register();