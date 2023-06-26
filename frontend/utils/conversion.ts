export const emStringToPixels = (emString: string) => {
  /*
    * params:
    *  emString: a string in the form of "XXem"
    * return:
    *  number of pixels in that em string, as a number
    */
  const basePixels = 16;
  const ems = emString.split('em')[0];
  return Number(ems) * basePixels;
};