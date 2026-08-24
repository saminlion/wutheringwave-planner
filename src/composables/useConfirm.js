import { ref, readonly } from 'vue';

/**
 * ネイティブ confirm() の置き換え。
 *
 * ネイティブ confirm() はクリックハンドラ内でメインスレッドを完全に凍結するため、
 * ダイアログが開いている時間（＝ユーザーの反応時間）がそのまま INP に加算される。
 * Promise ベースのカスタムモーダルにすることで、ハンドラは即座に return し
 * ブラウザは次のフレームを描画できる。
 *
 * 状態はモジュールスコープで共有され、ConfirmDialog は App.vue に1つだけマウントする。
 */

const visible = ref(false);
const options = ref({
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  danger: false,
});

let resolver = null;

const settle = (result) => {
  const resolve = resolver;
  resolver = null;
  visible.value = false;
  if (resolve) resolve(result);
};

export function useConfirm() {
  /**
   * @param {string} message 本文（改行はそのまま表示される）
   * @param {{ title?: string, confirmText?: string, cancelText?: string, danger?: boolean }} [opts]
   * @returns {Promise<boolean>}
   */
  const confirmDialog = (message, opts = {}) => {
    // 前のダイアログが残っていればキャンセル扱いで閉じる
    if (resolver) settle(false);

    options.value = {
      title: opts.title || '',
      message: message == null ? '' : String(message),
      confirmText: opts.confirmText || 'OK',
      cancelText: opts.cancelText || 'Cancel',
      danger: opts.danger === true,
    };
    visible.value = true;

    return new Promise((resolve) => {
      resolver = resolve;
    });
  };

  return {
    confirmDialog,
    visible: readonly(visible),
    options: readonly(options),
    accept: () => settle(true),
    cancel: () => settle(false),
  };
}

export default useConfirm;
