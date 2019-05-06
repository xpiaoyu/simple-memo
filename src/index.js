import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {Route} from 'react-router';
import {HashRouter} from 'react-router-dom';
import {Row, Col} from 'antd';

import Index from './page/Index';
import Article from "./page/Article";

ReactDOM.render(
  <HashRouter>
    <Row>
      <Col xs={0} sm={2} md={2} lg={2} xl={2}/>
      <Col xs={24} sm={20} md={20} lg={20} xl={20}>
        <Route exact path="/" component={Index}/>
        <Route path="/post/:postId" component={Article}/>
      </Col>
    </Row>
  </HashRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
