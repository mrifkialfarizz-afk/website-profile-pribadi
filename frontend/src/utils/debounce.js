// Debounce - menunda eksekusi fungsi sampai user berhenti melakukan aksi
// selama interval tertentu. Berguna untuk search input.
export function debounce(fn, delay = 400) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
