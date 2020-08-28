import {Component} from 'react-subx';
import {StoreType, authorizeUri} from './store';
import React from 'react';
import {Spin} from 'antd';

type PropsStore = {
  store: StoreType;
};

class App extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return store.ready ? (
      store.loggedIn ? (
        <Main store={store} />
      ) : (
        <Login />
      )
    ) : (
      <Spin size="large" />
    );
  }
}

class Login extends Component {
  render() {
    return (
      <a href={authorizeUri}>
        Click to start {'"'}Authorization Code Grant + Proof Key for Code
        Exchange{'"'}
      </a>
    );
  }
}

class Main extends Component<PropsStore> {
  render() {
    const store = this.props.store;
    return 'Logged in';
  }
}

export default App;
