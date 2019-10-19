module.exports = {
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        modules: false, // importを変換しない
        exclude: ['transform-typeof-symbol'] //Symbolを使わない時にこれを設定するとコード量節約できるみたい
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread'
  ],
  env: {
    test: {
      plugins: [ 'istanbul' ]
    }
  }
};
