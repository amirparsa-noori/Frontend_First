import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloProvider } from '@apollo/client/react';
import App from './App';

const httpLink = createHttpLink({
  uri: 'https://drshamimnasab.ir/graphql',
  fetch: async (uri, options) => {
    const response = await fetch(uri, options);
    const sessionHeader = response.headers.get('woocommerce-session');
    if (sessionHeader) {
      localStorage.setItem('woo_session', sessionHeader);
    }
    return response;
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('pharmacy_token');
  const wooSession = localStorage.getItem('woo_session');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'woocommerce-session': wooSession ? `Session ${wooSession.replace('Session ', '')}` : ''
    }
  };
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (
        err.message.includes('Expired token') ||
        err.message.includes('invalid') ||
        err.message.includes('not logged in')
      ) {
        localStorage.removeItem('pharmacy_token');
        localStorage.removeItem('woo_session');
        // Clear cached user so App does not restore session from localStorage after reload
        localStorage.removeItem('pharmacy_user');
        window.location.href = '/';
      }
    }
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache()
});

// #region agent log
fetch('http://127.0.0.1:7242/ingest/d0a4301c-b84f-4c55-bddc-e10b88093a8c', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: `log_${Date.now()}_index_entry`,
    timestamp: Date.now(),
    location: 'index.tsx:before-root',
    message: 'Index entry executed before ReactDOM.createRoot',
    data: {},
    runId: 'pre-fix',
    hypothesisId: 'H1'
  })
}).catch(() => {});
// #endregion

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);