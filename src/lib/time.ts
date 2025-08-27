export const ts = (date: Date | number, style: 'f' | 'F' | 'R' = 'f') => {
  const d = typeof date === 'number' ? date : date.getTime();
  return `<t:${Math.floor(d / 1000)}:${style}>`;
};
