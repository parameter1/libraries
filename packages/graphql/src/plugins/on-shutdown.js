export default function OnShutdownPlugin({ fn } = {}) {
  return {
    async serverWillStart() {
      return {
        async serverWillStop() {
          if (typeof fn === 'function') await fn();
        },
      };
    },
  };
}
