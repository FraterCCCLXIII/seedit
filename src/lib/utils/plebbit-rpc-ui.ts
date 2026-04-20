/**
 * `usePlebbitRpcSettings().state` is `connecting` until the WebSocket handshake completes.
 * The Electron app bundles a local RPC server; users should not be blocked (or bounced off
 * `/communities/create`) while the client is still connecting.
 */
export function canAccessPlebbitLocalCreateFlow(rpcState: string | undefined, isElectron: boolean): boolean {
  if (rpcState === 'connected') {
    return true;
  }
  if (isElectron && rpcState && rpcState !== 'failed') {
    return true;
  }
  return false;
}
