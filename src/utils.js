export default {
  shortID
}

export function shortID () {
  // returns a fairly uniqe 4 digit UUID for default state names
  return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
}
