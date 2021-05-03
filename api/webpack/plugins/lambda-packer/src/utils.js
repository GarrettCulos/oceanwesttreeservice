'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.uniqueArray = void 0;
exports.uniqueArray = (val) => {
  return val.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBYSxRQUFBLFdBQVcsR0FBRyxDQUFDLEdBQVUsRUFBRSxFQUFFO0lBQ3hDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCB1bmlxdWVBcnJheSA9ICh2YWw6IGFueVtdKSA9PiB7XG4gIHJldHVybiB2YWwuZmlsdGVyKCh2YWx1ZSwgaW5kZXgsIHNlbGYpID0+IHtcbiAgICByZXR1cm4gc2VsZi5pbmRleE9mKHZhbHVlKSA9PT0gaW5kZXg7XG4gIH0pO1xufTtcbiJdfQ==
