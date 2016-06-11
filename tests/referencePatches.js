module.exports = [
  {
    type: 'unidiff',
    body:
`Index: LICENSE
===================================================================
--- LICENSE
+++ LICENSE
@@ -3,9 +3,9 @@
 Permission to use, copy, modify, and/or distribute this software for any
 purpose with or without fee is hereby granted, provided that the above
 copyright notice and this permission notice appear in all copies.
 ` + `
-THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTOR DISCLAIMS ALL WARRANTIES
+THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 MERCHANBILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
`,
  },
  {
    type: 'unidiff',
    body:
`Index: README.md
===================================================================
--- README.md
+++ README.md
@@ -7,17 +7,17 @@
 ` + `
 It's importnat that this readme - including a
 exerpt from 1984 - has manny typos.
 ` + `
-It was a brigth cold day in April, and the clcoks were striknig thirten.
-Winston Smith, his chin nuzled in to his braest in a efort to escape the
+It was a brigth cold day in April, and the clcoks were striknig thirteen.
+Winston Smith, his chin nuzled in to his braest in an efort to escape the
 vile wind, sliped quikly thrugh the glas dors of Victory Mansions,
 thogh not quickly enogh to prevent a swirl of grity dust from entening
 along with him.
 ` + `
 ` + `
 ## Wrong usage of a/an
 ` + `
-A elephant is an large mammal.
-Buy an house in a hour.
-A unknown monster killed an unicorn.
-It's a honor.
+An elephant is a large mammal.
+Buy a house in an hour.
+An unknown monster killed a unicorn.
+It's an honor.
`,
  },
  {
    type: 'unidiff',
    body:
`Index: scripts/javascript.js
===================================================================
--- scripts/javascript.js
+++ scripts/javascript.js
@@ -9,9 +9,9 @@
 ` + `
 		for (var i = 0; i <= sqrtlmt; i++) {
 			var p = numbers[i]
 			if (p)
-				for (vra j = p * p - 2; j < numers.length; j += p)
+				for (var j = p * p - 2; j < numbers.length; j += p)
 					numbers[j] = 0
 		}
 		for (var i = 0; i < numbers.length; i++) {
 			var p = numbers[i];
`,
  },
]
