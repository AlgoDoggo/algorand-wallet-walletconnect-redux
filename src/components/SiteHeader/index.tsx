import React, { useEffect } from 'react';

import { Layout, Button } from 'antd';
import { ellipseAddress, formatBigNumWithDecimals } from '../../helpers/utilities';
import { IAssetData } from '../../helpers/types';
import { useDispatch, useSelector } from 'react-redux';
import { reset, walletConnectInit, setConnected, onConnect, onSessionUpdate, killSession, selectConnector, selectAssets, selectAddress, getAccountAssets, selectChain } from '../../features/walletConnectSlice';
import WalletConnect from '@walletconnect/client';

const { Header } = Layout;

const SiteHeader: React.FC = () => {
  const connector = useSelector(selectConnector);
  const assets = useSelector(selectAssets);
  const address = useSelector(selectAddress);
  const chain = useSelector(selectChain);
  const nativeCurrency = assets && assets.find((asset: IAssetData) => asset && asset.id === 0) || {
    id: 0,
    amount: BigInt(0),
    creator: "",
    frozen: false,
    decimals: 6,
    name: "Algo",
    unitName: "Algo",
  };

  const dispatch = useDispatch();

  useEffect(() => {
    // Check if connection is already established
    if (connector) {
      subscribeToEvents(connector);

      if (!connector.connected) {
        connector.createSession();
      }
      const { accounts } = connector;
      dispatch(setConnected(true));
      dispatch(onSessionUpdate(accounts));   
    }
  }, [connector]);

  useEffect(() => {
    // Check if connection is already established
    console.log("in address useEffect")
    console.log("connector", connector)
    console.log("address", address)
    if (connector && address && address.length > 0) {
      dispatch(getAccountAssets({chain, address}));
    }
  }, [address]);

  const subscribeToEvents = (connector: WalletConnect) => {
    console.log("%cin subscribeToEvents", "background: yellow")
    if (!connector) {
      return;
    }
    // Subscribe to connection events
    connector.on("connect", (error, payload) => {
      console.log("%cOn connect", "background: yellow");
      if (error) {
        throw error;
      }
      dispatch(onConnect(payload));
    });
    
    connector.on("session_update", (error, payload) => {
      console.log("%cOn session_update", "background: yellow");
      if (error) {
        throw error;
      }
      const { connectedAccounts } = payload.params[0];
      dispatch(onSessionUpdate(connectedAccounts));
    });
    
    connector.on("disconnect", (error, payload) => {
      console.log("%cOn disconnect", "background: yellow");
      if (error) {
        throw error;
      }
      dispatch(reset());
    });
  }

  return (
    <Header className="site-layout-background site-header">
      <span>Connected to {chain}</span>
      {!address ?
        <Button onClick={() => dispatch(walletConnectInit())}>
          {"Connect to WalletConnect"}
        </Button>
      : <div className="header-address-info">
          <span>
            {formatBigNumWithDecimals(nativeCurrency.amount, nativeCurrency.decimals)} {nativeCurrency.unitName || "units"}
          </span>
          <span className="header-account">{ellipseAddress(address)}</span>
          <Button
            className="disconnect-button"
            onClick={() => dispatch(killSession())}
          >
            {"Disconnect"}
          </Button>
        </div>}
    </Header>
  );
}


export default SiteHeader;