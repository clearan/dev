module.exports = file => {
  // console.log(file)
  return require('@/views/' + file + '.vue').default
} // vue-loader at least v13.0.0+
