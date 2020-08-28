import SubX from 'subx';
import {TokenInfo} from '@rc-ex/core/lib/definitions';
import RingCentral from '@rc-ex/core';
import AuthorizeUriExtension from '@rc-ex/authorize-uri';
import localforage from 'localforage';

const redirectUri = window.location.origin + window.location.pathname;
const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
});
const urlSearchParams = new URLSearchParams(
  new URL(window.location.href).search
);
const code = urlSearchParams.get('code');
export let authorizeUri = '';
if (code === null) {
  const authorizeUriExtension = new AuthorizeUriExtension();
  rc.installExtension(authorizeUriExtension);
  authorizeUri = authorizeUriExtension.buildUri({
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
  });
  const codeVerifier = authorizeUriExtension.codeVerifier;
  localforage.setItem('code_verifier', codeVerifier);
}

export type StoreType = {
  ready: boolean;
  loggedIn?: boolean;
  init: Function;
  load: Function;
  logout: Function;
};

const refreshToken = async () => {
  try {
    await rc.refresh();
  } catch (e) {
    // refresh failed
    await localforage.clear();
    window.location.reload(false);
    return;
  }
  await localforage.setItem('token', rc.token);
};

const store = SubX.proxy<StoreType>({
  ready: false,
  async init() {
    if (code !== null) {
      await rc.authorize({
        code,
        redirect_uri: redirectUri,
        code_verifier: (await localforage.getItem('code_verifier')) as string,
      });
      await localforage.setItem('token', rc.token);
      window.location.href = redirectUri; // get rid of query string
    }
  },
  async load() {
    const token = await localforage.getItem<TokenInfo>('token');
    if (token !== null) {
      rc.token = token;
      await refreshToken();
      setInterval(() => refreshToken(), 1800000); // every 30 minutes
      this.loggedIn = true;
    }
  },
  async logout() {
    await localforage.clear();
    window.location.reload(false);
  },
});

export default store;
