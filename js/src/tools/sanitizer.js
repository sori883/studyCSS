/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): tools/sanitizer.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

const uriAttrs = [
  'background',
  'cite',
  'href',
  'itemtype',
  'longdesc',
  'poster',
  'src',
  'xlink:href'
]


const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i

export const DefaultWhitelist = {
  // htmlタグにつけることを許可された属性達
  '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
  a: ['target', 'href', 'title', 'rel'],
  area: [],
  b: [],
  br: [],
  col: [],
  code: [],
  div: [],
  em: [],
  hr: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  i: [],
  img: ['src', 'alt', 'title', 'width', 'height'],
  li: [],
  ol: [],
  p: [],
  pre: [],
  s: [],
  small: [],
  span: [],
  sub: [],
  sup: [],
  strong: [],
  u: [],
  ul: []
}

/**
 * 安全なURLのパターン
 *
 * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
 */
const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi

/**
 * 安全なdataのURLパターン。画像、ビデオ、音声のみが一致する
 *
 * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
 */
const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i

function allowedAttribute(attr, allowedAttributeList) {
  // attrの属性とかを小文字で取得する
  const attrName = attr.nodeName.toLowerCase()

  // allowedAttributeListにattrNameがあるか探す。なかったら-1が帰ってくる
  if (allowedAttributeList.indexOf(attrName) !== -1) {
    // uriAttrsにattrNameがあるか探す
    if (uriAttrs.indexOf(attrName) !== -1) {
      // 値が真偽か判定して真偽を返す
      // attrの中で安全なURLと安全なdataURLと一致するものがあったらtrue
      // なかったらfalse
      return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN))
    }

    // 属性がなかったらtrueを返す
    return true
  }

  // allowedAttributeListから正規表現として使える文字を選別
  const regExp = allowedAttributeList.filter((attrRegex) => attrRegex instanceof RegExp)

  // attrNameの中にregExpとマッチするものがあるか確認
  for (let i = 0, l = regExp.length; i < l; i++) {
    if (attrName.match(regExp[i])) {
      return true
    }
  }

  return false
}

export function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
  // unsafeHtmlがなかったらそのまま返す
  if (unsafeHtml.length === 0) {
    return unsafeHtml
  }

  // sanitizeFnが存在していて、functionならsanitizeFnを実行して返す
  if (sanitizeFn && typeof sanitizeFn === 'function') {
    return sanitizeFn(unsafeHtml)
  }

  const domParser = new window.DOMParser()
  // DOMツリー作成
  const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html')
  // whitelistのキーをwhitelistKeysに入れる
  const whitelistKeys = Object.keys(whiteList)
  // body配下の要素を1個ずつ取得する
  const elements = [].slice.call(createdDocument.body.querySelectorAll('*'))

  // エレメントの数だけ回すよ
  for (let i = 0, len = elements.length; i < len; i++) {
    // elにelementsのi番目を入れる
    const el = elements[i]
    // nodeNameを小文字で取得する
    const elName = el.nodeName.toLowerCase()

    // el.nodeNameがwhitelistKeysにあるか判定。
    if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
      // elを削除
      el.parentNode.removeChild(el)

      // forの条件式に戻る
      continue
    }

    // elの属性を取得
    const attributeList = [].slice.call(el.attributes)
    // 配列を連結するんだろうけど、||が3つあるのがよくわからん
    const whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || [])

    attributeList.forEach((attr) => {
      if (!allowedAttribute(attr, whitelistedAttributes)) {
        // Elementsから属性を削除
        el.removeAttribute(attr.nodeName)
      }
    })
  }

  return createdDocument.body.innerHTML
}
