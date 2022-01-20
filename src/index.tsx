import React from 'react';
import ReactDOM from 'react-dom';
import './static/css/index.css';
import App from './ts/App';
import { reportWebVitals, Metric } from './ts/reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

function send_metric(arg: Metric) {
    window.debug(arg.name, arg.value);
}

reportWebVitals(send_metric);