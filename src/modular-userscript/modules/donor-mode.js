export default {
  key: 'donorMode',
  type: 'function',
  title: 'Donor Mode',
  description: `Makes other modules take advatage of the donor status of the user.<br>Only enable this if you are a donor!`,
  enabledByDefault: false,
  run({ document }) {
    globalThis.isDonor = true;
  },
};
