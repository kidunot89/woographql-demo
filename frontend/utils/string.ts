export function ucwords(str: string) {
  return str
    .toLowerCase()
    .replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
      function(s){
        return s.toUpperCase();
    });
};

export function ucfirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}