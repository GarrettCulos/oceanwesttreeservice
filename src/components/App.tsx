import React, { useEffect, useState, useCallback, useReducer } from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  height: auto;
  width: auto;
  padding-left: 5rem;
  padding-right: 5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const App: React.FC = () => {
  return <AppContainer>This is the Cloud Backup Utility Add-on</AppContainer>;
};

export default App;
