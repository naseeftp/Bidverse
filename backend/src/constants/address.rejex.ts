export const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
export const createExactRegex = (text: string): RegExp => {
  return new RegExp(`^${escapeRegex(text)}$`, "i");
}