module.exports = function(error) {
  assert.isAbove(error.message.search('VM Exception while processing transaction: revert'),
                 -1,
                 'VM Exception while processing transaction: revert must be returned');
}
