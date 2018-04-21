// TXDialog.js
// SPC 2018-4-20

export const HIDE_TX_DIALOG = 'HIDE_TX_DIALOG';
export const SHOW_TX_DIALOG = 'SHOW_TX_DIALOG';

export function showTXDialog(txData) {
  return {
    type: SHOW_TX_DIALOG,
    payload: txData
  }
}

export function hideTXDialog() {
  return {
    type: HIDE_TX_DIALOG
  }
}
