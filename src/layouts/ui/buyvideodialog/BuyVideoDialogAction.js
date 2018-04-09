// BuyVideoDialogActions.js
// SPC 2018-4-7

export const HIDE_BUY_VIDEO_DIALOG = 'HIDE_BUY_VIDEO_DIALOG';
export const SHOW_BUY_VIDEO_DIALOG = 'SHOW_BUY_VIDEO_DIALOG';

export function showBuyVideoDialog(videoData) {
  return {
    type: SHOW_BUY_VIDEO_DIALOG,
    payload: videoData
  }
}

export function hideBuyVideoDialog() {
  return {
    type: HIDE_BUY_VIDEO_DIALOG
  }
}
