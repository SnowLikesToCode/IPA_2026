function createLogger() {
  return {
    info(message) {
      console.log(message);
    },
    error(message) {
      console.error(message);
    },
  };
}

module.exports = {
  createLogger,
};
