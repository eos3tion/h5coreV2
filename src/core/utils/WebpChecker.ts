try {
    var supportWebp = (window as any).supportWebp == false ? false : document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
} catch (err) { }

/**
 * 如果支持`webp`，则返回`webp`后缀，否则返回空字符串
 */
export const webpExt = supportWebp ? Ext.WEBP : "";

