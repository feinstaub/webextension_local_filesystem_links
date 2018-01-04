export const prepareWhitelist = (whitelist) => whitelist && whitelist.
  split(' '). // spacing char --> later add , and ;
  map((url) => {
      // remap * to all urls
      return url === '*' ?
        '<all_urls>' : url;
  });
