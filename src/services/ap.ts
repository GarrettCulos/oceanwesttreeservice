let AP: any;
declare global {
  interface Window {
    reactAPTunnel: any;
  }
}
class APWrapper {
  public AP: any;
  constructor() {
    this.AP = window.reactAPTunnel;
  }
}
export default new APWrapper().AP;
